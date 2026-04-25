import {
  BarChart3,
  Bot,
  BrainCircuit,
  Camera,
  GitBranch,
  ImagePlus,
  MessageCircle,
  MessagesSquare,
  PenLine,
  Radar,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Store,
  Target,
  WandSparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type AutomationCard = {
  name: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  features: string[];
};

export type AccessPlan = {
  name: string;
  tag: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  tone: "lime" | "violet";
};

export const automationCards: AutomationCard[] = [
  {
    name: "PromptIMG by Social Tech MDA",
    eyebrow: "Brand DNA metin motoru",
    description:
      "Pazaryeri ve sosyal medya ürün görsellerinden marka diline uygun, tutarlı açıklama ve post metinleri üretir.",
    icon: PenLine,
    features: ["Marka dili hafızası", "Pazaryeri açıklamaları", "Sosyal medya post metinleri", "Ton ve vaat kontrolü"],
  },
  {
    name: "PromptVisual by Social Tech MDA",
    eyebrow: "AI vitrin görseli",
    description:
      "Ürün görsellerini gerçekçi, satış odaklı ve marka kimliğine uyumlu vitrin kompozisyonlarına dönüştürür.",
    icon: ImagePlus,
    features: ["Ürün odaklı sahneleme", "Marka renk uyumu", "Gerçekçi vitrin dili", "Kampanya görsel varyasyonları"],
  },
  {
    name: "PromptAnalysis by Social Tech MDA",
    eyebrow: "Rakip & kanal analizi",
    description:
      "Instagram Ads, profil ve web verisini rakiplerle karşılaştırır; avantaj, dezavantaj ve yapılacaklar listesini raporlar.",
    icon: ScanSearch,
    features: ["Rakip kıyas raporu", "Avantaj/dezavantaj haritası", "Aksiyon listesi", "Kanal bazlı önceliklendirme"],
  },
  {
    name: "PromptWhatsApp by Social Tech MDA",
    eyebrow: "7/24 insansı satış asistanı",
    description:
      "Müşterilere tutarlı cevap verir, ürün fiyat/link bilgisini parse eder, lead sıcaklığını etiketler ve WhatsApp üzerinden canlı mesajlaşma sağlar.",
    icon: MessageCircle,
    features: ["Cold / Warm / Hot etiketleme", "Live Message akışı", "Ürün linki ve fiyat okuma", "Tutarlı marka cevabı"],
  },
  {
    name: "PromptCommander by Social Tech MDA",
    eyebrow: "DM & comment tetikleyici",
    description:
      "Instagram DM ve yorumlarda anahtar kelime yakalar; public/private reply üretir ve farklı kampanya otomasyonları kurar.",
    icon: MessagesSquare,
    features: ["Anahtar kelime tetikleyici", "Public reply", "Private reply", "Çoklu içerik senaryosu"],
  },
];

export const valueCards = [
  {
    title: "Reklamdan sonra satış akışı",
    description: "Tıklama ve mesaj geldikten sonra cevap, segment, rapor ve takip işi otomasyona bağlanır.",
    icon: GitBranch,
  },
  {
    title: "Marka dili kaybolmaz",
    description: "Brand DNA, içerik ve müşteri cevabının aynı marka kişiliğiyle üretilmesini sağlar.",
    icon: BrainCircuit,
  },
  {
    title: "Ajans hizmeti araçla büyür",
    description: "Müşteri dışarıda ücretli erişeceği araçlara paket içinde ulaşır; sistem sadece reklamdan ibaret kalmaz.",
    icon: Bot,
  },
];

export const brandDnaSteps = [
  { title: "Brand DNA", description: "Marka tonu, vaatleri, yasaklı dil ve satış argümanları tanımlanır.", icon: ShieldCheck },
  { title: "Kanal Bağlantısı", description: "Instagram, WhatsApp, web, pazar yeri ve reklam verisi aynı çatıya alınır.", icon: Store },
  { title: "AI Üretim", description: "Metin, görsel, cevap ve rapor çıktıları hedef kanala göre üretilir.", icon: WandSparkles },
  { title: "Segment & Aksiyon", description: "Lead sıcaklığı, avantaj/dezavantaj ve yapılacaklar listesi otomatik çıkarılır.", icon: Target },
];

export const accessPlans: AccessPlan[] = [
  {
    name: "Growth Paketi",
    tag: "Çok satan paket",
    description:
      "Growth kullanıcıları otomasyonlara kredi sistemiyle erişir. Kredi, AI üretim ve analiz kullanımına göre çalışır.",
    icon: Zap,
    tone: "lime",
    features: ["PromptIMG erişimi", "PromptVisual erişimi", "PromptAnalysis raporları", "WhatsApp ve DM otomasyon kredileri"],
  },
  {
    name: "Scale Paketi",
    tag: "Kredi gerekmez",
    description:
      "Scale kullanıcıları için kredi limiti düşünülmez; otomasyonlar büyüme sisteminin doğal parçası olarak kullanılır.",
    icon: Sparkles,
    tone: "violet",
    features: ["Limit baskısı olmadan kullanım", "Öncelikli otomasyon kurulumu", "İleri segmentasyon", "Özel otomasyon senaryoları"],
  },
];

export const roadmapItems = [
  { title: "Google Ads query watcher", icon: Radar },
  { title: "Google kreatif kalite denetimi", icon: BarChart3 },
  { title: "Amazon keyword miner", icon: Store },
  { title: "Amazon listing health", icon: ShieldCheck },
  { title: "Pazar yeri fiyat alarmı", icon: Target },
  { title: "Reklam bütçe koruyucu", icon: Zap },
  { title: "Çok kanallı rapor asistanı", icon: Camera },
];
