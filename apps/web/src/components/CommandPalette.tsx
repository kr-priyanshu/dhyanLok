"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";

export default function CommandPalette() {
  const router = useRouter();
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, setIsUltraFocusClock } = useUIStore();

  // Command Palette toggle
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsCommandPaletteOpen(false)}>
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
                    onSelect={() => { setIsUltraFocusClock(true); setIsCommandPaletteOpen(false); }}
                    onMouseDown={() => { setIsUltraFocusClock(true); setIsCommandPaletteOpen(false); }}
                    onPointerDown={() => { setIsUltraFocusClock(true); setIsCommandPaletteOpen(false); }}
                    className="cursor-pointer px-4 py-2 rounded-md hover:bg-premium-text hover:text-[var(--theme-bg)] text-premium-text transition-colors aria-selected:bg-premium-text aria-selected:text-[var(--theme-bg)] font-bold tracking-widest uppercase mb-2"
                  >
                    ⏱ Enter Ultra Focus Mode
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Navigation" className="p-2 text-sm text-premium-muted font-medium">
                  <Command.Item 
                    onSelect={() => { router.push('/dashboard'); setIsCommandPaletteOpen(false); }}
                    onMouseDown={() => { router.push('/dashboard'); setIsCommandPaletteOpen(false); }}
                    onPointerDown={() => { router.push('/dashboard'); setIsCommandPaletteOpen(false); }}
                    className="cursor-pointer px-4 py-2 rounded-md hover:bg-premium-panel text-premium-text transition-colors aria-selected:bg-premium-panel aria-selected:text-premium-accent"
                  >
                    Go to Dashboard
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { router.push('/notebook'); setIsCommandPaletteOpen(false); }}
                    onMouseDown={() => { router.push('/notebook'); setIsCommandPaletteOpen(false); }}
                    onPointerDown={() => { router.push('/notebook'); setIsCommandPaletteOpen(false); }}
                    className="cursor-pointer px-4 py-2 rounded-md hover:bg-premium-panel text-premium-text transition-colors aria-selected:bg-premium-panel aria-selected:text-premium-accent"
                  >
                    Go to Notebook
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { router.push('/focus'); setIsCommandPaletteOpen(false); }}
                    onMouseDown={() => { router.push('/focus'); setIsCommandPaletteOpen(false); }}
                    onPointerDown={() => { router.push('/focus'); setIsCommandPaletteOpen(false); }}
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

    </>
  );
}
