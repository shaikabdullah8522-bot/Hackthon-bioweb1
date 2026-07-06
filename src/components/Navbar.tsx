import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Menu, X, Sun, Moon, Sparkles } from "lucide-react";

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export default function Navbar({ activeView, setActiveView, isDarkMode, setIsDarkMode }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "chat", label: "AI Chat" },
    { id: "predictor", label: "Disease AI" },
    { id: "scanner", label: "Prescription" },
    { id: "medicine", label: "Medicine" },
    { id: "diseases", label: "Disease Library" },
    { id: "doctors", label: "Doctors" },
    { id: "dashboard", label: "Dashboard" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300 border-white/10 bg-slate-950/75 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView("home")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent flex items-center gap-1">
              BioWeb <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className="relative px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer text-slate-300 hover:text-white"
              >
                {activeView === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-white/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-400" />}
            </button>
            <button
              onClick={() => setActiveView("chat")}
              className="px-4 py-2 rounded-xl text-sm font-semibold tracking-wide bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-400/30 hover:opacity-95 transition duration-200"
            >
              Try AI Assistant
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-400" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-white/10 bg-slate-900/95"
          >
            <div className="space-y-1 px-4 py-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                    activeView === item.id
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/20"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2 border-t border-white/5">
                <button
                  onClick={() => {
                    setActiveView("chat");
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-center text-base font-semibold text-white shadow-lg shadow-cyan-500/20"
                >
                  <Sparkles className="h-5 w-5" /> Try AI Assistant
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
