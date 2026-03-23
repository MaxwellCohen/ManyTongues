import { useRef } from 'react'
import { Checkbox } from '#/components/ui/checkbox'
import { cn } from '#/lib/cn'

export default function WordCloudOptionCheckboxField({
  label,
  checked,
  defaultChecked,
  onChange,
  onBlur,
  className,
}: {
  label: string
  checked?: boolean
  defaultChecked: boolean
  onChange: (checked: boolean) => void
  onBlur: (checked: boolean) => void
  className?: string
}) {
  const lastCheckedRef = useRef(checked ?? defaultChecked)

  const handleCheckedChange = (next: boolean) => {
    lastCheckedRef.current = next
    onChange(next)
  }

  const handleBlur = () => {
    onBlur(lastCheckedRef.current)
  }

  return (
    <label
      className={cn('flex cursor-pointer items-center gap-2 pt-2', className)}
      onBlur={handleBlur}
    >
      <Checkbox
        {...(checked !== undefined ? { checked } : { defaultChecked })}
        onCheckedChange={handleCheckedChange}
      />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </label>
  )
}
