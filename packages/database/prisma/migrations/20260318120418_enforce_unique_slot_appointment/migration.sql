/*
  Warnings:

  - A unique constraint covering the columns `[slot_id]` on the table `appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "appointment_slot_id_patient_id_status_key";

-- CreateIndex
CREATE UNIQUE INDEX "appointment_slot_id_key" ON "appointment"("slot_id");
