import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { QuizResult, QuizQuestion } from '../types';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  HeartHandshake,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { DEMO_EXAMPLE_A, DEMO_EXAMPLE_B } from '../data/mockData';

export const UnderstandingCheckFeature: React.FC = () => {
  const {
    language,
    currentText,
    setCurrentText,
    loadDemoExample,
    setActiveTab,
    t
  } = useApp();

  const [loading, setLoading] = useState<boolean>(false);
  const [quizData, setQuizData] = useState<QuizResult | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto load quiz if currentText is available
  useEffect(() => {
    if (currentText && !quizData && !loading) {
      handleGenerateQuiz();
    }
  }, []);

  const handleGenerateQuiz = async () => {
    if (!currentText.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setSelectedAnswers({});
    setShowResults(false);

    try {
      const response = await fetch('/api/understanding-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentText,
          language
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setQuizData(json.data);
      } else {
        throw new Error(json.error || 'Failed to generate quiz');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading understanding questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    // Only allow selecting if not submitted yet, or allow changing before final
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const isHindi = language === 'hi';

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = quizData?.questions?.length || 3;
  const isAllAnswered = answeredCount === totalQuestions;

  // Calculate score safely
  const score = quizData?.questions
    ? quizData.questions.reduce((acc, q, idx) => {
        return selectedAnswers[idx] === q.correctIndex ? acc + 1 : acc;
      }, 0)
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <HelpCircle className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {isHindi ? 'मरीज समझ जांच (Understanding Check)' : 'Patient Understanding Check'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isHindi
              ? 'दिए गए निर्देशों पर आधारित 3 सरल बहुविकल्पीय प्रश्न। कोई परीक्षा नहीं, केवल आपकी समझ सुनिश्चित करने के लिए।'
              : '3 multiple-choice questions based strictly on the provided medical instructions to ensure safe adherence.'}
          </p>
        </div>

        {/* Demo Fast Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadDemoExample('A', 'quiz');
              setTimeout(() => handleGenerateQuiz(), 50);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>Load Example A Quiz</span>
          </button>
        </div>
      </div>

      {/* Instruction Reference Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
            {isHindi ? 'वर्तमान पर्चा / निर्देश संदर्भ:' : 'Source Instruction Reference:'}
          </p>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic font-medium line-clamp-2">
            "{currentText}"
          </p>
        </div>

        <button
          onClick={handleGenerateQuiz}
          disabled={loading}
          className="shrink-0 flex items-center gap-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 text-xs font-bold transition-colors shadow-xs"
        >
          <RotateCcw className="h-3 w-3" />
          <span>{isHindi ? 'पुनः उत्पन्न करें' : 'Regenerate Questions'}</span>
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-800 space-y-3">
          <div className="inline-block h-8 w-8 border-3 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {isHindi ? 'निर्देशों के आधार पर 3 प्रश्न तैयार किए जा रहे हैं...' : 'Generating 3 tailored comprehension questions...'}
          </p>
        </div>
      )}

      {/* Error state */}
      {errorMsg && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 shadow-sm text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200">
          {errorMsg}
        </div>
      )}

      {/* Quiz Questions Content */}
      {!loading && quizData?.questions && (
        <div className="space-y-6">
          {quizData.questions.map((q, qIndex) => {
            const userSelected = selectedAnswers[qIndex];
            const hasAnsweredThis = userSelected !== undefined;
            const isCorrect = userSelected === q.correctIndex;

            return (
              <div
                key={q.id || qIndex}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800 space-y-4"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-xs font-bold shrink-0 mt-0.5">
                      Q{qIndex + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {q.question}
                    </h3>
                  </div>

                  {hasAnsweredThis && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {isCorrect ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      <span>{isCorrect ? (isHindi ? 'सटीक उत्तर!' : 'Correct') : (isHindi ? 'समीक्षा करें' : 'Check review')}</span>
                    </span>
                  )}
                </div>

                {/* 4 Answer Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((option, optIdx) => {
                    const isSelected = userSelected === optIdx;
                    const isThisTheCorrectAnswer = optIdx === q.correctIndex;

                    let btnClass = 'border-slate-200 hover:border-teal-500/50 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-200';

                    if (hasAnsweredThis) {
                      if (isThisTheCorrectAnswer) {
                        btnClass = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20';
                      } else if (isSelected && !isCorrect) {
                        btnClass = 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200';
                      } else {
                        btnClass = 'opacity-60 border-slate-200 dark:border-slate-700 text-slate-500';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(qIndex, optIdx)}
                        className={`flex items-start gap-3 rounded-xl border p-3.5 text-left text-xs sm:text-sm transition-all shadow-sm ${btnClass}`}
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-[11px] font-bold shrink-0 mt-0.5">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-relaxed flex-1">{option}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Friendly Educational Explanation (Revealed once answered) */}
                {hasAnsweredThis && (
                  <div
                    className={`rounded-xl p-3.5 text-xs sm:text-sm shadow-sm animate-in fade-in duration-200 ${
                      isCorrect
                        ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200'
                        : 'bg-amber-50/80 border border-amber-200 text-amber-950 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200'
                    }`}
                  >
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <HeartHandshake className="h-4 w-4" />
                      <span>{isHindi ? 'शैक्षिक स्पष्टीकरण:' : 'Educational Insight:'}</span>
                    </p>
                    <p className="leading-relaxed">{q.explanation}</p>
                    {q.relatedInstruction && (
                      <p className="mt-2 text-[11px] opacity-80 italic">
                        "{q.relatedInstruction}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Final Review & Score Card */}
          <div className="rounded-2xl border-2 border-teal-500/40 bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/60 p-6 shadow-sm dark:border-teal-500/30 dark:bg-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'समझ जांच प्रगति' : 'Comprehension Summary'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isHindi
                    ? `${totalQuestions} में से ${answeredCount} प्रश्नों का उत्तर दिया गया`
                    : `${answeredCount} of ${totalQuestions} answered`}
                </p>
              </div>

              {isAllAnswered && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-teal-800 dark:text-teal-200">
                    {isHindi ? 'आपका परिणाम:' : 'Your Score:'} {score} / {totalQuestions}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    {score === totalQuestions ? '100% Ready' : 'Good Understanding'}
                  </span>
                </div>
              )}
            </div>

            {/* Zero Shaming Message */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isHindi
                ? 'याद रखें: चिकित्सा निर्देश समझना कोई परीक्षा नहीं है। यदि कोई उत्तर गलत भी होता है, तो उसका उद्देश्य केवल यह है कि आप डॉक्टर या फार्मासिस्ट से सही समय पर सही प्रश्न पूछ सकें।'
                : 'Zero-shaming healthcare principle: Medical comprehension is not a test of intelligence. If any question was tricky, it simply shows what to double-check with your chemist.'}
            </p>

            {/* Topics for Final Review */}
            {quizData.reviewTopics && quizData.reviewTopics.length > 0 && (
              <div className="pt-2 border-t border-teal-100 dark:border-slate-700 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300">
                  {isHindi ? 'याद रखने योग्य मुख्य बातें (Review Topics):' : 'Key Topics to Remember:'}
                </p>
                <ul className="space-y-1.5">
                  {quizData.reviewTopics.map((topic, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <span className="text-emerald-600 font-bold shrink-0">✓</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setShowResults(false);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{isHindi ? 'दोबारा प्रयास करें' : 'Retry Quiz'}</span>
              </button>

              <button
                onClick={() => setActiveTab('dictionary')}
                className="flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 text-xs font-bold transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>{isHindi ? 'चिकित्सा शब्दावली देखें' : 'Explore Medical Terms'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
