<!-- docs/meta-ads-phases/02-meta-ads-auth-token-connection.md -->

# FAZ 2 — Meta Graph API Auth, Token Strategy ve Connection Flow

## Amaç

Meta Ads verilerini çekebilmek için güvenli bağlantı ve yetkilendirme altyapısını kurmak.

Bu fazda asıl karar:

- İlk versiyonda manuel access token mı kullanılacak?
- Yoksa Facebook Login for Business / OAuth akışı mı kurulacak?

## Önerilen Strateji

### V1 — Admin-managed connection

İlk fazda admin, müşterinin Meta Business bilgilerini ve geçici/uzun ömürlü token bilgisini kontrollü şekilde sisteme girebilir.

Artıları:

- Daha hızlı başlatılır.
- Internal agency operasyonu için yeterli olabilir.
- OAuth ekranı ve app review beklenmez.

Eksileri:

- Token yönetimi manuel.
- Token expire olduğunda admin müdahalesi gerekir.
- Production için uzun vadeli ideal değil.

### V2 — Facebook Login for Business / OAuth

Uzun vadede müşteri kendi Business hesabını bağlar.
Sistem authorization flow üzerinden access token ve granted scopes alır.

Artıları:

- Daha doğru production akışı.
- Müşteri self-service bağlantı yapabilir.
- Token/scope yönetimi daha sürdürülebilir.

Eksileri:

- Meta App config ve review süreci gerekir.
- Hata/permission yönetimi daha kompleks.

## Permission Scope

Minimum read/reporting için:

```text
ads_read```

Campaign management yapılacaksa:
ads_management
```

Ad account / business asset erişimi için gerekirse:
business_management

V1 önerisi:

Önce reporting/read-only dashboard.
Campaign create/update yönetimini daha sonraki faza bırak.
Backend Güvenlik

Credential storage:

accessTokenEnc encrypted olmalı.
token response’ta dönmemeli.
logs’a token yazılmamalı.
tokenHash ile değişim kontrolü yapılabilir.
env key olmadan credential write fail etmeli.

Env:

META_GRAPH_API_VERSION=vXX.X
META_TOKEN_ENCRYPTION_KEY=...
META_APP_ID=...
META_APP_SECRET=...
META_REDIRECT_URI=...
Backend Endpointler
POST /api/v1/admin/clients/:clientId/meta-ads/connect/manual
POST /api/v1/admin/clients/:clientId/meta-ads/disconnect
POST /api/v1/admin/clients/:clientId/meta-ads/test-connection
GET /api/v1/admin/clients/:clientId/meta-ads/connection

V2 OAuth için şimdilik sadece hazırlık veya follow-up:

GET /api/v1/meta-ads/oauth/start
GET /api/v1/meta-ads/oauth/callback
Test Connection

Test connection şunları doğrulamalı:

token geçerli mi?
adAccountId erişilebilir mi?
granted scopes yeterli mi?
account currency/timezone alınabiliyor mu?
API error normalize ediliyor mu?

UI

Admin ClientDetail:

“Meta Bağlantısını Test Et”
“Bağlantıyı Kes”
“Token güncelle”
Status badge:
Connected
Error
Pending
Disconnected

Client Panel:

Connection status readonly.
Token veya teknik hata göstermeden:
“Bağlantı aktif”
“Bağlantı bekleniyor”
“Bağlantıda sorun var, ekibimiz ilgileniyor”
Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

ClientMetaAdsCredential storage’ı güvenli hale getir.
META_TOKEN_ENCRYPTION_KEY env validation ekle.
Token encryption/decryption service oluştur.
Manual connection endpoint ekle.
Disconnect endpoint ekle.
Test connection endpoint ekle.
Meta API client service oluştur ama external call testlerinde mock kullan.
Meta API error normalization ekle.
Admin ClientDetail connection actions UI ekle.
Client Panel connection status UI güncelle.
Tests ekle.
Shared memory güncelle.

Testler

Backend:

Admin manual connect yapabilir.
Token encrypted stored edilir.
Token response’ta dönmez.
Env key yoksa token write fail eder.
Test connection success mock.
Test connection permission error mock.
Disconnect config status’u DISCONNECTED yapar.
Client token göremez.

Frontend:

Admin token input write-only.
Connection status render.
Test connection success/error UI.
Client status readonly.

Validation Komutları

cd server
npm run prisma:generate
npm run prisma:seed
npm run build
npm run check
ALLOW_E2E_DB_RESET=true npm run test:e2e:authz


cd adminandemployeePanel
npm run build
npm run check
npm run test:run


cd clientPanel
npm run build
npm run check
npm run test:run


Kabul Kriterleri
Token güvenli saklanır.
Test connection çalışır.
Meta API errors normalize edilir.
Client token görmez.
Admin bağlantıyı yönetebilir.
Testler geçer.