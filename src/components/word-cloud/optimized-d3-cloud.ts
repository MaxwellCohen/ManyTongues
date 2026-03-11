/**
 * Author: Augustinas (https://github.com/WhoAteDaCake)
 * Source: https://github.com/chrisrzhou/react-wordcloud/blob/166d0b0400a87647fe4e7855a26fe581ce38a502/src/cloud.ts
 * TEMPORARY workaround
 *
 * Implements the wordcloud algorithm based on: https://github.com/jasondavies/d3-cloud/tree/v1.2.5
 * Improvements:
 *  Use a setTimeout + batch sizes to calculate clouds in order to avoid blocking main thread for two long (87-101)
 *
 */

// Word cloud layout by Jason Davies, https://www.jasondavies.com/wordcloud/
// Algorithm due to Jonathan Feinberg, http://static.mrfeinberg.com/bv_ch03.pdf

import { dispatch } from 'd3-dispatch';

import type { CloudLayout, MinMaxPair, Spiral, Word } from './types';

const cloudRadians = Math.PI / 180,
  cw = (1 << 11) >> 5,
  ch = 1 << 11;

/** Layout-internal word with canvas/sprite fields. */
interface LayoutWord extends Word {
  text: string;
  font: string;
  style: string;
  weight: string;
  rotate: number;
  size: number;
  padding: number;
  x?: number;
  y?: number;
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
  width?: number;
  height?: number;
  xoff?: number;
  yoff?: number;
  sprite?: number[];
  hasText?: boolean;
}

interface ContextAndRatio {
  context: CanvasRenderingContext2D;
  ratio: number;
}

type SpiralFn = (size: MinMaxPair) => (t: number) => [number, number] | undefined;

function cloudText(d: LayoutWord): string {
  return d.text;
}

function cloudFont(): string {
  return 'serif';
}

function cloudFontNormal(): string {
  return 'normal';
}

function cloudFontSize(d: Word): number {
  return Math.sqrt(d.value);
}

function cloudRotate(): number {
  return (~~(Math.random() * 6) - 3) * 30;
}

function cloudPadding(): number {
  return 1;
}

function cloudCanvas(): HTMLCanvasElement {
  return document.createElement('canvas');
}

function functor<T>(d: T | ((...args: any[]) => T)): (...args: any[]) => T {
  return typeof d === 'function'
    ? (d as (...args: any[]) => T)
    : () => d;
}

function zeroArray(n: number): Uint32Array {
  return new Uint32Array(n);
}

function archimedeanSpiral(size: MinMaxPair): (t: number) => [number, number] {
  const e = size[0] / size[1];
  return function (t: number) {
    return [e * (t *= 0.1) * Math.cos(t), t * Math.sin(t)];
  };
}

function rectangularSpiral(size: MinMaxPair): (t: number) => [number, number] {
  let dy = 4,
    dx = (dy * size[0]) / size[1],
    x = 0,
    y = 0;
  return function (t: number) {
    const sign = t < 0 ? -1 : 1;
    switch ((Math.sqrt(1 + 4 * sign * t) - sign) & 3) {
      case 0: {
        x += dx;
        break;
      }
      case 1: {
        y += dy;
        break;
      }
      case 2: {
        x -= dx;
        break;
      }
      default: {
        y -= dy;
        break;
      }
    }
    return [x, y];
  };
}

const spirals: Record<string, SpiralFn> = {
  archimedean: archimedeanSpiral,
  rectangular: rectangularSpiral,
};

function getContext(canvas: HTMLCanvasElement): ContextAndRatio {
  canvas.width = canvas.height = 1;
  const ratio = Math.sqrt(
    canvas.getContext('2d')!.getImageData(0, 0, 1, 1).data.length >> 2,
  );
  canvas.width = (cw << 5) / ratio;
  canvas.height = ch / ratio;

  const context = canvas.getContext('2d')!;
  context.fillStyle = context.strokeStyle = 'red';
  context.textAlign = 'center';

  return { context, ratio };
}

function cloudCollide(
  tag: LayoutWord,
  board: Uint32Array,
  sw: number,
): boolean {
  sw >>= 5;
  const sprite = tag.sprite!,
    w = tag.width! >> 5,
    lx = tag.x! - (w << 4),
    sx = lx & 0x7F,
    msx = 32 - sx,
    h = tag.y1! - tag.y0!;
  let x = (tag.y! + tag.y0!) * sw + (lx >> 5),
    last: number;
  for (let j = 0; j < h; j++) {
    last = 0;
    for (let i = 0; i <= w; i++) {
      if (
        ((last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0)) &
        board[x + i]
      )
        {return true;}
    }
    x += sw;
  }
  return false;
}

function cloudBounds(
  bounds: [{ x: number; y: number }, { x: number; y: number }],
  d: LayoutWord,
): void {
  const b0 = bounds[0],
    b1 = bounds[1];
  if (d.x! + d.x0! < b0.x) {b0.x = d.x! + d.x0!;}
  if (d.y! + d.y0! < b0.y) {b0.y = d.y! + d.y0!;}
  if (d.x! + d.x1! > b1.x) {b1.x = d.x! + d.x1!;}
  if (d.y! + d.y1! > b1.y) {b1.y = d.y! + d.y1!;}
}

function collideRects(
  a: LayoutWord,
  b: [{ x: number; y: number }, { x: number; y: number }],
): boolean {
  return (
    a.x! + a.x1! > b[0].x &&
    a.x! + a.x0! < b[1].x &&
    a.y! + a.y1! > b[0].y &&
    a.y! + a.y0! < b[1].y
  );
}

function cloudSprite(
  contextAndRatio: ContextAndRatio,
  d: LayoutWord,
  data: LayoutWord[],
  di: number,
): void {
  if (d.sprite) {return;}
  const c = contextAndRatio.context,
    {ratio} = contextAndRatio;

  c.clearRect(0, 0, (cw << 5) / ratio, ch / ratio);
  let x = 0,
    y = 0,
    maxh = 0;
  const n = data.length;
  --di;
  let currentD: LayoutWord = d;
  while (++di < n) {
    currentD = data[di];
    c.save();
    c.font =
      currentD.style +
      ' ' +
      currentD.weight +
      ' ' +
      ~~((currentD.size + 1) / ratio) +
      'px ' +
      currentD.font;
    let w = c.measureText(currentD.text + 'm').width * ratio,
      h = currentD.size << 1;
    if (currentD.rotate) {
      const sr = Math.sin(currentD.rotate * cloudRadians),
        cr = Math.cos(currentD.rotate * cloudRadians),
        wcr = w * cr,
        wsr = w * sr,
        hcr = h * cr,
        hsr = h * sr;
      w =
        ((Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr)) + 0x1F) >> 5) << 5;
      h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
    } else {
      w = ((w + 0x1F) >> 5) << 5;
    }
    if (h > maxh) {maxh = h;}
    if (x + w >= cw << 5) {
      x = 0;
      y += maxh;
      maxh = 0;
    }
    if (y + h >= ch) {break;}
    c.translate((x + (w >> 1)) / ratio, (y + (h >> 1)) / ratio);
    if (currentD.rotate) {c.rotate(currentD.rotate * cloudRadians);}
    c.fillText(currentD.text, 0, 0);

    if (currentD.padding) {
      c.lineWidth = 2 * currentD.padding;
      c.strokeText(currentD.text, 0, 0);
    }
    c.restore();
    currentD.width = w;
    currentD.height = h;
    currentD.xoff = x;
    currentD.yoff = y;
    currentD.x1 = w >> 1;
    currentD.y1 = h >> 1;
    currentD.x0 = -currentD.x1;
    currentD.y0 = -currentD.y1;
    currentD.hasText = true;
    x += w;
  }
  const pixels = c.getImageData(0, 0, (cw << 5) / ratio, ch / ratio).data;
  const sprite: number[] = [];
  while (--di >= 0) {
    currentD = data[di];
    if (!currentD.hasText) {continue;}
    const w = currentD.width!,
      w32 = w >> 5,
      h = currentD.y1! - currentD.y0!;
    for (let i = 0; i < h * w32; i++) {sprite[i] = 0;}
    x = currentD.xoff!;
    const yOff = currentD.yoff!;
    let seen = 0,
      seenRow = -1;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const k = w32 * j + (i >> 5),
          m = pixels[((yOff + j) * (cw << 5) + (x + i)) << 2]
            ? 1 << (31 - (i % 32))
            : 0;
        sprite[k] |= m;
        seen |= m;
      }
      if (seen) {seenRow = j;}
      else {
        currentD.y0!++;
        currentD.y1 = currentD.y0! + seenRow;
        j--;
      }
    }
    currentD.y1 = currentD.y0! + seenRow;
    currentD.sprite = sprite.slice(0, (currentD.y1 - currentD.y0!) * w32);
  }
}

export default function Cloud(): CloudLayout {
  let size: MinMaxPair = [256, 256];
  let words: Word[] = [];
  let text: (d: LayoutWord) => string = cloudText;
  let font: (...args: any[]) => string = cloudFont;
  let fontSize: (d: Word) => number = cloudFontSize;
  let fontStyle: (...args: any[]) => string = cloudFontNormal;
  let fontWeight: (...args: any[]) => string = cloudFontNormal;
  let rotate: (...args: any[]) => number = cloudRotate;
  let padding: (...args: any[]) => number = cloudPadding;
  let spiral: SpiralFn = archimedeanSpiral;
  let {random} = Math;
  const event = dispatch('word', 'end');
  let timer: ReturnType<typeof setInterval> | null = null;
  const canvas: () => HTMLCanvasElement = cloudCanvas;
  let killed = false;

  function place(
    board: Uint32Array,
    tag: LayoutWord,
    bounds: [{ x: number; y: number }, { x: number; y: number }] | null,
  ): boolean {
    const startX = tag.x!,
      startY = tag.y!,
      maxDelta = Math.sqrt(size[0] * size[0] + size[1] * size[1]),
      s = spiral(size),
      dt = random() < 0.5 ? 1 : -1;
    let t = -dt;

    for (;;) {
      const dxdy = s((t += dt));
      if (!dxdy) {break;}
      const dx = ~~dxdy[0],
        dy = ~~dxdy[1];

      if (Math.min(Math.abs(dx), Math.abs(dy)) >= maxDelta) {break;}

      tag.x = startX + dx;
      tag.y = startY + dy;

      if (
        tag.x + tag.x0! < 0 ||
        tag.y + tag.y0! < 0 ||
        tag.x + tag.x1! > size[0] ||
        tag.y + tag.y1! > size[1]
      )
        {continue;}
      if (!bounds || !cloudCollide(tag, board, size[0])) {
        if (!bounds || collideRects(tag, bounds)) {
          const sprite = tag.sprite!,
            w = tag.width! >> 5,
            sw = size[0] >> 5,
            lx = tag.x! - (w << 4),
            sx = lx & 0x7F,
            msx = 32 - sx,
            h = tag.y1! - tag.y0!;
          let x = (tag.y! + tag.y0!) * sw + (lx >> 5),
            last: number = 0;
          for (let j = 0; j < h; j++) {
            last = 0;
            for (let i = 0; i <= w; i++) {
              board[x + i] |=
                (last << msx) |
                (i < w ? (last = sprite[j * w + i]) >>> sx : 0);
            }
            x += sw;
          }
          delete tag.sprite;
          return true;
        }
      }
    }
    return false;
  }

  const cloud: CloudLayout & { stop(): CloudLayout; revive(): CloudLayout } = {
    font(_) {
      if (arguments.length) {
        font = functor(_);
        return cloud;
      }
      return cloud;
    },
    fontSize(_) {
      if (arguments.length) {
        fontSize = functor(_);
        return cloud;
      }
      return cloud;
    },
    fontStyle(_) {
      if (arguments.length) {
        fontStyle = functor(_);
        return cloud;
      }
      return cloud;
    },
    fontWeight(_) {
      if (arguments.length) {
        fontWeight = functor(_);
        return cloud;
      }
      return cloud;
    },
    on(_event: 'end', callback?: (words: Word[]) => void) {
      const value = (event.on as (...args: any[]) => unknown).apply(event, [...arguments]);
      return (value === event ? cloud : value) as CloudLayout;
    },
    padding(_) {
      if (arguments.length) {
        padding = functor(_);
        return cloud;
      }
      return cloud;
    },
    random(_) {
      if (arguments.length) {
        random = _ as () => number;
        return cloud;
      }
      return cloud;
    },
    revive() {
      killed = false;
      return cloud;
    },
    rotate(_) {
      if (arguments.length) {
        rotate = functor(_);
        return cloud;
      }
      return cloud;
    },
    size(_) {
      if (arguments.length) {
        size = [Number((_ as MinMaxPair)[0]), Number((_ as MinMaxPair)[1])];
        return cloud;
      }
      return size as unknown as CloudLayout;
    },
    spiral(_) {
      if (arguments.length) {
        spiral = (spirals[_ as Spiral] || _) as SpiralFn;
        return cloud;
      }
      return cloud;
    },
    start() {
      const contextAndRatio = getContext(canvas());
      const board = zeroArray((size[0] >> 5) * size[1]);
      let bounds: [{ x: number; y: number }, { x: number; y: number }] | null =
        null;
      const tags: LayoutWord[] = [];
      const data = (words as LayoutWord[])
        .map((d, i) => {
          (d as LayoutWord).text = text(d);
          (d as LayoutWord).font = (font as (d: LayoutWord, i: number) => string)(d, i);
          (d as LayoutWord).style = (fontStyle as (d: LayoutWord, i: number) => string)(d, i);
          (d as LayoutWord).weight = (fontWeight as (d: LayoutWord, i: number) => string)(d, i);
          (d as LayoutWord).rotate = (rotate as (d: LayoutWord, i: number) => number)(d, i);
          (d as LayoutWord).size = ~~fontSize(d);
          (d as LayoutWord).padding = (padding as (d: LayoutWord, i: number) => number)(d, i);
          return d as LayoutWord;
        })
        .toSorted(function  data(a, b) {
          return b.size - a.size;
        });

      function multiStep(from: number, to: number) {
        for (let i = from; i < to; i += 1) {
          const d = data[i];
          d.x = (size[0] * (random() + 0.5)) >> 1;
          d.y = (size[1] * (random() + 0.5)) >> 1;
          cloudSprite(contextAndRatio, d, data, i);
          if (d.hasText && place(board, d, bounds)) {
            tags.push(d);
            event.call('word' as 'word', cloud, d);
            if (bounds) {cloudBounds(bounds, d);}
            else
              {bounds = [
                { x: d.x! + d.x0!, y: d.y! + d.y0! },
                { x: d.x! + d.x1!, y: d.y! + d.y1! },
              ];}
            d.x -= size[0] >> 1;
            d.y -= size[1] >> 1;
          }
        }
      }

      function loop(i: number) {
        const step = 50;
        const from = i * step;
        const to = Math.min((i + 1) * step, words.length);
        multiStep(from, to);
        if (killed) {return;}
        if (to < words.length) {
          setTimeout(() => loop(i + 1), 0);
        } else {
          cloud.stop();
          event.call('end' as 'end', cloud, tags, bounds);
        }
      }
      setTimeout(() => loop(0), 0);

      return cloud;
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      killed = true;
      return cloud;
    },
    text(_) {
      if (arguments.length) {
        text = functor(_);
        return cloud;
      }
      return cloud;
    },
    words(_) {
      if (arguments.length) {
        words = _ as Word[];
        return cloud;
      }
      return words as unknown as CloudLayout;
    },
  };

  return cloud as CloudLayout;
}
