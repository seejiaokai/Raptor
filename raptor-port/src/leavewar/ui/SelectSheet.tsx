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

import { useEffect, useMemo, useState } from 'react'
import { formatCell, LEAVE_TYPES, type BidState, type Portion, type PostOutcome } from '../engine'
import { OutcomeChips, outcomeLine } from './OutcomeChips'
import '../../ui/postout.css'
import { grantOilDays, MAX_GIVEN_BY, MAX_REASON, awardsIn, clearCells, decidableIn, deletableIn, fileStraight, movableCells, placeApproved, postingBlocked, setBidStates, setCells, setRemarksOn, inOneWarCommand } from '../state/store'
import { ApproveSwitch, compactSpan, MoreButton, useApproveMemory } from './BidBits'
import { DeleteChip, MoveChip } from './SheetActions'
import { awardsClause } from './awardwords'
import { skipWhy } from './BidPicker'
import { belowZeroAsk, goesBelow, type BalanceAfter, type BelowZero } from './belowzero'
import { Sheet } from './Sheet'
import { DateBox } from '../../ui/DateBox'
import { isLwOnScreen, subLwScreen } from '../state/screen'
import { useCloseOnCellClick } from './gridclick'
import type { Selection } from './select'
import './bidpicker.css'
import { worstWhatIf, type DayWhatIf } from '../engine/whatif'
import { DayLine, dayLineCode } from './DayLine'
import { DutyButtons, GrantOilButton, LeaveButtons } from './LeaveButtons'
import { OilAmount, oilAmountText, oilNumber, type OilPick } from './OilAmount'
import { emptyDraft, ReqWordsRows, wordsOf, type ReqDraft } from './ReqWords'
import { getState, recordsAt, reqRunKey } from '../state/store'
import { addDays } from '../engine'
import type { RequestRec } from '../engine/warrecs'
import { leaveInputsAt, rowDocIds } from '../sync'
import { remarksTyped, tillShown } from '../../engine/inputs'
import { setLeaveRemarks } from '../../ui/inputedit'

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
  onPostIn,
  hasAccount,
  onClose,
  flushRef,
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
  /** admin, single-person selections only: post that one person in — Post out's twin, as on the one-day window (his
   *  D1326; [LW-DRAG-MORE-MENU]); the reason, where it is refused */
  onPostIn?: (personId: string, fromDate: string) => string | void
  /** whether that one person has an account (the posting's line names it only then) */
  hasAccount?: (personId: string) => boolean
  onClose: () => void
  /** the grid's way to keep the typed words when a NEW drag replaces this window (the night's code read, R4) */
  flushRef?: { current: (() => void) | null }
}) {
  const [portion, setPortion] = useState<Portion>('full')
  /* "APPROVE WHAT I ENTER" (D1147, D1187's reading: the drag-selection window too) — the one-day window's switch and its
     one memory: left off in either window, it opens off in both (D1302, BidBits.tsx) */
  const [approve, setApprove] = useApproveMemory()
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
  /* a "Tap again to delete" left armed is taken back when the Leave War leaves the screen — the page is kept mounted, so
     this sheet can wait open across a page switch for a tap from someone who no longer knows it was the second (the
     reason D1102's date ask is taken back there too) */
  /* [LW-ARMS-PAGE-LEAVE-REST] (27 Oct 26): every armed second tap here is taken back when the Leave War leaves the screen — the
       page is kept mounted, so the question could wait across a page switch for a tap from someone who no longer knows it
       was the second (the reason the posting doors' asks are taken back too, D1102) */
  useEffect(() => subLwScreen(() => { if (!isLwOnScreen()) { setDelArmed(false); setConfirmDel(false); setConfirming(null); setNote('') } }), [])   /* the words too (the code read's F2) */
  /* POST IN, dated from the drag's first day as Post out is ([LW-DRAG-MORE-MENU], his report of 26 Oct 26) */
  const [piOpen, setPiOpen] = useState(false)
  const [piDate, setPiDate] = useState(sel.from)
  /* GRANT OIL OVER THE DRAG (his D1394, 26 Oct 26): one grant on each day picked, one reason for all — an admin's, the
     third place of the row under the leaves as on the one-day window (D1349). Its amount is the one control (D1392, D1395
     H — OilAmount.tsx), opening on half a day for a morning or afternoon Duration and a day for a whole one (D1394). */
  const [oilOpen, setOilOpen] = useState(false)
  const [oilPick, setOilPick] = useState<OilPick>('1')
  const [oilOther, setOilOther] = useState('')
  const [oilNote, setOilNote] = useState('')
  const [oilGiven, setOilGiven] = useState('')
  const [oilErr, setOilErr] = useState('')
  const openOil = () => { setOilPick(portion === 'full' ? '1' : '0.5'); setOilOther(''); setOilErr(''); setConfirming(null); setOilOpen(true) }
  const giveOil = () => {
    const raw = oilAmountText(oilPick, oilOther), n = raw.trim() ? oilNumber(raw) : 1
    if (!Number.isFinite(n)) { setOilErr('Type how many days'); return }
    const problem = grantOilDays(sel.cells, n, { note: oilNote, givenBy: oilGiven })
    if (problem) { setOilErr(problem); return }
    onDone(true)
  }
  /* THE ENTRIES THE DRAG COVERS AND THEIR REMARKS (his D1347, D1362 — "A grey line each", 25 Oct 26; drawn in
     docs/img/handpass/2026-10-25-lw-drawings/drag-remarks/): over one man's days, each separate entry — a run of bids
     with one set of words (the store's own run, `reqRunKey`), or one leave approved on the war (one input) — with its
     remark and its dates. Where they hold different remarks, each is listed read only as a grey line above an empty box,
     an entry with no remark left out; over ONE entry the box opens with its words. Typing still replaces them all (D1341). */
  const st0 = getState()
  const entries = useMemo(() => {
    if (sel.people.length !== 1) return [] as { key: string; remark: string; from: string; to: string }[]
    const pid = sel.people[0]!
    const out: { key: string; remark: string; from: string; to: string }[] = []
    for (const d of [...new Set(sel.cells.map(c => c.date))].sort()) {
      const here: { key: string; remark: string }[] = []
      for (const r of recordsAt(pid, d)) if (r.kind === 'request' && r.state !== 'refused') here.push({ key: `b${reqRunKey(r as RequestRec)}`, remark: String((r as RequestRec).remarks ?? '').trim() })
      for (const row of leaveInputsAt(pid, d)) if (row.lw) here.push({ key: `a${row.iid}`, remark: String(remarksTyped(row.remarks, row) ?? '').trim() })
      for (const h of here) {
        const last = [...out].reverse().find(e => e.key === h.key)
        if (last && addDays(last.to, 1) === d) last.to = d
        else out.push({ ...h, from: d, to: d })
      }
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, st0])
  const listed = entries.length > 1 && new Set(entries.map(e => e.remark)).size > 1 ? entries.filter(e => e.remark) : []
  /* over one entry its words; over several that all say the same, those words (the M3 code read's Q11 — no grey line is
     drawn for one set of words, and the box stood empty, so they were nowhere); left as they opened they change nothing
     and travel to no new filing (keepWords, fileDuty) */
  const prefill = entries.length && entries.every(e => e.remark === entries[0]!.remark) ? entries[0]!.remark : ''
  /* WHAT A LEAVE FILL SENDS (the second narrow read of the code read's fixes, its question 1): over ONE entry its words
     go with the fill as they always did — the entry stretched keeps its words; over SEVERAL entries their shared words are
     only shown (Q11), so left as they opened they are not written onto the days between — that would make two separate
     entries one run, and entries never join by themselves (D1346); typed words go everywhere (D1341) */
  const fillWords = () => (entries.length > 1 && prefill && words.remarks.trim() === prefill ? { ...words, remarks: '' } : words)
  /* a request's Document and Remarks (M3 5.9, 5.10): written with the fill, where the drag holds ONE person — across
     several, each man's paper is his own (the agent's reading, M3 §7 point 2) */
  const [words, setWords] = useState<ReqDraft>(() => ({ ...emptyDraft(), remarks: prefill }))
  /* a tap on a grid day closes it — keeping the typed words, as ✕ and Escape do (`closeKeeping`, below) */
  useCloseOnCellClick(() => closeKeeping())

  const nPeople = sel.people.length
  const nDays = new Set(sel.cells.map(c => c.date)).size
  const who = nPeople === 1
    ? people(sel.people[0])
    : nPeople <= 3
      ? sel.people.map(people).join(', ')
      : `${nPeople} people`
  /* the dates in the title's short voice — "9–11 Nov", as round 3 drew it (today "9 Nov 26 – 11 Nov 26"), the one-day
     window's "Tue 3 Nov" carrying no year either (BidBits.tsx compactSpan) */
  const span = compactSpan(sel.from, sel.to)
  // Delete and Move only make sense when the box actually holds a movable bid —
  // a purely-empty selection (Fill only) hides them, so Move never opens on
  // nothing to move (owner, 27 Aug 26).
  const hasBids = movableCells(sel.cells).length > 0
  /* Delete only where it would change something (D332; the house rule for a control that could not work) — the same
     gates the Delete itself runs (`deletableIn` mirrors `clearCells`) */
  const canDelete = deletableIn(sel.cells) > 0
  /* DECIDE ONLY WHERE THE DAYS HOLD A BID (round 3's drawing): over days with nothing to decide Approve and Refuse only
     said so when pressed — the house rule for a control that could not work. `decidableIn` is `setBidStates`'s own
     eligibility, as the one-day window's range asks it. */
  const decideHere = canDecide && decidableIn(sel.cells) > 0
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
      const r = placeApproved(sel.cells, code, nPeople === 1 ? wordsOf(fillWords()) : undefined)
      if (!r.skipped && !r.pending.length) { onDone(r.written > 0); return }
      const parts: string[] = []
      if (r.skipped) parts.push(skipNote('written', r.written, r.skipped).replace(/\.$/, ''))
      if (r.pending.length) parts.push(`${r.pending.length} day${r.pending.length === 1 ? '' : 's'} kept pending — not approved (a locked week, or leave or a medical already there)`)
      setNote(parts.join('. ') + '.')
      if (r.written > 0) onDone(true, true)
      return
    }
    const { written, skipped } = code ? setCells(sel.cells, code, nPeople === 1 ? wordsOf(fillWords()) : undefined) : clearCells(sel.cells)
    if (skipped === 0) { onDone(written > 0); return }
    setNote(skipNote(code ? 'written' : 'cleared', written, skipped))
    if (written > 0) onDone(true, true) // refresh counts but keep the sheet to show the note
  }

  /* ROUND 2 (his D1318, D1324): a course, an overseas duty or the unforeseen absence filed straight on every day of every man
     picked — no bid, nothing to approve; one man's words go with it, as with a leave. A day not his to change is named. */
  const fileDuty = (code: string) => {
    setConfirmDel(false); setConfirming(null); setNoteAt('leave')
    /* an Other and an Attach take the window's Duration (his D1365, D1380); a course and an overseas duty whole days.
       The ONE entry's words the box opened with (D1362) are that entry's, not a new filing's (the M3 code read's Q6 — a
       leave's "Wedding" was filed onto a course over the same drag): left as they opened, they are not sent; words he
       typed are (D1341). */
    const own = prefill && words.remarks.trim() === prefill ? { ...words, remarks: '' } : words
    const r = fileStraight(sel.cells, code, nPeople === 1 ? wordsOf(own) : undefined, code === 'OTH' || code === 'ATCH' ? portion : 'full')
    if (!r.skipped) { onDone(r.done > 0); return }
    setNote(r.why[0] ?? skipNote('written', r.done, r.skipped))
    if (r.done > 0) onDone(true, true)
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

  /* THE TYPED WORDS GO WITH THE PRESS (his D1339, D1341 — 25 Oct 26): words typed in the Remarks box over days that
     already hold entries are written on every one of them before Approve, Refuse or Move acts — replacing what each held,
     so the dragged days end with one remark — never dropped. One man's drag only (across several, each man's words are
     his own — M3 §7 point 2). The bids take them in one command (`store.ts setRemarksOn`, before an approval, so the leave
     is filed with them); an approved leave among the days takes them on its Inputs-page entry, through the one remarks
     save (`setLeaveRemarks`, as its own window saves them). An empty box typed nothing and changes nothing. */
  const keepWords = () => {
    if (nPeople !== 1) return
    /* the whole draft (the night's code read, R2): the remark, trimmed as every other window trims it, the documents, and
       the till where the window holds a choice — nothing at all, nothing written */
    const t = words.remarks.trim()
    const docs = words.docIds
    const till = typeof words.till === 'boolean' ? words.till : undefined
    if (!t && !docs.length && till === undefined) return
    /* the one entry's own words, opened in the box and left as they were, change nothing (D1362) */
    if (t === prefill && !docs.length && till === undefined) return
    const pid = sel.people[0]!
    inOneWarCommand('lw.reqmeta', () => {
      setRemarksOn(sel.cells, { ...(t ? { remarks: t } : {}), ...(docs.length ? { docIds: docs } : {}), ...(till !== undefined ? { till } : {}) })
      const seen = new Set<string>()
      for (const c of sel.cells) {
        for (const row of leaveInputsAt(pid, c.date)) {
          /* a leave filed on the Inputs page keeps its words there — its own window says they are changed on that page
             (D1177's reading; the night's walk, W4): only a leave approved on the war takes the drag window's words */
          if (!row.lw || seen.has(String(row.iid))) continue
          seen.add(String(row.iid))
          const was = remarksTyped(row.remarks, row)
          const ids = [...new Set([...rowDocIds(row), ...docs])]
          /* only a real change — every save stamps "changed by … · now" (the narrow read, N4) */
          if ((t && t !== was) || ids.length !== rowDocIds(row).length || (till !== undefined && tillShown(row) !== till)) setLeaveRemarks(row, t || was, pid, ids, till)
        }
      }
    })
  }
  if (flushRef) flushRef.current = keepWords

  /* …and on closing too — ✕, Escape, a tap behind — as the one-day window keeps a held bid's words when it closes ("never
     dropped", D1339; the night's scenario designer, gap 7): words typed over days holding entries are kept on them; over
     empty days (a NEW leave's words, nothing placed) there is nothing to keep them on */
  const closeKeeping = () => { keepWords(); onClose() }

  const decide = (bid: BidState) => {
    setConfirming(null)
    setNoteAt('end')
    /* the words and the decision in ONE command, one Undo (the night's code read, R1) */
    /* the counts kept outside the command, so a refusal thrown inside it leaves the window its note (the narrow read, N3) */
    let res: { decided: number; skipped: number; already: number; why: string[] } = { decided: 0, skipped: 0, already: 0, why: [] }
    inOneWarCommand('lw.decide', () => { keepWords(); res = setBidStates(sel.cells, bid) })
    const { decided, skipped, already, why } = res
    if (skipped === 0 && !already) return onDone(decided > 0)
    /* an already-approved leave is said as such, never counted as a decision (AB7) */
    const was = already ? ` ${already} already approved.` : ''
    /* …and a day the rules refused says their reason — "He posts out on 1 Mar: refuse or delete it" — as Approvals does (the
       fixes' M5, D1436), never a guess at why */
    const rules = why.length ? ` ${why.join(' ')}` : ''
    setNote(decided === 0
      ? (skipped ? (why.length ? why.join(' ') : 'None of those could be decided — a decision needs a bid that is not Raptor-owned.') + was : `Nothing to decide —${was}`)
      : `${decided} decided.${was}${skipped ? ` ${skipped} skipped${why.length ? ':' : ' (no bid, or Raptor-owned).'}${rules}` : ''}`)
    if (decided > 0) onDone(true, true)
  }

  /* everyone fills: a member's fill writes his open days from today and counts the rest skipped (D1177, D1211) */
  const canFill = true

  return (
    <Sheet testid="select-sheet" label="Selected days" onClose={closeKeeping} modal={false}>
      <div className="bidsheet-hd">
        <span className="who" data-testid="sel-who">{who}</span>
        <span className="dt" data-testid="sel-span">{span} · {nDays} day{nDays === 1 ? '' : 's'}</span>
        {role === 'admin' && <ApproveSwitch testid="sel-approve-tick" on={approve} onChange={v => { setApprove(v); setConfirming(null) }} />}
        <button className="x" data-testid="sel-cancel" onClick={closeKeeping} aria-label="Cancel">✕</button>
      </div>
      <DayLine days={line.days} label={line.label} />

      {/* ONE FORMAT AND LOOK FOR THE TWO SHEETS (owner, D264; his order, D331 "1 A"): the same rows in the same order as
          the one-day sheet — what is already there first (Decide, then Selected: Move · Delete), then placing new leave
          (How much, Which leave) — and the same two buttons for Move and Delete (SheetActions.tsx). The drag IS this
          sheet's selection, so it has no How many (the one-day sheet's, D335). */}
      {(decideHere || hasBids || canDelete) && (
        <div className="bidsheet-row bp-acts" data-testid="sel-actions" role="group" aria-label="Actions">
          {/* grey at rest, their words in their colours (his D1361) — over a drag nothing is lit: its days may hold
              different answers */}
          {decideHere && <button className="dchip dec approve" data-testid="sel-approve" onClick={() => decide('approved')}>Approve</button>}
          {decideHere && <button className="dchip dec refuse" data-testid="sel-refuse" onClick={() => decide('refused')}>Refuse</button>}
          {hasBids && <MoveChip testid="sel-move" onClick={() => { keepWords(); onClose(); onMove(sel) }} />}
          {canDelete && <DeleteChip testid="sel-delete" armed={confirmDel} onClick={del} />}
        </div>
      )}
      {note && noteAt === 'sel' && <div className="bidsheet-row"><span className="note warn" data-testid="sel-note">{note}</span></div>}

      {canFill && (
        <>
          {listed.length > 0 && (
            <div className="bidsheet-row sel-rmks" data-testid="sel-remarks-list">
              {listed.map(e => <span key={`${e.key}-${e.from}`} className="dl-ro-words sel-rmk-line" data-testid="sel-remark-line">“{e.remark}” · {compactSpan(e.from, e.to)}</span>)}
            </div>
          )}
          {nPeople === 1 && <ReqWordsRows compact value={words} onChange={w => setWords(w)} start={sel.from} end={sel.to} testPrefix="sel" />}
          <div className="bidsheet-row bp-dur" role="group" aria-label="Duration">
            {PORTIONS.map(p => (
              <button key={p.portion} data-testid={p.testid}
                className={`pchip${portion === p.portion ? ' on' : ''}`}
                aria-pressed={portion === p.portion}
                onClick={() => { setPortion(p.portion); setConfirming(null) }}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="bidsheet-row" role="group" aria-label="Which leave">
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
      {/* behind the ⋯ in the fourth place of the row under the leaves, as on the one-day window (his D1326) */}
      {!poOpen && !piOpen && !oilOpen && (
        <div className="bidsheet-row bp-extra" data-testid="sel-extra-row">
          {/* CSE · OD in the first two places (round 2); the third is the one-day window's Grant OIL (not offered over a
              drag); the ⋯ the fourth — Other (an admin's, his D1356 / D1365: filed under Unavailable on the Duration
              picked) and, for one man, Post out */}
          <DutyButtons onFile={fileDuty} testPrefix="sel" />
          {role === 'admin' && <GrantOilButton testid="sel-oil" label="Grant OIL" title="Grant OIL — one grant on each day picked, one reason for all" onPick={openOil} />}
          {/* Attach first, for everyone (his D1378, D1379) — a member's ⋯ holds it alone */}
          <MoreButton testid="sel-more" items={[
            { key: 'atch', testid: 'sel-file-ATCH', label: 'Attach', title: 'Attach: attached to another squadron, a job or an exercise — filed under Unavailable on the schedule, for the Duration picked; where to is added on the Inputs page', onPick: () => fileDuty('ATCH') },
            ...(role === 'admin' ? [{ key: 'oth', testid: 'sel-file-OTH', label: 'Other', title: 'Other: out of the manning — filed under Unavailable on the schedule, for the Duration picked', onPick: () => fileDuty('OTH') }] : []),
            ...(role === 'admin' && onPostOut && nPeople === 1 ? [{ key: 'po', testid: 'sel-postout', label: 'Post out', title: 'Post out — their last day in the squadron',
              onPick: () => { setPoOpen(true); setConfirming(null) } }] : []),
            /* …and its twin, Post in, as the one-day window's ⋯ holds them (his D1326; [LW-DRAG-MORE-MENU]) */
            ...(role === 'admin' && onPostIn && nPeople === 1 ? [{ key: 'pi', testid: 'sel-postin', label: 'Post in', title: 'Post in — their first day in the squadron',
              onPick: () => { setPiOpen(true); setConfirming(null) } }] : []),
          ]} />
        </div>
      )}
      {role === 'admin' && oilOpen && (
        <>
          <div className="bidsheet-row postout">
            <input className="oil-text" maxLength={MAX_REASON} data-testid="sel-oil-why" aria-label="Reason" placeholder="why — any reason"
              value={oilNote} onChange={e => { setOilErr(''); setOilNote(e.target.value) }} />
            <input className="oil-text given" maxLength={MAX_GIVEN_BY} data-testid="sel-oil-given-by" aria-label="Given by" placeholder="given by (optional)"
              value={oilGiven} onChange={e => { setOilErr(''); setOilGiven(e.target.value) }} />
          </div>
          <OilAmount testPrefix="sel-oil" pick={oilPick} other={oilOther} err={oilErr}
            onPick={p => { setOilErr(''); setOilPick(p); setOilOther('') }}
            onOther={v => { setOilErr(''); setOilOther(v) }}
            onGive={giveOil} />
        </>
      )}
      {onPostIn && nPeople === 1 && piOpen && (
        <>
          <div className="bidsheet-row postout">
            <span className="lab">PI from</span>
            {/* the app's own date box, as the one-day window's "PI from" (owner D796, D797) */}
            <DateBox className="dateinput" testid="sel-pi-date" label={`Post ${people(sel.people[0])} in from`} value={piDate} onChange={v => { setNote(''); setPiDate(v) }} />
          </div>
          <div className="bidsheet-row postout">
            <button className="dchip po" data-testid="sel-pi-confirm" disabled={!piDate}
              onClick={() => {
                /* a refused posting keeps the window and says why, as Post out's does (AB5) */
                /* the words typed in the box go with the press, as the one-day window's flushWords (D1339; the code read's F2) */
                keepWords()
                const why = onPostIn(sel.people[0], piDate)
                if (why) { setNoteAt('end'); setNote(why); return }
                onDone(true)
              }}>
              Post in
            </button>
            <span className="note">
              Their first day in the squadron. Days before it are blank and count nobody —
              leave can still be dated there.
            </span>
          </div>
        </>
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
                keepWords()   // the typed words go with the press (D1339; the code read's F2)
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
