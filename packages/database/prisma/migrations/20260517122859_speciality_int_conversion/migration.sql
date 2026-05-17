/*
  Warnings:

  - The `preferred_speciality_id` column on the `patient` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `speciality` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `speciality` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `speciality_id` on the `hcp` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "hcp" DROP CONSTRAINT "hcp_speciality_id_fkey";

-- DropForeignKey
ALTER TABLE "patient" DROP CONSTRAINT "patient_preferred_speciality_id_fkey";

-- AlterTable
ALTER TABLE "hcp" DROP COLUMN "speciality_id",
ADD COLUMN     "speciality_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "patient" DROP COLUMN "preferred_speciality_id",
ADD COLUMN     "preferred_speciality_id" INTEGER;

-- AlterTable
ALTER TABLE "speciality" DROP CONSTRAINT "speciality_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "speciality_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_preferred_speciality_id_fkey" FOREIGN KEY ("preferred_speciality_id") REFERENCES "speciality"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcp" ADD CONSTRAINT "hcp_speciality_id_fkey" FOREIGN KEY ("speciality_id") REFERENCES "speciality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
