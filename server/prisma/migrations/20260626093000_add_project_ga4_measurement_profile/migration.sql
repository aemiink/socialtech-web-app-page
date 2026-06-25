CREATE TYPE "ProjectGa4MeasurementProfile" AS ENUM ('CORPORATE', 'ECOMMERCE', 'SHOWCASE', 'LEAD_GENERATION', 'CUSTOM');

ALTER TABLE "Project"
ADD COLUMN "ga4MeasurementProfile" "ProjectGa4MeasurementProfile" NOT NULL DEFAULT 'CORPORATE';
