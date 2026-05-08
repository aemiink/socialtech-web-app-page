<!-- docs/google-ads-phases/02-google-ads-auth-token-connection.md -->

# FAZ 2 — Google Ads API Auth, Developer Token, OAuth ve Connection Flow

## Amaç

Google Ads verilerini çekebilmek için güvenli bağlantı ve yetkilendirme altyapısını kurmak.

Bu fazda asıl karar:

- Agency manager account üzerinden mi ilerleyeceğiz?
- Client hesapları manager account’a mı bağlanacak?
- OAuth refresh token admin-managed mi olacak?
- Gelecekte müşteri self-service OAuth bağlantısı olacak mı?

## Önerilen Strateji

### V1 — Admin-managed connection

İlk fazda admin, müşterinin Google Ads Customer ID bilgisini ve gerekli OAuth/refresh token bağlantısını kontrollü şekilde sisteme girebilir.

Artıları:

- Daha hızlı başlatılır.
- Internal agency operasyonu için yeterli olabilir.
- OAuth onboarding ekranları minimumda tutulur.

Eksileri:

- Token yönetimi manuel.
- Refresh token / access revoke durumunda admin müdahalesi gerekir.
- Production için uzun vadeli self-service kadar iyi değil.

### V2 — Google OAuth Self-Service Connection

Uzun vadede müşteri kendi Google Ads hesabını bağlar.
Sistem OAuth flow üzerinden refresh token ve granted scopes alır.

Artıları:

- Daha doğru production akışı.
- Müşteri self-service bağlantı yapabilir.
- Token/scope yönetimi daha sürdürülebilir.

Eksileri:

- Google Cloud OAuth consent, verification ve app configuration gerekir.
- Hata/permission yönetimi daha kompleks.

## Google Ads API Gereksinimleri

Google Ads API çağrıları için:

```text
developer_token
OAuth 2.0 credentials
client customer ID
manager customer ID, çoğu agency kullanımında
login-customer-id header, manager account üzerinden erişimde
```

## Permission Scope

OAuth scope:

```text
https://www.googleapis.com/auth/adwords
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
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_REDIRECT_URI=...
GOOGLE_ADS_TOKEN_ENCRYPTION_KEY=...
GOOGLE_ADS_LOGIN_CUSTOMER_ID=...
```

## Backend Endpointler

```http
POST /api/v1/admin/clients/:clientId/google-ads/connect/manual
POST /api/v1/admin/clients/:clientId/google-ads/disconnect
POST /api/v1/admin/clients/:clientId/google-ads/test-connection
GET /api/v1/admin/clients/:clientId/google-ads/connection
```

V2 OAuth için şimdilik hazırlık veya follow-up:

```http
GET /api/v1/google-ads/oauth/start
GET /api/v1/google-ads/oauth/callback
```

## Test Connection

Test connection şunları doğrulamalı:

- refresh token geçerli mi?
- access token üretilebiliyor mu?
- developer token mevcut mu?
- customerId erişilebilir mi?
- managerCustomerId / login-customer-id doğru mu?
- customer currency/timezone alınabiliyor mu?
- Google Ads API error normalize ediliyor mu?

## UI

Admin ClientDetail:

- “Google Ads Bağlantısını Test Et”
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
  - “Google Ads bağlantısı aktif”
  - “Google Ads bağlantısı bekleniyor”
  - “Bağlantıda sorun var, ekibimiz ilgileniyor”

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `ClientGoogleAdsCredential` storage’ı güvenli hale getir.
2. `GOOGLE_ADS_TOKEN_ENCRYPTION_KEY` env validation ekle.
3. Google Ads OAuth env validation ekle.
4. Token encryption/decryption service oluştur.
5. Manual connection endpoint ekle.
6. Disconnect endpoint ekle.
7. Test connection endpoint ekle.
8. Google Ads API client service oluştur ama external call testlerinde mock kullan.
9. Google Ads API error normalization ekle.
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
- Google Ads API errors normalize edilir.
- Client token görmez.
- Admin bağlantıyı yönetebilir.
- Testler geçer.