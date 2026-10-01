// @vitest-environment jsdom
/* [DB-READINESS] group A, phase 4.4 (plan §3 phase 4.4; R3-04) — ACCOUNTS, REQUESTS AND EACH ADMIN'S "SEEN", ONE ROW
   EACH, on the real wiring. They were one list each (`accounts`, `accessreqs` — every request carrying which admins had
   seen it), so two admins adding an account, or opening the waiting list, at the same time each rewrote the other's.
   Now each is its own row, and a command writes EXACTLY the rows its own edit changed — so both survive.

   "Another admin's client" is stood in for by writing its committed row straight into the shared store while this
   client's list still holds the older copy (the Leave War's rows tests do the same). */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SCHEMA_VERSION } from '../storage/reset'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { initStore, weekStashSnap, weekDirty, resetSession } from './store'
import { hydrate, wirePersist } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import type { Whiteboard } from '../storage/whiteboard'
import {
  signIn, sessionFor, addAccount, accountByName, requestAccess, markRequestsSeen, ACCESS_REQS, ACCOUNTS_LIST, accountsLoad,
} from './accounts'

const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => { vi.useFakeTimers(); INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r)); stashClear() })
afterEach(() => { vi.useRealTimers(); resetSession(null); storeBackend.impl = null })

async function boot(be: MemoryBackend): Promise<Whiteboard> {
  if (!be.peek('settings', 'schema')) be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const { wb } = await bootStorage(be)
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  return wb
}
const as = (name: string, pass = 'x') => resetSession(sessionFor(signIn(name, pass) as any))
/* people who may take an account: on the roster, no account yet */
const free = () => Object.keys(PEOPLE).filter(id => !(PEOPLE as any)[id].special && !(PEOPLE as any)[id].archived && !ACCOUNTS_LIST.some(a => a.pid === id))

describe('two admins at once', () => {
  it('adding accounts: another admin\'s new account is never touched by this one\'s — and both are there after a reload', async () => {
    const be = new MemoryBackend()
    const wb = await boot(be)
    as('ad', 'a')
    const [p1, p2, p3] = free()
    expect(addAccount('first@mail', p1!, 'main')).toBeNull()
    /* the other admin's account, committed by his client after this one loaded */
    const other = JSON.stringify({ id: 'acother', name: 'second@mail', role: 'main', pid: p2, on: true, createdAt: Date.now() })
    wb.set('settings', 'account:acother', other)
    expect(accountByName('second@mail'), 'this client has not read it').toBeUndefined()
    const groups: any[] = []
    wb.subscribe(g => groups.push(g))
    expect(addAccount('third@mail', p3!, 'main')).toBeNull()
    const wrote = groups.flat().filter((c: any) => c.collection === 'settings' && c.id.startsWith('account:')).map((c: any) => c.id)
    expect(wrote, 'only its own row').toEqual([`account:${accountByName('third@mail')!.id}`])
    expect(wb.get('settings', 'account:acother')).toBe(other)
    await vi.advanceTimersByTimeAsync(300)
    resetSession(null)
    await boot(be)
    for (const n of ['first@mail', 'second@mail', 'third@mail']) expect(accountByName(n), n).toBeTruthy()
  })

  it('marking the waiting list seen: each admin writes his own row — neither undoes the other\'s bell', async () => {
    const be = new MemoryBackend()
    const wb = await boot(be)
    as('kite@mail')
    expect(requestAccess({ cs: 'Kite', ini: 'KT', seat: 'FCP', cat: 'C' })).toBeNull()
    const rq = ACCESS_REQS[0]!.id
    expect(wb.get('settings', `accessreq:${rq}`)).not.toBeNull()
    as('ad', 'a')
    expect(markRequestsSeen()).toBeNull()
    expect(JSON.parse(wb.get('settings', 'reqseen:acad')!)).toEqual({ userId: 'acad', seenRequestIds: [rq] })
    /* another admin had the list on screen too — his own row, from his client */
    const his = JSON.stringify({ userId: 'acother', seenRequestIds: [rq] })
    wb.set('settings', 'reqseen:acother', his)
    /* a second request arrives; this admin marks again — his row only */
    as('lark@mail')
    expect(requestAccess({ cs: 'Lark', ini: '', seat: 'GND', cat: '' })).toBeNull()
    as('ad', 'a')
    expect(markRequestsSeen()).toBeNull()
    expect(wb.get('settings', 'reqseen:acother')).toBe(his)
    expect(JSON.parse(wb.get('settings', 'reqseen:acad')!).seenRequestIds).toHaveLength(2)
    /* the request row itself carries no "seen" — each admin's is his own row */
    expect(JSON.parse(wb.get('settings', `accessreq:${rq}`)!).seenBy).toBeUndefined()
    accountsLoad()
    expect(ACCESS_REQS.find(r => r.id === rq)!.seenBy.sort()).toEqual(['acad', 'acother'])
  })
})
