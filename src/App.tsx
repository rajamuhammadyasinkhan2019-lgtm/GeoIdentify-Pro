/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  auth, db, googleProvider, signInWithPopup, signOut, 
  collection, addDoc, onSnapshot, query, where, orderBy, Timestamp,
  getDocs, deleteDoc, doc,
  handleFirestoreError, OperationType
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { 
  Upload, 
  History, 
  Microscope, 
  Box, 
  LogOut, 
  LogIn, 
  Loader2, 
  ChevronRight, 
  PieChart as PieChartIcon,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Share2,
  Search,
  MapPin,
  ShieldCheck,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { translations, Language, Translations } from './translations';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
interface AnalysisResult {
  name: string;
  percentage: number;
  description: string;
}

interface IdentificationRecord {
  id: string;
  userId: string;
  imageUrl: string;
  type: 'thinsection' | 'handspecimen' | 'outcrop';
  category: 'mineral' | 'pollen' | 'spore' | 'fossil' | 'rock';
  status: 'pending' | 'approved' | 'rejected';
  geologicalEra?: string;
  geographicOrigin?: string;
  hardness?: number;
  color?: string;
  rockType?: string;
  texture?: string;
  crystalSystem?: string;
  refractiveIndex?: number;
  morphology?: string;
  context?: string;
  isContribution?: boolean;
  results: AnalysisResult[];
  timestamp: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode, t: any }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-red-100 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">{t.errorOccurred}</h2>
            <p className="text-stone-600 mb-6 text-sm">
              {this.state.error?.message?.startsWith('{') 
                ? t.dbError 
                : t.unexpectedError}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              {t.reloadApp}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  return (
    <ErrorBoundary t={t}>
      <GeoIdentifyApp lang={lang} setLang={setLang} />
    </ErrorBoundary>
  );
}

function GeoIdentifyApp({ lang, setLang }: { lang: Language, setLang: (l: Language) => void }) {
  const t = translations[lang];
  
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [specimenType, setSpecimenType] = useState<'thinsection' | 'handspecimen' | 'outcrop'>('thinsection');
  const [category, setCategory] = useState<'mineral' | 'pollen' | 'spore' | 'fossil' | 'rock'>('mineral');
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [history, setHistory] = useState<IdentificationRecord[]>([]);
  const [publicRecords, setPublicRecords] = useState<IdentificationRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'analyze' | 'contribute' | 'explore' | 'moderate'>('analyze');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Filtering state
  const [filters, setFilters] = useState({
    era: '',
    origin: '',
    category: '',
    type: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetAnalysis = () => {
    setImage(null);
    setResults(null);
    setError(null);
    setSpecimenType('thinsection');
    setCategory('mineral');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearHistory = async () => {
    if (!user) return;
    
    try {
      const q = query(collection(db, 'identifications'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'identifications', d.id)));
      await Promise.all(deletePromises);
      setShowClearConfirm(false);
    } catch (err) {
      console.error("Error clearing history:", err);
      setError(t.clearHistoryError);
    }
  };

  const handleShare = async (record: IdentificationRecord) => {
    const shareData = {
      title: `${t.shareTitle}: ${record.results[0]?.name}`,
      text: `${t.shareText} (${t[record.category as keyof Translations] || record.category} - ${t[record.type as keyof Translations] || record.type}). Era: ${record.geologicalEra}, Origin: ${record.geographicOrigin}.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        alert(t.copySuccess);
      } catch (err) {
        console.error("Clipboard error:", err);
      }
    }
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Check if admin
        const { getDoc, doc: firestoreDoc } = await import('firebase/firestore');
        const userDoc = await getDoc(firestoreDoc(db, 'users', u.uid));
        setIsAdmin(userDoc.data()?.role === 'admin' || u.email === 'rajamuhammadyasinkhan2019@gmail.com');
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // History Listener (User's own records)
  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const q = query(
      collection(db, 'identifications'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as IdentificationRecord[];
      setHistory(records);
    }, (err) => {
      console.error("History fetch error:", err);
    });

    return () => unsubscribe();
  }, [user]);

  // Public Records Listener (Approved contributions)
  useEffect(() => {
    const q = query(
      collection(db, 'identifications'),
      where('status', '==', 'approved'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as IdentificationRecord[];
      setPublicRecords(records);
    }, (err) => {
      console.error("Public records fetch error:", err);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login error:", err);
      setError(t.signInError);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResults(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContribution = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!image || !user) return;

    setAnalyzing(true);
    const formData = new FormData(e.currentTarget);
    
    const contributionData = {
      userId: user.uid,
      imageUrl: image,
      type: formData.get('type') as any,
      category: formData.get('category') as any,
      geologicalEra: formData.get('era') as string,
      geographicOrigin: formData.get('origin') as string,
      hardness: Number(formData.get('hardness')),
      color: formData.get('color') as string,
      rockType: formData.get('rockType') as string,
      texture: formData.get('texture') as string,
      crystalSystem: formData.get('crystalSystem') as string,
      refractiveIndex: Number(formData.get('refractiveIndex')),
      morphology: formData.get('morphology') as string,
      context: formData.get('context') as string,
      isContribution: true,
      status: 'pending',
      results: [{
        name: formData.get('name') as string,
        percentage: Number(formData.get('percentage')),
        description: formData.get('description') as string
      }],
      timestamp: Timestamp.now()
    };

    try {
      await addDoc(collection(db, 'identifications'), contributionData);
      setImage(null);
      setResults(null);
      setView('analyze');
      alert(t.contributeSuccess);
    } catch (err) {
      console.error("Contribution error:", err);
      setError(t.submitError);
    } finally {
      setAnalyzing(false);
    }
  };

  const moderateRecord = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { updateDoc, doc: firestoreDoc } = await import('firebase/firestore');
      await updateDoc(firestoreDoc(db, 'identifications', id), { status });
    } catch (err) {
      console.error("Moderation error:", err);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;
    try {
      const { deleteDoc, doc: firestoreDoc } = await import('firebase/firestore');
      await deleteDoc(firestoreDoc(db, 'identifications', id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredPublicRecords = publicRecords.filter(record => {
    return (!filters.era || record.geologicalEra?.toLowerCase().includes(filters.era.toLowerCase())) &&
           (!filters.origin || record.geographicOrigin?.toLowerCase().includes(filters.origin.toLowerCase())) &&
           (!filters.category || record.category === filters.category) &&
           (!filters.type || record.type === filters.type);
  });

  const analyzeImage = async () => {
    if (!image || !user) return;

    setAnalyzing(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              results: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    percentage: { type: "number" },
                    description: { type: "string" }
                  },
                  required: ["name", "percentage", "description"]
                }
              },
              rockType: { type: "string", description: "If category is rock, identify as Igneous, Sedimentary, or Metamorphic" },
              texture: { type: "string", description: "If category is rock, describe texture" },
              geologicalEra: { type: "string" },
              geographicOrigin: { type: "string" }
            },
            required: ["results"]
          }
        },
        contents: [
          {
            parts: [
              {
                text: `Analyze this ${specimenType} image for ${category} content. 
                If it's an outcrop, identify the primary geological formations, lithology, and any visible fossils or minerals.
                ${category === 'rock' ? 'Identify the rock type (Igneous, Sedimentary, or Metamorphic), its mineral composition, texture, and name.' : `Identify the specific ${category}s present and estimate their percentage by volume.`}
                Also estimate the geological era and geographic origin if possible.
                Provide a detailed description for each identified item.`
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: image.split(',')[1]
                }
              }
            ]
          }
        ]
      });

      const response = await model;
      const data = JSON.parse(response.text || '{"results":[]}');
      const analysisResults = data.results as AnalysisResult[];
      
      setResults(analysisResults);

      // Save to Firestore
      const path = 'identifications';
      try {
        await addDoc(collection(db, path), {
          userId: user.uid,
          imageUrl: image,
          type: specimenType,
          category: category,
          results: analysisResults,
          rockType: data.rockType || undefined,
          texture: data.texture || undefined,
          geologicalEra: data.geologicalEra || undefined,
          geographicOrigin: data.geographicOrigin || undefined,
          status: 'approved', // Auto-approved for personal analysis
          timestamp: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }

    } catch (err) {
      console.error("Analysis error:", err);
      setError(t.analyzeError);
    } finally {
      setAnalyzing(false);
    }
  };

  const renderAnalyzeView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Analysis Tool */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                {t.newAnalysis}
              </h2>
              <button 
                onClick={resetAnalysis}
                className="text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-emerald-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                {t.reset}
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.specimenType}</label>
                <div className="flex p-1 bg-stone-100 rounded-lg">
                  <button 
                    onClick={() => setSpecimenType('thinsection')}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                      specimenType === 'thinsection' ? "bg-white shadow-sm text-emerald-700" : "text-stone-600 hover:text-stone-900"
                    )}
                  >
                    {t.thinSec}
                  </button>
                  <button 
                    onClick={() => setSpecimenType('handspecimen')}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                      specimenType === 'handspecimen' ? "bg-white shadow-sm text-emerald-700" : "text-stone-600 hover:text-stone-900"
                    )}
                  >
                    {t.handSpec}
                  </button>
                  <button 
                    onClick={() => setSpecimenType('outcrop')}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                      specimenType === 'outcrop' ? "bg-white shadow-sm text-emerald-700" : "text-stone-600 hover:text-stone-900"
                    )}
                  >
                    {t.outcrop}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.category}</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-stone-100 border-none rounded-lg py-2 px-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="mineral">{t.mineral}</option>
                  <option value="pollen">{t.pollen}</option>
                  <option value="spore">{t.spore}</option>
                  <option value="fossil">{t.fossil}</option>
                  <option value="rock">{t.rock}</option>
                </select>
              </div>
            </div>

            {/* Image Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden",
                image ? "border-emerald-500 bg-stone-50" : "border-stone-300 hover:border-emerald-400 bg-stone-50 hover:bg-stone-100"
              )}
            >
              {image ? (
                <>
                  <img src={image} alt="Specimen" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Change Image
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-6 h-6 text-stone-500" />
                  </div>
                  <p className="text-sm font-medium text-stone-700">{t.uploadTitle}</p>
                  <p className="text-xs text-stone-500 mt-1">{t.uploadDesc}</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button 
              onClick={analyzeImage}
              disabled={!image || analyzing}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3",
                !image || analyzing 
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed" 
                  : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
              )}
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {t.analyzing}
                </>
              ) : (
                <>
                  <Microscope className="w-6 h-6" />
                  {t.analyzeBtn}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Display */}
        {results && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="w-5 h-5" />
                {t.resultsTitle}
              </h2>
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                {t[category as keyof Translations] || category}
              </span>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {results.map((res, idx) => (
                  <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-stone-800">{res.name}</h3>
                      <span className="text-sm font-black text-emerald-600">{res.percentage}%</span>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">{res.description}</p>
                  </div>
                ))}
              </div>

              <div className="h-[300px] flex flex-col items-center justify-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">{t.volumeDist}</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={results}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="percentage"
                    >
                      {results.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: History */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden h-full flex flex-col">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              {t.historyTitle}
            </h2>
            {history.length > 0 && !showClearConfirm && (
              <button 
                onClick={() => setShowClearConfirm(true)}
                className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                {t.clearHistory}
              </button>
            )}
            {showClearConfirm && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleClearHistory}
                  className="text-[10px] font-bold uppercase bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                >
                  {t.confirmClear}
                </button>
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className="text-[10px] font-bold uppercase text-stone-400 hover:text-stone-600"
                >
                  {t.cancel}
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[800px]">
            {history.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Box className="w-6 h-6 text-stone-300" />
                </div>
                <p className="text-sm text-stone-500">{t.noHistory}</p>
              </div>
            ) : (
              history.map((record) => (
                <div 
                  key={record.id} 
                  className="group bg-white border border-stone-100 rounded-xl p-3 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    setImage(record.imageUrl);
                    setResults(record.results);
                    setSpecimenType(record.type);
                    setCategory(record.category);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-stone-100">
                      <img src={record.imageUrl} alt="History" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-tight">
                          {record.category}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {record.timestamp?.toDate().toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-stone-800 truncate">
                        {record.results[0]?.name || 'Unknown'}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                        {record.results.map(r => `${r.name} (${r.percentage}%)`).join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContributeView = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Share2 className="w-6 h-6 text-emerald-600" />
            {t.contributeTitle}
          </h2>
          <p className="text-sm text-stone-500 mt-1">{t.contributeDesc}</p>
        </div>

        <form onSubmit={handleContribution} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.uploadImage}</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden",
                    image ? "border-emerald-500 bg-stone-50" : "border-stone-300 hover:border-emerald-400 bg-stone-50 hover:bg-stone-100"
                  )}
                >
                  {image ? (
                    <>
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-medium">{t.uploadTitle}</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                      <p className="text-xs font-medium text-stone-600">{t.uploadImage}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.specimenType}</label>
                  <select name="type" className="w-full bg-stone-100 border-none rounded-lg py-2 px-3 text-sm font-medium">
                    <option value="thinsection">{t.thinsection}</option>
                    <option value="handspecimen">{t.handspecimen}</option>
                    <option value="outcrop">{t.outcrop}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.category}</label>
                  <select name="category" className="w-full bg-stone-100 border-none rounded-lg py-2 px-3 text-sm font-medium">
                    <option value="mineral">{t.mineral}</option>
                    <option value="pollen">{t.pollen}</option>
                    <option value="spore">{t.spore}</option>
                    <option value="fossil">{t.fossil}</option>
                    <option value="rock">{t.rock}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.idDetails}</label>
                <input 
                  name="name" 
                  required 
                  placeholder={t.speciesName} 
                  className="w-full bg-stone-100 border-none rounded-lg py-2 px-3 text-sm font-medium"
                />
                <div className="flex items-center gap-2">
                  <input 
                    name="percentage" 
                    type="number" 
                    required 
                    min="0" 
                    max="100" 
                    placeholder={t.volumePercent} 
                    className="w-24 bg-stone-100 border-none rounded-lg py-2 px-3 text-sm font-medium"
                  />
                  <span className="text-sm text-stone-500">{t.byVolume}</span>
                </div>
                <textarea 
                  name="description" 
                  required 
                  placeholder={t.characteristics} 
                  className="w-full bg-stone-100 border-none rounded-lg py-2 px-3 text-sm font-medium h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.geoEra}</label>
                  <input name="era" placeholder={t.eraPlaceholder} className="w-full bg-stone-100 border-none rounded-lg py-2 px-3 text-sm font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.origin}</label>
                  <input name="origin" placeholder={t.originPlaceholder} className="w-full bg-stone-100 border-none rounded-lg py-2 px-3 text-sm font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.hardness}</label>
                  <input name="hardness" type="number" step="0.1" placeholder="e.g. 7.0" className="w-full bg-stone-100 border-none rounded-lg py-2 px-3 text-sm font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.color}</label>
                  <input name="color" placeholder={t.colorPlaceholder} className="w-full bg-stone-100 border-none rounded-lg py-2 px-3 text-sm font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.rockType}</label>
                  <select name="rockType" className="w-full bg-stone-100 border-none rounded-lg py-2 px-3 text-sm font-medium">
                    <option value="">Select Type</option>
                    <option value="Igneous">{t.igneous}</option>
                    <option value="Sedimentary">{t.sedimentary}</option>
                    <option value="Metamorphic">{t.metamorphic}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.texture}</label>
                  <input name="texture" placeholder="e.g. Crystalline" className="w-full bg-stone-100 border-none rounded-lg py-2 px-3 text-sm font-medium" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-100 flex justify-end">
            <button 
              type="submit"
              disabled={!image || analyzing}
              className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
              {t.submitBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderExploreView = () => (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.searchEraOrigin}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input 
                type="text"
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 bg-stone-100 border-none rounded-lg text-sm"
                onChange={(e) => setFilters(prev => ({ ...prev, era: e.target.value, origin: e.target.value }))}
              />
            </div>
          </div>
          <div className="w-full md:w-48 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.category}</label>
            <select 
              className="w-full bg-stone-100 border-none rounded-lg py-2 px-3 text-sm"
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any || undefined }))}
            >
              <option value="">{t.allCategories}</option>
              <option value="mineral">{t.mineral}</option>
              <option value="pollen">{t.pollen}</option>
              <option value="spore">{t.spore}</option>
              <option value="fossil">{t.fossil}</option>
              <option value="rock">{t.rock}</option>
            </select>
          </div>
          <div className="w-full md:w-48 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.specimenType}</label>
            <select 
              className="w-full bg-stone-100 border-none rounded-lg py-2 px-3 text-sm"
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any || undefined }))}
            >
              <option value="">{t.allTypes}</option>
              <option value="thinsection">{t.thinsection}</option>
              <option value="handspecimen">{t.handspecimen}</option>
              <option value="outcrop">{t.outcrop}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPublicRecords.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-stone-200">
            <Box className="w-12 h-12 text-stone-200 mx-auto mb-4" />
            <p className="text-stone-500">{t.noSpecimens}</p>
          </div>
        ) : (
          filteredPublicRecords.map(record => (
            <div key={record.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden group hover:shadow-md transition-all">
              <div className="aspect-video relative overflow-hidden">
                <img src={record.imageUrl} alt={record.results[0]?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                    {t[record.category as keyof Translations] || record.category}
                  </span>
                  <span className="bg-emerald-600/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                    {t[record.type as keyof Translations] || record.type}
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-800">{record.results[0]?.name}</h3>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {record.geographicOrigin || t.unknownOrigin} • {record.geologicalEra || t.unknownEra}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-stone-50 p-2 rounded-lg">
                    <p className="text-[10px] font-bold uppercase text-stone-400">{t.hardness}</p>
                    <p className="text-sm font-bold text-stone-700">{record.hardness || 'N/A'}</p>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-lg">
                    <p className="text-[10px] font-bold uppercase text-stone-400">{t.volume}</p>
                    <p className="text-sm font-bold text-stone-700">{record.results[0]?.percentage}%</p>
                  </div>
                </div>

                {record.category === 'rock' && (record.rockType || record.texture) && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {record.rockType && (
                      <div className="bg-emerald-50 p-2 rounded-lg">
                        <p className="text-[10px] font-bold uppercase text-emerald-600">{t.rockType}</p>
                        <p className="text-xs font-bold text-emerald-800">{record.rockType}</p>
                      </div>
                    )}
                    {record.texture && (
                      <div className="bg-emerald-50 p-2 rounded-lg">
                        <p className="text-[10px] font-bold uppercase text-emerald-600">{t.texture}</p>
                        <p className="text-xs font-bold text-emerald-800">{record.texture}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        // Show detailed report modal logic could go here
                        alert(`Specimen Analysis Report for ${record.results[0]?.name}\n\nCharacteristics: ${record.results[0]?.description}\nEra: ${record.geologicalEra}\nOrigin: ${record.geographicOrigin}`);
                      }}
                      className="text-emerald-600 text-sm font-bold hover:text-emerald-700 transition-colors flex items-center gap-1"
                    >
                      {t.viewReport}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleShare(record)}
                      className="text-stone-400 hover:text-emerald-600 transition-colors flex items-center gap-1 text-sm font-medium"
                      title={t.share}
                    >
                      <Share2 className="w-4 h-4" />
                      {t.share}
                    </button>
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {record.timestamp?.toDate().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderModerateView = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-100 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          {t.modQueue}
        </h2>
        <span className="bg-stone-100 text-stone-600 text-xs font-bold px-2 py-1 rounded-full">
          {publicRecords.filter(r => r.status === 'pending').length} {t.pending}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">{t.specimen}</th>
              <th className="px-6 py-4">{t.details}</th>
              <th className="px-6 py-4">{t.identification}</th>
              <th className="px-6 py-4">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {publicRecords.filter(r => r.status === 'pending').map(record => (
              <tr key={record.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="w-24 aspect-video rounded-lg overflow-hidden border border-stone-200">
                    <img src={record.imageUrl} alt="Pending" className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-stone-800 capitalize">{t[record.type as keyof Translations] || record.type} • {t[record.category as keyof Translations] || record.category}</p>
                    <p className="text-xs text-stone-500">{record.geographicOrigin} • {record.geologicalEra}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-700">{record.results[0]?.name} ({record.results[0]?.percentage}%)</p>
                    <p className="text-xs text-stone-500 line-clamp-1">{record.results[0]?.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => moderateRecord(record.id, 'approved')}
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                      title={t.approve}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => moderateRecord(record.id, 'rejected')}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title={t.reject}
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => deleteRecord(record.id)}
                      className="p-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors"
                      title={t.delete}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {publicRecords.filter(r => r.status === 'pending').length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-stone-500">
                  {t.noPending}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Connection Test
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { getDocFromServer, doc: firestoreDoc } = await import('firebase/firestore');
        await getDocFromServer(firestoreDoc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
          setError(t.dbConnError);
        }
      }
    };
    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('analyze')}>
              <div className="bg-emerald-600 p-2 rounded-lg">
                <Microscope className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-emerald-900">GeoIdentify Pro</h1>
            </div>

            {user && (
              <nav className="hidden md:flex items-center gap-1">
                <button 
                  onClick={() => setView('analyze')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    view === 'analyze' ? "bg-emerald-50 text-emerald-700" : "text-stone-600 hover:bg-stone-50"
                  )}
                >
                  Analyze
                </button>
                <button 
                  onClick={() => setView('contribute')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    view === 'contribute' ? "bg-emerald-50 text-emerald-700" : "text-stone-600 hover:bg-stone-50"
                  )}
                >
                  Contribute
                </button>
                <button 
                  onClick={() => setView('explore')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    view === 'explore' ? "bg-emerald-50 text-emerald-700" : "text-stone-600 hover:bg-stone-50"
                  )}
                >
                  Explore
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => setView('moderate')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      view === 'moderate' ? "bg-emerald-50 text-emerald-700" : "text-stone-600 hover:bg-stone-50"
                    )}
                  >
                    Moderate
                  </button>
                )}
              </nav>
            )}
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium">{user.displayName}</span>
                <span className="text-xs text-stone-500">{user.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {!user ? (
          <div className="max-w-md mx-auto mt-12 text-center space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
              <h2 className="text-2xl font-bold mb-4">{t.welcomeTitle}</h2>
              <p className="text-stone-600 mb-8">
                {t.welcomeDesc}
              </p>
              <button 
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white border border-stone-300 text-stone-700 px-6 py-3 rounded-xl hover:bg-stone-50 transition-all font-medium shadow-sm"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                {t.continueWithGoogle}
              </button>
            </div>
            <p className="text-sm text-stone-500">
              {t.developedFor}
            </p>
          </div>
        ) : (
          <>
            {view === 'analyze' && renderAnalyzeView()}
            {view === 'contribute' && renderContributeView()}
            {view === 'explore' && renderExploreView()}
            {view === 'moderate' && isAdmin && renderModerateView()}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Microscope className="w-6 h-6 text-emerald-500" />
                <span className="text-xl font-bold text-white">{t.appName}</span>
              </div>
              <p className="text-sm leading-relaxed">
                Advanced AI-powered geological identification system for thin sections and hand specimens. 
                Automated volume estimation for minerals, pollen, spores, and fossils.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-white font-bold uppercase tracking-widest text-xs">{t.authorInfo}</h4>
              <div className="space-y-2">
                <p className="text-sm font-medium text-stone-200">Muhammad Yasin Khan</p>
                <p className="text-xs">Geological Researcher & Developer</p>
                <div className="pt-2">
                  <span className="bg-emerald-900/50 text-emerald-400 text-[10px] font-bold uppercase tracking-tighter px-2 py-1 rounded border border-emerald-800/50">
                    {t.leadScientist}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-bold uppercase tracking-widest text-xs">{t.origin}</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 flex rounded-sm overflow-hidden border border-emerald-800 shadow-sm">
                  <div className="w-1/4 h-full bg-white"></div>
                  <div className="w-3/4 h-full bg-[#01411C] relative">
                    {/* Crescent */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
                    <div className="absolute top-1/2 left-[58%] -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#01411C] rounded-full"></div>
                    {/* Star */}
                    <div className="absolute top-[25%] right-[20%] w-1 h-1 bg-white rotate-45"></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    {t.madeInPakistan}
                  </p>
                  <p className="text-xs">{t.proudlyDeveloped}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs">© 2026 {t.appName}. {t.rightsReserved}</p>
            <div className="flex gap-6 text-xs">
              <a href="#" className="hover:text-white transition-colors">{t.privacyPolicy}</a>
              <a href="#" className="hover:text-white transition-colors">{t.termsOfService}</a>
              <a href="#" className="hover:text-white transition-colors">{t.documentation}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
