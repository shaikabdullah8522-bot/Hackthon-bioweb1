/**
 * Client-Side API Fallback Utility for Static Environments (like GitHub Pages)
 */

export function isStaticDeployment(): boolean {
  return (
    window.location.hostname.includes("github.io") ||
    window.location.hostname.includes("localhost") && !window.location.port
  );
}

export function getClientApiKey(): string {
  return localStorage.getItem("user_gemini_api_key") || "";
}

export function setClientApiKey(key: string) {
  if (key) {
    localStorage.setItem("user_gemini_api_key", key.trim());
  } else {
    localStorage.removeItem("user_gemini_api_key");
  }
}

export function getClientOpenAIKey(): string {
  return localStorage.getItem("user_openai_api_key") || "";
}

export function setClientOpenAIKey(key: string) {
  if (key) {
    localStorage.setItem("user_openai_api_key", key.trim());
  } else {
    localStorage.removeItem("user_openai_api_key");
  }
}

export function getActiveAIProvider(): "gemini" | "openai" {
  const provider = localStorage.getItem("active_ai_provider");
  return provider === "openai" ? "openai" : "gemini";
}

export function setActiveAIProvider(provider: "gemini" | "openai") {
  localStorage.setItem("active_ai_provider", provider);
}

export async function testGeminiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
  if (!apiKey) return { success: false, error: "Please enter a key before testing." };
  try {
    const model = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Respond only with OK" }] }]
      })
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = errData.error?.message || `HTTP error ${response.status}`;
      return { success: false, error: message };
    }
    const data = await response.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return { success: true };
    }
    return { success: false, error: "Empty response generated." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reach Google Gemini API." };
  }
}

export async function testOpenAIKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
  if (!apiKey) return { success: false, error: "Please enter a key before testing." };
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Respond only with OK" }],
        max_tokens: 5
      })
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = errData.error?.message || `HTTP error ${response.status}`;
      return { success: false, error: message };
    }
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      return { success: true };
    }
    return { success: false, error: "Empty response generated." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reach OpenAI API." };
  }
}

/**
 * Direct call to OpenAI API from the client (for static environments)
 */
export async function callOpenAIDirect(
  apiKey: string,
  prompt: string,
  systemInstruction?: string,
  responseSchema?: any
): Promise<string> {
  const url = "https://api.openai.com/v1/chat/completions";
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const body: any = {
    model: "gpt-4o-mini",
    messages: messages,
    temperature: 0.2
  };

  if (responseSchema) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.error?.message || `HTTP error ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("No response generated from OpenAI API.");
  }
  return text;
}

/**
 * Direct call to Gemini API from the client (for static environments)
 */
export async function callGeminiDirect(
  apiKey: string,
  prompt: string,
  systemInstruction?: string,
  responseSchema?: any
): Promise<string> {
  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: any = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {}
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  if (responseSchema) {
    body.generationConfig.responseMimeType = "application/json";
    body.generationConfig.responseSchema = responseSchema;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.error?.message || `HTTP error ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No response generated from Gemini API.");
  }
  return text;
}

/**
 * High-fidelity fallback offline simulator for common queries
 * when running on GitHub Pages without an API key.
 */
export function getOfflineChatResponse(userQuery: string): string {
  const query = userQuery.toLowerCase();

  const disclaimer = "\n\n*DISCLAIMER: This response is for educational purposes only and does not constitute medical advice or a professional clinical diagnosis. Always consult a qualified physician for healthcare decisions.*";

  if (query.includes("cough") || query.includes("chest") || query.includes("cold")) {
    return "### Cough & Respiratory Assessment (Simulated)\n\nBased on your mention of cough/cold symptoms, here is educational information:\n\n1. **Potential Causes**: Acute bronchitis, viral common cold, influenza, or seasonal allergies.\n2. **Self-Care Guidelines**:\n   - **Hydration**: Warm liquids (teas, broth) soothe throat tissue and loosen mucus.\n   - **Humidity**: Use a cool-mist humidifier or take warm steam showers.\n   - **Rest**: Crucial to assist immunological recovery.\n3. **When to See a Physician**:\n   - Fever lasting more than 3 days.\n   - Wheezing, shortness of breath, or chest pain.\n   - Cough productive of blood or rust-colored sputum." + disclaimer;
  }

  if (query.includes("fever") || query.includes("temperature") || query.includes("headache")) {
    return "### Fever & Headache Management (Simulated)\n\nBased on your inquiry about fever/headache symptoms:\n\n1. **Clinical Parameters**: A normal adult temperature is around 37°C (98.6°F). A fever of >38°C (100.4°F) usually indicates active immune defense.\n2. **Home Care Guidance**:\n   - **Cooling**: Apply lukewarm, damp cloths to the forehead or neck. Avoid ice baths.\n   - **Hydration**: Increase fluids (water, oral rehydration salts) to counter sweat loss.\n   - **Over-the-Counter**: Antipyretics like Paracetamol or Ibuprofen help lower fever (use according to manufacturer packaging).\n3. **Critical Emergency Signs**:\n   - Stiff neck, extreme lethargy, or confusion.\n   - Persistent vomiting or severe light sensitivity." + disclaimer;
  }

  if (query.includes("stomach") || query.includes("acid") || query.includes("reflux") || query.includes("pain")) {
    return "### Gastrointestinal Advisory (Simulated)\n\nBased on your gastric distress query:\n\n1. **Frequent Causes**: Gastroesophageal Reflux (GERD), mild gastritis, dietary irritation, or stress.\n2. **Supportive Actions**:\n   - **Dietary**: Restrict acidic, fatty, spicy foods and carbonated drinks.\n   - **Timing**: Avoid lying flat within 2-3 hours of eating.\n   - **Hydration**: Small sips of room-temperature water.\n3. **Red Flag Symptoms**:\n   - Difficulty swallowing or persistent vomiting.\n   - Severe, sudden sharp abdominal pain.\n   - Dark/tarry stools." + disclaimer;
  }

  return "### BioWeb General Consultation (Simulated)\n\nHello! I am operating in **Static Offline Mode** because this app is currently hosted on a static server (GitHub Pages) without a running backend.\n\nTo unlock live medical AI responses powered by the actual **Gemini 2.5 Flash** model, please click the **⚙️ Static Mode Settings** button in the top banner and configure your own **Gemini API Key**!\n\n**Educational Tip for your query**: For most minor symptoms, prioritizing adequate sleep, drinking sufficient water, and monitoring physical indicators for sudden worsening is the safest path. Always consult a general practitioner for tailored clinical guidance." + disclaimer;
}

export function getOfflinePrediction(symptoms: string[]): any {
  const queryStr = symptoms.join(" ").toLowerCase();

  if (queryStr.includes("fever") || queryStr.includes("cough") || queryStr.includes("headache")) {
    return {
      disease: "Acute Viral Upper Respiratory Infection (Common Cold)",
      confidence: 85,
      severity: "Low",
      symptoms: symptoms,
      treatmentOverview: "Rest, high fluid intake, and symptomatic control with mild antipyretics like paracetamol.",
      specialist: "General Practitioner / Family Physician",
      medicalTests: ["Complete Blood Count (optional)", "Nasal swab for flu-strains"],
      emergencyWarning: "Difficulty breathing, high fever unresponsive to medication, or blue lips/fingers.",
      prevention: ["Wash hands frequently for 20 seconds", "Avoid close contact with infected individuals", "Get annual flu vaccinations"]
    };
  }

  if (queryStr.includes("reflux") || queryStr.includes("heartburn") || queryStr.includes("stomach")) {
    return {
      disease: "Gastroesophageal Reflux Disease (GERD)",
      confidence: 78,
      severity: "Medium",
      symptoms: symptoms,
      treatmentOverview: "Avoid triggers like fatty or spicy foods, eat smaller meals, do not lie down immediately after eating, and use H2 blockers or antacids.",
      specialist: "Gastroenterologist",
      medicalTests: ["Upper Endoscopy", "Esophageal pH Monitoring"],
      emergencyWarning: "Severe chest pain that radiates to jaw or arm (could mimic heart attack), or black bloody stools.",
      prevention: ["Maintain a healthy weight", "Quit smoking", "Elevate the head of your bed by 6 inches"]
    };
  }

  return {
    disease: "General Physiological Adaptation / Mild Stress Reaction",
    confidence: 65,
    severity: "Low",
    symptoms: symptoms,
    treatmentOverview: "Mindful rest, regular biological hydration, and observation over 24-48 hours.",
    specialist: "Internal Medicine Practitioner",
    medicalTests: ["Standard Blood Chemistry Screen"],
    emergencyWarning: "Sudden onset of severe pain, dizziness, fainting, or chest tightness.",
    prevention: ["Maintain a consistent sleep cycle", "Balance daily electrolyte intake", "Incorporate daily stress-reduction exercises"]
  };
}

export function parsePrescriptionOffline(ocrText: string): any {
  const lower = ocrText.toLowerCase();
  let extractedName = "Amoxicillin";
  let uses = ["Bacterial infections", "Strep throat", "Sinusitis"];
  let sideEffects = ["Nausea", "Diarrhea", "Rashes"];
  let dosage = "500mg, twice a day after meals for 5 days";
  let warnings = "Finish the complete course. Take with food. Discontinue if sudden allergic rash appears.";
  
  if (lower.includes("paracetamol") || lower.includes("dolo") || lower.includes("acetaminophen")) {
    extractedName = "Paracetamol (Dolo 650)";
    uses = ["Fever reduction", "Mild to moderate pain relief", "Headache"];
    sideEffects = ["Liver stress with overdose", "Nausea", "Skin reaction"];
    dosage = "650mg as needed, max 4 times a day (min 4-hour gaps)";
    warnings = "Do not exceed 4g in 24 hours. Avoid concurrent alcohol intake to protect liver.";
  } else if (lower.includes("atorvastatin") || lower.includes("lipitor") || lower.includes("cholesterol")) {
    extractedName = "Atorvastatin (Lipitor)";
    uses = ["High cholesterol prevention", "Reducing cardiovascular events risk"];
    sideEffects = ["Muscle ache", "Mild digestive upset", "Elevated liver enzymes"];
    dosage = "10mg to 40mg once daily, preferably at bedtime";
    warnings = "Avoid grapefruit juice. Inform doctor if severe unexplained muscle weakness or pain occurs.";
  } else if (lower.includes("metformin") || lower.includes("glycomet") || lower.includes("diabetes")) {
    extractedName = "Metformin";
    uses = ["Type 2 Diabetes Mellitus control", "Insulin sensitivity enhancement"];
    sideEffects = ["Gastrointestinal bloating", "Nausea or metallic taste", "Vitamin B12 depletion"];
    dosage = "500mg or 850mg twice daily with meals to reduce stomach discomfort";
    warnings = "Take strictly with food. Stay hydrated to prevent rare risk of lactic acidosis.";
  } else {
    // Try parsing any capitalized word in the OCR text as the name
    const words = ocrText.match(/[A-Z][a-z]{3,12}/g);
    if (words && words.length > 0) {
      extractedName = words[0];
    }
  }

  return {
    medicines: [
      {
        name: extractedName,
        uses: uses,
        dosage: dosage,
        sideEffects: sideEffects,
        storage: "Store in a cool dry place below 30°C. Protect from light.",
        manufacturer: "BioWeb Labs Pharmaceuticals Ltd",
        alternatives: ["Generic Equivalent", "Sandoz Biotech version", "Cipla version"],
        warnings: warnings
      }
    ]
  };
}

export function getOfflineDiseaseDetails(name: string): any {
  return {
    name: name,
    image: "https://images.unsplash.com/photo-1584036561566-baf241f8724a?auto=format&fit=crop&q=80&w=600",
    symptoms: ["Fatigue", "Mild Fever", "Aches", "Localized discomfort"],
    causes: ["Viral or bacterial exposure", "Genetic predisposition", "Environmental factors"],
    stages: ["Mild onset", "Active manifestation", "Recovery or chronic management"],
    complications: ["Persistent secondary infection", "Dehydration", "Chronic systemic stress"],
    treatment: "Primary care consists of hydration, physical rest, and symptomatic treatment under medical supervision.",
    medicines: ["Symptomatic painkillers", "Anti-inflammatory agents", "Targeted therapeutic agents"],
    lifestyleTips: ["Prioritize 8 hours of sleep", "Drink 2.5-3L of water daily", "Keep physical activity moderate during recovery"],
    emergencySigns: ["Sudden severe shortness of breath", "Incessant high fever", "Acute chest pain"]
  };
}

export function getOfflineMedicineDetails(name: string): any {
  return {
    name: name,
    uses: ["Symptomatic relief of symptoms related to " + name],
    dosage: "To be decided by prescribing clinical physician.",
    sideEffects: ["Mild stomach upset", "Drowsiness", "Headache"],
    storage: "Store in a cool dry place below 25°C. Keep out of reach of children.",
    manufacturer: "Generic Pharmacological Laboratories",
    composition: "Active molecules related to " + name,
    pregnancyWarning: "Consult a primary care physician before taking this medication during pregnancy.",
    breastfeedingWarning: "Observe precautions and consult a healthcare expert.",
    alcoholInteraction: "Moderate safety, but avoid alcohol to prevent systemic stress.",
    foodInteraction: "Take with water. Specific food restrictions may apply based on final diagnosis.",
    expiryInfo: "Typically 24 months from manufacturing date.",
    availableStrengths: ["100mg", "250mg", "500mg"],
    alternatives: ["Generic Equivalent " + name, "Sandoz Biotech equivalent"],
    warnings: "Do not exceed standard doses. Report any allergy symptoms immediately to emergency services.",
    faqs: [
      {
        question: "Is " + name + " safe to take daily?",
        answer: "Continuous daily use is not recommended unless explicitly prescribed by a clinical specialist."
      }
    ]
  };
}
