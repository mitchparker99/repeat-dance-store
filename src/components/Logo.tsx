import Image from 'next/image'

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
  const src = variant === 'white' ? '/logo-white.png' : '/logo-black.png'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src={src}
        alt="Repeat Dance"
        width={icon}
        height={icon}
        className="flex-shrink-0"
        style={{ objectFit: 'contain' }}
      />
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
