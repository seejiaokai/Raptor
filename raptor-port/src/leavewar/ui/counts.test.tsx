import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { DayVerdict, RuleResult } from '../engine'
import { initStore, moveManningRowTo, orderedManningIds, setCell, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { CountRows } from './CountRows'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
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
    // Three IPs seeded (TATA, MILES, RESET). TATA is on FO on 1 Jan, and OIL-credit
    // duty is at work but off the flying programme, so two remain available.
    expect(screen.getByTestId('count-ip-2026-01-01').textContent).toBe('2')
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
    render(<table><CountRows verdicts={verdicts} dates={['d1', 'd2']} order={[]} hidden={[]} arranging={false} admin={false} onInfo={() => {}} /></table>)

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
    render(<table><CountRows verdicts={verdicts} dates={['d1', 'd2']} order={[]} hidden={[]} arranging={false} admin={false} onInfo={() => {}} /></table>)

    expect(screen.getByTestId('count-sets-d2').textContent).toBe('6')
    // CountRows renders a missing cell as a bare `<td />` with no testid —
    // so its absence, not an empty string under the testid, is the proof.
    expect(screen.queryByTestId('count-ip-d2')).toBeNull()
    expect(screen.getByTestId('count-sxo-d2').textContent).toBe('9')
  })
})

// Rearrange/hide the manning rows (owner, 18 Aug 26). CountRows takes the
// order, the hidden set and whether an admin is arranging; it drops a hidden
// row for everyone until an admin turns Rearrange on — where, since 5 Sep 26,
// it waits under the ARCHIVE bar at the foot of the block (closed by default,
// "out of view unless I bring it back") rather than sitting dimmed in the list.
describe('the manning rows can be reordered and hidden (admin)', () => {
  const verdicts = {
    d1: day('d1', [rule('sets', 'Crew sets', 5), rule('ip', 'IP', 2), rule('sxo', 'SXO', 1)]),
  }
  const draw = (props: Partial<{ order: string[]; hidden: string[]; arranging: boolean; admin: boolean }>) =>
    render(<table><CountRows verdicts={verdicts} dates={['d1']}
      order={props.order ?? []} hidden={props.hidden ?? []}
      arranging={props.arranging ?? false} admin={props.admin ?? false} onInfo={() => {}} /></table>)

  it('a hidden row is gone for a member and an idle admin', () => {
    draw({ hidden: ['ip'] })
    expect(screen.queryByTestId('count-ip')).toBeNull()
    expect(screen.getByTestId('count-sxo')).toBeTruthy()
  })

  it('an arranging admin finds the hidden row under the Archive bar, not in the list', () => {
    draw({ hidden: ['ip'], arranging: true, admin: true })
    // out of view: the row is not drawn, the bar says one is archived
    expect(screen.queryByTestId('count-ip')).toBeNull()
    const bar = screen.getByTestId('manning-archive')
    expect(bar.textContent).toContain('ARCHIVE')
    expect(bar.textContent).toContain('1')
    expect(bar.getAttribute('aria-expanded')).toBe('false')
    // the live rows keep their grip and archive eye (drag-and-drop replaced the
    // ▲▼ arrows, owner 28 Aug 26 — still gone)
    expect(screen.getByTestId('manning-drag-sxo')).toBeTruthy()
    expect(screen.getByTestId('manning-hide-sxo')).toBeTruthy()
    expect(screen.queryByTestId('manning-up-sxo')).toBeNull()
    // open the archive: the row is back, dimmed, with only its way back — no
    // grip (an archived row has no place to drag to) and no eye
    fireEvent.click(bar)
    expect(bar.getAttribute('aria-expanded')).toBe('true')
    const row = screen.getByTestId('count-ip')
    expect(row.className).toContain('mrow-hidden')
    expect(row.getAttribute('data-mrow')).toBeNull()
    expect(screen.getByTestId('manning-restore-ip')).toBeTruthy()
    expect(screen.queryByTestId('manning-drag-ip')).toBeNull()
    expect(screen.queryByTestId('manning-hide-ip')).toBeNull()
    // and closes again
    fireEvent.click(bar)
    expect(screen.queryByTestId('count-ip')).toBeNull()
  })

  // The grip moved to the LEFT of the counter name (owner, 5 Sep 26 — "move the
  // rearrange 6 dots to the left of the start of the titles"); the eye stays
  // centred alone in the balance box. Pin both homes so a refactor can't quietly
  // put the grip back beside the eye.
  it('the grip sits in the NAME cell ahead of the title; the eye stays alone in the balance box', () => {
    draw({ arranging: true, admin: true })
    const grip = screen.getByTestId('manning-drag-sxo')
    const eye = screen.getByTestId('manning-hide-sxo')
    const label = screen.getByTestId('manning-info-sxo')
    // grip is in the frozen name cell, and it comes BEFORE the label (its left)
    expect(grip.closest('td.who')).toBeTruthy()
    expect(grip.closest('td.bal')).toBeNull()
    expect(grip.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    // the eye is alone in the balance box — no grip beside it any more
    expect(eye.closest('td.bal')).toBeTruthy()
    expect(eye.closest('td.who')).toBeNull()
    expect(eye.closest('.mrow-tools')!.querySelectorAll('.drag').length).toBe(0)
  })

  it('the Archive bar is ONE merged bar over the day columns, not a row of cells', () => {
    draw({ hidden: ['ip'], arranging: true, admin: true })
    const row = screen.getByTestId('manning-archive-row')
    const cells = row.querySelectorAll('td')
    expect(cells.length).toBe(2)                                   // label + one fill
    expect(cells[0]!.getAttribute('colspan')).toBe('2')            // the two frozen columns
    expect(cells[1]!.getAttribute('colspan')).toBe('1')            // every day column (one date here)
  })

  it('the Archive bar is absent while nothing is hidden', () => {
    draw({ arranging: true, admin: true })
    expect(screen.queryByTestId('manning-archive')).toBeNull()
  })

  it('outside Rearrange there is no bar and no hidden row (idle admin or member)', () => {
    draw({ hidden: ['ip'] })
    expect(screen.queryByTestId('manning-archive')).toBeNull()
    expect(screen.queryByTestId('count-ip')).toBeNull()
  })

  it('archiving from the eye and restoring from the Archive round-trip through the store', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('roster-arrange'))            // enter Rearrange
    expect(screen.queryByTestId('manning-archive')).toBeNull()
    fireEvent.click(screen.getByTestId('manning-hide-ip'))           // archive IP
    expect(screen.queryByTestId('count-ip')).toBeNull()              // out of view at once
    const bar = screen.getByTestId('manning-archive')
    expect(bar.textContent).toContain('1')
    fireEvent.click(bar)                                             // open
    fireEvent.click(screen.getByTestId('manning-restore-ip'))        // bring it back
    const row = screen.getByTestId('count-ip')
    expect(row.className).not.toContain('mrow-hidden')
    expect(screen.getByTestId('manning-drag-ip')).toBeTruthy()       // a live row again, in the list
    expect(screen.queryByTestId('manning-archive')).toBeNull()       // the bar goes when it empties
  })

  it('a member never gets the reorder controls even for a visible row', () => {
    draw({ arranging: true, admin: false })
    expect(screen.queryByTestId('manning-drag-ip')).toBeNull()
  })

  it('honours the given display order', () => {
    draw({ order: ['sxo', 'sets', 'ip'] })
    const rows = screen.getAllByTestId(/^count-(sets|ip|sxo)$/).map(r => r.getAttribute('data-testid'))
    expect(rows).toEqual(['count-sxo', 'count-sets', 'count-ip'])
  })

  // A reorder must never leave a row without its grip/eye tools. On the phone the
  // frozen tools column could paint stale after a drag (the iOS sticky-repaint
  // glitch the Matrix drag machine now kicks a redraw for); this pins the DOM
  // invariant behind it — every visible row keeps BOTH tools across a real move.
  it('every count row keeps its grip and eye after a manning reorder', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('roster-arrange'))            // enter Rearrange
    const toolCount = () => ({
      rows: document.querySelectorAll('tbody.counts tr').length,
      grips: document.querySelectorAll('[data-testid^="manning-drag-"]').length,
      eyes: document.querySelectorAll('[data-testid^="manning-hide-"]').length,
    })
    const before = toolCount()
    expect(before.rows).toBeGreaterThan(1)
    expect(before.grips).toBe(before.rows)
    expect(before.eyes).toBe(before.rows)
    // move the last manning row to the front — a genuine store reorder
    const ids = orderedManningIds()
    act(() => { moveManningRowTo(ids[ids.length - 1]!, ids[0]!) })
    const after = toolCount()
    expect(after.rows).toBe(before.rows)          // nothing dropped
    expect(after.grips).toBe(after.rows)          // every row still has its grip
    expect(after.eyes).toBe(after.rows)           // and its eye
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
