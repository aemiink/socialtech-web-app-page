<!-- docs/growth-hub-phases/07-growth-reports-approval-integration.md -->

# FAZ 7 — Growth Reports ve Approval Integration

## Amaç

Growth Hub’ı müşteri raporları, bilgilendirme popup’ları ve onay akışlarıyla entegre etmek.

Growth Hub’da müşteri sadece dashboard görmemeli; haftalık/aylık büyüme raporlarını ve aksiyon/onay durumlarını takip edebilmelidir.

## Rapor Tipleri

- Weekly Growth Report
- Monthly Growth Report
- Channel Performance Summary
- Growth Risk Report
- Next Action Plan
- Executive Summary

## Backend Model

Eğer generic report modeli varsa onu kullan.

Yoksa minimal model:

```prisma
model GrowthHubReport {
  id              String @id @default(uuid())
  clientProfileId String
  projectId       String?
  periodStart     DateTime
  periodEnd       DateTime
  type            GrowthHubReportType
  status          ReportStatus
  summary         String?
  metricsSnapshot Json?
  createdByUserId String?
  clientVisible   Boolean @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

Enum:

```prisma
enum GrowthHubReportType {
  WEEKLY
  MONTHLY
  CHANNEL_PERFORMANCE
  RISK_REPORT
  NEXT_ACTION_PLAN
  EXECUTIVE_SUMMARY
}
```

## Approval Types

Mevcut approval sistemiyle bağlanacak:

- GROWTH_REPORT_ACKNOWLEDGEMENT
- GROWTH_ACTION_APPROVAL
- GROWTH_STRATEGY_APPROVAL
- BUDGET_DISTRIBUTION_APPROVAL
- CHANNEL_PRIORITY_APPROVAL

## Backend Endpointler

Admin / Employee:

```http
GET /api/v1/growth-hub/clients/:clientId/reports
POST /api/v1/growth-hub/clients/:clientId/reports
PATCH /api/v1/growth-hub/reports/:id
POST /api/v1/growth-hub/reports/:id/publish
```

Client:

```http
GET /api/v1/clients/me/growth-hub/reports
```

Approval:

- existing `client-approvals` module kullanılmalı.
- Duplicate approval sistemi yazma.

## Client Panel

Growth Hub > Raporlar:

- weekly/monthly reports
- summary
- period
- status
- “Okudum” acknowledgement
- pending approval badge

Growth Hub > Onaylar:

- growth action approval
- strategy approval
- budget distribution approval
- report acknowledgement

## Admin/Employee Panel

Growth Hub workspace:

- report draft
- publish to client
- create acknowledgement request
- approval status
- rejection/feedback notes

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Mevcut report altyapısını incele.
2. Generic report modeli varsa Growth Hub reportları oraya bağla.
3. Yoksa minimal `GrowthHubReport` modeli ekle.
4. Admin/employee report draft/publish endpoints ekle.
5. Client own visible reports endpoint ekle.
6. Growth Hub Client Panel Reports sekmesini API-driven yap.
7. Report publish sonrası approval/acknowledgement request opsiyonunu ekle.
8. Growth strategy/action approval type mapping ekle.
9. Tests ekle.
10. Shared memory güncelle.

## Testler

Backend:

- Admin report create.
- PM assigned client report create.
- Draft client’a görünmez.
- clientVisible report client’a görünür.
- Other client report inaccessible.
- Publish report approval/acknowledgement oluşturabilir.
- Approval response admin/PM tarafında görünür.

Frontend:

- Client reports list render.
- Empty/loading/error states.
- Admin report draft form.
- Publish action.
- Report status badge.
- Acknowledgement request render.
- Growth approval popup render.

## Validation Komutları

```bash
cd server
npm run prisma:generate
npm run prisma:seed
npm run build
npm run check
ALLOW_E2E_DB_RESET=true npm run test:e2e:authz
```

```bash
cd adminandemployeePanel
npm run build
npm run check
npm run test:run
```

```bash
cd clientPanel
npm run build
npm run check
npm run test:run
```

## Kabul Kriterleri

- Growth Hub reports API-driven çalışır.
- Client-visible report client panelde görünür.
- Internal draft client’a görünmez.
- Report publish/acknowledgement flow çalışır.
- Growth approval flow mevcut approval sistemiyle entegre.
- Testler geçer.
