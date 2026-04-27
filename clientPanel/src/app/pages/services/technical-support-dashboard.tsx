import { AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';

const stats = [
  { title: 'Açık Talepler', value: '2', icon: AlertCircle, color: 'orange' },
  { title: 'Çözülen', value: '47', icon: CheckCircle, color: 'green' },
  { title: 'Ort. Yanıt Süresi', value: '12 dk', icon: Clock, color: 'blue' },
  { title: 'Bu Ay Toplam', value: '49', icon: Zap, color: 'purple' },
];

const openTickets = [
  {
    id: '#2847',
    title: 'Ödeme sayfası yavaş yükleniyor',
    priority: 'high',
    status: 'in-progress',
    createdAt: '2 saat önce',
    assignedTo: 'Ahmet Demir'
  },
  {
    id: '#2846',
    title: 'Mobil menü açılmıyor',
    priority: 'medium',
    status: 'investigating',
    createdAt: '5 saat önce',
    assignedTo: 'Zeynep Kara'
  },
];

const resolvedTickets = [
  { id: '#2845', title: 'E-posta bildirimleri gelmiyor', resolvedAt: '1 gün önce', resolution: '15 dk' },
  { id: '#2844', title: 'Kullanıcı profili güncelleme hatası', resolvedAt: '2 gün önce', resolution: '32 dk' },
  { id: '#2843', title: 'Arama fonksiyonu çalışmıyor', resolvedAt: '3 gün önce', resolution: '48 dk' },
];

export function TechnicalSupportDashboard() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Teknik Destek</h1>
        <p className="text-[#A0A0A0]">Destek taleplerinin durumu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const colorMap = {
            orange: { bg: 'bg-[#FFA726]/10', text: 'text-[#FFA726]' },
            green: { bg: 'bg-[#AAFF01]/10', text: 'text-[#AAFF01]' },
            blue: { bg: 'bg-[#00D4FF]/10', text: 'text-[#00D4FF]' },
            purple: { bg: 'bg-[#7B61FF]/10', text: 'text-[#7B61FF]' },
          };
          const colors = colorMap[stat.color as keyof typeof colorMap];

          return (
            <div key={i} className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
              <div className="flex items-start justify-between mb-4">
                <span className="text-[#A0A0A0] text-sm">{stat.title}</span>
                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${colors.text}`} />
                </div>
              </div>
              <div className={`text-3xl ${colors.text}`}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-white">Açık Talepler</h2>
            <span className="px-2 py-1 rounded bg-[#FFA726]/10 text-[#FFA726] text-xs">
              {openTickets.length} aktif
            </span>
          </div>
          <div className="space-y-3">
            {openTickets.map((ticket) => (
              <div key={ticket.id} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[#A0A0A0]">{ticket.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        ticket.priority === 'high'
                          ? 'bg-[#ff4444]/10 text-[#ff4444]'
                          : 'bg-[#FFA726]/10 text-[#FFA726]'
                      }`}>
                        {ticket.priority === 'high' ? 'Acil' : 'Orta'}
                      </span>
                    </div>
                    <h3 className="text-white mb-2">{ticket.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-[#A0A0A0]">
                      <span>{ticket.createdAt}</span>
                      <span>•</span>
                      <span>Atanan: {ticket.assignedTo}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FFA726]" />
                  <span className="text-sm text-[#FFA726]">
                    {ticket.status === 'in-progress' ? 'Çözüm üzerinde' : 'İnceleme aşamasında'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Son Çözülenler</h2>
          <div className="space-y-3">
            {resolvedTickets.map((ticket) => (
              <div key={ticket.id} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#AAFF01] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[#A0A0A0]">{ticket.id}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#AAFF01]/10 text-[#AAFF01]">
                        Çözüldü
                      </span>
                    </div>
                    <h3 className="text-white mb-2">{ticket.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-[#A0A0A0]">
                      <span>{ticket.resolvedAt}</span>
                      <span>•</span>
                      <span>Çözüm süresi: {ticket.resolution}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-6 border border-[#AAFF01]/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-[#AAFF01]" />
            </div>
            <div>
              <h2 className="text-xl text-white mb-2">Teknik Destek Ekibi Yorumu</h2>
              <p className="text-[#A0A0A0] text-sm mb-4">
                Bu hafta 2 acil talep aldık ve her ikisi de 20 dakika içinde çözüldü. Proaktif izleme sistemimiz
                sayesinde potansiyel sorunları tespit edip müdahale ediyoruz.
              </p>
              <p className="text-[#A0A0A0] text-sm mb-4">
                Tüm sistemleriniz stabil çalışıyor. Server uptime %99.98. Önümüzdeki hafta güvenlik güncellemeleri
                planlı, hiçbir kesinti olmayacak.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#AAFF01] mb-4">
                <Zap className="w-4 h-4" />
                <span>Sistem durumu: Tüm sistemler çalışıyor</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]"></div>
                <span>Ahmet Demir - Teknik Destek Lideri</span>
                <span className="ml-auto">27 Nisan 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
