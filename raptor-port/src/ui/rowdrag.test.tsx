// @vitest-environment jsdom
/* The row-drag pointer machine. jsdom has no layout, so this proves the STATE
   machine — which row was picked up, which one it was dropped on, and that a
   refused move leaves the model alone. Whether the drop bar is drawn in the
   right place is a geometry question and lives in e2e/geometry.spec.ts. */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DAYS } from '../engine/data'
import { wireRowDrag } from './rowdrag'
import { setSession } from '../state/auth'
import { boardHTML } from './board'
import { HOOKS } from '../engine/hooks'

const DSNAP = JSON.stringify(DAYS)
let host: HTMLElement, off: () => void

function rowsHTML(addrs: string[]) {
  /* mirrors the real markup: the ADDRESS is on the ROW, the grip carries none */
  return addrs.map(a => `<div class="sb-arow" data-move="${a}"><span class="sb-grip">⠿</span></div>`).join('')
}
function down(el: Element) { el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 })) }
function over(el: Element) { el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1 })) }
function up() { document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 })) }

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  setSession({ user: 'a', role: 'admin' } as any)
  document.body.innerHTML = '<div id="host"></div>'
  host = document.getElementById('host')!
  off?.(); off = wireRowDrag(host)
})

describe('wireRowDrag', () => {
  it('drops a programme row onto another and moves it', () => {
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    const was = DAYS[di].allhands.map((x: any) => x.prog)
    host.innerHTML = rowsHTML([`mv:p.${di}.0`, `mv:p.${di}.1`])
    const [a, b] = [...host.querySelectorAll('.sb-grip')]
    down(a); over(b); up()
    expect(DAYS[di].allhands.map((x: any) => x.prog)).toEqual([was[1], was[0], ...was.slice(2)])
  })

  it('marks the row it is carrying and the row it is over, and clears both on drop', () => {
    host.innerHTML = rowsHTML(['mv:p.0.0', 'mv:p.0.1'])
    const [a, b] = [...host.querySelectorAll('.sb-grip')]
    const [rowA, rowB] = [...host.querySelectorAll('.sb-arow')]
    down(a); over(b)
    /* a COUNT of marked elements is not enough — it stays 1-and-1 whether the
       mark lands on the row or on the 18px grip inside it. The address only
       resolves on the row, so the mark must land there too, never the grip. */
    expect(host.querySelectorAll('.rowdrag').length).toBe(1)
    expect(host.querySelectorAll('.rowdrop').length).toBe(1)
    expect(rowA.classList.contains('rowdrag')).toBe(true)
    expect(a.classList.contains('rowdrag')).toBe(false)
    expect(rowB.classList.contains('rowdrop')).toBe(true)
    expect(b.classList.contains('rowdrop')).toBe(false)
    up()
    expect(host.querySelectorAll('.rowdrag,.rowdrop').length).toBe(0)
  })

  it('a drag that starts anywhere but the grip is ignored', () => {
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    const was = JSON.stringify(DAYS[di].allhands)
    host.innerHTML = rowsHTML([`mv:p.${di}.0`, `mv:p.${di}.1`])
    const rows = [...host.querySelectorAll('.sb-arow')]
    down(rows[0]); over(rows[1]); up()
    expect(JSON.stringify(DAYS[di].allhands)).toBe(was)
  })

  it('a drop that crosses a container is refused and leaves no marks behind', () => {
    const was = JSON.stringify(DAYS[0].waves)
    host.innerHTML = rowsHTML(['mv:ac.0.0.0.0', 'mv:ac.0.1.0.0'])
    const [a, b] = [...host.querySelectorAll('.sb-grip')]
    down(a); over(b); up()
    expect(JSON.stringify(DAYS[0].waves)).toBe(was)
    expect(host.querySelectorAll('.rowdrag,.rowdrop').length).toBe(0)
  })

  it('a member cannot pick a row up at all', () => {
    setSession({ user: 'user', role: 'member' } as any)
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    const was = JSON.stringify(DAYS[di].allhands)
    host.innerHTML = rowsHTML([`mv:p.${di}.0`, `mv:p.${di}.1`])
    const [a, b] = [...host.querySelectorAll('.sb-grip')]
    down(a); over(b); up()
    expect(JSON.stringify(DAYS[di].allhands)).toBe(was)
  })

  it('a pointer that lifts outside the container still ends the drag', () => {
    host.innerHTML = rowsHTML(['mv:p.0.0', 'mv:p.0.1'])
    const [a] = [...host.querySelectorAll('.sb-grip')]
    down(a); up()
    expect(host.querySelectorAll('.rowdrag').length).toBe(0)
  })

  /* jsdom does not implement pointer capture at all (no
     setPointerCapture/releasePointerCapture on any element), so nothing in
     the suite above can tell whether onDown actually released it — the
     optional-chained call is silently a no-op either way under jsdom. This
     pins the call itself: stub the method on the grip and assert the pickup
     invokes it with the down event's pointerId, which is the mechanism a
     real touch depends on to ever find a new home. */
  it('releases the grip pointer capture on pickup', () => {
    host.innerHTML = rowsHTML(['mv:p.0.0', 'mv:p.0.1'])
    const [a] = [...host.querySelectorAll('.sb-grip')] as HTMLElement[]
    const released = vi.fn()
    ;(a as any).releasePointerCapture = released
    down(a)
    expect(released).toHaveBeenCalledWith(1)
  })

  /* A hand-written fixture can drift from what the real builders emit and
     take every test above with it — that is exactly what happened here: the
     fixture used to stamp the address on the grip, matching nothing sbGrip()
     and rowMove() actually produce, and every test still passed. This test
     drives boardHTML's genuine output instead, so it stays honest if the
     markup ever moves again. */
  it('drives the real board markup end to end, not a hand-written fixture', () => {
    const origEditMode = HOOKS.editMode
    HOOKS.editMode = () => true
    try {
      const was = DAYS[0].allhands.map((x: any) => x.prog)
      host.innerHTML = boardHTML(0)
      const rows = [...host.querySelectorAll('.sb-arow[data-move^="mv:p.0."]')] as HTMLElement[]
      expect(rows.length).toBeGreaterThan(1)
      const [rowA, rowB] = rows
      const gripA = rowA.querySelector('.sb-grip') as HTMLElement
      expect(gripA).toBeTruthy()
      down(gripA); over(rowB); up()
      expect(DAYS[0].allhands.map((x: any) => x.prog)).toEqual([was[1], was[0], ...was.slice(2)])
    } finally {
      HOOKS.editMode = origEditMode
    }
  })
})
