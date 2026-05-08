<!-- docs/amazon-ads-phases/02-amazon-ads-auth-token-connection.md -->

# FAZ 2 — Amazon Ads API Auth, OAuth ve Connection Flow

## Amaç

Amazon Ads verilerini çekebilmek için güvenli bağlantı ve yetkilendirme altyapısını kurmak.

Bu fazda asıl karar:

- Agency/admin-managed OAuth token ile mi ilerleyeceğiz?
- Müşteri self-service OAuth bağlantısı olacak mı?
- Amazon Ads profile / marketplace seçimi nasıl yapılacak?

## Önerilen Strateji

### V1 — Admin-managed connection

İlk fazda admin, müşterinin Amazon Ads profile/marketplace bilgilerini ve gerekli OAuth/refresh token bağlantısını kontrollü şekilde sisteme girebilir.

Artıları:

- Daha hızlı başlatılır.
- Internal agency operasyonu için yeterli olabilir.
- Self-service OAuth onboarding ekranları minimumda tutulur.

Eksileri:

- Token yönetimi manuel.
- Refresh token / access revoke durumunda admin müdahalesi gerekir.
- Production için uzun vadeli self-service kadar iyi değil.

### V2 — Amazon Ads OAuth Self-Service Connection

Uzun vadede müşteri kendi Amazon Ads hesabını bağlar.
Sistem OAuth flow üzerinden refresh token ve granted scopes alır.

Artıları:

- Daha doğru production akışı.
- Müşteri self-service bağlantı yapabilir.
- Token/scope yönetimi daha sürdürülebilir.

Eksileri:

- Amazon developer/app configuration gerekir.
- Hata/permission yönetimi daha kompleks.

## Amazon Ads API Gereksinimleri

Amazon Ads API çağrıları için:

```text
OAuth 2.0 authorization
clientId
clientSecret
refresh token
profileId
marketplaceId / region
```

## Backend Güvenlik

Credential storage:

- `refreshTokenEnc` encrypted olmalı.
- `accessTokenEnc` gerekirse encrypted olmalı.
- token response’ta dönmemeli.
- logs’a token yazılmamalı.
- `tokenHash` ile değişim kontrolü yapılabilir.
- env key olmadan credential write fail etmeli.

Env:

```env
AMAZON_ADS_CLIENT_ID=...
AMAZON_ADS_CLIENT_SECRET=...
AMAZON_ADS_REDIRECT_URI=...
AMAZON_ADS_TOKEN_ENCRYPTION_KEY=...
AMAZON_ADS_DEFAULT_REGION=...
```

## Backend Endpointler

```http
POST /api/v1/admin/clients/:clientId/amazon-ads/connect/manual
POST /api/v1/admin/clients/:clientId/amazon-ads/disconnect
POST /api/v1/admin/clients/:clientId/amazon-ads/test-connection
GET /api/v1/admin/clients/:clientId/amazon-ads/connection
```

V2 OAuth için şimdilik hazırlık veya follow-up:

```http
GET /api/v1/amazon-ads/oauth/start
GET /api/v1/amazon-ads/oauth/callback
```

## Test Connection

Test connection şunları doğrulamalı:

- refresh token geçerli mi?
- access token üretilebiliyor mu?
- profileId erişilebilir mi?
- marketplace/region doğru mu?
- profile currency/account bilgileri alınabiliyor mu?
- Amazon Ads API error normalize ediliyor mu?

## UI

Admin ClientDetail:

- “Amazon Ads Bağlantısını Test Et”
- “Bağlantıyı Kes”
- “Token güncelle”
- Status badge:
  - Connected
  - Error
  - Pending
  - Disconnected

Client Panel:

- Connection status readonly.
- Token veya teknik hata göstermeden:
  - “Amazon Ads bağlantısı aktif”
  - “Amazon Ads bağlantısı bekleniyor”
  - “Bağlantıda sorun var, ekibimiz ilgileniyor”

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `ClientAmazonAdsCredential` storage’ı güvenli hale getir.
2. `AMAZON_ADS_TOKEN_ENCRYPTION_KEY` env validation ekle.
3. Amazon Ads OAuth env validation ekle.
4. Token encryption/decryption service oluştur.
5. Manual connection endpoint ekle.
6. Disconnect endpoint ekle.
7. Test connection endpoint ekle.
8. Amazon Ads API client service oluştur ama external call testlerinde mock kullan.
9. Amazon Ads API error normalization ekle.
10. Admin ClientDetail connection actions UI ekle.
11. Client Panel connection status UI güncelle.
12. Tests ekle.
13. Shared memory güncelle.

## Testler

Backend:

- Admin manual connect yapabilir.
- Refresh token encrypted stored edilir.
- Token response’ta dönmez.
- Env key yoksa token write fail eder.
- Test connection success mock.
- Test connection permission error mock.
- Disconnect config status’u DISCONNECTED yapar.
- Client token göremez.

Frontend:

- Admin token input write-only.
- Connection status render.
- Test connection success/error UI.
- Client status readonly.

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

- Token güvenli saklanır.
- Test connection çalışır.
- Amazon Ads API errors normalize edilir.
- Client token görmez.
- Admin bağlantıyı yönetebilir.
- Testler geçer.