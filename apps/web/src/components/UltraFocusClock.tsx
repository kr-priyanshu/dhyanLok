"use client";

import { useState, useEffect, useCallback } from "react";
import { useUIStore } from "@/store/useUIStore";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function UltraFocusClock() {
  const { isUltraFocusClock, setIsUltraFocusClock } = useUIStore();
  const [now, setNow] = useState(new Date());

  // Tick every second
  useEffect(() => {
    if (!isUltraFocusClock) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [isUltraFocusClock]);

  // Enter fullscreen when activated, exit when dismissed
  useEffect(() => {
    if (isUltraFocusClock) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  }, [isUltraFocusClock]);

  const dismiss = useCallback(() => {
    setIsUltraFocusClock(false);
  }, [setIsUltraFocusClock]);

  // Escape key or any click dismisses
  useEffect(() => {
    if (!isUltraFocusClock) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isUltraFocusClock, dismiss]);

  // Also dismiss if user exits fullscreen via browser UI (F11 / button)
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setIsUltraFocusClock(false);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [setIsUltraFocusClock]);

  const hours   = format(now, "HH");
  const minutes = format(now, "mm");
  const seconds = format(now, "ss");
  const dateStr = format(now, "EEEE, MMMM do");

  return (
    <AnimatePresence>
      {isUltraFocusClock && (
        <motion.div
          key="ultra-focus-clock"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6 } }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          className="fixed inset-0 z-[700] flex flex-col items-center justify-center select-none cursor-none"
          style={{ background: "#020202" }}
          onClick={dismiss}
        >
          {/* Date — very subtle at top */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.25, y: 0, transition: { delay: 0.8, duration: 0.6 } }}
            className="absolute top-12 font-mono tracking-[0.3em] text-sm uppercase text-white"
          >
            {dateStr}
          </motion.p>

          {/* Main clock — constrained to fit the full viewport */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] as any } }}
            className="w-full flex items-center justify-center px-4"
            style={{ maxWidth: '100vw' }}
          >
            {/* HH : MM : SS — all in one row, sized to fit */}
            <div
              className="font-mono font-thin text-white flex items-center"
              style={{
                fontSize: 'min(16vw, 38vh)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              <span>{hours}</span>
              <BlinkingColon />
              <span>{minutes}</span>
              <span
                className="text-white/25"
                style={{ fontSize: 'min(7vw, 18vh)', marginLeft: '0.15em', alignSelf: 'flex-end', paddingBottom: '0.08em' }}
              >
                :{seconds}
              </span>
            </div>
          </motion.div>

          {/* Dismiss hint — appears after 3s then fades */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0], transition: { delay: 3, duration: 3, times: [0, 0.3, 1] } }}
            className="absolute bottom-12 text-white font-mono text-xs tracking-[0.3em] uppercase"
          >
            Click or Esc to exit
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Colon that blinks every second
function BlinkingColon() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setVisible((v) => !v), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      className="font-mono font-thin text-white/50 transition-opacity duration-200 select-none"
      style={{
        opacity: visible ? 1 : 0.05,
        letterSpacing: 0,
        lineHeight: 1,
        // Shift it down a little so it sits optically centred between digits
        paddingBottom: '0.05em',
      }}
    >
      :
    </span>
  );
}
