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
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, weekStashSnap, weekDirty, writeText } from '../state/store'
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
import { commitPeopleEdit } from '../state/people-settings-commit'
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
  /* (it lists its keys, as the browser's store does — without them no account row is ever listed, and a posting's Delete
     of the master passed the master check only by that: the fix read of 18 Nov 26, Opus 1) */
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) } as any
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
  /* the demo carries two more admins since multi-squadron step 4 — 149's (Kestrel) and a second 142 admin (Prowler):
     these tests are written for Saber as the one admin, so those two step down first */
  expect(updateAccount('acad2', { role: 'main' })).toBeNull()
  /* (Kestrel stays: he is 149's only admin, and a squadron is never left with none — D2184 Q10, the full check of
     18 Nov 26; these postings are 142's, and 149's admin is never told of them) */
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
    /* worded per squadron: 149 still has Kestrel, so the lock is 142's (the fix read, 18 Nov 26 — Opus 5) */
    const WAITS = "Saber is 142's last admin. The posting waits until 142 has another admin."
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
    /* Saber is the master: a Delete of him is held for that first (the fix read, 18 Nov 26 — Opus 1) */
    expect(postingBlocked('stiff', 'delete')).toBe("Saber is a master admin, so he can't be deleted")
    expect(postingBlocked('stiff', 'overseas')).toBe("Saber is 142's last admin. The posting waits until 142 has another admin.")
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
  it('delete: the last admin of his squadron is not deleted, and said (a posting made with no one signed in — the pass is nobody acting)', () => {
    /* Hunter (ad2) is 142's one admin who can sign in once Saber's account is suspended by hand (Kestrel is 149's): worded per
       squadron (the fix read, 18 Nov 26 — Opus 5) */
    expect(updateAccount('acad2', { role: 'admin' })).toBeNull()
    signInAs('ad2', 'a2')
    expect(updateAccount('acad', { on: false } as any)).toBeNull()
    resetSession(null); setRole('admin')
    const toast = vi.spyOn(HOOKS, 'toast')
    expect(postOut('prowler', TODAY, 'delete')).toBe(true)
    expect(P('prowler').deleted).toBeFalsy()
    expect(accountByName('ad2')).toBeTruthy()
    expect(toast.mock.calls.map(c => c[0])).toContain("Hunter is 142's last admin. He is not deleted until 142 has another admin.")
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
  /* [DB-READINESS] group A, phase 6 (d): the posting's delete writes no day either (D450) — the week on screen reads
     without him at once, and a day is filed without him at its next change */
  it('the posting’s delete: the week on screen reads without him at once; a day to come is filed without him at its next change', () => {
    const wb = new Whiteboard()
    wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
    /* planted the way the app writes — inside a schedule command, whose rows are the save; the week is one row per day
       ([DB-READINESS] group A, phase 1 — state/weekrows.ts) */
    schedWrite(SCHED_TYPES.mutate, () => { plantGround(4, 'rocky') })
    /* the stored day row names its unit (multi-squadron step 2) */
    const day4 = () => JSON.stringify(JSON.parse(wb.get('weeks', 'u142@13-07-2026#4')!).d)
    expect(day4()).toContain('"rocky"')
    expect(postOut('rocky', TODAY, 'delete')).toBe(true)
    expect(JSON.stringify((DAYS as any)[4]), 'the week on screen, at once').not.toContain('"rocky"')
    expect(day4(), 'the delete writes no day').toContain('"rocky"')
    writeText('dn:4.0', 'NEXT CHANGE')
    expect(day4(), 'a day to come, as saved at its next change').not.toContain('"rocky"')
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
    /* archived by hand (no 'po' mark) — a SAVED change, made inside a roster command as every in-app roster write is: a bare
       write outside every command is now put back by the pass before it runs ([SYSTEM-PASS-SAVES-ROSTER], 31 Oct 26) */
    commitPeopleEdit(() => { P('bane').archived = true })
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
    /* Ranger, made an admin, signed in when his own Delete runs (Saber, the master, is never deleted — below) */
    const toast = vi.spyOn(HOOKS, 'toast')
    expect(updateAccount('acus', { role: 'admin' })).toBe(null)
    expect(postOut('bane', '2026-07-16', 'delete')).toBe(true)                   // made by another admin, Saber
    signInAs('us', 'us')
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0)); runPoOutcomes()
    expect(P('bane').deleted).toBe(true)
    expect(toast.mock.calls.map(c => c[0])).toContain('You have been deleted by your posting out — please sign out')
  })
  /* THE FIX READ OF 18 NOV 26 — Opus 1: a posting's Delete of the master was refused whole at the commit gate (the master
     mark changes only by its own command), every other posting due that day refused with it, unsaid, and the pass's own
     notify ran it again until "Maximum call stack size exceeded". Now it is held and said, and the others run. */
  it('a posting’s Delete of the master waits and is said; another man’s posting that day still runs', () => {
    const toast = vi.spyOn(HOOKS, 'toast')
    expect(postOutProblem('stiff', 'delete'), 'refused as it is set, signed in as anyone but him too').toBe("You can't delete yourself — ask another admin")
    resetSession(null); setRole('admin')
    expect(postOutProblem('stiff', 'delete'), 'with nobody signed in').toBe("Saber is a master admin, so he can't be deleted")
    /* a Delete posting already stored for him (made before this check — or by an older build) */
    expect(postOut('stiff', '2026-07-16', 'delete'), 'the posting door refuses it').toBe(false)
    expect(setPostOut('stiff', '2026-07-16', 'delete'), 'the store itself still writes it').toBe(true)
    expect(postOut('bane', '2026-07-16', 'overseas')).toBe(true)
    signInAs('ad2', 'a2')
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0))
    expect(() => runPoOutcomes()).not.toThrow()
    expect(P('bane').archived, 'Ranger’s posting ran').toBe(true)
    expect(accountByName('us')!.on).toBe(false)
    expect(P('stiff').deleted, 'Saber is not deleted').toBeFalsy()
    expect(accountByName('ad')).toBeTruthy()
    expect(toast.mock.calls.filter(c => c[0] === "Saber is a master admin, so he can't be deleted").length, 'said once').toBe(1)
  })
})

/* THE FIX READ OF THE FULL CHECK (18 Nov 26 — Opus 4 and 5): the words the person doors say. */
describe('the words a door says across two squadrons', () => {
  it("Kestrel, 149's only admin: the lock is worded as 149's, never the whole app's, while 142 has its own", async () => {
    const { archiveProblem } = await import('./sync')
    expect(postingBlocked('kes9', 'overseas')).toBe("Kestrel is 149's last admin. The posting waits until 149 has another admin.")
    expect(archiveProblem('kes9')).toBe("Kestrel is 149's last admin. Make another admin of 149 first.")
  })
  it("142's plain admin on a 149 man: Archive, Save name and Restore say whose he is, as Suspend and Delete do", async () => {
    const { archivePerson, restoreProblem } = await import('./sync')
    const { deleteProblem } = await import('../state/person-delete')
    vi.spyOn(HOOKS, 'toast').mockImplementation(() => {})
    expect(updateAccount('acad2', { role: 'admin' })).toBeNull()
    signInAs('ad2', 'a2')                                   // Hunter, 142's plain admin
    expect(updateAccount('acus9', { on: false })).toBe("He is 149's. Only an admin of 149 can change his account.")
    expect(deleteProblem('osp9')).toBe("He is 149's. Only an admin of 149 can change his account.")
    const HIM = "He is 149's. Only an admin of 149 can change him."
    expect(archivePerson('osp9').bad, 'Archive').toBe(HIM)
    expect(updatePersonField('osp9', { callsign: 'OSPREYX' }), 'Save name').toBe(HIM)
    signInAs('ad', 'a'); expect(archivePerson('osp9').bad, 'the master archives him').toBe(null)
    signInAs('ad2', 'a2')
    expect(restoreProblem('osp9', TODAY), 'Restore').toBe(HIM)
    expect(restoreArchivedAs('osp9', 'OSPREYX', TODAY), 'Restore as').toBe(HIM)
    expect(restoreArchivedPerson('osp9', TODAY)).toBe(false)
    /* a member keeps his own rule's words */
    signInAs('us', 'us')
    expect(updatePersonField('osp9', { callsign: 'OSPREYX' })).toBe('You can only edit your own row')
  })
})
