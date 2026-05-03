import { Module } from "@nestjs/common";
import { AuditLogModule } from "../audit-log/audit-log.module";
import { AuthModule } from "../auth/auth.module";
import { AdminCrmLeadScanController } from "../crm-lead-scan/admin-crm-lead-scan.controller";
import { AdminCrmLeadsController } from "./admin-crm-leads.controller";
import { CrmLeadScanService } from "../crm-lead-scan/crm-lead-scan.service";
import { LeadScoringService } from "../crm-lead-scan/lead-scoring.service";
import { QueryGeneratorService } from "../crm-lead-scan/query-generator.service";
import { SerpApiService } from "../crm-lead-scan/serpapi.service";
import { WebsiteAnalyzerService } from "../crm-lead-scan/website-analyzer.service";
import { CrmLeadsService } from "./crm-leads.service";
import { EmployeeCrmLeadsController } from "./employee-crm-leads.controller";
import { PublicCrmLeadsController } from "./public-crm-leads.controller";

@Module({
  imports: [AuthModule, AuditLogModule],
  controllers: [
    AdminCrmLeadsController,
    AdminCrmLeadScanController,
    EmployeeCrmLeadsController,
    PublicCrmLeadsController,
  ],
  providers: [
    CrmLeadsService,
    CrmLeadScanService,
    QueryGeneratorService,
    SerpApiService,
    WebsiteAnalyzerService,
    LeadScoringService,
  ],
})
export class CrmModule {}
