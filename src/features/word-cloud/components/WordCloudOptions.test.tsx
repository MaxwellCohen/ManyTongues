import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('#/features/word-cloud/components/option-fields/WordCloudOptionNumberField', () => ({
  default: ({
    label,
    defaultValue,
    onChange,
    onBlur,
  }: {
    label: string
    defaultValue: number
    onChange: (v: number) => void
    onBlur: (v: number) => void
  }) => (
    <div data-testid={`number-${label}`}>
      <span>{label}: {defaultValue}</span>
      <button
        type="button"
        onClick={() => onChange(defaultValue + 1)}
        onBlur={() => onBlur(defaultValue + 1)}
      >
        Change
      </button>
    </div>
  ),
}))

vi.mock('#/features/word-cloud/components/option-fields/WordCloudOptionSelectField', () => ({
  default: ({
    label,
    defaultValue,
    options,
    onChange,
  }: {
    label: string
    defaultValue: string
    options: { value: string; label: string }[]
    onChange: (v: string) => void
  }) => (
    <div data-testid={`select-${label}`}>
      <select
        value={defaultValue}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  ),
}))

vi.mock('#/features/word-cloud/components/option-fields/WordCloudOptionCheckboxField', () => ({
  default: ({
    label,
    defaultChecked,
    onChange,
  }: {
    label: string
    defaultChecked: boolean
    onChange: (v: boolean) => void
  }) => (
    <div data-testid={`checkbox-${label}`}>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  ),
}))

vi.mock('#/features/word-cloud/components/option-fields/WordCloudOptionColorField', () => ({
  default: ({ label }: { label: string }) => (
    <div data-testid={`color-${label}`}>{label}</div>
  ),
}))

vi.mock('#/features/word-cloud/components/option-fields/WordCloudOptionPaletteField', () => ({
  default: ({
    defaultColors,
    onBlur,
  }: {
    defaultColors: string[]
    onBlur: (colors: string[]) => void
  }) => (
    <div data-testid="palette">
      <button type="button" onClick={() => onBlur(defaultColors)}>
        Blur
      </button>
    </div>
  ),
}))

import WordCloudOptions from './WordCloudOptions'

const defaultFormState = {
  padding: 1,
  minFontSize: 14,
  maxFontSize: 72,
  scale: 'sqrt' as const,
  spiral: 'archimedean' as const,
  rotationMin: -90,
  rotationMax: 90,
  rotations: 3,
  deterministic: true,
  fontFamily: 'system-ui',
  backgroundColor: '#e8f4f0',
  colors: ['#173a40', '#328f97'],
}

describe('WordCloudOptions', () => {
  it('renders with form state', () => {
    const onUpdateSearch = vi.fn()
    const { container } = render(
      <WordCloudOptions
        formState={defaultFormState}
        onUpdateSearch={onUpdateSearch}
      />,
    )
    expect(container.textContent).toContain('Padding')
    expect(container.textContent).toContain('1')
  })

  it('calls onUpdateSearch when field changes', () => {
    const onUpdateSearch = vi.fn()
    const { container } = render(
      <WordCloudOptions
        formState={defaultFormState}
        onUpdateSearch={onUpdateSearch}
      />,
    )
    const changeButton = container.querySelector(
      '[data-testid="number-Padding"] button',
    )
    fireEvent.click(changeButton!)
    expect(onUpdateSearch).toHaveBeenCalledWith({ padding: 2 })
  })

  it('calls onUpdateSearch when scale select changes', () => {
    const onUpdateSearch = vi.fn()
    const { container } = render(
      <WordCloudOptions
        formState={defaultFormState}
        onUpdateSearch={onUpdateSearch}
      />,
    )
    const scaleSelect = container.querySelector(
      '[data-testid="select-Scale"] select',
    )
    fireEvent.change(scaleSelect!, { target: { value: 'log' } })
    expect(onUpdateSearch).toHaveBeenCalledWith({ scale: 'log' })
  })

  it('calls onUpdateSearch when font family changes', () => {
    const onUpdateSearch = vi.fn()
    const { container } = render(
      <WordCloudOptions
        formState={defaultFormState}
        onUpdateSearch={onUpdateSearch}
      />,
    )
    const fontSelect = container.querySelector(
      '[data-testid="select-Font family"] select',
    )
    fireEvent.change(fontSelect!, { target: { value: 'Georgia' } })
    expect(onUpdateSearch).toHaveBeenCalledWith({ fontFamily: 'Georgia' })
  })
})
