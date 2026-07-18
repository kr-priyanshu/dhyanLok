export default function Loading() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center animate-in fade-in duration-500 delay-300 fill-mode-both">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-16 w-16">
          {/* Subtle spinning rings */}
          <div className="absolute inset-0 rounded-full border border-premium-border border-t-premium-accent animate-spin" style={{ animationDuration: '3s' }}></div>
          <div className="absolute inset-2 rounded-full border border-premium-border border-b-premium-muted animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}></div>
          <div className="absolute inset-4 rounded-full border border-premium-muted opacity-20"></div>
        </div>
        <div className="text-premium-muted font-mono tracking-widest text-xs uppercase animate-pulse">
          Loading
        </div>
      </div>
    </div>
  );
}
