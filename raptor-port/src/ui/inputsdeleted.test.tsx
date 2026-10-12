// @vitest-environment jsdom
/* THE INPUTS LIST'S "DELETED" GROUP — the deleted men who still have an input (owner D299, 27 Sep 26: "a delete takes
   him out of today and the future while the past keeps its record of him … his inputs"; D287: never offered as who a NEW
   input is for). The filter must still find a deleted man's past inputs, so the Person filter lists him under "Deleted".

   WHY THIS FILE EXISTS ([ALL-AVAIL-AS-MEMBER] step 1, 12 Oct 26 — the break test of docs/bug-check-order.md §8.4): "has
   this man an input" was moved onto the per-person view of the inputs (engine/inputs.ts inputLines), and with the view
   blanked on purpose NO test went red for this group — it had none. It is asked of who is IN an input, so a man filed
   with others is found too (owner D756: one record holding the list of its people). */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { initStore, notify, setSession, writeInputs } from '../state/store'
import { setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './FloatWindow'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const realToast = HOOKS.toast
const admin = 'stiff'
const P = PEOPLE as any
let was: Record<string, any> = {}
const gone = (id: string) => { was[id] = { deleted: P[id].deleted, deletedFrom: P[id].deletedFrom }; P[id].deleted = true; P[id].deletedFrom = '2026-10-01' }
const group = () => document.querySelector('#inFPerson optgroup[label="Deleted"]') as HTMLOptGroupElement | null
const names = () => (group() ? [...group()!.querySelectorAll('option')].map(o => o.textContent) : [])
const file = async (rows: any[]) => act(async () => { writeInputs(() => { INPUTS.push(...rows) }); notify() })
const row = (over: any) => ({ type: 'Meeting', date: 'Sep 20', yr: 2026, allday: false, s: 600, e: 660, remarks: '', mod: '2026-09-01', by: admin, ...over })

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length)
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); INPUTS.splice(0, INPUTS.length)
  setSession({ user: admin, role: 'admin' }); setMe(admin); lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('table')
  HOOKS.toast = (() => {}) as any
  was = {}
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<InputsPage />) })
})
afterEach(async () => {
  await act(async () => { root.unmount() })
  for (const id of Object.keys(was)) { if (was[id].deleted === undefined) delete P[id].deleted; else P[id].deleted = was[id].deleted; if (was[id].deletedFrom === undefined) delete P[id].deletedFrom; else P[id].deletedFrom = was[id].deletedFrom }
  HOOKS.toast = realToast; storeBackend.impl = null
  host.remove(); _resetFloatWins(); INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
})

describe('the Person filter lists the deleted men who still have an input (D299)', () => {
  it('a deleted man with a past input is listed under "Deleted"; one with none is not', async () => {
    gone('bane'); gone('salsa')
    await file([row({ iid: 'dl1', person: 'bane' })])
    expect(names()).toEqual([`${P.bane.cs} (deleted)`])
  })
  it('nobody deleted has an input — no "Deleted" group at all', async () => {
    gone('bane')
    await file([row({ iid: 'dl2', person: 'salsa' })])
    expect(group()).toBeNull()
  })
  it('a deleted man who is one of SEVERAL people in an input is found too (D756 — who is in it, not whose record it is)', async () => {
    gone('salsa')
    await file([{ ...row({ iid: 'dl3' }), people: [{ p: 'bane', by: admin }, { p: 'salsa', by: admin }] }])
    expect(names()).toEqual([`${P.salsa.cs} (deleted)`])
  })
})
