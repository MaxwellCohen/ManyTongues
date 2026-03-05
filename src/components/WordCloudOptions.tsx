import {
  SCALE_OPTIONS,
  inputClass,
  labelClass,
  type ScaleType,
} from '#/lib/wordCloudUtils'

type Props = {
  maxWords: number
  onMaxWordsChange: (v: number) => void
  padding: number
  onPaddingChange: (v: number) => void
  minFontSize: number
  onMinFontSizeChange: (v: number) => void
  maxFontSize: number
  onMaxFontSizeChange: (v: number) => void
  scale: ScaleType
  onScaleChange: (v: ScaleType) => void
  backgroundColor: string
  onBackgroundColorChange: (v: string) => void
  colors: string[]
  onColorsChange: (v: string[]) => void
  onBlur?: () => void
}

export default function WordCloudOptions({
  maxWords,
  onMaxWordsChange,
  padding,
  onPaddingChange,
  minFontSize,
  onMinFontSizeChange,
  maxFontSize,
  onMaxFontSizeChange,
  scale,
  onScaleChange,
  backgroundColor,
  onBackgroundColorChange,
  colors,
  onColorsChange,
  onBlur,
}: Props) {
  return (
    <div onBlur={onBlur}>
      <h3 className="mb-3 text-sm font-semibold text-sea-ink">
        Word cloud options
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Max words</span>
          <input
            type="number"
            min={5}
            max={200}
            value={maxWords}
            onChange={(e) =>
              onMaxWordsChange(
                Math.min(200, Math.max(5, Number(e.target.value) || 80)),
              )
            }
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Padding</span>
          <input
            type="number"
            min={0}
            max={20}
            value={padding}
            onChange={(e) =>
              onPaddingChange(
                Math.min(20, Math.max(0, Number(e.target.value) || 2)),
              )
            }
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Min font size</span>
          <input
            type="number"
            min={4}
            max={48}
            value={minFontSize}
            onChange={(e) =>
              onMinFontSizeChange(
                Math.min(48, Math.max(4, Number(e.target.value) || 14)),
              )
            }
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Max font size</span>
          <input
            type="number"
            min={12}
            max={120}
            value={maxFontSize}
            onChange={(e) =>
              onMaxFontSizeChange(
                Math.min(120, Math.max(12, Number(e.target.value) || 72)),
              )
            }
            className={inputClass}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Scale</span>
          <select
            value={scale}
            onChange={(e) => onScaleChange(e.target.value as ScaleType)}
            className={inputClass}
          >
            {SCALE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <div className="block sm:col-span-2">
          <span className="mb-2 block text-xs font-medium text-sea-ink-soft">
            Background color
          </span>
          <label className="flex items-center gap-2 rounded-lg border border-line bg-foam px-2 py-1.5">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              placeholder="#ffffff"
              className="w-20 rounded border-0 bg-transparent px-1 py-0.5 text-xs text-sea-ink focus:outline-none focus:ring-1 focus:ring-lagoon"
            />
          </label>
        </div>
        <div className="block sm:col-span-2">
          <span className="mb-2 block text-xs font-medium text-sea-ink-soft">
            Foreground colors (words)
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {colors.map((color, i) => (
              <div
                key={i}
                className="flex items-center gap-1 rounded-lg border border-line bg-foam px-2 py-1.5"
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const next = [...colors]
                    next[i] = e.target.value
                    onColorsChange(next)
                  }}
                  className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    const next = [...colors]
                    next[i] = e.target.value
                    onColorsChange(next)
                  }}
                  placeholder="#000000"
                  className="w-20 rounded border-0 bg-transparent px-1 py-0.5 text-xs text-sea-ink focus:outline-none focus:ring-1 focus:ring-lagoon"
                />
                {colors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onColorsChange(colors.filter((_, j) => j !== i))}
                    className="rounded p-1 text-sea-ink-soft hover:bg-line/30 hover:text-sea-ink"
                    aria-label="Remove color"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => onColorsChange([...colors, '#6b7280'])}
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-1.5 text-xs font-medium text-sea-ink-soft hover:border-lagoon hover:text-lagoon"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Add color
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
