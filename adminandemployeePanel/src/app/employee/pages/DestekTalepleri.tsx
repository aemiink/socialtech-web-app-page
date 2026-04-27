import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { HeadphonesIcon, AlertCircle, CheckCircle, Clock, MessageSquare } from "lucide-react";

const talepler = [
  {
    id: "TKT-0142",
    baslik: "Site üzerinde SSL sertifikası hatası",
    musteri: "Türk Telekom",
    kategori: "Güvenlik",
    oncelik: "kritik",
    durum: "açık",
    tarih: "2026-04-27",
    ilkYanit: "32 dk",
    aciklama: "www alt alan adında HTTPS bağlantısı bozuk, tarayıcılar uyarı gösteriyor."
  },
  {
    id: "TKT-0141",
    baslik: "E-posta bildirimleri gönderilmiyor",
    musteri: "Teknosa",
    kategori: "E-posta",
    oncelik: "yüksek",
    durum: "devam-ediyor",
    tarih: "2026-04-26",
    ilkYanit: "1 saat",
    aciklama: "SMTP sunucu hatası — sipariş onay mailleri son 6 saattir gönderilemiyor."
  },
  {
    id: "TKT-0140",
    baslik: "Dashboard veri yükleme sorunu",
    musteri: "Getir",
    kategori: "Performans",
    oncelik: "normal",
    durum: "bekliyor",
    tarih: "2026-04-25",
    ilkYanit: "—",
    aciklama: "Admin dashboard ilk açılışta veri yüklemesi 10+ saniye sürüyor."
  },
  {
    id: "TKT-0139",
    baslik: "Google Analytics bağlantısı kesildi",
    musteri: "Migros",
    kategori: "Analytics",
    oncelik: "yüksek",
    durum: "çözüldü",
    tarih: "2026-04-24",
    ilkYanit: "45 dk",
    aciklama: "GA4 mülk yetkilendirmesi yenilendi ve bağlantı restore edildi."
  }
];

export function DestekTalepleri() {
  const açık = talepler.filter(t => t.durum !== "çözüldü").length;
  const çözüldü = talepler.filter(t => t.durum === "çözüldü").length;
  const kritik = talepler.filter(t => t.oncelik === "kritik" && t.durum !== "çözüldü").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Destek Talepleri</h1>
          <p className="text-[#A0A0A0]">Müşteri destek biletleri ve teknik sorunlar</p>
        </div>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          Yeni Talep Oluştur
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <HeadphonesIcon className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Bilet</span>
          </div>
          <div className="text-2xl font-semibold">{talepler.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Kritik</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">{kritik}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Açık</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{açık}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Çözüldü</span>
          </div>
          <div className="text-2xl font-semibold">{çözüldü}</div>
        </Card>
      </div>

      <div className="space-y-3">
        {talepler.map((talep) => (
          <Card
            key={talep.id}
            className={`bg-[#1A1A1A] border-white/[0.06] p-5 ${talep.oncelik === "kritik" && talep.durum !== "çözüldü" ? "border-l-2 border-l-red-500" : ""}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-[#A0A0A0]">{talep.id}</span>
                  <h4 className="font-semibold text-sm">{talep.baslik}</h4>
                  <Badge variant="outline" className="text-xs">{talep.kategori}</Badge>
                </div>
                <p className="text-xs text-[#A0A0A0] mb-2">
                  Müşteri: {talep.musteri} · {new Date(talep.tarih).toLocaleDateString("tr-TR")} · İlk Yanıt: {talep.ilkYanit}
                </p>
                <p className="text-sm text-[#A0A0A0]">{talep.aciklama}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant={talep.oncelik === "kritik" ? "destructive" : talep.oncelik === "yüksek" ? "default" : "secondary"}
                >
                  {talep.oncelik === "kritik" ? "Kritik" : talep.oncelik === "yüksek" ? "Yüksek" : "Normal"}
                </Badge>
                <Badge
                  className={
                    talep.durum === "çözüldü"
                      ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                      : talep.durum === "devam-ediyor"
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      : talep.durum === "açık"
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  }
                >
                  {talep.durum === "çözüldü" ? "Çözüldü" : talep.durum === "devam-ediyor" ? "Devam" : talep.durum === "açık" ? "Açık" : "Bekliyor"}
                </Badge>
                {talep.durum !== "çözüldü" && (
                  <Button size="sm" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-1" /> Yanıtla
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
