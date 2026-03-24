import { Module } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DatabaseModule } from "../database/database.module";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RoleGuard } from "./role.guard";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, JwtAuthGuard, RoleGuard, Reflector]
})
export class UsersModule {}
