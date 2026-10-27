import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppLanguage, AppTheme, FontSize, PatientProfile, ExplanationResult, ExplanationHistoryItem, ExplainMode } from '../types';
import { DEMO_PATIENT, DEMO_EXAMPLE_A, DEMO_EXAMPLE_B, UI_STRINGS } from '../data/mockData';

interface AppContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentText: string;
  setCurrentText: (text: string) => void;
  patient: PatientProfile;
  setPatient: (patient: PatientProfile) => void;
  isAiAvailable: boolean;
  isSpeaking: boolean;
  speakText: (text: string, customLang?: AppLanguage) => void;
  stopSpeaking: () => void;
  loadDemoExample: (exampleType: 'A' | 'B', navigateTo?: string) => void;
  showTour: boolean;
  setShowTour: (val: boolean) => void;
  startTour: () => void;
  closeTour: () => void;
  history: ExplanationHistoryItem[];
  saveExplanationToHistory: (text: string, mode: ExplainMode, language: AppLanguage, result: ExplanationResult) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  t: (keyPath: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [theme, setTheme] = useState<AppTheme>('light');
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentText, setCurrentText] = useState<string>(DEMO_EXAMPLE_A.text);
  const [patient, setPatient] = useState<PatientProfile>(DEMO_PATIENT);
  const [isAiAvailable, setIsAiAvailable] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showTour, setShowTour] = useState<boolean>(() => {
    // Show on first visit, or default to true for demonstration
    return localStorage.getItem('medclear_seen_tour') !== 'true';
  });

  // Local storage-based history of the previous 5 explanations
  const [history, setHistory] = useState<ExplanationHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('medclear_explanation_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 5);
        }
      }
    } catch (e) {
      console.warn('Failed to parse explanation history from localStorage', e);
    }
    return [];
  });

  const saveExplanationToHistory = (
    text: string,
    mode: ExplainMode,
    language: AppLanguage,
    result: ExplanationResult
  ) => {
    if (!text || !text.trim() || !result) return;
    setHistory(prev => {
      const trimmedText = text.trim();
      const snippet = trimmedText.length > 90 ? trimmedText.slice(0, 90) + '...' : trimmedText;
      const newItem: ExplanationHistoryItem = {
        id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceSnippet: snippet,
        fullText: trimmedText,
        mode,
        language,
        result
      };

      // Filter out duplicate identical fullText so new entry moves to top
      const filtered = prev.filter(item => item.fullText !== trimmedText);
      const updated = [newItem, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('medclear_explanation_history', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to write history to localStorage', err);
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('medclear_explanation_history');
    } catch (err) {
      console.warn('Failed to clear history from localStorage', err);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('medclear_explanation_history', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to update history in localStorage', err);
      }
      return updated;
    });
  };

  const startTour = () => setShowTour(true);
  const closeTour = () => {
    setShowTour(false);
    localStorage.setItem('medclear_seen_tour', 'true');
  };

  // Check backend AI availability on mount
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setIsAiAvailable(data.hasApiKey);
      })
      .catch(() => {
        setIsAiAvailable(false);
      });
  }, []);

  // Sync font size and high contrast classes to root html
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-base', 'text-lg', 'text-xl');
    if (fontSize === 'normal') root.classList.add('text-base');
    if (fontSize === 'large') root.classList.add('text-lg');
    if (fontSize === 'xlarge') root.classList.add('text-xl');

    if (highContrast) {
      document.body.classList.add('contrast-high');
    } else {
      document.body.classList.remove('contrast-high');
    }

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [fontSize, highContrast, theme]);

  // Voice Speech Synthesis
  const speakText = (text: string, customLang?: AppLanguage) => {
    if (!('speechSynthesis' in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = customLang || language;
    utterance.lang = targetLang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95; // Slightly slower for medical clarity

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const loadDemoExample = (exampleType: 'A' | 'B', navigateTo = 'explain') => {
    stopSpeaking();
    if (exampleType === 'A') {
      setCurrentText(DEMO_EXAMPLE_A.text);
    } else {
      setCurrentText(DEMO_EXAMPLE_B.text);
    }
    if (navigateTo) {
      setActiveTab(navigateTo);
    }
  };

  // Translation helper
  const t = (keyPath: string): string => {
    const strings = UI_STRINGS[language] as any;
    const parts = keyPath.split('.');
    let current = strings;
    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part];
      } else {
        return keyPath;
      }
    }
    return typeof current === 'string' ? current : keyPath;
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        activeTab,
        setActiveTab,
        currentText,
        setCurrentText,
        patient,
        setPatient,
        isAiAvailable,
        isSpeaking,
        speakText,
        stopSpeaking,
        loadDemoExample,
        showTour,
        setShowTour,
        startTour,
        closeTour,
        history,
        saveExplanationToHistory,
        clearHistory,
        deleteHistoryItem,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
