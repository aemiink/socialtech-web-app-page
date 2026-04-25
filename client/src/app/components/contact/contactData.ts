import {
  BarChart3,
  CalendarDays,
  Headphones,
  LayoutDashboard,
  MessageCircle,
  Target,
} from "lucide-react";

export const contactChannels = [
  {
    title: "Online Toplantı",
    description: "Hedefinizi dinleyip en uygun yol haritasını birlikte çıkaralım.",
    action: "Toplantı Planla",
    icon: CalendarDays,
    accent: "violet" as const,
  },
  {
    title: "WhatsApp Hattı",
    description: "Hızlı sorular, ön bilgi ve kısa yönlendirmeler için bize yazın.",
    action: "WhatsApp'a Git",
    icon: MessageCircle,
    accent: "lime" as const,
  },
  {
    title: "Dijital Yol Haritası",
    description: "Markanız için hangi sistemin öncelikli olduğunu birlikte netleştirelim.",
    action: "Brief Gönder",
    icon: LayoutDashboard,
    accent: "cyan" as const,
  },
];

export const contactStats = [
  { value: "24s", label: "ilk dönüş hedefi" },
  { value: "30dk", label: "keşif görüşmesi" },
  { value: "3 adım", label: "net yol haritası" },
];

export const processSteps = [
  {
    title: "Önce Dinliyoruz",
    description: "Hedefinizi, mevcut kanallarınızı, bütçenizi ve darboğazlarınızı netleştiriyoruz.",
    icon: Headphones,
  },
  {
    title: "Sistemi Haritalıyoruz",
    description: "Tekil hizmet değil, ölçülebilir büyüme için hangi parçaların gerektiğini çıkarıyoruz.",
    icon: Target,
  },
  {
    title: "Aksiyon Planı Sunuyoruz",
    description: "İlk sprint, kanal önceliği ve başarı metriğini anlaşılır bir plana dönüştürüyoruz.",
    icon: BarChart3,
  },
];

export const serviceOptions = [
  "Growth & Hub",
  "Sosyal Medya",
  "Dijital Pazarlama",
  "Web Uygulaması",
  "SEO / Teknik Destek",
  "Amazon / Google / Meta / TikTok Ads",
  "Henüz emin değilim",
];
