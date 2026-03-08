import IslandPanel from '#/components/IslandPanel'
import { Field, FieldControl, FieldLabel } from '#/components/ui/field'
import { Textarea } from '#/components/ui/textarea'

export default function SourceTextPanel({
  value,
  onChange,
  onBlur,
}: {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
}) {
  return (
    <IslandPanel className="space-y-5 rounded-2xl p-5 sm:p-6">
      <Field id="wordcloud-input">
        <FieldLabel className="mb-2 text-sm font-semibold text-sea-ink">
          Source text
        </FieldLabel>
        <FieldControl>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder="Paste text, notes, a transcript, or lyrics..."
            rows={10}
          />
        </FieldControl>
      </Field>
    </IslandPanel>
  )
}
