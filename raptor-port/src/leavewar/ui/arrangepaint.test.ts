// @vitest-environment node — reads a stylesheet off disk; under the project's jsdom default `import.meta.url` is not a file: URL
/* The controls Rearrange inserts into the frozen columns paint on their OWN
   compositor layer (owner's iPhone, 5–6 Sep 26). First the on-grid rearrange
   bar ("when I press rearrange the buttons don't show until I press that area"),
   then the eye in each manning row's balance box ("the eyes don't show on the
   counter grids until I click it or when I move the page"): on a phone the
   Rearrange tap inserts the control and tears the `.mxband` overlay down in one
   commit, and iOS did not repaint the sticky/clipped box the control took.
   `translateZ(0)` gives the inserted node its own backing store — the promoter
   `.mxfixed` already uses. The bar itself is GONE since 6 Sep 26 (owner —
   "delete this whole blue section"); the eye's span is the surviving case.
   jsdom cannot paint and Chromium does not reproduce the WebKit fault, so this
   pins the CSS CONTRACT itself, the way `src/ui/layers.test.ts` pins the
   desktop week's layer rules: the edit-only span owns the promotion; the
   buttons inside it and the cell around it do not (a layer per button, or one
   on every balance cell at rest, would be layers for nothing). */
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const css = readFileSync(new URL('./matrix.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

/** The declaration body of the rule whose WHOLE selector list is exactly `sel`. */
const bodyOf = (sel: string): string | null => {
  const re = new RegExp(`(?:^|[}\\s])${sel.replace(/[.]/g, '\\.')}\\s*\\{([^{}]*)\\}`, 'm')
  const m = css.match(re)
  return m ? m[1]! : null
}

describe('the rearrange bar is gone', () => {
  it('no .lw-rearrange-bar rule survives in matrix.css', () => {
    expect(bodyOf('.lw-rearrange-bar')).toBeNull()
    expect(bodyOf('.lw-rearrange-bar .rb-lead')).toBeNull()
  })
})
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
