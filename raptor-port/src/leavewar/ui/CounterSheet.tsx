// Choosing — and ordering — what the frozen column shows.
//
// The column header used to carry two 13px arrows, and the owner's verdict
// from a phone was that they are too small to hit. They were: a glyph inside
// a 44px column is not a tap target, and no amount of padding makes it one
// without eating the column it sits in.
//
// So the choice moves out of the column entirely, into the sheet idiom every
// other decision in this app already uses — full-width rows, each naming a
// figure and showing the squadron-wide total. This sheet is ALSO the legend
// the owner asked for: each row carries what it means (a `CON` figure's days,
// a `BAL` figure's balance) and an aggregate carries what it is made of —
// MED USED reads "= ATT C + HL + OML", LVE USED its seven codes. And it is where
// the figures are REORDERED: the ▲▼ on each row move it, persisted, so the
// column cycles in the squadron's own preferred order.

import { figureParts, orderedFigures, type Figure, type Person } from '../engine'
import { getState, moveFigure, resetFigureOrder } from '../state/store'
import { Sheet } from './Sheet'
import './bidpicker.css'

/** Rounds for display only, the same rule the grid and the count rows use. */
const show = (n: number) => String(Math.round(n * 10) / 10)

export function CounterSheet({
  shownId,
  onPick,
  onClose,
}: {
  shownId: string
  onPick: (id: string) => void
  onClose: () => void
}) {
  const { people, openings, ledger, wars, figureOrder } = getState()
  const figures = orderedFigures(figureOrder)
  const ctx = { openings, ledger, sources: wars }

  return (
    <Sheet testid="counter-sheet" label="Which figure" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">WHAT THIS COLUMN SHOWS</span>
        <span className="dt">tap to show it beside every callsign · ▲▼ to reorder</span>
        <button className="x" data-testid="counter-cancel" onClick={onClose} aria-label="Cancel">
          ✕
        </button>
      </div>
      {/* The suffix key, stated once. `USED` = what has been taken, `BAL` =
          what is left — the owner's own shorthand, and the one thing a reader
          needs to know to trust every number below. */}
      <div className="clegend" data-testid="counter-legend">
        <b>USED</b> = days taken · <b>BAL</b> = balance left
      </div>
      <div className="clist">
        {figures.map((f, i) => {
          // The squadron's total, not one person's: this sheet is opened from
          // a column header, which belongs to everybody. A `CON` figure sums
          // days taken; a `BAL` figure sums what is left — `f.value` already
          // knows which, so one line covers both.
          const total = people.reduce((sum, p) => sum + f.value(ctx, p.id), 0)
          const caption = f.legend ? `= ${f.legend}` : f.desc
          const totalNote = f.kind === 'bal' ? 'left, squadron-wide' : 'taken, squadron-wide'
          return (
            <div
              key={f.id}
              className={`crow-wrap${f.id === shownId ? ' on' : ''}`}
              data-testid={`figrow-${f.id}`}
            >
              <button
                className="crow"
                data-testid={`counter-${f.id}`}
                aria-pressed={f.id === shownId}
                onClick={() => { onPick(f.id); onClose() }}
              >
                <span className="crow-top">
                  <span className="cn">{f.label}</span>
                  <span className={`ct${total < 0 ? ' neg' : ''}`}>{show(total)} {totalNote}</span>
                </span>
                {/* Its own full-width line so an aggregate's composition — the
                    legend the owner wanted — is never truncated on a phone. */}
                <span className="csub" data-testid={`figsub-${f.id}`}>{caption}</span>
              </button>
              {/* Their own hit target, outside the select button — a button
                  cannot nest a button, and tapping ▲ must reorder, not select. */}
              <span className="cmove">
                <button
                  className="cmv"
                  data-testid={`figup-${f.id}`}
                  disabled={i === 0}
                  aria-label={`Move ${f.label} up`}
                  onClick={() => moveFigure(f.id, -1)}
                >
                  ▲
                </button>
                <button
                  className="cmv"
                  data-testid={`figdown-${f.id}`}
                  disabled={i === figures.length - 1}
                  aria-label={`Move ${f.label} down`}
                  onClick={() => moveFigure(f.id, 1)}
                >
                  ▼
                </button>
              </span>
            </div>
          )
        })}
      </div>
      <div className="cfoot">
        <button className="creset" data-testid="counter-reset" onClick={() => resetFigureOrder()}>
          Reset order
        </button>
      </div>
    </Sheet>
  )
}

/**
 * One person's number, opened out — the sheet a tap on a counter CELL opens
 * (the header still opens the picker above; the cell is the person's own
 * figure, so it answers for that person). The owner's ask, 17 Aug 26: "when
 * I click on the individual personnel counter, I should be able to see the
 * breakdown" — MED USED opens as its ATT C / HL / OML rows, LVE USED as its
 * seven codes, a balance as opening + granted (+ earned) − taken, and a
 * single-code figure simply restates itself, so every figure answers rather
 * than only the aggregates.
 *
 * Zero rows are kept, not hidden: "ATT C 0" says something true — that none
 * of this person's medical days were ATT C — and a breakdown with vanishing
 * rows would make the three-line shape read differently person to person.
 */
export function FigureBreakdownSheet({
  figure,
  person,
  onClose,
}: {
  figure: Figure
  person: Person
  onClose: () => void
}) {
  const { openings, ledger, wars } = getState()
  const ctx = { openings, ledger, sources: wars }
  const parts = figureParts(figure, ctx, person.id)
  const total = figure.value(ctx, person.id)

  return (
    <Sheet testid="figure-breakdown" label={`${figure.label} breakdown`} onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{person.callsign}</span>
        <span className="dt">{figure.label}</span>
        <span className="cur">{figure.kind === 'bal' ? 'balance left' : 'days taken'}</span>
        <button className="x" data-testid="breakdown-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="clist">
        {parts.map(p => (
          <div key={p.label} className="crow-wrap" data-testid={`part-${p.label}`}>
            <span className="crow bdrow">
              <span className="crow-top">
                <span className="cn">{p.label}</span>
                {/* Signed as computed — a balance's "taken −3" reads as the
                    subtraction it is, so the rows visibly sum to the total. */}
                <span className={`ct${p.value < 0 ? ' neg' : ''}`}>{show(p.value)}</span>
              </span>
            </span>
          </div>
        ))}
        <div className="crow-wrap bdtotal" data-testid="breakdown-total">
          <span className="crow bdrow">
            <span className="crow-top">
              <span className="cn">Total</span>
              <span className={`ct${total < 0 ? ' neg' : ''}`}>{show(total)}</span>
            </span>
          </span>
        </div>
      </div>
    </Sheet>
  )
}
