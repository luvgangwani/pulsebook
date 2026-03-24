import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterHcpDto } from "./dto/register-hcp.dto";
import { RegisterPatientDto } from "./dto/register-patient.dto";
import { AllowedRoles } from "./allowed-roles.decorator";
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  ACCESS_TOKEN_COOKIE_NAME,
} from "./constants";
import { CurrentUser } from "./current-user.decorator";
import { AuthenticatedUser, JwtAuthGuard } from "./jwt-auth.guard";
import { RoleGuard } from "./role.guard";
import { UsersService } from "./users.service";

type CookieResponse = {
  cookie: (
    name: string,
    value: string,
    options: typeof ACCESS_TOKEN_COOKIE_OPTIONS,
  ) => void;
};

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Post("login")
  @HttpCode(200)
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    const loginResponse = await this.usersService.login(loginUserDto);

    response.cookie(
      ACCESS_TOKEN_COOKIE_NAME,
      loginResponse.access_token,
      ACCESS_TOKEN_COOKIE_OPTIONS,
    );

    return loginResponse;
  }

  @Post("register/patient")
  @UseGuards(JwtAuthGuard, RoleGuard)
  @AllowedRoles("PATIENT")
  async registerPatient(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() registerPatientDto: RegisterPatientDto,
  ) {
    return this.usersService.registerPatient(currentUser, registerPatientDto);
  }

  @Post("register/hcp")
  @UseGuards(JwtAuthGuard, RoleGuard)
  @AllowedRoles("HCP")
  async registerHcp(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() registerHcpDto: RegisterHcpDto,
  ) {
    return this.usersService.registerHcp(currentUser, registerHcpDto);
  }
}
