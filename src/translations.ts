export type Language = 'en' | 'ur';

export interface Translations {
  appName: string;
  appTagline: string;
  signIn: string;
  signOut: string;
  analyze: string;
  contribute: string;
  explore: string;
  moderate: string;
  uploadTitle: string;
  uploadDesc: string;
  specimenType: string;
  category: string;
  analyzeBtn: string;
  analyzing: string;
  historyTitle: string;
  clearHistory: string;
  confirmClear: string;
  cancel: string;
  noHistory: string;
  resultsTitle: string;
  volumeDist: string;
  viewReport: string;
  share: string;
  searchPlaceholder: string;
  allCategories: string;
  allTypes: string;
  madeInPakistan: string;
  mineral: string;
  pollen: string;
  spore: string;
  fossil: string;
  rock: string;
  thinsection: string;
  handspecimen: string;
  outcrop: string;
  hardness: string;
  volume: string;
  era: string;
  origin: string;
  pending: string;
  approved: string;
  rejected: string;
  errorTitle: string;
  errorDesc: string;
  retry: string;
  welcomeTitle: string;
  welcomeDesc: string;
  continueWithGoogle: string;
  developedFor: string;
  authorInfo: string;
  leadScientist: string;
  proudlyDeveloped: string;
  rightsReserved: string;
  privacyPolicy: string;
  termsOfService: string;
  documentation: string;
  reset: string;
  newAnalysis: string;
  thinSec: string;
  handSpec: string;
  searchEraOrigin: string;
  contributeTitle: string;
  contributeDesc: string;
  uploadImage: string;
  idDetails: string;
  speciesName: string;
  volumePercent: string;
  byVolume: string;
  characteristics: string;
  geoEra: string;
  eraPlaceholder: string;
  originPlaceholder: string;
  color: string;
  colorPlaceholder: string;
  submitBtn: string;
  noSpecimens: string;
  unknownOrigin: string;
  unknownEra: string;
  modQueue: string;
  specimen: string;
  details: string;
  identification: string;
  actions: string;
  noPending: string;
  approve: string;
  reject: string;
  delete: string;
  shareTitle: string;
  shareText: string;
  copySuccess: string;
  reloadApp: string;
  contributeSuccess: string;
  deleteConfirm: string;
  analyzeError: string;
  submitError: string;
  clearHistoryError: string;
  signInError: string;
  dbConnError: string;
  rockType: string;
  texture: string;
  igneous: string;
  sedimentary: string;
  metamorphic: string;
  luster: string;
  streak: string;
  cleavage: string;
  fracture: string;
  magnetism: string;
  effervescence: string;
  grainSize: string;
  lusterPlaceholder: string;
  streakPlaceholder: string;
  cleavagePlaceholder: string;
  fracturePlaceholder: string;
  magnetismPlaceholder: string;
  effervescencePlaceholder: string;
  geologicalContext: string;
  contextPlaceholder: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "GeoIdentify Pro",
    appTagline: "Advanced Geological Specimen Analysis",
    signIn: "Sign In",
    signOut: "Sign Out",
    analyze: "Analyze",
    contribute: "Contribute",
    explore: "Explore",
    moderate: "Moderate",
    uploadTitle: "Upload Specimen Image",
    uploadDesc: "Drag and drop or click to upload a high-resolution geological image",
    specimenType: "Specimen Type",
    category: "Category",
    analyzeBtn: "Analyze Specimen",
    analyzing: "Analyzing...",
    historyTitle: "Analysis History",
    clearHistory: "Clear",
    confirmClear: "Confirm",
    cancel: "Cancel",
    noHistory: "No previous analyses found.",
    resultsTitle: "Analysis Results",
    volumeDist: "Volume Distribution",
    viewReport: "View Report",
    share: "Share",
    searchPlaceholder: "Search by era or geographic origin...",
    allCategories: "All Categories",
    allTypes: "All Types",
    madeInPakistan: "Made in Pakistan",
    mineral: "Mineral",
    pollen: "Pollen",
    spore: "Spore",
    fossil: "Fossil",
    rock: "Rock",
    thinsection: "Thin Section",
    handspecimen: "Hand Specimen",
    outcrop: "Outcrop",
    hardness: "Hardness",
    volume: "Volume",
    era: "Era",
    origin: "Origin",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    errorTitle: "Something went wrong",
    errorDesc: "An unexpected error occurred while running the application.",
    retry: "Retry",
    welcomeTitle: "Welcome to GeoIdentify Pro",
    welcomeDesc: "Sign in to start identifying rocks, minerals, pollen, spores, and fossils from your geological samples.",
    continueWithGoogle: "Continue with Google",
    developedFor: "Developed for geological research and education.",
    authorInfo: "Author Information",
    leadScientist: "Lead Scientist",
    proudlyDeveloped: "Proudly developed in Pakistan for the global geological community.",
    rightsReserved: "All rights reserved.",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    documentation: "Documentation",
    reset: "Reset",
    newAnalysis: "New Analysis",
    thinSec: "Thin Sec.",
    handSpec: "Hand Spec.",
    searchEraOrigin: "Search Era/Origin",
    contributeTitle: "Contribute Specimen",
    contributeDesc: "Share your geological findings with the community.",
    uploadImage: "Upload Image",
    idDetails: "Identification Details",
    speciesName: "Mineral/Species Name",
    volumePercent: "Volume %",
    byVolume: "% by volume",
    characteristics: "Key identifying characteristics...",
    geoEra: "Geological Era",
    eraPlaceholder: "e.g. Jurassic",
    originPlaceholder: "Geographic origin",
    color: "Color",
    colorPlaceholder: "Specimen color",
    submitBtn: "Submit Contribution",
    noSpecimens: "No approved specimens found matching your criteria.",
    unknownOrigin: "Unknown Origin",
    unknownEra: "Unknown Era",
    modQueue: "Moderation Queue",
    specimen: "Specimen",
    details: "Details",
    identification: "Identification",
    actions: "Actions",
    noPending: "No pending contributions to moderate.",
    approve: "Approve",
    reject: "Reject",
    delete: "Delete",
    shareTitle: "Geological Specimen",
    shareText: "Check out this specimen identified using GeoIdentify Pro.",
    copySuccess: "Specimen details copied to clipboard!",
    reloadApp: "Reload Application",
    contributeSuccess: "Contribution submitted for moderation!",
    deleteConfirm: "Are you sure you want to delete this record?",
    analyzeError: "Failed to analyze image. Please try again.",
    submitError: "Failed to submit contribution.",
    clearHistoryError: "Failed to clear history. Please try again.",
    signInError: "Failed to sign in. Please try again.",
    dbConnError: "Database connection failed. Please check your internet or configuration.",
    rockType: "Rock Type",
    texture: "Texture",
    igneous: "Igneous",
    sedimentary: "Sedimentary",
    metamorphic: "Metamorphic",
    luster: "Luster",
    streak: "Streak",
    cleavage: "Cleavage",
    fracture: "Fracture",
    magnetism: "Magnetism",
    effervescence: "Effervescence (HCl)",
    grainSize: "Grain Size",
    lusterPlaceholder: "e.g. Vitreous, Metallic",
    streakPlaceholder: "e.g. White, Red-brown",
    cleavagePlaceholder: "e.g. Perfect, Good",
    fracturePlaceholder: "e.g. Conchoidal",
    magnetismPlaceholder: "e.g. Strong, Weak, None",
    effervescencePlaceholder: "e.g. Strong, None",
    geologicalContext: "Geological Context",
    contextPlaceholder: "Provide background information about location or formation...",
  },
  ur: {
    appName: "جیو آئیڈینٹیفائی پرو",
    appTagline: "جدید ارضیاتی نمونوں کا تجزیہ",
    signIn: "سائن ان کریں",
    signOut: "سائن آؤٹ",
    analyze: "تجزیہ کریں",
    contribute: "تعاون کریں",
    explore: "دریافت کریں",
    moderate: "اعتدال پسندی",
    uploadTitle: "نمونے کی تصویر اپ لوڈ کریں",
    uploadDesc: "اعلی ریزولوشن والی ارضیاتی تصویر اپ لوڈ کرنے کے لیے گھسیٹیں اور چھوڑیں یا کلک کریں",
    specimenType: "نمونے کی قسم",
    category: "زمرہ",
    analyzeBtn: "نمونے کا تجزیہ کریں",
    analyzing: "تجزیہ ہو رہا ہے...",
    historyTitle: "تجزیہ کی تاریخ",
    clearHistory: "صاف کریں",
    confirmClear: "تصدیق کریں",
    cancel: "منسوخ کریں",
    noHistory: "کوئی سابقہ تجزیہ نہیں ملا۔",
    resultsTitle: "تجزیہ کے نتائج",
    volumeDist: "حجم کی تقسیم",
    viewReport: "رپورٹ دیکھیں",
    share: "شیئر کریں",
    searchPlaceholder: "عہد یا جغرافیائی اصل کے لحاظ سے تلاش کریں...",
    allCategories: "تمام زمرے",
    allTypes: "تمام اقسام",
    madeInPakistan: "پاکستان میں تیار کردہ",
    mineral: "معدنیات",
    pollen: "پولن",
    spore: "سپور",
    fossil: "فوسل",
    rock: "چٹان",
    thinsection: "باریک تراش",
    handspecimen: "ہاتھ کا نمونہ",
    outcrop: "آؤٹ کراپ",
    hardness: "سختی",
    volume: "حجم",
    era: "عہد",
    origin: "اصل",
    pending: "زیر التواء",
    approved: "منظور شدہ",
    rejected: "مسترد شدہ",
    errorTitle: "کچھ غلط ہو گیا",
    errorDesc: "ایپلیکیشن چلاتے وقت ایک غیر متوقع غلطی پیش آگئی۔",
    retry: "دوبارہ کوشش کریں",
    welcomeTitle: "جیو آئیڈینٹیفائی پرو میں خوش آمدید",
    welcomeDesc: "اپنے ارضیاتی نمونوں سے چٹانوں، معدنیات، پولن، سپورز اور فوسلز کی شناخت شروع کرنے کے لیے سائن ان کریں۔",
    continueWithGoogle: "گوگل کے ساتھ جاری رکھیں",
    developedFor: "ارضیاتی تحقیق اور تعلیم کے لیے تیار کیا گیا ہے۔",
    authorInfo: "مصنف کی معلومات",
    leadScientist: "لیڈ سائنٹسٹ",
    proudlyDeveloped: "عالمی ارضیاتی برادری کے لیے فخر کے ساتھ پاکستان میں تیار کیا گیا۔",
    rightsReserved: "جملہ حقوق محفوظ ہیں۔",
    privacyPolicy: "رازداری کی پالیسی",
    termsOfService: "سروس کی شرائط",
    documentation: "دستاویزات",
    reset: "دوبارہ ترتیب دیں",
    newAnalysis: "نیا تجزیہ",
    thinSec: "باریک تراش",
    handSpec: "ہاتھ کا نمونہ",
    searchEraOrigin: "عہد/اصل تلاش کریں",
    contributeTitle: "نمونہ جمع کروائیں",
    contributeDesc: "اپنی ارضیاتی دریافتیں کمیونٹی کے ساتھ شیئر کریں۔",
    uploadImage: "تصویر اپ لوڈ کریں",
    idDetails: "شناختی تفصیلات",
    speciesName: "معدنی/پرجاتیوں کا نام",
    volumePercent: "حجم %",
    byVolume: "حجم کے لحاظ سے %",
    characteristics: "اہم شناختی خصوصیات...",
    geoEra: "ارضیاتی دور",
    eraPlaceholder: "مثلاً جراسک",
    originPlaceholder: "جغرافیائی اصل",
    color: "رنگ",
    colorPlaceholder: "نمونے کا رنگ",
    submitBtn: "شراکت جمع کروائیں",
    noSpecimens: "آپ کے معیار کے مطابق کوئی منظور شدہ نمونے نہیں ملے۔",
    unknownOrigin: "نامعلوم اصل",
    unknownEra: "نامعلوم دور",
    modQueue: "اعتدال پسندی کی قطار",
    specimen: "نمونہ",
    details: "تفصیلات",
    identification: "شناخت",
    actions: "اعمال",
    noPending: "اعتدال کے لیے کوئی زیر التواء شراکتیں نہیں ہیں۔",
    approve: "منظور کریں",
    reject: "مسترد کریں",
    delete: "حذف کریں",
    shareTitle: "ارضیاتی نمونہ",
    shareText: "جیو آئیڈینٹیفائی پرو کا استعمال کرتے ہوئے شناخت کیے گئے اس نمونے کو دیکھیں۔",
    copySuccess: "نمونے کی تفصیلات کلپ بورڈ پر کاپی کر دی گئیں!",
    reloadApp: "ایپلیکیشن دوبارہ لوڈ کریں",
    contributeSuccess: "شراکت اعتدال کے لیے جمع کر دی گئی ہے!",
    deleteConfirm: "کیا آپ واقعی اس ریکارڈ کو حذف کرنا چاہتے ہیں؟",
    analyzeError: "تصویر کا تجزیہ کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔",
    submitError: "شراکت جمع کرنے میں ناکامی۔",
    clearHistoryError: "ہسٹری صاف کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔",
    signInError: "سائن ان کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔",
    dbConnError: "ڈیٹا بیس کنکشن ناکام ہوگیا۔ براہ کرم اپنا انٹرنیٹ یا کنفیگریشن چیک کریں۔",
    rockType: "چٹان کی قسم",
    texture: "بناوٹ",
    igneous: "آتشی",
    sedimentary: "رسوبی",
    metamorphic: "تغیراتی",
    luster: "چمک",
    streak: "لکیر",
    cleavage: "کلیویج",
    fracture: "فریکچر",
    magnetism: "مقناطیسیت",
    effervescence: "جوش (HCl ٹیسٹ)",
    grainSize: "ذرات کا سائز",
    lusterPlaceholder: "مثلاً شیشے جیسی، دھاتی",
    streakPlaceholder: "مثلاً سفید، سرخ بھورا",
    cleavagePlaceholder: "مثلاً بہترین، اچھی",
    fracturePlaceholder: "مثلاً شنک نما",
    magnetismPlaceholder: "مثلاً مضبوط، کمزور، کوئی نہیں",
    effervescencePlaceholder: "مثلاً تیز، کوئی نہیں",
    geologicalContext: "ارضیاتی سیاق و سباق",
    contextPlaceholder: "مقام یا تشکیل کے بارے میں پس منظر کی معلومات فراہم کریں...",
  }
};
