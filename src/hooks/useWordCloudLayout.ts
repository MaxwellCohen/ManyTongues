import cloud from 'd3-cloud'
import { useEffect, useRef, useState } from 'react'
import type { CloudWord } from '#/lib/wordCloudUtils'

const LAYOUT_WIDTH = 640
const LAYOUT_HEIGHT = 360
/** Approximate char width and line height relative to font size so the largest word fits and d3-cloud doesn't drop it. */
const CHAR_WIDTH_RATIO = 0.6
const LINE_HEIGHT_RATIO = 1.2

function capFontSizeToFit(
  size: number,
  word: { text: string },
): number {
  const len = Math.max(1, word.text.length)
  const maxByWidth = LAYOUT_WIDTH / (len * CHAR_WIDTH_RATIO)
  const maxByHeight = LAYOUT_HEIGHT / LINE_HEIGHT_RATIO
  return Math.min(size, maxByWidth, maxByHeight)
}

export function useWordCloudLayout(
  cloudData: { text: string; value: number }[],
  options: {
    fontSize: (word: { text: string; value: number }) => number
    padding: number
    rotate: (word: { text: string; value: number }, i: number) => number
    random: () => number
  },
): CloudWord[] {
  const [laidOutWords, setLaidOutWords] = useState<CloudWord[]>([])
  const layoutCancelRef = useRef(false)

  useEffect(() => {
    if (!cloudData.length) {
      setLaidOutWords([])
      return
    }
    setLaidOutWords([])
    layoutCancelRef.current = false
    const cappedFontSize = (word: { text: string; value: number }) => {
      const size = options.fontSize(word)
      return capFontSizeToFit(size, word)
    }
    const layout = cloud<CloudWord>()
      .words(cloudData)
      .size([LAYOUT_WIDTH, LAYOUT_HEIGHT])
      .font('Manrope, ui-sans-serif, system-ui, sans-serif')
      .fontSize(cappedFontSize)
      .spiral('archimedean')
      .padding(options.padding)
      .rotate(options.rotate)
      .random(options.random)
      .on('end', (words: CloudWord[]) => {
        if (!layoutCancelRef.current) setLaidOutWords(words)
      })
    layout.start()
    return () => {
      layoutCancelRef.current = true
      layout.stop()
    }
  }, [
    cloudData,
    options.fontSize,
    options.padding,
    options.rotate,
    options.random,
  ])

  return laidOutWords
}
