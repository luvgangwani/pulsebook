import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AllowedRoles } from "../users/allowed-roles.decorator";
import { JwtAuthGuard } from "../users/jwt-auth.guard";
import { RoleGuard } from "../users/role.guard";
import { CreateHcpScheduleDto } from "./dto/create-hcp-schedule.dto";
import { HcpSchedulesService } from "./hcp-schedules.service";

@Controller("hcp-schedules")
export class HcpSchedulesController {
  constructor(private readonly hcpSchedulesService: HcpSchedulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @AllowedRoles("ADMIN", "CLINIC_ADMIN", "HCP")
  async createHcpSchedule(@Body() createHcpScheduleDto: CreateHcpScheduleDto) {
    return this.hcpSchedulesService.createHcpSchedule(createHcpScheduleDto);
  }
}
