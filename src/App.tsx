import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ExplainFeature } from './components/ExplainFeature';
import { UnclearDetectorFeature } from './components/UnclearDetectorFeature';
import { UnderstandingCheckFeature } from './components/UnderstandingCheckFeature';
import { MedicalDictionaryFeature } from './components/MedicalDictionaryFeature';
import { VisitSummaryFeature } from './components/VisitSummaryFeature';
import { AccessibilitySettings } from './components/AccessibilitySettings';
import { OnboardingTour } from './components/OnboardingTour';
import { MedicalReportReaderFeature } from './components/MedicalReportReaderFeature';
import { MedicineDatabaseFeature } from './components/MedicineDatabaseFeature';
import { Menu, HeartPulse, ShieldCheck, Phone } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, language } = useApp();
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  const renderActiveSection = () => {
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

      {/* Onboarding Tour Modal */}
      <OnboardingTour />
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
