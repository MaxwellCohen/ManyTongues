import Accordion from "#/components/Accordion";
import {
  Field,
  FieldControl,
  FieldLabel,
} from "#/components/ui/field";
import { Slider } from "#/components/ui/slider";
import {
  DEFAULT_WEIGHT,
  WEIGHT_MAX,
  WEIGHT_MIN,
} from "#/features/word-cloud/translateState";
import { startTransition, useEffect, useEffectEvent, useState } from "react";
import { useDebounceValue } from "#/hooks/useDebouncedValue";

type TranslationRowProps = {
  lang: string;
  text: string;
  weight: number;
  onWeightChange: (lang: string, value: number) => void;
  onRemoveLanguage: (lang: string) => void;
  onBlur: () => void;
};

function TranslationRow({
  lang,
  text,
  weight,
  onWeightChange,
  onRemoveLanguage,
  onBlur,
}: TranslationRowProps) {
  const [localWeight, setLocalWeight] = useState(weight);
  const debouncedWeight = useDebounceValue(localWeight, 150);
  const weightChangeEvent = useEffectEvent((weight: number) => {
    onWeightChange(lang, weight);
  });


  // Only push to parent when the user's debounced value changes. Omitting `weight`
  // from deps avoids a loop: parent update → new weight prop → effect runs → push → parent update…
  useEffect(() => {
    if (debouncedWeight !== weight) {
      weightChangeEvent(debouncedWeight);
    }
  }, [debouncedWeight]);

  return (
    <li className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-foam p-3">
      <span className="min-w-10 rounded bg-line/30 px-2 py-0.5 font-mono text-xs font-medium text-sea-ink">
        {lang}
      </span>
      <span
        className="min-w-0 flex-1 truncate text-sm text-sea-ink"
        title={text}
      >
        {text}
      </span>
      <Field className="flex items-center gap-1.5">
        <FieldLabel className="sr-only">Weight for {lang}</FieldLabel>
        <FieldControl>
          <Slider
            min={WEIGHT_MIN}
            max={WEIGHT_MAX}
            value={[localWeight]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value
              setLocalWeight(next ?? localWeight)
            }}
            onValueCommitted={() => startTransition(onBlur)}
            className="w-24"
          />
        </FieldControl>
        <span className="w-8 tabular-nums text-sm text-sea-ink">{localWeight}</span>
      </Field>
      <button
        type="button"
        onClick={() => onRemoveLanguage(lang)}
        className="rounded-lg border border-line px-2 py-1.5 text-xs font-medium text-sea-ink hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-600"
      >
        Remove
      </button>
    </li>
  );
}

type TranslationsAccordionProps = {
  visibleTranslations: [string, string][];
  weights: Map<string, number>;
  onWeightChange: (lang: string, value: number) => void;
  onRemoveLanguage: (lang: string) => void;
  onBlur: () => void;
  /** Open by default when there are translations (e.g. after first translate). */
  defaultOpen?: boolean;
};

export default function TranslationsAccordion({
  visibleTranslations,
  weights,
  onWeightChange,
  onRemoveLanguage,
  onBlur,
  defaultOpen = false,
}: TranslationsAccordionProps) {
  return (
    <Accordion title="Translations" defaultOpen={defaultOpen}>
      <p className="mb-3 text-sm text-sea-ink-soft">
        Remove languages or adjust the weight to control how large each
        translation appears in the cloud.
      </p>
      <ul className="space-y-3">
        {visibleTranslations.map(([lang, text]) => (
          <TranslationRow
            key={lang}
            lang={lang}
            text={text}
            weight={weights.get(lang) ?? DEFAULT_WEIGHT}
            onWeightChange={onWeightChange}
            onRemoveLanguage={onRemoveLanguage}
            onBlur={onBlur}
          />
        ))}
      </ul>
    </Accordion>
  );
}
