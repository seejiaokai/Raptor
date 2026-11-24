/* THE ?timing SWITCH ([APP-SPEED] step 1 — owner D2481, D2483). Without it nothing runs: no mark is kept, nothing is
   downloaded, nothing is drawn. With it, the app notes four moments — its code loaded, its first screen drawn, the
   sign-in pressed, each page asked for — and hands them to the readout, which arrives as a download of its own. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { setMarkTapForTest, setTimingOnForTest, timingMark, timingSink, timingSwitch, type TimingEvent, type TimingMark } from './timing'
import { setPage } from '../state/view'

afterEach(() => { setTimingOnForTest(false); setPage('viewsched') })

describe('the switch on the address', () => {
  it('is on for ?timing, ?timing=1 and ?timing among other switches; off otherwise', () => {
    for (const q of ['?timing', '?timing=1', '?x=1&timing', '?timing&savefail', '?savefail&timing=yes']) expect(timingSwitch(q), q).toBe(true)
    for (const q of ['', '?', '?timings', '?mytiming', '?x=timing', '?savefail']) expect(timingSwitch(q), q).toBe(false)
  })
})

describe('the marks', () => {
  it('off: a mark is dropped, and a readout that arrives later is handed nothing', () => {
    setTimingOnForTest(false)
    timingMark({ kind: 'boot', t: 1 })
    const got: TimingEvent[] = []
    timingSink(m => got.push(m))
    expect(got).toEqual([])
  })
  it('on: results made before the readout arrives wait for it, in order; later ones go straight to it', () => {
    setTimingOnForTest(true)
    timingMark({ kind: 'boot', t: 1 })
    timingMark({ kind: 'first', t: 2, screen: 'signin' })
    const got: TimingEvent[] = []
    timingSink(m => got.push(m))
    timingMark({ kind: 'signin', t: 3 })
    expect(got.map(m => m.kind)).toEqual(['boot', 'first', 'signin'])
  })
  it('a page change is marked with the page asked for; staying on the same page is not', () => {
    setPage('viewsched')
    setTimingOnForTest(true)
    const got: TimingMark[] = []
    setMarkTapForTest(m => got.push(m))
    setPage('editsched')
    setPage('editsched')
    setPage('leavewar')
    expect(got.map(m => m.kind === 'page' ? m.page : m.kind)).toEqual(['editsched', 'leavewar'])
  })
  it('off, a page change marks nothing', () => {
    setTimingOnForTest(false)
    const got: TimingMark[] = []
    setMarkTapForTest(m => got.push(m))
    setPage('editsched')
    expect(got).toEqual([])
  })
})

/* ASTRA'S CODE READ, CHAT 165, 5 (and the re-walk's W27): on a phone, with 30 pages in it, the window stood 12px below
   the screen's top — over the top bar and the failed-save band's Retry (his D1523: a window stands clear of the band).
   The top bar's live height (--topbar-h, the band in it) caps its height, and its rows scroll inside it */
describe('a phone: the window stands under the top bar', () => {
  it('its height is capped by the top bar\'s live height, both ways a browser reads it', () => {
    const css = readFileSync(join(__dirname, 'timing.css'), 'utf8')
    const phone = css.slice(css.indexOf('@media (max-width:620px)'))
    expect(phone).toContain('max-height:calc(100vh - var(--topbar-h, 0px) - 20px)')
    expect(phone).toContain('max-height:calc(100dvh - var(--topbar-h, 0px) - 20px)')
  })
})

describe('where the app wires it', () => {
  const src = (f: string) => readFileSync(join(__dirname, f), 'utf8')
  it('the readout is downloaded only behind the switch — never part of the app\'s first download', () => {
    const main = src('../main.tsx')
    expect(main).toMatch(/if \(timingOn\(\)\)[^\n]*import\('\.\/ui\/timingwindow'\)/)
    for (const f of ['../main.tsx', 'Shell.tsx', 'App.tsx', 'Login.tsx', '../state/view.ts']) expect(src(f), f).not.toMatch(/from '(\.\/|\.\.\/ui\/|\.\/ui\/)(TimingReadout|timingwindow)'/)
  })
  /* THE WALK OF 24 NOV 26 (chat 164, W1): the readout imported React and the app's movable window itself, and the
     bundler, to share them with it, split the app's OWN first download from 15 files into 19 — for everyone, switch or
     not. So the readout's files take React and the window from the app as they are handed them, and import nothing
     the app's download holds; and they write no JSX, which brings React's own JSX file in with it. */
  it('the readout imports nothing the app\'s first download holds — it is handed React and the window — so the app\'s own files split as before', () => {
    const code = (f: string) => src(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
    for (const f of ['timingwindow.tsx', 'TimingReadout.tsx']) {
      const runtime = [...code(f).matchAll(/^import\s+(?!type\b)[^'"]*['"]([^'"]+)['"]/gm)].map(m => m[1])
      expect(runtime.filter(p => !['./TimingReadout', './timingtext', './timing.css'].includes(p)), f).toEqual([])
      expect(code(f), f + ': JSX').not.toMatch(/<\/[A-Za-z]|\/>/)
    }
  })
  it('the sign-in is marked only once the name and password are accepted', () => {
    const login = src('Login.tsx')
    const bad = login.indexOf("if (r.kind === 'bad')")
    const mark = login.indexOf("timingMark({ kind: 'signin'")
    expect(bad).toBeGreaterThan(0)
    expect(mark).toBeGreaterThan(bad)
  })
  it('the first screen is marked where the loading claw is taken away, and the app\'s code where it starts', () => {
    const main = src('../main.tsx')
    expect(main).toMatch(/timingMark\(\{ kind: 'first'/)
    expect(main).toMatch(/timingMark\(\{ kind: 'boot'/)
  })
})
