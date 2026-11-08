// @vitest-environment node — reads a stylesheet off disk; under the project's jsdom default `import.meta.url` is not a file: URL
/* OIL Earn's day switch, "No OIL earned" (D1782), reached by the keys wears the board's cyan keyboard ring (D1646 — the
   board's controls reached and pressed by the keyboard, "with the app's cyan focus ring"; D1771 — "in place of the
   browser's own"). The walk of 8 Nov 26 (W1.4, picture `w1/W1.4-pc-ring.png`) found the browser's own white ring round
   the slider: the switch borrows the Logic page's `.lgmix`, which sets none. jsdom loads no stylesheet and has no
   :focus-visible, so the rule itself is the only thing a test can read; the walk's re-check is the picture. */
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const css = readFileSync(new URL('./scheduler/18-oil-board.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const RULES = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(m => ({ sels: m[1]!.split(',').map(s => s.trim().replace(/\s+/g, ' ')), body: m[2]! }))

describe('OIL Earn\'s day switch under the keys (D1646, D1782)', () => {
  it('wears the board\'s cyan keyboard ring, for the keys only', () => {
    const bodies = RULES.filter(r => r.sels.includes('.lgmix.daysw input:focus-visible')).map(r => r.body)
    expect(bodies.length, '.lgmix.daysw input:focus-visible is declared').toBeGreaterThan(0)
    const body = bodies.join(';')
    expect(body).toMatch(/outline:\s*2px solid var\(--accent\)/)
    expect(body).toMatch(/outline-offset:\s*2px/)
  })
  it('a mouse or a finger leaves no ring: nothing is set on plain :focus', () => {
    expect(RULES.some(r => r.sels.includes('.lgmix.daysw input:focus'))).toBe(false)
  })
})
