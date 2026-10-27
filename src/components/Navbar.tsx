import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Languages, 
  User, 
  SlidersHorizontal,
  ChevronDown,
  ShieldAlert,
  PlayCircle,
  HelpCircle
} from 'lucide-react';
import { DEMO_EXAMPLE_A, DEMO_EXAMPLE_B } from '../data/mockData';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    patient,
    isAiAvailable,
    isSpeaking,
    stopSpeaking,
    loadDemoExample,
    setActiveTab,
    startTour,
    t
  } = useApp();

  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Left side: Tagline & Fast Demo Switcher */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
          <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
          <span>{t('tagline')}</span>
        </div>

        {/* Demo Fast Trigger Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className="flex items-center gap-2 rounded-lg bg-teal-50 hover:bg-teal-100/80 dark:bg-teal-950/60 dark:hover:bg-teal-900/80 px-3 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-200 border border-teal-200/80 dark:border-teal-800 transition-all shadow-xs"
            title="Load instant demonstration test cases"
          >
            <PlayCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>{t('tryDemo')}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </button>

          {showDemoMenu && (
            <div 
              className="absolute left-0 mt-2 w-80 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10 z-50 border border-slate-200 dark:border-slate-700"
              onMouseLeave={() => setShowDemoMenu(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/60">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                  {language === 'hi' ? 'प्रतियोगिता लाइव टेस्ट केस' : 'Competition Live Test Cases'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'hi' ? 'एक क्लिक में लोड करें और परिणाम देखें' : 'Click to load and inspect real-time flow'}
                </p>
              </div>

              <button
                onClick={() => {
                  loadDemoExample('A', 'explain');
                  setShowDemoMenu(false);
                }}
                className="w-full text-left p-2.5 hover:bg-teal-50/70 dark:hover:bg-slate-700/60 rounded-lg transition-colors group mt-1"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300">
                    {language === 'hi' ? DEMO_EXAMPLE_A.titleHi : DEMO_EXAMPLE_A.titleEn}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    Clear
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  Metformin 500mg daily, water hydration, fasting test in 4 weeks.
                </p>
              </button>

              <button
                onClick={() => {
                  loadDemoExample('B', 'unclear');
                  setShowDemoMenu(false);
                }}
                className="w-full text-left p-2.5 hover:bg-amber-50/70 dark:hover:bg-slate-700/60 rounded-lg transition-colors group mt-1"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-300">
                    {language === 'hi' ? DEMO_EXAMPLE_B.titleHi : DEMO_EXAMPLE_B.titleEn}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                    Ambiguous
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  "White tablet twice until better, drops if fever" - flags missing info.
                </p>
              </button>

              <button
                onClick={() => {
                  setActiveTab('reports');
                  setShowDemoMenu(false);
                }}
                className="w-full text-left p-2.5 hover:bg-teal-50/70 dark:hover:bg-slate-700/60 rounded-lg transition-colors group mt-1"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300">
                    {language === 'hi' ? 'डेमो रिपोर्ट: ब्लड एवं मेटाबॉलिक पैनल' : 'Demo Report: Blood & Metabolic Panel'}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                    New Feature
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {language === 'hi' ? '12 टेस्ट, संदर्भ सीमा तुलना, धुंधले मान और डॉक्टर से प्रश्न।' : '12 investigations, range comparison, flagged smudged values & questions.'}
                </p>
              </button>
            </div>
          )}
        </div>

        {/* Quick Tour Button */}
        <button
          onClick={startTour}
          className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all shadow-2xs"
          title="Open interactive walkthrough tour"
        >
          <HelpCircle className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span className="hidden sm:inline">{language === 'hi' ? 'टूर (मार्गदर्शिका)' : 'App Tour'}</span>
        </button>
      </div>

      {/* Right side controls: Audio stop, Language, Font Size, Contrast, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Audio Stop Button (visible if speaking) */}
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="flex items-center gap-1.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 px-3 py-1 text-xs font-semibold animate-pulse border border-rose-300 dark:border-rose-800"
            title="Stop reading aloud"
          >
            <VolumeX className="h-3.5 w-3.5" />
            <span>{t('stopAudio')}</span>
          </button>
        )}

        {/* AI Engine Status badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <Sparkles className="h-3 w-3 text-teal-600 dark:text-teal-400" />
          <span>{isAiAvailable ? 'Gemini 3.8 Flash' : 'Demo Mode (Offline Safe)'}</span>
        </div>

        {/* Language Switcher (EN / हिन्दी) */}
        <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              language === 'en'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              language === 'hi'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            हिन्दी
          </button>
        </div>

        {/* Quick Accessibility Button (Font Size Toggles) */}
        <div className="hidden sm:flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700" title="Adjust text size for easy reading">
          <button
            onClick={() => setFontSize('normal')}
            className={`px-2 py-0.5 text-xs font-bold rounded ${
              fontSize === 'normal' ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-xs' : 'text-slate-500'
            }`}
          >
            A
          </button>
          <button
            onClick={() => setFontSize('large')}
            className={`px-2 py-0.5 text-sm font-bold rounded ${
              fontSize === 'large' ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-xs' : 'text-slate-500'
            }`}
          >
            A+
          </button>
          <button
            onClick={() => setFontSize('xlarge')}
            className={`px-2 py-0.5 text-base font-bold rounded ${
              fontSize === 'xlarge' ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-xs' : 'text-slate-500'
            }`}
          >
            A++
          </button>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
        </button>

        {/* Demo Patient Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-[11px] font-bold text-white">
              RK
            </div>
            <span className="hidden md:inline font-semibold">{patient.name}</span>
          </button>

          {showUserMenu && (
            <div 
              className="absolute right-0 mt-2 w-64 rounded-xl bg-white p-3 shadow-xl ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10 z-50 border border-slate-200 dark:border-slate-700"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-white font-bold text-sm">
                  RK
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{patient.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {patient.age} yrs • {patient.city} • Blood {patient.bloodGroup}
                  </p>
                </div>
              </div>
              <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <p><span className="font-semibold text-slate-700 dark:text-slate-300">Emergency:</span> {patient.emergencyContact}</p>
                <p><span className="font-semibold text-slate-700 dark:text-slate-300">Status:</span> Competition Demo Profile</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('accessibility');
                  setShowUserMenu(false);
                }}
                className="mt-3 w-full rounded-lg bg-teal-50 dark:bg-teal-950/60 py-1.5 text-center text-xs font-semibold text-teal-800 dark:text-teal-200 hover:bg-teal-100 transition-colors border border-teal-200 dark:border-teal-800"
              >
                {t('nav.accessibility')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
