import {
  LayoutDashboard, BarChart3, Calendar, CreditCard, Settings, LogOut, ChevronLeft, ChevronRight, ArrowLeft,
  TrendingUp, Target, Layers, CheckSquare, Zap, MessageSquare, FileText, Eye, Users, Megaphone,
  Search, Image, Cpu, Smartphone, Code, FileCode, Palette, Wrench, AlertCircle, Activity,
  Package, Hash, Video, DollarSign, Grid, ShoppingCart, PlayCircle, LucideIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  selectedService?: string | null;
  onBackToServices?: () => void;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const serviceLabels: Record<string, string> = {
  'growth-hub': 'Growth & Hub',
  'social-media': 'Sosyal Medya Yönetimi',
  'media-hub': 'Medya Hub',
  'meta-ads': 'Meta ADS',
  'tiktok-ads': 'TikTok ADS',
  'google-ads': 'Google ADS',
  'amazon-ads': 'Amazon ADS',
  'web-app': 'Web APP',
  'mobile-app': 'Mobil APP',
  'landing-pages': 'Landing Pages',
  'web-mobile-design': 'Web & Mobil Tasarımlar',
  'technical-support': 'Teknik Destek',
  'seo-audit': 'SEO Denetimi',
};

const serviceMenuItems: Record<string, MenuItem[]> = {
  'growth-hub': [
    { id: 'service-dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'growth-summary', label: 'Growth Özeti', icon: TrendingUp },
    { id: 'channels', label: 'Kanallar', icon: Layers },
    { id: 'campaigns', label: 'Kampanyalar', icon: Target },
    { id: 'content-approvals', label: 'İçerik Onayları', icon: CheckSquare },
    { id: 'weekly-actions', label: 'Haftalık Aksiyonlar', icon: Zap },
  ],
  'social-media': [
    { id: 'service-dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'content-calendar', label: 'İçerik Takvimi', icon: Calendar },
    { id: 'pending-approvals', label: 'Onay Bekleyenler', icon: CheckSquare },
    { id: 'published-content', label: 'Yayınlanan İçerikler', icon: FileText },
    { id: 'dm-comments', label: 'DM & Yorumlar', icon: MessageSquare },
    { id: 'competitor-analysis', label: 'Rakip Analizi', icon: Eye },
    { id: 'trend-notes', label: 'Trend Notları', icon: TrendingUp },
  ],
  'media-hub': [
    { id: 'service-dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'channel-performance', label: 'Kanal Performansı', icon: BarChart3 },
    { id: 'budget-distribution', label: 'Bütçe Dağılımı', icon: DollarSign },
    { id: 'funnel-structure', label: 'Funnel Yapısı', icon: Target },
    { id: 'creative-tests', label: 'Kreatif Testleri', icon: Image },
    { id: 'meta-ads', label: 'Meta ADS', icon: Megaphone },
    { id: 'google-ads', label: 'Google ADS', icon: Search },
    { id: 'tiktok-ads', label: 'TikTok ADS', icon: Video },
    { id: 'amazon-ads', label: 'Amazon ADS', icon: ShoppingCart },
  ],
  'meta-ads': [
    { id: 'service-dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Kampanyalar', icon: Target },
    { id: 'ad-sets', label: 'Reklam Setleri', icon: Layers },
    { id: 'creatives', label: 'Kreatifler', icon: Image },
    { id: 'audiences', label: 'Kitleler', icon: Users },
    { id: 'pixel-events', label: 'Pixel & Events', icon: Activity },
    { id: 'meta-reports', label: 'Raporlar', icon: BarChart3 },
    { id: 'agency-notes', label: 'Ajans Notları', icon: MessageSquare },
    { id: 'approvals', label: 'Onaylar', icon: CheckSquare },
  ],
  'tiktok-ads': [
    { id: 'service-dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Kampanyalar', icon: Target },
    { id: 'video-creatives', label: 'Video Kreatifler', icon: Video },
    { id: 'hook-tests', label: 'Hook Testleri', icon: PlayCircle },
    { id: 'audiences', label: 'Kitleler', icon: Users },
    { id: 'pixel-events', label: 'Pixel & Events', icon: Activity },
    { id: 'ugc-scripts', label: 'UGC Scriptleri', icon: FileText },
    { id: 'optimization-notes', label: 'Optimizasyon Notları', icon: Zap },
  ],
  'google-ads': [
    { id: 'service-dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'search-campaigns', label: 'Search Kampanyaları', icon: Search },
    { id: 'keywords', label: 'Anahtar Kelimeler', icon: Hash },
    { id: 'ad-copies', label: 'Reklam Metinleri', icon: FileText },
    { id: 'negative-keywords', label: 'Negatif Kelimeler', icon: AlertCircle },
    { id: 'conversions', label: 'Dönüşümler', icon: Target },
    { id: 'landing-page-notes', label: 'Landing Page Notları', icon: FileCode },
    { id: 'optimization-notes', label: 'Optimizasyon Notları', icon: Zap },
  ],
  'amazon-ads': [
    { id: 'service-dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'sponsored-products', label: 'Sponsored Products', icon: Package },
    { id: 'sponsored-brands', label: 'Sponsored Brands', icon: Megaphone },
    { id: 'sponsored-display', label: 'Sponsored Display', icon: Eye },
    { id: 'search-terms', label: 'Search Terms', icon: Search },
    { id: 'asin-targeting', label: 'ASIN Targeting', icon: Target },
    { id: 'retail-readiness', label: 'Retail Readiness', icon: CheckSquare },
    { id: 'acos-tacos', label: 'ACOS / TACOS', icon: DollarSign },
  ],
  'web-app': [
    { id: 'service-dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'project-roadmap', label: 'Proje Yol Haritası', icon: TrendingUp },
    { id: 'sprint-status', label: 'Sprint Durumu', icon: Target },
    { id: 'ui-ux', label: 'UI / UX', icon: Palette },
    { id: 'frontend', label: 'Frontend', icon: Code },
    { id: 'backend-api', label: 'Backend / API', icon: Cpu },
    { id: 'admin-panel', label: 'Admin Panel', icon: Settings },
    { id: 'test-deploy', label: 'Test & Yayın', icon: Zap },
    { id: 'revisions', label: 'Revizyonlar', icon: FileText },
    { id: 'files', label: 'Dosyalar', icon: Package },
  ],
  'mobile-app': [
    { id: 'service-dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'app-flow', label: 'Uygulama Akışı', icon: TrendingUp },
    { id: 'screens', label: 'Ekranlar', icon: Smartphone },
    { id: 'sprint-status', label: 'Sprint Durumu', icon: Target },
    { id: 'api-admin', label: 'API & Admin Panel', icon: Cpu },
    { id: 'push-notifications', label: 'Push Bildirimleri', icon: MessageSquare },
    { id: 'test-build', label: 'Test Build', icon: Zap },
    { id: 'store-readiness', label: 'Store Hazırlığı', icon: CheckSquare },
    { id: 'revisions', label: 'Revizyonlar', icon: FileText },
  ],
  'landing-pages': [
    { id: 'service-dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'brief-target', label: 'Brief & Hedef', icon: Target },
    { id: 'copywriting', label: 'Copywriting', icon: FileText },
    { id: 'design', label: 'Tasarım', icon: Palette },
    { id: 'development', label: 'Geliştirme', icon: Code },
    { id: 'form-tracking', label: 'Form & Tracking', icon: Activity },
    { id: 'ab-tests', label: 'A/B Testleri', icon: Eye },
    { id: 'publish-status', label: 'Yayın Durumu', icon: Zap },
    { id: 'revisions', label: 'Revizyonlar', icon: CheckSquare },
  ],
  'web-mobile-design': [
    { id: 'service-dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'ux-flow', label: 'UX Akışı', icon: TrendingUp },
    { id: 'wireframe', label: 'Wireframe', icon: Grid },
    { id: 'ui-screens', label: 'UI Ekranları', icon: Smartphone },
    { id: 'design-system', label: 'Design System', icon: Palette },
    { id: 'responsive-design', label: 'Responsive Tasarım', icon: Layers },
    { id: 'prototype', label: 'Prototip', icon: PlayCircle },
    { id: 'revisions', label: 'Revizyonlar', icon: FileText },
    { id: 'delivery-files', label: 'Teslim Dosyaları', icon: Package },
  ],
  'technical-support': [
    { id: 'service-dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'support-requests', label: 'Destek Talepleri', icon: MessageSquare },
    { id: 'open-tasks', label: 'Açık İşler', icon: AlertCircle },
    { id: 'resolved-tasks', label: 'Çözülen İşler', icon: CheckSquare },
    { id: 'maintenance', label: 'Bakım', icon: Wrench },
    { id: 'security', label: 'Güvenlik', icon: Eye },
    { id: 'backup', label: 'Yedekleme', icon: Package },
    { id: 'updates', label: 'Güncellemeler', icon: Zap },
    { id: 'activity-log', label: 'Aktivite Logu', icon: Activity },
  ],
  'seo-audit': [
    { id: 'service-dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'seo-audit', label: 'SEO Audit', icon: BarChart3 },
    { id: 'technical-issues', label: 'Teknik Hatalar', icon: AlertCircle },
    { id: 'keywords', label: 'Anahtar Kelimeler', icon: Hash },
    { id: 'page-speed', label: 'Sayfa Hızı', icon: Zap },
    { id: 'index-status', label: 'Index Durumu', icon: Eye },
    { id: 'search-console', label: 'Search Console', icon: Search },
    { id: 'competitor-analysis', label: 'Rakip Analizi', icon: Users },
    { id: 'action-plan', label: 'Aksiyon Planı', icon: Target },
  ],
};

const sharedBottomItems: MenuItem[] = [
  { id: 'reports', label: 'Raporlar', icon: BarChart3 },
  { id: 'meetings', label: 'Toplantılar', icon: Calendar },
  { id: 'billing', label: 'Faturalama', icon: CreditCard },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export function Sidebar({ currentPage, onPageChange, selectedService, onBackToServices, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const serviceSpecificItems = selectedService ? serviceMenuItems[selectedService] || [] : [];

  return (
    <div className={cn(
      "h-screen bg-[#131313] border-r border-white/[0.08] flex flex-col transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn(
        "p-6 border-b border-white/[0.08]",
        isCollapsed ? "flex items-center justify-center" : ""
      )}>
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#AAFF01] flex items-center justify-center">
                <span className="text-black font-semibold">ST</span>
              </div>
              <span className="text-xl text-white font-medium">Social Tech</span>
            </div>
            {selectedService && (
              <div>
                <div className="text-xs text-[#A0A0A0] mb-1">Aktif Servis</div>
                <div className="text-sm text-white font-medium">{serviceLabels[selectedService]}</div>
              </div>
            )}
            {selectedService && (
              <button
                onClick={onBackToServices}
                className="flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Servislere Dön</span>
              </button>
            )}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-[#AAFF01] flex items-center justify-center">
            <span className="text-black font-semibold">ST</span>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute left-[240px] top-6 w-6 h-6 bg-[#1A1A1A] border border-white/[0.08] rounded-full flex items-center justify-center text-white hover:bg-[#AAFF01] hover:text-black transition-all z-10"
        style={{ left: isCollapsed ? '68px' : '240px' }}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {serviceSpecificItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive
                  ? "bg-[#AAFF01]/10 text-[#AAFF01] shadow-[0_0_20px_rgba(170,255,1,0.15)]"
                  : "text-[#A0A0A0] hover:bg-white/[0.05] hover:text-white",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}

        {serviceSpecificItems.length > 0 && sharedBottomItems.length > 0 && (
          <div className="my-2 border-t border-white/[0.08]"></div>
        )}

        {sharedBottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive
                  ? "bg-[#AAFF01]/10 text-[#AAFF01] shadow-[0_0_20px_rgba(170,255,1,0.15)]"
                  : "text-[#A0A0A0] hover:bg-white/[0.05] hover:text-white",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/[0.08]">
        <button
          onClick={onLogout}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#A0A0A0] hover:bg-white/[0.05] hover:text-white transition-all",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Çıkış Yap" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Çıkış Yap</span>}
        </button>
      </div>
    </div>
  );
}
