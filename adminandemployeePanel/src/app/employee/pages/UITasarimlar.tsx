import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Monitor, Smartphone, Layout, CheckCircle, Clock, ExternalLink } from "lucide-react";

const tasarimlar = [
  {
    id: "1",
    baslik: "Türk Telekom Fiber — Landing Page",
    musteri: "Türk Telekom",
    tur: "Landing Page",
    platform: "Web",
    ekran: ["Desktop", "Mobile"],
    durum: "geliştirme",
    figmaLink: "#",
    teslim: "2026-04-30"
  },
  {
    id: "2",
    baslik: "Teknosa E-ticaret — Ana Sayfa Yenileme",
    musteri: "Teknosa",
    tur: "Web Uygulaması",
    platform: "Web",
    ekran: ["Desktop", "Tablet", "Mobile"],
    durum: "onaylandı",
    figmaLink: "#",
    teslim: "2026-04-20"
  },
  {
    id: "3",
    baslik: "Hepsiburada Mobil Uygulama — Onboarding",
    musteri: "Hepsiburada",
    tur: "Mobil Uygulama",
    platform: "iOS & Android",
    ekran: ["Mobile"],
    durum: "revizyon",
    figmaLink: "#",
    teslim: "2026-05-08"
  },
  {
    id: "4",
    baslik: "Boyner Outlet Sayfası",
    musteri: "Boyner",
    tur: "Landing Page",
    platform: "Web",
    ekran: ["Desktop", "Mobile"],
    durum: "tasarım",
    figmaLink: "#",
    teslim: "2026-05-12"
  }
];

const durumRengi: Record<string, string> = {
  "onaylandı": "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30",
  "revizyon": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "geliştirme": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "tasarım": "bg-purple-500/20 text-purple-400 border-purple-500/30"
};

const durumLabel: Record<string, string> = {
  "onaylandı": "Onaylandı",
  "revizyon": "Revizyon",
  "geliştirme": "Geliştirmede",
  "tasarım": "Tasarım"
};

export function UITasarimlar() {
  const onaylı = tasarimlar.filter(t => t.durum === "onaylandı").length;
  const revizyon = tasarimlar.filter(t => t.durum === "revizyon").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">UI Tasarımlar</h1>
        <p className="text-[#A0A0A0]">Web ve mobil arayüz tasarım projeleri</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Layout className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Proje</span>
          </div>
          <div className="text-2xl font-semibold">{tasarimlar.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Onaylanan</span>
          </div>
          <div className="text-2xl font-semibold">{onaylı}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Revizyon</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{revizyon}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Monitor className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Devam Eden</span>
          </div>
          <div className="text-2xl font-semibold">
            {tasarimlar.filter(t => t.durum !== "onaylandı").length}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasarimlar.map((tasarim) => (
          <Card key={tasarim.id} className="bg-[#1A1A1A] border-white/[0.06] p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {tasarim.platform.includes("iOS")
                  ? <Smartphone className="w-5 h-5 text-[#AAFF01]" />
                  : <Monitor className="w-5 h-5 text-[#AAFF01]" />}
                <div>
                  <h4 className="font-semibold text-sm">{tasarim.baslik}</h4>
                  <p className="text-xs text-[#A0A0A0]">{tasarim.musteri}</p>
                </div>
              </div>
              <Badge className={durumRengi[tasarim.durum]}>
                {durumLabel[tasarim.durum]}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline">{tasarim.tur}</Badge>
              <Badge variant="outline">{tasarim.platform}</Badge>
              {tasarim.ekran.map((ekran) => (
                <Badge key={ekran} variant="secondary" className="text-xs">
                  {ekran === "Desktop"
                    ? <Monitor className="w-3 h-3 inline mr-1" />
                    : ekran === "Mobile"
                    ? <Smartphone className="w-3 h-3 inline mr-1" />
                    : null}
                  {ekran}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A0A0A0]">
                Teslim: {new Date(tasarim.teslim).toLocaleDateString("tr-TR")}
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <ExternalLink className="w-4 h-4 mr-1" /> Figma
                </Button>
                {tasarim.durum === "revizyon" && (
                  <Button size="sm" variant="outline" className="text-orange-400 border-orange-500/30">
                    Revizyon
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
