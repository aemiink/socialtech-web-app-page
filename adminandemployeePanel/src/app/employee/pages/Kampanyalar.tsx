import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Megaphone, TrendingUp, MousePointerClick, Target, DollarSign } from "lucide-react";
import { campaigns } from "../../data/mockData";

export function Kampanyalar() {
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgRoas = campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Kampanyalar</h1>
        <p className="text-[#A0A0A0]">Aktif reklam kampanyaları ve performans metrikleri</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Megaphone className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Kampanya</span>
          </div>
          <div className="text-2xl font-semibold">{campaigns.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-[#A0A0A0]">Toplam Bütçe</span>
          </div>
          <div className="text-2xl font-semibold">₺{totalBudget.toLocaleString("tr-TR")}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Dönüşüm</span>
          </div>
          <div className="text-2xl font-semibold">{totalConversions.toLocaleString("tr-TR")}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Ort. ROAS</span>
          </div>
          <div className="text-2xl font-semibold text-[#AAFF01]">{avgRoas.toFixed(1)}x</div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-lg font-semibold">Kampanya Performansı</h3>
          <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Yeni Kampanya</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Kampanya</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Platform</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Harcama</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Tıklama</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Dönüşüm</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">ROAS</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4 font-medium text-sm">{campaign.name}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{campaign.client}</td>
                  <td className="p-4">
                    <Badge variant="outline">{campaign.platform}</Badge>
                  </td>
                  <td className="p-4 text-sm">₺{campaign.spent.toLocaleString("tr-TR")}</td>
                  <td className="p-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MousePointerClick className="w-3 h-3 text-[#A0A0A0]" />
                      {campaign.clicks.toLocaleString("tr-TR")}
                    </div>
                  </td>
                  <td className="p-4 text-sm">{campaign.conversions.toLocaleString("tr-TR")}</td>
                  <td className="p-4 text-sm font-semibold text-[#AAFF01]">{campaign.roas}x</td>
                  <td className="p-4">
                    <Badge className="bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30">
                      Aktif
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button size="sm" variant="outline">Detay</Button>
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
