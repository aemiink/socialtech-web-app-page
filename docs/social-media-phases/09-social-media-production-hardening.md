<!-- docs/social-media-phases/09-social-media-production-hardening.md -->

# FAZ 9 — Final Production Hardening ve Visual QA

## Amaç

Social Media Panel’in production öncesi güvenlik, yetkilendirme, performans ve görsel kalite kontrollerini yapmak.

## Security Kontrolleri

- Client sadece kendi Social Media verisini görür.
- Employee sadece assigned Social Media clientlarını görür.
- Admin global data görür.
- Internal draft posts client’a sızmaz.
- Internal creative files client’a sızmaz.
- Internal notes client’a sızmaz.
- Out-of-scope safe 404/403.
- Approval/report/file visibility doğru çalışır.

## API Kontrolleri

- Summary contract stable.
- Post status flow stable.
- Content calendar stable.
- Empty/no data states stable.
- Pagination, gerekiyorsa.
- Date range validation.
- Published/scheduled status validation.
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
- Calendar layout doğru.
- Creative previews safe fallback ile çalışıyor.

## Tests

Backend:

- authz e2e
- Social Media config e2e
- post CRUD tests
- status transition tests
- client own-scope tests
- employee assigned-scope tests
- admin global-scope tests
- approvals visibility tests
- reports visibility tests
- insights visibility tests

Frontend:

- admin Social Media tests
- employee Social Media workspace tests
- client Social Media dashboard tests
- calendar tests
- approval tests
- reports tests
- insights tests
- error/empty state tests

## Visual QA

Kontrol edilecek ekranlar:

- Client Social Media dashboard
- Content calendar
- Post detail
- Creative gallery
- Approval popup
- Reports
- Performance
- Admin Social Media global page
- Admin Client Detail Social Media tab
- Employee Social Media workspace
- Empty data state
- Revision required state
- Mobile responsive panel

## Bundle / Performance

- Vite büyük chunk uyarıları varsa route-level lazy loading ve manualChunks değerlendir.
- Next.js’e geçme. Bu fazda framework migration yapılmayacak.
- Calendar-heavy Social Media components lazy import edilebilir.
- Creative/video-heavy components lazy import edilebilir.
- Social Media client panel tabları lazy query/component olabilir.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev production hardening görevidir.

Şunları yap:

1. Social Media backend authz ve visibility audit yap.
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