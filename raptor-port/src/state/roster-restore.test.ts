// @vitest-environment jsdom
/* B5 of the change-recording re-test (28 Sep 26) — what an Undo or Redo of a roster or settings step re-checks, through
   the REAL wiring (installGlobalUndo) and the app's own writers. Each refusal is whole: nothing moves, and the step stays
   next. Scenarios: Fable S3 (a rename undone onto a callsign given away since — D286), S22 (an archived man's sign-in
   turned back on — D322), S21 (the lock-out guard — ADMIN_LOCK), Fable's red team 11 (a request under a name that has an
   account), Astra's red team 2 (every field of your own account). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore, resetSession, notify } from './store'
import { accountsLoad, signIn, sessionFor, updateAccount, accountById, accountsRestoreProblem, ACCOUNTS_LIST } from './accounts'
import { addRosterPerson } from './roster-add'
import { updatePersonField } from './quals-write'
import { commitPeopleIntent } from './people-settings-commit'
import { globalUndo, undoState } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { rosterRestoreProblem } from './roster-restore'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const clone = (x: any) => JSON.parse(JSON.stringify(x))
beforeEach(() => {
  if (!PEOPLE0) PEOPLE0 = JSON.stringify(PEOPLE)
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v }, keys: () => Object.keys(mem) }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  initStore(); accountsLoad()
  resetSession(sessionFor(signIn('ad', 'a'))); notify()      // Saber, the seeded admin — clears the undo list
  _resetTimeline(); installGlobalUndo()
})
afterEach(() => { resetSession(null); _resetTimeline(); storeBackend.impl = null })

describe('B5.1 — one callsign on the roster (D286), Fable S3', () => {
  it('a rename undone onto a callsign given to a new man since is refused whole; the step stays next', () => {
    expect(updatePersonField('rocky', { callsign: 'Quasar' })).toBe(null)          // Hex → Quasar (Quals)
    expect(addRosterPerson({ cs: 'Hex', ini: '', seat: 'RCP', cat: 'C' })).toBe(null)   // the freed name, to a new man
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('Hex is taken on the roster now — rename one of them first.')
    expect((PEOPLE as any).rocky.cs).toBe('Quasar')
    expect(Object.values(PEOPLE).filter((p: any) => p.cs === 'Hex').length).toBe(1)
    expect(undoState().canUndo).toBe(true)
  })
})

describe('B5.2 — the accounts guards, over the candidate', () => {
  it('S22: an archived man’s sign-in is never turned back on by Undo (D322)', () => {
    expect(updateAccount('achex', { on: false })).toBe(null)                      // suspended by hand
    commitPeopleIntent('person.archive', null, () => { (PEOPLE as any).rocky.archived = true })   // archived (not an Undo step — D350)
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('Hex is archived — restore him on Admin → Users first')
    expect(accountById('achex')!.on).toBe(false)
  })
  it('the lock-out (S21), your own account (every field), one name one account, a request under an account’s name', () => {
    const people = PEOPLE as any
    const noAdmin = ACCOUNTS_LIST.map(a => ({ ...a, on: a.role === 'admin' ? false : a.on }))
    expect(accountsRestoreProblem(noAdmin, null, people)).toBe('At least one admin must keep access')
    const mineRenamed = ACCOUNTS_LIST.map(a => (a.id === 'acad' ? { ...a, name: 'saber2' } : a))
    expect(accountsRestoreProblem(mineRenamed, null, people)).toBe("You can't change your own account — ask another admin")
    const twoNames = ACCOUNTS_LIST.map(a => (a.id === 'acoutlaw' ? { ...a, name: 'hex' } : a))
    expect(accountsRestoreProblem(twoNames, null, people)).toMatch(/sign-in name hex two accounts/)
    expect(accountsRestoreProblem(null, [{ id: 'rq1', name: 'outlaw' }], people)).toBe('outlaw already has an account')
    expect(accountsRestoreProblem(clone(ACCOUNTS_LIST), null, people)).toBe(null)
  })
  it('a roster tick alone asks nothing of the accounts', () => {
    const after = { ...clone((PEOPLE as any).rocky), remarks: 'x' }
    expect(rosterRestoreProblem([{ op: 'put', collection: 'people', id: 'rocky', after }], 'undo')).toBe(null)
  })
})

describe('B8 — an account change says what it was', () => {
  it('suspending, enabling, a role', () => {
    expect(updateAccount('acoutlaw', { on: false })).toBe(null)
    expect(undoState().undoLabel).toBe('suspending Outlaw’s sign-in')
    expect(updateAccount('acoutlaw', { on: true })).toBe(null)
    expect(undoState().undoLabel).toBe('enabling Outlaw’s sign-in')
    expect(updateAccount('acoutlaw', { role: 'admin' })).toBe(null)
    expect(undoState().undoLabel).toBe('Outlaw’s role')
  })
})
