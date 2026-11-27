// @vitest-environment jsdom
/* THE OIL QUESTION AT THE SIGN-OFF ([FABLE-READ-FAULTS], OIL F2 — his D2294, D2312, D2297, D2299; the drawing of record
   docs/mock/2026-11-22-oil-unanswered-publish/draw-f3.mjs, round 6). A day with an input whose OIL question nobody has
   answered asks it when a scheduler presses any of its four sign-off boxes: the day's open OIL list opens BEFORE the name
   is written; Save writes the answers, then the name; Later writes the name and the next press asks again, until someone
   answers (his D2800 — "not my call"); an OIL answer, from any door, leaves the names already signed on a day not yet
   published (his D2801); the foot's words are his D2859; the list's close button or Escape signs nothing.
   Driven through the door the sign-off box's own handler calls (ui/oilsign.ts signPick — ui/Shell.tsx) and the list's own
   buttons, drawn for real; the press on the real box is walked in the browser (the evidence sheet). The harness is
   leavewar/fableoil-unanswered-publish.test.tsx's. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { SCHED, signOf, signShown, setSign, setDayApproved, dayApproved } from '../engine/publish'
import { curDraftId, dayDrafts, draftDup, draftSelect } from '../engine/drafts'
import { HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { initStore, writeInputsBatch, notify } from '../state/store'
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

  /* …and his D2801 is of a day NOT YET PUBLISHED: on a published day an answer is a change waiting to go out, and any
     change waiting wipes the sign-offs (D103) */
  it('on a published day an answer still takes the names down', () => {
    for (const [role, who] of [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']] as const) setSign(SAT, role, who)
    setDayApproved(SAT, true)
    expect(dayApproved(SAT), 'setup: the Saturday is published').toBe(true)
    setSign(SAT, 'cur', 'ignite'); setSign(SAT, 'sked', 'bane')
    expect(signShown(SAT), 'setup: two signed for the next issue').toMatchObject({ cur: 'ignite', sked: 'bane' })
    const r: any = INPUTS.find((x: any) => x.iid === 'fx-train')
    expect(writeInputsBatch(() => { r.oil = { [SAT_ISO]: 1 } })).toBe(true); view.afterSchedMutate()
    expect(signShown(SAT)).toMatchObject({ cur: '', sked: '' })
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
    expect(q('odl-left')!.textContent, 'the last box, some picked: no line (the agent’s reading, put to him)').toBe('')
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
