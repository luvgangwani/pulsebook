/*
  Warnings:

  - Added the required column `managed_by` to the `clinic_location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clinic_location" ADD COLUMN     "managed_by" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "clinic_location" ADD CONSTRAINT "clinic_location_managed_by_fkey" FOREIGN KEY ("managed_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
