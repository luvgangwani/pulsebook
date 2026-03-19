/*
  Warnings:

  - You are about to drop the column `schedule_expiry_at` on the `hcp_schedule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "hcp_schedule" DROP COLUMN "schedule_expiry_at";
