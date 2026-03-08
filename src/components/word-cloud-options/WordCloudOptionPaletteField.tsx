import { PlusIcon } from '#/components/icons'
import { Field, FieldLabel } from '#/components/ui/field'
import { cn } from '#/lib/cn'
import WordCloudPaletteColorField from './WordCloudPaletteColorField'

export default function WordCloudOptionPaletteField({
  colors,
  onChangeColor,
  onRemoveColor,
  onAddColor,
  onBlur,
  className,
}: {
  colors: string[]
  onChangeColor: (index: number, value: string) => void
  onRemoveColor: (index: number) => void
  onAddColor: () => void
  onBlur: () => void
  className?: string
}) {
  return (
    <Field className={cn('sm:col-span-2', className)}>
      <FieldLabel className="mb-2">Word colors</FieldLabel>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {colors.map((color, i) => (
          <WordCloudPaletteColorField
            key={`${color}-${colors.slice(0, i).filter((entry) => entry === color).length}`}
            color={color}
            index={i}
            canRemove={colors.length > 1}
            onChange={(value) => onChangeColor(i, value)}
            onRemove={() => onRemoveColor(i)}
            onBlur={onBlur}
          />
        ))}

        <button
          type="button"
          onClick={onAddColor}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-1.5 text-xs font-medium text-sea-ink-soft hover:border-lagoon hover:text-lagoon"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Add color
        </button>
      </div>
    </Field>
  )
}
