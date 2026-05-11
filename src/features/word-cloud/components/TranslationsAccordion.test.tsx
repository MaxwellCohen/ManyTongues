import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('#/components/shell/Accordion', () => ({
  default: ({
    title,
    children,
  }: {
    title: React.ReactNode
    children: React.ReactNode
  }) => (
    <div data-testid="accordion">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}))

vi.mock('#/components/ui/field', () => ({
  Field: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FieldControl: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FieldLabel: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
}))

vi.mock('#/components/ui/slider', () => ({
  Slider: (props: {
    value: number[]
    onValueChange: (value: number[]) => void
    onValueCommitted?: () => void
    min?: number
    max?: number
  }) => (
    <input
      type="range"
      data-testid="range-input"
      value={props.value[0]}
      onChange={(e) =>
        props.onValueChange([Number((e.target as HTMLInputElement).value)])
      }
      onBlur={props.onValueCommitted}
    />
  ),
}))

import TranslationsAccordion from './TranslationsAccordion'

describe('TranslationsAccordion', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders with translations', () => {
    const { container } = render(
      <TranslationsAccordion
        visibleTranslations={[
          ['fr', 'bonjour'],
          ['es', 'hola'],
        ]}
        weights={new Map([
          ['fr', 50],
          ['es', 100],
        ])}
        onWeightChange={vi.fn()}
        onRemoveLanguage={vi.fn()}
        onBlur={vi.fn()}
      />,
    )
    expect(container.textContent).toContain('Translations')
    expect(container.textContent).toContain('bonjour')
    expect(container.textContent).toContain('hola')
  })

  it('calls onRemoveLanguage when Remove clicked', () => {
    const onRemoveLanguage = vi.fn()
    const { container } = render(
      <TranslationsAccordion
        visibleTranslations={[['fr', 'bonjour']]}
        weights={new Map([['fr', 50]])}
        onWeightChange={vi.fn()}
        onRemoveLanguage={onRemoveLanguage}
        onBlur={vi.fn()}
      />,
    )
    const removeButtons = container.querySelectorAll('button')
    const removeButton = Array.from(removeButtons).find(
      (b) => b.textContent?.trim() === 'Remove',
    )
    fireEvent.click(removeButton!)
    expect(onRemoveLanguage).toHaveBeenCalledWith('fr')
  })

  it('calls onWeightChange when weight changes after debounce', () => {
    const onWeightChange = vi.fn()
    const { container } = render(
      <TranslationsAccordion
        visibleTranslations={[['fr', 'bonjour']]}
        weights={new Map([['fr', 50]])}
        onWeightChange={onWeightChange}
        onRemoveLanguage={vi.fn()}
        onBlur={vi.fn()}
      />,
    )
    const rangeInput = container.querySelector('[data-testid="range-input"]')
    fireEvent.change(rangeInput!, { target: { value: '75' } })
    act(() => {
      vi.advanceTimersByTime(150)
    })
    expect(onWeightChange).toHaveBeenCalledWith('fr', 75)
  })
})
