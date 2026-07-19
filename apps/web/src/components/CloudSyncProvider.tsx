"use client";

import { useEffect, useRef, useState } from "react";
import { useHabitStore } from "@/store/useHabitStore";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/utils/supabase";
import { Cloud, CloudOff, Loader2, Check } from "lucide-react";

export default function CloudSyncProvider() {
  const { habits, logs, journals, transcripts, audioFiles, restoreData } = useHabitStore();
  const { isVerified, registeredEmail } = useAuthStore();
  
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const initialLoadDone = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Pull (on mount / auth change)
  useEffect(() => {
    if (!isVerified || !registeredEmail) return;

    const pullData = async () => {
      try {
        setSyncStatus('syncing');
        const { data, error } = await supabase
          .from('guest_users')
          .select('sync_data, sync_updated_at')
          .eq('email', registeredEmail)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        // If cloud data exists, we check if it's newer than our local data
        // For simplicity, if cloud data exists on first load, we merge or prompt.
        // Since we don't have a local timestamp yet, we just restore if it exists and local is empty
        if (data && data.sync_data) {
          const localDataIsEmpty = habits.length === 3 && Object.keys(logs).length === 0; // The default 3 habits
          
          if (localDataIsEmpty) {
             restoreData(data.sync_data as any);
          } else {
             // To prevent accidental overwrites, ideally we'd compare timestamps.
             // For now, we assume local state takes precedence unless it's a fresh browser.
             console.log("Cloud sync found, but local data exists. Preserving local data.");
          }
        }
        
        setSyncStatus('synced');
      } catch (err) {
        console.error("Cloud pull failed:", err);
        setSyncStatus('error');
      } finally {
        initialLoadDone.current = true;
      }
    };

    pullData();
  }, [isVerified, registeredEmail, restoreData, habits.length, logs]);

  // 2. Debounced Push (on any state change)
  useEffect(() => {
    if (!isVerified || !registeredEmail || !initialLoadDone.current) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    setSyncStatus('idle');

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        setSyncStatus('syncing');
        const payload = { habits, logs, journals, transcripts, audioFiles };
        
        const { error } = await supabase
          .from('guest_users')
          .update({ 
            sync_data: payload,
            sync_updated_at: new Date().toISOString()
          })
          .eq('email', registeredEmail);

        if (error) throw error;
        setSyncStatus('synced');
      } catch (err) {
        console.error("Cloud push failed:", err);
        setSyncStatus('error');
      }
    }, 5000); // 5-second debounce

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [habits, logs, journals, transcripts, audioFiles, isVerified, registeredEmail]);

  if (!isVerified) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[150] flex items-center gap-2 px-3 py-1.5 rounded-full bg-premium-panel border border-premium-border text-xs text-premium-muted shadow-lg animate-in slide-in-from-bottom-4">
      {syncStatus === 'syncing' && <><Loader2 size={12} className="animate-spin text-premium-text" /> Syncing...</>}
      {syncStatus === 'synced' && <><Check size={12} className="text-green-400" /> Synced</>}
      {syncStatus === 'error' && <><CloudOff size={12} className="text-red-400" /> Offline</>}
      {syncStatus === 'idle' && <><Cloud size={12} className="opacity-50" /> Pending</>}
    </div>
  );
}
