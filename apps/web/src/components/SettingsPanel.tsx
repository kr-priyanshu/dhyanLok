"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useThemeStore } from "@/store/useThemeStore";
import { useHabitStore } from "@/store/useHabitStore";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/utils/supabase";
import { Settings, X, Download, Upload, Lock, Cloud, Sparkles, Users } from "lucide-react";

export default function SettingsPanel() {
  const { bgColor, textColor, headingFont, accentColor, setTheme } = useThemeStore();
  const { habits, logs, journals, transcripts, audioFiles, restoreData } = useHabitStore();
  const { role, passkey, setPasskey, googleClientId, setGoogleClientId, geminiApiKey, setGeminiApiKey, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newPasskey, setNewPasskey] = useState("");
  const [newClientId, setNewClientId] = useState(googleClientId || "");
  const [newGeminiKey, setNewGeminiKey] = useState(geminiApiKey || "");

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const fonts = [
    { name: 'Creamy Chicken (Custom)', value: 'var(--font-creamy)' },
    { name: 'Inter (Clean Sans)', value: 'var(--font-inter)' },
    { name: 'Space Grotesk (Geometric Sans)', value: 'var(--font-space)' },
    { name: 'Playfair Display (Elegant Serif)', value: 'var(--font-playfair)' },
    { name: 'Fraunces (Editorial Serif)', value: 'var(--font-fraunces)' },
  ];

  const handleBackup = () => {
    const data = { habits, logs, journals, transcripts, audioFiles };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dhyanlok-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm("Warning: Restoring will overwrite all current habits and logs. Are you sure you want to proceed?")) {
          restoreData(json);
          alert("Data restored successfully!");
        }
      } catch (err) {
        alert("Failed to parse backup file. Please ensure it's a valid DhyanLok JSON backup.");
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <button 
        data-tour="settings"
        onClick={() => setIsOpen(true)}
        aria-label="Open appearance settings"
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full glass-panel flex items-center justify-center text-[var(--theme-text)] opacity-40 hover:opacity-100 transition-opacity z-[150]"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200]" onClick={() => setIsOpen(false)} />
          <div role="dialog" aria-modal="true" aria-label="Appearance settings" className="fixed inset-y-0 right-0 w-80 glass-panel border-l z-[210] p-6 flex flex-col gap-8 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-heading font-medium tracking-tight">Appearance</h2>
              <button onClick={() => setIsOpen(false)} className="opacity-50 hover:opacity-100" aria-label="Close settings">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto pb-24 pr-2 custom-scrollbar flex-1">
              <div className="space-y-2">
                <label className="text-sm opacity-60">Background Color</label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="color" 
                    value={bgColor} 
                    onChange={(e) => setTheme({ bgColor: e.target.value })}
                    className="h-10 w-10 rounded cursor-pointer border border-premium-border"
                  />
                  <span className="font-mono text-xs opacity-50 uppercase">{bgColor}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm opacity-60">Text Color</label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="color" 
                    value={textColor} 
                    onChange={(e) => setTheme({ textColor: e.target.value })}
                    className="h-10 w-10 rounded cursor-pointer border border-premium-border"
                  />
                  <span className="font-mono text-xs opacity-50 uppercase">{textColor}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm opacity-60">Accent Color</label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="color" 
                    value={accentColor || textColor} 
                    onChange={(e) => setTheme({ accentColor: e.target.value })}
                    className="h-10 w-10 rounded cursor-pointer border border-premium-border"
                  />
                  <span className="font-mono text-xs opacity-50 uppercase">{accentColor || 'Default'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm opacity-60">Heading Font</label>
                <select 
                  value={headingFont}
                  onChange={(e) => setTheme({ headingFont: e.target.value })}
                  className="w-full bg-[var(--theme-bg)] text-[var(--theme-text)] border border-premium-border rounded p-2 text-sm focus:outline-none focus:border-premium-text"
                >
                  {fonts.map(f => (
                    <option key={f.value} value={f.value}>{f.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-8 space-y-3">
                 <h3 className="text-sm font-heading font-medium tracking-tight mb-4">Themes</h3>
                 <button 
                  onClick={() => setTheme({ bgColor: '#0a0a0a', textColor: '#ffffff', accentColor: '#ffffff', headingFont: 'var(--font-creamy)' })}
                  className="w-full py-2 border border-premium-border rounded text-xs opacity-70 hover:opacity-100 transition-opacity"
                 >
                   Minimal Classic
                 </button>
                 <button 
                  onClick={() => setTheme({ bgColor: '#f6f4f0', textColor: '#111111', accentColor: '#111111', headingFont: 'var(--font-playfair)' })}
                  className="w-full py-2 border border-premium-border rounded text-xs opacity-70 hover:opacity-100 transition-opacity"
                 >
                   Light Editorial
                 </button>
                 <button 
                  onClick={() => setTheme({ bgColor: '#111111', textColor: '#ffffff', accentColor: '#00ffcc', headingFont: 'var(--font-space)' })}
                  className="w-full py-2 border border-premium-border rounded text-xs opacity-70 hover:opacity-100 transition-opacity"
                 >
                   Neon Terminal
                 </button>
                 <button 
                  onClick={() => setTheme({ bgColor: '#0a0a0a', textColor: '#ffffff', accentColor: '', headingFont: 'var(--font-creamy)' })}
                  className="w-full py-2 border border-premium-border rounded text-xs text-premium-text bg-premium-panel hover:bg-premium-text hover:text-black transition-colors mt-2"
                 >
                   Reset to Defaults
                 </button>
              </div>



              <div className="pt-4 space-y-3">
                 <h3 className="text-sm font-heading font-medium tracking-tight mb-4 flex items-center gap-2"><Cloud size={16}/> Google Drive Sync</h3>
                 <div className="flex flex-col gap-2">
                   <input 
                     type="text"
                     placeholder="Google Client ID..."
                     value={newClientId}
                     onChange={e => setNewClientId(e.target.value)}
                     className="w-full bg-transparent border border-premium-border rounded p-2 text-xs text-premium-text outline-none focus:border-premium-text"
                   />
                   <button 
                     onClick={async () => {
                       try {
                         setGoogleClientId(newClientId || null);
                         const email = useAuthStore.getState().registeredEmail;
                         if (email) {
                           const { error } = await supabase.from('guest_users').update({ google_client_id: newClientId || null }).eq('email', email);
                           if (error) {
                             alert("Failed to save to cloud: " + error.message);
                           } else {
                             alert("Saved successfully!");
                           }
                         } else {
                           alert("No email found to sync with.");
                         }
                       } catch (err: any) {
                         alert("Error: " + err.message);
                       }
                     }}
                     className="w-full py-2 border border-premium-border rounded text-xs opacity-70 hover:opacity-100 transition-opacity"
                   >
                     Save Client ID
                   </button>
                 </div>
              </div>

              <div className="pt-4 space-y-3">
                 <h3 className="text-sm font-heading font-medium tracking-tight mb-4 flex items-center gap-2"><Sparkles size={16}/> Gemini AI</h3>
                 <div className="flex flex-col gap-2">
                   <input 
                     type="password"
                     placeholder="Gemini API Key..."
                     value={newGeminiKey}
                     onChange={e => setNewGeminiKey(e.target.value)}
                     className="w-full bg-transparent border border-premium-border rounded p-2 text-xs text-premium-text outline-none focus:border-premium-text"
                   />
                   <button 
                     onClick={async () => {
                       try {
                         setGeminiApiKey(newGeminiKey || null);
                         const email = useAuthStore.getState().registeredEmail;
                         if (email) {
                           const { error } = await supabase.from('guest_users').update({ gemini_api_key: newGeminiKey || null }).eq('email', email);
                           if (error) {
                             alert("Failed to save to cloud: " + error.message);
                           } else {
                             alert("Saved successfully!");
                           }
                         } else {
                           alert("No email found to sync with.");
                         }
                       } catch (err: any) {
                         alert("Error: " + err.message);
                       }
                     }}
                     className="w-full py-2 border border-premium-border rounded text-xs opacity-70 hover:opacity-100 transition-opacity"
                   >
                     Save API Key
                   </button>
                 </div>
              </div>

              <div className="pt-4 space-y-3">
                <h3 className="text-sm font-heading font-medium tracking-tight mb-4">Data Management</h3>
                <button 
                  onClick={handleBackup}
                  className="w-full py-2 border border-premium-border rounded text-xs opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Backup Data (JSON)
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 border border-premium-border rounded text-xs opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-red-400 hover:text-red-500 hover:border-red-500/50"
                >
                  <Upload size={14} /> Restore Data...
                </button>
                <input 
                  type="file" 
                  accept=".json" 
                  ref={fileInputRef} 
                  onChange={handleRestore}
                  className="hidden" 
                />
                <button 
                  onClick={() => {
                    useAuthStore.getState().setHasCompletedTour(false);
                    setIsOpen(false);
                  }}
                  className="w-full py-2 border border-premium-border rounded text-xs opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-premium-text bg-premium-panel"
                >
                  <Sparkles size={14} /> Replay Guided Tour
                </button>
              </div>
              
              <div className="pt-8 space-y-3 mt-4 border-t border-premium-border/50">
                {role === 'admin' && (
                  <Link 
                    href="/ops-9a7f3b2c8e1d45f6"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3 bg-premium-text text-black rounded font-medium hover:opacity-90 transition-opacity mb-2 flex items-center justify-center gap-2"
                  >
                    <Users size={16} /> Admin Console
                  </Link>
                )}
                <button 
                  type="button"
                  onClick={() => { logout(); setIsOpen(false); window.location.href = "/"; }}
                  className="w-full py-3 bg-red-500/10 text-red-500 rounded font-medium hover:bg-red-500/20 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
