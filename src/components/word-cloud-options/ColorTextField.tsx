import { Input } from '#/components/ui/input'

export default function ColorTextField({
  value,
  onChange,
  onBlur,
  ariaLabel,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  ariaLabel: string
  placeholder: string
}) {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      aria-label={ariaLabel}
      placeholder={placeholder}
      className="w-20 border-0 bg-transparent px-1 py-0.5 text-xs focus:ring-1"
    />
  )
}
