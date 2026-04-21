export function LogoMark({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="os-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id="os-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer radar ring */}
      <circle cx="20" cy="20" r="18" stroke="url(#os-grad)" strokeWidth="1.2" opacity="0.25" />
      {/* Middle ring */}
      <circle cx="20" cy="20" r="13" stroke="url(#os-grad)" strokeWidth="1.4" opacity="0.55" />
      {/* Inner glow */}
      <circle cx="20" cy="20" r="9" fill="url(#os-glow)" />
      {/* Solid center with monogram */}
      <circle cx="20" cy="20" r="7.5" fill="url(#os-grad)" />
      {/* Radar sweep line */}
      <path
        d="M20 20 L32 8"
        stroke="url(#os-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Pulse dot */}
      <circle cx="32" cy="8" r="1.8" fill="#22d3ee" />
    </svg>
  );
}

export function LogoLockup({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      <span
        className="font-black tracking-tight"
        style={{
          fontSize: `${size * 0.7}px`,
          background: "linear-gradient(90deg, #a5b4fc 0%, #22d3ee 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          lineHeight: 1,
        }}
      >
        OtoSonar
      </span>
    </div>
  );
}
