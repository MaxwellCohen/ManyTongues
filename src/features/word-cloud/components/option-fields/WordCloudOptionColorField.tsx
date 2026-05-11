import { useRef } from 'react'
import { Label } from '#/components/ui/label'
import { cn } from '#/lib/cn'
import ColorRow from './ColorRow'
import ColorTextField from './ColorTextField'

export default function WordCloudOptionColorField({
  label,
  defaultValue,
  onChange,
  onBlur,
  className,
}: {
  label: string
  defaultValue: string
  onChange: (value: string) => void
  onBlur: (value: string) => void
  className?: string
}) {
  const colorPickerRef = useRef<HTMLInputElement>(null)

  const handlePickerChange = () => {
    const value = colorPickerRef.current?.value
    if (value) onChange(value)
  }

  const handlePickerBlur = () => {
    const value = colorPickerRef.current?.value
    if (value) {
      onChange(value)
      onBlur(value)
    }
  }

  return (
    <div className={cn('block', className)}>
      <Label className="mb-2 block">{label}</Label>
      <ColorRow>
        <input
          ref={colorPickerRef}
          type="color"
          defaultValue={defaultValue}
          onChange={handlePickerChange}
          onBlur={handlePickerBlur}
          aria-label={`${label} picker`}
          className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <ColorTextField
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          ariaLabel={`${label} hex value`}
          placeholder="#ffffff"
        />
      </ColorRow>
    </div>
  )
}
