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
import { isStaticDeployment, getClientApiKey, setClientApiKey } from "./utils/apiFallback";
import { AlertTriangle, Activity, ArrowLeft, Settings, Key, Globe, Check, AlertCircle } from "lucide-react";

export default function App() {
  const [activeView, setActiveView] = useState<string>("home");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats>(INITIAL_DASHBOARD_STATS);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [clientApiKey, setClientApiKeyLocal] = useState<string>(() => getClientApiKey());
  const [isStatic, setIsStatic] = useState<boolean>(() => isStaticDeployment());

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

  const handleSaveApiKey = (key: string) => {
    setClientApiKey(key);
    setClientApiKeyLocal(key);
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

        {/* Static Deployment Settings Banner */}
        {isStatic && (
          <div className="w-full bg-slate-900/60 backdrop-blur-sm border-b border-white/10 py-2.5 px-4 z-30">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300 text-center sm:text-left">
                {clientApiKey ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span><strong>GitHub Pages Active</strong>: Your Gemini API Key is loaded. Live medical AI is active!</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span><strong>GitHub Pages Active</strong>: Server is offline. Running with offline clinical diagnostics.</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 rounded-lg text-slate-300 hover:text-cyan-400 font-medium transition-all cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5" />
                Configure Gemini API Key
              </button>
            </div>
          </div>
        )}

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
              className="w-full max-w-md border border-white/10 bg-slate-900 rounded-2xl p-6 shadow-2xl relative space-y-6 text-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Static Deployment Settings</h3>
                    <p className="text-xs text-slate-400">Configure client-side medical AI</p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-3 bg-slate-950/50 p-4 rounded-xl border border-white/5 leading-relaxed">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                  <Globe className="h-4 w-4" />
                  GitHub Pages Active
                </div>
                <p>
                  Because this application is hosted on GitHub Pages (which is a static hosting provider), direct connection to the server-side medical database and AI model is offline.
                </p>
                <p>
                  <strong>Unlocking live AI</strong>: You can provide your own personal Google Gemini API Key. It will be saved securely on your browser (<code className="bg-slate-850 px-1 py-0.5 rounded text-[10px]">localStorage</code>) and sent directly to Google's API endpoint. Your key is never shared or stored on any server.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium">Gemini API Key</label>
                <input
                  type="password"
                  value={clientApiKey}
                  onChange={(e) => setClientApiKeyLocal(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50"
                />
                <p className="text-[10px] text-slate-500">
                  Don't have an API Key? Get one free in 1 minute from <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">Google AI Studio</a>.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveApiKey("")}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  Clear / Offline Mode
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveApiKey(clientApiKey)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 rounded-xl text-xs font-semibold text-white transition-all shadow-lg shadow-cyan-500/10 cursor-pointer"
                >
                  Save Configuration
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
