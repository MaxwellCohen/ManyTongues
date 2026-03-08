import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '#/lib/cn'

const inputBaseClassName =
  'w-full border border-line bg-foam text-sea-ink placeholder:text-sea-ink-soft transition focus:border-lagoon focus:outline-none focus:ring-2 focus:ring-lagoon/30 disabled:cursor-not-allowed disabled:opacity-60'

const inputSizeClassNames = {
  sm: 'rounded-lg px-3 py-2 text-sm',
  lg: 'rounded-xl px-4 py-3',
} as const

export type InputProps = Omit<ComponentPropsWithoutRef<'input'>, 'size'> & {
  uiSize?: keyof typeof inputSizeClassNames
}

export const inputClassName = cn(inputBaseClassName, inputSizeClassNames.sm)
export const inputLargeClassName = cn(inputBaseClassName, inputSizeClassNames.lg)

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, uiSize = 'sm', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(inputBaseClassName, inputSizeClassNames[uiSize], className)}
      {...props}
    />
  )
})
