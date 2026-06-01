import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AllowedRoles } from "../users/allowed-roles.decorator";
import { CurrentUser } from "../users/current-user.decorator";
import { AuthenticatedUser, JwtAuthGuard } from "../users/jwt-auth.guard";
import { RoleGuard } from "../users/role.guard";
import { ClinicLocationsService } from "./clinic-locations.service";
import { CreateClinicLocationDto } from "./dto/create-clinic-location.dto";

@Controller("clinic-locations")
export class ClinicLocationsController {
  constructor(private readonly clinicLocationsService: ClinicLocationsService) {}

  @Get()
  // @UseGuards(JwtAuthGuard, RoleGuard)
  @AllowedRoles("ADMIN")
  async getClinicLocations() {
    return this.clinicLocationsService.getClinicLocations();
  }

  @Get(":id")
  // @UseGuards(JwtAuthGuard, RoleGuard)
  @AllowedRoles("ADMIN")
  async getClinicLocationById(@Param("id") id: string) {
    return this.clinicLocationsService.getClinicLocationById(id);
  }

  @Post()
  // @UseGuards(JwtAuthGuard, RoleGuard)
  @AllowedRoles("ADMIN")
  async createClinicLocation(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() createClinicLocationDto: CreateClinicLocationDto,
  ) {
    return this.clinicLocationsService.createClinicLocation(
      currentUser,
      createClinicLocationDto,
    );
  }
}
