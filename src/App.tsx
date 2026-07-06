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
import { AlertTriangle, Activity, ArrowLeft } from "lucide-react";

export default function App() {
  const [activeView, setActiveView] = useState<string>("home");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats>(INITIAL_DASHBOARD_STATS);

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
    </div>
  );
}
