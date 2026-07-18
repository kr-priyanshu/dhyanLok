"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/utils/supabase";
import { motion } from "framer-motion";
import { ArrowRight, Settings2, SkipForward, KeyRound, Cloud } from "lucide-react";

export default function Onboarding() {
  const router = useRouter();
  const {
    hasHydrated,
    registeredEmail,
    setGoogleClientId,
    setGeminiApiKey,
  } = useAuthStore();

  const [googleId, setGoogleId] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // AuthGuard (in layout.tsx) already handles the isLoggedIn redirect.
  // We only need to wait for hydration to avoid a flicker while the store loads.
  if (!hasHydrated) {
    return (
      <div
        className="min-h-screen w-full"
        style={{ background: "var(--theme-bg)" }}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // 1. Sync to Supabase so Admin can see the keys
      if (registeredEmail) {
        const updateData: Record<string, string> = {};
        if (googleId.trim()) updateData.google_client_id = googleId.trim();
        if (geminiKey.trim()) updateData.gemini_api_key = geminiKey.trim();

        if (Object.keys(updateData).length > 0) {
          const { error: dbError } = await supabase
            .from("guest_users")
            .update(updateData)
            .eq("email", registeredEmail);

          if (dbError) {
            console.error("Supabase Sync Error:", dbError);
          }
        }
      }

      // 2. Update local store so the app can use them immediately
      if (googleId.trim()) setGoogleClientId(googleId.trim());
      if (geminiKey.trim()) setGeminiApiKey(geminiKey.trim());

      // 3. Navigate — hasCompletedTour stays false so the tour fires
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to save settings. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // hasCompletedTour stays false — the feature tour will greet them on the dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 fixed inset-0 z-[9999] bg-[var(--theme-bg)]">
      {/* Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md flex flex-col items-center relative z-10"
      >
        {/* Step badge */}
        <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-premium-muted mb-6 border border-premium-border rounded-full px-4 py-1.5">
          Setup — One Last Step
        </span>

        <div className="h-16 w-16 rounded-2xl bg-premium-panel border border-premium-border shadow-2xl flex items-center justify-center mb-6">
          <Settings2 className="text-[var(--theme-accent)]" size={28} />
        </div>

        <h1 className="text-3xl font-heading font-medium tracking-tight mb-3 text-center">
          Power Up Your Sandbox
        </h1>
        <p className="text-premium-muted text-sm text-center font-sans mb-10 leading-relaxed max-w-sm">
          Unlock AI journaling and cloud sync by connecting your API keys. These
          are saved securely to your account and can be changed anytime in
          Settings.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          {/* Google Drive Client ID */}
          <div className="flex flex-col gap-2 group">
            <label className="text-xs text-premium-muted uppercase tracking-widest font-medium ml-1 flex items-center gap-2">
              <Cloud size={12} />
              Google Drive Sync Client ID
            </label>
            <input
              type="text"
              placeholder="e.g. 123456789-xyz.apps.googleusercontent.com"
              value={googleId}
              onChange={(e) => setGoogleId(e.target.value)}
              className="w-full bg-black/10 border border-premium-border rounded-xl p-4 text-sm outline-none focus:border-premium-text transition-colors placeholder:text-premium-muted/50"
            />
            <p className="text-[10px] text-premium-muted ml-1 opacity-60 leading-relaxed">
              Enables automatic cloud backup of your voice journal recordings to
              Google Drive.
            </p>
          </div>

          {/* Gemini API Key */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-premium-muted uppercase tracking-widest font-medium ml-1 flex items-center gap-2">
              <KeyRound size={12} />
              Gemini AI Secret Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full bg-black/10 border border-premium-border rounded-xl p-4 text-sm outline-none focus:border-premium-text transition-colors placeholder:text-premium-muted/50 tracking-widest"
            />
            <p className="text-[10px] text-premium-muted ml-1 opacity-60 leading-relaxed">
              Powers AI journal refinement and the smart habit assistant on your
              dashboard.
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center">{error}</p>
          )}

          <div className="flex flex-col gap-3 mt-2">
            <button
              type="submit"
              disabled={isSubmitting || (!googleId.trim() && !geminiKey.trim())}
              className="w-full py-4 rounded-xl bg-premium-text text-[var(--theme-bg)] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save & Enter"}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-transparent border border-premium-border text-premium-muted font-medium flex items-center justify-center gap-2 hover:bg-premium-panel hover:text-premium-text transition-all"
            >
              Skip for now <SkipForward size={14} />
            </button>
          </div>
        </form>

        <p className="text-[10px] text-premium-muted/40 mt-8 text-center font-mono">
          Keys are stored on your account. Change them anytime in Settings.
        </p>
      </motion.div>
    </div>
  );
}
