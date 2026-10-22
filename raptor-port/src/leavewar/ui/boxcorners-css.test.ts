// @vitest-environment node — reads a stylesheet off disk; under the project's jsdom default `import.meta.url` is not a file: URL
/* A CORNER TILE NEVER COVERS A BOX'S LETTERS (walker 1's #8 and #9, M2's walk, 23 Oct 26 —
   `docs/handpass/parts/lw-m2-w1.md`). The amber "!" covered the L of a morning OML; a "+1" the O of a morning HO; the PO
   tag the second L of an afternoon LL after a posting-out. `lookf.test.tsx` pins the cell's classes (MatrixRows `mkLow`
   → `mklo`, `poHigh` → `pohi`); jsdom cannot lay a box out, so this pins the stylesheet's half, as `arrangepaint.test.ts`
   does its own: where the other corner on the right is free the tile moves there; where none is, the box under the tile
   keeps its place and size (its half says how much of the day, D1160) and only its letters step aside. Measured in a
   browser on the same rules, 23 Oct 26: every overlap the walker found went to 0. What only the running app can show —
   the letters' real fit on his iPhone's font — is the re-walk's. */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('./matrix.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n').replace(/\/\*[\s\S]*?\*\//g, '')

/** The declaration body of the rule whose whole selector list is exactly `sel`, its spaces squeezed out. */
const bodyOf = (sel: string): string | null => {
  const re = new RegExp(`(?:^|[}\\s])${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^{}]*)\\}`, 'm')
  const m = css.match(re)
  return m ? m[1]!.replace(/\s+/g, '') : null
}

describe('the tile moves to the free corner', () => {
  it('the mark drops to the bottom-right (and off the last-day ribbon’s corner)', () => {
    expect(bodyOf('.mx td.mklo .mk')).toBe('top:auto;bottom:0;right:0;border-radius:4px000;')
  })
  it('the PO tag rises to the top-right', () => {
    expect(bodyOf('.mx td.pohi .potag')).toBe('top:0;bottom:auto;border-radius:0004px;')
  })
  it('the drop comes after the last-day rule it overrides (the same weight, so the later wins)', () => {
    expect(css.indexOf('.mx td.mklo .mk')).toBeGreaterThan(css.indexOf('.mx td.pofin .mk'))
  })
})

describe('with no free corner the letters step aside — the box keeps its place and size', () => {
  it('a morning box under the mark keeps room on its right, and beside its left edge mark', () => {
    expect(bodyOf('.mx td.mkd:not(.mklo) .c.top')).toBe('padding:05.5px02px;')
  })
  it('an afternoon box under the PO tag the same', () => {
    expect(bodyOf('.mx td.outlv:not(.pohi) .c.bot')).toBe('padding:09.5px02px;')
  })
  it('a three-letter code there takes its letters a step smaller', () => {
    expect(bodyOf('.mx td.mkd:not(.mklo) .c.top.wide,\n.mx td.outlv:not(.pohi) .c.bot.wide')).toBe('font-size:6px;')
  })
  it('the tile over such a box is at its slimmest', () => {
    expect(bodyOf('.mx td:not(.mklo) .c.top ~ .mk')).toBe('padding:1px1.5px;')
    expect(bodyOf('.mx td:not(.pohi) .c.bot ~ .potag')).toBe('padding:1px;')
  })
  it('nothing in these rules moves or resizes a box', () => {
    for (const sel of ['.mx td.mkd:not(.mklo) .c.top', '.mx td.outlv:not(.pohi) .c.bot']) {
      expect(bodyOf(sel)).not.toMatch(/(^|;)(top|bottom|left|right|inset|width|height):/)
    }
  })
})
