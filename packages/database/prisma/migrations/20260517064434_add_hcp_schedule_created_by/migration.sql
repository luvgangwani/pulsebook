-- DropIndex
DROP INDEX "clinic_location_created_by_idx";

-- AlterTable
ALTER TABLE "hcp_schedule" ADD COLUMN     "created_by" TEXT;

-- AddForeignKey
ALTER TABLE "hcp_schedule" ADD CONSTRAINT "hcp_schedule_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
