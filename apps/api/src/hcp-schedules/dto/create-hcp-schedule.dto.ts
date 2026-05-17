import { DayOfWeek } from "@prisma/client";
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class CreateHcpScheduleDto {
  @IsNotEmpty()
  @IsString()
  hcpId: string;

  @IsNotEmpty()
  @IsString()
  clinicLocationId: string;

  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  availableDays: DayOfWeek[];

  @IsInt()
  @Min(1)
  slotDuration: number;
}
