import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('#/components/icons', () => ({
  ChevronDownIcon: () => <span data-testid="chevron-down" />,
}))

import Accordion from './Accordion'

describe('Accordion', () => {
  it('renders title and children', () => {
    const { container } = render(
      <Accordion title="Test Title">
        <p>Content</p>
      </Accordion>,
    )
    expect(container.textContent).toContain('Test Title')
    expect(container.textContent).toContain('Content')
  })

  it('is closed by default', () => {
    const { container } = render(
      <Accordion title="Test">
        <p>Content</p>
      </Accordion>,
    )
    const details = container.querySelector('details')
    expect(details?.getAttribute('open')).toBeNull()
  })

  it('is open when defaultOpen is true', () => {
    const { container } = render(
      <Accordion title="Test" defaultOpen>
        <p>Content</p>
      </Accordion>,
    )
    const details = container.querySelector('details')
    expect(details?.hasAttribute('open')).toBe(true)
  })

  it('renders chevron icon', () => {
    const { container } = render(<Accordion title="Test">Content</Accordion>)
    expect(container.querySelector('[data-testid="chevron-down"]')).toBeTruthy()
  })
})
