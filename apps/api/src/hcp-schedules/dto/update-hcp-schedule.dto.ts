import { DayOfWeek } from "@prisma/client";
import { IsArray, IsEnum, IsInt, IsOptional, Min } from "class-validator";

export class UpdateHcpScheduleDto {
  @IsOptional()
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  availableDays?: DayOfWeek[];

  @IsOptional()
  @IsInt()
  @Min(1)
  slotDuration?: number;
}
