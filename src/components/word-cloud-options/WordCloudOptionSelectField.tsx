import { Field, FieldControl, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'

type SelectOption = {
  value: string
  label: string
}

export default function WordCloudOptionSelectField({
  label,
  value,
  options,
  onChange,
  onBlur,
  className,
}: {
  label: string
  value: string
  options: ReadonlyArray<SelectOption>
  onChange: (value: string) => void
  onBlur: () => void
  className?: string
}) {
  return (
    <Field className={className}>
      <FieldLabel>{label}</FieldLabel>
      <FieldControl>
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FieldControl>
    </Field>
  )
}
