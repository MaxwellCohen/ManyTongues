import { CloseIcon } from '#/components/icons'
import ColorRow from './ColorRow'
import ColorTextField from './ColorTextField'

export default function WordCloudPaletteColorField({
  color,
  index,
  canRemove,
  onChange,
  onRemove,
  onBlur,
}: {
  color: string
  index: number
  canRemove: boolean
  onChange: (value: string) => void
  onRemove: () => void
  onBlur: () => void
}) {
  return (
    <ColorRow>
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-label={`Word color ${index + 1} picker`}
        className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
      />
      <ColorTextField
        value={color}
        onChange={onChange}
        onBlur={onBlur}
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
