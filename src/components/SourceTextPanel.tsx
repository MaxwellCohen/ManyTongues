import { useRef } from 'react'
import IslandPanel from '#/components/IslandPanel'
import { Field, FieldControl, FieldLabel } from '#/components/ui/field'
import { Textarea } from '#/components/ui/textarea'

export default function SourceTextPanel({
  defaultValue,
  onBlur,
}: {
  defaultValue: string
  onBlur: (value: string) => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  return (
    <IslandPanel className="space-y-5 rounded-2xl p-5 sm:p-6">
      <Field id="wordcloud-input">
        <FieldLabel className="mb-2 text-sm font-semibold text-sea-ink">
          Source text
        </FieldLabel>
        <FieldControl>
          <Textarea
            ref={textareaRef}
            defaultValue={defaultValue}
            onBlur={() => onBlur(textareaRef.current?.value ?? '')}
            placeholder="Paste text, notes, a transcript, or lyrics..."
            rows={10}
          />
        </FieldControl>
      </Field>
    </IslandPanel>
  )
}
