<!-- docs/google-ads-phases/08-google-ads-sync-automation-hardening.md -->

# FAZ 8 — Google Ads Sync Automation, Error Handling ve Rate Limit Güvenliği

## Amaç

Google Ads verilerinin düzenli, güvenli ve sürdürülebilir şekilde senkronize edilmesi.

## Sync Tipleri

1. Manual sync
2. Scheduled sync
3. On-demand client dashboard refresh
4. Error retry

## Backend Model

```prisma
model GoogleAdsSyncLog {
  id              String @id @default(uuid())
  clientProfileId String
  customerId      String?
  managerCustomerId String?
  status          GoogleAdsSyncStatus
  startedAt       DateTime
  finishedAt      DateTime?
  errorCode       String?
  errorMessage    String?
  recordsFetched  Int?
  apiCallCount    Int?
  createdAt       DateTime @default(now())
}
```

Enum:

```prisma
enum GoogleAdsSyncStatus {
  RUNNING
  SUCCESS
  FAILED
  PARTIAL
  SKIPPED
}
```

## Error Normalize

Google Ads API errorları kullanıcı dostu hale getirilmeli:

- OAuth token expired / revoked
- Developer token missing
- Permission denied
- Customer not enabled
- Invalid customer ID
- Manager account access missing
- Quota/rate limit
- GAQL query error
- Unknown API error

## Rate Limit

- Client dashboard açıldığında sürekli live call yapma.
- Last sync + TTL kontrolü.
- Manual sync admin action.
- Employee/client tarafında refresh butonu rate-limited.
- Google Ads API quotas dikkate alınmalı.
- Repeated failed sync kısa sürede tekrar denenmemeli.

## UI

Admin:

- sync logs
- failed sync clients
- retry button
- error reason
- last successful sync
- API status badge

Client:

- “Son güncelleme”
- “Veriler hazırlanıyor”
- “Bağlantı problemi var, ekibimiz ilgileniyor”
- teknik Google Ads error detayı gösterilmez.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `GoogleAdsSyncLog` modelini ekle.
2. Sync service logging ekle.
3. Manual sync log yazsın.
4. Error normalization helper ekle.
5. Rate-limit/TTL kontrolü ekle.
6. Admin sync logs UI ekle.
7. Client-facing safe error states ekle.
8. Tests ekle.
9. Shared memory güncelle.

## Testler

Backend:

- Sync success log.
- Sync failed log.
- Rate limit skip.
- OAuth revoked normalized.
- Permission denied normalized.
- Invalid customer ID normalized.
- GAQL error normalized.
- Client technical error görmez.
- Admin detailed safe error görür.

Frontend:

- Admin sync logs render.
- Failed sync state.
- Retry button.
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
- Failed sync client UI’ı bozmaz.
- Client teknik error görmez.
- Testler geçer.