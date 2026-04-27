import { Card } from "../../components/ui/card";
import { AlertCircle } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">{title}</h1>
        <p className="text-[#A0A0A0]">{description || "Bu sayfa hazırlanıyor"}</p>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-16 h-16 text-[#A0A0A0] mb-4" />
          <h3 className="text-xl font-semibold mb-2">Sayfa Hazırlanıyor</h3>
          <p className="text-[#A0A0A0] max-w-md">
            Bu sayfa şu anda geliştirilme aşamasındadır. Yakında burada detaylı bilgilere ve işlevlere erişebileceksiniz.
          </p>
        </div>
      </Card>
    </div>
  );
}
