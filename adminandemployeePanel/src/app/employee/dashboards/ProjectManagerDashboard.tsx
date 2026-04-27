import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Users, FolderKanban, AlertCircle, Clock, FileText, Calendar } from "lucide-react";

export function ProjectManagerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Project Manager Dashboard</h1>
        <p className="text-[#A0A0A0]">Müşteri teslimat ve görev yönetimi</p>
      </div>

      {/* Delivery Health KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Müşteri</span>
          </div>
          <div className="text-2xl font-semibold">8</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FolderKanban className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Açık Proje</span>
          </div>
          <div className="text-2xl font-semibold">12</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Bekleyen Onay</span>
          </div>
          <div className="text-2xl font-semibold">7</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Geciken Teslimat</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">2</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Delivery Board */}
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Müşteri Teslimat Durumu</h3>
          <div className="space-y-3">
            {[
              { client: "XYZ Holding", services: "Meta ADS, Social Media", blocker: "Müşteri yanıtı bekleniyor", nextDelivery: "Kampanya raporu - 28 Nisan" },
              { client: "ABC Corporation", services: "Web APP", blocker: "-", nextDelivery: "Sprint teslimi - 30 Nisan" },
              { client: "DEF Medya", services: "Social Media", blocker: "İçerik onayı bekliyor", nextDelivery: "Haftalık içerik - 29 Nisan" },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{item.client}</h4>
                  <Badge variant="outline" className="text-xs">{item.services}</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-[#A0A0A0]">Engel: <span className={item.blocker === "-" ? "text-[#AAFF01]" : "text-orange-500"}>{item.blocker}</span></p>
                  <p className="text-[#A0A0A0]">Sonraki teslimat: {item.nextDelivery}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Bekleyen Onaylar</h3>
          <div className="space-y-3">
            {[
              { type: "İçerik", client: "XYZ Holding", title: "Haftalık sosyal medya içerikleri", waiting: "2 gün" },
              { type: "Tasarım", client: "DEF Medya", title: "Landing page tasarımı", waiting: "1 gün" },
              { type: "Rapor", client: "GHI Teknoloji", title: "Google ADS raporu", waiting: "3 saat" },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{item.type}</Badge>
                  <span className="text-sm font-medium">{item.client}</span>
                </div>
                <p className="text-sm text-[#A0A0A0] mb-1">{item.title}</p>
                <p className="text-xs text-orange-500">Bekliyor: {item.waiting}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">Tüm Onaylar</Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Meetings */}
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Yaklaşan Toplantılar</h3>
          </div>
          <div className="space-y-3">
            {[
              { time: "14:00", client: "XYZ Holding", type: "Rapor Sunumu" },
              { time: "16:30", client: "ABC Corp", type: "Sprint Review" },
            ].map((meeting, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-medium text-[#AAFF01]">{meeting.time}</span>
                  <Badge variant="outline" className="text-xs">{meeting.type}</Badge>
                </div>
                <p className="text-sm">{meeting.client}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Client Follow-up Queue */}
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Müşteri Takip Kuyruğu</h3>
          <div className="space-y-2">
            {[
              { client: "XYZ Holding", action: "Onay hatırlatması gönder", days: 2 },
              { client: "DEF Medya", action: "Brief toplantısı planla", days: 1 },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <p className="text-sm font-medium mb-1">{item.client}</p>
                <p className="text-xs text-[#A0A0A0] mb-2">{item.action}</p>
                <Badge variant="secondary" className="text-xs">{item.days} gün gecikti</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Internal Notes */}
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Ajans Notları</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-sm mb-2">XYZ Holding kampanya bütçesini artırmak istiyor.</p>
              <p className="text-xs text-[#A0A0A0]">2 saat önce</p>
            </div>
            <Button variant="outline" size="sm" className="w-full">Not Ekle</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
