// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { useMsqWorld, signInAs, PID, moveMan } from '../test-support/msq-world'
import { setCell, recordsAt, decideRequestById } from './state/store'
import { absencesAt } from './state/merge'
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
