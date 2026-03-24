import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  createHmac,
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { PrismaService } from "../database/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";

const scrypt = promisify(nodeScrypt);
const SCRYPT_KEY_LENGTH = 64;
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
const EMAIL_LOGIN_FAILURE_MESSAGE = "No user registered with this email.";
const PASSWORD_LOGIN_FAILURE_MESSAGE = "Incorrect password.";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async register(createUserDto: CreateUserDto) {
    const role = await this.prisma.role.findUnique({
      where: { id: createUserDto.role_id },
    });

    if (!role) {
      throw new BadRequestException("Invalid role_id.");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException("A user with this email already exists.");
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          firstName: createUserDto.first_name,
          lastName: createUserDto.last_name,
          email: createUserDto.email,
          contactNumber: createUserDto.contact_number,
          password: hashedPassword,
          roleId: createUserDto.role_id,
        },
      });

      return {
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        contact_number: user.contactNumber,
        role_id: user.roleId,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("A user with this email already exists.");
      }

      throw error;
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginUserDto.email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException(EMAIL_LOGIN_FAILURE_MESSAGE);
    }

    const isPasswordValid = await this.verifyPassword(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(PASSWORD_LOGIN_FAILURE_MESSAGE);
    }

    return {
      access_token: this.createAccessToken({
        sub: user.id,
        email: user.email,
        role_id: user.roleId,
        role_name: user.role.name,
      }),
      token_type: "Bearer",
    };
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16);
    const derivedKey = (await scrypt(
      password,
      salt,
      SCRYPT_KEY_LENGTH,
    )) as Buffer;

    return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
  }

  private async verifyPassword(password: string, storedPassword: string) {
    const [saltHex, hashedPasswordHex] = storedPassword.split(":");

    if (!saltHex || !hashedPasswordHex) {
      return false;
    }

    const salt = Buffer.from(saltHex, "hex");
    const storedHash = Buffer.from(hashedPasswordHex, "hex");
    const derivedKey = (await scrypt(
      password,
      salt,
      SCRYPT_KEY_LENGTH,
    )) as Buffer;

    if (storedHash.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(storedHash, derivedKey);
  }

  private createAccessToken(payload: {
    sub: string;
    email: string;
    role_id: number;
    role_name: string;
  }) {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const header = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" }),
    ).toString("base64url");
    const body = Buffer.from(
      JSON.stringify({
        ...payload,
        iat: nowInSeconds,
        exp: nowInSeconds + ACCESS_TOKEN_TTL_SECONDS,
      }),
    ).toString("base64url");

    const signature = createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest("base64url");

    return `${header}.${body}.${signature}`;
  }
}
