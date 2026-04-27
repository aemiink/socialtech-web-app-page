import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Bell, CheckSquare, AlertCircle, MessageSquare, FileText } from "lucide-react";

export function Bildirimler() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Bildirimler</h1>
        <p className="text-[#A0A0A0]">Tüm bildirimler ve güncellemeler</p>
      </div>

      <div className="flex items-center gap-4">
        <Button size="sm" variant="outline">Tümünü Okundu İşaretle</Button>
        <Button size="sm" variant="outline">Filtreleri Temizle</Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {[
          { type: "task", icon: CheckSquare, title: "Yeni görev atandı", message: "Meta ADS kampanya optimizasyonu", time: "5 dk önce", read: false },
          { type: "approval", icon: AlertCircle, title: "Onay bekleniyor", message: "XYZ Holding haftalık içerik planı", time: "1 saat önce", read: false },
          { type: "message", icon: MessageSquare, title: "Yeni yorum", message: "ABC Corp projesinde yorum yapıldı", time: "2 saat önce", read: false },
          { type: "task", icon: CheckSquare, title: "Görev tamamlandı", message: "Landing page tasarımı onaylandı", time: "3 saat önce", read: true },
          { type: "report", icon: FileText, title: "Rapor hazır", message: "DEF Medya aylık performans raporu", time: "5 saat önce", read: true },
          { type: "deadline", icon: AlertCircle, title: "Deadline yaklaşıyor", message: "Kampanya raporu - 1 gün kaldı", time: "1 gün önce", read: true },
        ].map((notification, i) => {
          const Icon = notification.icon;
          return (
            <Card key={i} className={`${notification.read ? 'bg-[#1A1A1A]' : 'bg-[#1A1A1A] border-[#AAFF01]/30'} border-white/[0.06] p-4 hover:bg-white/5 transition-colors cursor-pointer`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${notification.type === 'approval' || notification.type === 'deadline' ? 'bg-orange-500/20' : 'bg-[#AAFF01]/20'}`}>
                  <Icon className={`w-5 h-5 ${notification.type === 'approval' || notification.type === 'deadline' ? 'text-orange-500' : 'text-[#AAFF01]'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    {!notification.read && <div className="w-2 h-2 bg-[#AAFF01] rounded-full" />}
                  </div>
                  <p className="text-sm text-[#A0A0A0] mb-2">{notification.message}</p>
                  <p className="text-xs text-[#A0A0A0]">{notification.time}</p>
                </div>
                <Button size="sm" variant="ghost">
                  <CheckSquare className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button variant="outline">Daha Fazla Yükle</Button>
      </div>
    </div>
  );
}
