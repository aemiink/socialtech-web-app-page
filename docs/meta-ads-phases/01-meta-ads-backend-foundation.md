<!-- docs/meta-ads-phases/01-meta-ads-backend-foundation.md -->

# FAZ 1 — Meta Ads Backend Foundation ve Client Service Configuration

## Amaç

Her müşteri için Meta Ads hizmeti tanımlandığında, o müşteriye özel Meta Ads bağlantı/config verilerinin backend’de güvenli şekilde tutulması.

Bu fazda Graph API’den gerçek veri çekmek zorunlu değildir. Önce domain modeli ve admin/client create-edit contract kurulacak.

## Ürün Kararı

Meta Ads bir purchased service olarak çalışacak.

Bir müşteri için `META_ADS` hizmeti ACTIVE ise:

- Client Panel’de Meta Ads dashboard görünecek.
- Admin Client create/edit ekranında Meta Ads configuration alanları açılacak.
- İlgili employee rolleri bu müşteriyi Meta Ads scope’unda görebilecek.
- Social media specialist, performance specialist ve designer Meta Ads operasyonuna bağlanabilecek.

## Backend Model

Yeni model ekle:

```prisma
model ClientMetaAdsConfig {
  id                String   @id @default(uuid())
  clientProfileId   String   @unique
  businessId         String?
  adAccountId        String?
  pixelId            String?
  instagramAccountId String?
  facebookPageId     String?
  currency           String?
  timezone           String?
  connectionStatus   MetaAdsConnectionStatus @default(NOT_CONNECTED)
  lastSyncAt         DateTime?
  syncError          String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}```

Yeni enum:
```enum MetaAdsConnectionStatus {
  NOT_CONNECTED
  PENDING
  CONNECTED
  ERROR
  DISCONNECTED
}
```

Credential modeli token-ready ama güvenli şekilde ayrı tutulmalı:


model ClientMetaAdsCredential {
  id              String   @id @default(uuid())
  clientProfileId String   @unique
  accessTokenEnc  String?
  tokenHash       String?
  tokenExpiresAt  DateTime?
  grantedScopes   String[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
} 

Tokenlar:

Plain text tutulmayacak.
Response’ta dönmeyecek.
Logs’a yazılmayacak.
GitHub token encryption pattern’i varsa aynı yaklaşım kullanılacak.

Backend Endpointler
Yeni module:
server/src/meta-ads/

Endpointler:

GET /api/v1/admin/clients/:clientId/meta-ads/config
PATCH /api/v1/admin/clients/:clientId/meta-ads/config
GET /api/v1/clients/me/meta-ads/config

Admin:

tüm client configlerini yönetebilir.

Project Manager / Performance Specialist / Social Media Specialist:

assigned client scope içinde read yapabilir.
write yetkisi V1’de admin’de kalabilir.

Client:

sadece kendi connection status ve temel config summary görebilir.
token, raw error, stack trace, business internals görmez.
Admin Client Create/Edit Entegrasyonu

adminandemployeePanel içinde client create/edit flow güncellenecek.

META_ADS purchased service seçilirse ek alanlar açılmalı:

Meta Business ID
Ad Account ID
Pixel ID
Instagram Account ID
Facebook Page ID
Timezone
Currency
Connection Status

Kurallar:

Bu alanlar Faz 1’de optional olabilir.
META_ADS seçilmeden Meta Ads config alanları görünmemeli.
Existing NONE / CREATE / LINK_EXISTING owner akışı bozulmamalı.
Existing purchased service selection bozulmamalı.
Admin Client Detail

ClientDetail.tsx içinde Meta Ads config/status kartı ekle:

connection status
ad account id
pixel id
last sync
sync error, admin-safe normalize edilmiş hali
“Config düzenle” action
Client Panel

clientPanel/src/app/pages/services/meta-ads-dashboard.tsx connection-aware hale getirilmeli.


Davranış:

Müşteri META_ADS hizmeti almıyorsa panel görünmemeli.
META_ADS ACTIVE ama config yoksa:
“Meta Ads hesabınız henüz bağlanmadı.”
“Ekibimiz yapılandırmayı tamamladığında veriler burada görünecek.”
Token veya teknik error gösterme.
Mock fallback yok.
Permissions

Yeni permissionlar:

metaAds.config.read.any
metaAds.config.manage.any
metaAds.config.read.assigned

Admin:

metaAds.config.read.any
metaAds.config.manage.any

Social Media Specialist / Performance Specialist / Project Manager:

metaAds.config.read.assigned

Client:
own client scope endpoint üzerinden readonly.

Testler

Backend:

Admin config create/update.
Client sadece kendi config summary görür.
Başka client config erişimi 403/404.
Token alanları response’ta dönmez.
META_ADS purchased service olmayan client için config update engellenir veya validation warning döner.

Frontend:

Admin client create/edit içinde META_ADS seçilince config alanları görünür.
META_ADS seçili değilse config alanları görünmez.
Client Panel Meta Ads service only purchased-service scope ile görünür.
Config yoksa empty state.
Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

Prisma schema’ya ClientMetaAdsConfig, ClientMetaAdsCredential, MetaAdsConnectionStatus ekle.
Migration-first convention kullan; db push kullanma.
server/src/meta-ads/ module oluştur.
Admin config read/update endpointlerini ekle.
Client own config summary endpointini ekle.
Permission ve seed mapping ekle.
Admin Clients create/edit flow’da META_ADS seçilince config alanlarını göster.
ClientDetail içinde Meta Ads config/status kartı ekle.
Client Panel Meta Ads dashboard için config-aware empty state ekle.
Backend ve frontend testleri ekle.
Shared memory dosyalarını güncelle.

Validation Komutları

Backend:
cd server
npm run prisma:generate
npm run prisma:seed
npm run build
npm run check
ALLOW_E2E_DB_RESET=true npm run test:e2e:authz

Admin/Employee Panel:
cd adminandemployeePanel
npm run build
npm run check
npm run test:run

Client Panel:
cd clientPanel
npm run build
npm run check
npm run test:run

Kabul Kriterleri
Her müşteri için Meta Ads config tutulabiliyor.
Admin create/edit sırasında Meta Ads bilgileri alınabiliyor.
Client Panel sadece META_ADS hizmeti olan müşteride Meta Ads panelini gösteriyor.
Token veya sensitive alan response’ta yok.
Testler geçiyor.