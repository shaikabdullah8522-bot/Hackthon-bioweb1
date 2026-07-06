import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Scan, FileSpreadsheet, Upload, AlertTriangle, ShieldCheck, Pill, 
  HelpCircle, CheckCircle, Info, ChevronRight, Play
} from "lucide-react";
import { createWorker } from "tesseract.js";
import { MedicineDetails } from "../types";
import { isStaticDeployment, getClientApiKey, getClientOpenAIKey, getActiveAIProvider, callGeminiDirect, callOpenAIDirect, parsePrescriptionOffline } from "../utils/apiFallback";

export default function ScannerView() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState("");
  const [scannedText, setScannedText] = useState("");
  const [extractedMeds, setExtractedMeds] = useState<MedicineDetails[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Sample pre-formatted OCR templates for easy click-to-test
  const samplePrescriptions = [
    {
      title: "Sample Fever Consult Script",
      text: "PATIENT: John Doe, AGE 29. CLINIC ID: #8892\nPRESCRIPTION:\n- DOLO 650MG tablets\n- Dosage: 1 tab three times daily after food\n- Take for 3 days as needed for fever."
    },
    {
      title: "Sample Diabetes Control Rx",
      text: "METROPOLITAN ENDOCRINE CLINIC\nPATIENT: Alice Smith, DATE: 05-JULY-2026\nRx:\n- METFORMIN HCl 500mg Extended Release\n- Dosage: 1 tablet daily with dinner\n- Qty: 30 tablets. Avoid alcohol."
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const runOcrOnText = async (text: string) => {
    setIsProcessing(true);
    setScannedText(text);
    setError(null);

    try {
      let parsedData: any = null;

      const apiKey = getClientApiKey();
      const openAiKey = getClientOpenAIKey();
      const activeProvider = getActiveAIProvider();
      const isStatic = isStaticDeployment();

      const useDirectMode = isStatic || (activeProvider === "openai" ? openAiKey : apiKey);

      if (useDirectMode) {
        if (activeProvider === "openai" && openAiKey) {
          const prompt = 
            `Analyze the raw extracted prescription text and identify any recognizable medications. ` +
            `For each identified medicine, lookup credible medical details and formulate structured outputs. ` +
            `Raw prescription OCR text: "${text}"`;
          const systemInstruction = 
            "You are an expert pharmacology parser. Read messy OCR text, identify medicines, and return structured info in JSON. " +
            "You MUST return a JSON object conforming exactly to this structure:\n" +
            "{\n" +
            "  \"medicines\": [\n" +
            "    {\n" +
            "      \"name\": \"Standard name\",\n" +
            "      \"uses\": [\"use1\"],\n" +
            "      \"dosage\": \"string\",\n" +
            "      \"sideEffects\": [\"sideEffect1\"],\n" +
            "      \"storage\": \"string\",\n" +
            "      \"manufacturer\": \"string\",\n" +
            "      \"alternatives\": [\"alt1\"],\n" +
            "      \"warnings\": \"string\"\n" +
            "    }\n" +
            "  ]\n" +
            "}";
          const jsonText = await callOpenAIDirect(openAiKey, prompt, systemInstruction, true);
          parsedData = JSON.parse(jsonText || '{"medicines":[]}');
        } else if (activeProvider === "gemini" && apiKey) {
          const prompt = 
            `Analyze the raw extracted prescription text and identify any recognizable medications. ` +
            `For each identified medicine, lookup credible medical details and formulate structured outputs. ` +
            `Raw prescription OCR text: "${text}"`;
          const systemInstruction = "You are an expert pharmacology parser. Read messy OCR text, identify medicines, and return structured info.";
          const responseSchema = {
            type: "OBJECT",
            required: ["medicines"],
            properties: {
              medicines: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  required: ["name", "uses", "dosage", "sideEffects", "storage", "manufacturer", "alternatives", "warnings"],
                  properties: {
                    name: { type: "STRING" },
                    uses: { type: "ARRAY", items: { type: "STRING" } },
                    dosage: { type: "STRING" },
                    sideEffects: { type: "ARRAY", items: { type: "STRING" } },
                    storage: { type: "STRING" },
                    manufacturer: { type: "STRING" },
                    alternatives: { type: "ARRAY", items: { type: "STRING" } },
                    warnings: { type: "STRING" }
                  }
                }
              }
            }
          };
          const jsonText = await callGeminiDirect(apiKey, prompt, systemInstruction, responseSchema);
          parsedData = JSON.parse(jsonText || '{"medicines":[]}');
        } else if (isStatic) {
          parsedData = parsePrescriptionOffline(text);
        }
      }

      if (!parsedData) {
        const res = await fetch("/api/extract-prescription", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-active-provider": activeProvider,
            "x-gemini-api-key": apiKey,
            "x-openai-api-key": openAiKey
          },
          body: JSON.stringify({ text })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Prescription parser server returned an issue");
        }
        parsedData = data;
      }

      setExtractedMeds(parsedData.medicines || []);
    } catch (err: any) {
      console.warn("Prescription parsing failed, falling back to offline parser:", err);
      const fallbackData = parsePrescriptionOffline(text);
      if (fallbackData && fallbackData.medicines && fallbackData.medicines.length > 0) {
        fallbackData.medicines[0].warnings = "DEMO FALLBACK (System under high demand - Click 'Configure Gemini API Key' in the top banner to apply your own personal key for live high-speed prescription parsing): " + fallbackData.medicines[0].warnings;
      }
      setExtractedMeds(fallbackData.medicines || []);
    } finally {
      setIsProcessing(false);
    }
  };

  const runOcrOnImage = async () => {
    if (!imagePreview) {
      setError("Please drag/drop or upload a prescription image first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setOcrProgress("Bootstrapping OCR engine...");

    try {
      const worker = await createWorker("eng");
      
      // Monitor Tesseract progress
      // (Note: createWorker handles progress callback natively in newer versions)
      setOcrProgress("Scanning image and reading characters...");
      
      const ret = await worker.recognize(imagePreview);
      const text = ret.data.text;
      
      await worker.terminate();

      if (!text || text.trim() === "") {
        throw new Error("OCR engine succeeded but returned no legible English words.");
      }

      setOcrProgress("Intelligently parsing medicine definitions with Gemini...");
      await runOcrOnText(text);

    } catch (err: any) {
      console.error("Tesseract error:", err);
      setError(err.message || "Failed to parse text from image. Let's try running a clinical sample prescription.");
      setIsProcessing(false);
    }
  };

  const handleSampleClick = (text: string) => {
    setImagePreview(null);
    setSelectedFile(null);
    runOcrOnText(text);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-950 text-white min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-400 text-xs font-semibold">
          <Scan className="h-4 w-4 text-indigo-300 animate-spin" style={{ animationDuration: "12s" }} />
          Optical Character Recognition (OCR) Scanner
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">AI Prescription Scanner</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Upload hand-written or digital prescription notes. BioWeb extracts legible drug listings, standardizes dosage regimens, highlights contraindications, and links warnings automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Upload and controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-indigo-400" /> Upload Prescription
            </h2>

            {/* Drag & Drop Area */}
            <div className="relative border-2 border-dashed border-white/20 hover:border-cyan-500/40 rounded-2xl p-8 text-center transition bg-slate-950/40 cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              
              <div className="space-y-3">
                <div className="mx-auto h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Drag & drop or click to browse</p>
                  <p className="text-[10px] text-slate-500 mt-1">Supports JPG, JPEG, PNG (Up to 10MB)</p>
                </div>
              </div>
            </div>

            {/* Uploaded image preview */}
            {imagePreview && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Selected Image Preview</span>
                <div className="relative rounded-xl border border-white/10 overflow-hidden bg-slate-950 h-40">
                  <img src={imagePreview} alt="prescription" className="object-contain w-full h-full" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={runOcrOnImage}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:opacity-95 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Scan className="h-4 w-4" /> Start OCR Scanning
                  </button>
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedFile(null);
                    }}
                    className="px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-400 hover:text-white transition"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          {/* Test Sample prescription template list */}
          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-slate-300">Quick Sandbox Demos</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Don't have a physical prescription image at hand? Test our full pipeline instantly by running one of these pre-saved clinical samples.
            </p>
            <div className="space-y-2">
              {samplePrescriptions.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSampleClick(sample.text)}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-white/5 bg-slate-950/60 hover:bg-white/5 text-left transition cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">{sample.title}</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">{sample.text}</p>
                  </div>
                  <Play className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Results displays */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-sm text-center flex flex-col items-center justify-center space-y-4"
              >
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-2 border-indigo-400/20 border-t-indigo-400 animate-spin" />
                  <Scan className="h-6 w-6 text-indigo-400 absolute top-5 left-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">OCR Engine Active</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">{ocrProgress}</p>
                </div>
              </motion.div>
            ) : extractedMeds.length > 0 ? (
              <motion.div
                key="meds-list"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm font-semibold">Identified {extractedMeds.length} Prescription Medicines</span>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">SUCCESS</span>
                </div>

                {extractedMeds.map((med, idx) => (
                  <div key={idx} className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md space-y-4 shadow-xl">
                    {/* Med name & manufacturer */}
                    <div className="flex justify-between items-start border-b border-white/5 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
                          <Pill className="h-5.5 w-5.5 text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">{med.name}</h4>
                          <span className="text-[10px] font-mono text-slate-400">Mfg: {med.manufacturer}</span>
                        </div>
                      </div>
                    </div>

                    {/* Uses & dosage */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Intended Uses</span>
                        <ul className="text-xs text-slate-300 space-y-1">
                          {med.uses.map((use, uIdx) => (
                            <li key={uIdx} className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" /> {use}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-[9px] font-bold font-mono text-indigo-400 uppercase tracking-widest block">Dosage Instructions</span>
                        <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                          {med.dosage}
                        </p>
                      </div>
                    </div>

                    {/* Side effects & Storage */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Common Side Effects</span>
                        <ul className="text-xs text-slate-300 space-y-1">
                          {med.sideEffects.map((side, sIdx) => (
                            <li key={sIdx} className="flex items-center gap-1.5">
                              <span className="h-1 w-1 rounded-full bg-red-400 shrink-0" /> {side}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Storage Parameters</span>
                        <p className="text-xs text-slate-400">{med.storage}</p>
                      </div>
                    </div>

                    {/* Alternatives */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Generic Alternatives</span>
                      <div className="flex flex-wrap gap-1.5">
                        {med.alternatives.map((alt, aIdx) => (
                          <span key={aIdx} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-slate-300">
                            {alt}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Safety Warnings */}
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                      <span className="text-[9px] font-bold font-mono text-red-400 uppercase tracking-widest flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> Clinical Contraindications
                      </span>
                      <p className="text-xs text-red-200">{med.warnings}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="p-12 rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-md text-center flex flex-col items-center justify-center space-y-4"
              >
                <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">No Prescription Scanned</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Please upload an image containing written clinical guidelines, or run a Sandbox demo template to test active identification.
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
