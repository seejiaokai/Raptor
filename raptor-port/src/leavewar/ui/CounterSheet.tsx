// Choosing — and ordering — what the frozen column shows.
//
// The column header used to carry two 13px arrows, and the owner's verdict
// from a phone was that they are too small to hit. They were: a glyph inside
// a 44px column is not a tap target, and no amount of padding makes it one
// without eating the column it sits in.
//
// So the choice moves out of the column entirely, into the sheet idiom every
// other decision in this app already uses — full-width rows, each naming a
// figure and previewing the VIEWING person's number (a dash where nobody is
// being viewed — owner, 18 Aug 26, no squadron-wide total). This sheet is ALSO the legend
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
  const { people, openings, ledger, wars, figureOrder, role, viewer } = getState()
  const figures = orderedFigures(figureOrder)
  const ctx = { openings, ledger, sources: wars }
  // The person LOOKING at the page, when the roster holds them — each row
  // then answers with THEIR number (owner, 17 Aug 26: the title tap should
  // show "what was used or balance of that individual"), because "how much
  // do I have left" is the question a person opens this sheet holding. The
  // viewer is Raptor's own "view as", which defaults to the account's person,
  // so a row is personal to whoever is being viewed. When NOBODY is (an admin
  // with no view-as, or a viewer the roster does not hold) the row shows a
  // dash — NOT a squadron-wide sum (owner, 18 Aug 26: "I don't need to see
  // totals when no one is picked… it defaults to the account viewer"). The
  // number is meant to answer "how much do I have left", which has no meaning
  // without a person.
  const me = viewer ? people.find(p => p.id === viewer) ?? null : null
  // The ARRANGEMENT is management's (owner, same day) — the ▲▼ and Reset
  // render for an admin only; the store refuses a member's write anyway.
  const arranging = role === 'admin'

  return (
    <Sheet testid="counter-sheet" label="Which figure" onClose={onClose} narrow>
      <div className="bidsheet-hd">
        {/* Lead with WHOSE numbers these are (owner, 28 Aug 26 — "make it
            obvious that im viewing as for example RANGER"). The counter column
            answers for the viewing person, and a grey aside said so too
            quietly; the viewer is now the headline, accented so it reads at a
            glance. When nobody is being viewed the sheet falls back to naming
            its own job. */}
        <span className="who" data-testid="counter-viewer">
          {me ? <>VIEWING AS <b className="vwname">{me.callsign}</b></> : 'WHAT THIS COLUMN SHOWS'}
        </span>
        <span className="dt">
          {me ? 'your numbers' : 'view a callsign to see numbers'}
          {arranging ? ' · tap a figure · ▲▼ to reorder' : ' · tap a figure to show it in the column'}
        </span>
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
          // The viewer's own figure where the roster knows who is looking (the
          // common case since the View-as mirror). Where nobody is being viewed
          // the row shows a dash rather than a squadron-wide sum (owner, 18 Aug
          // 26): the number answers "how much do I have left", which has no
          // meaning without a person — and a squadron total here only invited
          // the aircrew/ground-crew mixing the owner did not want either.
          const val = me ? f.value(ctx, me.id) : null
          // Only the aggregates carry a caption now (their composition — the
          // legend the owner asked for). The generic "days taken" / "balance
          // available to take" line was the same words as the top USED/BAL
          // key on every simple row, pure height for no information — dropped
          // to compress the sheet (owner, 28 Aug 26 — "compress the data").
          const caption = f.legend ? `= ${f.legend}` : null
          // "yours" is gone from every row — the VIEWING AS header now says
          // whose numbers these are, once, instead of twelve times.
          const totalNote = f.kind === 'bal' ? 'left' : 'taken'
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
                  <span className={`ct${val != null && val < 0 ? ' neg' : ''}`}>{val == null ? '—' : `${show(val)} ${totalNote}`}</span>
                </span>
                {/* Its own full-width line so an aggregate's composition — the
                    legend the owner wanted — is never truncated on a phone.
                    Only aggregates have one now (simple rows dropped the
                    redundant caption, 28 Aug 26). */}
                {caption && <span className="csub" data-testid={`figsub-${f.id}`}>{caption}</span>}
              </button>
              {/* Their own hit target, outside the select button — a button
                  cannot nest a button, and tapping ▲ must reorder, not
                  select. Admin only: the arrangement is management's
                  (owner, 17 Aug 26), and a member's tap would be refused by
                  the store anyway — a control that does nothing is worse
                  than no control. */}
              {arranging && (
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
              )}
            </div>
          )
        })}
      </div>
      {arranging && (
        <div className="cfoot">
          <button className="creset" data-testid="counter-reset" onClick={() => resetFigureOrder()}>
            Reset order
          </button>
        </div>
      )}
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
    <Sheet testid="figure-breakdown" label={`${figure.label} breakdown`} onClose={onClose} narrow>
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

/**
 * EVERY figure for ONE person — the sheet a tap on any CALLSIGN opens, for
 * everyone (owner, 17 Aug 26: "everyone should be able to click on that
 * person's name and see these logics"). Where the column shows one figure at
 * a time and the breakdown sheet opens one figure's parts, this is the whole
 * picture: each of the twelve figures with this person's own number. Tapping
 * a row opens that figure's parts breakdown for this person, so the two
 * sheets chain into the full story. An admin also gets the Edit person
 * button here — the callsign tap used to be the edit shortcut for them, and
 * the edit surface must not become unreachable because the tap now informs.
 */
export function PersonFiguresSheet({
  person,
  onOpenFigure,
  onEdit,
  onClose,
}: {
  person: Person
  onOpenFigure: (figureId: string) => void
  /** Present for an admin only — opens the person EDITOR (PersonSheet). */
  onEdit?: () => void
  onClose: () => void
}) {
  const { openings, ledger, wars, figureOrder } = getState()
  const figures = orderedFigures(figureOrder)
  const ctx = { openings, ledger, sources: wars }

  return (
    <Sheet testid="person-figures" label={`${person.callsign}'s figures`} onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{person.callsign}</span>
        <span className="dt">every figure · tap one for its breakdown</span>
        <button className="x" data-testid="pfig-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="clegend">
        <b>USED</b> = days taken · <b>BAL</b> = balance left
      </div>
      <div className="clist">
        {figures.map(f => {
          const v = f.value(ctx, person.id)
          return (
            <div key={f.id} className="crow-wrap" data-testid={`pfig-${f.id}`}>
              <button className="crow" onClick={() => onOpenFigure(f.id)}>
                <span className="crow-top">
                  <span className="cn">{f.label}</span>
                  <span className={`ct${v < 0 ? ' neg' : ''}`}>{show(v)} {f.kind === 'bal' ? 'left' : 'taken'}</span>
                </span>
                <span className="csub">{f.legend ? `= ${f.legend}` : f.desc}</span>
              </button>
            </div>
          )
        })}
      </div>
      {onEdit && (
        <div className="cfoot">
          <button className="creset" data-testid="person-edit" onClick={onEdit}>
            Edit person
          </button>
        </div>
      )}
    </Sheet>
  )
}
