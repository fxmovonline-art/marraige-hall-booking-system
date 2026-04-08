-- AlterTable
ALTER TABLE "Hall" ADD COLUMN     "area" TEXT,
ADD COLUMN     "hasAC" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasCatering" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasParking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pricePerHead" DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "Hall_city_idx" ON "Hall"("city");

-- CreateIndex
CREATE INDEX "Hall_area_idx" ON "Hall"("area");
