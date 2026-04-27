import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Megaphone, DollarSign, TrendingUp, Plus, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { campaigns } from "../data/mockData";

const activeCampaigns = campaigns.filter(c => c.status === "active");
const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
const avgRoas = campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length;

export function Campaigns() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Kampanyalar</h1>
          <p className="text-[#A0A0A0]">Dijital reklam kampanyalarını yönetin</p>
        </div>
        <Button className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 gap-2">
          <Plus className="w-4 h-4" />
          Yeni Kampanya
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Megaphone className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Kampanya</span>
          </div>
          <div className="text-2xl font-semibold">{activeCampaigns.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Bütçe</span>
          </div>
          <div className="text-2xl font-semibold">₺{Math.round(totalBudget / 1000)}K</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Harcanan</span>
          </div>
          <div className="text-2xl font-semibold">₺{Math.round(totalSpent / 1000)}K</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Ort. ROAS</span>
          </div>
          <div className="text-2xl font-semibold">{avgRoas.toFixed(1)}x</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Conversion</span>
          </div>
          <div className="text-2xl font-semibold">{campaigns.reduce((sum, c) => sum + c.conversions, 0).toLocaleString('tr-TR')}</div>
        </Card>
      </div>

      {/* Campaigns Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-[#1A1A1A] border border-white/[0.06]">
          <TabsTrigger value="all">Tümü ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="meta">Meta ADS</TabsTrigger>
          <TabsTrigger value="google">Google ADS</TabsTrigger>
          <TabsTrigger value="tiktok">TikTok ADS</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="bg-[#1A1A1A] border-white/[0.06] p-6 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <Badge variant="secondary">{campaign.platform}</Badge>
                    <Badge variant="outline" className="bg-[#AAFF01] text-[#131313] border-0">Aktif</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[#A0A0A0]">
                    <span>{campaign.client}</span>
                    <span>•</span>
                    <span>{new Date(campaign.startDate).toLocaleDateString('tr-TR')} - {new Date(campaign.endDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline">Optimizasyon</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Bütçe</p>
                  <p className="font-medium">₺{campaign.budget.toLocaleString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Harcanan</p>
                  <p className="font-medium">₺{campaign.spent.toLocaleString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Tıklama</p>
                  <p className="font-medium">{campaign.clicks.toLocaleString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Gösterim</p>
                  <p className="font-medium">{(campaign.impressions / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Conversion</p>
                  <p className="font-medium text-[#AAFF01]">{campaign.conversions.toLocaleString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">ROAS</p>
                  <p className="font-medium text-[#AAFF01]">{campaign.roas}x</p>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="meta">
          {campaigns.filter(c => c.platform === "Meta ADS").map((campaign) => (
            <Card key={campaign.id} className="bg-[#1A1A1A] border-white/[0.06] p-6">
              <h3 className="font-semibold mb-2">{campaign.name}</h3>
              <p className="text-sm text-[#A0A0A0]">{campaign.client}</p>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="google">
          {campaigns.filter(c => c.platform === "Google ADS").map((campaign) => (
            <Card key={campaign.id} className="bg-[#1A1A1A] border-white/[0.06] p-6">
              <h3 className="font-semibold mb-2">{campaign.name}</h3>
              <p className="text-sm text-[#A0A0A0]">{campaign.client}</p>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="tiktok">
          {campaigns.filter(c => c.platform === "TikTok ADS").map((campaign) => (
            <Card key={campaign.id} className="bg-[#1A1A1A] border-white/[0.06] p-6">
              <h3 className="font-semibold mb-2">{campaign.name}</h3>
              <p className="text-sm text-[#A0A0A0]">{campaign.client}</p>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
