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

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { addDays, codeInWords, displayCell, formatCell, LEAVE_TYPES, parseCell, type BidState, type CounterName, type Half, type Portion, type PostOutcome } from '../engine'
import { OutcomeChips, outcomeLine } from './OutcomeChips'
import '../../ui/postout.css'
import { awardsIn, cellProblem, clearCells, clearRecords, decideRequests, deletableRecords, fileStraight, FILED_STRAIGHT, leaveRunAt, placeApproved, decidableIn, defaultAwardHalf, deletableIn, getState, MAX_GIVEN_BY, MAX_REASON, movableRecords, setBidStates, setCell, setCellRange, setRequestWords, type DecideTo, type LeaveRun, type MoveRec } from '../state/store'
import { draftOf, emptyDraft, heldRequest, LeaveWords, patchOf, ReqWordsRows, wordsOf, type ReqDraft } from './ReqWords'
import { ApproveSwitch, compactSpan, EntryBox, MoreButton, useApproveMemory, type MoreItem } from './BidBits'
import { OilAmount, oilAmountText, oilNumber, oilStart, type OilPick } from './OilAmount'
import { DeleteChip, MoveChip } from './SheetActions'
import { RangePicker, type Range } from './RangePicker'
import { Sheet } from './Sheet'
import { DateBox } from '../../ui/DateBox'
import { isLwOnScreen, subLwScreen } from '../state/screen'
import { dayLabel, shortDate, shortSpan } from './dates'
import { awardDays, awardsClause, halfWord } from './awardwords'
import { belowZeroAsk, goesBelow } from './belowzero'
import './bidpicker.css'
import './oiltracker.css'
import { creditWorthText } from '../engine/credit'
import type { DayWhatIf } from '../engine/whatif'
import { DayLine, dayLineCode } from './DayLine'
import { DutyButtons, GrantOilButton, LeaveButtons } from './LeaveButtons'
import { sayOnWar } from '../sync'
import { PlacedLine } from './PlacedLine'

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

/* WHY A FILL OR A DELETE SKIPPED DAYS — true for whoever reads it (M1's code read, L2 / F4, both readers): the open dates
   and his today bind a member's fill, never the admin's; a delete is stopped by a decided record or leave filed on the
   Inputs page, never by a closed day (a member deletes his own pending bid there — D1225). Shared by the range fill here
   and the drag-selected block's panel (SelectSheet). */
export function skipWhy(verb: string, role: 'admin' | 'member'): string {
  if (verb !== 'written') return 'already decided, or filed on the Inputs page'
  return role === 'member' ? 'closed for bidding, before today, or already holding leave or a medical' : 'already holding leave or a medical'
}

/** THE LEAVE A DAY HOLDS, for the window's lit button and its half (round 3's change 7, his D1331): its kind and its half
 *  where the day's code is a leave not refused — a pending bid or an approved leave — else null. */
function leaveOn(current: string, state?: BidState): { type: string; portion: Portion } | null {
  if (!current || state === 'refused') return null
  const c = parseCell(current)
  if (!c || !LEAVE_TYPES.some(t => t.type === c.type)) return null
  return { type: c.type, portion: c.portion }
}

export function BidPicker({
  callsign,
  personId,
  date,
  current,
  dates,
  onWrote,
  onKept,
  wouldLeave,
  dayLine,
  onPostOut,
  hasAccount,
  blockedFor,
  onPostIn,
  onCredit,
  credit,
  creditShown,
  decide,
  onMove,
  onCreditClear,
  awardCount = 0,
  onlyPortion,
  heldBy,
  heldOther,
  heldDay,
  approvedRow,
  dayState,
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
  /** Told the note of a placing whose approval was refused and KEPT PENDING ("Sat 16 Jun kept pending — He posted out on
   *  15 Jun: refuse or delete it."), so it stands where he looks next: on a day outside the man's time in the squadron the
   *  bid placed there makes the matrix open the day's list in this window's place, and the note would go with it (the
   *  fixes' round 3b — the rounds 2–3 walk's G3; lesson 3 of the order's §7.11, what tells the person it happened). */
  onKept?: (note: string) => void
  /** What the balance would read after this write, or `null` for leave that
   *  spends nothing. Supplied by the matrix, where the wars, openings and
   *  ledger already are. */
  wouldLeave?: (code: string, dates: readonly string[]) => { counter: CounterName; before: number; after: number } | null
  /** What the bid would do to manning on these days (D1144, D1213 — the day line at the window's top): the store's answer,
   *  supplied by the matrix as `wouldLeave` is (`sync.ts bidDayLine`). */
  dayLine?: (dates: readonly string[], code: string) => DayWhatIf[]
  /** Admin-only: post this person OUT (owner, 18 Aug 26; reworked 19 Aug 26
   *  — any date, not just the tapped day, and the "Archive on PO date"
   *  switch). Present only for an admin; the matrix wires it to the store and
   *  closes the sheet. A member never sees the control. */
  onPostOut?: (fromDate: string, outcome: PostOutcome) => string | void
  /** whether he has an account — the posting's one line names it only then (the sync answers it, at the seam) */
  hasAccount?: boolean
  /** why the chosen posting would be held back on its date (the last admin — the sync's lookup), or null */
  blockedFor?: (outcome: PostOutcome) => string | null
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
  onCredit?: (code: 'FO' | 'HO', days: string, note: string, givenBy: string, half: Half) => string | null
  /** The OIL already on this day, when a person granted it (owner, 20 Sep 26 —
   *  "when I click on FO or HO on the leave war, i should be able to see the
   *  reason and given by who if applicable and quantity"). The sheet names it
   *  and opens its controls already filled in, so reading it and changing it
   *  are the same tap. Absent when the day has none, or when the APP earned it
   *  off the published schedule — that one is the schedule's to change. */
  credit?: { code: 'FO' | 'HO'; days?: number; note?: string; givenBy?: string; half?: Half } | null
  /** How many OIL awards the day holds (admin). SEVERAL — two credits from the tracker on one date — and the +OIL panel
   *  changes none of them: it says so, and the day's list carries each ([OIL-AWARD-IS-A-GRANT]). */
  awardCount?: number
  /** WHAT THE OIL ON THIS DAY SAYS, shown on a single click without opening
   *  anything (owner, 21 Sep 26: "When i click on like FO or HO once, At the
   *  bottom i want to see the reason, given by and days granted"). Covers BOTH
   *  kinds: an award, which `credit` above also lets an admin edit, and one
   *  the app credited itself, which is read-only because the OIL pass owns it
   *  and would overwrite anything typed onto it. */
  creditShown?: { code: 'FO' | 'HO'; days?: number; note?: string; giver?: string; auto?: boolean; spans?: Array<[number, number]>; via?: 'schedule' | 'input'; entered?: string; half?: Half } | null
  /** THE FOUR THINGS AN ADMIN DOES TO AN INPUT — Ack, Approve, Refuse, Move
   *  — IN EVERY STAGE (owner, 21 Sep 26: "even a single click on an input, i
   *  should be able to click on a move button to move the input just like how
   *  i drag and select and click on move … enable it in all Stage on leave
   *  war"). Absent when the cell holds no bid to decide, or the reader is not
   *  an admin. Before this they lived on a separate sheet that only opened
   *  once bidding had closed, so the same input answered to different controls
   *  depending on which day of the cycle you clicked it. */
  decide?: { state?: BidState; movedFrom?: string } | null
  /** Pick these days' records up into the grid's move mode (D262) — the matrix closes the sheet and carries them. The
   *  day tapped, or every day of a picked range (D335: a range widens what the sheet acts on). Returns why it could
   *  not, for the sheet to say. `only`: just these records (a whole leave's own — D1461), as the day's list moves one. */
  onMove?: (cells: { personId: string; date: string }[], only?: readonly MoveRec[]) => string | void
  /** Take the granted OIL off this day. */
  onCreditClear?: () => void
  onlyPortion?: Portion | null
  /** What is already on the day, in the words the box shows, so the sheet can
   *  name the half it is NOT offering. */
  heldBy?: string
  /** THE HELD HALF IS A COMMITMENT UNDER UNAVAILABLE (his D1371 — an Other, an Attach…): its code and remarks, for the one
   *  line that names it — its box, its half, its remarks and where it is changed — in place of the leave's sentence */
  heldOther?: { code: string; remarks: string; to?: string } | null
  /** A COURSE HOLDING THE WHOLE DAY (his D1395 — [LW-TAP-HELD-DAY], drawn lw-m3n-draw.mjs d7): a short tap opens this
   *  window so more can be added (Grant OIL…), with ONE line on top for the course — its box, "Whole day", its remarks,
   *  and where it is changed — D1371's held-half line widened to a whole day */
  heldDay?: { code: string; remarks: string; to?: string } | null
  /** THE APPROVED LEAVE ON THIS DAY — the Raptor input it is (`sync.ts leaveInputAt`), for its Remarks and Document row,
   *  shown at once in place of the "Note" that opened them in a window of their own (his D1307; M1's code read, L6 had
   *  first given the window that Note). */
  approvedRow?: any
  /** the day's bid state, for every role — what is lit reads it (a refused bid lights no leave), the admin's decide aside */
  dayState?: BidState
  onClose: () => void
}) {
  // Deliberately not seeded from `current`: the portion resets to a whole
  // day for every cell opened. A picker that remembered the last choice
  // would silently write a half day on the next cell the bidder touched.
  /* …BUT A HALF DAY OPENS ON ITS OWN HALF (his D1331, round 3): on a day holding half a day of leave the Duration row
     opens with that half lit, AM for a morning, PM for an afternoon, so the window says it is a morning — and a leave
     changed from it keeps its half. A whole day, and every other day, still opens on "Whole day". */
  const dayLeave = !onlyPortion ? leaveOn(current, decide?.state ?? dayState) : null
  const [portion, setPortion] = useState<Portion>(onlyPortion ?? dayLeave?.portion ?? 'full')
  /* "APPROVE WHAT I ENTER" (D1147, D1186; D1302): an admin's switch in the title bar, remembered on this device until he
     changes it — on where he never has (BidBits.tsx useApproveMemory) */
  const isAdmin = getState().role === 'admin'
  const [approve, setApprove] = useApproveMemory()
  const approving = isAdmin && approve
  // The range, if the bidder has asked for one. `null` means this one day —
  // the common case, and the one that must stay a single tap.
  const [range, setRange] = useState<Range | null>(null)
  /* WHAT THE WINDOW ACTS ON: the range picked — or this one day, where none is, or where the range picked is only the day
     tapped (round 3: "Just this day" went, so a range picked back to the one day is the one day again — D1332) */
  const span: Range | null = range && !(range.from === date && range.to === date) ? range : null
  /* A LEAVE OF SEVERAL DAYS OPENS WHOLE (his D1448, D1461 — version 2): the leave the day tapped belongs to (the store's
     `leaveRunAt` — the joined bar's entry, the Approvals list's line), and the choice at the Duration row's right end of
     what Approve, Refuse, Move and Delete act on: "All <n> days", picked to start with, or the day tapped. Read on every
     render (a few days walked), so a leave changed under the open window — an Undo, another tab — is followed; a leave
     that shrinks to one day leaves the window as built. Never on a free half beside leave filed on the Inputs page. The
     pick is this window's alone, never saved. */
  const run = !onlyPortion ? leaveRunAt(personId, date) : null
  /* "ALL" IS PICKED AT OPEN ONLY ON A WINDOW THAT OPENS ON A LEAVE OF SEVERAL DAYS (D1461; the narrow read's N1): a
     one-day window whose day joins a leave under it — its words saved as the focus leaves the box, just BEFORE the click
     on Delete or Approve lands, or another tab — shows the chips with the day tapped picked, so the title, the mark and
     every press stay on the one day it showed; "All" is one deliberate tap away */
  const [pick, setPick] = useState<'all' | 'day'>(() => (run ? 'all' : 'day'))
  /* (a range picked wins — it was picked on a window with no leave of several days, and one joined under it since must not
     turn the title and the mark to the leave while the buttons act on the range: the code read's F1, its twin) */
  const whole = run && !span && pick === 'all' ? run : null
  /* what a range write covers: the range picked, or the whole leave on "All" (a leave button re-types it, CSE · OD · the ⋯'s
     filings file over it, as over a picked range — the spec's reading R2) */
  const multi: Range | null = span ?? (whole ? { from: whole.from, to: whole.to } : null)
  const [showCal, setShowCal] = useState(false)
  const [note, setNote] = useState('')
  // Which code the sheet has warned about. A second tap on the SAME leave is
  // the confirmation — a separate "are you sure" button would be a second
  // control to find on a phone, and tapping the thing you already meant to
  // tap is the least surprising way to say yes.
  /* The ask is a TOKEN of what it said — the leave, the days, the balance it named — not the leave alone (Astra's final
     read, F2, 29 Sep 26): a one-day ask kept armed after the range was widened let the wider fill write on ONE tap. It
     is also dropped whenever How many, the range or How much changes. */
  const [confirming, setConfirming] = useState<string | null>(null)
  // The post-out controls, folded behind the one PO button until the admin
  // asks (owner, 19 Aug 26 — "show this toggle when the admin clicks PO"):
  // the date (seeded with the tapped day, but ANY date is legal — past,
  // future, outside the war), the archive switch (ON by default), and the
  // confirm. Folding also stops a reflex tap posting someone out.
  const [poOpen, setPoOpen] = useState(false)
  const [poDate, setPoDate] = useState(date)
  /* the posting's outcome (D229) — Overseas Sqn by default, as "Archive on PO date" was on by default; a Delete's first
     tap arms it (D287 (3): it asks twice) */
  const [poOutcome, setPoOutcome] = useState<PostOutcome>('overseas')
  const [delArmed, setDelArmed] = useState(false)
  /* a "Tap again to delete" left armed is taken back when the Leave War leaves the screen — the page is kept mounted, so
     this sheet can wait open across a page switch for a tap from someone who no longer knows it was the second (the
     reason D1102's date ask is taken back there too) */
  /* [LW-ARMS-PAGE-LEAVE-REST] (27 Oct 26): every armed second tap here is taken back when the Leave War leaves the screen — the
       page is kept mounted, so the question could wait across a page switch for a tap from someone who no longer knows it
       was the second (the reason the posting doors' asks are taken back too, D1102) */
  /* the code read's F1 and F2: the one-day window's own "Delete — sure?" (clearAsked, clearIds) is taken back too, and the
     question's words with it */
  useEffect(() => subLwScreen(() => { if (!isLwOnScreen()) { setDelArmed(false); setConfirming(null); setClearAsked(false); setClearIds([]); setNote('') } }), [])
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
  /* the one amount control (his D1392, D1395 H — OilAmount.tsx): a lit pick, or any other amount typed */
  const start = oilStart(credit?.days)
  const [oilPick, setOilPick] = useState<OilPick>(start.pick)
  const [oilOther, setOilOther] = useState(start.other)
  const oilDays = oilAmountText(oilPick, oilOther)
  const oilN = oilNumber(oilDays)
  const oilCode: 'FO' | 'HO' = Number.isFinite(oilN) && oilN > 0 && oilN < 1 ? 'HO' : 'FO'
  /* WHICH HALF AN HO TAKES (owner, D1164): the award's own half when the day holds one; else the day's default — the
     other half beside a half-day leave, else the morning (the store's `defaultAwardHalf`). Not asked since his D1391 (which
     half a granted HO is does not matter): no Half row, the half only drawn. */
  const [oilHalf] = useState<Half>(credit?.half ?? defaultAwardHalf(personId, date))
  /* the reason a refused Move gives — a Move button that simply did nothing would read as broken */
  const [moveErr, setMoveErr] = useState('')

  /* A DECISION THAT DOES NOT LAND SAYS SO (Astra, 21 Sep 26). The first cut
     wrote and closed regardless, so wherever the store refuses — a cell the
     Inputs page owns, a stage that does not decide — the sheet shut as though
     the answer had been recorded. The affordance is gated too (Matrix passes
     `decide` only where a decision can land); this is the second line, because
     a control that silently does nothing is the worst of the three outcomes. */
  const answer = (bid: BidState) => {
    flushWords()   // words still in a box ride with the answer (round 3's FULL check)
    /* THE LIT APPROVE TAPPED AGAIN SENDS THE LEAVE BACK TO WAITING (his D1330, round 3): on an approved leave Approve
       shows lit, and a second tap on it is what "Back to bid" was — the leave a pending bid again (D1177: the admin
       decides at any time). Only for the ONE day: over a picked range the days may hold other answers (D335). */
    /* …AND SO DOES THE LIT REFUSE (his D1361, 25 Oct 26 — "a second tap on a lit Refuse sends the bid back to waiting, as a
       second tap on a lit Approve does") */
    const again = !span && decide?.state === bid
    if (again) bid = 'pending'
    /* ON "ALL" THE WHOLE LEAVE IS ONE LINE (D1461): Approvals' own writer decides it — one command, one Undo; a refusal by
       the rules ("He posts out on 11 Feb: refuse or delete it", a locked week) leaves every day as it was and says why */
    const w = wholeNow()
    if (w) {
      const [o] = decideRequests([{ personId, parts: w.parts, to: bid as DecideTo }])
      if (o && o.kind === 'done') return onClose()
      /* the whole leave is one line: a refusal leaves every day of it as it was, which the words say first (G8a) */
      setMoveErr(`Nothing was decided. ${o ? o.why : 'That could not be recorded'}.`.replace(/\.\.$/, '.'))
      return
    }
    /* (a leave that is no longer several days — joined or split under the window — is decided as the one day it now is) */
    const { decided, why } = setBidStates(cellsOf(null), bid)
    if (decided > 0) return onClose()
    /* the rules' own reason where they gave one — "He posts out on 1 Mar: refuse or delete it" — as Approvals says it (the
       fixes' M5, D1436) */
    setMoveErr(why[0] ? why[0] : span
      ? 'None of those days holds a bid this screen can decide.'
      : 'That could not be recorded — this day is not this screen’s to decide.')
  }
  const [oilErr, setOilErr] = useState('')
  const grantOil = () => {
    flushWords()   // the words first, so one Undo takes the award and leaves them (the narrow read's N2)
    const problem = onCredit!(oilCode, Number.isFinite(oilN) ? String(oilN) : oilDays, oilNote, oilGiven, oilHalf)
    if (problem) { setOilErr(problem); return }
    onClose()
  }

  /* the Delete's own confirm (D260, D332) — apart from `confirming`, which is the negative-balance one, keyed by leave code */
  const [clearAsked, setClearAsked] = useState(false)
  /* the awards the confirm NAMED — the Delete takes these and no other (Astra's round-2 read, R2-02: an award given on
     one of these days after the confirm stays) */
  const [clearIds, setClearIds] = useState<string[]>([])
  /* where the sheet's one note is drawn: under the Selected row for a Delete's confirm, under the leave chips for a
     leave's (the negative-balance ask, a refused write) — beside the button that raised it */
  const [noteAt, setNoteAt] = useState<'sel' | 'leave'>('leave')
  /* A REQUEST'S DOCUMENT AND REMARKS (M3 5.9, 5.10 — D1210, D1226, D1159): on a day holding one bid (and no range picked)
     the rows speak for THAT bid and save to it as they change (`lw.reqmeta`); otherwise they hold the words of the bid
     about to be placed, and the leave tap writes them with it. Not on an approved leave — its Note opens its remarks. */
  const [draft, setDraft] = useState<ReqDraft>(emptyDraft)
  const [heldEdit, setHeldEdit] = useState<ReqDraft | null>(null)
  /** The cells a range covers, for the store's questions about them. */
  const spanCells = (r: Range) => {
    const out: { personId: string; date: string }[] = []
    for (let d = r.from; d <= r.to; d = addDays(d, 1)) out.push({ personId, date: d })
    return out
  }
  /** WHAT THE SHEET ACTS ON (D335 — "5 keep": the one-day sheet keeps How many, and a picked range widens the
   *  selection): the day tapped, or every day of the range. Decide, Move and Delete all read this, as a drag across
   *  those days would (the drag-selection sheet's own selection). */
  /* …or every day of the whole leave on "All" (D1461) */
  const cellsOf = (w: LeaveRun | null) => (span ? spanCells(span) : w ? w.dates.map(d => ({ personId, date: d })) : [{ personId, date }])
  const selCells = () => cellsOf(whole)
  /* THE LEAVE AS IT STANDS AT THE PRESS (the scenario designer's G4): every press saves the words still in a box first
     (`flushWords`), and words saved can join the leave to a next-door bid with the same words — or another tab may have
     changed it since the window drew — so each press reads the leave again after the save and acts on that */
  /* …ONLY on a window that drew a leave of several days, "All" picked, no range picked (the code read's F1): a one-day
     window whose words join it to a next-door leave at the save acts on its one day, as it always did — never on days it
     never named; a range picked keeps its range */
  const wholeNow = (): LeaveRun | null => (run && !span && pick === 'all' && !onlyPortion ? leaveRunAt(personId, date) : null)
  /* The Selected row's two buttons are drawn only where they would do something — the house rule for a control that
     could not work (a disabled chip invites a tap and then refuses it). Move: a record on these days this role may move
     (the store's one rule, D333 — so a member's own bid offers it while bidding is open); Delete: a day a Delete would
     change (an award for the admin, a bid, a leave the war approved and may remove). */
  /* On "All" both ask of the LEAVE's own records, not of everything on its days (D1461 — the spec's reading R3): an OIL award
     or the other half's bid sharing one of its days is not what was picked */
  const canMoveHere = !!onMove && (whole ? movableRecords(selCells(), whole.recs) : movableRecords(selCells())).length > 0
  const canDeleteHere = whole ? deletableRecords(whole.recs) > 0 : deletableIn(selCells()) > 0
  /* DECIDE OVER A PICKED RANGE, EVEN FROM A DAY WITH NO BID (the final reads, Fable 4 / Astra 2, both blind): the row was
     drawn from the tapped day alone, so a range holding bids around an empty tapped day offered Move and Delete but no
     Decide — though D335 widens Decide to the range. With a range it is drawn wherever a Decide would answer something
     (`decidableIn` — `setBidStates`'s own eligibility, the admin at any time — D1177). */
  const canDecideHere = !!decide || (!!span && decidableIn(selCells()) > 0)
  /* THE BOX SPEAKS FOR THE HELD BID ONLY ON ITS OWN HALF ([LW-NIGHT1025-OLDER] (a), the night's walker 2, INC-1): on a day
     holding a morning bid, PM pressed and words typed went onto the MORNING bid ("Am" became "AmPm") and the new afternoon
     bid had none. While Duration covers the held bid's half (its own half, or the whole day, which replaces it and carries
     its words) the box is the held bid's; on the other half it is the new bid's, empty to start. */
  const heldAny = !span ? heldRequest(personId, date) : null
  const covers = (p: Portion) => {
    const h = heldAny ? parseCell(heldAny.rec.code)?.portion ?? 'full' : 'full'
    return p === 'full' || h === 'full' || h === p
  }
  const held = heldAny && covers(portion) ? heldAny : null
  /* the approved leave's own row speaks for the day only while no range widens it (a range's words go with the fill) */
  const leaveRow = !span && !held && !onlyPortion ? approvedRow : null   // never the free half's (the fresh read's R1)
  const words = held ? (heldEdit ?? draftOf(held.rec)) : draft
  const onWords = (next: ReqDraft, how: 'type' | 'commit') => {
    if (!held) return setDraft(next)
    if (how === 'type') return setHeldEdit(next)
    const patch = patchOf(draftOf(held.rec), next)
    if (patch) setRequestWords(personId, date, held.rec.id, patch)
    setHeldEdit(null)
  }
  /* the words a new bid is written with: the window's own on a new bid; on a held one its own carry over by themselves
     (5.11 — the store keeps a re-typed bid's words) */
  /* …except a REFUSED bid bid again: the store carries words only from a live bid it replaces, so the words in its box ride
     with the new bid here (the fresh read's R2 — they stayed on the refused record) */
  const newWords = !held ? wordsOf(draft) : held.rec.state === 'refused' ? wordsOf(words) : undefined
  /* ROUND 2 (his D1318, D1324 — [LW-FILE-OD-CRS]): a course, an overseas duty or the unforeseen absence filed straight for the
     day or the picked range — no bid, nothing to approve — with the words typed for something new (never a held bid's own,
     which its box speaks for); the window closes on it, as a leave placed does. Where nothing could be filed it says why. */
  const fileDuty = (code: string) => {
    flushWords()
    /* an Other and an Attach take the window's Duration (his D1365, D1380 — whole day, AM or PM); a course and an overseas
       duty whole days */
    const r = fileStraight(cellsOf(wholeNow()), code, !held ? wordsOf(draft) : undefined, code === 'OTH' || code === 'ATCH' ? portion : 'full')
    /* …and where a day of a range was left out (it already held the same kind, a locked week) it is said (round 2's FULL
       check — the fresh code read's F2): as a passing note, since the window closes — the day tapped now holds the input,
       and the grid opens that input's own window for it (the design guide: a press that did less than expected, D850) */
    if (r.done > 0) {
      if (r.skipped) sayOnWar(`${r.done} day${r.done === 1 ? '' : 's'} filed. ${r.why[0] ?? `${r.skipped} day${r.skipped === 1 ? ' was' : 's were'} not yours to change`}.`)
      return onClose()
    }
    setNoteAt('leave')
    setNote(r.why[0] ?? 'Nothing was filed: these days are not yours to change.')
  }
  /* (the fresh read's 5) words typed on a held bid and not yet saved — the box not left — are saved as the window closes,
     as its documents already were the moment they were picked: Escape, ✕ or a tap outside never loses them */
  /* …AND BEFORE ANY ACTION (round 3's FULL check — the scenario designer's S15): an iPhone keeps the box focused when a
     button is tapped, so Approve, Refuse, Move, Delete or a leave pressed with words still in the box went ahead without
     them. Saved first, they ride with what the action does — onto the leave a bid becomes, back onto the bid a leave
     becomes again (the store carries a bid's words both ways, 7.2); the approved leave's own box the same (`leaveFlush`). */
  const leaveFlush = useRef<(() => void) | null>(null)
  /* …and as the window leaves the screen by ANY road — the ⋯'s panels close it themselves (Give FO, Remove, Post out's and
     Post in's confirm): the fresh read's R7. Kept in a ref, saved once: a save already made clears it. */
  const heldSave = useRef<(() => void) | null>(null)
  heldSave.current = held && heldEdit ? () => { const p = patchOf(draftOf(held.rec), heldEdit); if (p) setRequestWords(personId, date, held.rec.id, p) } : null
  useEffect(() => () => { heldSave.current?.() }, [])
  const flushWords = () => {
    if (heldSave.current) { heldSave.current(); heldSave.current = null; setHeldEdit(null) }
    leaveFlush.current?.()
  }
  const closeKeeping = () => {
    flushWords()
    onClose()
  }
  /* the day line: read again only when what it reads changes — the days, the half, the war (a write replaces the state) */
  const st = getState()
  const lineDays = useMemo(
    () => (dayLine ? dayLine(selCells().map(c => c.date), dayLineCode(portion)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [!!dayLine, personId, date, span?.from, span?.to, whole?.from, whole?.to, portion, st],
  )

  /* THE GRID MARKS WHAT THE WINDOW ACTS ON (his D1289; D1461's drawing): the drag-selection's own cyan (`matrix.css
     td.selcell`) on the day tapped, the range picked or every day of the leave on "All" — put on the cells while the window
     is open and taken off when it closes or the pick changes. A class on the cell, never a repaint of the grid
     (`docs/performance.md` §E — the way `cellring.ts` rings a cell). KEPT ON WHILE THE GRID CHANGES UNDER IT (the scenario
     designer's G2): a row the store re-renders rebuilds its cells' class (React), a month drawn later — the phone's
     rolling window — brings a cell that was not there, and a drag's own clear takes the class off what it painted; so the
     grid is watched while the window is open and the mark laid on again wherever it went missing (a few cells looked up
     per change — never the grid walked). A class, not a stylesheet rule: the joined bar's own rules (`td:not(.selcell)`)
     must see it, so a picked day shows its own box as the drawing does. */
  const markDates = selCells().map(c => c.date).join(',')
  useLayoutEffect(() => {
    const ids = markDates.split(',').map(d => `td[data-testid="cell-${personId}-${d}"]`)
    const marked = new Set<HTMLElement>()
    const lay = () => {
      for (const sel of ids) {
        const e = document.querySelector<HTMLElement>(sel)
        if (e && !e.classList.contains('selcell')) e.classList.add('selcell')
        if (e) marked.add(e)
      }
    }
    lay()
    const grid = document.querySelector<HTMLElement>(`td[data-testid^="cell-${personId}-"]`)?.closest('table') ?? null
    const watch = grid && typeof MutationObserver !== 'undefined' ? new MutationObserver(lay) : null
    watch?.observe(grid!, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
    return () => { watch?.disconnect(); for (const e of marked) e.classList.remove('selcell') }
  }, [markDates, personId])

  const write = (code: string) => {
    flushWords()   // words still in a box ride with the write (round 3's FULL check)
    /* the leave as it stands now the words are saved (G4) — what this press covers, read again, never the drawn one */
    const whole = wholeNow()
    const multi: Range | null = span ?? (whole ? { from: whole.from, to: whole.to } : null)
    const selCells = () => cellsOf(whole)
    /* CLEAR NAMES THE OIL AWARD IT TAKES, AND ASKS ONCE (owner, D260, 27 Sep 26 — "B"; the absence-record re-test, AB1).
       A Clear removes the admin's award on the day with everything else (that stands — his ruling), but it used to do
       it silently and the man's OIL dropped. On a day — or a picked range — holding an award, the first tap names each
       one and takes nothing; the same Clear again goes ahead. `awardsIn` is the store's own question, so what is named
       is what goes; a member's Clear takes no award, so it never asks. */
    /* THE ONE WORD IS "DELETE" (owner, D332, 27 Sep 26 — "2 yes"): this was the bid sheet's Clear, a leave chip at the end
       of Which leave; it is now the Selected row's Delete, the same button and word as the drag-selection sheet's and the
       day's list's. What it takes and how it asks are unchanged (D260). */
    setNoteAt(code ? 'leave' : 'sel')
    /* DELETE ON "ALL" TAKES THE LEAVE AND NOTHING ELSE ON ITS DAYS (D1461 — the spec's reading R3): its own records, in one
       command (the store's `clearRecords`); an award sharing a day is not taken, so there is no award to name first */
    if (!code && whole) {
      setClearAsked(false); setConfirming(null)
      const { written, skipped, why: doorWhy } = clearRecords(whole.recs)
      if (written > 0) onWrote?.('')
      if (written > 0 && skipped === 0) return onClose()
      /* a day left says why — the door's own reason where it gave one (a locked week — G8b), else who may change it */
      const why = doorWhy.length ? doorWhy.join('. ') : `Those days are ${skipWhy('deleted', getState().role)}`
      return setNote(written === 0 ? `Nothing was deleted. ${why}.` : `${written} of ${whole.dates.length} days deleted. ${why}.`)
    }
    /* THE LIT LEAVE TAPPED AGAIN ON "ALL", AUTO-APPROVE OFF (G6): every day already holds this very bid, so nothing is
       written — the window closes, as the one-day window does, never "none of those days could be written" */
    if (code && whole && !approving && whole.kind === 'request' && whole.state === 'pending' && whole.parts.every(p => p.code === code)) return onClose()
    if (!code) {
      const cells = span ? spanCells(span) : [{ personId, date }]
      const awards = awardsIn(cells)
      if (awards.length && !clearAsked) {
        setClearAsked(true)
        setClearIds(awards.map(a => a.id))
        setConfirming(null)
        return setNote(awards.length === 1
          ? `Delete also takes ${callsign}’s OIL award (${awardDays(awards[0]!.days)}) — tap Delete again to go ahead.`
          : `Delete also takes ${awardsClause(awards, () => callsign)} — tap Delete again to go ahead.`)
      }
    } else setClearAsked(false)
    // Ask before taking someone below zero. Never REFUSE: a balance is allowed
    // to run negative and the owner was explicit that it must stay possible.
    // What was wrong was doing it silently, so this is a confirmation, not a
    // rule.
    // The days it covers — the one tapped, or every day of a picked range — read
    // as the balance column reads them (the store's `balanceAfterFill`, D418).
    const days = selCells().map(c => c.date)
    const after = code && wouldLeave ? wouldLeave(code, days) : null
    if (goesBelow(after)) {
      const token = `${code}|${days.join(',')}|${after.after}`
      if (confirming !== token) {
        setConfirming(token)
        return setNote(belowZeroAsk([{ callsign, counter: after.counter, after: after.after }]))
      }
    }
    setConfirming(null)

    /* ticked: placed and approved in one command, one Undo (`placeApproved`); a day its approval refuses keeps its bid,
       pending, and is named here — never a whole-window failure */
    if (code && approving) {
      const why1 = !multi ? cellProblem(personId, date, code) : null
      if (why1) return setNote(why1)
      const r = placeApproved(selCells(), code, newWords)
      if (r.written > 0) onWrote?.(code)
      if (!r.pending.length && !r.skipped) return onClose()
      const parts: string[] = []
      if (r.skipped) parts.push(`${r.skipped} day${r.skipped === 1 ? '' : 's'} not written: ${skipWhy('written', getState().role)}`)
      /* the door's own reason where it gave one ("He posts out on 1 Mar: refuse or delete it" — the fixes' round 2, R2-4),
         several each a sentence of its own (round 3, R3-4) */
      if (r.pending.length) parts.push(`${r.pending.map(p => shortDate(p.date)).join(', ')} kept pending — ${r.why.length ? r.why.join('. ') : 'not approved (a locked week, or leave or a medical already there)'}`)
      const said = parts.join('. ') + '.'
      if (r.pending.length) onKept?.(said)
      return setNote(said)
    }

    if (!multi) {
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
        const { written } = clearCells([{ personId, date }], clearAsked ? clearIds : awardsIn([{ personId, date }]).map(a => a.id))
        if (!written) return setNote('Nothing here can be deleted from the war: approved leave and leave filed on the Inputs page are changed on the Inputs page.')
        onWrote?.('')
        return onClose()
      }
      const why = cellProblem(personId, date, code)
      if (why) return setNote(why)
      setCell(personId, date, code, newWords)
      onWrote?.(code)
      return onClose()
    }
    // A range that crosses a locked day, a Raptor cell or a posting-out date
    // writes what it may and says what it did not. Refusing the whole range
    // would make a fortnight that happens to include one such day impossible
    // to ask for at all.
    /* A RANGE'S CLEAR GOES THROUGH THE SAME DOOR AS THE ONE-DAY CLEAR (Fable's final read, F5, 27 Sep 26): an empty
       code written over each day strips only the war's own records, so a leave the WAR approved inside the span stayed,
       unsaid, and the sheet closed as done. `clearCells` removes it through the absence door (or counts it where it may
       not go — a published war's finished paperwork), exactly as the one-day Clear and a dragged block's Delete do. */
    const { written, skipped } = code ? setCellRange(personId, multi.from, multi.to, code, newWords)
      : clearCells(spanCells(multi), clearAsked ? clearIds : awardsIn(spanCells(multi)).map(a => a.id))
    if (written > 0) onWrote?.(code)
    if (skipped === 0) return onClose()
    const verb = code ? 'written' : 'deleted'
    /* WHY DAYS WERE SKIPPED, in the words of what can refuse a day now (M1's walk, B-N1): the open dates replaced the
       bidding window, so "locked … or outside the window" no longer named the commonest reason, a closed day */
    const why = skipWhy(verb, getState().role)
    setNote(
      written === 0
        ? `None of those days could be ${verb}. They are ${why}.`
        : `${written} day${written === 1 ? '' : 's'} ${verb}. ${skipped} skipped: ${why}.`,
    )
  }

  /* THE ⋯'s MENU (his D1326, D1320 — round 3's change 8): Grant OIL, Post out and Post in, the admin's three management
     actions, behind one button in the fourth place of the row under the leaves; each opens the panel it always opened.
     A day holding SEVERAL OIL awards names them, and its panel says they are changed from the day's list. */
  /* …SINCE HIS D1349 / D1356 (25 Oct 26): Grant OIL, which is commonly used, takes the THIRD place of the row as a button of
     its own (`GrantOilButton`); the ⋯ holds Other — an admin's, filed straight under Unavailable on the window's Duration
     (D1365) — then Post out and Post in */
  const grant = onCredit ? {
    label: awardCount > 1 ? `${awardCount} OIL awards` : credit ? `${credit.code} · ${creditWorthText({ ...credit, auto: false })}` : 'Grant OIL',
    title: awardCount > 1 ? "This day holds several OIL awards — change them from the day's list"
      : credit ? 'The OIL on this day — its reason, who gave it and how many days' : 'Grant OIL — a day or half a day off in lieu, for any reason',
  } : null
  const moreItems: MoreItem[] = [
    /* Attach first, for everyone who may file on this row (his D1378, D1379) — a member's ⋯ holds it alone */
    { key: 'atch', testid: 'bid-file-ATCH', label: 'Attach', title: 'Attach: attached to another squadron, a job or an exercise — filed under Unavailable on the schedule, for the Duration picked; where to is added on the Inputs page', onPick: () => fileDuty('ATCH') },
    ...(isAdmin ? [{ key: 'oth', testid: 'bid-file-OTH', label: 'Other', title: 'Other: out of the manning — filed under Unavailable on the schedule, for the Duration picked; any other time is set on the Inputs page', onPick: () => fileDuty('OTH') }] : []),
    ...(onPostOut ? [{ key: 'po', testid: 'bid-postout', label: 'Post out', title: 'Post out — their last day in the squadron', onPick: () => setPoOpen(true) }] : []),
    ...(onPostIn ? [{ key: 'pi', testid: 'bid-postin', label: 'Post in', title: 'Post in — their first day in the squadron', onPick: () => setPiOpen(true) }] : []),
  ]
  const panelOpen = oilOpen || poOpen || piOpen
  /* the day's own leave, lit (round 3's change 7, his Q6): its button wears the ring — never on a free half beside leave
     filed on the Inputs page, where the leave named is the other half's */
  /* …and a REFUSED bid's leave wears it too (his D1355): the window says which leave was refused, as an approved leave's
     says which was approved — its half is not lit (a refused bid holds no half of the day). Only beside the lit Refuse (an
     admin's window): a member's window on his own refused bid has no Refuse, and a ring alone there read as leave he
     holds (round 3's FULL check, the designer's S1 — `round3.test.tsx`) */
  const refusedType = !onlyPortion && decide?.state === 'refused' ? parseCell(current)?.type ?? null : null
  const lit = dayLeave?.type ?? (refusedType && LEAVE_TYPES.some(t => t.type === refusedType) ? refusedType : null)

  return (
    <Sheet testid="bid-picker" label="Place a bid" onClose={closeKeeping}>
      {/* THE TITLE BAR (round 3): the name, the day, the admin's switch and ✕ — "now LL" went (change 7: the lit button
          says which leave the day holds, D1331 its half) */}
      <div className="bidsheet-hd">
        <span className="who">{callsign}</span>
        {/* on "All" the leave's dates, in the drag window's voice ("9–12 Feb" — BidBits compactSpan); else the day (D1461) */}
        <span className="dt when">{whole ? compactSpan(whole.from, whole.to) : dayLabel(date)}</span>
        {isAdmin && <ApproveSwitch testid="bid-approve-tick" on={approve} onChange={v => { setApprove(v); setConfirming(null) }} />}
        <button className="x" data-testid="bid-cancel" onClick={closeKeeping} aria-label="Cancel">
          ✕
        </button>
      </div>
      <DayLine days={lineDays} />
      {/* who placed the day's entries and who decided them (M4 8.6 — r7-13): one compact line an entry */}
      {!span && <PlacedLine personId={personId} date={date} />}
      {heldDay && (
        <div className="bidsheet-row">
          <span className="note bp-wide bp-heldline" data-testid="bid-heldday">
            <EntryBox code={heldDay.code} fill="a" place="whole" />
            <span>Whole day</span>
            {heldDay.to && <span>· {heldDay.to}</span>}
            {heldDay.remarks && <span className="bp-heldwords">“{heldDay.remarks}”</span>}
            <span>· change it on the Inputs page</span>
          </span>
        </div>
      )}

      {/* ROUND 3 OF THE WINDOW (his D1311, approved whole — D1332, D1334): its rows carry no labels — each row's buttons say
          what they are, and a screen reader still hears each row's name; the rows stand in one order on every day — what
          is there (one row of actions), its words (Remarks and Document), then placing leave (Duration, then the leave).
          ONE FORMAT AND LOOK FOR THE TWO SHEETS (owner, D264): the drag-selection window draws the same rows in the same
          order, with the same buttons (SheetActions.tsx, BidBits.tsx). A row with nothing to act on is not drawn. */}

      {/* THE ACTIONS — Approve · Refuse · Move · Delete on one row (round 3's change 3, his D1330): Decide and Selected
          were two rows. The admin's answers stay live on an already-decided bid: management tries one, watches the
          manning rows move, and changes it back. On an approved leave Approve shows lit and a second tap sends it back to
          waiting. Over a picked range they answer every day of it (D335). ONE CHIP, ONE MOVE (owner, D262): Move picks
          the records up into the grid's own move mode — no date box; every record on these days this role may move goes
          (D265), for a member too on his own bid while bidding is open (D333). Delete was this sheet's Clear (D332).
          "Note" went (D1307): an approved leave's Remarks and Document stand in the row under this one. */}
      {(canDecideHere || canMoveHere || canDeleteHere) && (
        <div className="bidsheet-row bp-acts" data-testid="bid-actions" role="group" aria-label="Actions">
          {canDecideHere && (
            <>
              {/* Approve · Refuse — Ack is gone (D1158, 21 Oct 26): a bid simply waits until it is decided. THE DECIDED ONE
                  SAYS SO (his D1361, D1355): both rest grey, their words in their colours; the entry's state is solid green
                  or red with dark words and reads "Approved" or "Refused" — a change in kind, never a stronger shade (design
                  lesson 54) — and a second tap on it sends the bid back to waiting. */}
              <button
                className={`dchip dec approve${!span && decide?.state === 'approved' ? ' lit' : ''}`}
                data-testid="decide-approve"
                aria-pressed={!span && decide?.state === 'approved'}
                title={!span && decide?.state === 'approved' ? 'Approved — tap again to send it back to waiting' : undefined}
                onClick={() => answer('approved')}
              >
                {!span && decide?.state === 'approved' ? 'Approved' : 'Approve'}
              </button>
              <button
                className={`dchip dec refuse${!span && decide?.state === 'refused' ? ' lit' : ''}`}
                data-testid="decide-refuse"
                aria-pressed={!span && decide?.state === 'refused'}
                title={!span && decide?.state === 'refused' ? 'Refused — tap again to send it back to waiting' : undefined}
                onClick={() => answer('refused')}
              >
                {!span && decide?.state === 'refused' ? 'Refused' : 'Refuse'}
              </button>
            </>
          )}
          {canMoveHere && (
            <MoveChip testid="decide-shift" onClick={() => {
              flushWords()   // the words saved before the records are picked up (round 3's FULL check)
              /* on "All" the leave's own records only (D1461), as the day's list moves one record (D266) */
              const w = wholeNow()   // the leave as it stands now the words are saved (G4)
              const why = w ? onMove?.(cellsOf(w), w.recs) : onMove?.(cellsOf(null))
              if (why) setMoveErr(why)
            }} />
          )}
          {canDeleteHere && <DeleteChip testid="bid-clear" armed={clearAsked} onClick={() => write('')} />}
          {decide?.movedFrom && (
            <span className="note bp-wide" data-testid="decide-movedfrom">moved from {decide.movedFrom ? shortDate(decide.movedFrom) : ''}</span>
          )}
          {moveErr && <span className="note warn bp-wide" data-testid="shift-problem">{moveErr}</span>}
        </div>
      )}
      {!(canDecideHere || canMoveHere || canDeleteHere) && moveErr && (
        <div className="bidsheet-row"><span className="note warn" data-testid="shift-problem">{moveErr}</span></div>
      )}
      {note && noteAt === 'sel' && (
        <div className="bidsheet-row"><span className="note warn" data-testid="span-note">{note}</span></div>
      )}

      {/* REMARKS AND DOCUMENT ON ONE ROW (round 3's change 4): the dark box (D1308) that wraps and grows (D1333), its "till"
          date, the app's one Document button — the held bid's own, the approved leave's own (D1307, saved onto the leave on
          the Inputs page), or the words of the bid about to be placed */}
      {leaveRow
        ? <LeaveWords row={leaveRow} personId={personId} flushRef={leaveFlush} onRefused={why => { setNoteAt('leave'); setNote(why) }} />
        : <ReqWordsRows compact value={words} onChange={onWords} start={span ? span.from : date} end={span ? span.to : held ? held.end : date} />}

      {/* DURATION, with "Pick a range" at its end (round 3's change 5): "Just this day" went — it is always the default,
          and a range picked back to the day tapped is the one day again. The range stays the exception, one extra tap
          (the owner's ask: a fortnight of leave is one selection, not fourteen taps). */}
      <div className="bidsheet-row bp-dur" role="group" aria-label="Duration">
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
            onClick={() => {
              /* words typed on the held bid are saved onto it before the box turns to the other half's new bid */
              if (held && !covers(p.portion)) flushWords()
              setPortion(p.portion); setConfirming(null)
            }}
          >
            {p.label}
          </button>
        ))}
        {onlyPortion && !heldOther && (
          <span className="note bp-wide" data-testid="bid-heldhalf">
            The {onlyPortion === 'pm' ? 'morning' : 'afternoon'} is {heldBy || 'already taken'},
            filed on the Inputs page — change that there.
          </span>
        )}
        {/* A HALF-DAY OTHER HELD (his D1371 — drawn by scripts/handpass/lw-1025-q7.mjs, SET c2): one line — its box in its
            outlined look, "Morning" or "Afternoon", its remarks, and where it is changed — the same for an admin and a member */}
        {onlyPortion && heldOther && (
          <span className="note bp-wide bp-heldline" data-testid="bid-heldhalf">
            <EntryBox code={heldOther.code} fill="a" place={onlyPortion === 'pm' ? 'top' : 'bot'} />
            <span>{onlyPortion === 'pm' ? 'Morning' : 'Afternoon'}</span>
            {heldOther.to && <span>· {heldOther.to}</span>}
            {heldOther.remarks && <span className="bp-heldwords">“{heldOther.remarks}”</span>}
            <span>· change it on the Inputs page</span>
          </span>
        )}
        {/* ON A LEAVE OF SEVERAL DAYS (his D1461 — version 2): "Pick a range"'s place holds the choice of what Approve,
            Refuse, Move and Delete act on — "All <n> days" (picked to start with) or the day tapped ("Tue 13") — so the
            window keeps its height. Picking either takes back an armed question and a note about the other. */}
        {run && !span && (
          <span className="bp-scope" role="group" aria-label="What it acts on">
            {(['all', 'day'] as const).map(k => (
              <button
                key={k}
                type="button"
                data-testid={`scope-${k}`}
                className={`pchip${pick === k ? ' on' : ''}`}
                aria-pressed={pick === k}
                /* named in full for a screen reader — the dates, the month (the scenario designer's G11) */
                aria-label={k === 'all' ? `All ${run.dates.length} days, ${compactSpan(run.from, run.to).replace(/\s*–\s*/, ' to ')}` : `Only ${dayLabel(date)}`}
                onClick={() => { setPick(k); setNote(''); setClearAsked(false); setClearIds([]); setMoveErr(''); setConfirming(null) }}
              >
                {k === 'all' ? `All ${run.dates.length} days` : dayLabel(date).split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </span>
        )}
        {(!run || span) && <button
          data-testid="span-range"
          className={`pchip bp-range${span ? ' on' : ''}`}
          aria-pressed={!!span}
          // Seeded with the day already tapped, so the calendar opens on the
          // right month AND the very next tap completes the span. The bidder
          // chose their start by opening this cell; asking for it again would
          // be the extra work this control exists to remove.
          /* …and tapped again it closes the calendar, the range picked kept (round 3's FULL check: "Just this day" had closed it,
             and with it gone the calendar stayed open with only the window's ✕ to shut it); a pick of one day closed unfinished
             goes back to the day tapped, as "Just this day" did (the fresh read's R6) */
          aria-expanded={showCal}
          onClick={() => { if (showCal) { setShowCal(false); if (range && range.from === range.to) { setRange(null); setNote(''); setClearAsked(false); setClearIds([]); setMoveErr(''); setConfirming(null) } return } setShowCal(true); setRange(r => r ?? { from: date, to: date }); setNote(''); setClearAsked(false); setMoveErr(''); setConfirming(null) }}
        >
          {span ? shortSpan(span.from, span.to) : 'Pick a range'}
        </button>}
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
            onChange={r => { setRange(r); setNote(''); setClearAsked(false); setMoveErr(''); setConfirming(null) }}
          />
        </div>
      )}

      <div className="bidsheet-row" role="group" aria-label="Which leave">
        {/* Straight off the catalogue, so the eight types stay defined in one
            place. Duty, medical and courses are absent by construction —
            they are not leave types, and offering them here would invite a
            scheduler's data to be typed in as if it were a bid. */}
        {/* the eight in two rows of four, each its kind's colour and what is left of it (M3 5.2–5.6 — LeaveButtons.tsx),
            the row's full width now its label went (round 3's change 6, his D1334) */}
        {/* each button's "left" is his War bal AFTER this leave is placed on the days the window acts on, in the half picked
            (the M5a spec §1.6 — the engine's what-if; walker D's FAILs 1–4: it read the figure as it stood, whatever the day
            or the half) — the very days and code a press writes and the below-zero ask reads */}
        <LeaveButtons portion={portion} onPick={write} filled={approving} lit={lit}
          figure={wouldLeave ? (() => { const ds = selCells().map(c => c.date); return (code: string) => wouldLeave(code, ds)?.after ?? null })() : undefined} />
        {note && noteAt === 'leave' && <span className="note warn" data-testid="span-note">{note}</span>}
      </div>

      {/* Medical is MEMBER-FILED ONLY (owner, 13 Sep 26, reversing the 17 Aug
          "management marks it" rule): the war no longer offers the medical
          markers to anyone. A member files a medical input with its certificate
          on Raptor's Inputs page and it syncs in read-only — the war displays
          it, never creates it. The old admin medical row is gone. */}

      {/* THE ROW UNDER THE LEAVES, the ⋯ in its fourth place (his D1326): Grant OIL (in OIL given's green, D1320), Post out
          and Post in, rarely used, behind one button — they were the "Also" row. Each is the opposite fact to placing leave
          and is folded, so none can be hit by reflex; the row steps aside while a panel it opened is up. A member has none
          of the three. */}
      {!panelOpen && (
        <div className="bidsheet-row bp-extra" data-testid="bid-extra-row">
          {/* CSE · OD in the first two places (round 2), Grant OIL the third (his D1349 — an admin's), the ⋯ the fourth
              (Other, Post out, Post in); a member's third and fourth places stay empty */}
          <DutyButtons onFile={fileDuty} />
          {grant && <GrantOilButton label={grant.label} title={grant.title} onPick={() => setOilOpen(true)} />}
          {moreItems.length > 0 && <MoreButton testid="bid-more" items={moreItems} />}
        </div>
      )}
      {onCredit && oilOpen && awardCount > 1 && (
        <div className="bidsheet-row postout">
          <span className="note" data-testid="oil-several">This day holds {awardCount} OIL awards — change them from the day’s list.</span>
        </div>
      )}
      {onCredit && oilOpen && awardCount <= 1 && (
        <>
          {/* What is already there, in words, before any box — an admin who
              tapped the cell to READ it should not have to infer it from the
              state of three inputs. */}
          {credit && (
            <div className="bidsheet-row postout">
              <span className="note" data-testid="oil-current">
                {creditWorthText({ ...credit, auto: false })} of OIL{credit.half ? `, ${halfWord(credit.half)}` : ''}{credit.note ? ` — ${credit.note}` : ''}
                {credit.givenBy ? `, given by ${credit.givenBy}` : ''}.
              </span>
              {onCreditClear && (
                <button className="tchip clear" data-testid="oil-clear" onClick={() => { flushWords(); onCreditClear() }}>Remove</button>
              )}
            </div>
          )}
          <div className="bidsheet-row postout">
            <input
              className="oil-text" maxLength={MAX_REASON}
              data-testid="oil-why" aria-label="Reason" placeholder="why — any reason"
              value={oilNote} onChange={e => { setOilErr(''); setOilNote(e.target.value) }}
            />
            <input
              className="oil-text given" maxLength={MAX_GIVEN_BY}
              data-testid="oil-given-by" aria-label="Given by" placeholder="given by (optional)"
              value={oilGiven} onChange={e => { setOilErr(''); setOilGiven(e.target.value) }}
            />
          </div>
          {/* THE ONE AMOUNT CONTROL (his D1392, D1395 H, D1397): HO · 0.5 and FO · 1 to pick, a box for any other amount, the button
              naming what it gives; no morning / afternoon row (D1391) */}
          <OilAmount pick={oilPick} other={oilOther} err={oilErr}
            onPick={p => { setOilErr(''); setOilPick(p); setOilOther('') }}
            onOther={v => { setOilErr(''); setOilOther(v) }}
            onGive={grantOil} />
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
                joining date can sit anywhere in real time. The app's own date
                box (owner D796, D797): its month-and-year lists are what reach
                a year the arrows would take twelve taps a year to walk to. */}
            <DateBox className="dateinput" testid="pi-date" label={`Post ${callsign} in from`}
              value={piDate} onChange={v => { setPostErr(''); setPiDate(v) }} />
          </div>
          <div className="bidsheet-row postout">
            <button
              className="dchip po"
              data-testid="pi-confirm"
              disabled={!piDate}
              onClick={() => { flushWords(); const why = onPostIn(piDate); setPostErr(why || '') }}
            >
              {/* D300 (the agent's reading, stated to him): "Post in", the date already in its own box */}
              Post in
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
                infinity"). The app's own date box (owner D796, D797): a
                single date, not a range, and its month-and-year lists are what
                reach a year the arrows would take twelve taps a year to walk
                to. */}
            <DateBox className="dateinput" testid="po-date" label={`Post ${callsign} out from`}
              value={poDate} onChange={v => { setPostErr(''); setDelArmed(false); setPoDate(v) }} />
          </div>
          {/* [POST-OUT-OUTCOMES] (D229, D294, D298, D300): which posting it is — four short chips; one line saying what
              the chosen one does on the date; the button just "Post out". A Delete asks twice (D287 (3)). */}
          <OutcomeChips value={poOutcome} testid="po"
            onChange={o => { setPoOutcome(o); setDelArmed(false); setPostErr('') }} />
          {outcomeLine(poOutcome, poDate, !!hasAccount) && (
            <div className="bidsheet-row postout"><span className="note" data-testid="po-line">{outcomeLine(poOutcome, poDate, !!hasAccount)}</span></div>
          )}
          {blockedFor && blockedFor(poOutcome) && (
            <div className="bidsheet-row postout"><span className="note warn" data-testid="po-blocked">{blockedFor(poOutcome)}</span></div>
          )}
          <div className="bidsheet-row postout">
            <button
              className={`dchip po${delArmed ? ' del-armed' : ''}`}
              data-testid="po-confirm"
              disabled={!poDate}
              onClick={() => {
                if (poOutcome === 'delete' && !delArmed) { setDelArmed(true); return }
                flushWords(); const why = onPostOut(poDate, poOutcome); setPostErr(why || ''); setDelArmed(false)
              }}
            >
              {delArmed ? `Tap again to delete ${callsign}` : 'Post out'}
            </button>
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
          {!creditShown.auto && creditShown.entered && (
            <div className="bidsheet-row postout">
              <span className="lab">Entered by</span>
              <span className="note" data-testid="oil-detail-entered">{creditShown.entered}</span>
            </div>
          )}
          <div className="bidsheet-row postout">
            <span className="lab">Days</span>
            <span className="note" data-testid="oil-detail-days">
              {creditWorthText(creditShown)}
              {/* which half an HO is (D1164) — said in words as the grid draws it */}
              {creditShown.half ? `, ${halfWord(creditShown.half)}` : ''}
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
  docNames = [],
  onDoc,
  onClose,
}: {
  callsign: string
  date: string
  code: string
  /** the documents the Inputs-page record carries — named, read only (M3 7.3, D1150) */
  docNames?: string[]
  /** a tap on one opens the documents, read only (M4 — every document chip on the war) */
  onDoc?: () => void
  /** OIL the APP earned on this day, if that is what the cell holds (owner,
   *  21 Sep 26). See the note below on why this sheet had to learn the
   *  difference. */
  creditShown?: { code: 'FO' | 'HO'; days?: number; note?: string; giver?: string; spans?: Array<[number, number]>; via?: 'schedule' | 'input'; half?: Half } | null
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
        <span className="dt when">{dayLabel(date)}</span>
        {/* the code as the box draws it ([LW-HALF-DAY-WORDS-LEFT], 30 Oct 26): an OIL the app credited with its star after its
            code — "FO*", "HO*", as on the grid (D1306), where this line read "<HO" with none — and a half day in words, never
            the arrows the grid no longer draws (D1160); an HO's half is the code's own, an FO is whole (as its box) */}
        <span className="cur">{codeInWords(code, !!creditShown, creditShown && creditShown.code !== 'HO' ? null : undefined)}{creditShown || leave ? ' · approved' : ''}</span>
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
              /* a course, an overseas duty or the unforeseen absence may now be filed HERE too (round 2, D1318) and still be
                 the Inputs page's to change — so its line says where it is changed, never where it was filed (the walk's H1c) */
              : FILED_STRAIGHT.includes(code.replace(/[*<>]/g, ''))
                ? 'Change it on the Inputs page, not here.'
                : 'Filed on the Inputs page — change it there, not here.'}
        </span>
      </div>
      {!creditShown && docNames.length > 0 && (
        <div className="bidsheet-row" data-testid="raptor-docs">
          <span className="lab">Document</span>
          <span className="docfield">{docNames.map((n, i) => <button key={i} type="button" className="docchip" onClick={() => onDoc?.()}><span className="docname">{n}</span></button>)}</span>
        </div>
      )}
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
  c: { code: 'FO' | 'HO'; days?: number; note?: string; giver?: string; spans?: Array<[number, number]>; entered?: string; half?: Half }
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
      {/* WHO ENTERED IT (owner, D200 (2)) — an award's, apart from the typed "Given by" */}
      {!auto && c.entered && (
        <div className="bidsheet-row">
          <span className="lab">Entered by</span>
          <span className="note" data-testid="oil-detail-entered">{c.entered}</span>
        </div>
      )}
      <div className="bidsheet-row">
        <span className="lab">Days</span>
        <span className="note" data-testid="oil-detail-days">
          {creditWorthText({ ...c, auto })}
          {c.half ? `, ${halfWord(c.half)}` : ''}
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
 * bidding is open). On a day open for him his tap opens the bid sheet, whose foot already reads the award back;
 * everywhere else — a day closed for him (D1177; before the open dates, a locked day or a later stage) — the tap used to open nothing (the absence-record
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
  award: { code: 'FO' | 'HO'; days?: number; note?: string; giver?: string; entered?: string; half?: Half }
  onClose: () => void
}) {
  return (
    <Sheet testid="award-sheet" label="Your OIL award" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{callsign}</span>
        <span className="dt when">{dayLabel(date)}</span>
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
  outcome,
  hasAccount,
  blockedFor,
  lockedWhy,
  deletesNow,
  refusedAt,
  onChange,
  onUndo,
  onPlace,
  onClose,
}: {
  callsign: string
  date: string
  /** The person's CURRENT PO date — the first day they are gone. */
  poFrom: string
  /** [ONE-DOOR] (round 1 — Fable F1 / Astra 2): he was archived on Admin → Users, and Restore there is the ONE way back —
   *  the sentence that says so; the sheet then reads only (the date fixed, no chips, no Undo) */
  lockedWhy?: string | null
  /** Which posting it is ([POST-OUT-OUTCOMES], D229 — the four chips). */
  outcome: PostOutcome
  /** whether he has an account (the line names it only then) */
  hasAccount?: boolean
  /** why the posting would be held back on its date (the last admin), or null */
  blockedFor?: (outcome: PostOutcome) => string | null
  /** would a posting dated this day run NOW — today or earlier (sync.ts postingRunsBy)? A Delete's date moved there
   *  deletes him at once, so it asks twice first (D1102) */
  deletesNow?: (poDate: string) => boolean
  /** why a posting dated this day would be refused, or null — asked BEFORE the date question, so "Tap again to delete"
   *  is never offered for a delete the save would refuse (the blind read's L1) */
  refusedAt?: (poDate: string) => string | null
  /** Re-post with a new date and/or outcome. Commits on change — the
   *  sheet stays up so the admin can see the grid move behind it. */
  onChange: (fromDate: string, outcome: PostOutcome) => string | void
  /** a refusal comes back as its sentence (said on the sheet, which stays up) — e.g. his callsign now held on the roster */
  onUndo: () => string | void
  /** Hand this day to the bid sheet instead (owner, 20 Sep 26 — "we should
   *  also allow putting inputs when we click on days that were posted out"). */
  onPlace?: () => void
  onClose: () => void
}) {
  /* a refused move of the date says why (AB5) — the box snaps back to the date that stands */
  const [err, setErr] = useState('')
  /* a Delete chip does not commit on its own tap: it arms "Tap again to delete Hex" (D287 (3) — it asks twice) */
  const [delArm, setDelArm] = useState(false)
  /* …and neither does the DATE of a posting that is already a Delete, moved to today or earlier — the tap that would
     delete him at once (D1102, 21 Oct 26 — [PO-MOVE-DATE-DELETE-ASK]): the date picked waits here, shown in the box and
     the line, until the same "Tap again to delete Hex" is pressed; backing out — a chip, the ✕, leaving the Leave War —
     leaves the posting and its date as they were. A date still to come deletes no one now and is saved at once — picked
     while the question waits too (D1102's reading (1)). */
  const [askDate, setAskDate] = useState<string | null>(null)
  const armed = delArm || askDate !== null
  const shownFrom = askDate ?? poFrom
  /* the Leave War is kept mounted, so this sheet survives a page switch: a question to delete is never left waiting for
     one tap from someone who no longer knows it was the second ([LW-SETTINGS-SMALL]'s reason, met here too) */
  useEffect(() => subLwScreen(() => { if (!isLwOnScreen()) { setDelArm(false); setAskDate(null) } }), [])
  /* …and when the posting under it changes — an Undo, another tab, the date or outcome moved — the question is about a
     posting that no longer stands: it goes, never to delete at the date it was asked about */
  useEffect(() => { setAskDate(null) }, [poFrom, outcome])
  const locked = !!lockedWhy
  return (
    <Sheet testid="postout-sheet" label="Posted out" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{callsign}</span>
        <span className="dt when">{dayLabel(date)}</span>
        <button className="x" data-testid="postout-cancel" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="bidsheet-row postout">
        <span className="lab">PO from</span>
        {/* Unbounded like the picker's — a posting moves to any real date. The
            box cannot be emptied (the app's own date box — owner D796: no
            Reset): clearing a PO is the Undo button's job. A date picked is
            committed at once, as it always was. */}
        <DateBox className="dateinput" testid="postout-date" label={`Move ${callsign}'s post-out date`}
          value={shownFrom} disabled={locked}
          onChange={v => {
            setDelArm(false); setErr('')
            if (outcome === 'delete' && deletesNow?.(v)) {
              const why = v === poFrom ? null : refusedAt?.(v) ?? null
              if (why) { setAskDate(null); setErr(why); return }   // refused: said at once, nothing asked, nothing saved
              setAskDate(v === poFrom ? null : v); return
            }
            setAskDate(null)
            if (v !== poFrom) setErr(onChange(v, outcome) || '')
          }} />
      </div>
      {locked && <div className="bidsheet-row postout"><span className="note warn" data-testid="postout-locked">{lockedWhy}</span></div>}
      {/* [POST-OUT-OUTCOMES] (D229, D294, D298, D300): the four chips, committed on the tap as the date is — a Delete
          arms its second tap instead; ONE line says what happens on the date (the old two notes said it twice) */}
      {!locked && <><OutcomeChips value={delArm ? 'delete' : outcome} testid="postout"
        onChange={o => {
          setErr('')
          /* a chip tapped while the date asks is "not that after all": the date goes back to the one that stands */
          if (askDate !== null) { setAskDate(null); return }
          if (o === 'delete') { setDelArm(true); return }
          /* the armed Delete tapped again is "not that after all" — back to the posting as it stands, never a change to
             "nothing else" (the chips' un-choose would otherwise commit 'none' behind his back) */
          if (delArm) { setDelArm(false); if (o === 'none') return }
          setErr(onChange(poFrom, o) || '')
        }} />
      <div className="bidsheet-row postout">
        <span className="note" data-testid="postout-line">{outcomeLine(delArm ? 'delete' : outcome, shownFrom, !!hasAccount)}</span>
      </div></>}
      {!locked && blockedFor && blockedFor(delArm ? 'delete' : outcome) && (
        <div className="bidsheet-row postout"><span className="note warn" data-testid="postout-blocked">{blockedFor(delArm ? 'delete' : outcome)}</span></div>
      )}
      {armed && (
        <div className="bidsheet-row postout">
          <button className="dchip po del-armed" data-testid="postout-delete-go"
            onClick={() => { const at = shownFrom; setDelArm(false); setAskDate(null); setErr(onChange(at, 'delete') || '') }}>
            Tap again to delete {callsign}
          </button>
        </div>
      )}
      {/* drawn only with something to say — an empty row left a blank band on the sheet (W3's re-walk, N4) */}
      {err && <div className="bidsheet-row postout">
        <span className="note warn" data-testid="postout-err">{err}</span>
      </div>}
      <div className="bidsheet-row postout">
        {!locked && <button className="dchip po" data-testid="postout-undo" onClick={() => { setDelArm(false); setAskDate(null); const why = onUndo(); if (why) setErr(why) }}>
          Undo post out (PO)
        </button>}
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
  backFrom,
  lockedWhy,
  onChange,
  onUndo,
  onPlace,
  onClose,
}: {
  callsign: string
  date: string
  /** The person's CURRENT PI date — the first day they are here. */
  piFrom: string
  /** [ONE-DOOR] (D320): he is back from a posting — the date it took him (the day after his earlier stint closed); the
   *  sheet then says so and offers no Undo (past stints are read-only — round 1, Fable F2 / Astra 1) */
  backFrom?: string | null
  /** [ONE-DOOR] (the walk's design, Fable 4.2): archived on Admin → Users — the sheet reads only, as the Post out sheet
   *  does (round 1, Fable F1): the reason, the date fixed, no Undo; Restore there is the one way back */
  lockedWhy?: string | null
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
  const locked = !!lockedWhy
  return (
    <Sheet testid="postin-sheet" label="Posted in" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{callsign}</span>
        <span className="dt when">{dayLabel(date)}</span>
        <button className="x" data-testid="postin-cancel" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="bidsheet-row">
        <span className="note" data-testid="postin-note">
          {backFrom
            ? <>Back from a posting on {shortDate(backFrom)} — on the manpower from {shortDate(piFrom)}. The days between count nobody,
                but leave can still be dated there.</>
            : <>Posted in on {shortDate(piFrom)} — on the manpower from that day. Days before it count nobody,
                but leave can still be dated there.</>}
        </span>
      </div>
      <div className="bidsheet-row postout">
        <span className="lab">PI from</span>
        {/* Unbounded, and the box cannot be emptied (the app's own date box —
            owner D796) — clearing a post-in is the Undo button's job. */}
        <DateBox className="dateinput" testid="postin-date" label={`Move ${callsign}'s post-in date`}
          value={piFrom} disabled={locked}
          onChange={v => setErr(onChange(v) || '')} />
      </div>
      {locked && <div className="bidsheet-row postout"><span className="note warn" data-testid="postin-locked">{lockedWhy}</span></div>}
      {/* drawn only with something to say — an empty row left a blank band on the sheet (W3's re-walk, N4) */}
      {err && <div className="bidsheet-row postout">
        <span className="note warn" data-testid="postin-err">{err}</span>
      </div>}
      <div className="bidsheet-row postout">
        {!backFrom && !locked && <button className="dchip po" data-testid="postin-undo" onClick={onUndo}>
          Undo post in (PI)
        </button>}
        {onPlace && (
          <button className="dchip" data-testid="postin-place" onClick={onPlace}>
            Place leave or OIL here instead…
          </button>
        )}
      </div>
    </Sheet>
  )
}
