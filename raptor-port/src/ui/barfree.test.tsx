// @vitest-environment jsdom
/* THE BAR STAYS PRESSABLE OVER THREE MORE WINDOWS (owner D1645, 5 Nov 26 — ui/barfree.ts), AND TRAFFIC IS READ ONLY ON
   VIEW-ONLY SCHED (owner D1647). Through the real App and the real buttons, as trafficwin.test.tsx pins the Traffic window:
   · "Jump to a date", the day-details window and the document viewer stay open through Undo; any other control of the bar
     (the bell) closes each first;
   · Escape still closes "Jump to a date" once the keys have gone to Undo — it was heard only inside the calendar — and the
     keys go back to its opener; the day-details window the same;
   · a week change closes the day-details window, a page change the calendar and the viewer (an undo can land on either);
   · the viewer shows its input as it now stands after an undo put the inputs back as new records, and closes when the
     input is gone;
   · on View-only Sched an admin's Traffic window is the member's read list — no box, no ✕, no Add row — and nothing it
     holds can write (each write asks the same as the drawing, Modals.tsx airEditable); on Edit Schedule it is the editing window still.
   jsdom has no layout, so a press reaches the bar here whatever covers it: what the veil lets through is the browser
   test's (e2e/keys-windows.spec.ts). Every case is red on the code before this change but the ones marked as pins. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, loadWeek } from '../state/store'
import * as view from '../state/view'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { INPUTS } from '../engine/inputs'
import { shiftWeek } from './weeknav'
import { AIRKEY, setAirKey, DAYPOP, setDayPop, WEEKCAL, setWeekCal, DOCVIEW, setDocView } from './pops'
import { installGlobalUndo } from '../state/undo-wire'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const key = async (k: string) => {
  await act(async () => {
    const at = (document.activeElement as HTMLElement) || document.body
    at.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))
  })
}
const tick = () => act(async () => { await new Promise(r => setTimeout(r, 10)) })
const goPage = async (p: string) => click($$('.nav a[data-page]').find(a => a.dataset.page === p)!)
const flyWave = (di: number) => DAYS[di].waves.findIndex((w: any) => w && !w.sa)
const shown = (id: string) => !!$(`#${id}`) && !($(`#${id}`) as any).hidden
/* an undoable change made on the week: a line of traffic added through its own window, the window closed again */
const change = async () => {
  await click($(`#eWeek [data-air="0|${flyWave(0)}"]`))
  await click($('#airAdd'))
  await click($('#airDone'))
}

beforeAll(async () => {
  initStore()
  installGlobalUndo()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await goPage('editsched')
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})
beforeEach(async () => {
  await act(async () => { setAirKey(null); setDayPop(null); setWeekCal(false); setDocView(null); notify() })
  if (view.CURPAGE !== 'editsched') await goPage('editsched')
  ;(document.activeElement as HTMLElement | null)?.blur?.()
})

describe('[D1645] Jump to a date', () => {
  const calBtn = () => $$('button[aria-label="Jump to a date"]')[0]!
  it('stays open through Undo; the bell closes it first', async () => {
    await change()
    await click(calBtn())
    expect(shown('weekCal')).toBe(true)
    await click($('#undoBtn'))
    expect(WEEKCAL, 'Undo leaves it open (a pin: jsdom always let this press through)').not.toBe(false)
    await click($('#notifyBell'))
    expect(WEEKCAL, 'the bell closed it').toBe(false)
    await act(async () => { document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })) })
  })
  it('Escape closes it after the keys went to Undo, and the keys go back to the calendar button', async () => {
    await change(); await change()                   // two, so Undo is still a button to hold the keys after one
    const b = calBtn()
    b.focus()
    await click(b)
    expect(shown('weekCal')).toBe(true)
    await tick()                                      // the calendar puts the keys on its month arrow a moment after it opens
    $('#undoBtn').focus()
    await click($('#undoBtn'))
    expect(document.activeElement).toBe($('#undoBtn'))
    await key('Escape')
    expect(WEEKCAL, 'Escape closed it').toBe(false)
    expect(document.activeElement, 'the keys are back on the calendar button').toBe(calBtn())
  })
  it('a page change closes it', async () => {
    await click(calBtn())
    await act(async () => { view.setPage('viewsched'); notify() })
    expect(WEEKCAL).toBe(false)
  })
})

describe('[D1645] the day-details window', () => {
  it('stays open through Undo, reading the day afresh; the bell closes it first', async () => {
    await change()
    await click($('#eWeek .day[data-day="0"] .dinfobtn'))
    expect(shown('dayPop')).toBe(true)
    await click($('#undoBtn'))
    expect(DAYPOP, 'Undo leaves it open (a pin)').toBe(0)
    await click($('#notifyBell'))
    expect(DAYPOP, 'the bell closed it').toBe(null)
    await act(async () => { document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })) })
  })
  it('closed by Escape with the keys on Undo, the keys go back to its ⓘ', async () => {
    await change(); await change()
    const info = $('#eWeek .day[data-day="0"] .dinfobtn')
    info.focus()
    await click(info)
    $('#undoBtn').focus()
    await click($('#undoBtn'))
    await key('Escape')
    expect(DAYPOP).toBe(null)
    const a = document.activeElement as HTMLElement
    expect(a.classList.contains('dinfobtn') && !!a.closest('.day[data-day="0"]'), 'the keys are back on the day\'s ⓘ').toBe(true)
  })
  it('a week change and a page change close it', async () => {
    await click($('#eWeek .day[data-day="1"] .dinfobtn'))
    const wk = CURWEEK
    await act(async () => { loadWeek(shiftWeek(wk, 1)) })
    expect(DAYPOP, 'a week change').toBe(null)
    await act(async () => { loadWeek(wk) })
    await click($('#eWeek .day[data-day="1"] .dinfobtn'))
    await act(async () => { view.setPage('viewsched'); notify() })
    expect(DAYPOP, 'a page change').toBe(null)
  })
})

describe('[D1645] the document viewer', () => {
  const med = () => INPUTS.find((r: any) => r.iid != null && /med|dnif|downchit/i.test(String(r.type))) || INPUTS.find((r: any) => r.iid != null)!
  it('the bell closes it first; a page change closes it', async () => {
    await act(async () => { setDocView({ row: med() }); notify() })
    expect(shown('docViewPop')).toBe(true)
    await click($('#notifyBell'))
    expect(DOCVIEW, 'the bell closed it').toBe(null)
    await act(async () => { document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })) })
    await act(async () => { setDocView({ row: med() }); notify() })
    await act(async () => { view.setPage('inputs'); notify() })
    expect(DOCVIEW, 'a page change').toBe(null)
  })
  it('shows its input as it now stands when an undo put the inputs back as new records, and closes when it is gone', async () => {
    const r: any = med()
    const at = INPUTS.indexOf(r)
    await act(async () => { setDocView({ row: r }); notify() })
    /* what an undo does to the list: every record put back as a new object — here with other remarks */
    const again = { ...structuredClone(r), remarks: 'PUT BACK BY AN UNDO' }
    await act(async () => { INPUTS[at] = again; notify() })
    expect($('#docViewPop .docview-sub').textContent, 'the record as it now stands').toContain('PUT BACK BY AN UNDO')
    await act(async () => { INPUTS.splice(at, 1); notify() })
    expect(DOCVIEW, 'the input gone: the viewer closed').toBe(null)
    await act(async () => { INPUTS.splice(at, 0, r); notify() })
  })
  /* the fresh read's F5 (5 Nov 26): an episode of several entries — an Undo that takes one away drops its page; the last gone
     closes the viewer */
  it('an episode of two: the entry an undo took away leaves the pager; the last one gone closes the viewer', async () => {
    const all = INPUTS.filter((r: any) => r.iid != null)
    const a: any = all[0], b: any = all[1]
    await act(async () => { setDocView({ row: a, rows: [{ row: a }, { row: b }], idx: 0 }); notify() })
    expect($('#docViewPop .docview-count')?.textContent, 'two pages').toBe('1 of 2')
    const ib = INPUTS.indexOf(b)
    await act(async () => { INPUTS.splice(ib, 1); notify() })
    expect($('#docViewPop .docview-count'), 'one page left: no pager').toBeNull()
    expect(DOCVIEW, 'still open on the entry that stands').not.toBe(null)
    const ia = INPUTS.indexOf(a)
    await act(async () => { INPUTS.splice(ia, 1); notify() })
    expect(DOCVIEW, 'none left: closed').toBe(null)
    await act(async () => { INPUTS.splice(Math.min(ia, ib), 0, ...(ia < ib ? [a, b] : [b, a])); notify() })
  })
  /* the narrow read of those fixes, G1: an entry IN FRONT of the page shown goes — the page shown stays the same entry */
  it('an episode of three, the second shown: an undo that takes the first away leaves the second on screen ("1 of 2")', async () => {
    const all = INPUTS.filter((r: any) => r.iid != null && !(r.docIds && r.docIds.length) && !r.docId)
    const [a, b, c]: any[] = all
    await act(async () => { setDocView({ row: b, rows: [{ row: a }, { row: b }, { row: c }], idx: 1 }); notify() })
    expect($('#docViewPop .docview-count')?.textContent).toBe('2 of 3')
    const said = $('#docViewTitle').textContent
    const ia = INPUTS.indexOf(a)
    await act(async () => { INPUTS.splice(ia, 1); notify() })
    expect($('#docViewPop .docview-count')?.textContent, 'the same entry, now the first of two').toBe('1 of 2')
    expect($('#docViewTitle').textContent, 'still the entry he was reading').toBe(said)
    await act(async () => { INPUTS.splice(ia, 0, a); notify() })
    expect($('#docViewPop .docview-count')?.textContent, 'a Redo brings the first back: still the same entry').toBe('2 of 3')
    expect($('#docViewTitle').textContent).toBe(said)
    await act(async () => { setDocView(null); notify() })
  })
  /* the round-2 read's H2: the page shown is itself gone (an undo took that FILE away) — the same entry's other page is shown,
     not the next entry's */
  it('on the second file of an entry with two, that file taken away: its first file is shown, not the next entry', async () => {
    const all = INPUTS.filter((r: any) => r.iid != null && !(r.docIds && r.docIds.length) && !r.docId)
    const [a, b, c]: any[] = all
    const ib = INPUTS.indexOf(b)
    await act(async () => { INPUTS[ib] = { ...b, docIds: ['kw-f1', 'kw-f2'] }; notify() })
    await act(async () => { setDocView({ row: INPUTS[ib], docId: 'kw-f2', rows: [{ row: a }, { row: INPUTS[ib] }, { row: c }], idx: 1 }); notify() })
    expect($('#docViewPop .docview-count')?.textContent, 'b\'s second file').toBe('3 of 4')
    await act(async () => { INPUTS[ib] = { ...b, docIds: ['kw-f1'] }; notify() })
    expect($('#docViewPop .docview-count')?.textContent, 'b\'s first file, not c').toBe('2 of 3')
    await act(async () => { INPUTS[ib] = b; setDocView(null); notify() })
  })
  it('a read-only page (a Leave War request\'s papers) is shown as given, never closed for want of an input', async () => {
    await act(async () => { setDocView({ row: { iid: 'not-an-input', person: 'bane', type: 'LL', date: 'Jul 13', yr: 2026, remarks: 'as given' }, readOnly: true }); notify() })
    expect(shown('docViewPop')).toBe(true)
    expect($('#docViewPop .docview-sub').textContent).toContain('as given')
  })
})

describe('[D1647] Traffic on View-only Sched is the read list, for an admin too', () => {
  it('no box, no ✕, no Add row on View-only Sched; the editing window on Edit Schedule', async () => {
    await goPage('viewsched')
    const b = $$('#vWeek [data-air]')[0]
    expect(b, 'a Traffic button on View-only Sched').toBeTruthy()
    await click(b)
    expect(AIRKEY).not.toBe(null)
    expect($$('#airBody [data-airi]').length, 'no typing boxes').toBe(0)
    expect($$('#airBody [data-airdel]').length, 'no ✕').toBe(0)
    expect($('#airAdd'), 'no Add row').toBeNull()
    expect($('#airBody .airview'), 'the read list a member sees').toBeTruthy()
    await click($('#airClose'))
    await goPage('editsched')
    await click($(`#eWeek [data-air="0|${flyWave(0)}"]`))
    expect($('#airAdd'), 'Edit Schedule keeps the editing window').toBeTruthy()
  })
})
