import { AvailabilityStatus, ExperienceLevel, TalentType } from "@prisma/client";

export interface CreateTalentDto {
  user_id: string;
  talent_type: TalentType;
  categories: any;
  specializations?: any;
  experience_level: ExperienceLevel;
  years_of_experience?: number;
  rate_per_hour?: number;
  rate_per_project?: number;
  rate_per_post?: number;
  currency?: string;
  availability_status?: AvailabilityStatus;
  portfolio_description?: string;
  achievements?: string;
  awards?: any;
  certifications?: any;
  collaboration_preferences?: any;
  verify_badge:boolean
}

export interface UpdateTalentDto {
  talent_type?: TalentType;
  categories?: any;
  specializations?: any;
  experience_level?: ExperienceLevel;
  years_of_experience?: number;
  rate_per_hour?: number;
  rate_per_project?: number;
  rate_per_post?: number;
  currency?: string;
  availability_status?: AvailabilityStatus;
  portfolio_description?: string;
  achievements?: string;
  awards?: any;
  certifications?: any;
  verify_badge:boolean
  collaboration_preferences?: any;
}

export interface TalentFilterDto {
  talent_type?: TalentType;
  experience_level?: ExperienceLevel;
  availability_status?: AvailabilityStatus;
  min_rate?: number;
  max_rate?: number;
}