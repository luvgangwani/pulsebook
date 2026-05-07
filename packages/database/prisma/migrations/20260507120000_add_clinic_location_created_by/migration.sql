ALTER TABLE "clinic_location"
ADD COLUMN "created_by" TEXT;

CREATE INDEX "clinic_location_created_by_idx" ON "clinic_location"("created_by");

ALTER TABLE "clinic_location"
ADD CONSTRAINT "clinic_location_created_by_fkey"
FOREIGN KEY ("created_by") REFERENCES "user"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
