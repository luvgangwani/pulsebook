import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { trimOptionalString, trimString } from "./user-dto.transforms";

export class RegisterPatientDto {
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  suburb?: string;

  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  state?: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  postcode!: string;

  @IsOptional()
  @IsInt()
  preferredSpecialityId?: number;
}
