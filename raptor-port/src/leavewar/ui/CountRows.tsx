import { useEffect, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, RefCallback } from 'react'
import type { DayVerdict } from '../engine'
import { toggleManningRow } from '../state/store'

/** Rounds for display only — 4.5 stays 4.5, 4 does not become "4.0". */
const show = (n: number) => String(Math.round(n * 10) / 10)

export function CountRows({
  verdicts,
  dates,
  order,
  hidden,
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
}: {
  verdicts: Record<string, DayVerdict>
  dates: string[]
  /** The manning rows' display order (store's `orderedManningIds`). */
  order: string[]
  /** Rule ids an admin has hidden. */
  hidden: string[]
  /** Rearrange mode is on (the roster/manning edit toggle). */
  arranging: boolean
  /** The viewer is an admin — the only role that may reorder or hide. */
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
}) {
  const editing = arranging && admin
  // THE ARCHIVE (owner, 5 Sep 26 — "a row to open below the counter row that's
  // called Archive, so those go there will be out of view unless I bring it
  // back", then "a merged 1 bar horizontally", and Rearrange-only). A hidden
  // counter no longer sits dimmed in the list while an admin rearranges: it
  // moves under an ARCHIVE bar at the foot of the block, closed by default, and
  // comes back with the ↺ inside. Local view state on purpose — a tap on the
  // bar must not re-render the ~28k-node grid the way a Matrix state would —
  // and it shuts again when Rearrange ends, so every visit starts closed.
  const [archiveOpen, setArchiveOpen] = useState(false)
  useEffect(() => { if (!editing) setArchiveOpen(false) }, [editing])

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
  if (label.size === 0) return null

  // Display order = the admin's order first (only ids that actually have a row
  // today), then any row a per-day override introduced that the default order
  // never named, appended so it is never dropped.
  const ids = order.filter(id => label.has(id))
  const seen = new Set(ids)
  for (const id of label.keys()) if (!seen.has(id)) ids.push(id)

  // A member never sees a hidden row, and neither does an idle admin. While an
  // admin is arranging, the hidden rows are ARCHIVED: out of the list, kept
  // under the Archive bar below it, drawn only while that bar is open.
  const hiddenSet = new Set(hidden)
  const live = ids.filter(id => !hiddenSet.has(id))
  const archived = editing ? ids.filter(id => hiddenSet.has(id)) : []
  if (live.length === 0 && archived.length === 0) return null

  // One lookup map per date, built once, so each cell is a ruleId lookup
  // rather than a per-cell `find` over that date's results array.
  const byDate = new Map(dates.map(date => [date, new Map(verdicts[date]?.results.map(r => [r.ruleId, r]))]))
  // The day columns as the header draws them — the drawn days plus the column
  // window's placeholder cell on each side (see `padL`/`padR`) — which is what
  // the Archive bar's fill cell must span to read as one bar.
  const dayCols = dates.length + (padL ? 1 : 0) + (padR ? 1 : 0)

  const rowFor = (ruleId: string, isHidden: boolean) => {
        const cls = [
          isHidden ? 'mrow-hidden' : '',
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
            data-mrow={editing && !isHidden ? ruleId : undefined}
            className={cls || undefined}
          >
            {/* In Rearrange the reorder GRIP sits to the LEFT of the name
                (owner, 5 Sep 26 — "move the rearrange 6 dots to the left of the
                start of the titles"), so the whole row reads as the thing you
                grab; the two share one flex line. OUTSIDE Rearrange the cell is
                exactly the bare button — the frozen-column clip gate measures
                that state, and the grip (edit-mode only) never reaches it. An
                archived row has no grip (nowhere to drag to), so it too is the
                bare button. */}
            <td className="who">
              {editing && !isHidden ? (
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
                mode it carries the admin's reorder / hide controls, which have
                nowhere else to sit in a frozen 44px column. */}
            <td className="bal" data-testid={`counter-count-${ruleId}`}>
              {editing && !isHidden && (
                <span className="mrow-tools">
                  {/* Reorder is DRAG now (owner, 28 Aug 26 — "the rearrange
                      could u do drag and drop … remove the arrow function"): the
                      grip moved to the LEFT of the name (owner, 5 Sep 26, above).
                      The hide (eye) stays here, now centred ALONE in the balance
                      box, and since 5 Sep 26 it ARCHIVES the row — under the bar
                      below, out of view until opened. */}
                  <button
                    className="mrow-btn eye"
                    data-testid={`manning-hide-${ruleId}`}
                    title="Archive this row"
                    aria-label={`Archive ${label.get(ruleId)}`}
                    onClick={() => toggleManningRow(ruleId)}
                  >👁</button>
                </span>
              )}
              {editing && isHidden && (
                <span className="mrow-tools">
                  {/* An archived row has no place to drag to, so no grip — only
                      the way back, which returns it to its old position in the
                      order (hiding never touched `manningOrder`). */}
                  <button
                    className="mrow-btn restore"
                    data-testid={`manning-restore-${ruleId}`}
                    title="Bring this row back"
                    aria-label={`Bring ${label.get(ruleId)} back`}
                    onClick={() => toggleManningRow(ruleId)}
                  >↺</button>
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

  return (
    <tbody className="counts">
      {live.map(id => rowFor(id, false))}
      {/* THE ARCHIVE BAR — one merged bar with no day grid (owner, 5 Sep 26).
          The category-heading technique (Matrix `tr.grp`): a sticky td over the
          two frozen columns carries the label and stays pinned as the year
          scrolls; ONE fill cell spans every day column, so the row is a bar,
          not a grid. The td is the tap target, not the zero-width `.marchhd-in`
          inside it (the heading's own lesson). Drawn only while something is
          archived: an empty archive is clutter, and the bar appears the moment
          the first eye is pressed. It is a HEM, not a heading (owner, 5 Sep 26
          — "make the archive section much smaller"): a step shorter than a
          count row, one type step below the row labels, muted ink, so it
          never outranks the counters it serves. */}
      {archived.length > 0 && (
        <tr className="march" data-testid="manning-archive-row">
          <td
            className="marchhd"
            colSpan={2}
            data-testid="manning-archive"
            role="button"
            tabIndex={0}
            aria-expanded={archiveOpen}
            aria-label={`Archive — ${archived.length} hidden ${archived.length === 1 ? 'row' : 'rows'}, ${archiveOpen ? 'close' : 'open'} it`}
            title={archiveOpen ? 'Close the Archive' : 'Open the Archive — bring a hidden row back'}
            onClick={() => setArchiveOpen(o => !o)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setArchiveOpen(o => !o) } }}
          >
            <div className="marchhd-in">
              <span className="mcar" aria-hidden="true">{archiveOpen ? '▾' : '▸'}</span>
              <span className="mname">ARCHIVE</span>
              <span className="mcount">· {archived.length}</span>
            </div>
          </td>
          <td className="marchfill" colSpan={dayCols} />
        </tr>
      )}
      {archiveOpen && archived.map(id => rowFor(id, true))}
    </tbody>
  )
}
