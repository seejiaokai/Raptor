/* WHO PLACED AN INPUT, AND WHEN — his D629 (7 Oct 26): "show who placed that input at what time and day".

   The Input record carries `by` and `at` (the signed-in person who filed it, and that moment) and `modBy` and `modAt`
   (its last change). This file is the build plan's §3.8 table, ONE CASE A ROW — every door that makes or changes an
   input, through the real door over both wired stores — and Undo / Redo of them, which put a record back AS RECORDED
   and never stamp a new change. `mod`, the date the late rule reads, is written exactly as before at each.
   (The List's own Add form, its inline edit and an OIL answer alone are driven on screen: `ui/whoplaced.test.tsx`.
   The group input's three rows come with its writer — §3.13.)

   Runs in the Leave War project (a hostile time zone): the stamps are moments, never calendar days, so the zone must
   not move them. ONE clock, fixed here at 15 Jul 26 and stepped by the hour. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS, dateOrd, nowStamp } from '../engine/inputs'
import { medClashes } from '../engine/medical'
import { ELOG, elogClear } from '../engine/editlog'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputs, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { deletePerson } from '../state/person-delete'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { commitNewInput, commitInputEdit, draftOf, setInpField, medKeptSegments, mintMedSegments, ordISO } from '../ui/inputedit'
import { advanceStage, clearCells, getState, initStore as lwInitStore, lwHistInit, moveCells, setBidStates, setCell, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, runPoOutcomes, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
let said: string[] = []

/* the clock: 15 Jul 26 at `h` o'clock — returns the moment a stamp made now must carry */
const T = (h: number, day = 15): number => { const d = new Date(2026, 6, day, h, 0, 0); vi.setSystemTime(d); return d.getTime() }
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const saber = () => signInAs('ad', 'a')        // the admin — person `stiff`
const ranger = () => signInAs('us', 'us')      // a member — person `bane`
const rocky = () => signInAs('hex')            // a member — person `rocky`
/* a second admin (Casper), so "who approved" and "who moved it" can be told apart */
const casper = () => { resetSession({ user: 'acoutlaw', role: 'admin', pid: 'casper', name: 'outlaw', acct: 'admin' }); raptorNotify() }

const stamps = (r: any) => ({ by: r.by, at: r.at, modBy: r.modBy, modAt: r.modAt })
const placed = (who: string, t: number) => ({ by: who, at: t, modBy: who, modAt: t })
const span = (r: any) => `${r.date}-${r.endDate ?? r.date}`
/* a man's inputs of one kind in the test's own months (the demo's own rows are in July) */
const mine = (p: string, type: string, mon = 'Feb') => INPUTS.filter((r: any) => r.person === p && r.type === type && String(r.date).startsWith(mon))
  .sort((a: any, b: any) => (dateOrd(a.date, a.yr) as number) - (dateOrd(b.date, b.yr) as number))
const one = (p: string, type: string, mon = 'Feb') => { const l = mine(p, type, mon); expect(l, `${p} has one ${type}`).toHaveLength(1); return l[0] }
/* the editor's own save for a new input */
const add = (person: string, type: string, iso: string, end = '', extra: Record<string, any> = {}) => commitNewInput({
  person, type, allday: true, half: '', start: iso, end, sTime: '06:00', eTime: '18:00', remarks: '', sans: null, docIds: [], ...extra,
})
const cells = (p: string, ...dates: string[]) => dates.map(date => ({ personId: p, date }))
/* bids on the war, then closed for deciding (an admin decides in every stage but draft) */
const bid = (p: string, ...dates: string[]) => {
  for (const d of dates) expect(setCell(p, d, 'LL'), `bid ${d}`).toBe(true)
  if (getState().period.stage === 'open') advanceStage()
}
const approve = (p: string, ...dates: string[]) => { bid(p, ...dates); setBidStates(cells(p, ...dates), 'approved') }

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  T(8)
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  said = []; HOOKS.toast = (m: any) => { said.push(String(m)) }
  saber()
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); resetSession(null) })

describe('the editor (§3.8 rows 1 and 3)', () => {
  it('a NEW input: placed by whoever filed it, now — and "changed" says the same', () => {
    ranger()
    const t1 = T(9)
    expect(add('bane', 'Meeting', '2026-02-10')).toBe(true)
    const r = one('bane', 'Meeting')
    expect(stamps(r)).toEqual(placed('bane', t1))
    expect(r.mod, 'the late rule\'s date is written as before').toBe(nowStamp())
  })

  it('filed by an admin FOR another man: placed by the admin, not the man it is for', () => {
    const t1 = T(9)
    expect(add('bane', 'Meeting', '2026-02-10')).toBe(true)
    expect(stamps(one('bane', 'Meeting'))).toEqual(placed('stiff', t1))
  })

  it('a CHANGE keeps who placed it and names who changed it, now', () => {
    ranger()
    const t1 = T(9)
    add('bane', 'Meeting', '2026-02-10')
    const r = one('bane', 'Meeting')
    saber()
    const t2 = T(10)
    expect(commitInputEdit(r, { ...draftOf(r), remarks: 'moved to the briefing room' })).toBe(true)
    expect(stamps(r)).toEqual({ by: 'bane', at: t1, modBy: 'stiff', modAt: t2 })
    expect(r.mod).toBe(nowStamp())
  })

  it('a cell typed in place on the schedule is the same change', () => {
    ranger()
    const t1 = T(9)
    add('bane', 'Meeting', '2026-02-10')
    const r = one('bane', 'Meeting')
    saber()
    const t2 = T(11)
    expect(setInpField(r, 'rmks', 'typed on the board')).toBe(true)
    expect(stamps(r)).toEqual({ by: 'bane', at: t1, modBy: 'stiff', modAt: t2 })
  })
})

describe('a medical entry split or trimmed (§3.8 row 8)', () => {
  it('a new medical inside a longer one: both pieces keep who placed the old one, changed by the filer of the new', () => {
    rocky()
    const t1 = T(9)
    expect(add('rocky', 'OML', '2026-02-10', '2026-02-20')).toBe(true)
    saber()
    const t2 = T(10)
    expect(add('rocky', 'ATT C', '2026-02-13', '2026-02-14')).toBe(true)
    const oml = mine('rocky', 'OML')
    expect(oml.map(span), 'a head and a tail').toEqual(['Feb 10-Feb 12', 'Feb 15-Feb 20'])
    for (const p of oml) expect(stamps(p), span(p)).toEqual({ by: 'rocky', at: t1, modBy: 'stiff', modAt: t2 })
    expect(stamps(one('rocky', 'ATT C'))).toEqual(placed('stiff', t2))
  })

  it('an upchit that ends a downchit early: the downchit keeps who placed it, changed by the upchit\'s filer', () => {
    rocky()
    const t1 = T(9)
    expect(add('rocky', 'ATT C', '2026-02-10', '2026-02-20')).toBe(true)
    saber()
    const t2 = T(10)
    expect(add('rocky', 'Upchit', '2026-02-15')).toBe(true)
    const down = one('rocky', 'ATT C')
    expect(span(down)).toBe('Feb 10-Feb 14')
    expect(stamps(down)).toEqual({ by: 'rocky', at: t1, modBy: 'stiff', modAt: t2 })
  })

  it('a new medical filed AROUND a status the filer keeps: every piece of the new one is the filer\'s, at one moment', () => {
    rocky()
    const t1 = T(9)
    expect(add('rocky', 'OML', '2026-02-13', '2026-02-14')).toBe(true)
    saber()
    const t2 = T(10)
    /* the clash sheet's Save (ui/inputedit.tsx doMedSave): the first kept piece is filed, the rest minted beside it */
    const a = dateOrd('Feb 10', 2026) as number, b = dateOrd('Feb 20', 2026) as number
    const clashes = medClashes('rocky', 'ATT C', a, b, null)
    const segs = medKeptSegments(a, b, clashes, clashes.map(() => 'old'))
    expect(segs).toHaveLength(2)
    let saved: any = null
    writeInputsBatch(() => {
      const g0 = segs[0]
      const draft = { person: 'rocky', type: 'ATT C', allday: true, half: '', start: ordISO(g0.startOrd), end: ordISO(g0.endOrd), sTime: '06:00', eTime: '18:00', remarks: '', sans: null, docIds: [] }
      expect(commitNewInput(draft, false, [], b, (row: any) => { saved = row })).toBe(true)
      mintMedSegments(saved, segs.slice(1), [], b)
    })
    const attc = mine('rocky', 'ATT C')
    expect(attc.map(span)).toEqual(['Feb 10-Feb 12', 'Feb 15-Feb 20'])
    for (const p of attc) expect(stamps(p), span(p)).toEqual(placed('stiff', t2))
    expect(stamps(one('rocky', 'OML')), 'the status he kept is untouched').toEqual(placed('rocky', t1))
  })
})

describe('the Leave War (§3.8 rows 5, 6 and 7)', () => {
  it('a leave APPROVED on the war: placed by the approver, now', () => {
    bid('ammo', '2026-02-10')
    const t2 = T(10)
    setBidStates(cells('ammo', '2026-02-10'), 'approved')
    expect(stamps(one('ammo', 'LL'))).toEqual(placed('stiff', t2))
  })

  it('a leave EXTENDED by approving the next day: one record, placed by that approver, now', () => {
    T(9)
    approve('ammo', '2026-02-10')
    const iid = one('ammo', 'LL').iid
    casper()
    const t3 = T(11)
    approve('ammo', '2026-02-11')
    const r = one('ammo', 'LL')
    expect({ iid: r.iid, span: span(r) }).toEqual({ iid, span: 'Feb 10-Feb 11' })
    expect(stamps(r)).toEqual(placed('casper', t3))
  })

  it('a leave MOVED on the war is the same leave: who placed it is kept, changed by who moved it', () => {
    const t1 = T(9)
    approve('ammo', '2026-02-10', '2026-02-11', '2026-02-12')
    casper()
    const t2 = T(10)
    expect(moveCells(cells('ammo', '2026-02-11'), 9)).toBe('moved')
    const pieces = mine('ammo', 'LL')
    expect(pieces.map(span)).toEqual(['Feb 10-Feb 10', 'Feb 12-Feb 12', 'Feb 20-Feb 20'])
    for (const p of pieces) expect(stamps(p), span(p)).toEqual({ by: 'stiff', at: t1, modBy: 'casper', modAt: t2 })
  })

  it('a leave CUT by un-approving a day: each piece keeps who placed it, changed by who cut it', () => {
    const t1 = T(9)
    approve('ammo', '2026-02-10', '2026-02-11', '2026-02-12')
    casper()
    const t2 = T(10)
    setBidStates(cells('ammo', '2026-02-11'), 'pending')
    const pieces = mine('ammo', 'LL')
    expect(pieces.map(span)).toEqual(['Feb 10-Feb 10', 'Feb 12-Feb 12'])
    for (const p of pieces) expect(stamps(p), span(p)).toEqual({ by: 'stiff', at: t1, modBy: 'casper', modAt: t2 })
  })

  it('a leave CUT by deleting a day on the war: the same', () => {
    const t1 = T(9)
    approve('ammo', '2026-02-10', '2026-02-11', '2026-02-12')
    casper()
    const t2 = T(10)
    clearCells(cells('ammo', '2026-02-12'))
    const r = one('ammo', 'LL')
    expect(span(r)).toBe('Feb 10-Feb 11')
    expect(stamps(r)).toEqual({ by: 'stiff', at: t1, modBy: 'casper', modAt: t2 })
  })

  it('a leave CUT by sick leave: each piece keeps who placed the leave, changed by who filed the medical', () => {
    const t1 = T(9)
    expect(add('rocky', 'LL', '2026-02-10', '2026-02-14')).toBe(true)
    rocky()
    const t2 = T(10)
    expect(add('rocky', 'ATT C', '2026-02-12')).toBe(true)
    const pieces = mine('rocky', 'LL')
    expect(pieces.map(span)).toEqual(['Feb 10-Feb 11', 'Feb 13-Feb 14'])
    for (const p of pieces) expect(stamps(p), span(p)).toEqual({ by: 'stiff', at: t1, modBy: 'rocky', modAt: t2 })
    expect(stamps(one('rocky', 'ATT C'))).toEqual(placed('rocky', t2))
  })
})

describe('a posting that trims a man\'s inputs (§3.8 row 9)', () => {
  it('an admin deletes a man: an input that runs past the date keeps who placed it, changed by that admin', () => {
    rocky()
    const t1 = T(9)
    expect(add('rocky', 'OD', '2026-07-14', '2026-07-22')).toBe(true)
    saber()
    const t2 = T(10)
    expect(deletePerson('rocky')).toBe(null)
    const r = one('rocky', 'OD', 'Jul')
    expect(span(r)).toBe('Jul 14-Jul 14')
    expect(stamps(r)).toEqual({ by: 'rocky', at: t1, modBy: 'stiff', modAt: t2 })
  })

  it('a posting that runs BY ITSELF on its date is nobody\'s hand: the time is recorded, no name', () => {
    rocky()
    const t1 = T(9)
    expect(add('rocky', 'OD', '2026-07-14', '2026-07-24')).toBe(true)
    saber()
    T(10)
    expect(postOut('rocky', '2026-07-20', 'delete')).toBe(true)
    /* the day comes, and the first person to open the app is a member */
    const t3 = T(9, 20)
    ranger()
    raptorNotify(); runPoOutcomes()
    expect((PEOPLE as any).rocky.deleted, 'the posting ran').toBe(true)
    const r = one('rocky', 'OD', 'Jul')
    expect(span(r)).toBe('Jul 14-Jul 19')
    expect({ by: r.by, at: r.at, modAt: r.modAt }).toEqual({ by: 'rocky', at: t1, modAt: t3 })
    expect('modBy' in r, 'the member whose visit triggered it is not named').toBe(false)
  })
})

describe('Undo and Redo put a record back as recorded — never stamped as a new change (§3.8 row 13)', () => {
  it('a filing undone and redone carries the moment it was filed, not the moment of the Redo', () => {
    ranger()
    const t1 = T(9)
    add('bane', 'Meeting', '2026-02-10')
    T(15)
    expect(globalUndo().ok).toBe(true)
    expect(mine('bane', 'Meeting')).toHaveLength(0)
    T(16)
    expect(globalRedo().ok).toBe(true)
    expect(stamps(one('bane', 'Meeting'))).toEqual(placed('bane', t1))
  })

  it('a change undone reads as it did before the change; redone, as the change left it', () => {
    ranger()
    const t1 = T(9)
    add('bane', 'Meeting', '2026-02-10')
    const t2 = T(10)
    const r0 = one('bane', 'Meeting')
    expect(commitInputEdit(r0, { ...draftOf(r0), remarks: 'changed' })).toBe(true)
    T(15)
    expect(globalUndo().ok).toBe(true)
    expect(stamps(one('bane', 'Meeting'))).toEqual(placed('bane', t1))
    T(16)
    expect(globalRedo().ok).toBe(true)
    expect(stamps(one('bane', 'Meeting'))).toEqual({ by: 'bane', at: t1, modBy: 'bane', modAt: t2 })
  })

  it('a leave cut on the war and put back by Undo is the leave as it was approved', () => {
    const t1 = T(9)
    approve('ammo', '2026-02-10', '2026-02-11', '2026-02-12')
    const t2 = T(10)
    setBidStates(cells('ammo', '2026-02-11'), 'pending')
    expect(mine('ammo', 'LL')).toHaveLength(2)
    T(15)
    expect(globalUndo().ok).toBe(true)
    const whole = one('ammo', 'LL')
    expect(span(whole)).toBe('Feb 10-Feb 12')
    expect(stamps(whole)).toEqual(placed('stiff', t1))
    T(16)
    expect(globalRedo().ok).toBe(true)
    for (const p of mine('ammo', 'LL')) expect(stamps(p), span(p)).toEqual({ by: 'stiff', at: t1, modBy: 'stiff', modAt: t2 })
  })
})

describe('…and so for every door: Undo reads as before it, Redo as it left things — at a later hour, with no new stamp', () => {
  /* every record of a man in the test's month, with its stamps — what Undo must put back, to the letter */
  const snap = (p: string) => JSON.stringify(INPUTS.filter((r: any) => r.person === p && String(r.date).startsWith('Feb'))
    .map((r: any) => ({ iid: r.iid, type: r.type, span: span(r), ...stamps(r) })).sort((a: any, b: any) => (a.iid < b.iid ? -1 : 1)))
  const roundTrip = (p: string, door: () => void) => {
    const before = snap(p)
    T(12); door()
    const after = snap(p)
    expect(after, 'the door changed something').not.toBe(before)
    T(15); expect(globalUndo().ok, 'Undo').toBe(true)
    expect(snap(p), 'after Undo').toBe(before)
    T(16); expect(globalRedo().ok, 'Redo').toBe(true)
    expect(snap(p), 'after Redo').toBe(after)
  }
  const cases: Array<[string, string, () => void, () => void]> = [
    ['a leave approved on the war', 'ammo', () => bid('ammo', '2026-02-10'), () => { setBidStates(cells('ammo', '2026-02-10'), 'approved') }],
    ['a leave extended by the next approval', 'ammo',
      () => { bid('ammo', '2026-02-10', '2026-02-11'); setBidStates(cells('ammo', '2026-02-10'), 'approved') },
      () => { setBidStates(cells('ammo', '2026-02-11'), 'approved') }],
    ['a leave moved on the war', 'ammo', () => approve('ammo', '2026-02-10', '2026-02-11', '2026-02-12'), () => { moveCells(cells('ammo', '2026-02-11'), 9) }],
    ['a leave day deleted on the war', 'ammo', () => approve('ammo', '2026-02-10', '2026-02-11', '2026-02-12'), () => { clearCells(cells('ammo', '2026-02-12')) }],
    ['a medical filed inside a longer one', 'rocky', () => { add('rocky', 'OML', '2026-02-10', '2026-02-20') }, () => { add('rocky', 'ATT C', '2026-02-13', '2026-02-14') }],
    ['an upchit that ends a downchit early', 'rocky', () => { add('rocky', 'ATT C', '2026-02-10', '2026-02-20') }, () => { add('rocky', 'Upchit', '2026-02-15') }],
    ['a leave cut by sick leave', 'rocky', () => { add('rocky', 'LL', '2026-02-10', '2026-02-14') }, () => { add('rocky', 'ATT C', '2026-02-12') }],
  ]
  for (const [name, p, setup, door] of cases) it(name, () => { T(9); setup(); roundTrip(p, door) })
})

describe('what is never stamped', () => {
  it('with nobody signed in a record carries none of the four — there is no one to name', () => {
    resetSession(null)
    expect(add('bane', 'Meeting', '2026-02-10')).toBe(true)
    const r = one('bane', 'Meeting')
    for (const k of ['by', 'at', 'modBy', 'modAt']) expect(k in r, k).toBe(false)
  })

  it('a record filed before this job has no "placed by"; a change names who changed it and invents no filer', () => {
    resetSession(null)
    writeInputs(() => { INPUTS.unshift({ iid: 'old1', person: 'bane', type: 'LL', date: 'Feb 10', endDate: 'Feb 14', yr: 2026, allday: true, remarks: '', mod: '2026-01-05' } as any) })
    saber()
    const t2 = T(10)
    const r = one('bane', 'LL')
    expect(commitInputEdit(r, { ...draftOf(r), remarks: 'approved by the boss' })).toBe(true)
    expect(stamps(r)).toEqual({ by: undefined, at: undefined, modBy: 'stiff', modAt: t2 })
    /* …and a piece cut from it is still nobody's filing */
    const t3 = T(11)
    expect(add('bane', 'ATT C', '2026-02-12')).toBe(true)
    const pieces = mine('bane', 'LL')
    expect(pieces.map(span)).toEqual(['Feb 10-Feb 11', 'Feb 13-Feb 14'])
    for (const p of pieces) expect(stamps(p), span(p)).toEqual({ by: undefined, at: undefined, modBy: 'stiff', modAt: t3 })
  })
})

describe('found on the way: the F / O / A ticks leave a line in the change history (§3.8)', () => {
  it('ticking OFT on a SANS availability that offered only Fly writes one line, from "F" to "F/O"', () => {
    ;(PEOPLE as any).rocky.san = true
    expect(add('rocky', 'SANS Availability', '2026-02-10', '', { sans: { f: true } })).toBe(true)
    const r = one('rocky', 'SANS Availability')
    elogClear()
    expect(commitInputEdit(r, { ...draftOf(r), sans: { f: true, o: true } })).toBe(true)
    const lines = ELOG.rows.filter(x => x.sect === 'abs')
    expect(lines.map(x => ({ lbl: x.lbl, from: x.from, to: x.to }))).toEqual([{ lbl: expect.stringContaining('F / O / A'), from: 'F', to: 'F/O' }])
  })

  it('a save that leaves the ticks as they were writes no such line', () => {
    ;(PEOPLE as any).rocky.san = true
    expect(add('rocky', 'SANS Availability', '2026-02-10', '', { sans: { f: true } })).toBe(true)
    const r = one('rocky', 'SANS Availability')
    elogClear()
    expect(commitInputEdit(r, { ...draftOf(r), remarks: 'mornings only' })).toBe(true)
    expect(ELOG.rows.filter(x => x.sect === 'abs').some(x => String(x.lbl).includes('F / O / A'))).toBe(false)
  })
})
