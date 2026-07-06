import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, ShieldAlert, Heart, Activity, Check, ChevronRight, BookOpen, 
  Layers, UserCheck, AlertTriangle, AlertOctagon, HelpCircle, Pill, X
} from "lucide-react";
import { DISEASE_LIBRARY, MEDICINE_DATABASE } from "../data";
import { DiseaseLibraryItem, MedicineDetails } from "../types";
import { isStaticDeployment, getClientApiKey, getClientOpenAIKey, getActiveAIProvider, callGeminiDirect, callOpenAIDirect, getOfflineDiseaseDetails, getOfflineMedicineDetails } from "../utils/apiFallback";

export default function DiseaseView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customDiseases, setCustomDiseases] = useState<DiseaseLibraryItem[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseLibraryItem>(DISEASE_LIBRARY[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for Tablet/Medicine detail monograph
  const [selectedMedName, setSelectedMedName] = useState<string | null>(null);
  const [selectedMedDetails, setSelectedMedDetails] = useState<MedicineDetails | null>(null);
  const [isMedLoading, setIsMedLoading] = useState(false);
  const [medError, setMedError] = useState<string | null>(null);

  const allDiseases = [...DISEASE_LIBRARY, ...customDiseases];

  const filteredLibrary = allDiseases.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = async (query: string) => {
    const term = query.trim();
    if (!term) return;

    setError(null);

    setIsLoading(true);
    try {
      let diseaseData: any = null;

      const apiKey = getClientApiKey();
      const openAiKey = getClientOpenAIKey();
      const activeProvider = getActiveAIProvider();
      const isStatic = isStaticDeployment();

      const useDirectMode = isStatic || (activeProvider === "openai" ? openAiKey : apiKey);

      if (useDirectMode) {
        if (activeProvider === "openai" && openAiKey) {
          const prompt = `Formulate a comprehensive medical fact sheet for the disease pathology named: "${term}". Ensure accuracy and clear professional tone.`;
          const systemInstruction = 
            "You are an expert clinical pathology database system. Return complete disease monographs in structured JSON conforming exactly to this structure:\n" +
            "{\n" +
            "  \"name\": \"string (disease name)\",\n" +
            "  \"image\": \"string (high-quality medical unsplash stock image url)\",\n" +
            "  \"symptoms\": [\"symptom1\"],\n" +
            "  \"causes\": [\"cause1\"],\n" +
            "  \"stages\": [\"stage1\"],\n" +
            "  \"complications\": [\"complication1\"],\n" +
            "  \"treatment\": \"string\",\n" +
            "  \"medicines\": [\"medicine1\"],\n" +
            "  \"lifestyleTips\": [\"tip1\"],\n" +
            "  \"emergencySigns\": [\"sign1\"]\n" +
            "}";
          const jsonText = await callOpenAIDirect(openAiKey, prompt, systemInstruction, true);
          diseaseData = JSON.parse(jsonText || "{}");
        } else if (activeProvider === "gemini" && apiKey) {
          const prompt = `Formulate a comprehensive medical fact sheet for the disease pathology named: "${term}". Ensure accuracy and clear professional tone.`;
          const systemInstruction = "You are an expert clinical pathology database system. Return complete disease monographs in structured JSON. Ensure no field is left unpopulated.";
          const responseSchema = {
            type: "OBJECT",
            required: [
              "name", "image", "symptoms", "causes", "stages", "complications", "treatment", "medicines", "lifestyleTips", "emergencySigns"
            ],
            properties: {
              name: { type: "STRING" },
              image: { type: "STRING" },
              symptoms: { type: "ARRAY", items: { type: "STRING" } },
              causes: { type: "ARRAY", items: { type: "STRING" } },
              stages: { type: "ARRAY", items: { type: "STRING" } },
              complications: { type: "ARRAY", items: { type: "STRING" } },
              treatment: { type: "STRING" },
              medicines: { type: "ARRAY", items: { type: "STRING" } },
              lifestyleTips: { type: "ARRAY", items: { type: "STRING" } },
              emergencySigns: { type: "ARRAY", items: { type: "STRING" } }
            }
          };
          const jsonText = await callGeminiDirect(apiKey, prompt, systemInstruction, responseSchema);
          diseaseData = JSON.parse(jsonText || "{}");
        } else if (isStatic) {
          diseaseData = getOfflineDiseaseDetails(term);
        }
      }

      if (!diseaseData) {
        const res = await fetch("/api/disease-details", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-active-provider": activeProvider,
            "x-gemini-api-key": apiKey,
            "x-openai-api-key": openAiKey
          },
          body: JSON.stringify({ name: term })
        });

        let data: any;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(text.slice(0, 200) || `Server returned status ${res.status}`);
        }

        if (!res.ok) {
          throw new Error(data?.error || `Pathology lookup failed with status ${res.status}`);
        }
        diseaseData = data;
      }

      setCustomDiseases(prev => {
        // Only append if it doesn't already exist in customDiseases
        if (prev.some(d => d.name.toLowerCase() === diseaseData.name.toLowerCase())) {
          return prev;
        }
        return [...prev, diseaseData];
      });
      setSelectedDisease(diseaseData);
    } catch (err: any) {
      console.warn("Pathology lookup failed, falling back to offline details:", err);
      const fallbackData = getOfflineDiseaseDetails(term);
      fallbackData.treatment = "DEMO MODE NOTICE (System under high demand - Click 'Configure Gemini API Key' in the top banner to apply a personal key for live high-speed pathology reports): " + fallbackData.treatment;
      
      setCustomDiseases(prev => {
        if (prev.some(d => d.name.toLowerCase() === fallbackData.name.toLowerCase())) {
          return prev;
        }
        return [...prev, fallbackData];
      });
      setSelectedDisease(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMedicineModal = async (medName: string) => {
    setSelectedMedName(medName);
    setIsMedLoading(true);
    setMedError(null);
    setSelectedMedDetails(null);

    // Check local database first
    const matchedKey = Object.keys(MEDICINE_DATABASE).find(
      key => key.toLowerCase() === medName.toLowerCase() || medName.toLowerCase().includes(key.toLowerCase())
    );

    if (matchedKey) {
      setSelectedMedDetails(MEDICINE_DATABASE[matchedKey]);
      setIsMedLoading(false);
      return;
    }

    // Try fetching from backend / AI
    try {
      const apiKey = getClientApiKey();
      const openAiKey = getClientOpenAIKey();
      const activeProvider = getActiveAIProvider();
      const isStatic = isStaticDeployment();

      const useDirectMode = isStatic || (activeProvider === "openai" ? openAiKey : apiKey);
      let medData: any = null;

      if (useDirectMode) {
        if (activeProvider === "openai" && openAiKey) {
          const prompt = `Formulate a comprehensive medical fact sheet for the medicine named: "${medName}". Ensure accuracy and clear professional tone.`;
          const systemInstruction = 
            "You are an expert clinical database system. Return complete medical monographs in structured JSON conforming exactly to this structure:\n" +
            "{\n" +
            "  \"name\": \"string (name of medicine)\",\n" +
            "  \"uses\": [\"use1\"],\n" +
            "  \"dosage\": \"string\",\n" +
            "  \"sideEffects\": [\"sideEffect1\"],\n" +
            "  \"storage\": \"string\",\n" +
            "  \"manufacturer\": \"string\",\n" +
            "  \"composition\": \"string (Chemical formulation or main strength ingredients)\",\n" +
            "  \"pregnancyWarning\": \"string (Is it safe during pregnancy? Detail warnings)\",\n" +
            "  \"breastfeedingWarning\": \"string (Is it safe during breastfeeding?)\",\n" +
            "  \"alcoholInteraction\": \"string\",\n" +
            "  \"foodInteraction\": \"string\",\n" +
            "  \"expiryInfo\": \"string\",\n" +
            "  \"availableStrengths\": [\"strength1\"],\n" +
            "  \"alternatives\": [\"equivalent1\"],\n" +
            "  \"warnings\": \"string (Contraindications and crucial warnings)\",\n" +
            "  \"faqs\": [{\"question\": \"faq question\", \"answer\": \"faq answer\"}]\n" +
            "}";
          const jsonText = await callOpenAIDirect(openAiKey, prompt, systemInstruction, true);
          medData = JSON.parse(jsonText || "{}");
        } else if (activeProvider === "gemini" && apiKey) {
          const prompt = `Formulate a comprehensive medical fact sheet for the medicine named: "${medName}". Ensure accuracy and clear professional tone.`;
          const systemInstruction = "You are an expert clinical database system. Return complete medical monographs in structured JSON. Ensure no field is left unpopulated.";
          const responseSchema = {
            type: "OBJECT",
            required: [
              "name", "uses", "dosage", "sideEffects", "storage", "manufacturer", "composition",
              "pregnancyWarning", "breastfeedingWarning", "alcoholInteraction", "foodInteraction",
              "expiryInfo", "availableStrengths", "alternatives", "warnings", "faqs"
            ],
            properties: {
              name: { type: "STRING" },
              uses: { type: "ARRAY", items: { type: "STRING" } },
              dosage: { type: "STRING" },
              sideEffects: { type: "ARRAY", items: { type: "STRING" } },
              storage: { type: "STRING" },
              manufacturer: { type: "STRING" },
              composition: { type: "STRING" },
              pregnancyWarning: { type: "STRING" },
              breastfeedingWarning: { type: "STRING" },
              alcoholInteraction: { type: "STRING" },
              foodInteraction: { type: "STRING" },
              expiryInfo: { type: "STRING" },
              availableStrengths: { type: "ARRAY", items: { type: "STRING" } },
              alternatives: { type: "ARRAY", items: { type: "STRING" } },
              warnings: { type: "STRING" },
              faqs: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  required: ["question", "answer"],
                  properties: {
                    question: { type: "STRING" },
                    answer: { type: "STRING" }
                  }
                }
              }
            }
          };
          const jsonText = await callGeminiDirect(apiKey, prompt, systemInstruction, responseSchema);
          medData = JSON.parse(jsonText || "{}");
        } else {
          medData = getOfflineMedicineDetails(medName);
        }
      } else {
        const res = await fetch("/api/medicine-details", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-active-provider": activeProvider,
            "x-gemini-api-key": apiKey,
            "x-openai-api-key": openAiKey
          },
          body: JSON.stringify({ name: medName })
        });

        if (res.ok) {
          medData = await res.json();
        } else {
          throw new Error(`Failed to fetch medicine details: status ${res.status}`);
        }
      }

      if (medData) {
        setSelectedMedDetails(medData);
      } else {
        throw new Error("Could not formulate details.");
      }
    } catch (err: any) {
      console.warn("Tablet details fetch failed, falling back to local simulation:", err);
      setSelectedMedDetails(getOfflineMedicineDetails(medName));
    } finally {
      setIsMedLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-950 text-white min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 text-xs font-semibold">
          <BookOpen className="h-4 w-4 text-cyan-300" />
          Clinical Disease & Pathology Directory
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Active Disease Library Reference</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Search clinically compiled disease profiles. Study development trajectories, stages, typical prescription compounds, lifestyle guidelines, and emergency red-flags.
        </p>
      </div>

      {/* Main Grid: Sidebar + Details Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Search & Disease list */}
        <div className="lg:col-span-4 p-5 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="h-4.5 w-4.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                placeholder="Search diseases (e.g. Diabetes, Asthma)..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-slate-600"
              />
            </div>
            <button
              onClick={() => handleSearch(searchQuery)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold hover:opacity-95 transition cursor-pointer shrink-0"
            >
              Search
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block px-1">Diseases ({filteredLibrary.length})</span>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredLibrary.map((disease, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDisease(disease);
                    setError(null);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition cursor-pointer ${
                    selectedDisease?.name === disease.name
                      ? "bg-white/10 border-cyan-500/30 text-cyan-400"
                      : "bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-semibold">{disease.name}</span>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </button>
              ))}

              {filteredLibrary.length === 0 && (
                <div className="p-4 text-center space-y-2">
                  <p className="text-xs text-slate-500 italic">No matching diseases found.</p>
                  {searchQuery.trim() && (
                    <button
                      onClick={() => handleSearch(searchQuery)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-400 font-bold hover:bg-cyan-950/60 transition cursor-pointer"
                    >
                      ✨ Search BioWeb AI
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Disease Details Monograph */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 text-center rounded-2xl border border-white/10 bg-slate-900/40 flex flex-col items-center justify-center space-y-4"
              >
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                  <Activity className="h-6 w-6 text-cyan-400 absolute top-5 left-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Querying Pathology Directory...</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">Generating cellular disease markers and compiling active therapeutics from clinical knowledge.</p>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 text-center rounded-xl border border-red-500/20 bg-red-950/25 text-sm text-red-200 space-y-3"
              >
                <p className="font-medium">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold rounded-lg cursor-pointer transition"
                >
                  Dismiss
                </button>
              </motion.div>
            ) : selectedDisease ? (
              <motion.div
                key={selectedDisease.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md space-y-8 shadow-xl"
              >
              {/* Header Info */}
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center pb-6 border-b border-white/10">
                <div className="h-24 w-24 rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shrink-0">
                  <img src={selectedDisease.image} alt={selectedDisease.name} className="object-cover w-full h-full opacity-80" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Clinical Monographs</span>
                  <h3 className="text-2xl font-black text-white">{selectedDisease.name}</h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedDisease.medicines.map((med, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                        {med}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Triggers / Causes & Symptoms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-400" /> Etiology & Triggers
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                    {selectedDisease.causes.map((cause, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-cyan-400" /> Pathological Indicators
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                    {selectedDisease.symptoms.map((sym, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                        <span>{sym}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Stages / Trajectory (Bento/Translucent Box) */}
              <div className="space-y-3 pt-6 border-t border-white/5">
                <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-blue-400" /> Clinical Progression Trajectory
                </h4>
                <div className="space-y-2">
                  {selectedDisease.stages.map((stage, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                      {stage}
                    </div>
                  ))}
                </div>
              </div>

              {/* Treatment & complications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-white/5">
                  <h4 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">Clinical Therapies & Care</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedDisease.treatment}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Secondary Complications</h4>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {selectedDisease.complications.map((comp, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="h-1 w-1 bg-red-400 rounded-full" /> {comp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Crucial Medical Disclaimer Advisory */}
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/20 text-xs text-amber-200 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <h5 className="font-bold text-amber-300 uppercase tracking-wider text-[10px] font-mono">Crucial Medical Disclaimer & Advisory</h5>
                  <p className="leading-relaxed text-[11px]">
                    The therapeutics, tablets, and pathological trajectories outlined above are compiled solely for educational reference. Under no circumstances should this information be treated as an active self-prescription framework or definitive clinical diagnostic. Always consult a licensed medical practitioner or registered primary care provider before altering any drug regimen.
                  </p>
                </div>
              </div>

              {/* Recommended Tablets & Pharmacotherapy */}
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="h-4 w-4 text-cyan-400" /> Prescribed Tablets & Pharmacotherapy
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Click tablet for complete monograph</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedDisease.medicines.map((medName, idx) => {
                    const matchedKey = Object.keys(MEDICINE_DATABASE).find(
                      key => key.toLowerCase() === medName.toLowerCase() || medName.toLowerCase().includes(key.toLowerCase())
                    );
                    const dbDetails = matchedKey ? MEDICINE_DATABASE[matchedKey] : null;

                    return (
                      <div 
                        key={idx} 
                        onClick={() => handleOpenMedicineModal(medName)}
                        className="p-4 rounded-xl border border-white/10 bg-slate-950/50 hover:bg-slate-900/60 hover:border-cyan-500/30 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-extrabold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                              <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
                                <Pill className="h-3.5 w-3.5" />
                              </span>
                              {medName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 group-hover:text-cyan-500/50 flex items-center gap-0.5">
                              View <ChevronRight className="h-3 w-3" />
                            </span>
                          </div>
                          
                          {dbDetails ? (
                            <div className="space-y-1">
                              <p className="text-[11px] text-slate-300 font-medium leading-normal line-clamp-2">
                                <strong className="text-cyan-500/90">Primary Uses: </strong> 
                                {dbDetails.uses.join(", ")}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono line-clamp-1">
                                <strong>Dosage: </strong> {dbDetails.dosage}
                              </p>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">
                              Clinical tablet recommended for symptomatic relief. Click to generate high-fidelity drug monographs dynamically.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lifestyle modifications */}
              <div className="space-y-3 pt-6 border-t border-white/5">
                <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-emerald-400" /> Supportive Lifestyle Tips
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {selectedDisease.lifestyleTips.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency red flags */}
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1.5">
                <h5 className="text-[10px] uppercase font-bold font-mono text-red-400 flex items-center gap-1.5">
                  <AlertOctagon className="h-4 w-4 animate-pulse" /> Emergency Warnings & Symptoms
                </h5>
                <ul className="text-xs text-red-200 space-y-1">
                  {selectedDisease.emergencySigns.map((sign, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="h-1 w-1 bg-red-400 rounded-full shrink-0 mt-1.5" />
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mini Disclaimer */}
              <div className="p-3 bg-slate-950 border border-white/5 rounded-xl text-[10px] text-slate-500">
                This monograph acts strictly as a compiled summary. It does not replace medical textbooks or professional diagnostics.
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        </div>
      </div>

      {/* Medicine/Tablet Monograph Modal */}
      <AnimatePresence>
        {selectedMedName && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 text-white"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedMedName(null);
                  setSelectedMedDetails(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Title Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl">
                  <Pill className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Pharmacological Monograph</span>
                  <h3 className="text-xl font-extrabold text-white">{selectedMedName}</h3>
                </div>
              </div>

              {isMedLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                    <Pill className="h-5 w-5 text-cyan-400 absolute top-3.5 left-3.5 animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Formulating clinical drug profiles...</p>
                </div>
              ) : selectedMedDetails ? (
                <div className="space-y-6">
                  {/* Composition & Manufacturer */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-white/5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">Active Composition</span>
                      <span className="text-slate-200 font-medium">{selectedMedDetails.composition || "See prescription label"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">Manufacturer Reference</span>
                      <span className="text-slate-200 font-medium">{selectedMedDetails.manufacturer}</span>
                    </div>
                  </div>

                  {/* Uses & Dosage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Approved Clinical Indication / Uses</h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {selectedMedDetails.uses.map((use, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                            <span>{use}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 bg-cyan-950/20 p-4 rounded-xl border border-cyan-500/10">
                      <h4 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">Clinical Dosage Directive</h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {selectedMedDetails.dosage}
                      </p>
                    </div>
                  </div>

                  {/* Warnings & Side Effects */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Possible Side Effects</h4>
                      <div className="flex flex-wrap gap-2 animate-fadeIn">
                        {selectedMedDetails.sideEffects.map((side, idx) => (
                          <span key={idx} className="px-2 py-1 rounded bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
                            {side}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Critical Precautions</h4>
                      <p className="text-xs text-amber-200 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 leading-relaxed">
                        {selectedMedDetails.warnings}
                      </p>
                    </div>
                  </div>

                  {/* Physiological Contraindications (Pregnancy, Alcohol, Food) */}
                  {(selectedMedDetails.pregnancyWarning || selectedMedDetails.alcoholInteraction || selectedMedDetails.foodInteraction) && (
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Physiological & Food Contraindications</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                        {selectedMedDetails.pregnancyWarning && (
                          <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5">
                            <span className="font-bold text-slate-400 block mb-1">Pregnancy status</span>
                            <span className="text-slate-300 leading-normal block">{selectedMedDetails.pregnancyWarning}</span>
                          </div>
                        )}
                        {selectedMedDetails.alcoholInteraction && (
                          <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5">
                            <span className="font-bold text-slate-400 block mb-1">Alcohol interaction</span>
                            <span className="text-slate-300 leading-normal block">{selectedMedDetails.alcoholInteraction}</span>
                          </div>
                        )}
                        {selectedMedDetails.foodInteraction && (
                          <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5">
                            <span className="font-bold text-slate-400 block mb-1">Dietary guidelines</span>
                            <span className="text-slate-300 leading-normal block">{selectedMedDetails.foodInteraction}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Modal Prominent Medical Disclaimer */}
                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-xs text-red-200 flex items-start gap-3 mt-6">
                    <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-1">
                      <h5 className="font-bold text-red-300 uppercase tracking-wider text-[10px] font-mono">Mandatory Clinical Advisory & Disclaimer</h5>
                      <p className="leading-relaxed text-[11px]">
                        This tablet information is compiled from general public and clinical pharmacological sources for educational orientation only. Under no circumstances should this be used to initiate, alter, or self-administer any medical treatment without a direct professional diagnosis and authorized prescription by a registered clinical healthcare provider.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-red-400">Failed to load tablet details.</p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
