import { createFileRoute, Link } from '@tanstack/react-router'
import { TextCloudIcon, TranslateIcon } from '#/components/icons'
import LinkButton from '#/components/LinkButton'

const featureCards = [
  {
    to: '/text-cloud' as const,
    Icon: TextCloudIcon,
    title: 'Text to Word Cloud',
    description:
      'Paste in an article, transcript, notes, or lyrics. The most-used words rise to the top, and you can fine-tune the style before downloading.',
    ctaLabel: 'Open Text Cloud →',
  },
  {
    to: '/translate' as const,
    Icon: TranslateIcon,
    title: 'Phrase Translator',
    description:
      'Translate one short phrase into multiple languages, then explore the translated versions together in a single word cloud.',
    ctaLabel: 'Open Translator →',
  },
  {
    to: '/words' as const,
    Icon: TextCloudIcon,
    title: 'Words (experimental)',
    description:
      'Alternate text cloud using wordcloud2.js. Prefer Text Cloud for the default experience.',
    ctaLabel: 'Open Words (exp) →',
  },
  {
    to: '/translation' as const,
    Icon: TranslateIcon,
    title: 'Translation (experimental)',
    description:
      'Alternate translator word cloud using wordcloud2.js. Prefer Translate for the default experience.',
    ctaLabel: 'Open Translation (exp) →',
  },
]

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: 'ManyTongues',
      },
      {
        name: 'description',
        content:
          'Create word clouds from text or translate a short phrase into many languages and compare results visually.',
      },
      {
        property: 'og:title',
        content: 'ManyTongues',
      },
      {
        property: 'og:description',
        content:
          'Create word clouds from text or translate a short phrase into many languages and compare results visually.',
      },
    ],
  }),
  component: HomePage,
})

type FeatureCardProps = (typeof featureCards)[number]

function HomePage() {
  return (
    <>
      <div className="animate-rise-in mx-auto max-w-2xl space-y-8 text-center">
        <p className="text-eyebrow font-bold uppercase tracking-kicker text-kicker">
          Text Visualization
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-sea-ink sm:text-4xl">
          Turn text into clear, customizable word clouds
        </h1>
        <p className="text-sea-ink-soft text-lg">
          Create a word cloud from any block of text, or translate a short phrase
          into multiple languages and compare the results in one visual.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <LinkButton to="/text-cloud" tone="primary">
            Open Text Cloud
          </LinkButton>
          <LinkButton to="/translate" tone="secondary">
            Translate a Phrase
          </LinkButton>
        </div>
      </div>

      <section className="animate-rise-in mx-auto mt-16 max-w-3xl" aria-label="What you can do">
        <h2 className="sr-only">What you can do</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {featureCards.map((featureCard) => (
            <FeatureCard key={featureCard.to} {...featureCard} />
          ))}
        </div>
      </section>
    </>
  )
}

function FeatureCard({
  to,
  Icon,
  title,
  description,
  ctaLabel,
}: FeatureCardProps) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-2xl border border-line bg-surface p-6 text-left no-underline shadow-card transition-shadow hover:shadow-card-hover"
    >
      <Icon />
      <h3 className="m-0 text-lg font-semibold tracking-tight text-sea-ink group-hover:text-lagoon-deep">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-sea-ink-soft">{description}</p>
      <span className="mt-4 text-sm font-semibold text-lagoon">{ctaLabel}</span>
    </Link>
  )
}
