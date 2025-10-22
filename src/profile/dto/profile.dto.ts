export interface CreateProfileDto {
  user_id: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  bio?: string;
  profile_image_url?: string;
  banner_image_url?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  website_url?: string;
  languages?: any;
  time_zone?: string;
}

export interface UpdateProfileDto {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  bio?: string;
  profile_image_url?: string;
  banner_image_url?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  website_url?: string;
  languages?: any;
  time_zone?: string;
}