// The sheet a DRAG-SELECTION opens (owner, 27 Aug 26). One selection, many
// cells across many people; this acts on the whole block at once. It is the
// BidPicker's sibling — same Sheet chassis, same `bidsheet-*` / chip classes,
// same portion+leave+medical+PO vocabulary — just batched, so it reads as the
// multi-cell version of the thing the squadron already knows.
//
// Sections are CONTEXTUAL to role and to the open dates (D1177), the same gates the single-cell path uses: everyone
// fills (a member only his open days from today — the rest counted skipped); medical and PO are the admin's; Decide
// (Ack/Approve/Refuse) is the admin's, at any time. Delete and Move act on whatever the selection holds that
// this role may change — every RECORD, not each day's top one (D265): a bid
// beside an OIL award moves alone; Delete takes the admin's OIL awards in it
// too, and names them first (owner, D260, 27 Sep 26). Its rows follow the
// one-day sheet's order and look (D264, D331): Decide, Selected (Move ·
// Delete — SheetActions.tsx), How much, Which leave, PO.
//
// THE ASK BEFORE A BALANCE GOES BELOW ZERO IS CARRIED HERE TOO (his ruling D418, 29 Sep 26 — "Drag asks too"). It was
// left out at first, on the reasoning that a block spanning ten people asking ten "are you sure" questions would be
// worse than a balance running negative — and a three-day drag from a balance of 0 wrote -3 with no word, where a
// one-day bid of the same leave would have asked. It asks ONCE for the whole block, naming everyone the fill would
// take below zero in one sentence (`belowzero.ts`, the one-day sheet's words), and the same leave tapped again goes
// ahead. Never a refusal — a balance may run negative.
//
// IT DOES NOT BLOCK THE GRID (owner, D642, 7 Oct 26 — brought into line with D641's windows): `Sheet`'s
// `modal={false}` form. No veil, a press outside does not close it, the grid behind it works. While it is up a NEW
// drag on the grid replaces what it acts on (Matrix keys this sheet by its selection, so it starts afresh); a plain
// click on a cell opens that cell's own sheet and closes this one (`useCloseOnCellClick`); its ✕ and Escape close
// it. Move is unchanged: it closes the sheet and hands the block to the grid's move mode, where an empty tap outside
// still cancels the MOVE (D262) — that is the move, not this panel. The war's other windows keep blocking
// (`OUTSTANDING.md` `[LW-WINDOWS-NONBLOCKING]`).

import { useMemo, useState } from 'react'
import { formatCell, LEAVE_TYPES, type BidState, type Portion, type PostOutcome } from '../engine'
import { OutcomeChips, outcomeLine } from './OutcomeChips'
import '../../ui/postout.css'
import { awardsIn, clearCells, deletableIn, movableCells, placeApproved, postingBlocked, setBidStates, setCells } from '../state/store'
import { DeleteChip, MoveChip } from './SheetActions'
import { awardsClause } from './awardwords'
import { skipWhy } from './BidPicker'
import { belowZeroAsk, goesBelow, type BalanceAfter, type BelowZero } from './belowzero'
import { Sheet } from './Sheet'
import { DateBox } from '../../ui/DateBox'
import { useCloseOnCellClick } from './gridclick'
import { shortDate, shortSpan } from './dates'
import type { Selection } from './select'
import './bidpicker.css'
import { worstWhatIf, type DayWhatIf } from '../engine/whatif'
import { DayLine, dayLineCode } from './DayLine'
import { LeaveButtons } from './LeaveButtons'
import { emptyDraft, ReqWordsRows, wordsOf, type ReqDraft } from './ReqWords'
import { getState } from '../state/store'

const PORTIONS: { portion: Portion; label: string; testid: string }[] = [
  { portion: 'full', label: 'Whole day', testid: 'sel-portion-full' },
  { portion: 'am', label: 'AM', testid: 'sel-portion-am' },
  { portion: 'pm', label: 'PM', testid: 'sel-portion-pm' },
]

export function SelectSheet({
  sel,
  people,
  wouldLeave,
  dayLine,
  role,
  canDecide,
  onDone,
  onMove,
  onPostOut,
  hasAccount,
  onClose,
}: {
  sel: Selection
  /** callsign per person id, for the header when the selection is small */
  people: (id: string) => string
  /** What one person's balance would read after this leave is written on these of his days, or `null` for leave that
   *  spends nothing — the matrix's `balanceAfter`, the one-day sheet's own question (D418) */
  wouldLeave?: (personId: string, dates: readonly string[], code: string) => BalanceAfter | null
  /** What the leave would do to manning on one person's days (D1144, D1213 — the day line): the matrix's `bidDayLine` */
  dayLine?: (personId: string, dates: readonly string[], code: string) => DayWhatIf[]
  role: 'admin' | 'member'
  /** admin && closed — the batch Decide row */
  canDecide: boolean
  /** Report the write back. `keepOpen` says a PARTIAL write left a note on the
   *  sheet the person still has to read ("3 written. 4 skipped — locked…") —
   *  the matrix closes the sheet only when it is absent, or the note died
   *  with the sheet in the same tap that set it (27 Aug 26 overnight find). */
  onDone: (changed: boolean, keepOpen?: boolean) => void
  /** enter move-mode (the matrix owns the ghost + the drop) */
  onMove: (sel: Selection) => void
  /** admin, single-person selections only: post that one person out */
  onPostOut?: (personId: string, fromDate: string, outcome: PostOutcome) => string | void
  /** whether that one person has an account (the posting's line names it only then) */
  hasAccount?: (personId: string) => boolean
  onClose: () => void
}) {
  const [portion, setPortion] = useState<Portion>('full')
  /* "APPROVE WHAT I ENTER" (D1147, D1187's reading: the drag-selection window too) — ticked each time it opens */
  const [approve, setApprove] = useState(true)
  const approving = role === 'admin' && approve
  /* THE DAY LINE across a drag: each man's days read on their own, then the worst person-day of them all — his callsign
     before the date where the drag holds several men (the agent's reading, M3 §7.1) */
  const st = getState()
  const line = useMemo(() => {
    if (!dayLine) return { days: [] as DayWhatIf[], label: undefined as string | undefined }
    const whose = new Map<DayWhatIf, string>()
    const all: DayWhatIf[] = []
    for (const pid of sel.people) {
      const ds = sel.cells.filter(c => c.personId === pid).map(c => c.date)
      for (const d of dayLine(pid, ds, dayLineCode(portion))) { whose.set(d, pid); all.push(d) }
    }
    const w = worstWhatIf(all)
    return { days: w ? [w, ...(all.length > 1 ? [all.find(d => d !== w)!] : [])] : [], label: w && sel.people.length > 1 ? people(whose.get(w)!) : undefined }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!dayLine, sel, portion, st])
  const [note, setNote] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)
  /* what the below-zero ask SAID — the leave and each man's figure (D418) — the same leave tapped again goes ahead only
     while that still holds; any other control on the sheet (How much, Delete, Decide, PO) drops it (Astra's final read,
     F2, 29 Sep 26 — a portion changed away and back kept the ask armed) */
  const [confirming, setConfirming] = useState<string | null>(null)
  /* WHERE THE ONE NOTE IS DRAWN — beside the button that raised it, as on the one-day sheet (D264, one format and one
     look): a Delete's confirm under the Selected row, a leave's (the below-zero ask, a partial write) under Which leave,
     and a decision's or a posting's at the foot, where they always were */
  const [noteAt, setNoteAt] = useState<'sel' | 'leave' | 'end'>('end')
  /* the awards the confirm NAMED — the Delete takes these and no other (Astra's round-2 read, R2-02) */
  const [delAwardIds, setDelAwardIds] = useState<string[]>([])
  const [poOpen, setPoOpen] = useState(false)
  const [poDate, setPoDate] = useState(sel.from)
  /* [POST-OUT-OUTCOMES]: which posting it is (D229) — Overseas Sqn by default; a Delete asks twice (D287 (3)) */
  const [poOutcome, setPoOutcome] = useState<PostOutcome>('overseas')
  const [delArmed, setDelArmed] = useState(false)
  /* a request's Document and Remarks (M3 5.9, 5.10): written with the fill, where the drag holds ONE person — across
     several, each man's paper is his own (the agent's reading, M3 §7 point 2) */
  const [words, setWords] = useState<ReqDraft>(emptyDraft)
  useCloseOnCellClick(onClose)

  const nPeople = sel.people.length
  const nDays = new Set(sel.cells.map(c => c.date)).size
  const who = nPeople === 1
    ? people(sel.people[0])
    : nPeople <= 3
      ? sel.people.map(people).join(', ')
      : `${nPeople} people`
  const span = sel.from === sel.to ? shortDate(sel.from) : shortSpan(sel.from, sel.to)   // one day in its range's own voice ([LW-ISO-DATES])
  // Delete and Move only make sense when the box actually holds a movable bid —
  // a purely-empty selection (Fill only) hides them, so Move never opens on
  // nothing to move (owner, 27 Aug 26).
  const hasBids = movableCells(sel.cells).length > 0
  /* Delete only where it would change something (D332; the house rule for a control that could not work) — the same
     gates the Delete itself runs (`deletableIn` mirrors `clearCells`) */
  const canDelete = deletableIn(sel.cells) > 0
  /* THE AWARDS THE DELETE WILL TAKE (owner, D260, 27 Sep 26 — "B": it removes everything in the block, awards included,
     and the confirm names each award first). Read before anything goes, from the store's own question (`awardsIn` —
     the admin's awards; a member's Delete takes none). A block of awards alone now offers Delete too: it is not an
     empty box, and Delete is the one door to clear it; Move stays off — an award never moves (it is dated the day he
     earned it). */
  const awards = awardsIn(sel.cells)

  /* why cells were skipped, in the words of what can refuse a cell now (M1's walk, B-N1 — the bidding window is gone) */
  const skipNote = (verb: string, written: number, skipped: number) => {
    const why = skipWhy(verb, role)
    return written === 0
      ? `Nothing could be ${verb}. Those cells are ${why}.`
      : `${written} ${verb}. ${skipped} skipped: ${why}.`
  }

  /** Everyone this fill would take below zero, in the block's own order — one line each, for the one ask. */
  const belowZero = (code: string): BelowZero[] => {
    if (!wouldLeave) return []
    const out: BelowZero[] = []
    for (const pid of sel.people) {
      const dates = sel.cells.filter(c => c.personId === pid).map(c => c.date)
      const r = dates.length ? wouldLeave(pid, dates, code) : null
      if (goesBelow(r)) out.push({ callsign: people(pid), counter: r.counter, after: r.after })
    }
    return out
  }

  const fill = (code: string) => {
    /* ASK ONCE BEFORE TAKING ANYONE BELOW ZERO (D418): the first tap names each man and writes nothing; the same leave
       again goes ahead. A different leave (or a different half) asks afresh, as on the one-day sheet. */
    setConfirmDel(false)
    setNoteAt('leave')
    const below = code ? belowZero(code) : []
    const token = `${code}|${JSON.stringify(below)}`
    if (below.length && confirming !== token) {
      setConfirming(token)
      setNote(belowZeroAsk(below))
      return
    }
    setConfirming(null)
    if (code && approving) {
      const r = placeApproved(sel.cells, code, nPeople === 1 ? wordsOf(words) : undefined)
      if (!r.skipped && !r.pending.length) { onDone(r.written > 0); return }
      const parts: string[] = []
      if (r.skipped) parts.push(skipNote('written', r.written, r.skipped).replace(/\.$/, ''))
      if (r.pending.length) parts.push(`${r.pending.length} day${r.pending.length === 1 ? '' : 's'} kept pending — not approved (a locked week, or leave or a medical already there)`)
      setNote(parts.join('. ') + '.')
      if (r.written > 0) onDone(true, true)
      return
    }
    const { written, skipped } = code ? setCells(sel.cells, code, nPeople === 1 ? wordsOf(words) : undefined) : clearCells(sel.cells)
    if (skipped === 0) { onDone(written > 0); return }
    setNote(skipNote(code ? 'written' : 'cleared', written, skipped))
    if (written > 0) onDone(true, true) // refresh counts but keep the sheet to show the note
  }

  const del = () => {
    setConfirming(null)
    setNoteAt('sel')
    if (!confirmDel) {
      setConfirmDel(true)
      setDelAwardIds(awards.map(a => a.id))
      const incl = awards.length ? `, including ${awardsClause(awards, people)}` : ''
      setNote(`Delete ${nDays === 1 ? 'this day' : `${nDays} days`} for ${who}${incl}? Tap Delete again.`)
      return
    }
    const { written, skipped } = clearCells(sel.cells, delAwardIds)
    if (skipped === 0) return onDone(written > 0)
    setNote(skipNote('deleted', written, skipped))
    if (written > 0) onDone(true, true)
  }

  const decide = (bid: BidState) => {
    setConfirming(null)
    setNoteAt('end')
    const { decided, skipped, already } = setBidStates(sel.cells, bid)
    if (skipped === 0 && !already) return onDone(decided > 0)
    /* an already-approved leave is said as such, never counted as a decision (AB7) */
    const was = already ? ` ${already} already approved.` : ''
    setNote(decided === 0
      ? (skipped ? 'None of those could be decided — a decision needs a bid that is not Raptor-owned.' + was : `Nothing to decide —${was}`)
      : `${decided} decided.${was}${skipped ? ` ${skipped} skipped (no bid, or Raptor-owned).` : ''}`)
    if (decided > 0) onDone(true, true)
  }

  /* everyone fills: a member's fill writes his open days from today and counts the rest skipped (D1177, D1211) */
  const canFill = true

  return (
    <Sheet testid="select-sheet" label="Selected days" onClose={onClose} modal={false}>
      <div className="bidsheet-hd">
        <span className="who" data-testid="sel-who">{who}</span>
        <span className="dt" data-testid="sel-span">{span} · {nDays} day{nDays === 1 ? '' : 's'}</span>
        {role === 'admin' && (
          <label className="bp-approve" data-testid="sel-approve-tick-label">
            <input type="checkbox" data-testid="sel-approve-tick" checked={approve} onChange={e => { setApprove(e.target.checked); setConfirming(null) }} />
            Approve what I enter
          </label>
        )}
        <button className="x" data-testid="sel-cancel" onClick={onClose} aria-label="Cancel">✕</button>
      </div>
      <DayLine days={line.days} label={line.label} />

      {/* ONE FORMAT AND LOOK FOR THE TWO SHEETS (owner, D264; his order, D331 "1 A"): the same rows in the same order as
          the one-day sheet — what is already there first (Decide, then Selected: Move · Delete), then placing new leave
          (How much, Which leave) — and the same two buttons for Move and Delete (SheetActions.tsx). The drag IS this
          sheet's selection, so it has no How many (the one-day sheet's, D335). */}
      {canDecide && (
        <div className="bidsheet-row">
          <span className="lab">Decide</span>
          <button className="dchip approve" data-testid="sel-approve" onClick={() => decide('approved')}>Approve</button>
          <button className="dchip refuse" data-testid="sel-refuse" onClick={() => decide('refused')}>Refuse</button>
        </div>
      )}

      {/* Move and Delete act on what the selection holds, so they show only where they would do something (a loose box
          of empties is Fill-only). Move: every record in the box this role may move (D265 — a bid beside an OIL award
          moves alone; the award, leave filed on the Inputs page, a medical stay, and the move banner says so); never an
          award (D260). Delete: every day it would change (D332's one word) — confirms on a second tap, naming every award
          it takes (D260). Move hands off to the matrix's ghost/tap-to-place mode. */}
      {(hasBids || canDelete) && (
        <div className="bidsheet-row">
          <span className="lab">Selected</span>
          {hasBids && <MoveChip testid="sel-move" onClick={() => { onClose(); onMove(sel) }} />}
          {canDelete && <DeleteChip testid="sel-delete" armed={confirmDel} onClick={del} />}
        </div>
      )}
      {note && noteAt === 'sel' && <div className="bidsheet-row"><span className="note warn" data-testid="sel-note">{note}</span></div>}

      {canFill && (
        <>
          {nPeople === 1 && <ReqWordsRows value={words} onChange={w => setWords(w)} start={sel.from} end={sel.to} testPrefix="sel" />}
          <div className="bidsheet-row">
            <span className="lab">Duration</span>
            {PORTIONS.map(p => (
              <button key={p.portion} data-testid={p.testid}
                className={`pchip${portion === p.portion ? ' on' : ''}`}
                aria-pressed={portion === p.portion}
                onClick={() => { setPortion(p.portion); setConfirming(null) }}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="bidsheet-row">
            <span className="lab">Which leave</span>
            {/* the one-day window's buttons (M3 5.2–5.6): his figures where the drag holds one man, none across several
                (the below-zero ask still names each — the agent's reading, M3 §7.2) */}
            <LeaveButtons portion={portion} onPick={fill} filled={approving} testPrefix="sel"
              figure={wouldLeave && nPeople === 1 ? code => wouldLeave(sel.people[0]!, sel.cells.map(c => c.date), code)?.before ?? null : undefined} />
            {note && noteAt === 'leave' && <span className="note warn" data-testid="sel-note">{note}</span>}
          </div>

          {/* No Medical row: medical is member-filed only (owner, 13 Sep 26) —
              the war never creates it, whatever the role. */}
        </>
      )}

      {/* PO only for a single person (posting several out from one drag is too
          heavy an act for one tap; the PO flow picks its own date anyway). "PO", as on the one-day sheet (the mock-up's
          reading, uncorrected — D331). */}
      {onPostOut && nPeople === 1 && !poOpen && (
        <div className="bidsheet-row postout">
          <span className="lab" data-testid="sel-also">Also</span>
          <button className="dchip po" data-testid="sel-postout" title="Post out — their last day in the squadron" aria-label="Post out" onClick={() => { setPoOpen(true); setConfirming(null) }}>PO</button>
        </div>
      )}
      {onPostOut && nPeople === 1 && poOpen && (
        <>
          <div className="bidsheet-row postout">
            <span className="lab">PO from</span>
            {/* the app's own date box, as the one-day sheet's "PO from" (owner D796, D797) */}
            <DateBox className="dateinput" testid="sel-po-date" label={`Post ${people(sel.people[0])} out from`} value={poDate} onChange={v => { setDelArmed(false); setPoDate(v) }} />
          </div>
          {/* the four chips and the one line, as on the bid sheet (D229, D294, D298, D300) */}
          <OutcomeChips value={poOutcome} testid="sel-po" onChange={o => { setPoOutcome(o); setDelArmed(false) }} />
          {outcomeLine(poOutcome, poDate, !!(hasAccount && hasAccount(sel.people[0]))) && (
            <div className="bidsheet-row postout"><span className="note" data-testid="sel-po-line">{outcomeLine(poOutcome, poDate, !!(hasAccount && hasAccount(sel.people[0])))}</span></div>
          )}
          {postingBlocked(sel.people[0], poOutcome) && (
            <div className="bidsheet-row postout"><span className="note warn" data-testid="sel-po-blocked">{postingBlocked(sel.people[0], poOutcome)}</span></div>
          )}
          <div className="bidsheet-row postout">
            <button className={`dchip po${delArmed ? ' del-armed' : ''}`} data-testid="sel-po-confirm"
              onClick={() => {
                if (poOutcome === 'delete' && !delArmed) { setDelArmed(true); return }
                /* a refused posting keeps the sheet and says why (AB5) — it used to report done whatever the store said */
                const why = onPostOut(sel.people[0], poDate, poOutcome)
                setDelArmed(false)
                if (why) { setNoteAt('end'); setNote(why); return }
                onDone(true)
              }}>
              {delArmed ? `Tap again to delete ${who}` : 'Post out'}
            </button>
          </div>
        </>
      )}

      {note && noteAt === 'end' && <div className="bidsheet-row"><span className="note warn" data-testid="sel-note">{note}</span></div>}
    </Sheet>
  )
}
