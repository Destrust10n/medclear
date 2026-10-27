import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  FileText,
  FileSpreadsheet,
  Pill,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  ClipboardList,
  Accessibility,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  setIsOpenMobile: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, setIsOpenMobile }) => {
  const { activeTab, setActiveTab, language, loadDemoExample, isAiAvailable, t } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      labelEn: 'Dashboard',
      labelHi: 'डैशबोर्ड',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'explain',
      labelEn: 'Explain Instructions',
      labelHi: 'निर्देश सरल करें',
      icon: FileText,
      badge: 'Core'
    },
    {
      id: 'reports',
      labelEn: 'Report Reader',
      labelHi: 'रिपोर्ट रीडर',
      icon: FileSpreadsheet,
      badge: 'New'
    },
    {
      id: 'medicines',
      labelEn: 'Medicine Database',
      labelHi: 'दवा ज्ञान डेटाबेस',
      icon: Pill,
      badge: 'CDSCO'
    },
    {
      id: 'unclear',
      labelEn: 'Unclear Detector',
      labelHi: 'अस्पष्टता पहचानें',
      icon: AlertTriangle,
      badge: 'Safety'
    },
    {
      id: 'quiz',
      labelEn: 'Understanding Check',
      labelHi: 'समझ जांचें (MCQ)',
      icon: HelpCircle,
      badge: 'Interactive'
    },
    {
      id: 'dictionary',
      labelEn: 'Medical Dictionary',
      labelHi: 'चिकित्सा शब्दावली',
      icon: BookOpen,
      badge: 'Bilingual'
    },
    {
      id: 'visit',
      labelEn: 'Visit Summary',
      labelHi: 'परामर्श सारांश',
      icon: ClipboardList,
      badge: null
    },
    {
      id: 'accessibility',
      labelEn: 'Accessibility Settings',
      labelHi: 'सुलभता सेटिंग्स',
      icon: Accessibility,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo Branding */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-md shadow-teal-700/20">
              <HeartPulse className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  MedClear<span className="text-teal-600 dark:text-teal-400">AI</span>
                </span>
                <span className="rounded-md bg-teal-100 dark:bg-teal-950 px-1.5 py-0.5 text-[10px] font-bold text-teal-800 dark:text-teal-300">
                  India
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {language === 'hi' ? 'स्वास्थ्य संचार सहायक' : 'Healthcare Clarity Assistant'}
              </p>
            </div>
          </div>

          {/* Demo Mode Quick Launcher Card */}
          <div className="p-4 mx-3 my-3 rounded-xl bg-gradient-to-br from-teal-50/90 to-emerald-50/70 dark:from-slate-800/90 dark:to-teal-950/40 border border-teal-200/70 dark:border-teal-800/60 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 dark:text-teal-200">
                <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>{language === 'hi' ? 'प्रतियोगिता त्वरित परीक्षण' : 'Competition Quick Demo'}</span>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-2.5 leading-relaxed">
              {language === 'hi' 
                ? 'निर्णायकों (Judges) के लिए एक-क्लिक में उदाहरण लोड करें:' 
                : '1-click load pre-configured test cases for judges:'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  loadDemoExample('A', 'explain');
                  setIsOpenMobile(false);
                }}
                className="flex items-center justify-center gap-1 rounded-lg bg-white dark:bg-slate-700/80 px-2 py-1.5 text-[11px] font-bold text-teal-800 dark:text-teal-200 border border-teal-200/80 dark:border-teal-700 shadow-2xs hover:bg-teal-50 transition-colors"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                <span>Example A</span>
              </button>
              <button
                onClick={() => {
                  loadDemoExample('B', 'unclear');
                  setIsOpenMobile(false);
                }}
                className="flex items-center justify-center gap-1 rounded-lg bg-white dark:bg-slate-700/80 px-2 py-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-200 border border-amber-200/80 dark:border-amber-700 shadow-2xs hover:bg-amber-50 transition-colors"
              >
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                <span>Example B</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const label = language === 'hi' ? item.labelHi : item.labelEn;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpenMobile(false);
                  }}
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-sm shadow-teal-900/10 dark:bg-teal-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-teal-600 dark:text-slate-400 dark:group-hover:text-teal-400'
                      }`}
                    />
                    <span>{label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Medical Safety & Compliance Footer */}
          <div className="p-4 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5 text-slate-800 dark:text-slate-200 text-xs font-bold">
              <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{language === 'hi' ? 'चिकित्सीय सुरक्षा नियम' : 'Medical Safety Policy'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {language === 'hi'
                ? 'यह सहायक निदान या नुस्खे नहीं बनाता। अनिश्चितता होने पर डॉक्टर से सलाह लें।'
                : 'Educational communication tool only. Not a diagnostic tool or prescription generator.'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
