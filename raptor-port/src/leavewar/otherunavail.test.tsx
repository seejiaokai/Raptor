/* "OTHER" IN PLACE OF UNA; EVERY COMMITMENT UNDER UNAVAILABLE COUNTS HIM OUT; A COURSE AND AN ATTACH LAND THERE BY
   THEMSELVES ([LW-OTHER-UNAVAIL], [INP-ATTACH] — his D1356, D1357, D1365, D1370, D1372–D1375, 25 Oct 26; the drawings
   scripts/handpass/lw-1025-q7.mjs). Written before the build of each part, red first; replaces una.test.ts (UNA, the war's
   own record of D1338, went with D1356 — a stored one is dropped on read).

   The rules pinned: (1) the war shows and counts out any commitment the schedule draws under Unavailable (`acc:'u'`), by
   1 or 0.5, in the outlined look, by its kind's letters — OTH an Other, ATCH an Attach — and no commitment on the Ground
   Programme; (2) a course and an Attach are filed under Unavailable by themselves, an Other where its "Goes to" says;
   (3) "Fly with" is "Attach", with a "To" shown in its name; (4) an admin files an Other from the bid window's ⋯, straight
   under Unavailable on the window's Duration; (5) the row under the leaves reads CSE · OD · Grant OIL · ⋯. */
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS, inpLabel, filingOf, landsUnavail, INPUT_TYPES } from '../engine/inputs'
import { commitInputEdit, commitNewInput, draftOf } from '../ui/inputedit'
import { fileStraight, getState, initStore, lwHistInit, rawState, setPeople, setRole, setViewer } from './state/store'
import { memoryBackend } from './state/storage'
import { initStore as raptorInitStore } from '../state/store'
import { setMe, setSession } from '../state/auth'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync } from './sync'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { COMMIT_CODE, contribsOfInput, warCodeOf, warCounts, warVisible } from './absences'
import { dayView } from './engine/dayview'
import { isRetiredUna, readRecs } from './engine/warrecs'
import { kindOf, parseCell } from './engine/codes'
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
  it('leave, medical, a course and an overseas duty count wherever they sit, as built', () => {
    for (const type of ['LL', 'ATT C', 'CSE', 'OD']) expect(warCounts(row({ type, acc: 'g' }))).toBe(true)
    expect(warVisible('Other')).toBe(false)
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
  it('a course is filed under Unavailable; the war counts him out', () => {
    const r = add('CSE')
    expect(r.acc).toBe('u')
    expect(viewOn()?.away).toBe(1)
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
  it('an admin’s: CSE · OD · Grant OIL · ⋯, and the ⋯ holds Other, Post out, Post in', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${who()}-${D}`))
    const rowEl = screen.getByTestId('bid-extra-row')
    expect([...rowEl.querySelectorAll(':scope > button, :scope > span > button')].map(b => b.getAttribute('data-testid')))
      .toEqual(['bid-file-CSE', 'bid-file-OD', 'bid-oil', 'bid-more'])
    expect(screen.queryByTestId('bid-una')).toBeNull()
    fireEvent.click(screen.getByTestId('bid-more'))
    const menu = screen.getByTestId('bid-more-menu')
    expect([...menu.querySelectorAll('button')].map(b => b.textContent)).toEqual(['Other', 'Post out', 'Post in'])
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

/* A HALF-DAY OTHER HELD (his D1353, D1371 — drawn by lw-1025-q7.mjs SET c2): a tap on the day opens the bid window on the
   free half, with one line for the held half — the Other's box, "Morning", its remarks, and where it is changed */
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
    expect(line.textContent).toContain('Morning')
    expect(line.textContent).toContain('“Board of inquiry”')
    expect(line.textContent).toContain('change it on the Inputs page')
    expect(line.querySelector('.c.k-unav')?.textContent).toBe('OTH')
  })
})
