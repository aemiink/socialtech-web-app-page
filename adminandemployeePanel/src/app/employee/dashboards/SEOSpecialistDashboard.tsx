import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Search, TrendingUp, AlertCircle, Zap, BarChart, Globe, FileText, CheckSquare } from "lucide-react";

export function SEOSpecialistDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">SEO Specialist Dashboard</h1>
        <p className="text-[#A0A0A0]">SEO optimizasyonu ve teknik denetim</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Search className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Audit</span>
          </div>
          <div className="text-2xl font-semibold">7</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Kritik Hata</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">12</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Hız Sorunu</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">5</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Ort. SEO Skoru</span>
          </div>
          <div className="text-2xl font-semibold">76/100</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckSquare className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bu Ay Çözülen</span>
          </div>
          <div className="text-2xl font-semibold">48</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Kritik Teknik Hatalar</h3>
          <div className="space-y-3">
            {[
              { client: "XYZ Holding", issue: "Broken internal links - 45 adet", severity: "Critical", impact: "Yüksek", pages: "45 sayfa" },
              { client: "ABC Corp", issue: "Missing meta descriptions", severity: "High", impact: "Orta", pages: "23 sayfa" },
              { client: "DEF Medya", issue: "Mobile usability errors", severity: "Critical", impact: "Yüksek", pages: "12 sayfa" },
            ].map((error, i) => (
              <div key={i} className={`p-4 rounded-lg border ${error.severity === 'Critical' ? 'bg-red-500/10 border-red-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={error.severity === 'Critical' ? 'destructive' : 'default'} className="text-xs">{error.severity}</Badge>
                  <span className="text-sm font-medium">{error.client}</span>
                </div>
                <p className="text-sm mb-2">{error.issue}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A0A0A0]">{error.pages}</span>
                  <span className={error.severity === 'Critical' ? 'text-red-500' : 'text-orange-500'}>Etki: {error.impact}</span>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 bg-red-500 text-white hover:bg-red-600">Aksiyon Planı Oluştur</Button>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Sayfa Hızı Optimizasyonu</h3>
          <div className="space-y-3">
            {[
              { client: "XYZ Holding", page: "Homepage", desktop: 45, mobile: 32, status: "poor" },
              { client: "ABC Corp", page: "Product Pages", desktop: 78, mobile: 65, status: "needs-improvement" },
              { client: "DEF Medya", page: "Blog", desktop: 92, mobile: 88, status: "good" },
            ].map((speed, i) => (
              <div key={i} className={`p-4 rounded-lg border ${speed.status === 'poor' ? 'bg-red-500/10 border-red-500/30' : speed.status === 'needs-improvement' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-[#AAFF01]/10 border-[#AAFF01]/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{speed.client}</h4>
                    <p className="text-xs text-[#A0A0A0]">{speed.page}</p>
                  </div>
                  <Badge variant={speed.status === 'good' ? 'default' : speed.status === 'needs-improvement' ? 'secondary' : 'destructive'} className="text-xs">
                    {speed.status === 'good' ? 'İyi' : speed.status === 'needs-improvement' ? 'Orta' : 'Kötü'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[#A0A0A0] mb-1">Desktop</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/10 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${speed.desktop >= 80 ? 'bg-[#AAFF01]' : speed.desktop >= 50 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${speed.desktop}%` }} />
                      </div>
                      <span className="text-xs font-medium">{speed.desktop}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[#A0A0A0] mb-1">Mobile</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/10 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${speed.mobile >= 80 ? 'bg-[#AAFF01]' : speed.mobile >= 50 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${speed.mobile}%` }} />
                      </div>
                      <span className="text-xs font-medium">{speed.mobile}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Anahtar Kelimeler</h3>
          </div>
          <div className="space-y-2">
            {[
              { client: "XYZ Holding", keywords: 45, top10: 12, top3: 5, trend: "up" },
              { client: "ABC Corp", keywords: 78, top10: 28, top3: 8, trend: "up" },
              { client: "DEF Medya", keywords: 32, top10: 8, top3: 2, trend: "down" },
            ].map((kw, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{kw.client}</p>
                  <TrendingUp className={`w-4 h-4 ${kw.trend === 'up' ? 'text-[#AAFF01]' : 'text-red-500'} ${kw.trend === 'down' ? 'rotate-180' : ''}`} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-[#A0A0A0]">Toplam</p>
                    <p className="font-medium">{kw.keywords}</p>
                  </div>
                  <div>
                    <p className="text-[#A0A0A0]">Top 10</p>
                    <p className="font-medium text-[#AAFF01]">{kw.top10}</p>
                  </div>
                  <div>
                    <p className="text-[#A0A0A0]">Top 3</p>
                    <p className="font-medium text-[#AAFF01]">{kw.top3}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">Keyword Raporu</Button>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Search Console</h3>
          </div>
          <div className="space-y-2">
            {[
              { client: "XYZ Holding", clicks: "12.5K", impressions: "145K", ctr: "8.6%", position: "12.3" },
              { client: "ABC Corp", clicks: "8.2K", impressions: "98K", ctr: "8.4%", position: "15.7" },
              { client: "DEF Medya", clicks: "5.1K", impressions: "62K", ctr: "8.2%", position: "18.2" },
            ].map((gsc, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <p className="text-sm font-medium mb-2">{gsc.client}</p>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <p className="text-[#A0A0A0] mb-1">Clicks</p>
                    <p className="font-medium">{gsc.clicks}</p>
                  </div>
                  <div>
                    <p className="text-[#A0A0A0] mb-1">Impr.</p>
                    <p className="font-medium">{gsc.impressions}</p>
                  </div>
                  <div>
                    <p className="text-[#A0A0A0] mb-1">CTR</p>
                    <p className="font-medium text-[#AAFF01]">{gsc.ctr}</p>
                  </div>
                  <div>
                    <p className="text-[#A0A0A0] mb-1">Pos.</p>
                    <p className="font-medium">{gsc.position}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Index Durumu</h3>
          </div>
          <div className="space-y-2">
            {[
              { client: "XYZ Holding", indexed: 245, total: 278, coverage: 88, issues: 12 },
              { client: "ABC Corp", indexed: 412, total: 445, coverage: 93, issues: 5 },
              { client: "DEF Medya", indexed: 156, total: 189, coverage: 83, issues: 18 },
            ].map((index, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{index.client}</p>
                  <Badge variant={index.coverage >= 90 ? 'default' : 'outline'} className="text-xs">{index.coverage}%</Badge>
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#A0A0A0]">{index.indexed} / {index.total} sayfa</span>
                  {index.issues > 0 && <span className="text-orange-500">{index.issues} sorun</span>}
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-[#AAFF01] h-1.5 rounded-full" style={{ width: `${index.coverage}%` }} />
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">Index Raporu</Button>
        </Card>
      </div>
    </div>
  );
}
