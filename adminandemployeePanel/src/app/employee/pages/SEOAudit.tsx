import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Search, TrendingUp, AlertCircle, CheckCircle, Globe } from "lucide-react";

const auditler = [
  {
    id: "1",
    musteri: "Hepsiburada",
    domain: "hepsiburada.com",
    puan: 72,
    oncekiPuan: 58,
    sayfaSayisi: 12400,
    indeksli: 11850,
    hataSayisi: 48,
    uyariSayisi: 124,
    sonAudit: "2026-04-26",
    durum: "devam-ediyor"
  },
  {
    id: "2",
    musteri: "Koçtaş",
    domain: "koctas.com",
    puan: 84,
    oncekiPuan: 79,
    sayfaSayisi: 3800,
    indeksli: 3780,
    hataSayisi: 12,
    uyariSayisi: 34,
    sonAudit: "2026-04-20",
    durum: "tamamlandı"
  },
  {
    id: "3",
    musteri: "Migros",
    domain: "migros.com.tr",
    puan: 68,
    oncekiPuan: 65,
    sayfaSayisi: 8200,
    indeksli: 7940,
    hataSayisi: 67,
    uyariSayisi: 89,
    sonAudit: "2026-04-15",
    durum: "planlandı"
  }
];

export function SEOAudit() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">SEO Audit</h1>
          <p className="text-[#A0A0A0]">Müşteri site SEO denetimleri ve teknik sağlık skorları</p>
        </div>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          <Search className="w-4 h-4 mr-2" /> Yeni Audit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Site</span>
          </div>
          <div className="text-2xl font-semibold">{auditler.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Ort. SEO Puanı</span>
          </div>
          <div className="text-2xl font-semibold text-[#AAFF01]">
            {Math.round(auditler.reduce((sum, a) => sum + a.puan, 0) / auditler.length)}
          </div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Toplam Hata</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">
            {auditler.reduce((sum, a) => sum + a.hataSayisi, 0)}
          </div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Tamamlanan</span>
          </div>
          <div className="text-2xl font-semibold">
            {auditler.filter(a => a.durum === "tamamlandı").length}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {auditler.map((audit) => {
          const artış = audit.puan - audit.oncekiPuan;
          return (
            <Card key={audit.id} className="bg-[#1A1A1A] border-white/[0.06] p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{audit.musteri}</h4>
                    <span className="text-xs text-[#A0A0A0] font-mono">{audit.domain}</span>
                    <Badge
                      className={
                        audit.durum === "tamamlandı"
                          ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                          : audit.durum === "devam-ediyor"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      }
                    >
                      {audit.durum === "tamamlandı" ? "Tamamlandı" : audit.durum === "devam-ediyor" ? "Devam Ediyor" : "Planlandı"}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#A0A0A0]">Son Audit: {new Date(audit.sonAudit).toLocaleDateString("tr-TR")}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <span className="text-3xl font-bold text-[#AAFF01]">{audit.puan}</span>
                    <span className="text-sm text-[#A0A0A0]">/ 100</span>
                  </div>
                  <span className={`text-xs font-medium ${artış >= 0 ? "text-[#AAFF01]" : "text-red-400"}`}>
                    {artış >= 0 ? "+" : ""}{artış} puan
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-[#AAFF01]"
                    style={{ width: `${audit.puan}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-[#202020] text-center">
                  <p className="text-lg font-semibold">{audit.sayfaSayisi.toLocaleString("tr-TR")}</p>
                  <p className="text-xs text-[#A0A0A0]">Toplam Sayfa</p>
                </div>
                <div className="p-3 rounded-lg bg-[#202020] text-center">
                  <p className="text-lg font-semibold text-[#AAFF01]">{audit.indeksli.toLocaleString("tr-TR")}</p>
                  <p className="text-xs text-[#A0A0A0]">İndeksli</p>
                </div>
                <div className="p-3 rounded-lg bg-[#202020] text-center">
                  <p className="text-lg font-semibold text-red-400">{audit.hataSayisi}</p>
                  <p className="text-xs text-[#A0A0A0]">Hata</p>
                </div>
                <div className="p-3 rounded-lg bg-[#202020] text-center">
                  <p className="text-lg font-semibold text-orange-400">{audit.uyariSayisi}</p>
                  <p className="text-xs text-[#A0A0A0]">Uyarı</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Detaylı Rapor</Button>
                <Button size="sm" variant="outline">Hataları Gör</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
