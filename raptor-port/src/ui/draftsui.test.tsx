// @vitest-environment jsdom
/* Per-day alternate drafts — the UI half (owner, 15 Aug 26). The board's
   "Drafts" control, the edit week's day-sign strip entry point, the one
   popMenu-idiom menu both share (board.ts's draftsMenu), the manage modal
   (DraftsModal.tsx), the version selects gaining draft entries, and the
   view-only week's compact draft picker + frozen preview. Driven through the
   real App, the same shape daytplui.test.tsx uses, so the render/role gates
   are exercised end to end. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, setPage } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { dayDrafts, curDraftId, draftDup } from '../engine/drafts'
import { txtSet, txtGet } from '../engine/slots'
import { DPREV, setDayPreview } from '../state/view'
import { HOOKS } from '../engine/hooks'
import { boardHTML } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
/* document-scoped — the menu's .wavemenu box (popMenu) lands on document.body,
   outside the mounted tree, same reason daytplui.test.tsx reads off document */
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
/* the name box commits on blur — type in one act (so React lands the change
   in state), then blur in a second, or the blur handler still closes over the
   pre-typing render */
const typeCommit = async (el: Element, value: string) => {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await act(async () => {
    /* React delegates onBlur off the bubbling focusout event, not bare blur */
    el.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
  })
}
const withToasts = async (fn: () => Promise<void>) => {
  const toasts: string[] = []
  const real = HOOKS.toast
  HOOKS.toast = (m: any) => { toasts.push(String(m)) }
  try { await fn() } finally { HOOKS.toast = real }
  return toasts
}
/* drafts ride SCHED, so a per-block reset is a plain field wipe */
const resetDrafts = async () => {
  SCHED.drafts = {}; SCHED.curDraft = {}
  DPREV.clear()
  await act(async () => { notify() })
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})

describe('the two entry points', () => {
  it('a Drafts control sits beside Templates on the board, edit mode only', async () => {
    await resetDrafts()
    await click($('#eWeek .day[data-day="0"] .dow.sb-open'))
    expect($('#sbBoard [data-draftsadd="0"]')).toBeTruthy()
    const real = HOOKS.editMode
    HOOKS.editMode = () => false
    try { expect(boardHTML(0)).not.toContain('data-draftsadd=') }
    finally { HOOKS.editMode = real }
  })

  it('the week day-sign strip carries a Drafts button, one per day', async () => {
    expect($$('#eWeek .signoff.day-sign [data-draftsopen]').length).toBe($$('#eWeek .day').length)
  })
})

describe('the menu (draftsMenu) — duplicate and switch', () => {
  it('an empty day offers Duplicate and Manage only', async () => {
    await resetDrafts()
    await click($('#sbBoard [data-draftsadd="0"]'))
    expect($('.wavemenu').textContent).toContain('No drafts yet')
    expect($('.wavemenu [data-draftdup]')).toBeTruthy()
    expect($('.wavemenu [data-draftmanage]')).toBeTruthy()
    expect($$('.wavemenu [data-draftsel]').length).toBe(0)
    document.body.click()
  })

  it('Duplicate mints Draft 1 + Draft 2 (selected) and toasts the new name', async () => {
    await resetDrafts()
    const toasts = await withToasts(async () => {
      await click($('#sbBoard [data-draftsadd="0"]'))
      await click($('.wavemenu [data-draftdup]'))
    })
    expect(dayDrafts(0).map((t: any) => t.name)).toEqual(['Draft 1', 'Draft 2'])
    expect(curDraftId(0)).toBe(dayDrafts(0)[1].id)
    expect(toasts.some(t => t.includes('"Draft 2" is now the live day'))).toBe(true)
  })

  it('the menu lists one row per draft, the selected one marked, and a tap switches', async () => {
    /* still holding the two drafts from the previous test; edit Draft 2 first
       so the switch has something visible to stow */
    await act(async () => { txtSet('dn:0.0', 'DRAFT 2 NOTE'); notify() })
    await click($('#sbBoard [data-draftsadd="0"]'))
    const rows = $$('.wavemenu [data-draftsel]')
    expect(rows.length).toBe(2)
    expect(rows[1]!.textContent).toContain('●')
    expect(rows[1]!.textContent).toContain('what publishes')
    /* every row has its own pencil into the manage modal */
    expect($$('.wavemenu [data-draftedit]').length).toBe(2)
    const toasts = await withToasts(async () => { await click(rows[0]!) })
    expect(curDraftId(0)).toBe(dayDrafts(0)[0].id)
    expect(toasts.some(t => t.includes('Switched to "Draft 1"'))).toBe(true)
    expect(txtGet('dn:0.0')).not.toBe('DRAFT 2 NOTE')   // Draft 1 is the day as it stood
    /* and back — the stowed edit survived */
    await click($('#sbBoard [data-draftsadd="0"]'))
    await click($$('.wavemenu [data-draftsel]')[1]!)
    expect(txtGet('dn:0.0')).toBe('DRAFT 2 NOTE')
  })

  it('the week’s own Drafts button opens the identical menu', async () => {
    await click($('#eWeek [data-draftsopen="0"]'))
    expect($$('.wavemenu [data-draftsel]').length).toBe(2)
    document.body.click()
  })

  it('a published day refuses Duplicate with the reopen toast', async () => {
    const g = signOf(2)
    g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    await act(async () => { setDayApproved(2, 1); notify() })
    const toasts = await withToasts(async () => {
      await click($('#eWeek [data-draftsopen="2"]'))
      await click($('.wavemenu [data-draftdup]'))
    })
    expect(toasts).toEqual(['Reopen the day first'])
    expect(dayDrafts(2)).toEqual([])
    await act(async () => { setDayApproved(2, 0); notify() })
  })
})

describe('the edit select and the frozen draft preview', () => {
  it('the day-head select appears with drafts alone and carries them by name', async () => {
    await resetDrafts()
    expect($(`#eWeek select[data-dver="0"]`)).toBeFalsy()   // nothing published, no drafts
    await act(async () => { draftDup(0); notify() })
    const sel = $(`#eWeek select[data-dver="0"]`) as unknown as HTMLSelectElement
    expect(sel, 'select appears once drafts exist').toBeTruthy()
    const opts = [...sel.options].map(o => [o.value, o.text])
    /* Live names the selected draft; the OTHER draft rides as d:<id>; no
       ORIG/AL entries exist on an unpublished day */
    expect(opts).toEqual([
      ['live', 'Live · Draft 2'],
      ['d:' + dayDrafts(0)[0].id, 'Draft 1'],
    ])
  })

  it('picking a draft freezes it read-only with the banner and NO restore button', async () => {
    const sel = $(`#eWeek select[data-dver="0"]`) as unknown as HTMLSelectElement
    await pick(sel, 'd:' + dayDrafts(0)[0].id)
    const day = () => $(`#eWeek .day[data-day="0"]`)
    expect(day().className).toContain('preview')
    expect(day().querySelector('.dprev-bar')!.textContent).toContain('Viewing Draft 1 — a draft, read-only')
    expect(day().querySelector('.dprev-restore')).toBeFalsy()
    expect(day().querySelector('[data-restore]')).toBeFalsy()
    expect(day().querySelectorAll('[data-slot],[data-fill],[draggable="true"]').length).toBe(0)
    await pick($(`#eWeek select[data-dver="0"]`) as unknown as HTMLSelectElement, 'live')
    expect(day().className).not.toContain('preview')
  })

  it('the board select carries the draft entries too', async () => {
    await click($('#eWeek .day[data-day="0"] .dow.sb-open'))
    const sel = $('#schedBoard select.dver') as unknown as HTMLSelectElement
    expect(sel).toBeTruthy()
    const vals = [...sel.options].map(o => o.value)
    expect(vals).toContain('d:' + dayDrafts(0)[0].id)
    expect([...sel.options].find(o => o.value === 'live')!.text).toBe('Live · Draft 2')
    await click($('#sbClose'))
  })

  it('the day head wears the selected draft’s chip on the edit week', async () => {
    const chip = $(`#eWeek .day[data-day="0"] .ddraft`)
    expect(chip).toBeTruthy()
    expect(chip.textContent).toBe('Draft 2')
  })
})

describe('the view-only week', () => {
  it('no picker without drafts; a compact drafts-only picker with them', async () => {
    await resetDrafts()
    await act(async () => { setPage('viewsched'); notify() })
    expect($$('#vWeek select[data-dver]').length).toBe(0)
    await act(async () => { draftDup(0); notify() })
    const sels = $$('#vWeek select[data-dver]')
    expect(sels.length).toBe(1)                       // only the day that has drafts
    const opts = [...(sels[0] as unknown as HTMLSelectElement).options].map(o => [o.value, o.text])
    /* list order — the selected draft IS the live day (value 'live', marked);
       the other is a d: ver — and no AL/ORIG version entries ever appear on
       the view page */
    expect(opts).toEqual([
      ['d:' + dayDrafts(0)[0].id, 'Draft 1'],
      ['live', 'Draft 2 ●'],
    ])
    expect(opts.some(([v]) => v === 'orig' || /^\d+$/.test(v!))).toBe(false)
  })

  it('viewing a draft freezes it with the read-only banner, no restore, no controls', async () => {
    const sel = $('#vWeek select[data-dver="0"]') as unknown as HTMLSelectElement
    await pick(sel, 'd:' + dayDrafts(0)[0].id)
    const day = () => $(`#vWeek .day[data-day="0"]`)
    expect(day().className).toContain('preview')
    expect(day().querySelector('.dprev-bar')!.textContent).toContain('a draft, read-only')
    expect(day().querySelector('[data-restore]')).toBeFalsy()
    expect(day().querySelectorAll('[data-slot],[data-fill],[draggable="true"]').length).toBe(0)
    /* back to the live (selected) draft */
    await pick($('#vWeek select[data-dver="0"]') as unknown as HTMLSelectElement, 'live')
    expect(day().className).not.toContain('preview')
  })

  it('an edit-page ORIG/AL preview never leaks onto the view week', async () => {
    /* an AL-machinery preview parked on the edit page renders the LIVE day
       here — the view page shows issued schedules and draft previews only */
    setDayPreview(1, 'orig')
    await act(async () => { notify() })
    expect($(`#vWeek .day[data-day="1"] .dprev-bar`)).toBeFalsy()
    setDayPreview(1, null)
    await act(async () => { setPage('editsched'); notify() })
  })
})

describe('the manage modal (DraftsModal)', () => {
  it('opens from a row’s pencil pre-selected on that draft, scoped to the day', async () => {
    await resetDrafts()
    await act(async () => { draftDup(0); notify() })
    await click($('#eWeek [data-draftsopen="0"]'))
    await click($$('.wavemenu [data-draftedit]')[0]!)   // Draft 1's own pencil
    expect(($('#draftsModal') as any).hidden).toBe(false)
    expect($('#draftsModal .modal-head')!.textContent).toContain(DAYS[0].dow)
    expect($$('#draftsModal .tpl-tab').length).toBe(2)
    expect($$('#draftsModal .tpl-tab.on')[0]!.textContent).toBe('Draft 1')
    /* the selected (live) draft's tab is marked, and the hint says what publishes */
    expect($$('#draftsModal .tpl-tab')[1]!.textContent).toContain('●')
    expect($('#draftsModal .wm-note')!.textContent).toContain('publishes')
  })

  it('renames on commit, refuses a duplicate name with a toast', async () => {
    await typeCommit($('#draftsModal .tpl-name'), 'Wet weather')
    expect(dayDrafts(0)[0].name).toBe('Wet weather')
    const toasts = await withToasts(async () => {
      await typeCommit($('#draftsModal .tpl-name'), 'Draft 2')
    })
    expect(dayDrafts(0)[0].name).toBe('Wet weather')   // refused, kept
    expect(toasts.some(t => t.includes('already has that name'))).toBe(true)
  })

  it('Delete is disabled on the live draft, with the reason, and works elsewhere', async () => {
    /* Draft 1 ("Wet weather") is open — deletable, it is not the live one */
    const del = () => $$('#draftsModal .abtn.danger').find(b => b.textContent === 'Delete draft') as HTMLButtonElement
    expect(del().disabled).toBe(false)
    /* switch the modal to the live draft — Delete locks with the reason */
    await click($$('#draftsModal .tpl-tab')[1]!)
    expect(del().disabled).toBe(true)
    expect(del().title).toContain('switch to another draft first')
    /* back to the stored one and delete it — owner audit, 15 Aug 26: the
       menu's own create/select actions already toast (draftDup/switchDraft
       in board.ts); this modal's own delete did not */
    await click($$('#draftsModal .tpl-tab')[0]!)
    const toasts = await withToasts(async () => { await click(del()) })
    expect(dayDrafts(0).length).toBe(1)
    expect(dayDrafts(0)[0].name).toBe('Draft 2')       // the live one survives
    expect(toasts).toContain('"Wet weather" draft deleted')
  })

  it('Select makes the open draft the live day', async () => {
    /* mint a third plan to switch to: Draft 3 becomes live, then reopen the
       modal on Draft 2 and Select it back */
    await act(async () => { draftDup(0); notify() })
    await click($('#eWeek [data-draftsopen="0"]'))
    await click($$('.wavemenu [data-draftedit]')[0]!)   // Draft 2's pencil (not live)
    const selBtn = $$('#draftsModal .abtn').find(b => b.textContent === 'Select') as HTMLButtonElement
    expect(selBtn.disabled).toBe(false)
    await click(selBtn)
    expect(curDraftId(0)).toBe(dayDrafts(0)[0].id)      // Draft 2 is live again
    await click($('#draftsClose'))
    expect(($('#draftsModal') as any).hidden).toBe(true)
  })
})
