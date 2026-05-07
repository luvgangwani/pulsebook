import { Module } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DatabaseModule } from "../database/database.module";
import { JwtAuthGuard } from "../users/jwt-auth.guard";
import { RoleGuard } from "../users/role.guard";
import { ClinicLocationsController } from "./clinic-locations.controller";
import { ClinicLocationsService } from "./clinic-locations.service";

@Module({
  imports: [DatabaseModule],
  controllers: [ClinicLocationsController],
  providers: [ClinicLocationsService, JwtAuthGuard, RoleGuard, Reflector],
})
export class ClinicLocationsModule {}
