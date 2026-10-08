import { useLayoutEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode, RefCallback } from 'react'
import { FIXED_ROWS, isFixedRow, type DayVerdict } from '../engine'
import { deleteManningRule } from '../state/store'

/** Rounds for display only — 4.5 stays 4.5, 4 does not become "4.0". */
const show = (n: number) => String(Math.round(n * 10) / 10)

export function CountRows({
  verdicts,
  dates,
  order,
  arranging,
  admin,
  onInfo,
  onRowDragStart,
  draggingId,
  dragOver,
  dragAfter,
  padL,
  padR,
  phL,
  phR,
  onRowsChange,
  fixed,
}: {
  /** THE FOUR FIXED ROWS — Required P and W, Available P and W (FlyRows.tsx; owner D665, 8 Oct 26: "I'm going with B" —
   *  in the Manning block, not under the Event rows) — drawn by the caller AMONG this block's own rows. It is handed
   *  the counters' rows in five runs — those above Required P, those between each pair of the four, those below
   *  Available W — and returns the block's rows whole (owner, D674, 8 Oct 26: a counter "moved to anywhere in between
   *  the fixed blue dot rows … even to below the 4 as well"). The four follow the same row contract, fold away with
   *  the block, and are never dragged or deleted here. Since D669 they are ALL the block shows until a squadron makes
   *  a counter — so the block is drawn for them even when it has no count row at all. */
  fixed?: (runs: ReactNode[][]) => ReactNode
  verdicts: Record<string, DayVerdict>
  dates: string[]
  /** The block's rows in the order they are drawn (store's `manningBlockOrder`): the squadron's own counters and the
   *  four fixed rows' tokens (engine/fixedrows.ts). A list that names no fixed row draws its counters above them. */
  order: string[]
  /** Rearrange mode is on (the roster/manning edit toggle). */
  arranging: boolean
  /** The viewer is an admin — the only role that may reorder or delete. */
  admin: boolean
  /** A tap on a row's NAME opens its explainer sheet (owner, 19 Aug 26 —
   *  "create a bubble when I tap on the individual crew counter"). */
  onInfo: (ruleId: string) => void
  /** Begin a drag-to-reorder from this row's grip (owner, 28 Aug 26 — the same
   *  drag the roster rows use, replacing the ▲▼ arrows). Wired by Matrix. */
  onRowDragStart?: (e: ReactPointerEvent, ruleId: string) => void
  /** The row id currently being dragged, and the row hovered over + which half —
   *  for the drag highlight, mirrored from Matrix's drag state. */
  draggingId?: string | null
  dragOver?: string | null
  dragAfter?: boolean
  /** The column window's PLACEHOLDER cells (colwindow.ts, 5 Sep 26): one empty
   *  cell before / after the drawn days standing in for the undrawn months, so
   *  every row keeps the same column count as the header. Sized by Matrix,
   *  never here: `phL`/`phR` are its mount hooks that write the width onto
   *  the cell. */
  padL?: boolean
  padR?: boolean
  phL?: RefCallback<HTMLTableCellElement>
  phR?: RefCallback<HTMLTableCellElement>
  /** Called once a count row has gone in or out of the DOM (a counter made, or deleted with the cross). They are
   *  rows of the grid's own table, standing ABOVE the dates: the open-bidding outline, the Figures drawer and the
   *  frozen header are all placed off rows below them, and a row's numbers can change a day column's width — Matrix
   *  re-measures on it (see there). It was the Archive's signal until the Archive went (D669); the reason for it
   *  did not. Wired by Matrix. */
  onRowsChange?: () => void
}) {
  const editing = arranging && admin

  // `requirementFor` can swap in a wholly different rule set per date via
  // `overrides[date]` — nothing constrains an override's rules to the same
  // length or order as the default. So the label of each row is taken from the
  // first date that carries it, and each cell is looked up by ruleId, never by
  // array position — a reordered or date-only rule still lands in its own row.
  const label = new Map<string, string>()
  for (const date of dates) {
    for (const r of verdicts[date]?.results ?? []) {
      if (!label.has(r.ruleId)) label.set(r.ruleId, r.label)
    }
  }

  // Display order = the admin's order first (only ids that actually have a row
  // today — and the four fixed rows' tokens, which mark where those stand), then
  // any row a per-day override introduced that the default order never named,
  // so it is never dropped: at the foot of the counters above the four, where a
  // counter the order does not name has always appeared.
  const seq = order.filter(id => isFixedRow(id) || label.has(id))
  const seen = new Set(seq)
  const extra = [...label.keys()].filter(id => !seen.has(id))
  if (extra.length) { const at = seq.findIndex(isFixedRow); seq.splice(at < 0 ? seq.length : at, 0, ...extra) }
  /* the counters drawn, top to bottom */
  const ids = seq.filter(id => !isFixedRow(id))
  /* THERE IS NO HIDING A ROW ANY MORE (owner, D669, 8 Oct 26 — "instead of hide (eye) we should replace it with a
     delete cross"). The eye archived a counter out of view and the ARCHIVE bar at the foot of the block (5 Sep 26)
     brought it back; both are gone. A row a store written before that day had hidden is simply drawn — nothing
     stored is converted (D56), and a row nobody can see with no way to bring it back would be worse than one too
     many. */

  // Tell the grid when the NUMBER of count rows it draws has changed — after they are in (or out of) the DOM, since
  // that is what it then measures. Not on the first run: a block that has just mounted has changed nothing.
  const rowCount = useRef<number | null>(null)
  useLayoutEffect(() => {
    if (rowCount.current !== null && rowCount.current !== ids.length) onRowsChange?.()
    rowCount.current = ids.length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.length])

  /* nothing to draw at all: no counter, and nobody drawing the four fixed rows */
  if (ids.length === 0 && !fixed) return null

  // One lookup map per date, built once, so each cell is a ruleId lookup
  // rather than a per-cell `find` over that date's results array.
  const byDate = new Map(dates.map(date => [date, new Map(verdicts[date]?.results.map(r => [r.ruleId, r]))]))
  /* the cross deletes a counter of the squadron's own list; a row a per-day override alone introduced is not one */
  const own = new Set(order)

  const rowFor = (ruleId: string) => {
        const cls = [
          draggingId === ruleId ? 'dragging' : '',
          draggingId && dragOver === ruleId && draggingId !== ruleId ? (dragAfter ? 'dragover after' : 'dragover') : '',
        ].filter(Boolean).join(' ')
        // The name is the tap target for the row's explainer sheet — the whole
        // frozen cell, not a glyph inside it, because a glyph in that column is
        // not a tap target (the counter-arrows lesson). A real button for the
        // keyboard; styled as the plain label.
        const nameBtn = (
          <button
            className="mwho"
            data-testid={`manning-info-${ruleId}`}
            title={`What does ${label.get(ruleId)} count?`}
            onClick={() => onInfo(ruleId)}
          >
            {label.get(ruleId)}
          </button>
        )
        return (
          <tr
            key={ruleId}
            data-testid={`count-${ruleId}`}
            /* the drag machine hit-tests this attribute, not the testid — the
               day cells are `count-<id>-<date>` and would shadow a testid
               prefix match (Matrix: MANNING_DRAG) */
            data-mrow={editing ? ruleId : undefined}
            className={cls || undefined}
          >
            {/* In Rearrange the reorder GRIP sits to the LEFT of the name
                (owner, 5 Sep 26 — "move the rearrange 6 dots to the left of the
                start of the titles"), so the whole row reads as the thing you
                grab; the two share one flex line. OUTSIDE Rearrange the cell is
                exactly the bare button — the frozen-column clip gate measures
                that state, and the grip (edit-mode only) never reaches it. */}
            <td className="who">
              {editing ? (
                <div className="mwho-row">
                  <span
                    className="drag"
                    data-testid={`manning-drag-${ruleId}`}
                    title={`Drag to move ${label.get(ruleId)}`}
                    aria-label={`Drag to move ${label.get(ruleId)}`}
                    style={{ touchAction: 'none' }}
                    onPointerDown={e => onRowDragStart?.(e, ruleId)}
                  >⠿</span>
                  {nameBtn}
                </div>
              ) : nameBtn}
            </td>
            {/* A count row is a rule, not a person, so it has no leave balance.
                The cell is otherwise empty and aligns the column — in Rearrange
                mode it carries the admin's one control for the row, which has
                nowhere else to sit in a frozen 44px column. */}
            <td className="bal" data-testid={`counter-count-${ruleId}`}>
              {editing && own.has(ruleId) && (
                <span className="mrow-tools">
                  {/* THE DELETE CROSS, where the eye was (owner, D669, 8 Oct 26 — "Instead of hide (eye) we should
                      replace it with a delete cross"). It deletes the counter outright and asks nothing first,
                      because the app's Undo brings the counter back whole — what it counts, its amber and red, its
                      place in the list (the war's command stream carries the counters; pinned in
                      nocounters.test.tsx). Reorder is still the grip, to the LEFT of the name. */}
                  <button
                    className="mrow-btn del"
                    data-testid={`manning-delete-${ruleId}`}
                    title="Delete this counter — Undo brings it back"
                    aria-label={`Delete the ${label.get(ruleId)} counter`}
                    onClick={() => deleteManningRule(ruleId)}
                  >✕</button>
                </span>
              )}
            </td>
            {padL && <td className="lwph lwph-l" ref={phL} />}
            {dates.map(date => {
              const r = byDate.get(date)?.get(ruleId)
              if (!r) return <td key={date} />
              return (
                <td
                  key={date}
                  data-testid={`count-${ruleId}-${date}`}
                  className={r.verdict === 'ok' ? '' : r.verdict}
                  title={`${label.get(ruleId)}: ${show(r.have)} available, amber ${r.amber}, red ${r.red}`}
                >
                  {show(r.have)}
                </td>
              )
            })}
            {padR && <td className="lwph lwph-r" ref={phR} />}
          </tr>
        )
  }

  if (!fixed) return <tbody className="counts">{ids.map(id => rowFor(id))}</tbody>

  /* THE COUNTERS IN FIVE RUNS, split where the four fixed rows stand (D674): run 0 above Required P, run k just under
     the k-th fixed row, run 4 below Available W. The four keep their own order (the store's order guarantees it), so a
     token only ever moves the cut downward. */
  const runs: ReactNode[][] = [[], ...FIXED_ROWS.map(() => [] as ReactNode[])]
  let k = 0
  for (const id of seq) {
    if (isFixedRow(id)) k = FIXED_ROWS.indexOf(id) + 1
    else runs[k]!.push(rowFor(id))
  }
  return <tbody className="counts">{fixed(runs)}</tbody>
}
