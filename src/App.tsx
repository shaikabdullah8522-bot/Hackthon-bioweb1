import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import HomeView from "./components/HomeView";
import ChatView from "./components/ChatView";
import PredictorView from "./components/PredictorView";
import ScannerView from "./components/ScannerView";
import MedicineView from "./components/MedicineView";
import DiseaseView from "./components/DiseaseView";
import DoctorsView from "./components/DoctorsView";
import DashboardView from "./components/DashboardView";
import AboutContactView from "./components/AboutContactView";
import IntakeModal from "./components/IntakeModal";
import { DashboardStats, UserProfile } from "./types";
import { INITIAL_DASHBOARD_STATS } from "./data";
import { isStaticDeployment, getClientApiKey, setClientApiKey, getClientOpenAIKey, setClientOpenAIKey, getActiveAIProvider, setActiveAIProvider, testGeminiKey, testOpenAIKey } from "./utils/apiFallback";
import { AlertTriangle, Activity, ArrowLeft, Settings, Key, Globe, Check, AlertCircle } from "lucide-react";

export default function App() {
  const [activeView, setActiveView] = useState<string>("home");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats>(INITIAL_DASHBOARD_STATS);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [clientApiKey, setClientApiKeyLocal] = useState<string>(() => getClientApiKey());
  const [clientOpenAIApiKey, setClientOpenAIApiKeyLocal] = useState<string>(() => getClientOpenAIKey());
  const [activeProvider, setActiveProviderLocal] = useState<"gemini" | "openai">(() => getActiveAIProvider());
  const [isStatic, setIsStatic] = useState<boolean>(() => isStaticDeployment());

  const [testingGemini, setTestingGemini] = useState<boolean>(false);
  const [testingOpenAI, setTestingOpenAI] = useState<boolean>(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [openAITestResult, setOpenAITestResult] = useState<{ success: boolean; error?: string } | null>(null);

  const handleTestGemini = async () => {
    setTestingGemini(true);
    setGeminiTestResult(null);
    const result = await testGeminiKey(clientApiKey);
    setGeminiTestResult(result);
    setTestingGemini(false);
  };

  const handleTestOpenAI = async () => {
    setTestingOpenAI(true);
    setOpenAITestResult(null);
    const result = await testOpenAIKey(clientOpenAIApiKey);
    setOpenAITestResult(result);
    setTestingOpenAI(false);
  };

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("bioweb_user_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing user profile from localStorage", e);
      }
    }
    return null;
  });

  const handleIntakeSubmit = (newProfile: UserProfile) => {
    localStorage.setItem("bioweb_user_profile", JSON.stringify(newProfile));
    setProfile(newProfile);

    const intakeLog = {
      id: "act-intake-" + Date.now(),
      type: "appointment" as const,
      title: "Patient Profile Registered",
      description: `Comprehensive intake complete for ${newProfile.name}. Age: ${newProfile.age}, Gender: ${newProfile.gender}.`,
      time: "Just now"
    };

    const symptomLog = {
      id: "act-symptoms-" + Date.now(),
      type: "chat" as const,
      title: "Active Symptoms Registered",
      description: `Logged: "${newProfile.initialSymptoms}"`,
      time: "Just now"
    };

    setStats((prev) => ({
      ...prev,
      recentActivity: [intakeLog, symptomLog, ...prev.recentActivity],
    }));

    setActiveView("dashboard");
  };

  // Callback to handle appointment booking and synchronizing recent activity logs on dashboard
  const handleAppointmentBooked = (doctorName: string, time: string) => {
    // Increment logs and append new activity item
    const newActivity = {
      id: "act-" + Date.now(),
      type: "appointment" as const,
      title: "Confirmed Telehealth Consultation",
      description: `Scheduled appointment with ${doctorName} during session: ${time}.`,
      time: "Just now"
    };

    setStats((prev) => ({
      ...prev,
      recentActivity: [newActivity, ...prev.recentActivity],
    }));
  };

  // View Router Render Helper
  const renderView = () => {
    const getViewContent = () => {
      switch (activeView) {
        case "home":
          return <HomeView setActiveView={setActiveView} />;
        case "chat":
          // Automatically increments chat counts on click
          return (
            <div onClick={() => setStats(prev => ({ ...prev, aiChatsCount: prev.aiChatsCount + 1 }))}>
              <ChatView />
            </div>
          );
        case "predictor":
          // Increments saved conditions on success
          return (
            <div onClick={() => setStats(prev => ({ ...prev, savedConditionsCount: prev.savedConditionsCount + 1 }))}>
              <PredictorView />
            </div>
          );
        case "scanner":
          // Increments scans counted
          return (
            <div onClick={() => setStats(prev => ({ ...prev, scannedCount: prev.scannedCount + 1 }))}>
              <ScannerView />
            </div>
          );
        case "medicine":
          // Increments searched medicines
          return (
            <div onClick={() => setStats(prev => ({ ...prev, searchedMedicinesCount: prev.searchedMedicinesCount + 1 }))}>
              <MedicineView />
            </div>
          );
        case "diseases":
          return <DiseaseView />;
        case "doctors":
          return <DoctorsView onAppointmentBooked={handleAppointmentBooked} />;
        case "dashboard":
          return profile ? (
            <DashboardView 
              stats={stats} 
              setStats={setStats} 
              profile={profile} 
              setProfile={setProfile} 
            />
          ) : null;
        case "about":
        case "faq":
        case "contact":
          return <AboutContactView />;
        default:
          // High-fidelity 404 Fallback View
          return (
            <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
                <AlertTriangle className="h-8 w-8 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-white">404 - Diagnostic Area Restricted</h1>
                <p className="text-sm text-slate-400">
                  The medical directory page you are attempting to search does not exist or has been relocated by clinical administration.
                </p>
              </div>
              <button
                onClick={() => setActiveView("home")}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-xs hover:opacity-95 transition flex items-center gap-2 mx-auto cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Return to Home Platform
              </button>
            </div>
          );
      }
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {getViewContent()}
        </motion.div>
      </AnimatePresence>
    );
  };

  const handleSaveApiKey = (geminiKey: string, openAiKey: string, provider: "gemini" | "openai") => {
    setClientApiKey(geminiKey);
    setClientApiKeyLocal(geminiKey);
    setClientOpenAIKey(openAiKey);
    setClientOpenAIApiKeyLocal(openAiKey);
    setActiveAIProvider(provider);
    setActiveProviderLocal(provider);
    setShowApiKeyModal(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-white" : "bg-cyan-50/40 text-slate-900"}`}>
      {/* Dynamic Background Blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 transition-colors ${isDarkMode ? "bg-cyan-500" : "bg-cyan-300"}`} />
        <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 transition-colors ${isDarkMode ? "bg-blue-600" : "bg-blue-300"}`} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar
          activeView={activeView}
          setActiveView={setActiveView}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

        {/* Gemini & OpenAI API Key Settings Banner */}
        <div className="w-full bg-slate-900/60 backdrop-blur-sm border-b border-white/10 py-2.5 px-4 z-30">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300 text-center sm:text-left">
              {activeProvider === "openai" ? (
                clientOpenAIApiKey ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span><strong>Personal OpenAI Key Active</strong>: Running direct client-to-model mode via GPT-4o-mini.</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                    <span><strong>BioWeb Cloud Server Active (OpenAI Mode)</strong>: Running via backend cloud gateway. Configure personal key for direct mode.</span>
                  </>
                )
              ) : (
                clientApiKey ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span><strong>Personal Gemini Key Active</strong>: Running direct client-to-model mode. Bypassing cloud server rate/demand limits!</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                    <span><strong>BioWeb Cloud Server Active (Gemini Mode)</strong>: Running via default cloud gateway. Configure a personal key for high speed.</span>
                  </>
                )
              )}
            </div>
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 hover:from-cyan-900/60 hover:to-blue-900/60 border border-white/10 hover:border-cyan-500/40 rounded-lg text-slate-300 hover:text-cyan-400 font-semibold transition-all cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5" />
              Configure AI Providers & API Keys
            </button>
          </div>
        </div>

        {/* Active Route Workspace */}
        <main className="flex-1">
          {renderView()}
        </main>

        {/* Global Footer Quick Navigation links */}
        {activeView !== "home" && (
          <div className="border-t border-white/5 py-6 bg-slate-950/40 text-center text-xs text-slate-500 space-y-2 relative z-20">
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => setActiveView("home")} className="hover:text-cyan-400 cursor-pointer">Home</button>
              <button onClick={() => setActiveView("about")} className="hover:text-cyan-400 cursor-pointer">About Advisory</button>
              <button onClick={() => setActiveView("about")} className="hover:text-cyan-400 cursor-pointer font-semibold text-cyan-400">System FAQs & Contact</button>
            </div>
            <p>© 2026 BioWeb Clinical AI Platform. Designed strictly for educational reference.</p>
          </div>
        )}
      </div>

      {/* Intake Form Modal Overlay (forces profile details input on initial load) */}
      {!profile && <IntakeModal onSubmit={handleIntakeSubmit} />}

      {/* API Key Modal */}
      <AnimatePresence>
        {showApiKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg border border-white/10 bg-slate-900 rounded-2xl p-6 shadow-2xl relative space-y-6 text-white overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Engine Workspace Settings</h3>
                    <p className="text-xs text-slate-400">Select model provider & apply personal keys</p>
                  </div>
                </div>
              </div>

              {/* Provider Selector Tabs */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold block">Active AI Engine Provider</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveProviderLocal("gemini")}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      activeProvider === "gemini"
                        ? "bg-cyan-950/40 border-cyan-500/80 text-cyan-300"
                        : "bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10"
                    }`}
                  >
                    <div className="text-xs font-bold">Google Gemini</div>
                    <div className="text-[10px] opacity-75 mt-0.5">2.5 Flash / 3.5 Flash</div>
                    {activeProvider === "gemini" && (
                      <div className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveProviderLocal("openai")}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      activeProvider === "openai"
                        ? "bg-emerald-950/40 border-emerald-500/80 text-emerald-300"
                        : "bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10"
                    }`}
                  >
                    <div className="text-xs font-bold">OpenAI GPT</div>
                    <div className="text-[10px] opacity-75 mt-0.5">GPT-4o / GPT-4o-mini</div>
                    {activeProvider === "openai" && (
                      <div className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-2 bg-slate-950/50 p-4 rounded-xl border border-white/5 leading-relaxed">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                  <Globe className="h-4 w-4" />
                  How Personal Keys Work
                </div>
                <p>
                  Saving personal keys lets you bypass any cloud-rate constraints. Requests execute directly and securely inside your browser. Keys are saved only in your local browser storage (<code className="bg-slate-800 px-1 py-0.5 rounded text-[10px]">localStorage</code>).
                </p>
              </div>

              <div className="space-y-4">
                {/* Gemini Input */}
                <div className="space-y-2 bg-slate-950/20 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-400 font-bold">Google Gemini API Key</label>
                    {clientApiKey ? (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">Configured</span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded">Not Set</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={clientApiKey}
                      onChange={(e) => {
                        setClientApiKeyLocal(e.target.value);
                        setGeminiTestResult(null);
                      }}
                      placeholder="AIzaSy..."
                      className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    />
                    {clientApiKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setClientApiKeyLocal("");
                          setGeminiTestResult(null);
                        }}
                        className="px-2.5 py-1.5 bg-red-950/30 hover:bg-red-900/40 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleTestGemini}
                      disabled={testingGemini}
                      className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer transition-all"
                    >
                      {testingGemini ? "Testing..." : "Test Key"}
                    </button>
                  </div>

                  {geminiTestResult && (
                    <div className={`text-[11px] p-2 rounded-lg flex items-start gap-1.5 border ${
                      geminiTestResult.success 
                        ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-400" 
                        : "bg-red-950/30 border-red-500/20 text-red-400"
                    }`}>
                      {geminiTestResult.success ? (
                        <>
                          <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-400" />
                          <span>Gemini API Key verified! Ready to run.</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-400" />
                          <span className="leading-tight">Validation Failed: {geminiTestResult.error || "Invalid key. Ensure there are no spaces."}</span>
                        </>
                      )}
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500">
                    Get a free key in 1 minute from <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">Google AI Studio</a>.
                  </p>
                </div>

                {/* OpenAI Input */}
                <div className="space-y-2 bg-slate-950/20 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-400 font-bold">OpenAI API Key</label>
                    {clientOpenAIApiKey ? (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">Configured</span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded">Not Set</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={clientOpenAIApiKey}
                      onChange={(e) => {
                        setClientOpenAIApiKeyLocal(e.target.value);
                        setOpenAITestResult(null);
                      }}
                      placeholder="sk-proj-..."
                      className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    {clientOpenAIApiKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setClientOpenAIApiKeyLocal("");
                          setOpenAITestResult(null);
                        }}
                        className="px-2.5 py-1.5 bg-red-950/30 hover:bg-red-900/40 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleTestOpenAI}
                      disabled={testingOpenAI}
                      className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer transition-all"
                    >
                      {testingOpenAI ? "Testing..." : "Test Key"}
                    </button>
                  </div>

                  {openAITestResult && (
                    <div className={`text-[11px] p-2 rounded-lg flex items-start gap-1.5 border ${
                      openAITestResult.success 
                        ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-400" 
                        : "bg-red-950/30 border-red-500/20 text-red-400"
                    }`}>
                      {openAITestResult.success ? (
                        <>
                          <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-400" />
                          <span>OpenAI API Key verified! GPT-4o-mini is primed.</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-400" />
                          <span className="leading-tight">Validation Failed: {openAITestResult.error || "Verify limits or key validity."}</span>
                        </>
                      )}
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500">
                    Retrieve your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline hover:text-emerald-300">OpenAI Dashboard</a>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setClientApiKeyLocal("");
                    setClientOpenAIApiKeyLocal("");
                    handleSaveApiKey("", "", "gemini");
                  }}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  Clear Keys / Default Server
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveApiKey(clientApiKey, clientOpenAIApiKey, activeProvider)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 rounded-xl text-xs font-semibold text-white transition-all shadow-lg shadow-cyan-500/10 cursor-pointer"
                >
                  Save Workspace
                </button>
              </div>

              <button 
                onClick={() => setShowApiKeyModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
