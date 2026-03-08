import { fieldLabelClassName } from '#/components/ui/field'
import { cn } from '#/lib/cn'
import ColorRow from './ColorRow'
import ColorTextField from './ColorTextField'

export default function WordCloudOptionColorField({
  label,
  value,
  onChange,
  onBlur,
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  className?: string
}) {
  return (
    <div className={cn('block', className)}>
      <p className={cn(fieldLabelClassName, 'mb-2')}>{label}</p>
      <ColorRow>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-label={`${label} picker`}
          className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <ColorTextField
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          ariaLabel={`${label} hex value`}
          placeholder="#ffffff"
        />
      </ColorRow>
    </div>
  )
}
