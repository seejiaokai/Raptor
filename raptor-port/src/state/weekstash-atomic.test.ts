// @vitest-environment jsdom
/* [CMDL-FINISH] P6 — the off-week weekstash store enlisted in the input batch
   (§6, C11/N5). A protected-week clear that drops a stashed week does so INSIDE
   the batch, so a phase-6 refusal rolls the stash drop back WITH the input batch
   — the C11 gap where the input batch reverted but the stash drop (done outside
   it) stuck. A refusal is a silent CmdRefused: ok:false → false, no bug-shaped
   log, no weekstash delete on the stream. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initStore, writeInputsBatchWith, weekstashStore } from './store'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { stashClear, stashPut, stashHas, stashDrop } from '../engine/weekstash'
import { weekBundle } from '../engine/weeks-data'
import { onCommit } from '../command'
import type { CommitEnvelope } from '../command'

let said: string[] = []
const realToast = HOOKS.toast
beforeEach(() => { initStore(); stashClear(); said = []; HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any })
afterEach(() => { HOOKS.toast = realToast; stashClear() })

/* an unsupported (pre-Phase-2) stashed week → protectedDates() spans its dates */
const stashProtected = (key: string) =>
  stashPut(key, JSON.stringify({ d: weekBundle(key).days, o: { 0: { d: {}, c: {} } }, cv: { 0: 'orig' } }))
const stashPlain = (key: string) => stashPut(key, JSON.stringify({ d: weekBundle(key).days }))
const weekstashDeletes = (seen: CommitEnvelope[]) =>
  seen.some(e => e.changes.some(c => c.collection === 'weekstash' && c.op === 'delete'))

describe('§6 — a protected-week batch rolls the enlisted stash drop back too', () => {
  it('refuses, keeps the stash, reverts the input, and emits no weekstash delete', () => {
    stashProtected('20/07/2026')                      // a locked (unsupported) week
    stashPlain('27/07/2026')                          // an ordinary stashed week we try to drop
    const beforeInputs = INPUTS.length
    const seen: CommitEnvelope[] = []; const unsub = onCommit(e => seen.push(e))
    const ok = writeInputsBatchWith([weekstashStore], () => {
      INPUTS.unshift({ person: 'dj', type: 'Meeting', allday: true, date: 'Jul 20', yr: 2026, iid: 'zzw1' }) // onto the locked week
      stashDrop('27/07/2026')                         // the destructive drop, INSIDE the batch
    })
    unsub()
    expect(ok).toBe(false)                            // refused (silent CmdRefused)
    expect(stashHas('27/07/2026')).toBe(true)         // the stash drop was ROLLED BACK
    expect(INPUTS.length).toBe(beforeInputs)          // the input add reverted too
    expect(weekstashDeletes(seen)).toBe(false)        // nothing emitted on the stream
    expect(said.some(s => /locked/i.test(s))).toBe(true)   // the toast still fired
  })

  it('an ordinary drop commits: the stash goes and a weekstash delete is emitted', () => {
    stashPlain('27/07/2026')
    const seen: CommitEnvelope[] = []; const unsub = onCommit(e => seen.push(e))
    const ok = writeInputsBatchWith([weekstashStore], () => { stashDrop('27/07/2026') })
    unsub()
    expect(ok).toBe(true)
    expect(stashHas('27/07/2026')).toBe(false)        // dropped for real
    expect(weekstashDeletes(seen)).toBe(true)         // one weekstash delete on the stream
  })
})
