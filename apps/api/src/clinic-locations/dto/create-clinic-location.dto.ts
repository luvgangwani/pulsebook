import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

const trimString = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const trimOptionalString = ({ value }: { value: unknown }) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue === "" ? undefined : trimmedValue;
};

export class CreateClinicLocationDto {
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

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  managedById!: string;
}
