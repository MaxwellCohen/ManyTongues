import { startTransition, useEffect, useEffectEvent, useState } from "react";
import Accordion from "#/components/shell/Accordion";
import { Field, FieldControl, FieldLabel } from "#/components/ui/field";
import { Slider } from "#/components/ui/slider";
import {
	DEFAULT_WEIGHT,
	WEIGHT_MAX,
	WEIGHT_MIN,
} from "#/features/word-cloud/translateState";
import { useDebounceValue } from "#/hooks/useDebouncedValue";

/** Per-row neon tint for the weight bar (static strings so Tailwind can see them). */
const BAR_TINTS = [
	"[&_[data-slot=slider-range]]:bg-neon-cyan [&_[data-slot=slider-range]]:shadow-[0_0_12px_var(--color-neon-cyan)] [&_[data-slot=slider-thumb]]:border-neon-cyan [&_[data-slot=slider-thumb]]:shadow-[0_0_10px_var(--color-neon-cyan)]",
	"[&_[data-slot=slider-range]]:bg-neon-amber [&_[data-slot=slider-range]]:shadow-[0_0_12px_var(--color-neon-amber)] [&_[data-slot=slider-thumb]]:border-neon-amber [&_[data-slot=slider-thumb]]:shadow-[0_0_10px_var(--color-neon-amber)]",
	"[&_[data-slot=slider-range]]:bg-neon-lime [&_[data-slot=slider-range]]:shadow-[0_0_12px_var(--color-neon-lime)] [&_[data-slot=slider-thumb]]:border-neon-lime [&_[data-slot=slider-thumb]]:shadow-[0_0_10px_var(--color-neon-lime)]",
	"[&_[data-slot=slider-range]]:bg-neon-violet [&_[data-slot=slider-range]]:shadow-[0_0_12px_var(--color-neon-violet)] [&_[data-slot=slider-thumb]]:border-neon-violet [&_[data-slot=slider-thumb]]:shadow-[0_0_10px_var(--color-neon-violet)]",
	"",
] as const;

type TranslationRowProps = {
	lang: string;
	tintIndex: number;
	text: string;
	weight: number;
	onWeightChange: (lang: string, value: number) => void;
	onRemoveLanguage: (lang: string) => void;
	onBlur: () => void;
};

function TranslationRow({
	lang,
	tintIndex,
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
		<li className="border-b border-dashed border-white/[0.08] py-2.5 font-mono last:border-b-0">
			<div className="flex items-center gap-2 text-[13px]">
				<span className="shrink-0 rounded-md border border-white/12 bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-neon-cyan uppercase">
					{lang}
				</span>
				<span className="min-w-0 flex-1 truncate text-sea-ink" title={text}>
					{text}
				</span>
				<span className="shrink-0 tabular-nums text-xs text-muted-ink">
					×{localWeight}
				</span>
				<button
					type="button"
					onClick={() => onRemoveLanguage(lang)}
					className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] text-muted-ink transition-colors hover:bg-neon-pink/10 hover:text-neon-pink focus-visible:outline-2 focus-visible:outline-neon-pink"
				>
					Remove
				</button>
			</div>
			<Field className="mt-2">
				<FieldLabel className="sr-only">Weight for {lang}</FieldLabel>
				<FieldControl>
					<Slider
						min={WEIGHT_MIN}
						max={WEIGHT_MAX}
						value={[localWeight]}
						onValueChange={(value) => {
							const next = Array.isArray(value) ? value[0] : value;
							setLocalWeight(next ?? localWeight);
						}}
						onValueCommitted={() => startTransition(onBlur)}
						className={`w-full ${BAR_TINTS[tintIndex % BAR_TINTS.length]}`}
					/>
				</FieldControl>
			</Field>
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
			<p className="mb-2 font-mono text-xs text-muted-ink">
				{"// drag a bar to resize a translation, or remove it from the cloud."}
			</p>
			<ul>
				{visibleTranslations.map(([lang, text], index) => (
					<TranslationRow
						key={lang}
						lang={lang}
						tintIndex={index}
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
