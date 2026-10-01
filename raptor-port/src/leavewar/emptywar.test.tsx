/* [DB-READINESS] group A, phase 5 — THE LEAVE WAR WITH NO PERIOD AT ALL (plan §3 phase 5 tests: "a stamped store with an
   empty war list"; §9 phase 0's sequencing note — "an empty state on the page"). A shared store starts with no leave
   war (nothing demo reaches it — src/bootpolicy.ts), and a started store is read as it stands, so the page must stand
   up with none: it says so, an admin gets the way in (the same New-war sheet the picker's "+ New" opens), a member is
   told who makes it — and once the first war exists the page is the usual one. */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createWar, getState, initStore, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { LeaveWarPage } from './LeaveWarPage'

describe('a Leave War holding no period', () => {
  describe.each([
    ['a shared store\'s first boot', () => initStore(memoryBackend(), { started: false, seedDemo: false })],
    ['a started store holding no war', () => initStore(memoryBackend(), { started: true })],
  ])('%s', (_what, boot) => {
    beforeEach(() => { boot() })

    it('holds no war, and the current period is nobody\'s — no days', () => {
      expect(getState().wars).toHaveLength(0)
      expect(getState().period.days).toHaveLength(0)
      expect(getState().grid).toEqual({})
    })

    it('a member sees that there is no leave period yet, and who makes one — no grid, no picker', () => {
      act(() => setRole('member'))
      const { container } = render(<LeaveWarPage active={true} />)
      expect(screen.getByTestId('lw-empty').textContent).toMatch(/no leave period yet/i)
      expect(screen.getByTestId('lw-empty').textContent).toMatch(/admin/i)
      expect(screen.queryByTestId('lw-first-war')).toBeNull()
      expect(screen.queryByTestId('war-picker')).toBeNull()
      expect(container.querySelector('.mx')).toBeNull()
    })

    it('an admin gets the way in: the New-war sheet; once a war exists, the page is the usual one', () => {
      act(() => setRole('admin'))
      render(<LeaveWarPage active={true} />)
      fireEvent.click(screen.getByTestId('lw-first-war'))
      expect(screen.getByTestId('war-sheet')).toBeTruthy()
      act(() => { expect(createWar('JAN - DEC 27', '2027-01-01', '2027-12-31')).toBe('created') })
      expect(screen.queryByTestId('lw-empty')).toBeNull()
      expect(screen.getByTestId('war-picker')).toBeTruthy()
      expect(getState().period.name).toBe('JAN - DEC 27')
    })
  })
})
