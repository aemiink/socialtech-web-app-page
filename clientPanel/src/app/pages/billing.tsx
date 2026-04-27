import { CreditCard, Download, CheckCircle } from 'lucide-react';
import { Button } from '../components/button';

const invoices = [
  { id: 'FAT-2026-04', date: '1 Nis 2026', amount: '₺3,700', status: 'paid' },
  { id: 'FAT-2026-03', date: '1 Mar 2026', amount: '₺3,700', status: 'paid' },
  { id: 'FAT-2026-02', date: '1 Şub 2026', amount: '₺3,700', status: 'paid' },
];

export function BillingPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Faturalama</h1>
        <p className="text-[#A0A0A0]">Aboneliğinizi ve faturalarınızı yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Mevcut Plan</h2>
          <div className="bg-gradient-to-br from-[#AAFF01]/10 to-[#7B61FF]/10 rounded-xl p-6 border border-[#AAFF01]/20 mb-4">
            <h3 className="text-2xl text-white mb-2">Büyüme Planı</h3>
            <p className="text-4xl text-[#AAFF01] mb-4">₺3,700<span className="text-lg text-[#A0A0A0]">/ay</span></p>
            <div className="space-y-2 text-sm text-white">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#AAFF01]" />
                <span>Sınırsız kampanya</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#AAFF01]" />
                <span>Gelişmiş otomasyonlar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#AAFF01]" />
                <span>Öncelikli destek</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
              <p className="text-xs text-[#A0A0A0] mb-1">Ödeme Durumu</p>
              <p className="text-[#AAFF01]">Aktif / Sorunsuz</p>
            </div>
            <div className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
              <p className="text-xs text-[#A0A0A0] mb-1">Sonraki Ödeme</p>
              <p className="text-white">1 Mayıs 2026</p>
            </div>
            <div className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
              <p className="text-xs text-[#A0A0A0] mb-1">Sözleşme Durumu</p>
              <p className="text-white">Aktif</p>
            </div>
            <div className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
              <p className="text-xs text-[#A0A0A0] mb-1">Paket Yenileme</p>
              <p className="text-white">Aylık</p>
            </div>
          </div>
          <Button variant="secondary" className="w-full justify-center">
            Aboneliği Yönet
          </Button>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Ödeme Yöntemi</h2>
          <div className="bg-[#202020] rounded-xl p-4 border border-white/[0.08] mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-br from-[#AAFF01] to-[#7B61FF] rounded flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-white">•••• •••• •••• 4242</p>
                  <p className="text-sm text-[#A0A0A0]">Son kullanma: 12/26</p>
                </div>
              </div>
            </div>
          </div>
          <Button variant="secondary" className="w-full justify-center">
            Ödeme Yöntemini Güncelle
          </Button>
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <h2 className="text-xl text-white mb-4">Fatura Geçmişi</h2>
        <div className="space-y-3">
          {invoices.map((invoice, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[#202020] rounded-xl border border-white/[0.08]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#AAFF01]/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-[#AAFF01]" />
                </div>
                <div>
                  <p className="text-white">{invoice.id}</p>
                  <p className="text-sm text-[#A0A0A0]">{invoice.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-white">{invoice.amount}</p>
                <span className="px-3 py-1 rounded-lg bg-[#AAFF01]/10 text-[#AAFF01] text-sm border border-[#AAFF01]/20">
                  Ödendi
                </span>
                <Button variant="ghost" icon={Download}>
                  İndir
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
