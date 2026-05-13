import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

type Props = {
  Icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
}

export default function EmptyState({ Icon, title, description, action }: Props) {
  return (
    <div className="bg-white rounded-xl border border-ink-200 py-16 px-8 flex flex-col items-center text-center gap-3">
      {Icon && <Icon className="w-10 h-10 text-ink-300 mb-1" strokeWidth={1.5} />}
      <p className="text-p16 font-semibold text-ink-500">{title}</p>
      {description && <p className="text-p14 text-ink-400 max-w-sm">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="mt-2 inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg text-p14 font-medium hover:bg-primary-600 transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
