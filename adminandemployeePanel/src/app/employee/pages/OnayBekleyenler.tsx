import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Clock, CheckCircle, XCircle, Eye } from "lucide-react";

const onayBekleyenler = [
  {
    id: "1",
    tur: "Gönderi",
    baslik: "Koçtaş haftalık içerik seti (12 post)",
    musteri: "Koçtaş",
    gonderen: "Mehmet Demir",
    tarih: "2026-04-25",
    deadline: "2026-04-28",
    platform: "Instagram, Facebook",
    oncekiRevizyon: 0
  },
  {
    id: "2",
    tur: "Story",
    baslik: "Getir hafta sonu kampanyası story seti",
    musteri: "Getir",
    gonderen: "Mehmet Demir",
    tarih: "2026-04-26",
    deadline: "2026-04-29",
    platform: "Instagram",
    oncekiRevizyon: 1
  },
  {
    id: "3",
    tur: "Reels",
    baslik: "Boyner outlet sezonu reels",
    musteri: "Boyner",
    gonderen: "Mehmet Demir",
    tarih: "2026-04-27",
    deadline: "2026-04-30",
    platform: "Instagram, TikTok",
    oncekiRevizyon: 0
  }
];

export function OnayBekleyenler() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Onay Bekleyenler</h1>
        <p className="text-[#A0A0A0]">Müşteri onayı bekleyen içerik ve yayın setleri</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Bekleyen</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{onayBekleyenler.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bu Hafta Onaylanan</span>
          </div>
          <div className="text-2xl font-semibold">8</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Reddedilen</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">1</div>
        </Card>
      </div>

      <div className="space-y-3">
        {onayBekleyenler.map((item) => (
          <Card key={item.id} className="bg-[#1A1A1A] border-white/[0.06] p-5 border-l-2 border-l-orange-500">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{item.tur}</Badge>
                  <h4 className="font-semibold text-sm">{item.baslik}</h4>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#A0A0A0] mb-2">
                  <span>Müşteri: {item.musteri}</span>
                  <span>Gonderen: {item.gonderen}</span>
                  <span>Platform: {item.platform}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-[#A0A0A0]">
                    Gönderim: {new Date(item.tarih).toLocaleDateString("tr-TR")}
                  </span>
                  <span className="text-orange-400 font-medium">
                    Deadline: {new Date(item.deadline).toLocaleDateString("tr-TR")}
                  </span>
                  {item.oncekiRevizyon > 0 && (
                    <span className="text-red-400">{item.oncekiRevizyon} önceki revizyon</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" /> Önizle
                </Button>
                <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Onayla</Button>
                <Button size="sm" variant="outline">Reddet</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {onayBekleyenler.length === 0 && (
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-12 h-12 text-[#AAFF01] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tüm içerikler onaylandı</h3>
            <p className="text-[#A0A0A0]">Onay bekleyen içerik bulunmuyor.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
