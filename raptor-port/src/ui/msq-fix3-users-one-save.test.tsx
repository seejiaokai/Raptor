// @vitest-environment jsdom
/* R4 OF THE SECOND HALF'S FINAL READS (docs/superpowers/briefs/2026-11-23-msq-b1-final-read-opus.md finding 4,
   …-astra.md finding 2): Admin → Users' Save was two commands — the access (state/accounts.ts saveAccess) and then a
   rename of the sign-in (updateAccount). A refused rename left the access saved, the row still open with its refusal,
   reading as if nothing saved; a good rename took two Undos. Plan §4 item 5 and §0: one Save, one command, one Undo step,
   and the first refusal leaves nothing committed. The sign-in name now rides in the same command (saveAccess's `name`),
   checked with every other part before anything is written. Red first: the Plan of 149 was saved under a refused rename. */
import { describe, it, expect, afterEach } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { accountOfPid, levelIn } from '../state/accounts'
import { todayIso } from '../state/units'
import { globalUndo, _timelineEntries } from '../undo/timeline'

useMsqWorld()
afterEach(() => cleanup())

function panel() {
  const page = render(<UsersPanel shown />)
  const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement | null
  const open = async (pid: string) => { await act(async () => { fireEvent.click($(`#accList [data-person="${pid}"] .acc-tap`)!) }) }
  const pick = async (unit: string, v: string) => {
    const n = $(`[data-testid="acc-sq"] .acc-sq-n[data-unit="${unit}"]`)!
    await act(async () => { fireEvent.click((n.nextElementSibling as HTMLElement).querySelector(`[data-line="${v}"]`)!) })
  }
  const name = async (v: string) => { await act(async () => { fireEvent.change($('#accEdName')!, { target: { value: v } }) }) }
  const save = async () => { await act(async () => { fireEvent.click($('#accEdSave')!) }) }
  return { $, open, pick, name, save }
}

describe('Admin → Users\' Save is one command (R4)', () => {
  it('a refused rename saves none of the access: Plan of 149 picked, the sign-in typed as Ranger\'s ("us"), Save', async () => {
    signInAs('saber')
    const p = panel()
    await p.open(PID.hunter)
    await p.pick('u149', 'plan')
    await p.name('us')
    const steps = _timelineEntries().length
    await p.save()
    expect(accountOfPid(PID.hunter)!.name).toBe('ad2')
    expect(levelIn(ACCT.hunter, 'u149', todayIso()), 'no Plan of 149 under a refused rename').toBeNull()
    expect(_timelineEntries().length, 'no Undo step').toBe(steps)
    expect(p.$('#accEdSave'), 'the row stays open with its refusal').not.toBeNull()
  })
  it('a good rename with Plan of 149: one Save, ONE Undo takes back both', async () => {
    signInAs('saber')
    const p = panel()
    await p.open(PID.hunter)
    await p.pick('u149', 'plan')
    await p.name('hunter.new')
    const steps = _timelineEntries().length
    await p.save()
    expect(accountOfPid(PID.hunter)!.name).toBe('hunter.new')
    expect(levelIn(ACCT.hunter, 'u149', todayIso())).toBe('admin')
    expect(_timelineEntries().length, 'one Undo step').toBe(steps + 1)
    act(() => { expect(globalUndo().ok).toBe(true) })
    expect(accountOfPid(PID.hunter)!.name, 'the one Undo takes the rename back').toBe('ad2')
    expect(levelIn(ACCT.hunter, 'u149', todayIso()), '…and the Plan').toBeNull()
  })
  it('a rename alone still saves, one step', async () => {
    signInAs('saber')
    const p = panel()
    await p.open(PID.hunter)
    await p.name('hunter.only')
    const steps = _timelineEntries().length
    await p.save()
    expect(accountOfPid(PID.hunter)!.name).toBe('hunter.only')
    expect(_timelineEntries().length).toBe(steps + 1)
  })
})
