/* THE GUARD RAIL'S STEP KR — THE PRESSES AND THE READS ITS RED-FIRST TESTS SHARE (chat A211, 28 Nov 26; the plan
   docs/superpowers/plans/2026-11-27-msq-s1-kr-no-blocks-plan.md §8.1, his D2825, D2836–D2838). Read by
   ui/msq-guard-drops.test.tsx. A plain .ts file on purpose, as test-support/msq-guard-testkit.ts is: it exports helpers,
   never a component, and the code check reads a .tsx file as a component file.

   Each press is the whole sequence on the real controls, as the door files make it (ui/msq-guard-doors.test.tsx and its
   -switch, -bell and -undo twins): a few of their local presses are written once more here, word for word in what they
   press, because those files keep them local. Nothing here changes the app; the belts (the Undo engine for row 13, the
   raw entry) are named so where they are used. */
import { expect } from 'vitest'
import { act, fireEvent } from '@testing-library/react'
import { mem, worlds, signInAs, PID } from './msq-world'
import { $, tid, doing, press, settle, app, goAdmin, typeIn, topPick, note, TRK_WB } from './msq-guard-testkit'
import { HOOKS } from '../engine/hooks'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { UNIT } from '../engine/unitview'
import { DRAWER, setDrawer, BELLLIST, setInpEdit } from '../ui/pops'
import { NOTICES, type Notice } from '../state/notices'
import { requestAccess } from '../state/accounts'
import { pageUnit } from '../state/perms'
import { homeOn, todayIso, units, unitsLoad } from '../state/units'
import { undoState } from '../undo/timeline'
import { CURPAGE } from '../state/view'
import { named } from './msq-guard-testkit'

/* ---- the words a test types, so a read of every store finds them or does not ---- */
export const WORDS = 'KR dropped words'

/** every place the app stores something — the scheduler's store, each squadron's Leave War world, the Tracker's
 *  whiteboard — that holds `needle`, by name; [] when none does ("nothing of it stored on either squadron") */
export function storedAnywhere(needle: string): string[] {
  const out: string[] = []
  for (const [k, v] of Object.entries(mem)) if (String(v).includes(needle)) out.push(`store ${k}`)
  for (const [u, b] of Object.entries(worlds)) for (const k of b.keys()) if (String(b.read(k) ?? '').includes(needle)) out.push(`war ${u} ${k}`)
  for (const k of TRK_WB.keys('tracker' as any)) if (String(TRK_WB.get('tracker' as any, k)).includes(needle)) out.push(`tracker ${k}`)
  return out
}

/** the toasts said since `from` (HOOKS.toast is mocked by the world) */
export const toastsSince = (from: number): string[] => (HOOKS.toast as any).mock.calls.slice(from).map((c: any[]) => String(c[0]))
export const toastCount = (): number => (HOOKS.toast as any).mock.calls.length
/** D2825's "no note": nothing on the note's box, and no "Blocked:" toast said since `from` */
export function noNote(from: number) {
  expect(note(), 'no note').toBe('')
  expect(toastsSince(from).filter(t => t.startsWith('Blocked:')), 'no "Blocked:" toast').toEqual([])
}

/* ---- the Input window with words typed ---- */
/** the Input window opened over the page he is on (its own setter, as its doors open it), then words typed in Remarks */
export async function windowWithWords(x: any, words = WORDS) {
  expect(x, 'the premise: an input to open').toBeTruthy()
  await doing(() => { setInpEdit(x) })
  expect(['inputedit', 'inputdlg'], 'the premise: the Input window counts').toContain(named())
  const box = $('#inpEditRmk') as HTMLTextAreaElement | null
  expect(box, 'the premise: its Remarks box is drawn').not.toBeNull()
  expect(box!.disabled, 'the premise: its Remarks box takes typing').toBe(false)
  await act(async () => { fireEvent.change(box!, { target: { value: words } }) })
  await settle()
  expect(($('#inpEditRmk') as HTMLTextAreaElement).value, 'the premise: the words in the box').toBe(words)
}
/** the words are nowhere: not on any input, not in any store */
export function wordsGone(words = WORDS) {
  expect(INPUTS.filter((r: any) => String(r.remarks ?? '').includes(words)).map((r: any) => r.iid), 'on no input').toEqual([])
  expect(storedAnywhere(words), 'stored nowhere, on either squadron').toEqual([])
}
/** an input of `pid`'s own, filed now on his own squadron through the app's one filing door (one Undo step) */
export async function fileFor(pid: string, type: string, start: string, end = start): Promise<any> {
  const { commitNewInput } = await import('../ui/inputedit')
  const had = new Set(INPUTS)
  await doing(() => {
    expect(commitNewInput({ allday: true, half: '', sTime: '', eTime: '', remarks: '', sans: null, docIds: [], person: pid, type, start, end } as any), `the premise: ${type} filed for ${pid}`).toBe(true)
  })
  const x = INPUTS.find((r: any) => !had.has(r))
  expect(x, 'the premise: the filing is in the list').toBeTruthy()
  return x
}

/* ---- the pick ---- */
/** the ☰ menu's list: ☰ opened (its own setter, as the menu button does), the list's button, then the row */
export async function drawerPick(u: string) {
  if (!DRAWER) await doing(() => setDrawer(true))
  await press($('#drawerSqnBtn'), 'the ☰ menu\'s squadron button')
  await press($(`#drawerSqnList .sqm-row[data-unit="${u}"]`), `the ☰ menu's row of ${u}`)
}
/** a control reached BY THE KEYS (the Tracker's shade covers the bar, so the keyboard is the way to it): focused, Enter
 *  pressed, and the click a browser sends for it (jsdom has no hit-testing: the shade stops no event here, the focus and
 *  the key are what a person would use) */
export async function keyPress(el: Element | null, what: string) {
  expect(el, `${what} is drawn`).not.toBeNull()
  await act(async () => {
    ;(el as HTMLElement).focus()
    fireEvent.keyDown(el!, { key: 'Enter' }); fireEvent.click(el!); fireEvent.keyUp(el!, { key: 'Enter' })
  })
  await settle()
}
export async function topPickByKeys(u: string) {
  await keyPress($('#sqnMenuBtn'), 'the top bar\'s squadron button')
  await keyPress($(`#sqnMenu .sqm-row[data-unit="${u}"]`), `the row of ${u}`)
}

/* ---- the view switch ---- */
export async function badge() { await press($('#roleBadge'), 'the name badge') }
export async function drawerRole() {
  if (!DRAWER) await doing(() => setDrawer(true))
  await press($('#drawerRole'), 'the ☰ menu\'s switch')
}

/* ---- the bell (the lines are made here and put in his bell — the tap is what is tested: ui/msq-guard-doors-bell.test.tsx's way) ---- */
let seq = 0
export function line(to: string, u: string | undefined, part: any, extra: Partial<Notice> = {}): Notice {
  const n: any = { id: 'krl' + (++seq), to, by: null, at: Date.now(), iid: '', name: '', day: '2026-07-15', what: [part], ...extra }
  if (u !== undefined) n.u = u
  return n as Notice
}
/** an input of a squadron (its first-named man's squadron today) */
export const of = (unit: string) => INPUTS.find((r: any) => r.person && (PEOPLE as any)[r.person] && homeOn(String(r.person), todayIso()) === unit) as any
export const inputLine = (to: string, u: string, inp: any): Notice => line(to, u, { k: 'in' }, { iid: String(inp.iid), name: 'x' })
/** his own SANS reminder, as his bell works it out (no squadron on it) */
export const sansReminder = (to: string) => line(to, undefined, { k: 'sansdue', days: ['2026-07-17'], from: '2026-07-17' }, { name: 'Your SANS availability', day: '2026-07-17' })
export async function bellOpen() {
  if (!BELLLIST) await press($('#notifyBell'), 'the bell')
  expect(BELLLIST, 'the premise: the bell\'s list is open').toBe(true)
}
/** the line put in his bell, the bell pressed, then the line */
export async function tapLine(n: Notice) {
  if (!NOTICES.includes(n)) NOTICES.push(n)
  await doing(() => {})
  await bellOpen()
  expect(tid(`bell-line-${n.id}`), 'the premise: the line is drawn in his bell').not.toBeNull()
  await press(tid(`bell-line-${n.id}`), 'the line')
}
/** a request for access to `unit`, which lights the bell of its admins */
export function askAccess(unit: string) {
  signInAs('newface@mail')
  expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, unit), 'the premise: the request made').toBeNull()
}
/** a holiday's line made as the app makes it (the bell file's holidayLine, word for word in what it does): a Duty of
 *  another 142 man on Fri 17 Jul, the day then made a public holiday on 142's list by Hunter; the list it opens by itself
 *  put away. Made while 142 is in view. */
export async function holidayLine(): Promise<Notice> {
  const [{ commitNewInput }, { holidayAdd }, { setOilList }] = await Promise.all([
    import('../ui/inputedit'), import('../leavewar/state/store'), import('../ui/pops'),
  ])
  for (let i = NOTICES.length - 1; i >= 0; i--) if ((NOTICES[i].what?.[0] as any)?.k === 'oilhol') NOTICES.splice(i, 1)
  const man = Object.keys(PEOPLE).find(id => { const p = (PEOPLE as any)[id]; return !p.special && !p.archived && id !== PID.hunter && id !== PID.ranger && id !== PID.saber && homeOn(id, todayIso()) === 'u142' })!
  await doing(() => {
    expect(commitNewInput({ allday: true, half: '', sTime: '', eTime: '', remarks: '', sans: null, docIds: [], person: man, type: 'Duty', start: '2026-07-17', end: '2026-07-17' } as any), 'the premise: a Duty on the Friday').toBe(true)
    expect(holidayAdd({ kind: 'ph', name: 'National Day', from: '2026-07-17', to: '2026-07-17' } as any).ok, 'the premise: the Friday made a holiday').toBe(true)
  })
  await doing(() => { setOilList(null) })
  const n = NOTICES.find(x => x.to === PID.hunter && (x.what?.[0] as any)?.k === 'oilhol')
  expect(n, 'the premise: the holiday\'s line on his bell').toBeTruthy()
  NOTICES.splice(NOTICES.indexOf(n!), 1)
  return n!
}

/* ---- the Undo (ui/msq-guard-doors-undo.test.tsx's presses, as they press) ---- */
export const hasUnit = (id: string) => { unitsLoad(); return units().some(u => u.id === id) }
/** Saber makes 151 by "+ New squadron" on Admin → Squadrons, saved by its own Save, then picks it from the top bar */
export async function saberOn151(): Promise<string> {
  await app('saber')
  await goAdmin('Squadrons')
  await press($('#sqNew'), '+ New squadron')
  await typeIn('#sqNewNum', '151')
  const admin = [...document.querySelectorAll<HTMLOptionElement>('#sqNewAdmin option')].find(o => o.value)
  expect(admin, 'the premise: a first admin to pick').toBeTruthy()
  await typeIn('#sqNewAdmin', admin!.value)
  await press($('#sqNewSave'), 'Save')
  unitsLoad()
  const made = units().find(u => u.num === '151')
  expect(made, 'the premise: 151 made').toBeTruthy()
  expect(undoState().undoLabel, 'the premise: the newest step is "+ New squadron"').toBeTruthy()
  await topPick(made!.id)
  expect(UNIT, 'the premise: 151 in view').toBe(made!.id)
  return made!.id
}
/** Ranger, 142's member with View of 149, with his own leave filed on 142 (an Undo step on his own Inputs) and 149 picked;
 *  `first` files another input of his BEFORE it (so the leave is the newest step) and is handed back with it */
export async function rangerFiledThen149(first = false): Promise<{ leave: any; other: any }> {
  await app('ranger')
  const other = first ? await fileFor(PID.ranger, 'LL', '2026-07-29') : null
  const leave = await fileFor(PID.ranger, 'LL', '2026-07-27')
  await topPick('u149')
  expect([UNIT, CURPAGE], 'the premise: 149\'s View-only Sched').toEqual(['u149', 'viewsched'])
  expect(undoState().canUndo, 'the premise: his own page\'s step is his to undo from here').toBe(true)
  return { leave, other }
}
/** his own pages' squadron, today */
export const ownNow = () => pageUnit('own', todayIso())
