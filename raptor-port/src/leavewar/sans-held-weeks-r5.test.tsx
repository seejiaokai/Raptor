// @vitest-environment jsdom
/* THE SANS REMINDER'S SAVED WEEKS ARE NOT READ AGAIN FOR A CHANGE THAT CANNOT MOVE A SEAT (chat 169's round 5, 24 Nov 26 —
   Astra's round-4 F1, D:/raptor-work/c169-r4-astra/astra-r4.md: every change of the week on screen read every saved week
   ahead again, 14,440 week reads and about 150 ms over 40 of them, with nothing changed).
   Since his D2564 the reminder asks only who is in a flying seat or a sim. Nothing worked out on the way to reading a
   saved week puts a man in one or takes him out, but for a deleted man taken off from his cutoff: a request lands on a
   ground row, a home squadron only decides whose week that row lands on, and the week on screen only changed how a day's
   label was written. So leavewar/sansunfiled.ts weeksHeld keeps a saved week's reading by its saved copy, the men deleted
   and the squadron in view alone, and asks what he filed by a label that carries its year.
   Each case counts the saved weeks read (a saved week is one JSON text starting `{"d":[`) AND holds the reminder's answer
   to one worked out afresh from the saved copies, so a reading kept too long would show as a wrong day, not only as a
   count.
   Fixture: test-support/msq-world.ts (Wed 15 Jul 26). Hex = `rocky`, 142's WSO, ticked SANS today. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DAYS } from '../engine/data'
import { PEOPLE, sansOnP } from '../engine/people'
import { sansAvailOn, INPUTS } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { stashClear, stashDays, stashKeys } from '../engine/weekstash'
import { weekDatesAbs } from '../engine/weeks-data'
import { dayIso } from '../engine/verid'
import { daySansSeats } from '../engine/avail'
import { CURWEEK } from '../engine/waves'
import { afterSchedMutate } from '../state/view'
import { NOTICES } from '../state/notices'
import { loadWeek, notify as raptorNotify } from '../state/store'
import { updatePersonField } from '../state/quals-write'
import { setHome } from '../state/units'
import { commitNewInput, removeInput } from '../ui/inputedit'
import { sansUnfiledDays } from './sansunfiled'
import { useMsqWorld, signInAs, at } from '../test-support/msq-world'

useMsqWorld()
let DAYS0 = ''
beforeEach(() => {
  if (!DAYS0) DAYS0 = JSON.stringify(DAYS)
  // any: a day of the engine's week is untyped (a verbatim port, src/engine/data.ts)
  DAYS.length = 0; JSON.parse(DAYS0).forEach((d: any) => DAYS.push(d))
  NOTICES.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  stashClear()
  signInAs('saber')
})
afterEach(() => { if (String(CURWEEK) !== '13/07/2026') loadWeek('13/07/2026') })

/* Hex in an OFT's rear seat on a day of the week on screen — a place SANS availability is asked of */
// any: a day of the engine's week is untyped
const seat = (di: number, id = 'rocky') => { const d: any = DAYS[di]; d.sims = d.sims || {}; (d.sims.oft = d.sims.oft || []).push({ label: 'EP 1', str: '1400', end: '1500', p: '', w: id }); afterSchedMutate() }
const tick = () => { expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify() }
const wk = (n: number): string => { const d = new Date(2026, 6, 27 + 7 * n); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` }
/* n saved weeks ahead, Hex seated on each one's Tuesday; then two weeks nobody has worked on, the first on screen */
const hold = (n: number) => {
  tick()
  for (let i = 0; i < n; i++) { loadWeek(wk(i)); seat(1) }
  loadWeek('07/06/2027'); raptorNotify()
}
/* the saved weeks read from here on */
const counting = () => {
  const parse = JSON.parse
  let reads = 0
  // any: JSON.parse's own signature
  const spy = vi.spyOn(JSON, 'parse').mockImplementation(((s: string, r?: any) => {
    if (typeof s === 'string' && s.startsWith('{"d":[')) reads++
    return parse(s, r)
  }) as never)
  return { reads: () => reads, stop: () => spy.mockRestore() }
}
/* his reminder's days of the SAVED weeks, worked out afresh: each saved copy read now, with the requests, the homes and
   the men deleted as they stand, by none of the reminder's kept readings */
const fresh = (): string[] => {
  const today = '2026-07-15', out: string[] = []
  // any: the engine's person record is untyped (a verbatim port)
  const p: any = (PEOPLE as any).rocky
  for (const k of stashKeys()) {
    if (k === String(CURWEEK)) continue
    const days = stashDays(k)?.days || [], labels = weekDatesAbs(k)
    // any: a day of the engine's week is untyped
    days.forEach((d: any, di: number) => {
      const iso = dayIso(k, di)
      if (!d || iso < today || !sansOnP(p, iso)) return
      if ((daySansSeats(d) as Set<string>).has('rocky') && !sansAvailOn('rocky', labels[di])) out.push(iso)
    })
  }
  return out.sort()
}
/* (the week on screen in these cases is one nobody has worked on, so the reminder's days are the saved weeks' alone) */
const same = () => { const f = fresh(); expect(sansUnfiledDays('rocky')).toEqual(f); return f }

/* THE CHANGE, THEN THE REMINDER ASKED: how many saved weeks the asking read. Counted round the asking alone — the change
   itself may read saved weeks for its own reasons (a filing looks for its row in every week) — and it is the first asking
   since the change, so a reading kept by a key the change moved would be read again here. */
const askedAfter = (change: () => void): number => {
  change(); raptorNotify()
  const c = counting()
  sansUnfiledDays('rocky')
  const n = c.reads(); c.stop()
  return n
}

describe('Astra\'s round-4 F1 — a change of the week on screen reads no saved week again', () => {
  it('six saved weeks, the week on screen changed: no saved week is read, and the days are the same', () => {
    hold(6)
    const before = same()
    for (const d of ['2026-07-28', '2026-08-04', '2026-08-11', '2026-08-18', '2026-08-25', '2026-09-01']) expect(before).toContain(d)
    expect(askedAfter(() => loadWeek('14/06/2027')), 'saved weeks read for a change of week').toBe(0)
    expect(same()).toEqual(before)
    expect(askedAfter(() => loadWeek('07/06/2027')), '…and back').toBe(0)
    expect(same()).toEqual(before)
  })
  it('…nor for a request filed and deleted, which lands on a ground row and never on a seat', () => {
    hold(3)
    const before = same()
    /* (a Meeting on Wed 5 Aug, a day he has no seat on: it lands on that saved week's ground programme, and names no day) */
    // any: a draft as the input sheet hands it over
    expect(askedAfter(() => { expect(commitNewInput({ person: 'rocky', type: 'Meeting', start: '2026-08-05', allday: false, sTime: '09:00', eTime: '10:00', remarks: 'R5' } as any)).toBe(true) }), 'saved weeks read for a Meeting filed').toBe(0)
    expect(same()).toEqual(before)
    // any: the inputs list is untyped (a verbatim port, src/engine/inputs.ts)
    const rec = (INPUTS as any[]).find(r => r && r.type === 'Meeting' && String(r.remarks || '').includes('R5'))
    expect(rec).toBeTruthy()
    expect(askedAfter(() => { removeInput(rec) }), 'saved weeks read for a Meeting deleted').toBe(0)
    // any: as above
    expect((INPUTS as any[]).includes(rec)).toBe(false)
    expect(same()).toEqual(before)
  })
  it('…nor for a home squadron changed — another man\'s, or his own from tomorrow', () => {
    hold(3)
    const before = same()
    expect(askedAfter(() => { expect(setHome('bane', 'u149')).toMatchObject({ ok: true }) }), 'saved weeks read for another man\'s home changed').toBe(0)
    expect(same()).toEqual(before)
    expect(askedAfter(() => { expect(setHome('rocky', 'u149')).toMatchObject({ ok: true }) }), 'saved weeks read for his own home changed').toBe(0)
    same()
  })
  it('…nor for a plain row added to the week on screen', () => {
    hold(3)
    const before = same()
    // any: a day of the engine's week is untyped
    expect(askedAfter(() => { (DAYS[2] as any).ground.push({ prog: 'BRIEFING', str: '1600', end: '1700', who: 'wolf' }); afterSchedMutate() }), 'saved weeks read for a plain row').toBe(0)
    expect(same()).toEqual(before)
  })
})

describe('…and what does change a seat, or what he filed, is still seen', () => {
  it('a saved week worked on again — Hex seated on another of its days — names the new day', () => {
    hold(2)
    const before = same()
    expect(before).not.toContain('2026-07-30')
    loadWeek(wk(0)); seat(3); loadWeek('07/06/2027'); raptorNotify()
    expect(same()).toEqual([...before, '2026-07-30'].sort())
  })
  it('a saved week worked on again — Hex taken off his seat — drops the day', () => {
    hold(2)
    const before = same()
    // any: a day of the engine's week is untyped
    loadWeek(wk(1)); (DAYS[1] as any).sims.oft.length = 0; afterSchedMutate(); loadWeek('07/06/2027'); raptorNotify()
    expect(same()).toEqual(before.filter(d => d !== '2026-08-04'))
  })
  it('a day he files for leaves it, with no saved week read again (what he filed is asked afresh each time)', () => {
    hold(2)
    const before = same()
    expect(before).toContain('2026-07-28')
    // any: a draft as the input sheet hands it over
    expect(askedAfter(() => { expect(commitNewInput({ _new: true, person: 'rocky', type: 'SANS Availability', start: '2026-07-28', allday: true, s: 360, e: 1080, sans: { o: true } } as any)).toBe(true) })).toBe(0)
    expect(same()).toEqual(before.filter(d => d !== '2026-07-28'))
  })
})


describe('across the New Year — a saved day is asked by its own year, whatever week is on screen', () => {
  it('Sat 2 Jan 27, in the saved week of 28 Dec 26: named from a 2026 week and from a 2027 week; filed, gone from both, no saved week read again', () => {
    at('2026-12-22')
    tick()
    loadWeek('28/12/2026'); seat(5)                        // (Sat 2 Jan 27)
    loadWeek('14/12/2026'); raptorNotify()
    expect(sansUnfiledDays('rocky')).toEqual(['2027-01-02'])
    loadWeek('11/01/2027'); raptorNotify()
    const c = counting()
    expect(sansUnfiledDays('rocky')).toEqual(['2027-01-02'])
    const n = c.reads(); c.stop()
    expect(n, 'saved weeks read for a change of week across the year').toBe(0)
    // any: a draft as the input sheet hands it over
    expect(commitNewInput({ _new: true, person: 'rocky', type: 'SANS Availability', start: '2027-01-02', allday: true, s: 360, e: 1080, sans: { o: true } } as any)).toBe(true); raptorNotify()
    expect(sansUnfiledDays('rocky')).toEqual([])
    loadWeek('14/12/2026'); raptorNotify()
    expect(sansUnfiledDays('rocky')).toEqual([])
  })
})
