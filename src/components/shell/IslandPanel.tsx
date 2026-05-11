import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '#/lib/cn'

type IslandPanelProps = {
  children: ReactNode
  className?: string
} & ComponentPropsWithoutRef<'section'>

export default function IslandPanel({
  children,
  className,
  ...props
}: IslandPanelProps) {
  return (
    <section
      {...props}
      className={cn(
        'border border-line bg-[linear-gradient(165deg,var(--color-surface-strong),var(--color-surface))] shadow-island backdrop-blur-xs transition-[background-color,color,border-color,transform] duration-150',
        className,
      )}
    >
      {children}
    </section>
  )
}
