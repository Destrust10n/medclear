import React, { useState, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Menu, HeartPulse, ShieldCheck, Phone, Loader2 } from 'lucide-react';

// Code-split feature views to keep initial bundle tiny and fast to deploy
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const ExplainFeature = lazy(() => import('./components/ExplainFeature').then(m => ({ default: m.ExplainFeature })));
const MedicalReportReaderFeature = lazy(() => import('./components/MedicalReportReaderFeature').then(m => ({ default: m.MedicalReportReaderFeature })));
const MedicineDatabaseFeature = lazy(() => import('./components/MedicineDatabaseFeature').then(m => ({ default: m.MedicineDatabaseFeature })));
const UnclearDetectorFeature = lazy(() => import('./components/UnclearDetectorFeature').then(m => ({ default: m.UnclearDetectorFeature })));
const UnderstandingCheckFeature = lazy(() => import('./components/UnderstandingCheckFeature').then(m => ({ default: m.UnderstandingCheckFeature })));
const MedicalDictionaryFeature = lazy(() => import('./components/MedicalDictionaryFeature').then(m => ({ default: m.MedicalDictionaryFeature })));
const VisitSummaryFeature = lazy(() => import('./components/VisitSummaryFeature').then(m => ({ default: m.VisitSummaryFeature })));
const AccessibilitySettings = lazy(() => import('./components/AccessibilitySettings').then(m => ({ default: m.AccessibilitySettings })));
const OnboardingTour = lazy(() => import('./components/OnboardingTour').then(m => ({ default: m.OnboardingTour })));

const FeatureLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[350px] p-8 text-slate-500 dark:text-slate-400">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 mb-3 animate-pulse shadow-sm">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
    <p className="text-sm font-medium">Loading MedClear AI module...</p>
    <p className="text-xs text-slate-400 mt-1">Optimized on-demand module</p>
  </div>
);

const AppContent: React.FC = () => {
  const { activeTab, language } = useApp();
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  const renderActiveSection = () => {
    return (
      <Suspense fallback={<FeatureLoadingFallback />}>
        {(() => {
          switch (activeTab) {
            case 'dashboard':
              return <Dashboard />;
            case 'explain':
              return <ExplainFeature />;
            case 'reports':
              return <MedicalReportReaderFeature />;
            case 'medicines':
              return <MedicineDatabaseFeature />;
            case 'unclear':
              return <UnclearDetectorFeature />;
            case 'quiz':
              return <UnderstandingCheckFeature />;
            case 'dictionary':
              return <MedicalDictionaryFeature />;
            case 'visit':
              return <VisitSummaryFeature />;
            case 'accessibility':
              return <AccessibilitySettings />;
            default:
              return <Dashboard />;
          }
        })()}
      </Suspense>
    );
  };

  const isHindi = language === 'hi';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Mobile Top App Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpenMobile(true)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
              <HeartPulse className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
              MedClear<span className="text-teal-600 dark:text-teal-400">AI</span>
            </span>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
          India Edition
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpenMobile={isOpenMobile} setIsOpenMobile={setIsOpenMobile} />

        {/* Central Workspace */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Top Desktop/Tablet Navbar */}
          <Navbar />

          {/* Active Workspace View */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {renderActiveSection()}
          </main>

          {/* Footer with Medical Safety & Helpline */}
          <footer className="no-print border-t border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/80 px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                <span>
                  {isHindi
                    ? 'MedClear AI: केवल स्वास्थ्य संचार एवं शिक्षा सहायक।'
                    : 'MedClear AI: Healthcare Communication & Education Assistant.'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <Phone className="h-3 w-3 text-emerald-600" />
                  <span>National Health Helpline: 1800-180-1104</span>
                </span>
                <span>•</span>
                <span>Emergency: 112 / 108</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Onboarding Tour Modal (deferred) */}
      <Suspense fallback={null}>
        <OnboardingTour />
      </Suspense>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
