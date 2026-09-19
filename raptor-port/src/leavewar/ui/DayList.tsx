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
import { canDecide, canEditCell, canEditRow, codeOf, type Period, type Role } from '../engine'
import { AM, FULL, PM, type Contrib, type DayView, type Win } from '../engine/dayview'
import type { NoticeRec, CreditRec } from '../engine/warrecs'
import { ackReplacement, changeAbsenceById, clearRecordById, decideRequestById, recordsAt } from '../state/store'
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
function notation(c: Contrib): string {
  if (same(c.win, AM)) return `*${c.code}`
  if (same(c.win, PM)) return `${c.code}*`
  return c.code
}
const shown = (code: string) => (code === 'ATTC' ? 'ATT C' : code === 'ATTB' ? 'ATT B' : code)
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
  const deciding = canDecide(period.stage, role)
  const editable = canEditCell(period, role, date) && canEditRow(role, viewer, personId)
  const own = viewer === personId
  const raw = recordsAt(personId, date)
  const act = (fn: () => boolean | string | null | number, fail = "Couldn’t change that") => {
    const r = fn()
    if (r === false || r === 0) setMsg(fail)
    else if (typeof r === 'string') setMsg(r)
    else setMsg('')
  }

  const lines = view.all.map(c => {
    const part = partOf(c.win)
    const partTxt = part ? `, ${part}` : ''
    if (c.kind === 'absence') {
      const row = INPUTS.find((r: any) => String(r.iid) === c.id)
      const isLeave = codeOf(c.code)?.spends != null
      const warOwned = !!row?.lw
      const text = `${shown(notation(c))} — ${nameOf(c.code) || shown(c.code)}${partTxt} · ${warOwned ? 'approved' : 'filed on the Inputs page'}`
      const actions: ReactElement[] = []
      if (warOwned && role === 'admin' && deciding) {
        actions.push(
          <button key="p" className="dchip" data-testid={`dl-unapprove-${c.id}`} onClick={() => act(() => changeAbsenceById(personId, date, c.id, 'pending'))}>Back to bid</button>,
          <button key="r" className="dchip refuse" data-testid={`dl-refuse-${c.id}`} onClick={() => act(() => changeAbsenceById(personId, date, c.id, 'refused'))}>Refuse</button>,
          <button key="d" className="dchip" data-testid={`dl-remove-${c.id}`} onClick={() => act(() => changeAbsenceById(personId, date, c.id, 'removed'))}>Delete</button>,
        )
      }
      if (row && isLeave && period.stage === 'published' && (role === 'admin' || own)) {
        actions.push(<button key="n" className="dchip" data-testid={`dl-note-${c.id}`} onClick={() => onEditRemark(row)}>Note</button>)
      }
      return { key: `a-${c.id}`, cls: isLeave ? 'appr' : '', text, sub: !warOwned ? 'Change it on the Inputs page.' : row?.remarks ? String(row.remarks) : '', actions }
    }
    if (c.kind === 'request') {
      const st = c.state === 'acknowledged' ? 'bid, acknowledged' : c.state === 'refused' ? 'bid refused' : 'bid, not decided yet'
      const text = `${shown(notation(c))} — ${nameOf(c.code) || shown(c.code)}${partTxt} · ${st}`
      const actions: ReactElement[] = []
      if (deciding) {
        actions.push(<button key="ap" className="dchip approve" data-testid={`dl-approve-${c.id}`} onClick={() => act(() => decideRequestById(personId, date, c.id, 'approved'), 'Couldn’t approve — something else is on that time')}>Approve</button>)
        if (c.state !== 'acknowledged') actions.push(<button key="ak" className="dchip ack" data-testid={`dl-ack-${c.id}`} onClick={() => act(() => decideRequestById(personId, date, c.id, 'acknowledged'))}>Acknowledge</button>)
        if (c.state !== 'refused') actions.push(<button key="rf" className="dchip refuse" data-testid={`dl-refuse-${c.id}`} onClick={() => act(() => decideRequestById(personId, date, c.id, 'refused'))}>Refuse</button>)
      }
      if (editable) actions.push(<button key="cl" className="dchip" data-testid={`dl-clear-${c.id}`} onClick={() => act(() => clearRecordById(personId, date, c.id))}>Clear</button>)
      const cls = c.state === 'acknowledged' ? 'tbc' : c.state === 'refused' ? 'ref' : ''
      return { key: `r-${c.id}`, cls, text, sub: '', actions }
    }
    if (c.kind === 'credit') {
      const rec = raw.find(r => r.id === c.id) as CreditRec | undefined
      const times = rec?.spans?.length ? rec.spans.map(([a, b]) => `${hhmm(a)}–${hhmm(b)}`).join(', ') : ''
      const text = `${c.code} — OIL earned${rec?.note ? ` (${rec.note})` : ''}${times ? `, worked ${times}` : ''}`
      const actions: ReactElement[] = []
      if (rec?.oil === 'manual' && role === 'admin') actions.push(<button key="cl" className="dchip" data-testid={`dl-clear-${c.id}`} onClick={() => act(() => clearRecordById(personId, date, c.id))}>Clear</button>)
      return { key: `c-${c.id}`, cls: 'sc', text, sub: rec?.oil === 'auto' ? 'From the published schedule.' : '', actions }
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
      {view.conflicts.length > 0 && (
        <div className="bidsheet-row">
          <span className="note warn" data-testid="daylist-clash">
            Two of these can’t both stand on the same time — an admin needs to change one.
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
      {msg && (
        <div className="bidsheet-row">
          <span className="note warn" data-testid="daylist-msg">{msg}</span>
        </div>
      )}
    </Sheet>
  )
}
