import cloud from 'd3-cloud'
import { useEffect, useRef, useState } from 'react'
import type { CloudWord } from '#/lib/wordCloudUtils'

export function useWordCloudLayout(
  cloudData: { text: string; value: number }[],
  options: {
    fontSize: (word: { value: number }) => number
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
    const layout = cloud<CloudWord>()
      .words(cloudData)
      .size([640, 360])
      .font('Manrope, ui-sans-serif, system-ui, sans-serif')
      .fontSize(options.fontSize)
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
