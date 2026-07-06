export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface DiseasePrediction {
  disease: string;
  confidence: number; // 0 to 100
  severity: "Low" | "Medium" | "High";
  symptoms: string[];
  treatmentOverview: string;
  specialist: string;
  medicalTests: string[];
  emergencyWarning: string;
  prevention: string[];
}

export interface MedicineDetails {
  name: string;
  uses: string[];
  dosage: string;
  sideEffects: string[];
  storage: string;
  manufacturer: string;
  alternatives: string[];
  warnings: string;
  image?: string;
  composition?: string;
  pregnancyWarning?: string;
  breastfeedingWarning?: string;
  alcoholInteraction?: string;
  foodInteraction?: string;
  expiryInfo?: string;
  availableStrengths?: string[];
  faqs?: { question: string; answer: string }[];
}

export interface DiseaseLibraryItem {
  name: string;
  image: string;
  symptoms: string[];
  causes: string[];
  stages: string[];
  complications: string[];
  treatment: string;
  medicines: string[];
  lifestyleTips: string[];
  emergencySigns: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  photo: string;
  availability: string[];
  hospital: string;
}

export interface UserProfile {
  avatar: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  emergencyContact: string;
  initialSymptoms?: string;
}

export interface DashboardStats {
  aiChatsCount: number;
  scannedCount: number;
  searchedMedicinesCount: number;
  savedConditionsCount: number;
  recentActivity: {
    id: string;
    type: "chat" | "scan" | "search" | "appointment";
    title: string;
    description: string;
    time: string;
  }[];
  healthMetrics: {
    name: string;
    heartRate: number;
    bloodPressure: string;
    activityMin: number;
    waterMl: number;
  };
}
