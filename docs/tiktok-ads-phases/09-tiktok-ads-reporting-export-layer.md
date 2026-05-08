<!-- docs/tiktok-ads-phases/09-tiktok-ads-reporting-export-layer.md -->

# FAZ 9 — Reporting, Export ve Agency Deliverable Layer

## Amaç

TikTok Ads paneli sadece dashboard değil, müşteri rapor ve ajans deliverable üretim sistemiyle entegre olmalı.

## Rapor Tipleri

- Weekly TikTok Ads Report
- Monthly TikTok Ads Report
- Campaign Performance Report
- Ad Group Performance Report
- Creative Performance Report
- Video Performance Report
- Budget Recommendation Report
- Conversion Tracking Report

## Backend Model

```prisma
model TikTokAdsReport {
  id              String @id @default(uuid())
  clientProfileId String
  projectId       String?
  periodStart     DateTime
  periodEnd       DateTime
  type            TikTokAdsReportType
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
enum TikTokAdsReportType {
  WEEKLY
  MONTHLY
  CAMPAIGN_PERFORMANCE
  AD_GROUP_PERFORMANCE
  CREATIVE_PERFORMANCE
  VIDEO_PERFORMANCE
  BUDGET_RECOMMENDATION
  CONVERSION_TRACKING
}
```

Eğer mevcut generic report model varsa onu kullan; duplicate model üretme.

## Backend Endpointler

```http
GET /api/v1/tiktok-ads/clients/:clientId/reports
POST /api/v1/tiktok-ads/clients/:clientId/reports
PATCH /api/v1/tiktok-ads/reports/:id
GET /api/v1/client/tiktok-ads/reports
```

## Client Panel

TikTok Ads > Reports:

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
- creative/video performance report draft

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Mevcut report altyapısını incele.
2. Generic report modeli varsa TikTok Ads reportları oraya bağla.
3. Yoksa minimal `TikTokAdsReport` modeli ekle.
4. Admin/employee report draft/publish endpoints ekle.
5. Client own visible reports endpoint ekle.
6. TikTok Ads Client Panel Reports sekmesini API-driven yap.
7. Report publish sonrası approval/acknowledgement request opsiyonunu ekle.
8. Creative/video performance report type support ekle.
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
- Creative/video performance report type render.

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

- TikTok Ads report entity veya generic report integration var.
- Client-visible report client panelde görünür.
- Internal draft client’a görünmez.
- Report publish/acknowledgement flow çalışır.
- Testler geçer.