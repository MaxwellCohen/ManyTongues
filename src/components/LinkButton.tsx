import { Link } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { cn } from '#/lib/cn'

type LinkButtonTone = 'primary' | 'secondary'

type LinkButtonProps = ComponentProps<typeof Link> & {
  tone?: LinkButtonTone
}

export default function LinkButton({
  className,
  tone,
  ...props
}: LinkButtonProps) {
  const toneClassName =
    tone === 'secondary'
      ? 'rounded-full border-2 border-lagoon bg-transparent px-5 py-2.5 text-sm font-semibold text-sea-ink transition-colors hover:bg-lagoon/12 focus:ring-2 focus:ring-lagoon focus:ring-offset-2 focus:ring-offset-bg-base'
      : 'gap-2 rounded-xl border-2 border-btn-primary-bg bg-btn-primary-bg px-7 py-3.5 text-base font-semibold leading-5 tracking-action text-btn-primary-text shadow-button-primary transition-[background-color,border-color,color,box-shadow] duration-150 hover:border-btn-primary-hover-bg hover:bg-btn-primary-hover-bg focus:shadow-button-primary-focus'

  return (
    <Link
      {...props}
      className={cn(
        'inline-flex items-center justify-center no-underline focus:outline-none',
        toneClassName,
        className,
      )}
    />
  )
}
