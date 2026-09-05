// @vitest-environment node — reads the stylesheet off disk, like layers.test.ts
/* The page behind the burger drawer does not scroll (owner's iPhone, 6 Sep 26 —
   "instead of scrolling the side bar, it scrolls the page behind it as well").
   jsdom cannot scroll and Chromium's wheel chaining is only half the story
   (the fault is a TOUCH swipe on iOS), so this pins the CSS contract itself,
   the way layers.test.ts pins the desktop week's layer rules: the panel — the
   drawer's one scroller — contains its overscroll and keeps the up-down pan on
   itself; the scrim takes no pan at all; and the body lock class the drawer
   sets (Drawer.tsx, pinned in odds.test.tsx) actually locks. */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('./scheduler.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ sels: m[1].split(',').map(s => s.trim()).filter(Boolean), body: m[2] }))
const bodyOf = (sel: string) => rules.filter(r => r.sels.includes(sel)).map(r => r.body).join(';')
const declares = (body: string, prop: string, value: RegExp) => {
  const m = body.match(new RegExp('(?:^|[;\\s])' + prop + '\\s*:\\s*([^;]*)'))
  return !!m && value.test(m[1]!.trim())
}

describe('the page behind the drawer does not scroll', () => {
  it('the panel contains its overscroll and pans up-down on itself', () => {
    const b = bodyOf('.drawer-panel')
    expect(b, '.drawer-panel rule exists').not.toBe('')
    expect(declares(b, 'overscroll-behavior', /^contain$/)).toBe(true)
    expect(declares(b, 'touch-action', /^pan-y$/)).toBe(true)
    expect(declares(b, 'overflow', /^auto$/)).toBe(true)   // it must stay a scroll container for containment to apply
  })

  it('the scrim takes no pan at all', () => {
    expect(declares(bodyOf('.drawer'), 'touch-action', /^none$/)).toBe(true)
  })

  it('body.dw-lock locks the document, separately from the board\'s sb-lock', () => {
    expect(declares(bodyOf('body.dw-lock'), 'overflow', /^hidden$/)).toBe(true)
    expect(declares(bodyOf('body.sb-lock'), 'overflow', /^hidden$/)).toBe(true)
  })
})
