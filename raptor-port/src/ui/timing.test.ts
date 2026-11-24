/* THE ?timing SWITCH ([APP-SPEED] step 1 — owner D2481, D2483). Without it nothing runs: no mark is kept, nothing is
   downloaded, nothing is drawn. With it, the app notes four moments — its code loaded, its first screen drawn, the
   sign-in pressed, each page asked for — and hands them to the readout, which arrives as a download of its own. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { setTimingOnForTest, timingMark, timingSink, timingSwitch, type TimingMark } from './timing'
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
    const got: TimingMark[] = []
    timingSink(m => got.push(m))
    expect(got).toEqual([])
  })
  it('on: marks made before the readout arrives wait for it, in order; later ones go straight to it', () => {
    setTimingOnForTest(true)
    timingMark({ kind: 'boot', t: 1 })
    timingMark({ kind: 'first', t: 2, screen: 'signin' })
    const got: TimingMark[] = []
    timingSink(m => got.push(m))
    timingMark({ kind: 'signin', t: 3 })
    expect(got.map(m => m.kind)).toEqual(['boot', 'first', 'signin'])
  })
  it('a page change is marked with the page asked for; staying on the same page is not', () => {
    setPage('viewsched')
    setTimingOnForTest(true)
    const got: TimingMark[] = []
    timingSink(m => got.push(m))
    setPage('editsched')
    setPage('editsched')
    setPage('leavewar')
    expect(got.map(m => m.kind === 'page' ? m.page : m.kind)).toEqual(['editsched', 'leavewar'])
  })
  it('off, a page change marks nothing', () => {
    setTimingOnForTest(false)
    const got: TimingMark[] = []
    timingSink(m => got.push(m))
    setPage('editsched')
    expect(got).toEqual([])
  })
})

describe('where the app wires it', () => {
  const src = (f: string) => readFileSync(join(__dirname, f), 'utf8')
  it('the readout is downloaded only behind the switch — never part of the app\'s first download', () => {
    const main = src('../main.tsx')
    expect(main).toMatch(/if \(timingOn\(\)\)[^\n]*import\('\.\/ui\/TimingReadout'\)/)
    for (const f of ['../main.tsx', 'Shell.tsx', 'App.tsx', 'Login.tsx', '../state/view.ts']) expect(src(f), f).not.toMatch(/from '\.\/TimingReadout'|from '\.\.\/ui\/TimingReadout'|from '\.\/ui\/TimingReadout'/)
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
