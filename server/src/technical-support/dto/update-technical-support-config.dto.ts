import { IsBoolean, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateTechnicalSupportConfigDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  slaLevel?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  supportPortalUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  maintenanceWindowDay?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  maintenanceWindowTime?: string | null;

  @IsOptional()
  @IsBoolean()
  monitoringEnabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  backupFrequency?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  uptimeTarget?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}
