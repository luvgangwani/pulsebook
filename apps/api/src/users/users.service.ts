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
      where: { id: createUserDto.roleId },
    });

    if (!role) {
      throw new BadRequestException("Invalid roleId.");
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
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: createUserDto.email,
          contactNumber: createUserDto.contactNumber,
          password: hashedPassword,
          roleId: createUserDto.roleId,
        },
      });

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contactNumber: user.contactNumber,
        roleId: user.roleId,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
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
      accessToken: this.createAccessToken({
        sub: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name,
      }),
      tokenType: "Bearer",
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
      registerPatientDto.preferredSpecialityId
        ? this.prisma.speciality.findUnique({
            where: { id: registerPatientDto.preferredSpecialityId },
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
      registerPatientDto.preferredSpecialityId &&
      !preferredSpeciality
    ) {
      throw new BadRequestException("Invalid preferredSpecialityId.");
    }

    const patient = await this.prisma.patient.create({
      data: {
        userId: user.id,
        addressLine1: registerPatientDto.addressLine1,
        addressLine2: registerPatientDto.addressLine2,
        suburb: registerPatientDto.suburb,
        state: registerPatientDto.state,
        postcode: registerPatientDto.postcode,
        preferredSpecialityId: registerPatientDto.preferredSpecialityId,
      },
    });

    return {
      id: patient.id,
      userId: patient.userId,
      addressLine1: patient.addressLine1,
      addressLine2: patient.addressLine2,
      suburb: patient.suburb,
      state: patient.state,
      postcode: patient.postcode,
      preferredSpecialityId: patient.preferredSpecialityId,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
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
        where: { id: registerHcpDto.specialityId },
      }),
    ]);

    if (!user) {
      throw new NotFoundException("Authenticated user was not found.");
    }

    if (existingHcp) {
      throw new ConflictException("An HCP profile already exists for this user.");
    }

    if (!speciality) {
      throw new BadRequestException("Invalid specialityId.");
    }

    const hcp = await this.prisma.hcp.create({
      data: {
        userId: user.id,
        specialityId: registerHcpDto.specialityId,
      },
    });

    return {
      id: hcp.id,
      userId: hcp.userId,
      specialityId: hcp.specialityId,
      createdAt: hcp.createdAt.toISOString(),
      updatedAt: hcp.updatedAt.toISOString(),
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
    roleId: number;
    roleName: string;
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
