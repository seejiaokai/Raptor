/* THE LEAVE WAR'S DECISIONS ARE LINES IN THE CHANGE HISTORY ([DRAFT-PENDING], 28 Sep 26 — the owner's D263: the
   Leave War's approve, refuse, back-to-bid and move, each a line with who and when; ONE line per decision — an approval
   files its Input in the same command, and the two must not read as two changes). Runs in the Leave War project (fixed
   TZ), over the full wired sync, the way causal-envelope.test.ts does. */
import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { ELOG, elogClear, rowTouches } from '../engine/editlog'
import { initStore as raptorInitStore } from '../state/store'
import { projectPeople } from './state/raptorRoster'
import { getState, initStore as lwInitStore, setCell, setBidState, setPeople, setRole, advanceStage, shiftBid, setManualCredit, clearCells, grantOil } from './state/store'
import { resetSession, writeInputs } from '../state/store'
import { signIn, sessionFor } from '../state/accounts'
import { inpId } from '../engine/inputs'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync } from './sync'

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
