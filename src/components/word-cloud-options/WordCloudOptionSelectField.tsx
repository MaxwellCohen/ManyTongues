import { useRef } from 'react'
import { Field, FieldControl, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'

type SelectOption = {
  value: string
  label: string
}

export default function WordCloudOptionSelectField({
  label,
  value,
  defaultValue,
  options,
  onChange,
  onBlur,
  className,
}: {
  label: string
  /** When provided, the select is controlled and stays in sync with parent state. */
  value?: string
  defaultValue: string
  options: ReadonlyArray<SelectOption>
  onChange: (value: string) => void
  onBlur: (value: string) => void
  className?: string
}) {
  const selectRef = useRef<HTMLSelectElement>(null)
  const isControlled = value !== undefined

  const handleChange = () => {
    const next = selectRef.current?.value
    if (next != null) onChange(next)
  }

  const handleBlur = () => {
    const next = selectRef.current?.value
    if (next != null) {
      onChange(next)
      onBlur(next)
    }
  }

  return (
    <Field className={className}>
      <FieldLabel>{label}</FieldLabel>
      <FieldControl>
        <Select
          ref={selectRef}
          {...(isControlled ? { value } : { defaultValue })}
          onChange={handleChange}
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
