<!-- docs/amazon-ads-phases/10-amazon-ads-production-hardening.md -->

# FAZ 10 — Final Production Hardening ve Visual QA

## Amaç

Amazon Ads panelinin production öncesi güvenlik, yetkilendirme, performans ve görsel kalite kontrollerini yapmak.

## Security Kontrolleri

- Refresh token response’ta yok.
- Access token response’ta yok.
- Tokenlar encrypted.
- Logs token içermez.
- Client sadece kendi data’sını görür.
- Employee sadece assigned data görür.
- Admin global data görür.
- Out-of-scope safe 404/403.
- Amazon Ads API errors sensitive detay sızdırmaz.

## API Kontrolleri

- Amazon Ads errors normalize.
- Rate limit safe.
- Pagination.
- Date range validation.
- Report status validation.
- Async report request/download lifecycle.
- Data freshness indicator.
- Sync logs.
- Snapshot data consistency.
- Empty states için net response contract.

## Frontend Kontrolleri

- Mock fallback yok.
- Loading/error/empty state.
- Responsive layout.
- Existing mock tasarım korunmuş.
- Client-facing copy sade.
- Admin/employee copy operasyonel.
- Role-specific action visibility doğru.
- Approval/status badges doğru.
- Last sync indicators doğru.

## Tests

Backend:

- authz e2e
- amazon ads config e2e
- token safety tests
- sync error tests
- client own-scope tests
- employee assigned-scope tests
- admin global-scope tests
- report visibility tests
- approval tests

Frontend:

- admin config tests
- admin global Amazon Ads page tests
- employee workspace tests
- client dashboard tests
- approval tests
- report tests
- error/empty state tests

## Visual QA

Kontrol edilecek ekranlar:

- Admin Amazon Ads global page
- Admin Client Detail Amazon Ads tab
- Client Amazon Ads dashboard
- Sponsored Products tab
- Sponsored Brands tab
- Sponsored Display tab
- Campaign list
- Product/ASIN tab
- Search terms tab
- Budget approval popup
- Product promotion approval popup
- Sync error state
- Report pending state
- Empty connection state
- Mobile responsive panel

## Bundle / Performance

- Vite büyük chunk uyarıları varsa route-level lazy loading ve manualChunks değerlendir.
- Next.js’e geçme. Bu fazda framework migration yapılmayacak.
- Chart-heavy Amazon Ads components lazy import edilebilir.
- Amazon Ads client panel tabları lazy query/component olabilir.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev production hardening görevidir.

Şunları yap:

1. Amazon Ads backend authz ve token safety audit yap.
2. Frontend scope/role visibility audit yap.
3. Mock fallback kalmış mı kontrol et.
4. Error/empty/loading state coverage tamamla.
5. Visual QA için kritik ekranları stabilize et.
6. Chunk uyarıları için yalnızca safe code-splitting uygula; framework migration yapma.
7. Tests genişlet.
8. Shared memory güncelle.

## Validation Komutları

Backend:

```bash
cd server
npm run prisma:generate
npm run prisma:seed
npm run build
npm run check
ALLOW_E2E_DB_RESET=true npm run test:e2e:authz
```

Admin/Employee Panel:

```bash
cd adminandemployeePanel
npm run build
npm run check
npm run test:run
```

Client Panel:

```bash
cd clientPanel
npm run build
npm run check
npm run test:run
```

## Kabul Kriterleri

- Build/check/test geçer.
- Client/employee/admin scope testleri geçer.
- Görsel tasarım mock’a sadık kalır.
- Token safety doğrulanır.
- Production env dokümanı veya shared memory notu hazır.
- Kalan riskler açıkça listelenir.