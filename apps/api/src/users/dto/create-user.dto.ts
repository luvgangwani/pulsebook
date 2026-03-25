import { Transform, Type } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import {
  normalizeEmail,
  trimOptionalString,
  trimString
} from "./user-dto.transforms";

export class CreateUserDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  lastName?: string;

  @Transform(normalizeEmail)
  @IsEmail()
  email!: string;

  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  contactNumber?: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  password!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  roleId!: number;
}
