<!-- docs/google-ads-phases/01-google-ads-backend-foundation.md -->

# FAZ 1 — Google Ads Backend Foundation ve Client Service Configuration

## Amaç

Her müşteri için Google Ads hizmeti tanımlandığında, o müşteriye özel Google Ads bağlantı/config verilerinin backend’de güvenli şekilde tutulması.

Bu fazda Google Ads API’den gerçek veri çekmek zorunlu değildir. Önce domain modeli ve admin/client create-edit contract kurulacak.

## Ürün Kararı

Google Ads bir purchased service olarak çalışacak.

Bir müşteri için `GOOGLE_ADS` hizmeti ACTIVE ise:

- Client Panel’de Google Ads dashboard görünecek.
- Admin Client create/edit ekranında Google Ads configuration alanları açılacak.
- İlgili employee rolleri bu müşteriyi Google Ads scope’unda görebilecek.
- Performance specialist, project manager ve client bu panelden ilgili verileri görebilecek.

## Backend Model

Yeni model ekle:

```prisma
model ClientGoogleAdsConfig {
  id                String   @id @default(uuid())
  clientProfileId   String   @unique
  customerId         String?
  managerCustomerId  String?
  descriptiveName    String?
  currencyCode       String?
  timeZone           String?
  connectionStatus   GoogleAdsConnectionStatus @default(NOT_CONNECTED)
  lastSyncAt         DateTime?
  syncError          String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}
```

Yeni enum:

```prisma
enum GoogleAdsConnectionStatus {
  NOT_CONNECTED
  PENDING
  CONNECTED
  ERROR
  DISCONNECTED
}
```

Credential modeli token-ready ama güvenli şekilde ayrı tutulmalı:

```prisma
model ClientGoogleAdsCredential {
  id                String   @id @default(uuid())
  clientProfileId   String   @unique
  refreshTokenEnc    String?
  accessTokenEnc     String?
  tokenHash          String?
  tokenExpiresAt     DateTime?
  grantedScopes      String[]
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}
```

Tokenlar:

- Plain text tutulmayacak.
- Response’ta dönmeyecek.
- Logs’a yazılmayacak.
- GitHub token encryption pattern’i varsa aynı yaklaşım kullanılacak.
- Google OAuth refresh token özellikle korunmalı.

## Backend Endpointler

Yeni module:

```text
server/src/google-ads/
```

Endpointler:

```http
GET /api/v1/admin/clients/:clientId/google-ads/config
PATCH /api/v1/admin/clients/:clientId/google-ads/config
GET /api/v1/clients/me/google-ads/config
```

Admin:

- tüm client configlerini yönetebilir.

Project Manager / Performance Specialist:

- assigned client scope içinde read yapabilir.
- write yetkisi V1’de admin’de kalabilir.

Client:

- sadece kendi connection status ve temel config summary görebilir.
- token, raw error, stack trace, developer token veya credential bilgisi görmez.

## Admin Client Create/Edit Entegrasyonu

`adminandemployeePanel` içinde client create/edit flow güncellenecek.

`GOOGLE_ADS` purchased service seçilirse ek alanlar açılmalı:

- Google Ads Customer ID
- Manager Customer ID
- Account Name
- Timezone
- Currency
- Connection Status

Kurallar:

- Bu alanlar Faz 1’de optional olabilir.
- `GOOGLE_ADS` seçilmeden Google Ads config alanları görünmemeli.
- Existing `NONE / CREATE / LINK_EXISTING` owner akışı bozulmamalı.
- Existing purchased service selection bozulmamalı.

## Admin Client Detail

`ClientDetail.tsx` içinde Google Ads config/status kartı ekle:

- connection status
- customer id
- manager customer id
- currency
- timezone
- last sync
- sync error, admin-safe normalize edilmiş hali
- “Config düzenle” action

## Client Panel

Google Ads service dashboard connection-aware hale getirilmeli.

Davranış:

- Müşteri `GOOGLE_ADS` hizmeti almıyorsa panel görünmemeli.
- `GOOGLE_ADS` ACTIVE ama config yoksa:
  - “Google Ads hesabınız henüz bağlanmadı.”
  - “Ekibimiz yapılandırmayı tamamladığında veriler burada görünecek.”
- Token veya teknik error gösterme.
- Mock fallback yok.

## Permissions

Yeni permissionlar:

```text
googleAds.config.read.any
googleAds.config.manage.any
googleAds.config.read.assigned
```

Admin:

- `googleAds.config.read.any`
- `googleAds.config.manage.any`

Performance Specialist / Project Manager:

- `googleAds.config.read.assigned`

Client:

- own client scope endpoint üzerinden readonly.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Prisma schema’ya `ClientGoogleAdsConfig`, `ClientGoogleAdsCredential`, `GoogleAdsConnectionStatus` ekle.
2. Migration-first convention kullan; `db push` kullanma.
3. `server/src/google-ads/` module oluştur.
4. Admin config read/update endpointlerini ekle.
5. Client own config summary endpointini ekle.
6. Permission ve seed mapping ekle.
7. Admin Clients create/edit flow’da GOOGLE_ADS seçilince config alanlarını göster.
8. ClientDetail içinde Google Ads config/status kartı ekle.
9. Client Panel Google Ads dashboard için config-aware empty state ekle.
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

- Her müşteri için Google Ads config tutulabiliyor.
- Admin create/edit sırasında Google Ads bilgileri alınabiliyor.
- Client Panel sadece GOOGLE_ADS hizmeti olan müşteride Google Ads panelini gösteriyor.
- Token veya sensitive alan response’ta yok.
- Testler geçiyor.