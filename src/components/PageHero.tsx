type PageHeroProps = {
  kicker?: string
  title?: string
  description?: string
}

const DEFAULT_HERO = {
  kicker: 'Word Cloud',
  title: 'Word Cloud Generator',
  description: 'Paste or type text below. Word size reflects frequency.',
}

export default function PageHero({
  kicker = DEFAULT_HERO.kicker,
  title = DEFAULT_HERO.title,
  description = DEFAULT_HERO.description,
}: PageHeroProps = {}) {
  return (
    <div className="rise-in mx-auto max-w-2xl space-y-2 text-center">
      <p className="island-kicker">{kicker}</p>
      <h1 className="display-title text-3xl font-bold tracking-tight text-sea-ink sm:text-4xl">
        {title}
      </h1>
      <p className="text-sea-ink-soft">{description}</p>
    </div>
  )
}
