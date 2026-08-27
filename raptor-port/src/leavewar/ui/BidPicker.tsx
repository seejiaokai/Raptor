// Placing a bid is two questions, not one: WHICH leave, and HOW MUCH of the
// day. That is the shape of the squadron's own notation — `OIL` a whole day,
// `*OIL` a morning, `OIL*` an afternoon — and offering a flat list of codes
// instead would put the portion back inside the code name, which is the
// thing the leave-code rework existed to end.
//
// It renders as a sheet anchored to the bottom of the viewport rather than a
// popover inside the cell. The matrix scrolls inside `.mx-wrap`, and anything
// absolutely positioned in a cell is clipped by that scroller; a sheet is
// also the shape that works on a phone, where a 30px-wide column has nowhere
// to put a menu.
//
// There is no login, so a bid is placed against whichever row was clicked
// rather than against a signed-in person — see `docs/known-gaps.md`.

import { useState } from 'react'
import { addDays, displayCell, formatCell, LEAVE_TYPES, MEDICAL_TYPES, type BidState, type CounterName, type Portion } from '../engine'
import { setBidState, setCell, setCellRange, shiftBid } from '../state/store'
import { RangePicker, type Range } from './RangePicker'
import { Sheet } from './Sheet'
import { shortSpan } from './dates'
import './bidpicker.css'

const PORTIONS: { portion: Portion; label: string; testid: string }[] = [
  { portion: 'full', label: 'Whole day', testid: 'portion-full' },
  { portion: 'am', label: 'Morning', testid: 'portion-am' },
  { portion: 'pm', label: 'Afternoon', testid: 'portion-pm' },
]

export function BidPicker({
  callsign,
  personId,
  date,
  current,
  dates,
  medical,
  onWrote,
  wouldLeave,
  onPostOut,
  onClose,
}: {
  callsign: string
  personId: string
  date: string
  current: string
  /** Whether the sheet also offers the four medical markers. Medical is
   *  assigned, not bid — management marks it (or it arrives from a Raptor
   *  input) — so the matrix passes `true` for an admin only; a member never
   *  sees the row and files theirs on Raptor's Inputs page instead. */
  medical?: boolean
  /** Every date in the war, used only for the range picker's bounds so a
   *  fortnight cannot run off the end of the sheet it belongs to. */
  dates: string[]
  /** Told what was written, so the counter column can follow the leave just
   *  entered. Reported rather than set here: the selection belongs to the
   *  matrix, which is the only thing that can keep every row in step. */
  onWrote?: (code: string) => void
  /** What the balance would read after this write, or `null` for leave that
   *  spends nothing. Supplied by the matrix, where the wars, openings and
   *  ledger already are. */
  wouldLeave?: (code: string, days: number) => { counter: CounterName; after: number } | null
  /** Admin-only: post this person OUT (owner, 18 Aug 26; reworked 19 Aug 26
   *  — any date, not just the tapped day, and the "Archive on PO date"
   *  switch). Present only for an admin; the matrix wires it to the store and
   *  closes the sheet. A member never sees the control. */
  onPostOut?: (fromDate: string, archive: boolean) => void
  onClose: () => void
}) {
  // Deliberately not seeded from `current`: the portion resets to a whole
  // day for every cell opened. A picker that remembered the last choice
  // would silently write a half day on the next cell the bidder touched.
  const [portion, setPortion] = useState<Portion>('full')
  // The range, if the bidder has asked for one. `null` means this one day —
  // the common case, and the one that must stay a single tap.
  const [range, setRange] = useState<Range | null>(null)
  const [showCal, setShowCal] = useState(false)
  const [note, setNote] = useState('')
  // Which code the sheet has warned about. A second tap on the SAME leave is
  // the confirmation — a separate "are you sure" button would be a second
  // control to find on a phone, and tapping the thing you already meant to
  // tap is the least surprising way to say yes.
  const [confirming, setConfirming] = useState<string | null>(null)
  // The post-out controls, folded behind the one PO button until the admin
  // asks (owner, 19 Aug 26 — "show this toggle when the admin clicks PO"):
  // the date (seeded with the tapped day, but ANY date is legal — past,
  // future, outside the war), the archive switch (ON by default), and the
  // confirm. Folding also stops a reflex tap posting someone out.
  const [poOpen, setPoOpen] = useState(false)
  const [poDate, setPoDate] = useState(date)
  const [poArchive, setPoArchive] = useState(true)

  /** Days this write covers — one, or the span if a range is chosen. */
  const dayCount = () => {
    if (!range) return 1
    let n = 0
    for (let d = range.from; d <= range.to; d = addDays(d, 1)) n++
    return n
  }

  const write = (code: string) => {
    // Ask before taking someone below zero. Never REFUSE: the squadron's own
    // workbook runs negative and the owner was explicit that it must stay
    // possible — annual at −14, OIL at −5.5. What was wrong was doing it
    // silently, so this is a confirmation, not a rule.
    const after = code && wouldLeave ? wouldLeave(code, dayCount()) : null
    if (after && after.after < 0 && confirming !== code) {
      setConfirming(code)
      return setNote(
        `That takes ${callsign} to ${after.after} ${after.counter.toUpperCase()}. ` +
        'Tap the same leave again to go ahead.',
      )
    }
    setConfirming(null)

    if (!range) {
      setCell(personId, date, code)
      onWrote?.(code)
      return onClose()
    }
    // A range that crosses a locked day, a Raptor cell or a posting-out date
    // writes what it may and says what it did not. Refusing the whole range
    // would make a fortnight that happens to include one such day impossible
    // to ask for at all.
    const { written, skipped } = setCellRange(personId, range.from, range.to, code)
    if (written > 0) onWrote?.(code)
    if (skipped === 0) return onClose()
    setNote(
      written === 0
        ? 'None of those days could be written — they are locked, owned by Raptor, or outside your time in the squadron.'
        : `${written} day${written === 1 ? '' : 's'} written. ${skipped} skipped — locked, owned by Raptor, or outside your time in the squadron.`,
    )
  }

  return (
    <Sheet testid="bid-picker" label="Place a bid" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{callsign}</span>
        <span className="dt">{date}</span>
        {current && <span className="cur">now {current}</span>}
        <button className="x" data-testid="bid-cancel" onClick={onClose} aria-label="Cancel">
          ✕
        </button>
      </div>

      {/* How many DAYS, before how much of one. The owner's ask: a fortnight
          of leave should be one selection, not fourteen taps on fourteen
          cells. "Just this day" stays the default and stays a single tap —
          the range is the exception, so it costs the extra tap. */}
      <div className="bidsheet-row">
        <span className="lab">How many</span>
        <button
          data-testid="span-one"
          className={`pchip${range ? '' : ' on'}`}
          aria-pressed={!range}
          onClick={() => { setRange(null); setShowCal(false); setNote('') }}
        >
          Just this day
        </button>
        <button
          data-testid="span-range"
          className={`pchip${range ? ' on' : ''}`}
          aria-pressed={!!range}
          // Seeded with the day already tapped, so the calendar opens on the
          // right month AND the very next tap completes the span. The bidder
          // chose their start by opening this cell; asking for it again would
          // be the extra work this control exists to remove.
          onClick={() => { setShowCal(true); setRange(r => r ?? { from: date, to: date }); setNote('') }}
        >
          {range ? shortSpan(range.from, range.to) : 'Pick a range'}
        </button>
      </div>

      {showCal && (
        <div className="bidsheet-row">
          {/* Bounded by the war, so a range cannot run off the end of the
              sheet it belongs to. Opens on the day that was tapped, which is
              the start the bidder already chose by opening this cell. */}
          <RangePicker
            testid="span"
            min={dates[0]}
            max={dates[dates.length - 1]}
            value={range}
            onChange={r => { setRange(r); setNote('') }}
          />
        </div>
      )}

      <div className="bidsheet-row">
        <span className="lab">How much</span>
        {PORTIONS.map(p => (
          <button
            key={p.portion}
            data-testid={p.testid}
            className={`pchip${portion === p.portion ? ' on' : ''}`}
            aria-pressed={portion === p.portion}
            onClick={() => setPortion(p.portion)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="bidsheet-row">
        <span className="lab">Which leave</span>
        {/* Straight off the catalogue, so the eight types stay defined in one
            place. Duty, medical and courses are absent by construction —
            they are not leave types, and offering them here would invite a
            scheduler's data to be typed in as if it were a bid. */}
        {LEAVE_TYPES.map(t => (
          <button
            key={t.type}
            data-testid={`bid-${t.type}`}
            className="tchip"
            title={t.label}
            onClick={() => write(formatCell({ type: t.type, portion }))}
          >
            {formatCell({ type: t.type, portion })}
          </button>
        ))}
        <button className="tchip clear" data-testid="bid-clear" onClick={() => write('')}>
          Clear
        </button>
        {note && <span className="note warn" data-testid="span-note">{note}</span>}
      </div>

      {/* The medical markers, for management only (owner, 17 Aug 26: "for
          the leave war grids u can indicate, B (att b), C (att c), OML,
          HL"). They ride the SAME portion and range controls as leave — a
          whole day is the default, AM/PM the halves — and spend nothing, so
          the negative-balance confirm above never fires for them. Normally
          the record arrives from Raptor's Inputs page and lands read-only;
          this row is the direct path for the admin who is told first. */}
      {medical && (
        <div className="bidsheet-row">
          <span className="lab">Medical</span>
          {MEDICAL_TYPES.map(t => (
            <button
              key={t.type}
              data-testid={`bid-${t.type}`}
              className="tchip med"
              title={t.label}
              onClick={() => write(formatCell({ type: t.type, portion }))}
            >
              {displayCell(formatCell({ type: t.type, portion }))}
            </button>
          ))}
        </div>
      )}

      {/* Post the person OUT (owner, 18 Aug 26; any date + the archive switch
          19 Aug 26). A management action, not a bid — it takes them off the
          manpower from the chosen date and greys their boxes; it is undone by
          tapping a greyed day. Set apart below the bid controls, and folded
          behind one button, so it cannot be hit by reflex. */}
      {onPostOut && !poOpen && (
        <div className="bidsheet-row postout">
          <button className="dchip po" data-testid="bid-postout" onClick={() => setPoOpen(true)}>
            Post out (PO)…
          </button>
        </div>
      )}
      {onPostOut && poOpen && (
        <>
          <div className="bidsheet-row postout">
            <span className="lab">PO from</span>
            {/* Deliberately unbounded — no min/max. A posting can predate the
                war (strike their whole history from a past date) or land past
                its end; the store takes any real date (owner, 19 Aug 26 —
                "prior to this date to infinity… now till the future
                infinity"). Native picker: a single date, not a range, and the
                keyboard path is what reaches a year the calendar UI would
                take twelve taps to walk to. */}
            <input
              type="date"
              className="dateinput"
              data-testid="po-date"
              aria-label={`Post ${callsign} out from`}
              value={poDate}
              onChange={e => setPoDate(e.target.value)}
            />
            <button
              className={`pchip${poArchive ? ' on' : ''}`}
              data-testid="po-archive"
              aria-pressed={poArchive}
              title={poArchive
                ? 'On the PO date they move to the Quals archive. Their pucks on past schedules are untouched.'
                : 'They stay on the Quals roster after the PO date — for the custom cases.'}
              onClick={() => setPoArchive(a => !a)}
            >
              {poArchive ? '✓ ' : ''}Archive on PO date
            </button>
          </div>
          <div className="bidsheet-row postout">
            <button
              className="dchip po"
              data-testid="po-confirm"
              disabled={!poDate}
              onClick={() => onPostOut(poDate, poArchive)}
            >
              Post out from {poDate || '…'}
            </button>
            <span className="note">
              Off the manpower from that day on. Past schedules keep their pucks.
            </span>
          </div>
        </>
      )}
    </Sheet>
  )
}

/**
 * Approve or refuse a bid, once bidding has closed.
 *
 * Deliberately NOT role-gated: this prototype has no login, so anyone can
 * decide anything. That is a consequence of deferring accounts to the
 * backend, recorded in `docs/known-gaps.md` — it is not a security model and
 * must not be presented as one.
 *
 * Reuses the bid sheet's shell so a decision and a bid read as the same
 * object in the same place, rather than as two unrelated surfaces.
 */
export function DecisionSheet({
  callsign,
  personId,
  date,
  code,
  state,
  movedFrom,
  dates,
  onClose,
}: {
  callsign: string
  personId: string
  date: string
  code: string
  state: BidState | undefined
  /** Set when this bid has already been moved once; the date it came from. */
  movedFrom?: string
  /** Every date in the period, used only for the move field's bounds so a
   *  bid cannot be moved outside the war it belongs to. */
  dates: string[]
  onClose: () => void
}) {
  const [to, setTo] = useState('')
  // A refused move has to say WHY, or the button reads as broken. The store
  // returns the reason; this turns it into the sentence management needs.
  const [problem, setProblem] = useState('')

  const decide = (bid: BidState) => {
    setBidState(personId, date, bid)
    onClose()
  }

  const move = () => {
    if (!to) return
    const result = shiftBid(personId, date, to)
    if (result === 'shifted') return onClose()
    setProblem(
      result === 'occupied'
        ? `${to} already has something booked — clear it first.`
        : result === 'raptor'
          ? 'Raptor owns this cell; move it there instead.'
          : 'There is no bid here to move.',
    )
  }

  return (
    <Sheet testid="bid-picker" label="Decide a bid" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{callsign}</span>
        <span className="dt">{date}</span>
        <span className="cur">
          {code}{state ? ` · ${state}` : ''}{movedFrom ? ` · moved from ${movedFrom}` : ''}
        </span>
        <button className="x" data-testid="bid-cancel" onClick={onClose} aria-label="Cancel">
          ✕
        </button>
      </div>
      <div className="bidsheet-row">
        <span className="lab">Decision</span>
        {/* All three stay enabled on an already-decided bid. Management is
            meant to try one and watch the count rows move, and a decision
            that could not be changed back would make that a one-way door. */}
        {/* Acknowledging is NOT a decision, and that is why it is here rather
            than left implicit. It says "seen, not yet answered" — the state
            between a bid arriving and a verdict — and it is what turns the
            cell purple. Before it existed a bid was purple from the moment it
            was typed, so the squadron could not tell an untouched input from
            one already in hand. */}
        {/* The visible word is "Pending" (owner, 27 Aug 26) — the same word the
            grid legend already gives this purple state, so the two now agree.
            The STATE TOKEN stays 'acknowledged' (persisted in BID_STATES), only
            the label changed; testid stays decide-ack. */}
        <button
          className="dchip ack"
          data-testid="decide-ack"
          aria-pressed={state === 'acknowledged'}
          title="Seen, not yet decided"
          onClick={() => decide('acknowledged')}
        >
          Pending
        </button>
        <button
          className="dchip approve"
          data-testid="decide-approve"
          aria-pressed={state === 'approved'}
          onClick={() => decide('approved')}
        >
          Approve
        </button>
        <button
          className="dchip refuse"
          data-testid="decide-refuse"
          aria-pressed={state === 'refused'}
          onClick={() => decide('refused')}
        >
          Refuse
        </button>
      </div>

      {/* Moving a bid is what management does instead of refusing when a week
          goes red and refusing outright is too blunt. It lands PENDING and
          they approve it afterwards on the new date — a move is a proposal
          with a trail, not a silent re-approval. */}
      <div className="bidsheet-row">
        <span className="lab">Move to</span>
        <input
          type="date"
          className="dateinput"
          data-testid="shift-date"
          value={to}
          min={dates[0]}
          max={dates[dates.length - 1]}
          onChange={e => { setTo(e.target.value); setProblem('') }}
        />
        <button className="dchip move" data-testid="decide-shift" disabled={!to} onClick={move}>
          Move
        </button>
        {problem && <span className="note warn" data-testid="shift-problem">{problem}</span>}
      </div>
    </Sheet>
  )
}

/**
 * A cell Raptor owns: read-only, and it says why.
 *
 * The leave was entered in Raptor's input tab, which means the person sought
 * approval verbally and already has it. There is nothing to decide and
 * nothing to edit — the store refuses both — so this sheet offers neither.
 * Offering an action that will be silently ignored is worse than offering
 * none, which is why it is a separate sheet rather than a disabled version
 * of the other two.
 */
export function RaptorSheet({
  callsign,
  date,
  code,
  onClose,
}: {
  callsign: string
  date: string
  code: string
  onClose: () => void
}) {
  return (
    <Sheet testid="raptor-sheet" label="Leave from Raptor" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{callsign}</span>
        <span className="dt">{date}</span>
        <span className="cur">{code} · approved</span>
        <button className="x" data-testid="bid-cancel" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="bidsheet-row">
        <span className="lab">From Raptor</span>
        <span className="note" data-testid="raptor-note">
          Entered on Raptor’s input tab, so it was approved there — change it in Raptor and it
          syncs back here.
        </span>
      </div>
    </Sheet>
  )
}

/**
 * Manage a post-out (owner, 18 Aug 26; date + archive controls 19 Aug 26).
 * Opens when an admin taps a greyed, posted-out cell — the person is off the
 * manpower from their PO date, and this sheet is where that date is moved,
 * the archive switch flipped, or the whole thing undone. A member never
 * reaches it: a posted-out cell is inert for them, and the matrix only makes
 * it tappable for an admin.
 */
export function PostOutSheet({
  callsign,
  date,
  poFrom,
  archive,
  onChange,
  onUndo,
  onClose,
}: {
  callsign: string
  date: string
  /** The person's CURRENT PO date — the first day they are gone. */
  poFrom: string
  /** Whether the auto-archive switch is on for this posting. */
  archive: boolean
  /** Re-post with a new date and/or archive choice. Commits on change — the
   *  sheet stays up so the admin can see the grid move behind it. */
  onChange: (fromDate: string, archive: boolean) => void
  onUndo: () => void
  onClose: () => void
}) {
  return (
    <Sheet testid="postout-sheet" label="Posted out" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{callsign}</span>
        <span className="dt">{date}</span>
        <button className="x" data-testid="postout-cancel" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="bidsheet-row">
        <span className="note">
          Posted out from {poFrom} — off the manpower from that day on.
          {archive ? ' Moves to the Quals archive on that date.' : ' Stays on the Quals roster (custom).'}
        </span>
      </div>
      <div className="bidsheet-row postout">
        <span className="lab">PO from</span>
        {/* Unbounded like the picker's — a posting moves to any real date. An
            emptied field commits nothing: clearing a PO is the Undo button's
            job, and it should not happen by backspacing a date. */}
        <input
          type="date"
          className="dateinput"
          data-testid="postout-date"
          aria-label={`Move ${callsign}'s post-out date`}
          value={poFrom}
          onChange={e => { if (e.target.value) onChange(e.target.value, archive) }}
        />
        <button
          className={`pchip${archive ? ' on' : ''}`}
          data-testid="postout-archive"
          aria-pressed={archive}
          title={archive
            ? 'On the PO date they move to the Quals archive. Their pucks on past schedules are untouched.'
            : 'They stay on the Quals roster after the PO date — for the custom cases.'}
          onClick={() => onChange(poFrom, !archive)}
        >
          {archive ? '✓ ' : ''}Archive on PO date
        </button>
      </div>
      <div className="bidsheet-row postout">
        <button className="dchip po" data-testid="postout-undo" onClick={onUndo}>
          Undo post out (PO)
        </button>
      </div>
    </Sheet>
  )
}
