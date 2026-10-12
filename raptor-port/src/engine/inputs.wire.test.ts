/* THE RULES GATE'S OWN "CANCELLED OR INFORMATION ONLY" TERM — A WIRE NO TEST HELD ([ALL-AVAIL-AS-MEMBER], the break
   tests of 12 Oct 26 — docs/superpowers/briefs/2026-10-12-one-rule-break-tests-brief.md, group 2). Written with the
   term taken out of inputs.ts inputFlags on purpose: red then, green on the gate as built.

   Owner D760 reading 1: "a cancelled input earns nobody OIL and is not checked against the rules, as a cancelled row
   today". In the running app the validator reaches inputFlags only through events.ts inpShow, which has ALREADY asked
   inputSilent two lines earlier — so with this term gone every screen test stayed green (ui/inputmarks-scenarios pins
   inpShow's own two lines, and goes red when THEY go). What is left reading the gate by itself is the reference seed's
   filter (testing/refwin.ts) and the developer's bridge: no door of the app shows the term alone, so it is asked here
   directly, of records shaped as the app stores them. */
import { describe, it, expect } from 'vitest'
import { inputFlags, inputSilent } from './inputs'

const REC = (over: any = {}) => ({ iid: 'i-wire', people: [{ p: 'bane', h: 0 }], type: 'Training', date: 'Jul 15', yr: 2026, allday: true, s: 0, e: 1439, remarks: '', ...over })

describe('inputFlags — a cancelled or information-only input is not checked against the rules (D760 reading 1)', () => {
  it('THE CONTROL — an all-day input with neither mark speaks', () => {
    expect(inputSilent(REC())).toBe(false)
    expect(inputFlags(REC())).toBe(true)
  })
  it('CANCELLED: silent — with a reason or none', () => {
    expect(inputFlags(REC({ cx: true, cxr: 'WX' }))).toBe(false)
    expect(inputFlags(REC({ cx: true }))).toBe(false)
  })
  it('INFORMATION ONLY: silent', () => {
    expect(inputFlags(REC({ info: true }))).toBe(false)
  })
  it('the red box alone silences nothing — it is a mark to look at, not a cancel', () => {
    expect(inputFlags(REC({ flag: true }))).toBe(true)
  })
  it('brought back — the mark taken off — it speaks again', () => {
    const r: any = REC({ cx: true, cxr: 'WX' })
    r.cx = false; delete r.cxr
    expect(inputFlags(r)).toBe(true)
  })
})
