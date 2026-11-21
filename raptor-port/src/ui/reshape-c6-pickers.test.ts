// @vitest-environment jsdom
/* C6 (Fable F3c, Opus F1 step 5): the people pickers (ui/inputedit.ts rosterOptions -> peoplepick-model pickRoster ->
   PeoplePick; the InputWindow's Person list; the schedule's "+ input" seed pool) read the squadron on TODAY. Correct: the
   picker offers whom the save will accept for the draft's days — the commit gate judges an input by its man's squadron on
   every day it covers (job 2, state/multi-sqn-job2-inputs.test.ts), and D2221 lets each squadron's admin act on the days
   that are his squadron's. Two directions: 149's admin is not offered the man whose 149 days he may file; 142's admin
   is offered him for days the gate will refuse.
   Copied word for word from docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/c-c06-pickers-read-today.test.ts.txt
   — only the harness changed (test-support/msq-world.ts; `boot()` goes) and the one call the reshape renames: the picker
   takes the draft's first day (the reshape plan §3.3 C6 — `pickRoster(sansOnly, unit, iso)`), Tue 14 Jul and Mon 20 Jul.

   Then the reshape's own (§3.3 C6, §3.4; D2221 as D2240 and D2241 read it): the whole-draft answer — a man is offered
   where the draft with him added passes (state/perms.ts inputWhoProblem); the save door asks before the gate, and an
   existing input's save too; its refusal in his approved words (D2240, D2241): "Not saved: Ranger is 149's from Thu 16
   Jul. Only Ranger or an admin of both 142 and 149 can change leave that runs across his move."; and the table of actor
   × span × move, where the picker never offers whom the save refuses, and offers whom it accepts on the page of his
   squadron on the draft's first day. */
import { useMsqWorld, at, signInAs, acrossMove, PID } from '../test-support/msq-world'
import { describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { writeInputsBatch, switchUnit } from '../state/store'
import { setHome, homeOn } from '../state/units'
import { myUnit, me } from '../state/perms'
import { pickRoster } from '../ui/peoplepick-model'
import { offersFor, whoDoorRefusal, draftImage, rosterOptions } from '../ui/inputedit'

useMsqWorld()

describe('C6 — the pickers and a move of squadron', () => {
  it("149's admin, filing for Tue 14 Jul (bane's first 149 days), is offered bane — the save accepts it", () => {
    at('2026-07-12')
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)            // 149's from 13 Jul
    signInAs('ad9', 'a9')
    expect(myUnit()).toBe('u149')
    /* the save itself accepts it (as job 2's third test) */
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'bane', date: 'Jul 14', endDate: 'Jul 16', yr: 2026, allday: true, type: 'LL', remarks: '149', by: 'kes9', at: Date.now(), iid: 'c06a', ord: 99906 } as any) })).toBeTruthy()
    expect(pickRoster(false, myUnit(), '2026-07-14'), "149's picker offers him").toContain('bane')
  })
  it("142's admin, filing for 20 Jul (a 149 day), is not offered bane — the save refuses it", () => {
    at('2026-07-15')
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)            // 149's from 16 Jul
    signInAs('ad2', 'a2')
    expect(myUnit()).toBe('u142')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'bane', date: 'Jul 20', endDate: 'Jul 21', yr: 2026, allday: true, type: 'LL', remarks: '142', by: 'prowler', at: Date.now(), iid: 'c06b', ord: 99907 } as any) }), 'refused').toBe(false)
    expect(pickRoster(false, myUnit(), '2026-07-20'), "142's picker for a 149 day does not offer him").not.toContain('bane')
  })
})

const R = PID.ranger
const WORDS = "Not saved: Ranger is 149's from Thu 16 Jul. Only Ranger or an admin of both 142 and 149 can change leave that runs across his move."
const draft = (start: string, end?: string) => ({ type: 'LL', start, end: end ?? '', allday: true, remarks: '' })
/* the gate's own answer: the leave filed for real, then taken off again so the next row starts clean */
const saves = (start: string, end?: string): boolean => {
  const iid = `c6t-${Math.random().toString(36).slice(2)}`
  const ok = !!writeInputsBatch(() => { INPUTS.push({ ...draftImage(null, draft(start, end), [R]), yr: 2026, iid, by: me() ?? 'x', at: Date.now(), ord: 99950 } as any) })
  const i = INPUTS.findIndex((x: any) => x.iid === iid)
  if (i >= 0) writeInputsBatch(() => { INPUTS.splice(i, 1) })
  return ok
}

describe('C6 — one whole-draft answer (Ranger 142 → 149 from Thu 16 Jul)', () => {
  it('Hunter\'s draft for Ranger on Tue 14 Jul offers him; stretched to Fri 17 Jul it does not, and the door refuses in the approved words', () => {
    acrossMove(R, 'u142', 'u149')
    signInAs('hunter')
    expect(pickRoster(false, 'u142', '2026-07-14', offersFor(null, draft('2026-07-14'), []))).toContain(R)
    expect(pickRoster(false, 'u142', '2026-07-14', offersFor(null, draft('2026-07-14', '2026-07-17'), []))).not.toContain(R)
    expect(whoDoorRefusal(null, draftImage(null, draft('2026-07-14'), [R]))).toBeNull()
    expect(whoDoorRefusal(null, draftImage(null, draft('2026-07-14', '2026-07-17'), [R]))).toBe(WORDS)
  })
  it('Ranger\'s own draft and Saber\'s pass the door; so do Kestrel\'s on 149\'s days alone', () => {
    acrossMove(R, 'u142', 'u149')
    for (const who of ['ranger', 'saber'] as const) {
      signInAs(who)
      expect(whoDoorRefusal(null, draftImage(null, draft('2026-07-14', '2026-07-17'), [R])), who).toBeNull()
    }
    signInAs('kestrel')
    expect(whoDoorRefusal(null, draftImage(null, draft('2026-07-16', '2026-07-17'), [R]))).toBeNull()
  })
  it('Kestrel saving a change to that leave (filed by Saber, 14–17 Jul) is refused at the door, in the same words', () => {
    acrossMove(R, 'u142', 'u149')
    signInAs('saber')
    expect(writeInputsBatch(() => { INPUTS.push({ ...draftImage(null, draft('2026-07-14', '2026-07-17'), [R]), yr: 2026, iid: 'c6k', by: 'stiff', at: Date.now(), ord: 99951 } as any) })).toBeTruthy()
    const rec = INPUTS.find((x: any) => x.iid === 'c6k')
    signInAs('kestrel')
    expect(whoDoorRefusal(rec, draftImage(rec, { ...draft('2026-07-14', '2026-07-17'), remarks: 'changed' }, [R]))).toBe(WORDS)
  })
  it('a duty across his move, refused at the door, is said in today\'s words (no approved sentence for it)', () => {
    acrossMove(R, 'u142', 'u149')
    signInAs('hunter')
    expect(whoDoorRefusal(null, draftImage(null, { ...draft('2026-07-14', '2026-07-17'), type: 'Duty' }, [R]))).toBe('Blocked: nothing was kept')
  })
  it('the picker and the save agree for every row of actor × span (the picker never offers whom the save refuses)', () => {
    acrossMove(R, 'u142', 'u149')
    const spans: Array<[string, string | undefined]> = [['2026-07-14', undefined], ['2026-07-14', '2026-07-15'], ['2026-07-15', '2026-07-16'], ['2026-07-16', '2026-07-17'], ['2026-07-14', '2026-07-17'], ['2026-07-20', '2026-07-21']]
    for (const who of ['hunter', 'kestrel', 'saber', 'ranger'] as const) {
      for (const [a, b] of spans) {
        signInAs(who)
        /* the page he files from: his own squadron's Inputs page, or — a master admin — the squadron of Ranger's first day */
        const page = who === 'saber' ? homeOn(R, a)! : myUnit()
        if (who === 'saber') switchUnit(page)
        const roster = who === 'ranger' ? [R] : rosterOptions(page, a)
        const offered = roster.includes(R) && offersFor(null, draft(a, b), [])(R)
        const door = whoDoorRefusal(null, draftImage(null, draft(a, b), [R])) === null
        const saved = saves(a, b)
        const row = `${who} ${a}..${b ?? a}`
        if (offered) expect(saved, `${row}: offered, so the save accepts`).toBe(true)
        expect(door, `${row}: the door and the gate agree`).toBe(saved)
        if (saved && homeOn(R, a) === page) expect(offered, `${row}: accepted, so offered on his first day's page`).toBe(true)
      }
    }
  })
})
