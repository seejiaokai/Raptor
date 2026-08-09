// @vitest-environment jsdom
/* Carrying the day across a page switch (owner, 9 Aug 26): "if the admin is
   viewing on view only schedule that certain day, when the edit schedule mode
   is entered, it will show the same day that the admin was viewing vice versa."

   jsdom has no layout engine — every rect it reports is 0x0 — so it cannot
   prove the week LANDS on the day. That half is `e2e/geometry.spec.ts`, in a
   real browser, and it is the half that matters. What this file pins is the
   plumbing underneath it, which jsdom CAN see: that setPage takes the reading
   off the OUTGOING week (the only moment it still has layout), that it reads
   nothing at all when there is no week to read, and that a session change
   drops the carry rather than letting one user's day follow another's login. */
import { beforeEach, describe, expect, it } from 'vitest'
import * as view from './view'
import { resetSession } from './store'

/* a stand-in week: rects are the one thing jsdom will not give us, so the day
   boxes carry their own. Day 2's box is the first whose right edge is still
   past the container's left edge + 8, so day 2 is the honest answer. */
function fakeWeek(id: string, days: number[], rights: number[]) {
  const el: any = {
    id,
    getBoundingClientRect: () => ({ left: 100 }),
    querySelectorAll: () => days.map((d, i) => ({
      dataset: { day: String(d) },
      getBoundingClientRect: () => ({ right: rights[i] }),
    })),
  }
  return el
}

beforeEach(() => { view.setCarryDay(null); view.setPage('viewsched') })

describe('weekLeftDay — the reading itself', () => {
  it('names the leftmost day still on screen, not the first in the model', () => {
    // days 0 and 1 are scrolled off (right edge behind 108), day 2 is not
    expect(view.weekLeftDay(fakeWeek('vWeek', [0, 1, 2, 3], [20, 60, 400, 700]))).toBe(2)
  })

  it('allows 8px of slack, so a sliver of a day does not count as the one you are on', () => {
    /* right edge at 104 is past the container's left (100) but inside the
       slack, so it is treated as gone. This is the same boundary pan.ts's
       palette follow uses — they share this function precisely so the two
       can never drift apart. */
    expect(view.weekLeftDay(fakeWeek('vWeek', [0, 1], [104, 500]))).toBe(1)
    expect(view.weekLeftDay(fakeWeek('vWeek', [0, 1], [112, 500]))).toBe(0)
  })

  it('returns null rather than a guess when there is nothing to read', () => {
    /* null is load-bearing: the destination week only overrides its own
       scroll when it gets a real number, so "no week built yet" has to be
       distinguishable from "day 0". */
    expect(view.weekLeftDay(null)).toBe(null)
    expect(view.weekLeftDay(undefined)).toBe(null)
    expect(view.weekLeftDay(fakeWeek('vWeek', [], []))).toBe(null)
    expect(view.weekLeftDay({})).toBe(null)
  })
})

describe('setPage — when the reading is taken', () => {
  const plant = (id: string, day: number) => {
    const el = fakeWeek(id, [day], [500])
    const real = document.getElementById
    document.getElementById = ((x: string) => (x === id ? el : real.call(document, x))) as any
    return () => { document.getElementById = real }
  }

  it('carries the day when leaving View-only Sched for Edit Schedule', () => {
    const undo = plant('vWeek', 3)
    view.setPage('editsched')
    expect(view.CARRYDAY).toBe(3)
    undo()
  })

  it('and the other way too — the ask says "vice versa"', () => {
    view.setPage('editsched')
    view.setCarryDay(null)
    const undo = plant('eWeek', 5)
    view.setPage('viewsched')
    expect(view.CARRYDAY).toBe(5)
    undo()
  })

  it('reads the OUTGOING week, never the one being opened', () => {
    /* the whole reason the capture sits in setPage: one line later CURPAGE
       moves and the outgoing .page goes display:none, taking its layout with
       it. If this ever started reading the destination it would return null
       (nothing built yet) and the feature would silently do nothing. */
    const undo = plant('vWeek', 4)          // ONLY the view week answers
    view.setPage('editsched')
    expect(view.CARRYDAY, 'read vWeek, which is where we were').toBe(4)
    undo()
  })

  it('leaves the carry alone on a same-page set', () => {
    view.setCarryDay(2)
    view.setPage('viewsched')               // already there
    expect(view.CARRYDAY).toBe(2)
  })

  it('carries through a detour via a non-week page', () => {
    const undo = plant('vWeek', 6)
    view.setPage('inputs')                  // captured on the way out...
    expect(view.CARRYDAY).toBe(6)
    undo()
    view.setPage('editsched')               // ...and still waiting for the week
    expect(view.CARRYDAY, 'Inputs has no week, so nothing overwrote it').toBe(6)
  })

  it('drops the carry on a session change, so one user\'s day cannot follow another\'s login', () => {
    /* resetSession's own setPage('viewsched') captures on the way out, so the
       clear has to come AFTER it — which is why it sits at the end of that
       function and not beside the other view resets. On a phone the cost of
       getting this wrong is visible: initPan scrolls a fresh session to
       today's column and a stale carry would immediately undo it. */
    view.setCarryDay(4)
    resetSession({ user: 'a', role: 'admin' })
    expect(view.CARRYDAY).toBe(null)
  })

  it('does not overwrite a pending carry when the page being left has no week', () => {
    /* Inputs -> Quals must not touch it. The capture is gated on the OUTGOING
       page owning a week, and this is the assertion that keeps that gate: drop
       it and every hop between two ordinary pages would overwrite the pending
       day with "nothing to read", quietly killing the carry mid-detour. */
    view.setPage('inputs')
    view.setCarryDay(1)
    view.setPage('quals')
    expect(view.CARRYDAY).toBe(1)
  })
})
