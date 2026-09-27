/* THE LEAVE WAR'S DECISIONS ARE LINES IN THE CHANGE HISTORY ([DRAFT-PENDING], 28 Sep 26 — the owner's D263: the
   Leave War's approve, refuse, back-to-bid and move, each a line with who and when; ONE line per decision — an approval
   files its Input in the same command, and the two must not read as two changes). Runs in the Leave War project (fixed
   TZ), over the full wired sync, the way causal-envelope.test.ts does. */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { ELOG, elogClear, rowTouches } from '../engine/editlog'
import { initStore as raptorInitStore } from '../state/store'
import { projectPeople } from './state/raptorRoster'
import { getState, initStore as lwInitStore, setCell, setBidState, setPeople, setRole, advanceStage, shiftBid, setManualCredit, clearCells, grantOil, changeAbsenceById, moveAbsenceById } from './state/store'
import { resetSession, writeInputs } from '../state/store'
import { signIn, sessionFor } from '../state/accounts'
import { inpId } from '../engine/inputs'
import { deletePerson } from '../state/person-delete'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync, postOut, undoPostOut } from './sync'

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
    const r = shiftBid(pid, '2026-02-02', '2026-02-09')
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
    expect(moveAbsenceById(pid, '2026-02-02', iid, '2026-02-03')).toBeNull()
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
})
