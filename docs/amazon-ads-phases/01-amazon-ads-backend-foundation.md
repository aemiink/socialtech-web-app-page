<!-- docs/amazon-ads-phases/01-amazon-ads-backend-foundation.md -->

# FAZ 1 — Amazon Ads Backend Foundation ve Client Service Configuration

## Amaç

Her müşteri için Amazon Ads hizmeti tanımlandığında, o müşteriye özel Amazon Ads bağlantı/config verilerinin backend’de güvenli şekilde tutulması.

Bu fazda Amazon Ads API’den gerçek veri çekmek zorunlu değildir. Önce domain modeli ve admin/client create-edit contract kurulacak.

## Ürün Kararı

Amazon Ads bir purchased service olarak çalışacak.

Bir müşteri için `AMAZON_ADS` hizmeti ACTIVE ise:

- Client Panel’de Amazon Ads dashboard görünecek.
- Admin Client create/edit ekranında Amazon Ads configuration alanları açılacak.
- İlgili employee rolleri bu müşteriyi Amazon Ads scope’unda görebilecek.
- Performance specialist, project manager ve client bu panelden ilgili verileri görebilecek.
- E-commerce/Amazon operasyonunda ASIN/SKU/marketplace mantığı korunacak.

## Backend Model

Yeni model ekle:

```prisma
model ClientAmazonAdsConfig {
  id                String   @id @default(uuid())
  clientProfileId   String   @unique
  profileId         String?
  advertiserId      String?
  marketplaceId     String?
  region            String?
  countryCode       String?
  currencyCode      String?
  accountType       String?
  connectionStatus  AmazonAdsConnectionStatus @default(NOT_CONNECTED)
  lastSyncAt        DateTime?
  syncError         String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}
```

Yeni enum:

```prisma
enum AmazonAdsConnectionStatus {
  NOT_CONNECTED
  PENDING
  CONNECTED
  ERROR
  DISCONNECTED
}
```

Credential modeli token-ready ama güvenli şekilde ayrı tutulmalı:

```prisma
model ClientAmazonAdsCredential {
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
- OAuth refresh token özellikle korunmalı.

## Backend Endpointler

Yeni module:

```text
server/src/amazon-ads/
```

Endpointler:

```http
GET /api/v1/admin/clients/:clientId/amazon-ads/config
PATCH /api/v1/admin/clients/:clientId/amazon-ads/config
GET /api/v1/clients/me/amazon-ads/config
```

Admin:

- tüm client configlerini yönetebilir.

Project Manager / Performance Specialist:

- assigned client scope içinde read yapabilir.
- write yetkisi V1’de admin’de kalabilir.

Client:

- sadece kendi connection status ve temel config summary görebilir.
- token, raw error, stack trace veya credential bilgisi görmez.

## Admin Client Create/Edit Entegrasyonu

`adminandemployeePanel` içinde client create/edit flow güncellenecek.

`AMAZON_ADS` purchased service seçilirse ek alanlar açılmalı:

- Amazon Ads Profile ID
- Advertiser ID
- Marketplace ID
- Region
- Country Code
- Currency
- Account Type
- Connection Status

Kurallar:

- Bu alanlar Faz 1’de optional olabilir.
- `AMAZON_ADS` seçilmeden Amazon Ads config alanları görünmemeli.
- Existing `NONE / CREATE / LINK_EXISTING` owner akışı bozulmamalı.
- Existing purchased service selection bozulmamalı.

## Admin Client Detail

`ClientDetail.tsx` içinde Amazon Ads config/status kartı ekle:

- connection status
- profile id
- advertiser id
- marketplace
- region
- currency
- last sync
- sync error, admin-safe normalize edilmiş hali
- “Config düzenle” action

## Client Panel

Amazon Ads service dashboard connection-aware hale getirilmeli.

Davranış:

- Müşteri `AMAZON_ADS` hizmeti almıyorsa panel görünmemeli.
- `AMAZON_ADS` ACTIVE ama config yoksa:
  - “Amazon Ads hesabınız henüz bağlanmadı.”
  - “Ekibimiz yapılandırmayı tamamladığında veriler burada görünecek.”
- Token veya teknik error gösterme.
- Mock fallback yok.

## Permissions

Yeni permissionlar:

```text
amazonAds.config.read.any
amazonAds.config.manage.any
amazonAds.config.read.assigned
```

Admin:

- `amazonAds.config.read.any`
- `amazonAds.config.manage.any`

Performance Specialist / Project Manager:

- `amazonAds.config.read.assigned`

Client:

- own client scope endpoint üzerinden readonly.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Prisma schema’ya `ClientAmazonAdsConfig`, `ClientAmazonAdsCredential`, `AmazonAdsConnectionStatus` ekle.
2. Migration-first convention kullan; `db push` kullanma.
3. `server/src/amazon-ads/` module oluştur.
4. Admin config read/update endpointlerini ekle.
5. Client own config summary endpointini ekle.
6. Permission ve seed mapping ekle.
7. Admin Clients create/edit flow’da AMAZON_ADS seçilince config alanlarını göster.
8. ClientDetail içinde Amazon Ads config/status kartı ekle.
9. Client Panel Amazon Ads dashboard için config-aware empty state ekle.
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

- Her müşteri için Amazon Ads config tutulabiliyor.
- Admin create/edit sırasında Amazon Ads bilgileri alınabiliyor.
- Client Panel sadece AMAZON_ADS hizmeti olan müşteride Amazon Ads panelini gösteriyor.
- Token veya sensitive alan response’ta yok.
- Testler geçiyor.