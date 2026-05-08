<!-- docs/meta-ads-phases/00-meta-ads-discovery-contract.md -->

# FAZ 0 — Meta Ads Discovery, Official Docs ve Technical Contract

## Amaç

Meta Ads panelini geliştirmeye başlamadan önce official Meta Graph API / Marketing API dokümantasyonuna göre teknik contract’ı netleştirmek.

Bu fazda kod yazımı minimum olmalı. Ana hedef:

- Meta Ads için hangi veriler çekilecek?
- Hangi Graph API / Marketing API endpointleri kullanılacak?
- Hangi permission/scope gerekir?
- Müşteri bazlı Meta Ads yapılandırması nasıl tutulacak?
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
- `clientPanel/src/app/pages/services/meta-ads-dashboard.tsx` mevcut.
- Admin/Employee Panel RTK Query mimarisi var.
- Platform integrations: Meta/TikTok/Amazon Ads roadmap’te planned.

## İncelenecek Resmi Kaynaklar

Codex implementation öncesinde resmi Meta kaynaklarını incele:

- Meta Marketing API Overview
- Ads Insights API
- Marketing API Authorization
- Permissions Reference
- Facebook Login for Business
- Business Manager / Ad Account access model
- App Review ve permission gereksinimleri

## İncelenecek Graph API Alanları

### Ad Account

- Ad Account ID
- Business ID
- Currency
- Timezone
- Account status
- Account name
- Funding/spend info, izin veriliyorsa

### Campaign

- campaign id
- name
- objective
- status
- effective_status
- start_time / stop_time
- buying_type
- budget summary

### Ad Set

- adset id
- campaign id
- name
- optimization_goal
- billing_event
- daily_budget / lifetime_budget
- targeting summary
- status
- effective_status

### Ad

- ad id
- adset id
- campaign id
- name
- status
- creative id
- preview link / thumbnail, mümkünse

### Insights

Minimum V1 metrikleri:

- impressions
- reach
- spend
- clicks
- cpc
- cpm
- ctr
- frequency
- results / actions
- cost_per_result / cost_per_action_type
- leads / purchases / messages, campaign objective’e göre
- ROAS, purchase value varsa

## Çıktılar

Bu fazın sonunda şu contract net olmalı:

- Meta Ads için kullanılacak endpoint listesi.
- Minimum permission listesi.
- Token stratejisi.
- Veri modelinin V1 kapsamı.
- Client create/edit sırasında alınacak Meta Ads bilgileri.
- Client Panel’de korunacak mock tasarım alanlarının API karşılığı.
- Admin/Employee/Client role-scope matrisi.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu fazda ana hedef kod yazmak değil, Meta Ads entegrasyonu için official docs ve mevcut repo mimarisi üzerinden teknik contract çıkarmaktır.

Şunları yap:

1. Mevcut `server/`, `adminandemployeePanel/`, `clientPanel/` yapısını incele.
2. `ClientPurchasedService`, `Project.serviceKey`, auth/RBAC, RTK Query ve clientPanel service selection akışını kontrol et.
3. Meta Ads için kullanılacak official Meta Marketing API / Graph API kaynaklarını incele.
4. Meta Ads için V1 data contract önerisini çıkar.
5. Admin, employee ve client için role-scope matrisi oluştur.
6. Token/auth stratejisini V1 ve V2 olarak ayır.
7. Faz 1 implementation için net teknik kararları yaz.
8. Shared memory güncellemesi gerekiyorsa yalnızca ilgili notları ekle.

## Kabul Kriterleri

- Official docs referansları okunmuş ve kararlar netleştirilmiş.
- V1 read-only reporting mi yoksa campaign management mı yapılacak net.
- Meta Ads panel data contract tanımlı.
- Sensitive token stratejisi net.
- Mevcut repo mimarisiyle çelişen karar yok.
- Final response’ta “Faz 1 için implementation contract hazır mı?” sorusuna net cevap ver.