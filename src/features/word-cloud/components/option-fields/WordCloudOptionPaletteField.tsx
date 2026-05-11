import { useRef, useState } from 'react'
import { PlusIcon } from '#/components/icons'
import { Field, FieldLabel } from '#/components/ui/field'
import { cn } from '#/lib/cn'
import WordCloudPaletteColorField from './WordCloudPaletteColorField'

export default function WordCloudOptionPaletteField({
  defaultColors,
  onChange,
  onBlur,
  className,
}: {
  defaultColors: string[]
  onChange?: (colors: string[]) => void
  onBlur: (colors: string[]) => void
  className?: string
}) {
  const [localColors, setLocalColors] = useState(defaultColors)
  const colorsRef = useRef(localColors)
  colorsRef.current = localColors

  const notifyChange = (next: string[]) => {
    onChange?.(next)
    onBlur(next)
  }

  const handleBlur = () => onBlur(colorsRef.current)

  return (
    <Field className={cn('sm:col-span-2', className)}>
      <FieldLabel className="mb-2">Word colors</FieldLabel>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {localColors.map((color, i) => (
          <WordCloudPaletteColorField
            key={`${color}-${i}-${localColors.slice(0, i).filter((c) => c === color).length}`}
            defaultValue={color}
            index={i}
            canRemove={localColors.length > 1}
            onChange={(value) => {
              const next = [...localColors]
              next[i] = value
              setLocalColors(next)
              notifyChange(next)
            }}
            onRemove={() => {
              const next = localColors.filter((_, j) => j !== i)
              setLocalColors(next)
              notifyChange(next)
            }}
            onBlur={handleBlur}
          />
        ))}

        <button
          type="button"
          onClick={() => {
            const next = [...localColors, '#6b7280']
            setLocalColors(next)
            notifyChange(next)
          }}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-1.5 text-xs font-medium text-sea-ink-soft hover:border-lagoon hover:text-lagoon"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Add color
        </button>
      </div>
    </Field>
  )
}
