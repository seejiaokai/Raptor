// @vitest-environment jsdom
/* [DB-READINESS] group A, phase 5 — THE WALK-SHAPED TEST (plan §3 phase 5.5, last line): "the bootstrap admin visits
   every page, the Leave War and the Tracker, and storage then holds only the stamps and what he did".
   A shared store's first boot (the blank policy with its first admin — src/bootpolicy.ts), the app itself rendered: he
   signs in, opens every tab — Edit Schedule, View-only Sched, Inputs, Quals, Logic, the Leave War (its no-period page),
   the Tracker (its no-course page), Help and Admin — and does nothing else. Every page stands up with nothing in it,
   and storage afterwards holds what the first boot put there (the stamp, his person, his account, the one batch naming
   them) and nothing more — except the Tracker's own first-mount bookkeeping (its one named exempt writer, phase 4.1:
   its migration flags and its catalogue of the SHIPPED charts), which names no course and no student. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './ui/App'
import { resetSession, notify } from './state/store'
import { signIn, sessionFor, ACCOUNTS_LIST } from './state/accounts'
import { PEOPLE } from './engine/people'
import { MemoryBackend } from './storage/memory'
import type { Snapshot } from './storage/backend'
import type { Postman } from './storage/postman'
import { bootApp } from './boot'
import type { BootPolicy } from './bootpolicy'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const POLICY: BootPolicy = { seedDemo: false, bootstrap: { principal: 'boss@unit.example', person: { cs: 'Boss', ini: 'BS', seat: 'FCP', cat: 'A' } } }
const tick = (ms = 0) => new Promise(r => setTimeout(r, ms))
let be: MemoryBackend, postman: Postman, host: HTMLDivElement, root: Root
let atBoot: Snapshot

beforeAll(async () => {
  be = new MemoryBackend()
  ;({ postman } = await bootApp(be, POLICY))
  await postman.flush()
  atBoot = await be.loadAll()
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
})
afterAll(async () => { await act(async () => { root.unmount() }); host.remove() })

const tab = (p: string) => host.querySelector(`a[data-page="${p}"]`) as HTMLElement
async function open(p: string) {
  await act(async () => { tab(p).click(); await tick() })
  /* the Leave War and the Tracker are lazy chunks (the Tracker's first mount boots it): wait for either of their screens */
  const ready: Record<string, string> = {
    leavewar: '#page-leavewar [data-testid="lw-empty"], #page-leavewar [data-testid="war-picker"]',
    tracker: '#page-tracker [data-testid="trk-nocourse"], #page-tracker #board',
  }
  if (ready[p]) for (let i = 0; i < 300 && !host.querySelector(ready[p]); i++) await act(async () => { await tick(10) })
  expect(host.querySelector(`#page-${p}.on`), `${p} is on screen`).toBeTruthy()
}

describe("a shared store's first admin walks every page", () => {
  it('he signs in as the admin', async () => {
    const r = signIn('boss@unit.example', 'any')
    expect(r).toMatchObject({ kind: 'ok', account: { role: 'admin' } })
    await act(async () => { resetSession(sessionFor(r)); notify() })
    expect(host.querySelector('#shell')).toBeTruthy()
  })

  it('every page stands up with nothing in it', async () => {
    for (const p of ['editsched', 'viewsched', 'inputs', 'quals', 'logic', 'help', 'admin']) await open(p)
    await open('leavewar')
    expect(host.querySelector('#page-leavewar [data-testid="lw-empty"]')!.textContent).toMatch(/no leave period yet/i)
    expect(host.querySelector('#page-leavewar [data-testid="lw-first-war"]'), 'an admin gets the way in').toBeTruthy()
    await open('tracker')
    expect(host.querySelector('#page-tracker [data-testid="trk-nocourse"]')!.textContent).toMatch(/no course yet/i)
    /* he is the one person, the one account */
    expect(Object.keys(PEOPLE).filter(id => !PEOPLE[id].special).map(id => PEOPLE[id].cs)).toEqual(['Boss'])
    expect(ACCOUNTS_LIST.map(a => a.name)).toEqual(['boss@unit.example'])
  })

  it('storage then holds only what the first boot stored — and the Tracker\'s own bookkeeping, naming nobody', async () => {
    await act(async () => { await tick(50) })
    await postman.flush()
    const now = await be.loadAll()
    for (const c of Object.keys(now) as Array<keyof Snapshot>) {
      if (c === 'tracker') continue
      expect(now[c], `${c}: nothing written by visiting the pages`).toEqual(atBoot[c])
    }
    const trk = Object.keys(now.tracker || {})
    expect(trk.filter(k => /:roster$|:m:|:d:|:pace:|:lulls:|:plan$|:last/.test(k)), 'no course, no student').toEqual([])
    expect(JSON.stringify(now.tracker || {})).not.toMatch(/26ABSG|STUDENT A|STUDENT B/)
  })
})
