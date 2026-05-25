import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { SlotsModule } from "../slots/slots.module";
import { HcpSchedulesController } from "./hcp-schedules.controller";
import { HcpSchedulesService } from "./hcp-schedules.service";

@Module({
  imports: [DatabaseModule, SlotsModule],
  controllers: [HcpSchedulesController],
  providers: [HcpSchedulesService],
  exports: [HcpSchedulesService],
})
export class HcpSchedulesModule {}
