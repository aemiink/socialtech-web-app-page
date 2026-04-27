import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { MessageSquare, MessageCircle, AlertCircle, CheckCircle, Reply } from "lucide-react";

const mesajlar = [
  {
    id: "1",
    platform: "Instagram DM",
    musteri: "Koçtaş",
    gonderen: "@bahce_sevdalisi",
    mesaj: "Merhaba, bahçe ürünlerinizin fiyat listesini alabilir miyim?",
    zaman: "15 dk önce",
    durum: "yanıtlanmadı",
    tip: "dm"
  },
  {
    id: "2",
    platform: "Instagram Yorum",
    musteri: "Getir",
    gonderen: "@hizli_siparis",
    mesaj: "Siparişim 2 saattir gelmedi, ne zaman gelir?",
    zaman: "32 dk önce",
    durum: "yanıtlandı",
    tip: "yorum"
  },
  {
    id: "3",
    platform: "Facebook DM",
    musteri: "Migros",
    gonderen: "Ali Yılmaz",
    mesaj: "İndirimli ürünler için ne zaman kampanya yapıyorsunuz?",
    zaman: "1 saat önce",
    durum: "yanıtlanmadı",
    tip: "dm"
  },
  {
    id: "4",
    platform: "Instagram Yorum",
    musteri: "Koçtaş",
    gonderen: "@design_home",
    mesaj: "Harika ürünler! Fiyatları çok uygun 👏",
    zaman: "2 saat önce",
    durum: "yanıtlandı",
    tip: "yorum"
  },
  {
    id: "5",
    platform: "TikTok Yorum",
    musteri: "Getir",
    gonderen: "@food_lover_tr",
    mesaj: "Bu reklam gerçekten komik 😂 Sipariş verdim!",
    zaman: "3 saat önce",
    durum: "yanıtlanmadı",
    tip: "yorum"
  }
];

export function DmYorumlar() {
  const yanıtlanmadı = mesajlar.filter(m => m.durum === "yanıtlanmadı").length;
  const yanıtlandı = mesajlar.filter(m => m.durum === "yanıtlandı").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">DM &amp; Yorumlar</h1>
        <p className="text-[#A0A0A0]">Müşteri hesaplarına gelen mesaj ve yorum yönetimi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam</span>
          </div>
          <div className="text-2xl font-semibold">{mesajlar.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Yanıtlanmadı</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{yanıtlanmadı}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Yanıtlandı</span>
          </div>
          <div className="text-2xl font-semibold">{yanıtlandı}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <MessageCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Ort. Yanıt Süresi</span>
          </div>
          <div className="text-2xl font-semibold">48 dk</div>
        </Card>
      </div>

      <div className="space-y-3">
        {mesajlar.map((mesaj) => (
          <Card
            key={mesaj.id}
            className={`bg-[#1A1A1A] border-white/[0.06] p-5 ${mesaj.durum === "yanıtlanmadı" ? "border-l-2 border-l-orange-500" : ""}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${mesaj.tip === "dm" ? "bg-blue-500/10" : "bg-purple-500/10"}`}>
                  {mesaj.tip === "dm"
                    ? <MessageSquare className="w-5 h-5 text-blue-400" />
                    : <MessageCircle className="w-5 h-5 text-purple-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{mesaj.gonderen}</p>
                    <Badge variant="outline">{mesaj.platform}</Badge>
                    <span className="text-xs text-[#A0A0A0]">— {mesaj.musteri}</span>
                  </div>
                  <p className="text-sm text-[#A0A0A0] mb-1">{mesaj.mesaj}</p>
                  <p className="text-xs text-[#A0A0A0]">{mesaj.zaman}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  className={
                    mesaj.durum === "yanıtlandı"
                      ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                      : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  }
                >
                  {mesaj.durum === "yanıtlandı" ? "Yanıtlandı" : "Yanıtlanmadı"}
                </Badge>
                {mesaj.durum === "yanıtlanmadı" && (
                  <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
                    <Reply className="w-4 h-4 mr-1" /> Yanıtla
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
