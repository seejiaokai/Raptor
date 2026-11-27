// @vitest-environment jsdom
/* THE OIL QUESTION AT THE SIGN-OFF ([FABLE-READ-FAULTS], OIL F2 — his D2294, D2312, D2297, D2299; the drawing of record
   docs/mock/2026-11-22-oil-unanswered-publish/draw-f3.mjs, round 6). A day with an input whose OIL question nobody has
   answered asks it when a scheduler presses any of its four sign-off boxes: the day's open OIL list opens BEFORE the name
   is written; Save writes the answers, then the name; Later writes the name and the next press asks again, until someone
   answers (his D2800 — "not my call"); the answer to an OIL question open when the names were signed, from any door, leaves
   them, on a published day too (his D2801, D2868), and an answer they were signed over that later changes clears them
   (his D2869); the foot's words are his D2859; the list's close button or Escape signs nothing.
   Driven through the door the sign-off box's own handler calls (ui/oilsign.ts signPick — ui/Shell.tsx) and the list's own
   buttons, drawn for real; the press on the real box is walked in the browser (the evidence sheet). The harness is
   leavewar/fableoil-unanswered-publish.test.tsx's. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { SCHED, signOf, signShown, setSign, setDayApproved, dayApproved, dayHasChanges, publishALDay } from '../engine/publish'
import { VCONF } from '../engine/rules'
import { curDraftId, dayDrafts, draftDup, draftSelect } from '../engine/drafts'
import { HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { initStore, writeInputsBatch, notify, undo, redo } from '../state/store'
import { setSession } from '../state/auth'
import { setConflictChecker } from '../command'
import * as view from '../state/view'
import { _resetDisclosure } from '../state/disclosure'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { initStore as lwInitStore, setPeople, setRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { oilOpenOn, wireLeaveWarSync } from '../leavewar/sync'
import * as pops from './pops'
import { OilDayList } from './OilDayList'
import { signPick, signNow } from './oilsign'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, SAT_ISO = '2026-07-18'
const row = (iid: string, person = 'bane'): any => ({ iid, person, type: 'Training', date: 'Jul 18', yr: 2026, allday: false, s: 480, e: 1020, remarks: '', mod: 'now' })
const file = (r: any) => { expect(writeInputsBatch(() => { INPUTS.push(r) })).toBe(true); view.afterSchedMutate() }
const answerOf = (iid: string) => ((INPUTS.find((x: any) => x.iid === iid) as any)?.oil || {})[SAT_ISO]
let said: string[] = []
const realToast = HOOKS.toast
let host: HTMLElement, root: ReturnType<typeof createRoot>
const q = (tid: string) => host.ownerDocument.querySelector(`[data-testid="${tid}"]`) as HTMLElement | null
const click = async (tid: string) => { const b = q(tid); expect(b, tid).not.toBeNull(); await act(async () => { b!.click() }) }
const draw = async () => { await act(async () => { notify() }) }

beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  stashClear()
  setSession({ user: 'ad', role: 'admin' })
  view.selDrop(); view.armDrop(); view.setUnpubArm(null); view.DPREV.clear()
  initStore()
  lwInitStore(memoryBackend()); setPeople(projectPeople()); setRole('admin')
  wireLeaveWarSync()
  _resetDisclosure()
  pops.setOilList(null)
  said = []
  HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  view.setPage('editsched')
  /* the Saturday holds one thing: Bane's Training, its OIL question never answered */
  const d: any = DAYS[SAT]; d.waves = []; d.sims = {}; d.dutywaves = []; d.ground = []; d.notes = []; d.allhands = []
  file(row('fx-train'))
  expect(oilOpenOn(SAT_ISO, SAT_ISO).map(o => o.iid), 'setup: the question is open').toContain('fx-train')
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<OilDayList />) })
})
afterEach(async () => { await act(async () => { root.unmount() }); host.remove(); HOOKS.toast = realToast })

describe('a sign-off pressed on a day with an unanswered OIL question (D2294, D2299)', () => {
  it('holds the name and opens the day’s list — nothing is signed yet', async () => {
    expect(signPick(SAT, 'cur', 'ignite')).toBe('held')
    expect(signOf(SAT).cur, 'the name is not written before the answer').toBeFalsy()
    expect(pops.OILLIST).toMatchObject({ from: SAT_ISO, to: SAT_ISO, hold: { di: SAT, role: 'cur', who: 'ignite' } })
    await draw()
    /* as drawn (round 6): the pressed box itself at the list's top, the name held in it; the words beside it; the foot */
    const held = q('odl-held')!
    expect(held.querySelector('.sgn .k')!.textContent).toBe('CUR CK')
    const cs = String((PEOPLE as any).ignite.cs)
    expect(held.querySelector('.sgn .v')!.textContent).toBe(cs)
    expect(held.querySelector('.sgn select'), 'the held box opens nothing').toBeNull()
    expect(held.textContent).toContain('waiting for your answer')
    expect(q('odl-left')!.textContent).toBe(`Later: ${cs} signs, and the next sign-off asks again`)
    expect(q('odl-lead'), 'no paragraph above the list').toBeNull()
  })

  it('Save writes the answer first, then the name — and the name stands', async () => {
    signPick(SAT, 'cur', 'ignite'); await draw()
    await click('odl-yes-fx-train'); await click('odl-save')
    expect(answerOf('fx-train'), 'the answer is on the input').toBeGreaterThan(0)
    expect(signOf(SAT).cur, 'the held name went in after the answer').toBe('ignite')
    expect(pops.OILLIST).toBeNull()
    /* nothing left to ask: the next box signs at once */
    expect(signPick(SAT, 'sked', 'bane')).toBe('signed')
    expect(signOf(SAT).sked).toBe('bane')
    expect(signOf(SAT).cur, 'and the first name was not cleared by it').toBe('ignite')
  })

  /* his D2800: Later is "not my call" — each next sign-off asks again, until someone answers */
  it('Later signs without an answer, and each next box asks again until someone answers', async () => {
    signPick(SAT, 'cur', 'ignite'); await draw()
    await click('odl-later')
    expect(signOf(SAT).cur).toBe('ignite')
    expect(answerOf('fx-train'), 'no answer was written').toBeUndefined()
    expect(pops.OILLIST).toBeNull()
    for (const [role, who] of [['sked', 'bane'], ['plan', 'stiff']] as const) {
      expect(signPick(SAT, role, who), role).toBe('held')
      await draw(); await click('odl-later')
      expect(signShown(SAT)[role], role).toBe(who)
    }
    /* the last box: management answers it — Yes, then Save — and every name already given stands (his D2800, D2801) */
    expect(signPick(SAT, 'appr', 'pump')).toBe('held')
    await draw(); await click('odl-yes-fx-train'); await click('odl-save')
    expect(answerOf('fx-train'), 'the answer is on the input').toBeGreaterThan(0)
    expect(signShown(SAT)).toMatchObject({ cur: 'ignite', sked: 'bane', plan: 'stiff', appr: 'pump' })
  })

  /* his D2801: any OIL answer, wherever it is given, leaves the names on a day not yet published — here written the
     way the input's own "OIL?" sign and the bell line write it, outside the list */
  it('an answer given away from the list leaves the names already signed', async () => {
    signPick(SAT, 'cur', 'ignite'); await draw(); await click('odl-later')
    signPick(SAT, 'sked', 'bane'); await draw(); await click('odl-later')
    expect(signShown(SAT), 'setup: two signed').toMatchObject({ cur: 'ignite', sked: 'bane' })
    const r: any = INPUTS.find((x: any) => x.iid === 'fx-train')
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 1 } })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT), 'a Yes leaves them').toMatchObject({ cur: 'ignite', sked: 'bane' })
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 0 } })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT), 'a No, after it, leaves them too').toMatchObject({ cur: 'ignite', sked: 'bane' })
    /* …while anything else about the input still takes them down (a change of its times) */
    expect(writeInputsBatch(() => { r.s = 540 })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT), 'a change of the input itself still wipes the sign-offs').toMatchObject({ cur: '', sked: '' })
  })

  /* his D2868 (27 Nov 26): on a PUBLISHED day too, the answer to an OIL question that stood open when the names were
     signed leaves them; the day still shows the change waiting until the amendment goes out (narrows D103, AM11) */
  it('on a published day an answer to a question open at signing leaves the names, and the change still waits', () => {
    for (const [role, who] of [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']] as const) setSign(SAT, role, who)
    setDayApproved(SAT, true)
    expect(dayApproved(SAT), 'setup: the Saturday is published').toBe(true)
    setSign(SAT, 'cur', 'ignite'); setSign(SAT, 'sked', 'bane')
    expect(signShown(SAT), 'setup: two signed for the next issue').toMatchObject({ cur: 'ignite', sked: 'bane' })
    expect(dayHasChanges(SAT), 'setup: nothing waiting yet').toBe(false)
    const r: any = INPUTS.find((x: any) => x.iid === 'fx-train')
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 1 } })).toBe(true); view.afterSchedMutate()
    expect(dayHasChanges(SAT), 'the answer is a change waiting to go out').toBe(true)
    expect(signShown(SAT), 'and the names signed over the open question stand').toMatchObject({ cur: 'ignite', sked: 'bane' })
    /* …while anything else changing on the input still takes them down (D103) */
    expect(writeInputsBatch(() => { r.s = 540 })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT), 'a change of the input itself still wipes them').toMatchObject({ cur: '', sked: '' })
    expect(writeInputsBatch(() => { r.s = 480 })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT), 'put back, they return (AM11)').toMatchObject({ cur: 'ignite', sked: 'bane' })
  })

  /* his D2868 through the list itself: three press Later on the published day's amendment, the last answers and Saves */
  it('on a published day the last box’s answer leaves the three Later names', async () => {
    for (const [role, who] of [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']] as const) setSign(SAT, role, who)
    setDayApproved(SAT, true)
    expect(writeInputsBatch(() => { INPUTS.push(row('fx-late', 'stiff')) })).toBe(true); view.afterSchedMutate()
    expect(dayHasChanges(SAT), 'setup: a Training filed on the published day waits').toBe(true)
    for (const [role, who] of [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff']] as const) {
      expect(signPick(SAT, role, who), role).toBe('held'); await draw(); await click('odl-later')
    }
    expect(signPick(SAT, 'appr', 'pump')).toBe('held')
    await draw(); await click('odl-yes-fx-late'); await click('odl-no-fx-train'); await click('odl-save')
    expect(signShown(SAT), 'all four stand').toMatchObject({ cur: 'ignite', sked: 'bane', plan: 'stiff', appr: 'pump' })
    expect(dayHasChanges(SAT), 'the amendment still waits to go out').toBe(true)
  })

  /* his D2869 (27 Nov 26): an answer CHANGED after a name was signed clears the names signed over it — on a day not yet
     published as on a published one; put back, they return (AM11) */
  it('an answer changed after signing clears the names signed over it; put back, they return', () => {
    const r: any = INPUTS.find((x: any) => x.iid === 'fx-train')
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 0 } })).toBe(true); view.afterSchedMutate()
    expect(signPick(SAT, 'cur', 'ignite'), 'answered: nothing to ask').toBe('signed')
    expect(signPick(SAT, 'sked', 'bane')).toBe('signed')
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 1 } })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT), 'the No they signed over became a Yes').toMatchObject({ cur: '', sked: '' })
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 0 } })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT), 'the No put back').toMatchObject({ cur: 'ignite', sked: 'bane' })
    expect(writeInputsBatch(() => { delete r.oil })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT), 'an answer taken away is a change too').toMatchObject({ cur: '', sked: '' })
  })
  it('a changed answer on a published day clears the names signed over it', () => {
    const r: any = INPUTS.find((x: any) => x.iid === 'fx-train')
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 1 } })).toBe(true); view.afterSchedMutate()
    for (const [role, who] of [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']] as const) setSign(SAT, role, who)
    setDayApproved(SAT, true)
    setSign(SAT, 'cur', 'ignite'); setSign(SAT, 'sked', 'bane')
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 0 } })).toBe(true); view.afterSchedMutate()
    expect(dayHasChanges(SAT)).toBe(true)
    expect(signShown(SAT), 'they signed over the Yes').toMatchObject({ cur: '', sked: '' })
  })
  /* the two side by side: one input answered when the names were given, one left open */
  it('two inputs: answering the open one leaves the names, changing the answered one clears them', () => {
    file(row('fx-meet', 'stiff'))
    const a: any = INPUTS.find((x: any) => x.iid === 'fx-train'), b: any = INPUTS.find((x: any) => x.iid === 'fx-meet')
    expect(writeInputsBatch(() => { a.oil = { [SAT_ISO]: 1 } })).toBe(true); view.afterSchedMutate()
    setSign(SAT, 'cur', 'ignite'); setSign(SAT, 'sked', 'bane')
    expect(writeInputsBatch(() => { b.oil = { [SAT_ISO]: 1 } })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT), 'the open one answered').toMatchObject({ cur: 'ignite', sked: 'bane' })
    expect(writeInputsBatch(() => { b.oil = { [SAT_ISO]: 0 } })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT), 'and answered again: still not an answer they signed over').toMatchObject({ cur: 'ignite', sked: 'bane' })
    expect(writeInputsBatch(() => { a.oil = { [SAT_ISO]: 0 } })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT), 'the answered one changed').toMatchObject({ cur: '', sked: '' })
  })

  /* Astra's red-team read, finding 1, and the fresh Opus read's F3 (27 Nov 26): a Logic value changed after the names were
     given moved nothing while the question was open — and the answer then made the change "move" someone's OIL, so the
     names fell on an answer. The Logic check now reads the answers as they stood at signing. */
  it('a Logic value changed after signing, then an answer to the open question: the names stand', () => {
    const was = VCONF.oilFullMin
    try {
      setSign(SAT, 'cur', 'ignite'); setSign(SAT, 'sked', 'bane')
      VCONF.oilFullMin = 600; view.afterSchedMutate()
      expect(signShown(SAT), 'nobody earns from an open question: nothing moved').toMatchObject({ cur: 'ignite', sked: 'bane' })
      const r: any = INPUTS.find((x: any) => x.iid === 'fx-train')
      expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 1 } })).toBe(true); view.afterSchedMutate()
      expect(signShown(SAT), 'the answer leaves them').toMatchObject({ cur: 'ignite', sked: 'bane' })
    } finally { VCONF.oilFullMin = was }
  })
  it('…while a Logic value that moves OIL the names were signed over still clears them', () => {
    const was = VCONF.oilFullMin
    try {
      const r: any = INPUTS.find((x: any) => x.iid === 'fx-train')
      expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 1 } })).toBe(true); view.afterSchedMutate()
      setSign(SAT, 'cur', 'ignite'); setSign(SAT, 'sked', 'bane')
      VCONF.oilFullMin = 600; view.afterSchedMutate()
      expect(signShown(SAT), 'a full day became a half').toMatchObject({ cur: '', sked: '' })
      VCONF.oilFullMin = was; view.afterSchedMutate()
      expect(signShown(SAT), 'put back, they return').toMatchObject({ cur: 'ignite', sked: 'bane' })
    } finally { VCONF.oilFullMin = was }
  })

  /* the fresh Opus red-team read, F5 (27 Nov 26): Save writes the answers BEFORE the name — so the last signer's own
     answer is one his name was signed over, and a later change to it takes his name down (D2869) while the Later names,
     signed while it was open, stand (D2800) */
  it('the last box answers and Saves; a later change to that answer takes down its name only', async () => {
    for (const [role, who] of [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff']] as const) {
      expect(signPick(SAT, role, who), role).toBe('held'); await draw(); await click('odl-later')
    }
    expect(signPick(SAT, 'appr', 'pump')).toBe('held')
    await draw(); await click('odl-yes-fx-train'); await click('odl-save')
    expect(signShown(SAT), 'setup: four signed').toMatchObject({ cur: 'ignite', sked: 'bane', plan: 'stiff', appr: 'pump' })
    const r: any = INPUTS.find((x: any) => x.iid === 'fx-train')
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 0 } })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT), 'the Yes APPROVED BY signed over became a No').toMatchObject({ cur: 'ignite', sked: 'bane', plan: 'stiff', appr: '' })
    undo(); view.afterSchedMutate()
    expect(answerOf('fx-train'), 'Undo puts the Yes back').toBeGreaterThan(0)
    expect(signShown(SAT), 'and the name with it (AM11)').toMatchObject({ cur: 'ignite', sked: 'bane', plan: 'stiff', appr: 'pump' })
  })

  /* Astra's red-team read, its test inventory: an answer given after the names, taken back by Undo and given again by
     Redo, leaves them standing throughout */
  it('an answer after the names: Undo and Redo leave the names standing', async () => {
    /* signed through the boxes' own door, so the names are steps of the Undo history like any other */
    signPick(SAT, 'cur', 'ignite'); await draw(); await click('odl-later')
    signPick(SAT, 'sked', 'bane'); await draw(); await click('odl-later')
    const r: any = INPUTS.find((x: any) => x.iid === 'fx-train')
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 1 } })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT)).toMatchObject({ cur: 'ignite', sked: 'bane' })
    undo(); view.afterSchedMutate()
    expect(answerOf('fx-train'), 'Undo took the answer away').toBeUndefined()
    expect(signShown(SAT), 'the names stand').toMatchObject({ cur: 'ignite', sked: 'bane' })
    redo(); view.afterSchedMutate()
    expect(answerOf('fx-train'), 'Redo gave it again').toBeGreaterThan(0)
    expect(signShown(SAT), 'the names still stand').toMatchObject({ cur: 'ignite', sked: 'bane' })
  })

  /* …and one input across two weekend days, the first published and the second not: its answer, given after both days'
     names, leaves each day's */
  it('one input over a published Saturday and an unpublished Sunday: its answer leaves both days’ names', () => {
    const SUN = 6, SUN_ISO = '2026-07-19'
    const r: any = INPUTS.find((x: any) => x.iid === 'fx-train')
    expect(writeInputsBatch(() => { r.endDate = 'Jul 19' })).toBe(true); view.afterSchedMutate()
    for (const [role, who] of [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']] as const) setSign(SAT, role, who)
    setDayApproved(SAT, true)
    setSign(SAT, 'cur', 'ignite'); setSign(SUN, 'cur', 'ignite'); setSign(SUN, 'sked', 'bane')
    expect(signShown(SUN), 'setup: Sunday signed').toMatchObject({ cur: 'ignite', sked: 'bane' })
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 1, [SUN_ISO]: 1 } })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT).cur, 'the published Saturday’s name stands').toBe('ignite')
    expect(dayHasChanges(SAT), 'and its answer waits to go out').toBe(true)
    expect(signShown(SUN), 'the Sunday’s names stand').toMatchObject({ cur: 'ignite', sked: 'bane' })
  })

  /* Fable's scenario design, 6 and contradiction 1 (28 Nov 26): an answer given to an open question on a published day
     leaves the Later names; once the amendment carrying it is published, a later CHANGE of that answer must not go out
     on names nobody gave over it. Publishing re-bases the day, so the next amendment is signed afresh — over the
     answer as it then stands. */
  it('after the amendment carrying the answer goes out, changing that answer needs the day signed again', async () => {
    for (const [role, who] of [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']] as const) setSign(SAT, role, who)
    setDayApproved(SAT, true)
    expect(writeInputsBatch(() => { INPUTS.push(row('fx-late', 'stiff')) })).toBe(true); view.afterSchedMutate()
    for (const [role, who] of [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff']] as const) {
      expect(signPick(SAT, role, who), role).toBe('held'); await draw(); await click('odl-later')
    }
    expect(signPick(SAT, 'appr', 'pump')).toBe('held')
    await draw(); await click('odl-yes-fx-late'); await click('odl-yes-fx-train'); await click('odl-save')
    expect(signShown(SAT), 'setup: four stand over the answers').toMatchObject({ cur: 'ignite', sked: 'bane', plan: 'stiff', appr: 'pump' })
    publishALDay(SAT); view.afterSchedMutate()
    expect(dayHasChanges(SAT), 'the amendment went out').toBe(false)
    const r: any = INPUTS.find((x: any) => x.iid === 'fx-late')
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 0 } })).toBe(true); view.afterSchedMutate()
    expect(dayHasChanges(SAT), 'the changed answer waits').toBe(true)
    expect(signShown(SAT), 'and no name stands over it').toMatchObject({ cur: '', sked: '', plan: '', appr: '' })
  })

  /* the two scenario designers' break tests (28 Nov 26 — Astra 7, 25, 26; Fable 8, 9) */
  it('two inputs whose answers swap — the day’s OIL the same in total — still clear the names signed over them', () => {
    file(row('fx-meet', 'stiff'))
    const a: any = INPUTS.find((x: any) => x.iid === 'fx-train'), b: any = INPUTS.find((x: any) => x.iid === 'fx-meet')
    expect(writeInputsBatch(() => { a.oil = { [SAT_ISO]: 1 }; b.oil = { [SAT_ISO]: 0 } })).toBe(true); view.afterSchedMutate()
    setSign(SAT, 'cur', 'ignite'); setSign(SAT, 'sked', 'bane')
    expect(writeInputsBatch(() => { a.oil = { [SAT_ISO]: 0 }; b.oil = { [SAT_ISO]: 1 } })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT)).toMatchObject({ cur: '', sked: '' })
  })
  it('a full day changed to a half day is a changed answer; the same answer saved again is not', () => {
    const r: any = INPUTS.find((x: any) => x.iid === 'fx-train')
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 1 } })).toBe(true); view.afterSchedMutate()
    setSign(SAT, 'cur', 'ignite'); setSign(SAT, 'sked', 'bane')
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 1 } })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT), 'the same answer again').toMatchObject({ cur: 'ignite', sked: 'bane' })
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 0.5 } })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT), 'FO became HO').toMatchObject({ cur: '', sked: '' })
  })
  it('on a published day an answer to an open question saved WITH another change of the input still clears the names', () => {
    for (const [role, who] of [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']] as const) setSign(SAT, role, who)
    setDayApproved(SAT, true)
    setSign(SAT, 'cur', 'ignite'); setSign(SAT, 'sked', 'bane')
    const r: any = INPUTS.find((x: any) => x.iid === 'fx-train')
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 1 }; r.remarks = 'moved to the sim' })).toBe(true); view.afterSchedMutate()
    expect(dayHasChanges(SAT)).toBe(true)
    expect(signShown(SAT), 'the remark is a change of its own (D103)').toMatchObject({ cur: '', sked: '' })
  })

  /* the fresh Fable code read, F2 (28 Nov 26): a request taken off the programme counts for nothing on the day — its
     answer is in neither the signature's key nor the comparison — so a change of its answer must not clear the names */
  it('the answer of a request taken off the programme, changed after signing, leaves the names', () => {
    const r: any = INPUTS.find((x: any) => x.iid === 'fx-train')
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 1 }; r.acc = 'r' })).toBe(true); view.afterSchedMutate()
    setSign(SAT, 'cur', 'ignite'); setSign(SAT, 'sked', 'bane')
    expect(signShown(SAT), 'setup: two signed').toMatchObject({ cur: 'ignite', sked: 'bane' })
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 0 } })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT)).toMatchObject({ cur: 'ignite', sked: 'bane' })
  })

  /* Astra's red-team read of the plan, finding 2 (27 Nov 26): a time emptied behind the open list — the foot must not
     promise a name that Later will be refused */
  it('a time emptied behind the list: no line promises the name; Later signs nothing; the next press asks again', async () => {
    signPick(SAT, 'cur', 'ignite'); await draw()
    expect(q('odl-left')!.textContent).toContain('signs')
    await act(async () => { (DAYS[SAT] as any).allhands = [{ prog: 'WEEKEND BRIEF', str: '0900', end: '' }]; notify() })
    expect(q('odl-left')!.textContent, 'no promise while the name would be refused').toBe('')
    await click('odl-later')
    expect(signShown(SAT).cur, 'refused: nothing signed').toBeFalsy()
    ;(DAYS[SAT] as any).allhands[0].end = '0930'
    expect(signPick(SAT, 'cur', 'ignite'), 'the time typed, the next press asks again').toBe('held')
  })

  /* the foot's words, his D2859 */
  it('the foot: Save’s line once some are picked, none once all are, and the last box’s own line', async () => {
    file(row('fx-meet', 'stiff'))
    const cs = (id: string) => String((PEOPLE as any)[id].cs)
    signPick(SAT, 'cur', 'ignite'); await draw()
    expect(q('odl-left')!.textContent).toBe(`Later: ${cs('ignite')} signs, and the next sign-off asks again`)
    await click('odl-yes-fx-train')
    expect(q('odl-left')!.textContent, 'one of two picked').toBe('Save: the next sign-off asks the rest')
    await click('odl-no-fx-meet')
    expect(q('odl-left')!.textContent, 'every row picked: no line').toBe('')
    await click('odl-later')
    signPick(SAT, 'sked', 'bane'); await draw(); await click('odl-later')
    signPick(SAT, 'plan', 'stiff'); await draw(); await click('odl-later')
    /* the last of the four: no box is left to ask after it */
    signPick(SAT, 'appr', 'pump'); await draw()
    expect(q('odl-left')!.textContent).toBe(`Later: ${cs('pump')} signs, and OIL stays unanswered for now`)
    await click('odl-yes-fx-train')
    expect(q('odl-left')!.textContent, 'the last box, some picked (his D2867)').toBe('Save: the rest stays unanswered for now')
    /* Later after picks still saves none (his D2859) */
    await click('odl-later')
    expect(answerOf('fx-train'), 'Later threw the pick away').toBeUndefined()
    expect(signShown(SAT).appr).toBe('pump')
  })

  it('the list’s close button signs nothing, and the next press on any box asks again', async () => {
    signPick(SAT, 'cur', 'ignite'); await draw()
    const x = host.ownerDocument.querySelector('[data-testid="win-oilday"] .win-x, [data-testid="win-oilday"] [aria-label="Close"]') as HTMLElement
    expect(x, 'the window’s close button').not.toBeNull()
    await act(async () => { x.click() })
    expect(pops.OILLIST).toBeNull()
    expect(signOf(SAT).cur, 'nothing signed').toBeFalsy()
    expect(signPick(SAT, 'sked', 'bane'), 'another box asks again').toBe('held')
    expect(signOf(SAT).sked).toBeFalsy()
    expect(pops.OILLIST).toMatchObject({ hold: { role: 'sked', who: 'bane' } })
  })

  /* Astra's scenario read, F01 (22 Nov 26): the list stays up while the page behind it works (D641), so the day's saved
     plan can be switched under a held name — and each plan owns its own signatures. The hold checked only the date. */
  it('a name held on one saved plan is never written onto another: the plan switched behind the list, Later and Save sign nothing', async () => {
    const planA = curDraftId(SAT)
    signPick(SAT, 'cur', 'ignite'); await draw()
    const b: any = draftDup(SAT)
    expect(b && b.id, 'setup: a second plan, now the live one').toBeTruthy()
    expect(curDraftId(SAT)).not.toBe(planA)
    /* …and the list stops promising it (walker w3's finding 1, 22 Nov 26 — the week changed behind the list: it still
       showed the held box and "Later: Ace signs…", and Later signed nothing): a hold that no longer stands is not drawn */
    await draw()
    expect(q('odl-held'), 'no held box for a hold that will not be written').toBeNull()
    expect(q('odl-left')!.textContent, 'and no promise that Later signs').not.toContain('signs')
    await click('odl-later')
    expect(signOf(SAT).cur, 'Later after the switch signs nothing on the other plan').toBeFalsy()
    expect(pops.OILLIST).toBeNull()
    /* …and the day was not marked asked by a Later that signed nothing: the next press on this plan asks */
    expect(signPick(SAT, 'cur', 'ignite')).toBe('held')
    await draw()
    const live = curDraftId(SAT), other = dayDrafts(SAT).find((x: any) => x.id !== live)
    expect(other, 'setup: the first plan is kept beside the live one').toBeTruthy()
    draftSelect(SAT, other.id); view.afterSchedMutate()
    expect(curDraftId(SAT), 'setup: back on the first plan').not.toBe(live)
    await click('odl-yes-fx-train'); await click('odl-save')
    expect(answerOf('fx-train'), 'the answer is the input’s, whatever the plan').toBeGreaterThan(0)
    expect(signOf(SAT).cur, 'Save after the switch signs nothing on the other plan').toBeFalsy()
  })

  /* The fresh Opus read of the finished code, finding 1 (22 Nov 26): with two inputs listed, Save with one answered
     signed the name, the next box asked again for the other, and ITS answer changed what the first signature was bound
     to — clearing it. Since his D2800 what a Save leaves unpicked is left as Later leaves it: the next box asks the
     rest, and its answer no longer clears the first name. */
  it('Save with one of two answered: the next box asks the rest, and its answer leaves the first name', async () => {
    file(row('fx-meet', 'stiff'))
    signPick(SAT, 'cur', 'ignite'); await draw()
    await click('odl-yes-fx-train'); await click('odl-save')
    expect(signShown(SAT).cur).toBe('ignite')
    expect(signPick(SAT, 'sked', 'bane'), 'the one left is asked at the next box').toBe('held')
    await draw()
    expect(q('odl-yes-fx-train'), 'the answered one has left the list').toBeNull()
    await click('odl-no-fx-meet'); await click('odl-save')
    expect(signShown(SAT), 'both names stand').toMatchObject({ cur: 'ignite', sked: 'bane' })
    expect(answerOf('fx-meet'), 'the No is on the input').toBe(0)
  })
  /* …finding 2: a held press put the box back by reading the stored names through signOf, which CREATES the day's sign
     record — a write to the schedule outside any command (engine/publish.ts signAt's own warning, R2-01), carried off by
     the next unrelated command and its Undo step. */
  it('a held press writes nothing to the schedule’s own record', () => {
    expect(SCHED.sign[SAT], 'setup: nobody has signed this day').toBeUndefined()
    expect(signPick(SAT, 'cur', 'ignite')).toBe('held')
    expect(signNow(SAT, 'cur')).toBe('')
    expect(SCHED.sign[SAT], 'still no sign record for a day nobody signed').toBeUndefined()
  })

  /* Astra's blind read, claim 2 (22 Nov 26; the same line as the Opus read's finding 2): after an answer was taken back
     the box reads unsigned while the record still holds the old name — a held re-pick must put the box back to what it
     SHOWS, or the same name can never be picked again (the native box raises no change for the value it already holds). */
  it('a held re-pick puts the box back to what it shows, not to a name the content has moved under', async () => {
    signPick(SAT, 'cur', 'ignite'); await draw()
    await click('odl-yes-fx-train'); await click('odl-save')
    /* a second input filed, unanswered: a change of the day's OIL that takes the name down (an answer no longer does —
       D2800) */
    await act(async () => { file(row('fx-two', 'stiff')) })
    expect(signShown(SAT).cur, 'setup: the change dropped the name').toBe('')
    expect(signPick(SAT, 'cur', 'ignite')).toBe('held')
    expect(signNow(SAT, 'cur')).toBe('')
  })
  /* Astra's blind read, claim 3: Later promised a signature and "ask no more" together; a refused write (the command
     layer's own refusal) still marked the day as asked, so the next pick signed with no question. */
  it('a Later whose signature is refused does not use up the question', async () => {
    signPick(SAT, 'cur', 'ignite'); await draw()
    try { setConflictChecker(() => 'test refusal'); await click('odl-later') } finally { setConflictChecker(null) }
    expect(signShown(SAT).cur, 'the refused name is not written').toBeFalsy()
    expect(signPick(SAT, 'cur', 'ignite'), 'and the next press still asks').toBe('held')
  })
})

describe('where there is nothing to ask, signing is as it was', () => {
  it('an answered day signs at once; clearing a name never asks', async () => {
    /* clearing: even with the question open */
    expect(signPick(SAT, 'cur', '')).toBe('signed')
    expect(pops.OILLIST).toBeNull()
    const r: any = INPUTS.find((x: any) => x.iid === 'fx-train')
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 0 } })).toBe(true); view.afterSchedMutate()
    expect(signPick(SAT, 'cur', 'ignite')).toBe('signed')
    expect(signOf(SAT).cur).toBe('ignite')
    expect(pops.OILLIST).toBeNull()
  })
  it('a working day’s input asks nothing', () => {
    const WED = 2
    expect(signPick(WED, 'cur', 'ignite')).toBe('signed')
    expect(pops.OILLIST).toBeNull()
  })
})
