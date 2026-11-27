/* THE GUARD RAIL'S STEP KR-2 — THE CLOSING STEP, ITS WAIT AND ITS CHECKS: WHAT THEIR TESTS SHARE (chat A211, 28 Nov 26; the
   brief docs/superpowers/briefs/2026-11-28-msq-s1-kr2-brief.md, the plan
   docs/superpowers/plans/2026-11-27-msq-s1-kr-no-blocks-plan.md §5 steps 3b, 4, 6, 7, §7). Read by
   ui/msq-guard-closeopen.test.tsx. A plain .ts file on purpose, as test-support/msq-guard-testkit.ts is: it exports helpers,
   never a component (the code check reads a .tsx file as a component file).

   No door is converted in KR-2 (KR-3 and KR-4 do that), so a test that needs a whole door presses one made here of KR-2's
   pieces alone, in the plan's order — `krDoor` below, the shape KR-3 will give the pick — named so wherever it is used. */
import { act, fireEvent } from '@testing-library/react'
import { UNIT } from '../engine/unitview'
import { enterSquadron, notify } from '../state/store'
import { holdNow } from '../state/typing-hold'
import { unitById } from '../state/units'
import { refuse, closeOpen, type GuardOpts } from '../state/guard'
import { saveGoing, waitForSave, dropDoorWait, closeThenEnter } from '../state/doorwait'
import { NO_BLOCK_DOORS } from '../ui/guard'
import { setPage } from '../state/view'
import { setTplEdit } from '../ui/pops'
import { trackerSwitchAskAtDoor } from '../tracker/role.js'
import { $, app, doing, settle, answeringSaver } from './msq-guard-testkit'

/** the door joins the set of doors converted to D2825 for this test only (ui/guard.ts NO_BLOCK_DOORS — empty as shipped);
 *  the test's afterEach empties the set again */
export function noBlock(door: string): void { NO_BLOCK_DOORS.add(door) }
export function noBlockClear(): void { NO_BLOCK_DOORS?.clear?.() }

/** the closing step called as a door calls it, the page settled after; its answer handed back */
export async function closeAll(skip: readonly string[] = []): Promise<boolean> {
  let ok: boolean | null = null
  await act(async () => { ok = closeOpen(skip) })
  await settle()
  return ok as unknown as boolean
}

/** A DOOR MADE OF KR-2'S PIECES ALONE, in the plan's order (§5): 1 a change at all; 2 the guard (with the door in
 *  NO_BLOCK_DOORS: only "Not saved" refuses); 3 a save still going, waited for, then from 1; 4 the Tracker's question, as a
 *  door that goes through asks it (3b and 4 inside it); 5 after it, from 1; 6–8 what is open closed, a save the closing
 *  started waited for, the entry. `door` names the press for the note's ending ('pick' — "…then pick 149.") */
export function krDoor(u: string, opts: GuardOpts = {}, door = 'pick'): void | Promise<void> {
  dropDoorWait()
  const tail = (): void | Promise<void> =>
    closeThenEnter(opts.skip, () => u === UNIT || refuse(door, u, opts), () => { enterSquadron(u, holdNow() === 'war', true); notify() })
  const from = (): void | Promise<void> => {
    if (u === UNIT || refuse(door, u, opts)) return
    if (saveGoing()) return waitForSave().then(r => { if (r === 'go') return from() })
    const ask = trackerSwitchAskAtDoor(String(unitById(u)?.num ?? u))
    if (!ask) return tail()
    return ask.then(go => {
      if (!go || u === UNIT || refuse(door, u, opts)) return
      if (saveGoing()) return waitForSave().then(r => { if (r === 'go') return tail() })
      return tail()
    })
  }
  return from()
}
/** the door pressed inside act, the page settled after. A door that waits hands its promise back inside an object — an
 *  async function handing back the promise itself would wait on it, and the door waits on the saver the test answers */
export async function pressDoor(u: string, opts: GuardOpts = {}, door = 'pick'): Promise<{ wait: void | Promise<void> }> {
  let p: void | Promise<void> = undefined
  await act(async () => { p = krDoor(u, opts, door) })
  await settle()
  return { wait: p }
}

/** Duty templates open on Edit Schedule, "0730" typed in a Start box still focused — a box that saves as it is left */
export async function templateTyped(): Promise<HTMLInputElement> {
  await app('hunter')
  await doing(() => { setPage('editsched'); setTplEdit(true) })
  const box = $('#tplModal .trow input.tm') as HTMLInputElement
  if (!box) throw new Error('the premise: a Start box in Duty templates')
  await act(async () => { box.focus(); fireEvent.focus(box); fireEvent.change(box, { target: { value: '0730' } }) })
  await settle()
  return box
}
/** …and the saver the test answers watching it: the Duty templates' store key written from now on counts as a change made
 *  to the watched saver (a stand-in, named so: in the test world the app's writes go to a memory store no saver sees — the
 *  drops file's templateTypedAndWatched, written once more here as it presses) */
export async function templateTypedAndWatched() {
  await templateTyped()
  const s = answeringSaver()
  const { storeBackend } = await import('../engine/hooks')
  const impl: any = storeBackend.impl
  const set = impl.setItem
  impl.setItem = (k: string, v: string) => { set(k, v); if (k.includes('dutytpl')) s.change() }
  return s
}
