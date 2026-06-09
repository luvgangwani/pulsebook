import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AllowedRoles } from "../users/allowed-roles.decorator";
import { CurrentUser } from "../users/current-user.decorator";
import { AuthenticatedUser } from "../users/jwt-auth.guard";
import { JwtAuthGuard } from "../users/jwt-auth.guard";
import { RoleGuard } from "../users/role.guard";
import { AppointmentsService } from "./appointments.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";

@Controller("appointments")
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, RoleGuard)
  @AllowedRoles("ADMIN", "PATIENT", "HCP", "CLINIC_ADMIN")
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.appointmentsService.createAppointment(createAppointmentDto, user);
  }

  @Get()
  // @UseGuards(JwtAuthGuard, RoleGuard)
  @AllowedRoles("ADMIN", "PATIENT", "HCP", "CLINIC_ADMIN")
  async getAppointments(
    @CurrentUser() user: AuthenticatedUser,
    @Query("type") type?: string,
  ) {
    return this.appointmentsService.getAppointments(user, type);
  }

  @Get(":id")
  // @UseGuards(JwtAuthGuard, RoleGuard)
  @AllowedRoles("ADMIN", "PATIENT", "HCP", "CLINIC_ADMIN")
  async getAppointment(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.appointmentsService.getAppointment(id, user);
  }
}
