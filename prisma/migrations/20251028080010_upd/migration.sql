-- CreateEnum
CREATE TYPE "WorkSampleType" AS ENUM ('video', 'image', 'reel', 'other');

-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "mobile_otps" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mobile_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_otps" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_samples" (
    "id" TEXT NOT NULL,
    "talentProfileId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "type" "WorkSampleType" NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "status" "WorkStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "work_samples_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mobile_otps_phone_idx" ON "mobile_otps"("phone");

-- CreateIndex
CREATE INDEX "mobile_otps_user_id_idx" ON "mobile_otps"("user_id");

-- CreateIndex
CREATE INDEX "email_otps_email_idx" ON "email_otps"("email");

-- CreateIndex
CREATE INDEX "email_otps_user_id_idx" ON "email_otps"("user_id");

-- CreateIndex
CREATE INDEX "work_samples_talentProfileId_idx" ON "work_samples"("talentProfileId");

-- CreateIndex
CREATE INDEX "work_samples_type_idx" ON "work_samples"("type");

-- CreateIndex
CREATE INDEX "work_samples_status_idx" ON "work_samples"("status");

-- AddForeignKey
ALTER TABLE "mobile_otps" ADD CONSTRAINT "mobile_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_otps" ADD CONSTRAINT "email_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_samples" ADD CONSTRAINT "work_samples_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
