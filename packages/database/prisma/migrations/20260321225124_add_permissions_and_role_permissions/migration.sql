-- CreateTable
CREATE TABLE "permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permission_name_key" ON "permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_role_id_permission_id_key" ON "role_permission"("role_id", "permission_id");

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed roles
INSERT INTO "role" ("id", "name", "created_at", "updated_at")
VALUES
  ('role_admin', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('role_patient', 'PATIENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('role_hcp', 'HCP', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('role_clinic_admin', 'CLINIC_ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- Seed permissions
INSERT INTO "permission" ("id", "name", "created_at", "updated_at")
VALUES
  ('perm_view_self_profile', 'VIEW_SELF_PROFILE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_manage_self_profile', 'MANAGE_SELF_PROFILE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_view_users', 'VIEW_USERS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_manage_users', 'MANAGE_USERS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_view_roles', 'VIEW_ROLES', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_manage_roles', 'MANAGE_ROLES', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_assign_roles', 'ASSIGN_ROLES', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_view_clinic_locations', 'VIEW_CLINIC_LOCATIONS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_manage_clinic_locations', 'MANAGE_CLINIC_LOCATIONS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_view_hcp_clinic_locations', 'VIEW_HCP_CLINIC_LOCATIONS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_manage_hcp_clinic_locations', 'MANAGE_HCP_CLINIC_LOCATIONS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_view_schedule', 'VIEW_SCHEDULE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_manage_schedule', 'MANAGE_SCHEDULE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_view_slots', 'VIEW_SLOTS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_view_appointments', 'VIEW_APPOINTMENTS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_manage_appointments', 'MANAGE_APPOINTMENTS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_view_specialities', 'VIEW_SPECIALITIES', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_manage_specialities', 'MANAGE_SPECIALITIES', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_view_clinic_appointments', 'VIEW_CLINIC_APPOINTMENTS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_manage_clinic_appointments', 'MANAGE_CLINIC_APPOINTMENTS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- Seed role-permission assignments
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT 'rp_admin_view_self_profile', r.id, p.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "role" r, "permission" p
WHERE r.name = 'ADMIN' AND p.name = 'VIEW_SELF_PROFILE'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT 'rp_admin_manage_self_profile', r.id, p.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "role" r, "permission" p
WHERE r.name = 'ADMIN' AND p.name = 'MANAGE_SELF_PROFILE'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT CONCAT('rp_admin_', LOWER(p.name)), r.id, p.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "role" r
JOIN "permission" p ON p.name IN (
  'VIEW_USERS',
  'MANAGE_USERS',
  'VIEW_ROLES',
  'MANAGE_ROLES',
  'ASSIGN_ROLES',
  'VIEW_CLINIC_LOCATIONS',
  'MANAGE_CLINIC_LOCATIONS',
  'VIEW_HCP_CLINIC_LOCATIONS',
  'MANAGE_HCP_CLINIC_LOCATIONS',
  'VIEW_SCHEDULE',
  'MANAGE_SCHEDULE',
  'VIEW_SLOTS',
  'VIEW_APPOINTMENTS',
  'MANAGE_APPOINTMENTS',
  'VIEW_SPECIALITIES',
  'MANAGE_SPECIALITIES'
)
WHERE r.name = 'ADMIN'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT CONCAT('rp_patient_', LOWER(p.name)), r.id, p.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "role" r
JOIN "permission" p ON p.name IN (
  'VIEW_SELF_PROFILE',
  'MANAGE_SELF_PROFILE',
  'VIEW_CLINIC_LOCATIONS',
  'VIEW_HCP_CLINIC_LOCATIONS',
  'VIEW_SLOTS',
  'VIEW_APPOINTMENTS',
  'MANAGE_APPOINTMENTS'
)
WHERE r.name = 'PATIENT'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT CONCAT('rp_hcp_', LOWER(p.name)), r.id, p.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "role" r
JOIN "permission" p ON p.name IN (
  'VIEW_SELF_PROFILE',
  'MANAGE_SELF_PROFILE',
  'VIEW_CLINIC_LOCATIONS',
  'VIEW_HCP_CLINIC_LOCATIONS',
  'VIEW_SCHEDULE',
  'MANAGE_SCHEDULE',
  'VIEW_SLOTS',
  'VIEW_APPOINTMENTS',
  'MANAGE_APPOINTMENTS'
)
WHERE r.name = 'HCP'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT CONCAT('rp_clinic_admin_', LOWER(p.name)), r.id, p.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "role" r
JOIN "permission" p ON p.name IN (
  'VIEW_SELF_PROFILE',
  'MANAGE_SELF_PROFILE',
  'VIEW_CLINIC_APPOINTMENTS',
  'MANAGE_CLINIC_APPOINTMENTS',
  'VIEW_HCP_CLINIC_LOCATIONS',
  'MANAGE_HCP_CLINIC_LOCATIONS',
  'VIEW_SCHEDULE',
  'VIEW_SLOTS'
)
WHERE r.name = 'CLINIC_ADMIN'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
