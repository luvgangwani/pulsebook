import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { trimString } from "./user-dto.transforms";

export class RegisterHcpDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  specialityId!: string;
}
