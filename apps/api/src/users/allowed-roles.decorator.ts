import { SetMetadata } from "@nestjs/common";
import { ALLOWED_ROLES_METADATA_KEY } from "./constants";

export const AllowedRoles = (...roles: string[]) =>
  SetMetadata(ALLOWED_ROLES_METADATA_KEY, roles);
