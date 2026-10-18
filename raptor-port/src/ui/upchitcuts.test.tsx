// @vitest-environment jsdom
/* THE UPCHIT SHEET LISTS WHAT THE DAYS GIVEN BACK WILL CUT (owner D1023, 18 Oct 26 — "Ok as recommended"). An upchit
   moved later (D999) or deleted (D1022) gives a downchit its days back; leave filed in those days since, and an undecided
   bid there, are then cut by the Leave War's own rules inside the same command ("sick cuts leave"; a clashing input
   replaces an undecided bid). The sheet now lists each, one line, in the Leave War's own warning words, BEFORE anything
   changes — worked out by trying the very save the sheet's button runs and throwing it away, so the two cannot differ.

   Driven here over the REAL Leave War rules (wireLeaveWarSync — not a stand-in gate), through every door that opens the
   sheet on a give-back: the input's own window's Delete, Delete on the upchit's line in a day opened on the Inputs
   calendar, the calendar's drag of the upchit to a later day, and the window's own Save of a later date. And the two
   things the try must not do: change anything, or lose what was typed in an open window. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor, commitNewInput, giveBackCuts, upchitDeleteAsk } from './inputedit'
import { MedMoveConfirm } from './MedMoveConfirm'
import { commitChipMove } from './caldrag'
import { initStore, notify, setSession, writeInputs, undo } from '../state/store'
import { setMe } from '../state/auth'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { INPUTS, holds } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { initStore as lwInitStore, getState, rawState, setCell, setPeople, setRole as lwSetRole } from '../leavewar/state/store'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { memoryBackend } from '../leavewar/state/storage'
import { wireLeaveWarSync } from '../leavewar/sync'
import { _resetFloatWins } from './FloatWindow'
import { INPEDIT, MEDMOVE, setInpEdit, setMedMove } from './pops'
import { docAdd } from '../state/docs'
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
const line = (r: any) => tid('idy-row-' + r.iid)!.querySelector('[data-testid="idy-open"]') as HTMLElement
const cutLines = () => [...document.querySelectorAll('[data-testid^="upconf-cut-"]')].map(e => e.textContent)
const doc = () => docAdd(new Blob(['x'], { type: 'image/png' }) as any).id
const cs = (p: string) => PEOPLE[p].cs

/* a man fit for the whole of October, with nothing of his own filed then */
const WHO = 'ammo'
const rows = (type: string) => INPUTS.filter((r: any) => holds(r, WHO) && r.type === type)
const spans = (type: string) => rows(type).map((r: any) => `${r.date}-${r.endDate ?? r.date}`).sort()
const recsAt = (d: string) => rawState().wars.find(w => w.period.start <= d && d <= w.period.end)?.recs[WHO]?.[d] ?? []

/* his ATT C Mon 5 – Fri 9 Oct, an upchit on Wed 7 that cuts it to Tue 6 — then, fit, an LL on Thu 8 */
const downUpLeave = async () => {
  await act(async () => {
    writeInputs(() => { INPUTS.push({ iid: 'dc1', person: WHO, people: [{ p: WHO }], type: 'ATT C', date: 'Oct 5', endDate: 'Oct 9', yr: 2026, allday: true, remarks: '', mod: '2026-09-01', docId: doc() }) })
    notify()
  })
  expect(commitNewInput({ person: WHO, type: 'Upchit', allday: true, half: '', start: '2026-10-07', end: '', sTime: '', eTime: '', remarks: '', sans: null, docId: doc() }), 'the upchit is filed').toBe(true)
  expect(spans('ATT C'), 'the upchit cut the downchit to the day before').toEqual(['Oct 5-Oct 6'])
  expect(commitNewInput({ person: WHO, type: 'LL', allday: true, half: '', start: '2026-10-08', end: '', sTime: '', eTime: '', remarks: '', sans: null }), 'the leave is filed — he is fit').toBe(true)
  await act(async () => { notify() })
  expect(spans('LL')).toEqual(['Oct 8-Oct 8'])
  return { up: () => INPUTS.find((r: any) => r.type === 'Upchit' && holds(r, WHO)) }
}
const LL_CUT = () => `${cs(WHO)}'s LL on 8 Oct is cut for the ATT C — that leave goes back to the balance`

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); setSession({ user: 'a', role: 'admin' }); setMe('stiff')
  lwInitStore(memoryBackend()); setPeople(projectPeople()); wireLeaveWarSync(); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('cal'); setCalMonth({ y: 2026, m: 10 })
  said.length = 0; HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /><MedMoveConfirm /></>) })
  await act(async () => { setCalMonth({ y: 2026, m: 10 }); notify() })
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null); setMedMove(null) })
  HOOKS.toast = realToast; setInputGate(null)
  host.remove(); _resetFloatWins(); setSession(null); storeBackend.impl = null
})

describe('the world these tests stand on', () => {
  it('a Leave War period holds October 2026', () => {
    expect(rawState().wars.some(w => w.period.start <= '2026-10-08' && '2026-10-08' <= w.period.end), JSON.stringify(rawState().wars.map(w => w.period))).toBe(true)
  })
})

describe('the input’s own window: Delete on an upchit whose days given back hold leave', () => {
  it('the sheet lists the leave that will be cut, in the Leave War’s words — and asking changes nothing', async () => {
    const { up } = await downUpLeave()
    await act(async () => { setInpEdit(up()); notify() })
    const before = JSON.stringify(INPUTS)
    said.length = 0
    await click($('#inpEditDel'))
    expect(tid('upconf')!.textContent).toMatch(/ATT C Oct 5 – Oct 6 → now ends Oct 9, its days given back/)
    expect(cutLines()).toEqual([LL_CUT()])
    expect(JSON.stringify(INPUTS), 'nothing written by asking').toBe(before)
    expect(said, 'the try says nothing').toEqual([])
    expect(getState().grid[WHO]?.['2026-10-08'], 'the Leave War still shows the leave').toBe('LL')
  })
  it('"Delete upchit" then does exactly what it listed: the leave cut, the days back', async () => {
    const { up } = await downUpLeave()
    await act(async () => { setInpEdit(up()); notify() })
    await click($('#inpEditDel'))
    await click(tid('upconf-save'))
    expect(up()).toBeUndefined()
    expect(spans('ATT C')).toEqual(['Oct 5-Oct 9'])
    expect(rows('LL'), 'the leave the sheet named is gone').toHaveLength(0)
    expect(said.some(m => m.includes(LL_CUT())), 'the warning is still said afterwards, as before').toBe(true)
  })
  it('Cancel leaves all three as they were, the window still on the upchit and still working', async () => {
    const { up } = await downUpLeave()
    await act(async () => { setInpEdit(up()); notify() })
    await click($('#inpEditDel'))
    await click(tid('upconf').querySelector('.abtn.ghost'))
    expect(tid('upconf')).toBeNull()
    expect(spans('ATT C')).toEqual(['Oct 5-Oct 6'])
    expect(spans('LL')).toEqual(['Oct 8-Oct 8'])
    expect(INPEDIT, 'the window holds the upchit as it now stands in the list').toBe(up())
    await click($('#inpEditDel'))
    await click(tid('upconf-save'))
    expect(up(), 'a second Delete still deletes').toBeUndefined()
  })
  it('one Undo puts back the upchit, the cut and the leave together', async () => {
    const { up } = await downUpLeave()
    await act(async () => { setInpEdit(up()); notify() })
    await click($('#inpEditDel'))
    await click(tid('upconf-save'))
    await act(async () => { undo(); notify() })
    expect(up()).toBeTruthy()
    expect(spans('ATT C')).toEqual(['Oct 5-Oct 6'])
    expect(spans('LL')).toEqual(['Oct 8-Oct 8'])
  })
  it('what he typed in the window before pressing Delete is kept through the try', async () => {
    const { up } = await downUpLeave()
    await act(async () => { setInpEdit(up()); notify() })
    const rm = $('#inpEditRmk') as HTMLTextAreaElement | HTMLInputElement
    expect(rm, 'the remarks box').toBeTruthy()
    await act(async () => {
      const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rm), 'value')!.set!
      set.call(rm, 'seen by the doc'); rm.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await click($('#inpEditDel'))
    await click(tid('upconf').querySelector('.abtn.ghost'))
    expect(($('#inpEditRmk') as HTMLInputElement).value).toBe('seen by the doc')
  })
})

describe('an undecided bid in the days given back', () => {
  it('is listed, one line, as the Leave War says it — and replaced by the delete', async () => {
    const { up } = await downUpLeave()
    lwSetRole('admin')
    expect(setCell(WHO, '2026-10-09', 'LL'), 'a pending LL bid on Fri 9 Oct').toBe(true)
    await act(async () => { setInpEdit(up()); notify() })
    await click($('#inpEditDel'))
    expect(cutLines()).toEqual([LL_CUT(), `This replaces ${cs(WHO)}'s LL bid on 9 Oct on the Leave War`])
    expect(recsAt('2026-10-09').some(r => r.kind === 'request'), 'asking left the bid').toBe(true)
    await click(tid('upconf-save'))
    expect(recsAt('2026-10-09').some(r => r.kind === 'request'), 'the delete replaced it').toBe(false)
  })
})

describe('a give-back that cuts nothing lists nothing', () => {
  it('the sheet as it was: the give-back alone', async () => {
    await act(async () => {
      writeInputs(() => { INPUTS.push({ iid: 'dc1', person: WHO, people: [{ p: WHO }], type: 'ATT C', date: 'Oct 5', endDate: 'Oct 9', yr: 2026, allday: true, remarks: '', mod: '2026-09-01', docId: doc() }) })
      notify()
    })
    expect(commitNewInput({ person: WHO, type: 'Upchit', allday: true, half: '', start: '2026-10-07', end: '', sTime: '', eTime: '', remarks: '', sans: null, docId: doc() })).toBe(true)
    const up = INPUTS.find((r: any) => r.type === 'Upchit' && holds(r, WHO))
    await act(async () => { setInpEdit(up); notify() })
    await click($('#inpEditDel'))
    expect(tid('upconf')!.textContent).toMatch(/now ends Oct 9, its days given back/)
    expect(cutLines()).toEqual([])
  })
})

describe('Delete on the upchit’s line in an opened day', () => {
  it('the same sheet lists the leave; "Delete upchit" cuts it', async () => {
    const { up } = await downUpLeave()
    await key(day('2026-10-07'), 'Enter')
    await key(line(up()), 'Delete')
    expect(cutLines()).toEqual([LL_CUT()])
    expect(spans('LL'), 'nothing cut by asking').toEqual(['Oct 8-Oct 8'])
    await click(tid('upconf-save'))
    expect(up()).toBeUndefined()
    expect(rows('LL')).toHaveLength(0)
  })
})

describe('the calendar’s drag of the upchit to a later day (D999)', () => {
  it('the sheet lists the leave the days given back will cut; Save moves and cuts', async () => {
    const { up } = await downUpLeave()
    commitChipMove({ kind: 'input', iid: up().iid }, '2026-10-07', '2026-10-10')
    await act(async () => { notify() })
    expect(MEDMOVE?.ask?.kind).toBe('up')
    expect(tid('upconf')!.textContent).toMatch(/now ends Oct 9, its days given back/)
    expect(cutLines()).toEqual([LL_CUT()])
    expect(spans('LL'), 'nothing cut by asking').toEqual(['Oct 8-Oct 8'])
    expect(up().date, 'nothing moved by asking').toBe('Oct 7')
    await click(tid('upconf-save'))
    expect(up().date).toBe('Oct 10')
    expect(spans('ATT C')).toEqual(['Oct 5-Oct 9'])
    expect(rows('LL')).toHaveLength(0)
  })
  it('a window left open on another input keeps what was typed in it, and still saves', async () => {
    const { up } = await downUpLeave()
    const ll = rows('LL')[0]
    await act(async () => { setInpEdit(ll); notify() })
    const rm = $('#inpEditRmk') as HTMLInputElement
    await act(async () => {
      const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rm), 'value')!.set!
      set.call(rm, 'family wedding'); rm.dispatchEvent(new Event('input', { bubbles: true }))
    })
    commitChipMove({ kind: 'input', iid: up().iid }, '2026-10-07', '2026-10-10')
    await act(async () => { notify() })
    await click(tid('upconf').querySelector('.abtn.ghost'))
    expect(($('#inpEditRmk') as HTMLInputElement).value, 'his typing is still there').toBe('family wedding')
    await click($('#inpEditSave'))
    expect(rows('LL')[0]?.remarks, 'and the window still saves it').toBe('family wedding')
  })
})

describe('the window’s own Save of the upchit on a later date (D999)', () => {
  it('the sheet lists the leave; asking changes nothing; Save moves and cuts', async () => {
    const { up } = await downUpLeave()
    await act(async () => { setInpEdit(up()); notify() })
    /* the window's own calendar: a tap on Sat 10 Oct is the upchit's new date */
    await click(document.querySelector('[data-iso="2026-10-10"]'))
    await click($('#inpEditSave'))
    expect(tid('upconf')!.textContent).toMatch(/now ends Oct 9, its days given back/)
    expect(cutLines()).toEqual([LL_CUT()])
    expect(up().date, 'nothing moved by asking').toBe('Oct 7')
    expect(spans('LL')).toEqual(['Oct 8-Oct 8'])
    await click(tid('upconf-save'))
    expect(up().date).toBe('Oct 10')
    expect(spans('ATT C')).toEqual(['Oct 5-Oct 9'])
    expect(rows('LL')).toHaveLength(0)
  })
  it('a new upchit gives nothing back and lists nothing', async () => {
    await act(async () => { setInpEdit({ _new: true, person: WHO, type: 'Upchit', date: 'Oct 7', yr: 2026 }); notify() })
    expect(giveBackCuts(() => true), 'nothing heard from a write that cuts nothing').toEqual([])
  })
})

describe('the try is the save', () => {
  it('a write that would be refused cuts nothing, so lists nothing', () => {
    expect(giveBackCuts(() => false)).toEqual([])
  })
  it('the delete’s ask names the cut the delete then makes, line for line', async () => {
    const { up } = await downUpLeave()
    const ask = upchitDeleteAsk(up())!
    expect(ask.cuts).toEqual([LL_CUT()])
    expect(ask.effects.plan.every((p: any) => INPUTS.includes(p.row)), 'the plan names the rows as they now stand').toBe(true)
  })
})
