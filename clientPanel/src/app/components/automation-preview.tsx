import { Zap, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from './button';

export function AutomationPreview() {
  return (
    <div className="bg-gradient-to-br from-[#7B61FF]/10 to-[#AAFF01]/5 rounded-2xl p-6 border border-[#7B61FF]/20">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#7B61FF]/20 flex items-center justify-center flex-shrink-0">
          <Zap className="w-6 h-6 text-[#7B61FF]" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl text-white mb-1">Automation Active</h3>
          <p className="text-[#A0A0A0] text-sm">312 users entered DM flow this week</p>
        </div>
      </div>

      <div className="bg-[#131313] rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#AAFF01]" />
          <span className="text-white text-sm">Bu hafta</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl text-white mb-1">312</div>
            <div className="text-xs text-[#A0A0A0]">DM akışına giren kullanıcı</div>
          </div>
          <div>
            <div className="text-2xl text-[#AAFF01] mb-1">%18.4</div>
            <div className="text-xs text-[#A0A0A0]">Dönüşüm oranı</div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-[#A0A0A0] mb-3">Flow visualization</div>
        <div className="flex items-center justify-between">
          {['Comment', 'DM', 'Link', 'Lead'].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="bg-[#7B61FF]/20 px-3 py-2 rounded-lg">
                <span className="text-white text-sm">{step}</span>
              </div>
              {i < 3 && <ArrowRight className="w-4 h-4 text-[#7B61FF]" />}
            </div>
          ))}
        </div>
      </div>

      <Button variant="secondary" className="w-full justify-center" icon={Zap}>
        Open Automation Hub
      </Button>
    </div>
  );
}
