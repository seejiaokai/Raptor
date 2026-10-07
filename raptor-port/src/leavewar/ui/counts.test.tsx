import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { DayVerdict, RuleResult } from '../engine'
import { initStore, moveManningRowTo, orderedManningIds, setCell, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { elevenCounters } from '../testkit'
import { CountRows } from './CountRows'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
  elevenCounters()   // the app starts with NO counters (D669); these tests are about counters, so they make the old eleven — testkit
})

// Dummy counts payload — CountRows never reads `counts`, only `results`, but
// DayVerdict requires the field to type-check.
const zeroCounts = { byCategory: { IP: 0, OPSP: 0, IWSO: 0, OPSW: 0 }, sxo: 0, sets: 0, duty: 0, flp: 0, wmp: 0, scd: 0, scn: 0 }

function rule(ruleId: string, label: string, have: number): RuleResult {
  return { ruleId, label, have, amber: 0, red: 0, verdict: 'ok' }
}

function day(date: string, results: RuleResult[]): DayVerdict {
  return { date, verdict: 'ok', results, counts: zeroCounts }
}

describe('count rows', () => {
  it('shows one row per rule plus the set rule', () => {
    render(<Matrix />)
    expect(screen.getByTestId('count-sets')).toBeTruthy()
    expect(screen.getByTestId('count-ip')).toBeTruthy()
    expect(screen.getByTestId('count-sxo')).toBeTruthy()
  })

  it('shows the available figure for a day', () => {
    render(<Matrix />)
    // Three IPs seeded (TATA, MILES, RESET). TATA carries a hand-typed FO on
    // 1 Jan, which since 20 Sep 26 is an AWARD — OIL owed him, not a day at
    // work — so it takes him off nothing and all three are available. Only a
    // credit the schedule earned stands a man down from flying.
    expect(screen.getByTestId('count-ip-2026-01-01').textContent).toBe('3')
  })

  it('shows a real set figure for a day, not just that the row exists', () => {
    render(<Matrix />)
    // 2026-01-02 has nobody on leave or duty in the seed grid: 9 pilots and
    // 7 WSOs are all fully available, so the constraining seat (WSO) caps
    // sets at 7.
    expect(screen.getByTestId('count-sets-2026-01-02').textContent).toBe('7')
  })

  it('counts a half day as a half, which the spreadsheet could not', () => {
    setCell('cross', '2026-02-05', '*LL')
    render(<Matrix />)
    expect(screen.getByTestId('count-opsw-2026-02-05').textContent).toBe('4.5')
  })

  it('paints a breached count red', () => {
    for (const id of ['tata', 'miles', 'reset']) setCell(id, '2026-02-05', 'LL')
    render(<Matrix />)
    expect(screen.getByTestId('count-ip-2026-02-05').className).toContain('red')
  })

  it('paints a thin but unbroken count amber', () => {
    setCell('tata', '2026-02-05', 'LL')
    render(<Matrix />)
    expect(screen.getByTestId('count-ip-2026-02-05').className).toContain('amber')
  })

  it('leaves a healthy count unpainted', () => {
    render(<Matrix />)
    expect(screen.getByTestId('count-ip-2026-02-05').className).not.toMatch(/amber|red/)
  })
})

// requirementFor() can swap in a wholly different rule set per date via
// overrides[date] — nothing constrains an override's rules to match the
// default's length or order. The store seeds overrides: {} and exposes no
// way to set one, so these two cases are built by hand against CountRows
// directly rather than reached through Matrix.
describe('count rows keyed by rule identity, not array position', () => {
  it('keeps each date\'s figure under its own rule\'s row when the rule order differs between dates', () => {
    const verdicts = {
      'd1': day('d1', [rule('sets', 'Crew sets', 5), rule('ip', 'IP', 2), rule('sxo', 'SXO', 1)]),
      // Same three rules, deliberately reordered — a naive positional read
      // would attribute d2's sxo count to the "sets" row, its sets count to
      // the "ip" row, and its ip count to the "sxo" row.
      'd2': day('d2', [rule('sxo', 'SXO', 9), rule('sets', 'Crew sets', 6), rule('ip', 'IP', 3)]),
    }
    render(<table><CountRows verdicts={verdicts} dates={['d1', 'd2']} order={[]} arranging={false} admin={false} onInfo={() => {}} /></table>)

    expect(screen.getByTestId('count-sets-d1').textContent).toBe('5')
    expect(screen.getByTestId('count-sets-d2').textContent).toBe('6')
    expect(screen.getByTestId('count-ip-d1').textContent).toBe('2')
    expect(screen.getByTestId('count-ip-d2').textContent).toBe('3')
    expect(screen.getByTestId('count-sxo-d1').textContent).toBe('1')
    expect(screen.getByTestId('count-sxo-d2').textContent).toBe('9')
  })

  it('blanks a cell for a rule missing from that date without shifting the rows after it', () => {
    const verdicts = {
      'd1': day('d1', [rule('sets', 'Crew sets', 5), rule('ip', 'IP', 2), rule('sxo', 'SXO', 1)]),
      // d2 drops the middle rule (ip) entirely. A naive positional read
      // would render d2's sxo count under the "ip" row (index 1 of a
      // 2-element array) and leave the "sxo" row blank (index 2, out of
      // bounds) — shifting a real number into the wrong label and losing
      // the real one.
      'd2': day('d2', [rule('sets', 'Crew sets', 6), rule('sxo', 'SXO', 9)]),
    }
    render(<table><CountRows verdicts={verdicts} dates={['d1', 'd2']} order={[]} arranging={false} admin={false} onInfo={() => {}} /></table>)

    expect(screen.getByTestId('count-sets-d2').textContent).toBe('6')
    // CountRows renders a missing cell as a bare `<td />` with no testid —
    // so its absence, not an empty string under the testid, is the proof.
    expect(screen.queryByTestId('count-ip-d2')).toBeNull()
    expect(screen.getByTestId('count-sxo-d2').textContent).toBe('9')
  })
})

// Rearrange the manning rows, and DELETE one (owner, 18 Aug 26; D669, 8 Oct 26). CountRows takes the order and
// whether an admin is arranging. Until D669 a row could be HIDDEN with an eye and waited under an ARCHIVE bar at the
// foot of the block (5 Sep 26); he replaced the eye with a delete cross — "instead of hide (eye) we should replace it
// with a delete cross" — so nothing can be hidden, and the Archive went with the eye. The tests of the eye and the
// bar that stood here are replaced by the cross's (the store side and Undo: nocounters.test.tsx).
describe('the manning rows can be reordered and deleted (admin)', () => {
  const verdicts = {
    d1: day('d1', [rule('sets', 'Crew sets', 5), rule('ip', 'IP', 2), rule('sxo', 'SXO', 1)]),
  }
  const ALL = ['sets', 'ip', 'sxo']
  const draw = (props: Partial<{ order: string[]; arranging: boolean; admin: boolean }>) =>
    render(<table><CountRows verdicts={verdicts} dates={['d1']}
      order={props.order ?? ALL}
      arranging={props.arranging ?? false} admin={props.admin ?? false} onInfo={() => {}} /></table>)

  it('an arranging admin gets a grip and a delete cross on every row — no eye, no arrows, no Archive bar', () => {
    draw({ arranging: true, admin: true })
    for (const id of ALL) {
      expect(screen.getByTestId(`manning-drag-${id}`)).toBeTruthy()
      expect(screen.getByTestId(`manning-delete-${id}`).textContent).toBe('✕')
      expect(screen.getByTestId(`count-${id}`).getAttribute('data-mrow')).toBe(id)
    }
    // drag-and-drop replaced the ▲▼ arrows (owner, 28 Aug 26 — still gone); the cross replaced the eye (D669)
    expect(screen.queryByTestId('manning-up-sxo')).toBeNull()
    expect(document.querySelector('[data-testid^="manning-hide-"], [data-testid^="manning-restore-"]')).toBeNull()
    expect(screen.queryByTestId('manning-archive')).toBeNull()
    expect(screen.queryByTestId('manning-archive-row')).toBeNull()
  })

  // A COUNT ROW GOING IN OR OUT TELLS THE GRID ([LW-MONTHJUMP-PHONE] review, Astra LW-101, 23 Sep 26 — it was the
  // Archive's signal then). The rows are cells of the grid's own table, standing above the dates: the grid caches
  // month widths, pins the frozen header's, and places the open-bidding outline off the rows below them. It hears
  // through `onRowsChange`: once per change in how many rows are drawn, never on mount — and only AFTER the rows are
  // in (or out of) the DOM, since that is what the grid then measures.
  it('a count row added or deleted tells the grid, after the row is in or out', () => {
    const rowsAtCall: number[] = []
    const ui = (v: Record<string, DayVerdict>, order: string[]) => (
      <table><CountRows verdicts={v} dates={['d1']} order={order} arranging admin onInfo={() => {}}
        onRowsChange={() => rowsAtCall.push(document.querySelectorAll('tbody.counts tr').length)} /></table>)
    const { rerender } = render(ui(verdicts, ALL))
    expect(rowsAtCall).toEqual([])                                   // never on mount
    rerender(ui({ d1: day('d1', [rule('sets', 'Crew sets', 5), rule('sxo', 'SXO', 1)]) }, ['sets', 'sxo']))
    expect(rowsAtCall).toEqual([2])                                  // IP deleted: told once, the row already out
    rerender(ui({ d1: day('d1', [rule('sets', 'Crew sets', 6), rule('sxo', 'SXO', 2)]) }, ['sets', 'sxo']))
    expect(rowsAtCall).toEqual([2])                                  // a figure moving is not a row moving
    rerender(ui(verdicts, ALL))
    expect(rowsAtCall).toEqual([2, 3])                               // a counter made: told once, the row already in
  })

  // The grip moved to the LEFT of the counter name (owner, 5 Sep 26 — "move the
  // rearrange 6 dots to the left of the start of the titles"); the cross sits
  // centred alone in the balance box, where the eye was. Pin both homes so a
  // refactor can't quietly put the grip back beside it.
  it('the grip sits in the NAME cell ahead of the title; the cross is alone in the balance box', () => {
    draw({ arranging: true, admin: true })
    const grip = screen.getByTestId('manning-drag-sxo')
    const cross = screen.getByTestId('manning-delete-sxo')
    const label = screen.getByTestId('manning-info-sxo')
    // grip is in the frozen name cell, and it comes BEFORE the label (its left)
    expect(grip.closest('td.who')).toBeTruthy()
    expect(grip.closest('td.bal')).toBeNull()
    expect(grip.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    // the cross is alone in the balance box — no grip beside it
    expect(cross.closest('td.bal')).toBeTruthy()
    expect(cross.closest('td.who')).toBeNull()
    expect(cross.closest('.mrow-tools')!.querySelectorAll('.drag').length).toBe(0)
    expect(cross.getAttribute('aria-label')).toBe('Delete the SXO counter')
  })

  it('outside Rearrange there is no grip and no cross (idle admin or member)', () => {
    draw({ admin: true })
    expect(document.querySelector('[data-testid^="manning-drag-"], [data-testid^="manning-delete-"]')).toBeNull()
    expect(screen.getByTestId('count-ip').getAttribute('data-mrow')).toBeNull()
  })

  it('a row the squadron’s own list does not hold (one a per-day override alone introduced) has no cross: there is nothing of the list to delete', () => {
    draw({ order: ['sets', 'sxo'], arranging: true, admin: true })
    expect(screen.getByTestId('count-ip')).toBeTruthy()               // still drawn, appended after the list's own
    expect(screen.queryByTestId('manning-delete-ip')).toBeNull()
    expect(screen.getByTestId('manning-delete-sxo')).toBeTruthy()
  })

  it('the cross deletes its counter through the store, and the row leaves the grid at once — nothing is asked', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('roster-arrange'))            // enter Rearrange
    fireEvent.click(screen.getByTestId('manning-delete-ip'))         // the cross
    expect(screen.queryByTestId('count-ip')).toBeNull()              // gone at once
    expect(orderedManningIds()).not.toContain('ip')
    expect(screen.getByTestId('count-sxo')).toBeTruthy()             // the rest stay, with their own controls
    expect(screen.getByTestId('manning-delete-sxo')).toBeTruthy()
  })

  it('a member never gets the reorder controls even for a visible row', () => {
    draw({ arranging: true, admin: false })
    expect(screen.queryByTestId('manning-drag-ip')).toBeNull()
    expect(screen.queryByTestId('manning-delete-ip')).toBeNull()
  })

  it('honours the given display order', () => {
    draw({ order: ['sxo', 'sets', 'ip'] })
    const rows = screen.getAllByTestId(/^count-(sets|ip|sxo)$/).map(r => r.getAttribute('data-testid'))
    expect(rows).toEqual(['count-sxo', 'count-sets', 'count-ip'])
  })

  // A reorder must never leave a row without its grip/cross tools. On the phone the
  // frozen tools column could paint stale after a drag (the iOS sticky-repaint
  // glitch the Matrix drag machine now kicks a redraw for); this pins the DOM
  // invariant behind it — every visible row keeps BOTH tools across a real move.
  it('every count row keeps its grip and cross after a manning reorder', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('roster-arrange'))            // enter Rearrange
    const toolCount = () => ({
      /* the squadron's OWN count rows. The four Required / Available rows at the foot of the block (FlyRows.tsx — D665,
         8 Oct 26) are not among them: the SANS calendar reads those, so they carry no grip and no cross by design
         (pinned in flyrows.test.tsx and nocounters.test.tsx). */
      rows: document.querySelectorAll('tbody.counts tr:not(.flyrow)').length,
      grips: document.querySelectorAll('[data-testid^="manning-drag-"]').length,
      crosses: document.querySelectorAll('[data-testid^="manning-delete-"]').length,
    })
    const before = toolCount()
    expect(before.rows).toBeGreaterThan(1)
    expect(before.grips).toBe(before.rows)
    expect(before.crosses).toBe(before.rows)
    // move the last manning row to the front — a genuine store reorder
    const ids = orderedManningIds()
    act(() => { moveManningRowTo(ids[ids.length - 1]!, ids[0]!) })
    const after = toolCount()
    expect(after.rows).toBe(before.rows)          // nothing dropped
    expect(after.grips).toBe(after.rows)          // every row still has its grip
    expect(after.crosses).toBe(after.rows)        // and its cross
  })
})

// THE BLOCK IS DRAWN FOR THE ROWS AT ITS FOOT EVEN WITH NO COUNTER (D669): the Manning block comes with no count rows
// of its own, and the four Required / Available rows (handed in as children by Matrix) are then all it shows.
describe('a block with no count row', () => {
  it('still draws the rows handed to it', () => {
    render(<table><CountRows verdicts={{}} dates={['d1']} order={[]} arranging={false} admin={false} onInfo={() => {}}>
      <tr data-testid="foot-row"><td>x</td></tr>
    </CountRows></table>)
    const block = screen.getByTestId('foot-row').parentElement!
    expect(block.tagName).toBe('TBODY'); expect(block.className).toBe('counts')
    expect(block.children.length).toBe(1)
  })
  it('and draws nothing at all when nothing is handed to it', () => {
    const { container } = render(<table><CountRows verdicts={{}} dates={['d1']} order={[]} arranging={false} admin={false} onInfo={() => {}} /></table>)
    expect(container.querySelector('tbody')).toBeNull()
  })
})

// The header toggle collapses the whole manning block, for EITHER role (owner,
// 19 Aug 26 — "allow both admin and norm user to hide it when viewing").
describe('collapsing the manning block', () => {
  it('a normal viewer hides and reopens it on the header toggle', () => {
    render(<Matrix />)
    expect(screen.getByTestId('count-sets')).toBeTruthy()
    fireEvent.click(screen.getByTestId('counts-toggle'))
    expect(screen.queryByTestId('count-sets')).toBeNull()
    expect(screen.queryByTestId('count-ip')).toBeNull()
    fireEvent.click(screen.getByTestId('counts-toggle'))
    expect(screen.getByTestId('count-sets')).toBeTruthy()
  })

  it('stays shown while an admin is Rearranging, so the row controls are reachable', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counts-toggle'))       // collapse
    expect(screen.queryByTestId('count-sets')).toBeNull()
    fireEvent.click(screen.getByTestId('roster-arrange'))       // enter Rearrange
    expect(screen.getByTestId('count-sets')).toBeTruthy()
    expect(screen.getByTestId('manning-drag-sets')).toBeTruthy()  // and its controls
  })
})
