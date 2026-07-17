"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [ultraFocus, setUltraFocus] = useState(false);
  const [time, setTime] = useState(new Date());
  const router = useRouter();

  const enterUltraFocus = async () => {
    setOpen(false);
    setUltraFocus(true);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen request failed", err);
    }
  };

  const exitUltraFocus = () => {
    setUltraFocus(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  // Sync state with native fullscreen exits
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setUltraFocus(false);
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Command Palette toggle
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Ultra Focus Clock
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (ultraFocus) {
      interval = setInterval(() => setTime(new Date()), 1000);
    }
    return () => clearInterval(interval);
  }, [ultraFocus]);

  // Ultra Focus Exit
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && ultraFocus) {
        exitUltraFocus();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [ultraFocus]);

  const formattedTime = time.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setOpen(false)}>
          <div 
            className="glass-panel w-full max-w-lg rounded-xl shadow-2xl overflow-hidden ring-1 ring-premium-border animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Command label="Global Command Menu" className="w-full">
              <Command.Input 
                autoFocus 
                placeholder="Type a command or search..." 
                className="w-full p-4 border-b border-premium-border bg-transparent outline-none text-lg text-premium-text placeholder:text-premium-muted"
              />
              <Command.List className="max-h-[300px] overflow-y-auto p-2">
                <Command.Empty className="p-4 text-center text-premium-muted">No results found.</Command.Empty>

                <Command.Group heading="Modes" className="p-2 text-sm text-premium-muted font-medium">
                  <Command.Item 
                    onSelect={enterUltraFocus}
                    className="cursor-pointer px-4 py-2 rounded-md hover:bg-premium-text hover:text-[var(--theme-bg)] text-premium-text transition-colors aria-selected:bg-premium-text aria-selected:text-[var(--theme-bg)] font-bold tracking-widest uppercase mb-2"
                  >
                    Enter Ultra Focus Mode
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Navigation" className="p-2 text-sm text-premium-muted font-medium">
                  <Command.Item 
                    onSelect={() => { router.push('/dashboard'); setOpen(false); }}
                    className="cursor-pointer px-4 py-2 rounded-md hover:bg-premium-panel text-premium-text transition-colors aria-selected:bg-premium-panel aria-selected:text-premium-accent"
                  >
                    Go to Dashboard
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { router.push('/notebook'); setOpen(false); }}
                    className="cursor-pointer px-4 py-2 rounded-md hover:bg-premium-panel text-premium-text transition-colors aria-selected:bg-premium-panel aria-selected:text-premium-accent"
                  >
                    Go to Notebook
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { router.push('/focus'); setOpen(false); }}
                    className="cursor-pointer px-4 py-2 rounded-md hover:bg-premium-panel text-premium-text transition-colors aria-selected:bg-premium-panel aria-selected:text-premium-accent"
                  >
                    Go to Session Focus
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </div>
        </div>
      )}

      {/* Ultra Focus Fullscreen Overlay */}
      {ultraFocus && (
        <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center animate-in fade-in duration-1000">
          <h1 className="text-white font-mono text-[15vw] md:text-[12vw] font-bold tracking-tighter leading-none">
            {formattedTime}
          </h1>
          <p className="text-white/20 font-sans tracking-widest uppercase text-sm mt-8 absolute bottom-12">
            Press Esc to exit
          </p>
        </div>
      )}
    </>
  );
}
