-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('TOP', 'BOTTOM');

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "pin_code" TEXT;

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "type" "BannerType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Banner_type_idx" ON "Banner"("type");

-- CreateIndex
CREATE INDEX "Banner_createdAt_idx" ON "Banner"("createdAt");
