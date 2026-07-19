"use client";

import React, { useState, useEffect, useRef } from "react";
import { useHabitStore } from "@/store/useHabitStore";
import { useAuthStore } from "@/store/useAuthStore";
import { format, subDays, isSameDay } from "date-fns";
import { Book, ChevronLeft, ChevronRight, Mic, Square, Loader2, Play, CloudUpload, Sparkles } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { get, set as idbSet } from "idb-keyval";
import { GoogleGenAI } from "@google/genai";

export default function Notebook() {
  const { habits, logs, journals, transcripts, audioFiles, setJournal, setTranscript, toggleLog, setAudioFile } = useHabitStore();
  const { googleClientId } = useAuthStore();
  
  const [selectedDateObj, setSelectedDateObj] = useState(new Date());
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [offsetDays, setOffsetDays] = useState(0);
  const [mounted, setMounted] = useState(false);
  const selectedDateStr = format(selectedDateObj, 'yyyy-MM-dd');
  
  // Audio & Dictation State
  const [isRecording, setIsRecording] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [localAudioURL, setLocalAudioURL] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => { setMounted(true); }, []);
  
  useEffect(() => {
    if (!mounted) return;
    let currentObjectUrl: string | null = null;
    
    const loadLocalAudio = async () => {
      try {
        const blob = await get(`audio_${selectedDateStr}`);
        if (blob) {
          currentObjectUrl = URL.createObjectURL(blob);
          setLocalAudioURL(currentObjectUrl);
        } else {
          setLocalAudioURL(null);
        }
      } catch (e) {
        console.error("IDB read error", e);
      }
    };
    loadLocalAudio();
    
    return () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [selectedDateStr, mounted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isJournalOpen) {
        setIsJournalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isJournalOpen]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstart = () => {
        setIsRecording(true);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        await idbSet(`audio_${selectedDateStr}`, audioBlob);
        setLocalAudioURL(URL.createObjectURL(audioBlob));
        
        // Transcribe with Gemini Native Audio Multimodal
        const geminiApiKey = useAuthStore.getState().geminiApiKey;
        if (geminiApiKey && audioBlob.size > 0) {
           const reader = new FileReader();
           reader.onloadend = async () => {
             const base64Data = (reader.result as string).split(',')[1];
             try {
                setIsDictating(true); // Re-using state to mean "transcribing"
                const ai = new GoogleGenAI({ apiKey: geminiApiKey });
                const response = await ai.models.generateContent({
                  model: 'gemini-3.1-flash-lite',
                  contents: [
                    {
                      role: 'user',
                      parts: [
                        { text: "Transcribe this audio dictated by the user exactly as spoken. Do not add conversational filler. If you cannot hear anything, output '[Silence]'." },
                        {
                          inlineData: {
                            data: base64Data,
                            mimeType: mediaRecorder.mimeType || 'audio/webm'
                          }
                        }
                      ]
                    }
                  ] as any
                });
                
                if (response.text && response.text.trim() !== "[Silence]") {
                  let existing = useHabitStore.getState().transcripts[selectedDateStr] || "";
                  if (existing.trim().length > 0) existing += "\n\n";
                  useHabitStore.getState().setTranscript(selectedDateStr, existing + response.text.trim());
                }
             } catch (e) {
                console.error("Transcription failed", e);
             } finally {
                setIsDictating(false);
             }
           };
           reader.readAsDataURL(audioBlob);
        }
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Mic access denied or error", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  const refineTranscript = async () => {
    const geminiApiKey = useAuthStore.getState().geminiApiKey;
    if (!geminiApiKey) {
      alert("Please set your Gemini API Key in the Settings panel first!");
      return;
    }
    const currentTranscript = transcripts[selectedDateStr];
    if (!currentTranscript || currentTranscript.trim().length === 0) return;

    setIsRefining(true);
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `You are an expert editor. Clean up the following dictated transcript. Fix grammar, punctuation, and typos, but DO NOT change the core meaning or the speaker's original voice. Transcript:\n\n${currentTranscript}`,
      });
      if (response.text) {
        setTranscript(selectedDateStr, response.text);
      }
    } catch (err) {
      console.error("Gemini refinement failed:", err);
      alert("Failed to refine transcript.");
    } finally {
      setIsRefining(false);
    }
  };

  if (!mounted) return null;

  const days = Array.from({ length: 15 }).map((_, i) => subDays(new Date(), offsetDays + i));
  const groupedMonths: { month: number; name: string; count: number }[] = [];
  days.forEach(day => {
    const month = day.getMonth();
    const lastGroup = groupedMonths[groupedMonths.length - 1];
    if (lastGroup && lastGroup.month === month) {
      lastGroup.count += 1;
    } else {
      groupedMonths.push({ month, name: format(day, 'MMMM'), count: 1 });
    }
  });

  return (
    <div className="flex flex-col mt-12 animate-in fade-in duration-700">
      <header className="mb-16 border-b border-premium-border pb-8">
        <h1 className="text-5xl md:text-7xl font-heading tracking-tighter mb-4 text-premium-text leading-none">Notebook</h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-premium-muted font-sans text-sm tracking-widest uppercase">
            {offsetDays === 0 ? "Last 15 Days" : `Days ${offsetDays + 1} - ${offsetDays + 15} ago`}
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setOffsetDays(d => Math.max(0, d - 15))}
              disabled={offsetDays === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-premium-border text-premium-muted hover:text-premium-text hover:border-premium-text transition-colors text-xs uppercase tracking-widest disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft size={14} /> Newer
            </button>
            <button 
              onClick={() => setOffsetDays(d => d + 15)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-premium-border text-premium-muted hover:text-premium-text hover:border-premium-text transition-colors text-xs uppercase tracking-widest"
            >
              Older <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </header>

      <div className="overflow-x-auto pb-8 mb-12">
        <div className="inline-grid gap-3" style={{ gridTemplateColumns: `auto repeat(15, minmax(2rem, 1fr))` }}>
          
          <div className="sticky left-0 bg-[var(--theme-bg)] z-20 pr-4"></div>
          {groupedMonths.map((group, i) => {
            const isEvenMonth = group.month % 2 === 0;
            return (
              <div 
                key={`month-${i}`} 
                style={{ gridColumn: `span ${group.count}` }}
                className={`text-xs font-heading text-center rounded-t-lg pt-1 pb-1 uppercase tracking-widest ${
                  isEvenMonth ? 'bg-premium-text text-[var(--theme-bg)] font-bold' : 'bg-transparent text-premium-text'
                }`}
              >
                {group.name}
              </div>
            );
          })}

          <div className="sticky left-0 bg-[var(--theme-bg)] z-20 pr-4"></div>
          {days.map((day, i) => {
            const isSelected = isSameDay(day, selectedDateObj);
            const isEvenMonth = day.getMonth() % 2 === 0;
            
            return (
              <button 
                key={i} 
                onClick={() => setSelectedDateObj(day)}
                className={`text-xs font-mono text-center flex flex-col justify-end pb-2 rounded-b-lg cursor-pointer transition-colors ${
                  isEvenMonth ? 'bg-premium-text text-[var(--theme-bg)]' : 'text-premium-muted hover:text-premium-text'
                } ${isSelected && !isEvenMonth ? 'text-premium-text font-bold bg-premium-panel' : ''}`}
              >
                <span className="opacity-50">{format(day, 'E')[0]}</span>
                <span>{format(day, 'd')}</span>
              </button>
            );
          })}

          {habits.map((habit) => (
            <React.Fragment key={habit._id}>
              <div className="sticky left-0 bg-[var(--theme-bg)] z-20 pr-4 flex items-center min-w-[150px]">
                <span className="text-sm font-medium truncate text-premium-text tracking-tight">{habit.title}</span>
              </div>
              
              {days.map((day, i) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const isCompleted = logs[`${dayStr}_${habit._id}`] === 'completed';
                const isSelected = isSameDay(day, selectedDateObj);
                const isEvenMonth = day.getMonth() % 2 === 0;

                let cellStyle = '';
                if (isEvenMonth) {
                  if (isCompleted) {
                     cellStyle = 'bg-premium-text border-premium-text';
                  } else {
                     cellStyle = 'border-premium-text/30 bg-premium-text/10 hover:border-premium-text/80';
                  }
                } else {
                  if (isCompleted) {
                     cellStyle = 'bg-[var(--theme-accent)] border-[var(--theme-accent)]';
                  } else {
                     cellStyle = 'border-premium-border bg-transparent hover:border-premium-muted';
                  }
                }

                return (
                  <button 
                    key={i} 
                    onClick={() => toggleLog(habit._id, dayStr)}
                    className={`aspect-square rounded-[4px] border transition-all duration-300 cursor-pointer ${cellStyle} ${
                      isSelected && !isCompleted ? 'ring-2 ring-[var(--theme-accent)] ring-offset-2 ring-offset-[var(--theme-bg)]' : ''
                    }`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex justify-center mb-12">
        <button 
          onClick={() => setIsJournalOpen(true)}
          className="glass-panel px-8 py-4 rounded-xl text-premium-text font-medium hover:border-premium-text transition-colors flex items-center gap-3 shadow-lg"
        >
          <Book size={18} />
          Open Journal for {format(selectedDateObj, 'MMMM do')}
        </button>
      </div>

      {isJournalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsJournalOpen(false)}>
          <div 
            className="glass-panel w-full max-w-2xl rounded-2xl shadow-2xl p-6 ring-1 ring-premium-border animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-sans tracking-tight text-premium-text flex items-center gap-3">
                Daily Log
                {isRecording && <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse" />}
              </h2>
              <span className="text-premium-muted font-mono text-sm tracking-widest">{format(selectedDateObj, 'MMMM do, yyyy')}</span>
            </header>
            
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <textarea 
                autoFocus
                placeholder={`Write your reflections for ${format(selectedDateObj, 'MMMM do')}...`}
                value={journals[selectedDateStr] || ""}
                onChange={(e) => setJournal(selectedDateStr, e.target.value)}
                className="w-full md:w-1/2 bg-transparent border border-premium-border rounded-xl p-4 text-premium-text outline-none focus:border-[var(--theme-accent)] transition-colors resize-none leading-relaxed min-h-[200px]"
              />
              <div className="w-full md:w-1/2 flex flex-col gap-2">
                <textarea 
                  placeholder="Voice Transcripts will appear here..."
                  value={transcripts[selectedDateStr] || ""}
                  onChange={(e) => setTranscript(selectedDateStr, e.target.value)}
                  className="w-full bg-black/10 border border-premium-border rounded-xl p-4 text-premium-muted outline-none focus:border-[var(--theme-accent)] transition-colors resize-none leading-relaxed flex-1"
                />
                {transcripts[selectedDateStr] && transcripts[selectedDateStr].length > 0 && (
                  <button 
                    onClick={refineTranscript}
                    disabled={isRefining || isDictating}
                    className="text-xs font-mono tracking-widest uppercase flex items-center justify-center gap-2 bg-[var(--theme-bg)] border border-[var(--theme-accent)]/50 text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-black transition-colors rounded-lg py-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isRefining ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {isRefining ? "Refining..." : "Refine with AI"}
                  </button>
                )}
              </div>
            </div>
            
            {/* Audio Elements */}
            <div className="mt-4 flex flex-col gap-4">
              {localAudioURL && (
                <div className="flex items-center gap-4 bg-premium-panel p-3 rounded-xl border border-premium-border">
                   <audio src={localAudioURL} controls className="flex-1 h-10" />
                   {audioFiles[selectedDateStr] ? (
                     <div className="text-xs font-mono tracking-widest text-premium-muted flex items-center gap-2">
                       <CloudUpload size={14} className="text-[var(--theme-accent)]" /> Synced
                     </div>
                   ) : googleClientId ? (
                     <GoogleSyncButton 
                       selectedDateStr={selectedDateStr} 
                       audioChunksRef={audioChunksRef}
                       setAudioFile={setAudioFile}
                     />
                   ) : (
                     <div className="text-[10px] text-premium-muted font-mono max-w-[120px] text-right">
                       Set Google Client ID in settings to enable Drive sync
                     </div>
                   )}
                </div>
              )}

              <div className="flex justify-between items-center">
                 <div className="flex gap-2">
                   {isRecording ? (
                     <button 
                       onClick={stopRecording}
                       className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-colors uppercase tracking-widest text-xs font-medium"
                     >
                       <Square size={14} /> Stop Recording
                     </button>
                   ) : (
                     <button 
                       onClick={startRecording}
                       className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-black transition-colors uppercase tracking-widest text-xs font-medium"
                     >
                       <Mic size={14} /> Record & Dictate
                     </button>
                   )}
                   {isDictating && (
                     <div className="flex items-center gap-2 text-xs font-mono text-[var(--theme-accent)] animate-pulse ml-2">
                       <Loader2 size={14} className="animate-spin" /> Transcribing with AI...
                     </div>
                   )}
                   
                   {uploading && (
                     <div className="flex items-center gap-2 text-xs font-mono text-premium-muted animate-pulse">
                       <Loader2 size={14} className="animate-spin" /> Uploading to Drive...
                     </div>
                   )}
                 </div>

                 <button onClick={() => setIsJournalOpen(false)} className="px-6 py-2 bg-premium-text text-[var(--theme-bg)] font-medium rounded hover:opacity-80 transition-opacity">
                   Save & Close
                 </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
      
      <p className="text-center text-xs text-premium-muted opacity-50 mt-12 font-sans tracking-wide">
        Press <kbd className="font-mono bg-premium-panel text-premium-muted border border-premium-border px-2 py-1 rounded mx-1">Ctrl+K</kbd> to navigate
      </p>
    </div>
  );
}

function GoogleSyncButton({ 
  selectedDateStr, 
  audioChunksRef, 
  setAudioFile 
}: { 
  selectedDateStr: string, 
  audioChunksRef: React.MutableRefObject<Blob[]>,
  setAudioFile: (date: string, fileId: string) => void
}) {
  const [uploading, setUploading] = useState(false);

  const uploadToDrive = async (blob: Blob, accessToken: string) => {
    setUploading(true);
    try {
      const query = encodeURIComponent("mimeType='application/vnd.google-apps.folder' and name='DhyanLok_Log' and trashed=false");
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id)`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const searchData = await searchRes.json();
      let folderId = searchData.files?.[0]?.id;
      
      if (!folderId) {
        const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'DhyanLok_Log',
            mimeType: 'application/vnd.google-apps.folder',
          })
        });
        const createData = await createRes.json();
        folderId = createData.id;
      }

      const metadata: any = {
        name: `DhyanLok_Journal_${selectedDateStr}.webm`,
        mimeType: 'audio/webm',
      };
      if (folderId) {
        metadata.parents = [folderId];
      }

      // 1. Create file metadata first
      const metadataRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });
      const metadataData = await metadataRes.json();
      
      if (!metadataData.id) throw new Error("Failed to create file metadata");

      // 2. Upload the actual audio blob data
      const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${metadataData.id}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'audio/webm'
        },
        body: blob
      });
      
      if (uploadRes.ok) {
        setAudioFile(selectedDateStr, metadataData.id);
        alert("Audio saved to DhyanLok_Log in Google Drive!");
      } else {
        throw new Error("Failed to upload media");
      }
    } catch (e) {
      console.error("Upload failed", e);
      alert("Failed to upload to Google Drive");
    } finally {
      setUploading(false);
    }
  };

  const loginAndUpload = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      let audioBlob: Blob | null = null;
      if (audioChunksRef.current.length > 0) {
        audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      } else {
        const { get: idbGet } = await import('idb-keyval');
        audioBlob = await idbGet(`audio_${selectedDateStr}`) as Blob;
      }
      
      if (audioBlob) {
        await uploadToDrive(audioBlob, tokenResponse.access_token);
      } else {
        alert("No audio found to upload.");
      }
    },
    scope: 'https://www.googleapis.com/auth/drive.file',
  });

  return (
    <button 
      onClick={() => loginAndUpload()} 
      disabled={uploading}
      className="text-xs font-mono tracking-widest flex items-center gap-2 bg-[var(--theme-accent)] text-black px-3 py-1.5 rounded hover:opacity-80 transition-opacity whitespace-nowrap disabled:opacity-50"
    >
      {uploading ? <Loader2 size={14} className="animate-spin" /> : <CloudUpload size={14} />}
      {uploading ? "Uploading..." : "Sync to Drive"}
    </button>
  );
}
