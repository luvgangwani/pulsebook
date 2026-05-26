import { Module } from "@nestjs/common";
import { AppointmentsModule } from "./appointments/appointments.module";
import { ClinicLocationsModule } from "./clinic-locations/clinic-locations.module";
import { HealthModule } from "./health/health.module";
import { HcpClinicLocationsModule } from "./hcp-clinic-locations/hcp-clinic-locations.module";
import { HcpSchedulesModule } from "./hcp-schedules/hcp-schedules.module";
import { SlotsModule } from "./slots/slots.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    HealthModule,
    UsersModule,
    ClinicLocationsModule,
    HcpClinicLocationsModule,
    HcpSchedulesModule,
    SlotsModule,
    AppointmentsModule,
  ],
})
export class AppModule {}
