// @vitest-environment jsdom
/* THE INPUTS CALENDAR'S NOTES AND DAY TITLES BY THE PAGE'S OWN SQUADRON, THROUGH THE PAGE (the reshape plan
   docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §3.2 A-ii "The Inputs calendar" — Astra 6 of round 1; §3.4
   "The planning calendar's one identity", its other direction, and its `pageUnit` rows; §10: "the same through the Inputs
   calendar's page, helper 'own pages' at its last commit").

   A note or a day title is ONE record, `plan/<unit>@pp:<id>` / `plan/<unit>@dm:<iso>`, whichever calendar holds it. The
   Inputs calendar is an own page: it shows, edits and undoes the calendar of `pageUnit('own', today)` — a master admin's
   pick, or a Plan holder's while his Plan holds; anyone else his own squadron's — never simply the schedule picked. The
   store layer's half (the timeline's per-record store) is state/msq-undo-plan-store.test.ts; this drives the page. The
   world: test-support/msq-world.ts. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { switchUnit, forgetUnitPlans, writeInputs, notify } from '../state/store'
import { PLANPUCKS, DAYRMK, addPlanPuck, setDayRemark } from '../state/plan'
import { keptPlan, setPlanStoreDoor } from '../state/plan-foreign'
import { persistWb, wireRows } from '../state/persist'
import { setGrant } from '../state/units'
import { setPage, setInpView, setCalMonth } from '../state/view'
import { Whiteboard } from '../storage/whiteboard'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { _timelineEntries } from '../undo/timeline'
import { globalUndoEngine } from './topstate'
import { HOOKS } from '../engine/hooks'
import { InputsCal } from './InputsCal'
import { commitChipMove } from './caldrag'
import { _resetFloatWins } from './winorder'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

useMsqWorld()

const DAY = '2026-07-20'
let host: HTMLDivElement, root: Root
const $ = (sel: string) => host.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]

/* the saved copy: the app's whiteboard with its row writer wired, as on a built site (state/persist.ts wireRows) */
beforeEach(async () => {
  wireRows(new Whiteboard())
  setPage('inputs'); setInpView('cal')
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
})
afterEach(async () => {
  await act(async () => { root.unmount() })
  host.remove(); _resetFloatWins()
  if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT)
  forgetUnitPlans(); PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  setPlanStoreDoor(() => persistWb())
})

const show = async () => {
  await act(async () => { root.render(<InputsCal fPerson="all" fType="all" fSearch="" />) })
  await act(async () => { setCalMonth({ y: 2026, m: 7 }); notify() })
}
/* a tap on a day: press and lift in one act (inputscal.test.tsx's own rule), then the click a browser follows it with */
const ptr = (type: string) => new PointerEvent(type, { bubbles: true, cancelable: true, clientX: 10, clientY: 10, pointerId: 1, pointerType: 'touch', isPrimary: true })
const openDay = async (iso: string) => {
  const cell = $(`[data-icday="${iso}"]`)
  expect(cell, `the ${iso} cell`).toBeTruthy()
  await act(async () => { cell!.dispatchEvent(ptr('pointerdown')); cell!.dispatchEvent(ptr('pointerup')); cell!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })) })
  expect(document.querySelector('[data-testid="win-inputsday"]'), `the ${iso} day opened`).toBeTruthy()
}
const typeInto = async (el: Element, value: string) => act(async () => {
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
})
const focusOut = async (el: Element) => act(async () => { el.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
const q = (sel: string) => document.querySelector(sel) as HTMLElement | null
/* the opened day's notes, as the screen shows them */
const notesShown = () => [...document.querySelectorAll('[data-testid="win-inputsday"] .ic-poppuck-txt')].map(e => e.textContent)
/* edit one note's words through the day's own pencil and box */
async function editNote(id: string, text: string) {
  const pen = q(`[data-ppedit="${id}"]`)
  expect(pen, 'the note’s pencil').toBeTruthy()
  await act(async () => { pen!.click() })
  const box = q('[data-testid="win-inputsday"] .ic-poppuck-edit')
  expect(box, 'the note’s edit box').toBeTruthy()
  await typeInto(box!, text)
  await focusOut(box!)
}
async function editTitle(text: string) {
  const box = q('#icRmkEdit')
  expect(box, 'the day title box').toBeTruthy()
  await typeInto(box!, text)
  await focusOut(box!)
}

/* a note on the calendar loaded, through the page's own door (writeInputs → addPlanPuck) */
function noteOnLoaded(text: string, iso = DAY): string {
  expect(writeInputs(() => addPlanPuck(iso, text, []))).toBe(true)
  return PLANPUCKS.find((p: any) => p.text === text)!.id
}
/* the top bar's own Undo and Redo (ui/topstate.ts — the press repaints the page); a refusal would be said in a warning */
const warned = () => (HOOKS.toast as any).mock.calls.filter((c: any[]) => c[1] === 'warn').map((c: any[]) => String(c[0]))
async function press(dir: 'undo' | 'redo'): Promise<{ ok: boolean; reason: string[] }> {
  const n = warned().length
  await act(async () => { const e = globalUndoEngine(); expect(dir === 'undo' ? e.canUndo : e.canRedo, `${dir} offered`).toBe(true); if (dir === 'undo') e.undo(); else e.redo() })
  const said = warned().slice(n)
  return { ok: said.length === 0, reason: said }
}
const lastEntry = () => { const es = _timelineEntries(); return es[es.length - 1]! }
const savedRow = (unit: string, local: string): any => { const v = persistWb()!.get('plan', `${unit}@${local}`); return v ? JSON.parse(v) : null }
const kept = (unit: string, id: string): any => keptPlan(unit)?.pucks.find((p: any) => String(p.id) === id) ?? null
const loaded = (id: string): any => PLANPUCKS.find((p: any) => String(p.id) === id) ?? null

/* Hunter, 142's plain admin, holds View of 149 (given by Saber); his note and his day title on 142's calendar, 149 picked */
function hunterViewOn149(): string {
  signInAs('saber')
  expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter)).toMatchObject({ ok: true })
  signInAs('hunter')
  expect(UNIT).toBe('u142')
  const id = noteOnLoaded('Range day')
  expect(writeInputs(() => setDayRemark(DAY, 'Exercise'))).toBe(true)
  switchUnit('u149')
  return id
}
/* Kestrel's note on 149's calendar, and Saber's on 142's */
function bothCalendars(): { n142: string; n149: string } {
  signInAs('kestrel')
  expect(UNIT).toBe('u149')
  const n149 = noteOnLoaded('Brief 149')
  signInAs('saber')
  expect(UNIT).toBe('u142')
  const n142 = noteOnLoaded('Brief 142')
  return { n142, n149 }
}

describe('a 142 plain admin with View of 149 picks 149 — his Inputs calendar stays 142’s', () => {
  it('shows his own calendar’s note and day title, never 149’s', async () => {
    hunterViewOn149()
    await show()
    await openDay(DAY)
    expect(notesShown(), "142's note on his own calendar").toEqual(['Range day'])
    expect((q('#icRmkEdit') as HTMLInputElement).value, "142's day title").toBe('Exercise')
    expect($$(`[data-ichead="${DAY}"] .ic-rmk`).map(e => e.textContent), 'the month shows the title too').toEqual(['Exercise'])
  })

  it('an edit of that note is 142’s note, saved as a change (its before-image the stored note); Undo puts it back, stored and cached; Redo', async () => {
    const id = hunterViewOn149()
    await show()
    await openDay(DAY)
    await editNote(id, 'Range day — moved')
    const c = lastEntry().forward.find(x => x.collection === 'plan')
    expect(c, 'the edit is one change of a planning record').toMatchObject({ op: 'put', id: `u142@pp:${id}` })
    expect((c!.before as any)?.text, 'its before-image is the note as stored — never "created"').toBe('Range day')
    expect([kept('u142', id)?.text, savedRow('u142', `pp:${id}`)?.text]).toEqual(['Range day — moved', 'Range day — moved'])
    expect(loaded(id), "149's calendar never holds it").toBeNull()
    expect(notesShown(), 'the screen shows the edit').toEqual(['Range day — moved'])

    const u = await press('undo')
    expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect([kept('u142', id)?.text, savedRow('u142', `pp:${id}`)?.text], 'the note as it was, stored and cached — never deleted').toEqual(['Range day', 'Range day'])
    expect(notesShown(), 'and on the screen').toEqual(['Range day'])
    /* rewritten by his D2381 (23 Nov 26): 149 he only views offers no Inputs page, so the Undo's landing on his Inputs
       brings 142 back into view (store.ts landOnOfferedPage) — the note 142's all along, now on the calendar loaded */
    expect(UNIT, 'the Undo landing on his Inputs brought 142 back').toBe('u142')
    const r = await press('redo')
    expect(r.ok, JSON.stringify(r.reason)).toBe(true)
    expect(savedRow('u142', `pp:${id}`)?.text).toBe('Range day — moved')
    expect(loaded(id)?.text, 'back on 142, the calendar loaded holds it').toBe('Range day — moved')
    expect(notesShown()).toEqual(['Range day — moved'])
  })

  it('a day title edited there is 142’s title; its Undo puts the title back', async () => {
    hunterViewOn149()
    await show()
    await openDay(DAY)
    await editTitle('Exercise — day 2')
    const c = lastEntry().forward.find(x => x.collection === 'plan')
    expect(c).toMatchObject({ op: 'put', id: `u142@dm:${DAY}`, before: 'Exercise', after: 'Exercise — day 2' })
    expect([keptPlan('u142')?.titles[DAY], savedRow('u142', `dm:${DAY}`)]).toEqual(['Exercise — day 2', 'Exercise — day 2'])
    expect(DAYRMK[DAY], "149's titles untouched").toBeUndefined()
    const u = await press('undo')
    expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect([keptPlan('u142')?.titles[DAY], savedRow('u142', `dm:${DAY}`)]).toEqual(['Exercise', 'Exercise'])
  })

  it('a new note made there lands on 142’s calendar, and its Undo takes it away again', async () => {
    hunterViewOn149()
    await show()
    await openDay(DAY)
    await act(async () => { q('#icAddPuck')!.click() })
    const box = q('[data-testid="win-inputsday"] .ic-newnote .ic-poppuck-edit')
    expect(box, 'the new-note box').toBeTruthy()
    await typeInto(box!, 'Sim block')
    await focusOut(box!)
    const c = lastEntry().forward.find(x => x.collection === 'plan')!
    expect(c.id).toMatch(/^u142@pp:/)
    expect(c.op).toBe('put')
    expect(c.before ?? null, 'a new note').toBeNull()
    expect(keptPlan('u142')!.pucks.filter((p: any) => p.date === DAY).map((p: any) => p.text).sort()).toEqual(['Range day', 'Sim block'])
    expect(PLANPUCKS.length, "nothing on 149's calendar").toBe(0)
    expect(notesShown().sort()).toEqual(['Range day', 'Sim block'])
    const u = await press('undo')
    expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect(notesShown()).toEqual(['Range day'])
  })
})

describe('the same View holder drags his note to another day', () => {
  it('the month’s drop moves 142’s note (ui/caldrag.ts commitChipMove, the drag machine’s one write)', async () => {
    const id = hunterViewOn149()
    await show()
    expect(await act(async () => commitChipMove({ kind: 'puck', pid: id }, DAY, '2026-07-21'))).toBe(true)
    expect(lastEntry().forward.find(x => x.collection === 'plan')).toMatchObject({ op: 'put', id: `u142@pp:${id}` })
    expect([kept('u142', id)?.date, savedRow('u142', `pp:${id}`)?.date]).toEqual(['2026-07-21', '2026-07-21'])
    expect(PLANPUCKS.length, "nothing on 149's calendar").toBe(0)
  })
})

describe('§3.4’s pageUnit rows for the calendar', () => {
  it('a master admin’s pick of 149 moves the calendar to 149’s: its notes shown, an edit 149’s', async () => {
    const { n142, n149 } = bothCalendars()
    switchUnit('u149')
    await show()
    await openDay(DAY)
    expect(notesShown(), "149's calendar").toEqual(['Brief 149'])
    await editNote(n149, 'Brief 149 — 0800')
    expect(lastEntry().forward.find(x => x.collection === 'plan')).toMatchObject({ op: 'put', id: `u149@pp:${n149}` })
    expect(loaded(n149)?.text, "149's calendar loaded").toBe('Brief 149 — 0800')
    expect(kept('u142', n142)?.text, "142's untouched").toBe('Brief 142')
  })

  it('a Plan holder of 149 likewise, while his Plan holds', async () => {
    signInAs('kestrel')
    const n149 = noteOnLoaded('Brief 149')
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter)).toMatchObject({ ok: true })
    signInAs('hunter')
    noteOnLoaded('Range day')
    switchUnit('u149')
    await show()
    await openDay(DAY)
    expect(notesShown(), "149's calendar").toEqual(['Brief 149'])
    await editNote(n149, 'Brief 149 — 0800')
    expect(lastEntry().forward.find(x => x.collection === 'plan')).toMatchObject({ op: 'put', id: `u149@pp:${n149}` })
  })

  it('a 142 member with View of 149 who picks 149 still reads his own calendar’s notes', async () => {
    signInAs('saber')
    noteOnLoaded('Range day')
    expect(setGrant(ACCT.ranger, 'u149', 'view', PID.ranger)).toMatchObject({ ok: true })
    signInAs('kestrel')
    noteOnLoaded('Brief 149')
    signInAs('ranger')
    expect(UNIT).toBe('u142')
    switchUnit('u149')
    await show()
    await openDay(DAY)
    expect(notesShown(), "142's note").toEqual(['Range day'])
  })
})
