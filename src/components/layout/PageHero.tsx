type PageHeroProps = {
	kicker?: string;
	title?: string;
	description?: string;
};

const DEFAULT_HERO = {
	kicker: "Text Cloud",
	title: "Build a word cloud from any text",
	description:
		"Paste text, tune the styling, and export a word cloud that highlights the words used most often.",
};

export default function PageHero({
	kicker = DEFAULT_HERO.kicker,
	title = DEFAULT_HERO.title,
	description = DEFAULT_HERO.description,
}: PageHeroProps = {}) {
	return (
		<div className="animate-rise-in mx-auto max-w-3xl space-y-3 text-center">
			<p className="font-mono text-eyebrow font-bold lowercase tracking-kicker text-neon-lime">
				{`// ${kicker}`}
			</p>
			<h1 className="font-display text-3xl leading-[0.95] font-black tracking-[-0.04em] text-sea-ink sm:text-5xl">
				{title}
			</h1>
			<p className="mx-auto max-w-xl font-mono text-sm leading-relaxed text-sea-ink-soft">
				{description}
			</p>
		</div>
	);
}
