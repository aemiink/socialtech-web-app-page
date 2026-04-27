import { useParams, Link } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react";

export function EmployeeDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/calisanlar">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <Avatar className="w-16 h-16 bg-[#AAFF01] text-[#131313]">
          <AvatarFallback>AK</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-1">Ahmet Kaya</h1>
          <p className="text-[#A0A0A0]">Project Manager</p>
        </div>
        <Badge variant="destructive">Yoğun</Badge>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">E-posta</span>
          </div>
          <div className="text-sm">ahmet.kaya@socialtech.com</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Phone className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Telefon</span>
          </div>
          <div className="text-sm">+90 532 123 45 67</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Başlangıç Tarihi</span>
          </div>
          <div className="text-sm">15 Ocak 2023</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm text-[#A0A0A0]">Aktif Müşteri</span>
          </div>
          <div className="text-2xl font-semibold">8</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned Clients */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Sorumlu Müşteriler</h3>
            <div className="space-y-2">
              {["XYZ Holding", "ABC Corporation", "DEF Medya", "GHI Teknoloji"].map((client, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span>{client}</span>
                  <Badge variant="outline">Aktif</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Active Tasks */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Aktif Görevler (12)</h3>
            <div className="space-y-2">
              {[
                { title: "XYZ Holding rapor sunumu", deadline: "28 Nisan 2026", status: "Devam Ediyor" },
                { title: "ABC Corp stratejik planlama", deadline: "29 Nisan 2026", status: "Planlanan" },
                { title: "DEF Medya kampanya analizi", deadline: "30 Nisan 2026", status: "İncelemede" },
              ].map((task, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{task.title}</span>
                    <Badge variant="secondary" className="text-xs">{task.status}</Badge>
                  </div>
                  <p className="text-xs text-[#A0A0A0]">Deadline: {task.deadline}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Completed This Month */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Bu Ay Tamamlananlar</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-2xl font-semibold text-[#AAFF01] mb-1">24</p>
                <p className="text-xs text-[#A0A0A0]">Görev</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-2xl font-semibold text-[#AAFF01] mb-1">8</p>
                <p className="text-xs text-[#A0A0A0]">Rapor</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-2xl font-semibold text-[#AAFF01] mb-1">5</p>
                <p className="text-xs text-[#A0A0A0]">Toplantı</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Late Tasks */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Geciken Görevler (2)</h3>
            <div className="space-y-2">
              {[
                { title: "Müşteri raporu", days: 3 },
                { title: "Strateji dokümanı", days: 1 },
              ].map((task, i) => (
                <div key={i} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm font-medium mb-1">{task.title}</p>
                  <p className="text-xs text-red-500">{task.days} gün gecikmiş</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Performance Summary */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Performans Özeti</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#A0A0A0]">Görev Tamamlama</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#AAFF01]" style={{ width: '92%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#A0A0A0]">Zamanında Teslimat</span>
                  <span className="font-medium">88%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#AAFF01]" style={{ width: '88%' }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Internal Notes */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">İç Notlar</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-sm mb-2">Proje yönetiminde çok başarılı. Müşteri ilişkileri mükemmel.</p>
                <p className="text-xs text-[#A0A0A0]">Admin • 10 Mart 2026</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">Not Ekle</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
