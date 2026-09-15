// @vitest-environment jsdom
/* Per-day alternate PLANS — the UI half (owner, 15 Aug 26; redesigned 15 Sep
   26). The plans menu (board.ts's planMenu, opened by the ONE selector on both
   the week day head and the board sign strip), the manage modal
   (DraftsModal.tsx), and the view-only week's own compact plans picker
   (viewDraftSelHTML — the ONE place the 'd:' frozen preview is kept, A4).
   Driven through the real App. The edit-side selector's LABEL/tag matrix and
   the switch/preview/+Alt Plan/back-to-live behaviours are pinned in
   planselector.test.tsx; this file pins the menu contents, the published-day
   diffs, the view page, and the manage modal. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, setPage } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved, dayApproved, dayPendCount } from '../engine/publish'
import { dayDrafts, curDraftId, draftDup, draftSelect } from '../engine/drafts'
import { txtSet, txtGet } from '../engine/slots'
import { DPREV, VWORK, setDayPreview } from '../state/view'
import { HOOKS } from '../engine/hooks'
import { boardHTML } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
/* document-scoped — the menu's .wavemenu box (popMenu) lands on document.body,
   outside the mounted tree */
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const pick = async (sel: HTMLSelectElement, value: string) => {
  await act(async () => {
    sel.value = value
    sel.dispatchEvent(new Event('change', { bubbles: true }))
  })
}
const typeCommit = async (el: Element, value: string) => {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await act(async () => { el.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
}
const withToasts = async (fn: () => Promise<void>) => {
  const toasts: string[] = []
  const real = HOOKS.toast
  HOOKS.toast = (m: any) => { toasts.push(String(m)) }
  try { await fn() } finally { HOOKS.toast = real }
  return toasts
}
const resetDrafts = async () => {
  SCHED.drafts = {}; SCHED.curDraft = {}
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  DPREV.clear(); VWORK.clear()
  await act(async () => { notify() })
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})

afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})

/* the copy rows in the plans menu carry data-plansel (switch) or, for the live
   one, data-plangolive (stay / back to live) */
const copyRows = () => $$('.wavemenu [data-plansel],.wavemenu [data-plangolive]')

describe('the ONE selector on both surfaces', () => {
  it('the week day head carries a plans selector, one per live day (no old Drafts button)', async () => {
    await resetDrafts()
    await act(async () => { setPage('editsched'); notify() })
    expect($$('#eWeek .day-head .dhtpl [data-planmenu]').length).toBe($$('#eWeek .day:not(.peek)').length)
    expect($('#eWeek [data-draftsopen]')).toBeFalsy()
    expect($('#eWeek select[data-dver]')).toBeFalsy()
  })

  it('the board sign strip carries the SAME selector, edit mode only', async () => {
    await click($('#eWeek .day[data-day="0"] .dt.sb-open'))
    expect($('#sbSign [data-planmenu]')).toBeTruthy()
    const real = HOOKS.editMode
    HOOKS.editMode = () => false
    try { expect(boardHTML(0)).not.toContain('data-draftsadd=') }
    finally { HOOKS.editMode = real }
    await click($('#sbClose'))
  })
})

describe('the plans menu — the live copy, + Alt Plan, and switching', () => {
  it('an unplanned day\'s menu shows the live copy and "+ Alt Plan" (no issued rows)', async () => {
    await resetDrafts()
    await click($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]'))
    expect($('.wavemenu').textContent).toContain('Live working copy')
    expect($('.wavemenu [data-plandup]')).toBeTruthy()
    expect($('.wavemenu [data-planpv]')).toBeFalsy()      // nothing issued yet
    expect($$('.wavemenu [data-plansel]').length).toBe(0) // no alternative plans yet
    document.body.click()
  })

  it('"+ Alt Plan" mints Plan A + Plan B (B live) and toasts the new name', async () => {
    await resetDrafts()
    const toasts = await withToasts(async () => {
      await click($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]'))
      await click($('.wavemenu [data-plandup]'))
    })
    expect(dayDrafts(0).map((t: any) => t.name)).toEqual(['Plan A', 'Plan B'])
    expect(curDraftId(0)).toBe(dayDrafts(0)[1].id)
    expect(toasts.some(t => t.includes('"Plan B" is now the live day'))).toBe(true)
  })

  it('the menu lists a row per plan, the live one marked, and a tap switches', async () => {
    /* holding the two plans from the previous test; edit Plan B first so the
       switch has something visible to stow */
    await act(async () => { txtSet('dn:0.0', 'PLAN B NOTE'); notify() })
    await click($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]'))
    expect(copyRows().length).toBe(2)
    /* the live one (Plan B) is marked ● and carries data-plangolive; the other
       carries data-plansel */
    expect($('.wavemenu [data-plangolive]')!.textContent).toContain('●')
    expect($$('.wavemenu [data-planedit]').length).toBe(2)   // a pencil per plan
    const planA = dayDrafts(0)[0]
    const toasts = await withToasts(async () => { await click($(`.wavemenu [data-plansel="${planA.id}"]`)) })
    expect(curDraftId(0)).toBe(planA.id)
    expect(toasts.some(t => t.includes('Switched to "Plan A"'))).toBe(true)
    expect(txtGet('dn:0.0')).not.toBe('PLAN B NOTE')         // Plan A is the day as it stood
    /* and back — the stowed edit survived */
    await click($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]'))
    await click($(`.wavemenu [data-plansel="${dayDrafts(0)[1].id}"]`))
    expect(txtGet('dn:0.0')).toBe('PLAN B NOTE')
  })

  it('the board sign strip opens the identical menu', async () => {
    await click($('#eWeek .day[data-day="0"] .dt.sb-open'))
    await click($('#sbSign [data-planmenu]'))
    expect(copyRows().length).toBe(2)
    document.body.click()
    await click($('#sbClose'))
  })
})

describe('a published day: switch marks the diff toward the next AL', () => {
  it('duplicates and switches, its toasts reporting the diff against the issued document', async () => {
    await resetDrafts()
    const g = signOf(2)
    g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    await act(async () => { setDayApproved(2, 1); notify() })
    const toasts = await withToasts(async () => {
      await click($('#eWeek .day[data-day="2"] .dhtpl [data-planmenu]'))
      expect($('.wavemenu').textContent).toContain("the issued versions don't change")
      await click($('.wavemenu [data-plandup]'))
    })
    expect(dayDrafts(2).length).toBe(2)
    expect(toasts.some(t => t.includes('"Plan B" is now the live day'))).toBe(true)
    const [planA, planB] = dayDrafts(2).map((t: any) => t.id)
    /* diverge Plan B, then switch to Plan A (== issued) and back */
    await act(async () => { txtSet('dn:2.0', 'PLAN B NOTE'); notify() })
    const t2 = await withToasts(async () => {
      await click($('#eWeek .day[data-day="2"] .dhtpl [data-planmenu]'))
      await click($(`.wavemenu [data-plansel="${planA}"]`))
    })
    expect(t2.some(t => t.includes('matches Original — nothing pending'))).toBe(true)
    expect(dayPendCount(2)).toBe(0)
    const t3 = await withToasts(async () => {
      await click($('#eWeek .day[data-day="2"] .dhtpl [data-planmenu]'))
      await click($(`.wavemenu [data-plansel="${planB}"]`))
    })
    expect(t3.some(t => t.includes('1 difference from Original pending'))).toBe(true)
    /* Phase 3 (C3): a plan switch on a day whose signatures are BOUND (signed via
       the production sign-off path) invalidates them and the toast appends
       "· signatures reset". This day was signed only to publish, and those were
       spent on the issue, so there is nothing bound to reset here — the toast
       flag is exercised in production, not from this legacy-signer setup. */
    expect(dayPendCount(2)).toBe(1)
    await act(async () => { setDayApproved(2, 0); SCHED.pending = {}; notify() })
  })
})

/* THE VIEW-ONLY WEEK keeps its own compact plans picker and the 'd:' frozen
   preview (owner, A4 — a viewer looks, never switches). This machinery is
   UNCHANGED by the redesign; only the "Draft"→"Plan" labels moved. */
describe('the view-only week — unpublished days with plans', () => {
  it('no picker without plans; a compact plans-only picker with them', async () => {
    await resetDrafts()
    await act(async () => { setPage('viewsched'); notify() })
    expect($$('#vWeek select[data-dver]').length).toBe(0)
    await act(async () => { draftDup(0); notify() })
    const sels = $$('#vWeek select[data-dver]')
    expect(sels.length).toBe(1)                       // only the day that has plans
    const opts = [...(sels[0] as unknown as HTMLSelectElement).options].map(o => [o.value, o.text])
    expect(opts).toEqual([
      ['d:' + dayDrafts(0)[0].id, 'Plan A'],
      ['live', 'Plan B ●'],
    ])
    expect(opts.some(([v]) => v === 'orig' || /^\d+$/.test(v!))).toBe(false)
  })

  it('viewing a plan freezes it with the read-only banner, no switch, no controls', async () => {
    const sel = $('#vWeek select[data-dver="0"]') as unknown as HTMLSelectElement
    await pick(sel, 'd:' + dayDrafts(0)[0].id)
    const day = () => $(`#vWeek .day[data-day="0"]`)
    expect(day().className).toContain('preview')
    expect(day().querySelector('.dprev-bar')!.textContent).toContain('Viewing plan Plan A — read-only')
    expect(day().querySelector('.dprev-switch')).toBeFalsy()   // a viewer cannot switch
    expect(day().querySelector('[data-restore]')).toBeFalsy()
    expect(day().querySelectorAll('[data-slot],[data-fill],[draggable="true"],[data-drag]').length).toBe(0)
    await pick($('#vWeek select[data-dver="0"]') as unknown as HTMLSelectElement, 'live')
    expect(day().className).not.toContain('preview')
  })

  it('an edit-page ORIG/AL preview never leaks onto the view week', async () => {
    setDayPreview(1, 'orig')
    await act(async () => { notify() })
    expect($(`#vWeek .day[data-day="1"] .dprev-bar`)).toBeFalsy()
    setDayPreview(1, null)
    await act(async () => { setPage('editsched'); notify() })
  })

  it('a d: plan preview set on the view page is cleared when entering the edit page (Fable #3)', async () => {
    await resetDrafts()
    await act(async () => { draftDup(0); setPage('viewsched'); notify() })
    const planA = dayDrafts(0)[0].id
    await act(async () => { setDayPreview(0, 'd:' + planA); notify() })
    expect(DPREV.get(0)).toBe('d:' + planA)
    /* the edit surfaces never preview a plan (they switch), so a lingering d:
       preview must not carry over — it would show a stale "Switch to this plan" bar */
    await act(async () => { setPage('editsched'); notify() })
    expect(DPREV.has(0)).toBe(false)
    /* an ISSUED preview, by contrast, is the edit page's own and would survive —
       not exercised here to keep the state clean for the next describe */
  })
})

describe('the view-only week — published days', () => {
  const pub = async (di: number) => {
    const g = signOf(di)
    g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    await act(async () => { setDayApproved(di, 1); notify() })
  }

  it('defaults to the ISSUED document, named by the picker — frozen against live edits', async () => {
    await resetDrafts()
    await pub(0)
    await act(async () => { setPage('viewsched'); notify() })
    await act(async () => { txtSet('dn:0.0', 'SCHEDULER WIP'); notify() })
    const day = () => $('#vWeek .day[data-day="0"]')
    expect(day().className).toContain('issued')
    expect(day().className).not.toContain('preview')
    expect(day().textContent).not.toContain('SCHEDULER WIP')
    expect(day().querySelector('.dprev-bar')).toBeFalsy()
    expect(day().querySelector('[data-restore]')).toBeFalsy()
    expect(day().querySelector('[data-alp]')).toBeFalsy()
    /* the retired "✓ Published" stamp: the version is named by the picker now */
    expect(day().textContent).not.toContain('✓ Published')
    const sel = day().querySelector('select[data-vwork="0"]') as HTMLSelectElement
    expect(sel, 'the issued/working picker').toBeTruthy()
    expect([...sel.options].map(o => [o.value, o.text])).toEqual([
      ['issued', 'Original — as issued'],
      ['working', 'Working draft — not issued'],
    ])
  })

  it('the working choice shows the live copy under a banner and a Working-draft stamp', async () => {
    await pick($('#vWeek select[data-vwork="0"]') as unknown as HTMLSelectElement, 'working')
    const day = () => $('#vWeek .day[data-day="0"]')
    expect(day().textContent).toContain('SCHEDULER WIP')
    const bar = day().querySelector('.dprev-bar.work')!
    expect(bar.textContent).toContain('Working draft')
    expect(bar.textContent).toContain('the issued schedule is Original')
    expect(day().querySelector('.dbeak.ro.work')!.textContent).toBe('Working draft')
    await pick($('#vWeek select[data-vwork="0"]') as unknown as HTMLSelectElement, 'issued')
    expect(day().textContent).not.toContain('SCHEDULER WIP')
    expect(day().className).toContain('issued')
  })

  it('stored plans are hidden from viewers once the day is published', async () => {
    await act(async () => { draftDup(0); notify() })
    const day = $('#vWeek .day[data-day="0"]')
    const sel = day.querySelector('select[data-vwork="0"]') as HTMLSelectElement
    expect(sel).toBeTruthy()
    expect([...sel.options].map(o => o.value)).toEqual(['issued', 'working'])
    expect(day.querySelector('select[data-dver]')).toBeFalsy()
    await act(async () => { setDayApproved(0, 0); SCHED.pending = {}; VWORK.clear(); notify() })
    await act(async () => { setPage('editsched'); notify() })
  })
})

describe('the manage modal (DraftsModal)', () => {
  it('opens from a plan\'s pencil pre-selected on it, scoped to the day', async () => {
    await resetDrafts()
    await act(async () => { draftDup(0); notify() })
    await click($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]'))
    await click($$('.wavemenu [data-planedit]')[0]!)   // Plan A's own pencil
    expect(($('#draftsModal') as any).hidden).toBe(false)
    expect($('#draftsModal .modal-head')!.textContent).toContain(DAYS[0].dow)
    expect($$('#draftsModal .tpl-tab').length).toBe(2)
    expect($$('#draftsModal .tpl-tab.on')[0]!.textContent).toBe('Plan A')
    expect($$('#draftsModal .tpl-tab')[1]!.textContent).toContain('●')
    expect($('#draftsModal .wm-note')!.textContent).toContain('publishes')
  })

  it('renames on commit, refuses a duplicate name with a toast', async () => {
    await typeCommit($('#draftsModal .tpl-name'), 'Wet weather')
    expect(dayDrafts(0)[0].name).toBe('Wet weather')
    const toasts = await withToasts(async () => {
      await typeCommit($('#draftsModal .tpl-name'), 'Plan B')
    })
    expect(dayDrafts(0)[0].name).toBe('Wet weather')   // refused, kept
    expect(toasts.some(t => t.includes('already has that name'))).toBe(true)
  })

  it('Delete is disabled on the live plan; deleting down to one clears the day\'s plans (B1)', async () => {
    /* list is [Wet weather, Plan B]; Plan B is live */
    const del = () => $$('#draftsModal .abtn.danger').find(b => b.textContent === 'Delete plan') as HTMLButtonElement
    expect(del().disabled).toBe(false)
    /* switch the modal to the live plan — Delete locks with the reason */
    await click($$('#draftsModal .tpl-tab')[1]!)
    expect(del().disabled).toBe(true)
    expect(del().title).toContain('switch to another plan first')
    /* back to the stored one and delete it — dropping to one clears the plans */
    await click($$('#draftsModal .tpl-tab')[0]!)
    const toasts = await withToasts(async () => { await click(del()) })
    expect(dayDrafts(0)).toEqual([])                   // B1: plans cleared, back to a plain working copy
    expect(toasts).toContain('"Wet weather" plan deleted')
    /* the modal falls to its empty state */
    expect($('#draftsModal .sb-empty')).toBeTruthy()
  })

  it('Select makes the open plan the live day', async () => {
    await act(async () => { draftDup(0); notify() })    // fresh Plan A + Plan B (B live)
    await click($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]'))
    await click($$('.wavemenu [data-planedit]')[0]!)    // Plan A's pencil (not live)
    const selBtn = $$('#draftsModal .abtn').find(b => b.textContent === 'Select') as HTMLButtonElement
    expect(selBtn.disabled).toBe(false)
    await click(selBtn)
    expect(curDraftId(0)).toBe(dayDrafts(0)[0].id)      // Plan A is live
    await click($('#draftsClose'))
    expect(($('#draftsModal') as any).hidden).toBe(true)
  })
})

describe('sign-offs: a change clears the greens, and the "nothing to publish" note (owner, 15 Sep 26 — R1/R2/item 7)', () => {
  /* sign all four through the real sign-off selects, so it routes Shell.tsx's
     onChange → setSign (bound) and fires the R2 note on the fourth. */
  const signAllUI = async (di: number, off = 0) => {
    for (const [i, k] of (['cur', 'sked', 'plan', 'appr'] as const).entries()) {
      const sel = $(`#eWeek .day[data-day="${di}"] select[data-sign="${k}"]`) as unknown as HTMLSelectElement
      await pick(sel, sel.options[off + i + 2]!.value)
    }
  }

  it('signing a published day with nothing pending pops the "no changes" note; the status line says so; no Publish button', async () => {
    await resetDrafts()
    SCHED.signBind = {}
    /* publish day 0 first — that spends its signatures, leaving it approved with 0 pending */
    await act(async () => { const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; setDayApproved(0, 1); notify() })
    expect(dayApproved(0)).toBe(true)
    /* re-sign the four through the UI; the fourth completes with nothing to publish */
    const toasts = await withToasts(async () => { await signAllUI(0) })
    expect(toasts.some(t => /no changes to publish/i.test(t)), 'the R2 bubble fired').toBe(true)
    const bar = $(`#eWeek .day[data-day="0"] .signoff.day-sign`)
    expect(bar.textContent, 'the status line is publish-aware').toContain('no changes to publish')
    expect($(`#eWeek .day[data-day="0"] button[data-alpub]`), 'correctly NO publish button').toBeFalsy()
  })

  it('a change clears the greens (R1); re-signing then reads "1 change to publish"', async () => {
    /* state: day 0 published + fully signed, 0 pending, from the test above */
    await act(async () => { txtSet('dn:0.0', 'AMEND ONE'); notify() })
    const bar = () => $(`#eWeek .day[data-day="0"] .signoff.day-sign`)
    /* R1: the change invalidated all four sign-offs — the selects read EMPTY and the
       day is unsigned again, exactly the owner's rule ("a change needs to be signed
       off"). The status line correctly says the day is unsigned, not "publishable". */
    expect([...bar().querySelectorAll('select[data-sign]')].every((s: any) => s.value === ''), 'greens cleared by the change').toBe(true)
    expect(bar().textContent).toContain('4 to sign')
    /* re-sign → now signed + published + 1 pending → the honest publish-aware line
       AND the Publish AL button returns */
    await signAllUI(0)
    expect(bar().textContent).toMatch(/1 change to publish — Publish AL1/)
    expect($(`#eWeek .day[data-day="0"] button[data-alpub]`), 'Publish AL returns after re-signing').toBeTruthy()
  })
})
