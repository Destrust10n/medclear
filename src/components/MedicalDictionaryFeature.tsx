import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MEDICAL_DICTIONARY } from '../data/mockData';
import { DictionaryTerm } from '../types';
import {
  BookOpen,
  Search,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  Info,
  CheckCircle2,
  Tag,
  Pill,
  ArrowRight
} from 'lucide-react';

export const MedicalDictionaryFeature: React.FC = () => {
  const { language, speakText, isSpeaking, stopSpeaking, setActiveTab, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalTerm, setActiveModalTerm] = useState<DictionaryTerm | null>(null);

  const categories = [
    'All',
    'Conditions & Symptoms',
    'Prescription & Dosage',
    'Laboratory & Tests',
    'General Healthcare'
  ];

  const filteredTerms = MEDICAL_DICTIONARY.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesSearch =
      item.termEn.toLowerCase().includes(query) ||
      item.termHi.toLowerCase().includes(query) ||
      item.meaningEn.toLowerCase().includes(query) ||
      item.meaningHi.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const isHindi = language === 'hi';

  const handlePronounce = (term: DictionaryTerm, lang: 'en' | 'hi') => {
    if (lang === 'hi') {
      speakText(`${term.termHi}। इसका अर्थ है: ${term.meaningHi}`, 'hi');
    } else {
      speakText(`${term.termEn}. It means: ${term.meaningEn}`, 'en');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
              <BookOpen className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {isHindi ? 'द्विभाषी चिकित्सा शब्दावली (Medical Dictionary)' : 'Bilingual Medical Dictionary'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isHindi
              ? 'अस्पताल के पर्चों और रिपोर्ट में प्रयुक्त कठिन मेडिकल शब्दों के आसान हिंदी और अंग्रेजी अर्थ व व्यावहारिक उदाहरण।'
              : 'Search verified clinical terms with plain English & Hindi translations and educational everyday examples.'}
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 self-start sm:self-auto">
          {filteredTerms.length} {isHindi ? 'शब्द उपलब्ध' : 'Verified Clinical Terms'}
        </span>
      </div>

      {/* Connected Medicine Database Banner (Requirement 6) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/5 border border-teal-500/30 dark:border-teal-800 dark:bg-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shrink-0 shadow-xs">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {isHindi ? 'दवाइयों के घटक और ब्रांड जानना चाहते हैं?' : 'Looking for Indian Medicine Formulations & Brands?'}
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {isHindi
                ? 'CDSCO और NLEM 2022 द्वारा अनुमोदित जेनेरिक, भारतीय ब्रांड, क्षमताएं और चेतावनियां देखें।'
                : 'Explore our verified Indian Medicine Database with CDSCO approvals, active ingredients, and PubChem structures.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('medicines')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm self-start sm:self-auto transition-all active:scale-95 shrink-0"
        >
          <span>{isHindi ? 'दवा डेटाबेस खोलें' : 'Open Medicine Database'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Search Bar & Category Filters */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800 space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isHindi
                ? 'शब्द खोजें (उदा: Hypertension, खुराक, सूजन, Dehydration, Antibiotic)...'
                : 'Search term or symptom (e.g., Hypertension, Dosage, Inflammation, Antibiotic)...'
            }
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              {cat === 'All' ? (isHindi ? 'सभी श्रेणियां' : 'All Categories') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.map((term) => (
          <div
            key={term.id}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-teal-500/40 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-800 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header: Term in English + Hindi + Category */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {term.termEn}
                  </h3>
                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 mt-0.5">
                    {term.termHi}
                  </p>
                  {term.pronunciation && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      /{term.pronunciation}/
                    </span>
                  )}
                </div>

                <span className="rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                  {term.category}
                </span>
              </div>

              {/* Meanings */}
              <div className="space-y-2 text-xs leading-relaxed">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                  <p className="font-bold text-slate-700 dark:text-slate-300 mb-0.5">English:</p>
                  <p className="text-slate-600 dark:text-slate-300">{term.meaningEn}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/50 shadow-sm">
                  <p className="font-bold text-teal-900 dark:text-teal-300 mb-0.5">हिन्दी अर्थ:</p>
                  <p className="text-teal-950 dark:text-teal-200">{term.meaningHi}</p>
                </div>
              </div>

              {/* Educational Example */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/80 p-2.5 rounded-md border-l-2 border-teal-500 shadow-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {isHindi ? 'उदाहरण: ' : 'Example: '}
                </span>
                <span>{isHindi ? term.exampleHi : term.exampleEn}</span>
              </div>
            </div>

            {/* Pronunciation audio buttons */}
            <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePronounce(term, 'en')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 px-2 py-1 rounded transition-colors"
                  title="Listen in English"
                >
                  <Volume2 className="h-3 w-3" />
                  <span>Listen EN</span>
                </button>
                <button
                  onClick={() => handlePronounce(term, 'hi')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 px-2 py-1 rounded transition-colors"
                  title="Listen in Hindi"
                >
                  <Volume2 className="h-3 w-3" />
                  <span>हिन्दी में सुनें</span>
                </button>
              </div>

              <span className="text-[10px] text-slate-400">MedClear Verified</span>
            </div>
          </div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-800">
          <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isHindi ? 'कोई मेल खाता शब्द नहीं मिला' : 'No matching terms found'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isHindi ? 'कृपया अन्य खोज शब्द आज़माएं' : 'Try searching for Hypertension, Dosage, or Inflammation'}
          </p>
        </div>
      )}
    </div>
  );
};
