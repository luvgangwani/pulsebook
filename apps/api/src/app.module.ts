import { Module } from "@nestjs/common";
import { ClinicLocationsModule } from "./clinic-locations/clinic-locations.module";
import { HealthModule } from "./health/health.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [HealthModule, UsersModule, ClinicLocationsModule]
})
export class AppModule {}
