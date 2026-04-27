import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";

export function Takvim() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Takvim</h1>
        <p className="text-[#A0A0A0]">Görevler, toplantılar ve deadline'lar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bugünkü Etkinlik</span>
          </div>
          <div className="text-2xl font-semibold">7</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Bu Hafta Deadline</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">12</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplantılar</span>
          </div>
          <div className="text-2xl font-semibold">4</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Bugün</h3>
            <Badge>27 Nisan 2026</Badge>
          </div>
          <div className="space-y-3">
            {[
              { time: "09:00", title: "Meta ADS optimizasyon", type: "Task", client: "XYZ Holding" },
              { time: "14:00", title: "Müşteri toplantısı", type: "Meeting", client: "ABC Corp" },
              { time: "16:30", title: "Tasarım revizyonu", type: "Task", client: "DEF Medya" },
            ].map((event, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/[0.06]">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-[#AAFF01]">{event.time}</span>
                  <Badge variant="outline" className="text-xs">{event.type}</Badge>
                </div>
                <p className="font-medium text-sm mb-1">{event.title}</p>
                <p className="text-xs text-[#A0A0A0]">{event.client}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Yaklaşan Deadline'lar</h3>
          </div>
          <div className="space-y-3">
            {[
              { date: "28 Nisan", title: "Kampanya raporu", client: "XYZ Holding", urgent: true },
              { date: "29 Nisan", title: "Landing page tasarımı", client: "ABC Corp", urgent: false },
              { date: "30 Nisan", title: "Haftalık içerik planı", client: "DEF Medya", urgent: false },
            ].map((deadline, i) => (
              <div key={i} className={`p-3 rounded-lg ${deadline.urgent ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/5 border border-white/[0.06]'}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{deadline.title}</p>
                  <Badge variant={deadline.urgent ? "destructive" : "outline"} className="text-xs">{deadline.date}</Badge>
                </div>
                <p className="text-xs text-[#A0A0A0]">{deadline.client}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">Tüm Deadline'lar</Button>
        </Card>
      </div>
    </div>
  );
}
