import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Headphones, AlertCircle, CheckSquare, Clock, Wrench, Shield, Folder, Rocket } from "lucide-react";

export function SupportSpecialistDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Support Specialist Dashboard</h1>
        <p className="text-[#A0A0A0]">Teknik destek ve sistem bakımı</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Headphones className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Açık Destek</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">8</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Kritik Sorun</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">3</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Ort. Çözüm Süresi</span>
          </div>
          <div className="text-2xl font-semibold">2.4 saat</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckSquare className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bu Hafta Çözülen</span>
          </div>
          <div className="text-2xl font-semibold">24</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Wrench className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bakım Zamanı</span>
          </div>
          <div className="text-2xl font-semibold">2 gün</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Kritik Destek Talepleri</h3>
          <div className="space-y-3">
            {[
              { client: "XYZ Holding", issue: "Web sitesi erişim sorunu - 500 hatası", severity: "Critical", time: "15 dk önce", status: "investigating" },
              { client: "ABC Corp", issue: "E-posta sunucu bağlantı hatası", severity: "High", time: "1 saat önce", status: "in-progress" },
              { client: "DEF Medya", issue: "SSL sertifikası yenileme gerekli", severity: "Medium", time: "3 saat önce", status: "pending" },
            ].map((ticket, i) => (
              <div key={i} className={`p-4 rounded-lg border ${ticket.severity === 'Critical' ? 'bg-red-500/10 border-red-500/30' : ticket.severity === 'High' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-white/[0.06]'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={ticket.severity === 'Critical' ? 'destructive' : ticket.severity === 'High' ? 'default' : 'outline'} className="text-xs">
                    {ticket.severity}
                  </Badge>
                  <span className="text-sm font-medium">{ticket.client}</span>
                </div>
                <p className="text-sm mb-2">{ticket.issue}</p>
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="secondary" className="text-xs">
                    {ticket.status === 'investigating' ? 'İnceleniyor' : ticket.status === 'in-progress' ? 'Devam Ediyor' : 'Bekliyor'}
                  </Badge>
                  <span className="text-[#A0A0A0]">{ticket.time}</span>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 bg-red-500 text-white hover:bg-red-600">Acil Destek</Button>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Açık İşler</h3>
          <div className="space-y-3">
            {[
              { client: "GHI Teknoloji", task: "Veritabanı yedekleme kontrolü", type: "Maintenance", priority: "normal", deadline: "Bugün" },
              { client: "JKL Corporation", task: "Hosting paketi yükseltme", type: "Upgrade", priority: "normal", deadline: "Yarın" },
              { client: "XYZ Holding", task: "DNS ayarları güncelleme", type: "Configuration", priority: "high", deadline: "Bugün" },
            ].map((task, i) => (
              <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/[0.06] hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{task.client}</h4>
                    <p className="text-xs text-[#A0A0A0]">{task.task}</p>
                  </div>
                  {task.priority === 'high' && <AlertCircle className="w-4 h-4 text-orange-500" />}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline" className="text-xs">{task.type}</Badge>
                  <span className="text-[#AAFF01]">Deadline: {task.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Güvenlik</h3>
          </div>
          <div className="space-y-2">
            {[
              { client: "XYZ Holding", check: "SSL Sertifikası", status: "valid", expires: "45 gün" },
              { client: "ABC Corp", check: "Firewall Kuralları", status: "updated", lastUpdate: "2 gün önce" },
              { client: "DEF Medya", check: "Malware Tarama", status: "clean", lastScan: "Dün" },
            ].map((security, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{security.client}</p>
                  <Badge variant="default" className="text-xs bg-[#AAFF01] text-[#131313]">
                    {security.status === 'valid' ? 'Geçerli' : security.status === 'updated' ? 'Güncel' : 'Temiz'}
                  </Badge>
                </div>
                <p className="text-xs text-[#A0A0A0] mb-1">{security.check}</p>
                <p className="text-xs text-[#AAFF01]">
                  {security.expires ? `${security.expires} kaldı` : security.lastUpdate || security.lastScan}
                </p>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">Güvenlik Raporu</Button>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Folder className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Yedekleme Durumu</h3>
          </div>
          <div className="space-y-2">
            {[
              { client: "XYZ Holding", type: "Full Backup", status: "success", time: "Bugün 03:00" },
              { client: "ABC Corp", type: "Database Backup", status: "success", time: "Bugün 02:30" },
              { client: "DEF Medya", type: "Files Backup", status: "failed", time: "Dün 23:00" },
            ].map((backup, i) => (
              <div key={i} className={`p-3 rounded-lg ${backup.status === 'failed' ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/5'}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{backup.client}</p>
                  <Badge variant={backup.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                    {backup.status === 'success' ? 'Başarılı' : 'Hata'}
                  </Badge>
                </div>
                <p className="text-xs text-[#A0A0A0] mb-1">{backup.type}</p>
                <p className="text-xs text-[#A0A0A0]">{backup.time}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Sistem Güncellemeleri</h3>
          </div>
          <div className="space-y-2">
            {[
              { system: "WordPress Core", version: "6.5.2", status: "available", critical: false },
              { system: "PHP Version", version: "8.2.18", status: "available", critical: true },
              { system: "Security Patches", version: "April 2026", status: "installed", critical: false },
            ].map((update, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{update.system}</p>
                  {update.critical && <Badge variant="destructive" className="text-xs">Kritik</Badge>}
                </div>
                <p className="text-xs text-[#A0A0A0] mb-2">{update.version}</p>
                {update.status === 'available' ? (
                  <Button size="sm" variant="outline" className="w-full text-xs h-7">Güncelle</Button>
                ) : (
                  <Badge variant="default" className="text-xs bg-[#AAFF01] text-[#131313]">Yüklendi</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
