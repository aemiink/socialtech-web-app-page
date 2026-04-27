import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import { UserCheck, Users, AlertTriangle, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { employees } from "../data/mockData";

const roleTranslations: Record<string, string> = {
  "project-manager": "Project Manager",
  "performance-specialist": "Performance Specialist",
  "social-media-specialist": "Social Media Specialist",
  "designer": "Designer",
  "developer": "Developer",
  "seo-specialist": "SEO Specialist",
  "support-specialist": "Support Specialist"
};

export function Employees() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Çalışanlar</h1>
          <p className="text-[#A0A0A0]">Ekip yönetimi ve performans</p>
        </div>
        <Button className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 gap-2">
          <Plus className="w-4 h-4" />
          Yeni Çalışan Ekle
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Çalışan</span>
          </div>
          <div className="text-2xl font-semibold">{employees.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <UserCheck className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif</span>
          </div>
          <div className="text-2xl font-semibold">{employees.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Yoğun Yük</span>
          </div>
          <div className="text-2xl font-semibold">{employees.filter(e => e.activeTasks > 15).length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <UserCheck className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Ort. Performans</span>
          </div>
          <div className="text-2xl font-semibold">{Math.round(employees.reduce((sum, e) => sum + e.performance, 0) / employees.length)}%</div>
        </Card>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee) => (
          <Card key={employee.id} className="bg-[#1A1A1A] border-white/[0.06] p-6 hover:bg-white/5 transition-colors">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="w-12 h-12 bg-[#AAFF01] text-[#131313]">
                <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{employee.name}</h3>
                <p className="text-sm text-[#A0A0A0] mb-2">{roleTranslations[employee.role]}</p>
                <Badge variant={employee.performance >= 90 ? "default" : "secondary"} className={employee.performance >= 90 ? "bg-[#AAFF01] text-[#131313]" : ""}>
                  Performans: {employee.performance}%
                </Badge>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A0A0A0]">Aktif Görev</span>
                <span className="font-medium">{employee.activeTasks}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A0A0A0]">Müşteri Sayısı</span>
                <span className="font-medium">{employee.clients.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A0A0A0]">Departman</span>
                <span className="font-medium">{employee.department}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {employee.clients.slice(0, 3).map((client) => (
                <Badge key={client} variant="outline" className="text-xs">
                  {client}
                </Badge>
              ))}
              {employee.clients.length > 3 && (
                <Badge variant="outline" className="text-xs">+{employee.clients.length - 3}</Badge>
              )}
            </div>

            <Link to={`/calisanlar/${employee.id}`}>
              <Button size="sm" variant="outline" className="w-full">Detay</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
