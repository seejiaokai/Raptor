// [LW-MOVE-STANDARD] — A MOVE CARRIES THE RECORDS IT PICKED, NOT THE DAY'S TOP ONE (owner, D265, 27 Sep 26).
//
//   "For multiple records for those can be moved, u see my example 3rd and 4th picture, I couldn't see a move button
//    for vector."   (Vector's 3 Jan: an OIL award above an undecided LL bid — no Move on any door.)
//
// A day's box shows ONE main code by the ladder (leave, medical, OIL credit, course, bid…), and every grid move asked
// only that top record: a bid beneath an award, beside leave filed on the Inputs page, or in the other half of a day
// holding approved leave could be moved by no door. The record that can move now travels ALONE — the award, the filed
// leave, a medical stay where they are — and the day's list picks ONE record by its id (D266). The landing rules are
// unchanged (D265 (1)): refused whole, with its reason, when a moving record cannot land. Who may move is the store's one
// rule at every door (D333): the admin; a member on his own row inside the bidding window. A refused bid is a record
// that can move too, landing undecided — unless a live bid holds its half (it is then history beside a live bid, and
// moving it would land a second live bid on one half). Scenarios: Fable's list,
// docs/superpowers/specs/2026-09-27-lw-move-standard-scenarios-fable.md (S1–S8, S27–S32).
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { initStore as raptorInitStore, writeInputs } from '../state/store'
import { setMe, setSession } from '../state/auth'
import { projectPeople } from './state/raptorRoster'
import {
  advanceStage, deletableIn, getState, initStore as lwInitStore, lwHistInit, movableCells, movableRecords, moveCells,
  moveProblem, moveRecords, moveRecordsProblem, rawState, setBidStates, setCell, setDayAward, setPeople, setRole,
  setViewer, stayingIn, decideRequestById, absenceDoor, setAbsenceDoor, decidableIn, awardsOnDay,
} from './state/store'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync } from './sync'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'

const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  HOOKS.toast = () => {}
  setRole('admin')
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); setSession(null); setMe('bane'); setViewer(null) })

let n = 0
/** File through the real inputs door, as the Inputs page does. */
function file(person: string, type: string, date: string, extra: Record<string, any> = {}): boolean {
  const row = { iid: `ms${++n}`, person, type, date, yr: 2026, allday: true, remarks: '', mod: '2026-02-01', ...extra }
  if (row.allday === false) delete (row as any).allday
  return writeInputs(() => { INPUTS.unshift(row) })
}
const recsAt = (p: string, d: string) => rawState().wars[0]!.recs[p]?.[d] ?? []
const bidsAt = (p: string, d: string) => recsAt(p, d).filter((r: any) => r.kind === 'request')
/* an award is a ledger entry drawn on its day ([OIL-AWARD-IS-A-GRANT]) — never a war record */
const awardAt = (p: string, d: string) => awardsOnDay(p, d).length > 0
const one = (p: string, d: string) => [{ personId: p, date: d }]
const lwRows = (p: string) => INPUTS.filter((r: any) => r.person === p && r.lw)

describe('a bid beneath an OIL award (Vector’s 3 Jan — D265)', () => {
  beforeEach(() => {
    expect(setDayAward('ammo', '2026-02-10', 1, { note: 'Exercise recovery' })).toBeNull()
    expect(setCell('ammo', '2026-02-10', 'LL')).toBe(true)
  })

  it('is a record that can move — the award is not', () => {
    const m = movableRecords(one('ammo', '2026-02-10'))
    expect(m).toHaveLength(1)
    expect(m[0]).toMatchObject({ personId: 'ammo', date: '2026-02-10', kind: 'request' })
    expect(movableCells(one('ammo', '2026-02-10'))).toEqual(one('ammo', '2026-02-10'))
  })

  it('moves alone: the bid lands undecided on the new day, the award stays', () => {
    expect(moveProblem(one('ammo', '2026-02-10'), 3)).toBeNull()
    expect(moveCells(one('ammo', '2026-02-10'), 3)).toBe('moved')
    expect(bidsAt('ammo', '2026-02-13')).toHaveLength(1)
    expect(bidsAt('ammo', '2026-02-10')).toHaveLength(0)
    expect(awardAt('ammo', '2026-02-10')).toBe(true)
    expect(awardAt('ammo', '2026-02-13')).toBe(false)
  })

  it('what stays is named: the award', () => {
    const cells = one('ammo', '2026-02-10')
    expect(stayingIn(cells, movableRecords(cells)).map(s => s.what)).toEqual(['award'])
  })

  it('a day holding ONLY an award has nothing to move — refused, as before', () => {
    setDayAward('ammo', '2026-02-11', 1)
    expect(movableRecords(one('ammo', '2026-02-11'))).toEqual([])
    expect(moveCells(one('ammo', '2026-02-11'), 3)).toMatchObject({ reason: 'nothing' })
    expect(awardAt('ammo', '2026-02-11')).toBe(true)
  })
})

describe('the landing beside an award (S3)', () => {
  it('a bid lands on a day holding an award — the award is kept', () => {
    setDayAward('ammo', '2026-02-17', 1)
    setCell('ammo', '2026-02-12', 'LL')
    expect(moveCells(one('ammo', '2026-02-12'), 5)).toBe('moved')
    expect(bidsAt('ammo', '2026-02-17')).toHaveLength(1)
    expect(awardAt('ammo', '2026-02-17')).toBe(true)
  })
})

describe('two things that can move on one day (D266 — only by halves)', () => {
  it('a morning bid and an afternoon bid: a block moves both, in ONE undo step (S5)', () => {
    setCell('ammo', '2026-02-10', '*LL')
    setCell('ammo', '2026-02-10', 'LL*')
    expect(movableRecords(one('ammo', '2026-02-10'))).toHaveLength(2)
    expect(moveCells(one('ammo', '2026-02-10'), 2)).toBe('moved')
    expect(bidsAt('ammo', '2026-02-12').map((r: any) => r.code).sort()).toEqual(['*LL', 'LL*'])
    expect(bidsAt('ammo', '2026-02-10')).toHaveLength(0)
    expect(globalUndo().ok).toBe(true)
    expect(bidsAt('ammo', '2026-02-10').map((r: any) => r.code).sort()).toEqual(['*LL', 'LL*'])
    expect(bidsAt('ammo', '2026-02-12')).toHaveLength(0)
  })

  it('the day’s list picks ONE of them by its id — the other stays (S6)', () => {
    setCell('ammo', '2026-02-10', '*LL')
    setCell('ammo', '2026-02-10', 'LL*')
    const am = bidsAt('ammo', '2026-02-10').find((r: any) => r.code === '*LL')!
    const picked = movableRecords(one('ammo', '2026-02-10'), [{ personId: 'ammo', date: '2026-02-10', id: am.id }])
    expect(picked).toHaveLength(1)
    expect(moveRecords(picked, 4)).toBe('moved')
    expect(bidsAt('ammo', '2026-02-14').map((r: any) => r.code)).toEqual(['*LL'])
    expect(bidsAt('ammo', '2026-02-10').map((r: any) => r.code)).toEqual(['LL*'])
  })

  it('a morning picked from the list lands where a morning is free — beside an afternoon bid', () => {
    setCell('ammo', '2026-02-10', '*LL')
    setCell('ammo', '2026-02-10', 'LL*')
    setCell('ammo', '2026-02-12', 'OL*')
    const am = bidsAt('ammo', '2026-02-10').find((r: any) => r.code === '*LL')!
    const picked = movableRecords(one('ammo', '2026-02-10'), [{ personId: 'ammo', date: '2026-02-10', id: am.id }])
    expect(moveRecordsProblem(picked, 2)).toBeNull()
    /* …and a whole-day bid there refuses it, whole, with where */
    setCell('ammo', '2026-02-13', 'OL')
    expect(moveRecordsProblem(picked, 3)).toEqual({ reason: 'occupied', at: '2026-02-13' })
  })

  it('a leave the war approved for the morning and an afternoon bid: both travel (S8)', () => {
    setCell('ammo', '2026-02-18', '*LL')
    advanceStage()
    setBidStates(one('ammo', '2026-02-18'), 'approved')
    expect(lwRows('ammo')).toHaveLength(1)
    expect(setCell('ammo', '2026-02-18', 'LL*')).toBe(true)
    const m = movableRecords(one('ammo', '2026-02-18'))
    expect(m.map(x => x.kind).sort()).toEqual(['absence', 'request'])
    expect(moveCells(one('ammo', '2026-02-18'), 3)).toBe('moved')
    expect(bidsAt('ammo', '2026-02-21').map((r: any) => r.code)).toEqual(['LL*'])
    expect(bidsAt('ammo', '2026-02-18')).toHaveLength(0)
    expect(lwRows('ammo').map((r: any) => r.date)).toEqual(['Feb 21'])
  })

  it('leave filed on the Inputs page and an afternoon bid: the bid travels alone (W3-F3)', () => {
    expect(file('ammo', 'LL', 'Feb 10', { allday: false, half: 'am', s: 0, e: 720 })).toBe(true)
    expect(setCell('ammo', '2026-02-10', 'LL*')).toBe(true)
    expect(movableRecords(one('ammo', '2026-02-10')).map(x => x.kind)).toEqual(['request'])
    expect(moveCells(one('ammo', '2026-02-10'), 2)).toBe('moved')
    expect(bidsAt('ammo', '2026-02-12').map((r: any) => r.code)).toEqual(['LL*'])
    expect(INPUTS.filter((r: any) => r.person === 'ammo' && r.type === 'LL' && r.date === 'Feb 10')).toHaveLength(1)
    const cells = one('ammo', '2026-02-10')
    expect(stayingIn(cells, [])).toEqual([expect.objectContaining({ what: 'filed' })])
  })

  it('an afternoon bid beside a morning medical travels; the medical never moves (S27)', () => {
    expect(file('ammo', 'ATT C', 'Feb 10', { allday: false, s: 540, e: 720 })).toBe(true)
    expect(setCell('ammo', '2026-02-10', 'LL*')).toBe(true)
    expect(moveCells(one('ammo', '2026-02-10'), 1)).toBe('moved')
    expect(bidsAt('ammo', '2026-02-11').map((r: any) => r.code)).toEqual(['LL*'])
    expect(INPUTS.some((r: any) => r.person === 'ammo' && r.type === 'ATT C' && r.date === 'Feb 10')).toBe(true)
  })
})

describe('a refused bid (the mock-up’s reading, uncorrected — D331)', () => {
  it('alone on its day it moves, and lands undecided', () => {
    setCell('ammo', '2026-02-10', 'LL')
    advanceStage()
    const id = bidsAt('ammo', '2026-02-10')[0]!.id
    expect(decideRequestById('ammo', '2026-02-10', id, 'refused')).toBe(true)
    expect(movableRecords(one('ammo', '2026-02-10'))).toHaveLength(1)
    expect(moveCells(one('ammo', '2026-02-10'), 2)).toBe('moved')
    expect(bidsAt('ammo', '2026-02-12')[0]).toMatchObject({ state: 'pending' })
  })

  it('beside a live bid on the same half it is history and stays — the live bid travels (S32)', () => {
    setCell('ammo', '2026-02-10', '*LL')
    advanceStage()
    const refused = bidsAt('ammo', '2026-02-10')[0]!.id
    expect(decideRequestById('ammo', '2026-02-10', refused, 'refused')).toBe(true)
    expect(setCell('ammo', '2026-02-10', '*OL')).toBe(true)
    const m = movableRecords(one('ammo', '2026-02-10'))
    expect(m).toHaveLength(1)
    expect(m[0]!.id).not.toBe(refused)
    expect(moveCells(one('ammo', '2026-02-10'), 2)).toBe('moved')
    expect(bidsAt('ammo', '2026-02-12').map((r: any) => r.code)).toEqual(['*OL'])
    expect(bidsAt('ammo', '2026-02-10').map((r: any) => r.id)).toEqual([refused])
  })
})

describe('who may move — one rule at every door (D333)', () => {
  it('a member moves his own bid while bidding is open, and nobody else’s', () => {
    setCell('ammo', '2026-02-10', 'LL')
    setCell('rocky', '2026-02-10', 'LL')
    setRole('member'); setViewer('ammo')
    expect(movableRecords([...one('ammo', '2026-02-10'), ...one('rocky', '2026-02-10')]).map(m => m.personId)).toEqual(['ammo'])
    expect(moveCells(one('ammo', '2026-02-10'), 2)).toBe('moved')
    expect(bidsAt('ammo', '2026-02-12')).toHaveLength(1)
  })

  it('once bidding has closed a member moves nothing', () => {
    setCell('ammo', '2026-02-10', 'LL')
    advanceStage()
    setRole('member'); setViewer('ammo')
    expect(movableRecords(one('ammo', '2026-02-10'))).toEqual([])
  })

  it('an approved leave on a PUBLISHED war stays (finished paperwork) — and is named as staying', () => {
    setCell('ammo', '2026-02-18', 'LL')
    advanceStage()
    setBidStates(one('ammo', '2026-02-18'), 'approved')
    advanceStage()                                   // published
    setCell('ammo', '2026-02-20', 'LL')
    const cells = [...one('ammo', '2026-02-18'), ...one('ammo', '2026-02-20')]
    const m = movableRecords(cells)
    expect(m.map(x => x.date)).toEqual(['2026-02-20'])
    expect(stayingIn(cells, m).map(s => s.what)).toEqual(['approved'])
  })
})

describe('what a Delete would take — so the sheets offer Delete only where it can (D332)', () => {
  it('counts the days a Delete would change, for this role', () => {
    setDayAward('ammo', '2026-02-11', 1)
    setCell('ammo', '2026-02-12', 'LL')
    expect(file('ammo', 'LL', 'Feb 13')).toBe(true)
    expect(deletableIn(one('ammo', '2026-02-11'))).toBe(1)      // an award (the admin's)
    expect(deletableIn(one('ammo', '2026-02-12'))).toBe(1)      // a bid
    expect(deletableIn(one('ammo', '2026-02-13'))).toBe(0)      // leave filed on the Inputs page is changed there
    expect(deletableIn(one('ammo', '2026-02-14'))).toBe(0)      // an empty day
    setRole('member'); setViewer('ammo')
    expect(deletableIn(one('ammo', '2026-02-11'))).toBe(0)      // a member's Delete never takes an award
    expect(deletableIn(one('ammo', '2026-02-12'))).toBe(1)      // his own bid
  })
})

/* ---- THE TWO FINAL READS (Fable 5.1 and Astra, blind — docs/superpowers/briefs/2026-09-27-lw-move-standard-final-*.md) ---- */
const absId = (p: string, d: string) => (getState().wars[0]?.views[p]?.[d]?.all ?? []).filter((c: any) => c.kind === 'absence').map((c: any) => c.id)
const warId = () => getState().currentId

describe('FR1 — a block cutting a multi-day approved leave (Fable 1, Astra 1 — both, blind)', () => {
  it('a bid may not land on the leave’s day that is NOT moving — refused whole, nothing written', () => {
    expect(file('ammo', 'LL', 'Feb 11', { endDate: 'Feb 12', lw: warId() })).toBe(true)
    const a11 = absId('ammo', '2026-02-11'), a12 = absId('ammo', '2026-02-12')
    expect(a11).toHaveLength(1)
    expect(a12).toEqual(a11)                                    // ONE Input, two days — the premise
    expect(setCell('ammo', '2026-02-10', 'LL')).toBe(true)
    const cells = [...one('ammo', '2026-02-10'), ...one('ammo', '2026-02-11')]
    expect(moveProblem(cells, 2)).toEqual({ reason: 'occupied', at: '2026-02-12' })
    expect(moveCells(cells, 2)).toEqual({ reason: 'occupied', at: '2026-02-12' })
    expect(bidsAt('ammo', '2026-02-10')).toHaveLength(1)
    expect(absId('ammo', '2026-02-11')).toEqual(a11)
    expect(absId('ammo', '2026-02-12')).toEqual(a11)
  })
})

describe('FR2 — approved leave landing where a moving bid is leaving (Fable 3, Astra 1 — both, blind)', () => {
  it('fits: the leave slides onto the day the bid vacates, the bid on — ONE Undo takes both back', () => {
    expect(file('ammo', 'LL', 'Feb 10', { allday: false, half: 'am', s: 0, e: 720, lw: warId() })).toBe(true)
    expect(setCell('ammo', '2026-02-11', '*LL')).toBe(true)
    const cells = [...one('ammo', '2026-02-10'), ...one('ammo', '2026-02-11')]
    expect(movableRecords(cells).map(m => m.kind).sort()).toEqual(['absence', 'request'])
    expect(moveProblem(cells, 1)).toBeNull()
    expect(moveCells(cells, 1)).toBe('moved')
    expect(absId('ammo', '2026-02-11')).toHaveLength(1)
    expect(absId('ammo', '2026-02-10')).toHaveLength(0)
    expect(bidsAt('ammo', '2026-02-12').map((r: any) => r.code)).toEqual(['*LL'])
    expect(globalUndo().ok).toBe(true)
    expect(absId('ammo', '2026-02-10')).toHaveLength(1)
    expect(bidsAt('ammo', '2026-02-11').map((r: any) => r.code)).toEqual(['*LL'])
  })
})

describe('FR3 — a refused bid beneath approved leave on its half (Fable 2)', () => {
  const setup = () => {
    expect(setCell('ammo', '2026-02-10', '*LL')).toBe(true)
    const refused = bidsAt('ammo', '2026-02-10')[0]!.id
    expect(decideRequestById('ammo', '2026-02-10', refused, 'refused')).toBe(true)
    expect(setCell('ammo', '2026-02-10', '*LL')).toBe(true)
    setBidStates(one('ammo', '2026-02-10'), 'approved')         // the live one — the refused stays as history
    expect(lwRows('ammo')).toHaveLength(1)
    expect(bidsAt('ammo', '2026-02-10').map((r: any) => r.id)).toEqual([refused])
    return refused
  }
  it('is history and stays — only the leave moves; the landing day holds no bid', () => {
    const refused = setup()
    expect(movableRecords(one('ammo', '2026-02-10')).map(m => m.kind)).toEqual(['absence'])
    expect(moveCells(one('ammo', '2026-02-10'), 2)).toBe('moved')
    expect(lwRows('ammo').map((r: any) => r.date)).toEqual(['Feb 12'])
    expect(bidsAt('ammo', '2026-02-12')).toHaveLength(0)
    expect(bidsAt('ammo', '2026-02-10').map((r: any) => r.id)).toEqual([refused])
  })
  it('the banner names the refused bid that stays (Astra 3)', () => {
    setup()
    const cells = one('ammo', '2026-02-10')
    expect(stayingIn(cells, movableRecords(cells)).map(s => s.what)).toEqual(['refused'])
  })
})

describe('FR3b — the door’s answer at the commit is never thrown away (Fable 2 (b))', () => {
  it('a refusal the preview did not foresee rolls the whole move back and is said', () => {
    expect(file('ammo', 'LL', 'Feb 10', { lw: warId() })).toBe(true)
    expect(setCell('ammo', '2026-02-13', 'LL')).toBe(true)
    const real = absenceDoor()!
    setAbsenceDoor({ ...real, moveApproved: (items, delta, tracked, check, skip) => (check ? real.moveApproved(items, delta, tracked, true, skip) : { reason: 'occupied', at: '2026-02-12' }) })
    try {
      const cells = [...one('ammo', '2026-02-10'), ...one('ammo', '2026-02-13')]
      expect(moveCells(cells, 2)).toEqual({ reason: 'occupied', at: '2026-02-12' })
      expect(bidsAt('ammo', '2026-02-13')).toHaveLength(1)      // the bid did NOT move — rolled back whole
      expect(bidsAt('ammo', '2026-02-15')).toHaveLength(0)
      expect(lwRows('ammo').map((r: any) => r.date)).toEqual(['Feb 10'])
    } finally { setAbsenceDoor(real) }
  })
})

describe('FR3 (S32) — the refused bid beside a live one is named as staying (Astra 3)', () => {
  it('"1 refused bid stays"', () => {
    setCell('ammo', '2026-02-10', '*LL')
    advanceStage()
    const refused = bidsAt('ammo', '2026-02-10')[0]!.id
    decideRequestById('ammo', '2026-02-10', refused, 'refused')
    setCell('ammo', '2026-02-10', '*OL')
    const cells = one('ammo', '2026-02-10')
    expect(stayingIn(cells, movableRecords(cells)).map(s => s.what)).toEqual(['refused'])
  })
})

describe('FR4 — what a Decide over these days would answer (Fable 4, Astra 2 — both, blind)', () => {
  it('counts the days holding something to decide', () => {
    setCell('ammo', '2026-02-11', 'LL')
    setDayAward('ammo', '2026-02-12', 1)
    expect(decidableIn(one('ammo', '2026-02-11'))).toBe(1)
    expect(decidableIn(one('ammo', '2026-02-12'))).toBe(0)      // an award is nobody's to decide
    expect(decidableIn(one('ammo', '2026-02-13'))).toBe(0)
    setRole('member'); setViewer('ammo')
    expect(decidableIn(one('ammo', '2026-02-11'))).toBe(0)      // a member never decides
  })
})
