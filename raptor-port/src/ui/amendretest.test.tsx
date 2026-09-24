// @vitest-environment jsdom
/* [HUMAN-RETEST] the amendment system (24 Sep 26) — the gaps the re-test found, each
   pinned through the production functions the screens call. The rules they enforce are
   lines of raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md
   (the AM ids); the walk that found them is raptor-port/docs/handpass/2026-09-24-amendment.md.

   · AM24 — "Not yet signed" shows on the WORKING copy of a published day with unpublished
     changes, never on the issued face. The week's day head drew it; the scheduler board —
     the other working-copy surface of the same day — did not (roll-call R4, walk S5;
     Fable 5-5, Astra F1).
   · AM23 — every count of a day's unpublished changes agrees. The day head counts the
     real difference from the issued version; the ⓘ day panel and the plan-switch message
     counted raw marks, so an OIL-only change read "nothing pending" there while "Publish
     AL1" was offered, and a mark left behind by a round trip read as an edit that is not
     there (walk S3; Fable 5-2, Astra F2).
   · "Discard marks" only ever clears marks on days never published (F-01, Phase 2): it
     was enabled — and said "Pending marks cleared" — when every mark sat on a published
     day and nothing could be cleared (walk S2; Fable 5-1, Astra F3).
   · RESTARM / UNPUBARM are one-shot confirms that "any navigation clears": a page change
     (and so the admin's View-as-member flip, which changes page) left them armed, so the
     second tap after coming back skipped the warning (walk S13; Fable 5-8, Astra rank 33). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { SCHED, signOf, setDayApproved, dayDelta, dayPendCount } from '../engine/publish'
import { acceptInput, unacceptInput } from '../engine/slots'
import { inpId } from '../engine/inputs'
import { ensureRowIds } from '../engine/rowids'
import { validate } from '../engine/validate'
import { HOOKS } from '../engine/hooks'
import { initStore, notify, writeText } from '../state/store'
import { commitPublishALDay } from '../state/sched-commit'
import { setSession } from '../state/auth'
import {
  setPage, DPREV, VWORK, setUnpubArm, unpubArmed, setRestArm, restArmed, setBoardDay,
} from '../state/view'
import { dayHTML, dayInfoHTML, viewDayHTML } from './html'
import { boardSignHTML, switchDraft } from './board'
import { draftDup, dayDrafts, draftSelect, curDraftId } from '../engine/drafts'
import { setOilBlanket } from './oilmode'
import { ALPanel } from './ALPanel'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { WCODE } from '../engine/validate'
import { dayCurVer } from '../engine/publish'
import { loadVersionToWorkingCopy } from '../engine/drafts'
import { sbUnavailPanel } from './board-html'
import { routeClick } from './interactions'
import { DraftsModal } from './DraftsModal'
import { setDraftsEdit, setDayPop } from './pops'
import { DayPop } from './Modals'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const MON = 0, SAT = 5, SAT_ISO = '2026-07-18'
let pristine: any[], inputs0: string
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const publishDay = (di: number) => { sign(di); setDayApproved(di, true) }
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
const weekEdit = (di: number) => { setPage('editsched'); return el(dayHTML(di, true, true)) }
const boardStrip = (di: number) => { setPage('editsched'); return el(boardSignHTML(di)) }
const weekView = (di: number) => { setPage('viewsched'); try { return el(viewDayHTML(di)) } finally { setPage('editsched') } }
/* the ⓘ panel's own "N unpublished edit(s)" chip — the number a scheduler reads there */
const infoCount = (di: number) => {
  const t = el(dayInfoHTML(di)).querySelector('.dip-pend')?.textContent || ''
  return t ? parseInt(t, 10) : 0
}
/* the day head's own "N pending" chip */
const headCount = (di: number) => {
  const t = weekEdit(di).querySelector('.dpend')?.textContent || ''
  return t ? parseInt(t, 10) : 0
}
const withToasts = (fn: () => void) => {
  const said: string[] = []
  const real = HOOKS.toast
  HOOKS.toast = (m: any) => { said.push(String(m)) }
  try { fn() } finally { HOOKS.toast = real }
  return said
}

beforeAll(() => {
  initStore()
  setSession({ user: 'ad', role: 'admin' } as any)
  pristine = JSON.parse(JSON.stringify(DAYS))
  inputs0 = JSON.stringify(INPUTS)
})
beforeEach(() => {
  DAYS.length = 0; JSON.parse(JSON.stringify(pristine)).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(inputs0).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  DPREV.clear(); VWORK.clear()
  setUnpubArm(null); setRestArm(null, null)
  setPage('editsched')
  validate()
})

describe('AM24 — "Not yet signed" is drawn on EVERY working-copy surface of a published day (walk S5)', () => {
  it('the scheduler board carries it whenever the week head does', () => {
    publishDay(MON)
    expect(weekEdit(MON).querySelector('.nysmark'), 'no unpublished change yet → no marker').toBeNull()
    expect(boardStrip(MON).querySelector('.nysmark')).toBeNull()
    writeText(`dn:${MON}.0`, 'A CHANGE AFTER PUBLISHING')
    expect(weekEdit(MON).querySelector('.nysmark'), 'the week head shows it').toBeTruthy()
    expect(boardStrip(MON).querySelector('.nysmark'), 'and so must the board — the same working copy').toBeTruthy()
  })
  it('never on the issued face the squadron sees, and never under a preview of an older version', () => {
    publishDay(MON)
    writeText(`dn:${MON}.0`, 'A CHANGE AFTER PUBLISHING')
    expect(weekView(MON).querySelector('.nysmark'), 'the view page defaults to the issued face').toBeNull()
    VWORK.add(MON)
    expect(weekView(MON).querySelector('.nysmark'), 'the viewer\'s own Working-draft peek does show it').toBeTruthy()
    VWORK.clear()
    /* under a preview the board passes pv (SchedBoard.tsx) and draws no publish strip;
       the week draws the previewed version through withDaySnap, where PV is set */
    DPREV.set(MON, SCHED.orig[MON].id)
    try {
      expect(el(boardSignHTML(MON, true)).querySelector('.nysmark'), 'the board, as SchedBoard calls it under a preview').toBeNull()
    } finally { DPREV.clear() }
  })
})

describe('AM23 — every count of a day\'s unpublished changes agrees with the day head (walk S3)', () => {
  let saved: any
  beforeEach(() => {
    saved = { day: HOOKS.oilEarningDay, iso: HOOKS.oilDayISO }
    HOOKS.oilEarningDay = (di: number) => di === SAT
    HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '')
  })
  afterEach(() => { HOOKS.oilEarningDay = saved.day; HOOKS.oilDayISO = saved.iso })

  it('an OIL-only change: the ⓘ panel counts it, as the head and "Publish AL1" do', () => {
    ;(DAYS[SAT] as any).ground = [{ prog: 'FAMILY DAY', str: '09:00', end: '17:00', who: 'bane' }]
    ensureRowIds(DAYS)
    publishDay(SAT)
    setOilBlanket(SAT, true)                       // the ONLY change: nothing on this day earns
    expect(dayDelta(SAT).length, 'a real difference from the issued version').toBe(1)
    expect(headCount(SAT)).toBe(1)
    expect(infoCount(SAT), 'the ⓘ panel must not say there is nothing unpublished').toBe(1)
  })

  it('a filing round trip that nets to nothing: the ⓘ panel does not count the leftover mark', () => {
    const inp = INPUTS.find((x: any) => x.type === 'Meeting' && x.date === 'Jul 13')!
    /* park it before publishing: the demo's boot lands activity inputs on the programme, so
       it may already be accepted ('g'); either way it ends parked ('r') */
    if (!inp.acc) expect(acceptInput(MON, inp, 'u')).toBe(true)
    expect(unacceptInput(MON, inp)).toBe(true)
    expect(inp.acc).toBe('r')
    publishDay(MON)                                 // the issued version froze the parked state
    expect(acceptInput(MON, inp, 'u')).toBe(true)   // the round trip, after publishing
    expect(unacceptInput(MON, inp)).toBe(true)
    expect(dayDelta(MON).length, 'nothing differs from what was issued').toBe(0)
    expect(dayPendCount(MON), 'a raw mark is left behind (inert, by design)').toBeGreaterThan(0)
    expect(headCount(MON)).toBe(0)
    expect(infoCount(MON), 'so the ⓘ panel must not report an unpublished edit').toBe(0)
  })

  it('switching plans on a published day reports the same number the day head shows', () => {
    ;(DAYS[SAT] as any).ground = [{ prog: 'FAMILY DAY', str: '09:00', end: '17:00', who: 'bane' }]
    ensureRowIds(DAYS)
    publishDay(SAT)
    draftDup(SAT)                                   // Plan A (= the issued day) stowed, Plan B live
    setOilBlanket(SAT, true)                        // Plan B differs ONLY in what the day earns
    const [a] = dayDrafts(SAT)
    const toA = withToasts(() => { switchDraft(SAT, a.id) })
    expect(toA.join(' '), 'back on Plan A: it matches the issued Original').toMatch(/matches ORIG|matches Original|nothing pending/i)
    const b = dayDrafts(SAT).find((t: any) => t.id !== a.id)!
    const toB = withToasts(() => { switchDraft(SAT, b.id) })
    expect(headCount(SAT), 'Plan B carries one real difference').toBe(1)
    expect(toB.join(' '), 'and the switch message must say so, not "nothing pending"').not.toMatch(/nothing pending/i)
    expect(toB.join(' ')).toMatch(/1 difference/)
  })
})

describe('"Discard marks" offers only what it can clear (walk S2)', () => {
  let host: HTMLDivElement, root: Root
  beforeAll(() => { host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host) })
  afterAll(() => { act(() => root.unmount()); host.remove() })
  const render = () => act(() => { root.render(<ALPanel />); notify() })
  const btn = () => host.querySelector('#alDrop') as HTMLButtonElement

  it('is disabled when every mark sits on a published day — it cannot clear those', async () => {
    publishDay(MON)
    writeText(`dn:${MON}.0`, 'A CHANGE AFTER PUBLISHING')
    await render()
    expect(btn().disabled, 'nothing here is discardable: the change is ahead of an issued day').toBe(true)
    expect(host.querySelector('.al-pend')!.textContent).not.toMatch(/unpublished days/i)
  })
  it('clears only the draft day\'s marks when both kinds exist, and says how many', async () => {
    publishDay(MON)
    writeText(`dn:${MON}.0`, 'A CHANGE AFTER PUBLISHING')
    writeText(`dn:2.0`, 'DRAFT WORK ON WEDNESDAY')   // Wednesday was never published
    await render()
    expect(btn().disabled).toBe(false)
    const said = withToasts(() => act(() => { btn().click() }))
    expect(Object.keys(SCHED.pending).some(k => k.startsWith('dn:2.')), 'the draft mark is gone').toBe(false)
    expect(Object.keys(SCHED.pending).some(k => k.startsWith(`dn:${MON}.`)), 'the published day keeps its change').toBe(true)
    expect(said.join(' ')).toMatch(/1\b/)
  })
})

describe('the one-shot confirms clear on any navigation (walk S13)', () => {
  it('a page change drops an armed Unpublish and an armed Load', () => {
    setPage('editsched')
    setUnpubArm(SAT)
    setRestArm(MON, 'x')
    setPage('viewsched')                            // the View-as-member flip lands here too
    setPage('editsched')
    expect(unpubArmed(SAT), 'coming back must ask again before withdrawing OIL').toBe(false)
    expect(restArmed(MON, 'x')).toBe(false)
  })
  it('re-rendering the same page does not drop them (a stay is not a navigation)', () => {
    setPage('editsched')
    setUnpubArm(SAT)
    setPage('editsched')
    expect(unpubArmed(SAT)).toBe(true)
  })
  /* the final code read (Astra #1, 24 Sep 26): a board day change and closing / reopening the board are
     navigation too — the page-change fix above did not reach them, so a confirm armed on Saturday's board
     survived a step to Friday and back and ONE tap then withdrew Saturday's OIL */
  it('a board day change, or closing and reopening the board, drops them too', () => {
    setPage('editsched')
    setBoardDay(SAT); setUnpubArm(SAT); setRestArm(SAT, 'x')
    setBoardDay(SAT)                                // a repaint of the same day is not a navigation
    expect(unpubArmed(SAT)).toBe(true)
    setBoardDay(SAT - 1); setBoardDay(SAT)          // step away and back
    expect(unpubArmed(SAT), 'the step away drops the Unpublish confirm').toBe(false)
    expect(restArmed(SAT, 'x'), 'and the Load confirm').toBe(false)
    setUnpubArm(SAT); setRestArm(SAT, 'x')
    setBoardDay(null); setBoardDay(SAT)             // close the board, reopen it on the same day
    expect(unpubArmed(SAT)).toBe(false)
    expect(restArmed(SAT, 'x')).toBe(false)
    setBoardDay(null)
  })
})

/* ===================================================================== batch 2
   The four walkers' findings (evidence sheet §3, W2-/W4- ids), each red first. */

describe('every check the day can raise has a plain heading (W4-F5)', () => {
  it('no warning shows its internal code as its title', () => {
    const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../engine/validate.ts'), 'utf8')
    const codes = [...new Set([...src.matchAll(/add\('(?:hard|adv|note)','([A-Z_]+)'/g)].map(m => m[1]))]
    expect(codes.length).toBeGreaterThan(20)
    const bare = codes.filter(c => !WCODE[c])
    expect(bare, 'these would print their code, e.g. "OIL_UNPUBLISHED", as the heading').toEqual([])
  })
})

/* an activity input on Monday, parked (not on the programme) — the demo boot may already
   have landed it, so it is taken off first; either way it ends 'r' */
const meeting = () => {
  const inp = INPUTS.find((x: any) => x.type === 'Meeting' && x.date === 'Jul 13')!
  if (inp.acc && inp.acc !== 'r') unacceptInput(MON, inp)
  return inp
}

describe('an input filed under Unavailable can be taken back out (W4-F4, AM14)', () => {
  it('its Unavailable row carries an Undo on the week and the board — never on the view page', () => {
    const inp = meeting()
    expect(acceptInput(MON, inp, 'u')).toBe(true)
    const id = inpId(inp)
    const undoIn = (html: string) => !!el(html).querySelector(`[data-acc="x"][data-acck="${id}"]`)
    expect(undoIn(sbUnavailPanel(DAYS[MON], MON)), 'the board\'s Unavailable panel').toBe(true)
    expect(undoIn(weekEdit(MON).innerHTML), 'the edit week\'s Unavailable section').toBe(true)
    setPage('viewsched')
    try { expect(undoIn(dayHTML(MON, false)), 'the view page is read-only').toBe(false) } finally { setPage('editsched') }
  })
  it('pressing it puts the input back among Personal Inputs, parked', () => {
    const inp = meeting()
    acceptInput(MON, inp, 'u')
    const b = el(sbUnavailPanel(DAYS[MON], MON)).querySelector(`[data-acc="x"][data-acck="${inpId(inp)}"]`) as HTMLElement
    document.body.appendChild(b)
    try { routeClick({ target: b, stopPropagation() {}, preventDefault() {} } as any) } finally { b.remove() }
    expect(inp.acc).toBe('r')
  })
})

describe('taking an issued input off and putting it back is a round trip, not an amendment (W4-F2, AM20)', () => {
  it('re-accepting restores the issued row, so nothing differs from what was issued', () => {
    const inp = meeting()
    expect(acceptInput(MON, inp, 'g')).toBe(true)          // on the programme
    publishDay(MON)                                         // …and issued with it
    expect(dayDelta(MON).length).toBe(0)
    expect(unacceptInput(MON, inp)).toBe(true)              // taken off
    expect(dayDelta(MON).length, 'a real removal while it is off').toBeGreaterThan(0)
    expect(acceptInput(MON, inp, 'g')).toBe(true)          // put back
    expect(dayDelta(MON), 'identical to the issued version again').toEqual([])
  })
  /* the final code read (Fable #5, 24 Sep 26): it went back at its ISSUED index — which, once an issued row
     before it had been removed, or under a hand-set order, is not where its neighbours now are, so the day
     read "1 removal · 1 reorder" for a row that went back where it was */
  it('with a hand-set order and an earlier row removed, it goes back beside its issued neighbours (AM20)', () => {
    const inp = meeting()
    const d: any = DAYS[MON]
    d.ground = [{ prog: 'A FIRST', str: '07:00', end: '07:30', who: '' }]
    expect(acceptInput(MON, inp, 'g')).toBe(true)          // [A, the input's row]
    d.ground.push({ prog: 'C LAST', str: '06:00', end: '06:30', who: '' })   // [A, B, C] — out of time order
    d.gman = true                                           // the order on screen is the hand-set one
    ensureRowIds(DAYS)
    publishDay(MON)
    d.ground.splice(0, 1)                                   // A removed: a real removal
    expect(unacceptInput(MON, inp)).toBe(true)              // B taken off…
    expect(acceptInput(MON, inp, 'g')).toBe(true)          // …and put back
    const delta = dayDelta(MON)
    expect(delta.filter((e: any) => e.kind === 'move'), 'no reorder').toEqual([])
    expect(delta.filter((e: any) => e.kind === 'delete').length, 'the one removal, A').toBe(1)
  })
})

/* the final code read (Fable #2, 24 Sep 26): the W4-F3 re-link first rode on the general filing reconcile, so
   ANY replacement that brought a removed input's row back filed it as landed — and the next one that dropped the
   row again made it FRESH: a plan switched away and back turned a deliberate removal into an input that flags and
   re-lands itself (AM43b). Only a version LOAD re-links now; a plan switch keeps the removal, as it always did. */
describe('a removal survives a plan switched away and back (Fable final read #2, AM43b)', () => {
  it('the input taken off Plan B is still removed when Plan B comes back', () => {
    const inp = meeting()
    expect(acceptInput(MON, inp, 'g')).toBe(true)          // on the programme
    draftDup(MON)                                           // Plan A stowed with the row; Plan B live, its copy
    const [a] = dayDrafts(MON)
    const b = curDraftId(MON)
    expect(unacceptInput(MON, inp)).toBe(true)              // taken off Plan B
    expect(inp.acc).toBe('r')
    draftSelect(MON, a.id)                                  // over to Plan A, which still carries the row
    draftSelect(MON, b)                                     // and back
    expect(inp.acc, 'still removed, not a fresh input that flags').toBe('r')
  })
})

/* walk W4-F3 (24 Sep 26). A load puts back the version's CONTENT and leaves the input filings as they are (the
   design of record — publish.ts dayDiscardCount, P2-REREVIEW-08 — and Fable's door list), so an input taken off
   and then brought back by a load keeps its "removed" mark while its row is on the programme. What was wrong was
   the dead control: "→ Ground" on it did nothing and said nothing. Whether a load should also put the input back
   on is a question for him ([AMEND-LOAD-FILING]); the final read (Fable #2) showed the first attempt to re-file
   it turned removals into fresh inputs elsewhere. */
describe('an input brought back by a load (W4-F3)', () => {
  it('the load puts back content, not the filing — the input stays removed, as designed', () => {
    const inp = meeting()
    acceptInput(MON, inp, 'g'); publishDay(MON)
    unacceptInput(MON, inp)                                 // off the programme: parked 'r'
    expect(loadVersionToWorkingCopy(MON, dayCurVer(MON))).toBe(true)
    expect(inp.acc, 'the filing is not part of what a load replaces').toBe('r')
  })
  it('"→ Ground" on an input already on the programme says so instead of doing nothing', () => {
    const inp = meeting()
    acceptInput(MON, inp, 'g')
    inp.acc = 'r'                                           // the stuck state a load used to leave
    const b = document.createElement('button')
    b.dataset.acc = 'g'; b.dataset.accd = String(MON); b.dataset.acck = inpId(inp)
    document.body.appendChild(b)
    const said = withToasts(() => { try { routeClick({ target: b, stopPropagation() {}, preventDefault() {} } as any) } finally { b.remove() } })
    expect(said.join(' '), 'a refused press is never silent').toMatch(/already on the programme/i)
  })
})

describe('the board keeps the plans selector and the version tag while you look at an issued version (W2-F1, AM28)', () => {
  it('the amber "👁 Original" and the tag stay; the sign-offs and every publish door go', () => {
    publishDay(MON)
    writeText(`dn:${MON}.0`, 'A CHANGE AFTER PUBLISHING')
    DPREV.set(MON, SCHED.orig[MON].id)
    try {
      const s = el(boardSignHTML(MON, true))              // exactly as SchedBoard calls it under a preview
      expect(s.querySelector('.planselbtn')?.textContent || '', 'what you are looking at').toMatch(/👁\s*Original/)
      expect(s.querySelector('.verchip')?.textContent, 'what the day IS').toBe('ORIG')
      expect(s.querySelector('select[data-sign]'), 'no signing a past version').toBeNull()
      expect(s.querySelector('[data-alpub], [data-beak], [data-unpub]'), 'no publish door under a preview').toBeNull()
    } finally { DPREV.clear() }
  })
})

describe('the plan editor belongs to Edit Schedule (W2-F8)', () => {
  let host: HTMLDivElement, root: Root
  beforeAll(() => { host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host) })
  afterAll(() => { act(() => root.unmount()); host.remove(); setDraftsEdit(null) })
  it('it does not float over View-only Sched, where its Select could not act', async () => {
    draftDup(MON)
    setDraftsEdit({ di: MON })
    setPage('editsched')
    await act(async () => { root.render(<DraftsModal />); notify() })
    expect(host.querySelector('#draftsModal')?.hasAttribute('hidden'), 'open on Edit Schedule').toBe(false)
    setPage('viewsched')
    await act(async () => { root.render(<DraftsModal />); notify() })
    expect(host.querySelector('#draftsModal')?.hasAttribute('hidden'), 'hidden on View-only Sched').toBe(true)
  })
})

/* walk W3 F-w3-6 (24 Sep 26). A signer's scheduler appointment withdrawn on Quals: the name stays on its
   pill (AM16 — a signature never blanks itself on an appointment change) but no longer counts, so the
   week showed four green names and just "1 to sign" — and a phone has no hover to say which. Correct
   behaviour that reads as a bug says so (AM15b). */
describe('the sign-off line names a signature that stopped counting (W3-F6, AM16, AM15b)', () => {
  it('the week and the board say which role needs an appointed scheduler', () => {
    sign(MON)
    const was = PEOPLE.bane.quals.sched
    PEOPLE.bane.quals.sched = false                        // bane signed SKED CK; his appointment is withdrawn
    try {
      const w = weekEdit(MON)
      expect(w.querySelectorAll('.sgn.on').length, 'the name stays on its pill (AM16)').toBe(4)
      expect(w.querySelector('.so-state')?.textContent).toBe('1 to sign · SKED CK needs an appointed scheduler')
      expect(boardStrip(MON).querySelector('.so-state')?.textContent).toBe('1 to sign · SKED CK needs an appointed scheduler')
    } finally { PEOPLE.bane.quals.sched = was }
  })
  it('an ordinary gap stays a count on the week — the empty pills already say which', () => {
    signOf(MON).cur = 'ignite'
    expect(weekEdit(MON).querySelector('.so-state')?.textContent).toBe('3 to sign')
    expect(boardStrip(MON).querySelector('.so-state')?.textContent).toBe('3 to sign · SKED CK, PLANNED BY, APPROVED BY')
  })
})

/* walk W1 W1-3 (24 Sep 26). The view page shows a published day's ISSUED face — frozen, and the same for
   the squadron as for the scheduler (AM5). Working-copy state never shows there (AM24, the Z9 choice).
   A filing-only change leaked through: the frozen copy was compared against the LIVE inputs, so the
   issued face read "Original — as issued · 1 pending" — to members too — and its ⓘ "1 unpublished edit". */
describe('the issued face never wears the working copy\'s pending count (W1-3, AM24, AM5)', () => {
  it('a filing-only change: no "pending" on the view page\'s issued face, nor in the ⓘ opened there', () => {
    const inp = meeting()
    expect(acceptInput(MON, inp, 'g')).toBe(true)
    publishDay(MON)
    expect(unacceptInput(MON, inp)).toBe(true)              // a change to the working copy's filing only
    expect(headCount(MON), 'the working copy counts it').toBeGreaterThan(0)
    expect(weekView(MON).querySelector('.dpend'), 'the issued face stays as issued').toBeNull()
    setPage('viewsched')
    try {
      expect(el(dayInfoHTML(MON)).querySelector('.dip-pend'), 'nor the ⓘ read beside it').toBeNull()
      VWORK.add(MON)                                        // the viewer's own Working-draft peek is the working copy
      expect(el(dayInfoHTML(MON)).querySelector('.dip-pend'), 'there it may say so').toBeTruthy()
    } finally { VWORK.clear(); setPage('editsched') }
  })
})

/* walk W1 W1-1 (24 Sep 26). A dotted mark left on a detail that is back at the issued value was frozen
   by the next publish into the issued record as "changed at ALn" — while the item count (from the real
   difference) said otherwise. The Unpublish that left one is fixed (F4); the publish step itself now
   refuses to freeze one, whatever path leaves it (AM20, AM19). */
describe('publishing an amendment never freezes a stale mark into the issued record (W1-1, AM20, AM19)', () => {
  it('a mark on a detail back at its issued value does not come out as "changed at AL1"', () => {
    publishDay(MON)
    const g0: any = (DAYS[MON] as any).ground?.[0]
    expect(g0, 'the demo Monday has a ground row').toBeTruthy()
    const was = g0.prog
    writeText(`dn:${MON}.0`, 'A REAL CHANGE')                // the real amendment
    writeText(`gr:${MON}.0.prog`, 'MOVED ON')                 // a second edit leaves its dotted mark…
    const k = Object.keys(SCHED.pending).find((x) => x.startsWith(`gr:${MON}.`))!
    expect(k, 'the edit is marked').toBeTruthy()
    g0.prog = was                                             // …and the detail goes back by a path that re-checks nothing
    sign(MON)
    commitPublishALDay(MON)
    expect((SCHED.als as any[]).length, 'AL1 went out').toBe(1)
    expect(SCHED.changes[k], 'the detail back at its issued value is not "changed at AL1"').toBeUndefined()
    expect((SCHED.als as any[])[0].diff.length, 'one item — the real change').toBe(1)
  })
})

/* the final code read (Astra #2, 24 Sep 26). The ⓘ opened beside the view page's ISSUED face summarised the
   working copy behind it — its waves, aircraft, duties, ground items, crew — so a member saw the shape of work
   nobody had published. It reads the document the face shows (AM5; working-copy state never on the issued
   face, AM24). The viewer's own Working-draft peek, and the edit page, are the working copy. */
describe('the ⓘ beside the issued face describes the issued version (Astra #2, AM5, AM24)', () => {
  let host: HTMLDivElement, root: Root
  beforeAll(() => { host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host) })
  afterAll(() => { act(() => root.unmount()); host.remove(); setDayPop(null) })
  const groundItems = () => {
    const r = [...host.querySelectorAll('#dayPopBody .dip-r')].find((x) => x.querySelector('.k')?.textContent === 'Ground items')
    return r?.querySelector('.v')?.textContent
  }
  it('a ground item added after publishing is counted on the working copy only', async () => {
    publishDay(MON)
    const issued = ((DAYS[MON] as any).ground || []).filter((g: any) => !g.cx).length
    ;(DAYS[MON] as any).ground.push({ prog: 'UNPUBLISHED BRIEF', str: '10:00', end: '11:00', who: '' })
    ensureRowIds(DAYS)
    setDayPop(MON)
    try {
      setPage('viewsched')
      await act(async () => { root.render(<DayPop />); notify() })
      expect(groundItems(), 'beside the issued face: the issued version').toBe(String(issued))
      VWORK.add(MON)
      await act(async () => { notify() })
      expect(groundItems(), 'beside the Working-draft peek: the working copy').toBe(String(issued + 1))
      VWORK.clear()
      setPage('editsched')
      await act(async () => { notify() })
      expect(groundItems(), 'on the edit page: the working copy').toBe(String(issued + 1))
    } finally { VWORK.clear(); setPage('editsched'); setDayPop(null) }
  })
})

/* the final code read (Fable #3, 24 Sep 26). W2-F6 moved the view page's neutral pending hint from a
   box-shadow (which the red ring's !important hid) to an OUTLINE on the puck — and an outline on the puck
   out-ranks the sanctioned-late (dashed) and crew-rest (dotted) rings, which are outlines too, so those rings
   vanished instead. The hint sits on the SEAT around the puck now, on the view page only, where no ring is
   drawn; the rings stay on the puck. A stylesheet guard, since the test browser paints nothing (AM19, AM51). */
describe('the view page\'s pending hint never takes a warning ring\'s place (Fable final read #3, AM19)', () => {
  it('no rule draws it as an outline on the puck; it is the seat\'s', () => {
    const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'scheduler.css'), 'utf8')
    const rules = css.replace(/\/\*[\s\S]*?\*\//g, '').split('}')
    const onPuck = rules.filter((r) => /(^|,)\s*\.seat\[data-alp\]\s+\.puck\s*(,|\{)/.test(r) && /outline\s*:/.test(r))
    expect(onPuck, 'an outline on the puck hides the dashed and dotted rings').toEqual([])
    expect(rules.some((r) => /#vWeek\s+\.seat\[data-alp\]\s*\{[^]*outline\s*:/.test(r)), 'the seat carries it on the view page').toBe(true)
  })
})
