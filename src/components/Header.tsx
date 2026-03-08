import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-header-bg px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3 sm:py-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 className="m-0 shrink-0 text-base font-semibold tracking-tight">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-chip-line bg-chip-bg px-3 py-1.5 text-sm text-sea-ink no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
            >
              <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
              ManyTongues
            </Link>
          </h2>

          <div className="flex items-center gap-x-4 gap-y-1 text-sm font-semibold">
            <Link
              to="/"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Home
            </Link>
            <Link
              to="/text-cloud"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Text Cloud
            </Link>
            <Link
              to="/translate"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Translate
            </Link>
          </div>
        </div>

        <ThemeToggle />
      </nav>
    </header>
  )
}
