import React, { useState } from "react";
import { motion } from "motion/react";
import { Activity, ShieldAlert, Heart, Clipboard, User, Sparkles } from "lucide-react";
import { UserProfile } from "../types";

interface IntakeModalProps {
  onSubmit: (profile: UserProfile) => void;
}

export default function IntakeModal({ onSubmit }: IntakeModalProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("Male");
  const [bloodGroup, setBloodGroup] = useState("O+ Pos");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter the patient's full name.");
      return;
    }
    if (!age || Number(age) <= 0) {
      setError("Please enter a valid age.");
      return;
    }
    if (!emergencyContact.trim()) {
      setError("Please enter an emergency contact number.");
      return;
    }

    const newProfile: UserProfile = {
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      name: name.trim(),
      age: Number(age),
      gender,
      bloodGroup,
      emergencyContact: emergencyContact.trim(),
    };

    onSubmit(newProfile);
  };

  const handlePreFillDemo = () => {
    setName("Shaik Abdullah");
    setAge(21);
    setGender("Male");
    setBloodGroup("O+ Pos");
    setEmergencyContact("+1 (555) 019-2831");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl overflow-y-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/90 p-6 md:p-8 shadow-2xl space-y-6"
      >
        {/* Background glow */}
        <div className="absolute top-0 left-1/4 -translate-y-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white shrink-0">
              <Clipboard className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">BioWeb Portal Intake</span>
              <h2 className="text-2xl font-black text-white">Patient Registration</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePreFillDemo}
            className="px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-950/60 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start md:self-auto"
          >
            <Sparkles className="h-3.5 w-3.5" /> Pre-fill Shaik's Profile
          </button>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Welcome to BioWeb. To deliver personalized, safe, and objective clinical analysis, please complete the initial patient intake dossier.
        </p>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-950/25 p-3.5 text-xs text-red-300 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider block">Full Patient Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-white transition"
                  required
                />
              </div>
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider block">Age (Years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value === "" ? "" : Number(e.target.value));
                  if (error) setError("");
                }}
                placeholder="e.g. 28"
                min="1"
                max="125"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-white transition"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider block">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-white transition"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Blood Group */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider block">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-white transition"
              >
                <option value="A+ Pos">A+ Pos</option>
                <option value="A- Neg">A- Neg</option>
                <option value="B+ Pos">B+ Pos</option>
                <option value="B- Neg">B- Neg</option>
                <option value="AB+ Pos">AB+ Pos</option>
                <option value="AB- Neg">AB- Neg</option>
                <option value="O+ Pos">O+ Pos</option>
                <option value="O- Neg">O- Neg</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider block">Emergency Number</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => {
                  setEmergencyContact(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. +1 (555) 019-2831"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-white transition"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 px-6 py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 hover:opacity-95 transition cursor-pointer text-center text-sm"
            >
              Initialize Patient Profile & Open Web
            </button>
          </div>
        </form>

        {/* Disclaimer Warning */}
        <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-4 flex gap-3 items-start">
          <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider">Clinical Advisory Protocol</h4>
            <p className="text-[11px] text-red-200/70 leading-relaxed">
              BioWeb is an interactive search repository and AI educational index. Under no circumstances should these entries or logs replace clinical examinations, laboratory diagnostics, or formal consults with qualified professional doctors.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
