import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { randomBytes, scrypt as nodeScrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaService } from "../database/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";

const scrypt = promisify(nodeScrypt);
const SCRYPT_KEY_LENGTH = 64;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async register(createUserDto: CreateUserDto) {
    const role = await this.prisma.role.findUnique({
      where: { id: createUserDto.role_id }
    });

    if (!role) {
      throw new BadRequestException("Invalid role_id.");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email }
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
          roleId: createUserDto.role_id
        }
      });

      return {
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        contact_number: user.contactNumber,
        role_id: user.roleId,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString()
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

  private async hashPassword(password: string) {
    const salt = randomBytes(16);
    const derivedKey = (await scrypt(
      password,
      salt,
      SCRYPT_KEY_LENGTH
    )) as Buffer;

    return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
  }
}
