import { IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum DesignSystemStatus {
  NONE = 'NONE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export class UpdateWebMobileDesignConfigDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  figmaFileUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  prototypeUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  styleGuideUrl?: string | null;

  @IsOptional()
  @IsEnum(DesignSystemStatus)
  designSystemStatus?: DesignSystemStatus;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  primaryColor?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  secondaryColor?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fontFamily?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetPlatforms?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  gridSystem?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}
