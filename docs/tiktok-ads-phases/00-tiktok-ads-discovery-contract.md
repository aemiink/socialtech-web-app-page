<!-- docs/tiktok-ads-phases/00-tiktok-ads-discovery-contract.md -->

# FAZ 0 — TikTok Ads Discovery, Official Docs ve Technical Contract

## Amaç

TikTok Ads panelini geliştirmeye başlamadan önce official TikTok API for Business / Marketing API dokümantasyonuna göre teknik contract’ı netleştirmek.

Bu fazda kod yazımı minimum olmalı. Ana hedef:

- TikTok Ads için hangi veriler çekilecek?
- Hangi TikTok Business API endpointleri kullanılacak?
- OAuth / access token / advertiser ID yapısı nasıl kurulacak?
- Müşteri bazlı TikTok Ads yapılandırması nasıl tutulacak?
- Admin, employee ve client hangi veriyi görecek?
- Mevcut mock tasarım hangi backend contract’a bağlanacak?

## Mevcut Repo Bağlamı

Mevcut sistemde:

- `server/` NestJS + Prisma + RBAC backend.
- `adminandemployeePanel/` Admin Panel + Employee Panel.
- `clientPanel/` müşteri portalı.
- `ClientPurchasedService` modeli var.
- Client Portal yalnızca satın alınmış ACTIVE hizmetleri gösteriyor.
- `Project.serviceKey` var.
- TikTok Ads service key mevcut değilse `TIKTOK_ADS` purchased service olarak eklenmeli.
- Admin/Employee Panel RTK Query mimarisi var.
- Platform integrations Meta/TikTok/Amazon Ads roadmap’te planned.

## İncelenecek Resmi Kaynaklar

Codex implementation öncesinde resmi TikTok kaynaklarını incele:

- TikTok API for Business Overview
- TikTok Marketing API / Business API docs
- Authentication / authorization guide
- Advertiser account model
- Campaign endpoints
- Ad group endpoints
- Ad endpoints
- Creative/material endpoints
- Reporting API
- Async report task endpoints
- Pixel / Events / measurement endpoints
- Rate limits, pagination ve error handling

## TikTok Ads API Temel Kavramları

TikTok Ads API için temel kavramlar:

- advertiser_id
- business_center_id, varsa
- app_id / secret
- access_token
- refresh_token, OAuth flow destekleniyorsa
- campaign
- ad group
- ad
- creative / material
- pixel / event
- report dimensions / metrics
- async report task

## İncelenecek TikTok Ads Alanları

### Advertiser / Account

- advertiser id
- advertiser name
- currency
- timezone
- account status
- business center ilişkisi
- balance/spend info, erişilebiliyorsa

### Campaign

- campaign id
- campaign name
- objective
- status
- budget mode
- budget
- create/update time

### Ad Group

- adgroup id
- campaign id
- name
- placement
- optimization goal
- bid strategy
- budget
- schedule
- targeting summary
- status

### Ads / Creatives

- ad id
- ad group id
- campaign id
- ad name
- status
- creative id / material id
- video/image data, erişilebiliyorsa
- landing page / call to action

### Pixel / Events

- pixel id
- event status
- events
- last event time, erişilebiliyorsa
- event match quality, API destekliyorsa

### Metrics

Minimum V1 metrikleri:

- spend
- impressions
- clicks
- reach, varsa
- CTR
- CPC
- CPM
- conversions
- cost per conversion
- conversion rate
- video views
- 2s / 6s video views, API metric desteğine göre
- video view rate
- complete payment / purchase, campaign setup’a göre
- value / ROAS, varsa

## Çıktılar

Bu fazın sonunda şu contract net olmalı:

- TikTok Ads için kullanılacak official endpoint listesi.
- Minimum authorization ve OAuth/token stratejisi.
- `advertiserId`, `businessCenterId`, `pixelId` kullanım standardı.
- Veri modelinin V1 kapsamı.
- Client create/edit sırasında alınacak TikTok Ads bilgileri.
- Client Panel’de korunacak mock tasarım alanlarının API karşılığı.
- Admin/Employee/Client role-scope matrisi.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu fazda ana hedef kod yazmak değil, TikTok Ads entegrasyonu için official docs ve mevcut repo mimarisi üzerinden teknik contract çıkarmaktır.

Şunları yap:

1. Mevcut `server/`, `adminandemployeePanel/`, `clientPanel/` yapısını incele.
2. `ClientPurchasedService`, `Project.serviceKey`, auth/RBAC, RTK Query ve clientPanel service selection akışını kontrol et.
3. TikTok Ads için kullanılacak official TikTok API for Business kaynaklarını incele.
4. TikTok Ads için V1 data contract önerisini çıkar.
5. Admin, employee ve client için role-scope matrisi oluştur.
6. OAuth/access token/advertiserId stratejisini V1 ve V2 olarak ayır.
7. Faz 1 implementation için net teknik kararları yaz.
8. Shared memory güncellemesi gerekiyorsa yalnızca ilgili notları ekle.

## Kabul Kriterleri

- Official docs referansları okunmuş ve kararlar netleştirilmiş.
- V1 read-only reporting mi yoksa campaign management mı yapılacak net.
- TikTok Ads panel data contract tanımlı.
- OAuth/token/advertiserId stratejisi net.
- Mevcut repo mimarisiyle çelişen karar yok.
- Final response’ta “Faz 1 için implementation contract hazır mı?” sorusuna net cevap ver.