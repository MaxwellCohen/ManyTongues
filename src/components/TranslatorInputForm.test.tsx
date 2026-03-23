import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('#/components/ui/field', () => ({
  Field: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <div data-testid="field" id={id}>
      {children}
    </div>
  ),
  FieldControl: ({
    children,
    invalid,
  }: {
    children: React.ReactNode
    invalid?: boolean
  }) => (
    <div data-testid="field-control" data-invalid={invalid}>
      {children}
    </div>
  ),
  FieldLabel: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
  FieldMessage: ({ children }: { children: React.ReactNode }) => (
    <div role="alert">{children}</div>
  ),
}))

vi.mock('#/components/ui/input', () => ({
  Input: (props: Record<string, unknown>) => <input {...props} />,
}))

import { TranslatorInputForm } from './TranslatorInputForm'

describe('TranslatorInputForm', () => {
  it('renders default state', () => {
    const { container } = render(
      <TranslatorInputForm
        initialInput=""
        loading={false}
        error={null}
        translationCount={0}
        onTranslate={vi.fn()}
        onBlur={vi.fn()}
      />,
    )
    expect(container.textContent).toContain('Text to translate')
    expect(container.textContent).toContain('Translate phrase')
  })

  it('calls onTranslate when button clicked', () => {
    const onTranslate = vi.fn()
    const { container } = render(
      <TranslatorInputForm
        initialInput="hello"
        loading={false}
        error={null}
        translationCount={0}
        onTranslate={onTranslate}
        onBlur={vi.fn()}
      />,
    )
    const input = container.querySelector('input')
    const button = container.querySelector('button')
    fireEvent.change(input!, { target: { value: 'hello' } })
    fireEvent.input(input!)
    fireEvent.click(button!)
    expect(onTranslate).toHaveBeenCalledWith('hello')
  })

  it('calls onTranslate on Enter key', () => {
    const onTranslate = vi.fn()
    const { container } = render(
      <TranslatorInputForm
        initialInput=""
        loading={false}
        error={null}
        translationCount={0}
        onTranslate={onTranslate}
        onBlur={vi.fn()}
      />,
    )
    const input = container.querySelector('input')
    fireEvent.change(input!, { target: { value: 'test' } })
    fireEvent.keyDown(input!, { key: 'Enter' })
    expect(onTranslate).toHaveBeenCalledWith('test')
  })

  it('disables button when loading', () => {
    const { container } = render(
      <TranslatorInputForm
        initialInput="hello"
        loading={true}
        error={null}
        translationCount={0}
        onTranslate={vi.fn()}
        onBlur={vi.fn()}
      />,
    )
    const button = container.querySelector('button')
    expect(button?.hasAttribute('disabled')).toBe(true)
    expect(container.textContent).toContain('Translating...')
  })

  it('disables button when input is empty', () => {
    const { container } = render(
      <TranslatorInputForm
        initialInput=""
        loading={false}
        error={null}
        translationCount={0}
        onTranslate={vi.fn()}
        onBlur={vi.fn()}
      />,
    )
    const button = container.querySelector('button')
    expect(button?.hasAttribute('disabled')).toBe(true)
  })

  it('shows translation count when > 0', () => {
    const { container } = render(
      <TranslatorInputForm
        initialInput="hello"
        loading={false}
        error={null}
        translationCount={3}
        onTranslate={vi.fn()}
        onBlur={vi.fn()}
      />,
    )
    expect(container.textContent).toContain('3 translations are ready')
  })

  it('shows singular when translationCount is 1', () => {
    const { container } = render(
      <TranslatorInputForm
        initialInput="hello"
        loading={false}
        error={null}
        translationCount={1}
        onTranslate={vi.fn()}
        onBlur={vi.fn()}
      />,
    )
    expect(container.textContent).toContain('1 translation is ready')
  })

  it('shows error message', () => {
    const { container } = render(
      <TranslatorInputForm
        initialInput=""
        loading={false}
        error="Enter some text"
        translationCount={0}
        onTranslate={vi.fn()}
        onBlur={vi.fn()}
      />,
    )
    expect(container.textContent).toContain('Enter some text')
  })

  it('calls onBlur with input value', () => {
    const onBlur = vi.fn()
    const { container } = render(
      <TranslatorInputForm
        initialInput=""
        loading={false}
        error={null}
        translationCount={0}
        onTranslate={vi.fn()}
        onBlur={onBlur}
      />,
    )
    const input = container.querySelector('input')
    fireEvent.change(input!, { target: { value: 'blurred' } })
    fireEvent.blur(input!)
    expect(onBlur).toHaveBeenCalledWith('blurred')
  })
})
