// @vitest-environment jsdom
/* The page names beside TALON, or the side menu (owner D1641, D1642, D1643, 4 Nov 26 — ui/navfold.ts). jsdom lays nothing
   out, so the bar's sizes are stood in here; the real widths, his iPhone's wider letters and a phone on its side are the
   browser test's (e2e/topbar-names.spec.ts) and the walk's. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { namesFit, mustFold, SIDEWAYS_PHONE } from './navfold'

/* a bar of `inner` px inside 20px of padding each side, TALON `mark` wide, a 14px gap, the names `need` wide */
function bar({ inner, mark = 150, need }: { inner: number; mark?: number; need: number }) {
  const b = document.createElement('div'); b.className = 'topbar'
  b.style.paddingLeft = '20px'; b.style.paddingRight = '20px'; b.style.columnGap = '14px'
  const m = document.createElement('div'); m.className = 'mark'
  const n = document.createElement('nav'); n.id = 'topnav'; n.style.marginLeft = '6px'
  b.append(m, n); document.body.append(b)
  Object.defineProperty(b, 'clientWidth', { configurable: true, value: inner + 40 })
  m.getBoundingClientRect = () => ({ width: mark } as DOMRect)
  n.getBoundingClientRect = () => ({ width: need } as DOMRect)
  return b
}
const media = (matching: string[]) => vi.spyOn(window, 'matchMedia').mockImplementation((q: string) =>
  ({ matches: matching.includes(q), media: q, addEventListener() { }, removeEventListener() { } }) as unknown as MediaQueryList)

afterEach(() => { vi.restoreAllMocks(); document.body.innerHTML = '' })
if (typeof window.matchMedia !== 'function') (window as any).matchMedia = () => ({ matches: false, addEventListener() { }, removeEventListener() { } })

describe('the page names stand beside TALON only where they all fit (D1641, D1642)', () => {
  it('fits to the pixel, with half a pixel for rounding and no more', () => {
    expect(namesFit(695, 706)).toBe(true)
    expect(namesFit(706.4, 706)).toBe(true)
    expect(namesFit(707, 706)).toBe(false)
  })
  it('a wide desktop keeps them beside TALON; the same names with too little room fold into ☰', () => {
    media([])
    /* room = inner 900 − TALON 150 − gap 14 − margin 6 = 730 */
    expect(mustFold(bar({ inner: 900, need: 695 }))).toBe(false)
    document.body.innerHTML = ''
    /* his iPhone's wider letters: the same bar, the names 765 wide — they would wrap, so they fold */
    expect(mustFold(bar({ inner: 900, need: 765 }))).toBe(true)
  })
  it('a member, two names fewer, can keep them where an admin folds', () => {
    media([])
    expect(mustFold(bar({ inner: 760, need: 695 }))).toBe(true)
    document.body.innerHTML = ''
    expect(mustFold(bar({ inner: 760, need: 522 }))).toBe(false)
  })
  it('a phone held sideways always folds, for everyone, even where the names would fit (D1643)', () => {
    media([SIDEWAYS_PHONE])
    expect(mustFold(bar({ inner: 1400, need: 522 }))).toBe(true)
  })
  it('the phone layout (820 wide and under) is left to its own ☰ — nothing is decided there', () => {
    media(['(max-width: 820px)'])
    expect(mustFold(bar({ inner: 300, need: 695 }))).toBe(false)
  })
  it('with no layout to measure (a bar not drawn yet) the names stay where the markup puts them', () => {
    media([])
    const b = bar({ inner: 0, need: 695 }); Object.defineProperty(b, 'clientWidth', { configurable: true, value: 0 })
    expect(mustFold(b)).toBe(false)
  })
})
