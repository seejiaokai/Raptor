// @vitest-environment jsdom
/* The edit week — tfin's B22 (per-day sign-off), B26/B47 (publish day),
   B49 (per-day AL) and U (arm-and-plant) flows, driven through the React
   edit page end to end. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeSlot, setPage } from '../state/store'
import { SCHED, dayApproved } from '../engine/publish'
import { slotVal } from '../engine/slots'
import { isScheduler, PEOPLE } from '../engine/people'
import { availByWave } from '../engine/avail'
import { DAYS } from '../engine/data'
import { armedKey } from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* sign one day through its own strip, like tfin's signDay */
const signDay = async (di: number, off = 0) => {
  for (const [i, k] of (['cur', 'sked', 'plan', 'appr'] as const).entries()) {
    const sel = $(`#eWeek .day[data-day="${di}"] select[data-sign="${k}"]`) as unknown as HTMLSelectElement
    expect(sel, `sign select ${k}@${di}`).toBeTruthy()
    await act(async () => {
      sel.value = sel.options[(off || 0) + i + 2]!.value
      sel.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }
}
const dayBtn = (di: number) => $(`#eWeek button.dbeak[data-beak="${di}"]`) as HTMLButtonElement

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})

describe('the edit page (tfin)', () => {
  it('draft banner, and it names no days', () => {
    expect(/DRAFT/.test($('#eBanner').textContent!)).toBe(true)
    expect(/no days published/.test($('#eBanner').textContent!)).toBe(true)
  })

  it('every day carries its own sign-off strip with the four roles', () => {
    expect($$('#eWeek .signoff.day-sign').length).toBe($$('#eWeek .day').length)
    const bar = $('#eWeek .day[data-day="0"] .signoff.day-sign')
    expect(bar.querySelectorAll('select[data-sign]').length).toBe(4)
    expect(['CUR CK', 'SKED CK', 'PLANNED BY', 'APPROVED BY'].every(k => bar.textContent!.includes(k))).toBe(true)
  })

  it('the three scheduling roles offer ONLY appointed schedulers', () => {
    const bar = $('#eWeek .day[data-day="0"] .signoff.day-sign')
    expect((['sked', 'plan', 'appr'] as const).every(k =>
      [...(bar.querySelector(`select[data-sign="${k}"]`) as HTMLSelectElement).options]
        .slice(1).every(o => isScheduler(o.value)))).toBe(true)
  })

  it('the view page shows no sign-off strip', () => {
    expect($$('#vWeek .signoff').length).toBe(0)
  })

  it('publish day is locked while unsigned, and cannot be clicked through', async () => {
    expect(dayBtn(0).disabled).toBe(true)
    await click(dayBtn(0))
    expect($(`#eWeek .day[data-day="0"].dok`)).toBeFalsy()
  })

  it('all four signatures unlock the day; signing one day leaves the others locked', async () => {
    await signDay(0)
    expect(dayBtn(0).disabled).toBe(false)
    expect(dayBtn(1).disabled).toBe(true)
  })

  it('publishing marks the day, spends its signature, updates the banner', async () => {
    await click(dayBtn(0))
    expect(dayApproved(0)).toBe(true)
    expect($(`#eWeek .day[data-day="0"].dok`)).toBeTruthy()
    expect(/Published/.test(dayBtn(0).textContent!)).toBe(true)
    expect([...$$(`#eWeek .day[data-day="0"] select[data-sign]`)].every((s: any) => s.value === '')).toBe(true)
    expect(/PART-PUBLISHED/.test($('#eBanner').textContent!)).toBe(true)
  })

  it('an edit on the published day grows a per-day AL button, gated on signing', async () => {
    const key = 'd:0.0.0'
    const before = slotVal(key)
    await act(async () => { writeSlot(key, before === 'casper' ? 'vinci' : 'casper') })
    const alBtn = $(`#eWeek .day[data-day="0"] button[data-alpub]`) as HTMLButtonElement
    expect(alBtn).toBeTruthy()
    expect(alBtn.disabled).toBe(true)              // publishing spent the signatures
    expect($(`#eWeek .day[data-day="4"] button[data-alpub]`)).toBeFalsy()
    await signDay(0, 1)
    const alBtn2 = $(`#eWeek .day[data-day="0"] button[data-alpub]`) as HTMLButtonElement
    expect(alBtn2.disabled).toBe(false)
    await click(alBtn2)
    expect(SCHED.als.length).toBe(1)
    expect(/AL1/.test($('#eBanner').textContent!)).toBe(true)
    expect($$('#eWeek [data-alc="1"]').length).toBeGreaterThanOrEqual(1)
    expect(/AL1/.test($('#alPanel').textContent!)).toBe(true)
  })

  it('unpublish returns the AL to pending', async () => {
    await click($('#alPanel [data-alun]'))
    expect(SCHED.als.length).toBe(0)
    expect($$('#eWeek [data-alc="1"]').length).toBe(0)
  })

  it('undo / redo buttons work the slot', async () => {
    const key = '0.0.0.0.p'
    const before = slotVal(key)
    await act(async () => { writeSlot(key, 'casper') })
    await click($('#undoBtn'))
    expect(slotVal(key)).toBe(before)
    await click($('#redoBtn'))
    expect(slotVal(key)).toBe('casper')
    await click($('#undoBtn'))
  })

  it('arm-and-plant: an empty slot arms, reasons print on the list, every tap plants', async () => {
    const key = '0.0.0.0.p'
    const before = slotVal(key)
    await act(async () => { writeSlot(key, '') })
    await click($(`#eWeek .seat[data-slot="${key}"], #eWeek .empty-slot[data-slot="${key}"]`))
    expect(armedKey()).toBe(key)
    expect(/Planning/.test($('#eRoster .ros-arm')!.textContent!)).toBe(true)
    /* a darkened name says WHY on the list itself while a slot is armed
       (13 Aug 26 — a phone has no hover, and the rule is the scheduler sees
       the problem BEFORE the tap). Every WSO shares the front-seat reason,
       so it reads ONCE under that column's header rather than fifteen times */
    const wsoCol = $$('#eRoster .rcol').find(c => /WSO/i.test(c.querySelector('.rh')!.textContent!))!
    expect(wsoCol.querySelector(':scope > .rwhy')!.textContent).toMatch(/front seat/)
    const bad = $$('#eRoster .rpuck.no').find(x => PEOPLE[x.dataset.person!]?.seat === 'RCP')!
    expect(bad.classList.contains('haswhy')).toBe(false)   // the column already said it
    /* while armed the day-wide fade is OFF (owner, 14 Aug 26): grey read as
       "not available" when the question is "who can take THIS slot" — a name
       is either normal (plannable) or struck through with its reason */
    expect($$('#eRoster .rpuck.busy').length).toBe(0)
    expect($$('#eRoster .rpuck.standby').length).toBe(0)
    /* ...and the tap PLANTS anyway (owner, 13 Aug 26 — "everything plants,
       warning after"), putting the slot down exactly like an eligible tap */
    await click(bad)
    expect(slotVal(key)).toBe(bad.dataset.person)
    expect(armedKey()).toBe('')
    /* an eligible name plants the same way */
    await act(async () => { writeSlot(key, '') })
    await click($(`#eWeek .seat[data-slot="${key}"], #eWeek .empty-slot[data-slot="${key}"]`))
    const good = $$('#eRoster .rpuck:not(.no)').find(x => !PEOPLE[x.dataset.person!]?.special)!
    await click(good)
    expect(slotVal(key)).toBe(good.dataset.person)
    expect(armedKey()).toBe('')
    await act(async () => { writeSlot(key, before) })
  })

  /* tfin #17. The Edit-mode toggle used to be what this switched off; it was
     removed 9 Aug 26 (owner) and the PAGE is the switch now, so "not in edit
     mode" is reached by leaving Edit Schedule. The section stays in the DOM
     either way (only its `on` class moves), so the same stale seat element is
     still there to right-click — which is exactly the hostile case worth
     pinning: the handler must refuse on the element, not rely on it being
     unreachable. */
  it('right-click clears a filled slot — but only in edit mode (tfin #17)', async () => {
    const key = '0.0.0.0.p'
    const id = slotVal(key)
    expect(id).toBeTruthy()
    /* off the edit page: the right button may not change a thing */
    await act(async () => { setPage('viewsched'); notify() })
    await act(async () => { $(`#eWeek .seat[data-slot="${key}"]`)!.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })) })
    expect(slotVal(key)).toBe(id)
    /* back on Edit Schedule: it clears */
    await act(async () => { setPage('editsched'); notify() })
    await act(async () => { $(`#eWeek .seat[data-slot="${key}"]`)!.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })) })
    expect(slotVal(key)).toBe('')
    await act(async () => { writeSlot(key, id) })
  })

  it('the view page stays read-only', async () => {
    expect($$('#vWeek [data-fill]').length).toBe(0)
    expect($$('#vWeek [draggable="true"]').length).toBe(0)
  })

  /* the version dropdown: publish → edit → preview a version → restore it.
     Driven through the real surfaces: the day-head <select> via the document
     change listener, the restore button via routeClick. Restore is a ROLLBACK:
     the version becomes live at once, the edit is discarded, nothing pends. */
  it('version dropdown previews a published version and rolls back to it', async () => {
    /* Monday is still published from the publish-day test above — dayBtn would
       TOGGLE it back to draft. Publish only if some earlier state changed. */
    if (!dayApproved(0)) { await signDay(0); await click(dayBtn(0)) }
    const key = '0.0.0.0.p', before = slotVal(key)
    await act(async () => { writeSlot(key, 'casper') })
    const sel = $(`#eWeek select[data-dver="0"]`) as unknown as HTMLSelectElement
    expect(sel, 'version dropdown on Monday').toBeTruthy()
    expect($$(`#eWeek select[data-dver]`).length).toBe(1)   // only the published day
    await act(async () => {
      sel.value = 'orig'
      sel.dispatchEvent(new Event('change', { bubbles: true }))
    })
    const day = () => $(`#eWeek .day[data-day="0"]`)
    expect(day().className).toContain('preview')
    expect(day().querySelectorAll('[data-slot],[data-fill],[draggable="true"]').length).toBe(0)
    expect(day().querySelector('.dprev-bar')).toBeTruthy()
    expect(slotVal(key)).toBe('casper')        // the MODEL is untouched by previewing
    /* RE-POINTED (15 Aug 26): the view page never gets the ORIG/AL version
       machinery — this day has published versions and NO drafts, so it shows
       no select at all. Once a day has DRAFTS the view page grows a compact
       drafts-only picker (never AL/ORIG entries) — pinned in
       draftsui.test.tsx's view-only block. */
    expect($$('#vWeek select[data-dver]').length).toBe(0)
    await click(day().querySelector('.dprev-restore'))
    expect(day().className).not.toContain('preview')
    expect(slotVal(key)).toBe(before)          // the rollback reverted the seat
    expect(SCHED.pending[key]).toBeUndefined() // discarded, not re-pended
    expect(Object.keys(SCHED.pending)).toEqual([])
    expect(dayApproved(0)).toBe(true)          // the day stays published
    /* put the file's shared state back */
    await act(async () => {
      SCHED.pending = {}; SCHED.dayOK = {}; SCHED.orig = {}; SCHED.sign = {}; SCHED.cur = {}
      notify()
    })
  })

  /* the chip lifecycle end-to-end: AL1 chip on issue → grey ORIG after a
     rollback to the Original → a fresh edit previews as the next AL (AL2) */
  it('the day head chip follows the current version through a rollback', async () => {
    await signDay(0)
    await click(dayBtn(0))                     // publish → no chip yet (no ALs)
    expect($(`#eWeek .day[data-day="0"] .dal`)).toBeNull()
    const key = '0.0.0.0.p'
    await act(async () => { writeSlot(key, 'casper') })
    await signDay(0)
    await click($(`#eWeek button[data-alpub="0"]`))         // AL1 goes out
    const chip = () => $(`#eWeek .day[data-day="0"] .dal`)
    expect(chip(), 'chip after AL1').toBeTruthy()
    expect(chip()!.textContent).toBe('AL1')
    expect($$(`#eWeek .day[data-day="0"] .dal`).length).toBe(1)
    /* roll back to the Original through the real preview surface */
    const sel = $(`#eWeek select[data-dver="0"]`) as unknown as HTMLSelectElement
    await act(async () => {
      sel.value = 'orig'
      sel.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await click($(`#eWeek .day[data-day="0"] .dprev-restore`))
    expect(chip()!.classList.contains('orig'), 'grey ORIG chip').toBe(true)
    expect(chip()!.textContent).toBe('ORIG')
    expect(Object.keys(SCHED.pending)).toEqual([])          // rollback pends nothing
    /* a NEW edit after the rollback previews as the next AL */
    await act(async () => { writeSlot(key, 'casper') })
    const seat = $(`#eWeek .seat[data-slot="${key}"]`)
    expect(seat!.getAttribute('data-aln')).toBe('2')
    /* put the file's shared state back */
    await act(async () => {
      writeSlot(key, '')
      SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []; SCHED.al = 0
      SCHED.dayOK = {}; SCHED.orig = {}; SCHED.sign = {}; SCHED.cur = {}
      notify()
    })
  })
})

/* The Available-crew panel folds to one line by default (owner, 13 Aug 26 —
   "the window is pretty big"), and its expanded wave lines count everyone who
   can fly the wave — the all-day crew included — because the old
   leftovers-only count printed "— none free —" over a wave 22 people could
   fly, which the owner read as a bug. */
describe('the Available-crew panel folds (owner, 13 Aug 26)', () => {
  it('collapsed to one line by default; expanded counts everyone who can fly', async () => {
    const day = () => $(`#eWeek .day[data-day="0"]`)
    expect(day().querySelector('.availpuck .ap-grid')).toBeFalsy()
    const head = () => day().querySelector('.ap-h[data-avtog="0"]') as HTMLElement
    expect(head()).toBeTruthy()
    expect(head().textContent).toMatch(/all day/)
    await click(head())
    expect(day().querySelectorAll('.availpuck .ap-grid').length).toBeGreaterThan(0)
    const A = availByWave(DAYS[0])
    const act0 = (ids: any[]) => ids.filter(id => !PEOPLE[id].san)
    const total = act0(A.byWave[0]).length + act0(A.anyWave).length
    const grp = [...day().querySelectorAll('.availpuck .ap-grp')].find(g => /wave/i.test(g.textContent!))!
    expect(grp.textContent).toContain(`· ${total} can fly`)
    await click(head())
    expect(day().querySelector('.availpuck .ap-grid')).toBeFalsy()
  })
})
