// @vitest-environment jsdom
/* A DELETED UPCHIT GIVES THE DOWNCHIT ITS DAYS BACK — AND SAYS SO FIRST (owner D1022, 18 Oct 26 — "as recommended": as a
   moved one does, D999; "the save sheet says so before anything changes"). The rule itself is pinned in medwrite.test.ts;
   what is pinned HERE is the two doors that delete an upchit, pressed as a person presses them: the input's own window's
   Delete, and Delete on its line in a day opened on the Inputs calendar. Each puts up the upchit sheet naming what comes
   back; its "Delete upchit" deletes, Cancel leaves both as they were. A delete that gives nothing back still goes at once
   (D792) — or, on the calendar, asks its own one-line question (D621), as before. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor, commitNewInput } from './inputedit'
import { MedMoveConfirm } from './MedMoveConfirm'
import { initStore, notify, setSession, undo, writeInputs } from '../state/store'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { INPUTS, holds } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './FloatWindow'
import { INPEDIT, setInpEdit, setMedMove } from './pops'
import { docAdd } from '../state/docs'
import { toast as theToast, toastBatch as theBatch } from './toast'
import { setInputGate } from '../state/inputgate-hook'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const said: string[] = []
const realToast = HOOKS.toast
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const tid = (id: string) => $(`[data-testid="${id}"]`)
const day = (iso: string) => $(`[data-icday="${iso}"]`)!
const key = async (el: Element, k: string) => act(async () => { el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })) })
const click = async (el: Element | null) => { expect(el, 'the control is there').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const crew = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers)
const line = (r: any) => tid('idy-row-' + r.iid)!.querySelector('[data-testid="idy-open"]') as HTMLElement

/* his ATT C Mon 5 – Fri 9 Oct, filed through the app's own door; an upchit on Wed 7 Oct cuts it to Tue 6 (the real writer) */
let who = ''
const downAndUp = async () => {
  who = crew()[0]
  const c = { iid: 'dc1', person: who, people: [{ p: who }], type: 'ATT C', date: 'Oct 5', endDate: 'Oct 9', yr: 2026, allday: true, remarks: '', mod: '2026-09-01', docId: docAdd(new Blob(['x'], { type: 'image/png' }) as any).id }
  await act(async () => { writeInputs(() => { INPUTS.push(c) }); notify() })
  const ok = commitNewInput({ person: who, type: 'Upchit', allday: true, half: '', start: '2026-10-07', end: '', sTime: '', eTime: '', remarks: '', sans: null, docId: docAdd(new Blob(['x'], { type: 'image/png' }) as any).id })
  expect(ok, 'the upchit is filed').toBe(true)
  await act(async () => { notify() })
  const down = INPUTS.find((r: any) => r.iid === 'dc1')
  expect(down.endDate, 'the upchit cut it to the day before').toBe('Oct 6')
  return { down: () => INPUTS.find((r: any) => r.iid === 'dc1'), up: () => INPUTS.find((r: any) => r.type === 'Upchit' && holds(r, who)) }
}

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); setSession({ user: 'a', role: 'admin' }); lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('cal'); setCalMonth({ y: 2026, m: 10 })
  said.length = 0; HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /><MedMoveConfirm /></>) })
  await act(async () => { setCalMonth({ y: 2026, m: 10 }); notify() })
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null); setMedMove(null) })
  HOOKS.toast = realToast
  host.remove(); _resetFloatWins(); setSession(null); storeBackend.impl = null
})

describe('the input’s own window: Delete on an upchit that gives days back asks on the upchit sheet', () => {
  it('the sheet names the downchit and its new end; nothing is written by asking', async () => {
    const { down, up } = await downAndUp()
    await act(async () => { setInpEdit(up()); notify() })
    await click($('#inpEditDel'))
    const sheet = tid('upconf')!
    expect(sheet, 'the upchit sheet is up').toBeTruthy()
    expect(sheet.textContent).toContain('Deleting this upchit will')
    expect(sheet.textContent).toMatch(/ATT C Oct 5 – Oct 6 → now ends Oct 9, its days given back/)
    expect(sheet.textContent, 'no "fit" line — a delete makes nobody fit').not.toContain('Fit for full duty')
    expect(tid('upconf-save')!.textContent).toBe('Delete upchit')
    expect(up(), 'still there').toBeTruthy()
    expect(down().endDate, 'still cut').toBe('Oct 6')
  })
  it('"Delete upchit" deletes it and gives the days back — one Undo step takes both back', async () => {
    const { down, up } = await downAndUp()
    await act(async () => { setInpEdit(up()); notify() })
    await click($('#inpEditDel'))
    await click(tid('upconf-save'))
    expect(up(), 'the upchit is gone').toBeUndefined()
    expect(down().endDate, 'its days back').toBe('Oct 9')
    expect(said).toContain('Input deleted')
    /* the window is shut (its record let go); that it leaves the screen is the walk's to see — this test world keeps the
       last frame of the modal drawn after any delete, today's ordinary one included */
    expect(INPEDIT, 'the window has closed').toBeNull()
    await act(async () => { undo() })
    expect(up(), 'Undo: the upchit is back').toBeTruthy()
    expect(down().endDate, 'and the cut with it').toBe('Oct 6')
  })
  it('Cancel leaves both as they were, and the window open', async () => {
    const { down, up } = await downAndUp()
    await act(async () => { setInpEdit(up()); notify() })
    await click($('#inpEditDel'))
    const cancel = [...tid('upconf')!.querySelectorAll('button')].find(b => b.textContent === 'Cancel')!
    await click(cancel)
    expect(tid('upconf')).toBeNull()
    expect(up()).toBeTruthy(); expect(down().endDate).toBe('Oct 6')
    expect($('#inpEditDel'), 'the window is still open').toBeTruthy()
  })
  it('an upchit whose delete gives nothing back goes at once, as every delete does (D792)', async () => {
    const { down, up } = await downAndUp()
    /* the downchit's dates changed by hand: it no longer remembers its first end, so nothing comes back */
    await act(async () => { writeInputs(() => { delete down().firstEnd }); notify() })
    await act(async () => { setInpEdit(up()); notify() })
    await click($('#inpEditDel'))
    expect(tid('upconf'), 'no sheet').toBeNull()
    expect(up()).toBeUndefined()
    expect(INPEDIT, 'the window has closed').toBeNull()
    expect(down().endDate).toBe('Oct 6')
  })
})

describe('Delete on the upchit’s line in an opened day asks on the same sheet', () => {
  it('the sheet stands in place of the one-line question; "Delete upchit" deletes and gives back', async () => {
    const { down, up } = await downAndUp()
    await key(day('2026-10-07'), 'Enter')
    await key(line(up()), 'Delete')
    expect(tid('idy-ask'), 'one question, not two').toBeNull()
    expect(tid('upconf')!.textContent).toContain('now ends Oct 9, its days given back')
    expect(up(), 'nothing until he says').toBeTruthy()
    await click(tid('upconf-save'))
    expect(up()).toBeUndefined()
    expect(down().endDate).toBe('Oct 9')
    expect(said).toContain('Input deleted')
    expect(tid('win-inputsday'), 'the day stays open').toBeTruthy()
  })
  it('Cancel leaves both as they were', async () => {
    const { down, up } = await downAndUp()
    await key(day('2026-10-07'), 'Enter')
    await key(line(up()), 'Delete')
    const cancel = [...tid('upconf')!.querySelectorAll('button')].find(b => b.textContent === 'Cancel')!
    await click(cancel)
    expect(tid('upconf')).toBeNull()
    expect(up()).toBeTruthy(); expect(down().endDate).toBe('Oct 6')
  })
})

/* THE DELETE'S OWN WORD SURVIVES (the fresh read of 18 Oct 26, finding 1). Leave filed in the days a delete gives back is cut
   by the Leave War's rules inside that same command ("sick cuts leave"), and those rules say so — but the door's "Input
   deleted" took the app's one passing note straight after, so the warning was never seen. The delete now speaks in one
   batch with its rules, as a save does: both words in the one note. The rules are stood in for by a gate that says a
   sentence (the inputsvet.test.tsx idiom), with the app's real note and its real batch. */
describe('a warning the delete raises is not wiped out by "Input deleted"', () => {
  const withGate = async (fn: () => Promise<void>) => {
    const realToast = HOOKS.toast, realBatch = HOOKS.toastBatch
    HOOKS.toast = theToast as any; HOOKS.toastBatch = theBatch as any
    setInputGate({ snapshot: () => null, apply: () => { HOOKS.toast('The leave is cut for the ATT C', 'warn') }, vetRestore: () => {} })
    try { await fn() } finally { setInputGate(null); HOOKS.toast = realToast; HOOKS.toastBatch = realBatch; document.getElementById('toastEl')?.remove() }
  }
  it('the window’s "Delete upchit": both words in the one note', async () => {
    const { up } = await downAndUp()
    await act(async () => { setInpEdit(up()); notify() })
    await click($('#inpEditDel'))
    await withGate(async () => {
      await click(tid('upconf-save'))
      expect(up()).toBeUndefined()
      expect(document.getElementById('toastEl')?.textContent).toBe('The leave is cut for the ATT C · Input deleted')
    })
  })
  it('the opened day’s sheet: both words in the one note', async () => {
    const { up } = await downAndUp()
    await key(day('2026-10-07'), 'Enter')
    await key(line(up()), 'Delete')
    await withGate(async () => {
      await click(tid('upconf-save'))
      expect(up()).toBeUndefined()
      expect(document.getElementById('toastEl')?.textContent).toBe('The leave is cut for the ATT C · Input deleted')
    })
  })
})
