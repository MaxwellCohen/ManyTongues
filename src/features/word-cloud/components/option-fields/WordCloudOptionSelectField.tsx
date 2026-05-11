import {
  Field,
  FieldControl,
  FieldLabel,
} from '#/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

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
  value?: string
  defaultValue: string
  options: ReadonlyArray<SelectOption>
  onChange: (value: string) => void
  onBlur: (value: string) => void
  className?: string
}) {
  const currentValue = value ?? defaultValue

  const handleValueChange = (next: string | null) => {
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
          value={currentValue}
          onValueChange={handleValueChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldControl>
    </Field>
  )
}
