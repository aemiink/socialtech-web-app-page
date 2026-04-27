import { useParams, Link } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { ArrowLeft, Calendar, User, AlertCircle, CheckCircle } from "lucide-react";

export function ProjectDetail() {
  const { id } = useParams();

  const phases = ["Brief", "Planlama", "Tasarım", "Geliştirme", "Test", "Yayın", "Teslim"];
  const currentPhase = 3;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/projeler">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-1">E-Ticaret Web APP</h1>
          <p className="text-[#A0A0A0]">XYZ Holding • Web APP</p>
        </div>
        <Badge className="bg-[#AAFF01] text-[#131313]">Geliştirme</Badge>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">İlerleme</span>
          </div>
          <Progress value={65} className="mb-2" />
          <div className="text-lg font-semibold">65%</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Deadline</span>
          </div>
          <div className="text-lg font-semibold">15 Mayıs 2026</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <User className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Sorumlu</span>
          </div>
          <div className="text-lg font-semibold">Can S.</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Risk Durumu</span>
          </div>
          <div className="text-lg font-semibold">Normal</div>
        </Card>
      </div>

      {/* Project Timeline */}
      <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
        <h3 className="text-lg font-semibold mb-4">Proje Aşamaları</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {phases.map((phase, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                i < currentPhase ? "bg-[#AAFF01] text-[#131313]" :
                i === currentPhase ? "bg-[#AAFF01]/20 text-[#AAFF01] border border-[#AAFF01]" :
                "bg-white/5 text-[#A0A0A0]"
              }`}>
                {phase}
              </div>
              {i < phases.length - 1 && (
                <div className={`w-8 h-0.5 ${i < currentPhase ? "bg-[#AAFF01]" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Task Board */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Görev Panosu</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {["Planlanan", "Devam Ediyor", "Bloke", "Tamamlandı"].map((status, i) => (
                <div key={status}>
                  <h4 className="text-sm font-medium mb-3 text-[#A0A0A0]">{status}</h4>
                  <div className="space-y-2">
                    {i === 1 && (
                      <>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/[0.06]">
                          <p className="text-sm font-medium mb-1">Backend API geliştirme</p>
                          <p className="text-xs text-[#A0A0A0]">Can S.</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/[0.06]">
                          <p className="text-sm font-medium mb-1">Frontend entegrasyonu</p>
                          <p className="text-xs text-[#A0A0A0]">Ayşe D.</p>
                        </div>
                      </>
                    )}
                    {i === 3 && (
                      <div className="p-3 rounded-lg bg-white/5 border border-white/[0.06]">
                        <p className="text-sm font-medium mb-1">UI tasarım</p>
                        <p className="text-xs text-[#A0A0A0]">Mehmet A.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Deliverables */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Teslimatlar</h3>
            <div className="space-y-2">
              {[
                { label: "UI Ekranları", completed: true },
                { label: "Frontend Geliştirme", completed: true },
                { label: "Backend/API", completed: false },
                { label: "Admin Paneli", completed: false },
                { label: "SEO Yapısı", completed: false },
                { label: "Test", completed: false },
                { label: "Deployment", completed: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div className={`w-5 h-5 rounded border ${
                    item.completed ? "bg-[#AAFF01] border-[#AAFF01]" : "border-white/20"
                  } flex items-center justify-center`}>
                    {item.completed && <CheckCircle className="w-3 h-3 text-[#131313]" />}
                  </div>
                  <span className={item.completed ? "text-[#A0A0A0] line-through" : ""}>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Revisions */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Revizyonlar</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Ödeme sayfası güncelleme</span>
                  <Badge variant="destructive" className="text-xs">Yüksek</Badge>
                </div>
                <p className="text-xs text-[#A0A0A0] mb-2">Müşteri ödeme akışında değişiklik istedi</p>
                <p className="text-xs text-[#A0A0A0]">Sorumlu: Can S.</p>
              </div>
            </div>
          </Card>

          {/* Files */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Dosyalar</h3>
            <div className="space-y-2">
              {["Figma Tasarım Linki", "Staging URL", "Teknik Dokümantasyon"].map((file, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/5 text-sm hover:bg-white/10 cursor-pointer transition-colors">
                  {file}
                </div>
              ))}
            </div>
          </Card>

          {/* Internal Notes */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">İç Notlar</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-sm mb-2">Müşteri bir sonraki hafta demo görmek istiyor.</p>
                <p className="text-xs text-[#A0A0A0]">Can S. • 1 gün önce</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">Not Ekle</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
