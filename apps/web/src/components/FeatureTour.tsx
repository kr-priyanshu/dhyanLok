"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Book, Crosshair, ArrowRight, ArrowLeft, X, CheckCircle, Flame, Sparkles, Settings, PlusCircle, Command } from "lucide-react";

// ─── Tour Step Definitions ───────────────────────────────────────────────────

const STEPS = [
  {
    target: "nav-dashboard",
    icon: LayoutDashboard,
    accentColor: "text-emerald-400",
    headline: "Your Habit HQ",
    body: "This is your dashboard. Check off daily habits, build streaks, and watch your completion ring fill.",
    position: "right"
  },
  {
    target: "nav-notebook",
    icon: Book,
    accentColor: "text-violet-400",
    headline: "Voice Journal",
    body: "The Notebook is your calendar and journal. Speak your thoughts aloud, and let Gemini AI clean up your transcript.",
    position: "right"
  },
  {
    target: "nav-focus",
    icon: Crosshair,
    accentColor: "text-amber-400",
    headline: "Ultra-Focus Mode",
    body: "Launch a fullscreen Pomodoro session for timer habits. The screen goes dark and a real clock ticks.",
    position: "right"
  },
  {
    target: "dashboard-progress",
    icon: Flame,
    accentColor: "text-orange-400",
    headline: "Daily Progress",
    body: "Watch this ring fill up in real-time as you complete your habits for the day.",
    position: "bottom"
  },
  {
    target: "dashboard-stats",
    icon: Flame,
    accentColor: "text-orange-400",
    headline: "Track Your Trends",
    body: "Keep an eye on your 7-day trend, weekly, and monthly completion rates right here.",
    position: "bottom"
  },
  {
    target: "habit-list",
    icon: CheckCircle,
    accentColor: "text-blue-400",
    headline: "Manage Habits",
    body: "Click the circle to toggle a habit. Drag the ⠿ handle to reorder them between categories.",
    position: "top"
  },
  {
    target: "add-habit",
    icon: PlusCircle,
    accentColor: "text-green-400",
    headline: "Create New Habits",
    body: "Click here to build new binary (checkoff) or Pomodoro timer habits instantly.",
    position: "top"
  },
  {
    target: "ai-assistant",
    icon: Sparkles,
    accentColor: "text-yellow-400",
    headline: "DhyanLok AI",
    body: "Press Ctrl + M anywhere to activate your voice AI. Tell it to add or remove habits completely hands-free!",
    position: "top-left"
  },
  {
    target: "nav",
    icon: Command,
    accentColor: "text-indigo-400",
    headline: "Command Palette",
    body: "Pro Tip: Press Ctrl + K anytime to open the global Command Palette and navigate at the speed of thought.",
    position: "right"
  },
  {
    target: "settings",
    icon: Settings,
    accentColor: "text-zinc-400",
    headline: "Settings & Themes",
    body: "Customize colors, fonts, manage your Google Drive backups, and set your API keys here. You're ready to go!",
    position: "top-left"
  }
];

export default function FeatureTour() {
  const { hasCompletedTour, setHasCompletedTour } = useAuthStore();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Measure the target element
  const measureTarget = useCallback(() => {
    if (!visible) return;
    const current = STEPS[step];
    const el = document.querySelector(`[data-tour="${current.target}"]`);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetRect(null);
    }
  }, [step, visible]);

  useEffect(() => {
    if (!hasCompletedTour) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTour]);

  // Re-measure on resize or step change
  useEffect(() => {
    measureTarget();
    window.addEventListener("resize", measureTarget);
    return () => window.removeEventListener("resize", measureTarget);
  }, [measureTarget]);

  const handleFinish = useCallback(() => {
    setVisible(false);
    setTimeout(() => setHasCompletedTour(true), 300);
  }, [setHasCompletedTour]);

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleFinish();
    }
  }, [step, handleFinish]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handleBack();
      if (e.key === "Escape") handleFinish();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, handleNext, handleBack, handleFinish]);

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  // Calculate popover position
  let popoverStyle: React.CSSProperties = {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  };

  if (targetRect) {
    const gap = 24;
    switch (current.position) {
      case "right":
        popoverStyle = { top: targetRect.top + targetRect.height / 2, left: targetRect.right + gap, transform: "translateY(-50%)" };
        break;
      case "left":
        popoverStyle = { top: targetRect.top + targetRect.height / 2, right: window.innerWidth - targetRect.left + gap, transform: "translateY(-50%)" };
        break;
      case "bottom":
        popoverStyle = { top: targetRect.bottom + gap, left: targetRect.left + targetRect.width / 2, transform: "translateX(-50%)" };
        break;
      case "top":
        popoverStyle = { bottom: window.innerHeight - targetRect.top + gap, left: targetRect.left + targetRect.width / 2, transform: "translateX(-50%)" };
        break;
      case "top-left":
        popoverStyle = { bottom: window.innerHeight - targetRect.top + gap, right: window.innerWidth - targetRect.right, transform: "none" };
        break;
    }
    
    // Prevent clipping off screen (basic boundaries)
    if (typeof popoverStyle.left === 'number' && popoverStyle.left > window.innerWidth - 320) {
      popoverStyle.left = window.innerWidth - 340;
      popoverStyle.transform = "none";
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      
      {/* Background Dimmer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-auto transition-opacity"
        onClick={handleFinish}
      />

      {/* Spotlight Hole */}
      <AnimatePresence>
        {targetRect && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute rounded-2xl bg-transparent ring-[9999px] ring-black/0 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] mix-blend-destination transition-all duration-500 ease-out pointer-events-none"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
        )}
      </AnimatePresence>

      {/* Popover Card */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute w-80 sm:w-96 glass-panel rounded-2xl p-6 shadow-2xl pointer-events-auto border border-premium-border bg-[var(--theme-bg)]"
        style={popoverStyle}
      >
        <button
          onClick={handleFinish}
          className="absolute top-4 right-4 text-premium-muted hover:text-premium-text transition-colors"
          aria-label="Skip tour"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-premium-border/30 border border-premium-border/50`}>
            <Icon size={20} className={current.accentColor} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-premium-muted uppercase">
              Step {step + 1} of {STEPS.length}
            </span>
            <h3 className="text-lg font-heading tracking-tight text-premium-text">
              {current.headline}
            </h3>
          </div>
        </div>

        <p className="text-sm text-premium-muted font-sans leading-relaxed mb-6">
          {current.body}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-premium-border">
          <button
            onClick={handleFinish}
            className="text-xs text-premium-muted hover:text-premium-text transition-colors"
          >
            Skip Tour
          </button>
          
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="p-2 rounded-lg border border-premium-border text-premium-muted hover:text-premium-text transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-premium-text text-[var(--theme-bg)] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {isLast ? "Done" : "Next"}
              {!isLast && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
