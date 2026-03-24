import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ALLOWED_ROLES_METADATA_KEY } from "./constants";
import { AuthenticatedUser } from "./jwt-auth.guard";

type RequestLike = {
  user?: AuthenticatedUser;
};

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const allowedRoles = this.reflector.getAllAndOverride<string[]>(
      ALLOWED_ROLES_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestLike>();
    const currentUser = request.user;

    if (!currentUser || !allowedRoles.includes(currentUser.role_name)) {
      throw new BadRequestException(
        `This endpoint requires one of these roles: ${allowedRoles.join(", ")}.`,
      );
    }

    return true;
  }
}
