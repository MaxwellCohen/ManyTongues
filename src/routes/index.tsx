import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="page-wrap py-8 sm:py-12">
      <div className="rise-in mx-auto max-w-2xl space-y-6 text-center">
        <p className="island-kicker">Word Cloud</p>
        <h1 className="display-title text-3xl font-bold tracking-tight text-sea-ink sm:text-4xl">
          Language Word Cloud
        </h1>
        <p className="text-sea-ink-soft">
          Paste or type text and see word size reflect frequency. Customize colors, scale, and layout.
        </p>
        <div className="pt-4">
          <Link to="/generator" className="cta-button">
            Create Word Cloud
          </Link>
        </div>
      </div>
    </main>
  )
}
