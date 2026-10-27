import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VisitSummaryResult } from '../types';
import {
  ClipboardList,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Calendar,
  User,
  AlertTriangle,
  HelpCircle,
  FileText,
  Clock,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

export const VisitSummaryFeature: React.FC = () => {
  const { language, currentText, patient, t } = useApp();

  const [notes, setNotes] = useState<string>(
    currentText ||
    'Patient visited for routine metabolic evaluation. Blood pressure 128/82. Advised to continue Metformin 500mg with evening dinner. Ensure at least 8 glasses of water daily. Return for fasting blood sugar test in 4 weeks on November 15. Avoid skipping meals.'
  );
  const [doctorName, setDoctorName] = useState<string>('Dr. S. Sharma, MD (Internal Medicine)');
  const [visitDate, setVisitDate] = useState<string>('October 18, 2026');
  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<VisitSummaryResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerateSummary = async () => {
    if (!notes.trim()) return;
    setLoading(true);

    try {
      const response = await fetch('/api/visit-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: notes,
          doctorName,
          visitDate,
          language
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setSummary(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (!summary) return;
    const textToCopy = `MedClear AI - Patient Visit Summary
Doctor/Clinic: ${summary.doctorOrClinic}
Date: ${summary.visitDate}

MAIN POINTS:
${summary.mainPoints.join('\n')}

MEDICATIONS / CARE:
${summary.prescribedMedicationsOrCare.join('\n')}

TESTS MENTIONED:
${summary.testsMentioned.join('\n')}

FOLLOW-UP:
${summary.followUpInstructions.join('\n')}

DETAILS NEEDING CONFIRMATION:
${summary.detailsNeedingConfirmation.join('\n')}

QUESTIONS FOR NEXT VISIT:
${summary.questionsForNextDoctorVisit.join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHindi = language === 'hi';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800 no-print">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
              <ClipboardList className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {isHindi ? 'डॉक्टर परामर्श सारांश (Visit Summary)' : 'Patient Visit Summary'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isHindi
              ? 'डॉक्टर के नोट्स से साफ, संगठित और प्रिंट करने योग्य सारांश तैयार करें।'
              : 'Turn doctor consultation notes into a structured, printable take-home summary.'}
          </p>
        </div>

        {summary && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-2 text-xs font-bold transition-colors shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Summary</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Input Form (Hidden during print) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800 no-print space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              {isHindi ? 'डॉक्टर या अस्पताल का नाम' : 'Doctor or Clinic Name'}
            </label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2.5 text-xs sm:text-sm text-slate-900 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              {isHindi ? 'परामर्श की तारीख' : 'Consultation Date'}
            </label>
            <input
              type="text"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2.5 text-xs sm:text-sm text-slate-900 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            {isHindi ? 'डॉक्टर के नोट्स या पर्चे के निर्देश' : 'Clinical Notes / Doctor Advice Text'}
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3.5 text-xs sm:text-sm text-slate-900 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 font-sans"
            placeholder="Paste consultation summary notes..."
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleGenerateSummary}
            disabled={loading || !notes.trim()}
            className="flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-teal-800/10 transition-all"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{isHindi ? 'सारांश बन रहा है...' : 'Generating Summary...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{t('generateSummary')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Structured Summary Output Card (Print-Ready) */}
      {summary && (
        <div className="rounded-2xl border-2 border-teal-500/20 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-800 space-y-6">
          {/* Header on summary card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-teal-600/30">
            <div>
              <span className="text-xs font-extrabold tracking-widest uppercase text-teal-700 dark:text-teal-400">
                MedClear AI • Patient Care Portal
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {summary.title}
              </h2>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
              <p><span className="font-semibold text-slate-800 dark:text-slate-200">Patient:</span> {patient.name} ({patient.age} yrs)</p>
              <p><span className="font-semibold text-slate-800 dark:text-slate-200">Provider:</span> {summary.doctorOrClinic}</p>
              <p><span className="font-semibold text-slate-800 dark:text-slate-200">Date:</span> {summary.visitDate}</p>
            </div>
          </div>

          {/* Section 1: Main Points */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-teal-600" />
              <span>{isHindi ? 'मुख्य बिंदु (Main Points)' : 'Key Consultation Points'}</span>
            </h4>
            <ul className="space-y-1.5">
              {summary.mainPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                  <span className="text-teal-600 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: Prescribed Medications or Care */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
              <span>{isHindi ? 'निर्धारित दवाएं एवं देखभाल' : 'Medications & Prescribed Regimen'}</span>
            </h4>
            <div className="space-y-1.5">
              {summary.prescribedMedicationsOrCare.map((med, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                  {med}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Tests Mentioned */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-teal-600" />
              <span>{isHindi ? 'उल्लेखित लैब टेस्ट एवं जांच' : 'Lab Tests & Diagnostics Mentioned'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {summary.testsMentioned.map((tst, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 shadow-sm text-xs font-semibold text-teal-900 dark:text-teal-200">
                  {tst}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Follow-up Instructions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-teal-600" />
              <span>{isHindi ? 'पुनः परामर्श (Follow-up Schedule)' : 'Follow-up Schedule & Timeframe'}</span>
            </h4>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              {summary.followUpInstructions.map((f, i) => (
                <p key={i} className="font-medium">• {f}</p>
              ))}
            </div>
          </div>

          {/* Section 5: Details Needing Confirmation */}
          {summary.detailsNeedingConfirmation && summary.detailsNeedingConfirmation.length > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 shadow-sm dark:border-amber-800 dark:bg-amber-950/30 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>{isHindi ? 'पुष्टि योग्य विवरण (Verify with Clinic)' : 'Details That Need Confirmation'}</span>
              </h4>
              <ul className="space-y-1">
                {summary.detailsNeedingConfirmation.map((d, i) => (
                  <li key={i} className="text-xs text-amber-950 dark:text-amber-200 font-medium">
                    • {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Emergency Note */}
          {summary.emergencyNote && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/20 text-xs text-rose-900 dark:text-rose-200">
              <span className="font-bold">{isHindi ? 'आपातकालीन चेतावनी: ' : 'Emergency Red Flags: '}</span>
              <span>{summary.emergencyNote}</span>
            </div>
          )}

          {/* Printable Disclaimer Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 italic">
            "{t('disclaimer')}"
          </div>
        </div>
      )}
    </div>
  );
};
