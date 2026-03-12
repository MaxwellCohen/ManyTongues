import React, { useEffect, useRef, useState } from 'react';

import type { MinMaxPair } from './types';

export function useWordCloudSize(minSize: MinMaxPair): [
  React.RefObject<HTMLDivElement | null>,
  MinMaxPair | undefined,
] {
  const elementRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<MinMaxPair | undefined>(undefined);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    function updateSize(width: number, height: number) {
      const w = Math.max(width, minSize[0]);
      const h = Math.max(height, minSize[1]);
      setSize([w, h]);
    }

    const width = element.parentElement?.offsetWidth ?? 0;
    const height = element.parentElement?.offsetHeight ?? 0;
    updateSize(width, height);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        if (!entries?.length) return;
        const { width: w, height: h } = entries[0].contentRect;
        updateSize(w, h);
      });
      resizeObserver.observe(element);
    }

    return () => {
      resizeObserver?.unobserve(element);
    };
  }, [minSize]);

  return [elementRef, size];
}
