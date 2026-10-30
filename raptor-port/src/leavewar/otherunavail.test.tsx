/* "OTHER" IN PLACE OF UNA; EVERY COMMITMENT UNDER UNAVAILABLE COUNTS HIM OUT; A COURSE AND AN ATTACH LAND THERE BY
   THEMSELVES ([LW-OTHER-UNAVAIL], [INP-ATTACH] — his D1356, D1357, D1365, D1370, D1372–D1375, 25 Oct 26; the drawings
   scripts/handpass/lw-1025-q7.mjs). Written before the build of each part, red first; replaces una.test.ts (UNA, the war's
   own record of D1338, went with D1356 — a stored one is dropped on read).

   The rules pinned: (1) the war shows and counts out any commitment the schedule draws under Unavailable (`acc:'u'`), by
   1 or 0.5, in the outlined look, by its kind's letters — OTH an Other, ATCH an Attach — and no commitment on the Ground
   Programme; (2) a course and an Attach are filed under Unavailable by themselves, an Other where its "Goes to" says;
   (3) "Fly with" is "Attach", with a "To" shown in its name; (4) an admin files an Other from the bid window's ⋯, straight
   under Unavailable on the window's Duration; (5) the row under the leaves reads CSE · OD · Grant OIL · ⋯. */
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS, inpLabel, filingOf, landsUnavail, INPUT_TYPES } from '../engine/inputs'
import { commitInput, commitInputEdit, commitNewInput, draftOf } from '../ui/inputedit'
import { closeDates, fileStraight, getState, openDates, setCell, initStore, lwHistInit, rawState, setPeople, setRole, setViewer } from './state/store'
import { memoryBackend } from './state/storage'
import { initStore as raptorInitStore, notify as raptorNotify } from '../state/store'
import { setMe, setSession } from '../state/auth'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync } from './sync'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { COMMIT_CODE, contribsOfInput, warCodeOf, warCounts, warVisible } from './absences'
import { dayView } from './engine/dayview'
import { isRetiredUna, readRecs } from './engine/warrecs'
import { kindOf, parseCell } from './engine/codes'
import { setMemberTodayForTests } from './engine'
import { SelectSheet } from './ui/SelectSheet'
import { accCtl } from '../ui/html'
import { Matrix } from './ui/Matrix'
import type { MergedWar } from './state/merge'

const ISNAP = JSON.stringify(INPUTS)
const P = 'dusk', D = '2026-02-11'
const viewOn = (d = D, p = P) => (getState().wars as MergedWar[]).find(w => w.period.start <= d && d <= w.period.end)!.views[p]?.[d]
const row = (extra: Record<string, unknown>) => ({ iid: 'x1', person: P, date: 'Feb 11', yr: 2026, allday: true, remarks: '', ...extra })

describe('the war counts every commitment under Unavailable (D1357), and only there', () => {
  it('an Other, a Meeting, an Attach under Unavailable: on the war; on the Ground Programme or rejected: not', () => {
    for (const type of ['Other', 'Meeting', 'Training', 'Duty', 'Event', 'Appointment', 'Personal', 'Attach']) {
      expect(warCounts(row({ type, acc: 'u' })), `${type} under Unavailable`).toBe(true)
      expect(warCounts(row({ type, acc: 'g' })), `${type} on the programme`).toBe(false)
      expect(warCounts(row({ type, acc: 'r' })), `${type} rejected`).toBe(false)
      expect(warCounts(row({ type })), `${type} not yet landed`).toBe(false)
    }
  })
  it('leave and medical count wherever they sit, as built', () => {
    for (const type of ['LL', 'ATT C']) expect(warCounts(row({ type, acc: 'g' }))).toBe(true)
    expect(warVisible('Other')).toBe(false)
  })
  /* HIS D1381, D1389, D1390 (26 Oct 26): a course or an overseas duty a scheduler rejects counts him back in, and so does
     one he then moves onto the Ground Programme — only Unavailable counts him out. Filed (under Unavailable by itself, or an
     overseas duty that sits there by its kind with no filing mark) it still counts him out. */
  it('a course or an overseas duty: filed, out; rejected or moved onto the Ground Programme, in (D1381, D1389, D1390)', () => {
    for (const type of ['CSE', 'OD']) {
      expect(warCounts(row({ type, acc: 'u' })), `${type} under Unavailable`).toBe(true)
      expect(warCounts(row({ type, acc: 'r' })), `${type} rejected`).toBe(false)
      expect(warCounts(row({ type, acc: 'g' })), `${type} rejected, then on the Ground Programme`).toBe(false)
    }
  })
  /* …AND THE WAR ASKS WHAT THE SCHEDULE ASKS (the night's code read, F1): a course is a commitment — out only under
     Unavailable, as engine/inputs.ts isAway reads it. Its "on the Ground Programme" mark is worked out for the week on
     screen only (state/holderbase.ts), so off that week a course a scheduler put there carries NO mark: it must not count
     him out again. An overseas duty sits under Unavailable by its kind, mark or none. A cancelled or information-only
     course is silent, as on the schedule. */
  it('a course with no mark (on the Ground Programme, its week not on screen) or cancelled counts him in; an overseas duty with no mark out', () => {
    expect(warCounts(row({ type: 'CSE' })), 'a course with no mark').toBe(false)
    expect(warCounts(row({ type: 'CSE', acc: 'u', cx: true })), 'a cancelled course under Unavailable').toBe(false)
    expect(warCounts(row({ type: 'CSE', acc: 'u', info: true })), 'an information-only course under Unavailable').toBe(false)
    expect(warCounts(row({ type: 'OD' })), 'an overseas duty with no mark').toBe(true)
  })
  it('each kind its letters — OTH an Other, ATCH an Attach (D1375); a course keeps CSE', () => {
    expect(warCodeOf('Other')).toBe('OTH')
    expect(warCodeOf('Attach')).toBe('ATCH')
    expect(warCodeOf('CSE')).toBe('CSE')
    for (const code of Object.values(COMMIT_CODE)) {
      expect(parseCell(code), code).toEqual({ type: code, portion: 'full' })
      expect(parseCell(`*${code}`), `${code} takes a morning`).toEqual({ type: code, portion: 'am' })
      expect(kindOf(code), `${code} is drawn outlined`).toBe('unav')
    }
  })
  it('a half-day Other counts half a man; a whole day one', () => {
    const am = contribsOfInput(row({ type: 'Other', acc: 'u', allday: false, half: 'am', s: 0, e: 720 }))
    expect(am).toHaveLength(1)
    expect(am[0]![1]).toMatchObject({ kind: 'absence', code: 'OTH' })
    expect(dayView([am[0]![1]]).away).toBe(0.5)
    const full = contribsOfInput(row({ type: 'Other', acc: 'u' }))
    expect(dayView([full[0]![1]]).away).toBe(1)
  })
})

describe('UNA went (D1356): a stored one is dropped, the war still loads whole', () => {
  it('a UNA record is retired, and a war holding one reads back without it', () => {
    expect(isRetiredUna({ id: 'u1', kind: 'una', code: 'UNA' })).toBe(true)
    const r = readRecs({ pipper: { '2026-01-14': [{ id: 'u1', kind: 'una', code: 'UNA' }, { id: 'b1', kind: 'request', code: 'LL', state: 'pending' }] } })
    expect(r).not.toBeNull()
    expect(r!.pipper!['2026-01-14']!.map(x => x.kind)).toEqual(['request'])
    expect(parseCell('UNA'), 'no longer a code the war knows').toBeNull()
  })
})

describe('where an input is filed (D1356, D1372, D1374) and "Attach" (D1373)', () => {
  it('a course and an Attach land under Unavailable by themselves; an Other where its Goes to says', () => {
    expect(landsUnavail('CSE')).toBe(true)
    expect(landsUnavail('Attach')).toBe(true)
    expect(landsUnavail('Other')).toBe(false)
    expect(filingOf('Other', 'u')).toBe('u')
    expect(filingOf('Other', 'g')).toBeNull()
    expect(filingOf('Meeting', 'u'), 'only an Other gives its filer the choice').toBeNull()
  })
  it('"Fly with" is "Attach", and its name carries where he is attached', () => {
    expect(INPUT_TYPES).toContain('Attach')
    expect(INPUT_TYPES).not.toContain('Fly with')
    expect(inpLabel({ type: 'Attach', to: '145 Sqn' })).toBe('Attach · 145 Sqn')
    expect(inpLabel({ type: 'Attach' })).toBe('Attach')
    expect(inpLabel({ type: 'Attach', title: 'Ex Cope', to: ' 145   Sqn ' })).toBe('Ex Cope · 145 Sqn')
  })
})

describe('the Inputs page files them (the one save)', () => {
  beforeEach(() => {
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
    setSession({ user: 'ad', role: 'admin' })
    raptorInitStore()
    initStore(memoryBackend()); setRole('admin'); setPeople(projectPeople()); wireLeaveWarSync()
    _resetTimeline(); lwHistInit(); installGlobalUndo()
  })
  afterEach(() => { _resetTimeline(); setSession(null); setMe('bane'); INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })
  const add = (type: string, extra: Record<string, unknown> = {}) => {
    let made: any = null
    const ok = commitNewInput({ person: P, type, allday: true, start: D, end: '', sTime: '06:00', eTime: '18:00', remarks: 'Why', title: null, ...extra }, false, undefined, undefined, r => { made = r })
    expect(ok, `${type} saved`).toBe(true)
    return made
  }
  it('a leave bid beside a commitment under Unavailable stands, as beside a course (the designer’s G2): two entries', () => {
    for (const [type, extra] of [['CSE', {}], ['Training', {}], ['Other', { goes: 'u' }]] as Array<[string, Record<string, unknown>]>) {
      INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
      initStore(memoryBackend()); setRole('admin'); setPeople(projectPeople()); wireLeaveWarSync()
      const r = add(type, extra)
      if (type === 'Training') { r.acc = 'u'; raptorNotify() }
      expect(setCell(P, D, 'LL'), `a bid beside the ${type}`).toBe(true)
      const codes = viewOn()?.all.map(c => c.code) ?? []
      expect(codes, `${type}: both on the day`).toContain('LL')
      expect(codes.length, type).toBe(2)
      expect(INPUTS.includes(r), `the ${type} stays`).toBe(true)
    }
  })
  it('an Other for a named man and ALL AVAIL, Goes to Unavailable, is saved on the Ground Programme, never refused (G3)', () => {
    const n = INPUTS.length
    expect(commitInput(null, { person: P, type: 'Other', allday: true, start: D, end: '', sTime: '06:00', eTime: '18:00', remarks: 'Why', title: null, goes: 'u' }, [P, 'allavail'])).toBe(true)
    expect(INPUTS.length).toBe(n + 1)
    const r: any = INPUTS[INPUTS.length - 1]
    expect(r.acc, 'never under Unavailable with ALL AVAIL in it').not.toBe('u')
  })
  it('a course is filed under Unavailable; the war counts him out', () => {
    const r = add('CSE')
    expect(r.acc).toBe('u')
    expect(viewOn()?.away).toBe(1)
  })
  it('a course a scheduler rejects counts him back in; moved onto the Ground Programme, still in; → Unavail, out again (D1381, D1389)', () => {
    const r = add('CSE')
    expect(viewOn()?.away).toBe(1)
    r.acc = 'r'; raptorNotify()
    expect(viewOn()?.away ?? 0, 'rejected: back in').toBe(0)
    expect(viewOn()?.all.some(c => c.code === 'CSE') ?? false, 'rejected: no CSE box on the war').toBe(false)
    r.acc = 'g'; raptorNotify()
    expect(viewOn()?.away ?? 0, 'on the Ground Programme: in').toBe(0)
    /* the schedule on another week: its "on the Ground Programme" mark is gone (state/holderbase.ts) — still in (F1) */
    delete r.acc; raptorNotify()
    expect(viewOn()?.away ?? 0, 'on the Ground Programme, its week not on screen: still in').toBe(0)
    r.acc = 'u'; raptorNotify()
    expect(viewOn()?.away, 'under Unavailable again: out').toBe(1)
  })
  it('an Attach is filed under Unavailable with its To; the war shows ATCH and counts him out', () => {
    const r = add('Attach', { to: '145 Sqn' })
    expect(r).toMatchObject({ acc: 'u', to: '145 Sqn' })
    expect(viewOn()?.away).toBe(1)
    expect(viewOn()?.all.some(c => c.code === 'ATCH')).toBe(true)
  })
  it('an Other with Goes to Unavailable counts him out; with Ground Programme it does not', () => {
    const u = add('Other', { goes: 'u' })
    expect(u.acc).toBe('u')
    expect(viewOn()?.away).toBe(1)
    INPUTS.splice(INPUTS.indexOf(u), 1)
    const g = add('Other', { goes: 'g' })
    expect(g.acc).not.toBe('u')
    expect(viewOn()?.away ?? 0).toBe(0)
  })
  it('an Other’s Goes to changed in its window moves it in and out (the war follows)', () => {
    const r = add('Other', { goes: 'g' })
    expect(commitInputEdit(r, { ...draftOf(r), goes: 'u' })).toBe(true)
    expect(r.acc).toBe('u')
    expect(viewOn()?.away).toBe(1)
    expect(commitInputEdit(r, { ...draftOf(r), goes: 'g' })).toBe(true)
    expect(r.acc).toBeUndefined()
    expect(viewOn()?.away ?? 0).toBe(0)
  })
  it('a Meeting retyped to a course goes under Unavailable; back to a Meeting it comes off', () => {
    const r = add('Meeting')
    expect(r.acc).not.toBe('u')
    expect(commitInputEdit(r, { ...draftOf(r), type: 'CSE' })).toBe(true)
    expect(r.acc).toBe('u')
    expect(commitInputEdit(r, { ...draftOf(r), type: 'Meeting' })).toBe(true)
    expect(r.acc).not.toBe('u')
  })
  it('an Other under Unavailable retyped to a Training lands on the Ground Programme (D1357; the designer’s G4)', () => {
    const r = add('Other', { goes: 'u' })
    expect(r.acc).toBe('u')
    expect(commitInputEdit(r, { ...draftOf(r), type: 'Training' })).toBe(true)
    expect(r.acc).not.toBe('u')
    expect(viewOn()?.away ?? 0).toBe(0)
  })
  it('the schedule offers every commitment "→ Ground" and "→ Unavail" (D1357), a course too once rejected', () => {
    const m = add('Meeting')
    const html = accCtl(2, { ...m, acc: undefined })
    expect(html).toContain('→ Unavail')
    expect(html).toContain('→ Ground')
    const c = add('CSE')
    expect(accCtl(2, { ...c, acc: 'r' })).toContain('→ Unavail')
  })
})

describe('the war files an Other (D1365) — an admin’s, straight under Unavailable, on the Duration', () => {
  beforeEach(() => {
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
    setSession({ user: 'ad', role: 'admin' })
    raptorInitStore()
    initStore(memoryBackend()); setRole('admin'); setPeople(projectPeople()); wireLeaveWarSync()
    _resetTimeline(); lwHistInit(); installGlobalUndo()
  })
  afterEach(() => { _resetTimeline(); setSession(null); setMe('bane'); INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })
  const others = () => INPUTS.filter((r: any) => r.type === 'Other' && ((r.people ?? []).some((x: any) => x.p === P) || r.person === P))
  it('a morning: one Other input, half AM, under Unavailable, its words; half a man out', () => {
    expect(fileStraight([{ personId: P, date: D }], 'OTH', { remarks: 'Board of inquiry' }, 'am').done).toBe(1)
    expect(others()).toHaveLength(1)
    expect(others()[0]).toMatchObject({ acc: 'u', half: 'am', remarks: 'Board of inquiry' })
    expect(viewOn()?.away).toBe(0.5)
    expect(rawState().wars[0]!.recs[P]?.[D]?.length ?? 0, 'no record of the war’s own').toBe(0)
  })
  it('the same half again is left as it is; the other half is filed', () => {
    fileStraight([{ personId: P, date: D }], 'OTH', undefined, 'am')
    expect(fileStraight([{ personId: P, date: D }], 'OTH', undefined, 'am').done).toBe(0)
    expect(fileStraight([{ personId: P, date: D }], 'OTH', undefined, 'pm').done).toBe(1)
    expect(viewOn()?.away).toBe(1)
  })
  it('a member files none from the war (he files an Other on the Inputs page)', () => {
    setRole('member'); setViewer(P)
    expect(fileStraight([{ personId: P, date: D }], 'OTH', undefined, 'full').done).toBe(0)
    expect(others()).toHaveLength(0)
  })
})

describe('the bid window’s row under the leaves (D1349, D1356)', () => {
  /* a pilot of the projected roster (the Raptor people the war is wired to) */
  const who = () => getState().people[0]!.id
  beforeEach(() => {
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
    setSession({ user: 'ad', role: 'admin' })
    raptorInitStore()
    initStore(memoryBackend()); setRole('admin'); setPeople(projectPeople()); wireLeaveWarSync()
    _resetTimeline(); lwHistInit(); installGlobalUndo()
    try { localStorage.clear() } catch { /* none */ }
  })
  afterEach(() => { _resetTimeline(); setSession(null); setMe('bane'); INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })
  it('an admin’s: CSE · OD · Grant OIL · ⋯, and the ⋯ holds Attach, Other, Post out, Post in (D1378)', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${who()}-${D}`))
    const rowEl = screen.getByTestId('bid-extra-row')
    expect([...rowEl.querySelectorAll(':scope > button, :scope > span > button')].map(b => b.getAttribute('data-testid')))
      .toEqual(['bid-file-CSE', 'bid-file-OD', 'bid-oil', 'bid-more'])
    expect(screen.queryByTestId('bid-una')).toBeNull()
    fireEvent.click(screen.getByTestId('bid-more'))
    const menu = screen.getByTestId('bid-more-menu')
    expect([...menu.querySelectorAll('button')].map(b => b.textContent)).toEqual(['Attach', 'Other', 'Post out', 'Post in'])
  })
  it('Other in the ⋯, the Duration on PM: an afternoon Other, under Unavailable', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${who()}-${D}`))
    fireEvent.click(within(screen.getByTestId('bid-picker')).getByTestId('portion-pm'))
    fireEvent.click(screen.getByTestId('bid-more'))
    fireEvent.click(screen.getByTestId('bid-file-OTH'))
    const o = INPUTS.filter((r: any) => r.type === 'Other' && (r.people ?? []).some((x: any) => x.p === who()))
    expect(o).toHaveLength(1)
    expect(o[0]).toMatchObject({ acc: 'u', half: 'pm' })
    expect(screen.queryByTestId('bid-picker'), 'the window closes, as a leave placed does').toBeNull()
  })
})

/* AN ATTACH FROM THE WAR (his D1378–D1380, 25 Oct 26 — "Yes all as recommended"; drawn attach-built/att-drawn-more-phone.png):
   the ⋯ offers Attach first, above Other; it files an Attach input straight under Unavailable, no approval, counting him out;
   an admin and a member alike (a member's ⋯ holds Attach alone); on the window's Duration; its "To" left to the Inputs page */
describe('an Attach filed from the war (D1378–D1380)', () => {
  const who = () => getState().people[0]!.id
  const attaches = (p = who()) => INPUTS.filter((r: any) => r.type === 'Attach' && ((r.people ?? []).some((x: any) => x.p === p) || r.person === p))
  beforeEach(() => {
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
    setSession({ user: 'ad', role: 'admin' })
    raptorInitStore()
    initStore(memoryBackend()); setRole('admin'); setPeople(projectPeople()); wireLeaveWarSync()
    _resetTimeline(); lwHistInit(); installGlobalUndo()
    try { localStorage.clear() } catch { /* none */ }
  })
  afterEach(() => { _resetTimeline(); setSession(null); setMe('bane'); INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })
  it('the store: an Attach on a morning, under Unavailable, its words, no "To"; half a man out; the same half again left as it is', () => {
    const r = fileStraight([{ personId: who(), date: D }], 'ATCH', { remarks: 'Exercise support' }, 'am')
    expect(r.done).toBe(1)
    expect(attaches()).toHaveLength(1)
    expect(attaches()[0]).toMatchObject({ acc: 'u', half: 'am', remarks: 'Exercise support' })
    expect(attaches()[0].to, 'where he is attached is added on the Inputs page (D1380)').toBeUndefined()
    expect(viewOn(D, who())?.away).toBe(0.5)
    const again = fileStraight([{ personId: who(), date: D }], 'ATCH', undefined, 'am')
    expect(again.done).toBe(0)
    expect(again.why[0]).toMatch(/already holds an Attach/)
  })
  it('a member files one on his own row, never on another man’s (D1379)', () => {
    const [mine, other] = [getState().people[0]!.id, getState().people[1]!.id]
    act(() => { setRole('member'); setViewer(mine) })
    expect(fileStraight([{ personId: mine, date: D }], 'ATCH', undefined, 'full').done).toBe(1)
    expect(fileStraight([{ personId: other, date: D }], 'ATCH', undefined, 'full').done).toBe(0)
    expect(attaches(mine)).toHaveLength(1)
    expect(attaches(other)).toHaveLength(0)
  })
  it('the bid window: Attach first in the ⋯; picked on PM, an afternoon Attach under Unavailable; the window closes', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${who()}-${D}`))
    fireEvent.click(within(screen.getByTestId('bid-picker')).getByTestId('portion-pm'))
    fireEvent.click(screen.getByTestId('bid-more'))
    fireEvent.click(screen.getByTestId('bid-file-ATCH'))
    expect(attaches()).toHaveLength(1)
    expect(attaches()[0]).toMatchObject({ acc: 'u', half: 'pm' })
    expect(screen.queryByTestId('bid-picker')).toBeNull()
  })
  it('a member’s bid window: a ⋯ holding Attach alone (D1379)', () => {
    act(() => { openDates('2026-01-01', '2026-12-31') })
    setMemberTodayForTests('2026-01-01')
    act(() => { setRole('member'); setViewer(who()) })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${who()}-${D}`))
    const s = screen.getByTestId('bid-picker')
    fireEvent.click(within(s).getByTestId('bid-more'))
    expect([...screen.getByTestId('bid-more-menu').querySelectorAll('button')].map(b => b.textContent)).toEqual(['Attach'])
    fireEvent.click(screen.getByTestId('bid-file-ATCH'))
    expect(attaches()).toHaveLength(1)
    expect(attaches()[0].acc).toBe('u')
  })
  it('a member’s closed day: CSE · OD · ⋯, the ⋯ holding Attach — a whole day (D1379)', () => {
    act(() => { closeDates('2026-01-01', '2026-12-31') })
    act(() => { setRole('member'); setViewer(who()) })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${who()}-${D}`))
    const s = screen.getByTestId('closed-note')
    fireEvent.click(within(s).getByTestId('closed-more'))
    expect([...screen.getByTestId('closed-more-menu').querySelectorAll('button')].map(b => b.textContent)).toEqual(['Attach'])
    fireEvent.click(screen.getByTestId('closed-file-ATCH'))
    expect(attaches()).toHaveLength(1)
    expect(attaches()[0]).toMatchObject({ acc: 'u', allday: true })
  })
  /* the walk's find (W2, scenario 18): the war's windows named an Attach by its box alone — where he is attached (its "To",
     D1373) read on the schedule, the Inputs card and bar, never on the war */
  it('the war names where an Attach is to: the day’s list and the held-half line (W2 18)', () => {
    const id = who()
    let made: any = null
    expect(commitNewInput({ person: id, type: 'Attach', allday: true, start: D, end: '', sTime: '06:00', eTime: '18:00', remarks: 'Exercise', title: null, to: '145 Sqn' }, false, undefined, undefined, r => { made = r })).toBe(true)
    const first = render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${id}-${D}`))
    expect(screen.getByTestId('daylist').textContent).toContain('145 Sqn')
    first.unmount()
    act(() => { INPUTS.splice(INPUTS.indexOf(made), 1); raptorNotify() })
    expect(fileStraight([{ personId: id, date: '2026-02-12' }], 'ATCH', { remarks: 'Exercise' }, 'am').done).toBe(1)
    const am: any = attaches().find((r: any) => r.date === 'Feb 12')
    act(() => { am.to = '145 Sqn'; raptorNotify() })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${id}-2026-02-12`))
    expect(screen.getByTestId('bid-heldhalf').textContent).toContain('145 Sqn')
  })
  it('the drag window: Attach first in the ⋯ for an admin; a member’s ⋯ holds it alone', () => {
    const sel = { people: [who()], from: D, to: '2026-02-12', cells: [D, '2026-02-12'].map(date => ({ personId: who(), date })) }
    const { unmount } = render(<SelectSheet sel={sel} people={id => id} role="admin" canDecide onDone={() => {}} onMove={() => {}} onClose={() => {}} onPostOut={() => undefined} />)
    fireEvent.click(screen.getByTestId('sel-more'))
    expect([...screen.getByTestId('sel-more-menu').querySelectorAll('button')].map(b => b.textContent)).toEqual(['Attach', 'Other', 'Post out'])
    unmount()
    act(() => { setRole('member'); setViewer(who()) })
    render(<SelectSheet sel={sel} people={id => id} role="member" canDecide={false} onDone={() => {}} onMove={() => {}} onClose={() => {}} />)
    fireEvent.click(screen.getByTestId('sel-more'))
    expect([...screen.getByTestId('sel-more-menu').querySelectorAll('button')].map(b => b.textContent)).toEqual(['Attach'])
    fireEvent.click(screen.getByTestId('sel-file-ATCH'))
    expect(attaches()).toHaveLength(1)
    expect(attaches()[0].endDate, 'one input over the two days').toMatch(/12/)
  })
  /* THE ONE ENTRY'S WORDS DO NOT TRAVEL TO A NEW FILING (the M3 code read's Q6, 25 Oct 26): over one entry the drag
     window opens with its words (D1362) — "Wedding" on a leave — and pressing Attach (or a course, an overseas duty, an
     Other) over the same drag filed the new commitment with "Wedding". Words he did not type are the entry's, not the
     filing's; words he typed still go on it (D1341). */
  it('the drag window: a leave’s words shown in the box are not filed onto an Attach; words typed are', () => {
    const id = who()
    setCell(id, '2026-02-10', 'LL', { remarks: 'Wedding' })
    const sel = { people: [id], from: '2026-02-10', to: D, cells: ['2026-02-10', D].map(date => ({ personId: id, date })) }
    const first = render(<SelectSheet sel={sel} people={x => x} role="admin" canDecide onDone={() => {}} onMove={() => {}} onClose={() => {}} onPostOut={() => undefined} />)
    expect((screen.getByTestId('sel-remarks') as HTMLTextAreaElement).value, 'the one entry’s words in the box (D1362)').toBe('Wedding')
    fireEvent.click(screen.getByTestId('sel-more'))
    fireEvent.click(screen.getByTestId('sel-file-ATCH'))
    expect(attaches().length).toBeGreaterThan(0)
    for (const r of attaches()) expect(String(r.remarks ?? ''), 'the leave’s words stay the leave’s').not.toMatch(/Wedding/)
    first.unmount()
    act(() => { for (const r of attaches()) INPUTS.splice(INPUTS.indexOf(r), 1); raptorNotify() })
    render(<SelectSheet sel={sel} people={x => x} role="admin" canDecide onDone={() => {}} onMove={() => {}} onClose={() => {}} onPostOut={() => undefined} />)
    fireEvent.change(screen.getByTestId('sel-remarks'), { target: { value: 'Exercise support' } })
    fireEvent.click(screen.getByTestId('sel-more'))
    fireEvent.click(screen.getByTestId('sel-file-ATCH'))
    expect(attaches().some((r: any) => r.remarks === 'Exercise support'), 'typed words are filed').toBe(true)
  })
})

/* A HALF-DAY OTHER HELD (his D1353, D1371 — drawn by lw-1025-q7.mjs SET c2): a tap on the day opens the bid window on the
   free half, with one line for the held half — the Other's box, "AM" (his D1525, narrowing D1371's "Morning"), its remarks, and where it is changed */
describe('the free half beside a half-day Other (D1353, D1371)', () => {
  beforeEach(() => {
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
    setSession({ user: 'ad', role: 'admin' })
    raptorInitStore()
    initStore(memoryBackend()); setRole('admin'); setPeople(projectPeople()); wireLeaveWarSync()
    _resetTimeline(); lwHistInit(); installGlobalUndo()
  })
  afterEach(() => { _resetTimeline(); setSession(null); setMe('bane'); INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })
  it('the window opens on PM; its held-half line names the morning Other by its box and its words', () => {
    const who = getState().people[0]!.id
    expect(fileStraight([{ personId: who, date: D }], 'OTH', { remarks: 'Board of inquiry' }, 'am').done).toBe(1)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${who}-${D}`))
    const opened = [...document.querySelectorAll('[data-testid$="-sheet"], [data-testid="bid-picker"], [data-testid="raptor-sheet"]')].map(e => e.getAttribute('data-testid'))
    expect(opened, 'what the tap opened').toContain('bid-picker')
    const s = screen.getByTestId('bid-picker')
    expect(within(s).getByTestId('portion-pm').getAttribute('aria-pressed')).toBe('true')
    const line = within(s).getByTestId('bid-heldhalf')
    expect(line.textContent).toContain('OTHAM')   // its box, then AM (D1525)
    expect(line.textContent).toContain('“Board of inquiry”')
    expect(line.textContent).toContain('change it on the Inputs page')
    expect(line.querySelector('.c.k-unav')?.textContent).toBe('OTH')
  })
})
