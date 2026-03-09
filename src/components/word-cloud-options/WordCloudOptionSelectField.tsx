import { useRef } from 'react'
import { Field, FieldControl, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'

type SelectOption = {
  value: string
  label: string
}

export default function WordCloudOptionSelectField({
  label,
  defaultValue,
  options,
  onChange,
  onBlur,
  className,
}: {
  label: string
  defaultValue: string
  options: ReadonlyArray<SelectOption>
  onChange: (value: string) => void
  onBlur: (value: string) => void
  className?: string
}) {
  const selectRef = useRef<HTMLSelectElement>(null)

  const handleBlur = () => {
    const value = selectRef.current?.value
    if (value != null) {
      onChange(value)
      onBlur(value)
    }
  }

  return (
    <Field className={className}>
      <FieldLabel>{label}</FieldLabel>
      <FieldControl>
        <Select
          ref={selectRef}
          defaultValue={defaultValue}
          onBlur={handleBlur}
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
