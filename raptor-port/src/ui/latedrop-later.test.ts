// @vitest-environment jsdom
/* D1620 (owner, 3 Nov 26 — "as recommended"): when a member changes his input again after a scheduler dropped its LATE
   mark, the drop goes — so if that new change is itself late, LATE shows again for everyone until a scheduler drops it
   again; a scheduler's own change keeps the drop.

   The mark measures the input's change date, which a save from the input's own window writes (`commitInputEdit`, and a
   person added to an input of several — his own date, `commitInput`). So the drop goes in the save that writes a NEW change
   date, and only a member's: a save on the same day writes the same date, which the scheduler has already seen; and the
   commit gate lets a member clear the drop only in such a save (state/perms.ts inputBreach — latemark.test.tsx). Driven at
   the engine level through the real save and the real commit gate, as audit-e-commit-relink.test.tsx does. */
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { initStore, setSession, writeInputs } from '../state/store'
import { INPUTS, inpId, isLateInput, nowStamp } from '../engine/inputs'
import { commitInputEdit, commitInput, removeInput, draftOf } from './inputedit'
import { setMe } from '../state/auth'
import { lateShown } from '../state/view'

beforeAll(() => { initStore() })
afterEach(() => { setSession({ user: 'a', role: 'admin' } as any); setMe('saber') })

/* a late input of Ranger's (bane): filed after its own cut-off, its change date an older day — and a scheduler dropped it */
const plant = (extra: any = {}) => {
  const r: any = { person: 'bane', by: 'bane', at: '2026-07-01T08:00:00.000Z', type: 'Meeting', date: 'Jul 15', yr: 2026, allday: false,
    s: 600, e: 660, remarks: 'D1620', mod: '2026-07-14', ...extra }
  writeInputs(() => { inpId(r); INPUTS.unshift(r) })
  writeInputs(() => { r.lateOff = true })
  return r
}
const scrap = (r: any) => { if (INPUTS.includes(r)) { setSession({ user: 'a', role: 'admin' } as any); removeInput(r) } }
const asMember = () => { setSession({ user: 'us', role: 'member' } as any); setMe('bane') }

describe('D1620 — his own later change takes the drop off', () => {
  it('the premise: the input is late and its mark dropped', () => {
    const r = plant()
    expect(isLateInput(r), 'late').toBe(true)
    expect(lateShown(r), 'dropped').toBe(false)
    scrap(r)
  })

  it('his save from the input\'s window, writing a new change date, takes the drop off — LATE shows again', () => {
    const r = plant()
    asMember()
    const d = draftOf(r); d.remarks = 'D1620 — moved again'
    expect(commitInputEdit(r, d), 'his save goes through the commit gate').toBe(true)
    expect(r.mod, 'a new change date').toBe(nowStamp())
    expect(!!r.lateOff, 'the drop went with it').toBe(false)
    expect(lateShown(r), 'LATE shows again').toBe(true)
    scrap(r)
  })

  it('a save on the same day writes the same change date: the drop stays', () => {
    const r = plant({ mod: nowStamp() })
    asMember()
    const d = draftOf(r); d.remarks = 'D1620 — same day'
    expect(commitInputEdit(r, d)).toBe(true)
    expect(r.lateOff, 'the scheduler has seen this date already').toBe(true)
    scrap(r)
  })

  it('a scheduler\'s own change keeps the drop', () => {
    const r = plant()
    const d = draftOf(r); d.remarks = 'D1620 — the scheduler\'s'
    expect(commitInputEdit(r, d)).toBe(true)
    expect(r.lateOff, 'his change keeps it').toBe(true)
    scrap(r)
  })

  it('a person he adds to his input of several, late, takes the drop off too', () => {
    const r = plant({ people: [{ p: 'bane', by: 'bane', mod: '2026-07-14' }] })
    delete r.person
    asMember()
    const d = draftOf(r)
    expect(commitInput(r, d, ['bane', 'stiff']), 'his save of the input with a person added').toBe(true)
    expect(!!r.lateOff, 'the drop went with it').toBe(false)
    scrap(r)
  })
})
