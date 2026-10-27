import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MedicineEntry, DatabaseImportStats } from '../types';
import {
  DATABASE_IMPORT_STATS,
  VERIFIED_INDIAN_MEDICINES,
  FLAGGED_AUDIT_RECORDS,
  searchMedicineDatabase
} from '../data/medicineDatabase';
import {
  Pill,
  Search,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Layers,
  FileText,
  Thermometer,
  Baby,
  Activity,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  RefreshCw,
  Database,
  ArrowRight,
  BookOpen,
  HelpCircle,
  X
} from 'lucide-react';

export const MedicineDatabaseFeature: React.FC = () => {
  const { language, speakText, isSpeaking, stopSpeaking, setActiveTab, t } = useApp();
  const isHindi = language === 'hi';

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedForm, setSelectedForm] = useState<string>('All');
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineEntry | null>(
    VERIFIED_INDIAN_MEDICINES[0] // Default to Metformin for immediate demonstration
  );
  const [showImportAudit, setShowImportAudit] = useState<boolean>(false);
  const [showFlaggedModal, setShowFlaggedModal] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<any | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [ambiguityWarning, setAmbiguityWarning] = useState<string | null>(null);

  // Search results
  const searchResults = searchMedicineDatabase(searchQuery, selectedCategory, selectedForm);

  // Categories list
  const categories = [
    'All',
    'Medicines for Endocrine Disorders (Antidiabetic)',
    'Medicines for Cardiovascular Disorders (Calcium Channel Blocker)',
    'Medicines for Cardiovascular Disorders (Angiotensin II Receptor Blocker - ARB)',
    'Medicines for Cardiovascular Disorders (Fixed Dose Antihypertensive Combination)',
    'Analgesics, Antipyretics, Non-steroidal Anti-inflammatory Medicines',
    'Antibacterials (Beta-lactam medicines)',
    'Antibacterials (Macrolide)',
    'Antibacterials (Fluoroquinolone)',
    'Antacids and other Antiulcer Medicines (Proton Pump Inhibitor)',
    'Lipid-lowering Medicines (HMG-CoA Reductase Inhibitor)',
    'Medicines for Asthma and Chronic Obstructive Pulmonary Disease',
    'Thyroid and Antithyroid Medicines (Hormone Replacement)',
    'Anthelminthics (Intestinal and Systemic Deworming)',
    'Medicines for Fluid and Electrolyte Disturbances'
  ];

  const dosageForms = ['All', 'Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Inhaler', 'Drops', 'Powder'];

  // Check for ambiguous searches
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (['tablet', 'capsule', 'syrup', 'medicine', 'goli', 'drops', 'fever', 'sugar', '500'].includes(q)) {
      setAmbiguityWarning(
        isHindi
          ? `"${searchQuery}" एक बहुत सामान्य या अस्पष्ट शब्द है। कृपया नीचे दी गई सूची से विशिष्ट दवा या सक्रिय घटक चुनें।`
          : `"${searchQuery}" is ambiguous. Multiple medicines match this description. Please confirm or select the specific generic or brand name below.`
      );
    } else {
      setAmbiguityWarning(null);
    }
  }, [searchQuery, isHindi]);

  // Request AI bilingual explanation for the selected medicine
  const handleRequestAiExplanation = async (med: MedicineEntry) => {
    stopSpeaking();
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/medicines/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId: med.id,
          medicineName: med.genericName,
          language
        }),
      });
      const data = await response.json();
      if (data.success && data.aiExplanation) {
        setAiExplanation(data.aiExplanation);
      }
    } catch (e) {
      console.warn('Failed to fetch AI explanation', e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Quick Demo Buttons
  const handleQuickDemo = (genericName: string) => {
    setSearchQuery(genericName);
    const found = VERIFIED_INDIAN_MEDICINES.find(m => m.genericName.toLowerCase().includes(genericName.toLowerCase()));
    if (found) {
      setSelectedMedicine(found);
      setAiExplanation(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400 border border-teal-200/70 dark:border-teal-800">
                <Pill className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {isHindi ? 'भारत औषधि ज्ञान डेटाबेस' : 'Medicine Knowledge Database (India)'}
                  </h1>
                  <span className="rounded-md bg-teal-100 dark:bg-teal-950 px-2 py-0.5 text-[10px] font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                    CDSCO & NLEM 2022
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isHindi
                    ? 'भारत सरकार के आधिकारिक स्रोतों (CDSCO एवं NLEM 2022) से सत्यापित दवाएं, ब्रांड, घटक, सावधानियां एवं विज्ञान डेटा।'
                    : 'Search verified Indian essential medicines with authentic CDSCO & NLEM regulatory source references.'}
                </p>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowImportAudit(!showImportAudit)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
              title="View data import audit report and regulatory sources"
            >
              <Database className="h-3.5 w-3.5 text-teal-600" />
              <span>{isHindi ? 'डेटा पाइपलाइन ऑडिट' : 'Database Audit & Sources'}</span>
              {showImportAudit ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            <button
              onClick={() => setActiveTab('dictionary')}
              className="flex items-center gap-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 px-3 py-2 text-xs font-bold text-teal-800 dark:text-teal-200 border border-teal-200/80 dark:border-teal-800 hover:bg-teal-100/80 transition-colors shadow-sm"
              title="Go to Medical Dictionary terms"
            >
              <BookOpen className="h-3.5 w-3.5 text-teal-600" />
              <span>{isHindi ? 'चिकित्सा शब्दावली देखें' : 'Medical Dictionary'}</span>
            </button>
          </div>
        </div>

        {/* Audit Pipeline Stats Panel (Requirement 3) */}
        {showImportAudit && (
          <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'आधिकारिक आयात पाइपलाइन स्थिति (Data Import Pipeline)' : 'Official Data Import & Quality Verification Pipeline'}
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Audit Timestamp: {new Date(DATABASE_IMPORT_STATS.lastPipelineRun).toLocaleDateString()}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 shadow-sm text-center">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Scanned</p>
                <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{DATABASE_IMPORT_STATS.totalSourceRecordsScanned}</p>
                <p className="text-[10px] text-slate-500">NLEM 2022 list</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-sm text-center">
                <p className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase">Verified Records</p>
                <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{DATABASE_IMPORT_STATS.totalVerifiedRecords}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Zero fabricated</p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 shadow-sm text-center">
                <p className="text-[10px] font-semibold text-blue-800 dark:text-blue-300 uppercase">Duplicates Unified</p>
                <p className="text-lg font-extrabold text-blue-700 dark:text-blue-300">{DATABASE_IMPORT_STATS.duplicateRecordsDetected}</p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400">Merged formulations</p>
              </div>

              <div 
                onClick={() => setShowFlaggedModal(true)}
                className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 shadow-sm text-center cursor-pointer hover:bg-amber-100/70 transition-colors"
                title="Click to view regulatory quarantined records"
              >
                <p className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 uppercase">Flagged / Excluded</p>
                <p className="text-lg font-extrabold text-amber-700 dark:text-amber-300">{DATABASE_IMPORT_STATS.flaggedUncertainRecords}</p>
                <p className="text-[10px] text-amber-600 underline">View Flagged</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 shadow-sm text-center">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Import Failures</p>
                <p className="text-lg font-extrabold text-slate-700 dark:text-slate-300">{DATABASE_IMPORT_STATS.importFailuresIdentified}</p>
                <p className="text-[10px] text-slate-500">Unreadable scanned PDF</p>
              </div>
            </div>

            {/* Trustworthy Source Provenance List */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {isHindi ? 'प्रमाणित स्रोत एवं संदर्भ (Official Provenance):' : 'Audited Primary Regulatory Sources:'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                {DATABASE_IMPORT_STATS.sourcesUsed.map((src, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">{src.name}</span>
                      <span className="text-slate-500 dark:text-slate-400">{src.scope}</span>
                    </div>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-700 p-1 shrink-0"
                      title="Open source reference"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Strict Medical Safety Notice Banner (Requirement 5) */}
      <div className="rounded-2xl border-2 border-rose-500/30 bg-rose-50/50 p-4 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/20 space-y-2">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-white shrink-0 mt-0.5">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-200">
              {isHindi ? 'सख्त चिकित्सीय सुरक्षा एवं गैर-प्रिस्क्रिप्शन नियम' : 'Strict Medical Safety & Non-Prescription Guardrails'}
            </h3>
            <p className="text-xs text-rose-900/90 dark:text-rose-300/90 leading-relaxed font-normal">
              {isHindi ? (
                <>
                  <strong className="font-semibold">महत्वपूर्ण:</strong> यह डेटाबेस केवल सामान्य शैक्षिक एवं संदर्भ उद्देश्यों के लिए है। MedClear AI कभी भी किसी व्यक्ति के लिए दवा निर्धारित (Prescribe) नहीं करता, उत्पाद की क्षमता से खुराक का अनुमान नहीं लगाता, और न ही दवा शुरू करने या बदलने की सिफारिश करता है। किसी भी दवा के सेवन से पहले हमेशा पंजीकृत डॉक्टर या फार्मासिस्ट से परामर्श लें।
                </>
              ) : (
                <>
                  <strong className="font-semibold">Important Clinical Guardrails:</strong> MedClear AI provides general educational reference based on official CDSCO/NLEM data. It <em>never</em> prescribes medication, never infers individual doses from product strengths, never calculates pediatric doses, and never advises starting, stopping, or altering medications. Consult a registered physician or pharmacist for personal treatment decisions.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Flagged Quarantine Modal */}
      {showFlaggedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'नियामक समीक्षा हेतु क्वारंटाइन किए गए रिकॉर्ड' : 'Flagged & Quarantined Drug Records'}
                </h3>
              </div>
              <button
                onClick={() => setShowFlaggedModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isHindi
                ? 'डेटा पाइपलाइन सुरक्षा नियम: अपुष्ट, प्रतिबंधित या अधूरे डोजियर वाली दवाओं को मुख्य डेटाबेस में शामिल नहीं किया जाता।'
                : 'Pipeline Safety Principle: Drugs prohibited under Indian Drugs & Cosmetics Act Section 26A or lacking verified prescribing monographs are quarantined rather than guessing.'}
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {FLAGGED_AUDIT_RECORDS.map((rec) => (
                <div key={rec.id} className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 dark:text-amber-200">{rec.reportedName}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                      {rec.issueType}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-normal">{rec.reason}</p>
                  <p className="text-[11px] font-semibold text-teal-800 dark:text-teal-300 pt-1">
                    Action: {rec.actionTaken}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowFlaggedModal(false)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar, Filters & Quick Demo Switchers */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isHindi
                ? 'जेनेरिक नाम, भारतीय ब्रांड (जैसे Dolo, Glycomet, Augmentin, Pan 40), सक्रिय घटक या क्षमता खोजें...'
                : 'Search by generic name, Indian brand (e.g. Dolo 650, Glycomet, Augmentin, Pan 40), active ingredient, or strength...'
            }
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 shadow-xs"
          />
        </div>

        {/* Ambiguity Alert Prompt (Requirement 4) */}
        {ambiguityWarning && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-200 shadow-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{ambiguityWarning}</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                {isHindi
                  ? 'अस्पष्ट दवा नाम से भ्रम हो सकता है। कृपया नीचे सूची में सटीक दवा पर क्लिक करें।'
                  : 'Ambiguous searches can lead to medication confusion. Please select the precise active ingredient or brand below.'}
              </p>
            </div>
          </div>
        )}

        {/* Quick Demo Buttons for Judges & Users */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">
            {isHindi ? 'त्वरित डेमो खोज:' : 'Quick Demo Cases:'}
          </span>
          <button
            onClick={() => handleQuickDemo('Metformin')}
            className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 text-xs font-semibold hover:bg-teal-100 transition-colors border border-teal-200/80 dark:border-teal-800 shadow-2xs"
          >
            Metformin (Diabetes)
          </button>
          <button
            onClick={() => handleQuickDemo('Paracetamol')}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors border border-emerald-200/80 dark:border-emerald-800 shadow-2xs"
          >
            Dolo 650 / Paracetamol
          </button>
          <button
            onClick={() => handleQuickDemo('Amoxicillin')}
            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-200/80 dark:border-blue-800 shadow-2xs"
          >
            Augmentin (Antibiotic FDC)
          </button>
          <button
            onClick={() => handleQuickDemo('Amlodipine')}
            className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 text-xs font-semibold hover:bg-purple-100 transition-colors border border-purple-200/80 dark:border-purple-800 shadow-2xs"
          >
            Amlodipine (Blood Pressure)
          </button>
          <button
            onClick={() => handleQuickDemo('ORS')}
            className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors border border-amber-200/80 dark:border-amber-800 shadow-2xs"
          >
            ORS (WHO Electrolyte)
          </button>
        </div>

        {/* Category & Dosage Form Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              {isHindi ? 'चिकित्सीय श्रेणी फ़िल्टर' : 'Therapeutic Category'}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 py-2 px-3 shadow-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              {categories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              {isHindi ? 'दवा का रूप (Dosage Form)' : 'Dosage Form'}
            </label>
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 py-2 px-3 shadow-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              {dosageForms.map((form, i) => (
                <option key={i} value={form}>
                  {form === 'All' ? 'All Dosage Forms' : form}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Workspace: Left Results List, Right Detailed Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Results Sidebar / List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isHindi ? `मिलान परिणाम (${searchResults.length})` : `Matching Medicines (${searchResults.length})`}
            </span>
            <span className="text-[11px] text-slate-500">
              {DATABASE_IMPORT_STATS.totalVerifiedRecords} verified in DB
            </span>
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {searchResults.map((med) => {
              const isSelected = selectedMedicine?.id === med.id;
              return (
                <div
                  key={med.id}
                  onClick={() => {
                    setSelectedMedicine(med);
                    setAiExplanation(null);
                  }}
                  className={`cursor-pointer rounded-2xl p-4 transition-all shadow-sm border ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/70 dark:border-teal-600 dark:bg-slate-800 ring-2 ring-teal-500/20'
                      : 'border-slate-200/80 bg-white hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {med.genericName}
                      </h4>
                      <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 mt-0.5">
                        {med.genericNameHi}
                      </p>
                    </div>
                    {med.isCombination && (
                      <span className="rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.5 text-[9px] font-extrabold uppercase shrink-0">
                        FDC
                      </span>
                    )}
                  </div>

                  {/* Brands in India */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {med.brandNamesIndia.slice(0, 3).map((brand, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 text-[10px] font-medium"
                      >
                        {brand}
                      </span>
                    ))}
                    {med.brandNamesIndia.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{med.brandNamesIndia.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[180px]">{med.dosageForms[0]}</span>
                    <span className="font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1">
                      <span>View</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}

            {searchResults.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
                <Pill className="h-8 w-8 text-slate-400 mx-auto opacity-50" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isHindi ? 'कोई सत्यापित दवा नहीं मिली' : 'No verified medicine found'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isHindi
                    ? 'सुरक्षा नियम: मेडक्लियर एआई मनगढ़ंत दवा रिकॉर्ड नहीं दिखाता। कृपया सही स्पेलिंग जांचें या फ़िल्टर रीसेट करें।'
                    : 'Safety Rule: MedClear AI strictly never fabricates or hallucinates unverified drug records. Check spelling or reset filters.'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedForm('All');
                  }}
                  className="mt-2 text-xs font-semibold text-teal-600 hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Medicine Dossier (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {selectedMedicine ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                      {selectedMedicine.approvalStatus}
                    </span>
                    {selectedMedicine.isCombination && (
                      <span className="rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 text-xs font-bold">
                        Combination Medicine (FDC)
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {selectedMedicine.genericName}
                  </h2>
                  <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
                    {selectedMedicine.genericNameHi}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Category: {selectedMedicine.therapeuticCategory}
                  </p>
                </div>

                {/* Read Aloud & Bilingual AI Explain Action */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const text = isHindi
                        ? `${selectedMedicine.genericNameHi}। यह दवा ${selectedMedicine.approvedIndications[0]} के लिए अनुशंसित है। चेतावनी: ${selectedMedicine.seriousWarnings[0]}`
                        : `${selectedMedicine.genericName}. Indicated for: ${selectedMedicine.approvedIndications[0]}. Warning: ${selectedMedicine.seriousWarnings[0]}`;
                      speakText(text);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                    title="Read overview aloud"
                  >
                    {isSpeaking ? (
                      <VolumeX className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5 text-teal-600" />
                    )}
                    <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                  </button>

                  <button
                    onClick={() => handleRequestAiExplanation(selectedMedicine)}
                    disabled={isLoadingAi}
                    className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    {isLoadingAi ? (
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                    )}
                    <span>{isHindi ? 'सरल भाषा में समझें (AI)' : 'Explain in Simple Terms'}</span>
                  </button>
                </div>
              </div>

              {/* Verified Indian Brands & Active Ingredients */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 shadow-sm space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isHindi ? 'सक्रिय घटक (Active Ingredients)' : 'Active Ingredient(s)'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMedicine.activeIngredients.map((ing, i) => (
                      <span key={i} className="rounded-lg bg-teal-100/70 text-teal-900 dark:bg-teal-950 dark:text-teal-200 px-2.5 py-1 text-xs font-bold">
                        {ing}
                      </span>
                    ))}
                  </div>
                  {selectedMedicine.combinationDetails && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-1">
                      {selectedMedicine.combinationDetails}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 shadow-sm space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isHindi ? 'भारत में प्रमुख ब्रांड (Verified Indian Brands)' : 'Common Indian Brand Names'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMedicine.brandNamesIndia.map((brand, i) => (
                      <span key={i} className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1 text-xs font-semibold shadow-2xs">
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Standard Strengths & Formulations */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isHindi ? 'मानक क्षमताएं एवं रूप (Standard Strengths & Dosage Forms)' : 'Standard Formulations & Strengths'}
                  </p>
                  <span className="text-[10px] text-slate-400 italic">
                    Original values preserved with normalized units
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Available Strengths:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMedicine.strengths.map((s, i) => (
                        <span key={i} className="rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-bold text-teal-800 dark:text-teal-200 shadow-2xs font-mono">
                          {s.normalizedString}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Dosage Forms:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMedicine.dosageForms.map((f, i) => (
                        <span key={i} className="rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Approved Indications */}
              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{isHindi ? 'अनुमोदित उपयोग एवं संकेत (Approved Indications)' : 'Officially Documented Indications'}</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pl-6 list-disc">
                  {selectedMedicine.approvedIndications.map((ind, i) => (
                    <li key={i} className="leading-relaxed">{ind}</li>
                  ))}
                </ul>
              </div>

              {/* Serious Warnings & Black Box Safety (Requirement 5) */}
              <div className="rounded-xl border-2 border-amber-400/60 bg-amber-50/60 p-4 shadow-sm dark:border-amber-800 dark:bg-amber-950/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>{isHindi ? 'गंभीर चेतावनियां (Serious Warnings & Safety Alerts)' : 'Serious Warnings & Black Box Alerts'}</span>
                </div>
                <div className="space-y-2 text-xs text-amber-900 dark:text-amber-200">
                  {selectedMedicine.seriousWarnings.map((w, i) => (
                    <p key={i} className="leading-relaxed font-medium flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>{w}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Contraindications & Side Effects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contraindications */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 shadow-sm space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                    <ShieldAlert className="h-4 w-4 text-rose-600" />
                    <span>{isHindi ? 'निषेध (Contraindications)' : 'Contraindications'}</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pl-4 list-disc">
                    {selectedMedicine.contraindications.map((ci, i) => (
                      <li key={i} className="leading-relaxed">{ci}</li>
                    ))}
                  </ul>
                </div>

                {/* Side Effects */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 shadow-sm space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Activity className="h-4 w-4 text-teal-600" />
                    <span>{isHindi ? 'ज्ञात दुष्प्रभाव (Known Side Effects)' : 'Documented Side Effects'}</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pl-4 list-disc">
                    {selectedMedicine.knownSideEffects.map((se, i) => (
                      <li key={i} className="leading-relaxed">{se}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Special Population & Storage Guidelines */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Baby className="h-4 w-4 text-teal-600" />
                  <span>{isHindi ? 'विशेष समूह सावधानियां एवं भंडारण (Special Populations & Storage)' : 'Special Populations & Storage Instructions'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Pregnancy & Lactation:</span>
                    <span className="text-slate-600 dark:text-slate-400">{selectedMedicine.specialPopulationCautions.pregnancyLactation}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Renal / Kidney Impairment:</span>
                    <span className="text-slate-600 dark:text-slate-400">{selectedMedicine.specialPopulationCautions.renalImpairment}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Hepatic / Liver Impairment:</span>
                    <span className="text-slate-600 dark:text-slate-400">{selectedMedicine.specialPopulationCautions.hepaticImpairment}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Storage Instruction:</span>
                    <span className="text-slate-600 dark:text-slate-400">{selectedMedicine.storageInstructions}</span>
                  </div>
                </div>
              </div>

              {/* Documented Interactions Notice */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Documented Interactions (Critical Reference):
                </span>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pl-4 list-disc">
                  {selectedMedicine.documentedInteractions.map((inter, i) => (
                    <li key={i}>{inter}</li>
                  ))}
                </ul>
                <p className="text-[11px] text-slate-500 italic pt-1">
                  * Clinical Rule: The absence of documented interaction data does NOT prove that no interaction exists. Always verify your complete medication regimen with your pharmacist.
                </p>
              </div>

              {/* Science Skill: PubChem Compound & 2D Chemical Structure Integration */}
              {selectedMedicine.scienceData && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50/60 to-slate-50 dark:from-slate-800/80 dark:to-slate-900 border border-teal-200/80 dark:border-teal-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-teal-600" />
                      <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200">
                        {isHindi ? 'रसायन विज्ञान एवं आणविक डेटा (PubChem / Science Skill)' : 'Chemical & Molecular Pharmacology (PubChem PUG REST)'}
                      </h4>
                    </div>
                    {selectedMedicine.scienceData.pubchemCid && (
                      <a
                        href={`https://pubchem.ncbi.nlm.nih.gov/compound/${selectedMedicine.scienceData.pubchemCid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline"
                      >
                        <span>PubChem CID: {selectedMedicine.scienceData.pubchemCid}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {selectedMedicine.scienceData.structureImageUrl && (
                      <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0">
                        <img
                          src={selectedMedicine.scienceData.structureImageUrl}
                          alt={`${selectedMedicine.genericName} 2D Chemical Structure`}
                          className="h-28 w-28 object-contain"
                          loading="lazy"
                        />
                        <span className="text-[9px] text-slate-400 block text-center mt-1">2D Structure</span>
                      </div>
                    )}

                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 overflow-hidden">
                      <div>
                        <span className="font-semibold text-slate-500 text-[11px] block">Molecular Formula:</span>
                        <span className="font-mono font-bold text-teal-800 dark:text-teal-300">{selectedMedicine.scienceData.molecularFormula}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500 text-[11px] block">Canonical SMILES:</span>
                        <span className="font-mono text-[10px] break-all bg-white dark:bg-slate-900 p-1 rounded border border-slate-200 dark:border-slate-800 block">
                          {selectedMedicine.scienceData.canonicalSmiles}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Bilingual Communication Summary (Separated Clearly from Verified Facts) */}
              {aiExplanation && (
                <div className="rounded-2xl border-2 border-teal-500/40 bg-teal-50/50 p-5 shadow-sm dark:border-teal-800 dark:bg-teal-950/20 space-y-4">
                  <div className="flex items-center justify-between border-b border-teal-200/60 dark:border-teal-800/80 pb-2.5">
                    <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200">
                      <Sparkles className="h-4 w-4 text-teal-600" />
                      <h4 className="text-xs sm:text-sm font-bold">
                        {isHindi ? 'सरल भाषा संचार सहायक (AI Communication Support)' : 'Plain-Language Communication Support (AI Assisted)'}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-200/80 text-teal-900 dark:bg-teal-900 dark:text-teal-200">
                      Educational Translation
                    </span>
                  </div>

                  <div className="space-y-3 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    <div>
                      <p className="font-bold text-teal-950 dark:text-teal-200 mb-0.5">Simple Overview:</p>
                      <p>{aiExplanation.simpleOverview}</p>
                    </div>

                    <div>
                      <p className="font-bold text-teal-950 dark:text-teal-200 mb-0.5">How It Acts in the Body:</p>
                      <p>{aiExplanation.howItWorksPlain}</p>
                    </div>

                    {aiExplanation.commonQuestionsForPharmacist && (
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-teal-200/80 dark:border-teal-800 space-y-1.5">
                        <p className="font-bold text-teal-900 dark:text-teal-300 text-[11px] uppercase">
                          Questions to Ask Your Chemist or Doctor:
                        </p>
                        <ul className="space-y-1 list-disc pl-4 text-[11px]">
                          {aiExplanation.commonQuestionsForPharmacist.map((q: string, i: number) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Source Attribution & Regulatory Provenance Box (Requirement 1 & 2) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  <span>{isHindi ? 'आधिकारिक स्रोत एवं सत्यापन तिथि' : 'Official Regulatory Source & Provenance'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="font-semibold block">Regulatory Authority:</span>
                    <span>{selectedMedicine.sourceAuthority}</span>
                  </div>
                  <div>
                    <span className="font-semibold block">Dossier / Document:</span>
                    <span>{selectedMedicine.sourceDocument}</span>
                  </div>
                  <div>
                    <span className="font-semibold block">Verification Date:</span>
                    <span>{selectedMedicine.verificationDate}</span>
                  </div>
                  <div>
                    <span className="font-semibold block">Official Source URL:</span>
                    <a
                      href={selectedMedicine.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span className="truncate max-w-[200px]">{selectedMedicine.sourceUrl}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                </div>

                {selectedMedicine.unknownFields && selectedMedicine.unknownFields.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-500">
                    <span className="font-bold">Transparent Data Discipline:</span> Fields marked "unknown / not verified" (e.g. {selectedMedicine.unknownFields.join(', ')}) are never guessed or fabricated.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Pill className="h-10 w-10 text-slate-400 mx-auto opacity-40 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Select a medicine from the left to view verified CDSCO data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
