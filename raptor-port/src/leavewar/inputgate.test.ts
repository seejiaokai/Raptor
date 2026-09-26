// The absence rules at the inputs door ([ARCH-STACK] step 4 — clash check B7,
// H1, H2; design §25, §26; owner answers A–D). Driven through the REAL Raptor
// inputs door (writeInputs) and the real global undo, over both wired stores.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { initStore as raptorInitStore, writeInputs } from '../state/store'
import { setMe, setSession } from '../state/auth'
import { projectPeople } from './state/raptorRoster'
import {
  ackReplacement, advanceStage, cellProblem, getState, setBidState, initStore as lwInitStore, lwEditLists, lwHistInit, rawState, setCell, setCells, clearCells, setBidStates, setPeople, setRole, setViewer,
} from './state/store'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync, sliceInput, syncAbsences } from './sync'
import { globalRedo, globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'

const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
let said: string[] = []

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  said = []
  HOOKS.toast = (m: any) => { said.push(String(m)) }
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); setSession(null); setMe('bane') })

let n = 0
/** File through the real inputs door, as the Inputs page does. */
function file(person: string, type: string, date: string, extra: Record<string, any> = {}): boolean {
  const row = { iid: `g${++n}`, person, type, date, yr: 2026, allday: true, remarks: '', mod: '2026-02-01', ...extra }
  if (row.allday === false) delete (row as any).allday
  return writeInputs(() => { INPUTS.unshift(row) })
}
const rowsOf = (person: string, type?: string) => INPUTS.filter((r: any) => r.person === person && (!type || r.type === type))
const codeAt = (p: string, d: string) => getState().grid[p]?.[d]
const recsAt = (p: string, d: string) => rawState().wars[0]!.recs[p]?.[d] ?? []

describe('the invariant — no overlapping leave, no leave over a medical (B7, §25)', () => {
  it('refuses a second leave on the same time and names the first', () => {
    expect(file('ammo', 'LL', 'Feb 10')).toBe(true)
    const before = JSON.stringify(INPUTS)
    expect(file('ammo', 'OL', 'Feb 10')).toBe(false)
    expect(JSON.stringify(INPUTS)).toBe(before)
    expect(said.some(m => m.includes('already has LL on 10 Feb'))).toBe(true)
  })

  it('allows two leaves in one morning at times that do not overlap (owner, 20 Sep 26)', () => {
    expect(file('ammo', 'LL', 'Feb 10', { allday: false, s: 8 * 60, e: 10 * 60 })).toBe(true)
    expect(file('ammo', 'OL', 'Feb 10', { allday: false, s: 10 * 60 + 30, e: 11 * 60 + 30 })).toBe(true)
    expect(rowsOf('ammo').filter((r: any) => r.date === 'Feb 10')).toHaveLength(2)
  })

  it('refuses leave over a medical, whole', () => {
    expect(file('ammo', 'ATT C', 'Feb 11')).toBe(true)
    expect(file('ammo', 'LL', 'Feb 10', { endDate: 'Feb 12' })).toBe(false)
    expect(rowsOf('ammo', 'LL')).toHaveLength(0)
    expect(said.some(m => m.includes("leave can't go over a medical"))).toBe(true)
  })

  it('a course or overseas duty is no bar to leave (owner Q8)', () => {
    expect(file('ammo', 'CSE', 'Feb 10', { endDate: 'Feb 14' })).toBe(true)
    expect(file('ammo', 'LL', 'Feb 12')).toBe(true)
    expect(codeAt('ammo', '2026-02-12')).toBe('LL')
  })
})

describe('leave over recorded work is FLAGGED, not refused (owner, 20 Sep 26)', () => {
  /* The owner reversed the refusal on 20 Sep 26, on the app's own doctrine:
     "does making a hard refusal be a bit contradicting to what I'm allowing
     for the schedule? Currently on the schedule if there's a clash I still
     allow planning but there is just flagging." So leave over recorded work
     is written, the day goes amber, and the filer is told in the same breath.
     The TIME test (§26.3, B4) is untouched: hours that miss are not a clash
     at all, and nothing is said. */
  /* B8 and Q7 — "a credit may carry work times; none means the WHOLE day" —
     still stand, NARROWED by N13 (20 Sep 26) to the credit they now describe:
     an AUTOMATIC one, read off a published schedule that reported no hours.
     They no longer reach a hand-typed award, which says a man is OWED a day
     and nothing about where he was.
     THE EARNED-CREDIT HALF of this rule is proved in `scenarios-bughunt`
     ("filing the leave the other way round is flagged too"), where a real
     duty input is published and the OIL pass mints the credit itself. It
     cannot be staged here: the pass's reverse half takes an earned credit
     straight back off any day no published schedule supports, so a
     hand-planted one is gone before the door is reached. What belongs
     here is the half that door decides — an AWARD is not work. */
  it('…and says NOTHING when the day only carries an AWARD (N13, N16 — not B8/Q7)', () => {
    /* The other half, which nothing pinned before: an award is not evidence
       that anybody worked, so filing leave beside one is an ordinary filing.
       Invisible until N16 let the two share a day — and the reason this is
       the place it would have gone wrong. */
    setRole('admin')
    expect(setCell('ammo', '2026-02-14', 'FO')).toBe(true)
    expect(file('ammo', 'LL', 'Feb 14')).toBe(true)
    expect(said.some(m => m.includes('recorded as working'))).toBe(false)
    expect(getState().views.ammo?.['2026-02-14']?.amber).toBe(false)
    expect(codeAt('ammo', '2026-02-14')).toBe('LL')
  })


  it('approving a bid on a day later credited as worked GRANTS it and flags the day (owner, 20 Sep 26)', () => {
    /* This used to skip the day (owner Q5, §26.3). The owner reversed it on
       20 Sep 26: recorded work never refuses a write, on any screen, because
       the same leave must not be kept or lost depending on where it was typed.
       The leave is granted, and the day carries the amber for a human. */
    setRole('admin')
    expect(setCell('ammo', '2026-02-14', 'LL')).toBe(true)
    // the work was credited after the bid
    // the SCHEDULE credited the work after the bid — an award would not flag
    // the day at all (N13), so it cannot stand in for one here
    lwEditLists([{ personId: 'ammo', date: '2026-02-14', drop: [], add: [{ id: 'c-late', kind: 'credit', code: 'FO', oil: 'auto' } as any] }])
    advanceStage()
    setBidState('ammo', '2026-02-14', 'approved')
    expect(rowsOf('ammo', 'LL')).toHaveLength(1)                    // granted
    expect(codeAt('ammo', '2026-02-14')).toBe('LL')
  })
})

describe('sick cuts leave in half-day steps (H2, §26.1)', () => {
  it('LL 14–18 Jul, medical 16–17 → LL 14–15 + 18; undo → LL 14–18', () => {
    expect(file('rocky', 'LL', 'Jul 14', { endDate: 'Jul 18' })).toBe(true)
    expect(file('rocky', 'ATT C', 'Jul 16', { endDate: 'Jul 17' })).toBe(true)
    const ll = rowsOf('rocky', 'LL').map((r: any) => `${r.date}-${r.endDate ?? r.date}`).sort()
    expect(ll).toEqual(['Jul 14-Jul 15', 'Jul 18-Jul 18'])
    expect(codeAt('rocky', '2026-07-16')).toBe('ATTC')
    expect(codeAt('rocky', '2026-07-18')).toBe('LL')
    expect(said.some(m => m.includes('is cut for the ATT C'))).toBe(true)
    expect(globalUndo().ok).toBe(true)
    expect(rowsOf('rocky', 'LL').map((r: any) => `${r.date}-${r.endDate}`)).toEqual(['Jul 14-Jul 18'])
    expect(rowsOf('rocky', 'ATT C')).toHaveLength(0)
  })

  it('a morning medical turns a full leave day into the afternoon', () => {
    expect(file('rocky', 'LL', 'Jul 14')).toBe(true)
    expect(file('rocky', 'ATT C', 'Jul 14', { allday: false, half: 'am', s: 0, e: 720 })).toBe(true)
    const ll = rowsOf('rocky', 'LL')
    expect(ll).toHaveLength(1)
    expect(ll[0].half).toBe('pm')
    expect(ll[0].allday).toBe(false)
  })

  it('ATT B leaves the leave alone', () => {
    expect(file('rocky', 'LL', 'Jul 14')).toBe(true)
    expect(file('rocky', 'ATT B', 'Jul 14')).toBe(true)
    expect(rowsOf('rocky', 'LL')[0].allday).toBe(true)
  })
})

describe('a clashing input replaces an undecided bid (owner rule, H1, answer B, B6)', () => {
  function bid(p: string, d: string, code = 'LL') {
    setRole('admin')
    expect(setCell(p, d, code)).toBe(true)
  }

  it('an admin filing over a pending bid replaces it and leaves a notice until "OK, seen"', () => {
    /* [ACCOUNTS] (D166 (5), 26 Sep 26): the admin is a person now — signed in as Saber —
       and the notice names him by callsign, not "an admin" */
    setMe('stiff')
    bid('ammo', '2026-02-10')
    expect(file('ammo', 'ATT C', 'Feb 10')).toBe(true)
    const list = recsAt('ammo', '2026-02-10')
    expect(list.some(r => r.kind === 'request')).toBe(false)
    const notice = list.find(r => r.kind === 'notice') as any
    expect(notice).toMatchObject({ code: 'LL', was: 'pending', byType: 'ATT C', byWho: PEOPLE.stiff.cs })
    expect(getState().wars[0]!.views.ammo['2026-02-10']!.mark).toBe('!')
    expect(said.some(m => m.includes('bid on 10 Feb'))).toBe(true)
    // OK, seen — the person or an admin
    setViewer('ammo')
    expect(ackReplacement('ammo', notice.id)).toBe(1)
    expect(recsAt('ammo', '2026-02-10').some(r => r.kind === 'notice')).toBe(false)
  })

  it('undoing the filing brings the bid back and takes the notice away', () => {
    bid('ammo', '2026-02-10')
    expect(file('ammo', 'LL', 'Feb 10')).toBe(true)
    expect(globalUndo().ok).toBe(true)
    const list = recsAt('ammo', '2026-02-10')
    expect(list.filter(r => r.kind === 'request')).toHaveLength(1)
    expect(list.some(r => r.kind === 'notice')).toBe(false)
  })

  /* the war's restore check must not refuse this one: the medical the undo takes away is the thing that replaced the
     bid (Astra's final code read, finding 1, step 8 — the day judged as the restore leaves it) */
  it('undoing a MEDICAL filed over a bid brings the bid back in one step, and redo takes it again', () => {
    bid('ammo', '2026-02-10')
    expect(file('ammo', 'ATT C', 'Feb 10')).toBe(true)
    expect(recsAt('ammo', '2026-02-10').some(r => r.kind === 'request')).toBe(false)
    expect(globalUndo().ok).toBe(true)
    expect(rowsOf('ammo', 'ATT C')).toHaveLength(0)
    expect(recsAt('ammo', '2026-02-10').filter(r => r.kind === 'request')).toHaveLength(1)
    expect(globalRedo().ok).toBe(true)
    expect(rowsOf('ammo', 'ATT C')).toHaveLength(1)
    expect(recsAt('ammo', '2026-02-10').some(r => r.kind === 'request')).toBe(false)
  })

  it('the bid\'s own person filing over it gets a message and no notice', () => {
    bid('ammo', '2026-02-10')
    setSession({ user: 'us', role: 'main' }); setMe('ammo')
    expect(file('ammo', 'OL', 'Feb 10')).toBe(true)
    expect(recsAt('ammo', '2026-02-10')).toEqual([])
    expect(said.some(m => m.includes('your LL bid on 10 Feb'))).toBe(true)
  })

  it('a morning filing removes only the morning of a full-day bid; the afternoon keeps its state', () => {
    bid('ammo', '2026-02-10')
    advanceStage()
    const id = (recsAt('ammo', '2026-02-10')[0] as any).id
    expect(file('ammo', 'OL', 'Feb 10', { allday: false, half: 'am', s: 0, e: 720 })).toBe(true)
    const req = recsAt('ammo', '2026-02-10').find(r => r.kind === 'request') as any
    expect(req).toMatchObject({ id, code: 'LL*', state: 'pending' })
  })

  it('a course, overseas duty or ATT B leaves the bid alone', () => {
    bid('ammo', '2026-02-10')
    expect(file('ammo', 'CSE', 'Feb 10')).toBe(true)
    expect(file('ammo', 'ATT B', 'Feb 10')).toBe(true)
    expect(recsAt('ammo', '2026-02-10').filter(r => r.kind === 'request')).toHaveLength(1)
  })

  it('a refused bid is history and is never replaced', () => {
    bid('ammo', '2026-02-10')
    advanceStage()
    expect(file('ammo', 'LL', 'Feb 11')).toBe(true)   // unrelated day first
    setBidState('ammo', '2026-02-10', 'refused')
    expect(file('ammo', 'OL', 'Feb 10')).toBe(true)
    expect(recsAt('ammo', '2026-02-10').filter(r => r.kind === 'request')).toHaveLength(1)
  })
})

describe('undo and redo obey the same rules (B7)', () => {
  it('a redo that would put two leaves on the same time is refused, naming the blocker', () => {
    expect(file('ammo', 'LL', 'Feb 10')).toBe(true)
    expect(globalUndo().ok).toBe(true)
    // the redo tail survives a change on another person's day? No — any new
    // edit drops it, so put the blocker in WITHOUT a timeline entry
    INPUTS.unshift({ iid: 'blocker', person: 'ammo', type: 'OL', date: 'Feb 10', yr: 2026, allday: true, remarks: '', mod: '2026-02-01' })
    const r = globalRedo()
    expect(r.ok).toBe(false)
    expect(said.some(m => m.includes('already has OL on 10 Feb'))).toBe(true)
    expect(rowsOf('ammo', 'LL')).toHaveLength(0)
  })
})

/* A CUT LEAVE SAYS ITS OWN LAST DAY (the absence-record re-test, AB3, 26 Sep 26 — Fable F3, reproduced on screen). The
   medical trim and the war's approve-extend rewrite a remark's "till <date>" (withRemarksTail); the one body every
   OTHER cut uses — a medical cutting leave, the war's un-approve, delete and move (sliceInput) — copied the remark
   verbatim, so the first piece of "LL 20–24 Jul, Bali till 24 Jul" cut on the 22nd still said "till 24 Jul" on the
   Inputs page, the week and the board. And D189 counts that token: a published day the piece covers must read the
   words that match it. */
describe('a cut leave says its own last day (AB3)', () => {
  it('a medical in the middle leaves each piece "till" its OWN last day, the typist’s words kept', () => {
    expect(file('ammo', 'LL', 'Feb 9', { endDate: 'Feb 13', remarks: 'Bali till 13 Feb' })).toBe(true)
    expect(file('ammo', 'ATT C', 'Feb 11')).toBe(true)
    const pieces = rowsOf('ammo', 'LL').map((r: any) => `${r.date}${r.endDate ? '-' + r.endDate : ''}: ${r.remarks}`).sort()
    expect(pieces).toEqual(['Feb 12-Feb 13: Bali till 13 Feb', 'Feb 9-Feb 10: Bali till 10 Feb'])
  })
  it('a remark with no date in it is left exactly as typed', () => {
    expect(file('ammo', 'LL', 'Feb 9', { endDate: 'Feb 13', remarks: 'Bali' })).toBe(true)
    expect(file('ammo', 'ATT C', 'Feb 11')).toBe(true)
    expect(rowsOf('ammo', 'LL').map((r: any) => r.remarks)).toEqual(['Bali', 'Bali'])
  })
  it('the war’s own cut body rewrites it too — un-approve, delete and move all go through it', () => {
    const row = { iid: 'x1', person: 'ammo', type: 'LL', date: 'Feb 9', endDate: 'Feb 13', yr: 2026, allday: true, remarks: 'till 13 Feb Bali' }
    expect(sliceInput(row, '2026-02-09', '2026-02-10', true).remarks).toBe('till 10 Feb Bali')
    expect(sliceInput(row, '2026-02-12', '2026-02-12', false).remarks).toBe('till 12 Feb Bali')
    expect(sliceInput({ ...row, remarks: 'on 9 Feb' }, '2026-02-16', '2026-02-16', false).remarks).toBe('on 16 Feb')
  })
})

/* A BID IS NOT PUT BACK OVER A MEDICAL BY UNDO OR REDO (the absence-record re-test, W3-F8, 26 Sep 26 — found by the war
   walker, reproduced by the host). Bid on a day, Undo it, file a medical there, Redo: the bid came back and stood on
   the sick day (amber), where filing the same medical while the bid existed replaces it with a notice. The medical is a
   change to the Inputs and the bid a change to the war, so the timeline's own "touches the same thing" test never met
   them; B7 says the rules hold at every door, undo and redo included. The restore now asks the war first. */
describe('undo and redo do not put a bid back over a medical (B7, W3-F8)', () => {
  it('Redo of a bid, after a medical was filed on its day, is refused by name — the bid stays gone', () => {
    setRole('admin')
    setCells([{ personId: 'ammo', date: '2026-02-10' }], 'LL')
    expect(recsAt('ammo', '2026-02-10').some((r: any) => r.kind === 'request')).toBe(true)
    expect(globalUndo().ok).toBe(true)
    expect(recsAt('ammo', '2026-02-10').some((r: any) => r.kind === 'request')).toBe(false)
    expect(file('ammo', 'ATT C', 'Feb 10')).toBe(true)
    const r = globalRedo()
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(/ATT C now holds 10 Feb/)
    expect(recsAt('ammo', '2026-02-10').some((x: any) => x.kind === 'request')).toBe(false)
  })
  it('Undo of a bid’s deletion, after a medical was filed on its day, is refused the same way', () => {
    setRole('admin')
    setCells([{ personId: 'ammo', date: '2026-02-11' }], 'LL')
    setCells([{ personId: 'ammo', date: '2026-02-11' }], '')
    expect(recsAt('ammo', '2026-02-11').some((r: any) => r.kind === 'request')).toBe(false)
    INPUTS.unshift({ iid: 'medx', person: 'ammo', type: 'ATT C', date: 'Feb 11', yr: 2026, allday: true, remarks: '', mod: '2026-02-01' })
    syncAbsences()
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(/ATT C now holds 11 Feb/)
  })
  /* THE SAME BID, A DIFFERENT STATE (Astra's final code read, finding 1, 26 Sep 26): a refused bid is history and a
     medical filed beside it leaves it be — but a Redo that turns it back into an acknowledged bid made it live again on
     the sick day. The first fix only asked about a bid that was not there at all. */
  it('Redo that turns a refused bid back into a live one, after a medical was filed on its day, is refused by name', () => {
    setRole('admin')
    setCells([{ personId: 'ammo', date: '2026-02-12' }], 'LL')
    advanceStage()
    setBidState('ammo', '2026-02-12', 'refused')
    setBidState('ammo', '2026-02-12', 'acknowledged')
    const st = () => (recsAt('ammo', '2026-02-12').find((x: any) => x.kind === 'request') as any)?.state
    expect(st()).toBe('acknowledged')
    expect(globalUndo().ok).toBe(true)
    expect(st()).toBe('refused')
    expect(file('ammo', 'ATT C', 'Feb 12')).toBe(true)
    expect(st()).toBe('refused')
    const r = globalRedo()
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(/ATT C now holds 12 Feb/)
    expect(st()).toBe('refused')
  })
})

/* THE BULK GESTURES OVER A DAY WHOSE TOP RECORD IS FILED LEAVE (the absence-record re-test, 26 Sep 26 — the war walker
   W3). Delete asked only the day's TOP record: a morning filed on the Inputs page sits above the afternoon bid (the
   ladder), so the bid was "skipped — locked, owned by Raptor" and left where it was (W3-F3; old plan D3: delete removes
   the editable requests). And Approve counted an already-approved leave as "decided" — "3 decided" for two changes
   (AB7, Fable F7). */
describe('bulk Delete and Approve over mixed days (W3-F3, AB7)', () => {
  it('Delete takes the bid beneath Inputs-filed leave, and leaves the filed leave alone', () => {
    setRole('admin')
    expect(file('ammo', 'LL', 'Feb 10', { allday: false, half: 'am', s: 0, e: 720 })).toBe(true)
    setCells([{ personId: 'ammo', date: '2026-02-10' }], 'LL*')
    expect(recsAt('ammo', '2026-02-10').some((r: any) => r.kind === 'request')).toBe(true)
    const r = clearCells([{ personId: 'ammo', date: '2026-02-10' }])
    expect(r).toEqual({ written: 1, skipped: 0 })
    expect(recsAt('ammo', '2026-02-10').some((x: any) => x.kind === 'request')).toBe(false)
    expect(rowsOf('ammo', 'LL')).toHaveLength(1)
  })
  it('Approve does not count a leave that was already approved as a decision', () => {
    setRole('admin')
    setCells([{ personId: 'ammo', date: '2026-02-16' }, { personId: 'ammo', date: '2026-02-17' }], 'LL')
    advanceStage()
    setBidStates([{ personId: 'ammo', date: '2026-02-16' }], 'approved')
    const r = setBidStates([{ personId: 'ammo', date: '2026-02-16' }, { personId: 'ammo', date: '2026-02-17' }], 'approved')
    expect(r.decided).toBe(1)
    expect(r.already).toBe(1)
  })
})

/* THE BID SHEET NAMES WHAT HOLDS THE TIME (the absence-record re-test's break tests, 26 Sep 26 — bug-check order §8.4):
   switching off every clash refusal the bid sheet gives past its stage / row / medical-code checks turned only ONE test
   red, the timed-medical one. The two sentences a bidder meets most — a leave filed on the Inputs page already there,
   and a whole-day medical — are pinned here, through the store's own question (`cellProblem`, what the sheet asks
   before it writes). */
describe('the bid sheet refuses by name (the break test for its refusals)', () => {
  it('a bid onto leave filed on the Inputs page, and onto a whole-day medical, is refused and names what holds it', () => {
    setRole('admin')
    expect(file('ammo', 'LL', 'Feb 10')).toBe(true)
    expect(cellProblem('ammo', '2026-02-10', 'OL')).toBe('That time is already taken by LL — clear it first.')
    expect(file('ammo', 'ATT C', 'Feb 12')).toBe(true)
    expect(cellProblem('ammo', '2026-02-12', 'LL')).toBe("That day is already ATT C — leave can't go over a medical.")
    expect(cellProblem('ammo', '2026-02-11', 'LL')).toBeNull()
  })
})
