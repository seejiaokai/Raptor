// Test-only helpers for the Leave War suite ([ARCH-STACK] step 4): filed and
// approved leave is a Raptor Input now, so a test that wants "SPLICE has ATT C
// on 5 Jan" files the Input and re-reads the war — the replacement for the
// deleted ingestFromRaptor.
import { INPUTS, inpId, mintInpIds } from '../engine/inputs'
import { warHolding } from './engine'
import { inputRowFor } from './absences'
import { getState, rawState, saveManningRule, setRole } from './state/store'
import { ELEVEN_COUNTERS } from './testing/eleven'
import { syncAbsences } from './sync'

/** File an absence as the Input it is. `code` is war notation (`LL`, `*LL`,
 *  `ATTC`); `lw` = approved on the war (default: filed on the Inputs page). */
export function fileAbsence(person: string, code: string, from: string, to = from, opts: { lw?: boolean; remarks?: string } = {}): any {
  const war = warHolding(rawState().wars, from)
  const row = inputRowFor({ person, code, from, to, lw: opts.lw && war ? war.period.id : undefined, remarks: opts.remarks, mod: '2026-01-01' })
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
      if (!saveManningRule(JSON.parse(JSON.stringify(r)))) throw new Error(`testkit: the counter "${r.id}" was refused by saveManningRule`)
    }
  } finally {
    if (was !== 'admin') setRole(was)
  }
}
