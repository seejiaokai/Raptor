// Two event lines per day, above the count rows.
//
// The owner's first ask, 10 Aug 26: "I should have 2 open text areas to
// indicate events for each day." That shipped as two rows of inline textareas.
//
// The owner's Aug-26 rework grew it into a real surface: a day event can now be
// TAGGED (off day / no-leave / work — engine/eventdefs.ts) and it can span a
// RANGE two ways — the same word repeated in each day, or one MERGED bar across
// the whole span. The tag never shows as words (typing "PH" reads "PH", never
// "PH (off)"); it surfaces only as colour — the word goes red for a work
// commitment, and the whole day column takes a light-green (off) or orange
// (no-leave) band, painted by Matrix, not here.
//
// Editing moved OUT of the cell and into a sheet (the owner: "click on the
// event and an edit button is at the top"). So an admin now TAPS a cell to open
// the Event sheet — which carries the range, the merge/repeat choice, the tag,
// and the type library — rather than typing inline. A member still only reads.

import type { ReactNode } from 'react'
import { bandAt, classifyEvent, dayEvent, type DayInfo, type EventBand, type EventDef } from '../engine'

/** How many characters a day column widens to before the text wraps. In `ch`,
 *  the width of a character in the cell's own font — the unit the row height is
 *  also derived from, so the two cannot disagree. */
const CEILING = 22

export function EventRows({
  days,
  bands,
  defs,
  rows,
  editable,
  onEdit,
}: {
  days: DayInfo[]
  bands: EventBand[]
  defs: EventDef[]
  /** How many event rows to draw — two by default, more once an admin adds
   *  them (store's `eventRows`, owner 18 Aug 26). */
  rows: number
  editable: boolean
  /** Open the Event sheet for one line + day. Only wired when `editable`. */
  onEdit: (line: number, date: string) => void
}) {
  return (
    <tbody className="events">
      {Array.from({ length: rows }, (_, line) => {
        const cells: ReactNode[] = []
        for (let i = 0; i < days.length; i++) {
          const d = days[i]!
          const band = bandAt(bands, line, d.date)

          // A MERGED band: one spanning cell at its first day, then every day
          // it covers is skipped so the colspan owns those column slots.
          if (band) {
            if (band.from === d.date) {
              let span = 1
              while (i + span < days.length && days[i + span]!.date <= band.to) span++
              const work = classifyEvent(defs, band.text) === 'work'
              cells.push(
                <td
                  key={d.date}
                  colSpan={span}
                  className={`ev band has${work ? ' work' : ''}${editable ? ' editable' : ''}`}
                  data-testid={`event-band-${line}-${band.from}`}
                  onClick={editable ? () => onEdit(line, d.date) : undefined}
                >
                  {band.text}
                </td>,
              )
              i += span - 1
            }
            continue
          }

          // A plain per-day cell. Widens to fit the text up to the ceiling,
          // then the CSS wraps it — the owner's "widen then wrap" rule. An
          // empty admin cell shows a faint add hint so there is something to
          // tap; a member's empty cell is blank.
          const text = dayEvent(d, line)
          const work = classifyEvent(defs, text) === 'work'
          cells.push(
            <td
              key={d.date}
              className={`ev${text ? ' has' : ''}${work ? ' work' : ''}${editable ? ' editable' : ''}`}
              data-testid={`event-${line}-${d.date}`}
              onClick={editable ? () => onEdit(line, d.date) : undefined}
              style={{ minWidth: `${Math.min(Math.max(text.length, 1), CEILING)}ch` }}
            >
              {text || (editable ? <span className="evadd" aria-hidden="true">＋</span> : null)}
            </td>,
          )
        }
        return (
          <tr key={line} data-testid={`event-row-${line}`}>
            <td className="who">Event {line + 1}</td>
            {/* The count rows' blank balance cell: a day's event has no
                balance, and the cell holds the frozen column. */}
            <td className="bal" />
            {cells}
          </tr>
        )
      })}
    </tbody>
  )
}
