import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="page-wrap py-8 sm:py-12">
      <div className="rise-in mx-auto max-w-2xl space-y-8 text-center">
        <p className="island-kicker">Word Cloud</p>
        <h1 className="display-title text-3xl font-bold tracking-tight text-sea-ink sm:text-4xl">
          Language Word Cloud
        </h1>
        <p className="text-sea-ink-soft text-lg">
          Paste or type text and see word size reflect frequency. Customize colors, scale, and layout. Or enter a phrase and see it translated into many languages as a word cloud.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/generator" className="cta-button">
            Create Word Cloud
          </Link>
          <Link
            to="/translator"
            className="inline-flex items-center justify-center rounded-full border-2 border-lagoon bg-transparent px-5 py-2.5 text-sm font-semibold text-sea-ink no-underline transition-colors hover:bg-lagoon/12 focus:outline-none focus:ring-2 focus:ring-lagoon focus:ring-offset-2 focus:ring-offset-bg-base"
          >
            Translate & Cloud
          </Link>
        </div>
      </div>

      <section className="rise-in mx-auto mt-16 max-w-3xl" aria-label="What you can do">
        <h2 className="sr-only">What you can do</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            to="/generator"
            className="group flex flex-col rounded-2xl border border-line bg-surface p-6 text-left no-underline shadow-[0_8px_24px_rgba(30,90,72,0.06)] transition-shadow hover:shadow-[0_12px_32px_rgba(30,90,72,0.1)]"
          >
            <span className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-lagoon/14 text-lg font-bold text-lagoon-deep">
              Aa
            </span>
            <h3 className="m-0 text-lg font-semibold tracking-tight text-sea-ink group-hover:text-lagoon-deep">
              Word Cloud Generator
            </h3>
            <p className="mt-2 flex-1 text-sm text-sea-ink-soft">
              Paste any text. Words are sized by frequency. Tweak colors, fonts, and layout, then download as an image.
            </p>
            <span className="mt-4 text-sm font-semibold text-lagoon">Go to Generator →</span>
          </Link>

          <Link
            to="/translator"
            className="group flex flex-col rounded-2xl border border-line bg-surface p-6 text-left no-underline shadow-[0_8px_24px_rgba(30,90,72,0.06)] transition-shadow hover:shadow-[0_12px_32px_rgba(30,90,72,0.1)]"
          >
            <span className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-palm/14 text-lg font-bold text-palm">
              ⇄
            </span>
            <h3 className="m-0 text-lg font-semibold tracking-tight text-sea-ink group-hover:text-lagoon-deep">
              Translator
            </h3>
            <p className="mt-2 flex-1 text-sm text-sea-ink-soft">
              Enter a phrase and have it translated into many languages. See the phrase in every language as a word cloud.
            </p>
            <span className="mt-4 text-sm font-semibold text-lagoon">Go to Translator →</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
