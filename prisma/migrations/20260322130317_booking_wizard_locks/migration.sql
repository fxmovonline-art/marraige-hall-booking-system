/*
  Warnings:

  - Added the required column `slot` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BookingSlot" AS ENUM ('LUNCH', 'DINNER');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "addOns" JSONB,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "packageName" TEXT,
ADD COLUMN     "slot" "BookingSlot" NOT NULL,
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_CONFIRMATION';

-- CreateTable
CREATE TABLE "BookingLock" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "hallId" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "slot" "BookingSlot" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingLock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingLock_customerId_idx" ON "BookingLock"("customerId");

-- CreateIndex
CREATE INDEX "BookingLock_expiresAt_idx" ON "BookingLock"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "BookingLock_hallId_eventDate_slot_key" ON "BookingLock"("hallId", "eventDate", "slot");

-- CreateIndex
CREATE INDEX "Booking_hallId_eventDate_slot_idx" ON "Booking"("hallId", "eventDate", "slot");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- AddForeignKey
ALTER TABLE "BookingLock" ADD CONSTRAINT "BookingLock_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingLock" ADD CONSTRAINT "BookingLock_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "Hall"("id") ON DELETE CASCADE ON UPDATE CASCADE;
