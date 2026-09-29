/* [POST-OUT-OUTCOMES] Part B (27 Sep 26) — WHAT A POSTING DOES ON ITS DATE, AND HOW IT IS TAKEN BACK.

   Owner D229 (a posting out says which it is), D280 (overseas: archived and his account suspended; back: enabled),
   D283 (SANS: on the date he becomes SANS; with Show SANS on he moves into the SANS group, tracked there), D284 (back
   from overseas he returns as he was, and the admin is prompted to check his quals), D286 / D295 (a callsign held only
   by an archived man is free; Restore then refuses while it is taken and offers another on the spot), D287 / D290 /
   D297 / D299 (a delete: his account and person, a hidden mark; days he flew keep his puck; final). The plan's Round 1
   and Round 2: each effect ONCE (never undoing a later hand change), each carrying its maker's mark so a take-back
   takes back only what the posting made; ONE clock — the calendar date — fixed here at 15 Jul 26 (the demo week).
   Register lines PO2, PO5, PO6, PO7, PO8, PO9, PO10. Its own file, like poarchive.test.ts: the wired sync leaves a live Raptor
   subscription behind. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { slotVal, setSlotVal, renameCallsign } from '../engine/slots'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, weekStashSnap, weekDirty } from '../state/store'
import { Whiteboard } from '../storage/whiteboard'
import { wirePersist } from '../state/persist'
import { schedWrite, SCHED_TYPES } from '../state/sched-commit'
import { accountsLoad, accountByName, signIn, sessionFor, updateAccount } from '../state/accounts'
import { BACKPROMPT } from '../state/view'
import { commit, commandStream } from '../command'
import { getState, initStore as lwInitStore, lwStore, postingBlocked, setPeople, setPostIn, setPostOut, setRole, setShowSans } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import {
  availableFor, postOut, postOutProblem, postingHeldNote, restoreArchivedAs, restoreArchivedPerson, runPoOutcomes, undoPostOut, undoPostOutProblem, wireLeaveWarSync,
} from './sync'
import { updatePersonField } from '../state/quals-write'
import { stashPut, stashDrop } from '../engine/weekstash'
import { deletePerson } from '../state/person-delete'
import { INPUTS } from '../engine/inputs'

const TODAY = '2026-07-15'
const mem: Record<string, string> = {}
let PEOPLE0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const war = (id: string) => getState().people.find(p => p.id === id)
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
/* a ground row on a day, with him planted in it (the funnel) — the delete's "days to come" against "days he flew" */
function plantGround(di: number, id: string): string {
  const g = ((DAYS as any)[di].ground || []).findIndex((r: any) => r && !r.src)
  expect(g, `day ${di} has a ground row`).toBeGreaterThanOrEqual(0)
  const k = `g:${di}.${g}`
  setSlotVal(k, id)
  return k
}

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  PEOPLE0 = JSON.stringify(PEOPLE)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  for (let i = INPUTS.length - 1; i >= 0; i--) if (String((INPUTS as any)[i].iid || '').startsWith('ipd')) INPUTS.splice(i, 1)
  /* the war's store FIRST: the last test's posting (a stuck one never records it ran) must not meet the fresh roster
     through the still-wired sync when the scheduler's store re-inits */
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  signInAs('ad', 'a')
})
afterEach(() => { resetSession(null); vi.restoreAllMocks() })

describe('PO2 — overseas: archived on Quals and his account suspended, on the date, once', () => {
  /* [ONE-DOOR] (D322, 27 Sep 26 — "no Enable on an archived row"): while he is archived his sign-in is NOT enabled by
     hand any more — Restore brings it back with him; and a later pass never undoes that (the Round 1 rule, kept) */
  it('runs on the date, once; while archived a hand Enable is refused (D322); after Restore a later pass never undoes it', () => {
    expect(postOut('bane', TODAY, 'overseas')).toBe(true)
    expect(P('bane').archived).toBe(true)
    expect(P('bane').archivedBy).toBe('po')
    const a = accountByName('us')!
    expect(a.on).toBe(false)
    expect(a.offBy).toBe('po')
    expect(war('bane')!.poDone).toBe(TODAY)
    expect(updateAccount(a.id, { on: true })).toMatch(/archived — restore him on Admin → Users/)
    expect(accountByName('us')!.on).toBe(false)
    expect(restoreArchivedPerson('bane')).toBe(true)
    raptorNotify(); runPoOutcomes()
    expect(P('bane').archived).toBe(false)
    expect(accountByName('us')!.on).toBe(true)
    expect(accountByName('us')!.offBy).toBeUndefined()
  })
  it('a posting still to come waits; the calendar reaching its date runs it', () => {
    expect(postOut('bane', '2026-07-20', 'overseas')).toBe(true)
    expect(P('bane').archived).toBeFalsy()
    expect(accountByName('us')!.on).toBe(true)
    vi.setSystemTime(new Date(2026, 6, 20, 9, 0, 0))
    runPoOutcomes()
    expect(P('bane').archived).toBe(true)
    expect(accountByName('us')!.on).toBe(false)
  })
  it('"nothing else" (no chip chosen) takes him off the manpower and does nothing more', () => {
    expect(postOut('bane', TODAY, 'none')).toBe(true)
    expect(P('bane').archived).toBeFalsy()
    expect(accountByName('us')!.on).toBe(true)
    expect(war('bane')!.to).toBe('2026-07-14')
  })
  it('an account an admin suspended by hand is never enabled by the posting coming back', () => {
    const a = accountByName('us')!
    expect(updateAccount(a.id, { on: false })).toBe(null)
    expect(postOut('bane', TODAY, 'overseas')).toBe(true)
    expect(accountByName('us')!.offBy, 'the posting found it already off — not its suspension').toBeUndefined()
    expect(undoPostOut('bane')).toBe(true)
    expect(P('bane').archived).toBeFalsy()
    expect(accountByName('us')!.on).toBe(false)
  })
})

describe('PO2 / PO4 — the last admin who can sign in is never suspended or deleted by a posting; said once', () => {
  it('overseas for the last admin: NOTHING happens (never half — Astra 2), said once; another admin able to sign in → both at once', () => {
    const toast = vi.spyOn(HOOKS, 'toast')
    const WAITS = 'Saber is the last admin who can sign in — the posting waits until another admin can'
    expect(postOut('stiff', TODAY, 'overseas')).toBe(true)
    expect(P('stiff').archived, 'not archived while it waits').toBeFalsy()
    expect(accountByName('ad')!.on).toBe(true)
    expect(war('stiff')!.poDone, 'not done — it will run when it can').toBeUndefined()
    raptorNotify(); raptorNotify(); runPoOutcomes()
    expect(toast.mock.calls.filter(c => c[0] === WAITS).length, 'said once').toBe(1)
    expect(postingHeldNote('stiff'), 'his account row says why').toBe(WAITS)
    expect(updateAccount('acus', { role: 'admin' })).toBe(null)       // Ranger made an admin — Saber is no longer the last
    raptorNotify(); runPoOutcomes()
    expect(P('stiff').archived).toBe(true)
    expect(P('stiff').archivedBy).toBe('po')
    expect(accountByName('ad')!.on).toBe(false)
    expect(postingHeldNote('stiff')).toBe(null)
  })
  it('the sheets are told beforehand: the seam answers which postings the last admin holds back', () => {
    expect(postingBlocked('stiff', 'delete')).toBe('Saber is the last admin who can sign in — he is not deleted until another admin can')
    expect(postingBlocked('stiff', 'overseas')).toBe('Saber is the last admin who can sign in — the posting waits until another admin can')
    expect(postingBlocked('stiff', 'sans')).toBe(null)
    expect(postingBlocked('bane', 'delete'), 'a member: nothing held back').toBe(null)
  })
  it('an admin never deletes HIMSELF by posting himself out with Delete (Fable’s scenario 5) — refused, nothing written', () => {
    expect(postOutProblem('stiff', 'delete')).toBe("You can't delete yourself — ask another admin")
    expect(postOutProblem('stiff', 'overseas'), 'only a Delete').toBe(null)
    expect(postOut('stiff', TODAY, 'delete')).toBe(false)
    expect(P('stiff').deleted).toBeFalsy()
    expect(war('stiff')!.to).toBeNull()
  })
  it('delete: not deleted, and said (a posting made with no one signed in — the pass is nobody acting)', () => {
    resetSession(null); setRole('admin')
    const toast = vi.spyOn(HOOKS, 'toast')
    expect(postOut('stiff', TODAY, 'delete')).toBe(true)
    expect(P('stiff').deleted).toBeFalsy()
    expect(accountByName('ad')).toBeTruthy()
    expect(toast.mock.calls.map(c => c[0])).toContain('Saber is the last admin who can sign in — he is not deleted until another admin can')
  })
})

describe('PO9 — SANS: he becomes SANS on the date (D283)', () => {
  it('with Show SANS off he stays shown, posted out; with it on he joins the SANS group, no window; taken back whole', () => {
    expect(postOut('rocky', TODAY, 'sans')).toBe(true)
    expect(P('rocky').san).toBe(true)
    expect(P('rocky').sanBy).toBe('po')
    expect(P('rocky').quals.san).toBe(true)
    expect(war('rocky')!.to, 'Show SANS off: his old place, posted out').toBe('2026-07-14')
    expect(setShowSans(true)).toBe(true)
    raptorNotify()
    expect(war('rocky'), 'Show SANS on: on the war, in the SANS group').toBeTruthy()
    expect(war('rocky')!.to, 'and tracked there — no posting window').toBeNull()
    expect(undoPostOut('rocky')).toBe(true)
    expect(P('rocky').san).toBeFalsy()
    expect(P('rocky').sanBy).toBeUndefined()
  })
  it('turning the posting into "nothing else" after it ran takes the SANS tick back', () => {
    expect(postOut('rocky', TODAY, 'sans')).toBe(true)
    expect(P('rocky').san).toBe(true)
    expect(postOut('rocky', TODAY, 'none')).toBe(true)
    expect(P('rocky').san).toBeFalsy()
    expect(war('rocky')!.to).toBe('2026-07-14')
  })
})

/* FROM THE WALK'S SCENARIOS (Fable, 27 Sep 26) — three the builder's tests did not reach. */
describe('PO9 / PO2 — SANS with Show SANS on, a hand SANS tick, and a refused Undo', () => {
  it('a SANS posting made while Show SANS is ON keeps its record — it can still be taken back', () => {
    expect(setShowSans(true)).toBe(true)
    expect(postOut('rocky', TODAY, 'sans')).toBe(true)
    expect(P('rocky').san).toBe(true)
    expect(getState().postOuts.rocky, 'the posting record survives the outcome running').toBeTruthy()
    expect(getState().postOuts.rocky.poOutcome).toBe('sans')
    expect(undoPostOut('rocky')).toBe(true)
    expect(P('rocky').san).toBeFalsy()
  })
  it('a SANS posting still to come shows on the grid (hatched from its date) with Show SANS on — its sheet the door', () => {
    expect(setShowSans(true)).toBe(true)
    expect(postOut('rocky', '2026-07-20', 'sans')).toBe(true)
    expect(war('rocky')!.to, 'before its date: a posting like any other').toBe('2026-07-19')
    vi.setSystemTime(new Date(2026, 6, 20, 9, 0, 0))
    runPoOutcomes(); raptorNotify()
    expect(P('rocky').san).toBe(true)
    expect(war('rocky')!.to, 'once it has run: in the SANS group, tracked — no window').toBeNull()
  })
  it('a hand SANS tick after the outcome is the admin’s own — taking the posting back never undoes it', () => {
    expect(postOut('rocky', TODAY, 'sans')).toBe(true)
    expect(P('rocky').sanBy).toBe('po')
    expect(updatePersonField('rocky', { tick: 'san' })).toBe(null)       // off by hand
    expect(updatePersonField('rocky', { tick: 'san' })).toBe(null)       // on again by hand
    expect(P('rocky').san).toBe(true)
    expect(P('rocky').sanBy, 'the hand tick drops the posting’s mark').toBeUndefined()
    expect(undoPostOut('rocky')).toBe(true)
    expect(P('rocky').san, 'the Undo took back the posting, not his hand tick').toBe(true)
  })
  it('Undo post out, his callsign now a roster man’s: refused with where to go (D286 (1)), nothing changed', () => {
    expect(postOut('bane', TODAY, 'overseas')).toBe(true)
    expect(renameCallsign('casper', 'Ranger')).toBe(true)
    expect(undoPostOutProblem('bane')).toMatch(/Ranger is taken on the roster — restore him on Admin → Users under another callsign/)
    expect(P('bane').archived).toBe(true)
    expect(renameCallsign('casper', 'Outlaw')).toBe(true)
    expect(undoPostOutProblem('bane'), 'free again: nothing in the way').toBe(null)
  })
})

describe('PO5 / PO6 / PO7 — delete: his account and his person; days he flew keep his puck; final', () => {
  it('on the date: the hidden mark, the account gone, gone on the war; a day to come loses him, a day he flew does not', () => {
    const flown = plantGround(0, 'rocky')
    const toCome = plantGround(4, 'rocky')
    expect(postOut('rocky', TODAY, 'delete')).toBe(true)
    expect(P('rocky').deleted).toBe(true)
    expect(P('rocky').deletedFrom).toBe(TODAY)
    expect(accountByName('hex')).toBeUndefined()
    expect(war('rocky')!.gone).toBe(true)
    expect(slotVal(toCome)).toBe('')
    expect(slotVal(flown)).toBe('rocky')
  })
  it('the posting’s delete is SAVED: the week on screen filed without him on a day to come (a reload keeps it)', () => {
    const wb = new Whiteboard()
    wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
    /* planted the way the app writes — inside a schedule command, whose rows are the save; the week is one row per day
       ([DB-READINESS] group A, phase 1 — state/weekrows.ts) */
    schedWrite(SCHED_TYPES.mutate, () => { plantGround(4, 'rocky') })
    const day4 = () => JSON.stringify(JSON.parse(wb.get('weeks', '13-07-2026#4')!).d)
    expect(day4()).toContain('"rocky"')
    expect(postOut('rocky', TODAY, 'delete')).toBe(true)
    expect(day4(), 'a day to come, as saved').not.toContain('"rocky"')
  })
  it('no door takes it back or changes it — Undo post out, a new posting, Restore, Restore-as', () => {
    expect(postOut('rocky', TODAY, 'delete')).toBe(true)
    expect(undoPostOut('rocky')).toBe(false)
    expect(setPostOut('rocky', null)).toBe(false)
    expect(setPostIn('rocky', '2026-01-01'), 'nor a post-in').toBe(false)
    expect(postOut('rocky', '2026-08-01', 'none')).toBe(false)
    expect(restoreArchivedPerson('rocky')).toBe(false)
    expect(restoreArchivedAs('rocky', 'Hex2')).toBe('That person cannot be restored')
    expect(P('rocky').deleted).toBe(true)
  })
  it('ALL AVAIL reads him by date: available on a day he flew as before, out from the cutoff (D297)', () => {
    const win: [number, number] = [600, 660]
    expect(availableFor('2026-07-14', win)).toContain('rocky')
    expect(availableFor('2026-07-17', win)).toContain('rocky')
    expect(postOut('rocky', TODAY, 'delete')).toBe(true)
    expect(availableFor('2026-07-14', win), 'a day before his cutoff').toContain('rocky')
    expect(availableFor('2026-07-17', win), 'a day to come').not.toContain('rocky')
  })
})

describe('PO2 / PO8 / PO10 — take-back and Restore', () => {
  it('moving a posting that has run to a date still to come takes back the archive AND the suspension — no prompt', () => {
    expect(postOut('bane', TODAY, 'overseas')).toBe(true)
    expect(postOut('bane', '2026-07-25', 'overseas')).toBe(true)
    expect(P('bane').archived).toBeFalsy()
    expect(accountByName('us')!.on).toBe(true)
    expect(accountByName('us')!.offBy).toBeUndefined()
    expect(BACKPROMPT, 'a date moved is not "he\'s back"').not.toContain('bane')
  })
  it('Restore: the posting cleared, the archive lifted, the account enabled — and the Quals prompt armed (D284)', () => {
    expect(postOut('bane', TODAY, 'overseas')).toBe(true)
    expect(restoreArchivedPerson('bane')).toBe(true)
    expect(P('bane').archived).toBe(false)
    expect(accountByName('us')!.on).toBe(true)
    expect(war('bane')!.to).toBeNull()
    expect(BACKPROMPT).toContain('bane')
  })
  it('Restore refuses while a roster man holds his callsign; Restore-as brings him back under another in one step', () => {
    expect(postOut('bane', TODAY, 'overseas')).toBe(true)
    expect(renameCallsign('casper', 'Ranger'), 'an archived man\'s callsign is free (D286)').toBe(true)
    expect(restoreArchivedPerson('bane')).toBe(false)
    expect(P('bane').archived).toBe(true)
    expect(restoreArchivedAs('bane', 'Ranger')).toMatch(/taken/)
    expect(restoreArchivedAs('bane', 'x'.repeat(15))).toMatch(/14/)
    expect(restoreArchivedAs('bane', 'Longbow')).toBe(null)
    expect(P('bane').cs).toBe('Longbow')
    expect(P('bane').archived).toBe(false)
    expect(accountByName('us')!.on).toBe(true)
  })
})

/* THE PASS QUEUED BEHIND ANOTHER COMMAND (found by the post-out tests, 27 Sep 26). A pass woken while another command
   is still delivering has its own command wait its turn; it then fired a refresh at once, which ran the pass again,
   which queued again — for ever. The REPRODUCER is poarchive.test.ts's "follows the posting" group: its first three
   tests in a row hung before the fix (checked) and pass after. This test only checks a posting written inside another
   command still runs — it passes on the old code too, so it is not the loop's guard. */
describe('a posting written inside another command', () => {
  it('runs on its date all the same', () => {
    const r: any = commit({
      type: 'lw.postout', scope: { module: 'people' } as any, meta: null,
      apply: (txn: any) => { txn.enlist(lwStore); setPostOut('bane', TODAY, 'overseas') },
    } as any)
    expect(r.ok).toBe(true)
    expect(P('bane').archived).toBe(true)
    expect(accountByName('us')!.on).toBe(false)
    expect(war('bane')!.poDone).toBe(TODAY)
  })
})

/* THE CODE READS (Fable 5.1 and Astra, blind to each other, 27 Sep 26) — each finding red first. */
describe('from the code reads', () => {
  it('Astra 4 — every Post out and Undo post out is the posting command (lw.postout), never a bare war edit', () => {
    const n0 = commandStream().length
    expect(postOut('bane', '2026-08-01', 'overseas')).toBe(true)                 // a first posting, nothing to take back
    expect(commandStream().slice(n0).map(e => e.type)).toContain('lw.postout')
    expect(commandStream().slice(n0).map(e => e.type)).not.toContain('lw.edit')
    const n1 = commandStream().length
    expect(undoPostOut('bane')).toBe(true)
    expect(commandStream().slice(n1).map(e => e.type)).toContain('lw.postout')
  })
  it('Astra 4 — a member cannot post anyone out, by a hand-made call', () => {
    signInAs('us', 'us')
    expect(postOut('rocky', TODAY, 'overseas')).toBe(false)
    expect(war('rocky')!.to).toBeNull()
  })
  it('Fable 2 — Undo post out takes back the posting’s suspension even when the archive was made by hand', () => {
    expect(postOut('bane', '2026-07-20', 'overseas')).toBe(true)
    P('bane').archived = true                                                    // archived by hand on Quals (no 'po' mark)
    vi.setSystemTime(new Date(2026, 6, 20, 9, 0, 0)); runPoOutcomes()
    expect(accountByName('us')!.offBy).toBe('po')
    expect(undoPostOut('bane')).toBe(true)
    expect(accountByName('us')!.on, 'the posting’s suspension goes with the posting').toBe(true)
    expect(P('bane').archived, 'the hand archive stays').toBe(true)
  })
  it('Astra 1 — a posting’s Delete waits while a stored week to come cannot be read (nothing changes); repaired, it runs', () => {
    const toast = vi.spyOn(HOOKS, 'toast')
    stashPut('27/07/2026', 'not a week')
    expect(postOut('rocky', TODAY, 'delete')).toBe(true)
    expect(P('rocky').deleted, 'nothing deleted').toBeFalsy()
    expect(accountByName('hex'), 'his account stays').toBeTruthy()
    expect(war('rocky')!.poDone).toBeUndefined()
    expect(toast.mock.calls.map(c => c[0]).join(' | ')).toContain('The week of 27/07/2026 can’t be read'.replace('’', "'"))
    stashDrop('27/07/2026')
    raptorNotify(); runPoOutcomes()
    expect(P('rocky').deleted).toBe(true)
  })
  it('Astra 3 / Fable 3 — a SANS man the war does not show (Show SANS off), deleted: his past months keep his row', () => {
    Object.assign(P('rocky'), { san: true }); P('rocky').quals = { ...(P('rocky').quals || {}), san: true }
    raptorNotify()
    expect(war('rocky'), 'Show SANS off: not on the war').toBeFalsy()
    /* a past he has on the war: a leave on 6 Jul, filed on the Inputs page (the war derives it from there) */
    INPUTS.push({ iid: 'ipdS', person: 'rocky', date: 'Jul 6', yr: 2026, allday: true, type: 'LL', remarks: 'Local leave', mod: '2026-07-01' } as any)
    expect(deletePerson('rocky')).toBe(null)
    expect(war('rocky'), 'his row is kept for the months he was here').toBeTruthy()
    expect(war('rocky')!.gone).toBe(true)
    expect(war('rocky')!.to).toBe('2026-07-14')
    expect(setShowSans(true)).toBe(true); raptorNotify()
    expect(war('rocky'), 'and with Show SANS on').toBeTruthy()
  })
  it('Fable 6 — a posting’s Delete of the person signed in says so', () => {
    const toast = vi.spyOn(HOOKS, 'toast')
    expect(updateAccount('acus', { role: 'admin' })).toBe(null)                  // a second admin, so Saber is not the last
    resetSession(null); setRole('admin')
    expect(postOut('stiff', '2026-07-16', 'delete')).toBe(true)                  // made by "another admin" (nobody signed in)
    signInAs('ad', 'a')
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0)); runPoOutcomes()
    expect(P('stiff').deleted).toBe(true)
    expect(toast.mock.calls.map(c => c[0])).toContain('You have been deleted by your posting out — please sign out')
  })
})
