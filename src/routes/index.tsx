import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: 'ManyTongues',
      },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <main className="page-wrap py-8 sm:py-12">
      <div className="rise-in mx-auto max-w-2xl space-y-8 text-center">
        <p className="island-kicker">Text Visualization</p>
        <h1 className="display-title text-3xl font-bold tracking-tight text-sea-ink sm:text-4xl">
          Turn text into clear, customizable word clouds
        </h1>
        <p className="text-sea-ink-soft text-lg">
          Create a word cloud from any block of text, or translate a short phrase
          into multiple languages and compare the results in one visual.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/text-cloud" className="cta-button">
            Open Text Cloud
          </Link>
          <Link
            to="/translate"
            className="inline-flex items-center justify-center rounded-full border-2 border-lagoon bg-transparent px-5 py-2.5 text-sm font-semibold text-sea-ink no-underline transition-colors hover:bg-lagoon/12 focus:outline-none focus:ring-2 focus:ring-lagoon focus:ring-offset-2 focus:ring-offset-bg-base"
          >
            Translate a Phrase
          </Link>
        </div>
      </div>

      <section className="rise-in mx-auto mt-16 max-w-3xl" aria-label="What you can do">
        <h2 className="sr-only">What you can do</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            to="/text-cloud"
            className="group flex flex-col rounded-2xl border border-line bg-surface p-6 text-left no-underline shadow-[0_8px_24px_rgba(30,90,72,0.06)] transition-shadow hover:shadow-[0_12px_32px_rgba(30,90,72,0.1)]"
          >
            <span className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-lagoon/14 text-lg font-bold text-lagoon-deep">
              Aa
            </span>
            <h3 className="m-0 text-lg font-semibold tracking-tight text-sea-ink group-hover:text-lagoon-deep">
              Text to Word Cloud
            </h3>
            <p className="mt-2 flex-1 text-sm text-sea-ink-soft">
              Paste in an article, transcript, notes, or lyrics. The most-used words
              rise to the top, and you can fine-tune the style before downloading.
            </p>
            <span className="mt-4 text-sm font-semibold text-lagoon">Open Text Cloud →</span>
          </Link>

          <Link
            to="/translate"
            className="group flex flex-col rounded-2xl border border-line bg-surface p-6 text-left no-underline shadow-[0_8px_24px_rgba(30,90,72,0.06)] transition-shadow hover:shadow-[0_12px_32px_rgba(30,90,72,0.1)]"
          >
            <span className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-palm/14 text-lg font-bold text-palm">
              ⇄
            </span>
            <h3 className="m-0 text-lg font-semibold tracking-tight text-sea-ink group-hover:text-lagoon-deep">
              Phrase Translator
            </h3>
            <p className="mt-2 flex-1 text-sm text-sea-ink-soft">
              Translate one short phrase into multiple languages, then explore the
              translated versions together in a single word cloud.
            </p>
            <span className="mt-4 text-sm font-semibold text-lagoon">Open Translator →</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
