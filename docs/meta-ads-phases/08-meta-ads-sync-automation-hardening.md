<!-- docs/meta-ads-phases/08-meta-ads-sync-automation-hardening.md -->

# FAZ 8 — Meta Ads Sync Automation, Error Handling ve Rate Limit Güvenliği

## Amaç

Meta Ads verilerinin düzenli, güvenli ve sürdürülebilir şekilde senkronize edilmesi.

## Sync Tipleri

1. Manual sync
2. Scheduled sync
3. On-demand client dashboard refresh
4. Error retry

## Backend Model

```prisma
model MetaAdsSyncLog {
  id              String @id @default(uuid())
  clientProfileId String
  adAccountId     String?
  status          MetaAdsSyncStatus
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
enum MetaAdsSyncStatus {
  RUNNING
  SUCCESS
  FAILED
  PARTIAL
  SKIPPED
}
```

## Error Normalize

Meta API errorları kullanıcı dostu hale getirilmeli:

- Token expired
- Permission missing
- Ad account unavailable
- Rate limit
- Business access revoked
- Unknown API error

## Rate Limit

- Client dashboard açıldığında sürekli live call yapma.
- Last sync + TTL kontrolü.
- Manual sync admin action.
- Employee/client tarafında refresh butonu rate-limited.

## UI

Admin:

- sync logs
- failed sync clients
- retry button
- error reason

Client:

- “Son güncelleme”
- “Veriler hazırlanıyor”
- “Bağlantı problemi var, ekibimiz ilgileniyor”

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `MetaAdsSyncLog` modelini ekle.
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
- Token expired normalized.
- Permission missing normalized.
- Client technical error görmez.
- Admin detailed safe error görür.

Frontend:

- Admin sync logs render.
- Failed sync state.
- Retry button.
- Client safe error message.
- Last sync date.

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