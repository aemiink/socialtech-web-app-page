import { BadgeCheck, Bell, Lock, User, Users } from 'lucide-react';
import { Button } from '../components/button';
import { useState } from 'react';

const tabs = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'brand', label: 'Marka Bilgileri', icon: BadgeCheck },
  { id: 'notifications', label: 'Bildirimler', icon: Bell },
  { id: 'security', label: 'Güvenlik', icon: Lock },
  { id: 'team', label: 'Kullanıcılar & Yetkiler', icon: Users },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Ayarlar</h1>
        <p className="text-[#A0A0A0]">Hesap tercihlerinizi yönetin</p>
      </div>

      <div className="flex gap-6">
        <div className="w-64 bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.08] h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#AAFF01]/10 text-[#AAFF01]'
                      : 'text-[#A0A0A0] hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl text-white">Profil Ayarları</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Ad Soyad</label>
                  <input
                    type="text"
                    defaultValue="Ahmet Yılmaz"
                    className="w-full px-4 py-2 rounded-lg bg-[#202020] border border-white/[0.08] text-white focus:border-[#AAFF01] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">E-posta</label>
                  <input
                    type="email"
                    defaultValue="ahmet@acmedijital.com"
                    className="w-full px-4 py-2 rounded-lg bg-[#202020] border border-white/[0.08] text-white focus:border-[#AAFF01] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Şirket</label>
                  <input
                    type="text"
                    defaultValue="Acme Dijital Ajans"
                    className="w-full px-4 py-2 rounded-lg bg-[#202020] border border-white/[0.08] text-white focus:border-[#AAFF01] focus:outline-none transition-colors"
                  />
                </div>
                <Button variant="primary">Değişiklikleri Kaydet</Button>
              </div>
            </div>
          )}

          {activeTab === 'brand' && (
            <div className="space-y-6">
              <h2 className="text-xl text-white">Marka Bilgileri</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['Marka Dili', 'Samimi, net, güven veren'],
                  ['Ana Teklif', 'Ölçeklenebilir dijital büyüme'],
                  ['Hedef Kitle', 'E-ticaret ve hizmet işletmeleri'],
                  ['Öncelikli Kanal', 'Meta ADS + Google ADS'],
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                    <p className="text-xs text-[#A0A0A0] mb-1">{label}</p>
                    <p className="text-white">{value}</p>
                  </div>
                ))}
              </div>
              <Button variant="primary">Marka Bilgilerini Güncelle</Button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl text-white">Bildirim Tercihleri</h2>
              <div className="space-y-4">
                {['E-posta bildirimleri', 'Kampanya uyarıları', 'Haftalık raporlar', 'İçerik onayları'].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-[#202020] rounded-xl border border-white/[0.08]">
                    <span className="text-white">{item}</span>
                    <div className="w-12 h-6 bg-[#AAFF01] rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-black rounded-full absolute right-0.5 top-0.5"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl text-white">Güvenlik Ayarları</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Mevcut Şifre</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded-lg bg-[#202020] border border-white/[0.08] text-white focus:border-[#AAFF01] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#A0A0A0] mb-2">Yeni Şifre</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded-lg bg-[#202020] border border-white/[0.08] text-white focus:border-[#AAFF01] focus:outline-none transition-colors"
                  />
                </div>
                <Button variant="primary">Şifreyi Güncelle</Button>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <h2 className="text-xl text-white">Kullanıcılar & Yetkiler</h2>
              <p className="text-[#A0A0A0]">Paneli görüntüleyen müşteri kullanıcılarını ve izinlerini yönetin</p>
              <div className="space-y-3">
                {[
                  ['Ahmet Yılmaz', 'Yönetici', 'Tüm servisler'],
                  ['Zeynep Kaya', 'Pazarlama', 'Raporlar ve onaylar'],
                  ['Mert Demir', 'Finans', 'Faturalama'],
                ].map(([name, role, scope]) => (
                  <div key={name} className="flex items-center justify-between bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                    <div>
                      <p className="text-white">{name}</p>
                      <p className="text-sm text-[#A0A0A0]">{role} • {scope}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded border border-[#AAFF01]/20 bg-[#AAFF01]/10 text-[#AAFF01]">
                      Aktif
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="secondary">Yeni Kullanıcı Davet Et</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
