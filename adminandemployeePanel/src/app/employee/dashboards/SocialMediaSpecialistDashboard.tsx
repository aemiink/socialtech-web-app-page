import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Calendar, FileText, ThumbsUp, Rocket, MessageSquare, TrendingUp, Image, Clock } from "lucide-react";

export function SocialMediaSpecialistDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Social Media Specialist Dashboard</h1>
        <p className="text-[#A0A0A0]">İçerik yönetimi ve sosyal medya operasyonları</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bu Hafta Yayın</span>
          </div>
          <div className="text-2xl font-semibold">42</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <ThumbsUp className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Onay Bekleyen</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">8</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Taslak</span>
          </div>
          <div className="text-2xl font-semibold">15</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Rocket className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bugün Yayınlanacak</span>
          </div>
          <div className="text-2xl font-semibold">6</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Yanıtsız DM</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">12</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Bugünkü Yayın Akışı</h3>
          <div className="space-y-3">
            {[
              { client: "XYZ Holding", platform: "Instagram", time: "09:00", type: "Reel", status: "scheduled", caption: "Yeni ürün lansmanı..." },
              { client: "ABC Corp", platform: "LinkedIn", time: "12:00", type: "Post", status: "approved", caption: "Sektör analizi ve trendler..." },
              { client: "DEF Medya", platform: "Instagram", time: "15:00", type: "Story", status: "pending", caption: "Kullanıcı yorumu paylaşımı..." },
              { client: "XYZ Holding", platform: "Facebook", time: "18:00", type: "Post", status: "scheduled", caption: "Hafta sonu kampanyası..." },
            ].map((post, i) => (
              <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#AAFF01]">{post.time}</span>
                    <Badge variant="outline" className="text-xs">{post.platform}</Badge>
                    <Badge variant="secondary" className="text-xs">{post.type}</Badge>
                  </div>
                  <Badge variant={post.status === 'scheduled' ? 'default' : post.status === 'approved' ? 'default' : 'outline'} className="text-xs">
                    {post.status === 'scheduled' ? 'Zamanlandı' : post.status === 'approved' ? 'Onaylandı' : 'Onay Bekliyor'}
                  </Badge>
                </div>
                <p className="text-sm font-medium mb-1">{post.client}</p>
                <p className="text-xs text-[#A0A0A0]">{post.caption}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Onay Bekleyen İçerikler</h3>
          <div className="space-y-3">
            {[
              { client: "XYZ Holding", platform: "Instagram", type: "Reel", waiting: "2 gün", images: 1 },
              { client: "ABC Corp", platform: "LinkedIn", type: "Carousel", waiting: "1 gün", images: 5 },
              { client: "DEF Medya", platform: "Instagram", type: "Post", waiting: "5 saat", images: 3 },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/[0.06] hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm mb-1">{item.client}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{item.platform}</Badge>
                      <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-orange-500 mb-1">Bekliyor: {item.waiting}</p>
                    <div className="flex items-center gap-1">
                      <Image className="w-3 h-3 text-[#A0A0A0]" />
                      <span className="text-xs text-[#A0A0A0]">{item.images} görsel</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Onay Hatırlatması Gönder</Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">DM & Yorum Takibi</h3>
          </div>
          <div className="space-y-2">
            {[
              { client: "XYZ Holding", platform: "Instagram", type: "DM", count: 5, urgent: true },
              { client: "ABC Corp", platform: "LinkedIn", type: "Yorum", count: 8, urgent: false },
              { client: "DEF Medya", platform: "Facebook", type: "DM", count: 3, urgent: true },
            ].map((item, i) => (
              <div key={i} className={`p-3 rounded-lg ${item.urgent ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/5'}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{item.client}</p>
                  <Badge variant={item.urgent ? 'destructive' : 'outline'} className="text-xs">{item.count} yeni</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#A0A0A0]">{item.platform}</span>
                  <span className="text-xs text-[#A0A0A0]">•</span>
                  <span className="text-xs text-[#A0A0A0]">{item.type}</span>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">Hepsini Görüntüle</Button>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Trend Notları</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-sm mb-2">#SustainableMarketing trending - XYZ Holding için uyarlanabilir</p>
              <p className="text-xs text-[#A0A0A0]">Instagram • 2 saat önce</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-sm mb-2">LinkedIn carousel formatı yüksek engagement alıyor</p>
              <p className="text-xs text-[#A0A0A0]">LinkedIn • 5 saat önce</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-sm mb-2">Reel'de ses trendi: Viral sound #12345</p>
              <p className="text-xs text-[#A0A0A0]">TikTok • Dün</p>
            </div>
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Caption Yazma Kuyruğu</h3>
          </div>
          <div className="space-y-2">
            {[
              { client: "XYZ Holding", count: 3, deadline: "Bugün", type: "Instagram Post" },
              { client: "ABC Corp", count: 5, deadline: "Yarın", type: "LinkedIn Carousel" },
              { client: "DEF Medya", count: 2, deadline: "29 Nisan", type: "Story Series" },
            ].map((queue, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{queue.client}</p>
                  <Badge variant="secondary" className="text-xs">{queue.count} caption</Badge>
                </div>
                <p className="text-xs text-[#A0A0A0] mb-1">{queue.type}</p>
                <p className="text-xs text-[#AAFF01]">Deadline: {queue.deadline}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">Captionlara Başla</Button>
        </Card>
      </div>
    </div>
  );
}
