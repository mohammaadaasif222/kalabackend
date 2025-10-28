import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { WorkService } from './works.service';
import { WorkSampleType, WorkStatus } from '@prisma/client';
import { CreateWorkSampleDto, QueryWorkSampleDto, UpdateWorkSampleDto } from './works.dto';

@Controller('work-samples')
export class WorksController {
  constructor(private readonly workSamplesService: WorkService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createWorkSampleDto: CreateWorkSampleDto) {
    return this.workSamplesService.create(createWorkSampleDto);
  }

  @Get()
  findAll(@Query() queryDto: QueryWorkSampleDto) {
    return this.workSamplesService.findAll(queryDto);
  }

  @Get('count')
  count(@Query() queryDto: QueryWorkSampleDto) {
    return this.workSamplesService.count(queryDto);
  }

@Get('talent/:talentProfileId')
findByTalentProfile(
  @Param('talentProfileId', ParseUUIDPipe) talentProfileId: string,
  @Query('type') type?: string, // Optional query parameter
) {
  return this.workSamplesService.findByTalentProfile(talentProfileId, type);
}

  @Get('type/:type')
  findByType(@Param('type') type: WorkSampleType) {
    return this.workSamplesService.findByType(type);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: WorkStatus) {
    return this.workSamplesService.findByStatus(status);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workSamplesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWorkSampleDto: UpdateWorkSampleDto,
  ) {
    return this.workSamplesService.update(id, updateWorkSampleDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: WorkStatus,
  ) {
    return this.workSamplesService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workSamplesService.remove(id);
  }

  @Delete('talent-profile/:talentProfileId')
  @HttpCode(HttpStatus.OK)
  removeByTalentProfile(
    @Param('talentProfileId', ParseUUIDPipe) talentProfileId: string,
  ) {
    return this.workSamplesService.removeByTalentProfile(talentProfileId);
  }
}