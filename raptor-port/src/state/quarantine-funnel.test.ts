// @vitest-environment jsdom
/* THE INPUT CHOKE-POINT (P2-REV2-04, the quarantine redesign). Round 3 of the
   Codex inspection found — for the third time — another INPUTS writer the
   per-site protectedInput() guards had missed: the Inputs-page Add unshifts a
   row straight inside writeInputsBatch, the medical creation cascade writes
   INPUTS directly, and the Leave-War outbound sync pushes/splices INPUTS, none
   of them calling protectedInput() first. Spot-guarding each writer as it is
   found does not converge.

   The fix is structural: writeInputs / writeInputsBatch — the ONE funnel EVERY
   input mutation already passes through for its render/reflow/history epilogue —
   is now the enforcement point. It snapshots the model before the batch, and if
   the batch turns out to have added, removed or changed any input covering a
   protected (unsupported / wrong-week / unreadable) date, it rolls the whole
   model back and refuses. A NEW writer added later is caught automatically, with
   no guard of its own — which is the property three rounds of spot-guards lacked.

   These pins drive the funnel DIRECTLY (a bare INPUTS.unshift inside the batch),
   deliberately NOT through commitNewInput/commitInputEdit — those carry their own
   protectedInput() early-exit, so testing through them would prove the old
   spot-guard, not the new funnel. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initStore, writeInputs, writeInputsBatch } from './store'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { stashClear, stashPut } from '../engine/weekstash'
import { weekBundle } from '../engine/weeks-data'

let said: string[] = []
const realToast = HOOKS.toast

beforeEach(() => {
  initStore()
  stashClear()
  said = []
  HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
})
afterEach(() => { HOOKS.toast = realToast; stashClear() })

/* a stashed week whose book is unsupported (pre-Phase-2 shape: publication
   content, no amV stamp) → protectedDates() spans its dates. Its `d` carries
   the week's REAL seed days so cross-week validation (nextMondayWorked reads the
   loaded week's adjacent weeks) has a days array to walk; the unsupported flag
   rides on `o`/no-`am`, which stashDays ignores. The loaded seed week stays
   supported — only this stashed week is quarantined. */
const stashProtected = (key: string) =>
  stashPut(key, JSON.stringify({ d: weekBundle(key).days, o: { 0: { d: {}, c: {} } }, cv: { 0: 'orig' } }))

describe('the input funnel is the quarantine choke-point (P2-REV2-04)', () => {
  it('rolls back a bare INPUTS.unshift onto a protected week — the bypass path', () => {
    stashProtected('20/07/2026')
    const before = INPUTS.length
    writeInputsBatch(() => {
      // exactly what InputsPage / the medical cascade / the sync do: a direct
      // write, no protectedInput() call of its own
      INPUTS.unshift({ person: 'dj', type: 'Meeting', allday: true, date: 'Jul 20', yr: 2026, iid: 'zzq1' })
    })
    expect(INPUTS.length, 'the illegal add was rolled back').toBe(before)
    expect(INPUTS.some((r: any) => r.iid === 'zzq1'), 'the row is gone').toBe(false)
    expect(said.join(' ')).toMatch(/locked/i)
  })

  /* the rollback is histRestore — the same deep restore undo runs — so it rebuilds
     INPUTS from the snapshot with FRESH objects; assertions read the model back by
     iid, never a reference held from before the batch (which the restore orphans,
     exactly as an undo would). */
  it('rolls back a bare removal of an input covering a protected week', () => {
    stashProtected('20/07/2026')
    INPUTS.unshift({ person: 'dj', type: 'Leave', allday: true, date: 'Jul 20', yr: 2026, iid: 'zzq2' })
    const before = INPUTS.length
    writeInputsBatch(() => {
      const ix = INPUTS.findIndex((r: any) => r.iid === 'zzq2')
      if (ix >= 0) INPUTS.splice(ix, 1)
    })
    expect(INPUTS.length, 'the illegal removal was rolled back').toBe(before)
    expect(INPUTS.some((r: any) => r.iid === 'zzq2'), 'the row is still there').toBe(true)
    expect(said.join(' ')).toMatch(/locked/i)
  })

  it('rolls back an in-place field change on an input covering a protected week', () => {
    stashProtected('20/07/2026')
    INPUTS.unshift({ person: 'dj', type: 'Leave', allday: true, date: 'Jul 20', yr: 2026, iid: 'zzq3', remarks: 'orig' })
    writeInputsBatch(() => {
      const r: any = INPUTS.find((x: any) => x.iid === 'zzq3')
      r.remarks = 'changed on a frozen week'
    })
    const r: any = INPUTS.find((x: any) => x.iid === 'zzq3')
    expect(r.remarks, 'the change was rolled back').toBe('orig')
    expect(said.join(' ')).toMatch(/locked/i)
  })

  it('LETS an ordinary add on a NON-protected week through untouched — no false lock', () => {
    stashProtected('20/07/2026')
    const before = INPUTS.length
    writeInputsBatch(() => {
      // a date NOT in the protected week — a legitimate edit elsewhere must not
      // be blocked just because some other week is quarantined
      INPUTS.unshift({ person: 'dj', type: 'Meeting', allday: true, date: 'Sep 4', yr: 2026, iid: 'zzq4' })
    })
    expect(INPUTS.length, 'the legitimate add landed').toBe(before + 1)
    expect(INPUTS.some((r: any) => r.iid === 'zzq4'), 'the row is present').toBe(true)
    expect(said.join(' '), 'nothing was refused').not.toMatch(/locked/i)
  })

  it('is inert when NOTHING is quarantined — the fast path is byte-unchanged', () => {
    // no stash → protectedDates() empty → the funnel takes the original path
    const before = INPUTS.length
    writeInputsBatch(() => {
      INPUTS.unshift({ person: 'dj', type: 'Meeting', allday: true, date: 'Jul 20', yr: 2026, iid: 'zzq5' })
    })
    expect(INPUTS.length).toBe(before + 1)
    expect(said.join(' ')).not.toMatch(/locked/i)
  })

  it('returns false on a rejected batch and true on a committed one (P2-QREV-04)', () => {
    stashProtected('20/07/2026')
    const rejected = writeInputsBatch(() => {
      INPUTS.unshift({ person: 'dj', type: 'Meeting', allday: true, date: 'Jul 20', yr: 2026, iid: 'zzr1' })
    })
    expect(rejected, 'a rolled-back batch reports false so callers can stop').toBe(false)
    const committed = writeInputsBatch(() => {
      INPUTS.unshift({ person: 'dj', type: 'Meeting', allday: true, date: 'Sep 4', yr: 2026, iid: 'zzr2' })
    })
    expect(committed, 'a legitimate batch reports true').toBe(true)
  })

  it('guards the simple writeInputs funnel too, not only the batch form', () => {
    stashProtected('20/07/2026')
    const before = INPUTS.length
    writeInputs(() => {
      INPUTS.unshift({ person: 'dj', type: 'Meeting', allday: true, date: 'Jul 20', yr: 2026, iid: 'zzq6' })
    })
    expect(INPUTS.length, 'writeInputs rolls back too').toBe(before)
    expect(said.join(' ')).toMatch(/locked/i)
  })
})
