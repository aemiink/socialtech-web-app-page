<!-- docs/tiktok-ads-phases/01-tiktok-ads-backend-foundation.md -->

# FAZ 1 — TikTok Ads Backend Foundation ve Client Service Configuration

## Amaç

Her müşteri için TikTok Ads hizmeti tanımlandığında, o müşteriye özel TikTok Ads bağlantı/config verilerinin backend’de güvenli şekilde tutulması.

Bu fazda TikTok Ads API’den gerçek veri çekmek zorunlu değildir. Önce domain modeli ve admin/client create-edit contract kurulacak.

## Ürün Kararı

TikTok Ads bir purchased service olarak çalışacak.

Bir müşteri için `TIKTOK_ADS` hizmeti ACTIVE ise:

- Client Panel’de TikTok Ads dashboard görünecek.
- Admin Client create/edit ekranında TikTok Ads configuration alanları açılacak.
- İlgili employee rolleri bu müşteriyi TikTok Ads scope’unda görebilecek.
- Social media specialist, performance specialist, designer, project manager ve client bu panelden ilgili verileri görebilecek.
- TikTok tarafında creative/video performansı önemli olduğu için designer ve social media specialist rolleri özellikle dahil olacak.

## Backend Model

Yeni model ekle:

```prisma
model ClientTikTokAdsConfig {
  id                String   @id @default(uuid())
  clientProfileId   String   @unique
  advertiserId       String?
  businessCenterId   String?
  pixelId            String?
  advertiserName     String?
  currency           String?
  timezone           String?
  connectionStatus   TikTokAdsConnectionStatus @default(NOT_CONNECTED)
  lastSyncAt         DateTime?
  syncError          String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}
```

Yeni enum:

```prisma
enum TikTokAdsConnectionStatus {
  NOT_CONNECTED
  PENDING
  CONNECTED
  ERROR
  DISCONNECTED
}
```

Credential modeli token-ready ama güvenli şekilde ayrı tutulmalı:

```prisma
model ClientTikTokAdsCredential {
  id              String   @id @default(uuid())
  clientProfileId String   @unique
  accessTokenEnc  String?
  refreshTokenEnc String?
  tokenHash       String?
  tokenExpiresAt  DateTime?
  grantedScopes   String[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}
```

Tokenlar:

- Plain text tutulmayacak.
- Response’ta dönmeyecek.
- Logs’a yazılmayacak.
- GitHub token encryption pattern’i varsa aynı yaklaşım kullanılacak.
- OAuth refresh token varsa özellikle korunmalı.

## Backend Endpointler

Yeni module:

```text
server/src/tiktok-ads/
```

Endpointler:

```http
GET /api/v1/admin/clients/:clientId/tiktok-ads/config
PATCH /api/v1/admin/clients/:clientId/tiktok-ads/config
GET /api/v1/clients/me/tiktok-ads/config
```

Admin:

- tüm client configlerini yönetebilir.

Project Manager / Performance Specialist / Social Media Specialist / Designer:

- assigned client scope içinde read yapabilir.
- write yetkisi V1’de admin’de kalabilir.

Client:

- sadece kendi connection status ve temel config summary görebilir.
- token, raw error, stack trace veya credential bilgisi görmez.

## Admin Client Create/Edit Entegrasyonu

`adminandemployeePanel` içinde client create/edit flow güncellenecek.

`TIKTOK_ADS` purchased service seçilirse ek alanlar açılmalı:

- TikTok Advertiser ID
- Business Center ID
- Pixel ID
- Advertiser Name
- Timezone
- Currency
- Connection Status

Kurallar:

- Bu alanlar Faz 1’de optional olabilir.
- `TIKTOK_ADS` seçilmeden TikTok Ads config alanları görünmemeli.
- Existing `NONE / CREATE / LINK_EXISTING` owner akışı bozulmamalı.
- Existing purchased service selection bozulmamalı.

## Admin Client Detail

`ClientDetail.tsx` içinde TikTok Ads config/status kartı ekle:

- connection status
- advertiser id
- business center id
- pixel id
- currency
- timezone
- last sync
- sync error, admin-safe normalize edilmiş hali
- “Config düzenle” action

## Client Panel

TikTok Ads service dashboard connection-aware hale getirilmeli.

Davranış:

- Müşteri `TIKTOK_ADS` hizmeti almıyorsa panel görünmemeli.
- `TIKTOK_ADS` ACTIVE ama config yoksa:
  - “TikTok Ads hesabınız henüz bağlanmadı.”
  - “Ekibimiz yapılandırmayı tamamladığında veriler burada görünecek.”
- Token veya teknik error gösterme.
- Mock fallback yok.

## Permissions

Yeni permissionlar:

```text
tiktokAds.config.read.any
tiktokAds.config.manage.any
tiktokAds.config.read.assigned
```

Admin:

- `tiktokAds.config.read.any`
- `tiktokAds.config.manage.any`

Performance Specialist / Social Media Specialist / Designer / Project Manager:

- `tiktokAds.config.read.assigned`

Client:

- own client scope endpoint üzerinden readonly.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Prisma schema’ya `ClientTikTokAdsConfig`, `ClientTikTokAdsCredential`, `TikTokAdsConnectionStatus` ekle.
2. Migration-first convention kullan; `db push` kullanma.
3. `server/src/tiktok-ads/` module oluştur.
4. Admin config read/update endpointlerini ekle.
5. Client own config summary endpointini ekle.
6. Permission ve seed mapping ekle.
7. Admin Clients create/edit flow’da TIKTOK_ADS seçilince config alanlarını göster.
8. ClientDetail içinde TikTok Ads config/status kartı ekle.
9. Client Panel TikTok Ads dashboard için config-aware empty state ekle.
10. Backend ve frontend testleri ekle.
11. Shared memory dosyalarını güncelle.

## Validation Komutları

Backend:

```bash
cd server
npm run prisma:generate
npm run prisma:seed
npm run build
npm run check
ALLOW_E2E_DB_RESET=true npm run test:e2e:authz
```

Admin/Employee Panel:

```bash
cd adminandemployeePanel
npm run build
npm run check
npm run test:run
```

Client Panel:

```bash
cd clientPanel
npm run build
npm run check
npm run test:run
```

## Kabul Kriterleri

- Her müşteri için TikTok Ads config tutulabiliyor.
- Admin create/edit sırasında TikTok Ads bilgileri alınabiliyor.
- Client Panel sadece TIKTOK_ADS hizmeti olan müşteride TikTok Ads panelini gösteriyor.
- Token veya sensitive alan response’ta yok.
- Testler geçiyor.