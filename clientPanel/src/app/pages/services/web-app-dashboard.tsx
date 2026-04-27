import { Code, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const phases = [
  { name: 'Planlama', status: 'completed', progress: 100 },
  { name: 'Tasarım', status: 'completed', progress: 100 },
  { name: 'Geliştirme', status: 'in-progress', progress: 65 },
  { name: 'Test', status: 'pending', progress: 0 },
  { name: 'Yayınlama', status: 'pending', progress: 0 },
];

const deliverables = [
  { title: 'Kullanıcı Paneli', status: 'completed', date: '15 Nisan' },
  { title: 'Admin Dashboard', status: 'completed', date: '20 Nisan' },
  { title: 'API Entegrasyonları', status: 'in-progress', date: 'Devam ediyor' },
  { title: 'Ödeme Sistemi', status: 'in-progress', date: 'Devam ediyor' },
  { title: 'Bildirim Sistemi', status: 'pending', date: 'Başlamadı' },
];

const revisions = [
  { title: 'Renk paleti değişikliği', status: 'completed', date: '18 Nisan' },
  { title: 'Menü navigasyon düzenlemesi', status: 'completed', date: '22 Nisan' },
  { title: 'Form validasyon ekleme', status: 'in-progress', date: 'İşlemde' },
];

export function WebAppDashboard() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Web Uygulama Geliştirme</h1>
        <p className="text-[#A0A0A0]">E-ticaret yönetim platformu</p>
      </div>

      <div className="bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-8 border border-[#AAFF01]/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl text-white mb-2">Proje İlerlemesi</h2>
            <p className="text-[#A0A0A0]">Genel tamamlanma durumu</p>
          </div>
          <div className="text-right">
            <div className="text-5xl text-[#AAFF01]">65%</div>
            <div className="text-sm text-[#A0A0A0]">Tamamlandı</div>
          </div>
        </div>

        <div className="bg-[#202020] rounded-full h-3 overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-[#AAFF01] to-[#7B61FF]" style={{ width: '65%' }}></div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {phases.map((phase, i) => (
            <div key={i} className="text-center">
              <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                phase.status === 'completed'
                  ? 'bg-[#AAFF01]/20'
                  : phase.status === 'in-progress'
                  ? 'bg-[#FFA726]/20'
                  : 'bg-white/[0.05]'
              }`}>
                {phase.status === 'completed' ? (
                  <CheckCircle className="w-6 h-6 text-[#AAFF01]" />
                ) : phase.status === 'in-progress' ? (
                  <Clock className="w-6 h-6 text-[#FFA726]" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[#A0A0A0]"></div>
                )}
              </div>
              <div className={`text-sm ${
                phase.status === 'completed'
                  ? 'text-white'
                  : phase.status === 'in-progress'
                  ? 'text-[#FFA726]'
                  : 'text-[#A0A0A0]'
              }`}>
                {phase.name}
              </div>
              <div className="text-xs text-[#A0A0A0] mt-1">{phase.progress}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Teslim Edilenler</h2>
          <div className="space-y-3">
            {deliverables.map((item, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
                    ) : item.status === 'in-progress' ? (
                      <Clock className="w-5 h-5 text-[#FFA726]" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[#A0A0A0]"></div>
                    )}
                    <div>
                      <h3 className="text-white">{item.title}</h3>
                      <p className="text-xs text-[#A0A0A0]">{item.date}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.status === 'completed'
                      ? 'bg-[#AAFF01]/10 text-[#AAFF01]'
                      : item.status === 'in-progress'
                      ? 'bg-[#FFA726]/10 text-[#FFA726]'
                      : 'bg-white/[0.05] text-[#A0A0A0]'
                  }`}>
                    {item.status === 'completed' ? 'Tamamlandı' : item.status === 'in-progress' ? 'Devam Ediyor' : 'Beklemede'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Revizyon Geçmişi</h2>
          <div className="space-y-3">
            {revisions.map((revision, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start gap-3">
                  {revision.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-[#AAFF01] flex-shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 text-[#FFA726] flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-white mb-1">{revision.title}</h3>
                    <p className="text-xs text-[#A0A0A0]">{revision.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Zaman Çizelgesi</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-32 text-[#A0A0A0] text-sm">1-15 Mart</div>
              <div className="flex-1 bg-[#AAFF01]/20 rounded-lg p-3">
                <span className="text-white text-sm">Planlama & Tasarım</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-32 text-[#A0A0A0] text-sm">16 Mart - 30 Nisan</div>
              <div className="flex-1 bg-[#FFA726]/20 rounded-lg p-3">
                <span className="text-white text-sm">Geliştirme (Devam Ediyor)</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-32 text-[#A0A0A0] text-sm">1-15 Mayıs</div>
              <div className="flex-1 bg-white/[0.05] rounded-lg p-3">
                <span className="text-[#A0A0A0] text-sm">Test & QA (Planlı)</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-32 text-[#A0A0A0] text-sm">20 Mayıs</div>
              <div className="flex-1 bg-white/[0.05] rounded-lg p-3">
                <span className="text-[#A0A0A0] text-sm">Yayınlama (Planlı)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-6 border border-[#AAFF01]/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-[#AAFF01]" />
          </div>
          <div>
            <h2 className="text-xl text-white mb-2">Geliştirme Ekibi Yorumu</h2>
            <p className="text-[#A0A0A0] text-sm mb-4">
              Proje planlandığı şekilde ilerliyor. API entegrasyonları tamamlandı ve ödeme sistemi entegre edildi.
              Önümüzdeki hafta kullanıcı testlerine başlayacağız.
            </p>
            <p className="text-[#A0A0A0] text-sm mb-4">
              Son revizyon talebiniz (menü düzenlemesi) uygulandı. Yeni tasarım daha kullanıcı dostu ve
              mobil uyumlu. Geri bildirimleriniz projeyi daha da iyileştiriyor.
            </p>
            <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]"></div>
              <span>Can Arslan - Proje Yöneticisi</span>
              <span className="ml-auto">27 Nisan 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
