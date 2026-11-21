// @vitest-environment jsdom
/* C3 (Fable F2): an ALL AVAIL commitment filed in 142 changes squadron when its filer is moved to 149. Correct: a
   squadron's own commitment stays on that squadron's schedule (each squadron's own world — the brief's promise 1;
   D2097's reading: each squadron's ALL AVAIL counts its own people; D2194 one squadron's business never the other's).
   — ANSWERED by D2243 (Q1): it stays on the squadron it was filed on. Filing stamps that squadron, `u`, on a
   placeholder-only input — the input window's save (ui/inputedit.tsx commitNewInput / commitInput, handed the window's
   squadron by ui/InputWindow.tsx) and the demo seed's placeholder inputs (state/demoseed.ts); the reader
   (engine/inputs.ts inputSquadrons' placeholder branch, core) honours it.
   Copied word for word from docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/c-c03-allavail-follows-filer.test.ts.txt
   — only the harness changed (test-support/msq-world.ts; `boot()` goes, its world boots itself) and the one call the
   reshape changes: the filing goes through the window's save (commitInput, as the window calls it for an input of ALL
   AVAIL), not a raw push of a record no door wrote. The assertions are the proof's. */
import { useMsqWorld, at, signInAs } from '../test-support/msq-world'
import { describe, expect, it } from 'vitest'
import { INPUTS, inputBelongs, inputUnitOf } from '../engine/inputs'
import { setHome } from '../state/units'
import { commitInput, commitNewInput } from '../ui/inputedit'
import { seedDemoPlaceholders } from '../state/demoseed'

useMsqWorld()

describe("C3 — an ALL AVAIL commitment and its filer's move", () => {
  it("a 142 meeting for ALL AVAIL on 20 Jul stays 142's after its filer moves to 149", () => {
    at('2026-07-12')
    signInAs('us', 'us')                                      // bane, a 142 man, files it in 142
    const had = new Set(INPUTS.map((x: any) => x.iid))
    const ok = commitInput(null, { type: 'Meeting', start: '2026-07-20', allday: true, remarks: '142 brief', u: 'u142' }, ['allavail'])
    expect(ok).toBeTruthy()
    const r = INPUTS.find((x: any) => !had.has(x.iid) && x.remarks === '142 brief')
    expect(r, 'filed').toBeTruthy()
    expect(inputBelongs(r, 'u142'), "control: 142's when filed").toBe(true)
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)            // 149's from 13 Jul
    expect(inputBelongs(r, 'u142'), "still on 142's schedule and Inputs").toBe(true)
    expect(inputBelongs(r, 'u149'), "not landed on 149's 20 Jul").toBe(false)
    expect(inputUnitOf(r)).toBe('u142')
  })
})

describe('C3 — the stamp at each filing door', () => {
  it('the one-placeholder save (commitNewInput) stamps the squadron it was filed on; a named man\'s input carries none', () => {
    signInAs('saber')
    const had = new Set(INPUTS.map((x: any) => x.iid))
    expect(commitNewInput({ person: 'all', type: 'Event', start: '2026-07-21', allday: true, remarks: 'c3 one', u: 'u142' })).toBe(true)
    expect(commitNewInput({ person: 'bane', type: 'Event', start: '2026-07-21', allday: true, remarks: 'c3 named', u: 'u142' })).toBe(true)
    const mine = INPUTS.filter((x: any) => !had.has(x.iid))
    expect(mine.find((x: any) => x.remarks === 'c3 one')?.u).toBe('u142')
    expect(mine.find((x: any) => x.remarks === 'c3 named')).not.toHaveProperty('u')
  })
  it('a save of several naming a man beside ALL AVAIL is not placeholder-only, so it carries no stamp', () => {
    signInAs('saber')
    const had = new Set(INPUTS.map((x: any) => x.iid))
    expect(commitInput(null, { type: 'Meeting', start: '2026-07-21', allday: true, remarks: 'c3 both', u: 'u142' }, ['allavail', 'bane'])).toBe(true)
    expect(INPUTS.find((x: any) => !had.has(x.iid))).not.toHaveProperty('u')
  })
  it('with no squadron handed in, the save stamps the page\'s own squadron', () => {
    signInAs('saber')
    const had = new Set(INPUTS.map((x: any) => x.iid))
    expect(commitNewInput({ person: 'allavail', type: 'Meeting', start: '2026-07-21', allday: true, remarks: 'c3 page' })).toBe(true)
    expect(INPUTS.find((x: any) => !had.has(x.iid))?.u).toBe('u142')
  })
  it('the demo seed\'s placeholder inputs carry their squadron', () => {
    for (let i = INPUTS.length - 1; i >= 0; i--) if (INPUTS[i] && (INPUTS[i] as any).people?.some((e: any) => e.p === 'all' || e.p === 'allavail')) INPUTS.splice(i, 1)
    seedDemoPlaceholders()
    const ph = INPUTS.filter((x: any) => x.people?.some((e: any) => e.p === 'all' || e.p === 'allavail'))
    expect(ph.length).toBe(2)
    for (const r of ph) expect((r as any).u, String((r as any).type)).toBe('u142')
  })
})
