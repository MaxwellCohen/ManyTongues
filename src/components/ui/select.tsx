import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '#/lib/cn'
import { inputClassName } from './input'

export type SelectProps = ComponentPropsWithoutRef<'select'>

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(inputClassName, 'appearance-none', className)}
      {...props}
    />
  )
})
