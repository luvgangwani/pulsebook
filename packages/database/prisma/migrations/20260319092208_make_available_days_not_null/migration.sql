UPDATE "hcp_schedule"
SET "available_days" = ARRAY[]::"DayOfWeek"[]
WHERE "available_days" IS NULL;

ALTER TABLE "hcp_schedule"
ALTER COLUMN "available_days" SET NOT NULL;
