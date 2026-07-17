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
    <div className="relative flex items-center justify-center">
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
          className="text-premium-accent transition-all duration-1000 ease-out"
          style={{ 
            stroke: 'currentColor',
            strokeDashoffset
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
      <div className="absolute font-mono text-sm text-premium-accent">
        {Math.round(progress)}%
      </div>
    </div>
  );
}
