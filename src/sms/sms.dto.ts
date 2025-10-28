import { IsString, Matches, Length, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    description: 'Indian phone number (10 digits)',
    example: '9876543210',
    pattern: '^[6-9]\\d{9}$',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Length(10, 10, { message: 'Phone number must be exactly 10 digits' })
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Invalid Indian phone number format. Must start with 6-9',
  })
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Indian phone number (10 digits)',
    example: '9876543210',
    pattern: '^[6-9]\\d{9}$',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Length(10, 10, { message: 'Phone number must be exactly 10 digits' })
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Invalid Indian phone number format. Must start with 6-9',
  })
  phone: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
    pattern: '^\\d{6}$',
  })
  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, {
    message: 'OTP must contain only digits',
  })
  otp: string;
}