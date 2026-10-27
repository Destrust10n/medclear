import { DictionaryTerm, PatientProfile } from '../types';

export const DEMO_EXAMPLE_A = {
  id: 'example-a',
  titleEn: 'Example A: Clear Educational Prescription',
  titleHi: 'उदाहरण A: स्पष्ट चिकित्सीय निर्देश',
  badge: 'Clear Instructions',
  badgeColor: 'emerald',
  descriptionEn: 'Clear instructions that can be understood and explained directly without assuming missing facts.',
  descriptionHi: 'स्पष्ट निर्देश जिन्हें बिना किसी अनुमान के आसानी से समझा जा सकता है।',
  text: 'Take Metformin 500mg tablet once daily with your evening meal. Drink at least 8 glasses of water throughout the day. Return to the clinic for a fasting blood sugar check in 4 weeks on November 15.'
};

export const DEMO_EXAMPLE_B = {
  id: 'example-b',
  titleEn: 'Example B: Intentionally Ambiguous Instructions',
  titleHi: 'उदाहरण B: जानबूझकर अस्पष्ट निर्देश',
  badge: 'Uncertainty / Ambiguous',
  badgeColor: 'amber',
  descriptionEn: 'Ambiguous text missing medicine names, exact doses, and clear timeframes. Triggers caution flags and questions for the pharmacist.',
  descriptionHi: 'अस्पष्ट पर्चा जिसमें दवा का नाम, सटीक मात्रा और समय गायब है। यह चेतावनी और पुष्टि की आवश्यकता दर्शाता है।',
  text: 'Take the white tablet twice until better. Also take the drops 3 times if fever. Come back later.'
};

export const DEMO_PATIENT: PatientProfile = {
  name: 'Rajesh Kumar',
  age: 54,
  city: 'New Delhi',
  bloodGroup: 'B+',
  emergencyContact: '+91 98765 43210'
};

export const MEDICAL_DICTIONARY: DictionaryTerm[] = [
  {
    id: 'hypertension',
    termEn: 'Hypertension',
    termHi: 'उच्च रक्तचाप (हाई ब्लड प्रेशर)',
    pronunciation: 'hy-per-TEN-shun',
    category: 'Conditions & Symptoms',
    meaningEn: 'A condition where the force of blood pushing against artery walls is consistently higher than normal (usually above 130/80 mmHg).',
    meaningHi: 'वह स्थिति जब नसों (धमनियों) की दीवारों पर खून का दबाव सामान्य से लगातार अधिक रहता है।',
    exampleEn: 'Doctors often recommend reducing salt and taking daily medication to manage hypertension.',
    exampleHi: 'डॉक्टर अक्सर उच्च रक्तचाप को नियंत्रित करने के लिए नमक कम करने और नियमित दवा लेने की सलाह देते हैं।'
  },
  {
    id: 'dehydration',
    termEn: 'Dehydration',
    termHi: 'निर्जलीकरण (शरीर में पानी की कमी)',
    pronunciation: 'dee-hy-DRAY-shun',
    category: 'Conditions & Symptoms',
    meaningEn: 'When the body loses more fluids than you take in, leading to dry mouth, dizziness, and low energy.',
    meaningHi: 'जब शरीर से पानी और तरल पदार्थ ग्रहण की गई मात्रा से अधिक निकल जाते हैं, जिससे कमजोरी और चक्कर आ सकते हैं।',
    exampleEn: 'Drink coconut water, ORS, or plain water to treat mild dehydration caused by summer heat or fever.',
    exampleHi: 'गर्मियों में या बुखार के दौरान पानी की कमी दूर करने के लिए ओआरएस या पर्याप्त पानी पिएं।'
  },
  {
    id: 'inflammation',
    termEn: 'Inflammation',
    termHi: 'सूजन / जलन',
    pronunciation: 'in-fluh-MAY-shun',
    category: 'Conditions & Symptoms',
    meaningEn: 'The body’s natural protective response to injury or infection, causing redness, warmth, swelling, and soreness.',
    meaningHi: 'चोट या संक्रमण के प्रति शरीर की प्राकृतिक सुरक्षा प्रतिक्रिया, जिससे प्रभावित स्थान पर लालिमा, गर्मी और सूजन आ जाती है।',
    exampleEn: 'Applying a cold compress helped reduce the acute swelling and inflammation in his sprained ankle.',
    exampleHi: 'मोच आने पर ठंडी पट्टी रखने से टखने की सूजन और जलन कम हो गई।'
  },
  {
    id: 'infection',
    termEn: 'Infection',
    termHi: 'संक्रमण (इन्फेक्शन)',
    pronunciation: 'in-FEK-shun',
    category: 'Conditions & Symptoms',
    meaningEn: 'The invasion and multiplication of harmful germs (bacteria, viruses, or fungi) inside the body.',
    meaningHi: 'शरीर के अंदर हानिकारक कीटाणुओं (बैक्टीरिया, वायरस आदि) का फैलना जिससे बीमारी या बुखार हो सकता है।',
    exampleEn: 'The doctor cleaned the wound carefully to prevent a bacterial skin infection.',
    exampleHi: 'घाव में कीटाणुओं का संक्रमण न फैले, इसके लिए डॉक्टर ने उसे अच्छी तरह साफ किया।'
  },
  {
    id: 'dosage',
    termEn: 'Dosage',
    termHi: 'खुराक / मात्रा',
    pronunciation: 'DOH-sij',
    category: 'Prescription & Dosage',
    meaningEn: 'The exact amount, frequency, and duration of a medicine prescribed to be taken safely.',
    meaningHi: 'दवा की वह सटीक मात्रा (जैसे 500 मिलीग्राम) और समय जो डॉक्टर द्वारा मरीज के लिए सुरक्षित तय किया जाता है।',
    exampleEn: 'Always check the dosage written on the label before giving cough syrup to children.',
    exampleHi: 'बच्चों को खांसी की दवा देने से पहले शीशी पर लिखी सही खुराक अवश्य जांच लें।'
  },
  {
    id: 'side-effect',
    termEn: 'Side Effect',
    termHi: 'दुष्प्रभाव (साइड इफेक्ट)',
    pronunciation: 'SYD ih-fekt',
    category: 'Prescription & Dosage',
    meaningEn: 'An unintended, secondary effect (such as mild nausea, drowsiness, or dry mouth) that occurs alongside the main benefit of a medicine.',
    meaningHi: 'दवा के मुख्य असर के अलावा होने वाला कोई अवांछित असर, जैसे हल्का सिरदर्द, उनींदापन या जी मिचलाना।',
    exampleEn: 'Mild drowsiness is a common side effect of certain allergy medications.',
    exampleHi: 'एलर्जी की कुछ दवाओं से हल्की नींद या आलस आना एक आम दुष्प्रभाव है।'
  },
  {
    id: 'follow-up',
    termEn: 'Follow-up',
    termHi: 'पुनः परामर्श / फॉलो-अप',
    pronunciation: 'FOL-oh up',
    category: 'General Healthcare',
    meaningEn: 'A planned return visit to the doctor to check how well treatment is working and make needed adjustments.',
    meaningHi: 'इलाज का असर देखने और आगे की योजना बनाने के लिए तय समय पर डॉक्टर से दोबारा मिलना।',
    exampleEn: 'The doctor scheduled a follow-up appointment in 3 weeks to review the blood test results.',
    exampleHi: 'खून की जांच की रिपोर्ट देखने के लिए डॉक्टर ने 3 सप्ताह बाद पुनः परामर्श का समय दिया।'
  },
  {
    id: 'contraindication',
    termEn: 'Contraindication',
    termHi: 'निषेध / वर्जित स्थिति',
    pronunciation: 'kon-truh-in-dih-KAY-shun',
    category: 'Prescription & Dosage',
    meaningEn: 'A specific medical reason or condition that makes a particular medicine or treatment unsafe to use.',
    meaningHi: 'कोई ऐसा कारण या बीमारी जिसकी वजह से कोई विशेष दवा या इलाज लेना मरीज के लिए हानिकारक या मना हो सकता है।',
    exampleEn: 'A history of stomach ulcers can be a contraindication for taking high doses of ibuprofen.',
    exampleHi: 'पेट में अल्सर होना कुछ दर्द निवारक दवाओं के लिए निषेध (वर्जित) माना जाता है।'
  },
  {
    id: 'fasting-blood-sugar',
    termEn: 'Fasting Blood Sugar (FBS)',
    termHi: 'खाली पेट ब्लड शुगर',
    pronunciation: 'FAS-ting blud SHOO-ger',
    category: 'Laboratory & Tests',
    meaningEn: 'A test that measures glucose in your blood after you haven’t eaten or drunk anything (except plain water) for 8 to 10 hours.',
    meaningHi: 'रातभर (8 से 10 घंटे) बिना कुछ खाए-पिए सुबह खाली पेट खून में ग्लूकोज (शर्करा) की जांच।',
    exampleEn: 'Do not eat breakfast before your fasting blood sugar test; you may only drink plain water.',
    exampleHi: 'खाली पेट शुगर जांच से पहले नाश्ता न करें, केवल सादा पानी पी सकते हैं।'
  },
  {
    id: 'prn',
    termEn: 'PRN (Pro Re Nata / As Needed)',
    termHi: 'आवश्यकता पड़ने पर (एस.ओ.एस / पी.आर.एन)',
    pronunciation: 'pee-ar-en',
    category: 'Prescription & Dosage',
    meaningEn: 'A prescription instruction meaning to take the medicine only when a specific symptom arises, not continuously.',
    meaningHi: 'पर्चे पर लिखा संकेत जिसका अर्थ है कि दवा केवल लक्षण (जैसे सिरदर्द या उल्टी) होने पर ही लेनी है, रोज नहीं।',
    exampleEn: 'The paracetamol was marked PRN for fever above 100°F.',
    exampleHi: 'पैरासिटामोल केवल 100°F से अधिक बुखार होने पर लेने के लिए निर्धारित की गई थी।'
  },
  {
    id: 'antibiotic',
    termEn: 'Antibiotic',
    termHi: 'एंटीबायोटिक (जीवाणुरोधी दवा)',
    pronunciation: 'an-tee-by-OT-ik',
    category: 'Prescription & Dosage',
    meaningEn: 'Medicines that fight bacterial infections by killing bacteria or stopping their growth. They do NOT work against viral infections like the common cold.',
    meaningHi: 'बैक्टीरिया से होने वाले संक्रमण को खत्म करने वाली दवाएं। ये सर्दी-जुकाम जैसे वायरल रोगों पर काम नहीं करतीं।',
    exampleEn: 'Always complete the full course of an antibiotic even if you feel better after two days.',
    exampleHi: 'एंटीबायोटिक का पूरा कोर्स समाप्त करें, भले ही आप दो दिन में बेहतर महसूस करने लगें।'
  },
  {
    id: 'sublingual',
    termEn: 'Sublingual',
    termHi: 'जीभ के नीचे रखी जाने वाली दवा',
    pronunciation: 'sub-LING-gwul',
    category: 'Prescription & Dosage',
    meaningEn: 'A method of administering medication where the tablet is placed under the tongue to dissolve and enter the bloodstream rapidly.',
    meaningHi: 'दवा लेने का तरीका जिसमें गोली को निगलने के बजाय जीभ के नीचे रखा जाता है ताकि वह तुरंत घुलकर असर करे।',
    exampleEn: 'Sorbitrate is taken sublingually during acute chest pain for rapid absorption.',
    exampleHi: 'सीने में अचानक दर्द होने पर तेजी से राहत के लिए सॉरबिट्रेट गोली जीभ के नीचे रखी जाती है।'
  }
];

export const FICTIONAL_SAMPLE_REPORT = {
  id: 'fictional-demo-report',
  titleEn: 'Sample Fictional Health Report (CBC & Metabolic Panel)',
  titleHi: 'काल्पनिक नमूना रिपोर्ट (सीबीसी एवं मेटाबॉलिक पैनल)',
  patient: 'Aarav Sharma | Age: 45 Y | Gender: Male | Ref by: Dr. V. Sen',
  date: '14-Oct-2026',
  lab: 'Apex Diagnostics & Research Centre, New Delhi',
  text: `APEX DIAGNOSTICS & RESEARCH CENTRE
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
Notes: Fasting 10 hours confirmed. Bilirubin print smudged on thermal slip. ALP laboratory reference interval pending recalibration. Automated Analyzer Sysmex XN-1000.`
};

export const UI_STRINGS = {
  en: {
    appTitle: 'MedClear AI',
    tagline: 'Understand your healthcare. Make informed decisions.',
    disclaimer: 'MedClear AI helps explain medical information in simpler language. It does not provide a diagnosis or replace advice from a qualified healthcare professional. Confirm unclear medical instructions with your doctor or pharmacist.',
    nav: {
      dashboard: 'Dashboard',
      explain: 'Explain Instructions',
      reports: 'Report Reader',
      unclear: 'Unclear Instruction Detector',
      quiz: 'Understanding Check',
      dictionary: 'Medical Dictionary',
      visit: 'Visit Summary',
      accessibility: 'Accessibility Settings'
    },
    demoMode: 'Demo Mode',
    liveAI: 'Gemini 3.8 AI',
    tryDemo: 'Try Demo Examples',
    exampleA: 'Example A: Clear Prescription',
    exampleB: 'Example B: Ambiguous Text',
    clearBtn: 'Clear',
    copyBtn: 'Copy',
    copiedBtn: 'Copied!',
    listenBtn: 'Listen / Read Aloud',
    stopAudio: 'Stop Audio',
    speakInput: 'Voice Dictate',
    listening: 'Listening...',
    explainBtn: 'Explain Simply',
    detectBtn: 'Detect Ambiguities',
    generateSummary: 'Generate Visit Summary',
    startQuiz: 'Start Understanding Check',
    reportReader: 'Medical Report Reader'
  },
  hi: {
    appTitle: 'MedClear AI (मेडक्लियर एआई)',
    tagline: 'अपनी स्वास्थ्य देखभाल को समझें। सही निर्णय लें।',
    disclaimer: 'MedClear AI चिकित्सा जानकारी को सरल भाषा में समझाने में मदद करता है। यह किसी बीमारी का निदान नहीं करता और न ही किसी योग्य स्वास्थ्य विशेषज्ञ की सलाह का स्थान लेता है। अस्पष्ट निर्देशों की पुष्टि अपने डॉक्टर या फार्मासिस्ट से करें।',
    nav: {
      dashboard: 'डैशबोर्ड',
      explain: 'निर्देश सरल करें',
      reports: 'रिपोर्ट रीडर',
      unclear: 'अस्पष्ट निर्देश पहचानें',
      quiz: 'समझ जांचें (प्रश्नोत्तरी)',
      dictionary: 'चिकित्सा शब्दावली',
      visit: 'परामर्श सारांश',
      accessibility: 'सुलभता सेटिंग्स'
    },
    demoMode: 'डेमो मोड',
    liveAI: 'जेमिनी 3.8 एआई',
    tryDemo: 'डेमो उदाहरण आज़माएं',
    exampleA: 'उदाहरण A: स्पष्ट पर्चा',
    exampleB: 'उदाहरण B: अस्पष्ट पर्चा',
    clearBtn: 'हटाएं',
    copyBtn: 'कॉपी करें',
    copiedBtn: 'कॉपी हो गया!',
    listenBtn: 'सुनें (आवाज में)',
    stopAudio: 'आवाज रोकें',
    speakInput: 'बोलकर लिखें',
    listening: 'सुन रहा है...',
    explainBtn: 'सरल भाषा में समझें',
    detectBtn: 'अस्पष्टताएं जांचें',
    generateSummary: 'परामर्श सारांश बनाएं',
    startQuiz: 'समझ जांच शुरू करें',
    reportReader: 'मेडिकल रिपोर्ट रीडर'
  }
};
