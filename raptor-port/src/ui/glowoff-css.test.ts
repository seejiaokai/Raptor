// @vitest-environment node — reads a stylesheet off disk (the markring-css.test.ts shape)
import { readSchedulerCss } from '../testing/scheduler-css'
/* THE BOARD'S OTHER GLOWS GO, EACH KEEPING ITS RING (owner D877, 15 Oct 26 — "all no glow", after the pictures of
   `docs/mock/2026-10-15-glow-places/`). The places he ruled on, each by the rule that draws it: the landing flash after a
   drag or an Undo and the picked-up look (the one recipe `--lift-box`); the crew and the time boxes a tapped warning
   lights, red, amber and grey, and the same crew's quieter dashed echo on the other days; a puck earning OIL in OIL Earn;
   his own puck ("this is you"); a puck a highlight chip lights. A roll-call over the rules, so a glow written back into
   any of them fails here. jsdom paints nothing, so the file is the witness; the walk saw them on screen.

   NOT ruled, and left as they are on purpose: the picked person chip of the Inputs calendar's "+ Pucks" picker
   (`.ic-pickp.on` — put to him with a picture first), the SANS puck's purple stripe (`.puck.san::after`), and a dragged
   thing's dark drop shadow under its ring (`0 8px 20px` black — depth, not a glow of a colour). */
import { describe, it, expect } from 'vitest'

const css = readSchedulerCss().replace(/\/\*[\s\S]*?\*\//g, '')
const RULES = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(m => ({ sels: m[1]!.split(',').map(s => s.trim().replace(/\s+/g, ' ')), body: m[2]!.replace(/\s+/g, ' ') }))
/** box-shadow layers: split on the commas that are not inside rgba(...) */
const layers = (shadow: string) => shadow.split(/,(?![^(]*\))/).map(s => s.trim())
/** the blur radius of one layer ('0 0 10px 1px rgba(…)' → 10); inset and colours skipped */
const blurOf = (layer: string) => {
  const lens = layer.replace(/rgba?\([^)]*\)/g, '').replace(/\binset\b/g, '').replace(/!important/g, '').match(/-?\d*\.?\d+(px)?/g) || []
  return parseFloat(lens[2] ?? '0')
}
const shadowsOf = (sel: string) => RULES.filter(r => r.sels.includes(sel))
  .map(r => (r.body.match(/box-shadow:\s*([^;]+)/) || [])[1]).filter((v): v is string => !!v)

/* each place he ruled on: the selector that draws it, and the ring it must keep */
const PLACES: [string, string, RegExp][] = [
  ['the warning-lit crew, red', '.puck.wfoc', /outline:2px solid var\(--hard\)/],
  ['the warning-lit crew, amber', '.puck.wfoc.advf', /outline-color:var\(--adv\)/],
  ['the warning-lit crew, grey', '.puck.wfoc.notef', /outline-color:#8A96A3/],
  ['the same crew on the other days, dashed', '.puck.wfoc.echo', /outline-style:dashed/],
  ['the warning-lit time boxes, red', '.badtm.wfoc', /box-shadow:inset 0 0 0 2px var\(--hard\)/],
  ['the warning-lit time boxes, amber', '.badtm.wfoc.advf', /box-shadow:inset 0 0 0 2px var\(--adv\)/],
  ['a puck earning OIL', '.puck.oilglow', /box-shadow:0 0 0 2px var\(--oil\)/],
  ['his own puck', '.puck.me:not(.warn):not(.boxred):not(.boxdash):not(.boxdot):not(.oilglow)', /box-shadow:0 0 0 2px #F0B6FF/],
  ['a highlighted puck', '.puck.hl', /box-shadow:0 0 0 2px var\(--accent\)/],
]

describe('D877 — the board\'s other glows go, each keeping its ring', () => {
  it('the picked-up look and the landing flash: the one recipe is the plain inset ring', () => {
    const m = css.match(/--lift-box:\s*([^;]+);/)
    expect(m, ':root declares --lift-box').toBeTruthy()
    expect(m![1]!.trim()).toBe('inset 0 0 0 2px var(--accent)')
  })
  for (const [name, sel, ring] of PLACES) {
    it(`${name}: keeps its ring, and no rule of it draws a glow`, () => {
      const bodies = RULES.filter(r => r.sels.includes(sel)).map(r => r.body)
      expect(bodies.length, `${sel} is still drawn`).toBeGreaterThan(0)
      expect(bodies.join(' '), `${sel} keeps its ring`).toMatch(ring)
      for (const sh of shadowsOf(sel)) for (const l of layers(sh)) expect(blurOf(l), `${sel} — "${l}" is a glow`).toBe(0)
    })
  }
  it('his own puck keeps its purple fill', () => {
    expect(RULES.filter(r => r.sels.includes('.puck.me')).map(r => r.body).join(' ')).toMatch(/background-color:var\(--me\)/)
  })
  it('a half-day OIL puck and a full day wear the same ring now; the amount tag still tells them apart', () => {
    expect(shadowsOf('.puck.oilglow.half'), 'no separate half-day ring left to drift').toEqual([])
    expect(RULES.filter(r => r.sels.includes('.puck .role.oilamt.half')).map(r => r.body).join(' ')).toMatch(/background:var\(--oil-half\)/)
  })
  it('the landing flash and every drag still wear the recipe, so the change reached them all', () => {
    for (const sel of ['.lift', '.sb-line.lift', '.ic-sec.dragging'])
      expect(RULES.filter(r => r.sels.includes(sel)).map(r => r.body).join(' '), `${sel} wears --lift-box`).toMatch(/var\(--lift-box\)/)
  })
})
