<!-- docs/google-ads-phases/09-google-ads-reporting-export-layer.md -->

# FAZ 9 — Reporting, Export ve Agency Deliverable Layer

## Amaç

Google Ads paneli sadece dashboard değil, müşteri rapor ve ajans deliverable üretim sistemiyle entegre olmalı.

## Rapor Tipleri

- Weekly Google Ads Report
- Monthly Google Ads Report
- Campaign Performance Report
- Search Terms Report
- Keyword Performance Report
- Budget Recommendation Report
- Conversion Tracking Report

## Backend Model

```prisma
model GoogleAdsReport {
  id              String @id @default(uuid())
  clientProfileId String
  projectId       String?
  periodStart     DateTime
  periodEnd       DateTime
  type            GoogleAdsReportType
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
enum GoogleAdsReportType {
  WEEKLY
  MONTHLY
  CAMPAIGN_PERFORMANCE
  SEARCH_TERMS
  KEYWORD_PERFORMANCE
  BUDGET_RECOMMENDATION
  CONVERSION_TRACKING
}
```

Eğer mevcut generic report model varsa onu kullan; duplicate model üretme.

## Backend Endpointler

```http
GET /api/v1/google-ads/clients/:clientId/reports
POST /api/v1/google-ads/clients/:clientId/reports
PATCH /api/v1/google-ads/reports/:id
GET /api/v1/client/google-ads/reports
```

## Client Panel

Google Ads > Reports:

- report list
- period
- summary
- metrics snapshot
- PDF/export link, ileriki faz
- acknowledged status
- report type badge

## Admin/Employee

- report draft
- publish to client
- approval/acknowledgement request
- metrics snapshot from selected date range
- search terms report draft

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Mevcut report altyapısını incele.
2. Generic report modeli varsa Google Ads reportları oraya bağla.
3. Yoksa minimal `GoogleAdsReport` modeli ekle.
4. Admin/employee report draft/publish endpoints ekle.
5. Client own visible reports endpoint ekle.
6. Google Ads Client Panel Reports sekmesini API-driven yap.
7. Report publish sonrası approval/acknowledgement request opsiyonunu ekle.
8. Search terms / keyword performance report type support ekle.
9. Tests ekle.
10. Shared memory güncelle.

## Testler

Backend:

- Admin report create.
- Employee assigned client report create, permission varsa.
- Draft client’a görünmez.
- clientVisible report client’a görünür.
- Other client report inaccessible.
- Publish report approval/acknowledgement oluşturabilir.

Frontend:

- Client reports list render.
- Empty/loading/error states.
- Admin report draft form.
- Publish action.
- Report status badge.
- Acknowledgement request render.
- Search terms report type render.

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

- Google Ads report entity veya generic report integration var.
- Client-visible report client panelde görünür.
- Internal draft client’a görünmez.
- Report publish/acknowledgement flow çalışır.
- Testler geçer.