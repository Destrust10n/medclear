export type AppLanguage = 'en' | 'hi';
export type AppTheme = 'light' | 'dark';
export type FontSize = 'normal' | 'large' | 'xlarge';
export type ExplainMode = 'simple' | 'steps' | 'summary';

export interface MedicalTermItem {
  term: string;
  meaning: string;
}

export interface ExplanationResult {
  simpleExplanation: string;
  mode: ExplainMode;
  importantInstructions: string[];
  medicalTermsExplained: MedicalTermItem[];
  detailsNeedingConfirmation: string[];
  questionsForDoctor: string[];
  safetyWarning?: string;
}

export interface ExplanationHistoryItem {
  id: string;
  timestamp: string;
  sourceSnippet: string;
  fullText: string;
  mode: ExplainMode;
  language: AppLanguage;
  result: ExplanationResult;
}

export interface UnclearIssue {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  sourceText: string;
  whyClarificationNeeded: string;
  recommendedNextStep: string;
  status: string;
}

export interface UnclearDetectorResult {
  hasIssues: boolean;
  overallSafetyAssessment: string;
  issues: UnclearIssue[];
  questionsToClarify: string[];
  disclaimer: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedInstruction?: string;
}

export interface QuizResult {
  questions: QuizQuestion[];
  reviewTopics: string[];
}

export interface VisitSummaryResult {
  title: string;
  visitDate: string;
  doctorOrClinic: string;
  mainPoints: string[];
  prescribedMedicationsOrCare: string[];
  testsMentioned: string[];
  followUpInstructions: string[];
  detailsNeedingConfirmation: string[];
  questionsForNextDoctorVisit: string[];
  emergencyNote: string;
}

export interface DictionaryTerm {
  id: string;
  termEn: string;
  termHi: string;
  pronunciation?: string;
  category: 'Prescription & Dosage' | 'Conditions & Symptoms' | 'Laboratory & Tests' | 'General Healthcare';
  meaningEn: string;
  meaningHi: string;
  exampleEn: string;
  exampleHi: string;
}

export interface PatientProfile {
  name: string;
  age: number;
  city: string;
  bloodGroup: string;
  emergencyContact: string;
}

export type TestResultStatus = 'within_range' | 'below_range' | 'above_range' | 'unable_to_assess';

export interface ReportItemResult {
  id: string;
  testName: string;
  measuredValue: string;
  numericValue?: number | null;
  unit: string;
  referenceRangeText: string;
  rangeMin?: number | null;
  rangeMax?: number | null;
  status: TestResultStatus;
  statusLabelEn: string;
  statusLabelHi: string;
  whatItMeans: string;
  educationalNote: string;
  uncertainties?: string[];
}

export interface MedicalReportAnalysis {
  reportTitle: string;
  patientInfo?: {
    name?: string;
    age?: string;
    gender?: string;
    sampleDate?: string;
    labName?: string;
  };
  summaryEn: string;
  summaryHi: string;
  testItems: ReportItemResult[];
  medicalTerms: MedicalTermItem[];
  overallUncertainties: string[];
  questionsForDoctor: string[];
  importantSafetyNotice: string;
}

export interface MedicineStrength {
  originalValue: string;
  amount: number | null;
  unit: 'mg' | 'mcg' | 'g' | 'mg/mL' | 'mcg/puff' | 'IU' | 'mOsm/L' | '%';
  normalizedString: string;
}

export interface MedicineEntry {
  id: string;
  genericName: string;
  genericNameHi: string;
  brandNamesIndia: string[];
  activeIngredients: string[];
  isCombination: boolean;
  combinationDetails?: string;
  strengths: MedicineStrength[];
  dosageForms: string[];
  therapeuticCategory: string;
  therapeuticCategoryHi: string;
  approvedIndications: string[];
  knownSideEffects: string[];
  seriousWarnings: string[];
  contraindications: string[];
  documentedInteractions: string[];
  storageInstructions: string;
  specialPopulationCautions: {
    pregnancyLactation: string;
    renalImpairment: string;
    hepaticImpairment: string;
    pediatricElderly: string;
  };
  sourceAuthority: string;
  sourceDocument: string;
  sourceUrl: string;
  verificationDate: string;
  approvalStatus: 'Approved & Essential in India' | 'Approved FDC in India' | 'Flagged for Clinical Review';
  unknownFields: string[];
  scienceData?: {
    pubchemCid?: number;
    molecularFormula?: string;
    canonicalSmiles?: string;
    structureImageUrl?: string;
  };
}

export interface DatabaseImportStats {
  totalSourceRecordsScanned: number;
  totalVerifiedRecords: number;
  duplicateRecordsDetected: number;
  flaggedUncertainRecords: number;
  importFailuresIdentified: number;
  sourcesUsed: {
    name: string;
    url: string;
    scope: string;
    status: 'Verified' | 'Accessible' | 'Partial';
  }[];
  lastPipelineRun: string;
}
