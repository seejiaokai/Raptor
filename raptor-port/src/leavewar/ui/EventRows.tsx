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
//
// THE GRID PRINTS A SHORT FORM (the Inputs / SANS redesign, plan §3.12; owner D643, D644, 8 Oct 26). The 10 Aug rule
// was "widen the day to fit the text, then wrap" — and measured on a phone, "No Leave" took its day from about 20 px
// to 33 px and made the Event row two lines tall. So a day cell now prints `shortOf(…)` (engine/eventdefs.ts): the
// event's own short form, else its preset's, else one derived from its name — never more than three characters, so no
// event widens a day. A merged band has the room of the days it spans, and prints its full text where that is enough.
// The full name is one tap away, for EVERYONE: a tap on a FILLED cell asks Matrix for the small box (`onPeek`), which
// for an admin carries "Edit"; an EMPTY cell still opens the sheet at once for an admin (`onEdit`).

import type { ReactNode, RefCallback } from 'react'
import { bandAt, classifyEvent, dayEvent, dayEventKind, dayEventShort, shortOf, type DayInfo, type EventBand, type EventDef } from '../engine'

/** About how many characters of a band's text one spanned day has room for. A band whose text is longer than its span
 *  allows prints its short form instead — the bar must never be what widens its days. */
const BAND_CH_PER_DAY = 3

export function EventRows({
  days,
  bands,
  defs,
  rows,
  editable,
  onEdit,
  onPeek,
  padL,
  padR,
  phL,
  phR,
  children,
}: {
  /** Rows drawn in this same block, straight after the Event rows — the four Required / Available rows
   *  (FlyRows.tsx; the Inputs / SANS redesign, plan §3.3). They follow the same row contract. */
  children?: ReactNode
  days: DayInfo[]
  bands: EventBand[]
  defs: EventDef[]
  /** How many event rows to draw — two by default, more once an admin adds
   *  them (store's `eventRows`, owner 18 Aug 26). */
  rows: number
  editable: boolean
  /** Open the Event sheet for one line + day. Only wired when `editable`: an EMPTY cell, and the blocked-reason bar. */
  onEdit: (line: number, date: string) => void
  /** A tap on a FILLED cell or band, anyone's: open the small box with its full name, kind and dates under `el`. */
  onPeek: (line: number, date: string, el: HTMLElement) => void
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
            // `days` may be a WINDOW of the war (Matrix's column window, 3 Sep
            // 26): a band that began before the first drawn day is emitted
            // from that first day, spanning what remains of it, so the row
            // keeps its cell count and the band still reads across the seam.
            if (band.from === d.date || i === 0) {
              let span = 1
              while (i + span < days.length && days[i + span]!.date <= band.to) span++
              // The band's own tag first (per-event tags, 18 Aug 26), then
              // the library word match — same precedence the column tint uses.
              const work = (band.kind ?? classifyEvent(defs, band.text)) === 'work'
              /* its full text where the bar is wide enough, else its short form (the plan §3.12) */
              const fits = band.text.length <= span * BAND_CH_PER_DAY
              cells.push(
                <td
                  key={d.date}
                  colSpan={span}
                  className={`ev band has tap${work ? ' work' : ''}${editable ? ' editable' : ''}`}
                  data-testid={`event-band-${line}-${band.from}`}
                  title={band.text}
                  aria-label={band.text}
                  onClick={e => onPeek(line, d.date, e.currentTarget)}
                >
                  {fits ? band.text : shortOf(defs, band.text, band.short)}
                </td>,
              )
              i += span - 1
            }
            continue
          }

          // A plain per-day cell. It prints the event's SHORT FORM and takes its
          // width from that — one to three characters, so no event widens its day
          // (the plan §3.12; the 10 Aug "widen then wrap" rule is what this
          // replaces). An empty admin cell shows a faint add hint so there is
          // something to tap; a member's empty cell is blank.
          const text = dayEvent(d, line)
          const short = shortOf(defs, text, dayEventShort(d, line))

          // A BLOCKED day's reason, printed on the first event line (owner,
          // 18 Aug 26 — "it should show exercise on the event"). The amber
          // header said leave was discouraged but nothing on a phone said WHY
          // (the reason lived in a hover title, and phones have no hover). A
          // run of consecutive blocked days with nothing real on this line
          // merges into one spanning cell, the same shape a merged band has,
          // so "Exercise week" reads once across the week rather than six
          // times. A day that gains a real event or band breaks the run —
          // the typed word wins the cell, and the header still carries the
          // amber. Tapping it (admin) opens the sheet on the run's first day.
          if (line === 0 && !text && d.blocked && d.blockedReason) {
            let span = 1
            while (i + span < days.length) {
              const n = days[i + span]!
              if (!n.blocked || n.blockedReason !== d.blockedReason) break
              if (dayEvent(n, line) || bandAt(bands, line, n.date)) break
              span++
            }
            cells.push(
              <td
                key={d.date}
                colSpan={span}
                className={`ev band blk${editable ? ' editable' : ''}`}
                data-testid={`event-blocked-${d.date}`}
                onClick={editable ? () => onEdit(line, d.date) : undefined}
              >
                {d.blockedReason}
              </td>,
            )
            i += span - 1
            continue
          }
          const work = (dayEventKind(d, line) ?? classifyEvent(defs, text)) === 'work'
          cells.push(
            <td
              key={d.date}
              className={`ev${text ? ' has tap' : ''}${work ? ' work' : ''}${editable ? ' editable' : ''}`}
              data-testid={`event-${line}-${d.date}`}
              /* the full name, for a hover and for a screen reader — the cell itself prints only the short form */
              title={text || undefined}
              aria-label={text ? `${text} (${short})` : undefined}
              /* FILLED: the box, for everyone. EMPTY: the sheet at once, for an admin. */
              onClick={text ? e => onPeek(line, d.date, e.currentTarget) : editable ? () => onEdit(line, d.date) : undefined}
              style={{ minWidth: `${Math.max(short.length, 1)}ch` }}
            >
              {short || (editable ? <span className="evadd" aria-hidden="true">＋</span> : null)}
            </td>,
          )
        }
        return (
          <tr key={line} data-testid={`event-row-${line}`}>
            <td className="who">Event {line + 1}</td>
            {/* The count rows' blank balance cell: a day's event has no
                balance, and the cell holds the frozen column. */}
            <td className="bal" />
            {padL && <td className="lwph lwph-l" ref={phL} />}
            {cells}
            {padR && <td className="lwph lwph-r" ref={phR} />}
          </tr>
        )
      })}
      {children}
    </tbody>
  )
}
