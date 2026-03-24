import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { trimOptionalString, trimString } from "./user-dto.transforms";

export class RegisterPatientDto {
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  address_line_1?: string;

  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  address_line_2?: string;

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

  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  preferred_speciality_id?: string;
}
