/* The mobile drawer — burger menu, page nav (admin-gated Edit tab),
   the account and logout, markup 1:1 with the reference. The View-as chips are GONE
   ([ACCOUNTS], D166 (3), 26 Sep 26): signing in makes you your own callsign, and the Account
   row names him; under it, for a real admin, the switch to the member view and back
   (#drawerRole — D292, 27 Sep 26, [POST-OUT-OUTCOMES]; the old role toggle's successor). Open/close is
   the DRAWER flag in pops.ts; every action closes the drawer, as the
   reference's handlers all end with classList.remove('open'). */
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { PEOPLE } from '../engine/people'
import { UNIT } from '../engine/unitview'
import { isAdmin, me, mayViewAsMember, menuSquadrons, pageOffered } from '../state/perms'
import { pickSquadron, pickWillAsk } from '../state/pick'
import { sqnNum } from './export'
import { TalonMark } from './icons'
import { SquadronRows } from './SquadronMenu'
import { canEditSched } from '../state/auth'
import { waitingCount } from '../state/accounts'
import { CURPAGE } from '../state/view'
import { notify, setPage, switchRoleView } from '../state/store'
import { logOut } from './logout'
import { DRAWER, setDrawer } from './pops'
import { useVersion } from './useStore'
import { clickedOutside } from './outside'
import { escCloses } from './sheetfocus'

export function Drawer() {
  useVersion()
  const admin = isAdmin()
  const mine = me()
  const mineCs = mine && PEOPLE[mine] ? PEOPLE[mine].cs : ''
  const waiting = admin ? waitingCount() : 0
  const items: [string, string, boolean][] = [
    /* Edit Schedule is the schedule in view's, as the top bar's tab (Shell.tsx — the second-half plan §2 item 3):
       a View holder of 149 with 149 picked is not offered it (the walk's F1, 23 Nov 26) */
    ['editsched', 'Edit Schedule', canEditSched()], ['viewsched', 'View-only Sched', true],
    ['inputs', 'Inputs', true], ['quals', 'Quals', true], ['logic', 'Logic', true],
    ['leavewar', 'Leave War', true],
    ['tracker', 'Tracker', true],
    /* Help for everyone (owner, 25 Aug 26), then Admin last, always
       (owner, 23 Aug 26) — same order as the topnav */
    ['help', 'Help', true],
    ['admin', 'Admin', !!admin],
  ]
  const close = () => { setDrawer(false); notify() }
  /* THE PAGE BEHIND THE DRAWER DOES NOT SCROLL (owner's iPhone, 6 Sep 26 — "I
     should not be able to slide scroll when I'm on this page with a page
     behind me … sometimes instead of scrolling the side bar, it scrolls the
     page behind it as well"). The same two holes the board had (SchedBoard.tsx,
     11 Aug 26): the panel is the drawer's one scroller and a swipe that reached
     its end CHAINED to the document (closed in CSS — `.drawer-panel` carries
     `overscroll-behavior: contain`, and the scrim `touch-action: none`), and
     the document itself stayed live under the fixed drawer (closed here —
     `body.dw-lock`, `overflow: hidden`, its OWN class rather than the board's
     `sb-lock` because the drawer opens OVER the board (z440 over z400) and
     closing it must not unlock a board that is still open). Scroll position
     captured and put back by hand, the board's reasoning: `overflow:hidden`
     keeps it today, not by guarantee. */
  const drawerOpen = DRAWER   // the store's live value, read on this render (a module value changes between renders)
  useEffect(() => {
    if (!drawerOpen) return
    const el = document.scrollingElement || document.documentElement
    const y = el.scrollTop, x = el.scrollLeft, on = CURPAGE
    document.body.classList.add('dw-lock')
    return () => {
      document.body.classList.remove('dw-lock')
      /* only when he closed the menu on the page he opened it on: a page picked from it opens at its own place
         (Shell.tsx — [LW-LEAVE-SCROLL-CARRY]), and putting the old page's scroll back carried it onto the new one */
      if (CURPAGE === on) { el.scrollTop = y; el.scrollLeft = x }
    }
  }, [drawerOpen])
  /* THE MENU BY KEYBOARD (D1641–D1643): ☰ now shows on a desktop too, wherever the page names do not fit beside TALON,
     so the menu answers the keyboard as every window does — opened from ☰ by the keyboard, the keyboard goes to the
     page you are on; Escape closes it, newest first (capture, so nothing under it closes too), and the keyboard goes back
     to ☰. A tap on a phone moves no focus, as before.
     IN THE ONE ESCAPE LIST (the code reads of 17 Nov 26, A): with its own listener beside the list's, one Escape closed it
     AND the ALL AVAIL or changes window under it — both listened on the document, and a press stopped there still
     reaches every listener on it. Joined, the newest answers alone (sheetfocus.ts escCloses). */
  useEffect(() => {
    if (!drawerOpen) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    let byKeys = false
    try { byKeys = !!opener && opener.matches(':focus-visible') } catch { /* a browser without :focus-visible */ }
    if (byKeys) {
      const nav = document.getElementById('drawerNav')
      ;(nav?.querySelector<HTMLElement>('a.on') || nav?.querySelector<HTMLElement>('a'))?.focus({ preventScroll: true })
    }
    return escCloses(() => document.querySelector<HTMLElement>('#drawer .drawer-panel'), () => {
      setDrawer(false); notify()
      if (opener && opener.isConnected) opener.focus({ preventScroll: true })
    })
  }, [drawerOpen])
  return (
    /* role="presentation": the shade beside the panel is nothing a screen reader should name; Escape closes the drawer */
    <div className={'drawer' + (DRAWER ? ' open' : '')} id="drawer" role="presentation"
      onClick={e => { if (clickedOutside(e, 'drawer')) close() }}>
      <div className="drawer-panel">
        <DrawerSquadron />
        <h4>Menu</h4>
        {/* role="button" + tabIndex + Enter/Space, same reason as the topbar nav
            in Shell.tsx (design critique, 15 Aug 26 — a hrefless <a> is not in the
            tab order and has no button role, so a keyboard user could not reach
            these). Tag stays <a> so `#drawerNav a[data-page]` selectors hold. */}
        <nav className="drawer-nav" id="drawerNav">
          {/* a squadron he only views picked: its View-only Sched and Help alone (his D2381 — perms.ts pageOffered) */}
          {items.filter(i => i[2] && pageOffered(i[0])).map(([p, label]) => {
            const go = () => { setPage(p); setDrawer(false); notify() }
            // eslint-disable-next-line react-doctor/prefer-tag-over-role -- a page tab of the phone's menu, drawn by its rule for links (`.drawer-nav a`) as the top bar's tabs are; tests and walks find them as #drawerNav a[data-page]
            return <a key={p} data-page={p} role="button" tabIndex={0} className={p === CURPAGE ? 'on' : ''}
              onClick={go} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() } }}>{label}{p === 'admin' && waiting > 0 && <span className="navbadge" id="drawerWaitBadge">{waiting}</span>}</a>
          })}
        </nav>
        {/* D558: dates and Insights use the schedule toolbars; no duplicate WEEK block. */}
        <h4>Account</h4>
        {/* resetSession (state/store.ts) is the one session-change path — the
            Manage-users modal it used to close here moved onto the Admin PAGE
            (23 Aug 26), which unmounts with the session on its own. */}
        {/* The menu unmounts with the outgoing shell, but its module flag does
            not. Clear it here so a second login in the same tab does not
            reopen the drawer from the previous user's session. */}
        <p className="drawer-acct" id="drawerAcct">Signed in as <b>{mineCs || '—'}</b> · {admin ? 'Admin' : 'Member'}</p>
        {/* D292 (27 Sep 26): on a phone the badge is hidden, so the admin's switch to the member view and back sits
            here, under his name (the approved picture 7c); it closes the menu first, as every drawer action does */}
        {mayViewAsMember() && <div className="drawer-row"><button className="abtn" id="drawerRole"
          onClick={() => { setDrawer(false); switchRoleView() }}>{admin ? 'Switch to the member view' : 'Back to the admin view'}</button></div>}
        <div className="drawer-row"><button className="abtn" id="drawerLogout"
          onClick={() => { setDrawer(false); void logOut() }}>Logout</button></div>
      </div>
    </div>
  )
}

/* THE MENU'S HEAD: THE TALON MARK AS THE SQUADRON DROP-DOWN (his D2382, D2383, D2384 — version D as drawn,
   docs/mock/2026-11-23-view-only-tabs/d1–d5). The top bar's own mark, its number the schedule in view's:
   - two squadrons or more — a button reading "149 ▾", in the top bar's button look (.sqm-btn, its soft box while open);
     a tap opens the Schedules menu's own rows (SquadronRows) right under it, inside the menu, not hung over it; a pick
     switches the squadron through the menu's one act (state/pick.ts pickSquadron) — the list closes, the menu STAYS
     open, its pages changed at once; Escape or a press elsewhere closes the list first, the menu still open;
   - one squadron — the mark alone, no ▾ (D2132);
   - under the mark, for everyone, one grey line saying his access to the squadron in view, in the list's words
     ("149 · View only", "142 · Your squadron", "149 · Full access" — perms.ts menuSquadrons). */
function DrawerSquadron() {
  useVersion()
  const rows = menuSquadrons()
  const num = sqnNum('schedule')
  const many = rows.length > 1
  const cur = rows.find(r => r.id === UNIT)
  const [open, setOpen] = useState<null | { keyboard: boolean }>(null)
  const wrap = useRef<HTMLDivElement>(null), btn = useRef<HTMLButtonElement>(null), list = useRef<HTMLDivElement>(null)
  /* the menu closed, or a right taken away so one squadron is left: the list closes with it */
  if (open && (!many || !DRAWER)) setOpen(null)
  const shown = many && DRAWER && !!open
  useEffect(() => {
    if (!shown) return
    /* opened by the keys: the squadron in view takes the focus */
    if (open?.keyboard) (list.current?.querySelector<HTMLElement>('.sqm-row[aria-checked="true"]') ?? list.current?.querySelector<HTMLElement>('.sqm-row'))?.focus()
    const outside = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(null) }
    const off = escCloses(() => list.current, () => { setOpen(null); btn.current?.focus() }, btn.current)
    document.addEventListener('pointerdown', outside)
    return () => { document.removeEventListener('pointerdown', outside); off() }
  }, [shown, open])
  /* a pick that will ask the Tracker's question about unsaved chart edits first closes the menu, as its Logout does before
     the sign-out's same question — the question is drawn under the menu's panel (the walk of 23 Nov 26, F2); any other
     pick leaves the menu open (D2384) */
  const pick = (u: string) => {
    setOpen(null)
    if (pickWillAsk(u)) { setDrawer(false); notify() } else btn.current?.focus()
    void pickSquadron(u)
  }
  const move = (e: ReactKeyboardEvent) => {
    const items = [...(list.current?.querySelectorAll<HTMLButtonElement>('.sqm-row') ?? [])]
    if (!items.length) return
    const i = items.indexOf(document.activeElement as HTMLButtonElement)
    const to = e.key === 'ArrowDown' ? (i + 1) % items.length : e.key === 'ArrowUp' ? (i - 1 + items.length) % items.length
      : e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : -1
    if (to < 0) return
    e.preventDefault(); items[to]!.focus()
  }
  return (
    <div className="drawer-sqn" ref={wrap}>
      {many
        ? <button type="button" className={'sqm-btn' + (shown ? ' on' : '')} id="drawerSqnBtn" ref={btn}
          aria-haspopup="menu" aria-expanded={shown} aria-controls="drawerSqnList" aria-label={`Squadron ${num} — pick a squadron's schedule`}
          onClick={e => setOpen(o => (o ? null : { keyboard: e.detail === 0 }))}>
          <TalonMark num={num} menu />
        </button>
        : <TalonMark num={num} />}
      {shown && <div className="sb-moremenu drawer-sqlist" id="drawerSqnList" role="menu" aria-label="Schedules" ref={list} onKeyDown={move}>
        <SquadronRows rows={rows} pick={pick} />
      </div>}
      {cur && <p className="drawer-acct drawer-sqline" id="drawerSqnLine">{cur.num} · {cur.label}</p>}
    </div>
  )
}
