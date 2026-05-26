import { IsNotEmpty, IsString } from "class-validator";

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  slotId!: string;

  @IsString()
  @IsNotEmpty()
  patientId!: string;
}
