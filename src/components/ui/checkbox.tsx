import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '#/lib/cn'

export type CheckboxProps = ComponentPropsWithoutRef<'input'>

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, type, ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type ?? 'checkbox'}
        className={cn(
          'h-4 w-4 rounded border border-line bg-foam text-lagoon accent-lagoon focus:ring-2 focus:ring-lagoon/30',
          className,
        )}
        {...props}
      />
    )
  },
)
