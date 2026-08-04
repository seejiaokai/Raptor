/* The Personal inputs page — markup mirrored 1:1 from the reference (same
   ids, classes and columns), behaviour through the store. The add/delete
   logic is the reference's verbatim, including the role gate that keeps a
   member view-only, and both go through writeInputs so they join the undo
   stack and re-validate the week. */
import { useState } from 'react'
import { INPUTS, INPUT_TYPES, DATES } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { hhmm, parseHM } from '../engine/time'
import { HOOKS } from '../engine/hooks'
import { SESSION, ME } from '../state/auth'
import { writeInputs, notify } from '../state/store'
import { useVersion } from './useStore'
import { exportCSV } from './export'

const people = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived)
  .sort((a, b) => PEOPLE[a].cs.localeCompare(PEOPLE[b].cs))

/* the reference's date formatter, verbatim (yyyy-mm-dd → 'Jul 14') */
const fmt = (d: any) => { if (!d) return DATES[0]; const [, m, da] = d.split('-'); return ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m] + ' ' + String(+da) }

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

  const add = () => {
    /* the Inputs page is the one page a member can reach that mutates the
       shared model — the role gate is the reference's, verbatim */
    if (SESSION.role !== 'admin') return HOOKS.toast('View only — ask a scheduler to add this', 'warn')
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

  const del = (inx: number) => {
    if (SESSION.role !== 'admin') return HOOKS.toast('View only — ask a scheduler to remove this', 'warn')
    writeInputs(() => INPUTS.splice(inx, 1))
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
          <div className="ifield"><label>Start</label><input id="inStart" type="date" value={start} onChange={e => setStart(e.target.value)} /></div>
          <div className="ifield"><label>End</label><input id="inEnd" type="date" value={end} onChange={e => setEnd(e.target.value)} /></div>
          <div className="ifield chk"><label>All day</label><input id="inAllday" type="checkbox" checked={allday} onChange={e => setAllday(e.target.checked)} /></div>
          <div className="ifield"><label>Start time</label><input id="inStartT" type="time" value={sTime} disabled={allday} onChange={e => setSTime(e.target.value)} /></div>
          <div className="ifield"><label>End time</label><input id="inEndT" type="time" value={eTime} disabled={allday} onChange={e => setETime(e.target.value)} /></div>
          <div className="ifield"><label>Type</label>
            <select id="inType" aria-label="Input type" value={type} onChange={e => setType(e.target.value)}>
              {INPUT_TYPES.map((t: string) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="ifield"><label>Repeat wks</label><input id="inRepeat" type="number" value={repeat} min={0} style={{ width: 70 }} onChange={e => setRepeat(+e.target.value)} /></div>
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
              return (
                <tr key={inx}>
                  <td>{cs}</td><td>{st}</td><td>{en}</td>
                  <td><span className="intag">{r.type}</span></td>
                  <td>{r.remarks || ''}</td><td>{r.recur || ''}</td>
                  <td className="mono" style={{ color: 'var(--ink-3)' }}>{r.mod || ''}</td>
                  <td><span className="rmx" data-inx={inx} onClick={() => del(inx)}>✕</span></td>
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
