import { useParams, Link } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { ArrowLeft, Download, Send, Save } from "lucide-react";

export function ReportDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/raporlar">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-1">Meta ADS Aylık Rapor - Nisan 2026</h1>
          <p className="text-[#A0A0A0]">XYZ Holding • Meta ADS</p>
        </div>
        <Badge className="bg-[#AAFF01] text-[#131313]">İncelemede</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* KPI Summary */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">KPI Özeti</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-[#A0A0A0] mb-1">Harcama</p>
                <p className="text-xl font-semibold">₺42,350</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-[#A0A0A0] mb-1">ROAS</p>
                <p className="text-xl font-semibold text-[#AAFF01]">4.2</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-[#A0A0A0] mb-1">CPA</p>
                <p className="text-xl font-semibold">₺18.50</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-[#A0A0A0] mb-1">Dönüşüm</p>
                <p className="text-xl font-semibold">2,289</p>
              </div>
            </div>
          </Card>

          {/* What Worked */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Ne İşe Yaradı?</h3>
            <Textarea
              className="min-h-[120px] bg-[#202020] border-white/[0.06]"
              placeholder="Bu ay başarılı olan stratejileri yazın..."
              defaultValue="- Bahar koleksiyonu kampanyası yüksek dönüşüm getirdi&#10;- Video formatları carousel'lara göre %35 daha iyi performans gösterdi&#10;- Lookalike audience segmenti hedefi aştı"
            />
          </Card>

          {/* What Is Being Improved */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Neyi İyileştiriyoruz?</h3>
            <Textarea
              className="min-h-[120px] bg-[#202020] border-white/[0.06]"
              placeholder="İyileştirme alanlarını yazın..."
              defaultValue="- CPA'yı düşürmek için hedefleme stratejisi optimize ediliyor&#10;- Mobil kullanıcılar için landing page hızı artırılacak&#10;- A/B test için yeni kreatif varyasyonlar hazırlanıyor"
            />
          </Card>

          {/* Next Actions */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Sonraki Adımlar</h3>
            <div className="space-y-2">
              {[
                "Bahar kampanyası bütçesini artır",
                "Yeni hedef kitle segmentleri test et",
                "Video kreatif üretimini hızlandır",
                "Landing page optimizasyonu yap",
              ].map((action, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">{action}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Internal Review */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">İç İnceleme</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#A0A0A0] mb-1">İnceleyen</p>
                <p className="text-sm font-medium">Ahmet K.</p>
              </div>
              <div>
                <p className="text-sm text-[#A0A0A0] mb-2">Notlar</p>
                <Textarea
                  className="min-h-[80px] bg-[#202020] border-white/[0.06] text-sm"
                  placeholder="İnceleme notları..."
                />
              </div>
              <div>
                <p className="text-sm text-[#A0A0A0] mb-2">Onay Durumu</p>
                <Badge className="bg-[#AAFF01] text-[#131313]">İncelemede</Badge>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">İşlemler</h3>
            <div className="space-y-2">
              <Button className="w-full gap-2" variant="outline">
                <Save className="w-4 h-4" />
                Taslak Olarak Kaydet
              </Button>
              <Button className="w-full gap-2" variant="outline">
                <Send className="w-4 h-4" />
                İncelemeye Gönder
              </Button>
              <Button className="w-full gap-2 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
                <Send className="w-4 h-4" />
                Müşteriye Gönder
              </Button>
              <Button className="w-full gap-2" variant="outline">
                <Download className="w-4 h-4" />
                PDF İndir
              </Button>
            </div>
          </Card>

          {/* Period Info */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Rapor Bilgileri</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[#A0A0A0] mb-1">Dönem</p>
                <p>Nisan 2026</p>
              </div>
              <div>
                <p className="text-[#A0A0A0] mb-1">Oluşturan</p>
                <p>Zeynep Y.</p>
              </div>
              <div>
                <p className="text-[#A0A0A0] mb-1">Oluşturulma</p>
                <p>25 Nisan 2026</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
