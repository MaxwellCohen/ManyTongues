import type { ReactNode } from 'react'
import { cn } from '#/lib/cn'

type ColorRowProps = {
  children: ReactNode
  className?: string
}

export default function ColorRow({ children, className }: ColorRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-line bg-foam px-2 py-1.5',
        className,
      )}
    >
      {children}
    </div>
  )
}
