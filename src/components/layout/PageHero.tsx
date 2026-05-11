type PageHeroProps = {
  kicker?: string
  title?: string
  description?: string
}

const DEFAULT_HERO = {
  kicker: 'Text Cloud',
  title: 'Build a word cloud from any text',
  description:
    'Paste text, tune the styling, and export a word cloud that highlights the words used most often.',
}

export default function PageHero({
  kicker = DEFAULT_HERO.kicker,
  title = DEFAULT_HERO.title,
  description = DEFAULT_HERO.description,
}: PageHeroProps = {}) {
  return (
    <div className="animate-rise-in mx-auto max-w-2xl space-y-2 text-center">
      <p className="text-eyebrow font-bold uppercase tracking-kicker text-kicker">
        {kicker}
      </p>
      <h1 className="font-display text-3xl font-bold tracking-tight text-sea-ink sm:text-4xl">
        {title}
      </h1>
      <p className="text-sea-ink-soft">{description}</p>
    </div>
  )
}
