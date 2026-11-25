// @vitest-environment jsdom
/* ONE MAN'S ROW OF A SHARED LEAVE, TYPED THROUGH THE REAL BOXES WITH THE ROW HELD (chat 170's night walk, W3 — 25 Nov 26;
   fixed by chat 177). leavewar/sharedrow-follows.test.ts pins the save itself; this pins the two doors that hand it the
   input — the Scheduler Board's Unavailable boxes (board.ts, `data-ifld`) and Edit Schedule's week cells (textedit.ts,
   `data-inp`) — as the app drives them: the caret held in the section, so its row is not repainted and still carries the
   SHARED leave's id with Ranger's name after it, and a refused box healed from what that address stands for now.
   Ranger is `bane`, Hex `rocky`; Monday 13 Jul 26 is day 0 of the demo week. */
import { beforeAll, beforeEach, afterEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, setSession } from '../state/store'
import { histInit } from '../state/history'
import { DAYS } from '../engine/data'
import { INPUTS, idsOf } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { DPREV, setPage, setBoardDay, PIOPEN } from '../state/view'
import { openScheduler } from './board'
import { commitInput } from './inputedit'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
let root: Root, host: HTMLDivElement, seed: any
const NAME: Record<string, string> = { bane: 'Ranger', rocky: 'Hex' }
const leaves = () => INPUTS.filter((r: any) => r.type === 'LL' && r.date === 'Jul 13' && idsOf(r).some((p: string) => p in NAME)) as any[]
const store = () => leaves().map(r => `${idsOf(r).map((p: string) => NAME[p] || p).join('+')} ${r.s}-${r.e} "${r.remarks || ''}"`).sort()

beforeAll(() => { initStore(); seed = JSON.parse(JSON.stringify({ d: DAYS, i: INPUTS, s: SCHED })) })
beforeEach(async () => {
  DAYS.splice(0, DAYS.length, ...structuredClone(seed.d))
  INPUTS.splice(0, INPUTS.length, ...structuredClone(seed.i))
  Object.keys(SCHED).forEach(k => delete (SCHED as any)[k])
  Object.assign(SCHED, structuredClone(seed.s))
  DPREV.clear(); PIOPEN.clear(); setBoardDay(null)
  setSession({ user: 'a', role: 'admin' }); setPage('viewsched'); histInit()
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setPage('editsched'); notify() })
  /* the shared leave, filed as the Inputs page files it — timed, 08:00–10:00, for the two of them */
  expect(commitInput(null, { type: 'LL', allday: false, half: '', start: '2026-07-13', end: '', sTime: '08:00', eTime: '10:00', remarks: '', sans: null, docIds: [] }, ['bane', 'rocky'])).toBe(true)
  await act(async () => { notify() })
})
afterEach(async () => {
  await act(async () => { (document.activeElement as HTMLElement)?.blur(); await new Promise(r => setTimeout(r, 20)); root.unmount() })
  host.remove()
})
const sharedIid = () => { const l = leaves(); expect(l, 'one shared leave').toHaveLength(1); return l[0].iid as string }

describe('the Scheduler Board: Ranger\'s Unavailable row, three boxes in turn, the caret held in the section', () => {
  it('each change lands on Ranger\'s own leave; Hex keeps 08:00–10:00 and no remark; a refused box heals to HIS time', async () => {
    const iid = sharedIid()
    await act(async () => { openScheduler(0); notify() })
    /* found by the address the row was drawn with — the held row keeps it */
    const ifld = (f: string) => host.querySelector(`#sbBoard [data-ifld="iu:${iid}~bane.${f}"], #sbBoard [data-ifld="${iid}~bane.${f}"]`) as HTMLInputElement
    const k0 = ifld('str'); expect(k0, 'Ranger\'s start box on the board').toBeTruthy()
    const type = async (el: HTMLInputElement, v: string) => {
      await act(async () => { el.focus() })
      await act(async () => { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })) })
    }
    await type(ifld('str'), '0900')
    expect(store()).toEqual(['Hex 480-600 ""', 'Ranger 540-600 ""'])
    const end = ifld('end'); expect(end, 'the held row still carries the shared address').toBeTruthy()
    await type(end, '1100')
    expect(store(), 'the end reaches HIS leave, never Hex\'s').toEqual(['Hex 480-600 ""', 'Ranger 540-660 ""'])
    const rmk = ifld('rmks'); expect(rmk).toBeTruthy()
    await type(rmk, 'own hours')
    expect(store(), 'the remark too').toEqual(['Hex 480-600 ""', 'Ranger 540-660 "own hours"'])
    /* a refused time: the box heals to what HIS leave says, never the others' */
    const end2 = ifld('end')
    expect(end2, 'the row is still held, the shared address on it').toBeTruthy()
    await type(end2, '2570')
    expect(store(), 'nothing saved').toEqual(['Hex 480-600 ""', 'Ranger 540-660 "own hours"'])
    expect(end2.value, 'healed to Ranger\'s 11:00').toBe('11:00')
  })
})

describe('Edit Schedule\'s week: Ranger\'s Unavailable cells, typed in turn with the caret held', () => {
  it('each change lands on Ranger\'s own leave; Hex keeps 08:00–10:00', async () => {
    const iid = sharedIid()
    await act(async () => { notify() })
    const cell = (f: string) => host.querySelector(`#eWeek .day[data-day="0"] [data-inp="${iid}~bane.${f}"]`) as HTMLElement
    expect(cell('str'), 'Ranger\'s start cell on the week').toBeTruthy()
    const type = async (el: HTMLElement, v: string) => {
      await act(async () => { el.focus() })
      await act(async () => { el.textContent = v })
      await act(async () => { el.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
    }
    await type(cell('str'), '0900')
    expect(store()).toEqual(['Hex 480-600 ""', 'Ranger 540-600 ""'])
    const end = cell('end')
    expect(end, 'the week\'s row is held while the caret is in it, the shared address still on it').toBeTruthy()
    await type(end, '1100')
    expect(store(), 'the end reaches HIS leave').toEqual(['Hex 480-600 ""', 'Ranger 540-660 ""'])
  })
})
