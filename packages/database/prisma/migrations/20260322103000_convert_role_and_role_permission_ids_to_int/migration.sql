-- Drop foreign keys and indexes that depend on text-based IDs
ALTER TABLE "user" DROP CONSTRAINT "user_role_id_fkey";
ALTER TABLE "role_permission" DROP CONSTRAINT "role_permission_role_id_fkey";
DROP INDEX "role_permission_role_id_permission_id_key";

-- Create integer IDs for existing roles
CREATE SEQUENCE "role_id_seq";

ALTER TABLE "role"
ADD COLUMN "new_id" INTEGER;

UPDATE "role"
SET "new_id" = nextval('"role_id_seq"')
WHERE "new_id" IS NULL;

ALTER TABLE "role"
ALTER COLUMN "new_id" SET NOT NULL;

SELECT setval('"role_id_seq"', COALESCE((SELECT MAX("new_id") FROM "role"), 0) + 1, false);

ALTER TABLE "role"
ALTER COLUMN "new_id" SET DEFAULT nextval('"role_id_seq"');

-- Backfill integer role IDs into dependent tables
ALTER TABLE "user"
ADD COLUMN "new_role_id" INTEGER;

UPDATE "user" u
SET "new_role_id" = r."new_id"
FROM "role" r
WHERE u."role_id" = r."id";

ALTER TABLE "user"
ALTER COLUMN "new_role_id" SET NOT NULL;

ALTER TABLE "role_permission"
ADD COLUMN "new_role_id" INTEGER;

UPDATE "role_permission" rp
SET "new_role_id" = r."new_id"
FROM "role" r
WHERE rp."role_id" = r."id";

ALTER TABLE "role_permission"
ALTER COLUMN "new_role_id" SET NOT NULL;

-- Create integer IDs for existing role-permission assignments
CREATE SEQUENCE "role_permission_id_seq";

ALTER TABLE "role_permission"
ADD COLUMN "new_id" INTEGER;

UPDATE "role_permission"
SET "new_id" = nextval('"role_permission_id_seq"')
WHERE "new_id" IS NULL;

ALTER TABLE "role_permission"
ALTER COLUMN "new_id" SET NOT NULL;

SELECT setval('"role_permission_id_seq"', COALESCE((SELECT MAX("new_id") FROM "role_permission"), 0) + 1, false);

ALTER TABLE "role_permission"
ALTER COLUMN "new_id" SET DEFAULT nextval('"role_permission_id_seq"');

-- Swap role primary key from text to integer
ALTER TABLE "role" DROP CONSTRAINT "role_pkey";
ALTER TABLE "role" RENAME COLUMN "id" TO "legacy_id";
ALTER TABLE "role" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "role" ADD CONSTRAINT "role_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE "role_id_seq" OWNED BY "role"."id";

-- Swap dependent foreign key columns
ALTER TABLE "user" DROP COLUMN "role_id";
ALTER TABLE "user" RENAME COLUMN "new_role_id" TO "role_id";

ALTER TABLE "role_permission" DROP CONSTRAINT "role_permission_pkey";
ALTER TABLE "role_permission" RENAME COLUMN "id" TO "legacy_id";
ALTER TABLE "role_permission" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "role_permission" RENAME COLUMN "role_id" TO "legacy_role_id";
ALTER TABLE "role_permission" RENAME COLUMN "new_role_id" TO "role_id";
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE "role_permission_id_seq" OWNED BY "role_permission"."id";

-- Recreate constraints on the integer-backed columns
CREATE UNIQUE INDEX "role_permission_role_id_permission_id_key" ON "role_permission"("role_id", "permission_id");

ALTER TABLE "user"
ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "role_permission"
ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Remove legacy text ID columns
ALTER TABLE "role" DROP COLUMN "legacy_id";
ALTER TABLE "role_permission" DROP COLUMN "legacy_id";
ALTER TABLE "role_permission" DROP COLUMN "legacy_role_id";
