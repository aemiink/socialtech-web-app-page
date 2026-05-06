<!-- docs/tiktok-ads-phases/02-tiktok-ads-auth-token-connection.md -->

# FAZ 2 — TikTok Ads API Auth, OAuth ve Connection Flow

## Amaç

TikTok Ads verilerini çekebilmek için güvenli bağlantı ve yetkilendirme altyapısını kurmak.

Bu fazda asıl karar:

- Agency/admin-managed token ile mi ilerleyeceğiz?
- Müşteri self-service OAuth bağlantısı olacak mı?
- Advertiser ID / Business Center erişimi nasıl doğrulanacak?

## Önerilen Strateji

### V1 — Admin-managed connection

İlk fazda admin, müşterinin TikTok Advertiser ID / Business Center bilgilerini ve gerekli access token / refresh token bağlantısını kontrollü şekilde sisteme girebilir.

Artıları:

- Daha hızlı başlatılır.
- Internal agency operasyonu için yeterli olabilir.
- Self-service OAuth onboarding ekranları minimumda tutulur.

Eksileri:

- Token yönetimi manuel.
- Token expire/revoke durumunda admin müdahalesi gerekir.
- Production için uzun vadeli self-service kadar iyi değil.

### V2 — TikTok OAuth Self-Service Connection

Uzun vadede müşteri kendi TikTok Ads hesabını bağlar.
Sistem OAuth flow üzerinden access token / refresh token ve granted scopes alır.

Artıları:

- Daha doğru production akışı.
- Müşteri self-service bağlantı yapabilir.
- Token/scope yönetimi daha sürdürülebilir.

Eksileri:

- TikTok developer/app configuration gerekir.
- Permission/app review süreci gerekebilir.
- Hata/permission yönetimi daha kompleks.

## TikTok Ads API Gereksinimleri

TikTok Ads API çağrıları için:

```text
app_id / app_secret
access_token
refresh_token, destekleniyorsa
advertiser_id
business_center_id, varsa
```

## Backend Güvenlik

Credential storage:

- `accessTokenEnc` encrypted olmalı.
- `refreshTokenEnc` varsa encrypted olmalı.
- token response’ta dönmemeli.
- logs’a token yazılmamalı.
- `tokenHash` ile değişim kontrolü yapılabilir.
- env key olmadan credential write fail etmeli.

Env:

```env
TIKTOK_ADS_APP_ID=...
TIKTOK_ADS_APP_SECRET=...
TIKTOK_ADS_REDIRECT_URI=...
TIKTOK_ADS_TOKEN_ENCRYPTION_KEY=...
TIKTOK_ADS_API_BASE_URL=https://business-api.tiktok.com
```

## Backend Endpointler

```http
POST /api/v1/admin/clients/:clientId/tiktok-ads/connect/manual
POST /api/v1/admin/clients/:clientId/tiktok-ads/disconnect
POST /api/v1/admin/clients/:clientId/tiktok-ads/test-connection
GET /api/v1/admin/clients/:clientId/tiktok-ads/connection
```

V2 OAuth için şimdilik hazırlık veya follow-up:

```http
GET /api/v1/tiktok-ads/oauth/start
GET /api/v1/tiktok-ads/oauth/callback
```

## Test Connection

Test connection şunları doğrulamalı:

- access token geçerli mi?
- advertiserId erişilebilir mi?
- granted scopes yeterli mi?
- advertiser currency/timezone alınabiliyor mu?
- TikTok Ads API error normalize ediliyor mu?

## UI

Admin ClientDetail:

- “TikTok Ads Bağlantısını Test Et”
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
  - “TikTok Ads bağlantısı aktif”
  - “TikTok Ads bağlantısı bekleniyor”
  - “Bağlantıda sorun var, ekibimiz ilgileniyor”

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `ClientTikTokAdsCredential` storage’ı güvenli hale getir.
2. `TIKTOK_ADS_TOKEN_ENCRYPTION_KEY` env validation ekle.
3. TikTok Ads OAuth/env validation ekle.
4. Token encryption/decryption service oluştur.
5. Manual connection endpoint ekle.
6. Disconnect endpoint ekle.
7. Test connection endpoint ekle.
8. TikTok Ads API client service oluştur ama external call testlerinde mock kullan.
9. TikTok Ads API error normalization ekle.
10. Admin ClientDetail connection actions UI ekle.
11. Client Panel connection status UI güncelle.
12. Tests ekle.
13. Shared memory güncelle.

## Testler

Backend:

- Admin manual connect yapabilir.
- Access token encrypted stored edilir.
- Refresh token varsa encrypted stored edilir.
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
- TikTok Ads API errors normalize edilir.
- Client token görmez.
- Admin bağlantıyı yönetebilir.
- Testler geçer.