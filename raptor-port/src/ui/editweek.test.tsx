// @vitest-environment jsdom
/* The edit week — tfin's B22 (per-day sign-off), B26/B47 (publish day),
   B49 (per-day AL) and U (arm-and-plant) flows, driven through the React
   edit page end to end. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeSlot } from '../state/store'
import { SCHED, dayApproved } from '../engine/publish'
import { slotVal } from '../engine/slots'
import { isScheduler, PEOPLE } from '../engine/people'
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

  it('arm-and-plant: an empty slot arms, the palette plants, darkened names refuse', async () => {
    const key = '0.0.0.0.p'
    const before = slotVal(key)
    await act(async () => { writeSlot(key, '') })
    await click($(`#eWeek .seat[data-slot="${key}"], #eWeek .empty-slot[data-slot="${key}"]`))
    expect(armedKey()).toBe(key)
    expect(/Planning/.test($('#eRoster .ros-arm')!.textContent!)).toBe(true)
    /* a darkened name (a WSO on a front seat) does not plant */
    const bad = $$('#eRoster .rpuck.no').find(x => PEOPLE[x.dataset.person!]?.seat === 'RCP')!
    await click(bad)
    expect(slotVal(key)).toBe('')
    expect(armedKey()).toBe(key)                   // still armed after a refusal
    /* a name still showing plants on the first tap */
    const good = $$('#eRoster .rpuck:not(.no)').find(x => !PEOPLE[x.dataset.person!]?.special)!
    await click(good)
    expect(slotVal(key)).toBe(good.dataset.person)
    expect(armedKey()).toBe('')
    await act(async () => { writeSlot(key, before) })
  })

  it('right-click clears a filled slot — but only with Edit mode ON (tfin #17)', async () => {
    const key = '0.0.0.0.p'
    const id = slotVal(key)
    expect(id).toBeTruthy()
    /* Edit mode OFF: the right button may not change a thing */
    await click($('#editToggle'))
    await act(async () => { $(`#eWeek .seat[data-slot="${key}"]`)!.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })) })
    expect(slotVal(key)).toBe(id)
    /* Edit mode ON: it clears */
    await click($('#editToggle'))
    await act(async () => { $(`#eWeek .seat[data-slot="${key}"]`)!.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })) })
    expect(slotVal(key)).toBe('')
    await act(async () => { writeSlot(key, id) })
  })

  it('the view page stays read-only', async () => {
    expect($$('#vWeek [data-fill]').length).toBe(0)
    expect($$('#vWeek [draggable="true"]').length).toBe(0)
  })
})
