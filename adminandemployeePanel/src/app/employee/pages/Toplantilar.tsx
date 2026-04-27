import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Calendar, Clock, Users, Video, Plus } from "lucide-react";
import { meetings } from "../../data/mockData";

const typeLabel: Record<string, string> = {
  "client-meeting": "Müşteri",
  "sprint-review": "Sprint Review",
  "presentation": "Sunum",
  "brief": "Brief",
};

export function Toplantilar() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Toplantılar</h1>
        <p className="text-[#A0A0A0]">Planlanan ve geçmiş toplantılar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bu Hafta</span>
          </div>
          <div className="text-2xl font-semibold">{meetings.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-[#A0A0A0]">Müşteri Toplantısı</span>
          </div>
          <div className="text-2xl font-semibold text-blue-500">
            {meetings.filter(m => m.type === "client-meeting").length}
          </div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Süre</span>
          </div>
          <div className="text-2xl font-semibold">
            {meetings.reduce((sum, m) => sum + m.duration, 0)} dk
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Yaklaşan Toplantılar</h3>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          <Plus className="w-4 h-4 mr-2" /> Toplantı Ekle
        </Button>
      </div>

      <div className="space-y-3">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="bg-[#1A1A1A] border-white/[0.06] p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[#AAFF01]/10">
                  <Video className="w-5 h-5 text-[#AAFF01]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{meeting.title}</h4>
                    <Badge variant="outline">{typeLabel[meeting.type] ?? meeting.type}</Badge>
                  </div>
                  <p className="text-sm text-[#A0A0A0] mb-2">{meeting.agenda}</p>
                  <div className="flex items-center gap-4 text-xs text-[#A0A0A0]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(meeting.date).toLocaleDateString("tr-TR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {meeting.time} — {meeting.duration} dk
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {meeting.attendees.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30">
                  Planlandı
                </Badge>
                <Button size="sm" variant="outline">Katıl</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
