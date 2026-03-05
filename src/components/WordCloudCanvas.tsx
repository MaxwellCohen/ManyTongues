import { useCallback, useRef } from 'react'
import type { CloudWord } from '#/lib/wordCloudUtils'
import { DEFAULT_BG } from '#/lib/wordCloudUtils'

type Props = {
  laidOutWords: CloudWord[]
  palette: string[]
  backgroundColor: string
  mounted: boolean
  hasWords: boolean
  tooltip: string | null
  onWordMouseOver: (word: CloudWord) => void
  onWordMouseOut: () => void
}

export default function WordCloudCanvas({
  laidOutWords,
  palette,
  backgroundColor,
  mounted,
  hasWords,
  tooltip,
  onWordMouseOver,
  onWordMouseOut,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  const handleDownload = useCallback(() => {
    const svg = svgRef.current
    if (!svg || !hasWords) return

    const width = 640
    const height = 360
    const scale = 2
    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bg = /^#[0-9A-Fa-f]{6}$/.test(backgroundColor)
      ? backgroundColor
      : DEFAULT_BG
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const svgString = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      const dataUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'word-cloud.png'
      a.click()
    }
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }, [hasWords, backgroundColor])

  return (
    <section className="island-shell flex min-h-80 flex-col rounded-2xl p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-sea-ink">Cloud</h2>
        {mounted && hasWords && (
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-lg border border-line bg-foam px-3 py-2 text-sm font-medium text-sea-ink hover:border-lagoon hover:bg-lagoon/10 hover:text-lagoon"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Download
          </button>
        )}
      </div>
      <div
        className="relative flex-1 min-h-70 rounded-xl border border-line flex items-center justify-center"
        style={{
          backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(backgroundColor)
            ? backgroundColor
            : DEFAULT_BG,
        }}
      >
        {!mounted ? (
          <p className="text-sm text-sea-ink-soft">Loading cloud…</p>
        ) : hasWords ? (
          <div
            className="relative h-full w-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full"
            style={{ minWidth: 300, minHeight: 300 }}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 640 360"
              preserveAspectRatio="xMidYMid meet"
              className="max-h-full max-w-full"
            >
              <g transform="translate(320, 180)">
                {laidOutWords.map((word, i) => (
                  <text
                    key={`${word.text}-${i}`}
                    transform={`translate(${word.x ?? 0},${word.y ?? 0}) rotate(${word.rotate ?? 0})`}
                    textAnchor="middle"
                    style={{
                      fontFamily:
                        'Manrope, ui-sans-serif, system-ui, sans-serif',
                      fontSize: `${word.size ?? 14}px`,
                      fill: palette[i % palette.length] ?? palette[0],
                    }}
                    onMouseOver={() => onWordMouseOver(word)}
                    onMouseOut={onWordMouseOut}
                    className="cursor-default"
                  >
                    {word.text}
                  </text>
                ))}
              </g>
            </svg>
            {tooltip && (
              <div
                className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-sea-ink px-2 py-1 text-xs text-white shadow"
                role="tooltip"
              >
                {tooltip}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-sea-ink-soft">
            Add some text to generate a word cloud.
          </p>
        )}
      </div>
    </section>
  )
}
