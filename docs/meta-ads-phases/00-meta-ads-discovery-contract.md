<!-- docs/meta-ads-phases/00-meta-ads-discovery-contract.md -->

# FAZ 0 — Meta Ads Discovery, Official Docs ve Technical Contract

## Durum

- Faz durumu: **Tamamlandı**
- Tarih: **2026-05-09**
- Sonuç: **Faz 1 implementation contract hazır**

## Amaç

Meta Ads entegrasyonu için implementation öncesinde, resmi Meta dokümantasyonuna ve mevcut repo mimarisine uyumlu net teknik kararları sabitlemek.

Bu fazda kod yazımı yerine contract netliği hedeflenmiştir:

- V1 scope (read-only vs manage) kararı
- endpoint + field seti
- permission + access-tier gereksinimi
- token/auth stratejisi
- role-scope matrisi
- Faz 1’e giriş kriterleri

## Mevcut Repo Bağlamı (Doğrulandı)

- `server/` NestJS + Prisma + RBAC.
- `ClientPurchasedService.serviceKey` içinde `META_ADS` mevcut.
- `Project.serviceKey` mevcut.
- `clientPanel` sadece `ACTIVE` purchased service panellerini gösteriyor.
- `clientPanel/src/app/pages/services/meta-ads-dashboard.tsx` hâlen mock ağırlıklı.
- Admin/Employee tarafında RTK Query ve permission-based pattern hazır.

## İncelenen Resmi Kaynaklar

> Not: Aşağıdaki kararlar bu kaynaklarla hizalanmıştır.

1. [Marketing API Overview](https://developers.facebook.com/docs/marketing-apis/overview/)  
2. [Ads Insights API](https://developers.facebook.com/docs/marketing-api/insights/)  
3. [Marketing API Authorization](https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/authorization)  
4. [Marketing API Rate Limiting](https://developers.facebook.com/documentation/ads-commerce/marketing-api/overview/rate-limiting)  
5. [Facebook Login for Business](https://developers.facebook.com/docs/facebook-login/facebook-login-for-business/)  
6. [Permissions Reference](https://developers.facebook.com/docs/permissions/)  
7. [Ad Account reference](https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ad-account)  
8. [Ad Account -> Campaigns](https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ad-account/campaigns)  
9. [Ad Account -> Adsets](https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ad-account/adsets)  
10. [Ad Account -> Ads](https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/ad-account/ads)

## V1 Ürün Kapsam Kararı

**Meta Ads V1 = read-first operations (reporting + visibility).**

- V1’de hedef: müşteriye performans görünürlüğü vermek ve ajans operasyonunu panelden izlemek.
- V1’de **campaign create/update/pause** zorunlu kapsam değil.
- V1’de kritik kapsam:
  - account/config görünürlüğü
  - campaign/adset/ad listeleri (read)
  - insights metrikleri (snapshot ve rapor odaklı)
  - connection status + last sync + user-safe error messaging

## Meta API Contract (V1)

### 1) Çekilecek Kaynaklar

- `/{ad-account-id}` (account metadata)
- `/act_{ad_account_id}/campaigns`
- `/act_{ad_account_id}/adsets`
- `/act_{ad_account_id}/ads`
- insights edge’leri:
  - `/{ad-account-id}/insights`
  - `/{campaign-id}/insights`
  - `/{ad-set-id}/insights`
  - `/{ad-id}/insights`

### 2) Minimum Alan Seti

#### Ad Account

- `id`, `name`
- `account_status`
- `currency`
- `timezone_name` (veya timezone alanları)
- `business`
- `amount_spent`, `spend_cap` (uygunsa)

#### Campaign

- `id`, `name`
- `objective`
- `status`, `effective_status`
- `start_time`, `stop_time`
- `buying_type`
- `daily_budget`, `lifetime_budget`

#### Ad Set

- `id`, `campaign_id`, `name`
- `optimization_goal`
- `billing_event`
- `daily_budget`, `lifetime_budget`
- `targeting` (summary için gerekli alanlar)
- `status`, `effective_status`

#### Ad

- `id`, `campaign_id`, `adset_id`, `name`
- `status`, `effective_status`
- `creative`
- preview için ayrı edge veya creative alanlarından türetim

#### Insights (V1 minimum)

- `impressions`, `reach`, `spend`
- `clicks`, `cpc`, `cpm`, `ctr`, `frequency`
- `actions`, `cost_per_action_type`
- objective’e göre `leads`, `purchases`, `messages`
- `purchase_roas` / `action_values` tabanlı ROAS ve value türetimi (varsa)

### 3) Insights Query Standardı

- Varsayılan pencere: `date_preset` (örn. `last_7d`, `last_30d`)
- Özel dönem: `time_range`
- Granularity: `time_increment=1` (günlük trend)
- Kırılımlar: `breakdowns`, gerektiğinde `action_breakdowns`
- Büyük veri setlerinde: async insights (job-based)

## Permission & Erişim Kararları

### Minimum Permission Set (V1)

- `ads_read` (zorunlu, reporting/read için)
- `ads_management` (V2 manage akışları için hazır tutulur)
- `business_management` (Business Manager asset ilişkileri için V2/V1.5)

### Permission Dependency Notları (Meta Permissions Reference)

- `ads_read`: dependency yok
- `ads_management`: `pages_read_engagement` + `pages_show_list` dependency
- `business_management`: `pages_read_engagement` + `pages_show_list` dependency

### Access Tier / Review Notları

- Marketing API product ile default erişim: **Limited tier**
- Canlı müşteri ölçeği için hedef: **Full access** (App Review sonrası)
- Limited tier yüksek trafik için yeterli değil; prod için Full Access planlanmalı.

## Token/Auth Stratejisi

### V1 (önerilen)

- Facebook Login for Business (`config_id`) ile onboarding.
- Backend server-to-server code exchange pattern.
- İlk sürümde read odaklı; tokenlar kesinlikle encrypted saklanır.
- Tokenlar response’a dönmez, loglara yazılmaz.

### V2

- Business Integration System User token (daha stabil otomasyon akışları).
- Sync ve scheduled pull operasyonları için system-user ağırlıklı model.
- Manage (campaign mutation) açıldığında permission ve review kapsamı genişletilir.

## Role-Scope Matrisi (Repo RBAC ile hizalı)

| Rol | Meta Ads Config | Meta Ads Reporting | Meta Ads Manage |
|---|---|---|---|
| Admin | any read/write | any read | V2’de açılabilir |
| Project Manager | assigned read | assigned read | V1’de yok |
| Performance Specialist | assigned read | assigned read | V1’de yok |
| Social Media Specialist | assigned read | assigned read | V1’de yok |
| Client | own summary only | own summary only | yok |

## Client Panel Mock -> API Eşleme

`clientPanel/src/app/pages/services/meta-ads-dashboard.tsx` içindeki ana bloklar için API karşılığı:

- KPI kartları: insights aggregate (`spend`, `ctr`, `cpc`, `reach`, `actions`)
- Trend chart: `time_increment=1` insights serisi
- Campaign listesi: `/act_{id}/campaigns` + campaign-level insights
- Funnel/kreatif bölümü: campaign/adset/ad + breakdown summary
- “Pixel & Event” alanı: V1’de “sınırlı görünürlük”, V2’de geniş takip

## Faz 1 İçin Net Teknik Kararlar

1. `META_ADS` serviceKey mevcut mimariyle devam edecek; yeni service namespace açılmayacak.
2. Modelleme pattern’i `ClientMetaAdsConfig + ClientMetaAdsCredential` olarak ayrık olacak.
3. Token lifecycle backend-only olacak; frontend write-only davranacak.
4. V1’de read/reporting öncelikli gidilecek; mutation akışları Faz 2+.
5. Client endpointleri `clientId` almayacak; `currentUser.clientProfileId` resolve edilecek.
6. Employee görünürlüğü assignment-scope ile sınırlandırılacak.

## Faz 1’e Giriş Kriteri (Go/No-Go)

- [x] Endpoint ve field contract net
- [x] Minimum permission set net
- [x] Access tier riski net
- [x] Token stratejisi (V1/V2) net
- [x] Role-scope matrisi net
- [x] Repo mimarisiyle çelişen karar yok

## Faz 1 için implementation contract hazır mı?

**Evet, hazır.**
