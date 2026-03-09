import { useRef } from 'react'
import { Checkbox } from '#/components/ui/checkbox'
import { cn } from '#/lib/cn'

export default function WordCloudOptionCheckboxField({
  label,
  defaultChecked,
  onChange,
  onBlur,
  className,
}: {
  label: string
  defaultChecked: boolean
  onChange: (checked: boolean) => void
  onBlur: (checked: boolean) => void
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleBlur = () => {
    const checked = inputRef.current?.checked ?? false
    onChange(checked)
    onBlur(checked)
  }

  return (
    <label className={cn('flex cursor-pointer items-center gap-2 pt-2', className)}>
      <Checkbox
        ref={inputRef}
        defaultChecked={defaultChecked}
        onBlur={handleBlur}
      />
      <span className="text-xs font-medium text-sea-ink-soft">{label}</span>
    </label>
  )
}
