-- DropIndex
DROP INDEX "appointment_slot_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "appointment_slot_id_active_status_key"
ON "appointment"("slot_id")
WHERE "status" IN ('PENDING', 'ACCEPTED');
