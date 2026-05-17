-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- DropForeignKey
ALTER TABLE "hcp" DROP CONSTRAINT "hcp_speciality_id_fkey";

-- DropForeignKey
ALTER TABLE "patient" DROP CONSTRAINT "patient_preferred_speciality_id_fkey";

-- AlterTable (Delete and recreate speciality to change ID type to UUID)
DROP TABLE "speciality" CASCADE;

-- CreateTable
CREATE TABLE "speciality" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "speciality_pkey" PRIMARY KEY ("id")
);

-- AlterTable (Update referencing tables)
ALTER TABLE "hcp" ALTER COLUMN "speciality_id" TYPE UUID USING "speciality_id"::UUID;
ALTER TABLE "patient" ALTER COLUMN "preferred_speciality_id" TYPE UUID USING "preferred_speciality_id"::UUID;

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_preferred_speciality_id_fkey" FOREIGN KEY ("preferred_speciality_id") REFERENCES "speciality"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcp" ADD CONSTRAINT "hcp_speciality_id_fkey" FOREIGN KEY ("speciality_id") REFERENCES "speciality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed specialities
INSERT INTO "speciality" ("name", "updated_at")
VALUES
  ('General Practice', CURRENT_TIMESTAMP),
  ('Cardiology', CURRENT_TIMESTAMP),
  ('Pediatrics', CURRENT_TIMESTAMP),
  ('Dermatology', CURRENT_TIMESTAMP),
  ('Psychiatry', CURRENT_TIMESTAMP),
  ('Orthopedics', CURRENT_TIMESTAMP);
