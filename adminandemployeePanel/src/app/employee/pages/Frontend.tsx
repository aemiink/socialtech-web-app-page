import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Code, CheckCircle, Clock, AlertCircle, GitBranch } from "lucide-react";

const frontendGorevleri = [
  {
    id: "1",
    baslik: "Ödeme akışı UI — adım göstergesi bileşeni",
    proje: "Türk Telekom Fiber Lansmanı",
    musteri: "Türk Telekom",
    teknoloji: "React + TypeScript",
    oncelik: "kritik",
    durum: "devam-ediyor",
    sp: 5,
    deadline: "2026-04-30"
  },
  {
    id: "2",
    baslik: "Ürün grid bileşeni performans optimizasyonu",
    proje: "Teknosa E-ticaret Platformu",
    musteri: "Teknosa",
    teknoloji: "React + Vite",
    oncelik: "yüksek",
    durum: "devam-ediyor",
    sp: 3,
    deadline: "2026-05-02"
  },
  {
    id: "3",
    baslik: "Mobil responsive navbar düzeltmesi",
    proje: "Boyner Landing Page Redesign",
    musteri: "Boyner",
    teknoloji: "HTML + Tailwind CSS",
    oncelik: "normal",
    durum: "tamamlandı",
    sp: 2,
    deadline: "2026-04-24"
  },
  {
    id: "4",
    baslik: "Dark mode toggle implementasyonu",
    proje: "Hepsiburada SEO Audit",
    musteri: "Hepsiburada",
    teknoloji: "Next.js + Tailwind",
    oncelik: "normal",
    durum: "bekliyor",
    sp: 3,
    deadline: "2026-05-10"
  },
  {
    id: "5",
    baslik: "Form validasyon kütüphanesi entegrasyonu",
    proje: "Türk Telekom Fiber Lansmanı",
    musteri: "Türk Telekom",
    teknoloji: "React Hook Form + Zod",
    oncelik: "yüksek",
    durum: "bekliyor",
    sp: 4,
    deadline: "2026-05-05"
  }
];

export function Frontend() {
  const devamEdiyor = frontendGorevleri.filter(g => g.durum === "devam-ediyor").length;
  const tamamlandı = frontendGorevleri.filter(g => g.durum === "tamamlandı").length;
  const bekliyor = frontendGorevleri.filter(g => g.durum === "bekliyor").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Frontend</h1>
        <p className="text-[#A0A0A0]">Frontend geliştirme görevleri ve bileşen çalışmaları</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Code className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Görev</span>
          </div>
          <div className="text-2xl font-semibold">{frontendGorevleri.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-[#A0A0A0]">Devam Ediyor</span>
          </div>
          <div className="text-2xl font-semibold text-blue-500">{devamEdiyor}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Bekleyen</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{bekliyor}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Tamamlanan</span>
          </div>
          <div className="text-2xl font-semibold">{tamamlandı}</div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-lg font-semibold">Frontend Görev Listesi</h3>
          <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
            <GitBranch className="w-4 h-4 mr-2" /> Yeni Görev
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Görev</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Teknoloji</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">SP</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Deadline</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Öncelik</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {frontendGorevleri.map((gorev) => (
                <tr key={gorev.id} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-[#A0A0A0]" />
                      <span className="font-medium text-sm">{gorev.baslik}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{gorev.musteri}</td>
                  <td className="p-4">
                    <Badge variant="outline" className="text-xs">{gorev.teknoloji}</Badge>
                  </td>
                  <td className="p-4 text-sm">{gorev.sp} SP</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">
                    {new Date(gorev.deadline).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={gorev.oncelik === "kritik" ? "destructive" : gorev.oncelik === "yüksek" ? "default" : "secondary"}
                    >
                      {gorev.oncelik === "kritik" ? "Kritik" : gorev.oncelik === "yüksek" ? "Yüksek" : "Normal"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      className={
                        gorev.durum === "tamamlandı"
                          ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                          : gorev.durum === "devam-ediyor"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-white/10 text-[#A0A0A0] border-white/10"
                      }
                    >
                      {gorev.durum === "tamamlandı" ? "Tamamlandı" : gorev.durum === "devam-ediyor" ? "Devam Ediyor" : "Bekliyor"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button size="sm" variant="outline">Detay</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
