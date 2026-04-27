import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Zap, CheckCircle, Clock, Circle, ChevronRight } from "lucide-react";

const sprintler = [
  {
    id: "1",
    ad: "Sprint 8",
    proje: "Türk Telekom Fiber Lansmanı",
    musteri: "Türk Telekom",
    baslangic: "2026-04-14",
    bitis: "2026-04-27",
    durum: "tamamlandı",
    tamamlanan: 12,
    toplam: 12,
    hikayeNoktasi: 42
  },
  {
    id: "2",
    ad: "Sprint 9",
    proje: "Türk Telekom Fiber Lansmanı",
    musteri: "Türk Telekom",
    baslangic: "2026-04-28",
    bitis: "2026-05-11",
    durum: "aktif",
    tamamlanan: 2,
    toplam: 14,
    hikayeNoktasi: 48
  },
  {
    id: "3",
    ad: "Sprint 3",
    proje: "Teknosa E-ticaret Platformu",
    musteri: "Teknosa",
    baslangic: "2026-04-21",
    bitis: "2026-05-04",
    durum: "aktif",
    tamamlanan: 5,
    toplam: 16,
    hikayeNoktasi: 56
  }
];

const gorevler = [
  { id: "1", sprint: "Sprint 9", baslik: "API gateway timeout düzeltmesi", oncelik: "kritik", durum: "devam-ediyor" },
  { id: "2", sprint: "Sprint 9", baslik: "Ödeme sayfası UI entegrasyonu", oncelik: "yüksek", durum: "devam-ediyor" },
  { id: "3", sprint: "Sprint 9", baslik: "Unit test coverage artırma", oncelik: "normal", durum: "bekliyor" },
  { id: "4", sprint: "Sprint 3", baslik: "Ürün listeleme pagination", oncelik: "yüksek", durum: "tamamlandı" },
  { id: "5", sprint: "Sprint 3", baslik: "Sepet mikro hizmet entegrasyonu", oncelik: "kritik", durum: "devam-ediyor" }
];

export function Sprintler() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Sprintler</h1>
        <p className="text-[#A0A0A0]">Aktif ve tamamlanan sprint yönetimi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Sprint</span>
          </div>
          <div className="text-2xl font-semibold">{sprintler.filter(s => s.durum === "aktif").length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Tamamlanan</span>
          </div>
          <div className="text-2xl font-semibold">{sprintler.filter(s => s.durum === "tamamlandı").length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Story Puanı</span>
          </div>
          <div className="text-2xl font-semibold">
            {sprintler.filter(s => s.durum === "aktif").reduce((sum, s) => sum + s.hikayeNoktasi, 0)}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {sprintler.map((sprint) => (
          <Card key={sprint.id} className="bg-[#1A1A1A] border-white/[0.06] p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{sprint.ad}</h4>
                  <Badge
                    className={
                      sprint.durum === "aktif"
                        ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                        : "bg-white/10 text-[#A0A0A0] border-white/10"
                    }
                  >
                    {sprint.durum === "aktif" ? "Aktif" : "Tamamlandı"}
                  </Badge>
                </div>
                <p className="text-xs text-[#A0A0A0]">
                  {sprint.musteri} · {sprint.proje}
                </p>
              </div>
              <div className="text-right text-xs text-[#A0A0A0]">
                <p>{new Date(sprint.baslangic).toLocaleDateString("tr-TR")}</p>
                <p>— {new Date(sprint.bitis).toLocaleDateString("tr-TR")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-white/10 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-[#AAFF01]"
                  style={{ width: `${Math.round((sprint.tamamlanan / sprint.toplam) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-[#A0A0A0]">
                {sprint.tamamlanan}/{sprint.toplam} görev · {sprint.hikayeNoktasi} SP
              </span>
            </div>
            <Button size="sm" variant="outline" className="mt-2">
              Detaylar <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold">Aktif Sprint Görevleri</h3>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {gorevler.map((gorev) => (
            <div key={gorev.id} className="p-4 hover:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {gorev.durum === "tamamlandı"
                  ? <CheckCircle className="w-4 h-4 text-[#AAFF01]" />
                  : gorev.durum === "devam-ediyor"
                  ? <Clock className="w-4 h-4 text-blue-400" />
                  : <Circle className="w-4 h-4 text-[#A0A0A0]" />}
                <div>
                  <p className="text-sm font-medium">{gorev.baslik}</p>
                  <p className="text-xs text-[#A0A0A0]">{gorev.sprint}</p>
                </div>
              </div>
              <Badge
                variant={gorev.oncelik === "kritik" ? "destructive" : gorev.oncelik === "yüksek" ? "default" : "secondary"}
              >
                {gorev.oncelik === "kritik" ? "Kritik" : gorev.oncelik === "yüksek" ? "Yüksek" : "Normal"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
