import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  HeartPulse,
  FileText,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  ClipboardList,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  Volume2,
  Sparkles,
  Accessibility,
  Languages,
  Check
} from 'lucide-react';
import { DEMO_EXAMPLE_A, DEMO_EXAMPLE_B } from '../data/mockData';

export const OnboardingTour: React.FC = () => {
  const {
    showTour,
    closeTour,
    language,
    setLanguage,
    setActiveTab,
    loadDemoExample,
    speakText,
    t
  } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(0);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showTour) {
        closeTour();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTour, closeTour]);

  if (!showTour) return null;

  const isHindi = language === 'hi';

  const steps = [
    // Step 0: Welcome & Medical Disclaimer
    {
      id: 'welcome',
      icon: HeartPulse,
      iconColor: 'bg-teal-600 text-white',
      badge: isHindi ? 'स्वागत एवं सुरक्षा नीति' : 'Welcome & Safety Policy',
      badgeStyle: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
      title: isHindi ? 'MedClear AI में आपका स्वागत है' : 'Welcome to MedClear AI',
      subtitle: isHindi
        ? 'अपनी स्वास्थ्य देखभाल को समझें। सही निर्णय लें।'
        : 'Understand your healthcare. Make informed decisions.',
      content: (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {isHindi
              ? 'MedClear AI भारत के मरीजों और उनके परिवारों के लिए बनाया गया एक स्वास्थ्य संचार और शिक्षा सहायक है। यह कठिन मेडिकल पर्चों और डॉक्टर के निर्देशों को सरल, समझने योग्य भाषा में प्रस्तुत करता है।'
              : 'MedClear AI is a healthcare communication and education assistant designed for patients and caregivers across India. It breaks down complex medical jargon and prescriptions into plain, actionable language.'}
          </p>

          {/* Prominent Medical Safety Disclaimer Box */}
          <div className="rounded-xl border-2 border-teal-500/40 bg-teal-50/80 p-4 shadow-sm dark:border-teal-800 dark:bg-teal-950/40 space-y-2">
            <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" />
              <span>{isHindi ? 'महत्वपूर्ण चिकित्सीय अस्वीकरण (Medical Disclaimer)' : 'Important Medical Safety Disclaimer'}</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-teal-950 dark:text-teal-100 leading-relaxed">
              "{t('disclaimer')}"
            </p>
            <div className="pt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-teal-800 dark:text-teal-300 font-medium">
              <span>✕ Not a doctor</span>
              <span>✕ No medical diagnosis</span>
              <span>✕ No prescription generator</span>
              <span>✓ Confirms with pharmacists</span>
            </div>
          </div>
        </div>
      ),
    },

    // Step 1: Explain Simply (Primary Tool)
    {
      id: 'explain',
      icon: FileText,
      iconColor: 'bg-teal-600 text-white',
      badge: isHindi ? 'प्राथमिक टूल (Primary Feature)' : 'Primary Feature',
      badgeStyle: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      title: isHindi ? '1. निर्देश सरल करें (Explain Simply)' : '1. Explain Simply — Your Primary Tool',
      subtitle: isHindi
        ? 'कठिन पर्चों को 3 सरल मोड में अनुवादित करें'
        : 'Convert prescriptions into clear, plain language',
      content: (
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {isHindi
              ? 'यह MedClear AI का मुख्य उपकरण है। किसी भी डॉक्टर का पर्चा, दवा का पैकेट या अस्पताल के निर्देश यहाँ पेस्ट करें या बोलकर दर्ज करें।'
              : 'This is the centerpiece of MedClear AI. Paste any doctor notes, discharge summaries, or medicine directions (or use voice dictation) to receive a plain-language breakdown.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-teal-800 dark:text-teal-300 mb-1">
                {isHindi ? 'सरल भाषा मोड' : 'Simple Mode'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isHindi ? 'दैनिक बोलचाल में स्पष्ट व्याख्या और ऑडियो।' : 'Conversational 8th-grade language with audio reader.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-teal-800 dark:text-teal-300 mb-1">
                {isHindi ? 'चरण-दर-चरण' : 'Step-by-Step'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isHindi ? 'क्रमवार नियम और भोजन का समय।' : 'Numbered actionable steps with meal & timing rules.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-teal-800 dark:text-teal-300 mb-1">
                {isHindi ? 'डॉक्टर के लिए प्रश्न' : 'Doctor Questions'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isHindi ? 'अगली विजिट में पूछने के लिए तैयार सवाल।' : 'Targeted questions ready to ask your physician.'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 shadow-sm text-xs text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              {isHindi
                ? 'AI मूल अर्थ को सुरक्षित रखता है और कभी भी गायब खुराक या दवा का अनुमान नहीं लगाता।'
                : 'Guaranteed: AI preserves clinical facts and never invents missing dosages or medicines.'}
            </span>
          </div>
        </div>
      ),
    },

    // Step 2: Unclear Instruction Detector
    {
      id: 'unclear',
      icon: AlertTriangle,
      iconColor: 'bg-amber-500 text-white',
      badge: isHindi ? 'सुरक्षा एवं अस्पष्टता स्कैनर' : 'Safety Scanner',
      badgeStyle: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      title: isHindi ? '2. अस्पष्ट निर्देश डिटेक्टर (Unclear Detector)' : '2. Unclear Instruction Detector',
      subtitle: isHindi
        ? 'गायब खुराक, अस्पष्ट समय और भ्रामक निर्देशों की पहचान'
        : 'Detect missing details and dangerous ambiguities',
      content: (
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {isHindi
              ? 'कई मेडिकल पर्चों में अधूरी जानकारी होती है (जैसे केवल "सफ़ेद गोली लें" या "ठीक होने तक लें")। यह टूल मरीज की सुरक्षा सुनिश्चित करने के लिए ऐसी अस्पष्टताओं को तुरंत पहचानता है।'
              : 'Medical errors frequently occur when instructions omit critical details (like "white tablet twice until better" without a name or day count). The detector proactively audits text for safety gaps.'}
          </p>

          <div className="space-y-2 pt-1">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm text-xs text-slate-700 dark:text-slate-300 font-medium">
              <span className="text-amber-600 font-bold shrink-0">⚠ Missing Medication Names:</span>
              <span>Flags unidentified pills described only by color or appearance.</span>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm text-xs text-slate-700 dark:text-slate-300 font-medium">
              <span className="text-amber-600 font-bold shrink-0">⚠ Ambiguous Timing & Duration:</span>
              <span>Warns against vague timelines ("until better", "come back later") and missing meal instructions.</span>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm text-xs text-slate-700 dark:text-slate-300 font-medium">
              <span className="text-teal-600 font-bold shrink-0">✓ Pharmacist Checklist:</span>
              <span>Generates a printable, copyable checklist with exact questions to verify before taking medicine.</span>
            </div>
          </div>
        </div>
      ),
    },

    // Step 3: Understanding Check & Clinical Tools
    {
      id: 'tools',
      icon: HelpCircle,
      iconColor: 'bg-emerald-600 text-white',
      badge: isHindi ? 'समझ जांच एवं शब्दावली' : 'Comprehension & Tools',
      badgeStyle: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
      title: isHindi ? '3. समझ जांच, शब्दावली एवं परामर्श सारांश' : '3. Understanding Check & Clinical Tools',
      subtitle: isHindi
        ? 'प्रश्नोत्तरी, द्विभाषी डिक्शनरी, और प्रिंट करने योग्य सारांश'
        : 'MCQ comprehension checks, glossary & visit summaries',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <HelpCircle className="h-4 w-4 text-emerald-600" />
                <span>Understanding Check</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {isHindi
                  ? '3 सरल बहुविकल्पीय प्रश्न। शून्य शर्मिंदगी, केवल आपकी समझ सुनिश्चित करने के लिए।'
                  : '3 targeted MCQs generated strictly from instructions with friendly explanations and zero shaming.'}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <BookOpen className="h-4 w-4 text-teal-600" />
                <span>Medical Dictionary</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {isHindi
                  ? 'हाइपरटेंशन, डिहाइड्रेशन, इन्फेक्शन आदि के हिंदी-अंग्रेजी अर्थ और ऑडियो उच्चारण।'
                  : 'Searchable bilingual glossary of 20+ clinical terms with everyday examples and audio.'}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <ClipboardList className="h-4 w-4 text-teal-600" />
                <span>Visit Summary</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {isHindi
                  ? 'डॉक्टर के नोट्स का साफ सारांश, टेस्ट, फॉलो-अप तारीख और प्रिंट विकल्प।'
                  : 'Structured consultation takeaway capturing prescribed care, lab tests, and print layout.'}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Step 4: Ready to explore & Quick Demos
    {
      id: 'accessibility-demo',
      icon: Sparkles,
      iconColor: 'bg-teal-700 text-white',
      badge: isHindi ? 'सुलभता एवं डेमो' : 'Accessibility & Live Demo',
      badgeStyle: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      title: isHindi ? '4. सुलभता एवं त्वरित 1-क्लिक परीक्षण' : '4. Accessibility & 1-Click Competition Demos',
      subtitle: isHindi
        ? 'हिंदी/अंग्रेजी, बड़े अक्षर, ऑडियो रीडर, और लाइव टेस्ट'
        : 'Senior-friendly design and pre-configured test cases',
      content: (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {isHindi
              ? 'शीर्ष बार में भाषा (EN / हिन्दी), फॉन्ट आकार (A / A+ / A++), और डार्क/लाइट मोड किसी भी समय बदल सकते हैं। निर्णायकों (Judges) के परीक्षण हेतु दो उदाहरण तुरंत उपलब्ध हैं:'
              : 'Switch languages (EN / हिन्दी), scale font sizes (A / A+ / A++), and toggle high contrast anytime from the top bar. For instant demonstration, two pre-configured test cases are ready:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                loadDemoExample('A', 'explain');
                closeTour();
              }}
              className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 text-left transition-all shadow-sm group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Example A: Clear Prescription
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                  1-Click Load
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                Metformin 500mg daily, water hydration, fasting blood test in 4 weeks.
              </p>
            </button>

            <button
              onClick={() => {
                loadDemoExample('B', 'unclear');
                closeTour();
              }}
              className="p-3 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 text-left transition-all shadow-sm group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Example B: Ambiguous Text
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                  1-Click Load
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                "White tablet twice until better, drops if fever" — triggers caution & safety checklist.
              </p>
            </button>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      closeTour();
      setActiveTab('explain');
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-7 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        {/* Top Header: Badge, Step dots, Dismiss button */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${current.badgeStyle}`}>
                {current.badge}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {currentStep + 1} of {steps.length}
              </span>
            </div>

            {/* Language toggle inside tour & Dismiss Button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-bold">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-teal-700 text-white' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2 py-0.5 rounded ${language === 'hi' ? 'bg-teal-700 text-white' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  हिन्दी
                </button>
              </div>

              <button
                onClick={closeTour}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                aria-label="Dismiss tour"
                title="Dismiss tour"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Step Progress Line */}
          <div className="grid grid-cols-5 gap-1.5 mt-3">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx <= currentStep ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Step Title & Icon */}
          <div className="flex items-start gap-3 mt-4 mb-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-xs shrink-0 ${current.iconColor}`}>
              <StepIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 id="onboarding-title" className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {current.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {current.subtitle}
              </p>
            </div>
          </div>

          {/* Step Body Content */}
          <div className="py-2">
            {current.content}
          </div>
        </div>

        {/* Footer Actions: Skip, Back, Next */}
        <div className="flex items-center justify-between gap-3 pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={closeTour}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            {isHindi ? 'टूर छोड़ें (Skip)' : 'Skip Tour'}
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{isHindi ? 'पीछे' : 'Back'}</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 text-xs font-bold transition-all shadow-md shadow-teal-800/10 active:scale-95"
            >
              <span>{isLastStep ? (isHindi ? 'शुरू करें (Get Started)' : 'Get Started') : (isHindi ? 'आगे बढ़ें' : 'Next')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
