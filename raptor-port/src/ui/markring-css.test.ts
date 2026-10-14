// @vitest-environment node — reads a stylesheet off disk (the lift-css.test.ts shape)
import { readSchedulerCss } from '../testing/scheduler-css'
/* THE JUST-ADDED MARK IS ONE LOOK EVERYWHERE (owner D860, 15 Oct 26 — "the blue ring … on scheduler board … doesn't
   have glow. Like the one u designed for inputs. Can u match the blue ring like the one on scheduler board for the
   input"). The board's ring (`.sb-fresh`) is a plain inset ring with no outer glow — its glow was dropped on 16 Aug 26
   because a clipping parent swallowed it on some sides. Every input mark — the List's row, the opened day's card, the
   month's bar, moving or steady for a reader who asked for less motion — wears exactly that: an inset ring of the
   app's one blue, and no layer of that blue that is not inset. jsdom paints nothing, so the file is the witness. */
import { describe, it, expect } from 'vitest'

const css = readSchedulerCss().replace(/\/\*[\s\S]*?\*\//g, '')
/** box-shadow layers: split on the commas that are not inside rgba(...) */
const layers = (shadow: string) => shadow.split(/,(?![^(]*\))/).map(s => s.trim())
const BLUE = /#1E86FF|rgba\(30,\s*134,\s*255/i
/* every box-shadow, inside a keyframe or a rule, written in the blue */
const blueShadows = [...css.matchAll(/box-shadow:([^;}]+)/g)].map(m => m[1]!).filter(v => BLUE.test(v))

describe('the just-added mark: the board\'s plain ring, everywhere (D860)', () => {
  it('the board\'s own ring is a plain inset ring', () => {
    const m = css.match(/\.sb-fresh\{([^}]*)\}/)
    expect(m, 'the board\'s ring is still there').toBeTruthy()
    expect(m![1]).toMatch(/box-shadow:inset 0 0 0 2px #1E86FF/)
  })
  it('no shadow in the app\'s blue spreads outside its box — no glow on any mark', () => {
    expect(blueShadows.length, 'the marks are found').toBeGreaterThan(5)
    const glowing = blueShadows.filter(v => layers(v).some(l => BLUE.test(l) && !/\binset\b/.test(l)))
    expect(glowing, 'every blue layer is inset').toEqual([])
  })
  it('the input marks and their steady form for less motion are each the board\'s ring', () => {
    for (const name of ['inflash', 'inflash-timed']) {
      const kf = css.match(new RegExp(`@keyframes ${name}\\{([\\s\\S]*?\\})\\s*\\}`))
      expect(kf, `${name} is there`).toBeTruthy()
      expect(kf![1], `${name} holds the ring`).toMatch(/inset 0 0 0 2px #1E86FF/)
    }
  })
  /* (owner D861 — "I want a box, so it's standardised") the desktop List's row is ONE box: its cells each draw their share */
  it('the List\'s row is one box round the whole row — top and bottom on every cell, the sides on the first and last only', () => {
    const body = (sel: string) => { const i = css.indexOf(sel + '{'); return i < 0 ? '' : css.slice(i + sel.length + 1, css.indexOf('}', i)) }
    const all = body('.innew>td::after')
    expect(all).toMatch(/border-top:2px solid #1E86FF/)
    expect(all).toMatch(/border-bottom:2px solid #1E86FF/)
    expect(all, 'no side on every cell — that was a box per cell').not.toMatch(/border-(left|right)/)
    expect(body('.innew>td:first-child::after')).toMatch(/border-left:2px solid #1E86FF/)
    expect(body('.innew>td:last-child::after')).toMatch(/border-right:2px solid #1E86FF/)
    expect(body('.innew>td'), 'no cell of the List wears the ring as its own shadow any more').not.toMatch(/box-shadow/)
  })
  /* (owner D861 — "same thing no glow") a bar that wears the ring shows no landing flash before it */
  it('a month\'s bar wearing the ring shows no landing flash', () => {
    expect(css.includes('.ib-bar.innew.lift-land::after{content:none}')).toBe(true)
  })
})
