import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Accessibility,
  Languages,
  Type,
  Sun,
  Eye,
  Volume2,
  Mic,
  CheckCircle2,
  Sparkles,
  Sliders,
  Check
} from 'lucide-react';

export const AccessibilitySettings: React.FC = () => {
  const {
    language,
    setLanguage,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    theme,
    setTheme,
    speakText,
    isSpeaking,
    stopSpeaking,
    t
  } = useApp();

  const [testSpeechText, setTestSpeechText] = useState<string>(
    language === 'hi'
      ? 'नमस्ते! MedClear AI आपको स्पष्ट और सुरक्षित चिकित्सा निर्देश समझने में मदद करता है।'
      : 'Hello! MedClear AI helps you understand clear and safe medical instructions.'
  );
  const [micTestStatus, setMicTestStatus] = useState<string>('');
  const [isMicTesting, setIsMicTesting] = useState<boolean>(false);

  const isHindi = language === 'hi';

  const testVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicTestStatus(isHindi ? 'इस ब्राउज़र में स्पीच रिकग्निशन उपलब्ध नहीं है।' : 'Speech recognition is not supported in this browser.');
      return;
    }

    try {
      setIsMicTesting(true);
      setMicTestStatus(isHindi ? 'कृपया कुछ बोलें (जैसे: 500 मिलीग्राम)...' : 'Listening... please say something (e.g., 500 milligrams)...');

      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setMicTestStatus(isHindi ? `सुना गया: "${spoken}"` : `Recognized: "${spoken}"`);
        setIsMicTesting(false);
      };

      recognition.onerror = () => {
        setMicTestStatus(isHindi ? 'माइक्रोफोन में कोई आवाज नहीं मिली।' : 'Microphone did not detect clear audio.');
        setIsMicTesting(false);
      };

      recognition.onend = () => {
        setIsMicTesting(false);
      };

      recognition.start();
    } catch (e) {
      setIsMicTesting(false);
      setMicTestStatus(isHindi ? 'माइक्रोफोन शुरू करने में त्रुटि।' : 'Could not access microphone.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
            <Accessibility className="h-4 w-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {isHindi ? 'सुलभता एवं ऑडियो सेटिंग्स (Accessibility)' : 'Accessibility & Voice Settings'}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isHindi
            ? 'अपनी सुविधा के अनुसार भाषा, अक्षरों का आकार, उच्च-कंट्रास्ट और टेक्स्ट-टू-स्पीच अनुकूलित करें।'
            : 'Customize language, text sizing, high-contrast visibility, and audio playback for effortless reading.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Language Selection */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Languages className="h-4 w-4 text-teal-600" />
            <span>{isHindi ? '1. भाषा चयन (Interface Language)' : '1. Interface Language'}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isHindi
              ? 'ऐप के सभी मेनू, व्याख्याएं और प्रश्न इस भाषा में प्रदर्शित होंगे।'
              : 'Choose your preferred language across all menus, explanations, and questions.'}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => setLanguage('en')}
              className={`p-3 rounded-xl border text-left transition-all shadow-sm ${
                language === 'en'
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 ring-2 ring-teal-600/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">English</span>
                {language === 'en' && <Check className="h-4 w-4 text-teal-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Default medical English</p>
            </button>

            <button
              onClick={() => setLanguage('hi')}
              className={`p-3 rounded-xl border text-left transition-all shadow-sm ${
                language === 'hi'
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 ring-2 ring-teal-600/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">हिन्दी (Hindi)</span>
                {language === 'hi' && <Check className="h-4 w-4 text-teal-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">सरल देवनागरी लिपि</p>
            </button>
          </div>
        </div>

        {/* 2. Text Scaling */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Type className="h-4 w-4 text-teal-600" />
            <span>{isHindi ? '2. अक्षरों का आकार (Text Size)' : '2. Text Scaling'}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isHindi
              ? 'बुजुर्गों और कमजोर दृष्टि वाले मरीजों के लिए बड़ा फॉन्ट चुनें।'
              : 'Enlarge typography for senior citizens and low-vision readers.'}
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => setFontSize('normal')}
              className={`p-3 rounded-xl border text-center transition-all shadow-sm ${
                fontSize === 'normal'
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 ring-2 ring-teal-600/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="text-sm font-bold block">Normal</span>
              <span className="text-[10px] text-slate-400">100%</span>
            </button>

            <button
              onClick={() => setFontSize('large')}
              className={`p-3 rounded-xl border text-center transition-all shadow-sm ${
                fontSize === 'large'
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 ring-2 ring-teal-600/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="text-base font-bold block">Large</span>
              <span className="text-[10px] text-slate-400">115%</span>
            </button>

            <button
              onClick={() => setFontSize('xlarge')}
              className={`p-3 rounded-xl border text-center transition-all shadow-sm ${
                fontSize === 'xlarge'
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 ring-2 ring-teal-600/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="text-lg font-bold block">Extra</span>
              <span className="text-[10px] text-slate-400">130%</span>
            </button>
          </div>
        </div>

        {/* 3. Visual Contrast & Theme */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Eye className="h-4 w-4 text-teal-600" />
            <span>{isHindi ? '3. उच्च कंट्रास्ट एवं थीम' : '3. High Contrast & Dark Theme'}</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isHindi ? 'उच्च कंट्रास्ट मोड (High Contrast)' : 'High Contrast Mode'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isHindi ? 'गहरे बॉर्डर और उच्च स्पष्टता' : 'Sharpen borders & enhance edge contrast'}
                </p>
              </div>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  highContrast ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isHindi ? 'डार्क थीम (Dark Mode)' : 'Dark Mode'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isHindi ? 'रात में आंखों पर कम तनाव' : 'Reduce eye strain in low-light'}
                </p>
              </div>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Text-to-Speech & Voice Reader Test */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Volume2 className="h-4 w-4 text-teal-600" />
            <span>{isHindi ? '4. टेक्स्ट-टू-स्पीच ऑडियो परीक्षण' : '4. Text-to-Speech Audio Test'}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isHindi
              ? 'बिना पढ़े निर्देश सुनने के लिए ऑडियो रीडर का परीक्षण करें।'
              : 'Listen to medical explanations read aloud clearly.'}
          </p>

          <div className="space-y-2 pt-1">
            <input
              type="text"
              value={testSpeechText}
              onChange={(e) => setTestSpeechText(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => speakText(testSpeechText)}
                className="flex items-center gap-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 text-xs font-bold transition-colors"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>{isSpeaking ? 'Playing...' : 'Test Speech Reader'}</span>
              </button>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="rounded-lg bg-rose-100 text-rose-700 px-3 py-1.5 text-xs font-semibold"
                >
                  Stop
                </button>
              )}
            </div>
          </div>

          {/* Voice Input Test */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Mic className="h-3.5 w-3.5 text-teal-600" />
                <span>{isHindi ? 'माइक्रोफोन इनपुट टेस्ट:' : 'Microphone Dictation Test:'}</span>
              </span>
              <button
                onClick={testVoiceInput}
                disabled={isMicTesting}
                className="rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 shadow-xs"
              >
                {isMicTesting ? 'Listening...' : 'Test Mic'}
              </button>
            </div>
            {micTestStatus && (
              <p className="text-[11px] p-2 rounded bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono shadow-xs">
                {micTestStatus}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Accessibility Declaration */}
      <div className="rounded-2xl border border-teal-200/80 bg-teal-50/50 p-4 shadow-sm dark:border-teal-900/40 dark:bg-teal-950/20 text-xs text-teal-950 dark:text-teal-200 leading-relaxed">
        <span className="font-bold">
          {isHindi ? 'सुलभता संकल्प (Universal Accessibility Commitment): ' : 'Universal Accessibility Commitment: '}
        </span>
        <span>
          {isHindi
            ? 'MedClear AI को ग्रामीण और अर्ध-शहरी भारत के मरीजों, बुजुर्गों, और कम तकनीकी जानकारी वाले लोगों की सुविधा को ध्यान में रखकर बनाया गया है।'
            : 'MedClear AI is intentionally built with large tap targets, keyboard navigation, high-contrast states, and dual-language Devanagari font rendering to support diverse Indian communities.'}
        </span>
      </div>
    </div>
  );
};
