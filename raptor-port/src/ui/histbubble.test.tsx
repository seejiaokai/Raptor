// @vitest-environment jsdom
/* HISTORY on the board (owner, 11 Aug 26) — the toggle, the bubble on one
   detail, and the listed view.

   What this file can and cannot prove: jsdom has no layout engine, so every
   rect it reports is 0x0. It pins WHICH element was emitted, what it says,
   and — the one that matters most — that a tap which raises a bubble still
   arms the seat underneath it. Where the bubble actually lands on screen,
   and whether it stays inside a phone viewport, is measured in
   e2e/geometry.spec.ts, which is the only place it can be. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { setSlotVal, slotVal, txtSet } from '../engine/slots'
import { elogClear, elogAllFor, elogVal } from '../engine/editlog'
import { HOOKS } from '../engine/hooks'
import * as view from '../state/view'
import { openScheduler, closeScheduler } from './board'
import { hideHistBub } from './histbubble'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const hover = async (el: Element) => {
  await act(async () => { el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })) })
}
const bub = () => document.querySelector('.histbub') as HTMLElement | null
/* the way in: History on, then the last line of the day's checks panel. It is
   not a top-bar button — two controls up there took the phone bar past the
   geometry gate's height, so the list moved here (board.ts, boardWarnHTML). */
const openList = async () => {
  if (!view.HISTMODE) await act(async () => { view.setHistMode(true); notify() })
  await click($('#sbWarn [data-histopen]'))
}

let phone = false
beforeAll(async () => {
  initStore()
  HOOKS.isPhone = () => phone
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  await act(async () => { openScheduler(0) })
})

/* Unmount before the file ends: a render task left queued by the last test
   would otherwise fire after vitest tears jsdom down and die with "window is
   not defined" — an unhandled error that fails the job while every test
   passed (the teardown race closed across the suite, 10 Sep 26). */
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})

beforeEach(async () => {
  phone = false
  elogClear()
  hideHistBub()
  SCHED.pending = {}; SCHED.changes = {}; SCHED.dayOK = {}; SCHED.sign = {}
  await act(async () => { view.setChgWin(null); notify() })
})
afterEach(() => hideHistBub())

/* An edited seat that is actually on screen, so a hover has a real target.
   The model is NOT reset between tests here (only the log and the pending
   marks are), so this plants whichever of the two names the seat is not
   already holding — writing the value a seat already has is correctly a
   no-op all the way down, which would leave nothing to hover. */
async function editedSeat() {
  const el = $$('#sbBoard [data-slot]').find(e => /\.[pw]$/.test(e.dataset.slot || ''))!
  expect(el, 'the board rendered a seat').toBeTruthy()
  const key = el.dataset.slot!
  await act(async () => { setSlotVal(key, slotVal(key) === 'bane' ? 'stiff' : 'bane'); notify() })
  /* the panels are re-hung by a string diff, so re-find rather than reuse */
  return $(`#sbBoard [data-slot="${key}"]`)
}

/* N distinct edits landed on one FCP seat, for the collapsed/expand boundary
   tests below — a single edit (editedSeat above) can't reach the >3 case.
   Cycles a pool of FCP-qualified names, skipping whichever one the seat
   already holds so every step is a real change (a no-op write logs nothing
   — logEdit's own guard). */
const FCP_NAMES = ['bane', 'stiff', 'slipway', 'dj', 'nact', 'prowler', 'pump', 'slash', 'harpoon', 'snap']
async function seedN(n: number) {
  const key = $$('#sbBoard [data-slot]').find(e => /\.p$/.test(e.dataset.slot || ''))!.dataset.slot!
  let i = 0
  for (let c = 0; c < n; c++) {
    let v = FCP_NAMES[i % FCP_NAMES.length]!
    while (v === slotVal(key)) { i++; v = FCP_NAMES[i % FCP_NAMES.length]! }
    await act(async () => { setSlotVal(key, v); notify() })
    i++
  }
  return key
}

describe('the History toggle', () => {
  it('sits on the board bar and is off to begin with', () => {
    const b = $('#sbHist')
    expect(b).toBeTruthy()
    expect(b.className).not.toContain('on')
    expect(b.getAttribute('aria-pressed')).toBe('false')
  })

  it('turning it on marks the board and turning it off unmarks it', async () => {
    await click($('#sbHist'))
    expect(view.HISTMODE).toBe(true)
    expect($('.sb-boardwrap').className).toContain('hist-on')
    await click($('#sbHist'))
    expect(view.HISTMODE).toBe(false)
    expect($('.sb-boardwrap').className).not.toContain('hist-on')
  })

  /* it is a VIEW mode, so it is deliberately not gated on editMode() the way
     Sort all and + Wave are — reading who changed something is not editing it */
  it('is there on a read-only board, where Sort all is not', async () => {
    const real = HOOKS.editMode
    try {
      await act(async () => { HOOKS.editMode = () => false; notify() })
      expect($('#sbHist'), 'History survives').toBeTruthy()
      expect($('#sbSortAll'), 'Sort all does not').toBeFalsy()
    } finally { await act(async () => { HOOKS.editMode = real; notify() }) }
  })
})

describe('the bubble', () => {
  it('says what changed, from what, by whom — on hover, on a desktop', async () => {
    const el = await editedSeat()
    await act(async () => { view.setHistMode(true); notify() })
    await hover($(`#sbBoard [data-slot="${el.dataset.slot}"]`))
    const b = bub()
    expect(b, 'a bubble appeared').toBeTruthy()
    /* the line it is in, the change itself, and who/when — the three rows */
    expect(b!.textContent).toContain('FCP')
    expect(b!.textContent).toMatch(/Ranger|Saber/)
    expect(b!.querySelector('.hb-who')!.textContent).toMatch(/\d\d:\d\d/)
  })

  it('says nothing at all while History is off', async () => {
    const el = await editedSeat()
    await hover(el)
    expect(bub()).toBe(null)
  })

  it('says nothing on a detail nobody has touched', async () => {
    await act(async () => { view.setHistMode(true); notify() })
    const clean = $$('#sbBoard [data-slot]').find(e => !SCHED.pending[e.dataset.slot!])!
    await hover(clean)
    expect(bub()).toBe(null)
  })

  /* THE ONE THAT MATTERS. On a phone the bubble is raised by the very tap
     that is also arming the seat — if it ever swallowed that tap, History
     would quietly turn the board read-only. */
  it('on a phone, the tap that raises it STILL arms the seat', async () => {
    phone = true
    /* an EMPTY seat that has history — cleared, which is both. Empty is what
       makes this the ARMING case: tapping a seat that holds someone selects
       that person instead, so a filled one would prove the wrong thing. The
       demo Monday is fully crewed, so the seat has to be emptied here rather
       than found. */
    const key = $$('#sbBoard [data-slot]').map(e => e.dataset.slot!)
      .find(k => /\.[pw]$/.test(k) && slotVal(k) !== '')!
    expect(key, 'the board rendered a crewed seat').toBeTruthy()
    await act(async () => { setSlotVal(key, ''); notify() })
    expect($(`#sbBoard [data-slot="${key}"]`).className, 'and it now renders as a hole').toContain('empty')
    await act(async () => { view.setHistMode(true); notify() })
    view.armDrop()
    await click($(`#sbBoard [data-slot="${key}"]`))
    expect(bub(), 'the bubble came up').toBeTruthy()
    expect(view.armedKey(), 'and the seat armed anyway').toBe(key)
  })

  it('does not answer a hover on a phone, nor a tap on a desktop', async () => {
    const el = await editedSeat()
    await act(async () => { view.setHistMode(true); notify() })
    phone = true
    await hover($(`#sbBoard [data-slot="${el.dataset.slot}"]`))
    expect(bub(), 'hover is a desktop gesture').toBe(null)
    phone = false
    hideHistBub()
    await click($(`#sbBoard [data-slot="${el.dataset.slot}"]`))
    expect(bub(), 'tap is a phone gesture').toBe(null)
  })

  /* alAttr puts a title on an amendment cell (a published day's pending edit
     reads "Edited — goes out as ALn"), and the browser would pop it over the top
     of ours a second later. A draft-day edit now carries NO mark and no title
     (owner, 25 Aug 26), so this test publishes the day first to have a tooltip to
     park at all. */
  it('parks the cell\'s own tooltip while it is up, and hands it back after', async () => {
    const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(0, true)                  // day 0 published: its next edit is a real amendment
    const el = await editedSeat()
    await act(async () => { view.setHistMode(true); notify() })
    const live = $(`#sbBoard [data-slot="${el.dataset.slot}"]`)
    const was = live.title
    expect(was, 'the amendment mark put a tooltip here').toBeTruthy()
    await hover(live)
    expect(live.title).toBe('')
    await act(async () => { live.dispatchEvent(new MouseEvent('mouseout', { bubbles: true })) })
    expect(live.title).toBe(was)
  })

  it('goes away when History is switched off', async () => {
    const el = await editedSeat()
    await act(async () => { view.setHistMode(true); notify() })
    await hover($(`#sbBoard [data-slot="${el.dataset.slot}"]`))
    expect(bub()).toBeTruthy()
    await click($('#sbHist'))
    expect(bub()).toBe(null)
  })

  /* PHONE, COLLAPSED IS THE LAST THREE — chronological, not just the newest.
     The middle li has to be edit #4, which is exactly what a slice(-3) proves
     and a slice(-1)-then-grow (the old shape) cannot: the boundary values are
     the ones a reorder or an off-by-one would get wrong silently. */
  it('on a phone, five edits collapse to the last three, oldest to newest', async () => {
    const key = await seedN(5)
    const all = elogAllFor(key)
    expect(all.length, 'five landed').toBe(5)
    phone = true
    await act(async () => { view.setHistMode(true); notify() })
    await click($(`#sbBoard [data-slot="${key}"]`))
    const b = bub()
    expect(b, 'the bubble came up').toBeTruthy()
    const lis = b!.querySelectorAll('.hb-all li')
    expect(lis.length, 'the last three, not all five').toBe(3)
    /* the log keeps a person's id; the bubble says his callsign (elogVal — Fable F4, 28 Sep 26) */
    expect(lis[0]!.textContent, 'the oldest of the three shown is edit #3').toContain(elogVal(all[2]!, 'to'))
    expect(lis[2]!.textContent, 'the newest is edit #5 — what it says now').toContain(elogVal(all[4]!, 'to'))
    const more = b!.querySelector('[data-histmore]')
    expect(more, 'more than three — offer the chevron').toBeTruthy()
    expect(more!.textContent, 'and it names the true count').toContain('5')
  })

  it('on a desktop, four edits show as the whole story on hover, with no chevron', async () => {
    const key = await seedN(4)
    await act(async () => { view.setHistMode(true); notify() })
    await hover($(`#sbBoard [data-slot="${key}"]`))
    const b = bub()
    expect(b, 'the bubble came up').toBeTruthy()
    expect(b!.querySelectorAll('.hb-all li').length, 'all four, immediately — no collapsing on a desktop').toBe(4)
    expect(b!.querySelector('[data-histmore]'), 'hovering already gave the whole story').toBeFalsy()
  })
})

/* SINCE [DRAFT-PENDING] (28 Sep 26 — the owner's D116: one History mode for the board and the edit week; D168: its
   list is the ONE changes window) the board's History button opens the changes window on the board's day, with the
   bubbles, and closes both again; the checks panel's "☰ Edit history" line is gone. The window's lists replace the
   modal's. */
const winTab = (re: RegExp) => $$('.chgwin .win-tab').find(b => re.test(b.textContent || ''))!
const winDay = (d: string) => $$('.chgwin .cw-day').find(b => b.textContent === d)!
const openAll = async () => {
  if (!$('.chgwin:not([hidden])')) await click($('#sbHist'))
  await click(winTab(/All changes/))
  await click(winDay('Week'))
}
describe('the way into the changes window', () => {
  it("the board's History button opens it — no second bar button, no line in the checks panel — and closes it again", async () => {
    expect($('#sbHistList'), 'no second bar button').toBeFalsy()
    expect($('#sbWarn [data-histopen]'), 'no line in the checks panel').toBeFalsy()
    await click($('#sbHist'))
    expect($('.chgwin:not([hidden])'), 'the window opens').toBeTruthy()
    expect(view.HISTMODE, 'with the bubbles (one History mode)').toBe(true)
    expect($('#sbWarn [data-histopen]'), 'still no line in the checks panel').toBeFalsy()
    await click($('#sbHist'))
    expect($('.chgwin:not([hidden])'), 'and closes').toBeFalsy()
    expect(view.HISTMODE).toBe(false)
  })
})

describe('the lists in the window', () => {
  it('opens on the whole week, newest first', async () => {
    await editedSeat()
    await act(async () => { txtSet('ff:0.0.0.cs', 'VIPER'); notify() })
    await act(async () => { txtSet('ff:0.0.0.cs', 'MONSOON'); notify() })
    await openAll()
    const rows = $$('.chgwin .cw-l')
    expect(rows.length).toBe(3)
    expect(rows[0]!.textContent, 'the callsign was typed last').toContain('MONSOON')
    expect(rows[0]!.textContent, 'and it says what it was before').toContain('VIPER')
    expect(rows[2]!.textContent, 'the seat came first').toContain('FCP')
  })

  it('narrows to a day, and says so when that day is empty', async () => {
    await act(async () => { setSlotVal('1.0.0.0.p', slotVal('1.0.0.0.p') === 'bane' ? 'stiff' : 'bane'); notify() })
    await openAll()
    expect($$('.chgwin .cw-l').length).toBe(1)
    await click(winDay('Mon'))
    expect($$('.chgwin .cw-l').length, 'nothing on Monday').toBe(0)
    expect($('.chgwin .cw-none')!.textContent).toContain('No changes on Monday yet')
  })

  it('has a real empty state before anything has been changed', async () => {
    await openAll()
    expect($('.chgwin .cw-none')!.textContent).toContain('No changes this week yet')
  })

  it('closes on ✕, and a window opened again starts from its door', async () => {
    await editedSeat()
    await openAll()
    await click($('.chgwin .win-x'))
    expect($('.chgwin:not([hidden])')).toBeFalsy()
    await click($('#sbHist'))
    expect($('.chgwin .win-tab.on')!.textContent, 'reopens on New to you').toMatch(/New to you/)
  })

  /* a line removed reaches markEdit with no key, so it has no pair of values and no cell to hover — the window is the
     only place it can show */
  it('carries a structural change as the sentence the toast already said', async () => {
    const del = $$('#sbBoard [data-ldel]')[0]
    expect(del, 'the board rendered a delete-line control').toBeTruthy()
    await click(del)
    await openAll()
    expect($('.chgwin .cw-body')!.textContent).toContain('Line removed')
  })
})

describe('leaving', () => {
  it('closing the board leaves the window open — it serves Edit Schedule too — and puts any bubble down', async () => {
    await editedSeat()
    await openAll()
    await act(async () => { closeScheduler() })
    expect($('.chgwin:not([hidden])'), 'the window stays').toBeTruthy()
    expect(bub()).toBe(null)
    await click($('.chgwin .win-x'))
    await act(async () => { openScheduler(0) })
  })
})

/* THE EDIT WEEK HAS THE BUBBLE TOO ([DRAFT-PENDING], the owner's D116: one History mode for the board and the edit week).
   Found unguarded by the break tests (§5 B7): the edit week's wiring could be taken out and every unit test stayed green
   — only the walk (A14) saw it. */
describe('the edit week', () => {
  it('answers a hover on a changed seat while History is on, as the board does (D116)', async () => {
    const el = await editedSeat()
    const key = el.dataset.slot!
    await act(async () => { closeScheduler() })
    await act(async () => { view.setHistMode(true); notify() })
    const cell = $(`#eWeek [data-slot="${key}"]`)
    expect(cell, 'the seat is on the edit week').toBeTruthy()
    await hover(cell)
    expect(bub(), 'a bubble on the edit week').toBeTruthy()
    expect(bub()!.textContent).toMatch(/Ranger|Saber/)
    await act(async () => { view.setHistMode(false); notify() })
    await act(async () => { openScheduler(0) })
  })
})
