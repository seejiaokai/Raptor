// @vitest-environment node — reads a stylesheet off disk (the rowglow.test.ts shape)
/* The lift recipe as a CSS CONTRACT. jsdom paints nothing, so an outer shadow
   that the card clips, a frame that lost its absolute position, or a veil that
   animates layout is unreachable from the ordinary suite — the file is the
   only witness. */
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const css = readFileSync(new URL('./scheduler.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const RULES = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(m => ({ sels: m[1]!.split(',').map(s => s.trim().replace(/\s+/g, ' ')), body: m[2]! }))
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
})
