-- Drop foreign keys and indexes that depend on text-based permission IDs
ALTER TABLE "role_permission" DROP CONSTRAINT "role_permission_permission_id_fkey";
DROP INDEX "role_permission_role_id_permission_id_key";

-- Create integer IDs for existing permissions
CREATE SEQUENCE "permission_id_seq";

ALTER TABLE "permission"
ADD COLUMN "new_id" INTEGER;

UPDATE "permission"
SET "new_id" = nextval('"permission_id_seq"')
WHERE "new_id" IS NULL;

ALTER TABLE "permission"
ALTER COLUMN "new_id" SET NOT NULL;

SELECT setval('"permission_id_seq"', COALESCE((SELECT MAX("new_id") FROM "permission"), 0) + 1, false);

ALTER TABLE "permission"
ALTER COLUMN "new_id" SET DEFAULT nextval('"permission_id_seq"');

ALTER TABLE "role_permission"
ADD COLUMN "new_permission_id" INTEGER;

UPDATE "role_permission" rp
SET "new_permission_id" = p."new_id"
FROM "permission" p
WHERE rp."permission_id" = p."id";

ALTER TABLE "role_permission"
ALTER COLUMN "new_permission_id" SET NOT NULL;

-- Swap permission primary key from text to integer
ALTER TABLE "permission" DROP CONSTRAINT "permission_pkey";
ALTER TABLE "permission" RENAME COLUMN "id" TO "legacy_id";
ALTER TABLE "permission" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "permission" ADD CONSTRAINT "permission_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE "permission_id_seq" OWNED BY "permission"."id";

-- Swap dependent foreign key columns
ALTER TABLE "role_permission" RENAME COLUMN "permission_id" TO "legacy_permission_id";
ALTER TABLE "role_permission" RENAME COLUMN "new_permission_id" TO "permission_id";

-- Recreate constraints on the integer-backed columns
CREATE UNIQUE INDEX "role_permission_role_id_permission_id_key" ON "role_permission"("role_id", "permission_id");

ALTER TABLE "role_permission"
ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Remove legacy text ID columns
ALTER TABLE "permission" DROP COLUMN "legacy_id";
ALTER TABLE "role_permission" DROP COLUMN "legacy_permission_id";
