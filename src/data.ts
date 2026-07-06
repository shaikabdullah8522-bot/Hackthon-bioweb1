import { DiseaseLibraryItem, Doctor, MedicineDetails } from "./types";

export const COMMON_SYMPTOMS = [
  "Fever", "Headache", "Dry Cough", "Sore Throat", "Shortness of Breath",
  "Body Pain", "Fatigue", "Loss of Taste/Smell", "Runny Nose", "Nausea",
  "Chest Tightness", "Dizziness", "Skin Rash", "Joint Stiffness", "Heart Palpitations"
];

export const MEDICINE_DATABASE: Record<string, MedicineDetails> = {
  paracetamol: {
    name: "Paracetamol (Acetaminophen)",
    uses: ["Reduction of fever", "Relief of mild to moderate pain (headaches, muscle aches, toothaches)"],
    dosage: "500mg - 1000mg every 4 to 6 hours as needed. Do not exceed 4000mg (4g) in 24 hours.",
    sideEffects: ["Nausea", "Allergic skin reactions (rare)", "Liver stress or injury in high overdoses"],
    storage: "Store in a cool, dry environment below 25°C. Keep away from direct sunlight.",
    manufacturer: "GSK Pharmaceuticals Ltd",
    composition: "Acetaminophen 500mg per tablet",
    pregnancyWarning: "Generally considered safe for short-term use during all trimesters of pregnancy. Consult your obstetrician.",
    breastfeedingWarning: "Excreted in small, clinically insignificant amounts in breastmilk. Deemed safe.",
    alcoholInteraction: "Highly contraindicated with chronic or high-volume alcohol consumption due to elevated risk of liver toxicity.",
    foodInteraction: "Can be taken with or without food. Taking with food may delay pain relief slightly but protects sensitive stomachs.",
    expiryInfo: "36 months from manufacturing date.",
    availableStrengths: ["250mg", "500mg", "650mg"],
    alternatives: ["Tylenol", "Dolo 650", "Calpol", "Crocin"],
    warnings: "Severe liver damage may occur if you take more than 4,000 mg in a day, take with other paracetamol-containing products, or consume 3+ alcoholic drinks daily.",
    faqs: [
      { question: "Can I take Paracetamol on an empty stomach?", answer: "Yes, paracetamol is generally gentle on the stomach lining and can be taken without food." },
      { question: "Is Paracetamol the same as Ibuprofen?", answer: "No, Paracetamol is an analgesic and antipyretic, whereas Ibuprofen is an NSAID which additionally reduces inflammation." }
    ]
  },
  amoxicillin: {
    name: "Amoxicillin (Penicillin Antibiotic)",
    uses: ["Bacterial infections of the ear, nose, throat, and respiratory tract", "Urinary tract infections (UTIs)", "Skin infections"],
    dosage: "250mg - 500mg three times daily, or 500mg - 875mg twice daily, for 7 to 10 days as prescribed.",
    sideEffects: ["Diarrhea", "Mild nausea", "Vaginal yeast infections", "Skin rash (discontinue immediately if rash occurs)"],
    storage: "Store oral capsules at room temperature. Liquid suspensions should be refrigerated and discarded after 14 days.",
    manufacturer: "Sandoz Pharmaceuticals Co.",
    composition: "Amoxicillin Trihydrate equivalent to 500mg anhydrous Amoxicillin",
    pregnancyWarning: "FDA Pregnancy Category B. Generally considered safe but should only be used when clearly indicated.",
    breastfeedingWarning: "Compatible with breastfeeding; monitor infant for potential diarrhea or diaper rash.",
    alcoholInteraction: "No direct contraindication, but alcohol should be avoided during infections to help the immune system recover.",
    foodInteraction: "May be taken with food to decrease GI irritation. Absorption is not affected.",
    expiryInfo: "24 months from manufacturing date.",
    availableStrengths: ["250mg", "500mg", "875mg"],
    alternatives: ["Mox", "Novamox", "Amoxil", "Augmentin (with Clavulanate)"],
    warnings: "Do not use if you have a known history of severe allergic reaction (anaphylaxis) to penicillin or cephalosporin antibiotics.",
    faqs: [
      { question: "Is it okay to stop taking Amoxicillin once symptoms clear up?", answer: "No, always complete the entire prescribed antibiotic course to prevent the development of antibiotic-resistant bacteria." },
      { question: "What should I do if I get a rash?", answer: "Discontinue the medication immediately and contact a physician, as a rash can signify an allergic hypersensitivity reaction." }
    ]
  },
  atorvastatin: {
    name: "Atorvastatin (Lipitor)",
    uses: ["Lowering LDL ('bad') cholesterol and triglycerides", "Increasing HDL ('good') cholesterol", "Reducing the risk of stroke, heart attack, and angina"],
    dosage: "10mg to 80mg once daily, taken at any time of day, with or without food.",
    sideEffects: ["Joint pain", "Muscle ache (myalgia)", "Mild diarrhea", "Slight elevation in liver enzyme levels"],
    storage: "Store at room temperature (20-25°C) in a moisture-controlled container.",
    manufacturer: "Pfizer Ltd",
    composition: "Atorvastatin Calcium 20mg",
    pregnancyWarning: "Strictly contraindicated (Category X). Can cause fetal harm. Discontinue immediately if pregnancy is suspected.",
    breastfeedingWarning: "Contraindicated. Do not breastfeed while using Atorvastatin due to potential disruption of infant lipid metabolism.",
    alcoholInteraction: "Limit alcohol intake; combination increases risk of liver dysfunction and muscle damage.",
    foodInteraction: "Avoid eating large amounts of grapefruit or drinking grapefruit juice, as it raises Atorvastatin blood levels dangerously.",
    expiryInfo: "36 months from manufacturing date.",
    availableStrengths: ["10mg", "20mg", "40mg", "80mg"],
    alternatives: ["Lipitor", "Atorva", "Tonact", "Storvas"],
    warnings: "Contact your physician immediately if you experience unexplained muscle pain, tenderness, or weakness, especially if accompanied by fever or dark urine.",
    faqs: [
      { question: "Why do I need to avoid grapefruit?", answer: "Grapefruit contains chemicals that inhibit enzymes responsible for breaking down statins, leading to toxic levels in the body." },
      { question: "Do I have to take Atorvastatin forever?", answer: "Cholesterol control is usually a chronic management pathway. Most patients take statins indefinitely alongside a heart-healthy diet." }
    ]
  },
  metformin: {
    name: "Metformin Hydrochloride",
    uses: ["Control of blood glucose in Type 2 Diabetes Mellitus", "Off-label management of Polycystic Ovary Syndrome (PCOS)"],
    dosage: "Initially 500mg twice daily or 850mg once daily with meals. Max daily dosage is 2550mg.",
    sideEffects: ["Abdominal bloating", "Diarrhea", "Metallic taste in mouth", "Nausea or vomiting"],
    storage: "Store at room temperature below 30°C. Protect from dampness.",
    manufacturer: "Merck KGaA",
    composition: "Metformin HCl 500mg",
    pregnancyWarning: "Category B. Insulin is generally preferred during pregnancy, but Metformin may be used under strict specialist supervision.",
    breastfeedingWarning: "Enters breastmilk in minor quantities. Consult physician; generally acceptable if infant is monitored.",
    alcoholInteraction: "Avoid excessive alcohol. Alcohol consumption increases the risk of a rare but fatal condition called lactic acidosis.",
    foodInteraction: "Must be taken with meals to minimize gastrointestinal side effects like stomach upset and bloating.",
    expiryInfo: "36 months from manufacturing date.",
    availableStrengths: ["500mg", "850mg", "1000mg", "500mg ER (Extended Release)"],
    alternatives: ["Glucophage", "Glycomet", "Glyciphage", "Riomet"],
    warnings: "Lactic acidosis is a rare but critical emergency. Symptoms include deep rapid breathing, severe fatigue, muscle aches, and sleepiness.",
    faqs: [
      { question: "What is the benefit of the 'ER' (Extended Release) formulation?", answer: "ER tablets release Metformin slowly, significantly reducing stomach upset and allowing for once-daily dosing." },
      { question: "Does Metformin cause hypoglycemia (dangerously low blood sugar)?", answer: "When used alone, Metformin rarely causes hypoglycemia because it does not stimulate the pancreas to produce more insulin." }
    ]
  }
};

export const DISEASE_LIBRARY: DiseaseLibraryItem[] = [
  {
    name: "Diabetes Mellitus (Type 2)",
    image: "https://images.unsplash.com/photo-1505575967455-40e256f73376?auto=format&fit=crop&q=80&w=400",
    symptoms: ["Increased thirst (polydipsia)", "Frequent urination (polyuria)", "Extreme hunger", "Unexplained weight loss", "Blurred vision", "Slow-healing sores"],
    causes: ["Insulin resistance in peripheral tissues", "Inadequate insulin secretion by pancreatic beta cells", "Genetic predisposition", "Sedentary lifestyle and obesity"],
    stages: [
      "Stage 1: Insulin Resistance - Cells ignore insulin, pancreas overproduces it.",
      "Stage 2: Pre-diabetes - Blood glucose levels are higher than normal but below clinical diabetes thresholds.",
      "Stage 3: Full Diabetes - Hyperglycemia persists, requiring medication or insulin."
    ],
    complications: ["Cardiovascular disease", "Neuropathy (nerve damage in hands/feet)", "Nephropathy (kidney disease)", "Retinopathy (vision loss)", "Diabetic foot ulcers"],
    treatment: "Lifestyle modifications (diet, exercise) combined with oral hypoglycemic drugs (e.g., Metformin) and/or insulin therapy.",
    medicines: ["Metformin", "Glipizide", "Empagliflozin", "Insulin Glargine"],
    lifestyleTips: ["Adopt a low-glycemic, fiber-rich diet", "Engage in 150 minutes of moderate exercise weekly", "Monitor blood glucose levels regularly", "Get routine diabetic foot and eye exams"],
    emergencySigns: ["Confusion or extreme drowsiness", "Rapid deep breathing with sweet-smelling breath (ketoacidosis)", "Loss of consciousness", "Severe dehydration"]
  },
  {
    name: "Hypertension (High Blood Pressure)",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400",
    symptoms: ["Often asymptomatic ('silent killer')", "Dull headaches", "Dizziness", "Nosebleeds", "Shortness of breath"],
    causes: ["Aging vascular walls", "Excessive sodium intake", "Obesity and physical inactivity", "Chronic stress", "Kidney dysfunction or hormonal disorders"],
    stages: [
      "Normal: Below 120/80 mmHg",
      "Elevated: Systolic 120-129 and Diastolic below 80",
      "Stage 1 Hypertension: Systolic 130-139 or Diastolic 80-80",
      "Stage 2 Hypertension: Systolic 140+ or Diastolic 90+ mmHg"
    ],
    complications: ["Stroke (brain hemorrhage or clot)", "Myocardial Infarction (Heart Attack)", "Aneurysms", "Heart failure", "Chronic Kidney Disease"],
    treatment: "Salt restriction, physical exercise, weight reduction, and antihypertensive drugs (ACE inhibitors, beta-blockers, calcium channel blockers).",
    medicines: ["Lisinopril", "Amlodipine", "Losartan", "Metoprolol"],
    lifestyleTips: ["Adopt the DASH diet (rich in fruits, vegetables, low-fat dairy)", "Reduce daily sodium to under 1,500 mg", "Limit alcohol consumption", "Monitor BP at home"],
    emergencySigns: ["Severe headache with confusion or blurred vision (Hypertensive Crisis)", "Chest pain or tightness", "Sudden weakness or numbness on one side of the body"]
  },
  {
    name: "Asthma (Chronic Airway Inflammation)",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
    symptoms: ["Wheezing on exhalation", "Shortness of breath", "Chest tightness", "Chronic dry coughing (worse at night)"],
    causes: ["Genetic immunologic responses", "Allergen triggers (pollen, dust mites, pet dander)", "Cold weather or physical exertion", "Respiratory viral infections"],
    stages: [
      "Intermittent: Symptoms occur ≤ 2 days/week",
      "Mild Persistent: Symptoms occur > 2 days/week but not daily",
      "Moderate Persistent: Daily symptoms, affecting daily activities",
      "Severe Persistent: Continuous symptoms, severe limitations"
    ],
    complications: ["Permanent narrowing of bronchial tubes (airway remodeling)", "Severe asthma attacks requiring emergency ventilation", "Sleep disruptions"],
    treatment: "Avoidance of known environmental triggers, daily inhaled corticosteroid control therapy, and quick-relief bronchodilator rescue inhalers.",
    medicines: ["Albuterol (Salbutamol)", "Fluticasone", "Montelukast", "Budesonide"],
    lifestyleTips: ["Use allergen-proof mattress and pillow covers", "Warm up for 10-15 minutes before physical exercises", "Monitor peak expiratory flow rates", "Always carry a rescue inhaler"],
    emergencySigns: ["Inability to speak in full sentences due to breathlessness", "Lips or fingernails turning blue/grey", "Chest retractions (skin sucking in around ribs)"]
  }
];

export const SPECIALIST_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Sarah Alistair, MD",
    specialty: "General Physician",
    experience: "12 Years",
    rating: 4.9,
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
    availability: ["Monday 9:00 AM - 1:00 PM", "Wednesday 2:00 PM - 6:00 PM", "Friday 9:00 AM - 1:00 PM"],
    hospital: "BioWeb Central Clinic, NY"
  },
  {
    id: "doc-2",
    name: "Dr. Ethan Vance, FACP",
    specialty: "Cardiologist",
    experience: "18 Years",
    rating: 4.95,
    photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    availability: ["Tuesday 10:00 AM - 4:00 PM", "Thursday 10:00 AM - 4:00 PM"],
    hospital: "Metropolitan Heart Institute"
  },
  {
    id: "doc-3",
    name: "Dr. Clara Sterling, PhD",
    specialty: "Dermatologist",
    experience: "9 Years",
    rating: 4.8,
    photo: "https://images.unsplash.com/photo-1594824813573-246434e3b96f?auto=format&fit=crop&q=80&w=300",
    availability: ["Monday 2:00 PM - 6:00 PM", "Thursday 9:00 AM - 1:00 PM"],
    hospital: "Skin & Laser Center of Excellence"
  },
  {
    id: "doc-4",
    name: "Dr. Marcus Vance, MD",
    specialty: "Neurologist",
    experience: "15 Years",
    rating: 4.92,
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300",
    availability: ["Wednesday 10:00 AM - 3:00 PM", "Friday 1:00 PM - 5:00 PM"],
    hospital: "Neuroscience Specialty Hospital"
  },
  {
    id: "doc-5",
    name: "Dr. Elena Rostova, DDS",
    specialty: "Dentist",
    experience: "7 Years",
    rating: 4.75,
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    availability: ["Tuesday 9:00 AM - 5:00 PM", "Saturday 9:00 AM - 1:00 PM"],
    hospital: "BioWeb Dental Arts Clinic"
  },
  {
    id: "doc-6",
    name: "Dr. Julian Thorne, MS",
    specialty: "Orthopedic Specialist",
    experience: "14 Years",
    rating: 4.88,
    photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    availability: ["Thursday 1:00 PM - 6:00 PM", "Friday 9:00 AM - 1:00 PM"],
    hospital: "Joint and Spine OrthoClinic"
  },
  {
    id: "doc-7",
    name: "Dr. Maya Lin, MD",
    specialty: "Gynecologist",
    experience: "11 Years",
    rating: 4.91,
    photo: "https://images.unsplash.com/photo-1594824813573-246434e3b96f?auto=format&fit=crop&q=80&w=300",
    availability: ["Monday 9:00 AM - 2:00 PM", "Wednesday 9:00 AM - 2:00 PM"],
    hospital: "BioWeb Women Health Pavilion"
  }
];

export const INITIAL_DASHBOARD_STATS = {
  aiChatsCount: 14,
  scannedCount: 3,
  searchedMedicinesCount: 22,
  savedConditionsCount: 2,
  recentActivity: [
    { id: "act-1", type: "chat" as const, title: "Consulted AI Assistant", description: "Inquired about acute chest congestion and recommended over-the-counter remedies.", time: "2 hours ago" },
    { id: "act-2", type: "scan" as const, title: "Uploaded Prescription JPG", description: "Successfully scanned 'Paracetamol 650' prescription.", time: "1 day ago" },
    { id: "act-3", type: "search" as const, title: "Searched Metformin HCl", description: "Reviewed contraindications, available dosage strengths, and dietary guidelines.", time: "3 days ago" },
    { id: "act-4", type: "appointment" as const, title: "Scheduled General Consult", description: "Booked telehealth appointment with Dr. Sarah Alistair.", time: "July 8th, 2026" }
  ],
  healthMetrics: {
    name: "Patient Diagnostics Timeline",
    heartRate: 72,
    bloodPressure: "120/80",
    activityMin: 45,
    waterMl: 1800
  }
};
