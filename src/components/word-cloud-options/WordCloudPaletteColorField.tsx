import { useRef } from 'react'
import { CloseIcon } from '#/components/icons'
import ColorRow from './ColorRow'
import ColorTextField from './ColorTextField'

export default function WordCloudPaletteColorField({
  defaultValue,
  index,
  canRemove,
  onChange,
  onRemove,
  onBlur,
}: {
  defaultValue: string
  index: number
  canRemove: boolean
  onChange: (value: string) => void
  onRemove: () => void
  onBlur: (value: string) => void
}) {
  const pickerRef = useRef<HTMLInputElement>(null)

  const handlePickerBlur = () => {
    const value = pickerRef.current?.value
    if (value) {
      onChange(value)
      onBlur(value)
    }
  }

  return (
    <ColorRow>
      <input
        ref={pickerRef}
        type="color"
        defaultValue={defaultValue}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handlePickerBlur}
        aria-label={`Word color ${index + 1} picker`}
        className="h-8 w-8 shrink-0 cursor-pointer overflow-visible rounded border-0 bg-transparent p-0"
      />
      <ColorTextField
        defaultValue={defaultValue}
        onChange={(_: string) => {}}
        onBlur={(v) => {onBlur(v); onChange(v)}}
        ariaLabel={`Word color ${index + 1} hex value`}
        placeholder="#000000"
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-sea-ink-soft hover:bg-line/30 hover:text-sea-ink"
          aria-label="Remove color"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </ColorRow>
  )
}
