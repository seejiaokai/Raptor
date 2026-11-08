// @vitest-environment node — reads stylesheets off disk; under the project's jsdom default `import.meta.url` is not a file: URL
/* THE BOARD'S LAYOUT AND ITS KEYBOARD RINGS (chat 11, 8 Nov 26 — the pictures round's group 1). jsdom loads no stylesheet,
   has no layout and no :focus-visible, so the rules themselves are what a unit test can read; where each part stands is
   measured in a real browser (e2e/board-layout.spec.ts) and seen in the walk's pictures.
   - D1781: from 821 to 1099 wide a jet's line puts its remarks on a row of their own and stacks R over B, TO over LD.
   - D1780: on a phone on its side the board scrolls as one page: the top sticky at minus the head's height, so only the
     bar's line stays; the crew column sticky under the bar; a jump stops below the bar (its scroll padding).
   - D1771: under the keys an item of the board's or the week's ⋯ menu keeps its raised row and wears the app's cyan
     ring inside its edge, in place of the browser's. */
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const read = (f: string) => readFileSync(new URL(`./scheduler/${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
/* the body of the one @media block whose query is exactly `q` (brace counted), '' when there is none */
const mediaBody = (css: string, q: string) => {
  const at = css.indexOf(`@media ${q}{`); if (at < 0) return ''
  let i = at + `@media ${q}{`.length, depth = 1; const from = i
  for (; i < css.length && depth; i++) { if (css[i] === '{') depth++; else if (css[i] === '}') depth-- }
  return css.slice(from, i - 1)
}
type Rule = { sels: string[], body: string }
const rules = (css: string): Rule[] => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(m => ({ sels: m[1]!.split(',').map(s => s.trim().replace(/\s+/g, ' ')), body: m[2]!.replace(/\s+/g, '') }))
const bodyOf = (rs: Rule[], sel: string) => rs.filter(r => r.sels.includes(sel)).map(r => r.body).join(';')

describe('D1781 — the desktop board 821 to 1099 wide', () => {
  const band = rules(mediaBody(read('13-board-rows-responsive.css'), '(min-width:821px) and (max-width:1099px)'))
  it('is a band of its own, on the board\'s desktop look only (never the desktop layout switch)', () => {
    expect(band.length, 'the 821–1099 band is declared').toBeGreaterThan(0)
    for (const r of band) for (const s of r.sels) expect(s.startsWith('.schedboard:not(.sb-wide) '), s).toBe(true)
  })
  it('the line: grip, callsign, mission, R over B, TO over LD, the two seats', () => {
    /* the back seat's column keeps a 94px floor, the room the line's CX ■ + ✕ need under it, in the headings too —
       so the RCP heading stands over its seat at 821 (the board-layout walk, 8 Nov 26) */
    expect(bodyOf(band, '.schedboard:not(.sb-wide) .sb-line')).toContain('grid-template-columns:18px56px64px48px48px1frminmax(94px,1fr)')
    expect(bodyOf(band, '.schedboard:not(.sb-wide) .sb-lcols')).toContain('grid-template-columns:18px56px64px48px48px1frminmax(94px,1fr)')
    expect(bodyOf(band, '.schedboard:not(.sb-wide) .sb-line>.sb-rb')).toContain('flex-direction:column')
    expect(bodyOf(band, '.schedboard:not(.sb-wide) .sb-line>.sb-tl')).toContain('flex-direction:column')
  })
  it('the remarks on a row of their own, the line\'s buttons beside them', () => {
    expect(bodyOf(band, '.schedboard:not(.sb-wide) .sb-line>.sb-rcell')).toMatch(/grid-column:2\/7;grid-row:2/)
    expect(bodyOf(band, '.schedboard:not(.sb-wide) .sb-line>.lctl')).toMatch(/grid-column:7\/-1;grid-row:2/)
  })
})

describe('D1780 — a phone on its side', () => {
  const Q = '(min-width:821px) and (pointer:coarse) and (orientation:landscape) and (max-height:500px)'
  const side = rules(mediaBody(read('10-board-history.css'), Q))
  it('the app\'s own sideways query, from 821 wide', () => expect(side.length).toBeGreaterThan(0))
  it('the board is the one scroller, and a jump stops below the bar', () => {
    const b = bodyOf(side, '.schedboard:not(.sb-wide)')
    expect(b).toContain('overflow-y:auto')
    expect(b).toContain('scroll-padding-top:calc(var(--sb-topH,0px)-var(--sb-headH,0px))')
    expect(bodyOf(side, '.schedboard:not(.sb-wide) .sb-boardwrap')).toContain('overflow:visible')
  })
  it('the top rides up by the head\'s height, so only the bar\'s line stays', () => {
    const t = bodyOf(side, '.schedboard:not(.sb-wide) .sb-top')
    expect(t).toContain('position:sticky')
    expect(t).toContain('top:calc(-1*var(--sb-headH,0px))')
  })
  it('the crew column stands under the bar, as tall as the board less the bar', () => {
    const s = bodyOf(side, '.schedboard:not(.sb-wide) .sb-side')
    expect(s).toContain('position:sticky')
    expect(s).toContain('top:calc(var(--sb-topH,0px)-var(--sb-headH,0px))')
    expect(s).toContain('height:calc(var(--sb-boardH,100vh)-var(--sb-topH,0px)+var(--sb-headH,0px))')
  })
})

describe('D1771 — a ⋯ menu\'s item under the keys', () => {
  for (const [file, sel] of [['18-oil-board.css', '.sb-moreitem'], ['09-week-responsive.css', '.schedule-moreitem']] as const) {
    const rs = rules(read(file))
    it(`${sel}: the raised row kept, the cyan ring inside its edge, for the keys only`, () => {
      expect(bodyOf(rs, `${sel}:focus-visible`)).toContain('background:var(--raised)')
      expect(bodyOf(rs, `${sel}:focus-visible`)).toContain('outline:2pxsolidvar(--accent)')
      expect(bodyOf(rs, `${sel}:focus-visible`)).toContain('outline-offset:-2px')
      expect(bodyOf(rs, `${sel}:focus`), 'the browser\'s own ring off — a mouse or a finger leaves none').toContain('outline:none')
    })
  }
})

describe('D1771, D1646 — the buttons that open the board\'s small menus, under the keys', () => {
  const sel = '#schedBoard :is([data-dwadd],[data-sblkadd],[data-wvadd],.planselbtn,.stcfg,.mbtn.daybtn):focus-visible'
  it('+ Block, + Wave, the plans selector, a jet\'s stores and the day bar\'s buttons wear the cyan ring, just outside them', () => {
    /* one :is() list — the commas inside it are not a rule's selector list, so the rule is found by its whole text */
    const css = read('10-board-history.css').replace(/\s+/g, ' ')
    const at = css.indexOf(sel + '{'), b = at < 0 ? '' : css.slice(at + sel.length + 1, css.indexOf('}', at)).replace(/\s+/g, '')
    expect(at, 'the rule is declared').toBeGreaterThanOrEqual(0)
    expect(b).toContain('outline:2pxsolidvar(--accent)')
    expect(b).toContain('outline-offset:2px')
  })
})
