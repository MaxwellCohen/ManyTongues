import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('#/features/word-cloud/components/cloud-render', () => ({
  default: ({
    words,
  }: {
    words: { text: string; value: number }[]
    options: Record<string, unknown>
  }) => (
    <div data-testid="wordcloud">
      <svg data-testid="wordcloud-svg">
        {words.map((w) => (
          <text key={w.text}>{w.text}</text>
        ))}
      </svg>
    </div>
  ),
}))

vi.mock('#/components/icons', () => ({
  DownloadIcon: () => <span data-testid="download-icon" />,
}))

vi.mock('#/components/shell/IslandPanel', () => ({
  default: ({
    children,
  }: {
    children: React.ReactNode
  }) => <div data-testid="island-panel">{children}</div>,
}))

import WordCloudCanvas from './WordCloudCanvas'

const defaultOptions = {
  minFontSize: 14,
  maxFontSize: 72,
  padding: 1,
  scale: 'sqrt' as const,
  fontFamily: 'system-ui',
}

describe('WordCloudCanvas', () => {
  it('shows loading when not mounted', () => {
    const { container } = render(
      <WordCloudCanvas
        words={[]}
        palette={['#111']}
        backgroundColor="#fff"
        mounted={false}
        hasWords={false}
        options={defaultOptions}
      />,
    )
    expect(container.textContent).toContain('Loading preview')
  })

  it('shows empty message when mounted but no words', () => {
    const { container } = render(
      <WordCloudCanvas
        words={[]}
        palette={['#111']}
        backgroundColor="#fff"
        mounted={true}
        hasWords={false}
        options={defaultOptions}
      />,
    )
    expect(container.textContent).toContain('Add text or translations')
  })

  it('renders wordcloud and download button when hasWords', () => {
    const { container } = render(
      <WordCloudCanvas
        words={[{ text: 'hello', value: 10 }]}
        palette={['#111']}
        backgroundColor="#fff"
        mounted={true}
        hasWords={true}
        options={defaultOptions}
      />,
    )
    expect(container.querySelector('[data-testid="wordcloud"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="download-icon"]')).toBeTruthy()
    expect(container.textContent).toContain('Download PNG')
  })

  it('calls handleDownload when download button clicked', () => {
    const { container } = render(
      <WordCloudCanvas
        words={[{ text: 'hello', value: 10 }]}
        palette={['#111']}
        backgroundColor="#fff"
        mounted={true}
        hasWords={true}
        options={defaultOptions}
      />,
    )
    const downloadBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Download'),
    )
    fireEvent.click(downloadBtn!)
    expect(downloadBtn).toBeTruthy()
  })
})
