/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Hall` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'ADVANCE_PAID';

-- AlterTable
ALTER TABLE "Hall" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Hall_slug_key" ON "Hall"("slug");
