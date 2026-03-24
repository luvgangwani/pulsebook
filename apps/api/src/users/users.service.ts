import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
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
import { RegisterHcpDto } from "./dto/register-hcp.dto";
import { RegisterPatientDto } from "./dto/register-patient.dto";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  EMAIL_LOGIN_FAILURE_MESSAGE,
  PASSWORD_LOGIN_FAILURE_MESSAGE,
} from "./constants";
import { AuthenticatedUser } from "./jwt-auth.guard";

const scrypt = promisify(nodeScrypt);
const SCRYPT_KEY_LENGTH = 64;

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
      email: user.email,
    };
  }

  async registerPatient(
    currentUser: AuthenticatedUser,
    registerPatientDto: RegisterPatientDto,
  ) {
    const [user, existingPatient, preferredSpeciality] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: currentUser.sub },
      }),
      this.prisma.patient.findUnique({
        where: { userId: currentUser.sub },
      }),
      registerPatientDto.preferred_speciality_id
        ? this.prisma.speciality.findUnique({
            where: { id: registerPatientDto.preferred_speciality_id },
          })
        : Promise.resolve(null),
    ]);

    if (!user) {
      throw new NotFoundException("Authenticated user was not found.");
    }

    if (existingPatient) {
      throw new ConflictException("A patient profile already exists for this user.");
    }

    if (
      registerPatientDto.preferred_speciality_id &&
      !preferredSpeciality
    ) {
      throw new BadRequestException("Invalid preferred_speciality_id.");
    }

    const patient = await this.prisma.patient.create({
      data: {
        userId: user.id,
        addressLine1: registerPatientDto.address_line_1,
        addressLine2: registerPatientDto.address_line_2,
        suburb: registerPatientDto.suburb,
        state: registerPatientDto.state,
        postcode: registerPatientDto.postcode,
        preferredSpecialityId: registerPatientDto.preferred_speciality_id,
      },
    });

    return {
      id: patient.id,
      user_id: patient.userId,
      address_line_1: patient.addressLine1,
      address_line_2: patient.addressLine2,
      suburb: patient.suburb,
      state: patient.state,
      postcode: patient.postcode,
      preferred_speciality_id: patient.preferredSpecialityId,
      created_at: patient.createdAt.toISOString(),
      updated_at: patient.updatedAt.toISOString(),
    };
  }

  async registerHcp(
    currentUser: AuthenticatedUser,
    registerHcpDto: RegisterHcpDto,
  ) {
    const [user, existingHcp, speciality] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: currentUser.sub },
      }),
      this.prisma.hcp.findUnique({
        where: { userId: currentUser.sub },
      }),
      this.prisma.speciality.findUnique({
        where: { id: registerHcpDto.speciality_id },
      }),
    ]);

    if (!user) {
      throw new NotFoundException("Authenticated user was not found.");
    }

    if (existingHcp) {
      throw new ConflictException("An HCP profile already exists for this user.");
    }

    if (!speciality) {
      throw new BadRequestException("Invalid speciality_id.");
    }

    const hcp = await this.prisma.hcp.create({
      data: {
        userId: user.id,
        specialityId: registerHcpDto.speciality_id,
      },
    });

    return {
      id: hcp.id,
      user_id: hcp.userId,
      speciality_id: hcp.specialityId,
      created_at: hcp.createdAt.toISOString(),
      updated_at: hcp.updatedAt.toISOString(),
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
