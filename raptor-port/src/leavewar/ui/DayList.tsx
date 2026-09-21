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
import { useState, type ReactElement } from 'react'
import { INPUTS } from '../../engine/inputs'
import { canDecide, canEditCell, canEditRow, codeOf, displayCell, type Period, type Role } from '../engine'
import { AM, FULL, PM, type Contrib, type DayView, type Win } from '../engine/dayview'
import { creditWorthText } from '../engine/credit'
import { creditGiver, type NoticeRec, type CreditRec } from '../engine/warrecs'
import { ackReplacement, changeAbsenceById, clearRecordById, decideRequestById, editManualCredit, moveAbsenceById, recordsAt } from '../state/store'
import { Sheet } from './Sheet'
import './bidpicker.css'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
function dayLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  // UTC maths, so the weekday never shifts with the browser's timezone
  const wd = new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay()
  return `${DAYS[wd]} ${d} ${MONTHS[m! - 1]}`
}
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

export function DayListSheet({
  personId, callsign, date, view, role, viewer, period, onEditRemark, onClose,
}: {
  personId: string
  callsign: string
  date: string
  view: DayView
  role: Role
  viewer: string | null
  period: Period
  /** open the published remarks editor on this Input */
  onEditRemark: (row: any) => void
  onClose: () => void
}) {
  const [msg, setMsg] = useState('')
  /* the per-record Move: which Input is being moved, and to when */
  const [moving, setMoving] = useState<string | null>(null)
  /* the award being edited in place, and its three boxes */
  const [editing, setEditing] = useState<string | null>(null)
  const [eWhy, setEWhy] = useState('')
  const [eWho, setEWho] = useState('')
  const [eDays, setEDays] = useState('')
  const [moveTo, setMoveTo] = useState(date)
  const deciding = canDecide(period.stage, role)
  const editable = canEditCell(period, role, date) && canEditRow(role, viewer, personId)
  const own = viewer === personId
  const raw = recordsAt(personId, date)
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

  /* EVERY credit on this day, read back one block each (N16, 21 Sep 26).
     It took the first one it found, which under a single credit per day was
     the only one. Since an award and a worked day may now sit side by side,
     showing one of them would leave the other's reason, giver and worth with
     nowhere on this sheet to appear. */
  const oilRecs = raw.filter(r => r.kind === 'credit') as CreditRec[]
  const lines = view.all.map(c => {
    const part = partOf(c.win)
    const partTxt = part ? `, ${part}` : ''
    if (c.kind === 'absence') {
      const row = INPUTS.find((r: any) => String(r.iid) === c.id)
      const isLeave = codeOf(c.code)?.spends != null
      const warOwned = !!row?.lw
      const text = `${shown(notation(c))} — ${nameOf(c.code) || shown(c.code)}${partTxt} · ${warOwned ? 'approved' : 'filed on the Inputs page'}`
      const actions: ReactElement[] = []
      /* APPROVED AND PUBLISHED IS FINISHED PAPERWORK (owner, 21 Sep 26 — "if
         the input is approved and published … the member and admin can input
         the remarks there. In order to edit it again, admin has to go back to
         open for bidding or bidding closed"). The single-record window has
         always obeyed this; THIS list did not, because `deciding` means
         closed-OR-published, so a day holding two records let an admin send a
         published, approved leave back to a bid in one click. Found by Astra,
         21 Sep 26. Note stays — a remark is the one thing he DID ask for here. */
      const finished = period.stage === 'published'
      if (warOwned && isLeave && role === 'admin' && deciding && !finished) {
        actions.push(
          <button key="p" className="dchip" data-testid={`dl-unapprove-${c.id}`} onClick={() => act(() => changeAbsenceById(personId, date, c.id, 'pending'))}>Back to bid</button>,
          <button key="r" className="dchip refuse" data-testid={`dl-refuse-${c.id}`} onClick={() => act(() => changeAbsenceById(personId, date, c.id, 'refused'))}>Refuse</button>,
          <button key="d" className="dchip" data-testid={`dl-remove-${c.id}`} onClick={() => act(() => changeAbsenceById(personId, date, c.id, 'removed'))}>Delete</button>,
          <button key="m" className="dchip move" data-testid={`dl-move-${c.id}`} onClick={() => { setMoving(moving === c.id ? null : c.id); setMoveTo(date) }}>Move…</button>,
        )
        if (moving === c.id) {
          actions.push(
            <input key="mt" type="date" className="dateinput" aria-label="Move to" data-testid={`dl-moveto-${c.id}`} value={moveTo} min={period.start} max={period.end} onChange={e => setMoveTo(e.target.value)} />,
            <button key="mg" className="dchip approve" data-testid={`dl-movego-${c.id}`} onClick={() => { const r = moveAbsenceById(personId, date, c.id, moveTo); if (r) setMsg(r); else { setMsg(''); setMoving(null) } }}>Move</button>,
          )
        }
      }
      if (row && isLeave && period.stage === 'published' && (role === 'admin' || own)) {
        actions.push(<button key="n" className="dchip" data-testid={`dl-note-${c.id}`} onClick={() => onEditRemark(row)}>Note</button>)
      }
      return { key: `a-${c.id}`, cls: isLeave ? 'appr' : '', text, sub: !warOwned ? 'Change it on the Inputs page.' : row?.remarks ? String(row.remarks) : '', actions }
    }
    if (c.kind === 'request') {
      /* "Ack" is the word everywhere since 21 Sep 26 — the button, the
         legend and this line had drifted into three ways of saying it. */
      const st = c.state === 'acknowledged' ? 'bid, acked' : c.state === 'refused' ? 'bid refused' : 'bid, not decided yet'
      const text = `${shown(notation(c))} — ${nameOf(c.code) || shown(c.code)}${partTxt} · ${st}`
      const actions: ReactElement[] = []
      if (deciding) {
        actions.push(<button key="ap" className="dchip approve" data-testid={`dl-approve-${c.id}`} onClick={() => act(() => decideRequestById(personId, date, c.id, 'approved'), 'Couldn’t approve — something else is on that time')}>Approve</button>)
        if (c.state !== 'acknowledged') actions.push(<button key="ak" className="dchip ack" data-testid={`dl-ack-${c.id}`} onClick={() => act(() => decideRequestById(personId, date, c.id, 'acknowledged'))}>Ack</button>)
        if (c.state !== 'refused') actions.push(<button key="rf" className="dchip refuse" data-testid={`dl-refuse-${c.id}`} onClick={() => act(() => decideRequestById(personId, date, c.id, 'refused'))}>Refuse</button>)
      }
      if (editable) actions.push(<button key="cl" className="dchip" data-testid={`dl-clear-${c.id}`} onClick={() => act(() => clearRecordById(personId, date, c.id))}>Clear</button>)
      const cls = c.state === 'acknowledged' ? 'tbc' : c.state === 'refused' ? 'ref' : ''
      return { key: `r-${c.id}`, cls, text, sub: '', actions }
    }
    if (c.kind === 'credit') {
      const rec = raw.find(r => r.id === c.id) as CreditRec | undefined
      const times = rec?.spans?.length ? rec.spans.map(([a, b]) => `${hhmm(a)}–${hhmm(b)}`).join(', ') : ''
      /* The same three facts the day window reads back (owner, 21 Sep 26):
         why, who gave it, and — for one the app earned — the hours it was
         measured over. `creditGiver` is shared with the window and the OIL
         tracker so the giver is never worded three ways. */
      const giver = creditGiver(rec)
      /* THE TWO KINDS ARE NAMED APART (N16, 21 Sep 26). Every credit read
         "OIL earned", which of an award is simply untrue — an award says a
         man is OWED a day, not that he was at work (N13). On a worked
         Saturday the sheet would have shown the same four words twice. */
      const kind = rec?.oil === 'auto' ? 'OIL earned' : 'OIL award'
      const text = `${c.code} — ${kind}${rec?.note ? ` (${rec.note})` : ''}${times ? `, worked ${times}` : ''}${giver ? ` · given by ${giver}` : ''}`
      const actions: ReactElement[] = []
      if (rec?.oil === 'manual' && role === 'admin') {
        /* AN AWARD IS EDITABLE WHEREVER IT OPENS (owner, [LW-OIL-DETAIL]).
           On a day holding both, this sheet is the ONLY thing a tap opens —
           the day window never shows for more than one record — so without
           this the ruling quietly stopped being true on exactly the days
           N16 creates. One door: `editManualCredit` writes all three fields
           as a single step, so one undo takes the whole change back. */
        actions.push(<button key="ed" className="dchip" data-testid={`dl-oil-edit-${c.id}`} onClick={() => { setEditing(editing === c.id ? null : c.id); setEWhy(rec.note ?? ''); setEWho(rec.givenBy ?? ''); setEDays(rec.days != null ? String(rec.days) : '') }}>Edit…</button>)
        actions.push(<button key="cl" className="dchip" data-testid={`dl-clear-${c.id}`} onClick={() => act(() => clearRecordById(personId, date, c.id))}>Clear</button>)
      }
      const from = rec?.oil !== 'auto' ? ''
        : rec.via === 'input' ? 'From a duty input that was accepted.'
          : 'From the published schedule.'
      return { key: `c-${c.id}`, cls: 'sc', text, sub: from, actions }
    }
    // a replaced-bid notice
    const n = raw.find(r => r.id === c.id) as NoticeRec | undefined
    const whose = own ? 'Your' : `${callsign}’s`
    const text = `${whose} ${shown(n?.code ?? c.code)} bid was replaced by ${n?.byType ?? 'another entry'}${n?.byWho ? ` (${n.byWho})` : ''}`
    const actions: ReactElement[] = []
    if (n && (role === 'admin' || own)) actions.push(<button key="ok" className="dchip ack" data-testid={`dl-seen-${c.id}`} onClick={() => act(() => ackReplacement(personId, n.id))}>OK, seen</button>)
    return { key: `n-${c.id}`, cls: 'warn', text, sub: '', actions }
  })

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
      <ul className="daylist" data-testid="daylist">
        {lines.map(l => (
          <li key={l.key} className={`dl-line${l.cls ? ` ${l.cls}` : ''}`} data-testid={`dl-${l.key}`}>
            <div className="dl-text">
              <span className="dl-main">{l.text}</span>
              {l.sub && <span className="dl-sub">{l.sub}</span>}
            </div>
            {l.actions.length > 0 && <div className="dl-acts">{l.actions}</div>}
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
        const award = rec.oil !== 'auto'
        const editing_ = editing === rec.id
        return (
          <div key={`oil-${rec.id}`} className="daylist-oil" data-testid={`oil-detail-${rec.id}`}>
            <div className="bidsheet-row">
              <span className="lab">{award ? 'OIL award' : 'OIL earned'}</span>
              <span className="note" data-testid={`oil-detail-days-${rec.id}`}>
                {creditWorthText(rec)}
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
              <span className="note" data-testid={`oil-detail-given-${rec.id}`}>{creditGiver(rec) || 'Not given'}</span>
            </div>
            {editing_ && (
              <div className="bidsheet-row oil-edit">
                <input className="notebox" aria-label="Reason" data-testid={`oil-edit-why-${rec.id}`} value={eWhy} onChange={e => setEWhy(e.target.value)} placeholder="Why it was given" />
                <input className="notebox" aria-label="Given by" data-testid={`oil-edit-given-${rec.id}`} value={eWho} onChange={e => setEWho(e.target.value)} placeholder="Given by" />
                <input className="oil-num" aria-label="Days" data-testid={`oil-edit-days-${rec.id}`} value={eDays} onChange={e => setEDays(e.target.value)} placeholder="Days" />
                <button className="dchip approve" data-testid={`oil-edit-save-${rec.id}`} onClick={() => {
                  const t = eDays.trim()
                  const n = t ? Number(t) : null
                  if (t && !Number.isFinite(n)) { setMsg('Type how many days — or leave it blank'); return }
                  const problem = editManualCredit(personId, date, rec.id, { note: eWhy, givenBy: eWho, days: n })
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
