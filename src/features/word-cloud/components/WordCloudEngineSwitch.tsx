import type { WordCloudEngine } from "#/features/word-cloud/wordCloudEngine";

const ENGINES: { value: WordCloudEngine; label: string }[] = [
	{ value: "experimental", label: "Experimental" },
	{ value: "classic", label: "Classic" },
];

export default function WordCloudEngineSwitch({
	value,
	onChange,
}: {
	value: WordCloudEngine;
	onChange: (engine: WordCloudEngine) => void;
}) {
	return (
		// biome-ignore lint/a11y/useSemanticElements: ARIA toggle-button group; a fieldset would need style resets
		<div
			role="group"
			aria-label="Word cloud engine"
			className="inline-flex rounded-full border border-white/12 bg-white/[0.04] p-1 font-mono"
		>
			{ENGINES.map(({ value: engine, label }) => (
				<button
					key={engine}
					type="button"
					onClick={() => onChange(engine)}
					aria-pressed={value === engine}
					className={`rounded-full px-3.5 py-1.5 text-xs font-bold lowercase tracking-wide transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan ${
						value === engine
							? "bg-neon-cyan text-night shadow-glow-cyan"
							: "text-sea-ink-soft hover:bg-white/[0.06] hover:text-sea-ink"
					}`}
				>
					{label}
				</button>
			))}
		</div>
	);
}
