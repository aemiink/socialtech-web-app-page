import { Video, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../components/button';

const upcomingMeetings = [
  { title: 'Aylık Strateji Toplantısı', date: '2 Mayıs 2026', time: '14:00', duration: '60 dk', type: 'Strateji Görüşmesi' },
  { title: 'Mayıs Kampanya Planlama', date: '8 Mayıs 2026', time: '10:00', duration: '45 dk', type: 'Planlama' },
];

const pastMeetings = [
  { title: 'Nisan Performans İncelemesi', date: '25 Nisan 2026', summary: 'UGC içerik başarısı konuşuldu. Mayıs planı onaylandı.', action: 'Yeni UGC brief seti Social Tech tarafından hazırlanacak.' },
  { title: 'Yaz Kampanya Briefing', date: '18 Nisan 2026', summary: 'Hedef kitle ve yaratıcı konsept üzerinde anlaşıldı.', action: 'Müşteri ürün fotoğraflarını paylaşacak.' },
  { title: 'Q2 Hedef Belirleme', date: '4 Nisan 2026', summary: 'Çeyreklik KPI\'lar ve bütçe dağılımı netleştirildi.', action: 'Yeni bütçe dağılımı raporda takip edilecek.' },
];

export function MeetingsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Toplantılar</h1>
        <p className="text-[#A0A0A0]">Social Tech ekibi ile planlı görüşmeleriniz</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Yaklaşan Toplantılar</h2>
          <div className="space-y-3">
            {upcomingMeetings.map((meeting, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white mb-2">{meeting.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#7B61FF]/10 text-[#7B61FF]">
                      {meeting.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#A0A0A0] mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{meeting.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{meeting.time} ({meeting.duration})</span>
                  </div>
                </div>
                <Button variant="primary" icon={Video} className="w-full justify-center text-sm">
                  Toplantıya Katıl
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Geçmiş Toplantılar</h2>
          <div className="space-y-3">
            {pastMeetings.map((meeting, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#AAFF01] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-white mb-1">{meeting.title}</h3>
                    <p className="text-sm text-[#A0A0A0] mb-2">{meeting.date}</p>
                    <p className="text-sm text-[#A0A0A0]">Özet: {meeting.summary}</p>
                    <p className="text-sm text-[#AAFF01] mt-2">Aksiyon: {meeting.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
