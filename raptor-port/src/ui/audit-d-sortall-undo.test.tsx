// @vitest-environment jsdom
/* AUDIT D — Sort all against undo/redo and the armed slot (scenarios 5 & 6),
   driven through the real App the way board.test.tsx does, so HIST, the store
   hooks and the board handlers are the wired production set, not stubs.
   What is pinned:
   - Sort all is ONE history step (HIST.lock swallows the six inner marks) and
     Undo restores the day BYTE-IDENTICALLY — model and amendment book alike;
   - Redo replays it byte-identically;
   - sort → edit → undo → undo peels the edit first, then the sort;
   - a second Sort all on the tidy day pushes nothing and pends nothing;
   - an armed slot on the sorted day is DISARMED by the sort (REORDERED_DI),
     while a slot armed on a DIFFERENT day stays armed. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, HIST, undo, redo } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { applyMove } from '../engine/reorder'
import { setSlotVal } from '../engine/slots'
import { PEOPLE } from '../engine/people'
import * as view from '../state/view'
import { askSortAll, sortAllCommit, SORTALL } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* the whole undo-visible state of day 0 — DAYS plus the amendment book, the
   same fields histSnap carries (minus INPUTS, untouched here) */
const snap = () => JSON.stringify({ d: DAYS[0], p: SCHED.pending, c: SCHED.changes, ad: SCHED.added, a: SCHED.als })

beforeAll(async () => {
  initStore()
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  await click($('#eWeek .day[data-day="0"] .dow.sb-open'))
  expect(view.SBDAY).toBe(0)
})

/* un-sort day 0 through the real mutation path (applyMove + afterSchedMutate),
   so the pre-sort state is ON the undo stack exactly as a scheduler's drag
   would put it there */
async function scrambleViaDrag() {
  const d = DAYS[0]
  expect((d.allhands || []).length, 'seed day 0 has prog rows to drag').toBeGreaterThan(1)
  await act(async () => {
    expect(applyMove('mv:p.0.1', 'mv:p.0.0')).toBe(true)
    view.afterSchedMutate(); notify()
  })
  /* make at least one WAVE pair out of order too, if the seed has two timed
     waves — drag the second wave's first formation above the first wave's?
     No: formations cannot cross waves. Instead swap two formations inside
     wave 0 where the seed has them. */
  if ((d.waves?.[0]?.formations || []).length > 1) {
    await act(async () => {
      expect(applyMove('mv:ac.0.0.1.0', 'mv:ac.0.0.0.0')).toBe(true)
      view.afterSchedMutate(); notify()
    })
  }
}

describe('Sort all vs undo/redo (scenario 5)', () => {
  it('sorts as ONE history step, undoes byte-identically, redoes byte-identically', async () => {
    await scrambleViaDrag()
    const pre = snap()
    const ixBefore = HIST.ix
    await act(async () => { askSortAll(0) })
    expect(SORTALL).toBe(0)
    await act(async () => { sortAllCommit() })
    const post = snap()
    expect(post, 'the sort changed the day').not.toBe(pre)
    /* one step on the stack, not one per section */
    expect(HIST.ix).toBe(ixBefore + 1)
    await act(async () => { undo() })
    expect(snap(), 'undo restores the pre-sort day exactly').toBe(pre)
    await act(async () => { redo() })
    expect(snap(), 'redo replays the sorted day exactly').toBe(post)
  })

  it('sort → edit → undo peels the edit and keeps the sorted order; a second undo restores pre-sort', async () => {
    /* still on the redone (sorted) state from the test above */
    const sorted = snap()
    const wasP = DAYS[0].waves[0].formations[0].aircraft[0].p
    const free = Object.keys(PEOPLE).find(id => id !== wasP) as string
    await act(async () => {
      setSlotVal('0.0.0.0.p', free)
      view.afterSchedMutate(); notify()
    })
    expect(snap()).not.toBe(sorted)
    await act(async () => { undo() })
    expect(snap(), 'first undo removes only the edit').toBe(sorted)
    await act(async () => { undo() })
    expect(snap(), 'second undo removes the sort').not.toBe(sorted)
    /* wave-0 formation order is back to the scrambled shape — the drag from
       scrambleViaDrag is live again on this state */
    await act(async () => { redo() })          // back to sorted for the next tests
    expect(snap()).toBe(sorted)
  })

  it('Sort all on the already-tidy day pushes no history step and pends nothing new', async () => {
    const pre = snap()
    const ix = HIST.ix, len = HIST.stack.length
    await act(async () => { askSortAll(0); sortAllCommit() })
    expect(snap()).toBe(pre)
    expect(HIST.ix).toBe(ix)
    expect(HIST.stack.length).toBe(len)
  })
})

describe('the armed slot across Sort all (scenario 6, UI half)', () => {
  it('an armed slot on the sorted day is put down; one on another day stays armed', async () => {
    /* un-sort again so the sort genuinely permutes */
    await scrambleViaDrag()
    /* arm a real seat on day 0 */
    await act(async () => { view.armSlot('0.0.0.0.p') })
    expect(view.ARM).toBeTruthy()
    expect(view.ARM.di).toBe(0)
    await act(async () => { askSortAll(0); sortAllCommit() })
    expect(view.ARM, 'the sort disarmed the slot — REORDERED_DI consumed').toBeNull()

    /* now the negative: arm on day 1, scramble AND sort day 0 — the arm must
       survive, because nothing on ITS day changed identity.
       (setBoardDay would disarm on switching days, so arm day 1's slot while
       the board stays on day 0 — armSlot itself carries no day guard.) */
    await scrambleViaDrag()
    const d1 = DAYS[1]
    const key1 = d1?.dutywaves?.[0]?.rows?.length ? 'd:1.0.0'
      : (d1?.waves?.[0]?.formations?.[0]?.aircraft?.length ? '1.0.0.0.p' : null)
    expect(key1, 'seed day 1 has an armable slot').toBeTruthy()
    await act(async () => { view.armSlot(key1 as string) })
    expect(view.ARM?.di).toBe(1)
    await act(async () => { askSortAll(0); sortAllCommit() })
    expect(view.ARM, 'a slot armed on day 1 survives a day-0 sort').toBeTruthy()
    expect(view.ARM.di).toBe(1)
    await act(async () => { view.disarmSlot() })
  })
})
