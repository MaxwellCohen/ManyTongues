import { useRef } from 'react'
import { Field, FieldControl, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'

export default function WordCloudOptionNumberField({
  label,
  value,
  defaultValue,
  onChange,
  onBlur,
  min,
  max,
  step,
  className,
}: {
  label: string
  /** When provided, the input is controlled and stays in sync with parent state. */
  value?: number
  defaultValue: number
  onChange: (value: number) => void
  onBlur: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isControlled = value !== undefined

  const readAndClamp = (): number | null => {
    const raw = Number(inputRef.current?.value)
    const clamped =
      min != null && max != null
        ? Math.min(max, Math.max(min, raw))
        : min != null
          ? Math.max(min, raw)
          : max != null
            ? Math.min(max, raw)
            : raw
    return Number.isFinite(clamped) ? clamped : null
  }

  const handleChange = () => {
    const next = readAndClamp()
    if (next != null) onChange(next)
  }

  const handleBlur = () => {
    const next = readAndClamp()
    if (next != null) {
      onChange(next)
      onBlur(next)
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
          step={step}
          {...(isControlled ? { value: value } : { defaultValue })}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </FieldControl>
    </Field>
  )
}
