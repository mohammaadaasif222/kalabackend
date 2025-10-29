import { IsString, IsUrl, IsEnum, IsOptional, IsNumber } from 'class-validator';

export enum BannerType {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  CARD ='CARD'
}

export class CreateBannerDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  url: string;


  @IsUrl()
  link: string;

  @IsNumber()
  position: number;


  @IsEnum(BannerType)
  type: BannerType;
}

export class UpdateBannerDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  url?: string;

  @IsUrl()
  @IsOptional()
  link?: string;


  @IsNumber()
  @IsOptional()
  position: number;

  @IsEnum(BannerType)
  @IsOptional()
  type?: BannerType;
}
