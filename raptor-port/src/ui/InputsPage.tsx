/* The Personal inputs page — markup mirrored 1:1 from the reference (same
   ids, classes and columns), behaviour through the store. The add/delete
   logic is the reference's verbatim, including the role gate that keeps a
   member view-only, and both go through writeInputs so they join the undo
   stack and re-validate the week. */
import { useState } from 'react'
import { INPUTS, INPUT_TYPES, DATES, inputCoversDate } from '../engine/inputs'
import { acceptInput, unacceptInput, acceptedDay } from '../engine/slots'
import { PEOPLE } from '../engine/people'
import { hhmm, parseHM } from '../engine/time'
import { HOOKS } from '../engine/hooks'
import { SESSION, ME } from '../state/auth'
import { writeInputs, writeInputsBatch, notify } from '../state/store'
import { useVersion } from './useStore'
import { exportCSV } from './export'
import { RangeCal } from './RangeCal'

const people = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived)
  .sort((a, b) => PEOPLE[a].cs.localeCompare(PEOPLE[b].cs))

/* the reference's date formatter, verbatim (yyyy-mm-dd → 'Jul 14') */
const fmt = (d: any) => { if (!d) return DATES[0]; const [, m, da] = d.split('-'); return ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m] + ' ' + String(+da) }

/* fmt's inverse — the model stores 'Jul 14' labels, the calendar speaks
   yyyy-mm-dd. The demo week is 2026, which is the only year the labels imply. */
const unfmt = (lbl: any) => {
  const p = String(lbl || '').trim().split(/\s+/)
  const mi = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(p[0])
  if (mi < 0 || !p[1]) return ''
  return `2026-${String(mi + 1).padStart(2, '0')}-${String(+p[1]).padStart(2, '0')}`
}

export function InputsPage() {
  useVersion()
  const [person, setPerson] = useState(ME)
  const [type, setType] = useState(INPUT_TYPES[0])
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [allday, setAllday] = useState(true)
  /* the defaults reproduce the old hardcoded window, so an untouched form
     still writes 06:00–18:00 */
  const [sTime, setSTime] = useState('06:00')
  const [eTime, setETime] = useState('18:00')
  const [repeat, setRepeat] = useState(0)
  const [remarks, setRemarks] = useState('')
  const [fPerson, setFPerson] = useState('all')
  const [fType, setFType] = useState('all')
  const [fSearch, setFSearch] = useState('')
  const [editRow, setEditRow] = useState<any>(null)
  const [draft, setDraft] = useState<any>(null)

  const add = () => {
    /* the Inputs page is the one page a member can reach that mutates the
       shared model — the role gate is the reference's, verbatim */
    if (SESSION.role !== 'admin') return HOOKS.toast('View only — ask a scheduler to add this', 'warn')
    /* the calendar asks for a pick and the readout says so — accepting the
       click anyway and quietly dating it Monday was a trap */
    if (!start) return HOOKS.toast('Pick a start date on the calendar first', 'warn')
    const date = fmt(start), endDate = end && fmt(end) !== date ? fmt(end) : undefined
    /* timing is the owner's ask (Aug 26): the validator reasons in minutes, so
       a timed input carries the times the aircrew actually stated — no more
       silent 06:00–18:00. The overlap math assumes s < e within one day. */
    const s = allday ? 0 : parseHM(sTime), e = allday ? 1439 : parseHM(eTime)
    if (!allday && (s == null || e == null)) return HOOKS.toast('Give the input a start and end time, or tick All day', 'warn')
    if (!allday && (e as number) <= (s as number)) return HOOKS.toast('End time must be after start time', 'warn')
    writeInputs(() => INPUTS.unshift({
      person, date, endDate, allday, s, e,
      type, remarks: remarks.trim(),
      recur: (+repeat || 0) ? ('x' + repeat + ' wks') : '', mod: 'now',
    }))
    setRemarks('')
  }

  /* the pencil turns ONE row into fields in place (owner, Aug 26). The draft is
     held apart from the model so Cancel is a real cancel, and the commit runs
     through writeInputs like every other mutation — so an edit joins the undo
     stack and re-validates the week. */
  const startEdit = (inx: number) => {
    if (SESSION.role !== 'admin') return HOOKS.toast('View only — ask a scheduler to edit this', 'warn')
    const r = INPUTS[inx]
    /* the ROW ITSELF is held, never its index: adding, deleting or undoing
       while an editor is open renumbers INPUTS, and an index captured before
       that would commit the draft onto somebody else's input */
    setEditRow(r)
    setDraft({
      person: r.person, type: r.type, allday: !!r.allday,
      start: unfmt(r.date), end: r.endDate ? unfmt(r.endDate) : '',
      sTime: r.allday ? '06:00' : hhmm(r.s), eTime: r.allday ? '18:00' : hhmm(r.e),
      remarks: r.remarks || '',
    })
  }
  const saveEdit = () => {
    const r = editRow
    if (!r || !draft) return
    if (INPUTS.indexOf(r) < 0) {                 // deleted or undone underneath us
      setEditRow(null); setDraft(null)
      return HOOKS.toast('That input is no longer there — nothing was saved', 'warn')
    }
    const s = draft.allday ? 0 : parseHM(draft.sTime), e = draft.allday ? 1439 : parseHM(draft.eTime)
    if (!draft.allday && (s == null || e == null)) return HOOKS.toast('Give the input a start and end time, or tick All day', 'warn')
    if (!draft.allday && (e as number) <= (s as number)) return HOOKS.toast('End time must be after start time', 'warn')
    const date = fmt(draft.start), endDate = draft.end && fmt(draft.end) !== date ? fmt(draft.end) : undefined
    writeInputsBatch(() => {
      /* An ACCEPTED input is linked to the row it created by `src`, a content
         key of person|date|type|s. Editing any of those silently broke the
         link: the row stayed on the programme, undo could no longer find it,
         and it could never be removed. So an accepted input is un-accepted
         through the real path FIRST, edited, then re-accepted — which also
         moves the row when the date moves it to another day. */
      const wasAcc = r.acc
      /* the row may sit on any day the input spans, not its start date */
      const wasDi = wasAcc === 'g' ? acceptedDay(r) : -1
      if (wasAcc) unacceptInput(wasDi, r)
      r.person = draft.person; r.type = draft.type; r.allday = draft.allday
      r.s = s; r.e = e; r.date = date; r.remarks = draft.remarks.trim(); r.mod = 'now'
      if (endDate) r.endDate = endDate; else delete r.endDate
      if (wasAcc) {
        /* put it back on the day it was on, if the edit still covers that day;
           otherwise its new start date */
        const keep = wasDi >= 0 && DATES[wasDi] && inputCoversDate(r, DATES[wasDi])
        const di = keep ? wasDi : DATES.indexOf(r.date)
        if (di >= 0) acceptInput(di, r, wasAcc)
        else HOOKS.toast('Moved outside the programmed week — it is no longer accepted', 'warn')
      }
    })
    setEditRow(null); setDraft(null)
  }

  const del = (inx: number) => {
    if (SESSION.role !== 'admin') return HOOKS.toast('View only — ask a scheduler to remove this', 'warn')
    const r = INPUTS[inx]
    /* deleting an ACCEPTED input used to leave its ground row on the programme
       for good — nothing pointed at it any more, so it could never be removed
       and it still printed and validated as a real commitment */
    writeInputsBatch(() => {
      if (r && r.acc) unacceptInput(acceptedDay(r), r)
      INPUTS.splice(inx, 1)
      if (editRow === r) { setEditRow(null); setDraft(null) }
    })
  }

  let rows = INPUTS.slice()
  if (fPerson !== 'all') rows = rows.filter((r: any) => r.person === fPerson)
  if (fType !== 'all') rows = rows.filter((r: any) => r.type === fType)
  if (fSearch) { const s = fSearch.toLowerCase(); rows = rows.filter((r: any) => (r.remarks || '').toLowerCase().includes(s) || (PEOPLE[r.person] ? PEOPLE[r.person].cs.toLowerCase() : '').includes(s)) }

  return (
    <>
      <div className="title"><h1>Personal Inputs</h1></div>
      <div className="inbar">
        <div className="ingrid">
          <div className="ifield"><label>Person</label>
            <select id="inPerson" aria-label="Person" value={person} onChange={e => setPerson(e.target.value)}>
              {people().map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
            </select></div>
          <div className="ifield cal"><label>Dates</label>
            <RangeCal idPrefix="in" start={start} end={end} onPick={(s2, e2) => { setStart(s2); setEnd(e2) }} />
            <div className="rc-read" id="inDates">{start ? (fmt(start) + (end ? ' → ' + fmt(end) : '')) : 'pick a start date'}</div>
          </div>
          <div className="ifield chk"><label>All day</label><input id="inAllday" type="checkbox" checked={allday} onChange={e => setAllday(e.target.checked)} /></div>
          <div className="ifield"><label>Start time</label><input id="inStartT" type="time" value={sTime} disabled={allday} onChange={e => setSTime(e.target.value)} /></div>
          <div className="ifield"><label>End time</label><input id="inEndT" type="time" value={eTime} disabled={allday} onChange={e => setETime(e.target.value)} /></div>
          <div className="ifield"><label>Type</label>
            <select id="inType" aria-label="Input type" value={type} onChange={e => setType(e.target.value)}>
              {INPUT_TYPES.map((t: string) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="ifield"><label>Repeat wks</label><input id="inRepeat" type="number" value={repeat} min={0} onChange={e => setRepeat(+e.target.value)} /></div>
          <div className="ifield"><label>Remarks</label><input id="inRemarks" placeholder="e.g. medical appt" value={remarks} onChange={e => setRemarks(e.target.value)} /></div>
          <div className="ifield"><label>&nbsp;</label><button className="abtn primary" id="inAdd" onClick={add}>Add input</button></div>
        </div>
      </div>
      <div className="infilter">
        <span className="lab">Filter</span>
        <select id="inFPerson" aria-label="Filter by person" value={fPerson} onChange={e => { setFPerson(e.target.value); notify() }}>
          <option value="all">Personnel</option>
          {people().map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
        </select>
        <select id="inFType" aria-label="Filter by type" value={fType} onChange={e => { setFType(e.target.value); notify() }}>
          <option value="all">Show all types</option>
          {INPUT_TYPES.map((t: string) => <option key={t}>{t}</option>)}
        </select>
        <div className="searchbox">🔍<input id="inFSearch" placeholder="search" value={fSearch} onChange={e => setFSearch(e.target.value)} /></div>
        <button className="abtn" id="inExport" onClick={() => {
          const out: any[][] = [['Name', 'Date', 'Start', 'End', 'Type', 'Remarks']]
          INPUTS.forEach((r: any) => out.push([PEOPLE[r.person] ? PEOPLE[r.person].cs : r.person, r.date, r.allday ? 'all day' : hhmm(r.s), r.allday ? 'all day' : hhmm(r.e), r.type, r.remarks]))
          exportCSV('142SQN-inputs.csv', out)
        }}>Export to Excel</button>
      </div>
      <div className="inwrap">
        <table className="intbl" id="intbl">
          <thead><tr><th>Name</th><th>Start</th><th>End</th><th>Type</th><th>Remarks</th><th>Recurring</th><th>Last modified</th><th></th></tr></thead>
          <tbody id="inBody">
            {rows.map((r: any) => {
              const cs = PEOPLE[r.person] ? PEOPLE[r.person].cs : r.person
              const st = r.date + (r.allday ? '' : ' ' + hhmm(r.s))
              const en = (r.endDate || r.date) + (r.allday ? '' : ' ' + hhmm(r.e))
              const inx = INPUTS.indexOf(r)
              if (editRow === r && draft) return (
                <tr key={inx} className="ined">
                  <td><select aria-label="Person" data-ed="person" value={draft.person}
                    onChange={e => setDraft({ ...draft, person: e.target.value })}>
                    {people().map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
                  </select></td>
                  <td colSpan={2}>
                    <RangeCal idPrefix="ined" start={draft.start} end={draft.end}
                      onPick={(s2, e2) => setDraft({ ...draft, start: s2, end: e2 })} />
                    <div className="rc-read">{draft.start ? (fmt(draft.start) + (draft.end ? ' → ' + fmt(draft.end) : '')) : 'pick a start date'}</div>
                    <label className="ined-ad"><input type="checkbox" data-ed="allday" checked={draft.allday}
                      onChange={e => setDraft({ ...draft, allday: e.target.checked })} /> all day</label>
                    <span className="ined-t" hidden={draft.allday}>
                      <input type="time" aria-label="Start time" data-ed="stime" value={draft.sTime}
                        onChange={e => setDraft({ ...draft, sTime: e.target.value })} />
                      <input type="time" aria-label="End time" data-ed="etime" value={draft.eTime}
                        onChange={e => setDraft({ ...draft, eTime: e.target.value })} />
                    </span>
                  </td>
                  <td><select aria-label="Type" data-ed="type" value={draft.type}
                    onChange={e => setDraft({ ...draft, type: e.target.value })}>
                    {INPUT_TYPES.map((t: string) => <option key={t}>{t}</option>)}
                  </select></td>
                  <td><input aria-label="Remarks" data-ed="remarks" value={draft.remarks}
                    onChange={e => setDraft({ ...draft, remarks: e.target.value })} /></td>
                  <td>{r.recur || ''}</td>
                  <td className="mono" style={{ color: 'var(--ink-3)' }}>{r.mod || ''}</td>
                  <td className="inact">
                    <span className="rok" data-save={inx} title="Save" onClick={saveEdit}>✓</span>
                    <span className="rmx" data-cancel={inx} title="Cancel" onClick={() => { setEditRow(null); setDraft(null) }}>✕</span>
                  </td>
                </tr>
              )
              return (
                <tr key={inx}>
                  <td>{cs}</td><td>{st}</td><td>{en}</td>
                  <td><span className="intag">{r.type}</span></td>
                  <td>{r.remarks || ''}</td><td>{r.recur || ''}</td>
                  <td className="mono" style={{ color: 'var(--ink-3)' }}>{r.mod || ''}</td>
                  <td className="inact">
                    <span className="red" data-edit={inx} title="Edit this input" onClick={() => startEdit(inx)}>✎</span>
                    <span className="rmx" data-inx={inx} onClick={() => del(inx)}>✕</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="empty" id="inEmpty" hidden={rows.length > 0}>No inputs match.</div>
      </div>
    </>
  )
}
