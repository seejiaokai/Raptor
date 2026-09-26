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
import { addDays, displayCell, formatCell, LEAVE_TYPES, type BidState, type CounterName, type Portion } from '../engine'
import { awardsIn, cellProblem, clearCells, MAX_GIVEN_BY, setBidState, setBidStates, setCell, setCellRange, shiftBid } from '../state/store'
import { MAX_REC_NOTE } from '../engine/warrecs'
import { RangePicker, type Range } from './RangePicker'
import { Sheet } from './Sheet'
import { shortSpan } from './dates'
import { awardDays, awardsClause } from './awardwords'
import './bidpicker.css'
import './oiltracker.css'
import { creditWorthText } from '../engine/credit'

/** minutes of the day as `08:00` — the worked hours on an automatic credit */
const hhmm = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`

/* What a credit is worth, in words, comes from `engine/credit.ts` — the ONE
   formula. A second copy lived here and took only the code and the quantity,
   so a credit the schedule owned that somehow carried an award's `days` read
   "3 days" on this sheet while the tracker and the day both said one. That is
   the exact "the worth changed and no screen admitted it" shape the helper
   was written to end, so the sheet reads the helper and passes the OWNERSHIP
   with it (both reviewers, 21 Sep 26). */

const PORTIONS: { portion: Portion; label: string; testid: string }[] = [
  { portion: 'full', label: 'Whole day', testid: 'portion-full' },
  { portion: 'am', label: 'AM', testid: 'portion-am' },
  { portion: 'pm', label: 'PM', testid: 'portion-pm' },
]

export function BidPicker({
  callsign,
  personId,
  date,
  current,
  dates,
  onWrote,
  wouldLeave,
  onPostOut,
  onPostIn,
  onCredit,
  credit,
  creditShown,
  decide,
  onCreditClear,
  onlyPortion,
  heldBy,
  onClose,
}: {
  callsign: string
  personId: string
  date: string
  current: string
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
  onPostOut?: (fromDate: string, archive: boolean) => string | void
  /** Admin-only: post this person IN from a date (owner, 20 Sep 26 — "we need
   *  a post in button just like post out"). The mirror of `onPostOut`: it sets
   *  the first day they ARE here, where the post-out sets the first day they
   *  are gone. Present only for an admin, same as its twin. */
  onPostIn?: (date: string) => string | void
  /** Item D (CURRENT-STATE, 20 Sep 26): the only half of this day that is
   *  free, when the other is held by a record locked to the Inputs page. The
   *  "How much" row then offers that half alone — the whole day and the held
   *  half are not choices, because neither could be written. Absent on an
   *  ordinary cell, where all three stay on offer. */
  /** Admin-only: record that this person WORKED this day, earning OIL (owner,
   *  20 Sep 26 — "the admin can also credit OIL on the leave sheet for
   *  convenience. We should enable that even on any day"). Present only for an
   *  admin; the matrix wires it to the store and closes the sheet. */
  onCredit?: (code: 'FO' | 'HO', days: string, note: string, givenBy: string) => string | null
  /** The OIL already on this day, when a person granted it (owner, 20 Sep 26 —
   *  "when I click on FO or HO on the leave war, i should be able to see the
   *  reason and given by who if applicable and quantity"). The sheet names it
   *  and opens its controls already filled in, so reading it and changing it
   *  are the same tap. Absent when the day has none, or when the APP earned it
   *  off the published schedule — that one is the schedule's to change. */
  credit?: { code: 'FO' | 'HO'; days?: number; note?: string; givenBy?: string } | null
  /** WHAT THE OIL ON THIS DAY SAYS, shown on a single click without opening
   *  anything (owner, 21 Sep 26: "When i click on like FO or HO once, At the
   *  bottom i want to see the reason, given by and days granted"). Covers BOTH
   *  kinds: an award, which `credit` above also lets an admin edit, and one
   *  the app credited itself, which is read-only because the OIL pass owns it
   *  and would overwrite anything typed onto it. */
  creditShown?: { code: 'FO' | 'HO'; days?: number; note?: string; giver?: string; auto?: boolean; spans?: Array<[number, number]>; via?: 'schedule' | 'input' } | null
  /** THE FOUR THINGS AN ADMIN DOES TO AN INPUT — Ack, Approve, Refuse, Move
   *  — IN EVERY STAGE (owner, 21 Sep 26: "even a single click on an input, i
   *  should be able to click on a move button to move the input just like how
   *  i drag and select and click on move … enable it in all Stage on leave
   *  war"). Absent when the cell holds no bid to decide, or the reader is not
   *  an admin. Before this they lived on a separate sheet that only opened
   *  once bidding had closed, so the same input answered to different controls
   *  depending on which day of the cycle you clicked it. */
  decide?: { state?: BidState; movedFrom?: string } | null
  /** Take the granted OIL off this day. */
  onCreditClear?: () => void
  onlyPortion?: Portion | null
  /** What is already on the day, in the words the box shows, so the sheet can
   *  name the half it is NOT offering. */
  heldBy?: string
  onClose: () => void
}) {
  // Deliberately not seeded from `current`: the portion resets to a whole
  // day for every cell opened. A picker that remembered the last choice
  // would silently write a half day on the next cell the bidder touched.
  const [portion, setPortion] = useState<Portion>(onlyPortion ?? 'full')
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
  // The post-IN controls, folded the same way and for the same reason. No
  // archive switch: arriving has no counterpart to it — the Quals archive is
  // something a person LEAVES the roster into.
  const [piOpen, setPiOpen] = useState(false)
  const [piDate, setPiDate] = useState(date)
  /* a refused posting's reason (AB5): the callbacks return it; the sheet stays open and says it */
  const [postErr, setPostErr] = useState('')
  // The OIL-earned controls, folded behind one button like the two posting
  // ones. Folding matters more here than there: this sheet's other rows all
  // place LEAVE, and a credit is the opposite fact — the man was at work.
  // Opened already filled in when the day HOLDS granted OIL, so reading it and
  // changing it are one tap rather than two controls.
  const [oilOpen, setOilOpen] = useState(false)
  const [oilNote, setOilNote] = useState(credit?.note ?? '')
  const [oilGiven, setOilGiven] = useState(credit?.givenBy ?? '')
  /* HOW MANY DAYS, not which hours (owner, 20 Sep 26 — "Remove the worked
     hours. Not required"). A grant is an AWARD, not an attendance record, so
     the hours it would have been worked over are not a fact it holds. Blank
     means the code's own worth: a whole day for FO, half for HO. */
  /* ONE QUANTITY, ONE MEANING (owner, 21 Sep 26 — "this is confusing, the
     number of days when u click on HO … Should we just have number of days to
     input? Then it shows HO or FO as require based on what was input?").

     It had TWO controls for one fact: an FO/HO pair, which already mean a day
     and half a day, and a days box that also means a quantity. So "HO" beside
     a "1" read as nonsense, and every attempt to rank one over the other
     produced a different surprise.

     For an AWARD the code is now only a LABEL — it is what the grid square
     shows, and nothing else: the worth comes from the quantity, an award
     clashes with nothing, stands nobody down and moves no manning (N13, N16,
     N17). So the quantity is the fact and the code is derived from it, which
     is the owner's own suggestion and the only reading with no second way to
     say the same thing. Under a day reads HO, a day or more reads FO, and the
     button says which before it is pressed.

     The AUTOMATIC credit is untouched: the published schedule still decides
     FO or HO by the six-hour rule, and knows nothing about this box. */
  const [oilDays, setOilDays] = useState(credit?.days != null ? String(credit.days) : '1')
  const oilN = Number(oilDays.trim())
  const oilCode: 'FO' | 'HO' = Number.isFinite(oilN) && oilN > 0 && oilN < 1 ? 'HO' : 'FO'
  /* the move field, and the reason a refused move gives — a Move button that
     simply did nothing would read as broken */
  const [moveTo, setMoveTo] = useState('')
  const [moveErr, setMoveErr] = useState('')

  /* A DECISION THAT DOES NOT LAND SAYS SO (Astra, 21 Sep 26). The first cut
     wrote and closed regardless, so wherever the store refuses — a cell the
     Inputs page owns, a stage that does not decide — the sheet shut as though
     the answer had been recorded. The affordance is gated too (Matrix passes
     `decide` only where a decision can land); this is the second line, because
     a control that silently does nothing is the worst of the three outcomes. */
  const answer = (bid: BidState) => {
    // Tapping the answer it already holds is a NO-OP, not a failure (Fable,
    // 21 Sep 26): the store returns "nothing decided" for it, which the line
    // below would otherwise report as a refusal.
    if (decide?.state === bid) return onClose()
    const { decided } = setBidStates([{ personId, date }], bid)
    if (decided > 0) return onClose()
    setMoveErr('That could not be recorded — this day is not this screen’s to decide.')
  }
  const [oilErr, setOilErr] = useState('')
  const grantOil = () => {
    const problem = onCredit!(oilCode, oilDays, oilNote, oilGiven)
    if (problem) { setOilErr(problem); return }
    onClose()
  }

  /* the Clear's own confirm (D260) — apart from `confirming`, which is the negative-balance one, keyed by leave code */
  const [clearAsked, setClearAsked] = useState(false)
  /** The cells a range covers, for the store's questions about them. */
  const spanCells = (r: Range) => {
    const out: { personId: string; date: string }[] = []
    for (let d = r.from; d <= r.to; d = addDays(d, 1)) out.push({ personId, date: d })
    return out
  }

  /** Days this write covers — one, or the span if a range is chosen. */
  const dayCount = () => {
    if (!range) return 1
    let n = 0
    for (let d = range.from; d <= range.to; d = addDays(d, 1)) n++
    return n
  }

  const write = (code: string) => {
    /* CLEAR NAMES THE OIL AWARD IT TAKES, AND ASKS ONCE (owner, D260, 27 Sep 26 — "B"; the absence-record re-test, AB1).
       A Clear removes the admin's award on the day with everything else (that stands — his ruling), but it used to do
       it silently and the man's OIL dropped. On a day — or a picked range — holding an award, the first tap names each
       one and takes nothing; the same Clear again goes ahead. `awardsIn` is the store's own question, so what is named
       is what goes; a member's Clear takes no award, so it never asks. */
    if (!code) {
      const cells = range ? spanCells(range) : [{ personId, date }]
      const awards = awardsIn(cells)
      if (awards.length && !clearAsked) {
        setClearAsked(true)
        setConfirming(null)
        return setNote(awards.length === 1
          ? `Clear also takes ${callsign}’s OIL award (${awardDays(awards[0]!.days)}) — tap Clear again to go ahead.`
          : `Clear also takes ${awardsClause(awards, () => callsign)} — tap Clear again to go ahead.`)
      }
    } else setClearAsked(false)
    // Ask before taking someone below zero. Never REFUSE: a balance is allowed
    // to run negative and the owner was explicit that it must stay possible.
    // What was wrong was doing it silently, so this is a confirmation, not a
    // rule.
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
      /* A refused single-day write used to close the sheet as though it had
         worked: no leave, no message, nothing ([S4-BUGHUNT], 20 Sep 26). Ask
         WHY first, and say it. */
      /* CLEAR GOES THROUGH THE DOOR THAT CAN ACTUALLY REMOVE THINGS (Fable,
         21 Sep 26). `setCell('')` only strips the war's OWN records — a
         request or an award — so on a leave the war APPROVED it found nothing,
         changed nothing and closed as though it had worked, while the leave
         buttons beside it were saying "already taken by LL — clear it first".
         A dead-end loop, and new: before the one window this cell opened the
         decision sheet, which carried no Clear at all. `clearCells` is the door
         that reaches an approved leave (through the absence door on the Input
         itself) and it still covers requests and awards, so this is a superset
         of the old behaviour — and it refuses a PUBLISHED approved leave,
         which is the owner's own rule. */
      if (!code) {
        const { written } = clearCells([{ personId, date }])
        if (!written) return setNote('Nothing here can be cleared from the war — leave filed on the Inputs page is changed there, and an approved leave on a published war needs the war reopened.')
        onWrote?.('')
        return onClose()
      }
      const why = cellProblem(personId, date, code)
      if (why) return setNote(why)
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
        {/* the box's own voice — "<LL", not the stored "*LL" (W5-F5, 26 Sep 26) */}
        {current && <span className="cur">now {displayCell(current)}</span>}
        <button className="x" data-testid="bid-cancel" onClick={onClose} aria-label="Cancel">
          ✕
        </button>
      </div>

      {/* THE DECISION, AND THE MOVE — the admin's four answers to an input,
          on the same window in every stage (owner, 21 Sep 26). They sit at the
          TOP because on a day that already holds a bid they are what the admin
          came for; the leave buttons below are for changing what was asked,
          which is the rarer thing to do to somebody else's input.
          All four stay live on an already-decided bid: management tries one,
          watches the manning rows move, and changes it back — a decision that
          could not be undone would make that a one-way door. */}
      {decide && (
        <>
          <div className="bidsheet-row">
            <span className="lab">Decision</span>
            {/* ACK, not "Pending" (owner, 21 Sep 26). It means SEEN, NOT YET
                ANSWERED — the state between a bid arriving and a verdict — and
                it is what turns the cell purple. The label was "Pending" from
                27 Aug 26; the owner renamed it on 21 Sep, and the later ruling
                wins. The STATE TOKEN is untouched: still 'acknowledged' in
                storage, still `decide-ack`. Only the word changed. */}
            <button
              className="dchip ack"
              data-testid="decide-ack"
              aria-pressed={decide.state === 'acknowledged'}
              title="Acknowledged — seen, not yet decided"
              onClick={() => answer('acknowledged')}
            >
              Ack
            </button>
            <button
              className="dchip approve"
              data-testid="decide-approve"
              aria-pressed={decide.state === 'approved'}
              onClick={() => answer('approved')}
            >
              Approve
            </button>
            <button
              className="dchip refuse"
              data-testid="decide-refuse"
              aria-pressed={decide.state === 'refused'}
              onClick={() => answer('refused')}
            >
              Refuse
            </button>
            {/* MOVING SITS ON THE SAME ROW as the three decisions, not under
                them (owner, 21 Sep 26 — "Try to keep the window the same size
                and squeeze the extra info and buttons into it"). Four controls
                on one line is what keeps the window the height it was before
                the decision came onto it, which matters most on a phone, where
                a taller sheet eats the strip of grid still reachable above it.
                A move is what management does instead of refusing when a week
                goes red and refusing outright is too blunt: it lands UNDECIDED
                and they approve it on the new date — a proposal
                with a trail, not a silent re-approval. Reaching it from ONE
                click was the rest of his ask; it took a drag-select before,
                which is a lot of gesture for one man's one day. */}
            <input
              type="date"
              className="dateinput"
              data-testid="shift-date"
              value={moveTo}
              min={dates[0]}
              max={dates[dates.length - 1]}
              onChange={e => { setMoveTo(e.target.value); setMoveErr('') }}
            />
            <button
              className="dchip move" data-testid="decide-shift" disabled={!moveTo}
              onClick={() => {
                if (!moveTo) return
                const result = shiftBid(personId, date, moveTo)
                if (result === 'shifted') return onClose()
                setMoveErr(
                  result === 'occupied'
                    ? `${moveTo} already has something booked — clear it first.`
                    : result === 'raptor'
                      ? 'Raptor owns this cell; move it there instead.'
                      : result === 'window'
                        ? `${moveTo} is not a day this leave can land on — pick a day inside the war.`
                        : 'There is no bid here to move.',
                )
              }}
            >
              Move
            </button>
            {decide.movedFrom && (
              <span className="note" data-testid="decide-movedfrom">moved from {decide.movedFrom}</span>
            )}
            {moveErr && <span className="note warn" data-testid="shift-problem">{moveErr}</span>}
          </div>
        </>
      )}

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
          onClick={() => { setRange(null); setShowCal(false); setNote(''); setClearAsked(false) }}
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
          onClick={() => { setShowCal(true); setRange(r => r ?? { from: date, to: date }); setNote(''); setClearAsked(false) }}
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
            onChange={r => { setRange(r); setNote(''); setClearAsked(false) }}
          />
        </div>
      )}

      <div className="bidsheet-row">
        <span className="lab">How much</span>
        {/* Item D: with one half already spoken for by the Inputs page, the
            other choices are not dimmed, they are ABSENT — the house rule for
            a control that could not work (a disabled chip invites a tap and
            then refuses it). The line under it says what holds the other half
            and where it is changed, so the lock is explained rather than just
            enforced. */}
        {PORTIONS.filter(p => !onlyPortion || p.portion === onlyPortion).map(p => (
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
        {onlyPortion && (
          <span className="note" data-testid="bid-heldhalf">
            The {onlyPortion === 'pm' ? 'morning' : 'afternoon'} is {heldBy || 'already taken'},
            filed on the Inputs page — change that there.
          </span>
        )}
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
            {/* the chip says what the BOX will say — `<LL`, `LL>` — while the
                write still speaks the stored grammar */}
            {displayCell(formatCell({ type: t.type, portion }))}
          </button>
        ))}
        <button className="tchip clear" data-testid="bid-clear" onClick={() => write('')}>
          {clearAsked ? 'Clear — sure?' : 'Clear'}
        </button>
        {note && <span className="note warn" data-testid="span-note">{note}</span>}
      </div>

      {/* Medical is MEMBER-FILED ONLY (owner, 13 Sep 26, reversing the 17 Aug
          "management marks it" rule): the war no longer offers the medical
          markers to anyone. A member files a medical input with its certificate
          on Raptor's Inputs page and it syncs in read-only — the war displays
          it, never creates it. The old admin medical row is gone. */}

      {/* RECORD THAT HE WORKED — an OIL credit typed by hand (owner, 20 Sep 26).
          ANY DAY, on purpose: the weekend/public-holiday rule belongs to the
          AUTOMATIC pass, which reads the published schedule. This is the
          squadron saying a man worked when no schedule says so, which is why
          it takes a reason and who said it. Set apart below the leave rows and
          folded behind one button, because it is the opposite fact to
          everything above it and must not be hit by reflex. */}
      {/* THE ADMIN'S THREE MANAGEMENT ACTIONS SHARE ONE ROW. They were three
          stacked rows until the OIL one was added on 20 Sep 26, and the third
          row made the sheet tall enough on a phone that the strip of grid left
          above it stopped being reachable — a browser test that scrolls the
          grid with a finger above the sheet caught it, which no unit test
          could. They belong together anyway: three sibling admin actions, each
          folded, none of them a bid. On a phone they wrap to two lines; on a
          desktop they sit on one. */}
      {!oilOpen && !poOpen && !piOpen && (onCredit || onPostOut || onPostIn) && (
        <div className="bidsheet-row postout">
          {/* SHORT LABELS, MEANING ON HOVER (owner, 20 Sep 26). These three are
              the admin's management actions and he knows them by their
              initials; spelling them out cost a third of the sheet's width for
              words he reads past. `title` is the desktop hover; it is also
              what a screen reader announces, which is why the aria-label
              carries the long form rather than the short one. A phone has no
              hover — nothing is lost there, because a phone has no room for
              the long form either. */}
          {onCredit && (
            <button
              className="dchip po" data-testid="bid-oil"
              title={credit
                ? 'The OIL on this day — its reason, who gave it and how many days'
                : 'Grant OIL — a day or half a day off in lieu, for any reason'}
              aria-label={credit ? 'The OIL on this day' : 'Grant OIL'}
              onClick={() => setOilOpen(true)}
            >{credit ? `${credit.code} · ${creditWorthText({ ...credit, auto: false })}` : '+OIL'}</button>
          )}
          {onPostOut && (
            <button
              className="dchip po" data-testid="bid-postout"
              title="Post out — their last day in the squadron"
              aria-label="Post out"
              onClick={() => setPoOpen(true)}
            >PO</button>
          )}
          {onPostIn && (
            <button
              className="dchip po" data-testid="bid-postin"
              title="Post in — their first day in the squadron"
              aria-label="Post in"
              onClick={() => setPiOpen(true)}
            >PI</button>
          )}
        </div>
      )}
      {onCredit && oilOpen && (
        <>
          {/* What is already there, in words, before any box — an admin who
              tapped the cell to READ it should not have to infer it from the
              state of three inputs. */}
          {credit && (
            <div className="bidsheet-row postout">
              <span className="note" data-testid="oil-current">
                {creditWorthText({ ...credit, auto: false })} of OIL{credit.note ? ` — ${credit.note}` : ''}
                {credit.givenBy ? `, given by ${credit.givenBy}` : ''}.
              </span>
              {onCreditClear && (
                <button className="tchip clear" data-testid="oil-clear" onClick={onCreditClear}>Remove</button>
              )}
            </div>
          )}
          <div className="bidsheet-row postout">
            <input
              className="oil-text" maxLength={MAX_REC_NOTE}
              data-testid="oil-why" aria-label="Reason" placeholder="why — any reason"
              value={oilNote} onChange={e => { setOilErr(''); setOilNote(e.target.value) }}
            />
            <input
              className="oil-text given" maxLength={MAX_GIVEN_BY}
              data-testid="oil-given-by" aria-label="Given by" placeholder="given by (optional)"
              value={oilGiven} onChange={e => { setOilErr(''); setOilGiven(e.target.value) }}
            />
          </div>
          <div className="bidsheet-row postout">
            {/* "Days", not "How many" — the row above already asks How many,
                about DATES, and two of the same question on one sheet reads as
                a mistake. */}
            <span className="lab">Days</span>
            {/* The one control. It opens at 1 — the ordinary grant, said out
                loud rather than implied — and the button beside it shows what
                the day will READ as before it is pressed. */}
            <input
              type="text" inputMode="decimal" className="oil-num" maxLength={6}
              data-testid="oil-days" aria-label="How many days" placeholder="days"
              value={oilDays} onChange={e => { setOilErr(''); setOilDays(e.target.value) }}
            />
            <button className="dchip approve" data-testid="oil-give" onClick={grantOil}>
              Give {oilCode}
            </button>
            {oilErr && <span className="note warn" data-testid="oil-err">{oilErr}</span>}
          </div>
        </>
      )}

      {/* Post the person OUT (owner, 18 Aug 26; any date + the archive switch
          19 Aug 26). A management action, not a bid — it takes them off the
          manpower from the chosen date and greys their boxes; it is undone by
          tapping a greyed day. Set apart below the bid controls, and folded
          behind one button, so it cannot be hit by reflex. */}
      {/* Post the person IN (owner, 20 Sep 26 — "we need a post in button just
          like post out. Because those dates are official dates. But they can
          be for e.g still taking leave after or before they post in or out").
          Same shape as its twin above, folded behind one button for the same
          reason. Before this existed the app had no joining date at all, so
          everyone read as having always been here. It is an OFFICIAL date: it
          decides manning and the grey hatch, and it deliberately does not stop
          leave being dated before it. */}
      {onPostIn && piOpen && (
        <>
          <div className="bidsheet-row postout">
            <span className="lab">PI from</span>
            {/* Unbounded like the post-out's, and for the same reason: a
                joining date can sit anywhere in real time, and the keyboard
                path is what reaches a year the calendar would take twelve taps
                to walk to. */}
            <input
              type="date"
              className="dateinput"
              data-testid="pi-date"
              aria-label={`Post ${callsign} in from`}
              value={piDate}
              onChange={e => { setPostErr(''); setPiDate(e.target.value) }}
            />
          </div>
          <div className="bidsheet-row postout">
            <button
              className="dchip po"
              data-testid="pi-confirm"
              disabled={!piDate}
              onClick={() => { const why = onPostIn(piDate); setPostErr(why || '') }}
            >
              Post in from {piDate || '…'}
            </button>
            <span className="note">
              Their first day in the squadron. Days before it are blank and count nobody —
              leave can still be dated there.
            </span>
          </div>
          {postErr && <div className="bidsheet-row postout"><span className="note warn" data-testid="post-err">{postErr}</span></div>}
        </>
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
              onChange={e => { setPostErr(''); setPoDate(e.target.value) }}
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
              onClick={() => { const why = onPostOut(poDate, poArchive); setPostErr(why || '') }}
            >
              Post out from {poDate || '…'}
            </button>
            <span className="note">
              Off the manpower from that day on. Past schedules keep their pucks.
            </span>
          </div>
          {postErr && <div className="bidsheet-row postout"><span className="note warn" data-testid="post-err">{postErr}</span></div>}
        </>
      )}

      {/* WHAT THE OIL ON THIS DAY SAYS — on ONE click, at the bottom, without
          opening anything (owner, 21 Sep 26). Three things, always the same
          three, whichever kind of credit it is: why it was given, who gave it,
          and how many days it is worth.
          The app's OWN credit answers them from the schedule it was earned
          off: the reason is the work it found (FLT, SIM, Duty, or the type of
          an accepted duty input), the giver is "Weekend/PH" — or "Duty input"
          when it came from an input rather than the published day — and the
          hours it was measured over are shown, because for that kind they are
          the evidence. It is READ-ONLY: the OIL pass owns it and would
          overwrite anything typed on top.
          An AWARD answers them from what the admin typed, and +OIL above
          reopens exactly those boxes to change them. */}
      {creditShown && (
        <div className="bidsheet-oil-detail" data-testid="oil-detail">
          {/* WHERE IT CAME FROM, ON THE SAME SHEET (owner, 21 Sep 26 — "why
              cant u just show me the 2nd picture window which has the same
              info?").
              For a few hours an admin tapping a day the schedule had earned on
              got a read-only sheet FIRST and had to press a button to reach
              this one — two windows, the second carrying everything the first
              did except this line. The answer was to MOVE the line, not to
              charge a tap for it. A member still gets the read-only sheet:
              there is nothing here for him to do. */}
          {creditShown.auto && (
            <div className="bidsheet-row postout">
              <span className="lab">Where it came from</span>
              <span className="note" data-testid="raptor-note">
                {creditShown.via === 'input'
                  ? 'Earned off a duty input that was accepted — change that input, not the schedule.'
                  : 'Earned off the published schedule — change the schedule and the OIL follows.'}
              </span>
            </div>
          )}
          <div className="bidsheet-row postout">
            <span className="lab">Reason</span>
            <span className="note" data-testid="oil-detail-why">
              {creditShown.note?.trim() || (creditShown.auto ? 'Worked this day' : 'Not given')}
            </span>
          </div>
          <div className="bidsheet-row postout">
            <span className="lab">Given by</span>
            <span className="note" data-testid="oil-detail-given">
              {creditShown.giver?.trim() || 'Not given'}
            </span>
          </div>
          <div className="bidsheet-row postout">
            <span className="lab">Days</span>
            <span className="note" data-testid="oil-detail-days">
              {creditWorthText(creditShown)}
              {creditShown.auto && creditShown.spans?.length
                ? ` — worked ${creditShown.spans.map(([a, b]) => `${hhmm(a)}–${hhmm(b)}`).join(', ')}`
                : ''}
            </span>
          </div>
        </div>
      )}
    </Sheet>
  )
}

/**
 * Approve or refuse a bid, once bidding has closed.
 *
 * The sheet renders only under `canDecide`, and since the 27 Aug overnight
 * pass the store's `setBidState` re-checks the same body — the role rides the
 * Raptor login now, so "there is no login" stopped being a reason to leave
 * the write path open the day the apps merged.
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
          : result === 'window'
            ? `${to} is not a day this leave can land on — pick a day inside the war.`
            : 'There is no bid here to move.',
    )
  }

  return (
    <Sheet testid="bid-picker" label="Decide a bid" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{callsign}</span>
        <span className="dt">{date}</span>
        <span className="cur">
          {displayCell(code)}{state ? ` · ${state}` : ''}{movedFrom ? ` · moved from ${movedFrom}` : ''}
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
        {/* The visible word is "Ack" (owner, 21 Sep 26, renaming his own
            27 Aug "Pending") — the same word the grid legend gives this purple
            state, so the two agree. The STATE TOKEN stays 'acknowledged'
            (persisted in BID_STATES), only the label changed; testid stays
            decide-ack. */}
        <button
          className="dchip ack"
          data-testid="decide-ack"
          aria-pressed={state === 'acknowledged'}
          title="Seen, not yet decided"
          onClick={() => decide('acknowledged')}
        >
          Ack
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
  creditShown,
  onClose,
}: {
  callsign: string
  date: string
  code: string
  /** OIL the APP earned on this day, if that is what the cell holds (owner,
   *  21 Sep 26). See the note below on why this sheet had to learn the
   *  difference. */
  creditShown?: { code: 'FO' | 'HO'; days?: number; note?: string; giver?: string; spans?: Array<[number, number]>; via?: 'schedule' | 'input' } | null
  onClose: () => void
}) {
  /* WHICH EVIDENCE BACKS THIS CREDIT decides where the reader is sent (Astra,
     21 Sep 26). The first cut sent everyone to the schedule, which is wrong for
     a credit earned off a duty-and-commitments input the owner accepted:
     editing the schedule cannot take that credit away, so the sentence pointed
     him at a screen where there is nothing to change — the same defect, one
     layer down, as the "filed on the Inputs page" line this sheet used to give
     an earned credit. */
  const fromInput = creditShown?.via === 'input'
  /* ONLY LEAVE IS "APPROVED" (the absence-record re-test, AB9, 26 Sep 26). Leave filed on the Inputs page counts as
     already approved (Q14), and this sheet said so for EVERY Inputs-filed absence — a man's ATT C read "ATTC ·
     approved … so it is already approved". A medical, a course or overseas duty is nobody's to approve; it keeps the
     pointer to the Inputs page and loses leave's word. */
  const leave = !creditShown && LEAVE_TYPES.some(t => t.type === code.replace(/\*/g, ''))
  return (
    <Sheet testid="raptor-sheet" label={creditShown ? 'OIL the app credited' : 'Leave from Raptor'} onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{callsign}</span>
        <span className="dt">{date}</span>
        {/* the box's notation, as the bid sheet's "now" (W5's re-walk, NF2) */}
        <span className="cur">{displayCell(code)}{creditShown || leave ? ' · approved' : ''}</span>
        <button className="x" data-testid="bid-cancel" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      {/* THIS SHEET USED TO TELL AN OIL CREDIT IT CAME FROM THE INPUTS PAGE
          (fixed 21 Sep 26). Both kinds of cell the schedule owns open here,
          and only one of them is leave someone filed: a weekend credit is the
          app's own reading of the PUBLISHED SCHEDULE, and sending an admin to
          the Inputs page to change it sends him somewhere he will find
          nothing. Each now says where its own fact lives. */}
      <div className="bidsheet-row">
        <span className="lab">{creditShown ? 'Where it came from' : 'Inputs page'}</span>
        <span className="note" data-testid="raptor-note">
          {creditShown
            ? fromInput
              ? 'Earned off a duty input that was accepted — change that input, not the schedule.'
              : 'Earned off the published schedule — change the schedule and the OIL follows.'
            : leave
              ? 'Filed on the Inputs page, so it is already approved — change it there, not here.'
              : 'Filed on the Inputs page — change it there, not here.'}
        </span>
      </div>
      {/* The same three lines the day window gives for OIL, because the
          question is the same one however the day happens to open. */}
      {creditShown && <OilDetailRows c={creditShown} auto />}
    </Sheet>
  )
}

/** THE THREE LINES AN OIL CREDIT READS BACK — reason, given by, days — for the two read-only sheets (the schedule's
 *  own credit above; a member's own award below, D261). One body, so the two cannot word one fact two ways. `auto`: the
 *  schedule earned it (its reason defaults to the work, and the hours it was measured over are shown); else an award,
 *  whose reason is whatever the admin typed. */
function OilDetailRows({ c, auto }: {
  c: { code: 'FO' | 'HO'; days?: number; note?: string; giver?: string; spans?: Array<[number, number]> }
  auto: boolean
}) {
  return (
    <div className="bidsheet-oil-detail" data-testid="oil-detail">
      <div className="bidsheet-row">
        <span className="lab">Reason</span>
        <span className="note" data-testid="oil-detail-why">{c.note?.trim() || (auto ? 'Worked this day' : 'Not given')}</span>
      </div>
      <div className="bidsheet-row">
        <span className="lab">Given by</span>
        <span className="note" data-testid="oil-detail-given">{c.giver?.trim() || 'Not given'}</span>
      </div>
      <div className="bidsheet-row">
        <span className="lab">Days</span>
        <span className="note" data-testid="oil-detail-days">
          {creditWorthText({ ...c, auto })}
          {auto && c.spans?.length
            ? ` — worked ${c.spans.map(([a, b]) => `${hhmm(a)}–${hhmm(b)}`).join(', ')}`
            : ''}
        </span>
      </div>
    </div>
  )
}

/**
 * A MEMBER'S OWN OIL AWARD, READ ONLY (owner, D261, 27 Sep 26 — "3 yes": he opens it at every stage, not only while
 * bidding is open). Inside the bidding window his tap opens the bid sheet, whose foot already reads the award back;
 * everywhere else — a locked day, bidding closed, a published war — the tap used to open nothing (the absence-record
 * re-test, W3-F10). This is that read-back on its own: the same three lines, and nothing to press but ✕ — an award is
 * the admin's to give, change and remove (N11).
 */
export function AwardSheet({
  callsign,
  date,
  award,
  onClose,
}: {
  callsign: string
  date: string
  award: { code: 'FO' | 'HO'; days?: number; note?: string; giver?: string }
  onClose: () => void
}) {
  return (
    <Sheet testid="award-sheet" label="Your OIL award" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{callsign}</span>
        <span className="dt">{date}</span>
        <span className="cur">{award.code} · OIL award</span>
        <button className="x" data-testid="award-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="bidsheet-row">
        <span className="lab">Where it came from</span>
        <span className="note" data-testid="award-note">Given by an admin — only an admin can change it.</span>
      </div>
      <OilDetailRows c={award} auto={false} />
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
  onPlace,
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
  onChange: (fromDate: string, archive: boolean) => string | void
  onUndo: () => void
  /** Hand this day to the bid sheet instead (owner, 20 Sep 26 — "we should
   *  also allow putting inputs when we click on days that were posted out"). */
  onPlace?: () => void
  onClose: () => void
}) {
  /* a refused move of the date says why (AB5) — the box snaps back to the date that stands */
  const [err, setErr] = useState('')
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
          onChange={e => { if (e.target.value) setErr(onChange(e.target.value, archive) || '') }}
        />
        <button
          className={`pchip${archive ? ' on' : ''}`}
          data-testid="postout-archive"
          aria-pressed={archive}
          title={archive
            ? 'On the PO date they move to the Quals archive. Their pucks on past schedules are untouched.'
            : 'They stay on the Quals roster after the PO date — for the custom cases.'}
          onClick={() => setErr(onChange(poFrom, !archive) || '')}
        >
          {archive ? '✓ ' : ''}Archive on PO date
        </button>
      </div>
      {/* drawn only with something to say — an empty row left a blank band on the sheet (W3's re-walk, N4) */}
      {err && <div className="bidsheet-row postout">
        <span className="note warn" data-testid="postout-err">{err}</span>
      </div>}
      <div className="bidsheet-row postout">
        <button className="dchip po" data-testid="postout-undo" onClick={onUndo}>
          Undo post out (PO)
        </button>
        {/* THE WAY THROUGH TO PLACING LEAVE (owner, 20 Sep 26). An admin's tap
            on a day outside someone's time in the squadron lands here, which is
            right — managing the posting is what he means nine times out of ten
            — but it left him no way to file the clearing leave that made him
            open the day in the first place. Everyone else could: the man
            himself taps his own day and gets the bid sheet, and the Inputs page
            takes any date. One button rather than a second gesture, so the
            common tap keeps doing the safe thing. */}
        {onPlace && (
          <button className="dchip" data-testid="postout-place" onClick={onPlace}>
            Place leave or OIL here instead…
          </button>
        )}
      </div>
    </Sheet>
  )
}

/**
 * Manage a post-in (owner, 20 Sep 26). The mirror of `PostOutSheet`: it opens
 * when an admin taps a blank cell dated BEFORE the person joined, and it is
 * where that joining date is moved or cleared.
 *
 * A member never reaches it — for them a pre-joining day opens the bid picker
 * instead, which is answer C's "leave there may be filed or bid". That split
 * is the same one the post-out end already makes, deliberately: the admin's
 * tap on an out-of-squadron day manages the POSTING, the member's places
 * LEAVE.
 */
export function PostInSheet({
  callsign,
  date,
  piFrom,
  onChange,
  onUndo,
  onPlace,
  onClose,
}: {
  callsign: string
  date: string
  /** The person's CURRENT PI date — the first day they are here. */
  piFrom: string
  /** Re-post with a new date. Commits on change, like the post-out sheet, so
   *  the admin watches the grid move behind it. */
  onChange: (date: string) => string | void
  onUndo: () => void
  /** Hand this day to the bid sheet instead — the mirror of the post-out
   *  sheet's, and for the same reason (owner, 20 Sep 26). */
  onPlace?: () => void
  onClose: () => void
}) {
  /* a refused move of the date says why (AB5) — the box snaps back to the date that stands */
  const [err, setErr] = useState('')
  return (
    <Sheet testid="postin-sheet" label="Posted in" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{callsign}</span>
        <span className="dt">{date}</span>
        <button className="x" data-testid="postin-cancel" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="bidsheet-row">
        <span className="note">
          Posted in on {piFrom} — on the manpower from that day. Days before it count nobody,
          but leave can still be dated there.
        </span>
      </div>
      <div className="bidsheet-row postout">
        <span className="lab">PI from</span>
        {/* Unbounded, and an emptied field commits nothing — clearing a
            post-in is the Undo button's job, not a backspace. */}
        <input
          type="date"
          className="dateinput"
          data-testid="postin-date"
          aria-label={`Move ${callsign}'s post-in date`}
          value={piFrom}
          onChange={e => { if (e.target.value) setErr(onChange(e.target.value) || '') }}
        />
      </div>
      {/* drawn only with something to say — an empty row left a blank band on the sheet (W3's re-walk, N4) */}
      {err && <div className="bidsheet-row postout">
        <span className="note warn" data-testid="postin-err">{err}</span>
      </div>}
      <div className="bidsheet-row postout">
        <button className="dchip po" data-testid="postin-undo" onClick={onUndo}>
          Undo post in (PI)
        </button>
        {onPlace && (
          <button className="dchip" data-testid="postin-place" onClick={onPlace}>
            Place leave or OIL here instead…
          </button>
        )}
      </div>
    </Sheet>
  )
}
