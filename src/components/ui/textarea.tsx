import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '#/lib/cn'

const textareaBaseClassName =
  'w-full border border-line bg-foam text-sea-ink placeholder:text-sea-ink-soft transition focus:border-lagoon focus:outline-none focus:ring-2 focus:ring-lagoon/30 disabled:cursor-not-allowed disabled:opacity-60'

const textareaSizeClassNames = {
  sm: 'rounded-lg px-3 py-2 text-sm',
  lg: 'resize-y rounded-xl px-4 py-3',
} as const

type TextareaProps = ComponentPropsWithoutRef<'textarea'> & {
  size?: keyof typeof textareaSizeClassNames
}

const textareaClassName = cn(
  textareaBaseClassName,
  textareaSizeClassNames.lg,
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, size = 'lg', ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(textareaBaseClassName, textareaSizeClassNames[size], className)}
        {...props}
      />
    )
  },
)
