import { Mail, Phone, MessageSquare } from 'lucide-react';
import { Button } from '../components/button';
import { runClientAction } from '../lib/client-actions';

const leads = [
  { name: 'Ayşe Yılmaz', source: 'Meta Kampanyası', status: 'hot', value: '₺18,000', lastContact: '2 saat önce' },
  { name: 'Mehmet Demir', source: 'Instagram DM', status: 'warm', value: '₺13,500', lastContact: '1 gün önce' },
  { name: 'Zeynep Kaya', source: 'Google Ads', status: 'cold', value: '₺6,700', lastContact: '3 gün önce' },
  { name: 'Can Arslan', source: 'Referans', status: 'hot', value: '₺24,000', lastContact: '4 saat önce' },
];

const statusColors = {
  hot: 'bg-[#ff4444]/10 text-[#ff4444] border-[#ff4444]/20',
  warm: 'bg-[#FFA726]/10 text-[#FFA726] border-[#FFA726]/20',
  cold: 'bg-[#7B61FF]/10 text-[#7B61FF] border-[#7B61FF]/20',
};

const statusLabels = {
  hot: 'Sıcak',
  warm: 'Ilık',
  cold: 'Soğuk',
};

export function LeadsPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white mb-2">Potansiyel Müşteriler</h1>
          <p className="text-[#A0A0A0]">Potansiyel müşteri hattınızı yönetin</p>
        </div>
        <Button variant="primary">Potansiyel Müşteri Ekle</Button>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/[0.08]">
              <tr>
                <th className="text-left p-4 text-[#A0A0A0] text-sm">İsim</th>
                <th className="text-left p-4 text-[#A0A0A0] text-sm">Kaynak</th>
                <th className="text-left p-4 text-[#A0A0A0] text-sm">Durum</th>
                <th className="text-left p-4 text-[#A0A0A0] text-sm">Değer</th>
                <th className="text-left p-4 text-[#A0A0A0] text-sm">Son İletişim</th>
                <th className="text-left p-4 text-[#A0A0A0] text-sm">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <tr key={i} className="border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-white">{lead.name}</td>
                  <td className="p-4 text-[#A0A0A0]">{lead.source}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-lg text-sm border ${statusColors[lead.status as keyof typeof statusColors]}`}>
                      {statusLabels[lead.status as keyof typeof statusLabels]}
                    </span>
                  </td>
                  <td className="p-4 text-white">{lead.value}</td>
                  <td className="p-4 text-[#A0A0A0]">{lead.lastContact}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => runClientAction(`${lead.name} için e-posta aksiyonu`, 'open')}
                        className="p-2 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] text-white transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => runClientAction(`${lead.name} için telefon araması`, 'meeting')}
                        className="p-2 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] text-white transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => runClientAction(`${lead.name} için WhatsApp mesajı`, 'comment')}
                        className="p-2 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] text-white transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
