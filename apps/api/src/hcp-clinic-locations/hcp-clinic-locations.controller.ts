import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AllowedRoles } from "../users/allowed-roles.decorator";
import { JwtAuthGuard } from "../users/jwt-auth.guard";
import { RoleGuard } from "../users/role.guard";
import { CreateHcpClinicLocationDto } from "./dto/create-hcp-clinic-location.dto";
import { HcpClinicLocationsService } from "./hcp-clinic-locations.service";

@Controller()
export class HcpClinicLocationsController {
  constructor(
    private readonly hcpClinicLocationsService: HcpClinicLocationsService,
  ) {}

  @Post("hcp-clinic-locations")
  @UseGuards(JwtAuthGuard, RoleGuard)
  @AllowedRoles("ADMIN", "CLINIC_ADMIN")
  async createHcpClinicLocation(
    @Body() createHcpClinicLocationDto: CreateHcpClinicLocationDto,
  ) {
    return this.hcpClinicLocationsService.createHcpClinicLocation(
      createHcpClinicLocationDto,
    );
  }

  @Get("clinic-locations/assigned/:userId")
  @UseGuards(JwtAuthGuard)
  async getClinicLocationsAssignedToHcp(@Param("userId") userId: string) {
    return this.hcpClinicLocationsService.getClinicLocationsAssignedToHcp(userId);
  }

  @Get("hcps/assigned/:clinicLocationId")
  @UseGuards(JwtAuthGuard)
  async getHcpsAssignedToClinicLocation(
    @Param("clinicLocationId") clinicLocationId: string,
  ) {
    return this.hcpClinicLocationsService.getHcpsAssignedToClinicLocation(
      clinicLocationId,
    );
  }
}
