/* The app frame: topbar, nav, and the pages. Markup mirrored 1:1 from the
   reference (#shell, .topbar, .page sections). Only the view-only schedule
   page is live in this slice; the other pages are placeholders that arrive
   surface by surface. */
import { useEffect, useState } from 'react'
import { WARN, validate } from '../engine/validate'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { WEEKS, CURWEEK } from '../engine/waves'
import { SCHED, approvedDays, alColor, alCount, alDays, daysLabel, pendDays, pendCount } from '../engine/publish'
import { rulesOffCount } from '../engine/rules'
import { SESSION, ME, setMe } from '../state/auth'
import { setSession, notify, setPage } from '../state/store'
import { HLSET, setSearch, openWarns } from '../state/view'
import { useVersion } from './useStore'
import { ViewWeek } from './ViewWeek'
import { legendHTML } from './html'
import { routeClick } from './interactions'
import { InputsPage } from './InputsPage'
import { LogicPage } from './LogicPage'

/* the week banner — the exact strings renderStatus builds, as a pure value */
function banner() {
  const al = SCHED.al, col = alColor(al)
  const okD = approvedDays(), okN = okD.length, tot = DAYS.length
  let txt: string, cls: string
  if (okN === 0 && SCHED.als.length) { txt = `REOPENED · ${SCHED.als.length} amendment${SCHED.als.length > 1 ? 's' : ''} still issued`; cls = 'part' }
  else if (okN === 0) { txt = 'DRAFT · no days published'; cls = 'draft' }
  else if (okN < tot) { txt = `PART-PUBLISHED · ${okN} of ${tot} days`; cls = 'part' }
  else if (al > 0) { txt = `AL${al} PUBLISHED · all ${tot} days published`; cls = 'al' }
  else { txt = `APPROVED · all ${tot} days published`; cls = 'approved' }
  const which = okN && okN < tot ? ` · ${daysLabel(okD)}` : ''
  const pd = pendDays(), np = pendCount()
  const extra = np ? ` · ${np} unpublished edit${np > 1 ? 's' : ''} on ${daysLabel(pd)}` : ''
  const alRoll = SCHED.als.length
    ? `<span class="sb-als">` + SCHED.als.slice().sort((a: any, b: any) => a.n - b.n)
      .map((a: any) => `<span class="sb-al" data-alc="${a.n}" title="AL${a.n} — ${alCount(a)} item${alCount(a) > 1 ? 's' : ''} on ${daysLabel(alDays(a))}"><b>AL${a.n}</b> ${daysLabel(alDays(a))}</span>`).join('') + `</span>`
    : ''
  return { col, cls, html: `<span class="sb-badge">${txt}${which}${extra}</span>` + alRoll }
}

const HL_CHIPS: [string, string, string][] = [
  ['A', 'A', 'Cat A (4-ship FL)'], ['B', 'B', 'Cat B (2-ship FL)'], ['C', 'C', 'Cat C (operational wingman)'], ['D', 'D', 'Cat D (wingman)'],
]
const HL_CHIPS2: [string, string, string][] = [
  ['SUP', 'SUP', 'Supervisors — Cat A & B'], ['FL', 'FL', 'All flight leads (Cat A & B)'], ['INS', 'Ins', 'Instructors (I / CI / IR)'],
  ['SXO', 'SXO', 'SXO-qualified'], ['SANS', 'SANS', 'SANS — staff-assigned & NS aircrew'], ['OCU', 'OCU', 'OCU (ab-initio)'],
]

export function Shell() {
  useVersion()
  const [page, setPageLocal] = useState('viewsched')
  /* one delegated click listener, exactly as the reference wires it */
  useEffect(() => {
    document.addEventListener('click', routeClick)
    return () => document.removeEventListener('click', routeClick)
  }, [])
  validate()
  const hard = WARN.all.filter((x: any) => x.sev === 'hard').length
  const note = WARN.all.filter((x: any) => x.sev === 'note').length
  const adv = WARN.all.length - hard - note
  const b = banner()
  const admin = SESSION && SESSION.role === 'admin'
  const nav = (p: string) => { setPageLocal(p); setPage(p); notify() }
  const people = Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived)
    .sort((a, b) => PEOPLE[a].cs.localeCompare(PEOPLE[b].cs))

  return (
    <div id="shell" style={{ ['--al' as any]: b.col }}>
      <div className="topbar">
        <button className="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
        <div className="mark">
          <svg className="rglyph" viewBox="0 -2 60 64" aria-hidden="true"><path d="M3 8 Q4.9 38.3 24 62 Q11.5 35.8 3 8 Z M16 0 Q17.4 35.0 42 60 Q26.6 31.0 16 0 Z M31 -2 Q36.4 23.5 58 38 Q42.9 19.1 31 -2 Z" /></svg>
          <span className="tx"><span className="k">142 SQN · Flying Programme</span><span className="v">RAPTOR</span></span>
        </div>
        <nav className="nav" id="topnav">
          <a data-page="editsched" data-admin="" hidden={!admin} className={page === 'editsched' ? 'on' : ''} onClick={() => nav('editsched')}>Edit Schedule</a>
          <a data-page="viewsched" className={page === 'viewsched' ? 'on' : ''} onClick={() => nav('viewsched')}>View-only Sched</a>
          <a data-page="inputs" className={page === 'inputs' ? 'on' : ''} onClick={() => nav('inputs')}>Inputs</a>
          <a data-page="quals" className={page === 'quals' ? 'on' : ''} onClick={() => nav('quals')}>Quals</a>
          <a data-page="logic" className={page === 'logic' ? 'on' : ''} onClick={() => nav('logic')}>Logic</a>
        </nav>
        <div className="spring">
          <div className="acct">
            <div className="sel"><label>View as</label>
              <select id="viewAs" aria-label="View the schedule as" value={ME} onChange={e => { setMe(e.target.value); notify() }}>
                {people.map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
              </select></div>
            <span className={'rolebadge ' + (admin ? 'admin' : '')} id="roleBadge">{admin ? 'Admin' : 'Member'}</span>
            {admin && <button className="abtn" id="manageUsers" data-admin="" title="Arrives in a later slice of the port">Manage users</button>}
          </div>
          <button className="fastsync" id="fastSync" title="Toggle 1-second sync (for publishing / meetings)"><span className="dot"></span><span id="syncLbl">Sync · slow</span></button>
          <button className="pillbtn hard" id="warnBtn" onClick={() => { openWarns('hard'); notify() }}><span className="dot"></span><span id="nHard">{hard}</span> warning</button>
          <button className="pillbtn adv" id="warnBtn2" onClick={() => { openWarns('adv'); notify() }}><span className="dot"></span><span id="nAdv">{adv}</span> advisory</button>
          <button className="pillbtn note" id="warnBtn3" onClick={() => { openWarns('note'); notify() }}><span className="dot"></span><span id="nNote">{note}</span> note</button>
          <button className="abtn" id="insightBtn" title="Week insights — arrives in a later slice">Insights</button>
          <button className="abtn ghost" id="logout" onClick={() => { setSession(null); notify() }}>Logout</button>
        </div>
      </div>

      {/* ===== VIEW-ONLY SCHEDULE ===== */}
      <section className={'page' + (page === 'viewsched' ? ' on' : '')} id="page-viewsched">
        <div className="seg" id="weekSeg">
          <input className="datef" id="dateVField" defaultValue={CURWEEK} style={{ maxWidth: 120 }} />
          {WEEKS.map((w: any) => <button key={w.v} className={'wk' + (w.v === CURWEEK ? ' on' : '')} data-wk={w.v}>{w.lbl}</button>)}
        </div>
        <div className="filters">
          <span className="lab">Highlight</span>
          {HL_CHIPS.map(([k, t, ttl]) => <button key={k} className={'fchip' + (HLSET.has(k) ? ' on' : '')} data-hl={k} title={ttl}
            onClick={() => { HLSET.has(k) ? HLSET.delete(k) : HLSET.add(k); notify() }}>{t}</button>)}
          <span className="div"></span>
          {HL_CHIPS2.map(([k, t, ttl]) => <button key={k} className={'fchip' + (HLSET.has(k) ? ' on' : '')} data-hl={k} title={ttl}
            onClick={() => { HLSET.has(k) ? HLSET.delete(k) : HLSET.add(k); notify() }}>{t}</button>)}
          <div className="right">
            <div className="searchbox">🔍<input id="searchV" placeholder="name / callsign"
              onInput={e => { setSearch((e.target as HTMLInputElement).value); notify() }} /></div>
          </div>
        </div>
        <div className="title"><h1 id="vTitle">Jul 13 – Jul 17</h1><span className="sub mono" id="vSub">142 SQN · week of 13 Jul 26 · all times local</span></div>
        <div className={'schedbanner ' + b.cls + (rulesOffCount() ? ' rules-off' : '')} id="vBanner"
          style={{ ['--al' as any]: b.col }} dangerouslySetInnerHTML={{ __html: b.html }} />
        <div className="legend" id="vLegend" dangerouslySetInnerHTML={{ __html: legendHTML() }} />
        <ViewWeek />
        <div className="daydots" id="vDots"></div>
      </section>

      {/* the remaining pages arrive surface by surface (phase 4b+) */}
      <section className={'page' + (page === 'editsched' ? ' on' : '')} id="page-editsched">
        <div className="mobile-note">The edit board arrives in the next slice of the port.</div>
      </section>
      <section className={'page' + (page === 'inputs' ? ' on' : '')} id="page-inputs">
        {page === 'inputs' && <InputsPage />}
      </section>
      <section className={'page' + (page === 'quals' ? ' on' : '')} id="page-quals">
        <div className="mobile-note">The Quals page arrives in a later slice of the port.</div>
      </section>
      <section className={'page' + (page === 'logic' ? ' on' : '')} id="page-logic">
        {page === 'logic' && <LogicPage />}
      </section>
    </div>
  )
}
