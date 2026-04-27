import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Folder, File, FileText, Image, Download, Share2 } from "lucide-react";

export function Dosyalar() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Dosyalar</h1>
        <p className="text-[#A0A0A0]">Proje dosyaları ve dokümanlar</p>
      </div>

      <div className="flex items-center gap-4">
        <Button className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Dosya Yükle</Button>
        <Button variant="outline">Klasör Oluştur</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Folder className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Klasör</span>
          </div>
          <div className="text-2xl font-semibold">24</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <File className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Dosya</span>
          </div>
          <div className="text-2xl font-semibold">156</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Folder className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Kullanılan Alan</span>
          </div>
          <div className="text-2xl font-semibold">8.4 GB</div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
        <h3 className="text-lg font-semibold mb-4">Klasörler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: "XYZ Holding", files: 45, size: "2.3 GB" },
            { name: "ABC Corporation", files: 32, size: "1.8 GB" },
            { name: "DEF Medya", files: 28, size: "1.2 GB" },
            { name: "GHI Teknoloji", files: 51, size: "3.1 GB" },
          ].map((folder, i) => (
            <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/[0.06] hover:bg-white/10 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <Folder className="w-8 h-8 text-[#AAFF01]" />
                <div>
                  <p className="font-medium text-sm">{folder.name}</p>
                  <p className="text-xs text-[#A0A0A0]">{folder.files} dosya</p>
                </div>
              </div>
              <p className="text-xs text-[#A0A0A0]">{folder.size}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
        <h3 className="text-lg font-semibold mb-4">Son Dosyalar</h3>
        <div className="space-y-2">
          {[
            { name: "Meta_ADS_Kreatif_v3.psd", type: "image", size: "24.5 MB", client: "XYZ Holding", time: "2 saat önce" },
            { name: "Landing_Page_Design.fig", type: "design", size: "8.2 MB", client: "ABC Corp", time: "5 saat önce" },
            { name: "Haftalık_Rapor_April.pdf", type: "document", size: "2.1 MB", client: "DEF Medya", time: "1 gün önce" },
            { name: "Social_Media_Content.zip", type: "archive", size: "156 MB", client: "XYZ Holding", time: "2 gün önce" },
          ].map((file, i) => (
            <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/[0.06] hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {file.type === 'image' ? <Image className="w-5 h-5 text-[#AAFF01]" /> : <FileText className="w-5 h-5 text-[#AAFF01]" />}
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-[#A0A0A0]">{file.client} • {file.size} • {file.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
