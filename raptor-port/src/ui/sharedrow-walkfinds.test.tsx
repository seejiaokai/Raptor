// @vitest-environment jsdom
/* THE SHARED-ROW WALK'S TWO FINDINGS (the FULL check of pull request 845, 25 Nov 26 — walker A's A7(e) and A3, walker B's
   B3; each written here red before its fix, chat 181).

   1. A ROW NEVER MOVES BECAUSE ITS MAN WAS CUT OUT. A change typed on one man's row of a shared leave gives him a leave of
      his own (engine/inputown.ts ownInputOf), and that new record was always put AFTER the shared one: so Ranger, the
      first man of the leave, stood on top while his row was held under the caret and dropped BELOW Hex the moment the
      caret left — Hex's row slid up to where Ranger's had been. A name dragged from the crew list onto Ranger's puck
      (the press takes the caret out of his box) then landed on Hex: "Outlaw is now unavailable instead of Hex", and Hex
      lost his leave. His standing rule: nothing on the board re-orders itself (10 Aug 26; D735), a control never moves
      under the finger (2 Sep 26). So the list keeps every row where it stood: the first man's own leave is put BEFORE
      the shared one, the last man's after it, and a man from the middle keeps his place between the others
      (engine/rowinput.ts unavailFaces).

   2. A CLEARED END LEAVES NO STALE START. "Clearing a time means all day" (docs/ui-contracts.md): his end cleared after a
      start of 09:00 saved the leave as all day — and his start box went on reading 09:00 until the caret came back to it,
      on the Board and on the week, on a shared row and on a one-man row alike. A box never disagrees with what is saved.

   Ranger is `bane`, Hex `rocky`, Outlaw `casper`; Monday 13 Jul 26 is day 0 of the demo week, Tuesday day 1. */
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
const NAME: Record<string, string> = { bane: 'Ranger', rocky: 'Hex', casper: 'Outlaw', slash: 'Blade', stiff: 'Saber' }
const DATE = ['Jul 13', 'Jul 14']
const leaves = (di: number) => INPUTS.filter((r: any) => r.type === 'LL' && r.date === DATE[di] && idsOf(r).some((p: string) => p in NAME)) as any[]
const store = (di: number) => leaves(di).map(r => `${idsOf(r).map((p: string) => NAME[p] || p).join('+')} ${r.allday ? 'all day' : `${r.s}-${r.e}`}`).sort()
const file = (iso: string, who: string[], timed = true) => commitInput(null, { type: 'LL', allday: !timed, half: '', start: iso, end: '', sTime: timed ? '08:00' : '', eTime: timed ? '10:00' : '', remarks: '', sans: null, docIds: [] }, who)

beforeAll(() => { initStore(); seed = structuredClone({ d: DAYS, i: INPUTS, s: SCHED }) })
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
})
afterEach(async () => {
  await act(async () => { (document.activeElement as HTMLElement)?.blur(); await new Promise(r => setTimeout(r, 20)); root.unmount() })
  host.remove()
})

/* whose row a box stands on: the man its address names, else the one man of the input it names */
const manOf = (addr: string): string => {
  const [iid, p] = addr.replace(/^iu:/, '').split('.')[0].split('~')
  if (p) return p
  const r = (INPUTS as any[]).find(x => x.iid === iid)
  return r ? String(idsOf(r)[0]) : '?'
}
const ours = (di: number, addr: string): boolean => {
  const iid = addr.replace(/^iu:/, '').split('.')[0].split('~')[0]
  return leaves(di).some(r => r.iid === iid)
}
/* the leave's rows, top to bottom, as the screen draws them now */
const boardOrder = (di: number) => [...host.querySelectorAll<HTMLElement>('#sbBoard .sb-panel.unav [data-ifld$=".str"]')]
  .map(el => el.dataset.ifld!).filter(a => ours(di, a)).map(a => NAME[manOf(a)] || manOf(a))
const weekOrder = (di: number) => [...host.querySelectorAll<HTMLElement>(`#eWeek .day[data-day="${di}"] [data-inp$=".str"]`)]
  .map(el => el.dataset.inp!).filter(a => ours(di, a)).map(a => NAME[manOf(a)] || manOf(a))
const ifld = (di: number, who: string, f: string) => [...host.querySelectorAll<HTMLInputElement>(`#sbBoard .sb-panel.unav [data-ifld$=".${f}"]`)]
  .find(el => ours(di, el.dataset.ifld!) && manOf(el.dataset.ifld!) === who)!
const cell = (di: number, who: string, f: string) => [...host.querySelectorAll<HTMLElement>(`#eWeek .day[data-day="${di}"] [data-inp$=".${f}"]`)]
  .find(el => ours(di, el.dataset.inp!) && manOf(el.dataset.inp!) === who)!
const type = async (el: HTMLInputElement, v: string) => {
  await act(async () => { el.focus() })
  await act(async () => { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })) })
}
/* the caret leaves the list, as a press on a name in the crew list takes it: the held section repaints */
const caretLeaves = async () => { await act(async () => { (document.activeElement as HTMLElement)?.blur(); notify() }); await act(async () => { notify() }) }

describe('finding 1 — a man cut out of a shared leave keeps his row where it stood', () => {
  it('the Board: Ranger, the FIRST man, stays above Hex once the caret leaves his row', async () => {
    expect(file('2026-07-13', ['bane', 'rocky'])).toBe(true)
    await act(async () => { openScheduler(0); notify() })
    expect(boardOrder(0), 'as filed').toEqual(['Ranger', 'Hex'])
    await type(ifld(0, 'bane', 'str'), '0900')
    expect(store(0)).toEqual(['Hex 480-600', 'Ranger 540-600'])
    await caretLeaves()
    expect(boardOrder(0), 'Hex\'s row must not slide up under the pointer').toEqual(['Ranger', 'Hex'])
  })
  it('the Board: Hex, the LAST man, stays below Ranger', async () => {
    expect(file('2026-07-13', ['bane', 'rocky'])).toBe(true)
    await act(async () => { openScheduler(0); notify() })
    await type(ifld(0, 'rocky', 'str'), '0900')
    expect(store(0)).toEqual(['Hex 540-600', 'Ranger 480-600'])
    await caretLeaves()
    expect(boardOrder(0)).toEqual(['Ranger', 'Hex'])
  })
  it('the Board: a man from the MIDDLE of three keeps his place between the other two', async () => {
    expect(file('2026-07-14', ['rocky', 'bane', 'casper'])).toBe(true)
    await act(async () => { openScheduler(1); notify() })
    expect(boardOrder(1), 'as filed').toEqual(['Hex', 'Ranger', 'Outlaw'])
    await type(ifld(1, 'bane', 'str'), '0900')
    expect(store(1)).toEqual(['Hex+Outlaw 480-600', 'Ranger 540-600'])
    await caretLeaves()
    expect(boardOrder(1), 'neither neighbour takes his place').toEqual(['Hex', 'Ranger', 'Outlaw'])
  })
  it('the Board: two men cut out of four, one after the other, all four rows stay where they stood', async () => {
    expect(file('2026-07-14', ['rocky', 'bane', 'casper', 'slash'])).toBe(true)
    await act(async () => { openScheduler(1); notify() })
    const before = boardOrder(1)
    expect(before.slice(0, 3)).toEqual(['Hex', 'Ranger', 'Outlaw'])
    await type(ifld(1, 'bane', 'str'), '0900')
    await caretLeaves()
    await type(ifld(1, 'casper', 'str'), '0930')
    await caretLeaves()
    expect(leaves(1), 'three leaves now: the shared one and two of their own').toHaveLength(3)
    expect(boardOrder(1)).toEqual(before)
  })
  /* THE CODE READS' FIRST FINDING (Astra 1 and the fresh Opus reader's F1, each blind, 25 Nov 26): a man cut out of the
     middle got his own leave; a second man was then put into THAT leave; a time typed on either of the two cut him out
     again — and the new leave was drawn where the list holds it, under everyone, the next row sliding up into its place */
  const putInto = async (di: number, own: string, add: string) => {
    const r = leaves(di).find(x => idsOf(x).join() === own)!
    const hm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
    await act(async () => {
      expect(commitInput(r, { type: 'LL', allday: false, half: '', start: '2026-07-14', end: '', sTime: hm(r.s), eTime: hm(r.e), remarks: '', sans: null, docIds: [] }, [own, add]), 'the input\'s own window: a second man put in').toBe(true)
      notify()
    })
  }
  it('the Board: cut out of the middle, a second man put into his own leave, then HE is cut out again — all four rows stay', async () => {
    expect(file('2026-07-14', ['rocky', 'bane', 'casper'])).toBe(true)
    await act(async () => { openScheduler(1); notify() })
    await type(ifld(1, 'bane', 'str'), '0900'); await caretLeaves()
    await putInto(1, 'bane', 'slash')
    expect(boardOrder(1), 'the man put in stands straight under him').toEqual(['Hex', 'Ranger', 'Blade', 'Outlaw'])
    await type(ifld(1, 'bane', 'str'), '0930'); await caretLeaves()
    expect(store(1)).toEqual(['Blade 540-600', 'Hex+Outlaw 480-600', 'Ranger 570-600'])
    expect(boardOrder(1), 'Ranger does not drop under Outlaw').toEqual(['Hex', 'Ranger', 'Blade', 'Outlaw'])
  })
  it('the Board: the same, the SECOND man of that leave cut out — all four rows stay', async () => {
    expect(file('2026-07-14', ['rocky', 'bane', 'casper'])).toBe(true)
    await act(async () => { openScheduler(1); notify() })
    await type(ifld(1, 'bane', 'str'), '0900'); await caretLeaves()
    await putInto(1, 'bane', 'slash')
    await type(ifld(1, 'slash', 'str'), '0930'); await caretLeaves()
    expect(store(1)).toEqual(['Blade 570-600', 'Hex+Outlaw 480-600', 'Ranger 540-600'])
    expect(boardOrder(1)).toEqual(['Hex', 'Ranger', 'Blade', 'Outlaw'])
  })
  it('the Board: three cut out of five in turn, from the inside out and from the outside in', async () => {
    for (const [di, iso, order] of [[0, '2026-07-13', ['casper', 'bane', 'slash']], [1, '2026-07-14', ['bane', 'slash', 'casper']]] as [number, string, string[]][]) {
      expect(file(iso, ['rocky', 'bane', 'casper', 'slash', 'stiff'])).toBe(true)
      await act(async () => { openScheduler(di); notify() })
      const before = boardOrder(di)
      expect(before).toHaveLength(5)
      for (const [i, who] of order.entries()) { await type(ifld(di, who, 'str'), `09${i + 1}0`); await caretLeaves() }
      expect(leaves(di), 'the shared leave and three of their own').toHaveLength(4)
      expect(boardOrder(di), `cut in the order ${order.join(', ')}`).toEqual(before)
    }
  })
  it('the week: the first man and the middle man keep their rows too', async () => {
    expect(file('2026-07-13', ['bane', 'rocky'])).toBe(true)
    expect(file('2026-07-14', ['rocky', 'bane', 'casper'])).toBe(true)
    await act(async () => { notify() })
    expect(weekOrder(0)).toEqual(['Ranger', 'Hex'])
    expect(weekOrder(1)).toEqual(['Hex', 'Ranger', 'Outlaw'])
    for (const di of [0, 1]) {
      await act(async () => { cell(di, 'bane', 'str').focus() })
      await act(async () => { cell(di, 'bane', 'str').textContent = '0900' })
      await act(async () => { cell(di, 'bane', 'end').focus() })     // Tab on: the start saved, the row held
      await caretLeaves()
    }
    expect(store(0)).toEqual(['Hex 480-600', 'Ranger 540-600'])
    expect(store(1)).toEqual(['Hex+Outlaw 480-600', 'Ranger 540-600'])
    expect(weekOrder(0)).toEqual(['Ranger', 'Hex'])
    expect(weekOrder(1)).toEqual(['Hex', 'Ranger', 'Outlaw'])
  })
  it('what is SAVED keeps the first man first: his own leave stands before the shared one in the list', async () => {
    expect(file('2026-07-13', ['bane', 'rocky'])).toBe(true)
    await act(async () => { openScheduler(0); notify() })
    await type(ifld(0, 'bane', 'str'), '0900')
    const own = leaves(0).find(r => idsOf(r).join() === 'bane')!, shared = leaves(0).find(r => idsOf(r).join() === 'rocky')!
    expect(INPUTS.indexOf(own), 'a reload, or another device, draws Ranger above Hex as well').toBe(INPUTS.indexOf(shared) - 1)
  })
})

describe('finding 2 — a time box never disagrees with what is saved', () => {
  it('the Board, his row of a shared leave: start 0900, then the end cleared — both boxes read empty, the leave all day', async () => {
    expect(file('2026-07-13', ['bane', 'rocky'])).toBe(true)
    await act(async () => { openScheduler(0); notify() })
    await type(ifld(0, 'bane', 'str'), '0900')
    await type(ifld(0, 'bane', 'end'), '')
    expect(store(0)).toEqual(['Hex 480-600', 'Ranger all day'])
    expect(ifld(0, 'bane', 'str').value, 'his start box, the caret elsewhere').toBe('')
    expect(ifld(0, 'rocky', 'str').value, 'Hex\'s row untouched').toBe('08:00')
  })
  it('the Board, a one-man row: the same', async () => {
    expect(file('2026-07-13', ['bane'])).toBe(true)
    await act(async () => { openScheduler(0); notify() })
    await type(ifld(0, 'bane', 'str'), '0900')
    await type(ifld(0, 'bane', 'end'), '')
    expect(store(0)).toEqual(['Ranger all day'])
    expect(ifld(0, 'bane', 'str').value).toBe('')
  })
  it('the Board, an all-day leave given a start: the end box reads the 23:59 that was saved', async () => {
    expect(file('2026-07-13', ['bane'], false)).toBe(true)
    await act(async () => { openScheduler(0); notify() })
    await type(ifld(0, 'bane', 'str'), '0930')
    expect(store(0)).toEqual(['Ranger 570-1439'])
    expect(ifld(0, 'bane', 'end').value).toBe('23:59')
  })
  it('the week, his row of a shared leave: start 0900, then the end cleared — his start cell reads empty', async () => {
    expect(file('2026-07-13', ['bane', 'rocky'])).toBe(true)
    await act(async () => { notify() })
    await act(async () => { cell(0, 'bane', 'str').focus() })
    await act(async () => { cell(0, 'bane', 'str').textContent = '0900' })
    await act(async () => { cell(0, 'bane', 'end').focus() })
    await act(async () => { cell(0, 'bane', 'end').textContent = '' })
    await act(async () => { cell(0, 'bane', 'rmks').focus() })      // Tab on: the end saved, the row still held
    expect(store(0)).toEqual(['Hex 480-600', 'Ranger all day'])
    expect((cell(0, 'bane', 'str').textContent || '').trim(), 'his start cell, the caret in his remark').toBe('')
    expect((cell(0, 'rocky', 'str').textContent || '').trim()).toBe('08:00')
  })
  /* THE SAME PROMISE ON A REQUEST'S ROW OF THE GROUND PROGRAMME (the fresh Fable reader's F3, 25 Nov 26 — a missing call
     site of the fix above): a Meeting's end cleared saved it all day, and its start box went on reading 08:00 */
  const meeting = async () => {
    expect(commitInput(null, { type: 'Meeting', allday: false, half: '', start: '2026-07-13', end: '', sTime: '08:00', eTime: '10:00', remarks: '', sans: null, docIds: [], title: 'ROWBOX' } as any, ['bane'])).toBe(true)
    await act(async () => { notify() })
    const inp = (INPUTS as any[]).find(r => r.type === 'Meeting' && r.date === 'Jul 13' && idsOf(r).join() === 'bane' && r.s === 480)
    expect(inp, 'the Meeting, filed').toBeTruthy()
    const ri = ((DAYS[0] as any).ground || []).findIndex((g: any) => g && g.src === inp.iid)
    expect(ri, 'its row on Monday\'s Ground Programme').toBeGreaterThanOrEqual(0)
    return { inp, ri }
  }
  it('the Board, a Meeting\'s row on the Ground Programme: its end cleared — the start box reads empty, the input all day', async () => {
    const { inp, ri } = await meeting()
    await act(async () => { openScheduler(0); notify() })
    const box = (f: string) => host.querySelector(`#sbBoard [data-bfld="gr:0.${ri}.${f}"]`) as HTMLInputElement
    expect([box('str').value, box('end').value]).toEqual(['08:00', '10:00'])
    await type(box('end'), '')
    expect((INPUTS as any[]).find(r => r.iid === inp.iid).allday, 'saved all day').toBe(true)
    expect(box('str').value, 'its start box, the caret in its end box').toBe('')
  })
  it('the week, the same row: its end cleared — the start cell reads empty', async () => {
    const { inp, ri } = await meeting()
    const c = (f: string) => host.querySelector(`#eWeek .day[data-day="0"] [data-txt="gr:0.${ri}.${f}"]`) as HTMLElement
    expect((c('str').textContent || '').trim()).toBe('08:00')
    await act(async () => { c('end').focus() })
    await act(async () => { c('end').textContent = '' })
    /* Tab on, into another cell of the SAME row: the end is saved and the row is still held */
    const next = [...host.querySelectorAll<HTMLElement>(`#eWeek .day[data-day="0"] [data-txt^="gr:0.${ri}."]`)].find(e => !/\.(str|end)$/.test(e.dataset.txt!))
    expect(next, 'another cell of the row to Tab into').toBeTruthy()
    await act(async () => { next!.focus() })
    expect((INPUTS as any[]).find(r => r.iid === inp.iid).allday, 'saved all day').toBe(true)
    expect((c('str').textContent || '').trim(), 'its start cell').toBe('')
  })
  it('the week, a one-man row: the same', async () => {
    expect(file('2026-07-13', ['bane'])).toBe(true)
    await act(async () => { notify() })
    await act(async () => { cell(0, 'bane', 'str').focus() })
    await act(async () => { cell(0, 'bane', 'str').textContent = '0900' })
    await act(async () => { cell(0, 'bane', 'end').focus() })
    await act(async () => { cell(0, 'bane', 'end').textContent = '' })
    await act(async () => { cell(0, 'bane', 'rmks').focus() })
    expect(store(0)).toEqual(['Ranger all day'])
    expect((cell(0, 'bane', 'str').textContent || '').trim()).toBe('')
  })
})
