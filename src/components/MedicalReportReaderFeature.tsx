import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MedicalReportAnalysis, ReportItemResult, TestResultStatus } from '../types';
import { FICTIONAL_SAMPLE_REPORT } from '../data/mockData';
import {
  FileText,
  FileSpreadsheet,
  Upload,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Info,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  ChevronRight,
  FileCheck,
  Eye,
  Edit3,
  Search,
  Filter,
  FileUp,
  AlertCircle
} from 'lucide-react';

export const MedicalReportReaderFeature: React.FC = () => {
  const { language, speakText, isSpeaking, stopSpeaking, isAiAvailable, t } = useApp();
  const isHindi = language === 'hi';

  // Input states
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewName, setFilePreviewName] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Phase 1: Text extraction states
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [extractionMessage, setExtractionMessage] = useState<string>('');
  const [isEditingExtracted, setIsEditingExtracted] = useState<boolean>(false);

  // Phase 2: Report analysis states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<MedicalReportAnalysis | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'within' | 'outside' | 'uncertain'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // UI helpers
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clear / Reset All
  const handleReset = () => {
    stopSpeaking();
    setFile(null);
    setFilePreviewName('');
    setRawText('');
    setExtractedText('');
    setExtractionMessage('');
    setIsEditingExtracted(false);
    setAnalysisResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Load sample fictional report for judges / testing
  const handleLoadSampleReport = () => {
    stopSpeaking();
    setErrorMessage(null);
    setInputMode('paste');
    setRawText(FICTIONAL_SAMPLE_REPORT.text);
    setFile(null);
    setFilePreviewName('Apex_Comprehensive_Blood_Panel_Demo.txt');
    // Preload extracted text so the user can immediately review or analyze
    setExtractedText(FICTIONAL_SAMPLE_REPORT.text);
    setExtractionMessage(
      isHindi
        ? 'काल्पनिक नमूना रिपोर्ट लोड हो गई। आप नीचे निकाले गए टेक्स्ट की समीक्षा कर सकते हैं या सीधे विश्लेषण शुरू कर सकते हैं।'
        : 'Fictional sample lab report loaded. You can review the extracted text below or proceed directly to analysis.'
    );
  };

  // File selection & drop handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const processSelectedFile = (selectedFile: File) => {
    setErrorMessage(null);
    // Allowed file types
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.txt')) {
      setErrorMessage(
        isHindi
          ? 'अमान्य फ़ाइल प्रकार। केवल PNG, JPG, JPEG, WEBP, PDF या TXT फ़ाइलें समर्थित हैं।'
          : 'Invalid file format. Only PNG, JPG, JPEG, WEBP, PDF, and TXT files are supported.'
      );
      return;
    }

    // Size limit: 8MB
    if (selectedFile.size > 8 * 1024 * 1024) {
      setErrorMessage(
        isHindi
          ? 'फ़ाइल का आकार 8MB से अधिक है। कृपया एक छोटी फ़ाइल चुनें या टेक्स्ट को सीधे पेस्ट करें।'
          : 'File size exceeds 8MB. Please select a smaller document or paste the text directly.'
      );
      return;
    }

    setFile(selectedFile);
    setFilePreviewName(selectedFile.name);
  };

  // Step 1: Extract Text & Numbers from file or pasted text
  const handleExtractText = async () => {
    stopSpeaking();
    setErrorMessage(null);

    if (inputMode === 'paste' && !rawText.trim()) {
      setErrorMessage(
        isHindi ? 'कृपया विश्लेषण के लिए रिपोर्ट का टेक्स्ट पेस्ट करें।' : 'Please paste the report text to extract.'
      );
      return;
    }

    if (inputMode === 'upload' && !file) {
      setErrorMessage(
        isHindi ? 'कृपया एक रिपोर्ट फ़ाइल अपलोड करें या टेक्स्ट पेस्ट करें।' : 'Please upload a report file or paste text.'
      );
      return;
    }

    setIsExtracting(true);

    try {
      if (inputMode === 'paste') {
        const response = await fetch('/api/extract-report-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: rawText }),
        });
        const data = await response.json();
        if (data.success && data.extractedText) {
          setExtractedText(data.extractedText);
          setExtractionMessage(data.message || 'Text extracted successfully.');
        } else {
          throw new Error(data.error || 'Failed to extract text');
        }
      } else if (file) {
        // Read file as Base64 or plain text
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const textContent = (event.target?.result as string) || '';
            setExtractedText(textContent);
            setExtractionMessage(
              isHindi
                ? 'टेक्स्ट फ़ाइल सफलतापूर्वक पढ़ी गई। नीचे समीक्षा करें।'
                : 'Text document read successfully. Please review below.'
            );
            setIsExtracting(false);
          };
          reader.readAsText(file);
          return;
        } else {
          // Image or PDF
          const reader = new FileReader();
          reader.onload = async (event) => {
            const base64Data = (event.target?.result as string) || '';
            try {
              const response = await fetch('/api/extract-report-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  imageBase64: base64Data,
                  mimeType: file.type || 'image/jpeg',
                }),
              });
              const data = await response.json();
              if (data.success && data.extractedText) {
                setExtractedText(data.extractedText);
                setExtractionMessage(
                  data.message || (isHindi ? 'दस्तावेज़ से टेक्स्ट सफलतापूर्वक निकाला गया।' : 'Extracted successfully.')
                );
              } else {
                throw new Error(data.error || 'Extraction failed');
              }
            } catch (err: any) {
              setErrorMessage(err.message || 'Error processing document. Using text fallback.');
            } finally {
              setIsExtracting(false);
            }
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to extract report content.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Step 2: Run Deep Medical Report Analysis
  const handleAnalyzeReport = async () => {
    const textToAnalyze = extractedText.trim() || rawText.trim();
    if (!textToAnalyze) {
      setErrorMessage(
        isHindi ? 'विश्लेषण के लिए कोई रिपोर्ट टेक्स्ट उपलब्ध नहीं है।' : 'No report text available for analysis.'
      );
      return;
    }

    stopSpeaking();
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportText: textToAnalyze,
          language,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setAnalysisResult(data.data);
      } else {
        throw new Error(data.error || 'Failed to analyze report.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis could not be completed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Copy helper
  const handleCopyText = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyQuestion = (question: string, index: number) => {
    navigator.clipboard.writeText(question);
    setCopiedQuestionIdx(index);
    setTimeout(() => setCopiedQuestionIdx(null), 2000);
  };

  // Filter test items based on user selection & search
  const filteredItems = (analysisResult?.testItems || []).filter((item: ReportItemResult) => {
    const matchesSearch =
      item.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.whatItMeans.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'within') return item.status === 'within_range';
    if (statusFilter === 'outside') return item.status === 'below_range' || item.status === 'above_range';
    if (statusFilter === 'uncertain') return item.status === 'unable_to_assess';
    return true;
  });

  const withinCount = (analysisResult?.testItems || []).filter((i) => i.status === 'within_range').length;
  const outsideCount = (analysisResult?.testItems || []).filter(
    (i) => i.status === 'below_range' || i.status === 'above_range'
  ).length;
  const uncertainCount = (analysisResult?.testItems || []).filter((i) => i.status === 'unable_to_assess').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400 border border-teal-200/70 dark:border-teal-800">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {isHindi ? 'मेडिकल रिपोर्ट रीडर' : 'Medical Report Reader'}
                  </h1>
                  <span className="rounded-md bg-teal-100 dark:bg-teal-950 px-2 py-0.5 text-[10px] font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                    New Feature
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isHindi
                    ? 'लैब रिपोर्ट अपलोड या पेस्ट करें, संख्याओं की संदर्भ सीमाओं से तुलना करें और सरल भाषा में समझें।'
                    : 'Transcribe medical test reports, compare numerical values with reference ranges, and clarify terms.'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Demo & Reset Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleLoadSampleReport}
              className="flex items-center gap-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 px-3.5 py-2 text-xs font-bold text-teal-800 dark:text-teal-200 border border-teal-200/80 dark:border-teal-800 hover:bg-teal-100/80 transition-colors shadow-sm"
              title="Load realistic fictional CBC & Metabolic Panel demonstration"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>{isHindi ? 'काल्पनिक डेमो रिपोर्ट लोड करें' : 'Load Demo Sample Report'}</span>
            </button>

            {(file || rawText || extractedText || analysisResult) && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{isHindi ? 'रीसेट' : 'Clear / Reset'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Prominent Educational Safety & Range Context Notice (Requirement 9 & Safety) */}
      <div className="rounded-2xl border-2 border-teal-500/30 bg-teal-50/70 p-4 sm:p-5 shadow-sm dark:border-teal-800/80 dark:bg-teal-950/30 space-y-2">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white shrink-0 mt-0.5">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-teal-950 dark:text-teal-200">
              {isHindi
                ? 'चिकित्सकीय समझ एवं सुरक्षा सिद्धांत (Clinical Context & Safety)'
                : 'Understanding Reference Ranges & Medical Safety'}
            </h3>
            <p className="text-xs text-teal-900/90 dark:text-teal-300/90 leading-relaxed font-normal">
              {isHindi ? (
                <>
                  <strong className="font-semibold">महत्वपूर्ण नियम:</strong> संदर्भ सीमा (Reference Range) से बाहर का मान
                  स्वतः किसी बीमारी का संकेत नहीं होता (पानी की मात्रा, तनाव, आहार, या लैब की मशीन का प्रभाव हो सकता है)। इसी
                  प्रकार, सीमा के भीतर का मान पूर्ण स्वास्थ्य की गारंटी नहीं देता। MedClear AI किसी बीमारी का निदान
                  (Diagnosis) नहीं करता और न ही दवाएं बदलता है। हमेशा अपने पंजीकृत डॉक्टर से परामर्श लें।
                </>
              ) : (
                <>
                  <strong className="font-semibold">Key Clinical Principle:</strong> A result outside a printed
                  reference range does <em>not</em> automatically signify a disease (factors like hydration, timing, diet,
                  or lab variance cause fluctuations). Likewise, a value inside range does <em>not</em> guarantee absolute
                  health. MedClear AI never diagnoses conditions, prescribes treatments, or recommends changing medicines.
                  Always review these results directly with your physician.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Input Section (Upload File or Paste Text) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white text-xs font-bold">
              1
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {isHindi ? 'रिपोर्ट दर्ज करें (फ़ाइल अथवा टेक्स्ट)' : 'Provide Medical Report (File or Text)'}
            </h2>
          </div>

          {/* Toggle between upload & paste */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-slate-700 shadow-sm self-start sm:self-auto">
            <button
              onClick={() => setInputMode('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                inputMode === 'upload'
                  ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{isHindi ? 'फ़ाइल अपलोड (Image / PDF)' : 'Upload Image / PDF'}</span>
            </button>
            <button
              onClick={() => setInputMode('paste')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                inputMode === 'paste'
                  ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{isHindi ? 'टेक्स्ट पेस्ट करें' : 'Paste Report Text'}</span>
            </button>
          </div>
        </div>

        {/* Upload Mode UI */}
        {inputMode === 'upload' && (
          <div className="space-y-3">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                dragActive
                  ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/30'
                  : 'border-slate-300 hover:border-teal-400 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300 mb-3 shadow-sm">
                <FileUp className="h-6 w-6" />
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 text-center">
                {isHindi ? 'रिपोर्ट फ़ाइल यहां खींचें या क्लिक करके चुनें' : 'Drag & drop report document here, or click to browse'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-1">
                {isHindi
                  ? 'समर्थित प्रारूप: PNG, JPEG, WEBP, PDF, TXT (अधिकतम 8MB)। मेडिकल डेटा केवल प्रक्रिया के लिए उपयोग होता है, संग्रहित नहीं होता।'
                  : 'Supported formats: PNG, JPEG, WEBP, PDF, TXT (Max 8MB). Processed securely and discarded immediately.'}
              </p>

              {filePreviewName && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-teal-50 dark:bg-teal-950/70 px-3.5 py-1.5 border border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-semibold shadow-sm">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  <span>{filePreviewName}</span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400">
                    ({file ? (file.size / 1024).toFixed(1) + ' KB' : ''})
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Paste Mode UI */}
        {inputMode === 'paste' && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {isHindi ? 'लैब रिपोर्ट का टेक्स्ट यहां पेस्ट करें:' : 'Paste Extracted or Digital Report Content:'}
            </label>
            <textarea
              rows={7}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={
                isHindi
                  ? "उदाहरण के लिए:\nAPEX DIAGNOSTICS - Blood Panel\nHemoglobin: 11.2 g/dL (Range: 13.0 - 17.0)\nFasting Blood Sugar: 142 mg/dL (Range: 70 - 99)\nPlatelet Count: 210,000 /mcL (Range: 150,000 - 450,000)..."
                  : "e.g.,\nAPEX DIAGNOSTICS & RESEARCH CENTRE\nHemoglobin (Hb): 11.2 g/dL (Ref: 13.0 - 17.0)\nFasting Blood Sugar: 142 mg/dL (Ref: 70 - 99)\nSerum Cholesterol: 218 mg/dL (Ref: < 200)\nSerum Creatinine: 0.95 mg/dL (Ref: 0.7 - 1.3)..."
              }
              className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 font-mono"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{rawText.length} characters</span>
              <button
                type="button"
                onClick={() => setRawText('')}
                className="text-slate-500 hover:text-rose-500 transition-colors"
              >
                {isHindi ? 'साफ करें' : 'Clear text'}
              </button>
            </div>
          </div>
        )}

        {/* Action Button: Extract & Review */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Info className="h-4 w-4 text-teal-600" />
            <span>
              {isHindi
                ? 'निकाला गया टेक्स्ट पहले समीक्षा के लिए प्रदर्शित किया जाएगा।'
                : 'Text will be presented for your verification before deep analysis.'}
            </span>
          </div>

          <button
            onClick={handleExtractText}
            disabled={isExtracting || (inputMode === 'upload' && !file) || (inputMode === 'paste' && !rawText.trim())}
            className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-all shadow-sm active:scale-95"
          >
            {isExtracting ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{isHindi ? 'टेक्स्ट निकाला जा रहा है...' : 'Extracting Document Text...'}</span>
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4" />
                <span>{isHindi ? 'टेक्स्ट निकालें एवं समीक्षा करें' : 'Extract & Review Report'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Callout */}
      {errorMessage && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-200 shadow-sm flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{isHindi ? 'सूचना / त्रुटि' : 'Notice / Error'}</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Step 2: Extracted Text Review & Adjustment (Requirement 5) */}
      {extractedText && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                2
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'निकाले गए टेक्स्ट की समीक्षा करें' : 'Review Extracted Report Content'}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {extractionMessage ||
                    (isHindi
                      ? 'कृपया जांचें कि सभी संख्याएं और टेस्ट नाम सही पढ़े गए हैं।'
                      : 'Verify test names, numerical values, and reference ranges before analysis.')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingExtracted(!isEditingExtracted)}
                className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
              >
                <Edit3 className="h-3.5 w-3.5 text-teal-600" />
                <span>{isEditingExtracted ? (isHindi ? 'संपादन बंद करें' : 'Done Editing') : (isHindi ? 'टेक्स्ट संपादित करें' : 'Edit Text')}</span>
              </button>

              <button
                onClick={() => handleCopyText(extractedText)}
                className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
              >
                {copiedText ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedText ? (isHindi ? 'कॉपी हो गया' : 'Copied!') : (isHindi ? 'कॉपी' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Textarea or Preformatted View */}
          {isEditingExtracted ? (
            <textarea
              rows={8}
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="w-full rounded-xl border border-teal-300 bg-teal-50/30 p-3.5 text-xs font-mono text-slate-800 dark:border-teal-700 dark:bg-slate-800/80 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-sm"
            />
          ) : (
            <div className="max-h-56 overflow-y-auto rounded-xl bg-slate-50/80 p-4 font-mono text-xs text-slate-800 dark:bg-slate-950/60 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 whitespace-pre-wrap shadow-sm">
              {extractedText}
            </div>
          )}

          {/* Analyze Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>
                {isHindi
                  ? 'टेक्स्ट सत्यापित होने के बाद "विश्लेषण शुरू करें" पर क्लिक करें।'
                  : 'Click below to compare with reference ranges & simplify medical terms.'}
              </span>
            </div>

            <button
              onClick={handleAnalyzeReport}
              disabled={isAnalyzing || !extractedText.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 px-6 py-2.5 text-xs sm:text-sm font-bold text-white transition-all shadow-md shadow-teal-700/20 active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{isHindi ? 'रिपोर्ट का विश्लेषण हो रहा है...' : 'Analyzing Medical Report...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-emerald-200" />
                  <span>{isHindi ? 'मेडिकल रिपोर्ट का विश्लेषण करें' : 'Analyze Medical Report'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Analysis Results Presentation */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Overview & Summary Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  {isHindi ? 'रिपोर्ट सारांश एवं अवलोकन' : 'Report Executive Summary'}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {analysisResult.reportTitle || 'Diagnostic Laboratory Report'}
                </h2>
                {analysisResult.patientInfo && (
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {analysisResult.patientInfo.name && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-medium">
                        Patient: {analysisResult.patientInfo.name}
                      </span>
                    )}
                    {analysisResult.patientInfo.age && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-medium">
                        Age: {analysisResult.patientInfo.age}
                      </span>
                    )}
                    {analysisResult.patientInfo.sampleDate && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-medium">
                        Date: {analysisResult.patientInfo.sampleDate}
                      </span>
                    )}
                    {analysisResult.patientInfo.labName && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-medium">
                        Lab: {analysisResult.patientInfo.labName}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Audio Readout & Print Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const textToRead = isHindi ? analysisResult.summaryHi : analysisResult.summaryEn;
                    speakText(textToRead);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 px-3.5 py-2 text-xs font-semibold text-teal-800 dark:text-teal-200 border border-teal-200/80 dark:border-teal-800 hover:bg-teal-100 transition-colors shadow-sm"
                  title="Read summary aloud"
                >
                  {isSpeaking ? (
                    <VolumeX className="h-4 w-4 text-rose-500 animate-pulse" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  )}
                  <span>{isSpeaking ? (isHindi ? 'आवाज रोकें' : 'Stop') : (isHindi ? 'सुनें' : 'Listen')}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="no-print flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                  title="Print report summary"
                >
                  <Printer className="h-4 w-4" />
                  <span>{isHindi ? 'प्रिंट' : 'Print'}</span>
                </button>
              </div>
            </div>

            {/* Plain language summary box */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/70 dark:border-slate-700 shadow-sm leading-relaxed text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              <p className="font-medium">{isHindi ? analysisResult.summaryHi : analysisResult.summaryEn}</p>
            </div>
          </div>

          {/* Numerical Results & Reference Range Comparison Table (Requirements 7 & 8) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{isHindi ? 'परीक्षण परिणाम एवं संदर्भ सीमा तुलना' : 'Test Results & Reference Range Comparison'}</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    ({analysisResult.testItems?.length || 0} tests)
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isHindi
                    ? 'प्रत्येक मान की उसकी संबंधित संदर्भ सीमा से तुलना, स्पष्ट स्थिति वर्गीकरण एवं सरल विवरण।'
                    : 'Numerical values evaluated against laboratory printed reference intervals with clinical educational notes.'}
                </p>
              </div>

              {/* Status Filters & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={isHindi ? 'टेस्ट खोजें...' : 'Filter tests...'}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm w-36 sm:w-44 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-semibold border border-slate-200/80 dark:border-slate-700 shadow-sm">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2 py-1 rounded-lg transition-all ${
                      statusFilter === 'all'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    All ({analysisResult.testItems?.length || 0})
                  </button>
                  <button
                    onClick={() => setStatusFilter('within')}
                    className={`px-2 py-1 rounded-lg transition-all ${
                      statusFilter === 'within'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    Within ({withinCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('outside')}
                    className={`px-2 py-1 rounded-lg transition-all ${
                      statusFilter === 'outside'
                        ? 'bg-amber-600 text-white font-bold shadow-xs'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    Outside ({outsideCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('uncertain')}
                    className={`px-2 py-1 rounded-lg transition-all ${
                      statusFilter === 'uncertain'
                        ? 'bg-slate-700 text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Uncertain ({uncertainCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Test Items Cards / Rows */}
            <div className="space-y-3">
              {filteredItems.map((item: ReportItemResult) => {
                const isWithin = item.status === 'within_range';
                const isAbove = item.status === 'above_range';
                const isBelow = item.status === 'below_range';
                const isUncertain = item.status === 'unable_to_assess';

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-4 transition-all shadow-sm ${
                      isWithin
                        ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/40 dark:bg-emerald-950/10'
                        : isAbove
                        ? 'border-amber-300 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/10'
                        : isBelow
                        ? 'border-blue-200 bg-blue-50/30 dark:border-blue-900/40 dark:bg-blue-950/10'
                        : 'border-slate-300 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Left: Test Name & What it means */}
                      <div className="space-y-1 lg:max-w-md">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.testName}</h4>
                          {item.uncertainties && item.uncertainties.length > 0 && (
                            <span className="rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 text-[10px] font-bold">
                              Uncertainty Flagged
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">{item.whatItMeans}</p>
                      </div>

                      {/* Middle: Numerical Value, Unit, Reference Range */}
                      <div className="flex items-center gap-4 sm:gap-6 bg-white dark:bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs self-start lg:self-center">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                            {isHindi ? 'मापा गया मान' : 'Result'}
                          </p>
                          <div className="flex items-baseline gap-1">
                            <span
                              className={`text-base font-extrabold ${
                                isWithin
                                  ? 'text-emerald-700 dark:text-emerald-300'
                                  : isAbove
                                  ? 'text-amber-700 dark:text-amber-300'
                                  : isBelow
                                  ? 'text-blue-700 dark:text-blue-300'
                                  : 'text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {item.measuredValue}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{item.unit}</span>
                          </div>
                        </div>

                        <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                            {isHindi ? 'संदर्भ सीमा' : 'Reference Range'}
                          </p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
                            {item.referenceRangeText || (isHindi ? 'दर्ज नहीं' : 'Not printed')}
                          </p>
                        </div>
                      </div>

                      {/* Right: Range Status Badge */}
                      <div className="shrink-0 self-start lg:self-center">
                        {isWithin && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1.5 text-xs font-bold shadow-2xs border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{isHindi ? item.statusLabelHi : item.statusLabelEn}</span>
                          </span>
                        )}

                        {isAbove && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 px-3 py-1.5 text-xs font-bold shadow-2xs border border-amber-300 dark:border-amber-800">
                            <ArrowUpRight className="h-3.5 w-3.5 text-amber-600" />
                            <span>{isHindi ? item.statusLabelHi : item.statusLabelEn}</span>
                          </span>
                        )}

                        {isBelow && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 px-3 py-1.5 text-xs font-bold shadow-2xs border border-blue-200 dark:border-blue-800">
                            <ArrowDownRight className="h-3.5 w-3.5 text-blue-600" />
                            <span>{isHindi ? item.statusLabelHi : item.statusLabelEn}</span>
                          </span>
                        )}

                        {isUncertain && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 px-3 py-1.5 text-xs font-bold shadow-2xs border border-slate-300 dark:border-slate-700">
                            <AlertTriangle className="h-3.5 w-3.5 text-slate-500" />
                            <span>{isHindi ? item.statusLabelHi : item.statusLabelEn}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Educational note on row */}
                    {item.educationalNote && (
                      <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                        <Info className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{item.educationalNote}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  {isHindi ? 'कोई मिलान टेस्ट नहीं मिला।' : 'No matching test investigations found.'}
                </div>
              )}
            </div>
          </div>

          {/* Highlighted Uncertainties & Missing Data Section (Requirement 10) */}
          {analysisResult.overallUncertainties && analysisResult.overallUncertainties.length > 0 && (
            <div className="rounded-2xl border-2 border-amber-400/50 bg-amber-50/50 p-5 shadow-sm dark:border-amber-800/70 dark:bg-amber-950/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <h3 className="text-sm font-bold">
                  {isHindi
                    ? 'अनिश्चितताएं, गायब इकाइयां एवं अस्पष्ट मान (Report Uncertainties & Missing Data)'
                    : 'Highlighted Uncertainties, Missing Units & Unreadable Values'}
                </h3>
              </div>

              <p className="text-xs text-amber-800 dark:text-amber-300">
                {isHindi
                  ? 'सख्त सुरक्षा नीति: यदि कोई मान धुंधला है या यूनिट/सीमा गायब है, तो MedClear AI कभी भी मनगढ़ंत संख्या नहीं भरता। निम्नलिखित बिंदुओं की पुष्टि लैब या डॉक्टर से करें:'
                  : 'Clinical Safety Protocol: When printed values are smudged, units are absent, or ranges are missing, MedClear AI strictly avoids guessing. Please clarify these specific points:'}
              </p>

              <div className="space-y-2 pt-1">
                {analysisResult.overallUncertainties.map((item: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-amber-200 dark:border-amber-800/60 shadow-sm text-xs text-slate-800 dark:text-slate-200"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 text-[11px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Terms Explained in Simple English / Hindi (Requirement 6) */}
          {analysisResult.medicalTerms && analysisResult.medicalTerms.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'मेडिकल शब्दों की सरल व्याख्या' : 'Medical Terms Explained in Plain Language'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isHindi
                    ? 'कठिन चिकित्सकीय शब्दावली का सरल 8वीं कक्षा के स्तर पर अर्थ।'
                    : 'Simple, understandable definitions of complex clinical terms found in this report.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysisResult.medicalTerms.map((termItem, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 shadow-sm space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-teal-500"></span>
                      <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200">{termItem.term}</h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-4">
                      {termItem.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions to Ask Your Doctor (Requirement 11) */}
          {analysisResult.questionsForDoctor && analysisResult.questionsForDoctor.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {isHindi ? 'डॉक्टर से पूछने योग्य उपयोगी प्रश्न' : 'High-Value Questions to Ask Your Doctor'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isHindi
                      ? 'अपनी अगली क्लिनिक यात्रा के लिए इन प्रश्नों को नोट करें या कॉपी करें।'
                      : 'Take these personalized questions to your doctor to guide your consultation.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    const allQ = analysisResult.questionsForDoctor.map((q, i) => `${i + 1}. ${q}`).join('\n');
                    handleCopyText(allQ);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 px-3 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 transition-colors shadow-sm self-start sm:self-auto"
                >
                  {copiedText ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedText ? (isHindi ? 'सभी कॉपी हो गए!' : 'All Copied!') : (isHindi ? 'सभी प्रश्न कॉपी करें' : 'Copy All Questions')}</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {analysisResult.questionsForDoctor.map((question: string, index: number) => {
                  const isCopied = copiedQuestionIdx === index;
                  return (
                    <div
                      key={index}
                      className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 shadow-sm"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 text-[11px] font-bold shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          {question}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCopyQuestion(question, index)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors shrink-0"
                        title="Copy question"
                      >
                        {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Final Medical Safety Notice Card */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 p-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2.5 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />
            <span>
              {analysisResult.importantSafetyNotice ||
                (isHindi
                  ? 'MedClear AI केवल स्वास्थ्य संचार एवं शिक्षा सहायक है। यह डॉक्टर या निदान का विकल्प नहीं है।'
                  : 'MedClear AI is an educational communication assistant. It does not replace medical consultation.')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
