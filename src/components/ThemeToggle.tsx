import { useEffect, useState } from 'react'

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
  light: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-4"
      aria-hidden
    >
      <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.657a.75.75 0 0 1 1.061 0l1.061 1.06a.75.75 0 0 1-1.06 1.061l-1.06-1.06a.75.75 0 0 1 0-1.061ZM18.894 10.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75ZM15.657 14.343a.75.75 0 0 1 1.061 0l1.061 1.06a.75.75 0 0 1-1.06 1.061l-1.06-1.06a.75.75 0 0 1 0-1.061ZM10 18.894a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75ZM4.343 14.343a.75.75 0 0 1 0-1.061L3.282 12.22a.75.75 0 0 1 1.06-1.061l1.061 1.06a.75.75 0 0 1 0 1.061ZM1.106 10.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM4.343 5.657a.75.75 0 0 1 0-1.061L3.282 3.636a.75.75 0 0 1 1.06-1.061l1.061 1.06a.75.75 0 0 1 0 1.061Z" />
    </svg>
  ),
  dark: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-4"
      aria-hidden
    >
      <path d="M9.653 16.915a.75.75 0 0 0 1.194-.91A6.97 6.97 0 0 1 8 14a6.969 6.969 0 0 1-2.847-.605.75.75 0 0 0 1.194.91 5.47 5.47 0 0 0 2.653 1.525ZM3.415 12.735a.75.75 0 0 0-1.45-.388 5.475 5.475 0 0 0 2.346 3.436.75.75 0 0 0 .75-1.299 3.973 3.973 0 0 1-1.646-1.749ZM16.585 7.265a.75.75 0 0 0 1.45.388 5.475 5.475 0 0 0-2.346-3.436.75.75 0 0 0-.75 1.299 3.973 3.973 0 0 1 1.646 1.749ZM12.224 3.053a.75.75 0 0 0 1.414 0 6.969 6.969 0 0 1 2.847 2.605.75.75 0 1 0 1.194-.91A8.469 8.469 0 0 0 8 2.25a8.47 8.47 0 0 0-6.675 3.448.75.75 0 0 0 1.194.91A6.969 6.969 0 0 1 8 3.75a6.97 6.97 0 0 1 4.224-1.697ZM8 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
    </svg>
  ),
  auto: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-4"
      aria-hidden
    >
      <path d="M4 4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm0 2h12v8H4V6Zm2 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-4 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
    </svg>
  ),
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('auto')

  useEffect(() => {
    const initialMode = getInitialMode()
    setMode(initialMode)
    applyThemeMode(initialMode)
  }, [])

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
      className="inline-flex rounded-full border border-chip-line bg-chip-bg p-1 shadow-[0_4px_12px_rgba(30,90,72,0.06)]"
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
