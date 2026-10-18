-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BoosterType" AS ENUM ('DRAFT', 'SET', 'PLAY', 'COLLECTOR', 'OTHER');

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BoosterType" NOT NULL DEFAULT 'DRAFT',
    "releaseDate" TIMESTAMP(3),
    "cardmarketUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_type_key" ON "Product"("name", "type");

-- CreateIndex
CREATE INDEX "PriceSnapshot_month_idx" ON "PriceSnapshot"("month");

-- CreateIndex
CREATE UNIQUE INDEX "PriceSnapshot_productId_month_key" ON "PriceSnapshot"("productId", "month");

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
