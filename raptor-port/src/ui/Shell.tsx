/* The app frame: topbar, nav, and the pages. Markup mirrored 1:1 from the
   reference (#shell, .topbar, .page sections). Only the view-only schedule
   page is live in this slice; the other pages are placeholders that arrive
   surface by surface. */
import { useEffect, useMemo, useState } from 'react'
import { WARN } from '../engine/validate'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { WEEKS, CURWEEK } from '../engine/waves'
import { SCHED, approvedDays, alColor, alCount, alDays, daysLabel, pendDays, pendCount } from '../engine/publish'
import { rulesOffCount } from '../engine/rules'
import { SESSION, ME, setMe } from '../state/auth'
import { resetSession, notify, setPage } from '../state/store'
import { HLSET, setSearch, openWarns, CURPAGE, setDayPreview, toggleViewWork } from '../state/view'
import { initDrag } from './drag'
import { initPan, updateWeekNav, panDays } from './pan'
import { signOf } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { canEditSched } from '../state/auth'
import { slotVal, setSlotVal } from '../engine/slots'
import { afterSchedMutate } from '../state/view'
import { undo, redo } from '../state/store'
import { HIST } from '../state/history'
import { useVersion } from './useStore'
import { ViewWeek } from './ViewWeek'
import { legendHTML } from './html'
import { routeClick } from './interactions'
import { routeFocusOut, routeKeyDown } from './textedit'
import { DayPop, InsightsModal, UserModal, AirPop } from './Modals'
import { setInsights, setUserModal, setDrawer } from './pops'
import { Drawer } from './Drawer'
import { exportCSV, schedRows } from './export'
import { InputsPage } from './InputsPage'
import { LogicPage } from './LogicPage'
import { QualsPage } from './QualsPage'
import { EditWeek, EditRoster } from './EditWeek'
import { ALPanel } from './ALPanel'

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
  ['SUP', 'SUP', 'Supervisors — Cat A & B'], ['FL', 'FL', 'All flight leads (Cat A & B)'], ['INS', 'Ins', 'Instructors (IW / IP / IR / FI)'],
  ['SXO', 'SXO', 'SXO-qualified'], ['SANS', 'SANS', 'SANS — staff-assigned & NS aircrew'], ['OCU', 'OCU', 'OCU (ab-initio)'],
]

export function Shell() {
  useVersion()
  /* the current page IS view.CURPAGE — the reference's global, one source of
     truth. A nav click writes it and notifies; this component re-reads it on
     every store tick, so no parallel React state is needed. */
  const page = CURPAGE
  /* fast sync (demo) — the toggle only demonstrates itself, as the reference
     notes: no server in the prototype */
  const [fast, setFast] = useState(false)
  /* one delegated click listener, exactly as the reference wires it — plus
     the sign-off change listener and right-click-to-clear */
  useEffect(() => {
    const onChange = (e: Event) => {
      /* the per-day version dropdown lives in the same string-built day head as
         the sign-off selects, so it routes through the same document listener.
         Pure view state — no histPush: previewing is looking, not editing. */
      const dv = (e.target as HTMLElement).closest('select[data-dver]') as HTMLSelectElement | null
      if (dv) {
        const v = dv.value
        /* 'd:<id>' is a draft preview (engine/drafts.ts) — kept as the string,
           which daySnapOf resolves like any other version */
        setDayPreview(+dv.dataset.dver!, v === 'live' ? null : (v === 'orig' || v.slice(0, 2) === 'd:' ? v : +v))
        notify(); return
      }
      /* the view page's issued-vs-working picker on a PUBLISHED day (owner,
         15 Aug 26) — its own attribute and its own VWORK state, never DPREV,
         so the edit page's previews and the view page's choice cannot cross.
         Same no-histPush reasoning: choosing what to look at is not an edit. */
      const vw = (e.target as HTMLElement).closest('select[data-vwork]') as HTMLSelectElement | null
      if (vw) {
        toggleViewWork(+vw.dataset.vwork!, vw.value === 'working')
        notify(); return
      }
      const sel = (e.target as HTMLElement).closest('select[data-sign]') as HTMLSelectElement | null
      if (!sel) return
      const di = +sel.dataset.signday!
      signOf(di)[sel.dataset.sign!] = sel.value
      HOOKS.histPush(); HOOKS.reflow()
    }
    /* right-click a filled slot in edit mode → clear it (reference verbatim,
       gated on the role and on being on the edit page) */
    const onCtx = (e: MouseEvent) => {
      const s = (e.target as HTMLElement).closest('.seat[data-slot]') as HTMLElement | null
      if (!s) return
      /* preview markup drops data-slot, but a stale pre-preview element must
         not clear a live seat from underneath an old rendering */
      if (s.closest('.preview')) return
      if (!canEditSched()) return
      /* editMode() ALONE now — the reference's own `|| SBDAY != null` escape
         is GONE (reviewer-found blocker, 9 Aug 26). That escape trusted "a
         board is open" as its own proof of safety, which was true only
         because the board used to paint over whatever page you were on; once
         SchedBoard.tsx stopped painting it there but state/view.ts's setPage
         left SBDAY alive, the escape started trusting a HIDDEN board instead
         — so on View-only Sched, with a board left open, this still read
         SBDAY!=null as permission and a real right-click cleared a WEEK
         puck straight through. state/view.ts's setPage now clears SBDAY the
         moment the page leaves Edit Schedule, which alone closes that exact
         reproduction — but SBDAY can still be non-null on Edit Schedule
         itself for a session that may not edit it (the role gate), and the
         escape would have kept clearing seats there too. editMode() is the
         one condition already true for every legitimate case (role AND
         page) and false for every one of these — no second flag needed.
         The canEditSched() line above is now subsumed by it and kept
         deliberately: editMode() is an injectable HOOK, so the role check
         must not depend on whatever is currently plugged into it. */
      if (!HOOKS.editMode()) return
      const key = s.dataset.slot!, id = slotVal(key)
      e.preventDefault()
      if (!id) return
      setSlotVal(key, '')
      afterSchedMutate()
      HOOKS.toast((PEOPLE[id] ? PEOPLE[id].cs : id) + ' removed')
    }
    document.addEventListener('click', routeClick)
    document.addEventListener('change', onChange)
    document.addEventListener('contextmenu', onCtx)
    document.addEventListener('focusout', routeFocusOut)
    document.addEventListener('keydown', routeKeyDown)
    const dragOff = initDrag()
    const panOff = initPan()
    return () => {
      panOff()
      document.removeEventListener('click', routeClick)
      document.removeEventListener('change', onChange)
      document.removeEventListener('contextmenu', onCtx)
      document.removeEventListener('focusout', routeFocusOut)
      document.removeEventListener('keydown', routeKeyDown)
      dragOff()
    }
  }, [])
  /* the reference re-runs hsSync/updateWeekNav after every render (and on
     page switches), DEFERRED — its call sites are setTimeout(hsSync,0), so
     the layout reads never land inside the paint being measured */
  useEffect(() => { const t = setTimeout(updateWeekNav, 0); return () => clearTimeout(t) })
  /* the RULES MODIFIED stamp rides with the banner, not with the Logic page —
     the reference's renderStatus comment records the bug: "the stamp used to
     be set only by renderLogic(), so a reload with saved overrides showed a
     clean banner until someone happened to open Logic" (audit2 probe #6) */
  useEffect(() => { document.body.classList.toggle('page-rules-off', !!rulesOffCount()) })
  /* NO validate() here: the reference never validates during a repaint — the
     banner and pills read WARN as the last mutation left it (initStore and
     every mutation path have already validated), and a second engine pass per
     paint is what blew the phone budget */
  const hard = WARN.all.filter((x: any) => x.sev === 'hard').length
  const note = WARN.all.filter((x: any) => x.sev === 'note').length
  const adv = WARN.all.length - hard - note
  const b = banner()
  const admin = SESSION && SESSION.role === 'admin'
  const nav = (p: string) => { setPage(p); notify() }
  const people = Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived)
    .sort((a, b) => PEOPLE[a].cs.localeCompare(PEOPLE[b].cs))
  /* memoized chrome: a store tick that changes nothing in the topbar or a
     page's controls must not re-reconcile their few hundred elements — the
     reference's equivalent guarantee is "a no-op state change repaints
     nothing" (B54). The week/panel components inside subscribe on their own,
     so a memoized parent never starves them. */
  const legend = legendHTML()
  const hlSig = [...HLSET].sort().join(',')
  const rulesOff = rulesOffCount()

  const topbar = useMemo(() => (
      <div className="topbar">
        <button className="burger" id="burger" aria-label="Menu" onClick={() => { setDrawer(true); notify() }}><span></span><span></span><span></span></button>
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
            {admin && <button className="abtn" id="manageUsers" data-admin=""
              onClick={() => { if (!admin) return; setUserModal(true); notify() }}>Manage users</button>}
          </div>
          <button className={'fastsync' + (fast ? ' on' : '')} id="fastSync" title="Toggle 1-second sync (for publishing / meetings)"
            onClick={() => setFast(f => !f)}><span className="dot"></span><span id="syncLbl">{fast ? 'Sync · 1 s' : 'Sync · slow'}</span></button>
          <button className="pillbtn hard" id="warnBtn" onClick={() => { openWarns('hard'); notify() }}><span className="dot"></span><span id="nHard">{hard}</span> warning</button>
          <button className="pillbtn adv" id="warnBtn2" onClick={() => { openWarns('adv'); notify() }}><span className="dot"></span><span id="nAdv">{adv}</span> advisory</button>
          <button className="pillbtn note" id="warnBtn3" onClick={() => { openWarns('note'); notify() }}><span className="dot"></span><span id="nNote">{note}</span> note</button>
          <button className="abtn" id="insightBtn" title="Week insights" onClick={() => { setInsights(true); notify() }}>Insights</button>
          {/* resetSession (state/store.ts) is the one session-change path: it clears
              SBDAY itself, plus CURPAGE and the leftover selection/highlight/preview
              state a next user must not inherit. setUserModal(false) here closes the
              admin-only Manage-users modal, which lives in ui/pops.ts and so can't be
              reached from state/store.ts without the state layer importing the UI layer. */}
          <button className="abtn ghost" id="logout" onClick={() => { setUserModal(false); resetSession(null); notify() }}>Logout</button>
        </div>
      </div>
  ), [page, admin, ME, hard, adv, note, fast])

  const viewPage = useMemo(() => (
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
        <div className="title"><h1 id="vTitle">{DAYS[0].dt} – {DAYS[DAYS.length - 1].dt}</h1><span className="sub mono" id="vSub">142 SQN · week of 13 Jul 26 · all times local</span></div>
        <div className={'schedbanner ' + b.cls + (rulesOffCount() ? ' rules-off' : '')} id="vBanner"
          style={{ ['--al' as any]: b.col }} dangerouslySetInnerHTML={{ __html: b.html }} />
        <details className="legendbox" id="vLegendBox">
          <summary className="legend-sum">Legend — colours &amp; flags</summary>
          <div className="legend" id="vLegend" dangerouslySetInnerHTML={{ __html: legendHTML() }} />
        </details>
        <ViewWeek />
        <div className="daydots" id="vDots" dangerouslySetInnerHTML={{
          __html: DAYS.map((d: any, i: number) => `<button data-day="${i}" class="${i === 0 ? 'on' : ''}" title="${d.dow}"></button>`).join('')
        }}></div>
      </section>
  ), [page, b.cls, b.col, b.html, hlSig, rulesOff, legend, CURWEEK])

  /* .editing rides unconditionally with the page since the Edit-mode toggle
     went (owner, 9 Aug 26): being on Edit Schedule IS the edit mode. */
  const editPage = useMemo(() => (
      <section className={'page' + (page === 'editsched' ? ' on editing' : '')} id="page-editsched">
        <div className="edit-inner">
          <div className="seg" id="weekSegE">
            {WEEKS.map((w: any) => <button key={w.v} className={'wk' + (w.v === CURWEEK ? ' on' : '')} data-wk={w.v}>{w.lbl}</button>)}
          </div>
          <div className="filters">
            <button className="abtn hbtn" id="undoBtn" title="Undo" disabled={HIST.ix <= 0} onClick={() => { undo(); notify() }}>↶ Undo</button>
            <button className="abtn hbtn" id="redoBtn" title="Redo" disabled={HIST.ix >= HIST.stack.length - 1} onClick={() => { redo(); notify() }}>↷ Redo</button>
            <span className="div"></span>
            {/* + Add wave removed here (owner, 13 Aug 26) — a wave is created
                from the board's own inline "+ Wave", between Common Programme
                and the flying waves, and nowhere else. The board is reachable
                on desktop, so this page needs no separate control. */}
            <button className="abtn" id="throwPucks" onClick={() => HOOKS.toast('Auto-throw uses the Quals rules to seat crews (stub in prototype).')}>Throw pucks (auto)</button>
            <button className="abtn" id="exportSched" onClick={() => {
              exportCSV('142SQN-schedule.csv', schedRows())
              /* same reason as the Inputs page's export: a phone shows nothing
                 when a download lands, so the tap otherwise reads as dead */
              HOOKS.toast('CSV downloaded', 'ok')
            }}>Export to Excel</button>
            <div className="right"><div className="searchbox">🔍<input id="searchE" placeholder="name / callsign"
              onInput={e => { setSearch((e.target as HTMLInputElement).value); notify() }} /></div></div>
          </div>
          <div className="title"><h1 id="eTitle">142 SQN Scheduling board · Jul 13</h1><span className="sub mono">Edit mode · changes are local to this prototype</span></div>
          <div className={'schedbanner ' + b.cls} id="eBanner" style={{ ['--al' as any]: b.col }}
            dangerouslySetInnerHTML={{ __html: b.html }} />
          <ALPanel />
          <details className="legendbox" id="eLegendBox">
            <summary className="legend-sum">Legend — colours &amp; flags</summary>
            <div className="legend" id="eLegend" dangerouslySetInnerHTML={{ __html: legendHTML() }} />
          </details>
          <div className="edit-board">
            <EditWeek />
            <EditRoster />
          </div>
        </div>
      </section>
  ), [page, b.cls, b.col, b.html, HIST.ix, HIST.stack.length, legend, CURWEEK])

  return (
    <div id="shell" style={{ ['--al' as any]: b.col }}>
      {topbar}
      {viewPage}
      {editPage}
      <section className={'page' + (page === 'inputs' ? ' on' : '')} id="page-inputs">
        {page === 'inputs' && <InputsPage />}
      </section>
      <section className={'page' + (page === 'quals' ? ' on' : '')} id="page-quals">
        {page === 'quals' && <QualsPage />}
      </section>
      <section className={'page' + (page === 'logic' ? ' on' : '')} id="page-logic">
        {page === 'logic' && <LogicPage />}
      </section>

      {/* week pan arrows + the pinned proxy scrollbar (desktop) — markup 1:1;
          visibility is driven by updateWeekNav, not by React */}
      <button className="week-nav prev" id="weekPrev" aria-label="Scroll days left" onClick={() => panDays(-1)}>‹</button>
      <button className="week-nav next" id="weekNext" aria-label="Scroll days right" onClick={() => panDays(1)}>›</button>
      <div className="hscroll" id="hscroll" role="group" aria-label="Scroll the week sideways">
        <button className="hs-arrow" id="hsL" aria-label="Scroll left" onClick={() => panDays(-1)}>‹</button>
        <div className="hs-track" id="hsTrack"><div className="hs-in" id="hsIn"></div></div>
        <button className="hs-arrow" id="hsR" aria-label="Scroll right" onClick={() => panDays(1)}>›</button>
        <span className="hs-lbl" id="hsLbl"></span>
      </div>

      <DayPop />
      <InsightsModal />
      <UserModal />
      <AirPop />
      <Drawer />
    </div>
  )
}
