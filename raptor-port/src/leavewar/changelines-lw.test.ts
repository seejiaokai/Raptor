/* THE LEAVE WAR'S DECISIONS ARE LINES IN THE CHANGE HISTORY ([DRAFT-PENDING], 28 Sep 26 — the owner's D263: the
   Leave War's approve, refuse, back-to-bid and move, each a line with who and when; ONE line per decision — an approval
   files its Input in the same command, and the two must not read as two changes). Runs in the Leave War project (fixed
   TZ), over the full wired sync, the way causal-envelope.test.ts does. */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { ELOG, elogClear, rowTouches } from '../engine/editlog'
import { initStore as raptorInitStore } from '../state/store'
import { projectPeople } from './state/raptorRoster'
import { getState, initStore as lwInitStore, setCell, setBidState, setPeople, setRole, advanceStage, setManualCredit, clearCells, grantOil, changeAbsenceById, moveCells, moveRecords } from './state/store'
import { resetSession, writeInputs } from '../state/store'
import { signIn, sessionFor } from '../state/accounts'
import { inpId } from '../engine/inputs'
import { deletePerson } from '../state/person-delete'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync, postOut, undoPostOut, runPoOutcomes } from './sync'
import { PEOPLE } from '../engine/people'
/* [LW-SPARE-MOVE-DOORS] (28 Sep 26): the old one-bid mover `shiftBid` is RETIRED — every move goes through the one door,
   `moveRecords`, which the grid, the one-day sheet and the day's list all use. These tests keep what they pinned by asking
   that door the way a drag of the day does (`moveCells`, the store's kept cell adapter over it) and answering in the old
   words ('shifted' / the refusal's reason). */
const bidGap = (a: string, b: string) => Math.round((Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10))) / 86400000)
const moveBidVia = (pid: string, from: string, to: string) => { const r = moveCells([{ personId: pid, date: from }], bidGap(from, to)); return r === 'moved' ? 'shifted' : r.reason }
/* [LW-SPARE-MOVE-DOORS] (28 Sep 26): `moveAbsenceById` (the day's list's old date-box move) is RETIRED — the day's list
   moves one record through the one door, `moveRecords` (D266). These tests keep what they pinned by moving that one leave,
   by its id, through that door: null when it moved, else the refusal's reason. */
const leaveGap = (a: string, b: string) => Math.round((Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10))) / 86400000)
const moveLeaveVia = (pid: string, date: string, iid: string, to: string): string | null => { const r = moveRecords([{ personId: pid, date, id: iid, kind: 'absence' }], leaveGap(date, to)); return r === 'moved' ? null : r.reason }


const ISNAP = JSON.stringify(INPUTS)
let pid = ''
beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  setRole('admin')
  pid = getState().people[0].id
  setCell(pid, '2026-02-02', 'LL')
  if (getState().period.stage === 'open') advanceStage()
  elogClear()
})
const war = () => ELOG.rows.filter(r => r.sect === 'abs')

describe('a decision on the Leave War', () => {
  it('approve: ONE line, "approved on the Leave War", on the day', () => {
    setBidState(pid, '2026-02-02', 'approved')
    expect(war()).toHaveLength(1)
    expect(war()[0]!.lbl).toContain('approved on the Leave War')
    expect(rowTouches(war()[0]!, '2026-02-02')).toBe(true)
  })

  it('refuse and acknowledge: one line each, in plain words', () => {
    setBidState(pid, '2026-02-02', 'refused')
    expect(war().map(r => r.lbl)).toEqual([expect.stringContaining('refused')])
    elogClear()
    setBidState(pid, '2026-02-02', 'acknowledged')
    expect(war().map(r => r.lbl)).toEqual([expect.stringContaining('acknowledged')])
  })

  it('back to a bid after an approval: ONE line', () => {
    setBidState(pid, '2026-02-02', 'approved')
    elogClear()
    setBidState(pid, '2026-02-02', 'pending')
    expect(war()).toHaveLength(1)
    expect(war()[0]!.lbl).toMatch(/back to a bid/)
  })

  it('a bid moved to another day: ONE line, on the day it left and the day it reached', () => {
    const r = moveBidVia(pid, '2026-02-02', '2026-02-09')
    expect(r).toBe('shifted')
    expect(war()).toHaveLength(1)
    expect(war()[0]!.lbl).toContain('moved from')
    expect(rowTouches(war()[0]!, '2026-02-02')).toBe(true)
    expect(rowTouches(war()[0]!, '2026-02-09')).toBe(true)
    expect(rowTouches(war()[0]!, '2026-02-05')).toBe(false)
  })
})

/* [DRAFT-PENDING] — Fable's scenario design (S12, P10, P11): an OIL award's three acts, a grant on the ledger, and a bid an
   input takes away — none of them had a test */
describe('an OIL award, a grant, and a bid an input takes away', () => {
  it('an award given, changed and taken away: one line each, naming who gave it', () => {
    expect(setManualCredit(pid, '2026-02-09', 'FO', { givenBy: 'Saber' })).toBeNull()
    expect(war().map(r => r.lbl)).toEqual([expect.stringContaining('OIL award given by Saber')])
    elogClear()
    expect(setManualCredit(pid, '2026-02-09', 'FO', { givenBy: 'Saber', note: 'the Sunday duty' })).toBeNull()
    expect(war().map(r => r.lbl)).toEqual([expect.stringContaining('OIL award changed')])
    elogClear()
    clearCells([{ personId: pid, date: '2026-02-09' }])
    expect(war().map(r => r.lbl)).toEqual([expect.stringContaining('OIL award taken away')])
  })

  it('a grant on the OIL tracker reads "OIL", as the app names it (D25), one line per person', () => {
    expect(grantOil([pid], 1, '2026-02-03', 'given')).toBeNull()
    expect(war()).toHaveLength(1)
    expect(war()[0]!.lbl).toContain('OIL +1')
    expect(war()[0]!.lbl).not.toContain('oil +1')
  })

  it('a bid an admin files an input over: the bid leaving is a line too, beside the line for the input itself', () => {
    resetSession(sessionFor(signIn('ad', 'a') as any))
    setRole('admin')
    elogClear()
    const r: any = { person: pid, date: 'Feb 2', yr: 2026, allday: true, type: 'LL', remarks: '' }
    expect(writeInputs(() => { inpId(r); INPUTS.unshift(r) })).toBe(true)
    const lbls = war().map(x => x.lbl)
    expect(lbls.some(l => /added/.test(l)), 'the line for the input itself').toBe(true)
    expect(lbls.some(l => /Leave War/.test(l) && /bid taken away/.test(l)), 'and the bid it took away').toBe(true)
  })
})

/* Astra's final read (ASTRA-DP-FINAL-01): a bid leaving the war in a command that is NOT the war's own is not always an
   input covering it — a person deleted takes his bids and his awards from the delete's date on, and each must say what
   happened, never "an input covers it" (and an award must not leave silently) */
describe('a person deleted: what leaves the war says so', () => {
  it('his bid and his OIL award, each ONE honest line — no "input covers it"', () => {
    resetSession(sessionFor(signIn('ad', 'a') as any))
    setRole('admin')
    expect(setManualCredit(pid, '2026-02-09', 'FO', { givenBy: 'Saber' })).toBeNull()
    elogClear()
    vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date(2026, 0, 15, 9, 0, 0))   // "today" before his war days
    try { expect(deletePerson(pid)).toBeNull() } finally { vi.useRealTimers() }
    const lbls = war().map(x => x.lbl)
    expect(lbls.join(' | '), 'never an input that does not exist').not.toMatch(/input covers it/)
    expect(lbls.filter(l => /LL/.test(l) && /removed/.test(l)), 'the bid').toHaveLength(1)
    expect(lbls.filter(l => /OIL award taken away/.test(l)), 'the award').toHaveLength(1)
  })
})

/* Fable's final read (F2): an APPROVED leave changed on the war — deleted, refused, moved — said what actually happened
   only by the shape of the Input change, so a delete read "approval taken back (back to a bid)" and a move read as an
   un-approval plus a fresh approval. Through the war's own doors. */
describe('an approved leave changed on the Leave War', () => {
  const approvedIid = () => {
    const had = new Set(INPUTS.map((x: any) => x.iid))
    setBidState(pid, '2026-02-02', 'approved')
    const inp: any = INPUTS.find((x: any) => x.person === pid && !had.has(x.iid))
    expect(inp, 'the approval filed an input').toBeTruthy()
    elogClear()
    return String(inp.iid)
  }
  it('deleted: ONE line that says deleted — never "back to a bid"', () => {
    const iid = approvedIid()
    expect(changeAbsenceById(pid, '2026-02-02', iid, 'removed')).toBeNull()
    const l = war().map(r => r.lbl)
    expect(l, JSON.stringify(l)).toHaveLength(1)
    expect(l[0]).toMatch(/deleted/)
    expect(l[0]).not.toMatch(/back to a bid/)
  })
  it('refused: ONE line that says refused', () => {
    const iid = approvedIid()
    expect(changeAbsenceById(pid, '2026-02-02', iid, 'refused')).toBeNull()
    const l = war().map(r => r.lbl)
    expect(l, JSON.stringify(l)).toHaveLength(1)
    expect(l[0]).toMatch(/refused/)
  })
  it('moved to another day: ONE line, "moved", on the day it left and the day it reached', () => {
    const iid = approvedIid()
    expect(moveLeaveVia(pid, '2026-02-02', iid, '2026-02-03')).toBeNull()
    const rows = war()
    expect(rows.map(r => r.lbl), JSON.stringify(rows.map(r => r.lbl))).toHaveLength(1)
    expect(rows[0]!.lbl).toMatch(/moved/)
    expect(rows[0]!.lbl).not.toMatch(/approved on the Leave War/)
    expect(rowTouches(rows[0]!, '2026-02-02')).toBe(true)
    expect(rowTouches(rows[0]!, '2026-02-03')).toBe(true)
  })
})

/* Fable's final read (F4): a posting out is an admin's decision on the war (D229) — set, changed or taken back, it is a
   line with who and when (D169); the day it runs is the posting pass's, not a person's */
describe('a posting out', () => {
  it('set, then taken back: ONE line each', () => {
    resetSession(sessionFor(signIn('ad', 'a') as any))
    setRole('admin')
    elogClear()
    expect(postOut(pid, '2026-10-14', 'overseas')).toBe(true)
    const set = ELOG.rows.filter(r => /posting out/.test(r.lbl))
    expect(set.map(r => r.lbl), 'one line for the posting').toHaveLength(1)
    expect(set[0]!.lbl).toMatch(/14 Oct/)
    expect(set[0]!.date).toBe('2026-10-14')
    elogClear()
    expect(undoPostOut(pid)).toBe(true)
    const back = ELOG.rows.filter(r => /posting out/.test(r.lbl))
    expect(back.map(r => r.lbl), 'one line for taking it back').toHaveLength(1)
    expect(back[0]!.lbl).toMatch(/taken back/)
  })

  /* [CHG-BY-ITEM] (Fable F3 / Astra 05): a posting line says WHOSE it is and WHAT it is, by id, so the changes window files
     it under "Leave War · <him>" — never by its words */
  it('each posting line keeps whose it is (sub) and that it is a posting — a Leave War line', () => {
    resetSession(sessionFor(signIn('ad', 'a') as any))
    setRole('admin')
    elogClear()
    expect(postOut(pid, '2026-10-14', 'overseas')).toBe(true)
    const r = ELOG.rows.find(x => /posting out/.test(x.lbl))!
    expect([r.sect, r.sub, r.fld]).toEqual(['abs', pid, 'posting'])
    undoPostOut(pid)
  })
})

/* Astra's read of the fixes (ASTRA-FIX-01): ONE day changed out of an approved leave of several — the war cuts the Input
   and SPLITS it (the day after the cut is a new Input of the same man and type), which must not read as the other days
   leaving, nor as a fresh approval */
describe('one day of a three-day approved leave', () => {
  const threeDays = () => {
    setCell(pid, '2026-02-03', 'LL'); setCell(pid, '2026-02-04', 'LL')
    const had = new Set(INPUTS.map((x: any) => x.iid))
    for (const d of ['2026-02-02', '2026-02-03', '2026-02-04']) setBidState(pid, d, 'approved')
    const mine = INPUTS.filter((x: any) => x.person === pid && !had.has(x.iid))
    expect(mine, 'the three approvals are one Input').toHaveLength(1)
    elogClear()
    return String((mine[0] as any).iid)
  }
  it('refused in the middle: ONE line, on that day only', () => {
    const iid = threeDays()
    expect(changeAbsenceById(pid, '2026-02-03', iid, 'refused')).toBeNull()
    const rows = war()
    expect(rows.map(r => r.lbl), JSON.stringify(rows.map(r => r.lbl))).toHaveLength(1)
    expect(rows[0]!.lbl).toMatch(/refused/)
    expect(rowTouches(rows[0]!, '2026-02-03')).toBe(true)
    expect(rowTouches(rows[0]!, '2026-02-04'), 'the 4th did not change').toBe(false)
  })
  it('deleted in the middle: ONE line, on that day only', () => {
    const iid = threeDays()
    expect(changeAbsenceById(pid, '2026-02-03', iid, 'removed')).toBeNull()
    const rows = war()
    expect(rows.map(r => r.lbl), JSON.stringify(rows.map(r => r.lbl))).toHaveLength(1)
    expect(rows[0]!.lbl).toMatch(/deleted/)
    expect(rowTouches(rows[0]!, '2026-02-04'), 'the 4th did not change').toBe(false)
  })
  it('the middle day moved: ONE line, "moved", from that day to its new day', () => {
    const iid = threeDays()
    expect(moveLeaveVia(pid, '2026-02-03', iid, '2026-02-09')).toBeNull()
    const rows = war()
    expect(rows.map(r => r.lbl), JSON.stringify(rows.map(r => r.lbl))).toHaveLength(1)
    expect(rows[0]!.lbl).toMatch(/moved/)
    expect(rowTouches(rows[0]!, '2026-02-03')).toBe(true)
    expect(rowTouches(rows[0]!, '2026-02-09')).toBe(true)
    expect(rowTouches(rows[0]!, '2026-02-04'), 'the 4th did not move').toBe(false)
  })
})

/* ASTRA-FIX-02: a posting taken back AFTER it ran — the take-back is the posting's decision, and it is ONE line, whatever
   the posting had made (an archive, a SANS tick) */
describe('a posting taken back after it ran', () => {
  for (const outcome of ['overseas', 'sans'] as const) {
    it(`${outcome}: ONE line, "posting out taken back" — not the Quals field it had changed`, () => {
      resetSession(sessionFor(signIn('ad', 'a') as any)); setRole('admin')
      /* a man no earlier test in this file has deleted or posted (the file's world is re-seeded per test, the roster's
         marks are not) */
      const pid = getState().people.map(p => p.id).find(id => !['bane', 'stiff'].includes(id) && (PEOPLE as any)[id] && !(PEOPLE as any)[id].deleted && !(PEOPLE as any)[id].archived && !(PEOPLE as any)[id].san && !(PEOPLE as any)[id].special)!
      vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date(2026, 9, 14, 9, 0, 0))
      try {
        expect(postOut(pid, '2026-10-14', outcome)).toBe(true)
        runPoOutcomes()
        const P: any = (PEOPLE as any)[pid]
        expect(outcome === 'overseas' ? P.archived : P.san, 'the posting ran').toBeTruthy()
        elogClear()
        expect(undoPostOut(pid)).toBe(true)
      } finally { vi.useRealTimers() }
      const l = ELOG.rows.map(r => r.lbl)
      expect(l.filter(x => /posting out taken back/.test(x)), JSON.stringify(l)).toHaveLength(1)
      expect(l.filter(x => /archived|SANS/.test(x)), JSON.stringify(l)).toHaveLength(0)
    })
  }
})

/* Fable's read of the fixes: FF3 — approving the day NEXT TO an approved leave extends that leave's Input (one record, not
   two); it must read as the approval it is, never a delete. FF2 (a) — a posting that has run, re-dated: ONE "changed"
   line. FF4 — every absence line keeps whose it is (by id), for "To go out" to find it after a move. */
describe('Fable FF2-FF4', () => {
  it('FF3: approving the day next to an approved leave is ONE line, "approved", on that day only', () => {
    setBidState(pid, '2026-02-02', 'approved')
    setCell(pid, '2026-02-03', 'LL')
    elogClear()
    setBidState(pid, '2026-02-03', 'approved')
    const rows = war()
    expect(rows.map(r => r.lbl), JSON.stringify(rows.map(r => r.lbl))).toHaveLength(1)
    expect(rows[0]!.lbl).toMatch(/approved on the Leave War/)
    expect(rows[0]!.lbl).not.toMatch(/deleted/)
    expect(rowTouches(rows[0]!, '2026-02-03')).toBe(true)
    expect(rowTouches(rows[0]!, '2026-02-02'), 'the 2nd was already approved').toBe(false)
    expect((rows[0] as any).sub, 'whose leave it is, by id (FF4)').toBe(pid)
  })
  it('FF2 (a): a posting that has run, re-dated: ONE line, "posting out changed"', () => {
    resetSession(sessionFor(signIn('ad', 'a') as any)); setRole('admin')
    const alt = getState().people.map(p => p.id).find(id => !['bane', 'stiff'].includes(id) && (PEOPLE as any)[id] && !(PEOPLE as any)[id].deleted && !(PEOPLE as any)[id].archived && !(PEOPLE as any)[id].san && !(PEOPLE as any)[id].special)!
    vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date(2026, 9, 14, 9, 0, 0))
    try {
      expect(postOut(alt, '2026-10-14', 'overseas')).toBe(true)
      runPoOutcomes()
      expect((PEOPLE as any)[alt].archived, 'the posting ran').toBeTruthy()
      elogClear()
      expect(postOut(alt, '2026-10-21', 'overseas')).toBe(true)
    } finally { vi.useRealTimers() }
    const l = ELOG.rows.map(r => r.lbl)
    expect(l.filter(x => /posting out changed/.test(x)), JSON.stringify(l)).toHaveLength(1)
    expect(l.filter(x => /archived/.test(x)), JSON.stringify(l)).toHaveLength(0)
  })
})

/* Astra's round-3 read: a line about approved leave keeps EVERY record it is about (the moved day's new record first, so a
   tap goes where the leave is now; the old one too, so "To go out" on the day it left finds it by id — never by guessing
   from the man), and the EXACT days when they are not one run (a gap day is untouched) */
describe('Astra R3', () => {
  const threeDays = () => {
    setCell(pid, '2026-02-03', 'LL'); setCell(pid, '2026-02-04', 'LL')
    const had = new Set(INPUTS.map((x: any) => x.iid))
    for (const d of ['2026-02-02', '2026-02-03', '2026-02-04']) setBidState(pid, d, 'approved')
    const mine = INPUTS.filter((x: any) => x.person === pid && !had.has(x.iid))
    elogClear()
    return String((mine[0] as any).iid)
  }
  it('R3-01/02: the middle day moved — the line points at the record on its new day, and keeps the old one too', () => {
    const iid = threeDays()
    expect(moveLeaveVia(pid, '2026-02-03', iid, '2026-02-09')).toBeNull()
    const row: any = war()[0]
    const now: any = INPUTS.find((x: any) => String(x.iid) === row.iid)
    expect(now, 'the line names a record that exists').toBeTruthy()
    expect(String(now.date), 'the record on the new day').toMatch(/Feb 9\b/)
    expect(row.iids, 'and the record it left').toContain(iid)
  })
  it('R3-03: two approved leaves with a gap between, removed together — the gap day is untouched', () => {
    setCell(pid, '2026-02-04', 'LL')
    setBidState(pid, '2026-02-02', 'approved'); setBidState(pid, '2026-02-04', 'approved')
    elogClear()
    clearCells([{ personId: pid, date: '2026-02-02' }, { personId: pid, date: '2026-02-04' }])
    const rows = war().filter(r => /deleted/.test(r.lbl))
    expect(rows.map(r => r.lbl), JSON.stringify(war().map(r => r.lbl))).toHaveLength(1)
    expect(rowTouches(rows[0]!, '2026-02-02')).toBe(true)
    expect(rowTouches(rows[0]!, '2026-02-04')).toBe(true)
    expect(rowTouches(rows[0]!, '2026-02-03'), 'the gap').toBe(false)
  })
})

/* Fable's round-3 read (G1, G2): a two-day approved leave slid one day by a block move (2–3 Feb → 3–4 Feb) is what the
   line says — not "2 Feb → 4 Feb" — and its record is the one on the new days */
describe('Fable G1-G2', () => {
  it('a two-day leave slid one day: "2 Feb–3 Feb → 3 Feb–4 Feb", pointing at the leave where it is now', () => {
    setCell(pid, '2026-02-03', 'LL')
    setBidState(pid, '2026-02-02', 'approved'); setBidState(pid, '2026-02-03', 'approved')
    elogClear()
    const r = moveCells([{ personId: pid, date: '2026-02-02' }, { personId: pid, date: '2026-02-03' }], 1)
    expect(r, JSON.stringify(r)).toBe('moved')
    const rows: any[] = war()
    expect(rows.map(x => x.lbl), JSON.stringify(rows.map(x => x.lbl))).toHaveLength(1)
    expect(rows[0].lbl).toContain('2 Feb–3 Feb → 3 Feb–4 Feb')
    const now: any = INPUTS.find((x: any) => String(x.iid) === rows[0].iid)
    expect(now && String(now.date), 'the leave where it is now').toMatch(/Feb 3\b/)
  })
})
