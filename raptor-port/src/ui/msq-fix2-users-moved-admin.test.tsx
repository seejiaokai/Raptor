// @vitest-environment jsdom
/* Fix read 2 — the sign-in re-walk's new fault (22 Nov 26): Hunter, 142's admin, moved to 149 from Thu 16, is a member
   there (K3, D2160). On Admin → Users his row read MEMBER, but his editor's Role box opened on "Admin" (the account's
   stored role), so the master admin's Save of "Admin" changed nothing and said nothing. The box shows the role his account
   gives today, and saving Admin makes him the admin of the squadron he is in, in one step. Through the real panel. */
import { describe, it, expect, afterEach } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { useMsqWorld, signInAs, PID, ACCT, moveMan, on } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { switchUnit } from '../state/store'
import { accountById, accountsLoad, adminNow, levelIn } from '../state/accounts'
import { unitsLoad } from '../state/units'

useMsqWorld()
afterEach(() => cleanup())

describe('fix read 2 — a moved admin made the new squadron’s admin on Admin → Users', () => {
  it('the Role box opens on Member, and Admin + Save makes him 149’s admin in one step', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
    on(16, 10, 0); unitsLoad(); accountsLoad()
    signInAs('saber')
    switchUnit('u149')
    expect(accountById(ACCT.hunter)!.role, 'setup: the stored role is still an admin’s').toBe('admin')
    expect(adminNow(accountById(ACCT.hunter)), 'setup: a member in 149 (K3)').toBe(false)
    const page = render(<UsersPanel shown />)
    const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement
    await act(async () => { fireEvent.click($(`#accList [data-person="${PID.hunter}"] .acc-tap`)) })
    const box = $('#accEdRole') as HTMLSelectElement
    expect(box.value, 'the box shows what the row shows').toBe('main')
    await act(async () => { fireEvent.change(box, { target: { value: 'admin' } }) })
    await act(async () => { fireEvent.click($('#accEdSave')) })
    expect(adminNow(accountById(ACCT.hunter)), 'an admin today').toBe(true)
    expect(levelIn(ACCT.hunter, 'u149', '2026-07-16')).toBe('admin')
    expect(levelIn(ACCT.hunter, 'u142', '2026-07-16'), 'of 149 only').not.toBe('admin')
  })
})
