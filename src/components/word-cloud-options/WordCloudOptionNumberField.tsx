import { Field, FieldControl, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'

export default function WordCloudOptionNumberField({
  label,
  value,
  onChange,
  onBlur,
  min,
  max,
  className,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  onBlur: () => void
  min?: number
  max?: number
  className?: string
}) {
  return (
    <Field className={className}>
      <FieldLabel>{label}</FieldLabel>
      <FieldControl>
        <Input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onBlur={onBlur}
        />
      </FieldControl>
    </Field>
  )
}
