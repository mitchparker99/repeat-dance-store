// ─────────────────────────────────────────────────────────────────────────────
// Logo component — Repeat Dance dancer icon (SVG) + wordmark
//
// TO REPLACE WITH YOUR ACTUAL LOGO:
// 1. Export your logo from Illustrator/Affinity as SVG
// 2. Place it in /public/logo-black.svg (black version)
//    and /public/logo-white.svg (white/reverse version)
// 3. Replace the <svg> below with <img src="/logo-black.svg" ... />
//    or use Next.js <Image> component
// ─────────────────────────────────────────────────────────────────────────────

interface LogoProps {
  variant?: 'black' | 'white'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizes = {
  sm: { icon: 28, text: 'text-sm' },
  md: { icon: 36, text: 'text-base' },
  lg: { icon: 56, text: 'text-xl' },
}

export function Logo({
  variant = 'black',
  size = 'md',
  showText = true,
  className = '',
}: LogoProps) {
  const { icon, text } = sizes[size]
  const color = variant === 'white' ? '#ffffff' : '#000000'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Dancer icon — approximate SVG from brand files */}
      <DancerIcon size={icon} color={color} />
      {showText && (
        <span
          className={`font-black uppercase tracking-tight leading-none ${text}`}
          style={{ color }}
        >
          REPEAT DANCE
        </span>
      )}
    </div>
  )
}

function DancerIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Head */}
      <circle cx="58" cy="13" r="11" />
      {/* Arms — wide horizontal bar, left arm angles slightly down */}
      <path
        d="M10 44 Q20 36 38 38 L62 38 Q78 36 90 30 Q96 27 97 31 Q98 35 92 38 Q80 44 62 44 L38 44 Q22 46 12 52 Q6 56 4 52 Q2 48 10 44Z"
        strokeLinecap="round"
      />
      {/* Body — vertical section */}
      <rect x="51" y="44" width="14" height="22" rx="7" />
      {/* Right leg — straight down */}
      <rect x="51" y="64" width="14" height="26" rx="7" />
      {/* Left leg — bent forward (knee raised) */}
      <path
        d="M51 66 Q42 70 32 82 Q28 88 30 92 Q32 96 38 94 Q44 92 48 86 L57 66Z"
        strokeLinecap="round"
      />
    </svg>
  )
}
