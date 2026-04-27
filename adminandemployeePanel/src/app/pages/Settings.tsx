import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Building2, Users, Briefcase, Bell, Shield, Link as LinkIcon } from "lucide-react";

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Ayarlar</h1>
        <p className="text-[#A0A0A0]">Sistem ayarlarını yönetin</p>
      </div>

      <Tabs defaultValue="agency" className="space-y-6">
        <TabsList className="bg-[#1A1A1A] border border-white/[0.06]">
          <TabsTrigger value="agency">Ajans Profili</TabsTrigger>
          <TabsTrigger value="roles">Roller & Yetkiler</TabsTrigger>
          <TabsTrigger value="services">Hizmet Yapılandırması</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="security">Güvenlik</TabsTrigger>
          <TabsTrigger value="integrations">Entegrasyonlar</TabsTrigger>
        </TabsList>

        {/* Agency Profile */}
        <TabsContent value="agency" className="space-y-6">
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-[#AAFF01]" />
              <h3 className="text-lg font-semibold">Ajans Bilgileri</h3>
            </div>
            <div className="space-y-4 max-w-2xl">
              <div className="space-y-2">
                <Label>Ajans Adı</Label>
                <Input defaultValue="Social Tech" className="bg-[#202020] border-white/[0.06]" />
              </div>
              <div className="space-y-2">
                <Label>E-posta</Label>
                <Input defaultValue="info@socialtech.com" className="bg-[#202020] border-white/[0.06]" />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input defaultValue="+90 212 555 00 00" className="bg-[#202020] border-white/[0.06]" />
              </div>
              <div className="space-y-2">
                <Label>Adres</Label>
                <Input defaultValue="İstanbul, Türkiye" className="bg-[#202020] border-white/[0.06]" />
              </div>
              <Button className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Kaydet</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Roles & Permissions */}
        <TabsContent value="roles" className="space-y-6">
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-[#AAFF01]" />
              <h3 className="text-lg font-semibold">Roller & Yetkiler</h3>
            </div>
            <div className="space-y-4">
              {[
                { role: "Admin", description: "Tüm yetkilere sahip", count: 2 },
                { role: "Project Manager", description: "Proje ve müşteri yönetimi", count: 5 },
                { role: "Specialist", description: "Hizmet bazlı yetkiler", count: 8 },
                { role: "Client", description: "Sadece müşteri paneli erişimi", count: 47 },
              ].map((role, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div>
                    <p className="font-medium mb-1">{role.role}</p>
                    <p className="text-sm text-[#A0A0A0]">{role.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#A0A0A0]">{role.count} kullanıcı</span>
                    <Button size="sm" variant="outline">Düzenle</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Service Configuration */}
        <TabsContent value="services" className="space-y-6">
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-6 h-6 text-[#AAFF01]" />
              <h3 className="text-lg font-semibold">Hizmet Yapılandırması</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Aktif Hizmetler (13 Hizmet)</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Growth & Hub",
                    "Sosyal Medya Yönetimi",
                    "Medya Hub",
                    "Meta ADS",
                    "TikTok ADS",
                    "Google ADS",
                    "Amazon ADS",
                    "Web APP",
                    "Mobil APP",
                    "Landing Pages",
                    "Web & Mobil Tasarımlar",
                    "Teknik Destek",
                    "SEO Denetimi"
                  ].map((service, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <span className="text-sm">{service}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-[#AAFF01]" />
              <h3 className="text-lg font-semibold">Bildirim Ayarları</h3>
            </div>
            <div className="space-y-4 max-w-2xl">
              {[
                { label: "E-posta bildirimleri", description: "Önemli olaylar için e-posta al" },
                { label: "Müşteri hatırlatıcıları", description: "Otomatik müşteri hatırlatma e-postaları" },
                { label: "Görev hatırlatıcıları", description: "Görev deadline hatırlatmaları" },
                { label: "Ödeme bildirimleri", description: "Ödeme durumu güncellemeleri" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div>
                    <p className="font-medium mb-1">{item.label}</p>
                    <p className="text-sm text-[#A0A0A0]">{item.description}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-[#AAFF01]" />
              <h3 className="text-lg font-semibold">Güvenlik Ayarları</h3>
            </div>
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-4">
                <div>
                  <Label>Şifre Değiştir</Label>
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    <Input type="password" placeholder="Mevcut şifre" className="bg-[#202020] border-white/[0.06]" />
                    <Input type="password" placeholder="Yeni şifre" className="bg-[#202020] border-white/[0.06]" />
                    <Input type="password" placeholder="Yeni şifre (tekrar)" className="bg-[#202020] border-white/[0.06]" />
                  </div>
                  <Button className="mt-3 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Şifreyi Güncelle</Button>
                </div>
                <div className="pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                    <div>
                      <p className="font-medium mb-1">İki Faktörlü Doğrulama (2FA)</p>
                      <p className="text-sm text-[#A0A0A0]">Hesap güvenliğini artır</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <div className="flex items-center gap-3 mb-6">
              <LinkIcon className="w-6 h-6 text-[#AAFF01]" />
              <h3 className="text-lg font-semibold">Entegrasyonlar</h3>
            </div>
            <div className="space-y-4">
              {[
                { name: "Meta Business Suite", status: "Bağlı", color: "bg-[#AAFF01] text-[#131313]" },
                { name: "Google Ads", status: "Bağlı", color: "bg-[#AAFF01] text-[#131313]" },
                { name: "TikTok Ads Manager", status: "Bağlı", color: "bg-[#AAFF01] text-[#131313]" },
                { name: "Amazon Advertising", status: "Bağlı", color: "bg-[#AAFF01] text-[#131313]" },
                { name: "Google Calendar", status: "Bağlanmadı", color: "" },
                { name: "Slack", status: "Bağlanmadı", color: "" },
              ].map((integration, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div>
                    <p className="font-medium">{integration.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${integration.color || 'bg-white/5'}`}>
                      {integration.status}
                    </span>
                    <Button size="sm" variant="outline">
                      {integration.status === "Bağlı" ? "Ayarla" : "Bağlan"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
