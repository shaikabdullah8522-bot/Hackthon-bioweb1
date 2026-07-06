import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, ShieldAlert, Sparkles, Activity, AlertTriangle, ListFilter, 
  Stethoscope, ClipboardCheck, Plus, Check, RefreshCw
} from "lucide-react";
import { DiseasePrediction } from "../types";
import { COMMON_SYMPTOMS } from "../data";
import { isStaticDeployment, getClientApiKey, getClientOpenAIKey, getActiveAIProvider, callGeminiDirect, callOpenAIDirect, getOfflinePrediction } from "../utils/apiFallback";

export default function PredictorView() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<DiseasePrediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(prev => prev.filter(s => s !== sym));
    } else {
      setSelectedSymptoms(prev => [...prev, sym]);
    }
  };

  const addCustomSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSym = customSymptom.trim();
    if (!cleanSym) return;

    if (!selectedSymptoms.includes(cleanSym)) {
      setSelectedSymptoms(prev => [...prev, cleanSym]);
    }
    setCustomSymptom("");
  };

  const clearSymptoms = () => {
    setSelectedSymptoms([]);
    setPrediction(null);
    setError(null);
  };

  const runPrediction = async () => {
    if (selectedSymptoms.length === 0) {
      setError("Please select or type at least one symptom to process diagnostic estimation.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      let predictionData: any = null;

      const apiKey = getClientApiKey();
      const openAiKey = getClientOpenAIKey();
      const activeProvider = getActiveAIProvider();
      const isStatic = isStaticDeployment();

      const useDirectMode = isStatic || (activeProvider === "openai" ? openAiKey : apiKey);

      if (useDirectMode) {
        if (activeProvider === "openai" && openAiKey) {
          const symptomsStr = selectedSymptoms.join(", ");
          const systemInstruction = 
            "You are an educational clinical database model. Analyze symptoms and return an objective estimation of the likely condition in JSON format. Be conservative and highlight that it's educational. " +
            "You MUST return a JSON object conforming exactly to this structure:\n" +
            "{\n" +
            "  \"disease\": \"Name of the likely medical condition\",\n" +
            "  \"confidence\": 80,\n" +
            "  \"severity\": \"Low\",\n" +
            "  \"symptoms\": [\"symptom1\"],\n" +
            "  \"treatmentOverview\": \"Brief non-prescription overview description\",\n" +
            "  \"specialist\": \"Medical specialist category\",\n" +
            "  \"medicalTests\": [\"test1\"],\n" +
            "  \"emergencyWarning\": \"Specific emergency warnings\",\n" +
            "  \"prevention\": [\"prevention1\"]\n" +
            "}";
          const prompt = `Analyze the following patient symptoms and predict the most likely condition based on educational knowledge. Symptoms: "${symptomsStr}".`;
          const jsonText = await callOpenAIDirect(openAiKey, prompt, systemInstruction, true);
          predictionData = JSON.parse(jsonText || "{}");
        } else if (activeProvider === "gemini" && apiKey) {
          const symptomsStr = selectedSymptoms.join(", ");
          const systemInstruction = "You are an educational clinical database model. Analyze symptoms and return an objective estimation of the likely condition. Be conservative and highlight that it's educational.";
          const prompt = `Analyze the following patient symptoms and predict the most likely condition based on educational knowledge. Symptoms: "${symptomsStr}".`;
          const responseSchema = {
            type: "OBJECT",
            required: [
              "disease",
              "confidence",
              "severity",
              "symptoms",
              "treatmentOverview",
              "specialist",
              "medicalTests",
              "emergencyWarning",
              "prevention"
            ],
            properties: {
              disease: { type: "STRING" },
              confidence: { type: "INTEGER" },
              severity: { type: "STRING" },
              symptoms: { type: "ARRAY", items: { type: "STRING" } },
              treatmentOverview: { type: "STRING" },
              specialist: { type: "STRING" },
              medicalTests: { type: "ARRAY", items: { type: "STRING" } },
              emergencyWarning: { type: "STRING" },
              prevention: { type: "ARRAY", items: { type: "STRING" } }
            }
          };
          const jsonText = await callGeminiDirect(apiKey, prompt, systemInstruction, responseSchema);
          predictionData = JSON.parse(jsonText || "{}");
        } else if (isStatic) {
          predictionData = getOfflinePrediction(selectedSymptoms);
        }
      }

      if (!predictionData) {
        const res = await fetch("/api/predict", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-active-provider": activeProvider,
            "x-gemini-api-key": apiKey,
            "x-openai-api-key": openAiKey
          },
          body: JSON.stringify({ symptoms: selectedSymptoms })
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
          throw new Error(data?.error || `Symptom analyzer failed with status ${res.status}`);
        }
        predictionData = data;
      }

      setPrediction(predictionData);
    } catch (err: any) {
      console.warn("Predictor analysis failed, falling back to offline estimation:", err);
      const fallbackPrediction = getOfflinePrediction(selectedSymptoms);
      fallbackPrediction.treatmentOverview = "DEMO FALLBACK (System under high demand - Click 'Configure Gemini API Key' in the top banner to apply your own personal key for live high-speed analysis): " + fallbackPrediction.treatmentOverview;
      setPrediction(fallbackPrediction);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-950 text-white min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-950/40 text-blue-400 text-xs font-semibold">
          <Brain className="h-4 w-4 animate-pulse text-blue-300" />
          Structured Symptom Predictor
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">AI Clinical Symptom Analyzer</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Input your physiological symptoms. Our neural networks map them against deep pharmacological catalogs to provide general clinical estimates, tests, and prevention guides.
        </p>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Symptoms Entry Panel */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ListFilter className="h-5 w-5 text-cyan-400" /> Select Symptoms
            </h2>
            {selectedSymptoms.length > 0 && (
              <button 
                onClick={clearSymptoms}
                className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" /> Reset
              </button>
            )}
          </div>

          {/* Quick Clickable Pool */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">Common Symptoms</span>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map((sym, idx) => {
                const isActive = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer transition flex items-center gap-1.5 ${
                      isActive
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {isActive ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Symptoms form */}
          <form onSubmit={addCustomSymptom} className="space-y-2">
            <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">Add Custom Symptom</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                placeholder="e.g. stomach cramp, joint ache..."
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-slate-600"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-slate-200 hover:bg-white/20 transition text-xs font-bold cursor-pointer shrink-0"
              >
                Add
              </button>
            </div>
          </form>

          {/* Selected items list info */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex justify-between text-xs text-slate-400 mb-3">
              <span>Selected parameters:</span>
              <span className="font-mono text-cyan-400 font-bold">{selectedSymptoms.length} active</span>
            </div>
            {selectedSymptoms.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {selectedSymptoms.map((sym, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/5 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                    {sym}
                    <button onClick={() => toggleSymptom(sym)} className="hover:text-red-400 text-slate-500 font-bold">×</button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No symptoms selected. Click tags or enter custom items above.</p>
            )}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={runPrediction}
            disabled={selectedSymptoms.length === 0 || isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold hover:opacity-95 disabled:opacity-50 transition shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Activity className="h-4 w-4 animate-pulse" /> Analyzed Diagnostic Run
          </button>
        </div>

        {/* Right Column: Diagnostic Output Report */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-sm text-center flex flex-col items-center justify-center space-y-4"
              >
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                  <Brain className="h-6 w-6 text-cyan-400 absolute top-5 left-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">BioWeb Clinical Evaluation Process...</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Retrieving pharmacological data models and analyzing symptoms relationships. Please do not close this browser window.
                  </p>
                </div>
              </motion.div>
            ) : prediction ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md space-y-6 shadow-2xl"
              >
                {/* Result header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Estimated Diagnosis</span>
                    <h3 className="text-2xl font-black text-white mt-1">{prediction.disease}</h3>
                  </div>

                  <div className="flex gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-center">
                      <span className="block text-[9px] uppercase text-slate-400 font-bold font-mono">Confidence</span>
                      <span className="text-sm font-bold font-mono text-cyan-400">{prediction.confidence}%</span>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-center border ${
                      prediction.severity === "High"
                        ? "bg-red-500/10 border-red-500/30 text-red-400"
                        : prediction.severity === "Medium"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    }`}>
                      <span className="block text-[9px] uppercase text-slate-400 font-bold font-mono">Severity</span>
                      <span className="text-sm font-bold">{prediction.severity}</span>
                    </div>
                  </div>
                </div>

                {/* Treatment / clinical overview */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Primary Care Overview</span>
                  <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                    {prediction.treatmentOverview}
                  </p>
                </div>

                {/* Dual parameters list: Specialist & Clinical tests */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40 space-y-2">
                    <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-blue-400" /> Recommended Specialist
                    </span>
                    <p className="text-sm font-bold text-white">{prediction.specialist}</p>
                    <p className="text-xs text-slate-500">Consider scheduling a consultation with this specialist department for confirmation.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40 space-y-2">
                    <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ClipboardCheck className="h-3.5 w-3.5 text-emerald-400" /> Clinical Tests
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {prediction.medicalTests.map((test, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-emerald-400" /> {test}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Emergency Warning */}
                {prediction.emergencyWarning && (
                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 space-y-1.5">
                    <span className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Emergency Protocol Warnings
                    </span>
                    <p className="text-xs text-red-300 leading-relaxed">{prediction.emergencyWarning}</p>
                  </div>
                )}

                {/* Prevention */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Preventative Lifestyle Steps</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {prediction.prevention.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                        <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Official Disclaimer */}
                <div className="rounded-xl border border-white/5 bg-slate-950 p-4 text-[10px] text-slate-500 flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <span className="font-bold text-slate-400">DISCLAIMER & LEGAL PROTOCOL:</span> This prediction model is produced synthetically. It is intended strictly for education and awareness. This result does not constitute a clinical, certified medical diagnosis, nor is it a licensed prescription. Always seek formal examination from a certified general practitioner.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="p-12 rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-md text-center flex flex-col items-center justify-center space-y-4"
              >
                <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Diagnostics Queue Empty</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Please use the symptoms pool on the left side to compile your current indicators. Once compiled, launch the evaluation run.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
