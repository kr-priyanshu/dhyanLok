export default function ProgressRing({ 
  radius = 60, 
  stroke = 4, 
  progress = 0 
}: { 
  radius?: number, 
  stroke?: number, 
  progress?: number 
}) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className="relative flex items-center justify-center" 
      role="progressbar" 
      aria-valuenow={Math.round(progress)} 
      aria-valuemin={0} 
      aria-valuemax={100}
    >
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle
          className="text-premium-border"
          style={{ stroke: 'currentColor' }}
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className="text-premium-text transition-all duration-1000 ease-out"
          style={{ 
            stroke: 'currentColor',
            strokeDashoffset,
            filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.4))'
          }}
          strokeDasharray={circumference + ' ' + circumference}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute font-mono text-sm font-semibold text-premium-text tracking-tighter">
        {Math.round(progress)}%
      </div>
    </div>
  );
}
