import { Link } from '@tanstack/react-router'
import NavLink from './NavLink'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-header-bg px-4 backdrop-blur-lg">
      <nav className="mx-auto flex w-[min(1080px,calc(100%-2rem))] flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3 sm:py-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 className="m-0 shrink-0 text-base font-semibold tracking-tight">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-chip-line bg-chip-bg px-3 py-1.5 text-sm text-sea-ink no-underline shadow-chip sm:px-4 sm:py-2"
            >
              <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
              ManyTongues
            </Link>
          </h2>

          <div className="flex items-center gap-x-4 gap-y-1 text-sm font-semibold">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/text-cloud">Text Cloud</NavLink>
            <NavLink to="/translate">Translate</NavLink>
            <NavLink to="/words">Words</NavLink>
            <NavLink to="/translation">Translation</NavLink>
          </div>
        </div>

        <ThemeToggle />
      </nav>
    </header>
  )
}
