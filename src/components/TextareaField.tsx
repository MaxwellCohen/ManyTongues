import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '#/lib/cn'
import { Field, FieldControl, FieldLabel } from '#/components/ui/field'
import { Textarea } from '#/components/ui/textarea'

type TextareaFieldProps = {
  label: string
  containerClassName?: string
  labelClassName?: string
} & ComponentPropsWithoutRef<'textarea'>

export default function TextareaField({
  label,
  id,
  className,
  containerClassName,
  labelClassName,
  ...props
}: TextareaFieldProps) {
  return (
    <Field id={id} className={containerClassName}>
      <FieldLabel className={cn('mb-2 text-sm font-semibold text-sea-ink', labelClassName)}>
        {label}
      </FieldLabel>
      <FieldControl>
        <Textarea {...props} className={className} />
      </FieldControl>
    </Field>
  )
}
