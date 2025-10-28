// src/users/entities/user.entity.ts

import { Exclude } from 'class-transformer';

export class UserEntity {
  id: string;
  email: string;
  
  @Exclude()
  password_hash: string;
  phone?: string;
  user_type: string;
  google_id?: string;
  is_premium: boolean;
  premium_expires_at?: Date;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  createdBy?:string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}