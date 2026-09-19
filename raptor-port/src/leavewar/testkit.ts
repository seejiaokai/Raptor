// Test-only helpers for the Leave War suite ([ARCH-STACK] step 4): filed and
// approved leave is a Raptor Input now, so a test that wants "SPLICE has ATT C
// on 5 Jan" files the Input and re-reads the war — the replacement for the
// deleted ingestFromRaptor.
import { INPUTS, inpId } from '../engine/inputs'
import { warHolding } from './engine'
import { inputRowFor } from './absences'
import { rawState } from './state/store'
import { syncAbsences } from './sync'

/** File an absence as the Input it is. `code` is war notation (`LL`, `*LL`,
 *  `ATTC`); `lw` = approved on the war (default: filed on the Inputs page). */
export function fileAbsence(person: string, code: string, from: string, to = from, opts: { lw?: boolean; remarks?: string } = {}): any {
  const war = warHolding(rawState().wars, from)
  const row = inputRowFor({ person, code, from, to, lw: opts.lw && war ? war.period.id : undefined, remarks: opts.remarks, mod: '2026-01-01' })
  inpId(row)
  INPUTS.push(row)
  syncAbsences()
  return row
}
