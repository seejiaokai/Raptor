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
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { setSlotVal, slotVal, txtSet } from '../engine/slots'
import { elogClear, elogAllFor, elogGroups, logAction } from '../engine/editlog'
import { HOOKS } from '../engine/hooks'
import * as view from '../state/view'
import { openScheduler, closeScheduler } from './board'
import { setHistList, setHistGroup, HISTOPEN, HISTGROUP } from './pops'
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
const openList = async () => {
  if (!view.HISTMODE) await act(async () => { view.setHistMode(true); notify() })
  await act(async () => { setHistList('all'); notify() })
}
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

beforeAll(async () => {
  initStore()
  HOOKS.isPhone = () => phone
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  await act(async () => { openScheduler(0) })
})

beforeEach(async () => {
  phone = false
  elogClear(); hideHistBub(); HISTOPEN.clear()
  await act(async () => { view.setHistMode(false); setHistList(false); setHistGroup(false); notify() })
})

describe('the two ways in', () => {
  /* BOTH are rendered and CSS picks one per width — a media query answers a
     resize instantly where a builder decision would be stuck until the next
     repaint, and the panels are string-diffed so nothing repaints until an
     edit lands. Which one is VISIBLE is e2e's question, not jsdom's. */
  it('renders a top-of-board entry above the sign-off bar, and the phone one too', async () => {
    expect($('.histln-top'), 'nothing while History is off').toBeFalsy()
    await act(async () => { view.setHistMode(true); notify() })

    /* the desktop entry heads the #sbSign element, above the sign-off bar
       (both moved out of #sbBoard so the checks bar can sit under the sign-off
       — owner, 14 Aug 26) */
    const top = $('#sbSign .histln-top')
    expect(top, 'the desktop entry heads the sign element').toBeTruthy()
    const sign = $('#sbSignBar')
    expect(sign, 'and the sign-off bar is still there').toBeTruthy()
    /* ABOVE it, which was the whole ask */
    expect(top.compareDocumentPosition(sign) & Node.DOCUMENT_POSITION_FOLLOWING,
      'the entry comes before the sign-off bar').toBeTruthy()

    expect($('#sbWarn .histln'), 'the phone entry is still on the checks panel').toBeTruthy()
  })

  it('both carry the same count, and both open the list', async () => {
    await act(async () => { view.setHistMode(true); notify() })
    await seed()
    expect($('#sbSign .histln-top').textContent).toContain('3 changes')
    expect($('#sbWarn .histln').textContent).toContain('3 changes')
    await click($('#sbSign .histln-top'))
    expect($('#histModal').hasAttribute('hidden')).toBe(false)
  })
})

describe('clicking a change jumps to it', () => {
  it('closes the list, pins the bubble open and shows every change to that detail', async () => {
    const { a } = await seed()
    await openList()
    const row = $$('#histBody .hl-row.hit').find(r => r.dataset.hkey === a)!
    expect(row, 'the seat has a clickable row').toBeTruthy()
    await click(row)
    await settle()

    expect($('#histModal').hasAttribute('hidden'), 'the list got out of the way').toBe(true)
    const b = bub()
    expect(b, 'and the bubble came up').toBeTruthy()
    expect(histBubPinned(), 'pinned').toBe(true)
    expect(histBubExpanded(), 'and expanded').toBe(true)
    /* BOTH changes to that seat, not just the newest — that is the difference
       between this and a hover */
    expect(b!.querySelectorAll('.hb-all li').length).toBe(elogAllFor(a).length)
    expect(elogAllFor(a).length).toBe(2)
  })

  it('a pinned bubble ignores the pointer leaving, and goes on the next click away', async () => {
    const { a } = await seed()
    await openList()
    await click($$('#histBody .hl-row.hit').find(r => r.dataset.hkey === a)!)
    await settle()
    expect(bub()).toBeTruthy()

    /* a hover bubble dies on mouseout; a pinned one is there because someone
       asked for it */
    await act(async () => {
      $(`#sbBoard [data-slot="${a}"]`).dispatchEvent(new MouseEvent('mouseout', { bubbles: true }))
    })
    expect(bub(), 'still up').toBeTruthy()

    await click($('#sbBoard'))
    expect(bub(), 'and the next click away puts it down').toBe(null)
    expect(histBubPinned()).toBe(false)
  })

  /* THE JUMP SCROLLS, AND ASKING IT TO IS GUARDED. jsdom does not implement
     scrollIntoView — it has no scrolling to implement it with — and the call
     sits in a deferred callback, so unguarded it threw where no assertion
     could see it: every test still passed and the RUN failed on two unhandled
     errors. This pins both halves, and the guard is why the suite can assert
     the scroll at all here. */
  it('scrolls the cell it jumped to into the middle', async () => {
    const { a } = await seed()
    const seen: any[] = []
    /* on the PROTOTYPE, which is where a browser has it — and it has to be:
       the jump re-finds its cell after the repaint, so a spy pinned to the
       element that was on screen when the list opened is left on a node the
       string diff has already thrown away */
    const proto = Element.prototype as any
    const had = Object.prototype.hasOwnProperty.call(proto, 'scrollIntoView')
    const real = proto.scrollIntoView
    proto.scrollIntoView = function (o: any) { seen.push({ el: this, o }) }
    try {
      await openList()
      await click($$('#histBody .hl-row.hit').find(r => r.dataset.hkey === a)!)
      await settle()
    } finally {
      if (had) proto.scrollIntoView = real; else delete proto.scrollIntoView
    }
    expect(seen.length, 'it asked to be brought into view').toBe(1)
    expect(seen[0].o.block, 'and to the middle, not just barely on screen').toBe('center')
    expect((seen[0].el as HTMLElement).dataset.slot, 'the right cell').toBe(a)
  })

  /* THE FOUR FAMILIES THE BOARD NEVER DRAWS. The area/area-time strip and the
     in-times render on the WEEK only, and traffic is typed into a modal with
     no cell anywhere — so a row naming one could only ever answer with an
     error, and the error was untrue as well ("no longer on this day" for a
     detail sitting safely on the week). Found by the handoff's doc check,
     after the two changes that combined to create it shipped separately:
     one made these log a value at all, the next made rows clickable. */
  it('a detail the board cannot draw is listed, but is not a button', async () => {
    await goEditWeek()
    const ar = $('#eWeek .areacell[data-area]')
    expect(ar, 'the area strip is on the week').toBeTruthy()
    ar.textContent = 'D99X'
    await act(async () => { ar.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
    await act(async () => { await new Promise(r => setTimeout(r, 10)) })
    await backToBoard()
    await openList()

    const rows = $$('#histBody .hl-row')
    const arRow = rows.find(r => (r.textContent || '').includes('area'))
    expect(arRow, 'it is still LISTED — the change really happened').toBeTruthy()
    expect(arRow!.tagName, 'but not offered as a jump').not.toBe('BUTTON')
    expect($$('#histBody .hl-row.hit').length, 'nothing here is clickable').toBe(0)
  })

  it('a structural entry is not a button, because it has no cell to jump to', async () => {
    logAction(0, 'Line removed')
    await openList()
    const rows = $$('#histBody .hl-row')
    expect(rows.length).toBe(1)
    expect(rows[0]!.tagName, 'a plain row, not a button').not.toBe('BUTTON')
    expect(rows[0]!.className).not.toContain('hit')
  })

  it('says so when the detail it named has since gone', async () => {
    await act(async () => { txtSet('ff:0.0.0.cs', 'GONE'); notify() })
    await openList()
    const row = $$('#histBody .hl-row.hit')[0]!
    /* point it at an address the board does not render */
    row.dataset.hkey = 'ff:0.9.9.cs'
    const said: string[] = []
    const real = HOOKS.toast
    HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
    try { await click(row); await settle() } finally { HOOKS.toast = real }
    expect(said.join(' ')).toContain('no longer')
    expect(bub()).toBe(null)
  })
})

describe('grouped by detail', () => {
  it('folds one row per detail, newest-touched first, and unfolds to every change', async () => {
    const { a } = await seed()
    await openList()
    await click($('#histGrouped'))
    expect(HISTGROUP).toBe(true)

    const heads = $$('#histBody .hl-ghead')
    expect(heads.length, 'the seat with two changes folds; the other is a plain row').toBe(1)
    expect(heads[0]!.dataset.hgrp).toBe(a)
    expect(heads[0]!.textContent).toContain('2 changes')
    expect($$('#histBody .hl-sub').length, 'shut to begin with').toBe(0)

    await click(heads[0]!)
    const sub = $$('#histBody .hl-sub .hl-row')
    expect(sub.length).toBe(2)
    /* oldest first inside a group — the story, ending at what it says now */
    const all = elogAllFor(a)
    expect(sub[0]!.textContent).toContain(all[0]!.to)
    expect(sub[1]!.textContent).toContain(all[1]!.to)
    /* and a sub-row still jumps */
    expect(sub[0]!.className).toContain('hit')
  })

  it('a detail changed once is a plain row, not a fold that reveals itself', async () => {
    await act(async () => { txtSet('ff:0.0.0.cs', 'ONCE'); notify() })
    await openList()
    await click($('#histGrouped'))
    expect($$('#histBody .hl-ghead').length).toBe(0)
    expect($$('#histBody .hl-row.hit').length).toBe(1)
  })

  it('groups structural entries apart, since they share an empty address', async () => {
    logAction(0, 'Line removed')
    logAction(0, 'Line removed')
    const g = elogGroups()
    expect(g.length, 'two events that happen to read the same are still two').toBe(2)
  })

  it('closing the list forgets the grouping, as it forgets the day filter', async () => {
    await seed()
    await openList()
    await click($('#histGrouped'))
    await click($('#histClose'))
    await openList()
    expect($('#histByTime').className, 'back to the timeline').toContain('on')
  })

  it('jumping from a grouped row also forgets the grouped view', async () => {
    const { a } = await seed()
    await openList()
    await click($('#histGrouped'))
    await click($(`[data-hgrp="${a}"]`))
    await click($('#histBody .hl-sub .hl-row.hit'))
    await settle()
    expect(HISTOPEN.size, 'the old fold is not kept behind the closed list').toBe(0)

    await openList()
    expect($('#histByTime').className, 'a jump is still a complete close').toContain('on')
    expect($$('#histBody .hl-ghead').length, 'no expanded groups leak into the next opening').toBe(0)
  })
})

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
