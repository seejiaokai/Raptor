import { describe, expect, it } from 'vitest'
import { qualSwatch } from './groupColor'

/* The swatch beside a group heading. Built-in groups are painted by CSS class;
   a qualification group an admin adds gets a deterministic colour of its own so
   it never renders as a broken black square (owner, 3 Sep 26 — "its all black
   now" / "do we even need a colour?" — no picker, hand it one). */
describe('qualSwatch', () => {
  it('leaves built-in, SANS and Everyone-else groups to the stylesheet', () => {
    for (const id of ['SXO', 'IP', 'OPSP', 'IWSO', 'OPSW', 'OCU', 'PERS', 'SANS', 'OTHER']) {
      expect(qualSwatch(id), id).toBeUndefined()
    }
  })

  it('hands a qualification group one of the palette tokens', () => {
    expect(qualSwatch('q:scDay')).toMatch(/^var\(--gq-[1-6]\)$/)
  })

  it('is deterministic — the same qualification keeps its colour across reloads', () => {
    expect(qualSwatch('q:scNight')).toBe(qualSwatch('q:scNight'))
  })

  it('spreads several custom groups across more than one colour', () => {
    const seen = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(k => qualSwatch(`q:${k}`)))
    expect(seen.size).toBeGreaterThan(1)
  })
})
