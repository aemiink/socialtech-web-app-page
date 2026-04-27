import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle,
  Clock,
  Code,
  Download,
  Eye,
  FileText,
  Gauge,
  Grid,
  Image,
  Layers,
  LineChart,
  Link,
  MessageSquare,
  MousePointerClick,
  Package,
  Palette,
  PlayCircle,
  Search,
  Send,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { Button } from '../components/button';
import { getServiceTabContent, ServiceTabContent } from '../data/service-pages';
import { runClientAction } from '../lib/client-actions';

interface ServiceTabPageProps {
  serviceId: string;
  tabId: string;
}

type ViewKind =
  | 'growth'
  | 'calendar'
  | 'approval'
  | 'published'
  | 'inbox'
  | 'insights'
  | 'campaigns'
  | 'performance'
  | 'funnel'
  | 'creative'
  | 'diagnostics'
  | 'project'
  | 'support'
  | 'brief'
  | 'delivery';

const statusTone = {
  good: 'border-[#AAFF01]/20 bg-[#AAFF01]/10 text-[#AAFF01]',
  info: 'border-[#00D4FF]/20 bg-[#00D4FF]/10 text-[#00D4FF]',
  violet: 'border-[#7B61FF]/20 bg-[#7B61FF]/10 text-[#7B61FF]',
  warn: 'border-[#FFA726]/20 bg-[#FFA726]/10 text-[#FFA726]',
  danger: 'border-[#ff4444]/20 bg-[#ff4444]/10 text-[#ff4444]',
};

const cardClass = 'bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]';
const innerClass = 'bg-[#202020] rounded-xl p-4 border border-white/[0.08]';

export function ServiceTabPage({ serviceId, tabId }: ServiceTabPageProps) {
  const content = getServiceTabContent(serviceId, tabId);
  const viewKind = getViewKind(serviceId, tabId);

  return (
    <div className="p-8 space-y-6">
      <PageHero content={content} tabId={tabId} />
      <SmartKpis content={content} tabId={tabId} />
      {renderWorkspace(viewKind, content, serviceId, tabId)}
      <ActionFooter content={content} />
    </div>
  );
}

function getViewKind(serviceId: string, tabId: string): ViewKind {
  if (['growth-summary', 'weekly-actions', 'channels'].includes(tabId)) return 'growth';
  if (['content-calendar'].includes(tabId)) return 'calendar';
  if (['pending-approvals', 'content-approvals', 'copywriting', 'wireframe', 'revisions', 'ugc-scripts', 'ad-copies'].includes(tabId)) return 'approval';
  if (['published-content'].includes(tabId)) return 'published';
  if (['dm-comments'].includes(tabId)) return 'inbox';
  if (['competitor-analysis', 'trend-notes', 'keywords', 'negative-keywords', 'audiences', 'search-terms', 'asin-targeting'].includes(tabId)) return 'insights';
  if (['campaigns', 'search-campaigns', 'sponsored-products', 'sponsored-brands', 'sponsored-display', 'meta-ads', 'google-ads', 'tiktok-ads', 'amazon-ads'].includes(tabId)) return 'campaigns';
  if (['channel-performance', 'budget-distribution', 'ad-sets', 'acos-tacos'].includes(tabId)) return 'performance';
  if (['funnel-structure', 'app-flow', 'ux-flow', 'project-roadmap'].includes(tabId)) return 'funnel';
  if (['creatives', 'video-creatives', 'hook-tests', 'design', 'ui-screens', 'screens', 'prototype'].includes(tabId)) return 'creative';
  if (['seo-audit', 'technical-issues', 'page-speed', 'index-status', 'search-console', 'pixel-events', 'conversions', 'form-tracking', 'retail-readiness', 'security', 'backup', 'maintenance', 'updates'].includes(tabId)) return 'diagnostics';
  if (['sprint-status', 'frontend', 'backend-api', 'admin-panel', 'test-deploy', 'api-admin', 'push-notifications', 'test-build', 'store-readiness', 'development', 'publish-status', 'ab-tests', 'responsive-design', 'design-system'].includes(tabId)) return 'project';
  if (['support-requests', 'open-tasks', 'resolved-tasks', 'activity-log'].includes(tabId)) return 'support';
  if (['brief-target'].includes(tabId)) return 'brief';
  if (['files', 'delivery-files'].includes(tabId)) return 'delivery';
  if (serviceId === 'technical-support') return 'support';
  return 'project';
}

function PageHero({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#1A1A1A] via-[#151515] to-[#101010] p-8">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#AAFF01]/10 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[#7B61FF]/10 blur-3xl" />
      <div className="relative max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-3 py-1 text-xs text-[#AAFF01] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          {content.serviceName}
          <span className="text-[#A0A0A0]">/</span>
          <span className="text-white/80">{tabId}</span>
        </div>
        <h1 className="text-3xl text-white mb-3">{content.title}</h1>
        <p className="text-[#A0A0A0] leading-relaxed max-w-3xl">{content.description}</p>
      </div>
    </div>
  );
}

function SmartKpis({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  const icons = [BarChart3, Target, Activity, CheckCircle];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {content.kpis.map((kpi, index) => {
        const Icon = icons[index % icons.length];

        return (
          <div key={`${tabId}-${kpi.label}`} className={`${cardClass} hover:border-[#AAFF01]/20 transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#A0A0A0] text-sm">{kpi.label}</span>
              <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 border border-[#AAFF01]/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#AAFF01]" />
              </div>
            </div>
            <div className="text-3xl text-white mb-1">{kpi.value}</div>
            <p className="text-sm text-[#A0A0A0]">{kpi.note}</p>
          </div>
        );
      })}
    </div>
  );
}

function renderWorkspace(kind: ViewKind, content: ServiceTabContent, serviceId: string, tabId: string) {
  switch (kind) {
    case 'growth':
      return <GrowthWorkspace content={content} />;
    case 'calendar':
      return <CalendarWorkspace content={content} />;
    case 'approval':
      return <ApprovalWorkspace content={content} tabId={tabId} />;
    case 'published':
      return <PublishedWorkspace content={content} />;
    case 'inbox':
      return <InboxWorkspace content={content} />;
    case 'insights':
      return <InsightWorkspace content={content} tabId={tabId} />;
    case 'campaigns':
      return <CampaignWorkspace content={content} serviceId={serviceId} tabId={tabId} />;
    case 'performance':
      return <PerformanceWorkspace content={content} tabId={tabId} />;
    case 'funnel':
      return <FunnelWorkspace content={content} tabId={tabId} />;
    case 'creative':
      return <CreativeWorkspace content={content} tabId={tabId} />;
    case 'diagnostics':
      return <DiagnosticsWorkspace content={content} tabId={tabId} />;
    case 'project':
      return <ProjectWorkspace content={content} tabId={tabId} />;
    case 'support':
      return <SupportWorkspace content={content} tabId={tabId} />;
    case 'brief':
      return <BriefWorkspace content={content} />;
    case 'delivery':
      return <DeliveryWorkspace content={content} />;
    default:
      return <ProjectWorkspace content={content} tabId={tabId} />;
  }
}

function GrowthWorkspace({ content }: { content: ServiceTabContent }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl text-white mb-1">Growth Control Center</h2>
            <p className="text-sm text-[#A0A0A0]">Kanal katkısı, riskler ve haftalık aksiyonlar birlikte okunur.</p>
          </div>
          <Button variant="secondary" icon={TrendingUp}>Growth Raporu</Button>
        </div>
        <div className="space-y-5">
          {content.table.rows.map((row, index) => (
            <div key={row.join('-')} className={innerClass}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
                  </div>
                  <div>
                    <p className="text-white">{row[0]}</p>
                    <p className="text-xs text-[#A0A0A0]">{row[1]} • {row[2]}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded border ${index === 0 ? statusTone.good : statusTone.violet}`}>
                  {row[3] || 'Takip'}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#131313] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#AAFF01] to-[#7B61FF]" style={{ width: `${78 - index * 9}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="text-xl text-white">Sonraki Önerilen Aksiyonlar</h2>
        {content.clientActions.map((action, index) => (
          <div key={action} className="rounded-xl bg-[#202020] p-4 border border-white/[0.08]">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[#AAFF01]" />
              <span className="text-xs text-[#AAFF01]">Aksiyon {index + 1}</span>
            </div>
            <p className="text-white text-sm mb-3">{action}</p>
            <Button variant={index === 0 ? 'primary' : 'secondary'} className="text-xs px-3 py-2">İncele</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarWorkspace({ content }: { content: ServiceTabContent }) {
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const posts = ['Reels', 'Story', 'Post', 'Carousel', 'Live', 'Story', 'Rapor'];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className={`${cardClass} xl:col-span-3`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl text-white mb-1">İçerik Takvimi</h2>
            <p className="text-sm text-[#A0A0A0]">Haftalık yayın planı, format ve onay durumu.</p>
          </div>
          <Button variant="secondary" icon={CalendarDays}>Aylık Takvim</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {days.map((day, index) => (
            <div key={day} className="min-h-44 rounded-2xl border border-white/[0.08] bg-[#131313] p-3">
              <div className="text-xs text-[#A0A0A0] mb-3">{day}</div>
              <div className="rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
                <span className={`text-xs px-2 py-1 rounded border ${index % 2 === 0 ? statusTone.good : statusTone.violet}`}>
                  {posts[index]}
                </span>
                <p className="text-white text-sm mt-3">{content.table.rows[index % content.table.rows.length]?.[0] || 'İçerik planı'}</p>
                <p className="text-xs text-[#A0A0A0] mt-2">{index % 2 === 0 ? 'Planlandı' : 'Onay bekliyor'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="text-xl text-white">Yayın Özeti</h2>
        {['3 Reels', '4 Story', '2 Post', '1 Carousel'].map((item) => (
          <div key={item} className="flex items-center justify-between rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
            <span className="text-white text-sm">{item}</span>
            <CheckCircle className="w-4 h-4 text-[#AAFF01]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ApprovalWorkspace({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  const labels = tabId.includes('copy') ? ['Headline', 'CTA', 'Section Copy'] : tabId.includes('wireframe') ? ['Wireframe', 'Feedback', 'Approval'] : ['Visual', 'Caption', 'Platform'];
  const [itemStatuses, setItemStatuses] = useState<Record<string, 'Onaylandı' | 'Revizyon İstendi' | 'Yorum Eklendi'>>({});

  const updateItem = (itemId: string, status: 'Onaylandı' | 'Revizyon İstendi' | 'Yorum Eklendi') => {
    setItemStatuses((current) => ({ ...current, [itemId]: status }));
    runClientAction(`${itemId} - ${status}`, status === 'Onaylandı' ? 'approve' : status === 'Revizyon İstendi' ? 'revision' : 'comment');
  };

  const approveAll = () => {
    const nextStatus = content.table.rows.slice(0, 4).reduce<Record<string, 'Onaylandı'>>((acc, row) => {
      acc[row[0]] = 'Onaylandı';
      return acc;
    }, {});
    setItemStatuses((current) => ({ ...current, ...nextStatus }));
    runClientAction(`${content.title} - Toplu Onay`, 'approve');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl text-white mb-1">Onay Masası</h2>
            <p className="text-sm text-[#A0A0A0]">Onay, revizyon ve yorum akışı burada ilerler.</p>
          </div>
          <Button variant="primary" icon={CheckCircle} onClick={approveAll}>Toplu Onayla</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.table.rows.slice(0, 4).map((row, index) => (
            <div key={row.join('-')} className={innerClass}>
              <div className="h-32 rounded-xl bg-gradient-to-br from-[#AAFF01]/10 via-[#7B61FF]/10 to-[#202020] border border-white/[0.08] mb-4 flex items-center justify-center">
                <Image className="w-8 h-8 text-[#AAFF01]" />
              </div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-white text-sm">{row[0]}</h3>
                <span className={`text-xs px-2 py-1 rounded border ${
                  itemStatuses[row[0]] === 'Onaylandı'
                    ? statusTone.good
                    : itemStatuses[row[0]] === 'Revizyon İstendi'
                      ? statusTone.warn
                      : itemStatuses[row[0]] === 'Yorum Eklendi'
                        ? statusTone.info
                        : statusTone.violet
                }`}>
                  {itemStatuses[row[0]] || 'Onay Bekliyor'}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {labels.map((label, labelIndex) => (
                  <div key={label} className="flex justify-between gap-4 text-sm">
                    <span className="text-[#A0A0A0]">{label}</span>
                    <span className="text-white text-right">{row[labelIndex] || row[0]}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" className="text-xs px-3 py-2" onClick={() => updateItem(row[0], 'Onaylandı')}>Onayla</Button>
                <Button variant="secondary" className="text-xs px-3 py-2" onClick={() => updateItem(row[0], 'Revizyon İstendi')}>Revizyon İste</Button>
                <Button variant="ghost" className="text-xs px-3 py-2" onClick={() => updateItem(row[0], 'Yorum Eklendi')}>Yorum</Button>
              </div>
              {index === 0 && <p className="text-xs text-[#AAFF01] mt-3">Ajans önerisi: bu versiyon yayın için hazır.</p>}
            </div>
          ))}
        </div>
      </div>
      <CommentRail content={content} />
    </div>
  );
}

function PublishedWorkspace({ content }: { content: ServiceTabContent }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <h2 className="text-xl text-white mb-5">Yayınlanan İçerik Grid’i</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {content.table.rows.slice(0, 6).map((row, index) => (
            <div key={row.join('-')} className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#202020]">
              <div className="h-40 bg-gradient-to-br from-[#AAFF01]/20 to-[#7B61FF]/20 flex items-center justify-center">
                <PlayCircle className="w-10 h-10 text-white" />
              </div>
              <div className="p-4">
                <h3 className="text-white text-sm mb-3">{row[0]}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <MetricPill label="Reach" value={row[1] || '12K'} />
                  <MetricPill label="Eng." value={row[2] || '%7.4'} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">En İyi Performans</h2>
        <div className="rounded-2xl bg-[#AAFF01] p-5 text-black mb-4">
          <p className="text-sm opacity-70">Best content</p>
          <p className="text-2xl mt-1">{content.table.rows[0]?.[0] || 'Reels içeriği'}</p>
          <p className="text-sm mt-3">Tekrar kullanılabilir kreatif açı yakalandı.</p>
        </div>
        <Button variant="secondary" icon={FileText}>Performansı Aç</Button>
      </div>
    </div>
  );
}

function InboxWorkspace({ content }: { content: ServiceTabContent }) {
  const messages = ['Fiyat bilgisi alabilir miyim?', 'Sipariş süresi nedir?', 'Kampanya devam ediyor mu?', 'Ürün ölçüsü var mı?'];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl text-white">DM & Yorum Inbox</h2>
          <span className={`text-xs px-2 py-1 rounded border ${statusTone.good}`}>Yanıt tonu aktif</span>
        </div>
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div key={message} className="flex gap-3 rounded-xl bg-[#202020] p-4 border border-white/[0.08]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white text-sm">Müşteri mesajı #{index + 1}</p>
                  <span className="text-xs text-[#A0A0A0]">{index + 2} dk önce</span>
                </div>
                <p className="text-sm text-[#A0A0A0] mb-3">{message}</p>
                <div className="rounded-lg bg-[#131313] p-3 text-sm text-white">
                  Önerilen yanıt: Merhaba, yardımcı olalım. Size en doğru bilgi için ilgili ürün linkini ve detayları iletiyoruz.
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">FAQ Özeti</h2>
        {content.table.rows.slice(0, 4).map((row) => (
          <div key={row.join('-')} className="mb-3 rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
            <p className="text-white text-sm">{row[0]}</p>
            <p className="text-xs text-[#A0A0A0] mt-1">{row[1] || 'Yanıtlandı'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightWorkspace({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  const isKeyword = tabId.includes('keyword') || tabId.includes('search') || tabId.includes('asin');

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl text-white mb-1">{isKeyword ? 'Analiz Tablosu' : 'Fırsat Haritası'}</h2>
            <p className="text-sm text-[#A0A0A0]">Karar verilecek alanlar aksiyon durumuna göre sıralanır.</p>
          </div>
          <Button variant="secondary" icon={Search}>Filtrele</Button>
        </div>
        <ResponsiveTable rows={content.table.rows} columns={isKeyword ? ['Terim', 'Hacim/Spend', 'Sonuç', 'Aksiyon'] : content.table.columns} />
      </div>
      <div className={`${cardClass} space-y-4`}>
        <h2 className="text-xl text-white">Opportunity Notes</h2>
        {content.sections[0]?.items.slice(0, 4).map((item, index) => (
          <div key={item} className="rounded-xl bg-[#202020] p-4 border border-white/[0.08]">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-[#AAFF01]" />
              <span className="text-xs text-[#AAFF01]">Skor {9 - index}/10</span>
            </div>
            <p className="text-white text-sm">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampaignWorkspace({ content, serviceId, tabId }: { content: ServiceTabContent; serviceId: string; tabId: string }) {
  const channel = tabId.includes('amazon') || serviceId === 'amazon-ads' ? 'ACOS' : tabId.includes('google') ? 'CPA' : tabId.includes('tiktok') ? 'VTR' : 'ROAS';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {content.table.rows.slice(0, 3).map((row, index) => (
          <div key={row.join('-')} className={cardClass}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white mb-1">{row[0]}</h3>
                <p className="text-xs text-[#A0A0A0]">{row[1] || 'Aktif kampanya'}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded border ${index === 0 ? statusTone.good : statusTone.info}`}>
                {row[3] || 'Aktif'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <MetricPill label="Bütçe" value={row[1] || '₺8.4K'} />
              <MetricPill label={channel} value={row[2] || '4.2x'} />
              <MetricPill label="Durum" value={row[3] || 'Scale'} />
            </div>
            <div className="h-2 rounded-full bg-[#131313] overflow-hidden">
              <div className="h-full rounded-full bg-[#AAFF01]" style={{ width: `${70 + index * 8}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl text-white">Optimizasyon Notları</h2>
          <Button variant="primary" icon={Zap}>Aksiyonları Gör</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {content.sections.flatMap((section) => section.items).slice(0, 6).map((item) => (
            <div key={item} className={innerClass}>
              <LineChart className="w-5 h-5 text-[#AAFF01] mb-3" />
              <p className="text-white text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PerformanceWorkspace({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <h2 className="text-xl text-white mb-5">{tabId.includes('budget') ? 'Bütçe Dağılımı' : 'Performans Karşılaştırması'}</h2>
        <div className="space-y-4">
          {content.table.rows.map((row, index) => (
            <div key={row.join('-')} className={innerClass}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white">{row[0]}</p>
                <p className="text-[#AAFF01]">{row[2] || row[1]}</p>
              </div>
              <div className="h-3 rounded-full bg-[#131313] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#AAFF01] to-[#7B61FF]" style={{ width: `${82 - index * 10}%` }} />
              </div>
              <p className="text-xs text-[#A0A0A0] mt-2">{row[3] || 'Öneri takipte'}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Önerilen Kaydırma</h2>
        <div className="rounded-2xl bg-[#AAFF01] p-5 text-black">
          <p className="text-sm opacity-70">Budget signal</p>
          <p className="text-3xl mt-1">+%12</p>
          <p className="text-sm mt-3">En verimli kanala kontrollü bütçe aktarımı öneriliyor.</p>
        </div>
      </div>
    </div>
  );
}

function FunnelWorkspace({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  const steps = tabId.includes('roadmap') ? ['Plan', 'Design', 'Develop', 'Test', 'Launch'] : tabId.includes('ux') || tabId.includes('flow') ? ['Entry', 'Browse', 'Action', 'Conversion'] : ['Awareness', 'Consideration', 'Conversion', 'Retention'];

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-6">Akış Haritası</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <div key={step} className="relative rounded-2xl bg-[#202020] border border-white/[0.08] p-5">
              <div className="w-11 h-11 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5 text-[#AAFF01]" />
              </div>
              <h3 className="text-white mb-2">{step}</h3>
              <p className="text-xs text-[#A0A0A0]">{content.sections[0]?.items[index] || 'Akış noktası takipte'}</p>
              {index < steps.length - 1 && <ArrowRight className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AAFF01]" />}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ResponsiveTable rows={content.table.rows} columns={content.table.columns} />
        <CommentRail content={content} />
      </div>
    </div>
  );
}

function CreativeWorkspace({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  const isVideo = tabId.includes('video') || tabId.includes('hook') || tabId.includes('prototype');

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl text-white">{isVideo ? 'Video / Prototype Grid' : 'Kreatif Galeri'}</h2>
          <Button variant="secondary" icon={Eye}>Önizle</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="rounded-2xl overflow-hidden bg-[#202020] border border-white/[0.08]">
              <div className="h-40 bg-gradient-to-br from-[#AAFF01]/15 to-[#7B61FF]/20 flex items-center justify-center">
                {isVideo ? <PlayCircle className="w-10 h-10 text-[#AAFF01]" /> : <Palette className="w-10 h-10 text-[#AAFF01]" />}
              </div>
              <div className="p-4">
                <h3 className="text-white text-sm mb-3">{content.table.rows[index % content.table.rows.length]?.[0] || `Varyant ${index + 1}`}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <MetricPill label={isVideo ? 'VTR' : 'CTR'} value={index % 2 === 0 ? '%42' : '%3.1'} />
                  <MetricPill label="Durum" value={index % 3 === 0 ? 'Winner' : 'Testing'} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`${cardClass} space-y-4`}>
        <h2 className="text-xl text-white">Revision Tracker</h2>
        {content.clientActions.map((action, index) => (
          <div key={action} className={innerClass}>
            <span className={`text-xs px-2 py-1 rounded border ${index === 0 ? statusTone.warn : statusTone.good}`}>{index === 0 ? 'Bekliyor' : 'İşlendi'}</span>
            <p className="text-white text-sm mt-3">{action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiagnosticsWorkspace({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  const icon = tabId.includes('security') ? Shield : tabId.includes('speed') ? Gauge : tabId.includes('backup') ? Package : Activity;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl text-white">Kontrol Listesi</h2>
          <Button variant="secondary" icon={FileText}>Detay Rapor</Button>
        </div>
        <div className="space-y-3">
          {content.sections.flatMap((section) => section.items).slice(0, 8).map((item, index) => {
            const Icon = icon;
            return (
              <div key={item} className="flex items-center justify-between gap-4 rounded-xl bg-[#202020] p-4 border border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#AAFF01]" />
                  </div>
                  <div>
                    <p className="text-white text-sm">{item}</p>
                    <p className="text-xs text-[#A0A0A0]">{index % 3 === 0 ? 'Müşteri onayı bekliyor' : 'Social Tech kontrolünde'}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded border ${index % 3 === 0 ? statusTone.warn : statusTone.good}`}>
                  {index % 3 === 0 ? 'Aksiyon' : 'Sağlıklı'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Health Score</h2>
        <div className="h-48 rounded-full border-[18px] border-[#AAFF01]/70 flex items-center justify-center mb-5">
          <div className="text-center">
            <div className="text-5xl text-white">94</div>
            <div className="text-sm text-[#A0A0A0]">/ 100</div>
          </div>
        </div>
        <p className="text-sm text-[#A0A0A0]">{content.agencyComment}</p>
      </div>
    </div>
  );
}

function ProjectWorkspace({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  const columns = ['Planlandı', 'Devam Ediyor', 'İncelemede', 'Tamamlandı'];
  const icon = tabId.includes('backend') || tabId.includes('api') ? Code : tabId.includes('design') ? Palette : Wrench;

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-5">Operasyon Board</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map((column, columnIndex) => (
            <div key={column} className="rounded-2xl bg-[#131313] border border-white/[0.08] p-4 min-h-72">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-sm">{column}</h3>
                <span className="text-xs text-[#A0A0A0]">{columnIndex + 1}</span>
              </div>
              <div className="space-y-3">
                {content.sections.flatMap((section) => section.items).slice(columnIndex, columnIndex + 2).map((item) => {
                  const Icon = icon;
                  return (
                    <div key={`${column}-${item}`} className="rounded-xl bg-[#202020] p-3 border border-white/[0.08]">
                      <Icon className="w-4 h-4 text-[#AAFF01] mb-2" />
                      <p className="text-white text-sm">{item}</p>
                      <p className="text-xs text-[#A0A0A0] mt-2">Ajans takibinde</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ResponsiveTable rows={content.table.rows} columns={content.table.columns} />
        <CommentRail content={content} />
      </div>
    </div>
  );
}

function SupportWorkspace({ content, tabId }: { content: ServiceTabContent; tabId: string }) {
  const isForm = tabId === 'support-requests';
  const [submittedTickets, setSubmittedTickets] = useState<string[]>([]);

  const submitTicket = () => {
    const title = `Yeni destek talebi #${submittedTickets.length + 1}`;
    setSubmittedTickets((current) => [title, ...current]);
    runClientAction(title, 'submit');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {isForm && (
        <div className={cardClass}>
          <h2 className="text-xl text-white mb-4">Yeni Destek Talebi</h2>
          {['Talep başlığı', 'Kategori', 'Öncelik', 'Kısa açıklama'].map((field) => (
            <div key={field} className="mb-3">
              <label className="text-xs text-[#A0A0A0]">{field}</label>
              <div className="mt-2 h-11 rounded-xl bg-[#202020] border border-white/[0.08]" />
            </div>
          ))}
          <Button variant="primary" icon={Send} className="w-full justify-center" onClick={submitTicket}>Talebi Gönder</Button>
        </div>
      )}
      <div className={`${cardClass} ${isForm ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
        <h2 className="text-xl text-white mb-5">{isForm ? 'Mevcut Talepler' : 'Ticket Board'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Açık', 'İşlemde', 'Çözüldü'].map((column, columnIndex) => (
            <div key={column} className="rounded-2xl bg-[#131313] border border-white/[0.08] p-4">
              <h3 className="text-white mb-4">{column}</h3>
              {columnIndex === 0 && submittedTickets.map((ticket, index) => (
                <div key={ticket} className="rounded-xl bg-[#202020] p-4 border border-[#AAFF01]/20 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded border ${statusTone.good}`}>Yeni</span>
                    <span className="text-xs text-[#A0A0A0]">#{2900 + index}</span>
                  </div>
                  <p className="text-white text-sm">{ticket}</p>
                  <p className="text-xs text-[#A0A0A0] mt-2">Social Tech ekibine iletildi.</p>
                </div>
              ))}
              {content.table.rows.slice(0, 3).map((row, index) => (
                <div key={`${column}-${row.join('-')}-${index}`} className="rounded-xl bg-[#202020] p-4 border border-white/[0.08] mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded border ${columnIndex === 2 ? statusTone.good : columnIndex === 1 ? statusTone.info : statusTone.warn}`}>
                      {column}
                    </span>
                    <span className="text-xs text-[#A0A0A0]">#{2840 + index}</span>
                  </div>
                  <p className="text-white text-sm">{row[0]}</p>
                  <p className="text-xs text-[#A0A0A0] mt-2">{row[1] || 'Son güncelleme bugün'}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BriefWorkspace({ content }: { content: ServiceTabContent }) {
  const fields = ['Campaign goal', 'Target audience', 'Offer', 'CTA', 'Brand notes'];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <h2 className="text-xl text-white mb-5">Brief & Hedef Formu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field, index) => (
            <div key={field} className={innerClass}>
              <label className="text-xs text-[#A0A0A0]">{field}</label>
              <p className="text-white mt-2">{content.sections[0]?.items[index] || 'Netleştirildi'}</p>
            </div>
          ))}
        </div>
      </div>
      <CommentRail content={content} />
    </div>
  );
}

function DeliveryWorkspace({ content }: { content: ServiceTabContent }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${cardClass} xl:col-span-2`}>
        <h2 className="text-xl text-white mb-5">Teslim Dosyaları</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Tasarım Linki', 'Export Assetleri', 'Style Guide', 'Dokümanlar'].map((file, index) => (
            <div key={file} className={innerClass}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-[#AAFF01]" />
                </div>
                <span className={`text-xs px-2 py-1 rounded border ${index < 2 ? statusTone.good : statusTone.info}`}>
                  {index < 2 ? 'Hazır' : 'Güncel'}
                </span>
              </div>
              <h3 className="text-white mb-2">{file}</h3>
              <p className="text-xs text-[#A0A0A0] mb-4">Müşteri erişimine açık teslim paketi.</p>
              <Button variant="secondary" className="text-xs px-3 py-2" icon={Link}>Görüntüle</Button>
            </div>
          ))}
        </div>
      </div>
      <CommentRail content={content} />
    </div>
  );
}

function ActionFooter({ content }: { content: ServiceTabContent }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Son Aktiviteler</h2>
        <div className="space-y-4">
          {content.timeline.map((item, index) => (
            <div key={item} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[#AAFF01]" />
                {index < content.timeline.length - 1 && <div className="w-px h-10 bg-white/[0.08] mt-2" />}
              </div>
              <div>
                <p className="text-white text-sm">{item}</p>
                <p className="text-xs text-[#A0A0A0] mt-1">Social Tech tarafından güncellendi</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={cardClass}>
        <h2 className="text-xl text-white mb-4">Sizden Beklenenler</h2>
        <div className="space-y-3">
          {content.clientActions.map((action, index) => (
            <div key={action} className={innerClass}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded border ${index === 0 ? statusTone.good : statusTone.violet}`}>
                  {index === 0 ? 'Öncelikli' : 'Takip'}
                </span>
                <span className="text-xs text-[#A0A0A0] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Bu hafta
                </span>
              </div>
              <p className="text-white text-sm mb-3">{action}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" className="text-xs px-3 py-2">Onayla</Button>
                <Button variant="ghost" className="text-xs px-3 py-2">Yorum Ekle</Button>
                <Button variant="ghost" className="text-xs px-3 py-2">Revizyon İste</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommentRail({ content }: { content: ServiceTabContent }) {
  return (
    <div className="bg-gradient-to-br from-[#AAFF01]/5 to-[#7B61FF]/5 rounded-2xl p-6 border border-[#AAFF01]/20">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-[#AAFF01]" />
        <h2 className="text-xl text-white">Ajans Yorumu</h2>
      </div>
      <p className="text-sm text-[#A0A0A0] leading-relaxed mb-5">{content.agencyComment}</p>
      <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AAFF01] to-[#7B61FF]" />
        <span>Social Tech Ekibi</span>
      </div>
    </div>
  );
}

function ResponsiveTable({ rows, columns }: { rows: string[][]; columns: string[] }) {
  return (
    <div className={cardClass}>
      <div className="overflow-hidden rounded-xl border border-white/[0.08]">
        <div className="grid grid-cols-4 bg-[#131313]">
          {columns.slice(0, 4).map((column) => (
            <div key={column} className="px-4 py-3 text-xs text-[#A0A0A0] border-b border-white/[0.08]">
              {column}
            </div>
          ))}
        </div>
        {rows.map((row, rowIndex) => (
          <div key={`${row[0]}-${rowIndex}`} className="grid grid-cols-4 bg-[#202020] border-b border-white/[0.06] last:border-b-0">
            {row.slice(0, 4).map((cell, cellIndex) => (
              <div key={`${cell}-${cellIndex}`} className={`px-4 py-4 text-sm ${cellIndex === 0 ? 'text-white' : 'text-[#A0A0A0]'}`}>
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#131313] p-2">
      <div className="text-xs text-[#A0A0A0]">{label}</div>
      <div className="text-sm text-white mt-1">{value}</div>
    </div>
  );
}
