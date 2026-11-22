// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { useMsqWorld, signInAs, PID, moveMan } from '../test-support/msq-world'
import { setCell, recordsAt, decideRequestById } from './state/store'
import { absencesAt } from './state/merge'
import { warLeaveAdds } from './sync'
import { INPUTS } from '../engine/inputs'
import { commitInputEdit, draftOf, spanFields } from '../ui/inputedit'
import { globalUndo } from '../undo/timeline'

useMsqWorld()

it('refuses restoring the removed half after Ranger’s move', () => {
  signInAs('saber')
  const day = '2026-07-17'
  expect(setCell(PID.ranger, day, 'LL')).toBe(true)
  const request = recordsAt(PID.ranger, day).find(r => r.kind === 'request')!
  expect(decideRequestById(PID.ranger, day, request.id, 'approved')).toBe(true)
  const id = absencesAt(PID.ranger, day).find(r => r.lw)!.id
  const row = () => INPUTS.find(r => String((r as any).iid) === String(id))!

  expect(moveMan(PID.ranger, 'u149').ok).toBe(true)
  expect(commitInputEdit(row(), {
    ...draftOf(row()), ...spanFields('am'),
  })).toBe(true)
  expect(row().lw).toBeTruthy()

  expect(globalUndo()).toMatchObject({
    ok: false,
    reason: "Ranger is 149's from Thu 16 Jul, so this can't go back into 142's Leave War.",
  })
  expect(row().half).toBe('am')
})

/* ---- helper "r2close": the part of the day, at the save door and in the one body both the gate and Undo ask ---- */
const approveFri = (): (() => any) => {
  expect(setCell(PID.ranger, FRI, 'LL')).toBe(true)
  const request = recordsAt(PID.ranger, FRI).find(r => r.kind === 'request')!
  expect(decideRequestById(PID.ranger, FRI, request.id, 'approved')).toBe(true)
  const id = absencesAt(PID.ranger, FRI).find(r => r.lw)!.id
  return () => INPUTS.find(r => String((r as any).iid) === String(id))!
}
const FRI = '2026-07-17'

it('a morning’s leave made the whole day again, on a day now 149’s, is not saved', () => {
  signInAs('saber')
  const row = approveFri()
  expect(commitInputEdit(row(), { ...draftOf(row()), ...spanFields('am') })).toBe(true)
  expect(moveMan(PID.ranger, 'u149').ok).toBe(true)
  expect(commitInputEdit(row(), { ...draftOf(row()), ...spanFields('all') })).toBe(false)
  expect(row().half).toBe('am')
  /* …and the other half in its place is the afternoon added: not saved either */
  expect(commitInputEdit(row(), { ...draftOf(row()), ...spanFields('pm') })).toBe(false)
  expect(row().half).toBe('am')
})

it('the one body: a shorter day and a day split into its halves add nothing; a wider one, or the other half, adds the day', () => {
  signInAs('saber')
  const row = approveFri()
  const full = { ...row() }
  const am = { ...full, allday: false, half: 'am', s: 0, e: 720 }
  const pm = { ...full, allday: false, half: 'pm', s: 721, e: 1439, iid: 'ipm' }
  const put = (id: unknown, before: unknown, after: unknown) => ({ op: 'put', collection: 'inputs', id, before, after }) as any
  const added = [{ pid: PID.ranger, iso: FRI, unit: 'u142', id: String(full.iid) }]
  expect(warLeaveAdds([put(full.iid, full, am)])).toEqual([])
  expect(warLeaveAdds([put(full.iid, full, am), put('ipm', null, pm)])).toEqual([])
  expect(warLeaveAdds([put(full.iid, am, full), { op: 'delete', collection: 'inputs', id: 'ipm', before: pm } as any])).toEqual([])
  expect(warLeaveAdds([put(full.iid, am, full)])).toEqual(added)
  expect(warLeaveAdds([put(full.iid, am, { ...pm, iid: full.iid })])).toEqual(added)
  /* typed hours inside the morning it held add nothing; hours running past noon add the day */
  expect(warLeaveAdds([put(full.iid, am, { ...am, half: '', s: 480, e: 600 })])).toEqual([])
  expect(warLeaveAdds([put(full.iid, am, { ...am, half: '', s: 480, e: 840 })])).toEqual(added)
})
