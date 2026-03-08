import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '#/lib/cn'

export type RangeInputProps = ComponentPropsWithoutRef<'input'>

export const RangeInput = forwardRef<HTMLInputElement, RangeInputProps>(
  function RangeInput({ className, type, ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type ?? 'range'}
        className={cn(
          'h-2 w-full shrink-0 rounded-full bg-line accent-lagoon',
          className,
        )}
        {...props}
      />
    )
  },
)
