import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ExplainMode, ExplanationResult } from '../types';
import {
  FileText,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Mic,
  MicOff,
  ArrowRight,
  ShieldAlert,
  Info,
  ListOrdered,
  FileCheck,
  CheckCircle2,
  History,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DEMO_EXAMPLE_A, DEMO_EXAMPLE_B } from '../data/mockData';
import { ExplanationHistoryItem } from '../types';

export const ExplainFeature: React.FC = () => {
  const {
    language,
    currentText,
    setCurrentText,
    loadDemoExample,
    speakText,
    isSpeaking,
    stopSpeaking,
    setActiveTab,
    isAiAvailable,
    history,
    saveExplanationToHistory,
    clearHistory,
    deleteHistoryItem,
    t
  } = useApp();

  const [mode, setMode] = useState<ExplainMode>('simple');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Auto-explain on mount if currentText exists and no result yet
  useEffect(() => {
    if (currentText && !result && !loading) {
      handleExplain();
    }
  }, []);

  const handleExplain = async () => {
    if (!currentText.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    stopSpeaking();

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentText,
          language,
          mode
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setResult(json.data);
        saveExplanationToHistory(currentText, mode, language, json.data);
      } else {
        throw new Error(json.error || 'Failed to explain instructions');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with AI engine. Loading safety fallback...');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreFromHistory = (item: ExplanationHistoryItem) => {
    setCurrentText(item.fullText);
    setMode(item.mode);
    setResult(item.result);
    stopSpeaking();
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `MedClear AI - Medical Explanation:\n${result.simpleExplanation}\n\nImportant Instructions:\n${result.importantInstructions.join('\n')}\n\nQuestions for Doctor:\n${result.questionsForDoctor.join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Browser speech recognition (Speech-to-Text)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg(isHindi ? 'इस ब्राउज़र में स्पीच रिकग्निशन उपलब्ध नहीं है। कृपया लिखकर निर्देश दर्ज करें।' : 'Speech recognition is not supported in this browser. Please type your instructions.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        if (spoken) {
          setCurrentText(currentText ? `${currentText} ${spoken}` : spoken);
        }
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  const isHindi = language === 'hi';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Feature Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
              <FileText className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {isHindi ? 'निर्देश सरल भाषा में समझें' : 'Explain Instructions Simply'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isHindi
              ? 'डॉक्टर द्वारा दिए गए निर्देश या पर्चा दर्ज करें। यह टूल कठिन मेडिकल शब्दों को सामान्य बोलचाल में बदलता है।'
              : 'Paste your prescription or doctor notes to translate medical jargon into plain, actionable language.'}
          </p>
        </div>

        {/* Quick Demo Pre-loaders */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadDemoExample('A', 'explain');
              setTimeout(() => handleExplain(), 50);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>Load Clear Demo</span>
          </button>
          <button
            onClick={() => {
              loadDemoExample('B', 'explain');
              setTimeout(() => handleExplain(), 50);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 transition-colors"
          >
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            <span>Load Ambiguous Demo</span>
          </button>

          {/* History Toggle Button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
              showHistory
                ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title="View previous 5 medical instruction explanations"
          >
            <History className={`h-3.5 w-3.5 ${showHistory ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
            <span>{isHindi ? `इतिहास (${history.length}/5)` : `History (${history.length}/5)`}</span>
            {showHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5 opacity-70" />}
          </button>
        </div>
      </div>

      {/* History Panel (Local Storage previous 5 explanations) */}
      {showHistory && (
        <div className="rounded-2xl border-2 border-teal-500/30 bg-white p-5 shadow-sm dark:border-teal-500/20 dark:bg-slate-800/95 space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'पिछले 5 चिकित्सा निर्देश स्पष्टीकरण (स्थानीय इतिहास)' : 'Recent Explanation History (Previous 5 Items)'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isHindi
                    ? 'ब्राउज़र के लोकल स्टोरेज में सुरक्षित रखा गया सत्र इतिहास। किसी भी आइटम पर क्लिक करके उसे पुनः देखें।'
                    : 'Saved securely in your browser session storage. Click any item to instantly restore its explanation.'}
                </p>
              </div>
            </div>

            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5 py-1 rounded-lg transition-colors border border-rose-200 dark:border-rose-900/60"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isHindi ? 'इतिहास साफ करें' : 'Clear History'}</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400 space-y-2">
              <Clock className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-semibold">
                {isHindi ? 'अभी कोई पिछला इतिहास नहीं है।' : 'No saved explanations yet in this session.'}
              </p>
              <p className="text-[11px]">
                {isHindi
                  ? 'जब आप किसी निर्देश का विश्लेषण करेंगे, तो वह यहाँ सुरक्षित रूप से दिखाई देगा (अधिकतम 5)।'
                  : 'Whenever you explain instructions, your latest 5 explanations are preserved here for quick reference.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.map((item, index) => {
                const isActive = currentText === item.fullText;
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all shadow-sm ${
                      isActive
                        ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/30 dark:border-teal-700'
                        : 'border-slate-200 hover:border-teal-300 bg-slate-50/60 hover:bg-white dark:border-slate-700 dark:bg-slate-900/50'
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-[10px] font-bold">
                          #{index + 1}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>{item.timestamp}</span>
                        </span>
                        <span className="rounded-md bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 border border-slate-200 dark:border-slate-700">
                          {item.mode}
                        </span>
                        <span className="rounded-md bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.language === 'hi' ? 'हिन्दी' : 'English'}
                        </span>
                        {isActive && (
                          <span className="rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200 px-1.5 py-0.5 text-[10px] font-bold">
                            Active View
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        "{item.sourceSnippet}"
                      </p>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                        {item.result.simpleExplanation}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleRestoreFromHistory(item)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                          isActive
                            ? 'bg-teal-700 text-white'
                            : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-teal-50 hover:text-teal-800'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{isActive ? (isHindi ? 'वर्तमान में खुला है' : 'Loaded') : (isHindi ? 'लोड करें' : 'Restore')}</span>
                      </button>

                      <button
                        onClick={() => deleteHistoryItem(item.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                        title="Remove from history"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Input Section Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {isHindi ? 'चिकित्सीय निर्देश या पर्चा (Text)' : 'Medical Instructions / Prescription Text'}
          </label>

          {/* Mode Selector Tabs */}
          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-700/60 p-1 border border-slate-200/60 dark:border-slate-700">
            <button
              onClick={() => setMode('simple')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                mode === 'simple'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {isHindi ? 'सरल भाषा' : 'Simple Explanation'}
            </button>
            <button
              onClick={() => setMode('steps')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                mode === 'steps'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {isHindi ? 'चरण-दर-चरण' : 'Step-by-Step'}
            </button>
            <button
              onClick={() => setMode('summary')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                mode === 'summary'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {isHindi ? 'संक्षिप्त सारांश' : 'Short Summary'}
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            rows={4}
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            placeholder={
              isHindi
                ? 'यहाँ दवा की पर्ची, डॉक्टर की सलाह, या अस्पताल के निर्देश लिखें या बोलें...'
                : 'Paste dosage instructions, doctor notes, or prescription text here...'
            }
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900 leading-relaxed font-sans"
          />

          {/* Voice input button inside textarea */}
          <button
            onClick={toggleSpeechRecognition}
            className={`absolute right-3 bottom-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
            title="Dictate with microphone"
          >
            {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5 text-teal-600" />}
            <span>{isRecording ? t('listening') : t('speakInput')}</span>
          </button>
        </div>

        {/* Action Controls: Explain, Clear, Copy */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExplain}
              disabled={loading || !currentText.trim()}
              className="flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-teal-800/10 transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isHindi ? 'विश्लेषण हो रहा है...' : 'Analyzing Instructions...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{t('explainBtn')}</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setCurrentText('');
                setResult(null);
                stopSpeaking();
              }}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-700 dark:hover:bg-slate-600 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t('clearBtn')}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {currentText.length} {isHindi ? 'अक्षर' : 'characters'}
          </div>
        </div>
      </div>

      {/* Error notification if any */}
      {errorMsg && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200 flex items-center gap-2">
          <Info className="h-4 w-4 text-amber-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results Presentation (Beautifully Designed Sections) */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Section 1: Simple Explanation Hero Card */}
          <div
            style={{ backgroundColor: '#000000' }}
            className="rounded-2xl border-2 border-teal-500/40 p-6 shadow-sm text-white"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-teal-900/60">
              <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                <FileCheck className="h-5 w-5 text-teal-400" />
                <span>{isHindi ? '1. सरल व्याख्या (Simple Explanation)' : '1. Simple Plain-Language Explanation'}</span>
              </div>

              {/* Speech & Copy buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakText(result.simpleExplanation)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    isSpeaking
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-teal-950 hover:bg-teal-900 text-teal-200 border border-teal-800'
                  }`}
                  title="Listen aloud"
                >
                  {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-teal-300" />}
                  <span>{isSpeaking ? t('stopAudio') : t('listenBtn')}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                  <span>{copied ? t('copiedBtn') : t('copyBtn')}</span>
                </button>
              </div>
            </div>

            <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-100 font-normal">
              {result.simpleExplanation}
            </p>
          </div>

          {/* Section 2: Important Instructions */}
          {result.importantInstructions && result.importantInstructions.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-bold text-sm">
                <ListOrdered className="h-4 w-4 text-teal-600" />
                <span>{isHindi ? '2. महत्वपूर्ण निर्देश एवं नियम' : '2. Important Instructions & Care Rules'}</span>
              </div>
              <div className="space-y-2.5">
                {result.importantInstructions.map((instruction, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200 text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Medical Terms Explained */}
          {result.medicalTermsExplained && result.medicalTermsExplained.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-bold text-sm">
                <Info className="h-4 w-4 text-teal-600" />
                <span>{isHindi ? '3. मेडिकल शब्दों का आसान अर्थ' : '3. Medical Terms Explained'}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.medicalTermsExplained.map((termObj, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/50 shadow-sm"
                  >
                    <p className="text-xs font-bold text-teal-900 dark:text-teal-300">
                      {termObj.term}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {termObj.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Details That Need Confirmation (Critical Safety Rule) */}
          {result.detailsNeedingConfirmation && result.detailsNeedingConfirmation.length > 0 && (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-5 shadow-sm dark:border-amber-800 dark:bg-amber-950/30">
              <div className="flex items-center gap-2 mb-3 text-amber-900 dark:text-amber-200 font-bold text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>{isHindi ? '4. विवरण जिनकी डॉक्टर से पुष्टि आवश्यक है' : '4. Details That Need Confirmation'}</span>
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-300 mb-3">
                {isHindi
                  ? 'MedClear AI गायब जानकारी का अनुमान नहीं लगाता। नीचे दिए गए बिंदुओं की पुष्टि अपने डॉक्टर या फार्मासिस्ट से अवश्य करें:'
                  : 'MedClear AI never guesses missing medicine amounts. Verify the following items with your doctor or chemist:'}
              </p>
              <ul className="space-y-2">
                {result.detailsNeedingConfirmation.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-amber-950 dark:text-amber-200 font-medium"
                  >
                    <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 5: Questions to Ask Your Doctor */}
          {result.questionsForDoctor && result.questionsForDoctor.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-bold text-sm">
                <HelpCircle className="h-4 w-4 text-teal-600" />
                <span>{isHindi ? '5. डॉक्टर या फार्मासिस्ट से पूछने योग्य प्रश्न' : '5. Questions to Ask Your Doctor or Pharmacist'}</span>
              </div>
              <div className="space-y-2">
                {result.questionsForDoctor.map((question, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-teal-600 dark:text-teal-400 font-bold text-xs">Q{idx + 1}.</span>
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                        {question}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(question);
                        setCopiedQuestionIdx(idx);
                        setTimeout(() => setCopiedQuestionIdx(null), 2000);
                      }}
                      className="shrink-0 text-[11px] font-semibold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1"
                    >
                      {copiedQuestionIdx === idx ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span>{t('copiedBtn')}</span>
                        </>
                      ) : (
                        <span>{t('copyBtn')}</span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps CTA Bar (Connects into the competition user journey) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-teal-900 text-white shadow-md">
            <div>
              <p className="text-xs font-bold text-teal-200 uppercase tracking-wider">
                {isHindi ? 'अगला कदम (Next Step in Journey)' : 'Recommended Next Step'}
              </p>
              <p className="text-sm font-semibold text-white">
                {isHindi
                  ? 'निर्देशों में अस्पष्टता की गहराई से जांच करें या अपनी समझ का परीक्षण करें।'
                  : 'Scan for unclear ambiguities or take the 3-question understanding check.'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('unclear')}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 text-xs transition-colors"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{isHindi ? 'अस्पष्टता जांचें' : 'Check Ambiguities'}</span>
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 text-xs transition-colors"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{isHindi ? 'समझ जांचें' : 'Take Quiz'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
