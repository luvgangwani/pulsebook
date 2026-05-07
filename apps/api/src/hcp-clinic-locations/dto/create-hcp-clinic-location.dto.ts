import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

const trimString = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class CreateHcpClinicLocationDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  clinicLocationId!: string;
}
