// @vitest-environment node — reads a stylesheet off disk; under the project's jsdom default `import.meta.url` is not a file: URL
/* HOW A DAY'S ENTRIES AND MARKS SHARE ITS CELL — the stylesheet's half (his D1726, D1727, D1728, D1729, D1730, 6 Nov 26 —
   [LW-CELL-COMBOS]). Every combination of entries, codes and marks on one day (23,940) was measured on the built grid at
   his iPhone's size and a desktop's, at every zoom, letters on their own ink; the `bx-` rules are the design that left none
   cut, and `lookf.test.tsx` pins the classes MatrixRows gives the cell and its boxes. jsdom cannot lay a box out, so this
   pins the rules themselves, as `arrangepaint.test.ts` does its own; the letters' real fit is the measuring script's
   (`scripts/handpass/lw-cell-combos-measure.mjs`) and the walk's. It replaced the corner tiles' moves of 23 Oct 26
   (`mklo`, `pohi` — walker 1's #8, #9), which the stack, the tag and the line made needless. */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('./matrix.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n').replace(/\/\*[\s\S]*?\*\//g, '')

/** The declaration body of the rule whose whole selector list is exactly `sel`, its spaces squeezed out. */
const bodyOf = (sel: string): string | null => {
  const re = new RegExp(`(?:^|[}\\s])${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^{}]*)\\}`, 'm')
  const m = css.match(re)
  return m ? m[1]!.replace(/\s+/g, '') : null
}
const P = '#page-leavewar .mx td'

describe('two entries on a day (D1727)', () => {
  it('two whole days stand side by side, their codes turned to read bottom to top', () => {
    expect(bodyOf(`${P} .c.bx-tilt`)).toBe('writing-mode:vertical-rl;transform:rotate(180deg);font-size:7.5px!important;letter-spacing:0!important;padding:0!important;')
  })
  it('a whole day beside a half keeps the whole cell, and the half sits over its own half', () => {
    expect(bodyOf(`${P} .c.bx-floor`)).toMatch(/^inset:2px!important;/)
    expect(bodyOf(`${P} .c.bx-roof.bx-am`)).toBe('top:4px!important;bottom:calc(50%+.5px)!important;')
    expect(bodyOf(`${P} .c.bx-roof.bx-pm`)).toBe('top:calc(50%+.5px)!important;bottom:4px!important;')
  })
})

describe('the day’s marks', () => {
  it('three or more: the box is the top of a stack of cards, the "+n" hidden (D1727, the grey card D1730)', () => {
    expect(bodyOf(`${P}.bx-pile .mk.more`)).toBe('display:none!important;')
    expect(bodyOf(`${P}.bx-pile .c.s-a`)).toContain('2.5px2.5px0rgba(150,162,178,.9)')
  })
  it('the "!" is an outlined tag in the top-right corner', () => {
    expect(bodyOf(`${P}.bx-alarm .mk.warn`)).toContain('box-shadow:0001px#0E141B!important;')
  })
  it('an entry after a posting out wears the faint dark stripes, not faded (D1728, D1729, D1730)', () => {
    const b = bodyOf(`${P}.bx-gone .c`)
    expect(b).toBe('background-image:repeating-linear-gradient(135deg,rgba(14,20,27,.3)01.5px,transparent1.5px4px)!important;')
    expect(b).not.toContain('opacity')
  })
  it('his last day in: the tile is a thin yellow line down the right edge, and the boxes step left of it (D1728)', () => {
    const line = bodyOf('.mx td.pofin .polast')!
    expect(line).toContain('width:2px;')
    expect(line).toContain('font-size:0;')
    expect(line).toContain('background:#F2C879;')
    expect(bodyOf(`${P}.bx-last .c:not(.left)`)).toBe('right:3.5px!important;')
  })
  it('zoomed out, a whole day’s two letters sit under the iPhone’s 9px floor, so every code keeps one scale (D1726)', () => {
    expect(bodyOf('#page-leavewar table.mx.lw-small td .c.whole:not(.wide)')).toBe('font-size:8.9px!important;')
  })
  it('the corner tiles’ old moves are gone', () => {
    for (const gone of ['td.mklo', 'td.pohi', ':not(.mklo)', ':not(.pohi)', '.mx td.pofin .mk']) expect(css).not.toContain(gone)
  })
})
