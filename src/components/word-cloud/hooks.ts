import { select, type Selection } from 'd3-selection';
import React, { useEffect, useRef, useState } from 'react';

import type { MinMaxPair } from './types';

export function useResponsiveSvgSelection(
  minSize: MinMaxPair,

): [
    React.RefObject<HTMLDivElement | null>,
    Selection<SVGGElement, unknown, SVGSVGElement | null, unknown> | null,
    MinMaxPair | undefined,
  ] {
  const elementRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<MinMaxPair | undefined>(undefined);
  const [selection, setSelection] =
    useState<Selection<SVGGElement, unknown, SVGSVGElement | null, unknown> | null>(
      null,
    );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) { return; }

    // Set svg selection
    let svg = select(element).append('svg').style('display', 'block'); // Native inline svg leaves undesired white space


    const innerSelection = svg.append('g');
    setSelection(innerSelection);

    function updateSize(width: number, height: number) {
      svg.attr('height', height).attr('width', width);
      innerSelection.attr(
        'transform',
        `translate(${width / 2}, ${height / 2})`,
      );
      setSize([width, height]);
    }

    let width = 0;
    let height = 0;

    // Use parentNode size if resized has not occurred
    width = element.parentElement!.offsetWidth;
    height = element.parentElement!.offsetHeight;


    width = Math.max(width, minSize[0]);
    height = Math.max(height, minSize[1]);
    updateSize(width, height);

    // Update size when the container resizes. ResizeObserver is optional so we
    // skip observation in older environments; the cloud still renders at initial size.
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) {
          return;
        }
        const { width: w, height: h } = entries[0].contentRect;
        updateSize(w, h);
      });
      resizeObserver.observe(element);
    }

    // Cleanup
    return () => {
      if (resizeObserver) {
        resizeObserver.unobserve(element);
      }
      select(element).selectAll('*').remove();
    };
  }, [ minSize]);

  return [elementRef, selection, size];
}
