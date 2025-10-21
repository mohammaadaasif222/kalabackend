-- CreateEnum
CREATE TYPE "TalentType" AS ENUM ('artist', 'influencer', 'both');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('beginner', 'intermediate', 'professional', 'expert');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('available', 'busy', 'booked', 'inactive');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('instagram', 'youtube', 'tiktok', 'facebook', 'twitter', 'linkedin', 'spotify', 'other');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('talent', 'business', 'venue');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('monthly', 'quarterly', 'yearly');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'cancelled', 'expired', 'suspended');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('subscription', 'commission', 'payout', 'refund');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('direct', 'project_inquiry', 'collaboration', 'system');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('profile_update', 'project_posted', 'application_sent', 'collaboration_started', 'payment_received', 'review_received', 'login', 'other');

-- CreateEnum
CREATE TYPE "RelatedEntityType" AS ENUM ('project', 'collaboration', 'user', 'venue', 'event', 'other');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('talent_to_client', 'client_to_talent', 'venue_review');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('talent', 'project', 'venue', 'event');

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "display_name" TEXT,
    "bio" TEXT,
    "profile_image_url" TEXT,
    "banner_image_url" TEXT,
    "location_city" TEXT,
    "location_state" TEXT,
    "location_country" TEXT DEFAULT 'India',
    "website_url" TEXT,
    "languages" JSONB,
    "time_zone" TEXT DEFAULT 'Asia/Kolkata',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalentProfile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "talent_type" "TalentType" NOT NULL,
    "categories" JSONB NOT NULL,
    "specializations" JSONB,
    "experience_level" "ExperienceLevel" NOT NULL,
    "years_of_experience" INTEGER DEFAULT 0,
    "rate_per_hour" DECIMAL(10,2),
    "rate_per_project" DECIMAL(10,2),
    "rate_per_post" DECIMAL(10,2),
    "currency" TEXT DEFAULT 'INR',
    "availability_status" "AvailabilityStatus" DEFAULT 'available',
    "portfolio_description" TEXT,
    "achievements" TEXT,
    "awards" JSONB,
    "certifications" JSONB,
    "equipment_owned" JSONB,
    "collaboration_preferences" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalentSocialAccount" (
    "id" TEXT NOT NULL,
    "talent_profile_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "handle" TEXT NOT NULL,
    "profile_url" TEXT NOT NULL,
    "followers_count" INTEGER DEFAULT 0,
    "engagement_rate" DECIMAL(5,2),
    "is_verified" BOOLEAN DEFAULT false,
    "is_primary" BOOLEAN DEFAULT false,
    "last_updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalentSocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "plan_type" "PlanType" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT DEFAULT 'INR',
    "billing_cycle" "BillingCycle" NOT NULL,
    "features" JSONB NOT NULL,
    "max_projects_per_month" INTEGER,
    "max_applications_per_month" INTEGER,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "subscription_status" "SubscriptionStatus" DEFAULT 'active',
    "auto_renewal" BOOLEAN DEFAULT true,
    "payment_method" TEXT,
    "amount_paid" DECIMAL(10,2) NOT NULL,
    "currency" TEXT DEFAULT 'INR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "collaboration_id" TEXT,
    "transaction_type" "TransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT DEFAULT 'INR',
    "payment_gateway" TEXT,
    "gateway_transaction_id" TEXT,
    "transaction_status" "TransactionStatus" DEFAULT 'pending',
    "payment_method" TEXT,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "project_id" TEXT,
    "subject" TEXT,
    "message_body" TEXT NOT NULL,
    "message_type" "MessageType" NOT NULL DEFAULT 'direct',
    "is_read" BOOLEAN DEFAULT false,
    "read_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "activity_type" "ActivityType" NOT NULL,
    "activity_description" TEXT NOT NULL,
    "related_entity_type" "RelatedEntityType",
    "related_entity_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "reviewee_id" TEXT NOT NULL,
    "collaboration_id" TEXT,
    "rating" INTEGER NOT NULL,
    "review_title" TEXT,
    "review_text" TEXT,
    "review_type" "ReviewType" NOT NULL,
    "is_public" BOOLEAN DEFAULT true,
    "is_featured" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "category_name" TEXT NOT NULL,
    "category_type" "CategoryType" NOT NULL,
    "parent_category_id" TEXT,
    "description" TEXT,
    "icon_url" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "display_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_user_id_key" ON "UserProfile"("user_id");

-- CreateIndex
CREATE INDEX "UserProfile_user_id_idx" ON "UserProfile"("user_id");

-- CreateIndex
CREATE INDEX "UserProfile_location_city_location_state_idx" ON "UserProfile"("location_city", "location_state");

-- CreateIndex
CREATE INDEX "UserProfile_display_name_idx" ON "UserProfile"("display_name");

-- CreateIndex
CREATE UNIQUE INDEX "TalentProfile_user_id_key" ON "TalentProfile"("user_id");

-- CreateIndex
CREATE INDEX "TalentProfile_user_id_idx" ON "TalentProfile"("user_id");

-- CreateIndex
CREATE INDEX "TalentProfile_talent_type_idx" ON "TalentProfile"("talent_type");

-- CreateIndex
CREATE INDEX "TalentProfile_availability_status_idx" ON "TalentProfile"("availability_status");

-- CreateIndex
CREATE INDEX "TalentProfile_experience_level_idx" ON "TalentProfile"("experience_level");

-- CreateIndex
CREATE INDEX "TalentSocialAccount_talent_profile_id_idx" ON "TalentSocialAccount"("talent_profile_id");

-- CreateIndex
CREATE INDEX "TalentSocialAccount_platform_idx" ON "TalentSocialAccount"("platform");

-- CreateIndex
CREATE INDEX "TalentSocialAccount_followers_count_idx" ON "TalentSocialAccount"("followers_count");

-- CreateIndex
CREATE UNIQUE INDEX "TalentSocialAccount_talent_profile_id_platform_handle_key" ON "TalentSocialAccount"("talent_profile_id", "platform", "handle");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_plan_type_idx" ON "SubscriptionPlan"("plan_type");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_is_active_idx" ON "SubscriptionPlan"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_plan_name_plan_type_billing_cycle_key" ON "SubscriptionPlan"("plan_name", "plan_type", "billing_cycle");

-- CreateIndex
CREATE INDEX "UserSubscription_user_id_idx" ON "UserSubscription"("user_id");

-- CreateIndex
CREATE INDEX "UserSubscription_plan_id_idx" ON "UserSubscription"("plan_id");

-- CreateIndex
CREATE INDEX "UserSubscription_subscription_status_idx" ON "UserSubscription"("subscription_status");

-- CreateIndex
CREATE INDEX "UserSubscription_start_date_end_date_idx" ON "UserSubscription"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "Transaction_user_id_idx" ON "Transaction"("user_id");

-- CreateIndex
CREATE INDEX "Transaction_transaction_type_idx" ON "Transaction"("transaction_type");

-- CreateIndex
CREATE INDEX "Transaction_transaction_status_idx" ON "Transaction"("transaction_status");

-- CreateIndex
CREATE INDEX "Transaction_transaction_date_idx" ON "Transaction"("transaction_date");

-- CreateIndex
CREATE INDEX "Transaction_gateway_transaction_id_idx" ON "Transaction"("gateway_transaction_id");

-- CreateIndex
CREATE INDEX "Message_sender_id_idx" ON "Message"("sender_id");

-- CreateIndex
CREATE INDEX "Message_receiver_id_idx" ON "Message"("receiver_id");

-- CreateIndex
CREATE INDEX "Message_project_id_idx" ON "Message"("project_id");

-- CreateIndex
CREATE INDEX "Message_sent_at_idx" ON "Message"("sent_at");

-- CreateIndex
CREATE INDEX "Message_is_read_receiver_id_idx" ON "Message"("is_read", "receiver_id");

-- CreateIndex
CREATE INDEX "ActivityLog_user_id_idx" ON "ActivityLog"("user_id");

-- CreateIndex
CREATE INDEX "ActivityLog_activity_type_idx" ON "ActivityLog"("activity_type");

-- CreateIndex
CREATE INDEX "ActivityLog_created_at_idx" ON "ActivityLog"("created_at");

-- CreateIndex
CREATE INDEX "ActivityLog_related_entity_type_related_entity_id_idx" ON "ActivityLog"("related_entity_type", "related_entity_id");

-- CreateIndex
CREATE INDEX "Review_reviewer_id_idx" ON "Review"("reviewer_id");

-- CreateIndex
CREATE INDEX "Review_reviewee_id_idx" ON "Review"("reviewee_id");

-- CreateIndex
CREATE INDEX "Review_collaboration_id_idx" ON "Review"("collaboration_id");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_is_public_idx" ON "Review"("is_public");

-- CreateIndex
CREATE UNIQUE INDEX "Review_collaboration_id_reviewer_id_key" ON "Review"("collaboration_id", "reviewer_id");

-- CreateIndex
CREATE INDEX "Category_category_type_idx" ON "Category"("category_type");

-- CreateIndex
CREATE INDEX "Category_parent_category_id_idx" ON "Category"("parent_category_id");

-- CreateIndex
CREATE INDEX "Category_is_active_idx" ON "Category"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "Category_category_name_category_type_key" ON "Category"("category_name", "category_type");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentProfile" ADD CONSTRAINT "TalentProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentSocialAccount" ADD CONSTRAINT "TalentSocialAccount_talent_profile_id_fkey" FOREIGN KEY ("talent_profile_id") REFERENCES "TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "UserSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewee_id_fkey" FOREIGN KEY ("reviewee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
