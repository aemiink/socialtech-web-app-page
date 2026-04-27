import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Shield, AlertCircle, CheckCircle, Lock, Eye } from "lucide-react";

const guvenlikUyarilari = [
  {
    id: "1",
    tip: "SSL Uyarısı",
    musteri: "Türk Telekom",
    mesaj: "Subdomain SSL sertifikası 14 gün içinde sona eriyor",
    onem: "yüksek",
    tarih: "2026-04-27",
    durum: "açık"
  },
  {
    id: "2",
    tip: "Başarısız Giriş",
    musteri: "Teknosa",
    mesaj: "Admin paneline 30 dakikada 8 başarısız giriş denemesi",
    onem: "kritik",
    tarih: "2026-04-27",
    durum: "inceleniyor"
  },
  {
    id: "3",
    tip: "Eklenti Güvenlik Açığı",
    musteri: "Boyner",
    mesaj: "WooCommerce eklentisinde yüksek önem dereceli güvenlik açığı bulundu",
    onem: "yüksek",
    tarih: "2026-04-26",
    durum: "açık"
  },
  {
    id: "4",
    tip: "Malware Taraması",
    musteri: "Koçtaş",
    mesaj: "Haftalık malware taraması temiz tamamlandı",
    onem: "bilgi",
    tarih: "2026-04-25",
    durum: "kapandı"
  }
];

const sslDurumlari = [
  { musteri: "Koçtaş", domain: "koctas.com", son: "2026-10-15", durum: "geçerli" },
  { musteri: "Türk Telekom", domain: "fiber.turktelekom.com", son: "2026-05-11", durum: "uyarı" },
  { musteri: "Getir", domain: "getir.com", son: "2026-09-20", durum: "geçerli" },
  { musteri: "Hepsiburada", domain: "hepsiburada.com", son: "2026-08-01", durum: "geçerli" }
];

export function Guvenlik() {
  const kritik = guvenlikUyarilari.filter(u => u.onem === "kritik" && u.durum !== "kapandı").length;
  const açık = guvenlikUyarilari.filter(u => u.durum !== "kapandı").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Güvenlik</h1>
        <p className="text-[#A0A0A0]">Müşteri sistemleri güvenlik durumu ve uyarılar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Uyarı</span>
          </div>
          <div className="text-2xl font-semibold">{guvenlikUyarilari.length}</div>
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
            <Lock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Açık</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{açık}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">SSL Geçerli</span>
          </div>
          <div className="text-2xl font-semibold">
            {sslDurumlari.filter(s => s.durum === "geçerli").length}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Güvenlik Uyarıları</h3>
          <div className="space-y-3">
            {guvenlikUyarilari.map((uyari) => (
              <Card
                key={uyari.id}
                className={`bg-[#1A1A1A] border-white/[0.06] p-4 ${uyari.onem === "kritik" && uyari.durum !== "kapandı" ? "border-l-2 border-l-red-500" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{uyari.tip}</Badge>
                      <span className="text-xs text-[#A0A0A0]">{uyari.musteri}</span>
                    </div>
                    <p className="text-sm text-[#A0A0A0] mb-1">{uyari.mesaj}</p>
                    <p className="text-xs text-[#A0A0A0]">{new Date(uyari.tarih).toLocaleDateString("tr-TR")}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={uyari.onem === "kritik" ? "destructive" : uyari.onem === "yüksek" ? "default" : "secondary"}
                    >
                      {uyari.onem === "kritik" ? "Kritik" : uyari.onem === "yüksek" ? "Yüksek" : "Bilgi"}
                    </Badge>
                    {uyari.durum !== "kapandı" && (
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">SSL Sertifika Durumu</h3>
          <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
            <div className="divide-y divide-white/[0.06]">
              {sslDurumlari.map((ssl, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className={`w-4 h-4 ${ssl.durum === "geçerli" ? "text-[#AAFF01]" : "text-orange-500"}`} />
                      <p className="font-medium text-sm">{ssl.musteri}</p>
                    </div>
                    <p className="text-xs text-[#A0A0A0] font-mono">{ssl.domain}</p>
                    <p className="text-xs text-[#A0A0A0]">
                      Son: {new Date(ssl.son).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <Badge
                    className={
                      ssl.durum === "geçerli"
                        ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                        : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                    }
                  >
                    {ssl.durum === "geçerli" ? "Geçerli" : "Yakında Sona Eriyor"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
