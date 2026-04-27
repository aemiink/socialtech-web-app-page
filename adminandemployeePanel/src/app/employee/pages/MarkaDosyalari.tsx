import type { JSX } from "react";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Folder, FileText, Palette, Download, Search } from "lucide-react";

const markalar = [
  {
    id: "1",
    musteri: "Koçtaş",
    dosyalar: [
      { ad: "Koçtaş_Logo_Final.svg", tur: "Logo", boyut: "1.2 MB" },
      { ad: "Koçtaş_Brand_Guidelines.pdf", tur: "Kılavuz", boyut: "8.4 MB" },
      { ad: "Koçtaş_Color_Palette.ase", tur: "Renk", boyut: "0.4 MB" }
    ],
    guncelleme: "2026-03-15"
  },
  {
    id: "2",
    musteri: "Getir",
    dosyalar: [
      { ad: "Getir_Logo_Pack.zip", tur: "Logo", boyut: "4.8 MB" },
      { ad: "Getir_Brand_Book_2026.pdf", tur: "Kılavuz", boyut: "22.1 MB" },
      { ad: "Getir_Typography.zip", tur: "Tipografi", boyut: "12.3 MB" }
    ],
    guncelleme: "2026-04-01"
  },
  {
    id: "3",
    musteri: "LC Waikiki",
    dosyalar: [
      { ad: "LCW_Logo_All_Formats.zip", tur: "Logo", boyut: "6.2 MB" },
      { ad: "LCW_Brand_Identity.pdf", tur: "Kılavuz", boyut: "15.8 MB" }
    ],
    guncelleme: "2026-02-20"
  },
  {
    id: "4",
    musteri: "Migros",
    dosyalar: [
      { ad: "Migros_Logo_White_BG.png", tur: "Logo", boyut: "2.1 MB" },
      { ad: "Migros_Logo_Dark_BG.png", tur: "Logo", boyut: "2.0 MB" },
      { ad: "Migros_Colors_2026.ase", tur: "Renk", boyut: "0.3 MB" }
    ],
    guncelleme: "2025-12-10"
  }
];

const turIkonu: Record<string, JSX.Element> = {
  "Logo": <Palette className="w-4 h-4 text-[#AAFF01]" />,
  "Kılavuz": <FileText className="w-4 h-4 text-blue-400" />,
  "Renk": <Palette className="w-4 h-4 text-pink-400" />,
  "Tipografi": <FileText className="w-4 h-4 text-purple-400" />
};

export function MarkaDosyalari() {
  const toplamDosya = markalar.reduce((sum, m) => sum + m.dosyalar.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Marka Dosyaları</h1>
          <p className="text-[#A0A0A0]">Müşterilere ait logo, renk paleti ve marka kimlik kılavuzları</p>
        </div>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          <Search className="w-4 h-4 mr-2" /> Ara
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Folder className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Müşteri Sayısı</span>
          </div>
          <div className="text-2xl font-semibold">{markalar.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Dosya</span>
          </div>
          <div className="text-2xl font-semibold">{toplamDosya}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Palette className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Logo Seti</span>
          </div>
          <div className="text-2xl font-semibold">
            {markalar.reduce((sum, m) => sum + m.dosyalar.filter(d => d.tur === "Logo").length, 0)}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {markalar.map((marka) => (
          <Card key={marka.id} className="bg-[#1A1A1A] border-white/[0.06] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Folder className="w-6 h-6 text-[#AAFF01]" />
                <div>
                  <h4 className="font-semibold">{marka.musteri}</h4>
                  <p className="text-xs text-[#A0A0A0]">
                    Son güncelleme: {new Date(marka.guncelleme).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-1" /> Tümünü İndir
              </Button>
            </div>
            <div className="space-y-2">
              {marka.dosyalar.map((dosya, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#202020] border border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    {turIkonu[dosya.tur] ?? <FileText className="w-4 h-4 text-[#A0A0A0]" />}
                    <div>
                      <p className="text-sm font-medium">{dosya.ad}</p>
                      <p className="text-xs text-[#A0A0A0]">{dosya.boyut}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{dosya.tur}</Badge>
                    <Button size="sm" variant="ghost">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
