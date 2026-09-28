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
import { initStore, setSession, notify, writeInputs } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS, inpId } from '../engine/inputs'
import { SCHED, signOf, setDayApproved, dayVersions } from '../engine/publish'
import { setSlotVal, slotVal, txtSet } from '../engine/slots'
import { elogClear, elogAllFor, elogVal, elogFor, logAction } from '../engine/editlog'
import { HOOKS } from '../engine/hooks'
import * as view from '../state/view'
import { openScheduler, closeScheduler } from './board'
import { hideHistBub, histKeyOf, HIST_CELLS, refreshHistDots, findHistCell } from './histbubble'

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

/* THE GOLD DOTS ([HIST-PHONE-HIDE], D339, D345 — "a small gold dot on every detail with a history while History is on",
   desktop too): exactly the details the bubble answers for — the SAME question (`histKeyOf` over the bubble's cells, then
   the history on the loaded day) — so a dot never promises a bubble that is not there. What jsdom can prove: which cells
   wear `data-histdot`; that they are painted gold, where, is e2e/changeswin.spec.ts's. */
describe('the gold dots — History on marks every detail with a history (D345)', () => {
  const marked = (root: string) => $$(`${root} [data-histdot]`)
  it('none while the window is shut; on the edited seat, and only on cells the bubble answers, while it is open — board and edit week', async () => {
    const el = await editedSeat()
    const key = el.dataset.slot!
    expect(marked('#sbBoard').length, 'History off: no dots').toBe(0)
    await openAll()
    expect($(`#sbBoard [data-slot="${key}"]`)!.hasAttribute('data-histdot'), 'the edited seat wears one').toBe(true)
    /* the dots are the bubble's own answer, on both surfaces: a dotted cell is one the bubble answers, and every detail the
       bubble answers wears exactly one dot in its day (a jet's store chips share one line — the first wears it, F8) */
    for (const root of ['#sbBoard', '#eWeek']) {
      const per = new Map<string, number>()
      for (const c of $$(`${root} ${HIST_CELLS}`)) {
        const k = histKeyOf(c)
        const sec = `${(c.closest('.day[data-day]') as HTMLElement | null)?.dataset.day ?? ''}|${k}`
        if (c.hasAttribute('data-histdot')) expect(!!k && !!elogFor(k), `${root} ${k} is dotted, so the bubble answers it`).toBe(true)
        if (k && elogFor(k)) per.set(sec, (per.get(sec) || 0) + (c.hasAttribute('data-histdot') ? 1 : 0))
      }
      for (const [sec, n] of per) expect(n, `${root} ${sec}: one dot`).toBe(1)
    }
    expect($(`#eWeek [data-slot="${key}"]`)!.hasAttribute('data-histdot'), 'and on the edit week behind').toBe(true)
    await click($('.chgwin .win-x'))
    expect(marked('#sbBoard').length + marked('#eWeek').length, 'closed: every dot goes').toBe(0)
  })

  it('a change made while the window is open is dotted at once; View-only Sched never wears one', async () => {
    await openAll()
    const el = await editedSeat()
    expect(el.hasAttribute('data-histdot')).toBe(true)
    expect(marked('#vWeek').length, 'View-only draws no bubbles, so no dots').toBe(0)
  })

  it('a version look wears none (a document, not your history)', () => {
    const root = document.createElement('div')
    root.innerHTML = '<div class="pv-frozen"><span data-slot="1.0.0.0.p"></span></div><div class="preview"><span data-slot="1.0.0.0.p"></span></div><span data-slot="1.0.0.0.p"></span>'
    document.body.appendChild(root)
    setSlotVal('1.0.0.0.p', slotVal('1.0.0.0.p') === 'bane' ? 'stiff' : 'bane')
    view.setHistMode(true)
    refreshHistDots(root)
    expect([...root.querySelectorAll('[data-histdot]')].map(e => e.parentElement === root)).toEqual([true])
    view.setHistMode(false)
    refreshHistDots(root)
    expect(root.querySelectorAll('[data-histdot]').length).toBe(0)
    root.remove()
  })
})

/* HISTORY ON A PHONE ([HIST-PHONE-HIDE], D339, D344, D345): "Hide ▾" beside ✕ on a phone only; the hint in his words;
   the slim bar "History on · N changes" with "Show ▴"; ✕ turns History off. The phone layout is the stylesheet's own
   breakpoint (floatwin.ts phoneLayout — matchMedia), stood in for here. */
describe('History on a phone — Hide, Show and the hint (D339, D344, D345)', () => {
  /* jsdom has no matchMedia at all: remember that it was absent, and put it back that way */
  let real: any, stubbed = false
  const asPhone = (on: boolean) => {
    if (on) { real = window.matchMedia; stubbed = true; (window as any).matchMedia = (q: string) => ({ matches: /max-width:\s*620px|hover:\s*none/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }) }
    else { (window as any).matchMedia = real; stubbed = false }
  }
  /* put the page back whatever a test did — a failure mid-test must not leave the next one on View-only with the board shut */
  afterEach(async () => {
    if (stubbed) asPhone(false)
    phone = false
    view.DPREV.clear()
    await act(async () => { view.setChgWin(null); notify() })
    if (view.CURPAGE !== 'editsched') await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
    if (view.SBDAY == null) await act(async () => { openScheduler(0) })
  })

  it('on a phone: "Hide ▾" and the hint in his words; Hide → the bar "History on · N changes" with "Show ▴"; Show → the panel; ✕ → History off', async () => {
    await editedSeat()
    phone = true; asPhone(true)
    await openAll()
    const hide = $('.chgwin .win-hide')
    expect(hide, 'Hide on the phone').toBeTruthy()
    expect(hide!.textContent).toBe('Hide ▾')
    expect($('.chgwin .cw-hint')!.textContent).toBe('History on: Tap a gold dot on the schedule')
    await click(hide)
    expect($('.chgwin.bar'), 'hidden to the bar').toBeTruthy()
    expect($('.chgwin.bar .cw-barbtn')!.textContent).toMatch(/^History on · 1 change\s*Show ▴$/)
    expect(view.HISTMODE, 'History stays on while hidden').toBe(true)
    await click($('.chgwin.bar .cw-barbtn'))
    expect($('.chgwin:not(.bar) .win-tabs'), 'Show brings the panel back').toBeTruthy()
    await click($('.chgwin .win-hide'))
    await click($('.chgwin.bar .win-x'))
    expect($('.chgwin:not([hidden])'), '✕ closes it').toBeFalsy()
    expect(view.HISTMODE, 'and History is off').toBe(false)
  })

  it('pressing Hide never starts a drag of the panel (it is not the grip)', async () => {
    await editedSeat()
    phone = true; asPhone(true)
    await openAll()
    const win = $('.chgwin')!
    await act(async () => { $('.chgwin .win-hide')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 5, clientY: 5 })) })
    expect(win.style.width, 'a press on Hide wrote no drag box onto the panel').toBe('')
  })

  /* Astra's final read (FR-02): a phone turned sideways, or a window narrowed, crosses the breakpoint with no change to the
     app's data — so nothing redrew the window, and Hide stayed absent (or the bar's markup stayed) until something else did */
  it('turning the screen across the phone breakpoint switches the controls at once — no other change needed', async () => {
    await editedSeat()
    const listeners = new Set<() => void>()
    let narrow = false
    real = window.matchMedia; stubbed = true
    ;(window as any).matchMedia = (q: string) => ({ get matches() { return narrow && /max-width:\s*(620|820)px|hover:\s*none/.test(q) }, media: q,
      addEventListener: (_: any, f: any) => listeners.add(f), removeEventListener: (_: any, f: any) => listeners.delete(f), addListener: (f: any) => listeners.add(f), removeListener: (f: any) => listeners.delete(f) })
    await openAll()
    expect($('.chgwin .win-hide'), 'a desktop window: no Hide').toBeFalsy()
    narrow = true; phone = true
    await act(async () => { listeners.forEach(f => f()) })
    expect($('.chgwin .win-hide'), 'turned to a phone: Hide, at once').toBeTruthy()
    expect($('.chgwin .cw-hint'), 'and the hint').toBeTruthy()
    narrow = false; phone = false
    await act(async () => { listeners.forEach(f => f()) })
    expect($('.chgwin .win-hide'), 'back to a desktop: no Hide').toBeFalsy()
  })

  /* Astra's final read (FR-05), Fable's final read (F3): the hint promises dots — so not while the board shows an issued
     version (a look wears none) and not on a week with nothing a dot could mark; and the hidden bar says "History on" only
     where History draws */
  it('no hint and no "History on" while the board shows a look, nor on a week with nothing to dot', async () => {
    await editedSeat()
    phone = true; asPhone(true)
    await openAll()
    expect($('.chgwin .cw-hint'), 'the live board: the hint').toBeTruthy()
    /* a real look: the day published, and its Original chosen on the board (the version picker's own write) */
    const di = view.SBDAY
    await act(async () => {
      const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
      if (!SCHED.orig[di]) setDayApproved(di, true)
      view.setDayPreview(di, dayVersions(di)[1]); notify()
    })
    expect(view.DPREV.has(di), 'the board shows the Original').toBe(true)
    expect($('.chgwin .cw-hint'), 'a look on the board: no hint').toBeFalsy()
    await click($('.chgwin .win-hide'))
    expect($('.chgwin.bar .cw-barl')!.textContent, 'the bar: "Changes"').toBe('Changes')
    await act(async () => { view.setDayPreview(di, 'live'); notify() })
    expect($('.chgwin.bar .cw-barl')!.textContent, 'back live: "History on"').toBe('History on')
    await click($('.chgwin.bar .cw-barbtn'))
    /* a week whose only lines are the day's own (a publish, a structural line) has nothing to dot */
    await act(async () => { elogClear(); logAction(1, 'Programme item added'); notify() })
    expect($('.chgwin .cw-hint'), 'nothing to dot: no hint').toBeFalsy()
  })

  it('on a desktop: no Hide and no hint', async () => {
    await openAll()
    expect($('.chgwin .win-hide')).toBeFalsy()
    expect($('.chgwin .cw-hint')).toBeFalsy()
  })

  it('where History draws nothing (View-only Sched) the phone shows no hint, and the bar says "Changes"', async () => {
    await act(async () => { setSlotVal('1.0.0.0.p', slotVal('1.0.0.0.p') === 'bane' ? 'stiff' : 'bane'); notify() })
    await act(async () => { closeScheduler() })
    phone = true; asPhone(true)
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'viewsched')!)
    await act(async () => { view.setChgWin({ day: 'week', tab: 'all', group: 'item' }); notify() })
    expect($('.chgwin .cw-hint'), 'no hint where there are no dots').toBeFalsy()
    await click($('.chgwin .win-hide'))
    expect($('.chgwin.bar .cw-barbtn')!.textContent).toMatch(/^Changes · 1 change\s*Show ▴$/)
  })
})

describe('Group by: Item / Who — Item first and the default (D340, D345)', () => {
  it('the buttons read Item, then Who; the window opens on Item; an item changed twice is a header and two lines', async () => {
    await act(async () => { txtSet('ff:0.0.0.cs', 'VIPER'); notify() })
    await act(async () => { txtSet('ff:0.0.0.cs', 'MONSOON'); notify() })
    await openAll()
    expect($$('.chgwin .cw-g-btn').map(b => b.textContent)).toEqual(['Item', 'Who'])
    expect($('.chgwin .cw-g-btn.on')!.textContent).toBe('Item')
    const g = $('.chgwin .cw-g')!
    expect(g.querySelector('.cw-gh')!.textContent).toMatch(/Flying · .*· 2/)
    expect(g.querySelectorAll('.cw-l').length).toBe(2)
    expect(g.querySelector('.cw-l')!.textContent, 'newest first, its field named').toMatch(/Callsign.*VIPER.*MONSOON/)
  })
})

/* THE BUBBLE'S REACH, WIDENED WITH THE DOTS ([HIST-PHONE-HIDE] — Astra's plan read 02, 03, 01): every detail with a history
   answers — the board's wave-title box (a `wl:` line) and an input's own row (its lines have no key: they are found by the
   input and the row's own day) — and a saved-plan or version LOOK never tells the live story. */
describe('the bubble reaches every detail with a history (Astra 01–03)', () => {
  it("the board's wave title: a new title is dotted and its bubble says the change", async () => {
    const sel = $('#sbBoard [data-wsel]') as HTMLSelectElement
    expect(sel, 'the board draws a wave title').toBeTruthy()
    const other = [...sel.options].map(o => o.value).find(v => v !== sel.value)!
    await act(async () => { sel.value = other; sel.dispatchEvent(new Event('change', { bubbles: true })) })
    await openAll()
    const now = $('#sbBoard [data-wsel]')!
    expect(now.hasAttribute('data-histdot'), 'dotted').toBe(true)
    await hover(now)
    expect(bub(), 'a bubble on the wave title').toBeTruthy()
    expect(bub()!.textContent).toContain(other)
  })

  it("an input's own row answers with the input's lines on that day — dotted, and a bubble", async () => {
    const inp: any = { person: 'bane', type: 'LL', date: DAYS[0].dt, allday: true, remarks: '' }
    await act(async () => { writeInputs(() => { inpId(inp); INPUTS.unshift(inp) }); notify() })
    await openAll()
    const row = $(`#sbBoard [data-inprow="${inpId(inp)}"]`)
    expect(row, 'the board draws the input under Unavailable').toBeTruthy()
    expect(row!.hasAttribute('data-histdot'), 'dotted').toBe(true)
    await hover(row!)
    expect(bub(), 'a bubble on the input').toBeTruthy()
    expect(bub()!.textContent).toMatch(/LL added/)
    /* its lines are SENTENCES, not a before → after (Fable's final read, F1): each reads in its own words, headed by the
       input's name, never a bare arrow */
    expect(bub()!.querySelector('.hb-what')!.textContent, 'headed by the input').toBe('Ranger · LL')
    const lines = [...bub()!.querySelectorAll('.hb-chg')].map(e => e.textContent || '')
    expect(lines, 'the line reads in words').toEqual([expect.stringMatching(/^LL added · /)])
    await act(async () => { writeInputs(() => { const i = INPUTS.indexOf(inp); if (i >= 0) INPUTS.splice(i, 1) }); notify() })
  })

  it('a look (a saved plan, an issued version) never tells the live story — no bubble, no jump into it', async () => {
    const el = await editedSeat()
    const key = el.dataset.slot!
    await openAll()
    const look = document.createElement('div')
    look.className = 'preview'
    look.innerHTML = `<span class="seat" data-slot="${key}"></span>`
    $('#eWeek').appendChild(look)
    await hover(look.firstElementChild!)
    expect(bub(), 'no bubble on a look').toBe(null)
    expect(findHistCell(look.parentElement!, key), 'a jump lands on the live cell, never the look').not.toBe(look.firstElementChild)
    look.remove()
  })
})
