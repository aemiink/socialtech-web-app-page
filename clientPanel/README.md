# Social Tech Client Panel

Bu klasor, Social Tech musterileri icin hazirlanan ozel client visibility panelidir.

Panel public SaaS urunu degildir. Amaci musterinin satin aldigi Social Tech hizmetlerini, raporlari, onaylari, toplantilari, faturalari, ajans yorumlarini ve kendisinden beklenen aksiyonlari tek arayuzde goruntulemesidir.

## Komutlar

```bash
npm install
npm run dev
npm run build
```

## Ana Dosyalar

- `src/main.tsx`: React root render.
- `src/app/App.tsx`: Secili servis ve secili sekme state yonetimi.
- `src/app/components/sidebar.tsx`: Servise ozel sidebar.
- `src/app/components/topbar.tsx`: Secili servis bilgisi.
- `src/app/pages/service-selection.tsx`: 13 aktif hizmet secim ekrani.
- `src/app/pages/service-tab-page.tsx`: Sekmelere gore farkli dashboard workspace'leri.
- `src/app/data/service-pages.ts`: Servis ve sekme icerik verileri.
- `src/app/lib/client-actions.ts`: Buton aksiyonlari ve local action history.
- `src/app/components/client-action-center.tsx`: Islem merkezi ve bildirimler.

## Aktif Servisler

- Growth & Hub
- Sosyal Medya Yonetimi
- Medya Hub
- Meta ADS
- TikTok ADS
- Google ADS
- Amazon ADS
- Web APP
- Mobil APP
- Landing Pages
- Web & Mobil Tasarimlar
- Teknik Destek
- SEO Denetimi

Ana repo dokumantasyonu icin root seviyedeki `../README.md` dosyasina bakiniz.
