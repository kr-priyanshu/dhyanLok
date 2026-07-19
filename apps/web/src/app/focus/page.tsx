"use client";

import { useHabitStore } from "@/store/useHabitStore";
import { useUIStore } from "@/store/useUIStore";
import { useState, useEffect } from "react";
import { Square, Maximize } from "lucide-react";
import { format } from "date-fns";

export default function Focus() {
  const { habits, logs, toggleLog } = useHabitStore();
  const { setIsCommandPaletteOpen } = useUIStore();
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerDuration, setTimerDuration] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [realTime, setRealTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [timerStartDate, setTimerStartDate] = useState("");

  const quotes = [
    "You do not rise to the level of your goals. You fall to the level of your systems. — James Clear",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle",
    "The impediment to action advances action. What stands in the way becomes the way. — Marcus Aurelius",
    "Motivation is what gets you started. Habit is what keeps you going. — Jim Ryun",
    "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time. — John C. Maxwell",
    "Success is the product of daily habits—not once-in-a-lifetime transformations. — James Clear"
  ];

  useEffect(() => { setMounted(true); }, []);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const pendingHabits = mounted ? habits.filter(h => logs[`${todayStr}_${h._id}`] !== 'completed') : [];

  useEffect(() => {
    if (!isFullscreen) return;
    const timeInterval = setInterval(() => setRealTime(new Date()), 1000);
    const quoteInterval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 30000);
    return () => {
      clearInterval(timeInterval);
      clearInterval(quoteInterval);
    };
  }, [isFullscreen]);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 2.5);
      osc2.stop(ctx.currentTime + 2.5);
      
      setTimeout(() => {
        if (ctx.state !== 'closed') ctx.close();
      }, 3000);
    } catch (e) {
      console.error("Audio API not supported or disabled", e);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer && timeRemaining > 0) {
      interval = setInterval(() => setTimeRemaining(t => t - 1), 1000);
    } else if (activeTimer && timeRemaining === 0) {
      // Timer complete — mark habit as done with actual elapsed time
      playChime();
      toggleLog(activeTimer, timerStartDate || todayStr);
      setActiveTimer(null);
      setTimerDuration(0);
      setTimerStartDate("");
      if (document.fullscreenElement) document.exitFullscreen();
    }
    return () => clearInterval(interval);
  }, [activeTimer, timeRemaining, toggleLog, timerStartDate, todayStr]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const enterUltraFocus = async (habitId: string, minutes: number) => {
    try {
      await document.documentElement.requestFullscreen();
      setActiveTimer(habitId);
      setTimerDuration(minutes * 60);
      setTimeRemaining(minutes * 60);
      setTimerStartDate(todayStr);
      setRealTime(new Date());
    } catch (e) {
      console.error("Fullscreen failed", e);
      setActiveTimer(habitId);
      setTimerDuration(minutes * 60);
      setTimeRemaining(minutes * 60);
    }
  };

  const stopTimer = () => {
    setActiveTimer(null);
    setTimerDuration(0);
    if (document.fullscreenElement) document.exitFullscreen();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!mounted) return null;

  if (isFullscreen && activeTimer) {
    return (
      <div className="fixed inset-0 bg-premium-bg flex flex-col items-center justify-center z-[200]">
        <div className="absolute top-12 md:top-24 text-premium-muted font-mono tracking-[0.2em] text-xl opacity-50">
          {format(realTime, 'HH:mm:ss')}
        </div>

        <div className="text-premium-accent font-mono text-[20vw] leading-none select-none tracking-tighter font-light">
          {formatTime(timeRemaining)}
        </div>
        
        <div className="absolute bottom-32 max-w-lg text-center px-6" key={quoteIndex}>
          <p className="text-premium-muted font-sans text-sm tracking-widest leading-relaxed opacity-60 animate-in fade-in duration-1000">
            {quotes[quoteIndex]}
          </p>
        </div>
        
        <button 
          onClick={stopTimer}
          className="absolute bottom-12 opacity-30 hover:opacity-100 transition-opacity duration-500 text-premium-muted border border-premium-border px-8 py-3 rounded-full uppercase tracking-widest font-sans text-xs font-medium hover:bg-premium-accent hover:text-black hover:border-premium-accent"
        >
          Abort Focus
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-12 px-4 w-full max-w-2xl mx-auto min-h-[70vh] animate-in fade-in duration-1000">
      <div className="w-full max-w-2xl space-y-4 relative z-10">
        {pendingHabits.length === 0 ? (
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-8xl font-heading tracking-tighter text-premium-text leading-tight">All Clear</h1>
            <p className="text-premium-muted font-sans text-xs sm:text-sm tracking-widest uppercase">System Ready / No Pending Tasks</p>
          </div>
        ) : (
          pendingHabits.map(habit => (
            <div key={habit._id} className="group glass-panel relative flex items-center justify-between p-4 sm:p-5 rounded-xl hover:border-premium-muted transition-all duration-300 gap-3">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleLog(habit._id, todayStr)}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-premium-border bg-premium-bg flex items-center justify-center transition-all duration-300 hover:border-premium-text hover:bg-premium-text hover:text-black cursor-pointer flex-shrink-0"
                  aria-label={`Complete ${habit.title}`}
                >
                  ✓
                </button>
                <h2 className="text-base sm:text-xl font-sans font-medium tracking-tight text-premium-text">{habit.title}</h2>
              </div>
              
              {habit.type === 'timer' && (
                <div className="flex items-center gap-4">
                  {activeTimer === habit._id ? (
                    <button 
                      onClick={stopTimer}
                      className="flex items-center gap-3 text-base sm:text-xl font-mono text-premium-text"
                    >
                      <span>{formatTime(timeRemaining)}</span>
                      <Square size={18} className="opacity-50" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => enterUltraFocus(habit._id, habit.targetTimeMinutes || 25)}
                      className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-premium-border text-premium-text hover:bg-premium-text hover:text-black transition-all uppercase tracking-widest font-sans text-[10px] sm:text-xs font-medium whitespace-nowrap"
                    >
                      <Maximize size={12} />
                      Focus ({habit.targetTimeMinutes || 25}m)
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-12 text-premium-muted opacity-50 text-xs font-sans tracking-wide flex gap-8 z-10">
        <button onClick={() => setIsCommandPaletteOpen(true)} className="hover:text-premium-text transition-colors">
          Press <kbd className="font-mono bg-premium-panel border border-premium-border px-2 py-0.5 rounded mx-1 text-premium-muted">Ctrl+K</kbd> to navigate
        </button>
      </div>
    </div>
  );
}
