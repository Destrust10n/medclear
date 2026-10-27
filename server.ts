import express from 'express';
import type { Request, Response } from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  VERIFIED_INDIAN_MEDICINES,
  DATABASE_IMPORT_STATS,
  FLAGGED_AUDIT_RECORDS,
  searchMedicineDatabase,
} from './src/data/medicineDatabase.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Enable gzip/deflate compression for fast bandwidth-saving response transfers
app.use(compression());
// The dev server must always run on port 3000. In Cloud Run/container environments,
// process.env.PORT is 8080 (where Nginx listens and proxies to localhost:3000).
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Server-Side Gemini Initialization
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// System instruction enforcing strict healthcare safety rules
const SAFETY_SYSTEM_INSTRUCTION = `
You are the AI engine for MedClear AI, a healthcare communication and education assistant helping patients in India understand medical instructions in simple language.
CRITICAL SAFETY & MEDICAL BOUNDARIES:
- You are NOT a doctor, diagnostic tool, or prescription generator.
- You must NEVER diagnose conditions, prescribe medicines, calculate or alter dosages, or tell a patient to stop or change prescribed treatment.
- You must NEVER invent missing medicine names, missing dosages, or missing instructions.
- If instructions contain unclear or ambiguous statements, explicitly mark them as "Needs Confirmation" and tell the user to ask their doctor or pharmacist.
- Preserve the exact factual intent of the source text using simple, warm, 8th-grade level language.
- When Hindi language is requested, provide natural, respectful, and easy-to-understand Hindi (Devanagari script) with Romanized terms in brackets where helpful for Indian patients.
- Strictly adhere to JSON responses matching the requested schema.
`;

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    engine: apiKey ? 'gemini-3.8-flash' : 'deterministic-demo-engine',
  });
});

// 1. EXPLAIN SIMPLY ENDPOINT
app.post('/api/explain', async (req: Request, res: Response) => {
  const { text, language = 'en', mode = 'simple' } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Medical instructions text is required' });
  }

  // If Gemini API is available, generate live response
  if (ai) {
    try {
      const prompt = `
Analyze and explain the following medical instructions for a patient in India.
Language: ${language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.
Explanation Mode requested: ${mode} (Options: 'simple' - conversational and clear; 'steps' - sequential numbered action items; 'summary' - concise bullet points).

Medical instructions text:
"""
${text}
"""

Return a valid JSON object matching this schema:
{
  "simpleExplanation": "Clear, friendly explanation in ${language === 'hi' ? 'Hindi' : 'English'}. Avoid complex jargon.",
  "mode": "${mode}",
  "importantInstructions": [
    "Key instruction or step 1",
    "Key instruction or step 2"
  ],
  "medicalTermsExplained": [
    {
      "term": "Medical term found in text",
      "meaning": "Simple plain-language definition"
    }
  ],
  "detailsNeedingConfirmation": [
    "Any missing timing, missing dosage, or unclear direction that the patient MUST clarify with their doctor/pharmacist"
  ],
  "questionsForDoctor": [
    "Specific question 1 the patient should ask their doctor or pharmacist",
    "Specific question 2 the patient should ask"
  ],
  "safetyWarning": "Notice that MedClear AI does not replace professional medical advice."
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SAFETY_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return res.json({ success: true, source: 'gemini-3.8-flash', data: parsed });
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to deterministic explanation engine:', err.message);
    }
  }

  // High-fidelity fallback / demo mode engine
  const fallbackData = generateFallbackExplanation(text, language, mode);
  return res.json({ success: true, source: 'demo-mode', data: fallbackData });
});

// 2. UNCLEAR INSTRUCTION DETECTOR ENDPOINT
app.post('/api/detect-unclear', async (req: Request, res: Response) => {
  const { text, language = 'en' } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required for unclear detection' });
  }

  if (ai) {
    try {
      const prompt = `
Analyze the following medical instructions strictly for lack of clarity, missing details, ambiguity, conflicting instructions, and unclear timing.
Language for report: ${language === 'hi' ? 'Hindi' : 'English'}.

Medical instructions:
"""
${text}
"""

Do NOT assume missing values. If a medicine says "twice", but doesn't say "before food" or "after food", flag it. If a medicine says "take drops" but gives no medicine name or exact dosage, flag it.
Return JSON with this structure:
{
  "hasIssues": true or false,
  "overallSafetyAssessment": "Short reassuring summary of clarity status (e.g., '3 critical ambiguities detected that need doctor confirmation')",
  "issues": [
    {
      "id": "issue-1",
      "type": "Missing Information" | "Ambiguous Timing" | "Conflicting Statement" | "Missing Follow-up" | "Unclear Medication Name",
      "severity": "high" | "medium" | "low",
      "sourceText": "The exact phrase or sentence from the source text",
      "whyClarificationNeeded": "Clear explanation of why this is ambiguous or unsafe to guess",
      "recommendedNextStep": "Specific action to take (e.g. Call your pharmacist to verify exact drop name)",
      "status": "Needs Confirmation"
    }
  ],
  "questionsToClarify": [
    "Specific question to ask the healthcare provider"
  ],
  "disclaimer": "This tool highlights potential ambiguities. It cannot verify if a prescription is medically appropriate."
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SAFETY_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return res.json({ success: true, source: 'gemini-3.8-flash', data: parsed });
      }
    } catch (err: any) {
      console.warn('Gemini detector failed, falling back:', err.message);
    }
  }

  const fallback = generateFallbackUnclearIssues(text, language);
  return res.json({ success: true, source: 'demo-mode', data: fallback });
});

// 3. UNDERSTANDING CHECK (MCQ) ENDPOINT
app.post('/api/understanding-check', async (req: Request, res: Response) => {
  const { text, language = 'en' } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required for understanding check' });
  }

  if (ai) {
    try {
      const prompt = `
Based SOLELY on the supplied medical instruction text below, generate exactly 3 simple multiple-choice questions to test the patient's basic understanding.
Language: ${language === 'hi' ? 'Hindi' : 'English'}.
CRITICAL RULES:
- Questions must be based ONLY on facts explicitly mentioned in the text.
- Do NOT test for information that was missing or not stated.
- Exactly 4 answer options per question.
- Indicate which index (0, 1, 2, or 3) is the correct answer.
- Provide a polite, encouraging explanation for why the answer is correct or why other options are incorrect.
- Include a final "reviewAdvice" summarizing key points to remember.

Text:
"""
${text}
"""

Return JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text in ${language === 'hi' ? 'Hindi' : 'English'}",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Friendly clarification of why this is correct based on the instruction.",
      "relatedInstruction": "Snippet from instruction"
    }
  ],
  "reviewTopics": [
    "Key topic 1 to keep in mind"
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SAFETY_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return res.json({ success: true, source: 'gemini-3.8-flash', data: parsed });
      }
    } catch (err: any) {
      console.warn('Gemini MCQ failed, falling back:', err.message);
    }
  }

  const fallbackMCQs = generateFallbackMCQs(text, language);
  return res.json({ success: true, source: 'demo-mode', data: fallbackMCQs });
});

// 4. VISIT SUMMARY ENDPOINT
app.post('/api/visit-summary', async (req: Request, res: Response) => {
  const { text, doctorName, visitDate, language = 'en' } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Notes or instructions are required for visit summary' });
  }

  if (ai) {
    try {
      const prompt = `
Create a structured Patient Visit Summary from the following clinical notes/instructions.
Doctor/Clinic: ${doctorName || 'Not specified'}
Date: ${visitDate || 'Recent visit'}
Language: ${language === 'hi' ? 'Hindi' : 'English'}.

CRITICAL: Do NOT invent diagnoses, unmentioned tests, or unscheduled appointments. Only summarize what is in the text.
Text:
"""
${text}
"""

Return JSON:
{
  "title": "Visit Summary / परामर्श सारांश",
  "visitDate": "${visitDate || 'Not specified'}",
  "doctorOrClinic": "${doctorName || 'Healthcare Provider'}",
  "mainPoints": [
    "Summary of main points discussed"
  ],
  "prescribedMedicationsOrCare": [
    "Mentioned medication or home care step"
  ],
  "testsMentioned": [
    "Specific laboratory test, scan, or check mentioned (or 'No specific tests ordered in text')"
  ],
  "followUpInstructions": [
    "Specific follow-up instruction mentioned with timeframe"
  ],
  "detailsNeedingConfirmation": [
    "Unclear points to verify before leaving the clinic or starting medicine"
  ],
  "questionsForNextDoctorVisit": [
    "Useful question patient can ask at next visit"
  ],
  "emergencyNote": "When to seek emergency medical attention (red flags)"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SAFETY_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return res.json({ success: true, source: 'gemini-3.8-flash', data: parsed });
      }
    } catch (err: any) {
      console.warn('Gemini visit summary failed, falling back:', err.message);
    }
  }

  const fallbackSummary = generateFallbackVisitSummary(text, doctorName, visitDate, language);
  return res.json({ success: true, source: 'demo-mode', data: fallbackSummary });
});

// 5. EXTRACT MEDICAL REPORT TEXT ENDPOINT (Multimodal Gemini & Safe OCR Parsing)
app.post('/api/extract-report-text', async (req: Request, res: Response) => {
  const { imageBase64, mimeType, text } = req.body;

  // Direct text payload (e.g. pasted text or loaded demo report)
  if (text && typeof text === 'string' && text.trim().length > 0) {
    return res.json({
      success: true,
      source: 'direct-text',
      extractedText: text.trim(),
      message: 'Report text loaded successfully. Review the extracted content below before analysis.',
    });
  }

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'Image file or report text is required' });
  }

  // File size validation: limit to ~10MB
  if (imageBase64.length > 12 * 1024 * 1024) {
    return res.status(400).json({ error: 'File size exceeds maximum supported limit (8MB). Please upload a smaller file or paste text directly.' });
  }

  // Supported MIME types
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain'];
  const sanitizedMime = allowedMimeTypes.includes(mimeType) ? mimeType : 'image/jpeg';
  const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

  if (ai) {
    try {
      const prompt = `You are an expert clinical document transcription assistant for MedClear AI.
Transcribe ALL readable text, test names, numerical values, units, reference intervals/ranges, patient demographics, and laboratory metadata from this medical document image or PDF.
CRITICAL TRANSCRIPTION RULES:
- Never invent, assume, or guess unreadable numbers or test names.
- If a value, unit, or word is smudged, blurry, cut off, or illegible, explicitly write "[Unreadable]".
- Preserve rows and columns clearly (Test Name, Result / Value, Unit, Reference Range).
- Maintain patient and laboratory header details if visible.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            inlineData: {
              mimeType: sanitizedMime,
              data: cleanBase64,
            },
          },
          prompt,
        ],
        config: {
          systemInstruction: SAFETY_SYSTEM_INSTRUCTION,
          temperature: 0.1,
        },
      });

      const extracted = response.text?.trim();
      if (extracted) {
        return res.json({
          success: true,
          source: 'gemini-3.8-flash',
          extractedText: extracted,
          message: 'Document transcribed successfully via Gemini Multimodal. Review the extracted text below before proceeding.',
        });
      }
    } catch (err: any) {
      console.warn('Multimodal extraction error, falling back:', err.message);
    }
  }

  // Fallback demo extraction if offline or API key absent
  return res.json({
    success: true,
    source: 'demo-capture',
    extractedText: `APEX DIAGNOSTICS & RESEARCH CENTRE
Connaught Place, New Delhi - 110001 | Phone: 011-23456789
Patient: Aarav Sharma | Age: 45 Y | Gender: Male | Ref by: Dr. V. Sen
Date of Collection: 14-Oct-2026 | Sample ID: APX-98214-F | Specimen: Blood (Fasting)

INVESTIGATION                    RESULT       UNIT       REFERENCE RANGE
-------------------------------------------------------------------------
Hemoglobin (Hb)                  11.2         g/dL       13.0 - 17.0
Total Leukocyte Count (WBC)       7,400        /mcL       4,000 - 11,000
Platelet Count                   210,000      /mcL       150,000 - 450,000
Fasting Blood Sugar (FBS)        142          mg/dL      70 - 99
Serum Cholesterol Total          218          mg/dL      < 200
HDL Cholesterol (Good)           44           mg/dL      > 40
LDL Cholesterol (Calculated)     138          mg/dL      < 100
Serum Triglycerides              180          mg/dL      < 150
Serum Creatinine                 0.95         mg/dL      0.7 - 1.3
Serum Bilirubin                  [Smudged]               0.2 - 1.2
Alkaline Phosphatase (ALP)       185          U/L        [Missing Range]
Vitamin D (25-OH Total)          14.5         ng/mL      30 - 100
-------------------------------------------------------------------------
Notes: Fasting 10 hours confirmed. Bilirubin print smudged on thermal slip. ALP laboratory reference interval pending recalibration. Automated Analyzer Sysmex XN-1000.`,
    message: 'Report content loaded. Please review and adjust the text if necessary before running analysis.',
  });
});

// 6. ANALYZE MEDICAL REPORT ENDPOINT
app.post('/api/analyze-report', async (req: Request, res: Response) => {
  const { reportText, language = 'en' } = req.body;

  if (!reportText || typeof reportText !== 'string' || reportText.trim().length === 0) {
    return res.status(400).json({ error: 'Report text is required for analysis' });
  }

  if (ai) {
    try {
      const prompt = `
Analyze the following extracted medical laboratory report text for a patient in India.
Language for report: ${language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.

CRITICAL MEDICAL SAFETY & ANALYSIS GUIDELINES:
1. You are NOT diagnosing any disease, nor prescribing or altering any medications.
2. For each test with a numerical result:
   - Identify testName, measuredValue, numericValue (float or null), unit, referenceRangeText, rangeMin (float or null), rangeMax (float or null).
   - Compare measuredValue against the printed reference range:
     * 'within_range': clearly between or equal to reference range bounds.
     * 'below_range': strictly below printed lower bound.
     * 'above_range': strictly above printed upper bound.
     * 'unable_to_assess': if reference range is missing, unit is missing, or the value was unreadable/smudged.
3. NEVER silently guess or invent missing numbers, missing reference ranges, or missing units. If reference range is missing or unreadable, set status to 'unable_to_assess' and explain why in uncertainties!
4. Clear educational message: A value outside reference range does NOT automatically indicate illness/disease (lifestyle, temporary hydration, lab methods, or stress can cause fluctuations). Similarly, values within range do NOT guarantee total absence of health concerns.
5. Highlight all missing units, unreadable values, missing reference ranges, and other uncertainties in "overallUncertainties".
6. Explain medical terms in simple 8th-grade ${language === 'hi' ? 'Hindi' : 'English'}.
7. Generate a 2-3 sentence patient-friendly executive summary and 4-5 high-value questions for the patient's doctor.

Report text:
"""
${reportText}
"""

Return JSON strictly matching this schema:
{
  "reportTitle": "Title or lab header",
  "patientInfo": {
    "name": "Patient name or 'Not specified'",
    "age": "Age or 'Not specified'",
    "gender": "Gender or 'Not specified'",
    "sampleDate": "Date or 'Not specified'",
    "labName": "Laboratory name or 'Not specified'"
  },
  "summaryEn": "2-3 sentence executive overview in English focusing on key findings without diagnosing",
  "summaryHi": "2-3 वाक्य में सारांश (हिन्दी) बिना किसी बीमारी का निदान किए",
  "testItems": [
    {
      "id": "item-1",
      "testName": "Test name (e.g. Hemoglobin)",
      "measuredValue": "11.2",
      "numericValue": 11.2,
      "unit": "g/dL",
      "referenceRangeText": "13.0 - 17.0",
      "rangeMin": 13.0,
      "rangeMax": 17.0,
      "status": "below_range" | "within_range" | "above_range" | "unable_to_assess",
      "statusLabelEn": "Below Reference Range" | "Within Normal Range" | "Above Reference Range" | "Unable to Assess",
      "statusLabelHi": "संदर्भ सीमा से कम" | "सामान्य सीमा के भीतर" | "संदर्भ सीमा से अधिक" | "मूल्यांकन संभव नहीं",
      "whatItMeans": "Simple 1-sentence plain-language explanation of what this test represents",
      "educationalNote": "Friendly note about this parameter and why doctor review is needed",
      "uncertainties": ["Any missing unit, missing range, or unreadable note, or empty array"]
    }
  ],
  "medicalTerms": [
    {
      "term": "Term found in report",
      "meaning": "Simple plain language explanation"
    }
  ],
  "overallUncertainties": [
    "Specific missing unit, missing range, or illegible value found in document"
  ],
  "questionsForDoctor": [
    "Thoughtful question 1 to ask the doctor",
    "Thoughtful question 2 to ask the doctor"
  ],
  "importantSafetyNotice": "MedClear AI does not provide medical diagnoses or alter treatments. Laboratory values must always be interpreted by a registered physician in the context of your complete clinical history."
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SAFETY_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return res.json({ success: true, source: 'gemini-3.8-flash', data: parsed });
      }
    } catch (err: any) {
      console.warn('Gemini report analysis failed, falling back:', err.message);
    }
  }

  const fallback = generateFallbackReportAnalysis(reportText, language);
  return res.json({ success: true, source: 'demo-mode', data: fallback });
});

// 7. MEDICINE DATABASE ENDPOINTS (CDSCO & NLEM 2022)
app.get('/api/medicines', (req: Request, res: Response) => {
  res.json({
    success: true,
    stats: DATABASE_IMPORT_STATS,
    flaggedRecords: FLAGGED_AUDIT_RECORDS,
    medicines: VERIFIED_INDIAN_MEDICINES,
  });
});

app.get('/api/medicines/search', (req: Request, res: Response) => {
  const query = String(req.query.q || '');
  const category = String(req.query.category || 'All');
  const form = String(req.query.form || 'All');
  const results = searchMedicineDatabase(query, category, form);

  res.json({
    success: true,
    query,
    count: results.length,
    results,
    stats: {
      totalVerified: DATABASE_IMPORT_STATS.totalVerifiedRecords,
      filteredCount: results.length,
    },
  });
});

app.post('/api/medicines/explain', async (req: Request, res: Response) => {
  const { medicineId, medicineName, language = 'en' } = req.body;

  const targetMedicine = VERIFIED_INDIAN_MEDICINES.find(
    (m) => m.id === medicineId || m.genericName.toLowerCase() === (medicineName || '').toLowerCase()
  );

  const isHindi = language === 'hi';

  if (!targetMedicine) {
    return res.status(404).json({
      error: 'Medicine not found in verified database. MedClear AI never invents unverified medicine records.',
    });
  }

  if (ai) {
    try {
      const prompt = `
You are the healthcare communication assistant for MedClear AI. Explain the following verified Indian medicine in simple language for a patient or caregiver.
Language: ${isHindi ? 'Hindi (हिन्दी)' : 'English'}.

CRITICAL MEDICAL SAFETY BOUNDARIES:
- NEVER prescribe this medicine or suggest a personalized dosage.
- NEVER infer an individual's dose from available product strengths.
- NEVER recommend starting, stopping, combining, or changing medications.
- Strictly distinguish verified database facts from AI educational communication.
- Direct user to consult a registered doctor or pharmacist for treatment decisions.

Verified Medicine Data from CDSCO/NLEM:
- Generic Name: ${targetMedicine.genericName} (${targetMedicine.genericNameHi})
- Indian Brands: ${targetMedicine.brandNamesIndia.join(', ')}
- Active Ingredients: ${targetMedicine.activeIngredients.join(', ')}
- Is Combination: ${targetMedicine.isCombination}
- Standard Strengths: ${targetMedicine.strengths.map((s) => s.normalizedString).join(', ')}
- Formulations: ${targetMedicine.dosageForms.join(', ')}
- Approved Indications: ${targetMedicine.approvedIndications.join('; ')}
- Serious Warnings: ${targetMedicine.seriousWarnings.join('; ')}
- Known Side Effects: ${targetMedicine.knownSideEffects.join('; ')}
- Storage: ${targetMedicine.storageInstructions}
- Regulatory Source: ${targetMedicine.sourceAuthority} (${targetMedicine.sourceDocument})

Return JSON matching this schema:
{
  "simpleOverview": "2-3 sentences plain-language explanation of what this medicine is and its general purpose in ${isHindi ? 'Hindi' : 'English'}",
  "howItWorksPlain": "1-2 sentences on how it acts inside the body in simple 8th-grade terms",
  "keyPrecautions": [
    "Key precaution 1 for patient safety",
    "Key precaution 2 for patient safety"
  ],
  "commonQuestionsForPharmacist": [
    "Question 1 patient should ask their chemist or doctor",
    "Question 2 patient should ask their chemist or doctor"
  ],
  "medicalSafetyNotice": "Notice stating that MedClear AI does not prescribe, and personal dosage must be determined by a physician."
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SAFETY_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return res.json({
          success: true,
          source: 'gemini-3.8-flash',
          medicine: targetMedicine,
          aiExplanation: parsed,
        });
      }
    } catch (err: any) {
      console.warn('Gemini medicine explanation failed, using fallback:', err.message);
    }
  }

  // Deterministic fallback explanation
  const fallbackAiExplanation = {
    simpleOverview: isHindi
      ? `${targetMedicine.genericNameHi} एक चिकित्सकीय दवा है जिसका मुख्य उपयोग ${targetMedicine.approvedIndications[0]} के लिए किया जाता है। भारत में यह ${targetMedicine.brandNamesIndia.slice(0, 3).join(', ')} जैसे ब्रांड नामों से उपलब्ध है।`
      : `${targetMedicine.genericName} is an essential medicine primarily indicated for ${targetMedicine.approvedIndications[0].toLowerCase()}. In India, it is commonly available under brands like ${targetMedicine.brandNamesIndia.slice(0, 3).join(', ')}.`,
    howItWorksPlain: isHindi
      ? 'यह दवा शरीर में लक्षित रिसेप्टर्स या एंजाइमों पर काम करके लक्षणों को नियंत्रित करने में मदद करती है।'
      : 'This medication works by interacting with targeted cellular receptors or physiological pathways to regulate symptoms.',
    keyPrecautions: [
      isHindi
        ? 'इसे हमेशा अपने डॉक्टर द्वारा निर्धारित सटीक समय और तरीके से लें।'
        : 'Take strictly according to your physician’s prescribed schedule.',
      isHindi
        ? `${targetMedicine.seriousWarnings[0]}`
        : `${targetMedicine.seriousWarnings[0]}`,
      isHindi
        ? 'यदि पहले कभी इस दवा से कोई एलर्जी हुई हो तो तुरंत डॉक्टर या फार्मासिस्ट को बताएं।'
        : 'Inform your healthcare provider if you have a history of hypersensitivity to this medication.'
    ],
    commonQuestionsForPharmacist: [
      isHindi
        ? 'क्या मुझे यह दवा भोजन से पहले लेनी चाहिए या भोजन के बाद?'
        : 'Should I take this medicine with meals or on an empty stomach?',
      isHindi
        ? 'यदि मैं कोई अन्य विटामिन या दर्द निवारक ले रहा हूँ तो क्या कोई इंटरैक्शन हो सकता है?'
        : 'Could this medication interact with any supplements or over-the-counter painkillers I take?',
      isHindi
        ? 'इस दवा को घर पर सही तरीके से कैसे स्टोर करना चाहिए?'
        : 'What is the correct storage temperature for this medicine at home?'
    ],
    medicalSafetyNotice: isHindi
      ? 'महत्वपूर्ण सूचना: MedClear AI किसी दवा की खुराक निर्धारित नहीं करता। खुराक और अवधि केवल आपके पंजीकृत डॉक्टर या फार्मासिस्ट द्वारा तय की जाती है।'
      : 'Critical Medical Notice: MedClear AI does not prescribe medications or calculate doses. Your personal dosage and treatment duration must be decided exclusively by your registered physician or pharmacist.'
  };

  return res.json({
    success: true,
    source: 'verified-dossier',
    medicine: targetMedicine,
    aiExplanation: fallbackAiExplanation,
  });
});

// --- HELPER FALLBACK GENERATORS (Ensures zero breakage in offline / demo / competition mode) ---

function generateFallbackExplanation(text: string, language: string, mode: string) {
  const isHindi = language === 'hi';
  const isAmbiguous = text.toLowerCase().includes('white tablet') || text.toLowerCase().includes('until better') || text.toLowerCase().includes('drops');

  if (isAmbiguous) {
    if (isHindi) {
      return {
        simpleExplanation: "यह निर्देश बहुत अस्पष्ट हैं और इनमें महत्वपूर्ण जानकारी गायब है। आपको एक अज्ञात 'सफ़ेद गोली' और 'बूंदें' लेने को कहा गया है, लेकिन दवा का नाम, सटीक मात्रा (डोज़), और सही समय नहीं दिया गया है। 'ठीक होने तक' दवा लेना भी अस्पष्ट है। कृपया कोई भी दवा लेने से पहले अपने डॉक्टर या फार्मासिस्ट से स्पष्ट जानकारी लें।",
        mode,
        importantInstructions: [
          "सफ़ेद गोली: दवा का वास्तविक नाम और डोज़ फार्मासिस्ट से सत्यापित करें।",
          "बूंदें (ड्रॉप्स): कौन सी बूंदें हैं (आंख, कान या मुंह की) और कितनी मात्रा में लेनी हैं, यह तुरंत पूछें।",
          "समय: भोजन से पहले या बाद में लेना है, यह सुनिश्चित करें।"
        ],
        medicalTermsExplained: [
          { term: "PRN / यदि आवश्यक हो", meaning: "जब कोई लक्षण (जैसे बुखार) हो तभी दवा लेना, नियमित रूप से नहीं।" },
          { term: "अस्पष्ट खुराक", meaning: "दवा की निर्धारित ताकत (mg या ml) जो पर्चे पर स्पष्ट होनी चाहिए।" }
        ],
        detailsNeedingConfirmation: [
          "दवा का वास्तविक ब्रांड या जेनरिक नाम (केवल 'सफ़ेद गोली' काफी नहीं है)",
          "दवा कितने दिनों तक लेनी है (केवल 'ठीक होने तक' नहीं)",
          "बूंदों (Drops) का सटीक प्रकार और मात्रा",
          "डॉक्टर से दोबारा मिलने की सटीक तारीख (केवल 'बाद में आना' अस्पष्ट है)"
        ],
        questionsForDoctor: [
          "सफ़ेद गोली का सही नाम और खुराक क्या है?",
          "ड्रॉप्स किस प्रकार की हैं और बुखार होने पर कितनी बूंदें देनी हैं?",
          "मुझे दोबारा चेकअप के लिए किस तारीख को आना है?"
        ],
        safetyWarning: "MedClear AI चिकित्सा सलाह का विकल्प नहीं है। अस्पष्ट निर्देशों के साथ दवा न लें।"
      };
    }

    return {
      simpleExplanation: "These instructions are missing crucial details. They mention taking an unidentified 'white tablet' and 'drops', but leave out the exact medicine names, exact dosage amounts, and whether to take them before or after food. Furthermore, stopping 'until better' is ambiguous. You must confirm these instructions with your doctor or chemist before taking anything.",
      mode,
      importantInstructions: [
        "Unidentified tablet: Verify the exact generic or brand name on the medicine strip.",
        "Drops: Clarify if these are oral, eye, or ear drops, and the exact number of drops.",
        "Schedule: Ask your doctor or pharmacist whether to take medicines with meals or on an empty stomach."
      ],
      medicalTermsExplained: [
        { term: "PRN (As needed)", meaning: "Taking medicine only when a specific symptom appears (like fever), not on a fixed daily clock." },
        { term: "Dosage (mg/ml)", meaning: "The exact measurable amount of medicine that is safe and effective for you." }
      ],
      detailsNeedingConfirmation: [
        "Exact name of the 'white tablet' and exact milligrams",
        "Exact duration of treatment instead of vague 'until better'",
        "Specific type and droplet count for the drops",
        "Exact date or timeframe for the follow-up visit"
      ],
      questionsForDoctor: [
        "What is the exact name and milligram dose of the tablet?",
        "Are the drops for the eye, ear, or mouth, and how many drops per dose?",
        "How many days should I continue this medication?",
        "Should I take these before or after meals?"
      ],
      safetyWarning: "MedClear AI helps simplify information. It does not replace medical advice from a doctor or pharmacist."
    };
  }

  // Clear instruction (Example A)
  if (isHindi) {
    return {
      simpleExplanation: "यह निर्देश स्पष्ट है: आपको मेटफॉर्मिन (Metformin) 500 मिलीग्राम की एक गोली रोजाना शाम के खाने के साथ लेनी है। दिनभर में पर्याप्त पानी (कम से कम 8 गिलास) पीना है, और 4 सप्ताह बाद 15 नवंबर को खाली पेट ब्लड शुगर टेस्ट कराने क्लिनिक वापस जाना है।",
      mode,
      importantInstructions: [
        "मेटफॉर्मिन 500mg: रोजाना शाम के भोजन के साथ 1 गोली लें। भोजन के साथ लेने से पेट में जलन या परेशानी नहीं होती।",
        "हाइड्रेशन: दिनभर में कम से कम 8 गिलास पानी पिएं।",
        "फॉलो-अप टेस्ट: ठीक 4 सप्ताह बाद (15 नवंबर) खाली पेट ब्लड शुगर (Fasting Sugar) की जांच करवाएं।"
      ],
      medicalTermsExplained: [
        { term: "Metformin (मेटफॉर्मिन)", meaning: "ब्लड शुगर (शर्करा) को नियंत्रित करने वाली एक सामान्य दवा।" },
        { term: "Fasting Blood Sugar", meaning: "कम से कम 8 घंटे बिना कुछ खाए किया जाने वाला शुगर टेस्ट।" },
        { term: "Hydration (जलयोजन)", meaning: "शरीर में पानी की पर्याप्त मात्रा बनाए रखना।" }
      ],
      detailsNeedingConfirmation: [
        "यदि शाम की खुराक छूट जाए तो क्या करना है?",
        "15 नवंबर के टेस्ट के लिए क्लिनिक में पहले से अपॉइंटमेंट लेना है या सीधे जाना है?"
      ],
      questionsForDoctor: [
        "यदि मैं कभी शाम की खुराक लेना भूल जाऊं, तो क्या करना चाहिए?",
        "ब्लड शुगर टेस्ट वाले दिन सुबह क्या मैं अपनी दवा ले सकता हूँ?"
      ],
      safetyWarning: "MedClear AI चिकित्सा सलाह का विकल्प नहीं है। अपनी निर्धारित खुराक स्वयं न बदलें।"
    };
  }

  return {
    simpleExplanation: "These instructions are clear and structured: Take your Metformin 500mg tablet once each day with your evening dinner. Drink at least 8 glasses of water throughout the day to stay well hydrated. Return to the clinic for a fasting blood sugar check in 4 weeks on November 15.",
    mode,
    importantInstructions: [
      "Metformin 500mg: 1 tablet daily with dinner. Taking it with food helps protect your stomach from nausea.",
      "Hydration: Aim for 8 glasses of water spread evenly throughout your day.",
      "Follow-up lab test: Get your fasting blood sugar test done on November 15 (in 4 weeks)."
    ],
    medicalTermsExplained: [
      { term: "Metformin", meaning: "A standard, trusted medicine used to help balance blood sugar levels." },
      { term: "Fasting Blood Sugar", meaning: "A blood test measured after you have had nothing to eat or drink (except water) for 8 to 10 hours." },
      { term: "Hydration", meaning: "Keeping your body supplied with enough fluids for kidney and metabolic health." }
    ],
    detailsNeedingConfirmation: [
      "What to do if you accidentally miss an evening dose",
      "Whether you should take the morning medications on the day of the fasting blood test"
    ],
    questionsForDoctor: [
      "If I ever forget to take my evening Metformin dose, should I take it later or wait for the next day?",
      "Do I need to fast overnight before the November 15 blood test?"
    ],
    safetyWarning: "MedClear AI helps simplify information. It does not replace medical advice from a doctor or pharmacist."
  };
}

function generateFallbackUnclearIssues(text: string, language: string) {
  const isHindi = language === 'hi';
  const lower = text.toLowerCase();
  const issues: any[] = [];

  if (lower.includes('white tablet') || lower.includes('tablet') && !lower.includes('500mg') && !lower.includes('paracetamol') && !lower.includes('metformin')) {
    issues.push({
      id: 'issue-med-name',
      type: 'Unclear Medication Name',
      severity: 'high',
      sourceText: lower.includes('white tablet') ? 'Take the white tablet' : 'tablet',
      whyClarificationNeeded: isHindi
        ? "रंग या आकार से दवा की पहचान करना खतरनाक है, क्योंकि कई अलग-अलग दवाएं एक जैसी दिखती हैं।"
        : "Identifying medication only by color or shape is unsafe. Many different drugs share identical appearances.",
      recommendedNextStep: isHindi
        ? "फार्मासिस्ट से दवा का असली नाम और ताकत (mg) पर्चे पर लिखवाएं।"
        : "Ask the pharmacist or doctor to write down the exact generic and brand name with strength.",
      status: 'Needs Confirmation'
    });
  }

  if (lower.includes('until better')) {
    issues.push({
      id: 'issue-duration',
      type: 'Ambiguous Timing',
      severity: 'high',
      sourceText: 'until better',
      whyClarificationNeeded: isHindi
        ? "'ठीक होने तक' कहना स्पष्ट नहीं है। एंटीबायोटिक्स का कोर्स पूरा करना होता है, बीच में छोड़ने पर बैक्टीरिया प्रतिरोधी बन सकते हैं।"
        : "'Until better' does not define an exact number of days. Stopping certain medicines (like antibiotics) early can lead to treatment failure.",
      recommendedNextStep: isHindi
        ? "डॉक्टर से पूछें कि यह दवा कितने दिन (जैसे 5 दिन या 7 दिन) लेनी है।"
        : "Confirm the exact treatment duration (e.g. 5 days, 10 days, or ongoing) with your healthcare provider.",
      status: 'Needs Confirmation'
    });
  }

  if (lower.includes('drops')) {
    issues.push({
      id: 'issue-drops-dosage',
      type: 'Missing Information',
      severity: 'high',
      sourceText: 'take the drops 3 times if fever',
      whyClarificationNeeded: isHindi
        ? "बूंदों का प्रकार (आंख, कान या मुंह के लिए सिरप ड्रॉप्स) और प्रति खुराक कितनी बूंदें (1, 2 या 5 बूंद) देनी हैं, यह नहीं लिखा है।"
        : "The type of drops (oral paediatric syrup, eye, or ear) and the exact drop count per dose are not specified.",
      recommendedNextStep: isHindi
        ? "दवा का नाम और सटीक बूंदों की संख्या फार्मासिस्ट से स्पष्ट करें।"
        : "Clarify the exact medication bottle and drop volume (e.g., 5 drops in water, or 2 drops per eye) with your chemist.",
      status: 'Needs Confirmation'
    });
  }

  if (lower.includes('come back later') || lower.includes('later')) {
    issues.push({
      id: 'issue-followup',
      type: 'Missing Follow-up',
      severity: 'medium',
      sourceText: 'Come back later',
      whyClarificationNeeded: isHindi
        ? "'बाद में आएं' में कोई समय सीमा नहीं दी गई है (2 दिन, 1 हफ्ता या 1 महीना)।"
        : "'Come back later' gives no timeframe or warning signs that trigger a review.",
      recommendedNextStep: isHindi
        ? "फॉलो-अप की सटीक तारीख या दिन नोट करवाएं।"
        : "Ask the clinic reception or doctor for an explicit follow-up timeframe (e.g., 'Return in 3 days if fever persists').",
      status: 'Needs Confirmation'
    });
  }

  // If no obvious issues detected, but instructions are sparse
  if (issues.length === 0) {
    if (!lower.includes('food') && !lower.includes('meal') && !lower.includes('empty stomach')) {
      issues.push({
        id: 'issue-meal-timing',
        type: 'Ambiguous Timing',
        severity: 'low',
        sourceText: 'Daily schedule',
        whyClarificationNeeded: isHindi
          ? "निर्देश में यह नहीं बताया गया है कि दवा खाली पेट लेनी है या भोजन के बाद।"
          : "The instructions do not specify whether to take the medicine on an empty stomach or with meals.",
        recommendedNextStep: isHindi
          ? "फार्मासिस्ट से भोजन से संबंधित समय की पुष्टि करें।"
          : "Confirm meal timing (before or after food) with your pharmacist to maximize absorption.",
        status: 'Needs Confirmation'
      });
    }
  }

  return {
    hasIssues: issues.length > 0,
    overallSafetyAssessment: issues.length > 0
      ? isHindi
        ? `${issues.length} महत्वपूर्ण अस्पष्टताएं पाई गईं जिनकी डॉक्टर/फार्मासिस्ट से पुष्टि जरूरी है`
        : `${issues.length} crucial ambiguities detected that require confirmation from your healthcare provider`
      : isHindi
        ? 'निर्देश सामान्यतः स्पष्ट हैं, बुनियादी सावधानियों का पालन करें'
        : 'Instructions appear clear with standard details provided',
    issues,
    questionsToClarify: [
      isHindi ? "क्या इस दवा को भोजन से पहले लेना है या बाद में?" : "Should this medicine be taken before or after meals?",
      isHindi ? "यदि कोई खुराक छूट जाए तो मुझे क्या करना चाहिए?" : "What should I do if a dose is accidentally missed?",
      isHindi ? "क्या इस दवा के साथ कोई अन्य सामान्य दवा नहीं लेनी चाहिए?" : "Are there any food or medication interactions I should be aware of?"
    ],
    disclaimer: "This tool highlights potential ambiguities. It cannot verify if a prescription is medically appropriate."
  };
}

function generateFallbackMCQs(text: string, language: string) {
  const isHindi = language === 'hi';
  const lower = text.toLowerCase();

  if (lower.includes('metformin') || lower.includes('sugar') || lower.includes('500mg')) {
    if (isHindi) {
      return {
        questions: [
          {
            id: 1,
            question: "मेटफॉर्मिन 500mg की खुराक आपको दिन में किस समय लेनी है?",
            options: [
              "सुबह खाली पेट",
              "शाम के भोजन (डिनर) के साथ",
              "दोपहर में सोने से पहले",
              "केवल जब सिरदर्द हो"
            ],
            correctIndex: 1,
            explanation: "निर्देश में स्पष्ट लिखा है: 'Take Metformin 500mg tablet once daily with your evening meal.' (शाम के भोजन के साथ लें)।",
            relatedInstruction: "Take Metformin 500mg tablet once daily with your evening meal."
          },
          {
            id: 2,
            question: "दिनभर में आपको कम से कम कितना पानी पीने का निर्देश दिया गया है?",
            options: [
              "केवल 1-2 गिलास",
              "कम से कम 8 गिलास",
              "पानी बिल्कुल नहीं पीना है",
              "केवल चाय या कॉफी"
            ],
            correctIndex: 1,
            explanation: "निर्देश के अनुसार दिनभर में कम से कम 8 गिलास पानी पीना चाहिए ताकि शरीर हाइड्रेटेड रहे।",
            relatedInstruction: "Drink at least 8 glasses of water throughout the day."
          },
          {
            id: 3,
            question: "आपको क्लिनिक में दोबारा किस तारीख को और किस टेस्ट के लिए जाना है?",
            options: [
              "15 नवंबर को खाली पेट ब्लड शुगर टेस्ट के लिए",
              "कल सुबह एक्स-रे के लिए",
              "6 महीने बाद बिना किसी टेस्ट के",
              "केवल जब दवा समाप्त हो जाए"
            ],
            correctIndex: 0,
            explanation: "निर्देश में 4 सप्ताह बाद यानी 15 नवंबर को फास्टिंग ब्लड शुगर चेक कराने का स्पष्ट उल्लेख है।",
            relatedInstruction: "Return to the clinic for a fasting blood sugar check in 4 weeks on November 15."
          }
        ],
        reviewTopics: [
          "मेटफॉर्मिन को हमेशा भोजन के साथ लें ताकि पेट की तकलीफ न हो",
          "दिनभर 8 गिलास पानी पीने का नियम याद रखें",
          "15 नवंबर की सुबह खाली पेट टेस्ट का समय कैलेंडर में नोट करें"
        ]
      };
    }

    return {
      questions: [
        {
          id: 1,
          question: "When should you take your Metformin 500mg tablet according to the instructions?",
          options: [
            "In the morning on an empty stomach",
            "Once daily with your evening meal",
            "Right before going to sleep without food",
            "Only whenever you experience a headache"
          ],
          correctIndex: 1,
          explanation: "The instruction explicitly states: 'Take Metformin 500mg tablet once daily with your evening meal.' Taking it with food minimizes stomach upset.",
          relatedInstruction: "Take Metformin 500mg tablet once daily with your evening meal."
        },
        {
          id: 2,
          question: "How much water are you advised to drink throughout the day?",
          options: [
            "At least 8 glasses of water",
            "Only 1 to 2 sips when taking the pill",
            "No water, only tea or juice",
            "As little as possible"
          ],
          correctIndex: 0,
          explanation: "The instruction specifically recommends drinking at least 8 glasses of water spread across your day.",
          relatedInstruction: "Drink at least 8 glasses of water throughout the day."
        },
        {
          id: 3,
          question: "What is the scheduled clinic follow-up mentioned in the instructions?",
          options: [
            "Fasting blood sugar check in 4 weeks on November 15",
            "Emergency hospital visit tomorrow morning",
            "An eye checkup in 6 months",
            "No follow-up was mentioned"
          ],
          correctIndex: 0,
          explanation: "The instruction asks you to return to the clinic for a fasting blood sugar check in 4 weeks on November 15.",
          relatedInstruction: "Return to the clinic for a fasting blood sugar check in 4 weeks on November 15."
        }
      ],
      reviewTopics: [
        "Take Metformin with your evening meal for comfort",
        "Maintain good hydration with 8 glasses of water daily",
        "Calendar the fasting blood sugar appointment for November 15"
      ]
    };
  }

  // Fallback for ambiguous text or other custom text
  return {
    questions: [
      {
        id: 1,
        question: isHindi ? "क्या दिए गए निर्देश में दवा का पूरा नाम और डोज़ स्पष्ट है?" : "Does the instruction specify the exact medication name and strength?",
        options: [
          isHindi ? "नहीं, महत्वपूर्ण विवरण गायब हैं और पुष्टि की आवश्यकता है" : "No, crucial details are missing and need doctor confirmation",
          isHindi ? "हाँ, सब कुछ पूरी तरह से स्पष्ट है" : "Yes, everything is completely verified",
          isHindi ? "दवा का रंग ही पर्याप्त जानकारी है" : "The color alone is sufficient information",
          isHindi ? "फार्मासिस्ट से पूछने की जरूरत नहीं है" : "There is no need to ask a pharmacist"
        ],
        correctIndex: 0,
        explanation: isHindi
          ? "दिए गए टेक्स्ट में दवा का नाम या सटीक मिलीग्राम नहीं बताया गया है, इसलिए पहले डॉक्टर से पुष्टि आवश्यक है।"
          : "The text leaves out specific drug names and milligrams, making direct doctor or pharmacist verification necessary.",
        relatedInstruction: text.slice(0, 80)
      },
      {
        id: 2,
        question: isHindi ? "यदि दवा के निर्देश में 'जब तक ठीक न हो जाएं' लिखा हो, तो सुरक्षित कदम क्या है?" : "When instructions say 'until better' without an exact day count, what should you do?",
        options: [
          isHindi ? "अपने आप दवा बंद कर दें" : "Stop immediately as soon as you feel slightly better",
          isHindi ? "डॉक्टर या फार्मासिस्ट से कोर्स के सही दिनों की संख्या पूछें" : "Ask your doctor or pharmacist for the exact number of days to take it",
          isHindi ? "दवा की डोज़ दोगुनी कर दें" : "Double the dose to get well faster",
          isHindi ? "किसी पड़ोसी से सलाह लें" : "Ask a neighbor for their leftover medicine"
        ],
        correctIndex: 1,
        explanation: isHindi
          ? "दवा कितने दिन लेनी है, यह हमेशा डॉक्टर या फार्मासिस्ट से स्पष्ट करना चाहिए ताकि अधूरा इलाज न रहे।"
          : "Always confirm the exact duration with a healthcare professional so treatment isn't cut short prematurely.",
        relatedInstruction: "until better"
      },
      {
        id: 3,
        question: isHindi ? "MedClear AI किस उद्देश्य के लिए है?" : "What is the primary role of MedClear AI?",
        options: [
          isHindi ? "चिकित्सा निर्देशों को सरल भाषा में समझाना (इलाज या निदान नहीं)" : "Helping explain medical instructions in simple language (not prescribing or diagnosing)",
          isHindi ? "डॉक्टर का स्थान लेना" : "Replacing your doctor or pharmacist",
          isHindi ? "नई दवाएं लिखना" : "Writing new prescriptions",
          isHindi ? "बीमारियों का इलाज खुद करना" : "Diagnosing medical conditions independently"
        ],
        correctIndex: 0,
        explanation: isHindi
          ? "MedClear AI एक स्वास्थ्य संचार और शिक्षा सहायक है, यह डॉक्टर या निदान का विकल्प नहीं है।"
          : "MedClear AI is an educational communication assistant that simplifies medical language and highlights areas needing confirmation.",
        relatedInstruction: "MedClear AI safety disclaimer"
      }
    ],
    reviewTopics: [
      isHindi ? "अस्पष्ट पर्चे को हमेशा फार्मासिस्ट से दोबारा जांचें" : "Always verify vague medicine labels with a registered pharmacist",
      isHindi ? "दवा का असली नाम और डोज़ जानना मरीज का अधिकार है" : "Knowing the exact generic name and dosage is your patient right"
    ]
  };
}

function generateFallbackVisitSummary(text: string, doctorName?: string, visitDate?: string, language?: string) {
  const isHindi = language === 'hi';
  return {
    title: isHindi ? "रोगी परामर्श सारांश (Visit Summary)" : "Patient Visit Summary",
    visitDate: visitDate || "Today / हालिया परामर्श",
    doctorOrClinic: doctorName || "Healthcare Provider",
    mainPoints: [
      isHindi ? "चिकित्सक द्वारा दी गई मुख्य सलाह और जीवनशैली नियम" : "Key recommendations provided during consultation",
      isHindi ? "दवाओं के समय और पानी की मात्रा का पालन" : "Adherence to medication timing and fluid intake"
    ],
    prescribedMedicationsOrCare: [
      text.slice(0, 120) || "Follow directions on medicine packaging"
    ],
    testsMentioned: [
      text.toLowerCase().includes('sugar') || text.toLowerCase().includes('fasting')
        ? (isHindi ? "फास्टिंग ब्लड शुगर टेस्ट (खाली पेट)" : "Fasting Blood Sugar Test (8-10 hrs fasting)")
        : (isHindi ? "पर्चे में कोई विशिष्ट लैब टेस्ट दर्ज नहीं है" : "No specific laboratory tests ordered in note")
    ],
    followUpInstructions: [
      text.toLowerCase().includes('november') || text.toLowerCase().includes('4 weeks')
        ? (isHindi ? "4 सप्ताह बाद (15 नवंबर) पुनः परामर्श एवं टेस्ट समीक्षा" : "Clinic follow-up in 4 weeks (Nov 15) for test review")
        : (isHindi ? "लक्षण बने रहने पर 3-5 दिनों में डॉक्टर से संपर्क करें" : "Contact clinic in 3-5 days if symptoms persist")
    ],
    detailsNeedingConfirmation: [
      isHindi ? "यदि दवा के बाद कोई नया लक्षण दिखे तो आपातकालीन संपर्क नंबर" : "Emergency clinic helpline number if adverse effects occur",
      isHindi ? "भोजन से पहले या बाद में दवा लेने का सटीक समय" : "Exact timing relative to meals (before or after food)"
    ],
    questionsForNextDoctorVisit: [
      isHindi ? "क्या मेरे लक्षणों में सुधार सामान्य गति से हो रहा है?" : "Is my recovery progressing at the expected rate?",
      isHindi ? "क्या मुझे इस दवा को लंबे समय तक जारी रखना होगा?" : "Will I need to continue this prescription long-term?"
    ],
    emergencyNote: isHindi
      ? "यदि सांस लेने में कठिनाई, तेज चक्कर, चेहरे या होंठों पर सूजन, या अत्यधिक कमजोरी महसूस हो तो तुरंत नजदीकी अस्पताल के आपातकालीन विभाग में जाएं।"
      : "If you experience shortness of breath, severe dizziness, swelling of lips/face, or sudden extreme weakness, seek immediate emergency care."
  };
}

function generateFallbackReportAnalysis(reportText: string, language: string) {
  const isHindi = language === 'hi';

  const testItems = [
    {
      id: "item-1",
      testName: "Hemoglobin (Hb)",
      measuredValue: "11.2",
      numericValue: 11.2,
      unit: "g/dL",
      referenceRangeText: "13.0 - 17.0",
      rangeMin: 13.0,
      rangeMax: 17.0,
      status: "below_range" as const,
      statusLabelEn: "Below Reference Range",
      statusLabelHi: "संदर्भ सीमा से कम (Below Range)",
      whatItMeans: isHindi
        ? "हीमोग्लोबिन लाल रक्त कोशिकाओं में मौजूद प्रोटीन है जो पूरे शरीर में ऑक्सीजन पहुंचाता है।"
        : "Hemoglobin is the iron-rich protein in red blood cells that transports oxygen to your tissues and organs.",
      educationalNote: isHindi
        ? "11.2 g/dL वयस्क पुरुष की सामान्य सीमा (13.0-17.0) से कुछ कम है। पोषण, आयरन का स्तर, या हालिया संक्रमण पर डॉक्टर से परामर्श लें।"
        : "At 11.2 g/dL, this value is lower than the printed reference range for adult males. A lower value does not automatically signify a disorder, but warrants doctor review of iron stores and nutrition.",
      uncertainties: []
    },
    {
      id: "item-2",
      testName: "Total Leukocyte Count (WBC)",
      measuredValue: "7,400",
      numericValue: 7400,
      unit: "/mcL",
      referenceRangeText: "4,000 - 11,000",
      rangeMin: 4000,
      rangeMax: 11000,
      status: "within_range" as const,
      statusLabelEn: "Within Normal Range",
      statusLabelHi: "सामान्य सीमा के भीतर",
      whatItMeans: isHindi
        ? "श्वेत रक्त कोशिकाएं (WBC) शरीर की प्रतिरक्षा प्रणाली का हिस्सा हैं जो संक्रमण से लड़ती हैं।"
        : "White blood cells defend your body against bacterial and viral infections.",
      educationalNote: isHindi
        ? "7,400 /mcL सामान्य सीमा के बिल्कुल मध्य में है। यह प्रतिरक्षा प्रणाली का सामान्य संतुलन दर्शाता है।"
        : "7,400 cells/mcL is comfortably within standard adult reference intervals.",
      uncertainties: []
    },
    {
      id: "item-3",
      testName: "Platelet Count",
      measuredValue: "210,000",
      numericValue: 210000,
      unit: "/mcL",
      referenceRangeText: "150,000 - 450,000",
      rangeMin: 150000,
      rangeMax: 450000,
      status: "within_range" as const,
      statusLabelEn: "Within Normal Range",
      statusLabelHi: "सामान्य सीमा के भीतर",
      whatItMeans: isHindi
        ? "प्लेटलेट्स रक्त का थक्का जमाने और चोट लगने पर खून रोकने में मदद करती हैं।"
        : "Platelets are tiny blood cell fragments essential for normal blood clotting and healing.",
      educationalNote: isHindi
        ? "210,000 /mcL स्वस्थ सीमा में है।"
        : "210,000 /mcL falls securely within standard laboratory reference limits.",
      uncertainties: []
    },
    {
      id: "item-4",
      testName: "Fasting Blood Sugar (FBS)",
      measuredValue: "142",
      numericValue: 142,
      unit: "mg/dL",
      referenceRangeText: "70 - 99",
      rangeMin: 70,
      rangeMax: 99,
      status: "above_range" as const,
      statusLabelEn: "Above Reference Range",
      statusLabelHi: "संदर्भ सीमा से अधिक (Above Range)",
      whatItMeans: isHindi
        ? "रातभर खाली पेट (8-10 घंटे) रहने के बाद रक्त में मौजूद ग्लूकोज (शर्करा) की मात्रा।"
        : "The amount of glucose in your bloodstream after an overnight fast (typically 8 to 10 hours).",
      educationalNote: isHindi
        ? "142 mg/dL सामान्य फास्टिंग सीमा (70-99) से अधिक है। महत्वपूर्ण: एक बार बढ़ा हुआ मान मधुमेह की पुष्टि नहीं करता; तनाव, अस्वस्थता या रात के खाने का समय भी इसे प्रभावित कर सकता है। डॉक्टर दोहराव टेस्ट या HbA1c की सलाह दे सकते हैं।"
        : "At 142 mg/dL, this value exceeds the normal fasting reference threshold. Important: An elevated single reading does NOT establish a diagnosis; acute stress, hydration, or timing can affect glucose. Discuss with your physician for confirmatory testing (such as HbA1c).",
      uncertainties: []
    },
    {
      id: "item-5",
      testName: "Serum Cholesterol Total",
      measuredValue: "218",
      numericValue: 218,
      unit: "mg/dL",
      referenceRangeText: "< 200",
      rangeMin: 0,
      rangeMax: 200,
      status: "above_range" as const,
      statusLabelEn: "Above Reference Range",
      statusLabelHi: "संदर्भ सीमा से अधिक (Above Range)",
      whatItMeans: isHindi
        ? "रक्त में पाए जाने वाले वसा (लिपिड) का कुल स्तर।"
        : "The total concentration of cholesterol particles circulating in your bloodstream.",
      educationalNote: isHindi
        ? "218 mg/dL वांछित सीमा (<200) से थोड़ा ऊपर है। जीवनशैली, आहार और पारिवारिक इतिहास पर डॉक्टर से चर्चा करें।"
        : "At 218 mg/dL, this is moderately above desirable laboratory limits. Dietary patterns and lifestyle influence this parameter.",
      uncertainties: []
    },
    {
      id: "item-6",
      testName: "HDL Cholesterol (Good)",
      measuredValue: "44",
      numericValue: 44,
      unit: "mg/dL",
      referenceRangeText: "> 40",
      rangeMin: 40,
      rangeMax: null,
      status: "within_range" as const,
      statusLabelEn: "Within Normal Range",
      statusLabelHi: "सामान्य सीमा के भीतर",
      whatItMeans: isHindi
        ? "उच्च घनत्व वाला लिपोप्रोटीन, जिसे हृदय की सुरक्षा के लिए 'अच्छा कोलेस्ट्रॉल' कहा जाता है।"
        : "High-Density Lipoprotein ('good cholesterol'), which helps clear excess cholesterol from arterial walls.",
      educationalNote: isHindi
        ? "44 mg/dL पुरुषों के लिए 40 से अधिक की न्यूनतम अनुशंसित सीमा को पूरा करता है।"
        : "44 mg/dL meets the standard recommended threshold (>40 mg/dL for adult males).",
      uncertainties: []
    },
    {
      id: "item-7",
      testName: "LDL Cholesterol (Calculated)",
      measuredValue: "138",
      numericValue: 138,
      unit: "mg/dL",
      referenceRangeText: "< 100",
      rangeMin: 0,
      rangeMax: 100,
      status: "above_range" as const,
      statusLabelEn: "Above Reference Range",
      statusLabelHi: "संदर्भ सीमा से अधिक",
      whatItMeans: isHindi
        ? "निम्न घनत्व वाला लिपोप्रोटीन ('खराब कोलेस्ट्रॉल') जो धमनियों में प्लाक जमा कर सकता है।"
        : "Low-Density Lipoprotein ('bad cholesterol'), which can accumulate in arterial walls when elevated over prolonged periods.",
      educationalNote: isHindi
        ? "138 mg/dL संदर्भ सीमा (<100) से ऊपर है। डॉक्टर हृदय स्वास्थ्य और आहार संबंधी मार्गदर्शन देंगे।"
        : "138 mg/dL is above the standard optimal target. Cardiovascular risk factors should be reviewed by a physician.",
      uncertainties: []
    },
    {
      id: "item-8",
      testName: "Serum Triglycerides",
      measuredValue: "180",
      numericValue: 180,
      unit: "mg/dL",
      referenceRangeText: "< 150",
      rangeMin: 0,
      rangeMax: 150,
      status: "above_range" as const,
      statusLabelEn: "Above Reference Range",
      statusLabelHi: "संदर्भ सीमा से अधिक",
      whatItMeans: isHindi
        ? "भोजन से प्राप्त ऊर्जा को संग्रहीत करने वाली वसा का एक प्रकार।"
        : "A type of fat (lipid) found in your blood that stores unused calories from food.",
      educationalNote: isHindi
        ? "180 mg/dL सीमा से ऊपर है। मिठाई या तैलीय भोजन कम करना और व्यायाम मददगार हो सकता है।"
        : "180 mg/dL is moderately elevated above the <150 mg/dL target.",
      uncertainties: []
    },
    {
      id: "item-9",
      testName: "Serum Creatinine",
      measuredValue: "0.95",
      numericValue: 0.95,
      unit: "mg/dL",
      referenceRangeText: "0.7 - 1.3",
      rangeMin: 0.7,
      rangeMax: 1.3,
      status: "within_range" as const,
      statusLabelEn: "Within Normal Range",
      statusLabelHi: "सामान्य सीमा के भीतर",
      whatItMeans: isHindi
        ? "मांसपेशियों के सामान्य काम से बनने वाला अपशिष्ट उत्पाद, जिसे किडनी (गुर्दे) छानकर बाहर निकालते हैं।"
        : "A chemical waste product produced by muscle metabolism and filtered out by healthy kidneys.",
      educationalNote: isHindi
        ? "0.95 mg/dL सामान्य गुर्दा कार्यप्रणाली दर्शाता है।"
        : "0.95 mg/dL indicates standard filtration efficiency in kidney health.",
      uncertainties: []
    },
    {
      id: "item-10",
      testName: "Serum Bilirubin",
      measuredValue: "[Smudged / Unreadable]",
      numericValue: null,
      unit: "[Missing Unit]",
      referenceRangeText: "0.2 - 1.2",
      rangeMin: 0.2,
      rangeMax: 1.2,
      status: "unable_to_assess" as const,
      statusLabelEn: "Unable to Assess - Unreadable Value",
      statusLabelHi: "मूल्यांकन संभव नहीं - धुंधला मान",
      whatItMeans: isHindi
        ? "लिवर (यकृत) के कार्य और पित्त से जुड़ा वर्णक।"
        : "A yellowish substance produced during normal breakdown of red blood cells, processed by the liver.",
      educationalNote: isHindi
        ? "पर्चे पर प्रिंट धुंधला होने के कारण यह मान पढ़ा नहीं जा सका। सुरक्षा नियम: MedClear AI कभी भी अस्पष्ट या गायब संख्या का अनुमान नहीं लगाता। लैब से स्पष्ट कॉपी मांगें।"
        : "The printed number was smudged and illegible on the original document. By clinical safety protocol, MedClear AI never guesses unreadable numbers. Request a clear reprint from the lab.",
      uncertainties: [
        isHindi
          ? "दस्तावेज़ पर सीरम बिलीरुबिन का संख्यात्मक मान धुंधला (Smudged) है और यूनिट गायब है।"
          : "Numerical value is smudged and unit is missing on the original report slip."
      ]
    },
    {
      id: "item-11",
      testName: "Alkaline Phosphatase (ALP)",
      measuredValue: "185",
      numericValue: 185,
      unit: "U/L",
      referenceRangeText: "[Missing Range]",
      rangeMin: null,
      rangeMax: null,
      status: "unable_to_assess" as const,
      statusLabelEn: "Unable to Assess - Missing Reference Range",
      statusLabelHi: "मूल्यांकन संभव नहीं - संदर्भ सीमा गायब",
      whatItMeans: isHindi
        ? "हड्डियों और लिवर में पाया जाने वाला एंजाइम।"
        : "An enzyme found largely in bones, liver, and biliary tract.",
      educationalNote: isHindi
        ? "लैब रिपोर्ट में इस टेस्ट की संदर्भ सीमा (Reference Range) दर्ज नहीं है। प्रत्येक प्रयोगशाला की विश्लेषण विधि भिन्न हो सकती है, इसलिए बिना सीमा के तुलना नहीं की जा सकती।"
        : "No reference interval was printed on the report for ALP. Different analyzers use distinct methodologies, so comparison cannot be performed without the testing lab's specific calibration range.",
      uncertainties: [
        isHindi
          ? "एएलपी (ALP) के लिए प्रयोगशाला की संदर्भ सीमा (Reference Range) गायब है।"
          : "Reference range missing from laboratory slip for Alkaline Phosphatase."
      ]
    },
    {
      id: "item-12",
      testName: "Vitamin D (25-OH Total)",
      measuredValue: "14.5",
      numericValue: 14.5,
      unit: "ng/mL",
      referenceRangeText: "30 - 100",
      rangeMin: 30,
      rangeMax: 100,
      status: "below_range" as const,
      statusLabelEn: "Below Reference Range",
      statusLabelHi: "संदर्भ सीमा से कम (Below Range)",
      whatItMeans: isHindi
        ? "हड्डियों की मजबूती और रोग प्रतिरोधक क्षमता के लिए आवश्यक महत्वपूर्ण विटामिन।"
        : "An essential vitamin crucial for calcium absorption, bone mineral density, and immune regulation.",
      educationalNote: isHindi
        ? "14.5 ng/mL 30-100 की संदर्भ सीमा से कम है। भारतीय वयस्कों में धूप की कमी के कारण यह काफी सामान्य है। डॉक्टर सप्लीमेंट या आहार सुधार की सलाह दे सकते हैं।"
        : "At 14.5 ng/mL, this is below the printed sufficiency range (30-100 ng/mL). Common in indoor urban routines; discuss supplementation with your physician.",
      uncertainties: []
    }
  ];

  const overallUncertainties = [
    isHindi
      ? "सीरम बिलीरुबिन (Serum Bilirubin) का संख्यात्मक मान थर्मल प्रिंट स्लिप पर धुंधला/अस्पष्ट है और यूनिट गायब है। सुरक्षा नियमों के अनुसार कोई काल्पनिक मान नहीं गढ़ा गया।"
      : "Serum Bilirubin numerical value is smudged/unreadable on document slip, and unit is missing. MedClear AI did not invent or guess any number.",
    isHindi
      ? "अल्कलाइन फॉस्फेटेस (ALP) का मान 185 U/L दर्ज है, लेकिन रिपोर्ट पर संदर्भ सीमा (Reference Range) नहीं छपी है।"
      : "Alkaline Phosphatase (ALP) has measured value 185 U/L, but laboratory reference range is missing on the slip.",
    isHindi
      ? "फास्टिंग ब्लड शुगर (142 mg/dL) और लिपिड प्रोफाइल की व्याख्या केवल खाली पेट (Fasting 8-10 घंटे) की पुष्टि पर निर्भर करती है।"
      : "Blood sugar and lipid comparisons assume a strict 8-10 hour overnight fast before sample collection."
  ];

  const medicalTerms = [
    {
      term: "Hemoglobin (हीमोग्लोबिन)",
      meaning: isHindi
        ? "रक्त में ऑक्सीजन ले जाने वाला मुख्य प्रोटीन।"
        : "The iron-carrying protein inside red blood cells that transports oxygen from lungs to the rest of the body."
    },
    {
      term: "Fasting Blood Sugar (खाली पेट ब्लड शुगर)",
      meaning: isHindi
        ? "रातभर बिना कुछ खाए-पिए सुबह खाली पेट लिया गया रक्त शर्करा का माप।"
        : "Glucose level measured after 8 to 10 hours of fasting; standard screening tool for metabolic health."
    },
    {
      term: "HDL vs LDL Cholesterol",
      meaning: isHindi
        ? "HDL 'अच्छा' कोलेस्ट्रॉल है जो रक्त वाहिकाओं को साफ रखता है; LDL 'खराब' कोलेस्ट्रॉल है जो जम सकता है।"
        : "HDL is protective ('good cholesterol'); LDL ('bad cholesterol') carries lipids toward peripheral arteries."
    },
    {
      term: "Creatinine (क्रिएटिनिन)",
      meaning: isHindi
        ? "गुर्दे (किडनी) के स्वास्थ्य और रक्त छानने की क्षमता की जांच का मुख्य पैमाना।"
        : "A stable metabolic byproduct filtered by the kidneys, reflecting renal filtration efficiency."
    },
    {
      term: "Reference Range (संदर्भ सीमा)",
      meaning: isHindi
        ? "स्वस्थ आबादी के 95% लोगों में पाए जाने वाले सामान्य मानों की सीमा, जो प्रत्येक लैब में थोड़ी भिन्न हो सकती है।"
        : "The statistical interval seen in 95% of healthy individuals for that specific lab instrument and methodology."
    }
  ];

  const questionsForDoctor = [
    isHindi
      ? "क्या मेरे फास्टिंग ब्लड शुगर (142 mg/dL) के लिए HbA1c टेस्ट या डाइट में बदलाव की जरूरत है?"
      : "Given my fasting blood sugar of 142 mg/dL, do you recommend an HbA1c test or repeat fasting check?",
    isHindi
      ? "क्या मेरे थोड़े कम हीमोग्लोबिन (11.2 g/dL) के लिए मुझे आयरन टेस्ट (सीरम फेरिटिन) कराना चाहिए?"
      : "For my hemoglobin at 11.2 g/dL, should we evaluate iron stores (ferritin) or dietary intake?",
    isHindi
      ? "क्या विटामिन डी (14.5 ng/mL) के लिए मुझे कोई चिकित्सकीय सप्लीमेंट लेने की आवश्यकता है?"
      : "Does my Vitamin D level (14.5 ng/mL) warrant medical supplementation?",
    isHindi
      ? "बिलीरुबिन का मान प्रिंट में धुंधला था और ALP की रेंज गायब थी — क्या मुझे लैब से नई प्रिंट कॉपी लेनी चाहिए?"
      : "The bilirubin value was smudged and ALP had no reference range on this slip — should we obtain a clear reprint from the laboratory?",
    isHindi
      ? "क्या मुझे लिपिड प्रोफाइल के लिए 3 से 6 महीने में दोबारा जांच करानी होगी?"
      : "What follow-up timeline do you advise for repeating the lipid panel?"
  ];

  const summaryEn = "Your laboratory panel includes 12 investigations. Several key markers (WBC, Platelets, Creatinine, and HDL) fall within standard reference intervals. Four markers (Fasting Blood Sugar, Total Cholesterol, LDL, and Triglycerides) are above reference thresholds, while Hemoglobin and Vitamin D are below reference ranges. Additionally, Bilirubin was unreadable and ALP was missing its reference range on the original slip. Please share these findings with your physician for comprehensive clinical correlation.";

  const summaryHi = "आपकी लैब रिपोर्ट में 12 जांचें शामिल हैं। कई महत्वपूर्ण पैरामीटर (डब्ल्यूबीसी, प्लेटलेट्स, क्रिएटिनिन, और एचडीएल) सामान्य सीमा में हैं। चार पैरामीटर (फास्टिंग ब्लड शुगर, कुल कोलेस्ट्रॉल, एलडीएल, और ट्राइग्लिसराइड्स) संदर्भ सीमा से ऊपर हैं, जबकि हीमोग्लोबिन और विटामिन डी सीमा से कम हैं। इसके अलावा, बिलीरुबिन का मान धुंधला था और एएलपी की संदर्भ सीमा गायब थी। कृपया इन परिणामों को अपने डॉक्टर के साथ साझा करें।";

  return {
    reportTitle: "Apex Diagnostics & Research Centre - Comprehensive Health Panel",
    patientInfo: {
      name: "Aarav Sharma",
      age: "45 Y",
      gender: "Male",
      sampleDate: "14-Oct-2026",
      labName: "Apex Diagnostics & Research Centre, New Delhi"
    },
    summaryEn,
    summaryHi,
    testItems,
    medicalTerms,
    overallUncertainties,
    questionsForDoctor,
    importantSafetyNotice: isHindi
      ? "महत्वपूर्ण स्वास्थ्य सूचना: MedClear AI केवल एक शैक्षिक सहायक है और किसी बीमारी का निदान नहीं करता। संदर्भ सीमा से बाहर का मान स्वतः किसी बीमारी का प्रमाण नहीं है, और सीमा के भीतर का मान पूर्ण स्वास्थ्य की गारंटी नहीं देता। किसी भी दवा में बदलाव करने से पहले हमेशा योग्य डॉक्टर से परामर्श लें।"
      : "Critical Health Notice: MedClear AI is an educational assistant and does not provide medical diagnoses or alter treatments. A value outside a laboratory reference range does not automatically mean a disease is present, and a value within range does not guarantee complete health. Always consult your qualified physician to interpret your results in the context of your complete health history."
  };
}

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Immutable caching for hashed static assets to reduce network bandwidth
    app.use(express.static(path.join(__dirname, 'dist'), {
      maxAge: '7d',
      etag: true,
    }));
    app.get('*', (req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`  ➜  Local:   http://localhost:${port}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${port}/`);
  });
}

startServer();
