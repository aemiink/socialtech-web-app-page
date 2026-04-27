import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { CheckCircle, Clock, AlertCircle, FileText, XCircle } from "lucide-react";
import { approvals } from "../../data/mockData";

export function Onaylar() {
  const pending = approvals.filter(a => a.status === "pending");
  const approved = approvals.filter(a => a.status === "approved");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Onaylar</h1>
        <p className="text-[#A0A0A0]">Onay bekleyen ve tamamlanan iş kalemleri</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Bekleyen</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{pending.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Onaylanan</span>
          </div>
          <div className="text-2xl font-semibold">{approved.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Reddedilen</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">0</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam</span>
          </div>
          <div className="text-2xl font-semibold">{approvals.length}</div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold">Onay Listesi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Başlık</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Tür</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Gönderen</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Deadline</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Öncelik</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((item) => (
                <tr key={item.id} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4 font-medium text-sm">{item.title}</td>
                  <td className="p-4">
                    <Badge variant="outline">{item.type}</Badge>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{item.client}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{item.submittedBy}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">
                    {new Date(item.deadline).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        item.priority === "critical"
                          ? "destructive"
                          : item.priority === "high"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {item.priority === "critical"
                        ? "Kritik"
                        : item.priority === "high"
                        ? "Yüksek"
                        : "Normal"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      className={
                        item.status === "approved"
                          ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      }
                    >
                      {item.status === "approved" ? "Onaylandı" : "Bekliyor"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {item.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Onayla</Button>
                        <Button size="sm" variant="outline">Reddet</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
