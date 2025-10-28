// sms.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { SmsService } from './sms.service';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SendOtpDto, VerifyOtpDto } from './sms.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('SMS/OTP')
@Controller('sms')
@UseGuards(JwtAuthGuard) // Protect all routes with JWT authentication
@ApiBearerAuth()
export class SmsController {
  constructor(private readonly smsService: SmsService) {}
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to phone number' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    schema: {
      example: {
        success: true,
        message: 'OTP sent successfully',
        data: {
          phone: '9876543210',
          expiresIn: 10,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid phone or OTP already sent',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async sendOtp(@Request() req, @Body() sendOtpDto: SendOtpDto) {
    const userId = req.user.id; // Get user ID from JWT token

    const result = await this.smsService.createAndSendOtp(
      userId,
      sendOtpDto.phone,
    );

    return {
      success: true,
      message: result.message,
      data: {
        phone: sendOtpDto.phone,
        expiresIn: 10, // minutes
      },
    };
  }

  /**
   * Verify OTP
   * POST /sms/verify-otp
   */
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP for phone number' })
  @ApiResponse({
    status: 200,
    description: 'Phone number verified successfully',
    schema: {
      example: {
        success: true,
        message: 'Phone number verified successfully',
        data: {
          verified: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid OTP or expired',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async verifyOtp(@Request() req, @Body() verifyOtpDto: VerifyOtpDto) {
    const userId = req.user.id; // Get user ID from JWT token

    const result = await this.smsService.verifyOtp(
      userId,
      verifyOtpDto.phone,
      verifyOtpDto.otp,
    );

    return {
      success: true,
      message: result.message,
      data: {
        verified: true,
      },
    };
  }

  /**
   * Resend OTP
   * POST /sms/resend-otp
   */
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP to phone number' })
  @ApiResponse({
    status: 200,
    description: 'OTP resent successfully',
    schema: {
      example: {
        success: true,
        message: 'OTP sent successfully',
        data: {
          phone: '9876543210',
          expiresIn: 10,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid phone number',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async resendOtp(@Request() req, @Body() sendOtpDto: SendOtpDto) {
    const userId = req.user.id; // Get user ID from JWT token

    const result = await this.smsService.resendOtp(userId, sendOtpDto.phone);

    return {
      success: true,
      message: result.message,
      data: {
        phone: sendOtpDto.phone,
        expiresIn: 10, // minutes
      },
    };
  }
}