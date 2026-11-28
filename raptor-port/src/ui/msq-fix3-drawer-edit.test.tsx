// @vitest-environment jsdom
/* F1 OF THE SECOND HALF'S WALK (docs/handpass/2026-11-23-msq-b1-second-half.md §15): the phone's ☰ menu offered
   "Edit Schedule" to a View holder with 149 picked — it asked the role (isAdmin), where the desktop's top bar asks
   the schedule in view (canEditSched — the plan §2 item 3). A tap landed on View-only Sched: a dead entry telling him
   he may edit 149. The menu's entry now asks the bar's question. Red first: before the fix it listed Edit Schedule. */
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, act } from '@testing-library/react'
import { useMsqWorld, signInAs, ACCT } from '../test-support/msq-world'
import { saveAccess } from '../state/accounts'
import { enterSquadron, notify } from '../state/store'
import { setDrawer } from './pops'
import { Drawer } from './Drawer'

useMsqWorld()
afterEach(() => { setDrawer(false); cleanup() })

const pages = (c: HTMLElement) => [...c.querySelectorAll<HTMLElement>('#drawerNav a[data-page]')].map(a => a.dataset.page)

describe('the ☰ menu\'s Edit Schedule follows the squadron picked, as the top bar does (F1)', () => {
  /* rewritten by his D2381 (23 Nov 26): with 149 he only views picked, Admin goes too — View-only Sched and Help alone */
  it('Hunter with View of 149, 149 picked: no Edit Schedule, no Admin (D2381); 142 picked again: Edit Schedule back', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    signInAs('hunter')
    act(() => { enterSquadron('u149'); setDrawer(true); notify() })
    const { container } = render(<Drawer />)
    expect(pages(container)).not.toContain('editsched')
    expect(pages(container)).toContain('viewsched')
    expect(pages(container)).not.toContain('admin')
    act(() => { enterSquadron('u142'); notify() })
    expect(pages(container)).toContain('editsched')
  })
  it('Saber (master admin) with 149 picked, and Hunter with Plan of 149 picked: Edit Schedule offered', () => {
    signInAs('saber')
    act(() => { enterSquadron('u149'); notify() })
    const a = render(<Drawer />)
    expect(pages(a.container)).toContain('editsched')
    a.unmount()
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    signInAs('hunter')
    act(() => { enterSquadron('u149'); notify() })
    const b = render(<Drawer />)
    expect(pages(b.container)).toContain('editsched')
  })
  it('Ranger (a member): no Edit Schedule, no Admin', () => {
    signInAs('ranger')
    const { container } = render(<Drawer />)
    expect(pages(container)).not.toContain('editsched')
    expect(pages(container)).not.toContain('admin')
  })
})
