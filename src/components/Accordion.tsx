type Props = {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function Accordion({
  title,
  defaultOpen = false,
  children,
}: Props) {
  return (
    <details
      className="group rounded-xl border border-line bg-foam/50"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-sea-ink hover:bg-line/20 [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <svg
          className="h-4 w-4 shrink-0 text-sea-ink-soft transition-transform group-open:rotate-180"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div className="border-t border-line px-4 py-3">{children}</div>
    </details>
  )
}
