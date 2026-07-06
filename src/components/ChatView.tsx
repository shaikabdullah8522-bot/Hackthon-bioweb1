import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Bot, User, Trash2, Plus, Sparkles, Mic, MicOff, Volume2, VolumeX, ShieldAlert
} from "lucide-react";
import { Message, ChatSession } from "../types";
import { isStaticDeployment, getClientApiKey, getClientOpenAIKey, getActiveAIProvider, callGeminiDirect, callOpenAIDirect, getOfflineChatResponse } from "../utils/apiFallback";

export default function ChatView() {
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "sess-1",
      title: "Chest Cough Analysis",
      messages: [
        { id: "m-1", sender: "ai", text: "Hello! I am your BioWeb Clinical AI Assistant. You can ask me questions about symptoms, medications, storage parameters, or clinical terminologies. How can I assist you in your health learning today?", timestamp: new Date() }
      ],
      createdAt: new Date()
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>("sess-1");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false); // TTS voice reading state
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isLoading]);

  // Speech Recognition Setup (STT)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => (prev + " " + transcript).trim());
      };

      rec.onerror = (err: any) => {
        console.error("Speech Recognition Error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Web Speech recognition is not fully supported in this browser. Please use standard keyboard text entry.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Text to Speech (TTS)
  const speakText = (text: string) => {
    if (!isSpeechEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // cancel current speech

    // Clean markdown before speaking
    const cleanText = text.replace(/[\*#_`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    
    // Choose a warm female voice if available, or standard English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Natural") || v.lang.startsWith("en"));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: "sess-" + Date.now(),
      title: "New Consult session",
      messages: [
        { id: "m-init", sender: "ai", text: "Hello! New consult session initialized. Ask me any health questions.", timestamp: new Date() }
      ],
      createdAt: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length === 1) return; // keep at least one
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      setActiveSessionId(updated[0].id);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: "m-" + Date.now(),
      sender: "user",
      text: inputText,
      timestamp: new Date()
    };

    // Update session locally with user message
    const updatedMessages = [...activeSession.messages, userMsg];
    
    // Update active session and auto-generate title if it was default
    let newTitle = activeSession.title;
    if (activeSession.title === "New Consult session" || activeSession.title === "Chest Cough Analysis") {
      newTitle = inputText.length > 20 ? inputText.slice(0, 20) + "..." : inputText;
    }

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, title: newTitle, messages: updatedMessages };
      }
      return s;
    }));

    setInputText("");
    setIsLoading(true);

    try {
      let responseText = "";

      const apiKey = getClientApiKey();
      const openAiKey = getClientOpenAIKey();
      const activeProvider = getActiveAIProvider();
      const isStatic = isStaticDeployment();

      const useDirectMode = isStatic || (activeProvider === "openai" ? openAiKey : apiKey);

      if (useDirectMode) {
        const systemInstruction = 
          "You are BioWeb AI, a highly professional, educational medical intelligence assistant. " +
          "Your objective is to provide detailed, educational healthcare insights based on inquiries. " +
          "Under no circumstances should you claim to provide official diagnoses, prescriptions, or clinical treatments. " +
          "Provide responses in clear, structured Markdown. " +
          "Always append a short standard medical disclaimer at the absolute bottom of the message stating: " +
          "'*DISCLAIMER: This response is for educational purposes only and does not constitute medical advice or a professional clinical diagnosis. Always consult a qualified physician for healthcare decisions.*'";

        if (activeProvider === "openai" && openAiKey) {
          const prompt = updatedMessages.map(m => `${m.sender === "user" ? "User" : "BioWeb AI"}: ${m.text}`).join("\n") + "\nBioWeb AI:";
          responseText = await callOpenAIDirect(openAiKey, prompt, systemInstruction);
        } else if (activeProvider === "gemini" && apiKey) {
          const prompt = updatedMessages.map(m => `${m.sender === "user" ? "User" : "BioWeb AI"}: ${m.text}`).join("\n") + "\nBioWeb AI:";
          responseText = await callGeminiDirect(apiKey, prompt, systemInstruction);
        } else if (isStatic) {
          responseText = getOfflineChatResponse(inputText);
        }
      }

      if (!responseText) {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-active-provider": activeProvider,
            "x-gemini-api-key": apiKey,
            "x-openai-api-key": openAiKey
          },
          body: JSON.stringify({ messages: updatedMessages })
        });

        let data: any;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          throw new Error(text.slice(0, 200) || `Server returned status ${response.status}`);
        }

        if (!response.ok) {
          throw new Error(data?.error || `Server returned error status ${response.status}`);
        }
        responseText = data.text;
      }

      const aiMsg: Message = {
        id: "m-" + (Date.now() + 1),
        sender: "ai",
        text: responseText,
        timestamp: new Date()
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...s.messages, aiMsg] };
        }
        return s;
      }));

      // Speak text if TTS is enabled
      if (isSpeechEnabled) {
        speakText(responseText);
      }
    } catch (err: any) {
      console.warn("Chat model failed, falling back to offline diagnostic responses:", err);
      const fallbackText = getOfflineChatResponse(inputText) + "\n\n*Notice: The server is experiencing high demand. Click 'Configure Gemini API Key' in the top banner to apply your own personal key for uninterrupted live AI assistant responses.*";
      const fallbackMsg: Message = {
        id: "m-" + (Date.now() + 1),
        sender: "ai",
        text: fallbackText,
        timestamp: new Date()
      };
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...s.messages, fallbackMsg] };
        }
        return s;
      }));
      if (isSpeechEnabled) {
        speakText(fallbackText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-950 text-white overflow-hidden relative">
      {/* Sidebar - Sessions History */}
      <div className="hidden md:flex w-72 shrink-0 flex-col border-r border-white/10 bg-slate-900/40 backdrop-blur-md p-4 space-y-4">
        <button
          onClick={createNewSession}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-bold shadow-lg shadow-cyan-500/10 hover:opacity-90 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" /> New Consultation
        </button>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <p className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-500 px-2">Consultation Logs</p>
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => {
                setActiveSessionId(s.id);
                window.speechSynthesis?.cancel(); // cancel previous audio if switching session
              }}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer border transition ${
                activeSessionId === s.id
                  ? "bg-white/10 border-cyan-500/30 text-cyan-400"
                  : "bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-sm font-medium truncate max-w-[170px]">{s.title}</span>
              <button
                onClick={(e) => deleteSession(s.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                title="Delete history log"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Security / HIPAA badge */}
        <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-[10px] leading-relaxed text-slate-500">
            Education Protocol: This clinical assistant matches queries against pharmacological frameworks. Conversations are secure and stored locally.
          </p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-950 relative">
        {/* Chat Header */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-slate-900/20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-bold tracking-wide">BioWeb Medical Intelligence Suite</span>
          </div>

          <div className="flex items-center gap-2">
            {/* TTS Audio Readout toggle */}
            <button
              onClick={() => {
                setIsSpeechEnabled(!isSpeechEnabled);
                if (isSpeechEnabled) window.speechSynthesis?.cancel();
              }}
              className={`p-2 rounded-lg border transition ${
                isSpeechEnabled
                  ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
              }`}
              title={isSpeechEnabled ? "Speech assistant read-out active" : "Enable speech assistant read-out"}
            >
              {isSpeechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <span className="text-xs font-mono font-bold bg-white/5 border border-white/10 px-2 py-1 rounded text-slate-400">
              V2.5
            </span>
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-radial from-slate-900/30 to-slate-950">
          <AnimatePresence initial={false}>
            {activeSession.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-4xl mx-auto ${msg.sender === "user" ? "justify-end" : ""}`}
              >
                {/* AI Avatar */}
                {msg.sender === "ai" && (
                  <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <Bot className="h-5 w-5 text-cyan-400" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl border text-sm leading-relaxed max-w-[80%] whitespace-pre-line shadow-md ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-cyan-600 to-blue-700 border-cyan-500/30 text-white rounded-tr-none"
                      : "bg-slate-900/60 border-white/10 text-slate-100 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>

                {/* User Avatar */}
                {msg.sender === "user" && (
                  <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 max-w-4xl mx-auto"
              >
                <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Bot className="h-5 w-5 text-cyan-400 animate-bounce" />
                </div>
                <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/60 text-slate-400 flex items-center gap-2 rounded-tl-none text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="ml-1 font-mono text-xs">BioWeb modeling diagnostic query...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Input Form Box */}
        <div className="p-4 border-t border-white/10 bg-slate-950/80 backdrop-blur-lg">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3 relative items-center">
            {/* Mic button (STT) */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3.5 rounded-xl border transition shrink-0 ${
                isListening
                  ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
              }`}
              title={isListening ? "Listening... click to pause" : "Activate voice entry (Web Speech STT)"}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "Speak clearly..." : "Type your healthcare symptoms or clinical questions here..."}
              className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition text-white placeholder-slate-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-cyan-500/15 text-white cursor-pointer shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="text-[11px] text-center text-slate-500 mt-2">
            BioWeb AI Assistant provides educational guides. Review our standard safety protocol before taking medication.
          </p>
        </div>
      </div>
    </div>
  );
}
