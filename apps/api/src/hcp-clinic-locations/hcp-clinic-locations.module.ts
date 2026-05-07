import { Module } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DatabaseModule } from "../database/database.module";
import { JwtAuthGuard } from "../users/jwt-auth.guard";
import { RoleGuard } from "../users/role.guard";
import { HcpClinicLocationsController } from "./hcp-clinic-locations.controller";
import { HcpClinicLocationsService } from "./hcp-clinic-locations.service";

@Module({
  imports: [DatabaseModule],
  controllers: [HcpClinicLocationsController],
  providers: [HcpClinicLocationsService, JwtAuthGuard, RoleGuard, Reflector],
})
export class HcpClinicLocationsModule {}
