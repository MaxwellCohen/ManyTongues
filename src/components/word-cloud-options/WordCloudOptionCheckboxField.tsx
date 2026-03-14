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
  /** When provided, the checkbox is controlled and stays in sync with parent state. */
  checked?: boolean
  defaultChecked: boolean
  onChange: (checked: boolean) => void
  onBlur: (checked: boolean) => void
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isControlled = checked !== undefined

  const handleChange = () => {
    const next = inputRef.current?.checked ?? false
    onChange(next)
  }

  const handleBlur = () => {
    const next = inputRef.current?.checked ?? false
    onChange(next)
    onBlur(next)
  }

  return (
    <label className={cn('flex cursor-pointer items-center gap-2 pt-2', className)}>
      <Checkbox
        ref={inputRef}
        {...(isControlled ? { checked } : { defaultChecked })}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <span className="text-xs font-medium text-sea-ink-soft">{label}</span>
    </label>
  )
}
