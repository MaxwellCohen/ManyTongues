import { createFileRoute, Link } from "@tanstack/react-router";
import { TextCloudIcon, TranslateIcon } from "#/components/icons";
import LinkButton from "#/components/layout/LinkButton";

const featureCards = [
	{
		to: "/text-cloud" as const,
		Icon: TextCloudIcon,
		accent: "cyan" as const,
		tag: "01 / text_cloud",
		title: "Text to Word Cloud",
		description:
			"Paste in an article, transcript, notes, or lyrics. The most-used words rise to the top, and you can fine-tune the style before downloading.",
		ctaLabel: "open text_cloud →",
		sample: [
			{ word: "signal", className: "text-2xl text-glow-cyan" },
			{ word: "noise", className: "text-base text-glow-violet" },
			{ word: "words", className: "text-xl text-glow-lime" },
		],
	},
	{
		to: "/translate" as const,
		Icon: TranslateIcon,
		accent: "pink" as const,
		tag: "02 / translate",
		title: "Phrase Translator",
		description:
			"Translate one short phrase into multiple languages, then explore the translated versions together in a single word cloud.",
		ctaLabel: "open translate →",
		sample: [
			{ word: "愛してる", className: "text-2xl text-glow-pink", lang: "ja" },
			{ word: "Je t'aime", className: "text-base text-glow-amber", lang: "fr" },
			{ word: "사랑해", className: "text-xl text-glow-cyan", lang: "ko" },
		],
	},
];

const accentClassNames = {
	cyan: {
		card: "border-neon-cyan/35 hover:border-neon-cyan hover:shadow-glow-cyan",
		tag: "text-neon-cyan",
		cta: "text-neon-cyan",
		icon: "bg-neon-cyan/12 text-neon-cyan shadow-[0_0_14px_#6CCFDD44]",
	},
	pink: {
		card: "border-neon-pink/35 hover:border-neon-pink hover:shadow-glow-pink",
		tag: "text-neon-pink",
		cta: "text-neon-pink",
		icon: "bg-neon-pink/12 text-neon-pink shadow-[0_0_14px_#E879A844]",
	},
};

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{
				title: "ManyTongues",
			},
			{
				name: "description",
				content:
					"Create word clouds from text or translate a short phrase into many languages and compare results visually.",
			},
			{
				property: "og:title",
				content: "ManyTongues",
			},
			{
				property: "og:description",
				content:
					"Create word clouds from text or translate a short phrase into many languages and compare results visually.",
			},
		],
	}),
	component: HomePage,
});

type FeatureCardProps = (typeof featureCards)[number];

function HomePage() {
	return (
		<div className="mx-auto w-[min(1180px,100%)]">
			<section className="animate-rise-in flex flex-col gap-8 pt-4 sm:pt-10 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
				<h1 className="m-0 font-display text-[clamp(3rem,9vw,8rem)] leading-[0.9] font-black tracking-[-0.04em]">
					<span className="text-outline-cyan">Say it</span>
					<br />
					<span className="text-glow-pink">everywhere.</span>
					<span className="sr-only"> ManyTongues</span>
				</h1>
				<div className="max-w-sm space-y-6 lg:pb-3">
					<p className="m-0 font-mono text-sm leading-relaxed text-sea-ink-soft">
						{"// turn any text into a glowing word cloud"}
						<br />
						{"// or one phrase in → many languages out"}
						<br />
						{"// tune it, compare it, download it"}
					</p>
					<div className="flex flex-wrap items-center gap-3">
						<LinkButton to="/text-cloud" tone="primary">
							Open Text Cloud
						</LinkButton>
						<LinkButton to="/translate" tone="secondary">
							translate_a_phrase
						</LinkButton>
					</div>
				</div>
			</section>

			<section
				className="animate-rise-in mt-16 sm:mt-24"
				aria-label="What you can do"
			>
				<h2 className="sr-only">What you can do</h2>
				<div className="grid gap-5 md:grid-cols-2">
					{featureCards.map((featureCard) => (
						<FeatureCard key={featureCard.to} {...featureCard} />
					))}
				</div>
			</section>
		</div>
	);
}

function FeatureCard({
	to,
	Icon,
	accent,
	tag,
	title,
	description,
	ctaLabel,
	sample,
}: FeatureCardProps) {
	const accentClassName = accentClassNames[accent];

	return (
		<Link
			to={to}
			className={`group relative flex flex-col overflow-hidden rounded-[28px] border bg-panel p-6 text-left no-underline shadow-[inset_0_0_120px_#9A88E622] transition-[border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan sm:p-8 ${accentClassName.card}`}
		>
			<div className="flex items-center justify-between gap-3">
				<Icon className={`mb-0 ${accentClassName.icon}`} />
				<span className={`font-mono text-xs ${accentClassName.tag}`}>
					{tag}
				</span>
			</div>
			<div
				aria-hidden="true"
				className="my-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-display leading-none font-black"
			>
				{sample.map((item) => (
					<span key={item.word} className={item.className}>
						{item.word}
					</span>
				))}
			</div>
			<h3 className="m-0 font-display text-xl font-extrabold tracking-tight text-sea-ink">
				{title}
			</h3>
			<p className="mt-2 flex-1 font-mono text-sm leading-relaxed text-sea-ink-soft">
				{description}
			</p>
			<span
				className={`mt-5 font-mono text-sm font-bold transition-transform group-hover:translate-x-1 ${accentClassName.cta}`}
			>
				{ctaLabel}
			</span>
		</Link>
	);
}
