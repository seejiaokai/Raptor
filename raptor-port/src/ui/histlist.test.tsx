// @vitest-environment jsdom
/* THE CHANGES LIST GROWS UP (owner, 11 Aug 26) — the desktop way in moves to
   the top of the board, a row jumps to the detail it names and pins its whole
   history open, the list can be grouped by detail, and a phone can expand the
   bubble by hand.

   What this file can and cannot prove: jsdom has no layout engine, so the
   JUMP's scroll is a no-op here and every rect is 0x0. It pins which element
   was emitted, what it says, and what each gesture changes — where the bubble
   lands and which of the two entry points is visible at a given width are
   measured in e2e/geometry.spec.ts, the only place a media query resolves. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { setSlotVal, slotVal, txtSet } from '../engine/slots'
import { DAYS } from '../engine/data'
import { rowsOf } from '../engine/rowids'
import { elogClear, elogAllFor, elogGroups, logAction, elogVal } from '../engine/editlog'
import { HOOKS } from '../engine/hooks'
import * as view from '../state/view'
import { openScheduler, closeScheduler } from './board'
import { ridKey } from '../engine/rowids'
import { hideHistBub, histBubExpanded, histBubPinned } from './histbubble'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (s: string) => document.querySelector(s) as HTMLElement
const $$ = (s: string) => [...document.querySelectorAll(s)] as HTMLElement[]
const bub = () => document.querySelector('.histbub') as HTMLElement | null
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const hover = async (el: Element) =>
  act(async () => { el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })) })
/* jumpToChange defers to the repainted DOM, exactly as jumpToWarn does */
const settle = async () => act(async () => { await new Promise(r => setTimeout(r, 20)) })
/* the area/atime/intimes cells exist on the WEEK only, so reaching one means
   leaving the board and coming back — closeScheduler/openScheduler, not a nav
   click, because the board is what the changes list is opened from */
const goEditWeek = async () => act(async () => { closeScheduler(); notify() })
const backToBoard = async () => act(async () => { openScheduler(0); notify() })

let phone = false
/* SINCE [DRAFT-PENDING] (28 Sep 26 — the owner's D168) the list is the ONE changes window, opened on the board by its
   History button; these tests read every change of the week. Its lines carry the key they jump to (data-cwkey), the
   stored (rid) form — so a test finds a line by translating the positional key in (ridKey). */
const openList = async () => {
  if (!document.querySelector('.chgwin:not([hidden])')) await click($('#sbHist'))
  await click($$('.chgwin .win-tab').find(b => /All changes/.test(b.textContent || ''))!)
  await click($$('.chgwin .cw-day').find(b => b.textContent === 'Week')!)
}
const lineFor = (key: string) => $$('.chgwin .cw-l').find(l => l.dataset.cwkey === String(ridKey(key, DAYS)))
/* two changes to ONE seat and one to another, so there is something to group */
async function seed() {
  const keys = $$('#sbBoard [data-slot]').map(e => e.dataset.slot!).filter(k => /\.[pw]$/.test(k))
  const a = keys[0]!, b = keys.find(k => k !== a)!
  await act(async () => {
    setSlotVal(a, slotVal(a) === 'bane' ? 'stiff' : 'bane')
    setSlotVal(a, slotVal(a) === 'bane' ? 'wolf' : 'bane')
    setSlotVal(b, slotVal(b) === 'divot' ? 'pump' : 'divot')
    notify()
  })
  return { a, b }
}

/* N distinct edits to ONE seat — the collapsed/expand boundary tests below
   need more history than seed()'s two changes give. idx picks which FCP
   seat, so several boundary scenarios inside one test don't pile their
   edits onto the same key. Cycles a name pool, skipping whichever the seat
   already holds so every step is a genuine change. */
const FCP_NAMES = ['bane', 'stiff', 'slipway', 'dj', 'nact', 'prowler', 'pump', 'slash', 'harpoon', 'snap']
async function seedN(n: number, idx = 0) {
  const key = $$('#sbBoard [data-slot]').map(e => e.dataset.slot!).filter(k => /\.p$/.test(k))[idx]!
  let i = 0
  for (let c = 0; c < n; c++) {
    let v = FCP_NAMES[i % FCP_NAMES.length]!
    while (v === slotVal(key)) { i++; v = FCP_NAMES[i % FCP_NAMES.length]! }
    await act(async () => { setSlotVal(key, v); notify() })
    i++
  }
  return key
}

let host: HTMLDivElement
let root: Root

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
  elogClear(); hideHistBub()
  await act(async () => { view.setChgWin(null); notify() })
})

describe('the ways in (the one changes window — D168, D171)', () => {
  it('the History button of the board and the icon of the admin on Edit Schedule both open the same window', async () => {
    await seed()
    await click($('#sbHist'))
    expect($('.chgwin:not([hidden])'), 'the board opens it').toBeTruthy()
    const onBoard = $('.chgwin .win-tab')!.textContent
    await click($('.chgwin .win-x'))
    await goEditWeek()
    await click($('#histBtn'))
    expect($('.chgwin:not([hidden])'), 'the icon opens it on Edit Schedule').toBeTruthy()
    expect($('.chgwin .win-ttl')!.textContent, 'on the week').toMatch(/week of/)
    expect($('.chgwin .win-tab')!.textContent).toBe(onBoard)
    await click($('.chgwin .win-x'))
    await backToBoard()
  })
})

describe('clicking a change jumps to it', () => {
  it('pins the bubble open and shows every change to that detail — and the window stays', async () => {
    const { a } = await seed()
    await openList()
    const row = lineFor(a)!
    expect(row && row.tagName, 'the seat has a clickable line').toBe('BUTTON')
    await click(row)
    await settle()
    expect($('.chgwin:not([hidden])'), 'the window stays open (D167)').toBeTruthy()
    const b = bub()
    expect(b, 'and the bubble came up').toBeTruthy()
    expect(histBubPinned(), 'pinned').toBe(true)
    expect(histBubExpanded(), 'and expanded').toBe(true)
    expect(b!.querySelectorAll('.hb-all li').length).toBe(elogAllFor(a).length)
    expect(elogAllFor(a).length).toBe(2)
  })

  it('a pinned bubble ignores the pointer leaving, and goes on the next click away', async () => {
    const { a } = await seed()
    await openList()
    await click(lineFor(a)!)
    await settle()
    expect(bub()).toBeTruthy()
    await act(async () => {
      $(`#sbBoard [data-slot="${a}"]`).dispatchEvent(new MouseEvent('mouseout', { bubbles: true }))
    })
    expect(bub(), 'still up').toBeTruthy()
    await click($('#sbBoard'))
    expect(bub(), 'and the next click away puts it down').toBe(null)
    expect(histBubPinned()).toBe(false)
  })

  /* THE JUMP SCROLLS, AND ASKING IT TO IS GUARDED (jsdom has no scrollIntoView; unguarded it threw in a deferred
     callback where no assertion could see it) */
  it('scrolls the cell it jumped to into the middle', async () => {
    const { a } = await seed()
    const seen: any[] = []
    const proto = Element.prototype as any
    const had = Object.prototype.hasOwnProperty.call(proto, 'scrollIntoView')
    const real = proto.scrollIntoView
    proto.scrollIntoView = function (o: any) { seen.push({ el: this, o }) }
    try {
      await openList()
      await click(lineFor(a)!)
      await settle()
    } finally {
      if (had) proto.scrollIntoView = real; else delete proto.scrollIntoView
    }
    const hits = seen.filter(s => (s.el as HTMLElement).dataset && (s.el as HTMLElement).dataset.slot === a)
    expect(hits.length, 'it asked to bring the right cell into view').toBe(1)
    expect(hits[0].o.block, 'and to the middle, not just barely on screen').toBe('center')
  })

  /* THE FAMILIES THE BOARD NEVER DRAWS (the area strip, the in-times, the traffic): listed — the change really
     happened — but not offered as a jump from the board */
  it('a detail the board cannot draw is listed, but is not a button', async () => {
    await goEditWeek()
    const ar = $('#eWeek .areacell[data-area]')
    expect(ar, 'the area strip is on the week').toBeTruthy()
    ar.textContent = 'D99X'
    await act(async () => { ar.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
    await act(async () => { await new Promise(r => setTimeout(r, 10)) })
    await backToBoard()
    await openList()
    const arRow = $$('.chgwin .cw-l').find(r => /area/i.test(r.textContent || ''))   // its detail reads "Area" ([CHG-BY-ITEM])
    expect(arRow, 'it is still LISTED').toBeTruthy()
    expect(arRow!.tagName, 'but not offered as a jump from the board').not.toBe('BUTTON')
  })

  it('a structural line is not a button, because it has no cell to jump to', async () => {
    logAction(0, 'Line removed')
    await openList()
    const rows = $$('.chgwin .cw-l')
    expect(rows.length).toBe(1)
    expect(rows[0]!.tagName, 'a plain row, not a button').not.toBe('BUTTON')
  })

  it('says so when the detail it named has since gone', async () => {
    const f = DAYS[0].waves[0].formations
    const keep = JSON.parse(JSON.stringify(f))
    await act(async () => { txtSet('ff:0.0.1.cs', 'GONE'); notify() })
    await openList()
    const row = $$('.chgwin button.cw-l').find(r => (r.textContent || '').includes('GONE'))!
    expect(row, 'the edit is listed as a jump').toBeTruthy()
    /* the line the edit was on goes (straight out of the model — the delete itself is not what is under test) */
    await act(async () => { f.splice(1, 1); notify() })
    const said: string[] = []
    const real = HOOKS.toast
    HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
    try { await click(row); await settle() } finally { HOOKS.toast = real }
    expect(said.join(' ')).toContain('no longer')
    expect(bub()).toBe(null)
    await act(async () => { f.length = 0; keep.forEach((x: any) => f.push(x)); notify() })
  })
})

/* "Grouped by detail" was the retired list's own view; the one changes window groups by WHO (person and sitting) and by
   WHERE (the day's sections) instead — D168, the approved mock-up — pinned in ui/changesmodel.test.ts. */

describe('the phone expands the bubble by hand', () => {
  /* the 3/4 boundary, pinned explicitly: collapsed already shows the last
     THREE, so three changes leave nothing hidden and four is the first count
     that does. Desktop never collapses at all, so the chevron is absent
     there regardless of how much history there is. */
  it('offers a control only where there is more to show, and only on a phone', async () => {
    await act(async () => { view.setHistMode(true); notify() })
    phone = true

    const k3 = await seedN(3, 0)
    await click($(`#sbBoard [data-slot="${k3}"]`))
    expect(bub()!.querySelector('[data-histmore]'), 'three — the collapsed view already shows all of them').toBeFalsy()
    hideHistBub()

    const k4 = await seedN(4, 1)
    await click($(`#sbBoard [data-slot="${k4}"]`))
    const more = bub()!.querySelector('[data-histmore]')
    expect(more, 'four — one is hidden past the collapsed three, offer it').toBeTruthy()
    expect(more!.textContent, 'and it names the true count').toContain('4')

    hideHistBub()
    phone = false
    const k5 = await seedN(5, 2)
    await hover($(`#sbBoard [data-slot="${k5}"]`))
    expect(bub()!.querySelector('[data-histmore]'), 'a desktop already shows the whole story').toBeFalsy()
  })

  /* the bubble is pointer-events:none so it can never take the tap that raised
     it; the control inside it is the ONE exception, and it is a child */
  it('tapping it expands to every change and pins the bubble past its timeout', async () => {
    const key = await seedN(5)
    await act(async () => { view.setHistMode(true); notify() })
    phone = true
    await click($(`#sbBoard [data-slot="${key}"]`))
    expect(histBubExpanded()).toBe(false)
    expect(bub()!.querySelectorAll('.hb-all li').length, 'collapsed to the last three').toBe(3)

    await click(bub()!.querySelector('[data-histmore]'))
    expect(histBubExpanded(), 'expanded').toBe(true)
    expect(histBubPinned(), 'and pinned, so the timeout cannot take it').toBe(true)
    expect(bub()!.querySelectorAll('.hb-all li').length, 'now every one of the five').toBe(5)

    /* well past the timeout it would have had */
    await act(async () => { await new Promise(r => setTimeout(r, 60)) })
    expect(bub(), 'still up').toBeTruthy()
  })
})
