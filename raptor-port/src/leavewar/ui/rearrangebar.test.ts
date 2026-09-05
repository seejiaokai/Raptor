// @vitest-environment node — reads a stylesheet off disk; under the project's jsdom default `import.meta.url` is not a file: URL
/* The on-grid rearrange bar paints on its OWN compositor layer (owner's iPhone,
   5 Sep 26 — "when I press rearrange the buttons don't show until I press that
   area"). The bar sits inside `.card`, a rounded `overflow: hidden` box whose
   children (the native `.mx-wrap` scroll view, the `.mxband` overlay) are
   composited; on a phone the ⠿ toggle inserts the bar and tears the overlay
   down in one commit, and iOS did not repaint the card's backing store for the
   strip the bar took. `translateZ(0)` gives the bar its own backing store —
   the promoter `.mxfixed` already uses. jsdom cannot paint and Chromium does
   not reproduce the WebKit fault, so this pins the CSS CONTRACT itself, the way
   `src/ui/layers.test.ts` pins the desktop week's layer rules: the rule must
   keep the promotion, and it must stay on the bar alone (a promoted `.rb-lead`
   or button would be a second layer for nothing). */
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const css = readFileSync(new URL('./matrix.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

/** The declaration body of the rule whose WHOLE selector list is exactly `sel`. */
const bodyOf = (sel: string): string | null => {
  const re = new RegExp(`(?:^|[}\\s])${sel.replace(/[.]/g, '\\.')}\\s*\\{([^{}]*)\\}`, 'm')
  const m = css.match(re)
  return m ? m[1]! : null
}

describe('the rearrange bar paints on its own compositor layer', () => {
  it('.lw-rearrange-bar carries transform: translateZ(0) (the .mxfixed promoter)', () => {
    const body = bodyOf('.lw-rearrange-bar')
    expect(body, 'the .lw-rearrange-bar rule exists in matrix.css').not.toBeNull()
    expect(body!.replace(/\s+/g, '')).toMatch(/transform:translateZ\(0\)/)
  })

  it('the promotion is on the bar alone — its lead text carries no transform', () => {
    const lead = bodyOf('.lw-rearrange-bar .rb-lead')
    expect(lead, 'the .rb-lead rule exists in matrix.css').not.toBeNull()
    expect(lead!).not.toMatch(/transform|will-change/)
  })
})

/* The eye (and ↺) in a manning row's frozen balance box — the same fault a day
   later (owner's iPhone, 6 Sep 26 — "the eyes don't show on the counter grids
   until I click it or when I move the page"): the same Rearrange tap inserts
   the `.mrow-tools` span into the sticky cell in the commit that tears the
   overlay down, and iOS left the little box unpainted. Same cure, same shape
   of pin: the edit-only span owns the promotion; the buttons inside it and the
   cell around it do not (a layer per button, or one on every balance cell at
   rest, would be layers for nothing). */
describe('the manning-row controls paint on their own compositor layer', () => {
  it('.mx .counts .mrow-tools carries transform: translateZ(0)', () => {
    const body = bodyOf('.mx .counts .mrow-tools')
    expect(body, 'the .mx .counts .mrow-tools rule exists in matrix.css').not.toBeNull()
    expect(body!.replace(/\s+/g, '')).toMatch(/transform:translateZ\(0\)/)
  })

  it('the promotion is on the span alone — not the buttons, not the balance cell', () => {
    for (const sel of ['.mx .counts .mrow-btn', '.mx .counts td.bal']) {
      const body = bodyOf(sel)
      expect(body, `the ${sel} rule exists in matrix.css`).not.toBeNull()
      expect(body!).not.toMatch(/transform|will-change/)
    }
  })
})
