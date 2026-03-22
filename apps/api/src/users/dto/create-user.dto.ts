import { Transform, Type } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

const trimString = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const trimOptionalString = ({ value }: { value: unknown }) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue === "" ? undefined : trimmedValue;
};

const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toLowerCase() : value;

export class CreateUserDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  first_name!: string;

  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  last_name?: string;

  @Transform(normalizeEmail)
  @IsEmail()
  email!: string;

  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  contact_number?: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  password!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  role_id!: number;
}
