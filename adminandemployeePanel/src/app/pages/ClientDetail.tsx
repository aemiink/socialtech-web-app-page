import { useParams, Link } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ArrowLeft, Mail, Phone, Building2, Calendar, FileText, CheckSquare, AlertCircle, Edit, Plus, ExternalLink, DollarSign, Users } from "lucide-react";

export function ClientDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/musteriler">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-1">XYZ Holding</h1>
          <p className="text-[#A0A0A0]">Growth Scale • Sorumlu: Ahmet K.</p>
        </div>
        <Badge className="bg-[#AAFF01] text-[#131313]">Aktif</Badge>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="w-4 h-4" />
            Düzenle
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Görev Oluştur
          </Button>
          <Button size="sm" className="gap-2 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
            <ExternalLink className="w-4 h-4" />
            Müşteri Panelini Görüntüle
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aylık Değer</span>
          </div>
          <div className="text-xl font-semibold text-[#AAFF01]">₺28,500</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Paket</span>
          </div>
          <div className="text-lg font-semibold">Growth Scale</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Ödeme Durumu</span>
          </div>
          <Badge className="bg-[#AAFF01] text-[#131313]">Ödendi</Badge>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Sözleşme</span>
          </div>
          <Badge variant="secondary">12 ay / Aktif</Badge>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Başlangıç</span>
          </div>
          <div className="text-sm">15 Ocak 2024</div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Services */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Aktif Hizmetler</h3>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Hizmet Ekle
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Meta ADS</h4>
                  <Badge className="bg-[#AAFF01] text-[#131313]">Aktif</Badge>
                </div>
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0]">Sorumlu</span>
                    <span>Zeynep Y.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0]">Son güncelleme</span>
                    <span>2 saat önce</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0]">Bekleyen</span>
                    <span className="text-orange-500">Kampanya optimizasyonu</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full">Hizmeti Yönet</Button>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Sosyal Medya Yönetimi</h4>
                  <Badge className="bg-[#AAFF01] text-[#131313]">Aktif</Badge>
                </div>
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0]">Sorumlu</span>
                    <span>Mehmet A.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0]">Son güncelleme</span>
                    <span>1 gün önce</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0]">Bekleyen</span>
                    <span>-</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full">Hizmeti Yönet</Button>
              </div>
            </div>
          </Card>

          {/* Client Panel Preview - CRITICAL SECTION */}
          <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#202020] border-[#AAFF01]/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#AAFF01]/10">
                  <ExternalLink className="w-5 h-5 text-[#AAFF01]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Müşteri Paneli Önizleme</h3>
                  <p className="text-sm text-[#A0A0A0]">Müşterinin görebildikleri</p>
                </div>
              </div>
              <Button className="gap-2 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
                <ExternalLink className="w-4 h-4" />
                Paneli Görüntüle
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#202020] border-white/[0.06] p-4">
                  <p className="text-xs text-[#A0A0A0] mb-2">Aktif Dashboard'lar</p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#AAFF01]" />
                      Meta ADS Dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#AAFF01]" />
                      Sosyal Medya Dashboard
                    </li>
                  </ul>
                </Card>

                <Card className="bg-[#202020] border-white/[0.06] p-4">
                  <p className="text-xs text-[#A0A0A0] mb-2">Son Görünen Rapor</p>
                  <p className="text-sm font-medium mb-1">Meta ADS - Nisan 2026</p>
                  <p className="text-xs text-[#A0A0A0]">25 Nisan 2026 tarihinde gönderildi</p>
                </Card>

                <Card className="bg-[#202020] border-white/[0.06] p-4">
                  <p className="text-xs text-[#A0A0A0] mb-2">Bekleyen Onaylar</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">3 İçerik</Badge>
                    <Badge variant="outline" className="text-xs">1 Tasarım</Badge>
                  </div>
                  <p className="text-xs text-[#A0A0A0] mt-2">Müşteri onayı bekleniyor</p>
                </Card>
              </div>

              <div className="p-4 rounded-lg bg-[#202020] border border-white/[0.06]">
                <p className="text-xs text-[#A0A0A0] mb-2">Müşteri Erişim Bilgileri</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">panel.socialtech.com/xyz-holding</p>
                    <p className="text-xs text-[#A0A0A0]">Son giriş: 23 Nisan 2026, 14:32</p>
                  </div>
                  <Button size="sm" variant="outline">Giriş Bilgilerini Sıfırla</Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Müşteri Zaman Çizelgesi</h3>
            <div className="space-y-4">
              {[
                { date: "25 Nisan 2026", type: "Toplantı", title: "Aylık performans raporu sunumu yapıldı", icon: Calendar },
                { date: "20 Nisan 2026", type: "Rapor", title: "Meta ADS raporu gönderildi", icon: FileText },
                { date: "18 Nisan 2026", type: "Onay", title: "İçerik onayı alındı", icon: CheckSquare },
                { date: "15 Nisan 2026", type: "Ödeme", title: "Aylık ödeme alındı", icon: CheckSquare },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex gap-4 pb-4 border-b border-white/[0.06] last:border-0">
                    <div className="p-2 rounded-lg bg-[#AAFF01]/10 h-fit">
                      <Icon className="w-4 h-4 text-[#AAFF01]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{item.type}</Badge>
                        <span className="text-xs text-[#A0A0A0]">{item.date}</span>
                      </div>
                      <p className="text-sm">{item.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Tasks */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Görevler</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Kampanya optimizasyonu</span>
                  <Badge variant="secondary" className="text-xs">Devam Ediyor</Badge>
                </div>
                <p className="text-xs text-[#A0A0A0]">Zeynep Y. • Yarına kadar</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Aylık rapor hazırlama</span>
                  <Badge variant="outline" className="text-xs text-orange-500">Müşteri Bekleniyor</Badge>
                </div>
                <p className="text-xs text-[#A0A0A0]">Ahmet K. • 2 gün önce</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">Tüm Görevler</Button>
          </Card>

          {/* Pending Approvals */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Bekleyen Onaylar</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">Haftalık içerik onayı</span>
                </div>
                <p className="text-xs text-[#A0A0A0]">3 içerik • 2 gün bekliyor</p>
              </div>
            </div>
          </Card>

          {/* Internal Notes */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">İç Notlar</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-sm mb-2">Müşteri Meta ADS bütçe artışı istiyor. Önümüzdeki hafta görüşülecek.</p>
                <p className="text-xs text-[#A0A0A0]">Ahmet K. • 3 gün önce</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">Not Ekle</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
