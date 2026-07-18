"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="glass-panel p-12 rounded-3xl max-w-lg space-y-6">
        <h2 className="text-3xl font-heading text-red-400">System Error</h2>
        <p className="text-premium-muted font-sans text-sm">
          A disruption occurred in the application layer. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-full border border-premium-border hover:border-premium-text hover:bg-premium-text hover:text-black transition-all duration-300 font-medium tracking-wide uppercase text-xs"
        >
          Recover Session
        </button>
      </div>
    </div>
  );
}
