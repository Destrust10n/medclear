import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UnclearDetectorResult } from '../types';
import {
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Info,
  ArrowRight,
  FileQuestion,
  ExternalLink,
  PhoneCall
} from 'lucide-react';
import { DEMO_EXAMPLE_A, DEMO_EXAMPLE_B } from '../data/mockData';

export const UnclearDetectorFeature: React.FC = () => {
  const {
    language,
    currentText,
    setCurrentText,
    loadDemoExample,
    setActiveTab,
    t
  } = useApp();

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<UnclearDetectorResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-run if current text is present
  useEffect(() => {
    if (currentText && !result && !loading) {
      handleDetect();
    }
  }, []);

  const handleDetect = async () => {
    if (!currentText.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/detect-unclear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentText,
          language
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setResult(json.data);
      } else {
        throw new Error(json.error || 'Failed to detect unclear instructions');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error running detector');
    } finally {
      setLoading(false);
    }
  };

  const isHindi = language === 'hi';

  const handleCopyChecklist = () => {
    if (!result) return;
    const items = result.issues.map(
      (iss, i) => `${i + 1}. [${iss.type}] Source: "${iss.sourceText}" -> Question to ask: ${iss.recommendedNextStep}`
    ).join('\n\n');
    const fullText = `MedClear AI - Clarification Checklist for Doctor/Chemist:\n\n${items}\n\nQuestions:\n${result.questionsToClarify.join('\n')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {isHindi ? 'अस्पष्ट निर्देश एवं अनिश्चितता डिटेक्टर' : 'Unclear Instruction Detector'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isHindi
              ? 'गायब जानकारी, अस्पष्ट दवा के नाम, अनिश्चित समय, और परस्पर विरोधी बातों की पहचान करें।'
              : 'Detect missing information, vague timing, unnamed medications, and items needing doctor confirmation.'}
          </p>
        </div>

        {/* Quick Demo Pre-loaders */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadDemoExample('B', 'unclear');
              setTimeout(() => handleDetect(), 50);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 transition-colors shadow-2xs"
          >
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            <span>Load Ambiguous Demo (Example B)</span>
          </button>
        </div>
      </div>

      {/* Mandatory Safety Notice */}
      <div className="rounded-xl border border-amber-300/80 bg-amber-50/70 p-4 text-xs shadow-sm dark:border-amber-900/60 dark:bg-amber-950/30">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-amber-900 dark:text-amber-200 font-medium">
            {isHindi
              ? 'महत्वपूर्ण नियम: यह टूल संभावित अस्पष्टताओं को उजागर करता है। यह पर्चे के चिकित्सकीय रूप से सही होने की पुष्टि नहीं कर सकता और न ही खुराक में बदलाव का सुझाव देता है। हमेशा फार्मासिस्ट या डॉक्टर से पुष्टि करें।'
              : 'Medical Safety Notice: This tool highlights potential ambiguities and missing details. It cannot verify whether a prescription is medically appropriate or complete. Never guess dosages or stop prescribed treatments without doctor consultation.'}
          </p>
        </div>
      </div>

      {/* Input box */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          {isHindi ? 'विश्लेषण हेतु निर्देश (Text to Scan)' : 'Instructions to Scan for Ambiguity'}
        </label>
        <textarea
          rows={3}
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          placeholder={
            isHindi
              ? 'यहाँ निर्देश पेस्ट करें (उदा: "सफ़ेद गोली दिन में दो बार लें...")'
              : 'Enter instructions to scan (e.g., "Take the white tablet twice until better. Drops if fever...")'
          }
          className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 leading-relaxed font-sans"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <button
            onClick={handleDetect}
            disabled={loading || !currentText.trim()}
            className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-amber-600/10 transition-all active:scale-95"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{isHindi ? 'अस्पष्टताएं जांची जा रही हैं...' : 'Scanning for Ambiguities...'}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                <span>{t('detectBtn')}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{isHindi ? 'जांच श्रेणियां:' : 'Scan Categories:'}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Missing Name • Vague Timing • Unclear Dose • Missing Follow-up
            </span>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Overall Safety Assessment Card */}
          <div
            className={`rounded-2xl border-2 p-5 shadow-sm ${
              result.hasIssues
                ? 'border-amber-400 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/30'
                : 'border-emerald-400 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shrink-0 ${
                    result.hasIssues ? 'bg-amber-600' : 'bg-emerald-600'
                  }`}
                >
                  {result.hasIssues ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {result.overallSafetyAssessment}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {result.issues.length} {isHindi ? 'पहलू पहचाने गए' : 'potential points of confusion identified'}
                  </p>
                </div>
              </div>

              {result.hasIssues && (
                <button
                  onClick={handleCopyChecklist}
                  className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors shrink-0"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                  <span>{copied ? 'Checklist Copied!' : 'Copy Clarification Checklist'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Individual Issues List */}
          {result.issues && result.issues.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {isHindi ? 'पहचानी गई अस्पष्टताएं (Issues Requiring Confirmation)' : 'Detected Ambiguities & Required Next Steps'}
              </h4>

              {result.issues.map((issue, idx) => (
                <div
                  key={issue.id || idx}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800 space-y-3"
                >
                  {/* Top Bar: Issue Type, Severity, Needs Confirmation badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {idx + 1}. {issue.type}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          issue.severity === 'high'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {issue.severity} priority
                      </span>
                    </div>

                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                      Needs Confirmation
                    </span>
                  </div>

                  {/* Quoted Source Text */}
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3 border-l-4 border-amber-500 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {isHindi ? 'पर्चे में लिखा मूल वाक्य:' : 'Source Text in Instruction:'}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 italic">
                      "{issue.sourceText}"
                    </p>
                  </div>

                  {/* Why clarification is needed */}
                  <div className="text-xs sm:text-sm space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {isHindi ? 'स्पष्टीकरण क्यों जरूरी है:' : 'Why Clarification Is Needed:'}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {issue.whyClarificationNeeded}
                    </p>
                  </div>

                  {/* Recommended Next Step */}
                  <div className="rounded-xl bg-teal-50/70 dark:bg-teal-950/30 p-3 border border-teal-200/70 dark:border-teal-800/60 flex items-start gap-2.5 shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-teal-900 dark:text-teal-200">
                        {isHindi ? 'अनुशंसित अगला कदम:' : 'Recommended Action:'}{' '}
                      </span>
                      <span className="text-teal-950 dark:text-teal-300 font-medium">
                        {issue.recommendedNextStep}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Questions to ask doctor */}
          {result.questionsToClarify && result.questionsToClarify.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-bold text-sm">
                <HelpCircle className="h-4 w-4 text-teal-600" />
                <span>{isHindi ? 'डॉक्टर या फार्मासिस्ट से पूछने के लिए प्रश्न' : 'Questions to Ask Your Doctor or Pharmacist'}</span>
              </div>
              <ul className="space-y-2">
                {result.questionsToClarify.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <span className="text-teal-600 font-bold shrink-0">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action bar to continue journey */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 text-white shadow-sm">
            <p className="text-xs font-semibold">
              {isHindi ? 'निर्देश स्पष्ट हो गए? अब अपनी समझ की जांच करें।' : 'Ready to verify what you learned? Test your comprehension.'}
            </p>
            <button
              onClick={() => setActiveTab('quiz')}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-1.5 text-xs transition-colors shrink-0"
            >
              <span>{isHindi ? 'समझ जांच शुरू करें' : 'Start Understanding Check'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
