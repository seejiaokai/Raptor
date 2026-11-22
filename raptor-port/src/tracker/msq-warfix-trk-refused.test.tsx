// @vitest-environment jsdom
/* W3-F4 (the reshape walk of 21 Nov 26, walker W3's W3-03) — A TRACKER SAVE THE GATE REFUSES SAYS SO, AND NEVER "● saved".
   After a man's squadron move the Tracker keeps the squadron it loaded until his next sign-in (the plan §14 item 3;
   tracker/storage.js rebindStorageUnit), and the gate's 7f refuses his changes to it (state/perms.ts trkUnitViolation).
   The walk, as Hunter on Fri 17 Jul in the kept 142 Tracker: a DCO in an event's pop-up was refused with no word; and
   after an Undo, "✓ Save changes" read "● … saved" with nothing stored. Every refused Tracker save now says the app's
   generic "This change could not be saved." (the band's own generic form, state/store.ts bandWords — no ruling gives
   other words), in the Tracker's own box, and the corner never says "saved" for it.
   The refusal here is the gate's own: the Tracker's squadron probe (boot.ts installs it from the doorway's bound unit)
   answers 149's while Hunter, 142's admin, is signed in. Its own file so the Tracker engine boots fresh. */
import { beforeAll, afterAll, afterEach, describe, expect, it } from 'vitest'
import * as core from './app/core.js'
import { storeBackend } from '../engine/hooks'
import { initStore, resetSession, notify } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { setUnitSeeds, unitsLoad } from '../state/units'
import { setTrkUnitProbe } from '../state/perms'

const C: any = core
const NOT_SAVED = 'This change could not be saved.'
const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 500; i++) { if (f()) return; await tick() } throw new Error('timed out waiting for a dialog') }
/* the next box's words, answered */
async function said(v: any = true) { await until(() => C.dlg); const m = C.dlg.msg; C.dlgClose(v); await tick(); return m }
const mem: Record<string, string> = {}
const signInAs = (name: string, pass: string) => { resetSession(sessionFor(signIn(name, pass))); notify() }

let board: HTMLElement
beforeAll(async () => {
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v }, keys: () => Object.keys(mem) } as any
  setUnitSeeds(true)
  initStore(); accountsLoad(); unitsLoad()
  signInAs('ad2', 'a2')                                     // Hunter, 142's admin
  board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
  await C.init()
  await C.whenLoaded()
  if (C.sylDirty) await C.saveChangesClick()
})
afterEach(() => { setTrkUnitProbe(null) })
afterAll(() => { board.remove(); setTrkUnitProbe(null); storeBackend.impl = null })

const flight = () => C.SYL.find((e: any) => e.type === 'flight').id
const gradeOf = (ev: string) => (C.marks[C.active] && C.marks[C.active][ev] && C.marks[C.active][ev].g) || 0
async function grade(ev: string, g: string) { C.openPop(ev, { clientX: 5, clientY: 5 }); await C.popGrade(g); await tick() }

describe('W3-F4 — a Tracker save the gate refuses', () => {
  it('(control) in his own squadron’s Tracker a grade saves, and no box opens', async () => {
    expect(C.active, 'a student to grade').toBeTruthy()
    await grade(flight(), 'dco')
    expect(gradeOf(flight())).toBe('dco')
    expect(C.dlg, 'no box').toBeNull()
    expect(C.saveWords().text).not.toContain(NOT_SAVED)
    await grade(flight(), '0')
    expect(gradeOf(flight())).toBe(0)
  })
  it('a grade in a Tracker that is no longer his squadron’s: nothing stored, the box says "This change could not be saved."', async () => {
    setTrkUnitProbe(() => 'u149')
    const p = grade(flight(), 'dco')
    expect(await said(), 'the refusal is said').toBe(NOT_SAVED)
    await p
    expect(gradeOf(flight()), 'the grade did not land').toBe(0)
    expect(C.saveWords().text, 'the corner never says "● saved"').toBe('● ' + NOT_SAVED)
    expect(C.saveWords().cls).toBe('err')
    expect(C.saveWords().title).toContain(NOT_SAVED)
    expect(C.dlg, 'said once').toBeNull()
  })
  it('✓ Save changes of a chart edit there: the box says it, the corner never reads "saved", the edit stays unsaved', async () => {
    /* a chart edit as the editor makes one (a draft, not yet saved) */
    C.toggleArrange()
    const ev = C.SYL[0], was = ev.name
    ev.name = String(was || '') + ' x'
    ;(window as any).__markDirtyForTests()
    expect(C.sylDirty).toBe(true)
    setTrkUnitProbe(() => 'u149')
    const p = C.saveChangesClick()
    expect(await said()).toBe(NOT_SAVED)
    await p
    expect(C.sylDirty, 'the edit still waits to be saved').toBe(true)
    expect(C.SYL[0].name, 'the edit itself is still on the chart').toBe(String(was || '') + ' x')
    expect(C.saveStat.text, 'never "… saved"').toBe('● ' + NOT_SAVED)
    expect(C.saveStat.cls).toBe('err')
    /* back in his own squadron's Tracker the same press saves */
    setTrkUnitProbe(null)
    await C.saveChangesClick()
    expect(C.sylDirty).toBe(false)
    expect(C.saveStat.text).toMatch(/ saved( \(.*\))?$/)
    expect(C.saveStat.cls).toBe('ok')
    expect(C.dlg).toBeNull()
    /* (the chart put back as it was, for the cases after this one) */
    C.SYL[0].name = was
    ;(window as any).__markDirtyForTests()
    await C.saveChangesClick()
    if (C.arrangeMode) C.toggleArrange()
  })
  it('an Undo there is refused in the same words, and the step stays on the list', async () => {
    await grade(flight(), 'dco')
    expect(C.canUndo()).toBe(true)
    setTrkUnitProbe(() => 'u149')
    const p = C.doUndo()
    expect(await said()).toBe(NOT_SAVED)
    expect(await p).toBe(false)
    expect(gradeOf(flight()), 'the grade stands').toBe('dco')
    expect(C.canUndo()).toBe(true)
    setTrkUnitProbe(null)
    expect(await C.doUndo()).toBe(true)
    expect(gradeOf(flight())).toBe(0)
  })
})
