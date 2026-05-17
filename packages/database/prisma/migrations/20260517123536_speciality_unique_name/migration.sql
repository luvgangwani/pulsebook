/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `speciality` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "speciality_name_key" ON "speciality"("name");
