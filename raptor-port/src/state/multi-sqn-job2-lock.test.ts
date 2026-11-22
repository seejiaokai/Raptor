// @vitest-environment jsdom
/* JOB 2 (19 Nov 26) — the last-admin lock (G3) judged only today and the home dates of men whose home rows THIS command
   changes. A future move already stored (Osprey, a second 149 admin, moved to 142 from tomorrow) was not among the dates
   when the next command changed an ACCOUNT or a PERSON only — so Kestrel, 149's other admin, could be demoted or
   suspended today, leaving 149 with no admin who can sign in from tomorrow (D2184 Q10, "any later step"). Found by the
   fresh Opus read (F2), Fable (F1) and Astra (1); the first two tests are the Opus reader's proof. And an archived man
   cannot sign in (accounts.ts refuses his session), so he is no admin who can (Astra 2). */
import { commitPeopleIntent } from './people-settings-commit'
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { initStore, resetSession, notify } from './store'
import { signIn, sessionFor, updateAccount, accountsLoad, ACCOUNTS_LIST } from './accounts'
import { setSession } from './auth'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { PEOPLE } from '../engine/people'
import { setUnitSeeds, setHome, homeOn, todayIso, unitsLoad } from './units'
import { moveFrom } from './units-model'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
const signInAs = (name: string, pass: string) => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  setUnitSeeds(true)
  initStore()
  accountsLoad()
  resetSession(null)
  _resetTimeline()
  installGlobalUndo()
})
afterEach(() => { setSession(null); resetSession(null); _resetTimeline() })
afterAll(() => { storeBackend.impl = null })

/* 149's admins who can sign in, by home on a date */
const admins149On = (iso: string) => ACCOUNTS_LIST.filter(a => a.role === 'admin' && a.on && !(PEOPLE as any)[a.pid]?.deleted
  && !(PEOPLE as any)[a.pid]?.special && homeOn(a.pid, iso) === 'u149').map(a => a.id)

describe('G3 — a future move already stored, then an account change today', () => {
  it("the master demoting Kestrel after Osprey (149's other admin) is moved to 142 from tomorrow is refused", () => {
    signInAs('ad', 'a')
    const t1 = moveFrom(todayIso())
    expect(updateAccount('acus9', { role: 'admin' })).toBe(null)        // Osprey made 149's second admin
    expect(setHome('osp9', 'u142').ok).toBe(true)                        // …moved to 142 from tomorrow (Kestrel stays)
    unitsLoad()
    expect(homeOn('osp9', t1)).toBe('u142')
    expect(admins149On(todayIso()).sort()).toEqual(['acad9', 'acus9'])
    const r = updateAccount('acad9', { role: 'main' })                   // Kestrel demoted today
    accountsLoad()
    // expected: refused — from tomorrow 149 would have no admin of its own who can sign in (D2184 Q10)
    expect({ refusal: r, adminsTomorrow: admins149On(t1) }).toEqual({ refusal: expect.any(String), adminsTomorrow: ['acad9'] })
  })
  it('…and the same with Suspend', () => {
    signInAs('ad', 'a')
    const t1 = moveFrom(todayIso())
    expect(updateAccount('acus9', { role: 'admin' })).toBe(null)
    expect(setHome('osp9', 'u142').ok).toBe(true)
    unitsLoad()
    const r = updateAccount('acad9', { on: false })
    accountsLoad()
    expect({ refusal: r, adminsTomorrow: admins149On(t1) }).toEqual({ refusal: expect.any(String), adminsTomorrow: ['acad9'] })
  })
})

describe('G3 — an archived man is no admin who can sign in (Astra 2)', () => {
  it("a people-only archive of Kestrel, 149's only admin, his account left on, is refused", () => {
    signInAs('ad', 'a')
    const r = commitPeopleIntent('person.archive', null, () => {
      Object.assign((PEOPLE as any).kes9, { archived: true, archivedBy: 'admin', archivedOn: todayIso() })
    }) as any
    expect(r.ok).toBe(false)
    expect((PEOPLE as any).kes9.archived).toBeFalsy()
  })
  it('control: with Osprey a second 149 admin the same archive goes through', () => {
    signInAs('ad', 'a')
    expect(updateAccount('acus9', { role: 'admin' })).toBe(null)
    const r = commitPeopleIntent('person.archive', null, () => {
      Object.assign((PEOPLE as any).kes9, { archived: true, archivedBy: 'admin', archivedOn: todayIso() })
    }) as any
    expect(r.ok).toBe(true)
  })
})
