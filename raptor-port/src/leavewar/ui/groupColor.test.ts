import { describe, expect, it } from 'vitest'
import { PALETTE, groupColorOf, inkFor, isColourable, qualSwatch } from './groupColor'

/* The colour of a qualification group's swatch and popover pill. Built-in
   groups are painted by CSS class; a qualification group an admin adds takes
   the colour they PICKED (owner, 3 Sep 26 — "allow me to pick the colour i
   want"), and until they pick, a deterministic palette colour of its own, so it
   never renders as a broken black square ("its all black now"). */
describe('qualSwatch — the fallback', () => {
  it('leaves built-in, SANS and Everyone-else groups to the stylesheet', () => {
    for (const id of ['SXO', 'IP', 'OPSP', 'IWSO', 'OPSW', 'OCU', 'PERS', 'SANS', 'OTHER']) {
      expect(qualSwatch(id), id).toBeUndefined()
      expect(isColourable(id), id).toBe(false)
    }
  })

  it('hands a qualification group one of the palette colours', () => {
    expect(PALETTE).toContain(qualSwatch('q:scDay'))
    expect(isColourable('q:scDay')).toBe(true)
  })

  it('is deterministic — the same qualification keeps its colour across reloads', () => {
    expect(qualSwatch('q:scNight')).toBe(qualSwatch('q:scNight'))
  })

  it('spreads several custom groups across more than one colour', () => {
    const seen = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(k => qualSwatch(`q:${k}`)))
    expect(seen.size).toBeGreaterThan(1)
  })
})

describe('groupColorOf — the pick wins, the fallback stands in', () => {
  it('returns the stored pick for a qualification group, else the fallback', () => {
    expect(groupColorOf('q:tf', { 'q:tf': '#123456' })).toBe('#123456')
    expect(groupColorOf('q:tf', {})).toBe(qualSwatch('q:tf'))
  })

  it('never colours a built-in group, whatever is stored', () => {
    expect(groupColorOf('SXO', { SXO: '#123456' })).toBeUndefined()
  })
})

describe('inkFor — readable words on any pill', () => {
  it('puts dark text on a pale colour and light text on a deep one', () => {
    expect(inkFor('#F2C14E')).toBe('#12161b')     // yellow → dark ink
    expect(inkFor('#6C7BE0')).toBe('#F1F4F7')     // indigo → light ink
  })

  it('falls back to light ink on anything that is not a hex colour', () => {
    expect(inkFor('var(--x)')).toBe('#F1F4F7')
  })
})
