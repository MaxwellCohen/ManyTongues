import { useRef } from 'react'
import { Field, FieldControl, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'

export default function WordCloudOptionNumberField({
  label,
  defaultValue,
  onChange,
  onBlur,
  min,
  max,
  className,
}: {
  label: string
  defaultValue: number
  onChange: (value: number) => void
  onBlur: (value: number) => void
  min?: number
  max?: number
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleBlur = () => {
    const raw = Number(inputRef.current?.value)
    const clamped =
      min != null && max != null
        ? Math.min(max, Math.max(min, raw))
        : min != null
          ? Math.max(min, raw)
          : max != null
            ? Math.min(max, raw)
            : raw
    if (Number.isFinite(clamped)) {
      onChange(clamped)
      onBlur(clamped)
    }
  }

  return (
    <Field className={className}>
      <FieldLabel>{label}</FieldLabel>
      <FieldControl>
        <Input
          ref={inputRef}
          type="number"
          min={min}
          max={max}
          defaultValue={defaultValue}
          onBlur={handleBlur}
        />
      </FieldControl>
    </Field>
  )
}
