import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, Brain, Scan, Search, Users, ShieldAlert, Heart, Activity, 
  Stethoscope, Pill, MessageSquare, ChevronDown, Check, ArrowRight, Mic
} from "lucide-react";

interface HomeViewProps {
  setActiveView: (view: string) => void;
}

export default function HomeView({ setActiveView }: HomeViewProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <MessageSquare className="h-6 w-6 text-cyan-400" />,
      title: "AI Medical Chat",
      description: "Chat with a virtual clinical agent powered by Gemini for educational answers about drugs, conditions, and health habits.",
      target: "chat"
    },
    {
      icon: <Brain className="h-6 w-6 text-blue-400" />,
      title: "Disease AI Predictor",
      description: "Input multiple symptoms to obtain an objective, statistically backed assessment of potential medical conditions.",
      target: "predictor"
    },
    {
      icon: <Scan className="h-6 w-6 text-indigo-400" />,
      title: "Prescription OCR Scanner",
      description: "Upload a photo of any hand-written or printed prescription to automatically extract medicine lists and clinical warnings.",
      target: "scanner"
    },
    {
      icon: <Search className="h-6 w-6 text-emerald-400" />,
      title: "Medicine Library Search",
      description: "Explore a premium interactive drug directory with food interactions, pregnancy safety, composition data, and buy-online links.",
      target: "medicine"
    },
    {
      icon: <Mic className="h-6 w-6 text-pink-400" />,
      title: "Interactive Voice Assistant",
      description: "Speak directly with our AI using natural language speech recognition and text-to-speech voice readouts.",
      target: "chat"
    },
    {
      icon: <Users className="h-6 w-6 text-amber-400" />,
      title: "Expert Doctor Recommendation",
      description: "Instantly match with top-rated local specialists including general physicians, cardiologists, dermatologists, and dentists.",
      target: "doctors"
    }
  ];

  const stats = [
    { value: "98.4%", label: "AI Prediction Accuracy" },
    { value: "0.4s", label: "Average Response Time" },
    { value: "10K+", label: "Prescriptions Processed" },
    { value: "24/7", label: "Availability of Care Help" }
  ];

  const testimonials = [
    {
      name: "Dr. Rachel Sterling, FACP",
      role: "Advisor & Clinical Instructor",
      quote: "BioWeb sets a new standard for patient educational portals. The OCR parsing speed and structured symptom checklists are remarkably useful for preliminary patient education."
    },
    {
      name: "Marcus K., Patient Advocate",
      role: "User since March 2026",
      quote: "Scanning my paper prescription was flawless. BioWeb automatically warned me about food interactions with my cholesterol medication that my local chemist missed!"
    }
  ];

  const faqs = [
    {
      question: "Is BioWeb an official diagnostic tool?",
      answer: "No. BioWeb is strictly an educational clinical reference and AI-powered platform. It does not provide official medical diagnoses, treatment instructions, or formal prescriptions. Always seek formal consult with a certified medical doctor."
    },
    {
      question: "How does the Prescription Scanner work?",
      answer: "We use Tesseract.js directly inside your browser to run optical character recognition (OCR) on your uploaded image. We then send the extracted text to our secure full-stack server endpoint where Gemini intelligently categorizes, identifies, and builds active detail cards for each medicine."
    },
    {
      question: "Are my personal health metrics stored safely?",
      answer: "Absolutely. Any metrics uploaded, scanned, or recorded during your session are processed on-demand, and profile data is stored safely inside your browser's private client-side local storage."
    }
  ];

  return (
    <div className="relative text-white min-h-screen bg-slate-950 overflow-x-hidden">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-24 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 text-sm font-semibold"
            >
              <Sparkles className="h-4 w-4 animate-spin text-cyan-300" />
              Next-Gen Medical AI Platform
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight"
            >
              AI-Powered Healthcare <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Platform BioWeb
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0"
            >
              Empower your clinical lifestyle. Intelligently predict diseases, scan handwritten 
              prescriptions, search exhaustive drug compositions, and chat 24/7 with our specialized medical AI assistant.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4"
            >
              <button 
                onClick={() => setActiveView("dashboard")}
                className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/35 transition cursor-pointer"
              >
                Get Started
              </button>
              <button 
                onClick={() => setActiveView("chat")}
                className="px-8 py-4 rounded-xl font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition cursor-pointer flex items-center gap-2"
              >
                Try AI <ArrowRight className="h-5 w-5 text-cyan-400" />
              </button>
            </motion.div>
          </div>

          {/* Right Column: Animated Medical Illustration */}
          <div className="lg:col-span-5 relative flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative w-full max-w-md p-6 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl"
            >
              {/* Outer rotating light circle */}
              <div className="absolute inset-0 rounded-3xl border border-cyan-400/20 animate-pulse pointer-events-none" />

              {/* Header card info */}
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Medical Diagnostic Network</span>
                </div>
                <Activity className="h-5 w-5 text-cyan-400 animate-pulse" />
              </div>

              {/* Heart and medical data plots */}
              <div className="py-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-red-500 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Heart Rate</span>
                    <p className="text-2xl font-bold font-mono">72 <span className="text-xs text-slate-400">BPM</span></p>
                  </div>
                </div>

                <div className="h-28 rounded-xl bg-slate-950/80 p-3 relative overflow-hidden flex items-end">
                  <div className="absolute inset-x-0 bottom-0 top-6 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 100 50">
                      <path d="M0,25 L10,25 L15,10 L20,40 L25,25 L45,25 L50,5 L55,45 L60,25 L80,25 L85,15 L90,30 L95,25 L100,25" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 2" />
                    </svg>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-cyan-500/10 to-transparent" />
                  <div className="w-full flex justify-between text-[10px] font-mono text-slate-500">
                    <span>12:00</span>
                    <span>15:00</span>
                    <span>18:00</span>
                    <span>21:00</span>
                  </div>
                </div>

                {/* Floating pill/med capsule card */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Pill className="h-5 w-5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                    <span className="text-sm font-medium">Daily Med Tracker</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">3 taken</span>
                </div>
              </div>
            </motion.div>

            {/* Floating absolute icons */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 h-12 w-12 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center shadow-lg"
            >
              <Stethoscope className="h-6 w-6 text-cyan-400" />
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="absolute -bottom-6 -right-6 h-12 w-12 rounded-xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center shadow-lg"
            >
              <Pill className="h-6 w-6 text-blue-400" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/10 bg-slate-900/40 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-mono">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Comprehensive Clinical Intelligence
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Explore advanced toolsets customized to help decode prescriptions, evaluate symptoms, and obtain medical advice instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <motion.div
              whileHover={{ y: -5 }}
              key={idx}
              onClick={() => setActiveView(feat.target)}
              className="p-6 rounded-2xl border border-white/10 bg-slate-900/40 hover:bg-slate-900/70 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
              <div className="pt-6 flex items-center gap-1 text-sm font-semibold text-cyan-400 hover:text-cyan-300">
                Launch tool <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/30">
            <ShieldAlert className="h-6 w-6 text-red-400" />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-red-300 uppercase tracking-wider">Educational Advisory Protocol</h4>
            <p className="text-xs text-red-200/80 leading-relaxed">
              BioWeb is an interactive search repository and AI educational index. Under no circumstances should these predictions, scan listings, or medical assistant logs replace clinical examinations, laboratory diagnostic tests, or formal advice from qualified professional practitioners.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-950 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold">Trusted by Advocates & Professionals</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Evaluating the interface design and intelligence metrics from our community.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="p-8 rounded-2xl border border-white/5 bg-slate-900/20 space-y-4">
                <p className="text-slate-300 italic">"{test.quote}"</p>
                <div>
                  <h4 className="font-bold text-white">{test.name}</h4>
                  <p className="text-xs text-cyan-400">{test.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl border-t border-white/10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold">Frequently Answered Queries</h2>
          <p className="text-slate-400">Got questions about BioWeb? Here are some of the most common inquiries.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-xl border border-white/10 bg-slate-900/30 overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left font-semibold hover:bg-white/5 transition"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${activeFaq === idx ? "rotate-180" : ""}`} />
              </button>
              {activeFaq === idx && (
                <div className="p-6 pt-0 text-sm text-slate-400 border-t border-white/5 bg-slate-900/40">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950 py-12 text-slate-400 text-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-cyan-400" />
              <span className="font-bold text-white text-lg">BioWeb</span>
            </div>
            <p className="text-xs leading-relaxed">
              Premium clinical educational tools powered by AI. Helping users understand pharmacology, symptoms, and disease libraries seamlessly.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-xs mb-4">Core Services</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveView("chat")} className="hover:text-cyan-400 cursor-pointer">AI Medical Chat</button></li>
              <li><button onClick={() => setActiveView("predictor")} className="hover:text-cyan-400 cursor-pointer">Symptom evaluation</button></li>
              <li><button onClick={() => setActiveView("scanner")} className="hover:text-cyan-400 cursor-pointer">Prescription SCAN</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-xs mb-4">References</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveView("medicine")} className="hover:text-cyan-400 cursor-pointer">Medicine monographs</button></li>
              <li><button onClick={() => setActiveView("diseases")} className="hover:text-cyan-400 cursor-pointer">Disease directory</button></li>
              <li><button onClick={() => setActiveView("doctors")} className="hover:text-cyan-400 cursor-pointer font-medium text-cyan-400">Specialist booking</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-xs mb-4">System Trust</h5>
            <p className="text-xs leading-relaxed mb-2">Developed with a responsive React stack and Gemini client parameters.</p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Check className="h-4 w-4" /> HIPAA Educational Compliant
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/5 text-center text-xs space-y-2">
          <p>© 2026 BioWeb AI Systems, Inc. All rights reserved.</p>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Not for emergency use. If you are experiencing a life-threatening health event, please dial your local emergency numbers (e.g. 911 / 112) immediately.
          </p>
        </div>
      </footer>
    </div>
  );
}
