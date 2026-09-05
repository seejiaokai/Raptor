/* The app frame: topbar, nav, and the pages. Markup mirrored 1:1 from the
   reference (#shell, .topbar, .page sections). Only the view-only schedule
   page is live in this slice; the other pages are placeholders that arrive
   surface by surface. */
import { Suspense, lazy, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { CURWEEK } from '../engine/waves'
import { weekWindow } from './weeknav'
import { CalIcon, XlsIcon, PdfIcon, HistIcon, HlIcon, SrchIcon } from './icons'
import { SCHED, approvedDays, alColor, alCount, alDays, daysLabel, pendDays, pendCount } from '../engine/publish'
import { rulesOffCount } from '../engine/rules'
import { SESSION, ME, setMe, canToggleRole } from '../state/auth'
import { resetSession, toggleRole, notify, setPage } from '../state/store'
import { HLSET, SEARCH, HLOPEN, toggleHlOpen, HLGROUP, setSearch, CURPAGE, setDayPreview, toggleViewWork, bellLit, clearBell } from '../state/view'
import { HlChips } from './hlchips'
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
import { DayPop, InsightsModal, AirPop } from './Modals'
import { WeekCal } from './WeekCal'
import { setInsights, setDrawer, setWeekCal, setHistList, setInpEdit, setOilAsk } from './pops'
import { Drawer } from './Drawer'
import { exportCSV, schedRows } from './export'
import { printSchedPDF } from './printpdf'
import { InputsPage } from './InputsPage'
import { LogicPage } from './LogicPage'
import { QualsPage } from './QualsPage'
import { EditWeek, EditRoster } from './EditWeek'
import { ALPanel } from './ALPanel'
/* THE LEAVE WAR SCREEN IS A SEPARATE DOWNLOAD (3 Sep 26, the slow-computer cut).
   Its year grid is the largest screen in the app, and nobody sees it until
   the tab is clicked — so it ships as its own chunk, fetched on the first
   click, instead of riding in the first download every Raptor visit pays for.
   ONLY the screen: Leave War's store, demo world and the sync wires still boot
   in main.tsx beside Raptor's own, and four always-loaded screens import the
   sync directly, so the crew projection, leave cells and OIL plan reconcile
   exactly as before — deferring the grid cannot reach any of it. Pinned by the
   "not downloaded until its tab is opened" e2e. */
const LeaveWarPage = lazy(() => import('../leavewar/LeaveWarPage').then(m => ({ default: m.LeaveWarPage })))
import { installIdleTracking, msSinceInput } from '../state/idle'
import { oilPendingFor } from '../leavewar/sync'
import { inpById } from '../engine/inputs'
import { AdminPage } from './AdminPage'
import { HelpPage } from './HelpPage'
import { bugAlert, unseenReports } from '../state/reports'

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

/* The HL_CHIPS lists moved to ui/hlchips.tsx (23 Aug 26) — one definition,
   three surfaces (view week, edit week, board), the drift-seam doctrine. */

export function Shell() {
  useVersion()
  /* the current page IS view.CURPAGE — the reference's global, one source of
     truth. A nav click writes it and notifies; this component re-reads it on
     every store tick, so no parallel React state is needed. */
  const page = CURPAGE
  /* The Leave War tab STAYS MOUNTED once it has been visited (owner, 1 Sep 26
     — "the leave war tab is slow to open" → "ok fix it"). Its year grid is
     ~28k DOM nodes; unmount-on-leave meant every visit rebuilt the lot from
     scratch, so the full first-open price was paid again and again. After the
     first visit the section is only HIDDEN (`.page` without `.on` is
     display:none), and returning just shows the already-built grid — the
     component keeps its own store subscription while hidden, so it repaints
     itself on roster/leave changes and can never show stale data on return.
     Leave War ONLY: the other pages are cheap to rebuild and keeping them all
     would hold DOM for no gain. The perf gate is untouched — its ceilings
     measure the week/board containers, never the whole document. */
  const lwEverRef = useRef(false)
  if (page === 'leavewar') lwEverRef.current = true
  /* PRE-WARM (owner, 5 Sep 26). On a desktop, once the user has paused after
     login, mount Leave War HIDDEN — so its separate download and its first few
     months are built off the critical path, and the tab then opens instantly.
     Idle-gated so it never lands under the login keystrokes or early work: the
     mount waits for a hands-off gap (state/idle.ts). Phone is left alone — its
     first open is already quick and every phone login should not pull the grid.
     The section still only DOZES while hidden; the flag just adds "pre-warmed"
     to the same "ever visited" mount gate below. */
  const [prewarmed, setPrewarmed] = useState(false)
  useEffect(() => {
    const teardown = installIdleTracking()
    const isPhone = typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 700px)').matches
    if (isPhone) return teardown
    let done = false
    let timer = window.setTimeout(function poll() {
      /* `typeof window` (6 Sep 26): the cleanup below clears this on unmount,
         but a test that renders the App and never unmounts it leaves the poll
         armed past its file's end — jsdom is torn down, the timer fires into a
         world with no `window`, and the whole unit job goes red with every test
         green (CI run 903, from stsaved.test.tsx). A browser always has one. */
      if (done || typeof window === 'undefined') return
      if (msSinceInput() > 2000) { done = true; setPrewarmed(true); return }
      timer = window.setTimeout(poll, 400)
    }, 2000)
    return () => { done = true; clearTimeout(timer); teardown() }
  }, [])
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
     banner reads WARN as the last mutation left it (initStore and every
     mutation path have already validated), and a second engine pass per paint
     is what blew the phone budget */
  const b = banner()
  const admin = SESSION && SESSION.role === 'admin'
  const nav = (p: string) => { setPage(p); notify() }
  /* The five page tabs are <a>s with no href — visually a nav, but the reference
     built them as links, so a keyboard user could not Tab to them and could not
     switch pages at all (design critique, 15 Aug 26 — a P0: "someone navigating
     without a mouse literally cannot switch pages"). role="button" + tabIndex
     puts each one in the tab order and has it announced as a button; onKeyDown
     answers Enter and Space, the two keys a real button fires on. The tag stays
     <a> so the ~15 tests and probe-bridge that select `.nav a[data-page]`, and
     the `.nav a` stylesheet, are untouched — the fix is behaviour, not markup.
     A hidden tab (`hidden={!admin}`) is display:none, so it stays out of the tab
     order regardless of tabIndex. */
  const navKey = (p: string) => (e: ReactKeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nav(p) }
  }
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

  /* computed ONCE per render — the bell's class and the memo deps both read
     it (bug pass, 28 Aug 26: two full INPUTS scans per render was waste);
     the tap handler re-derives its own fresh copy at click time. */
  const oilPend = oilPendingFor(ME).length
  const topbar = useMemo(() => (
      /* The top bar wears a blue-tinted gradient while on Edit Schedule (owner,
         22 Aug 26) so it is unmistakable from the near-identical View-only mode
         at a glance — both widths; View-only keeps the neutral dark. */
      <div className={'topbar' + (page === 'editsched' ? ' editing' : '')}>
        <button className="burger" id="burger" aria-label="Menu" onClick={() => { setDrawer(true); notify() }}><span></span><span></span><span></span></button>
        <div className="mark">
          <svg className="rglyph" viewBox="0 -2 60 64" aria-hidden="true"><path d="M3 8 Q4.9 38.3 24 62 Q11.5 35.8 3 8 Z M16 0 Q17.4 35.0 42 60 Q26.6 31.0 16 0 Z M31 -2 Q36.4 23.5 58 38 Q42.9 19.1 31 -2 Z" /></svg>
          <span className="tx"><span className="k">142</span><span className="v">RAPTOR</span></span>
        </div>
        <nav className="nav" id="topnav">
          <a data-page="editsched" data-admin="" hidden={!admin} role="button" tabIndex={0} className={page === 'editsched' ? 'on' : ''} onClick={() => nav('editsched')} onKeyDown={navKey('editsched')}>Edit Schedule</a>
          <a data-page="viewsched" role="button" tabIndex={0} className={page === 'viewsched' ? 'on' : ''} onClick={() => nav('viewsched')} onKeyDown={navKey('viewsched')}>View-only Sched</a>
          <a data-page="inputs" role="button" tabIndex={0} className={page === 'inputs' ? 'on' : ''} onClick={() => nav('inputs')} onKeyDown={navKey('inputs')}>Inputs</a>
          <a data-page="quals" role="button" tabIndex={0} className={page === 'quals' ? 'on' : ''} onClick={() => nav('quals')} onKeyDown={navKey('quals')}>Quals</a>
          <a data-page="logic" role="button" tabIndex={0} className={page === 'logic' ? 'on' : ''} onClick={() => nav('logic')} onKeyDown={navKey('logic')}>Logic</a>
          <a data-page="leavewar" role="button" tabIndex={0} className={page === 'leavewar' ? 'on' : ''} onClick={() => nav('leavewar')} onKeyDown={navKey('leavewar')}>Leave War</a>
          {/* Help is for EVERYONE (owner, 25 Aug 26 — "allows anyone to type
              in Bug reports") — after the work tabs, before the admin-only
              tools tab */}
          <a data-page="help" role="button" tabIndex={0} className={page === 'help' ? 'on' : ''} onClick={() => nav('help')} onKeyDown={navKey('help')}>Help</a>
          {/* the Admin tab sits LAST, always (owner, 23 Aug 26) — the tools
              tab after the work tabs; hidden for a member like the Edit tab,
              but the PAGE is the gate, not this attribute (AdminPage.tsx) */}
          <a data-page="admin" data-admin="" hidden={!admin} role="button" tabIndex={0} className={page === 'admin' ? 'on' : ''} onClick={() => nav('admin')} onKeyDown={navKey('admin')}>Admin</a>
        </nav>
        <div className="spring">
          {/* Undo / redo live at the TOP now (owner, Aug 26 — "so I'll always
              see it when I'm editing to undo if needed"), in the sticky bar
              rather than the filters row that scrolls away. Only while editing;
              the board carries its own pair in its own top bar. Same undo()/
              redo()/HIST wiring — no new stack. BOTH widths since 23 Aug 26
              (owner): the phone bar shows the trio icon-only, pinned at the
              scrolling bar's right edge — the board's .bi/.bl split, so one
              markup path serves both and the accessible name stays the words.
              The third button opens the EDIT HISTORY list (the renamed changes
              list) from the shell itself, so the log is reachable without
              opening the board first. */}
          {page === 'editsched' && <div className="tb-hist">
            <button className="abtn hbtn" id="undoBtn" title="Undo" disabled={HIST.ix <= 0} onClick={() => { undo(); notify() }}><span className="bi">↶</span><span className="bl"> Undo</span></button>
            <button className="abtn hbtn" id="redoBtn" title="Redo" disabled={HIST.ix >= HIST.stack.length - 1} onClick={() => { redo(); notify() }}><span className="bi">↷</span><span className="bl"> Redo</span></button>
            <button className="abtn" id="histBtn" title="Edit history — every change this session"
              onClick={() => { setHistList('all'); notify() }}><span className="bi"><HistIcon /></span><span className="bl"> Edit history</span></button>
          </div>}
          <div className="acct">
            <div className="sel"><label>View as</label>
              <select id="viewAs" aria-label="View the schedule as" value={ME} onChange={e => { setMe(e.target.value); notify() }}>
                {people.map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
              </select></div>
            {/* the Manage users button moved to the Admin page (owner,
                23 Aug 26) — the topbar gives its slot back */}
          </div>
          <button className={'fastsync' + (fast ? ' on' : '')} id="fastSync" title="Toggle 1-second sync (for publishing / meetings)"
            onClick={() => setFast(f => !f)}><span className="dot"></span><span id="syncLbl">{fast ? 'Sync · 1 s' : 'Sync · slow'}</span></button>
          {/* THE THREE WEEK-WIDE COUNT PILLS ARE GONE (owner, 20 Aug 26 — "what's
              the point of having warning, advisory and note at the top. Just
              remove it"). They counted the whole week and expanded every day
              carrying that severity; every day already leads with its own
              "N issues · N warning · tap to review" bar, which is the number a
              reader can act on, next to the day it belongs to. Three pills that
              restated the sum bought a crowded phone bar and a second, blunter
              route to the same lists. `openWarns` (state/view.ts) is left in
              place — it is mirrored on the probe bridge and is the one call a
              future "expand everything" control would use. */}
          {/* THE NOTIFICATION BELL (owner, Aug 26). Always present, on every
              page and both widths; it GLOWS when the current view + view-as
              person has an alert (bellLit, state/view.ts) — OR, since 25 Aug
              26, when an ADMIN has unseen bug reports (bugAlert,
              state/reports.ts — the owner's first wired trigger: "when
              there's new reports the alarm notification will be highlighted").
              Tapping it with a bug alert live goes straight to the Help page,
              whose admin view is the acknowledgement (seeing the list is what
              puts the bell out — the alert can never be lost unread).
              Otherwise the tap acknowledges the current view's alert, as
              before. NOT the removed week-wide count pills: this is a
              per-person indicator, not a sum, so the 20 Aug decision does not
              touch it.
              THE THIRD TRIGGER (owner, 28 Aug 26): a duty-&-commitments input
              of the view-as person with an UNANSWERED OIL question — filed
              over a weekend, or a PH marked in Leave War after the fact
              (oilPendingFor, leavewar/sync.ts — derived like bugAlert, so
              answering the question puts the bell out by itself). The tap
              lands on the Inputs page with the editor open on the exact input
              and the OIL sheet already up (OILASK, pops.ts). */}
          <button className={'bellbtn' + (bellLit() || bugAlert() || oilPend ? ' on' : '')} id="notifyBell" aria-label="Notifications" title="Notifications"
            onClick={() => {
              if (bugAlert()) {
                const n = unseenReports()
                HOOKS.toast(`${n} new bug report${n === 1 ? '' : 's'}`)
                nav('help'); return
              }
              const oilHit = oilPendingFor(ME)[0]
              if (oilHit) {
                const row = inpById(oilHit.iid)
                if (row) {
                  HOOKS.toast('Weekend/PH work — confirm your OIL')
                  setOilAsk(oilHit.iid)
                  setInpEdit(row)
                  nav('inputs'); return
                }
              }
              const was = bellLit(); clearBell(); HOOKS.toast(was ? 'Notifications cleared' : 'No new notifications for this view'); notify()
            }}>
            <svg className="bellglyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a6 6 0 0 0-6 6c0 3.5-1.2 5.4-2.2 6.5-.5.6-.1 1.5.7 1.5h15c.8 0 1.2-.9.7-1.5C19.2 13.4 18 11.5 18 8a6 6 0 0 0-6-6Zm0 20a2.6 2.6 0 0 0 2.5-2h-5a2.6 2.6 0 0 0 2.5 2Z" fill="currentColor" /></svg>
            <span className="belldot" aria-hidden="true"></span>
          </button>
          <button className="abtn" id="insightBtn" title="Week insights" onClick={() => { setInsights(true); notify() }}>Insights</button>
          {/* resetSession (state/store.ts) is the one session-change path: it clears
              SBDAY itself, plus CURPAGE and the leftover selection/highlight/preview
              state a next user must not inherit. The Manage-users modal it used to
              close here is gone (23 Aug 26) — Manage users is a PAGE section now,
              and resetSession lands the next session on viewsched, so the Admin
              page simply unmounts with the outgoing session. */}
          <button className="abtn ghost" id="logout" onClick={() => { resetSession(null); notify() }}>Logout</button>
          {/* The role indicator, moved to the FAR RIGHT of the bar, after every
              other control (owner, 22 Aug 26 — "move the admin button to always
              the far right … same design as the others"). Styled as one of the
              .abtn buttons rather than the old pill; the accent tint keeps the
              Admin state legible. Hidden on a phone, as it was in its old spot,
              so the tight one-row phone bar stays uncrowded — the drawer's
              Account row carries the toggle there.
              FOR A REAL ADMIN it is now a BUTTON (owner, 27 Aug 26): clicking
              flips the whole app between admin and member view (store.ts's
              toggleRole — the gate is LOGINROLE, so a member's badge stays the
              inert label it always was, same id either way). */}
          {canToggleRole()
            ? <button className={'abtn rolechip tgl' + (admin ? ' admin' : '')} id="roleBadge"
              title={admin ? 'See the app as a member — click again to switch back' : 'Return to admin'}
              onClick={() => toggleRole()}>{admin ? 'Admin' : 'Member'}</button>
            : <span className={'abtn rolechip' + (admin ? ' admin' : '')} id="roleBadge">{admin ? 'Admin' : 'Member'}</span>}
        </div>
      </div>
  ), [page, admin, ME, fast, HIST.ix, HIST.stack.length, bellLit(), bugAlert(), oilPend])

  const viewPage = useMemo(() => (
      <section className={'page' + (page === 'viewsched' ? ' on' : '')} id="page-viewsched">
        {/* The week nav and the Highlight filter share ONE row now (owner,
            22 Aug 26 — "which is all in 1 row"): the calendar sits FAR LEFT,
            then the rolling week window (prev · current · +1 · +2, re-centred
            on the loaded week), then the Highlight chips — all in the one
            .filters flex row. `#weekSeg` is kept so the week-click tests and
            `interactions.ts` (`closest('[data-wk]')`) are untouched; `.wkseg`
            is hidden on a phone exactly as the old standalone `.seg` was, where
            the lone `.wknav-m` calendar and the day swipe take over. */}
        <div className={'filters' + (HLOPEN ? ' hl-open' : '')} id="viewChrome">
          {/* the phone calendar opener now rides INSIDE the filter row as its
              first control (owner, 26 Aug 26 — "we just need 1 row"), so the
              standalone .wknav-m row is gone and both week pages read the same:
              one row of icons + search, the highlight chips dropping to a new
              row when expanded. Phone-only (.filt-cal); the desktop keeps its
              .wkseg week window. */}
          <button className="wknav-mbtn filt-cal" aria-label="Jump to a date" title="Jump to a date"
            onClick={() => { setWeekCal('view'); notify() }}><CalIcon /></button>
          <span className="wkseg" id="weekSeg">
            <button className="wk wk-cal" aria-label="Jump to a date" title="Jump to a date"
              onClick={() => { setWeekCal('view'); notify() }}><CalIcon /></button>
            {weekWindow(CURWEEK).map(w => <button key={w.v}
              className={'wk' + (w.sel ? ' on' : '') + (w.today ? ' todaywk' : '')} data-wk={w.v}>{w.lbl}</button>)}
          </span>
          <span className="div wkdiv"></span>
          {/* the Highlight lead is TWO elements and CSS picks one by width —
              the histln/histln-top precedent: both are always rendered, so a
              resize answers instantly instead of waiting for a repaint.
              Desktop keeps a passive label (the icon replaced the word,
              owner 23 Aug 26); the phone gets a TOGGLE that folds the chips
              away behind it. The toggle lights (.on) whenever a filter or a
              search is live, so a filtered week is never mysterious while
              the chips are folded out of sight. */}
          <span className="lab hl-lab" title="Highlight"><HlIcon /></span>
          <button className={'hl-tog' + (HLSET.size || SEARCH ? ' on' : '')} aria-expanded={HLOPEN}
            aria-label="Highlight filters" title="Highlight filters"
            onClick={() => { toggleHlOpen(); notify() }}><HlIcon /></button>
          {/* the highlight groups are wrapped so the phone can drop them to their
              OWN row below the icons when expanded (owner, 26 Aug 26). On desktop
              .hlrow is display:contents, so the chips flow inline exactly as before. */}
          <span className="hlrow"><HlChips /></span>
          <div className="right">
            <div className="searchbox"><SrchIcon /><input id="searchV" placeholder="name / callsign"
              onInput={e => { setSearch((e.target as HTMLInputElement).value); notify() }} /></div>
          </div>
        </div>
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
  /* HLOPEN + SEARCH ride the deps with hlSig: the fold class and the toggle's
     lit state render here, so a fold or a search that changes without either
     in the list would paint stale (SEARCH is the toggle's other lit source —
     spec'd as HLOPEN alone, added for the same staleness reason). */
  ), [page, b.cls, b.col, b.html, hlSig, HLOPEN, HLGROUP, SEARCH, rulesOff, legend, CURWEEK])

  /* .editing rides unconditionally with the page since the Edit-mode toggle
     went (owner, 9 Aug 26): being on Edit Schedule IS the edit mode. */
  const editPage = useMemo(() => (
      <section className={'page' + (page === 'editsched' ? ' on editing' : '')} id="page-editsched">
        <div className="edit-inner">
          <div className={'filters' + (HLOPEN ? ' hl-open' : '')}>
            {/* ONE ROW ON DESKTOP TOO, matching the view page (owner, 26 Aug 26).
                The week window used to be a separate .seg row above; it now rides
                inside the filter row as .wkseg, so the desktop edit bar is one
                line. Order is deliberate (owner): the phone calendar opener, then
                the desktop week window, then the EXPORT icons right after the
                dates, then the highlighter — the highlighter last of the fixed
                icons so expanding its sub-menu pushes only the chips to its right,
                never the exports. Phone hides .wkseg (uses .filt-cal + swipe). */}
            <button className="wknav-mbtn filt-cal" aria-label="Jump to a date" title="Jump to a date"
              onClick={() => { setWeekCal('view'); notify() }}><CalIcon /></button>
            <span className="wkseg" id="weekSegE">
              <button className="wk wk-cal" aria-label="Jump to a date" title="Jump to a date"
                onClick={() => { setWeekCal('view'); notify() }}><CalIcon /></button>
              {weekWindow(CURWEEK).map(w => <button key={w.v}
                className={'wk' + (w.sel ? ' on' : '') + (w.today ? ' todaywk' : '')} data-wk={w.v}>{w.lbl}</button>)}
            </span>
            <span className="div wkdiv"></span>
            {/* Undo / redo moved to the sticky top bar (owner, Aug 26) so they
                stay in view while the page scrolls — see the topbar above. */}
            {/* Undo / redo moved to the sticky top bar (owner, Aug 26) so they
                stay in view while the page scrolls — see the topbar above. */}
            {/* + Add wave removed here (owner, 13 Aug 26) — a wave is created
                from the board's own inline "+ Wave", between Common Programme
                and the flying waves, and nowhere else. The board is reachable
                on desktop, so this page needs no separate control. */}
            <button className="abtn" id="exportSched" title="Export to Excel (CSV)" aria-label="Export to Excel (CSV)"
              onClick={() => {
                exportCSV('142-schedule.csv', schedRows())
                /* same reason as the Inputs page's export: a phone shows nothing
                   when a download lands, so the tap otherwise reads as dead */
                HOOKS.toast('CSV downloaded', 'ok')
              }}><XlsIcon /></button>
            <button className="abtn" id="exportPdf" title="Export as PDF (print)" aria-label="Export as PDF (print)"
              onClick={() => {
                printSchedPDF()
                /* the print dialog can take a beat to appear, and on a phone it
                   slides over the page — say what to do once it does */
                HOOKS.toast('Print dialog opened — choose "Save as PDF"', 'ok')
              }}><PdfIcon /></button>
            {/* the SAME Highlight strip as the view page (owner, 23 Aug 26 —
                "highlight is on both weeks now"): one HlChips definition, the
                same two-element lead with CSS picking by width, the same
                phone fold. #searchE stays the row's right pin, untouched. */}
            <span className="lab hl-lab" title="Highlight"><HlIcon /></span>
            <button className={'hl-tog' + (HLSET.size || SEARCH ? ' on' : '')} aria-expanded={HLOPEN}
              aria-label="Highlight filters" title="Highlight filters"
              onClick={() => { toggleHlOpen(); notify() }}><HlIcon /></button>
            {/* wrapped so the phone can drop the chips to their own row below the
                icons when expanded (owner, 26 Aug 26); display:contents on desktop. */}
            <span className="hlrow"><HlChips /></span>
            <div className="right"><div className="searchbox"><SrchIcon /><input id="searchE" placeholder="name / callsign"
              onInput={e => { setSearch((e.target as HTMLInputElement).value); notify() }} /></div></div>
          </div>
          {/* The "142 Scheduling board · Jul 13 / Edit mode · changes are local
              to this prototype" title was removed (owner, 22 Aug 26) on both
              widths — it carried a stale hardcoded date and being on Edit
              Schedule already says it is the edit surface. */}
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
            {/* DESKTOP: hide/show the aircrew placeholders column (owner, 26 Aug
                26). A fixed rail at the viewport's right edge — position:fixed so
                it never rides the roster's own vertical scroll — toggles
                body.ros-collapsed (interactions.ts, data-roshide); the column then
                slides off to the right and the week reclaims the width. Lives
                inside #page-editsched, so it is absent on every other page and on
                the phone (display:none under 820px). */}
            <button className="ros-rail" data-roshide type="button"
              aria-label="Hide or show the aircrew panel" title="Hide or show the aircrew panel">
              <span className="ros-rail-chev" aria-hidden="true" /><b>CREW</b>
            </button>
          </div>
        </div>
      </section>
  /* hlSig + HLOPEN + SEARCH are NEW here and load-bearing: the edit page never
     rendered the chips before, so its memo had no highlight deps at all —
     without hlSig the chips' .on state would go stale the moment a chip was
     toggled on another surface, and without HLOPEN/SEARCH the fold and the
     toggle's lit state would freeze (same reasoning as the view page's). */
  ), [page, b.cls, b.col, b.html, HIST.ix, HIST.stack.length, hlSig, HLOPEN, HLGROUP, SEARCH, legend, CURWEEK])

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
      {/* once visited, the section DOZES (content-visibility) rather than
          display:none — scheduler.css `.page.doze` carries the measurement
          and the why; the keep-alive comment sits at lwEverRef above */}
      <section className={'page' + (page === 'leavewar' ? ' on' : (lwEverRef.current || prewarmed) ? ' doze' : '')} id="page-leavewar">
        {(page === 'leavewar' || lwEverRef.current || prewarmed) && <Suspense fallback={null}><LeaveWarPage active={page === 'leavewar'} /></Suspense>}
      </section>
      <section className={'page' + (page === 'help' ? ' on' : '')} id="page-help">
        {page === 'help' && <HelpPage />}
      </section>
      <section className={'page' + (page === 'admin' ? ' on' : '')} id="page-admin">
        {page === 'admin' && <AdminPage />}
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
      <AirPop />
      <WeekCal />
      <Drawer />
    </div>
  )
}
