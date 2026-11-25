// @vitest-environment jsdom
/* THE BUTTONS ON ONE MAN'S HELD ROW (the fresh, blind Fable scenario designer's S1, S2, S5, S7, S11 — 25 Nov 26, chat
   178; each reproduced here before it was believed: S1, S2, S5 and S11 red on the branch as chat 177 left it, S7's arm
   red at the schedule's own after-change check). sharedrow-board.test.tsx pins the row's three text boxes; this pins
   every BUTTON on the same row. After his first change gave Ranger an input of his own, the row — held back from
   repainting while the caret is in its section, as it stays on an iPhone when a button is tapped — still carried the
   SHARED input's id on its type label (the door to the input's window, its Type and its Delete), its Reject, its LATE
   chip and its puck: the label opened HEX's leave, Reject sent HEX's duty back, the chip hid HEX's mark, and the armed
   puck was dropped without a word. And a time typed again as it already stood ("0800" over 08:00) cut him out for
   nothing. Ranger is `bane`, Hex `rocky`; Monday 13 Jul 26 is day 0 of the demo week. */
import { beforeAll, beforeEach, afterEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, setSession } from '../state/store'
import { histInit } from '../state/history'
import { DAYS } from '../engine/data'
import { PEOPLE, isSpecial } from '../engine/people'
import { INPUTS, idsOf } from '../engine/inputs'
import { armTargetExists } from '../engine/slots'
import { SCHED } from '../engine/publish'
import { commandStream } from '../command'
import * as view from '../state/view'
import { DPREV, setPage, setBoardDay, PIOPEN } from '../state/view'
import { openScheduler } from './board'
import { commitInput } from './inputedit'
import { INPEDIT, setInpEdit } from './pops'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
let root: Root, host: HTMLDivElement, seed: any
const NAME: Record<string, string> = { bane: 'Ranger', rocky: 'Hex' }
const mine = (type: string) => INPUTS.filter((r: any) => r.type === type && r.date === 'Jul 13' && idsOf(r).some((p: string) => p in NAME)) as any[]
const say = (rs: any[]) => rs.map(r => `${idsOf(r).map((p: string) => NAME[p] || PEOPLE[p]?.cs || p).join('+')} ${r.allday ? 'allday' : `${r.s}-${r.e}`} "${r.remarks || ''}"`).sort()
const file = (type: string, timed = true) => commitInput(null, { type, allday: !timed, half: '', start: '2026-07-13', end: '', sTime: timed ? '08:00' : '', eTime: timed ? '10:00' : '', remarks: '', sans: null, docIds: [] }, ['bane', 'rocky'])
const own = (type: string) => mine(type).find(r => idsOf(r).length === 1 && idsOf(r)[0] === 'bane')
const hex = (type: string) => mine(type).find(r => idsOf(r).length === 1 && idsOf(r)[0] === 'rocky')

beforeAll(() => { initStore(); seed = structuredClone({ d: DAYS, i: INPUTS, s: SCHED }) })
beforeEach(async () => {
  DAYS.splice(0, DAYS.length, ...structuredClone(seed.d))
  INPUTS.splice(0, INPUTS.length, ...structuredClone(seed.i))
  Object.keys(SCHED).forEach(k => delete (SCHED as any)[k])
  Object.assign(SCHED, structuredClone(seed.s))
  DPREV.clear(); PIOPEN.clear(); setBoardDay(null); setInpEdit(null); view.disarmSlot()
  setSession({ user: 'a', role: 'admin' }); setPage('viewsched'); histInit()
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setPage('editsched'); notify() })
})
afterEach(async () => {
  await act(async () => { (document.activeElement as HTMLElement)?.blur(); await new Promise(r => setTimeout(r, 20)); root.unmount() })
  host.remove()
})
const click = async (el: Element) => { await act(async () => { el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })) }) }
/* the row: the nearest box around his start that also holds the row's label, and only his boxes */
function rowOf(box: HTMLElement, startSel: string): HTMLElement {
  let row: HTMLElement | null = box.parentElement
  while (row && !row.querySelector('[data-inpedit]')) row = row.parentElement
  expect(row, 'his row').toBeTruthy()
  expect(row!.querySelectorAll(startSel).length, 'one man\'s row only').toBe(1)
  return row!
}
/* the shared input filed, the Board opened — Ranger's start box, found by the address the row is drawn with */
async function onBoard(type: string, timed = true) {
  expect(file(type, timed)).toBe(true)
  await act(async () => { notify() })
  const all = mine(type); expect(all, 'one shared input').toHaveLength(1)
  const iid = all[0].iid as string
  await act(async () => { openScheduler(0); notify() })
  const str = host.querySelector(`#sbBoard [data-ifld="${iid}~bane.str"]`) as HTMLInputElement
  expect(str, 'Ranger\'s start box on the board').toBeTruthy()
  return { iid, str, row: rowOf(str, '[data-ifld$=".str"]') }
}
/* …and split by a typed start, the caret left in the box: the section is held and the row keeps the shared address */
async function splitOnBoard(type: string, timed = true) {
  const b = await onBoard(type, timed)
  await act(async () => { b.str.focus() })
  await act(async () => { b.str.value = '0900'; b.str.dispatchEvent(new Event('change', { bubbles: true })) })
  expect(b.str.isConnected && document.activeElement === b.str, 'the caret still in his held box').toBe(true)
  expect(own(type), 'Ranger has an input of his own').toBeTruthy()
  expect(hex(type), 'Hex is alone on the first').toBeTruthy()
  expect(hex(type)!.iid, 'the held row still names the shared input, now Hex\'s alone').toBe(b.iid)
  return b
}

describe('the Scheduler Board: the buttons on Ranger\'s held row act on HIS input, never Hex\'s', () => {
  it('S1 — the type label opens Ranger\'s own leave', async () => {
    const { row } = await splitOnBoard('LL')
    await click(row.querySelector('[data-inpedit]')!)
    expect(INPEDIT, 'the input window is open').toBeTruthy()
    expect(idsOf(INPEDIT), 'on Ranger\'s leave, not Hex\'s').toEqual(['bane'])
    expect(INPEDIT.iid).toBe(own('LL')!.iid)
  })
  it('…and while he is still in the shared leave it opens the whole input, as before (D748)', async () => {
    const { row, iid } = await onBoard('LL')
    await click(row.querySelector('[data-inpedit]')!)
    expect(INPEDIT?.iid, 'the shared leave').toBe(iid)
    expect(idsOf(INPEDIT).slice().sort(), 'both men').toEqual(['bane', 'rocky'])
  })
  it('S11 — the LATE chip hides Ranger\'s mark, not Hex\'s', async () => {
    const { row } = await splitOnBoard('LL')
    const chip = row.querySelector('[data-lateoff]')
    expect(chip, 'his row wears the LATE chip').toBeTruthy()
    expect([view.lateShown(own('LL')), view.lateShown(hex('LL'))], 'both shown before').toEqual([true, true])
    await click(chip!)
    expect([view.lateShown(own('LL')), view.lateShown(hex('LL'))], 'Ranger\'s hidden, Hex\'s as it was').toEqual([false, true])
  })
  it('S2 — Reject on his row of a shared overseas duty takes HIS out of Unavailable; Hex\'s stays', async () => {
    const { row } = await splitOnBoard('OD', false)
    const rej = row.querySelector('[data-acc="x"]')
    expect(rej, 'his row carries Reject').toBeTruthy()
    expect([own('OD')!.acc ?? '', hex('OD')!.acc ?? ''], 'both under Unavailable by their kind').toEqual(['', ''])
    await click(rej!)
    expect([own('OD')!.acc ?? '', hex('OD')!.acc ?? ''], 'Ranger\'s parked, Hex\'s where it was').toEqual(['r', ''])
  })
  it('S7 — his puck tapped stays armed through the schedule\'s own check, and the name tapped next takes HIS place', async () => {
    const { iid, row } = await splitOnBoard('LL')
    const seat = row.querySelector(`[data-inpseat="${iid}~bane"]`)
    expect(seat, 'his puck\'s seat').toBeTruthy()
    await click(seat!)
    expect(String(view.armedKey()), 'armed on his row').toBe(`iu:${iid}~bane`)
    expect(armTargetExists(view.armedKey()), 'the row it is armed on still stands for an input — his own').toBe(true)
    await act(async () => { view.afterSchedMutate(); notify() })   // the check every change to the schedule runs
    expect(String(view.armedKey()), 'still armed').toBe(`iu:${iid}~bane`)
    const name = [...host.querySelectorAll('.rpuck[data-person]')].find(e => { const p = (e as HTMLElement).dataset.person!; return !!PEOPLE[p] && !isSpecial(p) && p !== 'bane' && p !== 'rocky' })
    expect(name, 'a name on the crew list').toBeTruthy()
    const who = (name as HTMLElement).dataset.person!
    await click(name!)
    /* every timed leave of that Monday: Hex's as it was, and Ranger's own 09:00 now the tapped man's */
    const cs = PEOPLE[who]?.cs || who
    const timed = say((INPUTS as any[]).filter(r => r.type === 'LL' && r.date === 'Jul 13' && !r.allday && (r.s === 480 || r.s === 540)))
    expect(timed, 'Hex alone on his, nobody swapped in; the name tapped on Ranger\'s own').toEqual([`${cs} 540-600 ""`, 'Hex 480-600 ""'].sort())
  })
  /* THE CODE READS' SECOND FINDING (the fresh Opus reader's F2 and the fresh Fable reader's F2, each blind, 25 Nov 26):
     the arm now outlives the repaint of his row — and wore no ring after it. The row is repainted with his OWN input's
     address, the ring was drawn by comparing that with the armed key letter for letter, so nothing on the Board was
     ringed while the crew list still planted on his leave; a second tap on his puck did not put it down either. */
  it('S7b — the arm keeps its ring once his row repaints with its own address, and a second tap puts it down', async () => {
    const { iid, row } = await splitOnBoard('LL')
    await click(row.querySelector(`[data-inpseat="${iid}~bane"]`)!)
    const ringed = () => [...host.querySelectorAll<HTMLElement>('#sbBoard [data-inpseat].armed')].map(e => e.dataset.inpseat)
    expect(ringed(), 'ringed on the held row').toEqual([`${iid}~bane`])
    await act(async () => { (document.activeElement as HTMLElement)?.blur(); notify() })   // the caret leaves: his row repaints
    await act(async () => { view.afterSchedMutate(); notify() })
    const mineId = own('LL')!.iid as string
    expect(host.querySelector(`#sbBoard [data-inpseat="${mineId}"]`), 'his row now carries his own input\'s address').toBeTruthy()
    expect(armTargetExists(view.armedKey()), 'still armed').toBe(true)
    expect(ringed(), 'the one ring, on HIS row').toEqual([mineId])
    await click(host.querySelector(`#sbBoard [data-inpseat="${mineId}"]`)!)
    expect(String(view.armedKey()), 'tapped again: put down').toBe('')
  })
  it('S5 — the same time typed again cuts nothing and records nothing', async () => {
    const { str } = await onBoard('LL')
    const n = commandStream().length
    await act(async () => { str.focus() })
    await act(async () => { str.value = '0800'; str.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(say(mine('LL')), 'one leave, both men').toEqual(['Ranger+Hex 480-600 ""'])
    expect(commandStream().length - n, 'no change recorded').toBe(0)
    /* and a real change after it still gives him his own */
    await act(async () => { str.value = '0900'; str.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(say(mine('LL'))).toEqual(['Hex 480-600 ""', 'Ranger 540-600 ""'])
  })
  it('S5 — an all-day shared leave: a cleared start box left empty cuts nothing', async () => {
    const { str } = await onBoard('LL', false)
    await act(async () => { str.focus() })
    await act(async () => { str.value = ''; str.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(say(mine('LL')), 'one leave, both men, still all day').toEqual(['Ranger+Hex allday ""'])
  })
})

describe('Edit Schedule\'s week: the same doors on Ranger\'s held row', () => {
  const cellOf = (iid: string, f: string) => host.querySelector(`#eWeek .day[data-day="0"] [data-inp="${iid}~bane.${f}"]`) as HTMLElement
  async function splitOnWeek(type: string, timed = true) {
    expect(file(type, timed)).toBe(true)
    await act(async () => { notify() })
    const iid = mine(type)[0].iid as string
    const str = cellOf(iid, 'str'); expect(str, 'Ranger\'s start cell on the week').toBeTruthy()
    await act(async () => { str.focus() })
    await act(async () => { str.textContent = '0900' })
    await act(async () => { cellOf(iid, 'end').focus() })      // Tab on: the start saved, the block still held
    expect(own(type), 'Ranger has an input of his own').toBeTruthy()
    expect(cellOf(iid, 'end'), 'the week\'s row is held, the shared address still on it').toBeTruthy()
    return { iid, row: rowOf(cellOf(iid, 'str'), '[data-inp$=".str"]') }
  }
  it('S1 — the type label opens Ranger\'s own leave', async () => {
    const { row } = await splitOnWeek('LL')
    await click(row.querySelector('[data-inpedit]')!)
    expect(idsOf(INPEDIT), 'on Ranger\'s leave, not Hex\'s').toEqual(['bane'])
  })
  it('S2 — Reject on his row of a shared overseas duty takes HIS out of Unavailable; Hex\'s stays', async () => {
    const { row } = await splitOnWeek('OD', false)
    const rej = row.querySelector('[data-acc="x"]')
    expect(rej, 'his row carries Reject').toBeTruthy()
    await click(rej!)
    expect([own('OD')!.acc ?? '', hex('OD')!.acc ?? ''], 'Ranger\'s parked, Hex\'s where it was').toEqual(['r', ''])
  })
  it('S5 — the same time typed again cuts nothing', async () => {
    expect(file('LL')).toBe(true)
    await act(async () => { notify() })
    const iid = mine('LL')[0].iid as string
    await act(async () => { cellOf(iid, 'str').focus() })
    await act(async () => { cellOf(iid, 'str').textContent = '0800' })
    await act(async () => { cellOf(iid, 'str').dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
    expect(say(mine('LL')), 'one leave, both men').toEqual(['Ranger+Hex 480-600 ""'])
  })
})

/* THE ROLL-CALL, AS A TEST (the bug-check order §8.1): every control on one man's row of a shared input that names the
   input by its BARE id also names its man — so a press on the held row can follow him. A new control drawn on the row
   with the bare id and no man fails here, on the Board and on the week, before it can act on the others' input. */
describe('every control on one man\'s Unavailable row that names the input names its man', () => {
  const bare = (row: HTMLElement, iid: string) => [...row.querySelectorAll('*')].concat(row).flatMap(el =>
    [...(el as HTMLElement).attributes].filter(a => a.name.startsWith('data-') && a.value === iid).map(a => `${a.name}${(el as HTMLElement).dataset.iuw === 'bane' ? ' (names Ranger)' : ' (NO MAN)'}`))
  it('the Board\'s row of a shared, late overseas duty: label, LATE chip and Reject', async () => {
    const { row, iid } = await onBoard('OD', false)
    expect(bare(row, iid).sort()).toEqual(['data-acck (names Ranger)', 'data-inpedit (names Ranger)', 'data-lateoff (names Ranger)'])
  })
  it('the week\'s row of the same: label and Reject (the week\'s LATE mark is not a button)', async () => {
    expect(file('OD', false)).toBe(true)
    await act(async () => { notify() })
    const iid = mine('OD')[0].iid as string
    const str = host.querySelector(`#eWeek .day[data-day="0"] [data-inp="${iid}~bane.str"]`) as HTMLElement
    expect(bare(rowOf(str, '[data-inp$=".str"]'), iid).sort()).toEqual(['data-acck (names Ranger)', 'data-inpedit (names Ranger)'])
  })
})

/* A SHARED OVERSEAS DUTY SENT BACK TO PERSONAL INPUTS IS ONE LINE, AND A TIME TYPED ON IT IS THE INPUT'S — FOR EVERYONE
   (D739, D737, D1393; found by chat 178 while reading the save for Fable's S5). Its one line's boxes name the first man
   drawn (the row's address, as every row of a shared input), and the save asked "is this an activity kind?" where the
   drawing asks "is it listed under Unavailable?" — so an overseas duty, no activity kind, was cut for that one man:
   Hex 09:00 on a duty of his own, Ranger left all day, from a line that shows them both. */
describe('a shared overseas duty rejected out of Unavailable: its one Personal Inputs line changes the input for everyone', () => {
  it('a start typed on the line re-times the duty for both men; nobody is cut out', async () => {
    const { row, iid } = await onBoard('OD', false)
    await click(row.querySelector('[data-acc="x"]')!)          // Reject, on a row not held: the whole input goes back
    expect(mine('OD').map(r => `${idsOf(r).slice().sort().join('+')} ${r.acc || ''}`), 'one duty, both men, parked').toEqual(['bane+rocky r'])
    await act(async () => { PIOPEN.add(0); notify() })
    const str = host.querySelector(`#sbBoard [data-ifld^="${iid}~"][data-ifld$=".str"]`) as HTMLInputElement
    expect(str, 'the line\'s start box under Personal Inputs').toBeTruthy()
    expect(host.querySelectorAll(`#sbBoard [data-ifld^="${iid}"][data-ifld$=".str"]`).length, 'ONE line for the two of them').toBe(1)
    await act(async () => { str.focus() })
    await act(async () => { str.value = '0900'; str.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(mine('OD').map(r => `${idsOf(r).slice().sort().join('+')} ${r.allday ? 'allday' : r.s}`), 'one duty still, both men, from 09:00').toEqual(['bane+rocky 540'])
  })
})
