/* [ARCH-STACK-4] phase 0 — the all-or-nothing save on the REAL wiring (design
   §20 "Tests added", §21.1). The same boot main.tsx runs — storage gate,
   hydrate, initStore, the Leave War store on the whiteboard, wirePersist — then
   what reaches the backend is counted in GROUPS (one putMany each). */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SCHEMA_VERSION } from '../storage/reset'
import { INPUTS } from '../engine/inputs'
import { HOOKS, storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { initStore, weekStashSnap, weekDirty, writeInputs } from './store'
import { hydrate, wirePersist } from './persist'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { getState, initStore as lwInitStore, setCell, setPeople, setRole } from '../leavewar/state/store'
import { bootStorage } from '../storage/boot'
import { settingsAdapter, leavewarAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { commit, definePermission, anyone, CmdRefused } from '../command'
import { resetSession } from './store'
import { signIn, sessionFor, addPersonAndAccount, accountByName } from './accounts'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { commitPeopleSettingsIntent } from './people-settings-commit'
import { putNewPerson } from './roster-add'

const ISNAP = JSON.stringify(INPUTS)
const ROW = { person: 'dj', date: 'Jul 14', allday: true, type: 'LL', remarks: 'txn test', mod: '2026-07-01' }
beforeEach(() => { vi.useFakeTimers(); INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r)); stashClear() })
afterEach(() => { vi.useRealTimers() })

async function boot() {
  const be = new MemoryBackend()
  be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const { wb, postman } = await bootStorage(be)
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  lwInitStore(leavewarAdapter(wb))
  setPeople(projectPeople())
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  await vi.advanceTimersByTimeAsync(600)                     // let the boot-time letters settle
  be.journal.length = 0
  return { be, wb, postman }
}
const groupsSent = (be: MemoryBackend) => [...new Set(be.journal.filter(j => j.op !== 'loadAll').map(j => j.group))]

describe('the all-or-nothing save, real wiring', () => {
  it('one gesture touching the scheduler AND the Leave War reaches storage as exactly ONE group', async () => {
    const { be } = await boot()
    definePermission('test.both', anyone)
    setRole('admin')
    const pid = getState().people[0].id
    commit({ type: 'test.both', scope: { module: 'inputs' } as any, apply: () => {
      writeInputs(() => { INPUTS.push({ ...ROW }) })
      setCell(pid, '2026-02-02', 'LL')
    } })
    await vi.advanceTimersByTimeAsync(300)
    const g = groupsSent(be)
    expect(g).toHaveLength(1)
    const cols = be.journal.filter(j => j.group === g[0]).map(j => j.collection)
    expect(cols).toContain('inputs')
    expect(cols).toContain('leavewar')
    expect(JSON.parse(be.peek('inputs', 'all')!).some((r: any) => r.remarks === 'txn test')).toBe(true)
  })

  it('a refused Input write that persisted inside its reducer leaves every stored value byte-equal and sends ZERO groups', async () => {
    const { be, wb } = await boot()
    const before = wb.snapshot()
    const ok = writeInputs(() => {
      INPUTS.push({ ...ROW })
      HOOKS.histPush()                                         // an engine helper's own persist, mid-reducer
      throw new CmdRefused('locked week')
    })
    expect(ok).toBe(false)
    expect(wb.snapshot()).toEqual(before)
    await vi.advanceTimersByTimeAsync(600)
    expect(groupsSent(be)).toEqual([])
  })

  it('an ordinary Leave War edit is one group too (its persist deferred to the seal)', async () => {
    const { be } = await boot()
    setRole('admin')
    const pid = getState().people[0].id
    setCell(pid, '2026-02-03', 'LL')
    await vi.advanceTimersByTimeAsync(300)
    expect(groupsSent(be)).toHaveLength(1)
    expect(be.journal.every(j => j.op === 'loadAll' || j.collection === 'leavewar')).toBe(true)
  })
})

/* [ACCOUNTS-NEW-PERSON] (D214, NP3 — Astra's plan read 7): a person and his account reach
   storage as ONE group, and a refused one reaches it not at all — on the real wiring */
describe('a new person with his account, real wiring', () => {
  const drop = (cs: string) => { const id = Object.keys(PEOPLE).find(k => (PEOPLE as any)[k].cs === cs); if (id) delete (PEOPLE as any)[id]; delete (ID_BY_CS as any)[cs.toLowerCase()] }
  it('the person and the account are ONE group', async () => {
    drop('Blaze')
    const { be } = await boot()
    resetSession(sessionFor(signIn('ad', 'a')))
    await vi.advanceTimersByTimeAsync(300); be.journal.length = 0
    expect(addPersonAndAccount('blaze@mail', { cs: 'Blaze', ini: 'RTK', seat: 'RCP', cat: 'D' }, 'main')).toBe(null)
    await vi.advanceTimersByTimeAsync(300)
    const g = groupsSent(be)
    expect(g).toHaveLength(1)
    const recs = be.journal.filter(j => j.group === g[0]).map(j => `${j.collection}/${j.id}`)
    expect(recs).toContain('people/all')
    expect(recs).toContain('settings/accounts')
    expect(JSON.parse(be.peek('settings', 'accounts')!).some((a: any) => a.name === 'blaze@mail')).toBe(true)
    expect(Object.values(JSON.parse(be.peek('people', 'all')!)).some((p: any) => p.cs === 'Blaze')).toBe(true)
    resetSession(null); drop('Blaze')
  })
  it('a refusal inside, after both halves were written, stores nothing and sends no group', async () => {
    drop('Blaze')
    const { be, wb } = await boot()
    resetSession(sessionFor(signIn('ad', 'a')))
    await vi.advanceTimersByTimeAsync(300); be.journal.length = 0
    const before = wb.snapshot()
    const r: any = commitPeopleSettingsIntent('account.addNew', null, () => {
      putNewPerson({ cs: 'Blaze', ini: '', seat: 'FCP', cat: 'C' })
      throw new CmdRefused('refused after both')
    })
    expect(r).toMatchObject({ ok: false, reason: 'refused' })
    expect(wb.snapshot()).toEqual(before)
    await vi.advanceTimersByTimeAsync(600)
    expect(groupsSent(be)).toEqual([])
    expect(accountByName('blaze@mail')).toBeUndefined()
    resetSession(null)
  })
})
