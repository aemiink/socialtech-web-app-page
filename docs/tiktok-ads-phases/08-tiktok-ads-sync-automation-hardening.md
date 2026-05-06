<!-- docs/tiktok-ads-phases/08-tiktok-ads-sync-automation-hardening.md -->

# FAZ 8 — TikTok Ads Sync Automation, Error Handling ve Rate Limit Güvenliği

## Amaç

TikTok Ads verilerinin düzenli, güvenli ve sürdürülebilir şekilde senkronize edilmesi.

## Sync Tipleri

1. Manual sync
2. Scheduled sync
3. On-demand client dashboard refresh
4. Error retry
5. Async report task status tracking

## Backend Model

```prisma
model TikTokAdsSyncLog {
  id              String @id @default(uuid())
  clientProfileId String
  advertiserId    String?
  status          TikTokAdsSyncStatus
  startedAt       DateTime
  finishedAt      DateTime?
  errorCode       String?
  errorMessage    String?
  recordsFetched  Int?
  apiCallCount    Int?
  reportTaskId    String?
  reportTaskStatus String?
  createdAt       DateTime @default(now())
}
```

Enum:

```prisma
enum TikTokAdsSyncStatus {
  RUNNING
  SUCCESS
  FAILED
  PARTIAL
  SKIPPED
}
```

## Error Normalize

TikTok Ads API errorları kullanıcı dostu hale getirilmeli:

- Access token expired / revoked
- Permission denied
- Advertiser not found
- Advertiser access missing
- Invalid advertiser ID
- Report task failed
- Report not ready
- Rate limit
- Unknown API error

## Rate Limit

- Client dashboard açıldığında sürekli live call yapma.
- Last sync + TTL kontrolü.
- Manual sync admin action.
- Employee/client tarafında refresh butonu rate-limited.
- TikTok Ads API quotas dikkate alınmalı.
- Repeated failed sync kısa sürede tekrar denenmemeli.
- Async report task flow için polling limitli olmalı.

## UI

Admin:

- sync logs
- failed sync clients
- retry button
- error reason
- last successful sync
- report task status badge

Client:

- “Son güncelleme”
- “Veriler hazırlanıyor”
- “Bağlantı problemi var, ekibimiz ilgileniyor”
- teknik TikTok Ads error detayı gösterilmez.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `TikTokAdsSyncLog` modelini ekle.
2. Sync service logging ekle.
3. Manual sync log yazsın.
4. Async report task status tracking için V1-compatible yapı kur.
5. Error normalization helper ekle.
6. Rate-limit/TTL kontrolü ekle.
7. Admin sync logs UI ekle.
8. Client-facing safe error states ekle.
9. Tests ekle.
10. Shared memory güncelle.

## Testler

Backend:

- Sync success log.
- Sync failed log.
- Rate limit skip.
- Token expired/revoked normalized.
- Permission denied normalized.
- Invalid advertiser ID normalized.
- Report not ready normalized.
- Client technical error görmez.
- Admin detailed safe error görür.

Frontend:

- Admin sync logs render.
- Failed sync state.
- Retry button.
- Report pending state.
- Client safe error message.
- Last sync date.
- Rate limited refresh disabled state.

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

- Sync log tutulur.
- Rate-limit safe behavior var.
- Async report pending/fail state yönetilir.
- Failed sync client UI’ı bozmaz.
- Client teknik error görmez.
- Testler geçer.