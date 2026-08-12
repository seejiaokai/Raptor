// @vitest-environment jsdom
/* AUDIT D — a board repaint UNDER a drag in flight (scenario 6, drag half).
   rowdrag.ts deliberately writes the carry/drop marks straight onto the DOM
   and only touches state on the drop — but the addresses it commits are the
   `data-move` strings captured at pointerdown/pointermove, and every board
   panel is innerHTML-swapped by any re-render. If the model REORDERS while a
   drag is in flight (Sort all confirmed by keyboard while a finger holds a
   row; any future code path that repaints mid-drag), the drop applies the
   STALE index addresses to the NEW model order and moves rows the user never
   touched. There is no epoch/generation guard and no isConnected check: the
   detached elements keep their dataset, so applyMove happily fires.
   These tests PIN the current behaviour as documentation of the hazard —
   they are the repro for the audit finding, not an endorsement. A fix would
   make the second test's model assertion read "unchanged".
   Harness follows rowdrag.test.tsx. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { wireRowDrag } from './rowdrag'
import { setSession } from '../state/auth'
import { sortProg, popReorderedDay } from '../engine/reorder'

const DSNAP = JSON.stringify(DAYS)
let host: HTMLElement, off: (() => void) | undefined

function rowsHTML(addrs: string[]) {
  return addrs.map(a => `<div class="sb-arow" data-move="${a}"><span class="sb-grip">⠿</span></div>`).join('')
}
const down = (el: Element) => el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }))
const over = (el: Element) => el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1 }))
const up = () => document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }))

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  popReorderedDay()
  setSession({ user: 'a', role: 'admin' } as any)
  document.body.innerHTML = '<div id="host"></div>'
  host = document.getElementById('host')!
  off?.(); off = wireRowDrag(host)
  /* three prog rows, model order NOT time order, so sortProg permutes */
  DAYS[0].allhands = [
    { prog: 'ALPHA', str: '1000', end: '1100', who: [] },
    { prog: 'BRAVO', str: '0800', end: '0900', who: [] },
    { prog: 'CHARLIE', str: '0900', end: '0930', who: [] },
  ]
  host.innerHTML = rowsHTML(['mv:p.0.0', 'mv:p.0.1', 'mv:p.0.2'])
})

describe('a repaint mid-drag leaves the drop armed with stale addresses', () => {
  it('sanity: an undisturbed drag moves the row the user is holding', () => {
    const grips = [...host.querySelectorAll('.sb-grip')]
    const rows = [...host.querySelectorAll('.sb-arow')]
    down(grips[0]); over(rows[2]); up()
    expect(DAYS[0].allhands.map((r: any) => r.prog)).toEqual(['BRAVO', 'CHARLIE', 'ALPHA'])
  })

  it('██ AUDIT-D FINDING (SUSPECT): a sort + repaint under the drag makes the drop move a row the user never touched', () => {
    const grips = [...host.querySelectorAll('.sb-grip')]
    const rows = [...host.querySelectorAll('.sb-arow')]
    /* the user picks up ALPHA (model 0) and hovers CHARLIE (model 2) … */
    down(grips[0]); over(rows[2])
    /* … and mid-flight the day sorts (e.g. the Sort all confirm activated by
       keyboard — a click event with no pointerup — or any future mid-drag
       repaint). Model becomes BRAVO, CHARLIE, ALPHA and the panel is
       innerHTML-swapped, detaching the elements the drag is holding. */
    expect(sortProg(0)).toBe(true)
    popReorderedDay()   // consumed by afterSchedMutate in the real app; the
                        // drag machine never reads it — that is the gap
    expect(DAYS[0].allhands.map((r: any) => r.prog)).toEqual(['BRAVO', 'CHARLIE', 'ALPHA'])
    host.innerHTML = rowsHTML(['mv:p.0.0', 'mv:p.0.1', 'mv:p.0.2'])
    /* the finger lifts: the drop fires with the PRE-sort addresses 0→2 and
       applyMove applies them to the POST-sort model — BRAVO (now at 0) is
       moved to the bottom. The user was holding ALPHA the whole time and
       BRAVO moved: the drag equivalent of the armed-slot bug REORDERED_DI
       exists to prevent, unguarded on this path.
       If this assertion ever reads ['BRAVO','CHARLIE','ALPHA'] (unchanged),
       the gap was closed — update this test to pin the guard instead. */
    up()
    expect(DAYS[0].allhands.map((r: any) => r.prog)).toEqual(['CHARLIE', 'ALPHA', 'BRAVO'])
    /* and the move marked BRAVO's new address as an amendment — a pending
       mark on a row nobody meant to touch */
    expect(SCHED.pending['ap:0.2.prog']).toBe(1)
  })

  it('a drop landing on a row whose address vanished in the repaint is refused whole', () => {
    const grips = [...host.querySelectorAll('.sb-grip')]
    const rows = [...host.querySelectorAll('.sb-arow')]
    down(grips[0]); over(rows[1])
    /* the repaint deletes the hovered row (say its section emptied) — the
       detached element still carries data-move, so the drop still fires;
       applyMove is the only line of defence and index 1 still exists in the
       model, so it ACTS. Pin that at least an out-of-range stale address is
       refused: shrink the list to one row. */
    DAYS[0].allhands = [{ prog: 'ONLY', who: [] }]
    host.innerHTML = rowsHTML(['mv:p.0.0'])
    up()
    expect(DAYS[0].allhands.map((r: any) => r.prog)).toEqual(['ONLY'])
    expect(SCHED.pending).toEqual({})
  })
})
