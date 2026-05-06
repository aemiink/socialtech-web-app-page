<!-- docs/growth-hub-phases/09-growth-hub-production-hardening.md -->

# FAZ 9 — Final Production Hardening ve Visual QA

## Amaç

Growth & Hub panelinin production öncesi güvenlik, yetkilendirme, performans ve görsel kalite kontrollerini yapmak.

## Security Kontrolleri

- Client sadece kendi Growth Hub verisini görür.
- Employee sadece assigned Growth Hub clientlarını görür.
- Admin global data görür.
- Internal actions/notes/recommendations client’a sızmaz.
- Out-of-scope safe 404/403.
- Channel aggregation internal raw error sızdırmaz.
- Reports/approvals/files client-visible filtering doğru çalışır.

## API Kontrolleri

- Summary contract stable.
- Channel aggregation stable.
- Empty/no data states stable.
- Pagination, gerekiyorsa.
- Date range validation.
- Data freshness indicator.
- Recommendation generation idempotent veya güvenli.
- Report/approval integration doğru.

## Frontend Kontrolleri

- Mock fallback yok.
- Loading/error/empty state.
- Responsive layout.
- Existing mock tasarım korunmuş.
- Client-facing copy sade.
- Admin/employee copy operasyonel.
- Role-specific action visibility doğru.
- Approval/status badges doğru.
- Last updated indicators doğru.
- Service detail navigation doğru.

## Tests

Backend:

- authz e2e
- Growth Hub config e2e
- summary own-scope tests
- employee assigned-scope tests
- admin global-scope tests
- actions visibility tests
- weekly notes visibility tests
- reports visibility tests
- recommendations visibility tests
- approval tests

Frontend:

- admin Growth Hub tests
- employee Growth Hub workspace tests
- client Growth Hub dashboard tests
- actions tests
- reports tests
- recommendations tests
- error/empty state tests

## Visual QA

Kontrol edilecek ekranlar:

- Client Growth Hub dashboard
- Channel summary cards
- Weekly actions
- Agency comment
- Pending approvals
- Reports
- Recommendations
- Admin Growth Hub global page
- Admin Client Detail Growth Hub tab
- Employee Growth Hub workspace
- Empty data state
- Risk state
- Mobile responsive panel

## Bundle / Performance

- Vite büyük chunk uyarıları varsa route-level lazy loading ve manualChunks değerlendir.
- Next.js’e geçme. Bu fazda framework migration yapılmayacak.
- Chart-heavy Growth Hub components lazy import edilebilir.
- Growth Hub client panel tabları lazy query/component olabilir.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev production hardening görevidir.

Şunları yap:

1. Growth Hub backend authz ve visibility audit yap.
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
- Mock fallback yok.
- Internal data client’a sızmaz.
- Production env/shared memory notları hazır.
- Kalan riskler açıkça listelenir.