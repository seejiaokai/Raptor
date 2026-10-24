// THE TAP LIST — every record on one person's day ([ARCH-STACK] step 4,
// design §25 OA10-001, catalogue build rule 2, owner comp
// docs/img/step4-multi-record-box.png).
//
// A day can hold several records at once — morning LL beside afternoon OIL,
// leave during a course, a worked morning beside an afternoon bid, a refused
// bid kept as history, a "your bid was replaced" notice. The box shows ONE
// main code plus a corner mark (grey `+n`, amber `!`); tapping it opens this
// list, one line per record, each with ITS OWN actions, so no record can ever
// hide under another. What each line may do is the store's own permission
// check — the buttons are only offered where it would succeed.
import { useEffect, useRef, useState, type ReactElement } from 'react'
import { INPUTS, remarksShown, remarksTyped } from '../../engine/inputs'
import { canDecide, canEditRow, codeOf, displayCell, type Period, type Role } from '../engine'
import { AM, FULL, offWar, PM, type Contrib, type DayView, type Win } from '../engine/dayview'
import { creditWorthText } from '../engine/credit'
import { creditGiver, type Half, type NoticeRec, type RequestRec } from '../engine/warrecs'
import { ackReplacement, canBidOn, ownPendingOnClosedDay, changeAbsenceById, clearRecordById, decideRequestById, defaultAwardHalf, editAward, movableRecords, oilOnDay, recordsAt, setRequestWords, type OilShown } from '../state/store'
import { docGet, rowDocIds } from '../sync'
import { EntryBox } from './BidBits'
import { draftOf, LeaveWords, patchOf, ReqWordsRows, type ReqDraft } from './ReqWords'
import { DeleteChip, MoveChip } from './SheetActions'
import { Sheet } from './Sheet'
import { dayLabel, enteredDay, shortDate } from './dates'   // one body for the day's list and the one-day sheets ([LW-ISO-DATES])
import { halfWord } from './awardwords'
import { HalfPick } from './CreditForm'
import './bidpicker.css'

const hhmm = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`
const same = (a: Win, b: Win) => a[0] === b[0] && a[1] === b[1]
function partOf(w: Win): string {
  if (same(w, FULL)) return ''
  if (same(w, AM)) return 'morning'
  if (same(w, PM)) return 'afternoon'
  return `${hhmm(w[0])}–${hhmm(w[1])}`
}
/* The STORED notation for this contribution — `*LL` for a morning — which is
   then folded for the screen by `displayCell`, so the list and the box cannot
   say different things about the same record. */
function notation(c: Contrib): string {
  if (same(c.win, AM)) return `*${c.code}`
  if (same(c.win, PM)) return `${c.code}*`
  return c.code
}
/* What a line CALLS a record: the arrows for a half day, a trailing star when
   the app put it there, and the medical markers in the owner's own short form
   — one body, `displayCell`, shared with the grid. `ATT C` keeps its space
   here because a line has room for it where a 2-character box does not. */
const shown = (code: string, auto = false) => {
  const d = displayCell(code, auto)
  return d.replace(/\bC\b/, 'ATT C').replace(/\bB\b/, 'ATT B')
}
/* the catalogue's words for a code, without repeating the code itself
   (a medical's label is "medical — ATT C") */
const nameOf = (code: string) => {
  const bare = code.replace(/\*/g, '')
  const lab = codeOf(bare)?.label ?? ''
  return lab.split(' — ').filter(part => part !== shown(bare)).join(' — ')
}

/* ROUND 3 OF THE DAY'S LIST (his D1315, D1327–D1330; drawn by scripts/handpass/lw-twoday-look.mjs): each entry leads with
   its code drawn as its coloured box, as the grid draws it (D1327) — its kind's colour, its fill (approved filled, pending
   hollow, refused struck), its half (the morning the top, the afternoon the bottom), the Inputs page's edge — and beside it
   only what the box does not say: its half, its state, and where an entry filed on the Inputs page is changed (D1328),
   never the kind's long description, which the Legend holds. */
const placeOfWin = (w: Win): 'whole' | 'top' | 'bot' => (same(w, AM) ? 'top' : same(w, PM) ? 'bot' : 'whole')
const fillOf = (c: Contrib): 'a' | 'w' | 'r' => (c.kind === 'request' ? (c.state === 'refused' ? 'r' : 'w') : 'a')
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
/** "Morning · approved", "Pending", "09:00–12:00 · change it on the Inputs page" */
const said = (part: string, state: string) => cap([part, state].filter(Boolean).join(' · '))

/** A pending or refused bid's own Remarks and Document row in the list — the bid windows' one row, saved onto the bid as it
 *  changes (the box when it is left or Enter pressed), one `lw.reqmeta` each (setRequestWords) */
function BidWords({ personId, date, rec, onDone }: { personId: string; date: string; rec: RequestRec; onDone: (fn: () => boolean | string | null | number) => void }) {
  const [edit, setEdit] = useState<ReqDraft | null>(null)
  const held = draftOf(rec)
  /* words typed and not yet saved go with the list's closing (the bid window's fresh read, 5) */
  const pending = useRef<(() => void) | null>(null)
  useEffect(() => () => { pending.current?.() }, [])
  return (
    <ReqWordsRows compact testPrefix={`dl-${rec.id}`} value={edit ?? held} start={date}
      onChange={(next, how) => {
        if (how === 'type') {
          const p = patchOf(held, next)
          pending.current = p ? () => { setRequestWords(personId, date, rec.id, p) } : null
          return setEdit(next)
        }
        pending.current = null
        setEdit(null)
        const patch = patchOf(held, next)
        if (patch) onDone(() => setRequestWords(personId, date, rec.id, patch))
      }} />
  )
}
/** an entry's remarks and documents, read only — what the Inputs page holds for one filed there (D1315), or another man's:
 *  the typed words as every screen prints them, the "till <date>" after them (D948) — nothing where none were typed */
function readOnly(id: string, row: any, raw = false): ReactElement | null {
  const words = raw ? String(row.remarks ?? '').trim() : remarksTyped(row.remarks, row) ? remarksShown(row) : ''
  const docs = rowDocIds(row)
  if (!words && !docs.length) return null
  return (
    <div className="bidsheet-row dl-ro" data-testid={`dl-ro-${id}`}>
      {words && <span className="dl-ro-words">“{words}”</span>}
      {docs.map(d => <span key={d} className="docchip"><span className="docname">{docGet(d)?.name ?? 'document'}</span></span>)}
    </div>
  )
}

export function DayListSheet({
  personId, callsign, date, view, role, viewer, period, onMove, onClose,
}: {
  personId: string
  callsign: string
  date: string
  view: DayView
  role: Role
  viewer: string | null
  period: Period
  /** Pick ONE record up into the grid's move mode (owner, D266 — "instead of date box it should also be the same move
   *  modality and I can choose what to move"): the matrix closes the list and carries exactly this record, by its id. */
  onMove?: (rec: { personId: string; date: string; id: string }) => void
  onClose: () => void
}) {
  const [msg, setMsg] = useState('')
  /* the award being edited in place, and its three boxes */
  const [editing, setEditing] = useState<string | null>(null)
  const [eWhy, setEWhy] = useState('')
  const [eWho, setEWho] = useState('')
  const [eDays, setEDays] = useState('')
  /* an HO's half, as the editor holds it (D1164) — the award's own when it is one, else picked when he types 0.5 */
  const [eHalf, setEHalf] = useState<Half | null>(null)
  const deciding = canDecide(role)
  /* a bid of this day may be deleted where the day is open for this person — or, on a day since closed, his own
     PENDING bid (D1225): the store's one rule (`canBidOn`, `ownPendingOnClosedDay`) */
  const editable = canBidOn(personId, date)
  const pendingHere = new Set(ownPendingOnClosedDay(personId, date).map(r => r.id))
  const own = viewer === personId
  const raw = recordsAt(personId, date)
  /* WHICH RECORDS HERE CAN MOVE — the store's one rule (D265, D333): each such line offers the one Move (D334), the
     same button as the one-day and drag-selection sheets; an award, leave filed on the Inputs page, a medical never. */
  const movableIds = new Set(movableRecords([{ personId, date }]).map(m => m.id))
  const moveBtn = (id: string) => (onMove && movableIds.has(id)
    ? [<MoveChip key="mv" testid={`dl-move-${id}`} onClick={() => onMove({ personId, date, id })} />]
    : [])
  /* The reader's OWN undecided bids on this day, in the words the box uses —
     what the clash line names so a member can see his leave is still there. A
     refused bid is not live and is nobody's news. */
  const liveBids = view.all
    .filter(c => c.kind === 'request' && c.state !== 'refused')
    .map(c => `${shown(notation(c))}${partOf(c.win) ? ` (${partOf(c.win)})` : ''}`)
  const act = (fn: () => boolean | string | null | number, fail = "Couldn’t change that") => {
    const r = fn()
    if (r === false || r === 0) setMsg(fail)
    else if (typeof r === 'string') setMsg(r)
    else setMsg('')
  }

  /* EVERY credit on this day, read back one block each (N16, 21 Sep 26) — the schedule's own and every award, however
     many (a day may hold several awards since they are ledger entries — [OIL-AWARD-IS-A-GRANT]). `oilOnDay` is the
     one reader: an award's worth is its amount, never worked back from its FO / HO label. */
  const oilRecs: OilShown[] = oilOnDay(personId, date)
  const lines = view.all.map(c => {
    const row0 = c.kind === 'absence' ? INPUTS.find((r: any) => String(r.iid) === c.id) : null
    /* PRINTED AS FILED (the absence-record re-test, W1-F4, 26 Sep 26): N1 starts a window filed at exactly 12:00 at
       12:01, so it cannot touch the morning — the minute decides the HALF, it is not what the man filed, and this list
       read "12:01–14:00" where the Inputs page says 12:00. The input's own stored start puts the minute back. */
    const shownWin: Win = row0 && row0.allday === false && row0.s === 720 && c.win[0] === 721 ? [720, c.win[1]] : c.win
    const part = partOf(shownWin)
    if (c.kind === 'absence') {
      const row = row0
      const isLeave = codeOf(c.code)?.spends != null
      const warOwned = !!row?.lw
      /* an approved leave the war moved says where from (D1177: the moved mark is an approved leave's now — a bid that only
         waits carries none), as the grid's dotted edge does */
      const movedAbs = (c as { movedFrom?: string }).movedFrom ? ` · moved from ${shortDate((c as { movedFrom?: string }).movedFrom!)}` : ''
      const text = said(part, warOwned ? `approved${movedAbs}` : 'change it on the Inputs page')
      const actions: ReactElement[] = []
      /* NOTHING IS FROZEN NOW (D1177 — the published stage went): the admin sends a leave the war approved back, refuses,
         moves or deletes it at any time, here as on the single-record window. ONE ROW OF ACTIONS, THE WINDOW'S OWN (his
         D1330): Approve shows lit on the approved leave and a second tap sends it back to waiting — "Back to bid" went —
         then Refuse, Move (this one leave into the move mode, no date box — D266) and Delete. */
      if (warOwned && isLeave && deciding) {
        actions.push(
          <button key="p" className="dchip approve lit" aria-pressed="true" title="Approved — tap again to send it back to waiting"
            data-testid={`dl-approve-${c.id}`} onClick={() => act(() => changeAbsenceById(personId, date, c.id, 'pending'))}>Approve</button>,
          <button key="r" className="dchip refuse" data-testid={`dl-refuse-${c.id}`} onClick={() => act(() => changeAbsenceById(personId, date, c.id, 'refused'))}>Refuse</button>,
          ...moveBtn(c.id),
          <DeleteChip key="d" testid={`dl-remove-${c.id}`} onClick={() => act(() => changeAbsenceById(personId, date, c.id, 'removed'))} />,
        )
      }
      /* ITS REMARKS AND DOCUMENT (his D1315, D1307 — "Note" went): a leave the war approved, for whoever may change its words
         (D418 narrowed by D1177: the member his own, an admin any), saved onto the leave on the Inputs page; anything else —
         filed on the Inputs page, or another man's — its remarks and documents read only */
      const words = row && isLeave && warOwned && (role === 'admin' || own)
        ? <LeaveWords row={row} personId={personId} testPrefix={`dl-${c.id}`} onRefused={setMsg} />
        : row ? readOnly(c.id, row) : null
      const box = <EntryBox code={c.code} fill={fillOf(c)} place={placeOfWin(c.win)} marks={[offWar(c) ? 'raptor' : '', (c as { movedFrom?: string }).movedFrom ? 'moved' : ''].filter(Boolean).join(' ')} />
      return { key: `a-${c.id}`, cls: isLeave ? 'appr' : '', box, text, sub: '', actions, words }
    }
    if (c.kind === 'request') {
      /* Ack is gone (D1158): a bid is pending until it is approved or refused (D1217's word) */
      /* WHERE IT WAS MOVED FROM, on its own line (Fable's scenario S4): the grid's dotted "moved" mark and the one-day
         sheet's "moved from" read the day's TOP record, so a bid moved once bidding had closed onto a day holding an
         award (now possible from every door, D265) left no trace anywhere. The same rule as the mark: shown wherever the
         record carries it (since D1177 a bid that only waits records none when it moves). */
      const src = raw.find(r => r.id === c.id) as RequestRec | undefined
      /* a date INSIDE a sentence reads day-first with its year, as the bid sheet's own "moved from" does — the list's
         header keeps the one-day voice (Fable's final read F3: the same phrase read two ways, one tap apart) */
      const movedFrom = src?.shiftedFrom ? ` · moved from ${shortDate(src.shiftedFrom)}` : ''
      const text = said(part, `${c.state === 'refused' ? 'refused' : 'pending'}${movedFrom}`)
      const actions: ReactElement[] = []
      /* THE SHEETS' ORDER AND WORDS (D264, D331, D332): Approve · Refuse (Ack gone, D1158), then Move, then Delete */
      if (deciding) {
        actions.push(<button key="ap" className="dchip approve" data-testid={`dl-approve-${c.id}`} onClick={() => act(() => decideRequestById(personId, date, c.id, 'approved'), 'Couldn’t approve — something else is on that time')}>Approve</button>)
        if (c.state !== 'refused') actions.push(<button key="rf" className="dchip refuse" data-testid={`dl-refuse-${c.id}`} onClick={() => act(() => decideRequestById(personId, date, c.id, 'refused'))}>Refuse</button>)
      }
      actions.push(...moveBtn(c.id))
      if (editable || pendingHere.has(c.id)) actions.push(<DeleteChip key="cl" testid={`dl-clear-${c.id}`} onClick={() => act(() => clearRecordById(personId, date, c.id))} />)
      /* ITS REMARKS AND DOCUMENT (M3 7.3 — D1150, D1159; round 3 — D1315): the window's one row, for whoever may change this
         bid (his own, an admin any), on a closed day too; a pick, a ✕ or the tick is saved to the bid at once, the words when
         the box is left (`lw.reqmeta`, one Undo) — only where the save can land (the fresh read's 6): an admin, an open day,
         or his own pending bid on a closed one, never his refused bid on a closed day, which the commit refuses */
      const canWords = !!src && canEditRow(role, viewer, personId) && (deciding || editable || pendingHere.has(c.id))
      const words = canWords
        ? <BidWords key={`w-${c.id}`} personId={personId} date={date} rec={src!} onDone={act} />
        : src && (src.remarks || src.docIds?.length) ? readOnly(c.id, { remarks: src.remarks ?? '', docIds: src.docIds ?? [] }, true) : null
      const cls = c.state === 'refused' ? 'ref' : ''
      const box = <EntryBox code={c.code} fill={fillOf(c)} place={placeOfWin(c.win)} marks={src?.shiftedFrom ? 'moved' : ''} />
      return { key: `r-${c.id}`, cls, box, text, sub: '', actions, words }
    }
    if (c.kind === 'credit') {
      const rec = oilRecs.find(r => r.id === c.id)
      /* hours only on the schedule's own credit — an award is not an attendance record (N13) */
      const times = !rec?.award && rec?.spans?.length ? rec.spans.map(([a, b]) => `${hhmm(a)}–${hhmm(b)}`).join(', ') : ''
      /* The same three facts the day window reads back (owner, 21 Sep 26):
         why, who gave it, and — for one the app earned — the hours it was
         measured over. `creditGiver` is shared with the window and the OIL
         tracker so the giver is never worded three ways. */
      const giver = rec ? creditGiver({ auto: !rec.award, ...(rec.via ? { via: rec.via } : {}), ...(rec.givenBy ? { givenBy: rec.givenBy } : {}) }) : ''
      /* THE TWO KINDS ARE NAMED APART (N16, 21 Sep 26). Every credit read
         "OIL earned", which of an award is simply untrue — an award says a
         man is OWED a day, not that he was at work (N13). On a worked
         Saturday the sheet would have shown the same four words twice. */
      const kind = rec && !rec.award ? 'OIL earned' : 'OIL award'
      /* an HO says which half it is in (D1164), as a half day's leave on this list does */
      const half = rec?.half ? `, ${halfWord(rec.half)}` : ''
      /* led by its box too (D1327) — the FO / HO as the grid draws it, the app's own with its star (D1306); beside it what
         the box does not say: an award or earned, its half (D1164), its reason, the hours, who gave it */
      const text = `${cap(kind)}${half}${rec?.note ? ` (${rec.note})` : ''}${times ? `, worked ${times}` : ''}${giver ? ` · given by ${giver}` : ''}`
      const box = <EntryBox code={c.code} fill="a" place={rec?.half === 'am' ? 'top' : rec?.half === 'pm' ? 'bot' : 'whole'} auto={!!c.auto} marks={offWar(c) ? 'raptor' : ''} />
      const actions: ReactElement[] = []
      if (rec?.award && role === 'admin') {
        /* AN AWARD IS EDITABLE WHEREVER IT OPENS (owner, [LW-OIL-DETAIL]).
           On a day holding both, this sheet is the ONLY thing a tap opens —
           the day window never shows for more than one record — so without
           this the ruling quietly stopped being true on exactly the days
           N16 creates. One door: `editAward` writes all three fields as a
           single step, so one undo takes the whole change back. */
        actions.push(<button key="ed" className="dchip" data-testid={`dl-oil-edit-${c.id}`} onClick={() => { setEditing(editing === c.id ? null : c.id); setEWhy(rec.note ?? ''); setEWho(rec.givenBy ?? ''); setEDays(String(rec.days)); setEHalf(rec.half ?? null) }}>Edit…</button>)
        actions.push(<DeleteChip key="cl" testid={`dl-clear-${c.id}`} onClick={() => act(() => clearRecordById(personId, date, c.id))} />)
      }
      const from = !rec || rec.award ? ''
        : rec.via === 'input' ? 'From a duty input that was accepted.'
          : 'From the published schedule.'
      return { key: `c-${c.id}`, cls: 'sc', box, text, sub: from, actions, words: null }
    }
    // a replaced-bid notice
    const n = raw.find(r => r.id === c.id) as NoticeRec | undefined
    const whose = own ? 'Your' : `${callsign}’s`
    const text = `${whose} ${shown(n?.code ?? c.code)} bid was replaced by ${n?.byType ?? 'another entry'}${n?.byWho ? ` (${n.byWho})` : ''}`
    const actions: ReactElement[] = []
    if (n && (role === 'admin' || own)) actions.push(<button key="ok" className="dchip ack" data-testid={`dl-seen-${c.id}`} onClick={() => act(() => ackReplacement(personId, n.id))}>OK, seen</button>)
    return { key: `n-${c.id}`, cls: 'warn', box: null, text, sub: '', actions, words: null }
  })

  /* THE TAIL THAT RAISES THE AMBER (the absence-record re-test, AB6, 26 Sep 26 — Fable F6, confirmed by the phone
     walk). A record running past midnight counts on this date for clashes only (H6): it is never this day's box and
     never charged here, so it was never listed — and an overnight leave that met this morning's published duty left
     the clash sentence below standing over ONE line. Each clashing tail now reads as its own line, with no actions:
     it is changed on the day it belongs to. */
  const hm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  const tailLines = (view.clashTails ?? []).map(c => ({
    key: `t-${c.id}`, cls: 'warn', box: null, words: null, actions: [] as ReactElement[], sub: 'It runs on from the day before — change it there.',
    text: `${shown(c.code)} — ${nameOf(c.code) || shown(c.code)}, from the day before till ${hm(c.win[1])}`,
  }))
  return (
    <Sheet testid="daylist-sheet" label={`${callsign} — ${dayLabel(date)}`} onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{callsign}</span>
        <span className="dt">{dayLabel(date)}</span>
        <button className="x" data-testid="daylist-close" onClick={onClose} aria-label="Close">✕</button>
      </div>
      {/* WHAT THE CLASH MEANS, TO WHOEVER IS READING IT (CURRENT-STATE item A,
          20 Sep 26). The one line here used to be written for an admin — "an
          admin needs to change one" — whoever opened it. On a member's own day
          that is the wrong news entirely: his box shows the OIL credit with his
          bid behind the corner mark, so the day already reads as though his
          leave had been thrown out, and the only sentence on the sheet talks
          about somebody else's job. Since the owner's ruling that nothing is
          refused for recorded work, his bid IS still live and a person needs
          to be told so in those words. An admin still gets the instruction,
          because for him it IS an instruction. */}
      {view.conflicts.length > 0 && (
        <div className="bidsheet-row">
          <span className="note warn" data-testid="daylist-clash">
            {own && liveBids.length > 0
              ? `Your ${liveBids.join(' and ')} ${liveBids.length > 1 ? 'bids are' : 'bid is'} still live — something else on this day covers the same time, so an admin has to decide between them. Nothing has been thrown out.`
              : own
                ? 'Two things on this day cover the same time. An admin has to decide between them — nothing has been thrown out.'
                : 'Two of these can’t both stand on the same time — an admin needs to change one.'}
          </span>
        </div>
      )}
      {/* the list's outer frame went (round 3): each entry takes the window's full width, a hairline between them */}
      <ul className="daylist flat" data-testid="daylist">
        {[...lines, ...tailLines].map(l => (
          <li key={l.key} className={`dl-line${l.box ? ' dl-card' : ''}${l.cls ? ` ${l.cls}` : ''}`} data-testid={`dl-${l.key}`}>
            <div className="dl-head">
              {l.box}
              <div className="dl-text">
                <span className="dl-main">{l.text}</span>
                {l.sub && <span className="dl-sub">{l.sub}</span>}
              </div>
            </div>
            {l.actions.length > 0 && <div className={`dl-acts${l.box ? ' bp-acts' : ''}`}>{l.actions}</div>}
            {l.words}
          </li>
        ))}
      </ul>
      {/* THE OIL ON THIS DAY, READ BACK IN THE SAME THREE LINES AS THE DAY
          WINDOW (owner, 21 Sep 26). A locked day — one the published schedule
          earned OIL on — opens this sheet rather than the window, so without
          this the app answered his question on one screen and not the other.
          Read-only here by construction: nothing on a Raptor-owned day is
          edited on the war. */}
      {oilRecs.map(rec => {
        const award = rec.award
        const editing_ = editing === rec.id
        return (
          <div key={`oil-${rec.id}`} className="daylist-oil" data-testid={`oil-detail-${rec.id}`}>
            <div className="bidsheet-row">
              <span className="lab">{award ? 'OIL award' : 'OIL earned'}</span>
              <span className="note" data-testid={`oil-detail-days-${rec.id}`}>
                {creditWorthText({ code: rec.code, days: rec.days })}
                {rec.half ? `, ${halfWord(rec.half)}` : ''}
                {!award && rec.spans?.length
                  ? ` — worked ${rec.spans.map(([a, b]) => `${hhmm(a)}–${hhmm(b)}`).join(', ')}`
                  : ''}
              </span>
            </div>
            <div className="bidsheet-row">
              <span className="lab">Reason</span>
              <span className="note" data-testid={`oil-detail-why-${rec.id}`}>
                {rec.note?.trim() || (award ? 'Not given' : 'Worked this day')}
              </span>
            </div>
            <div className="bidsheet-row">
              <span className="lab">Given by</span>
              <span className="note" data-testid={`oil-detail-given-${rec.id}`}>{creditGiver({ auto: !award, ...(rec.via ? { via: rec.via } : {}), ...(rec.givenBy ? { givenBy: rec.givenBy } : {}) }) || 'Not given'}</span>
            </div>
            {/* WHO ENTERED IT AND WHEN (owner, D200 (2)) — an award's own line, apart from the typed "Given by" */}
            {award && rec.enteredName && (
              <div className="bidsheet-row">
                <span className="lab">Entered by</span>
                <span className="note" data-testid={`oil-detail-entered-${rec.id}`}>{rec.enteredName}{enteredDay(rec.enteredAt) ? ` · ${enteredDay(rec.enteredAt)}` : ''}</span>
              </div>
            )}
            {editing_ && (
              <div className="bidsheet-row oil-edit">
                <input className="notebox" aria-label="Reason" data-testid={`oil-edit-why-${rec.id}`} value={eWhy} onChange={e => setEWhy(e.target.value)} placeholder="Why it was given" />
                <input className="notebox" aria-label="Given by" data-testid={`oil-edit-given-${rec.id}`} value={eWho} onChange={e => setEWho(e.target.value)} placeholder="Given by" />
                <input className="oil-num" aria-label="Days" data-testid={`oil-edit-days-${rec.id}`} value={eDays} onChange={e => setEDays(e.target.value)} placeholder="Days" />
                {/* half a day takes a half (D1164): the award's own, else the day's default until he picks */}
                {Number(eDays.trim()) === 0.5 && (
                  <HalfPick testid={`oil-edit-half-${rec.id}`} value={eHalf ?? defaultAwardHalf(personId, date, rec.id)} onPick={setEHalf} />
                )}
                <button className="dchip approve" data-testid={`oil-edit-save-${rec.id}`} onClick={() => {
                  const n = Number(eDays.trim())
                  if (!eDays.trim() || !Number.isFinite(n)) { setMsg('Type how many days'); return }
                  const problem = editAward(rec.id, { note: eWhy, givenBy: eWho, days: n, ...(eHalf ? { half: eHalf } : {}) })
                  if (problem) setMsg(problem)
                  else { setMsg(''); setEditing(null) }
                }}>Save</button>
              </div>
            )}
          </div>
        )
      })}
      {msg && (
        <div className="bidsheet-row">
          <span className="note warn" data-testid="daylist-msg">{msg}</span>
        </div>
      )}
    </Sheet>
  )
}
