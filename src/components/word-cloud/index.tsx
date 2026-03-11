import React, { useEffect, startTransition } from 'react';

import { useResponsiveSvgSelection } from './hooks';
import { layout } from './layout';
import type { CallbacksProp, OptionsProp, Props, Options } from './types';
import { getDefaultColors } from './utils';

const defaultCallbacks: CallbacksProp = {};

const defaultOptions: OptionsProp = {
  colors: getDefaultColors(),
  deterministic: false,
  fontFamily: 'times new roman',
  fontSizes: [4, 32],
  fontStyle: 'normal',
  fontWeight: 'normal',
  padding: 1,
  rotationAngles: [-90, 90],
  scale: 'sqrt',
  spiral: 'rectangular',
  svgAttributes: {},
  textAttributes: {},
};
// const renderRef = useRef(debounce(layout, 100));

export default function ReactWordCloud({
  callbacks = defaultCallbacks,
  maxWords = 100,
  minSize = [300, 300],
  options = defaultOptions,
  size: initialSize,
  words,
  ...rest
}: Props): React.JSX.Element {
  const [ref, selection, size] = useResponsiveSvgSelection(
    minSize,
    initialSize,
    options.svgAttributes as Record<string, string> | undefined,
  );

  useEffect(() => {
    if (selection && size) {
      startTransition(() => {
      const mergedOptions = { ...defaultOptions, ...options } as Options;

      layout({
        maxWords,
        options: mergedOptions,
        selection,
        size,
        words,
      });
      });
    }
  }, [maxWords, callbacks, options, selection, size, words]);

  return <div ref={ref} style={{ height: '100%', width: '100%' }} {...rest} />;
}
