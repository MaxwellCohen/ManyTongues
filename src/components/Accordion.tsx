import { ChevronDownIcon } from '#/components/icons'
import type { DetailsHTMLAttributes } from 'react'

export default function Accordion({
  title,
  defaultOpen = false,
  children,
  ...props
}: DetailsHTMLAttributes<HTMLDetailsElement> & {
  title: React.ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details
      {...props}
      className="group rounded-xl border border-line bg-foam/50"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-sea-ink hover:bg-line/20 [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronDownIcon
          className="h-4 w-4 shrink-0 text-sea-ink-soft transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-line px-4 py-3">{children}</div>
    </details>
  )
}
