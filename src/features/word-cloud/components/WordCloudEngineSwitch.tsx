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
		<div
			role="group"
			aria-label="Word cloud engine"
			className="inline-flex rounded-full border border-chip-line bg-chip-bg p-1 shadow-chip"
		>
			{ENGINES.map(({ value: engine, label }) => (
				<button
					key={engine}
					type="button"
					onClick={() => onChange(engine)}
					aria-pressed={value === engine}
					className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${
						value === engine
							? "bg-lagoon text-white shadow-sm"
							: "text-sea-ink-soft hover:bg-link-bg-hover hover:text-sea-ink"
					}`}
				>
					{label}
				</button>
			))}
		</div>
	);
}
