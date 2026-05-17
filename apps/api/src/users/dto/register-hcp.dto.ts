import { IsInt, IsNotEmpty } from "class-validator";

export class RegisterHcpDto {
  @IsInt()
  @IsNotEmpty()
  specialityId!: number;
}
