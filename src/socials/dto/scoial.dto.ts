import { Platform } from "@prisma/client";

export interface CreateSocialAccountDto {
  talent_profile_id: string;
  platform: Platform;
  handle: string;
  profile_url: string;
  followers_count?: number;
  engagement_rate?: number;
  is_verified?: boolean;
  is_primary?: boolean;
}

export interface UpdateSocialAccountDto {
  handle?: string;
  profile_url?: string;
  followers_count?: number;
  engagement_rate?: number;
  is_verified?: boolean;
  is_primary?: boolean;
}