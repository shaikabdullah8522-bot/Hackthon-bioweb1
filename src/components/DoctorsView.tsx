import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, Star, MapPin, Calendar, Clock, Check, ShieldCheck, 
  Sparkles, X, Heart, ShieldAlert, ListFilter, AlertCircle
} from "lucide-react";
import { Doctor } from "../types";
import { SPECIALIST_DOCTORS } from "../data";

interface DoctorsViewProps {
  onAppointmentBooked: (doctorName: string, time: string) => void;
}

export default function DoctorsView({ onAppointmentBooked }: DoctorsViewProps) {
  const [activeSpecialty, setActiveSpecialty] = useState<string>("All");
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [bookingTime, setBookingTime] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [symptomNote, setSymptomNote] = useState("");

  const specialties = [
    "All", "General Physician", "Cardiologist", "Dermatologist", 
    "Neurologist", "Dentist", "Orthopedic Specialist", "Gynecologist"
  ];

  const filteredDocs = activeSpecialty === "All"
    ? SPECIALIST_DOCTORS
    : SPECIALIST_DOCTORS.filter(d => d.specialty === activeSpecialty);

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !bookingTime) return;

    // Trigger state update up to dashboard
    onAppointmentBooked(selectedDoc.name, bookingTime);
    setBookingSuccess(true);

    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedDoc(null);
      setBookingTime("");
      setSymptomNote("");
    }, 2500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-950 text-white min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-950/40 text-amber-400 text-xs font-semibold">
          <Users className="h-4 w-4 text-amber-300" />
          Specialist Practitioner Telehealth Booking
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Expert Doctor Recommendation</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Instantly connect with highly rated local physicians and board-certified specialists. Book virtual or physical appointments with real-time feedback.
        </p>
      </div>

      {/* Specialties Filters */}
      <div className="flex flex-wrap gap-2 justify-center py-2">
        {specialties.map((spec, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSpecialty(spec)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition ${
              activeSpecialty === spec
                ? "bg-gradient-to-r from-amber-500 to-orange-600 border-amber-500 text-white shadow-md shadow-amber-500/10"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Doctor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        {filteredDocs.map((doc) => (
          <motion.div
            key={doc.id}
            whileHover={{ y: -5 }}
            className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden flex flex-col justify-between"
          >
            {/* Top info & image */}
            <div className="p-6 space-y-4">
              <div className="flex gap-4 items-center">
                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shrink-0">
                  <img src={doc.photo} alt={doc.name} className="object-cover w-full h-full opacity-90" />
                </div>
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-mono border border-amber-500/20 uppercase tracking-wider font-bold">
                    {doc.specialty}
                  </span>
                  <h4 className="text-md font-bold text-white">{doc.name}</h4>
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="font-bold">{doc.rating}</span>
                    <span className="text-slate-500 font-normal">({doc.experience} exp)</span>
                  </div>
                </div>
              </div>

              {/* hospital/practice info */}
              <div className="pt-2 border-t border-white/5 space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{doc.hospital}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">Availability Session</span>
                    {doc.availability.map((time, idx) => (
                      <span key={idx} className="block text-[11px] text-slate-300">{time}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Book trigger */}
            <div className="p-6 pt-0">
              <button
                onClick={() => setSelectedDoc(doc)}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 font-bold text-xs cursor-pointer transition flex items-center justify-center gap-2"
              >
                Book Appointment
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Appointment Booking Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md p-6 rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDoc(null)}
                className="absolute right-4 top-4 p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Title / Header */}
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-extrabold text-white">Telehealth Scheduling</h3>
                <p className="text-xs text-slate-400">Schedule your consultation with {selectedDoc.name}</p>
              </div>

              {bookingSuccess ? (
                <div className="p-6 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <Check className="h-8 w-8 text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="font-bold text-emerald-300">Appointment Confirmed!</h4>
                  <p className="text-xs text-emerald-200/80">
                    Your consult with {selectedDoc.name} is successfully scheduled. Activity has been appended to your Dashboard logs.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookAppointment} className="space-y-4">
                  {/* Select available slot */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Available Time Slot</label>
                    <div className="space-y-2">
                      {selectedDoc.availability.map((slot, idx) => (
                        <label
                          key={idx}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                            bookingTime === slot
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                              : "bg-slate-950/40 border-white/5 text-slate-300 hover:bg-white/5"
                          }`}
                        >
                          <input
                            type="radio"
                            name="booking_time"
                            value={slot}
                            checked={bookingTime === slot}
                            onChange={() => setBookingTime(slot)}
                            className="text-amber-500 bg-transparent border-white/10 focus:ring-0"
                            required
                          />
                          <span className="text-xs">{slot}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Clinical symptoms description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Symptom Notes</label>
                    <textarea
                      value={symptomNote}
                      onChange={(e) => setSymptomNote(e.target.value)}
                      placeholder="Briefly state symptoms for the practitioner (e.g. chronic cough for 3 days)..."
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-white placeholder-slate-600 h-20 resize-none"
                    />
                  </div>

                  {/* Action triggers */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-bold hover:opacity-95 transition text-xs shadow-lg shadow-amber-500/15 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="h-4 w-4" /> Confirm Schedule Consultation
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
