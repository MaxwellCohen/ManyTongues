import { useEffect, useState } from 'react'
import {
  ThemeDarkIcon,
  ThemeLightIcon,
  ThemeSystemIcon,
} from '#/components/icons'

type ThemeMode = 'light' | 'dark' | 'auto'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'auto'
  }

  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored
  }

  return 'auto'
}

function applyThemeMode(mode: ThemeMode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode

  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(resolved)

  if (mode === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', mode)
  }

  document.documentElement.style.colorScheme = resolved
}

const icons = {
  light: <ThemeLightIcon className="size-4" />,
  dark: <ThemeDarkIcon className="size-4" />,
  auto: <ThemeSystemIcon className="size-4" />,
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => getInitialMode())

  useEffect(() => {
    applyThemeMode(mode)
  }, [mode])

  useEffect(() => {
    if (mode !== 'auto') {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyThemeMode('auto')

    media.addEventListener('change', onChange)
    return () => {
      media.removeEventListener('change', onChange)
    }
  }, [mode])

  function selectMode(newMode: ThemeMode) {
    setMode(newMode)
    applyThemeMode(newMode)
    window.localStorage.setItem('theme', newMode)
  }

  const modes: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'auto', label: 'System' },
    { value: 'dark', label: 'Dark' },
  ]

  return (
    <div
      role="group"
      aria-label="Theme"
      className="inline-flex rounded-full border border-chip-line bg-chip-bg p-1 shadow-theme-toggle"
    >
      {modes.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => selectMode(value)}
          aria-label={`${label} theme`}
          aria-pressed={mode === value}
          title={label}
          className={`rounded-full p-2 transition-all duration-200 ${
            mode === value
              ? 'bg-lagoon text-white shadow-sm'
              : 'text-sea-ink-soft hover:bg-link-bg-hover hover:text-sea-ink'
          }`}
        >
          {icons[value]}
        </button>
      ))}
    </div>
  )
}
