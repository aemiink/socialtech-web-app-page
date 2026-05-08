<!-- docs/amazon-ads-phases/00-amazon-ads-discovery-contract.md -->

# FAZ 0 — Amazon Ads Discovery, Official Docs ve Technical Contract

## Amaç

Amazon Ads panelini geliştirmeye başlamadan önce official Amazon Ads API dokümantasyonuna göre teknik contract’ı netleştirmek.

Bu fazda kod yazımı minimum olmalı. Ana hedef:

- Amazon Ads için hangi veriler çekilecek?
- Hangi Amazon Ads API endpointleri / report tipleri kullanılacak?
- OAuth 2.0, profileId, marketplaceId ve advertiser/account yapısı nasıl kurulacak?
- Müşteri bazlı Amazon Ads yapılandırması nasıl tutulacak?
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
- Amazon Ads service key mevcut değilse `AMAZON_ADS` purchased service olarak eklenmeli.
- Admin/Employee Panel RTK Query mimarisi var.
- Platform integrations Meta/TikTok/Amazon Ads roadmap’te planned.

## İncelenecek Resmi Kaynaklar

Codex implementation öncesinde resmi Amazon Ads kaynaklarını incele:

- Amazon Ads API Overview
- Amazon Ads API Authorization
- OAuth 2.0 authorization grant
- Profiles / Advertiser account model
- Sponsored Products
- Sponsored Brands
- Sponsored Display
- Reporting v3
- Portfolios
- Product targeting
- Keywords
- Search terms
- Campaigns, ad groups, ads, targets
- API rate limits, report status ve error handling

## Amazon Ads API Temel Kavramları

Amazon Ads API için temel kavramlar:

- OAuth 2.0 delegated authorization
- profileId
- marketplaceId
- region
- advertiser / seller / vendor profile
- Sponsored Products
- Sponsored Brands
- Sponsored Display
- ASIN / SKU / marketplace
- ACOS / ROAS / sales / orders / spend

## İncelenecek Amazon Ads Alanları

### Profile / Account

- profile id
- account type
- country code
- currency code
- timezone, erişilebiliyorsa
- marketplace id
- advertiser id / seller/vendor context

### Sponsored Products

- campaign id
- campaign name
- campaign status
- targeting type
- budget
- ad group id/name
- keyword / target
- advertised ASIN / SKU
- metrics

### Sponsored Brands

- campaign id
- campaign name
- brand entity
- creative
- landing page / store
- keywords / targets
- metrics

### Sponsored Display

- campaign id
- campaign name
- tactic
- audience / product targeting
- creative
- metrics

### Metrics

Minimum V1 metrikleri:

- spend
- impressions
- clicks
- CTR
- CPC
- sales
- orders
- units sold
- conversion rate
- ACOS
- ROAS
- attributed sales, API report tipine göre
- attributed conversions, API report tipine göre

## Çıktılar

Bu fazın sonunda şu contract net olmalı:

- Amazon Ads için kullanılacak official endpoint/report listesi.
- Minimum authorization ve OAuth stratejisi.
- `profileId`, `marketplaceId`, `region` kullanım standardı.
- Veri modelinin V1 kapsamı.
- Client create/edit sırasında alınacak Amazon Ads bilgileri.
- Client Panel’de korunacak mock tasarım alanlarının API karşılığı.
- Admin/Employee/Client role-scope matrisi.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu fazda ana hedef kod yazmak değil, Amazon Ads entegrasyonu için official docs ve mevcut repo mimarisi üzerinden teknik contract çıkarmaktır.

Şunları yap:

1. Mevcut `server/`, `adminandemployeePanel/`, `clientPanel/` yapısını incele.
2. `ClientPurchasedService`, `Project.serviceKey`, auth/RBAC, RTK Query ve clientPanel service selection akışını kontrol et.
3. Amazon Ads için kullanılacak official Amazon Ads API kaynaklarını incele.
4. Amazon Ads için V1 data contract önerisini çıkar.
5. Admin, employee ve client için role-scope matrisi oluştur.
6. OAuth/profile/marketplace/region stratejisini V1 ve V2 olarak ayır.
7. Faz 1 implementation için net teknik kararları yaz.
8. Shared memory güncellemesi gerekiyorsa yalnızca ilgili notları ekle.

## Kabul Kriterleri

- Official docs referansları okunmuş ve kararlar netleştirilmiş.
- V1 read-only reporting mi yoksa campaign management mı yapılacak net.
- Amazon Ads panel data contract tanımlı.
- OAuth/profile/marketplace stratejisi net.
- Mevcut repo mimarisiyle çelişen karar yok.
- Final response’ta “Faz 1 için implementation contract hazır mı?” sorusuna net cevap ver.