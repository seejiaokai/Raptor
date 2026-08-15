// @vitest-environment jsdom
/* Session-change safety (FIX A) — pinning tests for the "a member can edit the
   schedule after an admin logs out" bug: HOOKS.editMode() must be role-aware
   (state/store.ts wireStore), and every login/logout must route through the
   one resetSession() helper (state/store.ts) so CURPAGE and the rest of the
   view state a next session must not inherit are actually cleared, not just
   whatever setBoardDay(null) happened to touch as a side effect. applyDrop
   (ui/drag.ts) and the text-commit path (ui/textedit.ts routeFocusOut) are
   checked too, as the defence-in-depth layer behind the role-aware editMode().
   Snapshot/restore pattern lifted from state/store.test.ts, so mutating DAYS
   here cannot leak into any other test file. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { slotVal, txtGet } from '../engine/slots'
import { setSession } from './auth'
import { initStore, resetSession } from './store'
import * as view from './view'
import { setDrag, applyDrop } from '../ui/drag'
import { routeFocusOut } from '../ui/textedit'

const DSNAP = JSON.stringify(DAYS)

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  setSession({ user: 'a', role: 'admin' })
  view.selDrop(); view.armDrop(); view.DPREV.clear()
  initStore()
})

describe('editMode is role-aware (state/store.ts HOOKS.editMode)', () => {
  it('a member session cannot edit even with the edit page open', () => {
    setSession({ user: 'user', role: 'main' })
    view.setPage('editsched')
    expect(HOOKS.editMode()).toBe(false)
  })

  it('an admin session on the edit page can edit', () => {
    setSession({ user: 'a', role: 'admin' })
    view.setPage('editsched')
    expect(HOOKS.editMode()).toBe(true)
  })

  /* the page half of the same gate — the Edit-mode toggle used to be a third
     term here (removed 9 Aug 26), so the page IS the switch now and this is
     the only way an admin is out of edit mode. */
  it('an admin off the edit page cannot edit', () => {
    setSession({ user: 'a', role: 'admin' })
    view.setPage('viewsched')
    expect(HOOKS.editMode()).toBe(false)
  })
})

describe('resetSession clears the view for the next session (state/store.ts)', () => {
  it('an admin leaves Edit Schedule open, logs out, a member logs in — the view lands clean', () => {
    setSession({ user: 'a', role: 'admin' })
    view.setPage('editsched')
    view.setBoardDay(0)
    view.selectPerson('bane')
    view.setSearch('cas')
    view.HLSET.add('A')
    view.armSlot('0.0.0.0.p')
    view.VWORK.add(0)                         // a working-copy choice on the view page
    expect(view.ARM).toBeTruthy()             // sanity: the admin session did arm it

    resetSession(null)                            // logout
    resetSession({ user: 'user', role: 'main' })   // member login, same tab

    expect(view.CURPAGE).toBe('viewsched')
    expect(view.SELID).toBe(null)
    expect(view.WFOCUS).toBe(null)
    expect(view.HLSET.size).toBe(0)
    expect(view.SEARCH).toBe('')
    expect(view.ARM).toBe(null)
    expect(view.SBDAY).toBe(null)
    expect(view.VWORK.size).toBe(0)           // the next session opens on the issued default
  })
})

describe('applyDrop and the text commit path refuse a member session (defence in depth)', () => {
  it('applyDrop performs no mutation for a member session', () => {
    const key = '0.0.0.0.p'
    const before = slotVal(key)
    setSession({ user: 'user', role: 'main' })
    setDrag({ kind: 'roster', id: 'casper' })
    const seat = document.createElement('span')
    seat.className = 'seat'
    seat.dataset.slot = key
    const result = applyDrop(seat, 0, 0)
    expect(result).toBe(false)
    expect(slotVal(key)).toBe(before)
  })

  it('the text commit path does not write for a member session', () => {
    const key = 'fr:0.0.0.0'
    const before = txtGet(key)
    setSession({ user: 'user', role: 'main' })
    const el = document.createElement('span')
    el.dataset.txt = key
    el.textContent = 'MEMBER TRIED THIS'
    routeFocusOut({ target: el } as any)
    expect(txtGet(key)).toBe(before)
  })
})
