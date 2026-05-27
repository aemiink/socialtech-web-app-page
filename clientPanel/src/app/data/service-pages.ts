export type ServiceId =
  | 'growth-hub'
  | 'social-media'
  | 'media-hub'
  | 'meta-ads'
  | 'tiktok-ads'
  | 'google-ads'
  | 'amazon-ads'
  | 'web-app'
  | 'mobile-app'
  | 'landing-pages'
  | 'web-mobile-design'
  | 'technical-support'
  | 'seo-audit';

export interface ServiceTabContent {
  serviceName: string;
  title: string;
  description: string;
  kpis: { label: string; value: string; note: string }[];
  sections: { title: string; description: string; items: string[] }[];
  table: { columns: string[]; rows: string[][] };
  timeline: string[];
  agencyComment: string;
  clientActions: string[];
}

interface ServiceProfile {
  name: string;
  summary: string;
  kpis: { label: string; value: string; note: string }[];
  agencyComment: string;
  actions: string[];
  activity: string[];
  tabs: Record<string, { title: string; description: string; focus: string[]; table?: string[][] }>;
}

export const serviceLabels: Record<ServiceId, string> = {
  'growth-hub': 'Growth & Hub',
  'social-media': 'Sosyal Medya Yönetimi',
  'media-hub': 'Medya Hub',
  'meta-ads': 'Meta ADS',
  'tiktok-ads': 'TikTok ADS',
  'google-ads': 'Google ADS',
  'amazon-ads': 'Amazon ADS',
  'web-app': 'Web APP',
  'mobile-app': 'Mobil APP',
  'landing-pages': 'Landing Pages',
  'web-mobile-design': 'Web & Mobil Tasarımlar',
  'technical-support': 'Teknik Destek',
  'seo-audit': 'SEO Denetimi',
};

const profiles: Record<ServiceId, ServiceProfile> = {
  'growth-hub': {
    name: serviceLabels['growth-hub'],
    summary: 'Kanallar, kampanyalar, içerik onayları ve haftalık growth aksiyonları tek ekranda izlenir.',
    kpis: [
      { label: 'Growth Sağlığı', value: '92%', note: 'kanallar dengeli ilerliyor' },
      { label: 'Toplam Lead', value: '247', note: '+18% haftalık artış' },
      { label: 'Blended ROAS', value: '4.2x', note: 'hedefin üzerinde' },
      { label: 'Bekleyen Onay', value: '3', note: 'içerik/kreatif' },
    ],
    agencyComment: 'Büyüme sistemi sağlıklı çalışıyor. Meta ve Google tarafı güçlü, sosyal medya içerikleri lead kalitesini destekliyor. Bu hafta ana odağımız kreatif yorgunluğunu azaltıp dönüşüm oranını korumak.',
    actions: ['Yeni kreatif setini onaylayın', 'Haftalık aksiyon planını inceleyin', 'Landing page önerilerine geri bildirim verin'],
    activity: ['Meta bütçe dağılımı optimize edildi', '3 içerik onay ekranına taşındı', 'Haftalık growth raporu yayınlandı'],
    tabs: {
      'growth-summary': {
        title: 'Growth Özeti',
        description: 'Genel büyüme sağlığı, kanal katkıları, riskler ve önerilen aksiyonlar.',
        focus: ['Overall growth health', 'Channel contribution cards', 'This week’s progress', 'Growth risks', 'Next recommended actions'],
        table: [['Meta Ads', '147 lead', '4.8x ROAS', 'Scale'], ['Google Ads', '89 dönüşüm', '3.9x ROAS', 'Optimize'], ['Sosyal Medya', '+342 takipçi', '%8.4 etkileşim', 'Grow']],
      },
      channels: {
        title: 'Kanallar',
        description: 'Meta, Google, sosyal medya ve website dönüşüm statüsünün karşılaştırmalı görünümü.',
        focus: ['Meta Ads performance', 'Google Ads performance', 'Social Media performance', 'Website conversion status', 'Channel comparison'],
        table: [['Meta Ads', '₺18.000', '147 lead', '4.8x'], ['Google Ads', '₺12.000', '89 dönüşüm', '3.9x'], ['Website', '12.4K ziyaret', '%3.2 CVR', 'İyileşiyor']],
      },
      campaigns: {
        title: 'Kampanyalar',
        description: 'Aktif kampanyalar, bütçe kullanımı ve optimizasyon notları.',
        focus: ['Active campaigns', 'Budget and performance', 'Optimization notes', 'Kreatif yorgunluğu takibi', 'Sonraki bütçe önerisi'],
        table: [['Retargeting Lead', '₺8.400', '6.1x ROAS', 'Scale'], ['Cold Audience Test', '₺6.200', '₺122 CPA', 'Optimize'], ['Reels Traffic', '₺3.900', '%2.7 CTR', 'Watch']],
      },
      'content-approvals': {
        title: 'İçerik Onayları',
        description: 'Onay bekleyen içerikler, caption önizlemeleri ve hedef platformlar.',
        focus: ['Pending approval cards', 'Caption preview', 'Platform', 'Objective', 'Approve / Request Revision buttons'],
        table: [['Reels ürün tanıtımı', 'Instagram', 'Lead kalite', 'Onay bekliyor'], ['Story kampanya duyurusu', 'Instagram', 'Trafik', 'Revizyon notu bekliyor'], ['Carousel güven unsuru', 'Facebook', 'Retargeting', 'Onay bekliyor']],
      },
      'weekly-actions': {
        title: 'Haftalık Aksiyonlar',
        description: 'Tamamlanan işler, devam eden işler, müşteri bekleyenleri ve gelecek hafta planı.',
        focus: ['Completed actions', 'In-progress actions', 'Waiting for client', 'Next week plan', 'Risk azaltma adımları'],
        table: [['Tamamlandı', 'Kampanya optimizasyonu', '3 aksiyon', 'Kapandı'], ['Devam ediyor', 'Kreatif testleri', '2 aksiyon', 'Takipte'], ['Sizden beklenen', 'Varlık onayı', '1 aksiyon', 'Bekliyor']],
      },
    },
  },
  'social-media': {
    name: serviceLabels['social-media'],
    summary: 'İçerik planlama, onay süreçleri, yayınlanan içerikler, DM/yorum yönetimi ve trend fırsatları izlenir.',
    kpis: [
      { label: 'Planlanan İçerik', value: '24', note: 'bu ay' },
      { label: 'Onay Bekleyen', value: '5', note: 'caption/görsel' },
      { label: 'Yanıtlanan DM', value: '186', note: 'bu hafta' },
      { label: 'Etkileşim', value: '%8.4', note: '+1.2 puan' },
    ],
    agencyComment: 'İçerik ritmi sağlıklı. Reels formatı erişimi artırıyor; DM tarafında sık sorulan soruların otomasyona bağlanması yanıt hızını güçlendirecek.',
    actions: ['Onay bekleyen içerikleri inceleyin', 'Trend önerilerinden uygun olanları seçin', 'DM ton notlarını kontrol edin'],
    activity: ['Haftalık içerik takvimi güncellendi', '14 yorum yanıtlandı', 'Rakip içerik fırsatları eklendi'],
    tabs: {
      'content-calendar': {
        title: 'İçerik Takvimi',
        description: 'Haftalık ve aylık içerik planı; Story, Reels ve Post kırılımı.',
        focus: ['Weekly/monthly content calendar', 'Scheduled posts', 'Story/Reels/Post labels', 'Yayın saatleri', 'Kampanya günleri'],
        table: [['Pazartesi', 'Reels', 'Ürün faydası', 'Planlandı'], ['Çarşamba', 'Story', 'Soru-cevap', 'Planlandı'], ['Cuma', 'Post', 'Sosyal kanıt', 'Onayda']],
      },
      'pending-approvals': {
        title: 'Onay Bekleyenler',
        description: 'Görsel önizleme, caption, amaç ve platform bazlı onay akışı.',
        focus: ['Pending approval list', 'Visual preview', 'Caption', 'Objective', 'Approve / Request Revision / Comment'],
        table: [['Reels hook testi', 'Instagram', 'Erişim', 'Onay bekliyor'], ['Carousel referans', 'LinkedIn', 'Güven', 'Yorum bekliyor'], ['Story anket', 'Instagram', 'Etkileşim', 'Onay bekliyor']],
      },
      'published-content': {
        title: 'Yayınlanan İçerikler',
        description: 'Yayınlanan içeriklerin erişim, etkileşim ve en iyi performans görünümü.',
        focus: ['Published content grid', 'Reach', 'Engagement', 'Best performing content', 'Format kırılımı'],
        table: [['Reels: Önce/Sonra', '38K erişim', '%9.1 etkileşim', 'En iyi'], ['Story: Anket', '7K erişim', '%14 tıklama', 'Güçlü'], ['Post: Referans', '12K erişim', '%6.7 etkileşim', 'Stabil']],
      },
      'dm-comments': {
        title: 'DM & Yorumlar',
        description: 'Yanıtlanan mesajlar, bekleyen dönüşler ve marka tonu notları.',
        focus: ['Messages replied', 'Comments replied', 'Pending replies', 'FAQ summary', 'Response tone notes'],
        table: [['DM', '186 yanıt', '12 bekleyen', 'Ürün fiyatı sık soruldu'], ['Yorum', '74 yanıt', '4 bekleyen', 'Teslimat sorusu önde'], ['FAQ', '9 konu', 'Güncel', 'Ton: sıcak ve net']],
      },
      'competitor-analysis': {
        title: 'Rakip Analizi',
        description: 'Rakip aktivite kartları, fırsat notları ve içerik boşlukları.',
        focus: ['Competitor list', 'Competitor activity cards', 'Opportunity notes', 'Format kıyaslama', 'Konumlandırma önerisi'],
        table: [['Rakip A', 'Reels yoğun', 'Yüksek yorum', 'UGC fırsatı'], ['Rakip B', 'Carousel', 'Orta etkileşim', 'Fiyat avantajı'], ['Rakip C', 'Story satış', 'Düşük kalite', 'Güven teması']],
      },
      'trend-notes': {
        title: 'Trend Notları',
        description: 'Güncel trendler, önerilen içerik fikirleri ve uygunluk skoru.',
        focus: ['Current trends', 'Recommended content ideas', 'Relevance score', 'Platform uyumu', 'Hızlı üretim notu'],
        table: [['Problem/Çözüm Reels', 'Yüksek', '9/10', 'Bu hafta üretilebilir'], ['Müşteri yorumu ekranı', 'Orta', '7/10', 'Varlık bekliyor'], ['Kamera arkası', 'Yüksek', '8/10', 'Hızlı çekim']],
      },
    },
  },
  'media-hub': {
    name: serviceLabels['media-hub'],
    summary: 'Meta, Google, TikTok ve Amazon kanallarını tek medya sistemi gibi görünür kılar.',
    kpis: [
      { label: 'Toplam Harcama', value: '₺42K', note: 'bu ay' },
      { label: 'Blended ROAS', value: '3.8x', note: 'kanal ortalaması' },
      { label: 'Blended CPA', value: '₺128', note: '-11% iyileşme' },
      { label: 'Aktif Test', value: '9', note: 'kreatif/kanal' },
    ],
    agencyComment: 'Medya karması dengeli. Meta ölçekleniyor, Google niyetli talep yakalıyor, TikTok keşif maliyetini düşürüyor. Amazon retail readiness stabil kaldığı sürece satış tarafı büyütülebilir.',
    actions: ['Bütçe kaydırma önerisini onaylayın', 'Zayıf kreatifleri yenilemek için varlık gönderin', 'Aylık medya raporunu inceleyin'],
    activity: ['Blended CPA güncellendi', 'TikTok kreatif testi başlatıldı', 'Amazon search term listesi temizlendi'],
    tabs: {
      'channel-performance': {
        title: 'Kanal Performansı',
        description: 'Meta, Google, TikTok ve Amazon performans kartları.',
        focus: ['Meta / Google / TikTok / Amazon performance cards', 'Total spend', 'Blended ROAS', 'Blended CPA', 'Kanal katkısı'],
        table: [['Meta', '₺18K', '4.8x', 'Scale'], ['Google', '₺12K', '3.9x', 'Optimize'], ['TikTok', '₺8K', '2.7x', 'Test'], ['Amazon', '₺4K', '18% ACOS', 'Keep']],
      },
      'budget-distribution': {
        title: 'Bütçe Dağılımı',
        description: 'Kanal bütçeleri, harcama/sonuç dengesi ve önerilen kaydırmalar.',
        focus: ['Budget allocation', 'Channel budget cards', 'Spend vs result', 'Suggested budget shift', 'Risk dengesi'],
        table: [['Meta', '%43', '147 lead', '+%10 önerilir'], ['Google', '%29', '89 dönüşüm', 'Sabit'], ['TikTok', '%19', '67 lead', 'Test sürsün'], ['Amazon', '%9', '₺22K satış', 'Sezon bekle']],
      },
      'funnel-structure': {
        title: 'Funnel Yapısı',
        description: 'Awareness, consideration ve conversion katmanlarının haritalanması.',
        focus: ['Awareness → Consideration → Conversion', 'Campaigns mapped to funnel stages', 'Drop-off points', 'Retargeting akışı', 'Lead kalitesi'],
        table: [['Awareness', 'TikTok + Reels', '284K görüntüleme', 'Güçlü'], ['Consideration', 'Meta carousel', '12K tıklama', 'İyileşiyor'], ['Conversion', 'Google Search', '89 dönüşüm', 'Stabil']],
      },
      'creative-tests': {
        title: 'Kreatif Testleri',
        description: 'Aktif kreatif testleri, kazanan/zayıf kreatif ve sonraki hipotezler.',
        focus: ['Active creative tests', 'Winning creative', 'Weak creative', 'Hypothesis', 'Next test recommendations'],
        table: [['UGC problem hook', 'Winner', '%3.8 CTR', 'Scale'], ['Ürün katalog', 'Weak', '%1.1 CTR', 'Yenile'], ['Sosyal kanıt', 'Testing', '%2.7 CTR', 'Devam']],
      },
      'meta-ads': { title: 'Meta ADS', description: 'Meta kanalının kısa performans detayı.', focus: ['KPI kartları', 'Active campaigns', 'Best asset', 'Optimization notes', 'Retargeting durumu'] },
      'google-ads': { title: 'Google ADS', description: 'Google kanalının kısa performans detayı.', focus: ['Search kampanyaları', 'Best keyword', 'Conversion status', 'Optimization notes', 'Landing page notları'] },
      'tiktok-ads': { title: 'TikTok ADS', description: 'TikTok kanalının kısa performans detayı.', focus: ['Video KPIs', 'Winning hook', 'UGC test', 'Audience notes', 'Next creative ideas'] },
      'amazon-ads': { title: 'Amazon ADS', description: 'Amazon kanalının kısa performans detayı.', focus: ['ACOS', 'Sponsored Products', 'Search terms', 'Retail readiness', 'ASIN opportunity'] },
    },
  },
  'meta-ads': {
    name: serviceLabels['meta-ads'],
    summary: 'Meta kampanyaları, reklam setleri, kreatifler, kitleler ve Pixel/Event takibi görünür olur.',
    kpis: [
      { label: 'ROAS', value: '4.8x', note: '+0.6x haftalık' },
      { label: 'Lead', value: '147', note: '+18%' },
      { label: 'CPA', value: '₺122', note: '-12%' },
      { label: 'Pixel', value: 'Aktif', note: 'event kalitesi iyi' },
    ],
    agencyComment: 'Retargeting tarafı güçlü çalışıyor. Soğuk kitlelerde kreatif çeşitliliği artırıyoruz; Pixel event kalitesi kampanya öğrenmesini destekliyor.',
    actions: ['Yeni kreatif setini onaylayın', 'Pixel gerekli aksiyonlarını kontrol edin', 'Kitle genişletme önerisini inceleyin'],
    activity: ['Reklam seti bütçeleri dengelendi', '2 kreatif fatigue etiketi aldı', 'Conversion API kontrol edildi'],
    tabs: {
      campaigns: { title: 'Kampanyalar', description: 'Kampanya listesi, hedef, bütçe, durum ve KPI kartları.', focus: ['Campaign list', 'Objective', 'Budget', 'Status', 'KPI cards'] },
      'ad-sets': { title: 'Reklam Setleri', description: 'Kitle, bütçe, CPM, CTR, CPA ve optimizasyon notları.', focus: ['Ad set table', 'Audience', 'Budget', 'CPM', 'CTR', 'CPA', 'Optimization notes'] },
      creatives: { title: 'Kreatifler', description: 'Kreatif grid, hook skoru, CTR ve dönüşüm karşılaştırması.', focus: ['Creative grid', 'Hook score', 'CTR', 'Conversion rate', 'Winner / Testing / Fatigue labels'] },
      audiences: { title: 'Kitleler', description: 'Cold, warm ve retargeting segmentlerinin performans karşılaştırması.', focus: ['Audience segments', 'Cold / Warm / Retargeting labels', 'Performance comparison', 'Fatigue notes'] },
      'pixel-events': { title: 'Pixel & Events', description: 'Pixel, event match quality, Conversion API ve takip sorunları.', focus: ['Pixel status', 'Events status', 'Event match quality', 'Conversion API status', 'Tracking issues', 'Client required actions'] },
      'meta-reports': { title: 'Raporlar', description: 'Günlük performans raporu ve trend görünümü.', focus: ['Daily spend', 'CTR trend', 'ROAS trend', 'Conversion summary', 'Date range insights'] },
      'agency-notes': { title: 'Ajans Notları', description: 'Haftalık optimizasyon notları ve aksiyon önerileri.', focus: ['Optimization highlights', 'Campaign focus', 'Creative direction', 'Budget pacing', 'Risk notes'] },
      approvals: { title: 'Onaylar', description: 'Müşteri onayı bekleyen revizyon/aksiyon kuyruğu.', focus: ['Pending approvals', 'Revision requests', 'Approval actions', 'Feedback loop', 'Client decision log'] },
    },
  },
  'tiktok-ads': {
    name: serviceLabels['tiktok-ads'],
    summary: 'TikTok kampanyaları, video kreatifler, hook testleri, UGC scriptleri ve pixel takibi izlenir.',
    kpis: [
      { label: 'Video İzlenme', value: '284K', note: '+34%' },
      { label: 'VTR', value: '%42', note: '+5 puan' },
      { label: 'CPA', value: '₺95', note: '-12%' },
      { label: 'Aktif Hook', value: '6', note: '2 kazanan' },
    ],
    agencyComment: 'TikTok tarafında ilk 3 saniye belirleyici. UGC formatı çalışıyor; zayıf hookları hızlı eleyip kazananları reklam setlerine taşıyoruz.',
    actions: ['UGC scriptlerini onaylayın', 'Ürün kullanım videoları gönderin', 'Hook konseptlerine yorum bırakın'],
    activity: ['Yeni hook testi açıldı', 'UGC script seti eklendi', 'Pixel event kontrolü tamamlandı'],
    tabs: {
      campaigns: { title: 'Kampanyalar', description: 'Kampanya listesi, harcama, CPA, VTR ve durum takibi.', focus: ['Campaign list', 'Objective', 'Spend', 'CPA', 'VTR', 'Status'] },
      'video-creatives': { title: 'Video Kreatifler', description: 'Video grid, hook, izlenme süresi, VTR, CTR ve dönüşüm.', focus: ['Video grid', 'Hook', 'Watch time', 'VTR', 'CTR', 'Conversion'] },
      'hook-tests': { title: 'Hook Testleri', description: 'İlk 3 saniye tutma oranı, drop-off ve sonraki hook fikirleri.', focus: ['Hook variants', 'First 3-second retention', 'Drop-off', 'Winning hook', 'Next hook ideas'] },
      audiences: { title: 'Kitleler', description: 'İlgi kümeleri, lookalike, retargeting ve keşif notları.', focus: ['Audience performance', 'Interest clusters', 'Lookalike / retargeting status', 'Discovery notes'] },
      'pixel-events': { title: 'Pixel & Events', description: 'TikTok Pixel, event takibi, problemler ve gereken aksiyonlar.', focus: ['TikTok Pixel status', 'Events', 'Conversion tracking', 'Tracking problems', 'Required actions'] },
      'ugc-scripts': { title: 'UGC Scriptleri', description: 'Script konseptleri, sahne akışı, CTA ve onay durumu.', focus: ['Script concepts', 'Hook', 'Scene flow', 'CTA', 'Approval status', 'Approve / Request Revision'] },
      'optimization-notes': { title: 'Optimizasyon Notları', description: 'Kreatif, kitle ve bütçe değişikliklerinin beklenen etkisi.', focus: ['Optimization log', 'Creative changes', 'Audience changes', 'Budget changes', 'Expected impact'] },
    },
  },
  'google-ads': {
    name: serviceLabels['google-ads'],
    summary: 'Search kampanyaları, kelimeler, reklam metinleri, negatif kelimeler ve dönüşüm takibi izlenir.',
    kpis: [
      { label: 'Dönüşüm', value: '89', note: '+22%' },
      { label: 'CPA', value: '₺135', note: '-15%' },
      { label: 'Search IS', value: '%72', note: 'güçlü görünürlük' },
      { label: 'Tag', value: 'Aktif', note: 'GA4 bağlı' },
    ],
    agencyComment: 'Marka ve ticari niyetli kelimeler güçlü. Arama terimi temizliği maliyeti aşağı çekti; landing page sürtünmesini azaltırsak dönüşüm oranı daha da büyür.',
    actions: ['Yeni reklam metni varyantlarını onaylayın', 'Landing page notlarını inceleyin', 'Dönüşüm aksiyonu listesini kontrol edin'],
    activity: ['12 negatif kelime eklendi', 'Search kampanyası bütçesi güncellendi', 'GA4 dönüşüm kontrolü tamamlandı'],
    tabs: {
      'search-campaigns': { title: 'Search Kampanyaları', description: 'Kampanya listesi, bütçe, dönüşüm, CPA ve impression share.', focus: ['Campaign list', 'Budget', 'Conversions', 'CPA', 'Search impression share'] },
      keywords: { title: 'Anahtar Kelimeler', description: 'Keyword tablosu, niyet, CPC, dönüşüm ve scale/watch/pause kararı.', focus: ['Keyword table', 'Intent', 'CPC', 'Conversion', 'Status: Scale / Watch / Pause'] },
      'ad-copies': { title: 'Reklam Metinleri', description: 'Headline, description, A/B sonucu ve kazanan metin.', focus: ['Ad copy variants', 'Headlines', 'Descriptions', 'A/B result', 'Winning copy'] },
      'negative-keywords': { title: 'Negatif Kelimeler', description: 'Eklenen negatif kelimeler, temizlenen search terms ve tasarruf tahmini.', focus: ['Added negative keywords', 'Cleaned search terms', 'Reason', 'Spend saved estimate'] },
      conversions: { title: 'Dönüşümler', description: 'GA4, tag, conversion action ve sorun/aksiyon görünümü.', focus: ['Conversion tracking status', 'GA4 connection', 'Conversion actions', 'Tag status', 'Issues and required actions'] },
      'landing-page-notes': { title: 'Landing Page Notları', description: 'Landing page skoru, form durumu, hız ve UX sürtünme noktaları.', focus: ['Landing page score', 'Form status', 'Speed notes', 'UX friction points', 'Suggested improvements'] },
      'optimization-notes': { title: 'Optimizasyon Notları', description: 'Bid, keyword, search term ve bütçe değişiklikleri.', focus: ['Bid changes', 'Keyword changes', 'Search term review', 'Budget changes', 'Next actions'] },
    },
  },
  'amazon-ads': {
    name: serviceLabels['amazon-ads'],
    summary: 'Sponsored Products, Sponsored Brands, Display, search term mining, ASIN targeting ve retail readiness takip edilir.',
    kpis: [
      { label: 'ACOS', value: '%18', note: '-4 puan' },
      { label: 'TACOS', value: '%12', note: 'sağlıklı' },
      { label: 'Satış', value: '₺22.4K', note: '+28%' },
      { label: 'Buy Box', value: '%94', note: 'stabil' },
    ],
    agencyComment: 'Amazon tarafında kârlılık dengesi iyi. Search term mining ile verimsiz harcamayı temizliyor, yüksek satış getiren terimleri scale ediyoruz.',
    actions: ['Stok ve fiyat kontrolünü yapın', 'A+ içerik güncellemesini onaylayın', 'Keyword genişletmesini inceleyin'],
    activity: ['Düşük verimli search terms negatiflendi', 'Sponsored Products bütçesi dengelendi', 'Retail readiness checklist güncellendi'],
    tabs: {
      campaigns: { title: 'Kampanyalar', description: 'Tüm Amazon Ads kampanyalarının ürün tipine göre performans özeti.', focus: ['Campaign list', 'Ad product split', 'Spend', 'Sales', 'ACOS', 'ROAS'] },
      'sponsored-products': { title: 'Sponsored Products', description: 'Kampanya listesi, harcama, satış, ACOS ve keyword görünümü.', focus: ['Campaign list', 'Spend', 'Sales', 'ACOS', 'Keywords'] },
      'sponsored-brands': { title: 'Sponsored Brands', description: 'Marka görünürlüğü, CTR, satış, ACOS ve kreatif statüsü.', focus: ['Campaign list', 'Brand visibility', 'CTR', 'Sales', 'ACOS', 'Creative status'] },
      'sponsored-display': { title: 'Sponsored Display', description: 'Audience/product targeting, gösterim, satış ve ACOS.', focus: ['Audience targeting', 'Product targeting', 'Impressions', 'Sales', 'ACOS'] },
      'products-asin': { title: 'Ürünler / ASIN', description: 'ASIN/SKU bazlı reklam performansı, satış ve ROAS görünümü.', focus: ['ASIN / SKU list', 'Spend', 'Sales', 'Orders', 'Units sold', 'ROAS'] },
      keywords: { title: 'Anahtar Kelimeler', description: 'Keyword performansı, match type, kampanya/ad group kırılımı.', focus: ['Keyword text', 'Match type', 'Campaign / ad group', 'Spend', 'Sales', 'ACOS'] },
      targeting: { title: 'Targeting', description: 'Target expression performansı ve kampanya bazlı kârlılık görünümü.', focus: ['Target type', 'Target expression', 'Campaign / ad group', 'Spend', 'Sales', 'ROAS'] },
      'search-terms': { title: 'Search Terms', description: 'Search term mining, harcama, satış, ACOS ve aksiyon kararı.', focus: ['Search term mining table', 'Spend', 'Sales', 'ACOS', 'Action: Keep / Negate / Scale'] },
      'amazon-reports': { title: 'Raporlar', description: 'Amazon Ads rapor özetleri ve yayın hazır read model görünümü.', focus: ['Report readiness', 'Last sync', 'Summary context', 'Client-safe status'] },
      'agency-notes': { title: 'Ajans Notları', description: 'Kampanya, ürün ve search term sinyallerinden türetilen haftalık notlar.', focus: ['Optimization notes', 'Campaign focus', 'Product signals', 'Search-term risks'] },
      approvals: { title: 'Onaylar', description: 'Müşteri onayı bekleyen Amazon Ads görev ve kreatif kuyruğu.', focus: ['Pending approvals', 'Campaign/budget/report approvals', 'Creative preview', 'Approval history'] },
    },
  },
  'web-app': {
    name: serviceLabels['web-app'],
    summary: 'Web uygulama proje yol haritası, sprint, UI/UX, frontend, backend/API, admin panel ve yayın süreci takip edilir.',
    kpis: [
      { label: 'Proje İlerlemesi', value: '%65', note: 'geliştirme aşaması' },
      { label: 'Sprint', value: '3/5', note: 'aktif sprint' },
      { label: 'Tamamlanan Modül', value: '12', note: 'web app kapsamı' },
      { label: 'Açık Bug', value: '4', note: 'QA bekliyor' },
    ],
    agencyComment: 'Ürün akışı netleşti. Frontend modülleri tamamlandıkça API bağlantıları test ediliyor; yayın öncesi QA ve performans listesi takipte.',
    actions: ['Sprint kapsamını inceleyin', 'Admin panel yetki notlarını gönderin', 'Test linkinden geri bildirim verin'],
    activity: ['Admin kullanıcı rolleri eklendi', 'API auth akışı test edildi', 'Responsive kontrol listesi güncellendi'],
    tabs: {
      'project-roadmap': { title: 'Proje Yol Haritası', description: 'Proje fazları, timeline ve milestone görünümü.', focus: ['Project phases', 'Timeline', 'Milestones', 'Teslim tarihleri'] },
      'sprint-status': { title: 'Sprint Durumu', description: 'Planlanan, devam eden, tamamlanan ve blocked işler.', focus: ['Sprint board', 'Planned', 'In Progress', 'Completed', 'Blocked'] },
      'ui-ux': { title: 'UI / UX', description: 'Ekran ilerlemesi, wireframe, UI tasarım, prototip ve onay durumu.', focus: ['Screen progress', 'Wireframe status', 'UI design status', 'Prototype preview', 'Approval status'] },
      frontend: { title: 'Frontend', description: 'Sayfa/modül listesi, geliştirme durumu, responsive ve performans notları.', focus: ['Page/module list', 'Development status', 'Responsive status', 'Performance notes'] },
      'backend-api': { title: 'Backend / API', description: 'API modülleri, veritabanı, authentication ve entegrasyonlar.', focus: ['API modules', 'Database status', 'Authentication', 'Integrations', 'Technical notes'] },
      'admin-panel': { title: 'Admin Panel', description: 'Admin özellikleri, roller, CRUD modülleri ve yetki durumu.', focus: ['Admin features', 'User roles', 'CRUD modules', 'Permission status'] },
      'test-deploy': { title: 'Test & Yayın', description: 'QA checklist, buglar, staging link ve launch readiness.', focus: ['QA checklist', 'Bugs', 'Staging link', 'Launch readiness', 'Deployment status'] },
      revisions: { title: 'Revizyonlar', description: 'Revizyon talepleri, durum, öncelik ve ajans yanıtı.', focus: ['Revision requests', 'Status', 'Priority', 'Agency response'] },
      files: { title: 'Dosyalar', description: 'Paylaşılan dosyalar, tasarım linkleri, dokümanlar ve indirme aksiyonları.', focus: ['Shared files', 'Links', 'Design files', 'Documents', 'Download buttons'] },
    },
  },
  'mobile-app': {
    name: serviceLabels['mobile-app'],
    summary: 'Mobil uygulama akışı, ekranlar, sprint, API/admin panel, push bildirimleri, test build ve store hazırlığı takip edilir.',
    kpis: [
      { label: 'Proje İlerlemesi', value: '%58', note: 'UI + geliştirme' },
      { label: 'Tamamlanan Ekran', value: '12/18', note: '5 onay bekliyor' },
      { label: 'Açık Bug', value: '6', note: 'test build' },
      { label: 'Store Hazırlığı', value: '%40', note: 'bilgi bekliyor' },
    ],
    agencyComment: 'Uygulama akışı sağlıklı ilerliyor. Kritik ekranlar netleşti; test build sonrası crash ve cihaz uyumluluğu tarafını birlikte kontrol edeceğiz.',
    actions: ['Ekran tasarımlarını onaylayın', 'Store bilgilerini gönderin', 'Test build geri bildirimlerini paylaşın'],
    activity: ['Login/Register akışı tamamlandı', 'Push senaryoları hazırlandı', 'Test build notları eklendi'],
    tabs: {
      'app-flow': { title: 'Uygulama Akışı', description: 'User flow, login/register, ana navigasyon ve conversion flow.', focus: ['User flow', 'Login/Register flow', 'Main app navigation', 'Conversion flow'] },
      screens: { title: 'Ekranlar', description: 'Ekran galerisi, statü ve onay/revizyon durumu.', focus: ['App screen gallery', 'Screen status', 'Approved / In revision / In design'] },
      'sprint-status': { title: 'Sprint Durumu', description: 'Sprint board, task, bug ve blocker görünümü.', focus: ['Sprint board', 'Tasks', 'Bugs', 'Blockers'] },
      'api-admin': { title: 'API & Admin Panel', description: 'API bağlantısı, admin panel özellikleri, auth ve kullanıcı yönetimi.', focus: ['API connection status', 'Admin panel features', 'Authentication', 'User management'] },
      'push-notifications': { title: 'Push Bildirimleri', description: 'Push kurulum, bildirim senaryoları, onay ve test durumu.', focus: ['Push setup status', 'Notification scenarios', 'Approval status', 'Testing status'] },
      'test-build': { title: 'Test Build', description: 'Son build, test linki, notlar, buglar ve müşteri feedback.', focus: ['Latest build', 'Test link placeholder', 'Test notes', 'Bugs', 'Client feedback'] },
      'store-readiness': { title: 'Store Hazırlığı', description: 'App adı, ikon, screenshot, açıklama, gizlilik politikası ve submission.', focus: ['App name', 'Icon', 'Screenshots', 'Store description', 'Privacy policy', 'Submission status'] },
      revisions: { title: 'Revizyonlar', description: 'Revizyon listesi, istenen değişiklikler, durum ve öncelik.', focus: ['Revision list', 'Requested changes', 'Status', 'Priority'] },
    },
  },
  'landing-pages': {
    name: serviceLabels['landing-pages'],
    summary: 'Brief, copywriting, tasarım, geliştirme, form/tracking, A/B test ve yayın durumu izlenir.',
    kpis: [
      { label: 'Sayfa İlerlemesi', value: '%76', note: 'tracking aşaması' },
      { label: 'Form Leadleri', value: '124', note: 'bu ay' },
      { label: 'Conversion Rate', value: '%5.8', note: '+1.1 puan' },
      { label: 'Açık Revizyon', value: '2', note: 'copy + mobil' },
    ],
    agencyComment: 'Sayfa dönüşüm yapısı güçlü. Reklam trafiği, form ve takip kodu akışı doğru bağlandığında lead kalitesini net görebileceğiz.',
    actions: ['Copy varyantını onaylayın', 'Tasarım önizlemesini inceleyin', 'Eksik marka varlıklarını gönderin'],
    activity: ['Hero copy güncellendi', 'Mobil tasarım revizyonu işlendi', 'Form event testi hazırlandı'],
    tabs: {
      'brief-target': { title: 'Brief & Hedef', description: 'Kampanya hedefi, hedef kitle, teklif, CTA ve marka notları.', focus: ['Campaign goal', 'Target audience', 'Offer', 'CTA', 'Brand notes'] },
      copywriting: { title: 'Copywriting', description: 'Headline varyantları, subheadline, CTA ve section copy onayı.', focus: ['Headline variants', 'Subheadline', 'CTA copy', 'Section copy', 'Approval buttons'] },
      design: { title: 'Tasarım', description: 'Desktop/mobile preview, tasarım ve revizyon statüsü.', focus: ['Desktop preview', 'Mobile preview', 'Design status', 'Revision status'] },
      development: { title: 'Geliştirme', description: 'Geliştirme ilerlemesi, tamamlanan componentler, responsive ve performans notları.', focus: ['Development progress', 'Components completed', 'Responsive status', 'Performance notes'] },
      'form-tracking': { title: 'Form & Tracking', description: 'Form, Pixel, GA4, lead bildirimi ve test sonuçları.', focus: ['Form status', 'Pixel status', 'GA4 status', 'Lead notification status', 'Test results'] },
      'ab-tests': { title: 'A/B Testleri', description: 'Varyantlar, hipotez, mevcut sonuç ve kazanan versiyon.', focus: ['Test variants', 'Hypothesis', 'Current result', 'Winning version'] },
      'publish-status': { title: 'Yayın Durumu', description: 'Domain, hosting, SSL, deployment ve publish checklist.', focus: ['Domain', 'Hosting', 'SSL', 'Deployment', 'Publish checklist'] },
      revisions: { title: 'Revizyonlar', description: 'Revizyon talepleri, durum, notlar ve onay aksiyonları.', focus: ['Revision requests', 'Status', 'Notes', 'Approval buttons'] },
    },
  },
  'web-mobile-design': {
    name: serviceLabels['web-mobile-design'],
    summary: 'UX akışı, wireframe, UI ekranları, design system, responsive tasarım, prototip ve teslim dosyaları takip edilir.',
    kpis: [
      { label: 'Tasarlanan Ekran', value: '24', note: 'desktop + mobile' },
      { label: 'UX Akışı', value: '%90', note: 'netleşti' },
      { label: 'Revizyon', value: '2', note: 'aktif' },
      { label: 'Onay Durumu', value: '18/24', note: 'ekran onaylı' },
    ],
    agencyComment: 'Tasarım sistemi tutarlı ilerliyor. Responsive kırılımlarda aksiyon noktaları sadeleştirildi; prototip üzerinden kullanıcı akışını daha net onaylayabilirsiniz.',
    actions: ['UI ekranlarını onaylayın', 'Revizyon notu bırakın', 'Teslim dosyalarını indirin'],
    activity: ['Design system tokenları güncellendi', 'Mobil ekran önizlemeleri eklendi', 'Prototype notları tamamlandı'],
    tabs: {
      'ux-flow': { title: 'UX Akışı', description: 'User flow map, giriş noktaları, conversion path ve pain pointler.', focus: ['User flow map', 'Entry points', 'Conversion path', 'Pain points'] },
      wireframe: { title: 'Wireframe', description: 'Wireframe ekran listesi, status, feedback ve onay butonları.', focus: ['Wireframe screen list', 'Status', 'Feedback', 'Approval buttons'] },
      'ui-screens': { title: 'UI Ekranları', description: 'Desktop/mobile/tablet UI galeri ve onay statüsü.', focus: ['UI gallery', 'Desktop/mobile/tablet views', 'Approval status'] },
      'design-system': { title: 'Design System', description: 'Renkler, tipografi, butonlar, inputlar, kartlar ve componentler.', focus: ['Colors', 'Typography', 'Buttons', 'Inputs', 'Cards', 'Components'] },
      'responsive-design': { title: 'Responsive Tasarım', description: 'Desktop, tablet, mobile ve breakpoint statüsü.', focus: ['Desktop', 'Tablet', 'Mobile', 'Breakpoint status'] },
      prototype: { title: 'Prototip', description: 'Prototype preview, interaction notes ve test feedback.', focus: ['Prototype preview', 'Interaction notes', 'Test feedback'] },
      revisions: { title: 'Revizyonlar', description: 'Revizyon listesi, status, öncelik ve müşteri yorumları.', focus: ['Revision list', 'Status', 'Priority', 'Client comments'] },
      'delivery-files': { title: 'Teslim Dosyaları', description: 'Tasarım linki, export assetleri, style guide ve indirme butonları.', focus: ['Design link', 'Exported assets', 'Style guide', 'Download buttons'] },
    },
  },
  'technical-support': {
    name: serviceLabels['technical-support'],
    summary: 'Destek talepleri, açık/çözülen işler, bakım, güvenlik, yedekleme, güncellemeler ve aktivite logu izlenir.',
    kpis: [
      { label: 'Açık Talep', value: '2', note: 'takipte' },
      { label: 'Uptime', value: '%99.98', note: 'stabil' },
      { label: 'Son Backup', value: 'Bugün', note: 'başarılı' },
      { label: 'Güvenlik', value: 'Temiz', note: 'kritik yok' },
    ],
    agencyComment: 'Sistemler stabil. Teknik ekip proaktif bakım, güvenlik kontrolü ve yedekleme döngüsünü takip ediyor; acil talepler öncelikli ele alınıyor.',
    actions: ['Yeni destek talebi açın', 'Açık işleri önceliklendirin', 'Bakım penceresini onaylayın'],
    activity: ['Backup başarıyla tamamlandı', 'Plugin güncelleme kontrolü yapıldı', 'Açık ticket notu güncellendi'],
    tabs: {
      'support-requests': { title: 'Destek Talepleri', description: 'Yeni destek talebi formu, kategori, öncelik ve mevcut talep listesi.', focus: ['New support request form', 'Request categories', 'Priority selector', 'Current request list'] },
      'open-tasks': { title: 'Açık İşler', description: 'Açık ticket board, öncelik, durum ve son güncelleme.', focus: ['Open tickets board', 'Priority', 'Status', 'Last update'] },
      'resolved-tasks': { title: 'Çözülen İşler', description: 'Çözülen ticketlar, çözüm notu, bitiş tarihi ve müşteri onayı.', focus: ['Resolved tickets', 'Resolution note', 'Completion date', 'Client confirmation'] },
      maintenance: { title: 'Bakım', description: 'Bakım checklist, server health, CMS/plugin durumu ve aylık özet.', focus: ['Maintenance checklist', 'Server health', 'Plugin/CMS status', 'Monthly maintenance summary'] },
      security: { title: 'Güvenlik', description: 'SSL, security scan, vulnerability notları ve erişim kontrolleri.', focus: ['SSL status', 'Security scan', 'Vulnerability notes', 'Access checks'] },
      backup: { title: 'Yedekleme', description: 'Son backup tarihi, frekans, durum ve restore point listesi.', focus: ['Last backup date', 'Backup frequency', 'Backup status', 'Restore point list'] },
      updates: { title: 'Güncellemeler', description: 'CMS, plugin, dependency güncellemeleri ve update notları.', focus: ['CMS updates', 'Plugin updates', 'Dependency updates', 'Update notes'] },
      'activity-log': { title: 'Aktivite Logu', description: 'Teknik aksiyon timeline, kim yaptı, durum ve notlar.', focus: ['Timeline of technical actions', 'Who performed action', 'Status', 'Notes'] },
    },
  },
  'seo-audit': {
    name: serviceLabels['seo-audit'],
    summary: 'SEO audit, teknik hatalar, keyword sıralamaları, hız, index, Search Console ve aksiyon planı izlenir.',
    kpis: [
      { label: 'SEO Skor', value: '94%', note: '+8 puan' },
      { label: 'Teknik Hata', value: '7', note: '2 kritik' },
      { label: 'Organik Trafik', value: '+28%', note: 'aylık' },
      { label: 'Index', value: '312', note: 'sayfa' },
    ],
    agencyComment: 'Teknik SEO sağlığı iyi seviyeye geldi. Kritik hataları önceliklendirip Core Web Vitals ve index kapsamını birlikte güçlendiriyoruz.',
    actions: ['Kritik hata listesini onaylayın', 'İçerik gap önerilerini inceleyin', 'Search Console erişimini doğrulayın'],
    activity: ['Audit raporu güncellendi', 'Core Web Vitals notları eklendi', 'Rakip keyword gap çıkarıldı'],
    tabs: {
      'seo-audit': { title: 'SEO Audit', description: 'Audit özeti, SEO health score ve kritik/orta/düşük sorunlar.', focus: ['Audit summary', 'SEO health score', 'Critical issues', 'Medium issues', 'Low priority issues'] },
      'technical-issues': { title: 'Teknik Hatalar', description: 'Hata tablosu, severity, etkilenen sayfalar, durum ve çözüm önerisi.', focus: ['Error table', 'Severity', 'Affected pages', 'Status', 'Fix recommendation'] },
      keywords: { title: 'Anahtar Kelimeler', description: 'Keyword sıralamaları, pozisyon değişimi, hacim ve fırsat skoru.', focus: ['Keyword rankings', 'Position change', 'Search volume', 'Opportunity score'] },
      'page-speed': { title: 'Sayfa Hızı', description: 'Mobil/desktop hız skoru, Core Web Vitals ve iyileştirme notları.', focus: ['Mobile speed score', 'Desktop speed score', 'Core Web Vitals', 'Improvement notes'] },
      'index-status': { title: 'Index Durumu', description: 'Indexlenen/edilmeyen sayfalar, sitemap ve robots.txt durumu.', focus: ['Indexed pages', 'Not indexed pages', 'Sitemap status', 'Robots.txt status'] },
      'search-console': { title: 'Search Console', description: 'Clicks, impressions, CTR, average position ve coverage errors.', focus: ['Clicks', 'Impressions', 'CTR', 'Average position', 'Coverage errors'] },
      'competitor-analysis': { title: 'Rakip Analizi', description: 'Rakip SEO kıyası, keyword gap, content gap ve backlink fırsatları.', focus: ['Competitor SEO comparison', 'Keyword gaps', 'Content gaps', 'Backlink opportunities'] },
      'action-plan': { title: 'Aksiyon Planı', description: 'Önerilen düzeltmeler, öncelik, etki tahmini ve müşteri onayı gerekenler.', focus: ['Recommended fixes', 'Priority order', 'Estimated impact', 'Client approval requirements'] },
    },
  },
};

export function getServiceTabContent(serviceId: string, tabId: string): ServiceTabContent {
  const profile = profiles[(serviceId as ServiceId)] || profiles['growth-hub'];
  const tab = profile.tabs[tabId] || {
    title: tabId
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    description: `${profile.name} kapsamında bu ekran müşterinin karar almasını kolaylaştıran net bir görünürlük panosudur.`,
    focus: [profile.summary, 'Durum takibi', 'Müşteri aksiyonları', 'Ajans notları'],
  };

  const focusRows = tab.table || tab.focus.slice(0, 4).map((item, index) => [
    item,
    index % 2 === 0 ? 'Aktif' : 'Takipte',
    index % 2 === 0 ? 'Güçlü' : 'İyileştiriliyor',
    index % 2 === 0 ? 'Onaylandı' : 'Geri bildirim bekliyor',
  ]);

  return {
    serviceName: profile.name,
    title: tab.title,
    description: tab.description,
    kpis: profile.kpis,
    sections: [
      {
        title: 'Bu Ekranda Takip Edilenler',
        description: `${profile.name} hizmetinin bu sekmesinde operasyonun müşteriye görünen ana parçaları sadeleştirilir.`,
        items: tab.focus.slice(0, 5),
      },
      {
        title: 'Ajansın Çalıştığı Noktalar',
        description: 'Social Tech ekibinin bu hafta odaklandığı optimizasyon ve teslim adımları.',
        items: profile.activity,
      },
      {
        title: 'Karar İçin Netlik',
        description: 'Panelin amacı teknik karmaşayı azaltıp onay, revizyon ve takip kararlarını hızlandırmaktır.',
        items: profile.actions,
      },
    ],
    table: {
      columns: ['Başlık', 'Durum', 'Performans', 'Aksiyon'],
      rows: focusRows,
    },
    timeline: profile.activity,
    agencyComment: profile.agencyComment,
    clientActions: profile.actions,
  };
}
