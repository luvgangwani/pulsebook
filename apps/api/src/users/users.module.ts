import { Module } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DatabaseModule } from "../database/database.module";
import { SlotsModule } from "../slots/slots.module";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RoleGuard } from "./role.guard";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [DatabaseModule, SlotsModule],
  controllers: [UsersController],
  providers: [UsersService, JwtAuthGuard, RoleGuard, Reflector]
})
export class UsersModule {}
