<!-- docs/google-ads-phases/00-google-ads-discovery-contract.md -->

# FAZ 0 — Google Ads Discovery, Official Docs ve Technical Contract

## Amaç

Google Ads panelini geliştirmeye başlamadan önce official Google Ads API dokümantasyonuna göre teknik contract’ı netleştirmek.

Bu fazda kod yazımı minimum olmalı. Ana hedef:

- Google Ads için hangi veriler çekilecek?
- Hangi Google Ads API servisleri kullanılacak?
- OAuth 2.0 + developer token + manager account yapısı nasıl kurulacak?
- Müşteri bazlı Google Ads yapılandırması nasıl tutulacak?
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
- Google Ads service key mevcut değilse `GOOGLE_ADS` purchased service olarak eklenmeli.
- Admin/Employee Panel RTK Query mimarisi var.
- Platform integrations: Meta/TikTok/Amazon Ads roadmap’te planned; Google Ads de aynı integration ailesine eklenecek.

## İncelenecek Resmi Kaynaklar

Codex implementation öncesinde resmi Google kaynaklarını incele:

- Google Ads API Overview
- OAuth 2.0 for Google Ads API
- Developer token
- Manager account / MCC access model
- Google Ads Query Language, GAQL
- Campaign, Ad Group, Ad, Asset, Customer, Metrics resources
- Conversion tracking
- Offline conversions / Enhanced conversions for leads
- API quotas, rate limits, error handling

## Google Ads API Temel Kavramları

Google Ads API çağrıları için şunlar gerekir:

- Developer token
- OAuth 2.0 credentials
- Manager account, çoğu agency yapısında
- Client customer ID, yani 10 haneli Google Ads müşteri hesabı ID’si
- Gerekirse login-customer-id header’ı, manager account üzerinden erişim için

## İncelenecek Google Ads Alanları

### Customer / Account

- customer id
- descriptive name
- currency code
- time zone
- account status
- manager account ilişkisi
- tracking setup

### Campaign

- campaign id
- name
- advertising channel type
- status
- serving status
- bidding strategy
- budget
- start date / end date

### Ad Group

- ad group id
- campaign id
- name
- status
- type
- cpc / bidding fields

### Ads

- ad id
- ad group id
- campaign id
- status
- type
- final urls
- responsive search ad fields
- asset references, mümkünse

### Metrics

Minimum V1 metrikleri:

- impressions
- clicks
- cost micros
- conversions
- conversion value
- ctr
- average cpc
- cost per conversion
- search impression share, erişilebiliyorsa
- video views, YouTube campaign varsa
- interactions
- engagement rate, campaign type’a göre

## Çıktılar

Bu fazın sonunda şu contract net olmalı:

- Google Ads için kullanılacak API servisleri.
- GAQL query contract.
- Minimum permission/auth stratejisi.
- Developer token ve OAuth stratejisi.
- Client create/edit sırasında alınacak Google Ads bilgileri.
- Client Panel’de korunacak mock tasarım alanlarının API karşılığı.
- Admin/Employee/Client role-scope matrisi.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu fazda ana hedef kod yazmak değil, Google Ads entegrasyonu için official docs ve mevcut repo mimarisi üzerinden teknik contract çıkarmaktır.

Şunları yap:

1. Mevcut `server/`, `adminandemployeePanel/`, `clientPanel/` yapısını incele.
2. `ClientPurchasedService`, `Project.serviceKey`, auth/RBAC, RTK Query ve clientPanel service selection akışını kontrol et.
3. Google Ads için kullanılacak official Google Ads API kaynaklarını incele.
4. Google Ads için V1 data contract önerisini çıkar.
5. Admin, employee ve client için role-scope matrisi oluştur.
6. OAuth/developer token/manager account stratejisini V1 ve V2 olarak ayır.
7. Faz 1 implementation için net teknik kararları yaz.
8. Shared memory güncellemesi gerekiyorsa yalnızca ilgili notları ekle.

## Kabul Kriterleri

- Official docs referansları okunmuş ve kararlar netleştirilmiş.
- V1 read-only reporting mi yoksa campaign management mı yapılacak net.
- Google Ads panel data contract tanımlı.
- Developer token + OAuth stratejisi net.
- Mevcut repo mimarisiyle çelişen karar yok.
- Final response’ta “Faz 1 için implementation contract hazır mı?” sorusuna net cevap ver.