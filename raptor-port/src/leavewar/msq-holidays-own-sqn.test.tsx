// @vitest-environment jsdom
/* EACH SQUADRON'S HOLIDAYS ARE ITS OWN — the reshape plan's A4 with the Plan audit's PB3, PB4, PB5 and the blind read's R3,
   R4 (docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §7, §19, §19b), built by the core in phase 3.
   His rulings: D2195 — "The holiday list shouldn't be shared. Individual sqns will own it": a holiday one squadron adds
   never touches another squadron's days, OIL or bell, and the "Inputs need an OIL answer" line goes to its own squadron's
   schedulers only; D2202 — while an admin holds Plan of another squadron his bell carries that squadron's admin lines;
   D2201, D2241 — an admin with Plan of a squadron may act as its own admins, wherever a master admin may.
   Every case red first on c0a856d83 (the tip of claude/multi-sqn-b1-107 when phase 3's helper "holidays" began).
   The A4 bell case is the review's proof a-a04b-holiday-bell-other-sqn (docs/superpowers/briefs/2026-11-20-multi-sqn-b1-
   repro/), word for word, its harness changed to the shared world (test-support/msq-world.ts); O4 is the blind read's
   proof (…/2026-11-20-msq-plan-audit-repro/o-opus-plan-audit-read), the same. PB3, PB4, PB5, R4 and the flying plan's
   facts had no proof: each is written here, through the real doors — Hunter, 142's admin, holding Plan of 149. */
import { beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { INPUTS } from '../engine/inputs'
import { writeInputsBatch } from '../state/store'
import { setGrant } from '../state/units'
import { NOTICES, noticeLeft, noticeLive, noticeSpan, holidayLineAny, holidayLineOn, type Notice } from '../state/notices'
import { commitInput, draftOf } from '../ui/inputedit'
import { saveOilDay } from '../ui/oilday'
import { OilDayList } from '../ui/OilDayList'
import { setOilList } from '../ui/pops'
import { holidayAdd, setRole, worldUnit } from './state/store'
import { flyAnswer, oilOpenOn, swapWarWorld } from './sync'
import { useMsqWorld, signInAs } from '../test-support/msq-world'

useMsqWorld()
/* the bell's lines start empty each test, as the A4 bell proof's own harness had them (the shared world leaves the list in
   memory as the last test left it) */
beforeEach(() => { NOTICES.splice(0) })

const FRI = '2026-07-17', SAT = '2026-07-18'
/* a squadron's war loaded as its admin's page loads it (the A4 proof's own way: the world swapped, the war's role set) */
const warOf = (unit: string) => { swapWarWorld(unit); setRole('admin'); expect(worldUnit()).toBe(unit) }
const fileOn = (pid: string, filer: [string, string], title: string) => {
  signInAs(filer[0], filer[1])
  expect(commitInput(null, draftOf({ person: pid, type: 'Training', title, date: 'Jul 17', yr: 2026, allday: false, s: 540, e: 720, remarks: '' } as any), [pid]), 'filed: ' + title).toBe(true)
}
const iidOf = (title: string) => String((INPUTS as any[]).find(x => x.title === title)?.iid)
const lineOf = (pid: string, name: string): Notice | undefined => NOTICES.find(x => x.to === pid && x.name === name)
/* Saber, the master admin, gives Hunter (142's admin) Plan of 149 — through the real door */
const huntPlans149 = () => { signInAs('saber'); expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok, 'Hunter given Plan of 149').toBe(true) }
/* Kestrel, 149's admin, makes Fri 17 Jul a holiday in 149's own war, with a 149 input (and, unless left out, a 142 input)
   standing on it */
const kestrelsHoliday = (with142 = true) => {
  fileOn('osp9', ['ad9', 'a9'], 'Range 149')
  if (with142) fileOn('bane', ['ad2', 'a2'], 'Range 142')
  signInAs('kestrel'); warOf('u149')
  expect(holidayAdd({ kind: 'ph', name: 'National Day', from: FRI, to: FRI }).ok, '149’s holiday saved').toBe(true)
}

describe('A4 (bell) — 142’s holiday tells only 142’s schedulers', () => {
  it('Saber (142’s war loaded) makes Fri 17 Jul a holiday; Kestrel (149) is not told, Hunter (142) is', () => {
    fileOn('osp9', ['ad9', 'a9'], 'Range 149')
    fileOn('bane', ['ad2', 'a2'], 'Range 142')
    signInAs('ad', 'a')
    expect(holidayAdd({ kind: 'ph', name: 'National Day', from: '2026-07-17', to: '2026-07-17' }).ok).toBe(true)
    const told = NOTICES.filter(x => x.name === 'National Day').map(x => x.to).sort()
    expect(told, 'sanity: 142’s own scheduler told').toContain('prowler')
    expect(told, '149’s scheduler is not told of 142’s holiday').not.toContain('kes9')
  })
  it('(A4, the call site easy to miss) 142’s holiday asks no OIL question of a 149 man’s input on that day', () => {
    fileOn('osp9', ['ad9', 'a9'], 'Range 149')
    signInAs('saber')
    expect(holidayAdd({ kind: 'ph', name: 'National Day', from: FRI, to: FRI }).ok).toBe(true)
    expect(oilOpenOn(FRI, FRI).map(o => o.iid), 'Osprey’s 149 input is judged by 149’s own list').not.toContain(iidOf('Range 149'))
  })
})

describe('PB3 — a holiday’s OIL question reaches that squadron’s admins, a plain admin holding Plan of it among them (D2202)', () => {
  it('Kestrel makes 17 Jul a holiday in 149’s war: Kestrel and Hunter (Plan of 149) are told; Saber (a master, home 142) and Hunter’s 142 squadron-mates are not', () => {
    huntPlans149()
    kestrelsHoliday(false)                                              // nothing of 142's on the day: Hunter is told by Plan alone
    const told = NOTICES.filter(x => x.name === 'National Day' && (x.what[0] as any)?.k === 'oilhol').map(x => x.to).sort()
    expect(told).toEqual(['kes9', 'prowler'])
  })
})

describe('PB4 + R3 + R4 — the line carries its squadron: its count, its span, the list it opens and the list’s save are 149’s', () => {
  it('Hunter, signed in with 142’s war loaded, holds a live 149 line counting 149’s one input, its dates and name read from 149’s war', () => {
    huntPlans149()
    kestrelsHoliday()
    signInAs('hunter'); warOf('u142')
    const n = lineOf('prowler', 'National Day')
    expect(n, 'Hunter’s line').toBeTruthy()
    expect({ span: noticeSpan(n!), left: noticeLeft(n!), live: noticeLive(n!) }).toEqual({ span: { a: FRI, b: FRI, name: 'National Day', u: 'u149' }, left: 1, live: true })
    expect(holidayLineOn('prowler', FRI), 'the bell’s tap finds it').toBe(n)
  })
  it('the one list opened from it lists 149’s input, not 142’s, and its Save answers it', async () => {
    huntPlans149()
    kestrelsHoliday()
    signInAs('hunter'); warOf('u142')
    const host = document.createElement('div'); document.body.appendChild(host)
    const root = createRoot(host)
    try {
      await act(async () => { setOilList({ from: FRI, to: FRI, name: 'National Day', fresh: false, unit: 'u149' } as any); root.render(<OilDayList />) })
      const tid = (t: string) => document.querySelector(`[data-testid="${t}"]`) as HTMLElement | null
      expect({ y149: !!tid(`odl-yes-${iidOf('Range 149')}`), y142: !!tid(`odl-yes-${iidOf('Range 142')}`) }).toEqual({ y149: true, y142: false })
      await act(async () => { tid(`odl-yes-${iidOf('Range 149')}`)!.click() })
      await act(async () => { tid('odl-save')!.click() })
      const rec: any = (INPUTS as any[]).find(x => x.title === 'Range 149')
      expect(rec?.oil, '149’s input answered').toEqual({ [FRI]: 0.5 })
    } finally { await act(async () => { root.unmount() }); host.remove(); setOilList(null) }
  })
  it('the list the bell’s tap opens (its dates only — ui/topstate.ts openNotice) finds the line’s squadron: 149’s input', async () => {
    huntPlans149()
    kestrelsHoliday()
    signInAs('hunter'); warOf('u142')
    const host = document.createElement('div'); document.body.appendChild(host)
    const root = createRoot(host)
    try {
      await act(async () => { setOilList({ from: FRI, to: FRI, name: 'National Day', fresh: false } as any); root.render(<OilDayList />) })
      const tid = (t: string) => document.querySelector(`[data-testid="${t}"]`) as HTMLElement | null
      expect({ y149: !!tid(`odl-yes-${iidOf('Range 149')}`), y142: !!tid(`odl-yes-${iidOf('Range 142')}`) }).toEqual({ y149: true, y142: false })
    } finally { await act(async () => { root.unmount() }); host.remove(); setOilList(null) }
  })
  it('(R4) a 142 holiday on the same day does not take the place of Hunter’s 149 line: one line each squadron', () => {
    huntPlans149()
    kestrelsHoliday()
    signInAs('saber'); warOf('u142')
    expect(holidayAdd({ kind: 'ph', name: 'Founders Day', from: FRI, to: FRI }).ok, '142’s holiday saved').toBe(true)
    signInAs('hunter'); warOf('u142')
    const n149 = lineOf('prowler', 'National Day'), n142 = lineOf('prowler', 'Founders Day')
    expect({ n149: !!n149 && noticeLive(n149), n142: !!n142 && noticeLive(n142) }).toEqual({ n149: true, n142: true })
  })
})

describe('O4 — the one OIL list saves the answers of the squadron it LISTS (PB4 must reach ui/oilday.ts saveOilDay)', () => {
  it('a 149 input on Sat 18 Jul, listed for 149, is answered by the master admin whose own squadron is 142', () => {
    signInAs('ad', 'a')
    const row = { person: 'osp9', date: 'Jul 18', yr: 2026, allday: true, type: 'Duty', title: 'O4 weekend duty 149', remarks: '', by: 'stiff', at: Date.now(), iid: 'o4w149', ord: 99001 }
    expect(writeInputsBatch(() => { INPUTS.push(row as any) }), 'setup: filed by the master admin for Osprey (149)').toBe(true)
    expect(oilOpenOn(SAT, SAT, 'u149').map(o => o.iid), "setup: 149's list holds it").toContain('o4w149')
    expect(oilOpenOn(SAT, SAT, 'u142').map(o => o.iid), "setup: 142's list does not").not.toContain('o4w149')
    /* the list opened on 149 (PB4: a 149 holiday line tapped by an admin of 149 whose own page is 142's); its save is
       handed the squadron it listed — today's saveOilDay ignores it and filters by myUnit(), the reader's home */
    const n = (saveOilDay as any)(SAT, SAT, { o4w149: 'y' }, 'u149')
    const rec: any = INPUTS.find((x: any) => x.iid === 'o4w149')
    expect({ n, oil: rec && rec.oil }, 'one answered, its Saturday credited').toEqual({ n: 1, oil: { [SAT]: 1 } })
  })
  it('(R3, its door) a 142 admin with no right in 149 is refused the 149 list’s save', () => {
    signInAs('saber')
    const row = { person: 'osp9', date: 'Jul 18', yr: 2026, allday: true, type: 'Duty', title: 'R3 weekend duty 149', remarks: '', by: 'stiff', at: Date.now(), iid: 'r3w149', ord: 99002 }
    expect(writeInputsBatch(() => { INPUTS.push(row as any) })).toBe(true)
    signInAs('hunter')
    expect((saveOilDay as any)(SAT, SAT, { r3w149: 'y' }, 'u149'), 'refused').toBe(-1)
    expect((INPUTS as any[]).find(x => x.iid === 'r3w149')?.oil).toBeUndefined()
  })
})

describe('PB5 — the list’s foot asks only lines of the list’s own squadron', () => {
  it('Kestrel’s 149 holiday line: true for 149’s list, false for 142’s', () => {
    kestrelsHoliday()
    expect({ l149: holidayLineAny(FRI, 'u149'), l142: (holidayLineAny as any)(FRI, 'u142') }).toEqual({ l149: true, l142: false })
  })
})

describe('the flying plan’s facts are the page’s squadron’s holidays, never the loaded war’s', () => {
  it('149’s holiday on 17 Jul: 149’s answer reads it with 142’s war loaded; 142’s answer does not with 149’s loaded', () => {
    kestrelsHoliday()
    expect(flyAnswer(FRI, 'u142').kind, '142’s day, 149’s war loaded').toBe(null)
    signInAs('saber'); warOf('u142')
    expect(flyAnswer(FRI, 'u149').kind, '149’s day, 142’s war loaded').toBe('ph')
    expect(flyAnswer(FRI, 'u142').kind, '142’s own day').toBe(null)
  })
})
