import debounce from 'lodash.debounce';
import React, { useEffect, useRef } from 'react';

import { useResponsiveSvgSelection } from './hooks';
import { layout } from './layout';
import type { CallbacksProp, OptionsProp, Props } from './types';
import { getDefaultColors } from './utils';

export const defaultCallbacks: CallbacksProp = {};

export const defaultOptions: OptionsProp = {
  colors: getDefaultColors(),
  deterministic: false,
  enableOptimizations: false,
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
  transitionDuration: 600,
};

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

  const renderRef = useRef(debounce(layout, 100));

  useEffect(() => {
    if (selection && size) {
      const mergedCallbacks = { ...defaultCallbacks, ...callbacks };
      const mergedOptions = { ...defaultOptions, ...options };

      renderRef.current({
        callbacks: mergedCallbacks,
        maxWords,
        options: mergedOptions as import('./types').Options,
        selection,
        size,
        words,
      });
    }
  }, [maxWords, callbacks, options, selection, size, words]);

  return <div ref={ref} style={{ height: '100%', width: '100%' }} {...rest} />;
}
