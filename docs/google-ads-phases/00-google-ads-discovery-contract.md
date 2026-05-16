<!-- docs/google-ads-phases/00-google-ads-discovery-contract.md -->

# FAZ 0 — Google Ads Discovery, Official Docs ve Technical Contract

## Durum

- Faz durumu: **Tamamlandı**
- Tarih: **2026-05-16**
- Sonuç: **Faz 1 implementation contract hazır**

## Amaç

Google Ads entegrasyonu için implementation öncesinde, resmi Google Ads API dokümantasyonuna ve mevcut repo mimarisine uyumlu net teknik kararları sabitlemek.

Bu fazda kod yazımı yerine contract netliği hedeflendi:

- V1 scope (read-first vs campaign manage) kararı
- endpoint + field seti
- access model + auth stratejisi
- role-scope matrisi
- Faz 1’e geçiş kriterleri

## Mevcut Repo Bağlamı (Doğrulandı)

- `server/` NestJS + Prisma + RBAC.
- `PurchasedServiceKey.GOOGLE_ADS` enum değeri mevcut (`server/prisma/schema.prisma`).
- Seed verisinde `GOOGLE_ADS` aktif müşteri örneği mevcut (`nova-performance`).
- `clientPanel` service selection akışı yalnızca ACTIVE purchased service’leri gösteriyor.
- `clientPanel/src/app/pages/services/google-ads-dashboard.tsx` hâlen mock/static.
- `server/src/google-ads/` modülü henüz yok (implementation Faz 1’den itibaren başlayacak).
- `server/src/meta-ads/` modülü, Google Ads için referans uygulanabilir pattern sağlıyor.

## İncelenen Resmi Kaynaklar

> Not: Aşağıdaki kararlar bu kaynaklarla hizalanmıştır.

1. [Google Ads API Overview](https://developers.google.com/google-ads/api)
2. [API Call Structure (`developer-token`, `login-customer-id`)](https://developers.google.com/google-ads/api/docs/concepts/call-structure)
3. [Understand the Google Ads Access Model](https://developers.google.com/google-ads/api/docs/oauth/access-model)
4. [OAuth 2.0 Overview](https://developers.google.com/google-ads/api/docs/oauth/overview)
5. [Multi User Authentication Workflow](https://developers.google.com/google-ads/api/docs/oauth/multi-user-authentication)
6. [Service Account Workflow](https://developers.google.com/google-ads/api/docs/oauth/service-accounts)
7. [Developer Token](https://developers.google.com/google-ads/api/docs/get-started/dev-token)
8. [Access Levels and Permissible Use](https://developers.google.com/google-ads/api/docs/api-policy/access-levels)
9. [Google Ads Query Language (GAQL)](https://developers.google.com/google-ads/api/docs/query/overview)
10. [Date Ranges in GAQL](https://developers.google.com/google-ads/api/docs/query/date-ranges)
11. [Reporting Overview](https://developers.google.com/google-ads/api/docs/reporting/overview)
12. [Report Streaming (`Search` vs `SearchStream`)](https://developers.google.com/google-ads/api/docs/reporting/streaming)
13. [Reports/Fields Overview](https://developers.google.com/google-ads/api/fields/v22/overview)
14. [API Limits and Quotas](https://developers.google.com/google-ads/api/docs/best-practices/quotas)
15. [Conversion Management Overview](https://developers.google.com/google-ads/api/docs/conversions/overview)
16. [Manage Offline Conversions (Enhanced Conversions for Leads)](https://developers.google.com/google-ads/api/docs/conversions/upload-clicks)

## V1 Ürün Kapsam Kararı

**Google Ads V1 = read-first operations (reporting + visibility).**

- V1’de hedef: müşteriye performans görünürlüğü vermek ve operasyon ekibinin panelden izleme/senkron yönetimi yapması.
- V1’de **campaign create/update/pause** ve keyword mutation kapsam dışı.
- V1’de kritik kapsam:
  - account/config görünürlüğü
  - campaign/ad group/ad/keyword/search term listeleri (read)
  - summary + timeseries insights
  - conversion görünürlüğü (read)
  - connection status + last sync + user-safe error messaging

## Google Ads API Contract (V1)

### 1) Çekilecek Kaynaklar ve Servisler

- `GoogleAdsService.Search` / `GoogleAdsService.SearchStream` (GAQL tabanlı ana data çekimi)
- `CustomerService.ListAccessibleCustomers` (bağlantı/test doğrulama yardımcı çağrısı)
- `GoogleAdsFieldService` (field metadata doğrulama ve query güvenliği)
- Offline conversion upload (`ConversionUploadService`) V2 backlog, V1’de read-only hazırlık notu

### 2) Minimum Field Seti

#### Customer / Account

- `customer.id`
- `customer.descriptive_name`
- `customer.currency_code`
- `customer.time_zone`
- `customer.status`
- `customer.manager`

#### Campaign

- `campaign.id`
- `campaign.name`
- `campaign.advertising_channel_type`
- `campaign.status`
- `campaign.serving_status`
- `campaign.start_date`, `campaign.end_date`
- `campaign.campaign_budget`
- `campaign.bidding_strategy_type`

#### Ad Group

- `ad_group.id`
- `ad_group.name`
- `ad_group.status`
- `ad_group.type`
- `ad_group.cpc_bid_micros` (uygunsa)
- `ad_group.campaign`

#### Ads

- `ad_group_ad.ad.id`
- `ad_group_ad.status`
- `ad_group_ad.ad.type`
- `ad_group_ad.ad.final_urls`
- `ad_group_ad.ad.responsive_search_ad` (varsa)
- `ad_group_ad.ad.resource_name`

#### Keyword / Search Term (V1 visibility)

- `keyword_view.resource_name`
- `ad_group_criterion.keyword.text`
- `ad_group_criterion.keyword.match_type`
- `search_term_view.search_term`

> Not: `search_term_view`, resmi dokümana göre Performance Max verisini kapsamaz; PMax için Faz 3+’ta `campaign_search_term_view` eklenir.

#### Metrics (V1 minimum)

- `metrics.impressions`
- `metrics.clicks`
- `metrics.cost_micros`
- `metrics.conversions`
- `metrics.conversions_value`
- `metrics.ctr`
- `metrics.average_cpc`
- `metrics.cost_per_conversion`
- `metrics.interactions`
- `metrics.engagement_rate` (channel uygunluğuna göre)
- `metrics.video_views` (video kampanya varsa)
- `metrics.search_impression_share` (uygun campaign/report kombinasyonunda)

### 3) GAQL Query Standardı

- Varsayılan pencere: `segments.date DURING LAST_30_DAYS`
- Trend sorguları: `segments.date` ile günlük seri
- Karşılaştırma: `LAST_7_DAYS`, `LAST_30_DAYS`, `THIS_MONTH`
- Tüm sorgular finite date range ile çalıştırılacak.
- Büyük raporlarda `SearchStream`; küçük/etkileşimli sorgularda `Search`.
- Query builder/field compatibility kontrolü zorunlu.

### 4) Rate Limit / Quota / Error Stratejisi

- Developer token access level’e göre günlük operasyon limiti uygulanır.
- `Search` ve `SearchStream` çağrısı başına operasyon maliyeti dikkate alınır.
- `RESOURCE_EXHAUSTED` ve quota hata kodları normalize edilerek retry/backoff uygulanır.
- `GoogleAdsFailure` dönen hatalar quota tüketir; bu yüzden fail-fast validation + query daraltma uygulanır.

## Access Model ve Auth Stratejisi

### Access Model Kararı

- Agency modelinde manager account (MCC) root olacak.
- Client customer ID her müşteri config’inde tutulacak.
- Manager üzerinden erişimde `login-customer-id` header zorunlu kabul edilecek.
- API çağrılarında customer ID’ler daima tire (`-`) olmadan saklanıp gönderilecek.
- Google Ads API, read/write ayrımı için ayrı OAuth scope kullanmaz; erişim seviyeleri Google Ads account role + `login-customer-id` ile belirlenir.

### OAuth / Credential Stratejisi (V1 ve V2)

#### V1 (önerilen)

- Admin-managed bağlantı (controlled onboarding).
- Müşteri bazında config + credential ayrık tutulur (`ClientGoogleAdsConfig`, `ClientGoogleAdsCredential`).
- `refreshToken` encrypted storage; plain token API response/log içinde yer almaz.
- OAuth scope: `https://www.googleapis.com/auth/adwords`.
- Developer token merkezi (env) yönetilir.

#### V2 (hedef)

- Service account workflow’a geçiş (Google’ın güncel önerisiyle hizalı).
- Manager account altında service account access modeliyle user-refresh-token bağımlılığını azaltma.
- Gerekirse multi-user OAuth onboarding (self-service) ayrı bir ürün kararıyla açılır.

## Role-Scope Matrisi (Repo RBAC ile hizalı)

| Rol | Google Ads Config | Google Ads Reporting | Google Ads Manage |
|---|---|---|---|
| Admin | any read/write | any read | V2’de staged |
| Project Manager | assigned read | assigned read | V1’de yok |
| Performance Specialist | assigned read | assigned read | V1’de yok |
| Designer | assigned limited read (creative context) | assigned limited read | V1’de yok |
| Client | own readonly summary | own readonly summary | yok |

## Backend Permission Strategy (V1 Baseline)

`server` RBAC tarafında Faz 1/Faz 3 için önerilen minimum slug seti:

- `googleAds.config.read.any`
- `googleAds.config.manage.any`
- `googleAds.config.read.assigned`
- `googleAds.config.read.own`
- `googleAds.reporting.read.any`
- `googleAds.reporting.read.assigned`
- `googleAds.sync.run.any`
- `googleAds.sync.read.assigned`

Faz 6+ genişleme slugları (employee workspace / approvals):

- `googleAds.notes.manage.assigned`
- `googleAds.approvals.create.assigned`
- `googleAds.recommendations.manage.assigned`

## Client Panel Mock -> API Eşleme

`clientPanel/src/app/pages/services/google-ads-dashboard.tsx` içindeki ana bloklar için V1 API karşılığı:

- KPI kartları: account/campaign aggregate metrics
- Kampanya kartları: campaign + metrics
- Keyword/search term blokları: `keyword_view` + `search_term_view`
- Trend chart: `segments.date` serisi
- Conversion tracking bloğu: conversion action/summary read
- Client action paneli: Faz 7+ approval/task entegrasyonu

## Faz 1 İçin Net Teknik Kararlar

1. `GOOGLE_ADS` service key mevcut mimariyle devam edecek.
2. Google Ads domain’i Meta Ads pattern’ine paralel ayrı modül olacak (`server/src/google-ads/`).
3. V1 read-first gidecek; mutate operasyonları Faz 2+.
4. Client endpointleri own-scope olacak (`currentUser.clientProfileId` resolve).
5. Employee görünürlüğü assignment + active purchased service kontrolüyle sınırlandırılacak.
6. Google Ads API çağrıları için manager account + `login-customer-id` standardı zorunlu olacak.
7. Query contract GAQL + finite date range + field compatibility kurallarıyla sabitlenecek.
8. Quota ve rate-limit handling Faz 1’den itibaren normalize error catalog ile başlayacak.

## Faz 1’e Giriş Kriteri (Go/No-Go)

- [x] Official docs alignment tamamlandı.
- [x] V1 read-first scope net.
- [x] API resource + field contract net.
- [x] Access model + OAuth/token stratejisi net.
- [x] Role-scope matrisi net.
- [x] Repo mimarisiyle çelişen karar yok.

## Faz 1 için implementation contract hazır mı?

**Evet, hazır.**
