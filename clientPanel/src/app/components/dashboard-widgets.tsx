import { CheckCircle, Clock, LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './button';

interface KpiItem {
  title: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone?: 'lime' | 'violet' | 'blue' | 'red' | 'muted';
}

interface StatusItem {
  title: string;
  status: string;
  note: string;
  tone?: 'lime' | 'violet' | 'blue' | 'red' | 'muted';
}

interface ActionItem {
  title: string;
  dueDate: string;
  priority: 'Acil' | 'Orta' | 'Normal';
}

const toneClasses = {
  lime: 'bg-[#AAFF01]/10 text-[#AAFF01] border-[#AAFF01]/20',
  violet: 'bg-[#7B61FF]/10 text-[#7B61FF] border-[#7B61FF]/20',
  blue: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
  red: 'bg-destructive/10 text-destructive border-destructive/20',
  muted: 'bg-white/[0.05] text-[#A0A0A0] border-white/[0.08]',
};

export function DashboardHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

export function KpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        const tone = toneClasses[item.tone || 'lime'];

        return (
          <div key={item.title} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">{item.title}</span>
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${tone}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{item.value}</div>
            <div className="text-xs text-muted-foreground">{item.note}</div>
          </div>
        );
      })}
    </div>
  );
}

export function ProgressPath({ title, subtitle, phases }: { title: string; subtitle: string; phases: string[] }) {
  return (
    <div className="bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-xl p-6 border border-[#AAFF01]/20">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl text-[#AAFF01]">72%</div>
          <div className="text-xs text-[#A0A0A0]">aktif ilerleme</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {phases.map((phase, index) => {
          const completed = index < 2;
          const active = index === 2;

          return (
            <div key={phase} className="bg-[#131313]/80 rounded-xl p-4 border border-white/[0.08]">
              <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${
                completed ? 'bg-[#AAFF01]/15' : active ? 'bg-[#7B61FF]/15' : 'bg-white/[0.05]'
              }`}>
                {completed ? (
                  <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
                ) : (
                  <Clock className={`w-5 h-5 ${active ? 'text-[#7B61FF]' : 'text-[#A0A0A0]'}`} />
                )}
              </div>
              <div className="text-sm text-white mb-1">{phase}</div>
              <div className="text-xs text-[#A0A0A0]">
                {completed ? 'Tamamlandı' : active ? 'Devam ediyor' : 'Planlandı'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StatusGrid({ title, description, items }: { title: string; description: string; items: StatusItem[] }) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-sm font-semibold text-foreground mb-3">{title}</h2>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.title} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-foreground text-sm font-medium">{item.title}</h3>
              <span className={`text-xs px-2 py-1 rounded border ${toneClasses[item.tone || 'lime']}`}>
                {item.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgencyComment({ title, children, author }: { title?: string; children: ReactNode; author: string }) {
  return (
    <div className="bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-xl p-6 border border-[#AAFF01]/20">
      <h2 className="text-sm font-semibold text-foreground mb-3">{title || 'Ajans Yorumu'}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-5 pt-4 border-t border-border">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]" />
        <span>{author}</span>
        <span className="ml-auto">27 Nisan 2026</span>
      </div>
    </div>
  );
}

export function ClientActions({ items }: { items: ActionItem[] }) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-sm font-semibold text-foreground mb-3">Sizden Beklenenler</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.title} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs px-2 py-1 rounded border ${
                item.priority === 'Acil' ? toneClasses.red : item.priority === 'Orta' ? toneClasses.violet : toneClasses.lime
              }`}>
                {item.priority}
              </span>
              <span className="text-xs text-muted-foreground">{item.dueDate}</span>
            </div>
            <p className="text-foreground text-sm mb-3">{item.title}</p>
            <div className="flex gap-2">
              <Button variant="secondary" className="text-xs px-3 py-2">Onayla</Button>
              <Button variant="ghost" className="text-xs px-3 py-2">Revizyon İste</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityTimeline({ items }: { items: string[] }) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-sm font-semibold text-foreground mb-3">Son Aktiviteler</h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-[#AAFF01] shrink-0" />
              {index < items.length - 1 && <div className="w-px h-10 bg-border mt-2" />}
            </div>
            <div>
              <p className="text-foreground text-sm">{item}</p>
              <p className="text-xs text-muted-foreground mt-1">{index + 1} saat önce güncellendi</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
