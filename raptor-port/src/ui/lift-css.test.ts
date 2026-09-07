// @vitest-environment node — reads a stylesheet off disk (the rowglow.test.ts shape)
/* The lift recipe as a CSS CONTRACT. jsdom paints nothing, so an outer shadow
   that the card clips, a frame that lost its absolute position, or a veil that
   animates layout is unreachable from the ordinary suite — the file is the
   only witness. */
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const css = readFileSync(new URL('./scheduler.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const RULES = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(m => ({ sels: m[1]!.split(',').map(s => s.trim().replace(/\s+/g, ' ')), body: m[2]!, at: m.index! }))
const rulesFor = (sel: string) => RULES.filter(r => r.sels.includes(sel))
const bodyOf = (sel: string) => rulesFor(sel).map(r => r.body).join(' ').replace(/\s+/g, ' ')
/** box-shadow layers: split on the commas that are not inside rgba(...) */
const layers = (shadow: string) => shadow.split(/,(?![^(]*\))/).map(s => s.trim())
/** What a selector can actually MATCH — its `:not(…)` arguments dropped. The
 *  veil's own rule is `.lift-land:not(.lift-frame)`, which NAMES the frame in
 *  order to exclude it; a plain substring scan for `.lift-frame` reads that as
 *  a rule setting the frame to `relative` and flags the one guard the frame
 *  depends on. */
const matches = (sel: string) => sel.replace(/:not\([^)]*\)/g, '')
const keyframes = (name: string) => {
  const i = css.indexOf(`@keyframes ${name}`)
  expect(i, `@keyframes ${name} exists`).toBeGreaterThan(-1)
  const rest = css.slice(i)
  return rest.slice(0, rest.indexOf('}}') + 2)
}
/** The character span of every `@media (prefers-reduced-motion:reduce)` block,
 *  brace-matched — the rowglow.test.ts HOVER_MEDIA shape. A rule's position is
 *  the question here, not its existence: `animation:none` written OUTSIDE the
 *  guard would kill the flash for everybody. */
const REDUCED: Array<[number, number]> = [...css.matchAll(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{/g)].map(m => {
  let i = m.index! + m[0]!.length, depth = 1
  while (i < css.length && depth > 0) { if (css[i] === '{') depth++; else if (css[i] === '}') depth--; i++ }
  return [m.index!, i] as [number, number]
})
const insideReduced = (at: number) => REDUCED.some(([a, b]) => at > a && at < b)

describe('the lift recipe — one box, drawn INSIDE the line', () => {
  it('--lift-box is the owner\'s Soft, every layer inset', () => {
    const m = bodyOf(':root').match(/--lift-box:\s*([^;]+)/)
    expect(m, ':root declares --lift-box').toBeTruthy()
    const v = m![1]!.replace(/\s+/g, ' ').trim()
    expect(v).toBe('inset 0 0 0 2px var(--accent), inset 0 0 12px rgba(59,198,232,.30)')
    for (const l of layers(v)) expect(l.startsWith('inset'), `${l} is inset`).toBe(true)
  })
  it('.lift wears it with the 8px radius', () => {
    const b = bodyOf('.lift')
    expect(b).toMatch(/box-shadow:\s*var\(--lift-box\)/)
    expect(b).toMatch(/border-radius:\s*8px/)
  })
  it('nothing keys .lift off a body / html / root class — a toggled root class restyles the page', () => {
    const keyed = RULES.filter(r => r.sels.some(s => /^(body|html|:root)[.[]/.test(s) && /\.lift\b/.test(s)))
    expect(keyed.map(r => r.sels.join(', '))).toEqual([])
  })
})

describe('the frame', () => {
  it('is absolute, z 7, pointer-events none, hidden until it carries lift or lift-land', () => {
    const b = bodyOf('.lift-frame')
    expect(b).toMatch(/position:\s*absolute/)
    expect(b).toMatch(/z-index:\s*7\b/)
    expect(b).toMatch(/pointer-events:\s*none/)
    expect(b).toMatch(/display:\s*none/)
    expect(bodyOf('.lift-frame.lift')).toMatch(/display:\s*block/)
    expect(bodyOf('.lift-frame.lift-land')).toMatch(/display:\s*block/)
  })
  it('no rule moves it off absolute — the veil\'s relative rule excludes it', () => {
    for (const r of RULES) {
      if (!r.sels.some(s => matches(s).includes('.lift-frame'))) continue
      const p = r.body.match(/position:\s*([a-z-]+)/)
      if (p) expect(p[1], `${r.sels.join(', ')} keeps the frame absolute`).toBe('absolute')
    }
    const relative = RULES.filter(r => /position:\s*relative/.test(r.body) && r.sels.some(s => s.includes('.lift-land')))
    expect(relative.length, 'a plain landed element gets its positioning context').toBeGreaterThan(0)
    for (const r of relative) for (const s of r.sels) if (s.includes('.lift-land')) expect(s).toContain(':not(.lift-frame)')
  })
  it('the bloom is on the frame alone — a transform keyframe would fight a ghost\'s inline transform', () => {
    const users = RULES.filter(r => /animation:[^;]*liftIn/.test(r.body))
    expect(users.length).toBe(1)
    expect(users[0]!.sels).toEqual(['.lift-frame.lift'])
  })
})

describe('the landing flash', () => {
  it('is a veil ::after, inset-only, and animates opacity and nothing else', () => {
    const v = bodyOf('.lift-land::after')
    expect(v).toMatch(/content:\s*''/)
    expect(v).toMatch(/position:\s*absolute/)
    expect(v).toMatch(/inset:\s*0/)
    expect(v).toMatch(/pointer-events:\s*none/)
    expect(v).toMatch(/background:\s*rgba\(59,198,232,\.20\)/)
    expect(v).toMatch(/box-shadow:\s*var\(--lift-box\)/)
    expect(v).toMatch(/animation:\s*liftLand 600ms/)
    const kf = keyframes('liftLand')
    const props = [...kf.matchAll(/([a-z-]+):/g)].map(m => m[1])
    expect(props.every(p => p === 'opacity'), `liftLand animates ${props.join(',')}`).toBe(true)
    expect(kf).toMatch(/0%,\s*25%\s*\{opacity:1\}/)
  })

  /* THE VEIL NEEDS ITS OWN REDUCED-MOTION RULE (review, 6 Sep 26). The blanket
     `@media (prefers-reduced-motion:reduce){*{animation:none!important}}` reaches
     the FRAME's bloom, because `*` matches elements — but `.lift-land::after` is
     a PSEUDO-element, which `*` does not match, so the landing fade ran at full
     600ms for a user who asked for no motion. Measured in Chromium: the veil's
     computed animation-name read `liftLand` under reducedMotion:'reduce' while
     its host element's read `none`. The file already knew the shape of the cure
     — `.legend-sum::before` carries the same targeted override — and .sb-fresh
     puts its one right beside the animation it cancels, which is where this sits.
     The feedback is not lost: the class still HOLDS for LIFT_LAND_MS and lift.ts's
     timer takes it off. */
  it('the veil is silenced under reduced motion by its OWN rule — `*` never matches a pseudo-element', () => {
    const off = RULES.filter(r => r.sels.includes('.lift-land::after') && /animation:\s*none/.test(r.body))
    expect(off.length, '.lift-land::after declares animation:none somewhere').toBe(1)
    expect(insideReduced(off[0]!.at), 'and it is INSIDE @media (prefers-reduced-motion:reduce) — outside it, nobody gets the flash').toBe(true)
    // the blanket itself is untouched and still uses the wildcard it always did
    expect(RULES.some(r => r.sels.includes('*') && /animation:\s*none\s*!important/.test(r.body) && insideReduced(r.at)),
      'the blanket still stands (it is what silences the frame\'s bloom)').toBe(true)
  })
})

/* THE HOST ARRANGES AROUND THE FRAME (review, 7 Sep 26). The quals column frame
   is the one frame in the app that TRAVELS: it is placed in `.qwrap`'s content
   coordinates so it rides the sideways scroll with its column, which means a
   scrolled column slides its whole rectangle under the FROZEN callsign column —
   and at the shared recipe's z 7 it drew its cyan ring over the frozen names.
   Dropping the frame alone is not the cure either: below `.qtbl thead th`'s
   opaque z 2 the ring round the PICKED-UP heading disappears on every ordinary
   drag. So the numbers are a set, and the set is what this pins — read out of
   the file and compared to each other, so a later re-tune of any one of them
   has to keep the order that makes the picture right. */
describe('the quals column frame stacks under the frozen column and over the headings', () => {
  const zOf = (sel: string) => {
    const m = bodyOf(sel).match(/z-index:\s*(-?\d+)/)
    expect(m, `${sel} declares a z-index`).toBeTruthy()
    return Number(m![1])
  }
  it('the frame sits at the heading row\'s own level and below both frozen cells', () => {
    const frame = zOf('.qwrap .lift-frame'), head = zOf('.qtbl thead th')
    const name = zOf('.qtbl td.qname'), corner = zOf('.qtbl thead th[data-sort="cs"]')
    /* at-or-above the heading row: the frame is rendered AFTER the table inside
       .qwrap, so an equal z-index still paints it over the heading it wraps */
    expect(frame, 'the ring shows over the picked-up heading').toBeGreaterThanOrEqual(head)
    /* and under the frozen column, which then covers the frame's overhang
       exactly as it covers the column's own cells */
    expect(frame, 'the frozen callsign cells win over the travelling frame').toBeLessThan(name)
    expect(frame).toBeLessThan(corner)
    /* the corner still out-ranks every other heading (it is the one place the
       frozen column and the heading row DO meet) */
    expect(corner).toBeGreaterThan(head)
    expect(corner).toBeGreaterThan(name)
  })
  it('the host rule re-stacks the frame and nothing else — position and hit-testing are the recipe\'s', () => {
    expect(rulesFor('.qwrap .lift-frame').length, 'one host rule').toBe(1)
    expect(bodyOf('.qwrap .lift-frame').replace(/z-index:\s*-?\d+;?/, '').trim(), 'z-index only').toBe('')
  })
})
