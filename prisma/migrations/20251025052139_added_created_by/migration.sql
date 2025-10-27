/*
  Warnings:

  - You are about to drop the column `equipment_owned` on the `TalentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `rate_per_hour` on the `TalentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `rate_per_project` on the `TalentProfile` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "TalentType" ADD VALUE 'actor';

-- AlterTable
ALTER TABLE "TalentProfile" DROP COLUMN "equipment_owned",
DROP COLUMN "rate_per_hour",
DROP COLUMN "rate_per_project",
ADD COLUMN     "rate_per_live" DECIMAL(10,2),
ADD COLUMN     "rate_per_video" DECIMAL(10,2),
ADD COLUMN     "verify_badge" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "talent_type" DROP NOT NULL,
ALTER COLUMN "categories" DROP NOT NULL,
ALTER COLUMN "experience_level" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TalentSocialAccount" ALTER COLUMN "platform" DROP NOT NULL,
ALTER COLUMN "handle" DROP NOT NULL,
ALTER COLUMN "profile_url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "cintaId" TEXT,
ADD COLUMN     "dob" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "highest_education" TEXT,
ADD COLUMN     "whatsapp" TEXT,
ALTER COLUMN "first_name" DROP NOT NULL,
ALTER COLUMN "last_name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "createdBy" TEXT DEFAULT 'user',
ALTER COLUMN "user_type" DROP NOT NULL;
