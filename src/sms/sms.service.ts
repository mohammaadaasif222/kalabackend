// sms.service.ts
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface SMSConfig {
  loginID: string;
  password: string;
  senderid: string;
  route_id: string;
  template_id: string;
  baseUrl: string;
}

@Injectable()
export class SmsService {
  private smsConfig: SMSConfig;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.smsConfig = {
      loginID: this.configService.get<string>('SMS_LOGIN_ID') || '',
      password: this.configService.get<string>('SMS_PASSWORD') || '',
      senderid: this.configService.get<string>('SMS_SENDER_ID') || '',
      route_id: this.configService.get<string>('SMS_ROUTE_ID') || '',
      template_id: this.configService.get<string>('SMS_TEMPLATE_ID') || '',
      baseUrl: 'http://www.hindit.co.in/API/pushsms.aspx',
    };
  }

  /**
   * Generate a 6-digit OTP
   */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP via SMS
   */
  private async sendSms(phone: string, otp: string): Promise<boolean> {
    try {
      const message = `Your OTP is ${otp}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes. Do not share with anyone.`;

      const params = {
        loginID: this.smsConfig.loginID,
        password: this.smsConfig.password,
        mobile: phone,
        text: message,
        senderid: this.smsConfig.senderid,
        route_id: this.smsConfig.route_id,
        Unicode: '0',
        IP: '0.0.0.0',
        Template_id: this.smsConfig.template_id,
      };

      const response = await axios.get(this.smsConfig.baseUrl, { params });

      return response.status === 200;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new InternalServerErrorException('Failed to send OTP SMS');
    }
  }

  /**
   * Create and send OTP for a user
   */
  async createAndSendOtp(
    userId: string,
    phone: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check for existing unverified OTP
      const existingOtp = await this.prisma.mobileOtp.findFirst({
        where: {
          user_id: userId,
          phone: phone,
          is_verified: false,
          expires_at: { gt: new Date() },
        },
      });

      if (existingOtp) {
        throw new BadRequestException(
          'An OTP has already been sent. Please wait before requesting a new one.',
        );
      }

      // Generate new OTP
      const otp = this.generateOtp();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

      // Send OTP via SMS
      await this.sendSms(phone, otp);

      // Store OTP in database
      await this.prisma.mobileOtp.create({
        data: {
          user_id: userId,
          phone: phone,
          otp: otp,
          expires_at: expiresAt,
          is_verified: false,
          attempts: 0,
        },
      });

      return {
        success: true,
        message: 'OTP sent successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in createAndSendOtp:', error);
      throw new InternalServerErrorException('Failed to create and send OTP');
    }
  }

  /**
   * Verify OTP and update user verification status
   */
  async verifyOtp(
    userId: string,
    phone: string,
    otp: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find the OTP record
      const otpRecord = await this.prisma.mobileOtp.findFirst({
        where: {
          user_id: userId,
          phone: phone,
          is_verified: false,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      if (!otpRecord) {
        throw new BadRequestException('No OTP found for this phone number');
      }

      // Check if OTP has expired
      if (new Date() > otpRecord.expires_at) {
        await this.prisma.mobileOtp.delete({ where: { id: otpRecord.id } });
        throw new BadRequestException(
          'OTP has expired. Please request a new one.',
        );
      }

      // Check max attempts
      if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
        await this.prisma.mobileOtp.delete({ where: { id: otpRecord.id } });
        throw new BadRequestException(
          'Maximum verification attempts exceeded. Please request a new OTP.',
        );
      }

      // Check if OTP matches
      if (otpRecord.otp !== otp) {
        // Increment attempts
        await this.prisma.mobileOtp.update({
          where: { id: otpRecord.id },
          data: { attempts: otpRecord.attempts + 1 },
        });

        throw new BadRequestException(
          `Invalid OTP. ${this.MAX_ATTEMPTS - otpRecord.attempts - 1} attempts remaining.`,
        );
      }

      // OTP is valid - Update user as verified and delete OTP
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: {
            // is_verified: true,
            phone: phone,
          },
        }),
        this.prisma.mobileOtp.delete({
          where: { id: otpRecord.id },
        }),
      ]);

      return {
        success: true,
        message: 'Phone number verified successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in verifyOtp:', error);
      throw new InternalServerErrorException('Failed to verify OTP');
    }
  }

  /**
   * Resend OTP
   */
  async resendOtp(
    userId: string,
    phone: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Delete any existing OTPs for this user and phone
      await this.prisma.mobileOtp.deleteMany({
        where: {
          user_id: userId,
          phone: phone,
        },
      });

      // Create and send new OTP
      return await this.createAndSendOtp(userId, phone);
    } catch (error) {
      console.error('Error in resendOtp:', error);
      throw new InternalServerErrorException('Failed to resend OTP');
    }
  }

  /**
   * Clean up expired OTPs (can be run as a cron job)
   */
  async cleanupExpiredOtps(): Promise<number> {
    try {
      const result = await this.prisma.mobileOtp.deleteMany({
        where: {
          expires_at: { lt: new Date() },
        },
      });

      return result.count;
    } catch (error) {
      console.error('Error in cleanupExpiredOtps:', error);
      throw new InternalServerErrorException('Failed to cleanup expired OTPs');
    }
  }
}