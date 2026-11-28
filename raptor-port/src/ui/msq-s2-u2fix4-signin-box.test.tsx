// @vitest-environment jsdom
/* U2 FIX ROUND 4, PART 3b — THE SIGN-IN BOX ON A ROW OF A SQUADRON'S ADMIN, TO A PLAN HOLDER WHO MAY NOT MAKE ITS ADMINS
   (his D2907, 28 Nov 26, built as drawn: a216/cards/signin-box/phone-after.png, desktop-after.png).

   Part 3 (msq-s2-u2fix4-rename.test.ts) made the doors refuse Hunter — 142's admin, Plan of 149, not 149's own admin nor
   a master admin — a change of a 149 admin's sign-in, since it hands that admin seat to another sign-in. His D2907: to
   such a Plan holder the sign-in box on EVERY row of that squadron's admin is greyed (read only), with ONE grey line under
   it, "Only 149's own admins or a master admin can change a 149 admin's sign-in.", and the refusal at Save uses the same
   words. A member's row, and every row for 149's own admins or a master admin, stay as today; a master admin's account
   keeps its own rules. The line wears the Role box's grey line's markup (RoleNote) — the same look, no new style.
   Keyboard: the greyed box is reached and read, not changed — read only, never disabled.

   Written red first on the code of part 3, each test seen failing there, except where named "pin:".
   The world: three squadrons (withThird — his D2630), Wed 15 Jul 26. Hunter — 142's admin, Plan of 149; Saber — master
   admin, home 142; Kestrel — 149's admin; Osprey — 149's member. */
import { describe, it, expect, afterEach } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { withThird, signInAs, PID, ACCT, SIGN, type Who } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { useVersion } from './useStore'
import { accountsLoad, saveAccess, sessionFor, signIn, updateAccount } from '../state/accounts'
import { unitsLoad } from '../state/units'
import { pickSquadron } from '../state/pick'
import { SESSION, ME, setSession, setMe } from '../state/auth'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()
afterEach(() => cleanup())

const SIGNIN = "Only 149's own admins or a master admin can change a 149 admin's sign-in."
const reload = () => { unitsLoad(); accountsLoad() }
function as<T>(who: Who, write: () => T): T {
  const ps = SESSION, pm = ME
  const s = sessionFor(signIn(SIGN[who][0], SIGN[who][1]))
  if (!s) throw new Error(`no ${who}`)
  setSession(s); setMe(s.pid)
  try { return write() } finally { setSession(ps); setMe(pm) }
}
/* Kestrel makes Osprey an admin of 149 — a second 149 admin, whose row Kestrel can open (never his own) */
const ospreyAdmin = () => { expect(as('kestrel', () => saveAccess(ACCT.osprey, { role: 'admin' })), 'setup: Kestrel makes Osprey an admin of 149').toBeNull(); reload() }

function Live() { useVersion(); return <UsersPanel shown /> }
function panel() {
  const page = render(<Live />)
  const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement | null
  const open = async (pid: string) => {
    const row = $(`[data-testid="acc-groups"] .acc-row[data-person="${pid}"]`)
    if (!row) throw new Error(`no row for ${pid}`)
    await act(async () => { fireEvent.click(row.querySelector('.acc-tap')!) })
  }
  /* the sign-in box as a person meets it: changeable or read only, reached by the keyboard, and the one grey line in its
     own field — read as the field's line and as the line the box names for a screen reader */
  const signin = () => {
    const box = $('#accEdName') as HTMLInputElement | null
    if (!box) return null
    const field = box.closest('.mfield')!
    const said = box.getAttribute('aria-describedby')
    box.focus()
    return {
      readOnly: box.readOnly, disabled: box.disabled, reached: page.container.ownerDocument.activeElement === box,
      line: field.querySelector('.acc-role-note')?.textContent ?? null,
      described: said ? $(`#${said}`)?.textContent ?? null : null,
    }
  }
  return { $, open, signin }
}
const pick = async (u: string) => { await act(async () => { await pickSquadron(u) }) }
const GREYED = { readOnly: true, disabled: false, reached: true, line: SIGNIN, described: SIGNIN }
const OPEN = { readOnly: false, disabled: false, reached: true, line: null, described: null }

describe('Hunter (Plan of 149, not its own admin nor a master admin) on 149\'s Admin → Users', () => {
  it('Kestrel\'s row (149\'s admin): the sign-in box read only, reached by the keyboard, the one line under it word for word', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.open(PID.kestrel)
    expect(p.signin()).toEqual(GREYED)
  })
  it('…the same on every row of a 149 admin: Osprey once made one by Kestrel', async () => {
    ospreyAdmin()
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.open(PID.osprey)
    expect(p.signin()).toEqual(GREYED)
  })
  it('…the line sits in the sign-in box\'s own field, under the box, in the Role box\'s grey line\'s markup', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.open(PID.kestrel)
    const note = p.$('#accEdNameNote')!
    expect(note.tagName).toBe('P')
    expect(note.className).toBe('adm-note acc-sq-note acc-role-note')
    expect(note.previousElementSibling?.id).toBe('accEdName')
  })
  it('…Kestrel\'s row judged as it opened: Member picked in his Role box leaves the box greyed', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.open(PID.kestrel)
    await act(async () => { fireEvent.change(p.$('#accEdRole')!, { target: { value: 'main' } }) })
    expect(p.signin()).toEqual(GREYED)
  })
  it('pin: Osprey\'s row (149\'s member): the box changeable, no line under it', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.open(PID.osprey)
    expect(p.signin()).toEqual(OPEN)
  })
  it('the Save of a rename on Kestrel\'s row: refused in the same words, nothing written', () => {
    signInAs('hunter')
    reload()
    expect(saveAccess(ACCT.kestrel, { name: 'mate@mail' })).toBe(SIGNIN)
    expect(updateAccount(ACCT.kestrel, { name: 'mate@mail' })).toBe(SIGNIN)
  })
})

describe('149\'s own admins and a master admin: as today', () => {
  it('pin: Saber (master admin) on Kestrel\'s row: the box changeable, no line', async () => {
    signInAs('saber')
    await pick('u149')
    const p = panel()
    await p.open(PID.kestrel)
    expect(p.signin()).toEqual(OPEN)
  })
  it('pin: Kestrel (149\'s own admin) on another 149 admin\'s row (Osprey made one): the box changeable, no line', async () => {
    ospreyAdmin()
    signInAs('kestrel')
    const p = panel()
    await p.open(PID.osprey)
    expect(p.signin()).toEqual(OPEN)
  })
  it('pin: Hunter on 142\'s page, a master admin\'s row (Saber\'s) keeps its own rules: no 149 line', async () => {
    signInAs('hunter')
    const p = panel()
    await p.open(PID.saber)
    expect(p.$('#accEdNameNote')).toBeNull()
  })
})
