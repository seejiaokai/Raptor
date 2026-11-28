// Test-only helpers for the Leave War suite ([ARCH-STACK] step 4): filed and
// approved leave is a Raptor Input now, so a test that wants "SPLICE has ATT C
// on 5 Jan" files the Input and re-reads the war — the replacement for the
// deleted ingestFromRaptor.
import { INPUTS, inpId, mintInpIds, filingOf } from '../engine/inputs'
import { warHolding } from './engine'
import { inputRowFor, type WarInput } from './absences'
import { getState, rawState, saveManningRule, setRole } from './state/store'
import { ELEVEN_COUNTERS } from './testing/eleven'
import { syncAbsences } from './sync'

/** File an absence as the Input it is. `code` is war notation (`LL`, `*LL`,
 *  `ATTC`); `lw` = approved on the war (default: filed on the Inputs page). */
export function fileAbsence(person: string, code: string, from: string, to = from, opts: { lw?: boolean; remarks?: string } = {}): WarInput {
  const war = warHolding(rawState().wars, from)
  const row = inputRowFor({ person, code, from, to, lw: opts.lw && war ? war.period.id : undefined, remarks: opts.remarks, mod: '2026-01-01' })
  /* filed where its kind lands, as the Inputs page files it (D1372: a course under Unavailable by itself — engine/inputs.ts
     filingOf); the war counts a course only there (D1389 — the night's code read, F1) */
  if (filingOf(row.type, 'u')) row.acc = 'u'
  inpId(row)
  INPUTS.push(row)
  mintInpIds()   // its place in the list too, as the app mints it with its id ([DB-READINESS] group A, phase 2)
  syncAbsences()
  return row
}

/** MAKE THE ELEVEN COUNTERS THE APP USED TO START WITH (testing/eleven.ts — the app starts with none since D669,
 *  8 Oct 26). A test that is ABOUT counters calls this after `initStore()`: the rows are made through the real
 *  "+ Counter" writer (`saveManningRule`), as an admin, one command each — never slipped in under the store, so what
 *  the test stands on is something a squadron can actually have. The role the test had is put back. */
export function elevenCounters(): void {
  const was = getState().role
  if (was !== 'admin') setRole('admin')
  try {
    for (const r of ELEVEN_COUNTERS) {
      if (!saveManningRule(structuredClone(r))) throw new Error(`testkit: the counter "${r.id}" was refused by saveManningRule`)
    }
  } finally {
    if (was !== 'admin') setRole(was)
  }
}

/** ONE PRESS AT ONE MOMENT ON THE CLOCK (the gates of 28 Nov 26, pull request 861). The grid's double-tap guard
 *  (Matrix.tsx `guardGrid`) counts a press inside a window only if the window closed within 1 s of it — in a real browser
 *  the close follows its press within a frame. In jsdom the close waits for the whole save and the grid's re-draw, so on
 *  GitHub's busy runner (four test files at once) the event window's Save once took past 1 s between its press and its
 *  close: the guard, rightly, did not arm, and the test failed on the machine's speed, not the app's behaviour. A test's
 *  press-and-click is therefore run with the clock standing still — the test measures what a person does, never how fast
 *  the machine is (D87: wait on what the test needs, never a fixed time). Whatever clock was in place before (a test's
 *  own) is put back after; a real wait between two presses still moves the clock as ever. */
export function atOneMoment<T>(fn: () => T): T {
  const own = Object.prototype.hasOwnProperty.call(performance, 'now')
  const was = performance.now
  const t = was.call(performance)
  performance.now = () => t
  try { return fn() } finally { if (own) performance.now = was; else delete (performance as { now?: unknown }).now }
}
