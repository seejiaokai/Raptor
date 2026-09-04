import type { PointerEvent as ReactPointerEvent } from 'react'
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
   *  every row keeps the same column count as the header. Sized by Matrix
   *  through a CSS variable, never here. */
  padL?: boolean
  padR?: boolean
}) {
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

  // A member never sees a hidden row; an admin sees it dimmed WHILE arranging,
  // so it can be brought back, and not at all once Done.
  const hiddenSet = new Set(hidden)
  const rows = ids.filter(id => (arranging && admin) || !hiddenSet.has(id))
  if (rows.length === 0) return null

  // One lookup map per date, built once, so each cell is a ruleId lookup
  // rather than a per-cell `find` over that date's results array.
  const byDate = new Map(dates.map(date => [date, new Map(verdicts[date]?.results.map(r => [r.ruleId, r]))]))
  const editing = arranging && admin

  return (
    <tbody className="counts">
      {rows.map(ruleId => {
        const isHidden = hiddenSet.has(ruleId)
        const cls = [
          isHidden ? 'mrow-hidden' : '',
          draggingId === ruleId ? 'dragging' : '',
          draggingId && dragOver === ruleId && draggingId !== ruleId ? (dragAfter ? 'dragover after' : 'dragover') : '',
        ].filter(Boolean).join(' ')
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
            {/* The name is the tap target for the row's explainer sheet — the
                whole 76px frozen cell, not a glyph inside it, because a glyph
                in that column is not a tap target (the counter-arrows lesson).
                A real button for the keyboard; styled as the plain label. */}
            <td className="who">
              <button
                className="mwho"
                data-testid={`manning-info-${ruleId}`}
                title={`What does ${label.get(ruleId)} count?`}
                onClick={() => onInfo(ruleId)}
              >
                {label.get(ruleId)}
              </button>
            </td>
            {/* A count row is a rule, not a person, so it has no leave balance.
                The cell is otherwise empty and aligns the column — in Rearrange
                mode it carries the admin's reorder / hide controls, which have
                nowhere else to sit in a frozen 44px column. */}
            <td className="bal" data-testid={`counter-count-${ruleId}`}>
              {editing && (
                <span className="mrow-tools">
                  {/* Reorder is DRAG now (owner, 28 Aug 26 — "the rearrange
                      could u do drag and drop … remove the arrow function"): the
                      same grip and machine the roster rows use. The ▲▼ arrows
                      are gone; the hide (eye) stays. */}
                  <span
                    className="drag"
                    data-testid={`manning-drag-${ruleId}`}
                    title={`Drag to move ${label.get(ruleId)}`}
                    aria-label={`Drag to move ${label.get(ruleId)}`}
                    style={{ touchAction: 'none' }}
                    onPointerDown={e => onRowDragStart?.(e, ruleId)}
                  >⠿</span>
                  <button
                    className={`mrow-btn eye${isHidden ? ' off' : ''}`}
                    data-testid={`manning-hide-${ruleId}`}
                    aria-pressed={isHidden}
                    title={isHidden ? 'Show this row' : 'Hide this row'}
                    aria-label={isHidden ? `Show ${label.get(ruleId)}` : `Hide ${label.get(ruleId)}`}
                    onClick={() => toggleManningRow(ruleId)}
                  >{isHidden ? '⊘' : '👁'}</button>
                </span>
              )}
            </td>
            {padL && <td className="lwph lwph-l" />}
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
            {padR && <td className="lwph lwph-r" />}
          </tr>
        )
      })}
    </tbody>
  )
}
