import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { HcpSchedulesController } from "./hcp-schedules.controller";
import { HcpSchedulesService } from "./hcp-schedules.service";

@Module({
  imports: [DatabaseModule],
  controllers: [HcpSchedulesController],
  providers: [HcpSchedulesService],
  exports: [HcpSchedulesService],
})
export class HcpSchedulesModule {}
