/* The Quals page (LoX) — renderQuals' table strings verbatim in a pure
   builder; the tick/untick handlers keep the reference's invariants: NAAR
   is signed off after DAAR, SC NIGHT after SC DAY, and withdrawing the day
   qualification takes the night one with it. */
import { useEffect, useRef, useState } from 'react'
import { PEOPLE, QORDER, QCHIP, QCOLOR, LEVELNAME, deriveQuals, ID_BY_CS } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { SESSION } from '../state/auth'
import { esc } from '../state/view'
import { notify } from '../state/store'
import { useVersion } from './useStore'

const QUAL_COLS: any[] = [
  { k: 'san', h: 'SANS', lav: true }, { k: 'sxo', h: 'SXO', lav: true }, { k: 'imc', h: 'IMC', lav: true }, { k: 'nvg', h: 'NVG', lav: true },
  { k: 'catA', h: 'CAT A', fix: true }, { k: 'catB', h: 'CAT B', fix: true },
  { k: 'instr', h: 'IP', fix: true }, { k: 'dnif', h: 'Downchit', lav: true },
  { k: 'sched', h: 'Scheduler', apt: true },
  { k: 'scDay', h: 'SC DAY', scq: true }, { k: 'scNight', h: 'SC NIGHT', scq: true },
  { k: 'daar', h: 'DAAR', aar: true, fcpOnly: true }, { k: 'naar', h: 'NAAR', aar: true, fcpOnly: true },
]
/* AAR is a front-seat qualification; the rear seat has none */
const qualNA = (p: any, c: any) => !!(c.fcpOnly && p && p.seat !== 'FCP')

function exportCSV(name: string, rows: any[][]) {
  const csv = rows.map(r => r.map(c => `"${String(c == null ? '' : c).replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click()
}

/* renderQuals' head + rows, verbatim strings */
function qualsTable(qSeatView: string, qSort: string, qEditing: boolean, qSearch: string) {
  let ids = Object.keys(PEOPLE).filter(id => PEOPLE[id].seat === qSeatView && !PEOPLE[id].archived)
  if (qSearch) { const s = qSearch.toLowerCase(); ids = ids.filter(id => PEOPLE[id].cs.toLowerCase().includes(s) || (PEOPLE[id].name || '').toLowerCase().includes(s)) }
  ids.sort((a, a2) => {
    const p = PEOPLE[a], q = PEOPLE[a2]
    if (qSort === 'name') return p.cs.localeCompare(q.cs)
    if (qSort === 'flight') return (p.flight || '').localeCompare(q.flight || '') || p.cs.localeCompare(q.cs)
    if (qSort === 'level') return (QORDER[q.q] - QORDER[p.q]) || p.cs.localeCompare(q.cs)
    return 0
  })
  const head = `<thead><tr><th style="text-align:left">Name</th><th>Flight</th><th>Office</th><th>Level</th>` +
    QUAL_COLS.map(c => `<th class="${c.lav ? 'lav' : c.fix ? 'fix' : c.apt ? 'apt' : c.scq ? 'scq' : c.aar ? 'aarq' : ''}" title="${
      c.k === 'sched' ? 'Appointed scheduler — may sign SKED CK, PLANNED BY and APPROVED BY'
      : c.k === 'scDay' ? 'SC DAY — may be planned on an SC shift inside 07:00–19:00'
      : c.k === 'scNight' ? 'SC NIGHT — may be planned on an SC shift reaching outside 07:00–19:00. Needs SC DAY first'
      : c.k === 'daar' ? 'DAAR — day air-to-air refuelling (front seat only)'
      : c.k === 'naar' ? 'NAAR — night air-to-air refuelling. Needs DAAR first'
      : esc(c.h)}">${c.h}</th>`).join('') +
    `<th>Remarks</th><th></th></tr></thead>`
  const rows = ids.map(id => {
    const p = PEOPLE[id]
    const lvl = qEditing
      ? `<select class="qlvlsel" data-lvl="${id}" aria-label="Level for ${esc(p.cs)}">${Object.keys(QCHIP).map(k => `<option ${k === p.q ? 'selected' : ''}>${k}</option>`).join('')}</select>`
      : `<span class="lvl"><span class="qmini" style="background:${QCOLOR[p.q]};${(p.q === 'C' || p.q === 'B') ? 'color:#04222b' : ''}">${QCHIP[p.q]}</span>${p.q}</span>`
    const cells = QUAL_COLS.map(c => {
      if (qualNA(p, c)) return `<td class="qcell na" title="${esc(p.cs)} is a WSO — AAR is a front-seat qualification">–</td>`
      return `<td class="qcell${(c.k === 'sched' && p.quals[c.k]) ? ' apt-on' : ''}${(c.scq && p.quals[c.k]) ? ' scq-on' : ''}${(c.aar && p.quals[c.k]) ? ' aar-on' : ''}" data-q="${id}|${c.k}">${p.quals[c.k] ? '<span class="qchk">✓</span>' : ''}</td>`
    }).join('')
    return `<tr><td class="qname" data-person="${id}" title="${esc(p.name || '')}">${esc(p.cs)}</td><td>${esc(p.flight || '')}</td><td>${esc(p.office || '')}</td><td>${lvl}</td>${cells}<td style="text-align:left;color:var(--ink-3)">${LEVELNAME[p.q]}</td><td><span class="qarch" data-arch="${id}" title="Archive">✕</span></td></tr>`
  }).join('')
  return head + `<tbody><tr class="grp"><td colspan="${5 + QUAL_COLS.length + 1}">${qSeatView === 'FCP' ? 'Assigned pilots' : 'Assigned WSOs'} · ${ids.length}</td></tr>${rows}</tbody>`
}

export function QualsPage() {
  useVersion()
  const [qSeatView, setSeat] = useState('FCP')
  const [qSort, setSort] = useState('name')
  const [qEditing, setEditing] = useState(false)
  const [qSearch, setQSearch] = useState('')
  const [addP, setAddP] = useState({ last: '', first: '', cs: '', flight: '', seat: 'FCP', level: 'OCU' })
  const tblRef = useRef<HTMLTableElement>(null)
  const admin = !!SESSION && SESSION.role === 'admin'

  /* the reference's tick/untick + archive + level handlers, verbatim logic */
  useEffect(() => {
    const tbl = tblRef.current!
    const onClick = (e: Event) => {
      if (!(tbl.classList.contains('editing'))) return
      const t = e.target as HTMLElement
      const cell = t.closest('[data-q]') as HTMLElement | null
      if (cell) {
        const [id, k] = cell.dataset.q!.split('|') as [string, string]
        const p = PEOPLE[id]; const on = !p.quals[k]
        /* night AAR is signed off after day AAR, never before it */
        if (k === 'naar' && on && !p.quals.daar) { notify(); return HOOKS.toast(`${p.cs} needs DAAR before NAAR can be ticked`) }
        /* SC night is signed off after SC day, exactly as NAAR is after DAAR */
        if (k === 'scNight' && on && !p.quals.scDay) { notify(); return HOOKS.toast(`${p.cs} needs SC DAY before SC NIGHT can be ticked`) }
        p.quals[k] = on
        if (k === 'daar' && !on && p.quals.naar) { p.quals.naar = false; HOOKS.toast(`${p.cs} — NAAR removed too, it cannot stand without DAAR`) }
        if (k === 'scDay' && !on && p.quals.scNight) { p.quals.scNight = false; HOOKS.toast(`${p.cs} — SC NIGHT removed too, it cannot stand without SC DAY`) }
        notify(); return
      }
      const arch = t.closest('[data-arch]') as HTMLElement | null
      if (arch) { PEOPLE[arch.dataset.arch!].archived = true; notify() }
    }
    const onChange = (e: Event) => {
      const s = (e.target as HTMLElement).closest('[data-lvl]') as HTMLSelectElement | null
      if (s) { PEOPLE[s.dataset.lvl!].q = s.value; deriveQuals(PEOPLE[s.dataset.lvl!]); notify() }
    }
    tbl.addEventListener('click', onClick)
    tbl.addEventListener('change', onChange)
    return () => { tbl.removeEventListener('click', onClick); tbl.removeEventListener('change', onChange) }
  }, [])

  const addPerson = () => {
    const cs = addP.cs.trim(); if (!cs) return
    const id = 'p' + Date.now()
    PEOPLE[id] = { cs, name: (addP.first + ' "' + cs + '" ' + addP.last).trim(), seat: addP.seat, q: addP.level, flight: addP.flight.trim() || '-', office: '-' }
    deriveQuals(PEOPLE[id]); ID_BY_CS[cs.toLowerCase()] = id
    setAddP({ last: '', first: '', cs: '', flight: '', seat: addP.seat, level: addP.level })
    if (PEOPLE[id].seat !== qSeatView) setSeat(PEOPLE[id].seat)
    notify()
  }

  const doExport = () => {
    const cols = ['Callsign', 'Name', 'Flight', 'Office', 'Level', ...QUAL_COLS.map(c => c.h)]
    const rows: any[][] = [cols]
    Object.keys(PEOPLE).filter(id => PEOPLE[id].seat === qSeatView && !PEOPLE[id].archived).forEach(id => {
      const p = PEOPLE[id]; rows.push([p.cs, (p.name || '').replace(/"/g, ''), p.flight, p.office, p.q, ...QUAL_COLS.map(c => p.quals[c.k] ? 'Y' : '')])
    })
    exportCSV(`142SQN-LoX-${qSeatView}.csv`, rows)
  }

  return (
    <>
      <div className="qbar">
        {admin && <button className="abtn primary" id="qEdit" hidden={qEditing} onClick={() => setEditing(true)}>Enable editing</button>}
        <button className="abtn" id="qSave" hidden={!qEditing}
          onClick={() => { setEditing(false); HOOKS.toast('Quals saved (prototype — writes to Dataverse in the full build).') }}>Save changes</button>
        <input className="datef" id="qDate" defaultValue="23/06/2026" style={{ maxWidth: 120 }} />
        <button className="abtn" id="qExport" onClick={doExport}>Export to Excel</button>
        <span className="div" style={{ width: 1, height: 22, background: 'var(--edge)' }}></span>
        <button className={'fchip' + (qSeatView === 'FCP' ? ' on' : '')} id="qViewP" onClick={() => setSeat('FCP')}>Pilots</button>
        <button className={'fchip' + (qSeatView === 'RCP' ? ' on' : '')} id="qViewW" onClick={() => setSeat('RCP')}>WSOs</button>
        <span className="lab">Sort</span>
        {(['name', 'flight', 'level'] as const).map(s =>
          <button key={s} className={'fchip' + (qSort === s ? ' on' : '')} data-sort={s} onClick={() => setSort(s)}>
            {{ name: 'Name', flight: 'Flight', level: 'UG Level' }[s]}
          </button>)}
        <div className="grow"></div>
        <div className="searchbox">🔍<input id="qFilter" placeholder="filter" value={qSearch} onChange={e => setQSearch(e.target.value)} /></div>
      </div>
      <div className="qhelp">
        Similar to a LoX and integrated with the board — a person's <b>Level</b> drives their puck's qualification chip colour and the validator rules.
        A check (✓) means the person holds that qualification. In edit mode, click a cell to toggle it, or the red ✕ to archive someone.
        <a id="qAddQual" onClick={() => HOOKS.toast('Shortcut to the Admin page (Django-style backend in the full build).')}> Add qualifications</a> · <a id="qUses">Set which quals your squadron uses</a> · <a id="qAdminLink">Admin page</a>
      </div>
      {admin && <div className="qadd" data-admin="">
        <span className="lab">Add person</span>
        <input id="qLast" placeholder="Last name" style={{ width: 110 }} value={addP.last} onChange={e => setAddP({ ...addP, last: e.target.value })} />
        <input id="qFirst" placeholder="First name" style={{ width: 110 }} value={addP.first} onChange={e => setAddP({ ...addP, first: e.target.value })} />
        <input id="qCS" placeholder="Callsign" style={{ width: 100 }} value={addP.cs} onChange={e => setAddP({ ...addP, cs: e.target.value })} />
        <input id="qFlight" placeholder="Flight" style={{ width: 70 }} value={addP.flight} onChange={e => setAddP({ ...addP, flight: e.target.value })} />
        <select id="qSeat" aria-label="Seat" value={addP.seat} onChange={e => setAddP({ ...addP, seat: e.target.value })}><option value="FCP">Pilot (FCP)</option><option value="RCP">WSO (RCP)</option></select>
        <select id="qLevel" aria-label="Qualification level" value={addP.level} onChange={e => setAddP({ ...addP, level: e.target.value })}>{Object.keys(QCHIP).map(k => <option key={k}>{k}</option>)}</select>
        <button className="abtn primary" id="qAddPerson" onClick={addPerson}>Add</button>
      </div>}
      <div className="qwrap">
        <table className={'qtbl' + (qEditing ? ' editing' : '')} id="qtbl" ref={tblRef}
          dangerouslySetInnerHTML={{ __html: qualsTable(qSeatView, qSort, qEditing, qSearch) }} />
      </div>
    </>
  )
}
