// src/auth/dto/auth.dto.ts

import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;
}
export class GoogleLoginDto {
    @IsString()
    token: string;
}

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    user_type: string;
}