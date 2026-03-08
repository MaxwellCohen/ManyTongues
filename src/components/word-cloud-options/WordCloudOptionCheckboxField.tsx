import { Checkbox } from '#/components/ui/checkbox'
import { cn } from '#/lib/cn'

export default function WordCloudOptionCheckboxField({
  label,
  checked,
  onChange,
  onBlur,
  className,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  onBlur: () => void
  className?: string
}) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-2 pt-2', className)}>
      <Checkbox
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        onBlur={onBlur}
      />
      <span className="text-xs font-medium text-sea-ink-soft">{label}</span>
    </label>
  )
}
