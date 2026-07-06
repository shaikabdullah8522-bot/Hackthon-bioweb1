import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Building, Mail, Phone, MapPin, CheckCircle, Send, 
  HelpCircle, ChevronDown, Activity, Sparkles, BookOpen, ShieldCheck
} from "lucide-react";

export default function AboutContactView() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 2500);
  };

  const clinicalFaqs = [
    {
      question: "Are the drug databases continuously updated?",
      answer: "Yes. Our core pharmacology indexing queries the national drug repositories and utilizes the Gemini LLM engine as an active medical monograph generator, ensuring that side effects, chemical composition strengths, and warnings remain consistently current."
    },
    {
      question: "Can I connect my Fitbit, Apple Health, or Wearable metrics?",
      answer: "Currently, BioWeb supports secure client-side logging of essential health metrics like heart rate, daily water volume, and exercises. Future updates will leverage OAuth integrations to sync continuous wearable diagnostics timelines."
    },
    {
      question: "How do I report incorrect medicine alternatives or data errors?",
      answer: "We take medical safety very seriously. If you identify a spelling discrepancy, outdated manufacturer, or incorrect chemical alternative in our monograph search directory, please use our contact form below to file a correction ticket with our clinical advisory team."
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12 bg-slate-950 text-white min-h-[calc(100vh-4rem)]">
      
      {/* 1. About Section */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 text-xs font-semibold">
            <Building className="h-4 w-4" /> About BioWeb Intelligence
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Pioneering Patient Literacy</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            BioWeb was born from a simple mission: to demystify complex medical nomenclature, drug interactions, and diagnostic timelines for everyday patients. We combine cutting-edge OCR engines and neural network matching to make healthcare information highly legible.
          </p>
        </div>

        {/* Mission / Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/20 text-center space-y-3">
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <h4 className="font-bold">Next-Gen Patient AI</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We leverage safe, highly aligned AI parameters to parse messy OCR clinical text, answer pharmaceutical queries, and estimate potential ailments.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/20 text-center space-y-3">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
              <BookOpen className="h-6 w-6" />
            </div>
            <h4 className="font-bold">Pharmacological Literacy</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Making drug safety warnings, composition variables, available strengths, and generic alternatives scannable, protecting families.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/20 text-center space-y-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="font-bold">Security First</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All personal metrics, symptoms lists, and session profiles are processed strictly in real-time and saved in local client secure containers.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Dual Column: FAQ + Contact Form */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-white/10 items-start">
        
        {/* Left Col: Additional FAQs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Frequently Asked</span>
            <h3 className="text-xl font-bold text-white mt-1">Clinical Support FAQs</h3>
            <p className="text-xs text-slate-500 mt-1">Common system and data safety questions answered by our advisors.</p>
          </div>

          <div className="space-y-3">
            {clinicalFaqs.map((faq, idx) => {
              const isActive = activeFaq === idx;
              return (
                <div key={idx} className="rounded-xl border border-white/10 bg-slate-900/30 overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(isActive ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left text-xs font-semibold hover:bg-white/5 transition"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isActive ? "rotate-180" : ""}`} />
                  </button>
                  {isActive && (
                    <div className="p-4 pt-0 text-xs text-slate-400 border-t border-white/5 leading-relaxed bg-slate-900/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Contact Details */}
          <div className="p-5 rounded-xl border border-white/5 bg-slate-950 space-y-3.5 text-xs text-slate-400">
            <h4 className="font-bold text-white">Central Advisory Office</h4>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span>BioWeb Campus, 500 Medical Plaza, San Francisco, CA</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-indigo-400" />
              <span>advisory@bioweb-systems.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-emerald-400" />
              <span>+1 (800) 555-BIOWEB</span>
            </div>
          </div>
        </div>

        {/* Right Col: Contact Form (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md space-y-4">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Feedback Portal</span>
            <h3 className="text-xl font-bold text-white mt-1">Get in Touch</h3>
            <p className="text-xs text-slate-500 mt-1">Submit technical questions, feedback, or molecular data reporting tickets.</p>
          </div>

          {submitSuccess ? (
            <div className="p-8 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="font-bold text-emerald-300">Message Delivered Successfully</h4>
              <p className="text-xs text-emerald-200/80">
                Thank you. Your clinical feedback has been logged in our queue. An advisory manager will respond shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 font-bold">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-600"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 font-bold">Clinical Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. jane@hospital.org"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-slate-500 font-bold">Subject / Reference</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Molecule Alternative Spelling, Partnership Inquiries..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-slate-500 font-bold">Inquiry / Message Notes</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Specify feedback details here..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-600 h-28 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold hover:opacity-95 transition text-xs shadow-lg shadow-cyan-500/15 cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" /> Send Inquiry Notes
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
