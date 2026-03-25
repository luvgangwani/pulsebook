# Roles And Permissions

This document gives product and implementation context for the role and permission model defined in [database.md](./database.md).

## Overview

- Each `user` has one primary role through `user.role_id`.
- Roles act as permission bundles through the `role_permission` mapping table.
- Permissions use action-style names such as `VIEW_*`, `MANAGE_*`, and `ASSIGN_ROLES`.
- In general:
  - `VIEW_*` allows read access to a resource or workflow
  - `MANAGE_*` allows write-oriented actions on that resource or workflow
  - `ASSIGN_*` is used for explicit assignment actions that should not be implied by general management

## Roles

### ADMIN

Platform-level role for broad operational and configuration access across the system.

Typical responsibilities:
- manage users and role assignment
- manage clinic locations and HCP-clinic assignments
- manage schedules, appointments, and specialities
- access both self-profile and broader administrative resources

Mapped permissions:
- `VIEW_SELF_PROFILE`
- `MANAGE_SELF_PROFILE`
- `VIEW_USERS`
- `MANAGE_USERS`
- `VIEW_ROLES`
- `MANAGE_ROLES`
- `ASSIGN_ROLES`
- `VIEW_CLINIC_LOCATIONS`
- `MANAGE_CLINIC_LOCATIONS`
- `VIEW_HCP_CLINIC_LOCATIONS`
- `MANAGE_HCP_CLINIC_LOCATIONS`
- `VIEW_SCHEDULE`
- `MANAGE_SCHEDULE`
- `VIEW_SLOTS`
- `VIEW_APPOINTMENTS`
- `MANAGE_APPOINTMENTS`
- `VIEW_SPECIALITIES`
- `MANAGE_SPECIALITIES`

### PATIENT

End-user role for people booking and tracking appointments.

Typical responsibilities:
- manage their own profile
- browse clinic locations and HCP-clinic relationships
- view available slots
- create and manage their own appointment requests

Mapped permissions:
- `VIEW_SELF_PROFILE`
- `MANAGE_SELF_PROFILE`
- `VIEW_CLINIC_LOCATIONS`
- `VIEW_HCP_CLINIC_LOCATIONS`
- `VIEW_SLOTS`
- `VIEW_APPOINTMENTS`
- `MANAGE_APPOINTMENTS`

### HCP

Healthcare professional role for users who receive and act on appointment requests and maintain availability.

Typical responsibilities:
- manage their own profile
- view clinic locations and where they are assigned
- manage their schedule
- review appointment activity tied to their work

Mapped permissions:
- `VIEW_SELF_PROFILE`
- `MANAGE_SELF_PROFILE`
- `VIEW_CLINIC_LOCATIONS`
- `VIEW_HCP_CLINIC_LOCATIONS`
- `VIEW_SCHEDULE`
- `MANAGE_SCHEDULE`
- `VIEW_SLOTS`
- `VIEW_APPOINTMENTS`
- `MANAGE_APPOINTMENTS`

### CLINIC_ADMIN

Clinic operations role for overseeing clinic-specific appointment activity and staffing relationships.

Typical responsibilities:
- manage their own profile
- view and manage clinic appointment operations
- view and manage HCP-clinic assignments
- view schedules and slots needed for clinic coordination

Mapped permissions:
- `VIEW_SELF_PROFILE`
- `MANAGE_SELF_PROFILE`
- `VIEW_CLINIC_APPOINTMENTS`
- `MANAGE_CLINIC_APPOINTMENTS`
- `VIEW_HCP_CLINIC_LOCATIONS`
- `MANAGE_HCP_CLINIC_LOCATIONS`
- `VIEW_SCHEDULE`
- `VIEW_SLOTS`

## Permission Notes

- There is intentionally no `MANAGE_SLOTS` permission in the current model because slot creation is expected to be system-generated from schedules.
- `MANAGE_APPOINTMENTS` should still be constrained by business rules in application code; the permission indicates capability, not unrestricted access to every appointment row.
- `CLINIC_ADMIN` is a role bundle in the current schema. Any clinic-specific scoping beyond that role must still be enforced in application logic.

## Source Of Truth

- Data model and table definitions: [database.md](./database.md)
- Prisma schema: [schema.prisma](../packages/database/prisma/schema.prisma)
- Seeded role-permission mappings: [20260321225124_add_permissions_and_role_permissions/migration.sql](../packages/database/prisma/migrations/20260321225124_add_permissions_and_role_permissions/migration.sql)
