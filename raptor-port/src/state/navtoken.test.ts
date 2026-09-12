// @vitest-environment jsdom
/* THE NAVIGATION TOKEN COVERS A BOARD CLOSE/OPEN (Q2R-10). A day-template-apply
   confirm (board.ts DAYTPL_ARM) is armed content+NAVGEN-scoped; a board day-to-day
   step already bumps NAVGEN (P2-QREV-08), but CLOSING the board (SBDAY -> null) and
   reopening it on the SAME day did not — so a stale confirm could still apply on one
   pick after a close/reopen. setBoardDay now bumps on ANY real SBDAY transition —
   open, close, or day change — but never on a same-day repaint. */
import { beforeEach, describe, expect, it } from 'vitest'
import { setBoardDay, navGen } from './view'

beforeEach(() => { setBoardDay(null) })   // every test starts with the board closed

describe('the nav token tracks board open and close, not only day-to-day', () => {
  it('bumps when the board OPENS from closed', () => {
    const g = navGen(); setBoardDay(2)
    expect(navGen()).toBeGreaterThan(g)
  })

  it('bumps when the board CLOSES and reopens on the SAME day', () => {
    setBoardDay(2)
    const g = navGen()
    setBoardDay(null)        // close
    setBoardDay(2)           // reopen, same day — the stale-confirm window
    expect(navGen(), 'a close+reopen is two navigation gestures').toBeGreaterThan(g)
  })

  it('does NOT bump on a repaint to the same open day', () => {
    setBoardDay(2)
    const g = navGen()
    setBoardDay(2)           // same day again — a repaint, not a navigation
    expect(navGen()).toBe(g)
  })

  it('does NOT bump when an already-closed board is set closed again', () => {
    setBoardDay(null)
    const g = navGen()
    setBoardDay(null)
    expect(navGen()).toBe(g)
  })
})
