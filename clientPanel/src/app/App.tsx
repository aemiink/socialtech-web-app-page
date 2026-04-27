import { useState } from 'react';
import { Sidebar } from './components/sidebar';
import { Topbar } from './components/topbar';
import { ClientActionCenter } from './components/client-action-center';
import { ServiceSelectionPage } from './pages/service-selection';
import { ReportsPage } from './pages/reports';
import { MeetingsPage } from './pages/meetings';
import { BillingPage } from './pages/billing';
import { SettingsPage } from './pages/settings';
import { GrowthHubDashboard } from './pages/services/growth-hub-dashboard';
import { SocialMediaDashboard } from './pages/services/social-media-dashboard';
import { MediaHubDashboard } from './pages/services/medya-hub-dashboard';
import { MetaAdsDashboard } from './pages/services/meta-ads-dashboard';
import { TikTokAdsDashboard } from './pages/services/tiktok-ads-dashboard';
import { GoogleAdsDashboard } from './pages/services/google-ads-dashboard';
import { AmazonAdsDashboard } from './pages/services/amazon-ads-dashboard';
import { WebAppDashboard } from './pages/services/web-app-dashboard';
import { SeoAuditDashboard } from './pages/services/seo-dashboard';
import { TechnicalSupportDashboard } from './pages/services/technical-support-dashboard';
import { MobileAppDashboard } from './pages/services/mobile-app-dashboard';
import { LandingPagesDashboard } from './pages/services/landing-pages-dashboard';
import { WebMobileDesignDashboard } from './pages/services/web-mobile-design-dashboard';
import { ServiceTabPage } from './pages/service-tab-page';

export default function App() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('overview');

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setCurrentPage('service-dashboard');
  };

  const handleBackToServices = () => {
    setSelectedService(null);
    setCurrentPage('overview');
  };

  const renderContent = () => {
    // Shared pages
    if (currentPage === 'reports') return <ReportsPage />;
    if (currentPage === 'meetings') return <MeetingsPage />;
    if (currentPage === 'billing') return <BillingPage />;
    if (currentPage === 'settings') return <SettingsPage />;

    if (currentPage === 'service-dashboard') {
      switch (selectedService) {
        case 'growth-hub':
          return <GrowthHubDashboard />;
        case 'social-media':
          return <SocialMediaDashboard />;
        case 'media-hub':
          return <MediaHubDashboard />;
        case 'meta-ads':
          return <MetaAdsDashboard />;
        case 'tiktok-ads':
          return <TikTokAdsDashboard />;
        case 'google-ads':
          return <GoogleAdsDashboard />;
        case 'amazon-ads':
          return <AmazonAdsDashboard />;
        case 'web-app':
          return <WebAppDashboard />;
        case 'mobile-app':
          return <MobileAppDashboard />;
        case 'landing-pages':
          return <LandingPagesDashboard />;
        case 'web-mobile-design':
          return <WebMobileDesignDashboard />;
        case 'technical-support':
          return <TechnicalSupportDashboard />;
        case 'seo-audit':
          return <SeoAuditDashboard />;
        default:
          return <GrowthHubDashboard />;
      }
    }

    return <ServiceTabPage serviceId={selectedService || 'growth-hub'} tabId={currentPage} />;
  };

  if (!selectedService) {
    return <ServiceSelectionPage onServiceSelect={handleServiceSelect} />;
  }

  return (
    <div className="size-full flex bg-[#131313]">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        selectedService={selectedService}
        onBackToServices={handleBackToServices}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar selectedService={selectedService} />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
        <ClientActionCenter />
      </div>
    </div>
  );
}
