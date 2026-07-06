import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Activity, Heart, MessageSquare, Pill, FileText, Scan, Calendar, 
  User, Check, Edit2, ShieldAlert, Award, Droplet, Clock
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";
import { DashboardStats, UserProfile } from "../types";
import { INITIAL_DASHBOARD_STATS } from "../data";

interface DashboardViewProps {
  stats: DashboardStats;
  setStats: React.Dispatch<React.SetStateAction<DashboardStats>>;
  profile: UserProfile;
  setProfile: (profile: UserProfile | null) => void;
}

export default function DashboardView({ stats, setStats, profile, setProfile }: DashboardViewProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>({ ...profile });

  useEffect(() => {
    if (profile) {
      setEditForm({ ...profile });
    }
  }, [profile]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(editForm);
    localStorage.setItem("bioweb_user_profile", JSON.stringify(editForm));
    setIsEditingProfile(false);
  };

  // Static chart data demonstrating vital timeline progress over 6 months
  const chartData = [
    { name: "Jan", "Heart Rate": 74, "Systolic BP": 125, Hydration: 1500 },
    { name: "Feb", "Heart Rate": 72, "Systolic BP": 122, Hydration: 1800 },
    { name: "Mar", "Heart Rate": 78, "Systolic BP": 128, Hydration: 1600 },
    { name: "Apr", "Heart Rate": 71, "Systolic BP": 119, Hydration: 2100 },
    { name: "May", "Heart Rate": 75, "Systolic BP": 121, Hydration: 1900 },
    { name: "Jun", "Heart Rate": 72, "Systolic BP": 120, Hydration: 2200 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-950 text-white min-h-[calc(100vh-4rem)]">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/10">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Diagnostic Dashboard</span>
          <h1 className="text-3xl font-extrabold text-white">Welcome back, {profile.name}</h1>
          <p className="text-sm text-slate-400">Review your clinical indicators, scanned prescriptions, and tele-consult logs.</p>
        </div>

        {/* Sync state badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-semibold">
          <Award className="h-4 w-4 animate-pulse" /> Diagnostic Sync Active
        </div>
      </div>

      {/* Grid: Metric Cards (AI Chats, Medicines, Scans, Conditions) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Chats Count */}
        <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-mono uppercase font-bold">AI Chat Consults</span>
            <p className="text-3xl font-extrabold font-mono text-white">{stats.aiChatsCount}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <MessageSquare className="h-6 w-6" />
          </div>
        </div>

        {/* Medicines Lookup Count */}
        <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-mono uppercase font-bold">Meds Searched</span>
            <p className="text-3xl font-extrabold font-mono text-white">{stats.searchedMedicinesCount}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Pill className="h-6 w-6" />
          </div>
        </div>

        {/* Scans processed */}
        <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-mono uppercase font-bold">Prescriptions Scanned</span>
            <p className="text-3xl font-extrabold font-mono text-white">{stats.scannedCount}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Scan className="h-6 w-6" />
          </div>
        </div>

        {/* Saved Diseases library item views */}
        <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-mono uppercase font-bold">Clinical Monographs</span>
            <p className="text-3xl font-extrabold font-mono text-white">{stats.savedConditionsCount}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FileText className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Grid: Charts + Activities & Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Recharts graph + Clinical Metrics (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Recharts Vital Trend Chart */}
          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md space-y-4">
            <div>
              <h3 className="text-md font-extrabold flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400 animate-pulse" /> Physiological Vital Timeline
              </h3>
              <p className="text-xs text-slate-400">Synthesizing clinical metrics over a rolling 6-month timeline.</p>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px" }}
                    labelClassName="text-slate-400 text-xs font-mono"
                  />
                  <Area type="monotone" dataKey="Heart Rate" stroke="#22d3ee" fillOpacity={1} fill="url(#colorHeart)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="Systolic BP" stroke="#6366f1" fillOpacity={1} fill="url(#colorBP)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Core Daily metrics gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Heartrate */}
            <div className="p-4 rounded-xl border border-white/5 bg-slate-900/20 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Heart className="h-5.5 w-5.5 text-red-500 animate-bounce" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Current Pulse</span>
                <span className="text-lg font-bold font-mono">{stats.healthMetrics.heartRate} <span className="text-xs text-slate-400 font-normal">BPM</span></span>
              </div>
            </div>

            {/* Blood pressure */}
            <div className="p-4 rounded-xl border border-white/5 bg-slate-900/20 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Activity className="h-5.5 w-5.5 text-cyan-400" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Blood Pressure</span>
                <span className="text-lg font-bold font-mono">{stats.healthMetrics.bloodPressure} <span className="text-xs text-slate-400 font-normal">mmHg</span></span>
              </div>
            </div>

            {/* Hydration */}
            <div className="p-4 rounded-xl border border-white/5 bg-slate-900/20 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Droplet className="h-5.5 w-5.5 text-blue-400 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Water Volume</span>
                <span className="text-lg font-bold font-mono">{stats.healthMetrics.waterMl} <span className="text-xs text-slate-400 font-normal">ML</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: User Profile & Recent Activities (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* User Profile Card */}
          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-400">User Clinical Profile</h3>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="p-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Edit user profile"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleProfileSave} className="space-y-3.5 text-xs text-slate-300">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Patient Name</span>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Age</span>
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) || 21 })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Gender</span>
                    <input
                      type="text"
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Blood Group</span>
                    <input
                      type="text"
                      value={editForm.bloodGroup}
                      onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Emergency No.</span>
                    <input
                      type="text"
                      value={editForm.emergencyContact}
                      onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 font-bold text-white text-xs transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm({ ...profile });
                      setIsEditingProfile(false);
                    }}
                    className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white text-xs transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-3 items-center">
                  <div className="h-14 w-14 rounded-full border-2 border-cyan-400 overflow-hidden bg-slate-950 shrink-0">
                    <img src={profile.avatar} alt="Patient Avatar" className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-md">{profile.name}</h4>
                    <span className="text-xs text-slate-400">Primary Health ID: #BWEB-991</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold block">Age / Gender</span>
                    <span className="text-slate-300 font-medium">{profile.age} Yrs / {profile.gender}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold block">Blood Group</span>
                    <span className="text-slate-300 font-medium">{profile.bloodGroup}</span>
                  </div>
                </div>

                <div className="space-y-0.5 text-xs">
                  <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold block">Emergency Contact</span>
                  <span className="text-slate-300 font-medium font-mono">{profile.emergencyContact}</span>
                </div>

                {profile.initialSymptoms && (
                  <div className="space-y-0.5 text-xs pt-2 border-t border-white/5">
                    <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold block">Intake Symptoms</span>
                    <p className="text-slate-300 font-medium italic">"{profile.initialSymptoms}"</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to reset this patient profile and clear stored diagnostics?")) {
                      localStorage.removeItem("bioweb_user_profile");
                      setProfile(null);
                    }
                  }}
                  className="w-full mt-4 py-2 rounded-xl border border-red-500/20 bg-red-950/20 text-red-300 hover:bg-red-950/40 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Reset Intake Profile
                </button>
              </div>
            )}
          </div>

          {/* Recent Activity List */}
          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md space-y-4">
            <div>
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-400">Recent Medical Activity</h3>
              <p className="text-[11px] text-slate-500">Continuous logs from symptoms checking & scans.</p>
            </div>

            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {stats.recentActivity.map((act) => (
                <div key={act.id} className="flex gap-3.5 items-start text-xs border-b border-white/5 pb-2.5 last:border-b-0 last:pb-0">
                  <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    {act.type === "chat" ? <MessageSquare className="h-4.5 w-4.5" /> : 
                     act.type === "scan" ? <Scan className="h-4.5 w-4.5" /> : 
                     act.type === "appointment" ? <Calendar className="h-4.5 w-4.5 text-amber-400" /> : <Pill className="h-4.5 w-4.5 text-emerald-400" />}
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">{act.title}</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{act.description}</p>
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
