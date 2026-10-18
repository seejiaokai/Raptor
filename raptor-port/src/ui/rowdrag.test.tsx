// @vitest-environment jsdom
/* The row-drag pointer machine. jsdom has no layout, so this proves the STATE
   machine — which row was picked up, which one it was dropped on, and that a
   refused move leaves the model alone. Whether the drop bar is drawn in the
   right place is a geometry question and lives in e2e/geometry.spec.ts. */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DAYS } from '../engine/data'
import { landSel, wireRowDrag, rowEdge } from './rowdrag'
import { routeFocusOut } from './textedit'
import { subscribe } from '../state/store'
import { markLand, paintLand, pendingLand } from './lift'
import { setSession } from '../state/auth'
import { setBoardDay, DPREV } from '../state/view'
import { boardHTML } from './board'
import { dayHTML } from './html'
import { HOOKS } from '../engine/hooks'
import { secOrder } from '../engine'
import { SECDEFOFFER, setSecDefOffer } from './pops'
import { ensureRowIds } from '../engine/rowids'

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
    setSession({ user: 'user', role: 'main' } as any)
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    const was = JSON.stringify(DAYS[di].allhands)
    host.innerHTML = rowsHTML([`mv:p.${di}.0`, `mv:p.${di}.1`])
    const [a, b] = [...host.querySelectorAll('.sb-grip')]
    down(a); over(b); up()
    expect(JSON.stringify(DAYS[di].allhands)).toBe(was)
  })

  /* The frozen-preview guard is per DRAGGED day (bug-hunt fix, 1 Sep 26). The
     machine is wired on the edit week too, where seven days render at once —
     the old gate read the BOARD's selected day (SBDAY), so a preview left
     open on the board silently killed every drag on the week, previewing or
     not. The first test fails on that old gate; the other two pin the
     per-day refusal on both address shapes (mv: rows, secmove sections). */
  it('a preview open on the BOARD day does not block dragging another day', () => {
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    const dj = (di + 1) % DAYS.length
    setBoardDay(dj); DPREV.set(dj, 'orig')
    const was = DAYS[di].allhands.map((x: any) => x.prog)
    host.innerHTML = rowsHTML([`mv:p.${di}.0`, `mv:p.${di}.1`])
    const [a, b] = [...host.querySelectorAll('.sb-grip')]
    down(a); over(b); up()
    DPREV.delete(dj); setBoardDay(null)
    expect(DAYS[di].allhands.map((x: any) => x.prog)).toEqual([was[1], was[0], ...was.slice(2)])
  })

  it('a row drag on the previewing day itself is refused (stale markup)', () => {
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    DPREV.set(di, 'orig')
    const was = JSON.stringify(DAYS[di].allhands)
    host.innerHTML = rowsHTML([`mv:p.${di}.0`, `mv:p.${di}.1`])
    const [a, b] = [...host.querySelectorAll('.sb-grip')]
    down(a); over(b); up()
    DPREV.delete(di)
    expect(JSON.stringify(DAYS[di].allhands)).toBe(was)
    expect(host.querySelectorAll('.rowdrag,.rowdrop').length).toBe(0)
  })

  it('a section grip on the previewing day cannot pick up either', () => {
    DPREV.set(0, 'orig')
    host.innerHTML = '<div class="sb-sec" data-secmove="0.grnd"><span class="secgrip">⠿</span></div>'
    down(host.querySelector('.secgrip')!)
    DPREV.delete(0)
    expect(host.querySelectorAll('.secdrag').length).toBe(0)
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

  /* SECTIONS + WAVES drag in place now (owner, 29 Aug 26 pt.3, replacing the
     Arrange sheet). All driven through the real board markup so the fixtures
     can't drift from the builders. */
  describe('sections and waves (the in-place Arrange replacement)', () => {
    const withEdit = (fn: () => void) => {
      const o = HOOKS.editMode; HOOKS.editMode = () => true
      try { fn() } finally { HOOKS.editMode = o }
    }
    beforeEach(() => setSecDefOffer(null))

    it('drags a section to another section\'s place (display order, spanning positions)', () => withEdit(() => {
      host.innerHTML = boardHTML(0)
      const grip = host.querySelector('[data-secmove="0.prog"] .secgrip') as HTMLElement
      const target = host.querySelector('[data-secmove="0.duty"]') as HTMLElement
      expect(grip && target).toBeTruthy()
      down(grip); over(target); up()
      /* prog moves to where duty sat; the rest keep their relative order (notes,
         a separate section now, stays put at the head) */
      expect(secOrder(DAYS[0])).toEqual(['notes', 'waves', 'duty', 'prog', 'sims', 'ground', 'inputs', 'avail', 'sans', 'unav'])
    }))

    it('a section drag offers the "set as default?" snackbar on a real move', () => withEdit(() => {
      host.innerHTML = boardHTML(0)
      const grip = host.querySelector('[data-secmove="0.ground"] .secgrip') as HTMLElement
      const target = host.querySelector('[data-secmove="0.prog"]') as HTMLElement
      down(grip); over(target); up()
      expect(SECDEFOFFER).toBe(0)
    }))

    it('a section drag is DISPLAY only — no pending edit, no amendment', () => withEdit(() => {
      host.innerHTML = boardHTML(0)
      /* a real session has every row minted (engine/rowids.ts) before any
         drag ever runs; the "nothing changed" snapshot must be taken from
         that same state, or the drag epilogue's own mint (histPush ->
         ensureRowIds) reads as a change nothing here actually made. */
      ensureRowIds(DAYS)
      const before = JSON.stringify(DAYS[0].waves)   // model rows untouched by a section move
      const grip = host.querySelector('[data-secmove="0.sims"] .secgrip') as HTMLElement
      const target = host.querySelector('[data-secmove="0.prog"]') as HTMLElement
      down(grip); over(target); up()
      expect(JSON.stringify(DAYS[0].waves)).toBe(before)
    }))

    it('drags a whole WAVE block onto another, reordering the model (a real amendment)', () => withEdit(() => {
      const di = DAYS.findIndex((d: any) => (d.waves || []).length > 1)
      expect(di).toBeGreaterThanOrEqual(0)
      host.innerHTML = boardHTML(di)
      const was = DAYS[di].waves.map((w: any) => w.label)
      const grip = host.querySelector(`.sb-go[data-move="mv:w.${di}.0"] .wvgrip`) as HTMLElement
      const target = host.querySelector(`.sb-go[data-move="mv:w.${di}.1"]`) as HTMLElement
      down(grip); over(target); up()
      expect(DAYS[di].waves.map((w: any) => w.label)).toEqual([was[1], was[0], ...was.slice(2)])
    }))

    it('a wave drag targets the BLOCK even when the pointer is over a line inside it', () => withEdit(() => {
      const di = DAYS.findIndex((d: any) => (d.waves || []).length > 1)
      host.innerHTML = boardHTML(di)
      const was = DAYS[di].waves.map((w: any) => w.label)
      const grip = host.querySelector(`.sb-go[data-move="mv:w.${di}.0"] .wvgrip`) as HTMLElement
      /* a flying LINE inside wave 1 — the drag must still resolve to wave 1's block */
      const innerRow = host.querySelector(`.sb-go[data-move="mv:w.${di}.1"] .sb-line[data-move^="mv:ac."]`) as HTMLElement
      expect(innerRow).toBeTruthy()
      down(grip); over(innerRow); up()
      expect(DAYS[di].waves.map((w: any) => w.label)).toEqual([was[1], was[0], ...was.slice(2)])
    }))

    /* D593, D594: a wave's In-time / Rally lines drag into order on the Scheduler Board — never on Edit Schedule's week */
    it('drags an In-time / Rally line onto another line of its wave on the board', () => withEdit(() => {
      DAYS[0].waves[0].intimes = ['07:00H: IN TIME + WX/NOTAMS', '07:30H: RALLY']
      host.innerHTML = boardHTML(0)
      const rows = [...host.querySelectorAll('.intimes .itrow[data-move^="mv:it.0.0."]')] as HTMLElement[]
      expect(rows.map(r => r.dataset.move)).toEqual(['mv:it.0.0.0', 'mv:it.0.0.1'])
      expect(rows[0].querySelector('.sb-grip'), 'each line carries the board grip').toBeTruthy()
      expect(rows[0].querySelector('[data-itline="0|0|0"]') && rows[0].querySelector('[data-itdel="0|0|0"]'), 'its line and its ✕ inside').toBeTruthy()
      down(rows[1].querySelector('.sb-grip')!); over(rows[0]); up()
      expect(DAYS[0].waves[0].intimes).toEqual(['07:30H: RALLY', '07:00H: IN TIME + WX/NOTAMS'])
    }))
    /* the batch's check (19 Oct 26 — the scenario designer's S1-01): the caret in a line ("+ In-time / Rally" leaves it
       there), another line dragged above it. The drag left the caret where it was, the board held the old order on
       screen for the caret, and leaving the line wrote its words over the line now at its OLD place — one line doubled,
       the other lost. A press on a grip takes the caret out first, saving the line where it stands. */
    it('a line dragged while the caret is in another line loses no line', () => withEdit(() => {
      DAYS[0].waves[0].intimes = ['07:00H: IN TIME + WX/NOTAMS', '07:30H: RALLY']
      host.innerHTML = boardHTML(0)
      document.addEventListener('focusout', routeFocusOut)
      try {
        const line0 = host.querySelector('[data-itline="0|0|0"]') as HTMLElement
        line0.focus()
        expect(document.activeElement, 'the caret is in the first line (or this test proves nothing)').toBe(line0)
        const rows = [...host.querySelectorAll('.intimes .itrow[data-move^="mv:it.0.0."]')] as HTMLElement[]
        down(rows[1].querySelector('.sb-grip')!); over(rows[0]); up()
        line0.blur()
        expect(DAYS[0].waves[0].intimes, 'both lines, in the new order').toEqual(['07:30H: RALLY', '07:00H: IN TIME + WX/NOTAMS'])
      } finally { document.removeEventListener('focusout', routeFocusOut) }
    }))
    /* the fresh read of the batch (19 Oct 26, F2): a line EMPTIED, then another line's grip pressed — the press's blur
       deletes the emptied line and renumbers the rows, and the board's redraw replaces them; the grip was found again
       by the address read BEFORE the blur, which by then named the line below. The store's redraw is played here by a
       listener that rewrites the board, as the app's does. */
    it('a line emptied, then another line dragged: the line pressed is the line that moves', () => withEdit(() => {
      DAYS[0].waves[0].intimes = ['A 07:00H', 'B 07:30H', 'C 08:00H', 'D 08:30H']
      host.innerHTML = boardHTML(0)
      document.addEventListener('focusout', routeFocusOut)
      const redraw = subscribe(() => { host.innerHTML = boardHTML(0) })
      try {
        const line0 = host.querySelector('[data-itline="0|0|0"]') as HTMLElement
        line0.focus(); line0.textContent = ''
        const gripC = host.querySelector('[data-move="mv:it.0.0.2"] .sb-grip') as HTMLElement
        down(gripC)
        over(host.querySelector('[data-move="mv:it.0.0.0"]')!); up()
        expect(DAYS[0].waves[0].intimes, 'C moved above B; A gone; D where it was').toEqual(['C 08:00H', 'B 07:30H', 'D 08:30H'])
      } finally { redraw(); document.removeEventListener('focusout', routeFocusOut) }
    }))
    it('an In-time / Rally line is not dropped on a wave block or another wave’s line', () => withEdit(() => {
      const di = DAYS.findIndex((d: any) => (d.waves || []).length > 1)
      DAYS[di].waves[0].intimes = ['07:00H: IN TIME', '07:30H: RALLY']
      DAYS[di].waves[1].intimes = ['10:00H: IN TIME']
      host.innerHTML = boardHTML(di)
      const grip = host.querySelector(`[data-move="mv:it.${di}.0.1"] .sb-grip`) as HTMLElement
      down(grip); over(host.querySelector(`[data-move="mv:it.${di}.1.0"]`)!); up()
      down(grip); over(host.querySelector(`.sb-go[data-move="mv:w.${di}.1"]`)!); up()
      expect(DAYS[di].waves[0].intimes).toEqual(['07:00H: IN TIME', '07:30H: RALLY'])
      expect(DAYS[di].waves[1].intimes).toEqual(['10:00H: IN TIME'])
    }))
    it('Edit Schedule’s week draws its In-time / Rally lines with no grip (D594)', () => withEdit(() => {
      DAYS[0].waves[0].intimes = ['07:00H: IN TIME', '07:30H: RALLY']
      const week = dayHTML(0, true)
      expect(week).toContain('data-itline="0|0|1"')
      expect(week).not.toContain('mv:it.')
      expect(week).not.toContain('class="itrow"')
    }))

    it('a member cannot drag a section', () => withEdit(() => {
      host.innerHTML = boardHTML(0)
      setSession({ user: 'user', role: 'main' } as any)
      const grip = host.querySelector('[data-secmove="0.prog"] .secgrip') as HTMLElement
      const target = host.querySelector('[data-secmove="0.duty"]') as HTMLElement
      down(grip); over(target); up()
      expect(DAYS[0].secOrder).toBeUndefined()
      expect(SECDEFOFFER).toBe(null)
    }))
  })
})

/* ONE LIFT, EVERY DRAG (owner, 6 Sep 26 — "the thing u are grabbing glows
   evenly … once I drop the item it should flash to show where the new item
   ended up"). Two halves meet here. The PICKED-UP half is a second class on
   the same element `rowdrag`/`secdrag` already mark, so the box is the shared
   recipe (scheduler.css .lift) and those two are left as state classes for the
   grip recolour. The LANDING half is deferred, because every board panel is an
   innerHTML string a re-render rebuilds and the row that was carried is a NEW
   node by the time anyone could flash it: rowdrag marks the destination
   ADDRESS before the rebuild and highlights.ts's paintLand paints whatever
   answers it afterwards. jsdom rebuilds nothing, so what is pinned here is the
   address arithmetic, the mark, and that the paint happens exactly once. */
describe('one lift, every drag — the board (6 Sep 26)', () => {
  /* one module-level slot in lift.ts, so a mark left by an earlier test (every
     accepted move sets one now) must not be inherited */
  beforeEach(() => markLand(''))

  /* [ONE-ROW-DRAG-FLASH] (the one-row job's walk, W1 s11, 11 Oct 26; Fable's read F2): a day's FIRST hand move of a
     ground row freezes the order on screen into the model, so the row lands at the frozen order's index — the flash went
     to the drop's own address, a row out. It now goes to the row the engine says landed. */
  it('a day’s first ground drag flashes the row that landed, not the address it was dropped on', () => {
    const o = HOOKS.editMode; HOOKS.editMode = () => true
    try {
      DAYS[0].ground = [{ prog: 'B', str: '1000' }, { prog: 'A', str: '0800' }, { prog: 'C', str: '0900' }]
      DAYS[0].gman = false
      host.innerHTML = boardHTML(0)
      /* drawn A, C, B — by start time; B (model 0) dropped on A (model 1) */
      down(host.querySelector('[data-move="mv:g.0.0"] .sb-grip')!); over(host.querySelector('[data-move="mv:g.0.1"]')!); up()
      expect(DAYS[0].ground.map((r: any) => r.prog), 'B is first now').toEqual(['B', 'A', 'C'])
      expect(pendingLand()!.sel, 'the flash goes to the row B landed on').toMatch(/\[data-move="mv:g\.0\.0"\]$/)
    } finally { HOOKS.editMode = o }
  })

  it('the carried row wears lift beside rowdrag, and loses both on release', () => {
    host.innerHTML = rowsHTML(['mv:p.0.0', 'mv:p.0.1'])
    const [a] = [...host.querySelectorAll('.sb-grip')]
    const [rowA] = [...host.querySelectorAll('.sb-arow')]
    down(a)
    expect(rowA.classList.contains('rowdrag')).toBe(true)
    expect(rowA.classList.contains('lift')).toBe(true)
    expect(a.classList.contains('lift'), 'the box goes on the row, never the 18px grip').toBe(false)
    up()
    expect(rowA.classList.contains('rowdrag')).toBe(false)
    expect(rowA.classList.contains('lift')).toBe(false)
  })

  it('a section carries lift beside secdrag', () => {
    host.innerHTML = '<div class="sb-sec" data-secmove="0.grnd"><span class="secgrip">⠿</span></div>'
    const sec = host.querySelector('[data-secmove]') as HTMLElement
    down(host.querySelector('.secgrip')!)
    expect(sec.classList.contains('secdrag')).toBe(true)
    expect(sec.classList.contains('lift')).toBe(true)
    up()
    expect(host.querySelectorAll('.secdrag,.lift').length).toBe(0)
  })

  it('landSel: the destination address is the landed row; a travelling formation names its block', () => {
    /* engine/reorder.ts: "`to` is the destination index AFTER removal", so the
       row that was carried answers the target's own address. ONE selector, plain
       (7 Sep 26): it used to be a one-element tuple every caller read as `[0]`,
       left over from a `climb` half that no production caller ever needed. */
    expect(landSel('mv:d.0.0.1', 'mv:d.0.0.3')).toBe('[data-move="mv:d.0.0.3"]')
    expect(landSel('mv:ac.0.1.0.2', 'mv:ac.0.1.0.0')).toBe('[data-move="mv:ac.0.1.0.0"]')   // a jet resequenced inside its formation
    /* the one exception — the whole FORMATION travelled, so `to` names a jet
       inside the target formation and what flashes is the first jet line of the
       block now at the target's formation index (a formation has no wrapper
       element, so there is nothing to climb to) */
    expect(landSel('mv:ac.0.1.0.2', 'mv:ac.0.1.2.0')).toBe('[data-move^="mv:ac.0.1.2."]')
  })

  it('a real move marks the landed row BEFORE the rebuild, and paintLand paints it once', () => {
    const o = HOOKS.editMode; HOOKS.editMode = () => true
    try {
      host.innerHTML = boardHTML(0)
      const rows = [...host.querySelectorAll('.sb-arow[data-move^="mv:p.0."]')] as HTMLElement[]
      const [rowA, rowB] = rows
      const to = rowB.dataset.move!
      down(rowA.querySelector('.sb-grip')!); over(rowB); up()
      /* `#host ` is this harness's surface prefix — see the two-surface test
         below for why the mark is scoped to the surface it was dragged on */
      expect(pendingLand()).toEqual({ sel: `#host [data-move="${to}"]`, climb: undefined })
      paintLand()                                      // what refreshHighlights does after the repaint
      const landed = host.querySelector(`[data-move="${to}"]`)!
      expect(landed.classList.contains('lift-land')).toBe(true)
      /* one flash per node: an unrelated repaint that leaves the row standing
         can never restart it (the .sb-fresh lesson, highlights.ts
         paintFreshAdds) */
      landed.classList.remove('lift-land'); paintLand()
      expect(landed.classList.contains('lift-land')).toBe(false)
    } finally { HOOKS.editMode = o }
  })

  /* a section keeps its own key wherever it lands (the move is a display order,
     not a renumbering), so its address is the one thing that does not move */
  it('a section move marks the section that travelled, by its own key', () => {
    const o = HOOKS.editMode; HOOKS.editMode = () => true
    try {
      host.innerHTML = boardHTML(0)
      const grip = host.querySelector('[data-secmove="0.prog"] .secgrip') as HTMLElement
      const target = host.querySelector('[data-secmove="0.duty"]') as HTMLElement
      down(grip); over(target); up()
      expect(pendingLand()).toEqual({ sel: '#host [data-secmove="0.prog"]', climb: undefined })
      paintLand()
      expect(host.querySelector('[data-secmove="0.prog"]')!.classList.contains('lift-land')).toBe(true)
    } finally { HOOKS.editMode = o }
  })

  /* THE BOARD AND THE EDIT WEEK SPEAK THE SAME ADDRESSES (fix, 6 Sep 26
     review). A wave is `mv:w.<di>.<gi>` and a section `<di>.<key>` on BOTH
     surfaces — html.ts's `.dsec` / wave block in edit mode, board.ts's
     `.sb-sec` / `.sb-go` — and the week stays mounted behind the board overlay,
     earlier in document order. An unscoped mark therefore flashed the week's
     hidden node on every board drop and, because that node survives, spent the
     mark there so the board's own row was never reached. Each wiring now
     prefixes its mark with its own surface id. */
  describe('the same address on two surfaces', () => {
    const secs = (cls: string) => ['prog', 'duty']
      .map(k => `<div class="${cls}" data-secmove="0.${k}"><span class="secgrip">⠿</span></div>`).join('')
    const drop = (root: HTMLElement) => {
      const offSurface = wireRowDrag(root)
      try {
        down(root.querySelector('[data-secmove="0.prog"] .secgrip')!)
        over(root.querySelector('[data-secmove="0.duty"]')!)
        up()
      } finally { offSurface() }
    }
    beforeEach(() => {
      document.body.innerHTML =
        `<div class="week" id="eWeek">${secs('dsec')}</div>` +
        `<div class="sb-board" id="sbBoard">${secs('sb-sec')}</div>`
    })
    const lit = (sel: string) => document.querySelector(sel)!.classList.contains('lift-land')

    it('a section dropped on the BOARD flashes the board\'s node, never the week\'s copy', () => {
      drop(document.getElementById('sbBoard')!)
      paintLand()
      expect(lit('#sbBoard [data-secmove="0.prog"]'), 'the section the user dropped flashes').toBe(true)
      expect(lit('#eWeek [data-secmove="0.prog"]'), 'the hidden week copy is left alone').toBe(false)
      expect(pendingLand()).toEqual({ sel: '#sbBoard [data-secmove="0.prog"]', climb: undefined })
    })

    it('…and a section dropped on the WEEK flashes the week\'s own', () => {
      drop(document.getElementById('eWeek')!)
      expect(pendingLand()).toEqual({ sel: '#eWeek [data-secmove="0.prog"]', climb: undefined })
      paintLand()
      expect(lit('#eWeek [data-secmove="0.prog"]')).toBe(true)
      expect(lit('#sbBoard [data-secmove="0.prog"]')).toBe(false)
    })
  })

  it('a STALE drop (a detached carry) marks nothing', () => {
    host.innerHTML = rowsHTML(['mv:p.0.0', 'mv:p.0.1'])
    const [a, b] = [...host.querySelectorAll('.sb-grip')]
    down(a); over(b)
    host.innerHTML = rowsHTML(['mv:p.0.0', 'mv:p.0.1'])   // a repaint under the finger detaches both
    up()
    expect(pendingLand(), 'the drop was refused, so nothing landed to flash').toBeNull()
  })
})

/* the batch's check, 19 Oct 26 (the scenario designer's S1-03): a held row scrolls its pane within a band at the top and
   the foot — a fixed 72px each, most of a ~190px board on a phone on its side. A sixth of the pane, at most 72, as the
   puck drag's band (drag.ts tdEdge) */
describe('the row drag edge band follows the pane', () => {
  it('a tall pane keeps 72px; a phone on its side gets a sixth of it', () => {
    expect(rowEdge(0, 900)).toBe(72)
    expect(rowEdge(0, 432)).toBe(72)
    expect(rowEdge(100, 290)).toBeCloseTo(190 / 6)
    expect(rowEdge(0, 0)).toBe(0)
  })
})
