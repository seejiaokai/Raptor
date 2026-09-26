/* [POST-OUT-OUTCOMES] Part B (27 Sep 26) — WHAT A POSTING DOES ON ITS DATE, AND HOW IT IS TAKEN BACK.

   Owner D229 (a posting out says which it is), D280 (overseas: archived and his account suspended; back: enabled),
   D283 (SANS: on the date he becomes SANS; with Show SANS on he moves into the SANS group, tracked there), D284 (back
   from overseas he returns as he was, and the admin is prompted to check his quals), D286 / D295 (a callsign held only
   by an archived man is free; Restore then refuses while it is taken and offers another on the spot), D287 / D290 /
   D297 / D299 (a delete: his account and person, a hidden mark; days he flew keep his puck; final). The plan's Round 1
   and Round 2: each effect ONCE (never undoing a later hand change), each carrying its maker's mark so a take-back
   takes back only what the posting made; ONE clock — the calendar date — fixed here at 15 Jul 26 (the demo week).
   Register lines PO3, PO8, PO9, PO10, PO12. Its own file, like poarchive.test.ts: the wired sync leaves a live Raptor
   subscription behind. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { slotVal, setSlotVal, renameCallsign } from '../engine/slots'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, accountByName, signIn, sessionFor, updateAccount } from '../state/accounts'
import { BACKPROMPT } from '../state/view'
import { commit } from '../command'
import { getState, initStore as lwInitStore, lwStore, setPeople, setPostIn, setPostOut, setShowSans } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import {
  availableFor, postOut, restoreArchivedAs, restoreArchivedPerson, runPoOutcomes, undoPostOut, wireLeaveWarSync,
} from './sync'

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

describe('PO3 — overseas: archived on Quals and his account suspended, on the date, once', () => {
  it('runs on the date; a hand Enable afterwards is never undone by a later pass', () => {
    expect(postOut('bane', TODAY, 'overseas')).toBe(true)
    expect(P('bane').archived).toBe(true)
    expect(P('bane').archivedBy).toBe('po')
    const a = accountByName('us')!
    expect(a.on).toBe(false)
    expect(a.offBy).toBe('po')
    expect(war('bane')!.poDone).toBe(TODAY)
    expect(updateAccount(a.id, { on: true })).toBe(null)
    raptorNotify(); runPoOutcomes()
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

describe('PO3 — the last admin who can sign in is never suspended or deleted by a posting; said once', () => {
  it('overseas: archived, the account left on, the reason said once however many passes follow', () => {
    const toast = vi.spyOn(HOOKS, 'toast')
    expect(postOut('stiff', TODAY, 'overseas')).toBe(true)
    expect(P('stiff').archived).toBe(true)
    expect(accountByName('ad')!.on).toBe(true)
    raptorNotify(); raptorNotify(); runPoOutcomes()
    const said = toast.mock.calls.filter(c => c[0] === 'Saber is the last admin who can sign in — his account was not suspended')
    expect(said.length).toBe(1)
  })
  it('delete: not deleted, and said', () => {
    const toast = vi.spyOn(HOOKS, 'toast')
    expect(postOut('stiff', TODAY, 'delete')).toBe(true)
    expect(P('stiff').deleted).toBeFalsy()
    expect(accountByName('ad')).toBeTruthy()
    expect(toast.mock.calls.map(c => c[0])).toContain('Saber is the last admin who can sign in — he was not deleted')
  })
})

describe('PO8 — SANS: he becomes SANS on the date (D283)', () => {
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

describe('PO4 / PO6 — delete: his account and his person; days he flew keep his puck; final', () => {
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

describe('PO9 / PO10 — take-back and Restore', () => {
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
