"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Lock, Unlock } from "lucide-react";
import { motion } from "framer-motion";

export default function LockScreen({ children }: { children: React.ReactNode }) {
  const { isLocked, unlock, passkey } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlock(input)) {
      setError(false);
      setInput("");
    } else {
      setError(true);
      setInput("");
      setTimeout(() => setError(false), 1000);
    }
  };

  if (!mounted) return null;

  // If there's no passkey, or the app is unlocked, render children normally
  if (!passkey || !isLocked) {
    return <>{children}</>;
  }

  // Render the lock screen
  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--theme-bg)] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm flex flex-col items-center"
      >
        <div className="h-16 w-16 rounded-full bg-premium-panel border border-premium-border flex items-center justify-center text-premium-text mb-8">
          <Lock size={24} />
        </div>
        
        <h1 className="text-2xl font-heading tracking-tight mb-2">System Locked</h1>
        <p className="text-sm font-sans text-premium-muted uppercase tracking-widest mb-12 text-center">
          Enter Passkey to Access
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-6">
          <div className="relative w-full">
            <input 
              type="password"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`w-full bg-transparent border-b-2 text-center text-4xl tracking-[0.5em] font-mono outline-none transition-colors pb-4 ${
                error ? "border-red-500 text-red-500" : "border-premium-border text-premium-text focus:border-premium-text"
              }`}
              placeholder="••••"
            />
          </div>
          <button 
            type="submit"
            className="mt-4 px-8 py-3 rounded-full border border-premium-border text-xs uppercase tracking-widest font-sans font-medium hover:bg-premium-text hover:text-black transition-all"
          >
            Authenticate
          </button>
        </form>
      </motion.div>
    </div>
  );
}
