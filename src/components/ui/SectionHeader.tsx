interface SectionHeaderProps {
  badge: string
  headline: string
  description?: string
  align?: 'left' | 'center'
  light?: boolean
}

export default function SectionHeader({
  badge,
  headline,
  description,
  align = 'center',
  light = false,
}: SectionHeaderProps) {
  const isCenter = align === 'center'

  return (
    <div className={`flex flex-col gap-3 ${isCenter ? 'items-center text-center' : 'items-start text-left'}`}>
      <span
        className={`badge ${
          light
            ? 'bg-white/10 text-white'
            : 'bg-primary-100 text-primary-500'
        }`}
      >
        {badge}
      </span>
      <h2
        className={`text-t3 laptop:text-t2 font-bold ${
          light ? 'text-white' : 'text-ink-700'
        } ${isCenter ? 'max-w-2xl' : ''}`}
      >
        {headline}
      </h2>
      {description && (
        <p
          className={`text-p18 mt-1 ${
            light ? 'text-primary-200' : 'text-ink-500'
          } ${isCenter ? 'max-w-xl' : 'max-w-2xl'}`}
        >
          {description}
        </p>
      )}
    </div>
  )
}
