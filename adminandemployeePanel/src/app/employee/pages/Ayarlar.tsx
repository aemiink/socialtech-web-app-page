import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Settings, User, Bell, Shield, Key } from "lucide-react";

export function Ayarlar() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Ayarlar</h1>
        <p className="text-[#A0A0A0]">Hesap ve bildirim ayarları</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Profil Bilgileri</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-[#A0A0A0] mb-2">Ad Soyad</Label>
              <Input defaultValue="Social Tech Çalışan" className="bg-[#202020] border-white/[0.06]" />
            </div>
            <div>
              <Label className="text-sm text-[#A0A0A0] mb-2">E-posta</Label>
              <Input defaultValue="calisan@socialtech.com" className="bg-[#202020] border-white/[0.06]" />
            </div>
            <div>
              <Label className="text-sm text-[#A0A0A0] mb-2">Telefon</Label>
              <Input defaultValue="+90 555 123 4567" className="bg-[#202020] border-white/[0.06]" />
            </div>
            <Button className="w-full bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Kaydet</Button>
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Bildirim Tercihleri</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Yeni görev atamaları", id: "task-notifications" },
              { label: "Müşteri yorumları", id: "comment-notifications" },
              { label: "Onay talepleri", id: "approval-notifications" },
              { label: "Deadline hatırlatmaları", id: "deadline-notifications" },
              { label: "Toplantı bildirimleri", id: "meeting-notifications" },
              { label: "E-posta bildirimleri", id: "email-notifications" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <Label htmlFor={item.id} className="text-sm">{item.label}</Label>
                <Switch id={item.id} defaultChecked />
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Güvenlik</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-[#A0A0A0] mb-2">Mevcut Şifre</Label>
              <Input type="password" placeholder="••••••••" className="bg-[#202020] border-white/[0.06]" />
            </div>
            <div>
              <Label className="text-sm text-[#A0A0A0] mb-2">Yeni Şifre</Label>
              <Input type="password" placeholder="••••••••" className="bg-[#202020] border-white/[0.06]" />
            </div>
            <div>
              <Label className="text-sm text-[#A0A0A0] mb-2">Yeni Şifre (Tekrar)</Label>
              <Input type="password" placeholder="••••••••" className="bg-[#202020] border-white/[0.06]" />
            </div>
            <Button variant="outline" className="w-full">Şifre Değiştir</Button>

            <div className="pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">İki Faktörlü Doğrulama</Label>
                <Badge variant="outline" className="text-xs">Kapalı</Badge>
              </div>
              <Button variant="outline" className="w-full">Aktifleştir</Button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-[#AAFF01]" />
          <h3 className="text-lg font-semibold">Oturum Bilgileri</h3>
        </div>
        <div className="space-y-3">
          {[
            { device: "Chrome - Windows", location: "İstanbul, TR", time: "Aktif şimdi", current: true },
            { device: "Safari - iPhone", location: "İstanbul, TR", time: "2 saat önce", current: false },
          ].map((session, i) => (
            <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/[0.06] flex items-center justify-between">
              <div>
                <p className="font-medium text-sm mb-1">{session.device}</p>
                <p className="text-xs text-[#A0A0A0]">{session.location} • {session.time}</p>
              </div>
              {session.current ? (
                <Badge className="bg-[#AAFF01] text-[#131313]">Mevcut Oturum</Badge>
              ) : (
                <Button size="sm" variant="outline">Sonlandır</Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
