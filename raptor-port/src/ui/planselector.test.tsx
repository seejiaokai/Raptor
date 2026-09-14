// @vitest-environment jsdom
/* THE PLANS SELECTOR REDESIGN (owner, 15 Sep 26 — LOCKED spec
   docs/superpowers/specs/2026-09-15-plans-selector-redteam.md). ONE white
   selector button per day, its LABEL what you are looking at, opening ONE menu
   (planMenu) shared by the week day head and the board sign strip. This file is
   the executable spec:
     · the FIVE-STATE MATRIX (A6) — the selector label and the green title tag
       across draft/no-plans, draft/plans, issued/no-plans, issued/plans, and
       previewing;
     · the menu structure (editable copies → issued preview → + Alt Plan);
     · the must-fix behaviours A1–A3 and decision B1 that are reachable here. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, setPage } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved, dayCurVer, alIssue } from '../engine/publish'
import { dayDrafts, curDraftId, draftDup } from '../engine/drafts'
import { txtSet } from '../engine/slots'
import { DPREV, setDayPreview } from '../state/view'
import { HOOKS } from '../engine/hooks'
import { planSelectorHTML, verTagHTML } from './html'

/* sign all four roles so a day can be published / an AL issued */
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const reset = () => {
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}
  DPREV.clear()
}

describe('the selector LABEL + title tag — the five-state matrix (A6)', () => {
  beforeEach(() => { initStore(); reset() })

  it('1 · draft / no plans → "Live working copy", dashed DRAFT tag', () => {
    const sel = planSelectorHTML(0)
    expect(sel).toContain('data-planmenu="0"')
    expect(sel).toContain('Live working copy')
    expect(sel).not.toContain(' pv')                 // not previewing
    expect(verTagHTML(0)).toContain('verchip draft')
    expect(verTagHTML(0)).toContain('DRAFT')
  })

  it('2 · draft / plans → the live plan\'s name, still DRAFT', () => {
    draftDup(0)                                       // Plan A + Plan B (B live)
    expect(dayDrafts(0).map((t: any) => t.name)).toEqual(['Plan A', 'Plan B'])
    const live = dayDrafts(0).find((t: any) => t.id === curDraftId(0))
    expect(planSelectorHTML(0)).toContain('>' + live.name + '<')
    expect(planSelectorHTML(0)).not.toContain('Live working copy')
    expect(verTagHTML(0)).toContain('DRAFT')
  })

  it('3 · issued / no plans → "Live working copy", green ORIG tag', () => {
    sign(0); setDayApproved(0, 1)                     // publish at Original
    expect(planSelectorHTML(0)).toContain('Live working copy')
    expect(verTagHTML(0)).toContain('verchip orig')
    expect(verTagHTML(0)).toContain('ORIG')
    expect(verTagHTML(0)).not.toContain('DRAFT')
  })

  it('3b · issued as AL1 → green AL1 tag (not ORIG, not DRAFT)', () => {
    sign(0); setDayApproved(0, 1)
    txtSet('dn:0.0', 'LIVE CHANGE'); sign(0); alIssue(0)
    expect(verTagHTML(0)).toContain('verchip pub')
    expect(verTagHTML(0)).toContain('AL1')
  })

  it('4 · issued / plans → the live plan\'s name, green issued tag', () => {
    sign(0); setDayApproved(0, 1)
    draftDup(0)                                       // legal on a published day
    const live = dayDrafts(0).find((t: any) => t.id === curDraftId(0))
    expect(planSelectorHTML(0)).toContain('>' + live.name + '<')
    expect(verTagHTML(0)).toContain('verchip orig')  // still issued as ORIG
  })

  it('5 · previewing an issued version → amber "👁 AL1", tag still names the live issue', () => {
    sign(0); setDayApproved(0, 1)
    txtSet('dn:0.0', 'LIVE CHANGE'); sign(0); alIssue(0)   // now issued at AL1
    const origVer = SCHED.orig[0].id
    setDayPreview(0, origVer)                              // look back at ORIG
    const sel = planSelectorHTML(0)
    expect(sel).toContain('planselbtn pv')                // amber state
    expect(sel).toContain('👁')
    expect(sel).toContain('Original')                     // what you are viewing (verLabel)
    /* the title tag still names what the day IS (AL1), not what you preview */
    expect(verTagHTML(0)).toContain('AL1')
    setDayPreview(0, null)
  })
})

/* ---- the menu + the behaviours, driven through the real App ---------------- */
let host: HTMLDivElement, root: Root
const $ = (s: string) => document.querySelector(s) as HTMLElement
const $$ = (s: string) => [...document.querySelectorAll(s)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const withToasts = async (fn: () => Promise<void>) => {
  const t: string[] = []; const real = HOOKS.toast
  HOOKS.toast = (m: any) => { t.push(String(m)) }
  try { await fn() } finally { HOOKS.toast = real }
  return t
}

describe('the menu + the must-fix behaviours', () => {
  beforeAll(async () => {
    initStore(); reset()
    host = document.createElement('div'); document.body.appendChild(host)
    root = createRoot(host)
    await act(async () => { root.render(<App />) })
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  })
  afterAll(async () => { await act(async () => { root.unmount() }); host.remove() })

  const reopen = async () => { reset(); await act(async () => { notify() }) }

  it('the week day head carries ONE selector per live day, inside the excised .dhtpl', () => {
    expect($$('#eWeek .day-head .dhtpl [data-planmenu]').length).toBe($$('#eWeek .day:not(.peek)').length)
    /* the old Drafts button and the old <select data-dver> are GONE from edit surfaces */
    expect($('#eWeek [data-draftsopen]')).toBeFalsy()
    expect($('#eWeek select[data-dver]')).toBeFalsy()
    expect($('#eWeek .livebtn')).toBeFalsy()
  })

  it('an unplanned day\'s menu offers the live copy + "+ Alt Plan" (no issued rows)', async () => {
    await reopen()
    await click($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]'))
    const menu = $('.wavemenu')
    expect(menu.textContent).toContain('Live working copy')
    expect(menu.querySelector('[data-plandup]')).toBeTruthy()   // + Alt Plan
    expect(menu.querySelector('[data-planpv]')).toBeFalsy()      // nothing issued yet
    expect(menu.textContent).toContain('+ Alt Plan')
    document.body.click()
  })

  it('"+ Alt Plan" mints Plan A + Plan B (B live) and the selector now reads Plan B', async () => {
    await reopen()
    await withToasts(async () => {
      await click($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]'))
      await click($('.wavemenu [data-plandup]'))
    })
    expect(dayDrafts(0).map((t: any) => t.name)).toEqual(['Plan A', 'Plan B'])
    expect($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu] .psl')!.textContent).toBe('Plan B')
  })

  it('tapping another plan SWITCHES instantly (A4 — no d: preview on the edit side)', async () => {
    await reopen()
    draftDup(0); await act(async () => { notify() })
    const other = dayDrafts(0).find((t: any) => t.id !== curDraftId(0))!
    await click($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]'))
    await click($(`.wavemenu [data-plansel="${other.id}"]`))
    expect(curDraftId(0)).toBe(other.id)              // switched, not previewed
    expect(DPREV.has(0)).toBe(false)                  // never a d: preview
  })

  it('the issued rows PREVIEW (A4), and the read-only bar has "← Back to live" (A2)', async () => {
    await reopen()
    sign(0); setDayApproved(0, 1)
    txtSet('dn:0.0', 'LIVE CHANGE'); sign(0); alIssue(0)
    await act(async () => { notify() })
    const origVer = SCHED.orig[0].id
    await click($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]'))
    await click($(`.wavemenu [data-planpv="${origVer}"]`))
    expect(DPREV.get(0)).toBe(origVer)               // previewing, not switched
    /* the selector goes amber "👁 …" on the REAL preview render (EditWeek paints
       via dayPreviewHTML → dayHTML(di,false,true)); Templates is hidden there */
    expect($('#eWeek .day[data-day="0"] .planselbtn.pv')).toBeTruthy()
    expect($('#eWeek .day[data-day="0"] [data-daytplopen]')).toBeFalsy()
    /* A2: the week's read-only bar carries the back button (the green pill is gone) */
    const bar = $('#eWeek .day[data-day="0"] .dprev-bar')
    expect(bar).toBeTruthy()
    expect(bar.querySelector('[data-golive]')).toBeTruthy()
    /* A3: Publish AL is NOT reachable while previewing */
    expect($('#eWeek .day[data-day="0"] [data-alpub]')).toBeFalsy()
    /* A3 (Codex PS-006 / Fable #2): live == AL1, so nothing is pending — the
       "N pending" chip must NOT appear under the preview (it used to read the
       previewed snapshot's delta instead of the live discard count). */
    expect($('#eWeek .day[data-day="0"] .dpend')).toBeFalsy()
    /* Back to live clears the preview */
    await click(bar.querySelector('[data-golive]'))
    expect(DPREV.has(0)).toBe(false)
  })

  it('A3 · ALPanel\'s per-day Publish AL is locked while that day is previewed (Codex PS-001)', async () => {
    await reopen()
    sign(0); setDayApproved(0, 1)
    txtSet('dn:0.0', 'ALPANEL WIP'); sign(0)           // a signed, changed published day → ALPanel lists it
    await act(async () => { notify() })
    const alBtn = () => [...$$('#alPanel .al-pubday')].find(r => r.querySelector('.al-pd-lbl'))?.querySelector('.abtn.primary') as HTMLButtonElement | undefined
    expect(alBtn(), 'ALPanel lists the day with a Publish AL button').toBeTruthy()
    expect(alBtn()!.disabled, 'enabled when not previewing').toBe(false)
    /* preview an issued version of that day → the ALPanel publish must lock, or it
       would publish the LIVE copy while the day shows the frozen version */
    const origVer = SCHED.orig[0].id
    await act(async () => { setDayPreview(0, origVer); notify() })
    expect(alBtn()!.disabled, 'locked while previewing day 0').toBe(true)
    await act(async () => { setDayPreview(0, null); notify() })
  })

  it('A3 · Publish AL IS shown on a changed published day when NOT previewing', async () => {
    await reopen()
    sign(0); setDayApproved(0, 1)
    txtSet('dn:0.0', 'A DIFFERENCE'); sign(0)
    await act(async () => { notify() })
    expect($('#eWeek .day[data-day="0"] [data-alpub]')).toBeTruthy()
  })

  it('B1 · deleting down to one plan returns the day to "Live working copy"', async () => {
    await reopen()
    draftDup(0)                                       // Plan A + Plan B (B live)
    await act(async () => { notify() })
    const planA = dayDrafts(0).find((t: any) => t.name === 'Plan A')!
    /* delete the non-selected plan via the engine (the modal is drafts' own test);
       the point here is the SELECTOR returns to the no-plans state */
    const { draftDelete } = await import('../engine/drafts')
    expect(draftDelete(0, planA.id)).toBe(true)
    await act(async () => { notify() })
    expect(dayDrafts(0)).toEqual([])                  // plans cleared (option a)
    expect($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu] .psl')!.textContent).toBe('Live working copy')
  })
})
