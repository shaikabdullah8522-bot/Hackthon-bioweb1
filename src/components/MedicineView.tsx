import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Pill, ShoppingBag, ShieldAlert, Check, ChevronDown, 
  Sparkles, ExternalLink, RefreshCw, Star, Info, AlertOctagon
} from "lucide-react";
import { MedicineDetails } from "../types";
import { MEDICINE_DATABASE } from "../data";
import { isStaticDeployment, getClientApiKey, getClientOpenAIKey, getActiveAIProvider, callGeminiDirect, callOpenAIDirect, getOfflineMedicineDetails } from "../utils/apiFallback";

interface SearchableMedicine {
  name: string;
  category: string;
  conditions: string[];
  symptoms: string[];
  description: string;
}

const SEARCHABLE_MEDICINES: SearchableMedicine[] = [
  {
    name: "Paracetamol",
    category: "Analgesic & Antipyretic",
    conditions: ["Fever", "Pain Relief", "Common Cold", "Influenza"],
    symptoms: ["Fever", "Headache", "Body Pain", "Toothache", "Muscle aches"],
    description: "Highly effective for reducing fever and relieving mild to moderate pain."
  },
  {
    name: "Ibuprofen",
    category: "NSAID (Anti-inflammatory)",
    conditions: ["Pain Relief", "Inflammation", "Arthritis", "Fever", "Migraine"],
    symptoms: ["Joint Stiffness", "Body Pain", "Headache", "Swelling", "Fever"],
    description: "Reduces hormones that cause pain and inflammation in the body."
  },
  {
    name: "Amoxicillin",
    category: "Penicillin Antibiotic",
    conditions: ["Bacterial Infection", "Strep Throat", "Ear Infection", "UTI", "Bronchitis"],
    symptoms: ["Sore Throat", "Fever", "Ear ache", "Cough", "Urinary burning"],
    description: "Broad-spectrum antibiotic used to treat various bacterial infections."
  },
  {
    name: "Azithromycin",
    category: "Macrolide Antibiotic",
    conditions: ["Bacterial Infection", "Pneumonia", "Sinusitis", "Throat Infection"],
    symptoms: ["Cough", "Sore Throat", "Fever", "Shortness of breath"],
    description: "Common antibiotic taken in a convenient short-term dosage course."
  },
  {
    name: "Atorvastatin",
    category: "Statin (Cholesterol)",
    conditions: ["High Cholesterol", "Cardiovascular Prevention", "Heart Health"],
    symptoms: ["High lipid levels", "Heart Palpitations", "Chest tightness"],
    description: "Lowers LDL ('bad') cholesterol and triglycerides in the blood."
  },
  {
    name: "Metformin",
    category: "Antidiabetic",
    conditions: ["Type 2 Diabetes", "High Blood Sugar", "Insulin Resistance", "PCOS"],
    symptoms: ["Increased thirst", "Frequent urination", "Fatigue", "Blurred vision"],
    description: "Improves insulin sensitivity and helps control blood glucose levels."
  },
  {
    name: "Lisinopril",
    category: "ACE Inhibitor (Blood Pressure)",
    conditions: ["Hypertension", "High Blood Pressure", "Heart Failure"],
    symptoms: ["Elevated blood pressure", "Dizziness", "Headache"],
    description: "Relaxes blood vessels, lowering blood pressure and improving blood flow."
  },
  {
    name: "Amlodipine",
    category: "Calcium Channel Blocker",
    conditions: ["Hypertension", "High Blood Pressure", "Angina", "Chest Pain"],
    symptoms: ["Elevated blood pressure", "Chest tightness", "Dizziness"],
    description: "Dilates blood vessels to treat high blood pressure and prevent chest pain."
  },
  {
    name: "Albuterol",
    category: "Bronchodilator (Asthma)",
    conditions: ["Asthma", "COPD", "Bronchitis", "Wheezing"],
    symptoms: ["Wheezing", "Shortness of breath", "Chest tightness", "Dry Cough"],
    description: "Provides rapid relief for acute airway narrowing and breathing difficulties."
  },
  {
    name: "Montelukast",
    category: "Leukotriene Receptor Antagonist",
    conditions: ["Asthma", "Allergies", "Allergic Rhinitis", "Hay Fever"],
    symptoms: ["Runny Nose", "Sneezing", "Wheezing", "Chest tightness"],
    description: "Used for long-term control of asthma and relief of seasonal allergy symptoms."
  },
  {
    name: "Cetirizine",
    category: "Antihistamine (Allergies)",
    conditions: ["Allergies", "Hay Fever", "Hives"],
    symptoms: ["Sneezing", "Runny Nose", "Skin Rash", "Itchy Eyes", "Watery Eyes"],
    description: "Non-drowsy allergy relief that blocks histamines in the body."
  },
  {
    name: "Omeprazole",
    category: "Proton Pump Inhibitor",
    conditions: ["Acid Reflux", "GERD", "Stomach Ulcer", "Heartburn"],
    symptoms: ["Heartburn", "Stomach Pain", "Acid indigestion", "Nausea"],
    description: "Decreases the amount of acid produced in the stomach to allow healing."
  }
];

export default function MedicineView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [medicine, setMedicine] = useState<MedicineDetails | null>(MEDICINE_DATABASE["paracetamol"]);
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<"name" | "symptom">("name");
  const [symptomFilter, setSymptomFilter] = useState("");

  // Suggestions list
  const suggestions = ["Paracetamol", "Amoxicillin", "Atorvastatin", "Metformin"];

  const handleSearch = async (name: string) => {
    const term = name.trim();
    if (!term) return;

    setIsLoading(true);
    setError(null);
    setMedicine(null);

    // 1. Fast local database lookup
    const matchedKey = Object.keys(MEDICINE_DATABASE).find(
      key => key.toLowerCase() === term.toLowerCase()
    );

    if (matchedKey) {
      setMedicine(MEDICINE_DATABASE[matchedKey]);
      setIsLoading(false);
      return;
    }

    // 2. Dual-mode AI / Static resolver
    try {
      let medData: any = null;

      const apiKey = getClientApiKey();
      const openAiKey = getClientOpenAIKey();
      const activeProvider = getActiveAIProvider();
      const isStatic = isStaticDeployment();

      const useDirectMode = isStatic || (activeProvider === "openai" ? openAiKey : apiKey);

      if (useDirectMode) {
        if (activeProvider === "openai" && openAiKey) {
          const prompt = `Formulate a comprehensive medical fact sheet for the medicine named: "${term}". Ensure accuracy and clear professional tone.`;
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
          const prompt = `Formulate a comprehensive medical fact sheet for the medicine named: "${term}". Ensure accuracy and clear professional tone.`;
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
        } else if (isStatic) {
          medData = getOfflineMedicineDetails(term);
        }
      }

      if (!medData) {
        const res = await fetch("/api/medicine-details", {
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
          throw new Error(data?.error || `Unable to formulate monograph: status ${res.status}`);
        }
        medData = data;
      }

      setMedicine(medData);
    } catch (err: any) {
      console.warn("API monograph generation failed, falling back to offline details:", err);
      const fallbackMed = getOfflineMedicineDetails(term);
      fallbackMed.warnings = "FALLBACK MONOGRAPH (System under high demand - Click 'Configure Gemini API Key' at the top to apply your own personal key for uninterrupted high-speed AI monographs): " + fallbackMed.warnings;
      setMedicine(fallbackMed);
    } finally {
      setIsLoading(false);
    }
  };

  // Pharmacy redirect builders
  const getPharmacyLinks = (name: string) => {
    const encoded = encodeURIComponent(name);
    return [
      { name: "Apollo Pharmacy", url: `https://www.apollopharmacy.in/search-medicines/${encoded}`, color: "bg-emerald-600 hover:bg-emerald-700" },
      { name: "Tata 1mg", url: `https://www.1mg.com/search/all?name=${encoded}`, color: "bg-orange-600 hover:bg-orange-700" },
      { name: "PharmEasy", url: `https://pharmeasy.in/search/all?searchTextField=${encoded}`, color: "bg-teal-600 hover:bg-teal-700" },
      { name: "Netmeds", url: `https://www.netmeds.com/catalogsearch/result?q=${encoded}`, color: "bg-blue-600 hover:bg-blue-700" }
    ];
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-950 text-white min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-semibold">
          <Pill className="h-4 w-4 text-emerald-300 animate-bounce" />
          Interactive Medicine Database
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Active Drug Monograph Directory</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Type any drug name to pull up comprehensive pharmacological chemical sheets, clinical dosage thresholds, lifestyle interaction warning levels, and direct order lookup linkages.
        </p>
      </div>

      {/* Search Bar / Filter Panel */}
      <div className="max-w-2xl mx-auto space-y-4 bg-slate-900/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
        {/* Mode Tab Switcher */}
        <div className="flex border-b border-white/10 pb-2 mb-2">
          <button
            onClick={() => setSearchMode("name")}
            className={`flex-1 pb-2 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
              searchMode === "name"
                ? "border-emerald-500 text-emerald-400 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Search by Drug Name
          </button>
          <button
            onClick={() => setSearchMode("symptom")}
            className={`flex-1 pb-2 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
              searchMode === "symptom"
                ? "border-emerald-500 text-emerald-400 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Find by Symptoms or Conditions
          </button>
        </div>

        {searchMode === "name" ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="h-5 w-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                  placeholder="Search any medicine (e.g. Paracetamol, Ibuprofen, Lisinopril)..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-white placeholder-slate-500"
                />
              </div>
              <button
                onClick={() => handleSearch(searchQuery)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-bold hover:opacity-95 text-sm transition cursor-pointer shrink-0"
              >
                Search
              </button>
            </div>

            {/* Suggestions chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">Curated:</span>
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(sug);
                    handleSearch(sug);
                  }}
                  className="px-3 py-1 rounded-lg border border-white/5 bg-slate-950 text-slate-300 hover:text-white hover:border-emerald-500/40 transition cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="h-5 w-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={symptomFilter}
                onChange={(e) => setSymptomFilter(e.target.value)}
                placeholder="Type a symptom or condition (e.g., fever, headache, diabetes, asthma)..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-white placeholder-slate-500"
              />
              {symptomFilter && (
                <button
                  onClick={() => setSymptomFilter("")}
                  className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-xs">
              <span className="text-slate-500 font-mono uppercase tracking-wider text-[10px] self-center">Popular:</span>
              {["Fever", "Headache", "Cough", "Diabetes", "Allergies", "High BP", "Acid Reflux"].map((term) => {
                const isSelected = symptomFilter.toLowerCase() === (term === "High BP" ? "high blood pressure" : term.toLowerCase());
                return (
                  <button
                    key={term}
                    onClick={() => {
                      if (isSelected) {
                        setSymptomFilter("");
                      } else {
                        setSymptomFilter(term === "High BP" ? "High Blood Pressure" : term);
                      }
                    }}
                    className={`px-3 py-1 rounded-lg border text-xs transition cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "border-white/5 bg-slate-950 text-slate-400 hover:text-white"
                    }`}
                  >
                    {term}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Matching Medicines (Symptom/Condition Filter Results) */}
      {searchMode === "symptom" && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Matching Medications ({
                SEARCHABLE_MEDICINES.filter((med) => {
                  if (!symptomFilter) return true;
                  const term = symptomFilter.toLowerCase();
                  return (
                    med.name.toLowerCase().includes(term) ||
                    med.category.toLowerCase().includes(term) ||
                    med.description.toLowerCase().includes(term) ||
                    med.conditions.some((c) => c.toLowerCase().includes(term)) ||
                    med.symptoms.some((s) => s.toLowerCase().includes(term))
                  );
                }).length
              })
            </h3>
            {symptomFilter && (
              <span className="text-xs text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                Filtered by: "{symptomFilter}"
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SEARCHABLE_MEDICINES.filter((med) => {
              if (!symptomFilter) return true;
              const term = symptomFilter.toLowerCase();
              return (
                med.name.toLowerCase().includes(term) ||
                med.category.toLowerCase().includes(term) ||
                med.description.toLowerCase().includes(term) ||
                med.conditions.some((c) => c.toLowerCase().includes(term)) ||
                med.symptoms.some((s) => s.toLowerCase().includes(term))
              );
            }).map((med, idx) => {
              const isLoaded = medicine?.name.toLowerCase().includes(med.name.toLowerCase());
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSearchQuery(med.name);
                    handleSearch(med.name);
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-4 text-left group relative overflow-hidden ${
                    isLoaded 
                      ? "bg-emerald-950/25 border-emerald-500/40 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]" 
                      : "bg-slate-900/40 border-white/5 hover:border-emerald-500/30 hover:bg-slate-900/60"
                  }`}
                >
                  {isLoaded && (
                    <div className="absolute top-0 right-0 h-16 w-16 overflow-hidden">
                      <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1 shadow">
                        <Check className="h-3 w-3 text-slate-950 stroke-[3]" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 pr-6">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`font-bold text-sm sm:text-base transition flex items-center gap-1.5 ${
                        isLoaded ? "text-emerald-300" : "text-white group-hover:text-emerald-400"
                      }`}>
                        <Pill className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                        {med.name}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5 shrink-0">
                        {med.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{med.description}</p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-white/5 mt-auto">
                    <div className="flex flex-wrap gap-1 items-center text-[10px]">
                      <span className="text-slate-500 font-bold mr-1 shrink-0">Conditions:</span>
                      {med.conditions.map((cond, cIdx) => (
                        <span key={cIdx} className="px-2 py-0.5 rounded-md bg-emerald-500/5 text-emerald-300 border border-emerald-500/10">
                          {cond}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 items-center text-[10px]">
                      <span className="text-slate-500 font-bold mr-1 shrink-0">Symptoms:</span>
                      {med.symptoms.map((symp, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 rounded-md bg-teal-500/5 text-teal-300 border border-teal-500/10">
                          {symp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {SEARCHABLE_MEDICINES.filter((med) => {
            if (!symptomFilter) return true;
            const term = symptomFilter.toLowerCase();
            return (
              med.name.toLowerCase().includes(term) ||
              med.category.toLowerCase().includes(term) ||
              med.description.toLowerCase().includes(term) ||
              med.conditions.some((c) => c.toLowerCase().includes(term)) ||
              med.symptoms.some((s) => s.toLowerCase().includes(term))
            );
          }).length === 0 && (
            <div className="p-12 text-center rounded-xl border border-dashed border-white/10 text-slate-400 bg-slate-900/10">
              <p className="font-medium text-slate-300">No matching local medications found for "{symptomFilter}".</p>
              <p className="text-xs text-slate-500 mt-1">Try switching to "Search by Drug Name" and we can auto-generate details for it via Gemini API!</p>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Info Sheet & Buy Links */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center rounded-2xl border border-white/10 bg-slate-900/20 max-w-4xl mx-auto flex flex-col items-center justify-center space-y-4"
          >
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-2 border-emerald-400/20 border-t-emerald-400 animate-spin" />
              <Pill className="h-6 w-6 text-emerald-400 absolute top-5 left-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Querying Clinical Pharmacopoeia...</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">Generating molecular layout composition parameters and compiling active safety profiles.</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            className="p-6 text-center rounded-xl border border-red-500/20 bg-red-950/25 max-w-3xl mx-auto text-sm text-red-200"
          >
            {error}
          </motion.div>
        ) : medicine ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            
            {/* Left Col: Main Monographs Sheet (8 Cols) */}
            <div className="lg:col-span-8 p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md space-y-8">
              
              {/* Header card info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Pill className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-white">{medicine.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">Mfg: {medicine.manufacturer} | Expiry Info: {medicine.expiryInfo || "24 Months Typical"}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-[9px] uppercase font-bold font-mono text-slate-500 tracking-wider">Strengths</span>
                  <div className="flex gap-1 mt-1">
                    {medicine.availableStrengths?.map((str, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-xs">
                        {str}
                      </span>
                    )) || <span className="text-xs text-slate-400">Standard</span>}
                  </div>
                </div>
              </div>

              {/* Composition details */}
              {medicine.composition && (
                <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Chemical Formulation Composition</span>
                  <p className="text-slate-300">{medicine.composition}</p>
                </div>
              )}

              {/* Grid: Uses & Dosage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Clinical Indications & Uses</h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {medicine.uses.map((use, uIdx) => (
                      <li key={uIdx} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                        <span>{use}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 p-4 rounded-xl border border-white/5 bg-slate-950/40">
                  <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">Usual Dosage Limits</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{medicine.dosage}</p>
                </div>
              </div>

              {/* Clinical Warnings / Side effects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Reported Adverse Effects</h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {medicine.sideEffects.map((side, sIdx) => (
                      <li key={sIdx} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-amber-400 shrink-0" />
                        <span>{side}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Storage & Preservation</h4>
                  <p className="text-xs text-slate-300">{medicine.storage}</p>
                </div>
              </div>

              {/* Absolute Warnings box */}
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                <h5 className="text-[10px] uppercase font-bold font-mono text-red-400 flex items-center gap-1">
                  <AlertOctagon className="h-4 w-4" /> Contraindications & Warnings
                </h5>
                <p className="text-xs text-red-200 leading-relaxed">{medicine.warnings}</p>
              </div>

              {/* Safety parameters checkboxes: Alcohol, Pregnancy, Breastfeeding, Food */}
              <div className="pt-6 border-t border-white/5 space-y-3">
                <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Physiological Cohort Safety Warnings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {medicine.pregnancyWarning && (
                    <div className="p-3 bg-white/5 border border-white/5 rounded-lg space-y-1">
                      <span className="font-bold text-amber-300 font-mono text-[9px] uppercase block">Pregnancy Safety</span>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{medicine.pregnancyWarning}</p>
                    </div>
                  )}
                  {medicine.breastfeedingWarning && (
                    <div className="p-3 bg-white/5 border border-white/5 rounded-lg space-y-1">
                      <span className="font-bold text-amber-300 font-mono text-[9px] uppercase block">Breastfeeding Safety</span>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{medicine.breastfeedingWarning}</p>
                    </div>
                  )}
                  {medicine.alcoholInteraction && (
                    <div className="p-3 bg-white/5 border border-white/5 rounded-lg space-y-1">
                      <span className="font-bold text-amber-300 font-mono text-[9px] uppercase block">Alcohol Interaction</span>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{medicine.alcoholInteraction}</p>
                    </div>
                  )}
                  {medicine.foodInteraction && (
                    <div className="p-3 bg-white/5 border border-white/5 rounded-lg space-y-1">
                      <span className="font-bold text-amber-300 font-mono text-[9px] uppercase block">Food Interaction</span>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{medicine.foodInteraction}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Generic Alternatived list */}
              {medicine.alternatives && medicine.alternatives.length > 0 && (
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Equivalent Formulations</h4>
                  <div className="flex flex-wrap gap-2">
                    {medicine.alternatives.map((alt, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-lg bg-slate-950 border border-white/5 text-xs text-slate-300">
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQs accordion */}
              {medicine.faqs && medicine.faqs.length > 0 && (
                <div className="pt-6 border-t border-white/5 space-y-3">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Drug FAQ Monographs</h4>
                  <div className="space-y-2">
                    {medicine.faqs.map((faq, idx) => {
                      const isActive = activeFaqIdx === idx;
                      return (
                        <div key={idx} className="rounded-xl border border-white/5 bg-slate-950/40 overflow-hidden">
                          <button
                            onClick={() => setActiveFaqIdx(isActive ? null : idx)}
                            className="w-full flex items-center justify-between p-4 text-left text-xs font-semibold hover:bg-white/5 transition"
                          >
                            <span>{faq.question}</span>
                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isActive ? "rotate-180" : ""}`} />
                          </button>
                          {isActive && (
                            <div className="p-4 pt-0 text-xs text-slate-400 border-t border-white/5 leading-relaxed bg-slate-950/60">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Pharmacy order shortcuts (4 Cols) */}
            <div className="lg:col-span-4 p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md space-y-6">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <ShoppingBag className="h-4.5 w-4.5 text-emerald-400" /> Procurement Shortcuts
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Need to procure or refill this prescription? Tap one of our standard pharmacy redirectors to load pre-searched queries on active medical networks.
              </p>

              <div className="space-y-3 pt-2">
                {getPharmacyLinks(medicine.name).map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl font-bold text-xs text-white transition ${link.color}`}
                  >
                    <span>Order via {link.name}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ))}
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40 text-[10px] text-slate-500 leading-relaxed space-y-1">
                <Info className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
                <p>
                  BioWeb has no direct commercial partnership, sales commission, or API interface with these retailers. These links acts strictly as customized, self-referential web query shortcuts.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center p-12 text-slate-500">Please enter a search query above.</div>
        )}
      </AnimatePresence>
    </div>
  );
}
