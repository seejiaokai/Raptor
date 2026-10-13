/* THE ROWS OF THE LEAVE WAR, PINNED AS THEY ARE DRAWN — written FIRST, before `[LW-ROWS-SPLIT]` moved the row drawing
   out of Matrix.tsx (owner D493, D775; Astra's tidiness read §1: "Write first: ui/matrix-rows.test.tsx … pinning their
   DOM for awards, OIL, free halves, posted-out people and window-padding placeholders. It should also assert that
   opening an unrelated sheet does not repaint PersonRow").

   The move is a move: nothing on screen may change — "exact DOM order, classes, data attributes, memoisation
   boundaries, frozen columns, placeholder columns, admin/member visibility, OIL and award display, free-half
   presentation". So this test does not describe the rows; it RECORDS them — every row's whole markup, in several
   worlds, as an admin and as a member — into the file beside it, and fails on any difference. The record was made on
   the code BEFORE the move and must stand unchanged after it. (A deliberate change to how a row is drawn updates the
   record in the same change, on purpose: `npx vitest run src/leavewar/ui/matrix-rows.test.tsx -u`.) */
import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { advanceStage, initStore, setBidState, setCell, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { fileAbsence, elevenCounters } from '../testkit'
import { Matrix } from './Matrix'

const ME = 'ramp'
/* every person's row and every group heading, in the order the grid draws them — the whole markup of each */
const rows = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>('[data-testid^="row-"], [data-testid^="group-"]')]
  .map(e => e.outerHTML).join('\n')

function world() {
  initStore(memoryBackend())
  elevenCounters()
  /* member-filed medical; a whole day, the two halves, an OIL day off; a run across a weekend; a bid on the edge of the
     window — the cells each kind of row draws */
  fileAbsence('splice', 'ATTC', '2026-01-05')
  fileAbsence('splice', 'OML', '2026-01-06')
  setCell('ramp', '2026-01-20', '*LL'); setCell('ramp', '2026-01-21', 'LL*'); setCell('ramp', '2026-01-22', 'LL')
  setCell('switcher', '2026-01-13', 'FO'); setCell('switcher', '2026-01-14', 'HO')
  setCell('asics', '2026-01-23', 'LL'); setCell('asics', '2026-01-26', 'LL')
  setCell('tata', '2026-01-02', 'OL')
}

describe('[LW-ROWS-SPLIT] the rows of the Leave War are drawn exactly as they were', () => {
  beforeEach(world)

  it('open bidding, as an admin — every row and heading', async () => {
    act(() => { setRole('admin') })
    const { container } = render(<Matrix />)
    await expect(rows(container)).toMatchFileSnapshot('./__rows__/open-admin.html')
  })

  it('open bidding, as a member looking at his own row and everyone else’s', async () => {
    act(() => { setRole('member'); setViewer(ME) })
    const { container } = render(<Matrix />)
    await expect(rows(container)).toMatchFileSnapshot('./__rows__/open-member.html')
  })

  it('bidding closed, with one bid approved, one acknowledged and one refused — as an admin and as a member', async () => {
    act(() => {
      setRole('admin'); advanceStage()
      setBidState('asics', '2026-01-23', 'approved'); setBidState('asics', '2026-01-26', 'refused'); setBidState('ramp', '2026-01-22', 'acknowledged')
    })
    const a = render(<Matrix />)
    await expect(rows(a.container)).toMatchFileSnapshot('./__rows__/closed-admin.html')
    a.unmount()
    act(() => { setRole('member'); setViewer(ME) })
    const m = render(<Matrix />)
    await expect(rows(m.container)).toMatchFileSnapshot('./__rows__/closed-member.html')
  })

  it('published — as an admin and as a member', async () => {
    act(() => { setRole('admin'); advanceStage(); setBidState('asics', '2026-01-23', 'approved'); advanceStage() })
    const a = render(<Matrix />)
    await expect(rows(a.container)).toMatchFileSnapshot('./__rows__/published-admin.html')
    a.unmount()
    act(() => { setRole('member'); setViewer(ME) })
    const m = render(<Matrix />)
    await expect(rows(m.container)).toMatchFileSnapshot('./__rows__/published-member.html')
  })

  it('the record is of real rows: every world drew people, cells and headings', async () => {
    act(() => { setRole('admin') })
    const { container } = render(<Matrix />)
    const html = rows(container)
    expect(container.querySelectorAll('[data-testid^="row-"]').length, 'a row a person').toBeGreaterThan(10)
    expect(container.querySelectorAll('[data-testid^="group-"]').length, 'the group headings').toBeGreaterThan(3)
    expect(html.length, 'the markup of the rows, not an empty string').toBeGreaterThan(50000)
    expect(html).toContain('row-ramp'); expect(html).toContain('row-splice')
  })
})
