import { useParams, Link } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ArrowLeft, Calendar, User, AlertCircle } from "lucide-react";

export function TaskDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/gorevler">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-1">Meta ADS kampanya optimizasyonu</h1>
          <p className="text-[#A0A0A0]">XYZ Holding • Meta ADS</p>
        </div>
        <Badge variant="destructive">Yüksek Öncelik</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <User className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Atanan</span>
          </div>
          <div className="text-lg font-semibold">Zeynep Y.</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Deadline</span>
          </div>
          <div className="text-lg font-semibold">28 Nisan 2026</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Durum</span>
          </div>
          <div className="text-lg font-semibold">Devam Ediyor</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Öncelik</span>
          </div>
          <div className="text-lg font-semibold">Yüksek</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Görev Bilgileri</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#A0A0A0] mb-1">Açıklama</p>
                <p className="text-sm">Meta ADS kampanyalarının performansını analiz et ve optimizasyon önerileri hazırla. CPA ve ROAS metriklerini iyileştir.</p>
              </div>
              <div>
                <p className="text-sm text-[#A0A0A0] mb-1">İlişkili Proje</p>
                <p className="text-sm">E-Ticaret Kampanyası</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Alt Görevler</h3>
            <div className="space-y-2">
              {[
                { label: "Mevcut kampanya performansını analiz et", completed: true },
                { label: "Hedef kitle segmentlerini gözden geçir", completed: true },
                { label: "Kreatif varyasyonları test et", completed: false },
                { label: "Bütçe dağılımını optimize et", completed: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <input type="checkbox" checked={item.completed} readOnly className="w-4 h-4" />
                  <span className={item.completed ? "text-[#A0A0A0] line-through" : ""}>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Aktivite</h3>
            <div className="space-y-4">
              {[
                { user: "Zeynep Y.", action: "görevi başlattı", time: "2 saat önce" },
                { user: "Ahmet K.", action: "yorum ekledi", time: "5 saat önce" },
                { user: "Zeynep Y.", action: "dosya yükledi", time: "1 gün önce" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b border-white/[0.06] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-[#AAFF01]/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#AAFF01]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm"><span className="font-medium">{activity.user}</span> {activity.action}</p>
                    <p className="text-xs text-[#A0A0A0]">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">İç Yorumlar</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-sm mb-2">Müşteri CPA hedefini %20 düşürmek istiyor.</p>
                <p className="text-xs text-[#A0A0A0]">Ahmet K. • 5 saat önce</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">Yorum Ekle</Button>
          </Card>

          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Ekler</h3>
            <div className="space-y-2">
              {["Kampanya Raporu.pdf", "Optimizasyon Önerileri.xlsx"].map((file, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/5 text-sm hover:bg-white/10 cursor-pointer transition-colors">
                  {file}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">Dosya Ekle</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
