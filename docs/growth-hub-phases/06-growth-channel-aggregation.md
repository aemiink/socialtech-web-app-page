<!-- docs/growth-hub-phases/06-growth-channel-aggregation.md -->

# FAZ 6 — Growth Channel Aggregation Layer

## Amaç

Growth Hub’ın farklı service/platform kanallarından gelen özetleri tek bir stratejik büyüme görünümünde toplamasını sağlamak.

Bu faz Growth Hub’ın gerçek değerini oluşturur.

## Kaynak Kanallar

Growth Hub şu servisleri özetleyebilmelidir:

- META_ADS
- GOOGLE_ADS
- TIKTOK_ADS
- AMAZON_ADS
- SOCIAL_MEDIA
- MEDIA_HUB
- WEB_APP
- MOBILE_APP
- LANDING_PAGE
- SEO_AUDIT
- TECHNICAL_SUPPORT

## Veri Kaynakları

Platform modülü hazırsa:

- Meta Ads summary
- Google Ads summary
- TikTok Ads summary
- Amazon Ads summary

Platform modülü hazır değilse:

- purchased service active mi?
- config var mı?
- project var mı?
- open task var mı?
- pending approval var mı?
- report var mı?
- delivery progress var mı?

Mock data yok.

## Backend Aggregation Service

Yeni veya mevcut summary service içinde:

```text
GrowthHubChannelAggregationService
```

Her kanal için ortak response contract:

```ts
{
  serviceKey: string;
  label: string;
  status: "ACTIVE" | "WAITING_CONFIG" | "NO_DATA" | "RISK" | "OPTIMIZE" | "SCALE";
  healthScore?: number;
  primaryMetricLabel?: string;
  primaryMetricValue?: number;
  secondaryMetricLabel?: string;
  secondaryMetricValue?: number;
  spend?: number;
  leads?: number;
  conversions?: number;
  revenue?: number;
  roas?: number;
  cpa?: number;
  progressPercent?: number;
  pendingApprovals?: number;
  openTasks?: number;
  lastUpdatedAt?: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}
```

## Channel Status Rules

Örnek kurallar:

- Purchased service yoksa Growth Hub channel listesinde gösterme.
- Purchased service var ama config/project yoksa `WAITING_CONFIG`.
- Data yoksa `NO_DATA`.
- Pending approval fazla ise `RISK`.
- ROAS/CPA target altındaysa `OPTIMIZE`.
- Target üstündeyse `SCALE`.
- Task/progress gecikmesi varsa `RISK`.

## Client Panel

Growth Hub > Kanallar bölümünde:

- Kanal kartları
- Health/risk badge
- Primary metrics
- Pending approvals
- Open tasks
- “Detaya Git” butonu

Detaya Git:

- META_ADS → Meta Ads paneli
- GOOGLE_ADS → Google Ads paneli
- TIKTOK_ADS → TikTok Ads paneli
- AMAZON_ADS → Amazon Ads paneli
- WEB_APP → Web App paneli
- SEO_AUDIT → SEO paneli / empty state
- SOCIAL_MEDIA → Social Media paneli / empty state

## Admin/Employee Panel

Growth Hub workspace içinde:

- kanal özetleri
- riskli kanallar
- optimize/scale önerileri
- service detail route links

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Growth Hub channel aggregation service oluştur.
2. Purchased services + project/serviceKey + tasks/approvals/reports + platform summaries kaynaklarını bağla.
3. Platform modülü yoksa mock üretme; status/empty state üret.
4. Client summary/channels endpointini aggregation service ile güncelle.
5. Admin/employee Growth Hub workspace channel cards ekle.
6. Client Panel Growth Hub channel section API-driven hale getir.
7. Tests ekle.
8. Shared memory güncelle.

## Testler

Backend:

- Purchased service olmayan kanal gösterilmez.
- Purchased service var config yoksa WAITING_CONFIG.
- Project/task/approval source doğru sayılır.
- Platform summary varsa metricler gelir.
- Client own scope enforced.
- Employee assigned scope enforced.

Frontend:

- Channel cards render.
- Risk badge render.
- Waiting config state render.
- No data state render.
- Detaya git doğru service dashboard’a gider.
- Mock fallback yok.

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

- Growth Hub kanal özetleri gerçek kaynaklardan gelir.
- Platform modülü eksikse doğru empty/status state gösterilir.
- Client ve employee scope korunur.
- Testler geçer.