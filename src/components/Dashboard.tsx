import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  FileSpreadsheet,
  Pill,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  ClipboardList,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  HeartPulse,
  Info,
  Clock,
  ExternalLink,
  History,
  Trash2
} from 'lucide-react';
import { DEMO_EXAMPLE_A, DEMO_EXAMPLE_B } from '../data/mockData';

export const Dashboard: React.FC = () => {
  const { language, setActiveTab, loadDemoExample, speakText, startTour, history, setCurrentText, clearHistory, t } = useApp();

  const isHindi = language === 'hi';

  const welcomeSpokenText = isHindi
    ? "मेडक्लियर एआई में आपका स्वागत है। अपनी स्वास्थ्य देखभाल को समझें और सही निर्णय लें। यह सहायक चिकित्सा निर्देशों को सरल भाषा में समझाने में मदद करता है।"
    : "Welcome to MedClear AI. Understand your healthcare. Make informed decisions. We help you simplify medical instructions and identify unclear details.";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-950 p-6 sm:p-8 text-white shadow-lg shadow-teal-950/10">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-800/80 px-3 py-1 text-xs font-semibold text-teal-200 border border-teal-700/60 backdrop-blur-xs">
            <HeartPulse className="h-3.5 w-3.5 text-emerald-400" />
            <span>{isHindi ? 'भारत के लिए विशेष स्वास्थ्य संचार सहायक' : 'Healthcare Clarity & Communication for India'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {isHindi ? 'अपनी स्वास्थ्य देखभाल को समझें।' : 'Understand your healthcare.'} <br />
            <span className="text-teal-300 font-bold">
              {isHindi ? 'सटीक और सुरक्षित निर्णय लें।' : 'Make informed decisions.'}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed font-normal max-w-2xl">
            {isHindi
              ? 'अस्पताल के पर्चों और डॉक्टर के निर्देशों की कठिन शब्दावली या भाषा बाधा को आसान हिंदी और अंग्रेजी में बदलें। अज्ञात दवाओं और अस्पष्ट समय की पहचान करें।'
              : 'Medical terminology and language barriers should never stand between a patient and safe recovery. MedClear AI transforms complex prescriptions into plain language and highlights ambiguities.'}
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('explain')}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-xs sm:text-sm font-bold text-teal-950 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <span>{isHindi ? 'निर्देश सरल करें' : 'Explain Instructions'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={startTour}
              className="flex items-center gap-2 rounded-xl bg-teal-800/80 hover:bg-teal-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white border border-teal-600/70 transition-colors shadow-xs active:scale-95"
            >
              <Sparkles className="h-4 w-4 text-teal-300" />
              <span>{isHindi ? 'मार्गदर्शिका टूर देखें' : 'Start App Tour'}</span>
            </button>

            <button
              onClick={() => speakText(welcomeSpokenText)}
              className="flex items-center gap-2 rounded-xl bg-teal-900/60 hover:bg-teal-800/70 px-4 py-2.5 text-xs sm:text-sm font-semibold text-teal-200 border border-teal-700/60 transition-colors"
              title="Listen to overview"
            >
              <Volume2 className="h-4 w-4 text-emerald-300" />
              <span>{t('listenBtn')}</span>
            </button>
          </div>
        </div>

        {/* Decorative graphic background */}
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-12 top-6 hidden xl:block opacity-15 text-white pointer-events-none">
          <HeartPulse className="h-56 w-56" />
        </div>
      </div>

      {/* Prominent Live Demonstration Banner for Competition Judges */}
      <div className="rounded-2xl border-2 border-teal-500/30 bg-white p-5 shadow-sm dark:border-teal-500/20 dark:bg-slate-800/90">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isHindi ? 'प्रतियोगिता त्वरित लाइव प्रदर्शन (5-मिनट डेमो)' : 'Live Student Innovation Demo Flow (5-Minute Tour)'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isHindi
                ? 'निर्णायकों के लिए परीक्षण प्रवाह: इनपुट → सरल व्याख्या → अनिश्चितता पहचान → समझ जांच'
                : 'Guided test flow for judges: Input → Simple Explanation → Uncertainty Check → Understanding Questions'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isHindi ? 'त्वरित लोड करें:' : 'Quick Load:'}
            </span>
            <button
              onClick={() => loadDemoExample('A', 'explain')}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Example A (Clear)</span>
            </button>
            <button
              onClick={() => loadDemoExample('B', 'unclear')}
              className="flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 transition-colors shadow-2xs"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>Example B (Ambiguous)</span>
            </button>
          </div>
        </div>

        {/* 4-Step Visual Journey */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 font-bold text-xs shrink-0">
              1
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isHindi ? '1. पर्चा दर्ज करें' : '1. Paste Instructions'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isHindi ? 'अंग्रेजी या हिंदी टेक्स्ट, अथवा वॉयस डिक्टेशन।' : 'English/Hindi text or voice dictation.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 font-bold text-xs shrink-0">
              2
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isHindi ? '2. सरल भाषा में समझें' : '2. Explain Simply'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isHindi ? 'कठिन शब्दों का अर्थ, महत्वपूर्ण नियम, ऑडियो।' : 'Medical terms, clear dosage rules, audio.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-bold text-xs shrink-0">
              3
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isHindi ? '3. अस्पष्टता डिटेक्टर' : '3. Detect Ambiguities'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isHindi ? 'लापता खुराक, अस्पष्ट समय और खतरे की जांच।' : 'Flags missing doses, vague timelines.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 font-bold text-xs shrink-0">
              4
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isHindi ? '4. समझ जांचें (MCQ)' : '4. Check Understanding'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isHindi ? '3 सरल प्रश्न, तत्काल फीडबैक, शून्य शर्मिंदगी।' : '3 simple MCQs with friendly explanations.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Explanations (Previous 5 Items from Local Storage) */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-teal-500/30 bg-white p-5 shadow-sm dark:border-teal-500/20 dark:bg-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {isHindi ? `हाल के स्पष्टीकरण (${history.length}/5 सुरक्षित)` : `Recent Explanations (${history.length}/5 Saved in Session)`}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('explain')}
                className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline"
              >
                {isHindi ? 'सभी देखें' : 'View in Explain Tab'}
              </button>
              <button
                onClick={clearHistory}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                {isHindi ? 'साफ करें' : 'Clear'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {history.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  setCurrentText(item.fullText);
                  setActiveTab('explain');
                }}
                className="group cursor-pointer p-3 rounded-xl bg-slate-50 hover:bg-teal-50/50 dark:bg-slate-900/60 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700 hover:border-teal-400 transition-all space-y-1.5 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{item.timestamp}</span>
                  </span>
                  <span className="font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase">
                    {item.mode}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                  "{item.sourceSnippet}"
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                  {item.result.simpleExplanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Explain Instructions */}
        <div 
          onClick={() => setActiveTab('explain')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-teal-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-800 flex flex-col justify-between"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 group-hover:bg-teal-600 group-hover:text-white transition-colors mb-4">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {isHindi ? 'निर्देश सरल भाषा में समझें' : 'Explain Instructions'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {isHindi
                ? 'पर्चे का टेक्स्ट पेस्ट करें और 3 मोड (साधारण, चरण-दर-चरण, या संक्षिप्त सारांश) में समझें। साथ ही डॉक्टर से पूछने योग्य प्रश्न प्राप्त करें।'
                : 'Convert complex doctor prescriptions into simple English or Hindi. View important steps, medical terms explained, and questions for your doctor.'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
            <span>{isHindi ? 'अभी शुरू करें' : 'Start Explaining'}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card: Medical Report Reader (New Feature) */}
        <div 
          onClick={() => setActiveTab('reports')}
          className="group cursor-pointer rounded-2xl border border-teal-500/40 bg-gradient-to-br from-white via-white to-teal-50/30 p-5 shadow-sm hover:border-teal-500 hover:shadow-md transition-all dark:border-teal-800/80 dark:bg-slate-800 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-teal-100 dark:bg-teal-950 px-2 py-0.5 text-[10px] font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                New
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {isHindi ? 'मेडिकल रिपोर्ट रीडर (लैब टेस्ट)' : 'Medical Report Reader'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {isHindi
                ? 'लैब रिपोर्ट (जैसे CBC, ब्लड शुगर, लिपिड प्रोफाइल) अपलोड या पेस्ट करें। संदर्भ सीमाओं से तुलना करें, गायब इकाइयां पहचानें और डॉक्टर से पूछने के प्रश्न प्राप्त करें।'
                : 'Upload or paste diagnostic lab reports. Extracts test values, checks against reference ranges, clarifies medical terms, and flags unreadable values.'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
            <span>{isHindi ? 'रिपोर्ट पढ़ें एवं समझें' : 'Read & Analyze Report'}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card: Medicine Knowledge Database (India - CDSCO/NLEM) */}
        <div 
          onClick={() => setActiveTab('medicines')}
          className="group cursor-pointer rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-white via-white to-emerald-50/30 p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all dark:border-emerald-800/80 dark:bg-slate-800 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Pill className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                CDSCO Verified
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {isHindi ? 'भारत औषधि ज्ञान डेटाबेस' : 'Medicine Knowledge Database'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {isHindi
                ? 'CDSCO और NLEM 2022 से सत्यापित भारतीय दवाएं, ब्रांड नाम (Dolo, Glycomet, Augmentin), मानक क्षमताएं, दुष्प्रभाव, चेतावनियां और पबकेम रसायन संरचना।'
                : 'Search verified Indian essential medicines with official CDSCO/NLEM regulatory provenance, standard strengths, black-box warnings, and PubChem 2D structures.'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
            <span>{isHindi ? 'दवाएं खोजें' : 'Search Medicine Database'}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Unclear Detector */}
        <div 
          onClick={() => setActiveTab('unclear')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-amber-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-800 flex flex-col justify-between"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 group-hover:bg-amber-600 group-hover:text-white transition-colors mb-4">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {isHindi ? 'अस्पष्ट निर्देश डिटेक्टर' : 'Unclear Instruction Detector'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {isHindi
                ? 'लापता दवा के नाम, अस्पष्ट समय (जैसे भोजन से पहले या बाद), और अधूरी जानकारियों की पहचान करें जो मरीज की सुरक्षा के लिए जरूरी हैं।'
                : 'Scans for missing medicine names, vague durations ("until better"), missing meal timings, and incomplete follow-up instructions.'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
            <span>{isHindi ? 'अस्पष्टताएं जांचें' : 'Check Ambiguities'}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Understanding Check */}
        <div 
          onClick={() => setActiveTab('quiz')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-800 flex flex-col justify-between"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors mb-4">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {isHindi ? 'मरीज समझ जांच (प्रश्नोत्तरी)' : 'Understanding Check'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {isHindi
                ? 'दिए गए निर्देशों पर आधारित 3 सरल बहुविकल्पीय प्रश्न। यह सुनिश्चित करता है कि मरीज ने खुराक और समय सही से समझा है।'
                : 'Generates 3 friendly multiple-choice questions strictly from the given instructions. Immediate feedback with zero shaming.'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
            <span>{isHindi ? 'प्रश्नोत्तरी शुरू करें' : 'Take Quiz'}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Medical Dictionary */}
        <div 
          onClick={() => setActiveTab('dictionary')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-teal-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-800 flex flex-col justify-between"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 group-hover:bg-teal-600 group-hover:text-white transition-colors mb-4">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {isHindi ? 'द्विभाषी चिकित्सा शब्दावली' : 'Medical Dictionary'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {isHindi
                ? 'हाइपरटेंशन, डिहाइड्रेशन, इन्फेक्शन, खुराक जैसे शब्दों के सरल हिंदी और अंग्रेजी अर्थ और वास्तविक शैक्षिक उदाहरण खोजें।'
                : 'Searchable glossary of clinical terms like Hypertension, Inflammation, Contraindication, and Fasting Sugar with audio pronunciations.'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
            <span>{isHindi ? 'शब्दावली देखें' : 'Explore Glossary'}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 5: Visit Summary */}
        <div 
          onClick={() => setActiveTab('visit')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-teal-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-800 flex flex-col justify-between"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 group-hover:bg-teal-600 group-hover:text-white transition-colors mb-4">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {isHindi ? 'डॉक्टर परामर्श सारांश' : 'Visit Summary'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {isHindi
                ? 'डॉक्टर के नोट्स का संरचित सारांश तैयार करें: मुख्य बिंदु, उल्लेखित टेस्ट, फॉलो-अप तारीख और प्रिंट करने योग्य लेआउट।'
                : 'Summarize clinical consultation notes, prescribed steps, ordered lab tests, and print-ready patient takeaways.'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
            <span>{isHindi ? 'सारांश बनाएं' : 'Create Summary'}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 6: Accessibility Settings */}
        <div 
          onClick={() => setActiveTab('accessibility')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-teal-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-800 flex flex-col justify-between"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 group-hover:bg-teal-600 group-hover:text-white transition-colors mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {isHindi ? 'सुलभता एवं ऑडियो सेटिंग्स' : 'Accessibility & Voice'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {isHindi
                ? 'बड़ा फॉन्ट आकार, हाई-कॉन्ट्रास्ट विज़ुअल्स, टेक्स्ट-टू-स्पीच गति समायोजन, और आवाज से लिखने की सुविधा।'
                : 'Adjust font scaling (Normal, Large, Extra Large), high-contrast mode, speech reader speed, and voice dictation.'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
            <span>{isHindi ? 'सेटिंग्स प्रबंधित करें' : 'Manage Settings'}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Mandatory Medical Safety Disclaimer */}
      <div className="rounded-2xl border border-teal-200 bg-teal-50/80 p-5 shadow-sm dark:border-teal-900/60 dark:bg-teal-950/30">
        <div className="flex items-start gap-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shrink-0 mt-0.5">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200">
              {isHindi ? 'महत्वपूर्ण चिकित्सीय अस्वीकरण (Medical Disclaimer)' : 'Important Healthcare Disclaimer'}
            </h4>
            <p className="text-xs leading-relaxed text-teal-950/80 dark:text-teal-200/90 font-medium">
              "{t('disclaimer')}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
