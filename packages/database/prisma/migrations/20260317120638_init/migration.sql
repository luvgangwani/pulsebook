-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "email" TEXT NOT NULL,
    "contact_number" TEXT,
    "password" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "suburb" TEXT,
    "state" TEXT,
    "postcode" TEXT NOT NULL,
    "preferred_speciality_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hcp" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "speciality_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hcp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_location" (
    "id" TEXT NOT NULL,
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "suburb" TEXT,
    "state" TEXT,
    "postcode" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hcp_clinic_location" (
    "id" TEXT NOT NULL,
    "hcp_id" TEXT NOT NULL,
    "clinic_location_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hcp_clinic_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hcp_schedule" (
    "id" TEXT NOT NULL,
    "hcp_clinic_location_id" TEXT NOT NULL,
    "available_days" "DayOfWeek"[],
    "slot_duration" INTEGER NOT NULL,
    "schedule_expiry_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hcp_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slot" (
    "id" TEXT NOT NULL,
    "slot_date" DATE NOT NULL,
    "slot_time" TIME(0) NOT NULL,
    "hcp_schedule_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment" (
    "id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speciality" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "speciality_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "patient_user_id_key" ON "patient"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "hcp_user_id_key" ON "hcp"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "hcp_clinic_location_hcp_id_clinic_location_id_key" ON "hcp_clinic_location"("hcp_id", "clinic_location_id");

-- CreateIndex
CREATE UNIQUE INDEX "hcp_schedule_hcp_clinic_location_id_key" ON "hcp_schedule"("hcp_clinic_location_id");

-- CreateIndex
CREATE UNIQUE INDEX "slot_hcp_schedule_id_slot_date_slot_time_key" ON "slot"("hcp_schedule_id", "slot_date", "slot_time");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_slot_id_patient_id_status_key" ON "appointment"("slot_id", "patient_id", "status");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_preferred_speciality_id_fkey" FOREIGN KEY ("preferred_speciality_id") REFERENCES "speciality"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcp" ADD CONSTRAINT "hcp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcp" ADD CONSTRAINT "hcp_speciality_id_fkey" FOREIGN KEY ("speciality_id") REFERENCES "speciality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcp_clinic_location" ADD CONSTRAINT "hcp_clinic_location_hcp_id_fkey" FOREIGN KEY ("hcp_id") REFERENCES "hcp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcp_clinic_location" ADD CONSTRAINT "hcp_clinic_location_clinic_location_id_fkey" FOREIGN KEY ("clinic_location_id") REFERENCES "clinic_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcp_schedule" ADD CONSTRAINT "hcp_schedule_hcp_clinic_location_id_fkey" FOREIGN KEY ("hcp_clinic_location_id") REFERENCES "hcp_clinic_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slot" ADD CONSTRAINT "slot_hcp_schedule_id_fkey" FOREIGN KEY ("hcp_schedule_id") REFERENCES "hcp_schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
