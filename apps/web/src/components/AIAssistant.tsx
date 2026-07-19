"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Mic, Square, Loader2, Send, X } from "lucide-react";
import { useHabitStore } from "@/store/useHabitStore";
import { useAuthStore } from "@/store/useAuthStore";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { motion, AnimatePresence } from "framer-motion";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { habits, addHabit, removeHabit } = useHabitStore();
  const { geminiApiKey } = useAuthStore();



  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    if (!isRecording) startRecording();
  };

  // Keyboard shortcut Ctrl + M
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "m" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleOpen();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isRecording]);

  const handleProcessCommand = async (command: string, audioData?: { base64: string, mimeType: string }) => {
    if (!command.trim() && !audioData) return;
    if (!geminiApiKey) {
      setStatusText("Please add your Gemini API Key in Settings first.");
      return;
    }
    
    setIsProcessing(true);
    setStatusText("Analyzing command...");
    
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });

      // Provide the AI with the list of current habits so it knows IDs for removal
      const currentHabitsContext = habits.map(h => `- ${h.title} (ID: ${h._id})`).join("\n");
      
      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          intent: { 
            type: Type.STRING, 
            enum: ['add_habit', 'remove_habit', 'unknown'],
            description: "The user's intent"
          },
          habitTitle: { type: Type.STRING, description: "The title of the habit to add" },
          habitCategory: { type: Type.STRING, description: "The category for the new habit (e.g. Health, Learning, Creative)" },
          habitIdToRemove: { type: Type.STRING, description: "The exact ID of the habit to remove, if applicable" },
          message: { type: Type.STRING, description: "A friendly response acknowledging the action" }
        },
        required: ["intent", "message"]
      };

      const prompt = `
      You are an AI assistant for a habit tracking app called DhyanLok. 
      The user will give you a command to either add a new habit or remove an existing one.
      
      Current Habits:
      ${currentHabitsContext || "No habits currently."}
      
      User command: "${command}"
      
      Respond strictly with the requested JSON schema.
      `;

      const contents = [
        {
          role: 'user',
          parts: [
            { text: prompt },
            ...(audioData ? [{
              inlineData: {
                data: audioData.base64,
                mimeType: audioData.mimeType
              }
            }] : [])
          ]
        }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: contents as any,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });

      if (!response.text) throw new Error("No response from AI");
      let rawText = response.text;
      if (rawText.startsWith("```json")) {
        rawText = rawText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (rawText.startsWith("```")) {
        rawText = rawText.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }
      const result = JSON.parse(rawText);

      if (result.intent === 'add_habit' && result.habitTitle) {
        addHabit({
          title: result.habitTitle,
          category: result.habitCategory || "General",
          type: "binary",
          isActive: true
        });
        setStatusText(result.message);
      } else if (result.intent === 'remove_habit' && result.habitIdToRemove) {
        removeHabit(result.habitIdToRemove);
        setStatusText(result.message);
      } else {
        setStatusText(result.message || "I didn't quite understand that command.");
      }
      
      setInput("");
      
      // Clear any previous auto-close timer
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = setTimeout(() => {
        setIsOpen(false);
        setStatusText("");
      }, 3000);
      
    } catch (err: any) {
      console.error(err);
      setStatusText(`Error: ${err.message || "Failed to process command"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstart = () => {
        setIsRecording(true);
        setStatusText("Listening... (Press Stop when done)");
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setStatusText("Processing voice...");
        
        // Stop all tracks to free up mic icon in browser tab
        stream.getTracks().forEach(track => track.stop());
        
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        if (audioBlob.size > 0) {
           const reader = new FileReader();
           reader.onloadend = () => {
             const base64Data = (reader.result as string).split(',')[1];
             handleProcessCommand("Voice command received.", {
               base64: base64Data,
               mimeType: mediaRecorder.mimeType || 'audio/webm' // fallback mime if undefined
             });
           };
           reader.readAsDataURL(audioBlob);
        } else {
           setStatusText("No audio detected.");
        }
      };

      mediaRecorder.start();
    } catch (err: any) {
      console.error("Microphone error:", err);
      setStatusText("Microphone access denied or error occurred.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  // If you submit via text
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessCommand(input);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        data-tour="ai-assistant"
        onClick={handleOpen}
        aria-label="Open AI Assistant"
        className="fixed bottom-24 right-6 z-50 p-4 rounded-full bg-premium-text text-black shadow-2xl hover:scale-105 transition-transform group"
      >
        <Sparkles size={24} className="group-hover:animate-pulse" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            role="dialog"
            aria-label="AI Assistant"
            className="fixed bottom-40 right-6 z-50 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl p-6 ring-1 ring-premium-border"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading tracking-tight flex items-center gap-2 text-premium-text">
                <Sparkles size={16} /> DhyanLok AI
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-premium-muted hover:text-red-500 transition-colors" aria-label="Close AI Assistant">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-premium-muted mb-4 font-sans tracking-wide" aria-live="polite">
              {statusText || "Try asking me to add or remove a habit!"}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <textarea 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="e.g., Add a habit to drink water"
                className="w-full bg-black/20 border border-premium-border rounded p-3 text-sm text-premium-text outline-none focus:border-[var(--theme-accent)] resize-none"
                rows={3}
                disabled={isProcessing}
              />
              
              <div className="flex gap-2">
                {isRecording ? (
                  <button 
                    type="button"
                    onClick={stopRecording}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded border border-red-500 text-red-500 bg-red-500/10 text-xs font-medium uppercase tracking-widest"
                  >
                    <Square size={14} /> Stop
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={startRecording}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded border border-[var(--theme-accent)]/50 text-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/10 transition-colors text-xs font-medium uppercase tracking-widest disabled:opacity-50"
                  >
                    <Mic size={14} /> Speak
                  </button>
                )}
                
                <button 
                  type="submit"
                  disabled={isProcessing || !input.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-premium-text text-black text-xs font-medium uppercase tracking-widest disabled:opacity-50 transition-opacity"
                >
                  {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} 
                  {isProcessing ? "Wait" : "Send"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
