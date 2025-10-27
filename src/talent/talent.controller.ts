import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request
} from '@nestjs/common';
import {
  TalentService
} from './talent.service';
import { TalentType, ExperienceLevel, AvailabilityStatus } from '@prisma/client';
import type { CreateTalentDto, UpdateTalentDto } from './dto/talent.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('talents')
@UseGuards(JwtAuthGuard)
export class TalentController {
  constructor(private readonly talentService: TalentService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTalentDto: CreateTalentDto) {
    return this.talentService.create(createTalentDto);
  }

  @Get()
  async findAll(
    @Query('talent_type') talentType?: TalentType,
    @Query('experience_level') experienceLevel?: ExperienceLevel,
    @Query('availability_status') availabilityStatus?: AvailabilityStatus,
    @Query('min_rate') minRate?: string,
    @Query('max_rate') maxRate?: string
  ) {
    return this.talentService.findAll({
      talent_type: talentType,
      experience_level: experienceLevel,
      availability_status: availabilityStatus,
      min_rate: minRate ? parseFloat(minRate) : undefined,
      max_rate: maxRate ? parseFloat(maxRate) : undefined
    });
  }

  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    return this.talentService.findByUserId(userId);
  }

  @Patch(':userId')
  async update(
    @Param('userId') userId: string,
    @Body() updateTalentDto: UpdateTalentDto
  ) {
    return this.talentService.update(userId, updateTalentDto);
  }

  @Patch(':userId/availability')
  async updateAvailability(
    @Param('userId') userId: string,
    @Body('status') status: AvailabilityStatus
  ) {
    return this.talentService.updateAvailability(userId, status);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('userId') userId: string) {
    await this.talentService.remove(userId);
  }
}