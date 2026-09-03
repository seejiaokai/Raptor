// @vitest-environment jsdom
/* Drag & drop — tfin's "generic drag & drop across the whole edit board"
   group and the B23/B49 applyDrop contracts, driven through the React edit
   page with the same synthesized drag events the reference suite uses. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, wireStore, setSession, notify } from '../state/store'
import { slotVal, setSlotVal, rowCrew, fillSlot } from '../engine/slots'
import { HOOKS } from '../engine/hooks'
import { afterSchedMutate, armedKey, AVSHUT } from '../state/view'
import { dragFrom, applyDrop, setDrag } from './drag'
import { openScheduler, closeScheduler } from './board'
import { DAYS } from '../engine/data'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* the reference suite's dnd() helper, verbatim in spirit: dragstart on the
   source, dragover + drop on the target, dragend on the source */
const dnd = async (from: Element, to: Element) => {
  const dt: any = { data: {}, effectAllowed: '', setData(k: string, v: string) { this.data[k] = v }, getData(k: string) { return this.data[k] || '' } }
  const mk = (t: string) => { const ev: any = new Event(t, { bubbles: true, cancelable: true }); try { ev.dataTransfer = dt } catch (_) {} return ev }
  await act(async () => {
    from.dispatchEvent(mk('dragstart'))
    to.dispatchEvent(mk('dragover'))
    to.dispatchEvent(mk('drop'))
    from.dispatchEvent(mk('dragend'))
  })
}
/* capture toasts without repainting anything */
let toasts: string[] = []
const origToast = HOOKS.toast

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  HOOKS.toast = (m: any) => { toasts.push(String(m)) }
})

describe('generic drag & drop across the whole edit board (tfin)', () => {
  it('duty / sim / ground / programme cells are droppable, crew are drag sources', async () => {
    const fills = (pre: string) => $$(`#eWeek [data-fill^="${pre}"]`)
    expect(fills('d:').length).toBeGreaterThanOrEqual(3)
    expect(fills('s:').length).toBeGreaterThanOrEqual(2)
    expect(fills('g:').length).toBeGreaterThanOrEqual(3)
    expect(fills('a:').length).toBeGreaterThanOrEqual(3)
    /* the Available-crew panel is OPEN by default now (owner, Aug 26); its pucks
       are drag sources whenever a day's panel is expanded — AVSHUT holds only the
       days a scheduler folded, so clearing it guarantees every panel is up */
    await act(async () => { AVSHUT.clear(); notify() })
    expect($$('#eWeek .availpuck [data-person][draggable="true"]').length).toBeGreaterThan(10)
  })

  it('roster puck -> duty seat', async () => {
    const seat = $('#eWeek .seat[data-slot^="d:"][draggable="true"]')
    const key = seat.dataset.slot!, before = slotVal(key)
    const src = $$('#eRoster .rpuck[data-person]').find(x => x.dataset.person !== before)!
    await dnd(src, $(`#eWeek .seat[data-slot="${key}"]`))
    expect(slotVal(key)).toBe(src.dataset.person)
    setSlotVal(key, before); await act(async () => { afterSchedMutate(); notify() })
  })

  it('flying seat <-> duty seat swap', async () => {
    const fly = $('#eWeek .acrow .seat[data-slot][draggable="true"]')
    const duty = $('#eWeek .seat[data-slot^="d:"][draggable="true"]')
    const fk = fly.dataset.slot!, dk = duty.dataset.slot!
    const a = slotVal(fk), b = slotVal(dk)
    await dnd(fly, duty)
    expect(slotVal(fk)).toBe(b)
    expect(slotVal(dk)).toBe(a)
    setSlotVal(fk, a); setSlotVal(dk, b); await act(async () => { afterSchedMutate(); notify() })
  })

  it('roster -> programme append lands in the first free overflow slot', async () => {
    const cell = $('#eWeek [data-fill$=".+"]')
    const base = cell.dataset.fill!.slice(0, -1)
    const n = () => { let i = 0; while (slotVal(base + i)) { i++ } return i }
    const before = n(), src = $('#eRoster .rpuck[data-person]')
    await dnd(src, $(`#eWeek [data-fill="${cell.dataset.fill}"]`))
    expect(n()).toBe(before + 1)
    setSlotVal(base + before, ''); await act(async () => { afterSchedMutate(); notify() })
  })

  it('roster -> empty sim cell picks the first free front seat', async () => {
    const cell = $$('#eWeek [data-fill$=".*"]').find(c => !slotVal(c.dataset.fill!.slice(0, -1) + 'p'))
    if (!cell) return
    const b = cell.dataset.fill!.slice(0, -1), src = $('#eRoster .rpuck[data-person]')
    await dnd(src, $(`#eWeek [data-fill="${cell.dataset.fill}"]`))
    expect(slotVal(b + 'p')).toBe(src.dataset.person)
    setSlotVal(b + 'p', ''); await act(async () => { afterSchedMutate(); notify() })
  })

  it('dragging a seat onto the roster unassigns it', async () => {
    const seat = $('#eWeek .seat[data-slot^="g:"][draggable="true"]')
    const key = seat.dataset.slot!, before = slotVal(key)
    await dnd($(`#eWeek .seat[data-slot="${key}"]`), $('#eRoster'))
    expect(slotVal(key)).toBe('')
    setSlotVal(key, before); await act(async () => { afterSchedMutate(); notify() })
  })

  it('the dnd class is cleared after every drop', () => {
    expect(document.body.classList.contains('dnd')).toBe(false)
  })

  it('the view page stays read-only — no drop cells, nothing draggable', () => {
    expect($$('#vWeek [data-fill]').length).toBe(0)
    expect($$('#vWeek [draggable="true"]').length).toBe(0)
  })
})

describe('applyDrop contracts (B23 / B49)', () => {
  it('dragFrom reads a slot seat', () => {
    const el = $('#eWeek .acrow .seat[data-slot][draggable="true"]')
    const r: any = dragFrom(el)
    expect(r && r.kind).toBe('slot')
    expect(r.key).toBe(el.dataset.slot)
  })

  it('dragFrom reads a roster puck', () => {
    const el = $('#eRoster .rpuck[data-person]')
    const r: any = dragFrom(el)
    expect(r && r.kind).toBe('roster')
    expect(r.id).toBe(el.dataset.person)
  })

  it('dragFrom ignores anything undraggable', () => {
    expect(dragFrom(document.body)).toBe(null)
    expect(dragFrom(null)).toBe(null)
  })

  it('applyDrop is a no-op without a drag', () => {
    expect(applyDrop($('#eWeek .seat[data-slot]'), 0, 0)).toBe(false)
  })

  it('dropping a puck back where it started says so instead of doing nothing', async () => {
    const seat = $$('#eWeek .seat[data-slot^="d:"][draggable="true"]').find(s => slotVal(s.dataset.slot!))!
    toasts = []
    await dnd(seat, seat)
    expect(toasts).toContain('Already in that seat')
    expect(slotVal(seat.dataset.slot!)).toBeTruthy()
  })

  it('a jet line refuses a third body', async () => {
    const row = $('#eWeek .acrow')
    /* a spot on the row that is neither a seat nor a people cell */
    const el = [...row.querySelectorAll('*')].find(x =>
      !x.closest('.sb-slot,.seat[data-slot]') && !x.closest('[data-fill]')) || row
    const src = $('#eRoster .rpuck[data-person]')
    toasts = []
    await dnd(src, el as Element)
    expect(toasts).toContain('A jet line carries two — FCP and RCP')
  })

  it('dragging a seat to empty page space removes it', async () => {
    const seat = $$('#eWeek .seat[data-slot^="d:"][draggable="true"]').find(s => slotVal(s.dataset.slot!))!
    const key = seat.dataset.slot!, before = slotVal(key)
    await dnd(seat, document.body)
    expect(slotVal(key)).toBe('')
    setSlotVal(key, before); await act(async () => { afterSchedMutate(); notify() })
  })

  it('a roster puck let go on empty space is still a no-op', () => {
    const id = $('#eRoster .rpuck[data-person]').dataset.person!
    setDrag({ kind: 'roster', id })
    expect(applyDrop(document.body, 0, 0)).toBe(false)
  })

  it('a seat puck dropped on jet-row dead space comes off the seat', async () => {
    const seat = $$('#eWeek .acrow .seat[data-slot][draggable="true"]').find(s => slotVal(s.dataset.slot!))!
    const key = seat.dataset.slot!, before = slotVal(key)
    const row = seat.closest('.acrow')!
    const el = [...row.querySelectorAll('*')].find(x =>
      !x.closest('.sb-slot,.seat[data-slot]') && !x.closest('[data-fill]')) || row
    toasts = []
    await dnd($(`#eWeek .seat[data-slot="${key}"]`), el as Element)
    expect(toasts).not.toContain('A jet line carries two — FCP and RCP')
    expect(slotVal(key)).toBe('')
    setSlotVal(key, before); await act(async () => { afterSchedMutate(); notify() })
  })

  it('a seat puck dropped on a row TITLE comes off the seat', async () => {
    const seat = $$('#eWeek .seat[data-slot^="d:"][draggable="true"]').find(s => slotVal(s.dataset.slot!))!
    const key = seat.dataset.slot!, before = slotVal(key)
    const nm = $('#eWeek .pl-row .nm')
    await dnd($(`#eWeek .seat[data-slot="${key}"]`), nm)
    expect(slotVal(key)).toBe('')
    setSlotVal(key, before); await act(async () => { afterSchedMutate(); notify() })
  })

  it('a seat puck dropped on a row TIMING comes off the seat', async () => {
    const seat = $$('#eWeek .seat[data-slot^="d:"][draggable="true"]').find(s => slotVal(s.dataset.slot!))!
    const key = seat.dataset.slot!, before = slotVal(key)
    const t = $('#eWeek .pl-row .t')
    await dnd($(`#eWeek .seat[data-slot="${key}"]`), t)
    expect(slotVal(key)).toBe('')
    setSlotVal(key, before); await act(async () => { afterSchedMutate(); notify() })
  })

  it('a roster puck dropped on a row title still lands on that row', async () => {
    const row = $('#eWeek .pl-row .ppl[data-fill]').closest('.pl-row')!
    const fill = row.querySelector('[data-fill]')!.getAttribute('data-fill')!   // d:di.dwi.ri.+
    const base = fill.slice(0, -2), a = base.slice(base.indexOf(':') + 1).split('.')
    const n = () => rowCrew(base[0], a).filter(Boolean).length
    const crew0 = rowCrew(base[0], a)
    const src = $$('#eRoster .rpuck[data-person]').find(x => !crew0.includes(x.dataset.person))!
    const id = src.dataset.person!, before = n()
    await dnd(src, row.querySelector('.nm')!)
    expect(n()).toBe(before + 1)
    /* take the appended body back out — primary if it landed there, else its .xN */
    if (slotVal(base) === id) setSlotVal(base, '')
    else { let i = 0; while (slotVal(base + '.x' + i) && slotVal(base + '.x' + i) !== id) i++; setSlotVal(base + '.x' + i, '') }
    await act(async () => { afterSchedMutate(); notify() })
  })

  it('every duty / ground / sim list cell is an append target', () => {
    const f = $$('#eWeek [data-fill]').map(x => x.dataset.fill!)
    const list = f.filter(k => /^[dgs]:/.test(k))
    expect(list.length).toBeGreaterThanOrEqual(6)
    expect(list.every(k => /\.\+$/.test(k))).toBe(true)
  })
})

/* the phone trap (owner report, Aug 26): arm an empty programme cell, then
   fill its row by DRAG instead of a palette tap. The ring used to be
   permanent on a phone — the emptiness guard blocked armSlot's tap-again
   toggle once the row had people, the drop never put the arm down, and the
   reference's Escape hatch (ref 4201) had been lost in the port. */
describe('a stale arm always has a way down', () => {
  const emptyCell = () => $$('#eWeek [data-fill^="a:0."]').find(c => !c.querySelector('.puck[data-person]'))!
  const clearAdded = async (key: string, id: string) => {
    const seat = $$(`#eWeek [data-fill="${key}"] .seat[data-slot]`).find(s => slotVal(s.dataset.slot!) === id)!
    setSlotVal(seat.dataset.slot!, ''); await act(async () => { afterSchedMutate(); notify() })
  }

  it('a drop that lands on the armed cell puts the arm down', async () => {
    const cell = emptyCell(); await click(cell)
    const key = cell.dataset.fill!
    expect(armedKey()).toBe(key)
    setDrag({ kind: 'roster', id: 'casper' })
    await act(async () => { applyDrop(cell, 0, 0); notify() })
    expect(armedKey()).toBe('')
    await clearAdded(key, 'casper')
  })

  it('the armed cell answers the put-me-down tap even once its row is filled', async () => {
    const cell = emptyCell(); await click(cell)
    const key = cell.dataset.fill!
    expect(armedKey()).toBe(key)
    await act(async () => { fillSlot(key, 'casper'); afterSchedMutate(); notify() })
    expect(armedKey()).toBe(key)               // the fill alone leaves the arm up
    await click($(`#eWeek [data-fill="${key}"]`))
    expect(armedKey()).toBe('')
    await clearAdded(key, 'casper')
  })

  it('Escape puts an armed slot down — the reference hatch, restored', async () => {
    const cell = emptyCell(); await click(cell)
    expect(armedKey()).toBe(cell.dataset.fill)
    await act(async () => { document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })) })
    expect(armedKey()).toBe('')
  })
})

/* Chromium aborts a native drag whose dragstart handler restyles the page
   before the drag image is captured — adding body.dnd synchronously killed
   every mouse drag (owner report, Aug 26: nothing dragged in from the
   Placeholders row, or anywhere else, on a desktop). The decoration now waits
   one tick; these pin the timing and the no-stale-class guard. */
describe('the dragstart decoration waits one tick', () => {
  const src = () => $('#eRoster .rpuck[data-person]')
  const ev = (t: string) => new Event(t, { bubbles: true, cancelable: true })

  it('body.dnd is not added synchronously, but lands a tick later', async () => {
    src().dispatchEvent(ev('dragstart'))
    expect(document.body.classList.contains('dnd')).toBe(false)
    await new Promise(r => setTimeout(r, 0))
    expect(document.body.classList.contains('dnd')).toBe(true)
    src().dispatchEvent(ev('dragend'))
    expect(document.body.classList.contains('dnd')).toBe(false)
  })

  it('a drag that ends before the tick never decorates the page', async () => {
    src().dispatchEvent(ev('dragstart'))
    src().dispatchEvent(ev('dragend'))
    await new Promise(r => setTimeout(r, 0))
    expect(document.body.classList.contains('dnd')).toBe(false)
  })
})

/* The image under the mouse is ours (owner, 3 Sep 26 — "a white box follows
   the puck"): with selection off app-wide, Chromium's automatic snapshot of a
   draggable came back as a white card. dragstart now hands the browser a clone
   of the PUCK alone, parked off-screen with selection handed back, sized from
   the puck's rect and anchored where the cursor grabbed; dragend removes it. */
describe('the mouse drag image is an off-screen puck clone', () => {
  const src = () => $('#eRoster .rpuck[data-person]')
  const ev = (t: string) => new Event(t, { bubbles: true, cancelable: true })
  const withImage = (t: string, x = 0, y = 0) => {
    const calls: any[] = []
    const dt: any = { effectAllowed: '', setData() {}, setDragImage(el: any, ox: number, oy: number) { calls.push({ el, ox, oy }) } }
    const ev: any = new Event(t, { bubbles: true, cancelable: true })
    try { ev.dataTransfer = dt } catch (_) {}
    Object.defineProperty(ev, 'clientX', { value: x }); Object.defineProperty(ev, 'clientY', { value: y })
    return { ev, calls }
  }

  it('sets a .dragimg clone of the puck, in the body, selectable, and removes it on dragend', () => {
    const { ev, calls } = withImage('dragstart')
    src().dispatchEvent(ev)
    expect(calls.length, 'setDragImage called once').toBe(1)
    const g = calls[0].el as HTMLElement
    expect(g.classList.contains('dragimg')).toBe(true)
    expect(g.classList.contains('puck'), 'the image is the puck, not the .rpuck shell').toBe(true)
    expect(g.parentNode, 'laid out in the body for the capture').toBe(document.body)
    expect(g.getAttribute('draggable'), 'the clone is not itself draggable').toBeNull()
    expect(g.textContent).toBe(src().querySelector('.puck')!.textContent)
    expect(document.querySelectorAll('.dragimg').length).toBe(1)
    src().dispatchEvent(withImage('dragend').ev)
    expect(document.querySelectorAll('.dragimg').length, 'gone at dragend').toBe(0)
  })

  /* A drop repaints the palette, which detaches the source before its dragend
     can bubble to the document — seen on the built bundle: the puck landed and
     no dragend was observed. So the clone must go with the DROP, not wait for
     a dragend that never arrives. */
  it('a drop clears the clone even when no dragend follows', async () => {
    src().dispatchEvent(withImage('dragstart').ev)
    expect(document.querySelectorAll('.dragimg').length).toBe(1)
    const cell = $('#eWeek [data-fill^="d:"]')
    await act(async () => { cell.dispatchEvent(withImage('dragover').ev); cell.dispatchEvent(withImage('drop').ev) })
    expect(document.querySelectorAll('.dragimg').length, 'gone on the drop').toBe(0)
    expect(document.body.classList.contains('dnd')).toBe(false)
  })

  it('a second dragstart replaces a stale clone rather than stacking one', () => {
    src().dispatchEvent(withImage('dragstart').ev)
    src().dispatchEvent(withImage('dragstart').ev)
    expect(document.querySelectorAll('.dragimg').length).toBe(1)
    src().dispatchEvent(withImage('dragend').ev)
    expect(document.querySelectorAll('.dragimg').length).toBe(0)
  })

  it('a dataTransfer without setDragImage (jsdom, old browsers) is simply skipped', () => {
    src().dispatchEvent(ev('dragstart'))
    expect(document.querySelectorAll('.dragimg').length).toBe(0)
    src().dispatchEvent(ev('dragend'))
  })
})

/* isPhone was never wired in the port — the default `false` meant a palette
   drag on a phone never parked the drawer, so the drop could only land back
   on the drawer itself: a silent no-op. */
describe('isPhone is wired', () => {
  it('follows matchMedia when the browser provides it', () => {
    const orig = (window as any).matchMedia
    ;(window as any).matchMedia = (q: string) => ({ matches: q === '(max-width:820px)' })
    wireStore()
    expect(HOOKS.isPhone()).toBe(true)
    ;(window as any).matchMedia = () => ({ matches: false })
    expect(HOOKS.isPhone()).toBe(false)
    ;(window as any).matchMedia = orig
  })

  it('falls back to innerWidth where matchMedia is missing (jsdom)', () => {
    const orig = (window as any).matchMedia
    delete (window as any).matchMedia
    wireStore()
    expect(HOOKS.isPhone()).toBe(window.innerWidth <= 820)
    ;(window as any).matchMedia = orig
  })
})

/* reviewer-found residual (9 Aug 26): applyDrop is the ONE mutation path
   shared by mouse and touch (the comment right above its role check said
   so), but the check itself only ever tested canEditSched() — the role,
   never HOOKS.editMode(). Demonstrated live on a read-only board (edit
   toggle off, board still legitimately open on its own page): 36 draggable
   seats and 59 draggable roster pucks, and dragging a name onto a duty row
   wrote it straight into the model. board-html.ts's render-side widening
   (sbSeat/data-fill now follow the same ro flag the flying line's seats
   do) closes the ORDINARY path to this, but a stale drag already begun
   before the toggle flips — grabbed here BEFORE editMode() goes false, the
   same "stale element" shape every other write-path test in this task
   uses — is exactly what a render fix alone cannot stop; only the check
   inside applyDrop itself can. */
describe('applyDrop refuses on a read-only board, not just the render (reviewer-found residual, 9 Aug 26)', () => {
  it('dragging a roster puck onto a duty row does not write once editMode() is false', async () => {
    await act(async () => { openScheduler(0); notify() })
    const fill = document.querySelector('#sbBoard .sb-panel.duty [data-fill]') as HTMLElement
    expect(fill, 'sanity: a duty row fill target exists').toBeTruthy()
    const puck = document.querySelector('#sbRoster [data-person][draggable="true"]') as HTMLElement
    expect(puck, 'sanity: a draggable roster puck exists').toBeTruthy()
    const before = JSON.stringify(DAYS[0].dutywaves)
    /* HOOKS.editMode stubbed directly rather than reached through a real
       page change + notify() — the same
       "stale element" shape every other write-path test in this task uses,
       and for the same reason: notify() would re-render the duty panel
       through board-html.ts's OWN render widening, which DETACHES `fill`
       from the document (the panel's innerHTML is replaced wholesale, not
       patched) — a detached element's events never bubble to document,
       where drag.ts's listeners live, so the drop would silently no-op and
       "pass" whether or not applyDrop's own check does anything at all.
       Stubbing the answer without ever re-rendering keeps `fill` and `puck`
       genuinely attached and live, so this proves applyDrop's OWN check,
       not an accidentally-unreachable target. */
    HOOKS.editMode = () => false
    try {
      await dnd(puck, fill)
      expect(JSON.stringify(DAYS[0].dutywaves), 'the model never saw the drop').toBe(before)
    } finally {
      HOOKS.editMode = () => true
      await act(async () => { closeScheduler(); notify() })
    }
  })

  /* proves the guard is genuinely conditional, not a silent always-refuse:
     the identical gesture, in edit mode, still writes. No later test in
     this file reads DAYS[0].dutywaves, so the write this leaves behind
     (a) doesn't need undoing — same reasoning drag.test.tsx's other
     mutation-proving tests already rely on (see e.g. B23/B49 above, which
     leave their own drops in place too). */
  it('the same drag DOES write in edit mode (unchanged)', async () => {
    await act(async () => { openScheduler(0); notify() })
    const fill = document.querySelector('#sbBoard .sb-panel.duty [data-fill]') as HTMLElement
    const puck = document.querySelector('#sbRoster [data-person][draggable="true"]') as HTMLElement
    const before = JSON.stringify(DAYS[0].dutywaves)
    await dnd(puck, fill)
    expect(JSON.stringify(DAYS[0].dutywaves), 'the model DID see the drop').not.toBe(before)
    await act(async () => { closeScheduler(); notify() })
  })
})

/* put the real toast back for any suite that runs after this file */
describe('cleanup', () => {
  it('restores the toast hook', () => { HOOKS.toast = origToast; expect(true).toBe(true) })
})
