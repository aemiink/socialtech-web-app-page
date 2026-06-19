import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateSeoAuditConfigDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  siteUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  gaPropertyId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  searchConsolePropertyUrl?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetKeywords?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(20)
  auditFrequency?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  lastAuditScore?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}
