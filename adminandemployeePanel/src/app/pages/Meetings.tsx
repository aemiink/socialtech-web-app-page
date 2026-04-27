import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Calendar, Clock, Users, Plus, Video } from "lucide-react";
import { meetings } from "../data/mockData";

export function Meetings() {
  const upcomingMeetings = meetings.filter(m => m.status === "scheduled");
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Toplantılar</h1>
          <p className="text-[#A0A0A0]">Müşteri ve ekip toplantıları</p>
        </div>
        <Button className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 gap-2">
          <Plus className="w-4 h-4" />
          Yeni Toplantı Planla
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bu Hafta</span>
          </div>
          <div className="text-2xl font-semibold">{upcomingMeetings.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Bugün</span>
          </div>
          <div className="text-2xl font-semibold">{upcomingMeetings.filter(m => m.date === "2026-04-29" || m.date === "2026-04-30").length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Müşteri Toplantısı</span>
          </div>
          <div className="text-2xl font-semibold">{meetings.filter(m => m.type === "client-meeting" || m.type === "presentation" || m.type === "brief").length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Video className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Online</span>
          </div>
          <div className="text-2xl font-semibold">{Math.floor(meetings.length * 0.7)}</div>
        </Card>
      </div>

      {/* Meetings List */}
      <div className="grid grid-cols-1 gap-4">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="bg-[#1A1A1A] border-white/[0.06] p-6 hover:bg-white/5 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{meeting.title}</h3>
                  <Badge variant={
                    meeting.type === "client-meeting" ? "default" :
                    meeting.type === "sprint-review" ? "secondary" :
                    meeting.type === "presentation" ? "outline" :
                    "outline"
                  } className={meeting.type === "client-meeting" ? "bg-[#AAFF01] text-[#131313]" : ""}>
                    {meeting.type === "client-meeting" ? "Müşteri Görüşmesi" :
                     meeting.type === "sprint-review" ? "Sprint Review" :
                     meeting.type === "presentation" ? "Sunum" :
                     meeting.type === "brief" ? "Brief" : "Diğer"}
                  </Badge>
                  <Badge variant={meeting.status === "scheduled" ? "default" : "secondary"}>
                    {meeting.status === "scheduled" ? "Zamanlandı" : "Tamamlandı"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-[#A0A0A0]">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(meeting.date).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#A0A0A0]">
                    <Clock className="w-4 h-4" />
                    <span>{meeting.time} ({meeting.duration} dk)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#A0A0A0]">
                    <Users className="w-4 h-4" />
                    <span>{meeting.attendees.length} katılımcı</span>
                  </div>
                  <div className="text-[#A0A0A0]">
                    {meeting.client}
                  </div>
                </div>

                {meeting.agenda && (
                  <div className="mt-3 p-3 bg-white/5 rounded-lg">
                    <p className="text-xs text-[#A0A0A0] mb-1">Gündem:</p>
                    <p className="text-sm">{meeting.agenda}</p>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {meeting.attendees.map((attendee, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {attendee}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {meeting.status === "scheduled" && (
                  <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Katıl</Button>
                )}
                <Button size="sm" variant="outline">Detay</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
