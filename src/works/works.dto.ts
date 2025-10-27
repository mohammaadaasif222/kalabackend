import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { WorkSampleType, WorkStatus } from '@prisma/client';

// create-work-sample.dto.ts
export class CreateWorkSampleDto {
  @IsUUID()
  @IsNotEmpty()
  talentProfileId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsEnum(WorkSampleType)
  @IsNotEmpty()
  type: WorkSampleType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  url: string;
}

// update-work-sample.dto.ts
export class UpdateWorkSampleDto {
  @IsUUID()
  @IsOptional()
  talentProfileId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsEnum(WorkSampleType)
  @IsOptional()
  type?: WorkSampleType;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  url?: string;

  @IsEnum(WorkStatus)
  @IsOptional()
  status?: WorkStatus;
}

// query-work-sample.dto.ts
export class QueryWorkSampleDto {
  @IsUUID()
  @IsOptional()
  talentProfileId?: string;

  @IsEnum(WorkSampleType)
  @IsOptional()
  type?: WorkSampleType;

  @IsEnum(WorkStatus)
  @IsOptional()
  status?: WorkStatus;
}