import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { normalizeEmail, trimString } from "./user-dto.transforms";

export class LoginUserDto {
  @Transform(normalizeEmail)
  @IsEmail()
  email!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  password!: string;
}
