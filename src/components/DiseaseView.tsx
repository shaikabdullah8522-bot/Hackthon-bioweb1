import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, ShieldAlert, Heart, Activity, Check, ChevronRight, BookOpen, 
  Layers, UserCheck, AlertTriangle, AlertOctagon, HelpCircle
} from "lucide-react";
import { DISEASE_LIBRARY } from "../data";
import { DiseaseLibraryItem } from "../types";

export default function DiseaseView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customDiseases, setCustomDiseases] = useState<DiseaseLibraryItem[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseLibraryItem>(DISEASE_LIBRARY[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const res = await fetch("/api/disease-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      setCustomDiseases(prev => {
        // Only append if it doesn't already exist in customDiseases
        if (prev.some(d => d.name.toLowerCase() === data.name.toLowerCase())) {
          return prev;
        }
        return [...prev, data];
      });
      setSelectedDisease(data);
    } catch (err: any) {
      console.error(err);
      const isHighDemand = err.message?.includes("503") || err.message?.includes("UNAVAILABLE") || err.message?.includes("demand");
      setError(
        isHighDemand 
          ? "The medical symptom predictor model is currently experiencing extremely high demand. Please try again in a few moments."
          : `Failed to compile pathology monograph: ${err.message || "Please try again."}`
      );
    } finally {
      setIsLoading(false);
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
    </div>
  );
}
