/* THE TOP BAR'S SHARED STATE AND WHAT ITS CONTROLS DO — the Sync chip's one state, the bell's tap and its list's
   open-state, the two undo engines ([UNDO-TOPBAR], owner D347–D349). Moved whole, word for word, out of ui/topbits.tsx
   (3 Nov 26 — React Doctor's only-export-components: a file of screen parts that also hands out plain functions cannot
   be swapped in place while the app is being built), which now holds the four drawn parts alone — the Sync chip, the
   bell, its list and the Undo / Redo pair — and reads all of this from here. Nothing in it changed. */
import { useSyncExternalStore } from 'react'
import { notify, setPage, ownPageRefused, ownSquadronRefused, ownSquadronFirst, type PageOpts } from '../state/store'
import { bellLit, clearBell, INPVIEW, setInpView, setInpMode, setCalMonth, askSansDay } from '../state/view'
import { HOOKS } from '../engine/hooks'
import { globalUndo, globalRedo, undoState } from '../undo'
import { editingText } from './textedit'
import { oilUndoBoundary } from './oilmode'
import { bellAccessAlert, openBellRequest, enterForLine, type LineEntry } from '../state/belltap'
import { homeOn, todayIso } from '../state/units'
import { bugAlert, unseenReports } from '../state/reports'
import { openAdminUsers } from './adminopen'
import { oilPendingFor, openWarAt } from '../leavewar/sync'
import { inpById } from '../engine/inputs'
import { setOilAsk, setInpEdit, BELLLIST, setBellList, setOilList } from './pops'
import { me } from '../state/perms'
import { holidayLineOn, noticeSpan, isWarNotice, postOf, isAcctNotice, noticeLive, sansDueOf, type Notice } from '../state/notices'
import { PEOPLE } from '../engine/people'
import { unreadFor, markNoticeRead } from '../state/noticeseen'
import { trackerUndoApi, onTrackerUndo, trackerUndoVersion } from '../tracker/undo-bridge.js'
import { trackerCover } from '../state/typing-hold'
import { saidByGuard } from '../state/guard'

/* ---- the Sync chip (a demonstration toggle — there is no server yet; the one state for both bars) ---- */
let FASTSYNC = false
export const fastSync = (): boolean => FASTSYNC
export function toggleFastSync(): void { FASTSYNC = !FASTSYNC; notify() }

/* ---- the bell (Shell.tsx's comment beside its first copy holds the four triggers' history) ----
   ONE tap body for both bars. A tap that goes somewhere (Admin → Users, Help, Inputs) goes through setPage, which
   closes the board when it leaves Edit Schedule (state/view.ts) — so the board's bell never navigates UNDER the board
   (the plan's B10.5). A tap that only clears the view's alert leaves the board where it is. */
/* THE BELL'S LIST OF NOTICES (the one-rule build's step 7, 12 Oct 26 — owner D755 (3), D760, D769; the plan §4.10;
   the pictures of record docs/mock/2026-10-12-one-rule/bell-{desk,phone}-list-shorter.png). "The member is told by his
   bell": someone else changed an input he is in — a notice (state/notices.ts), unread until he reads it
   (state/noticeseen.ts — his own record, never a write to the notice). An unread one lights the bell.
   D769: "a tap on the bell still goes straight to an OIL question, an access request or a bug report where one waits,
   opening the list only otherwise" — so the four things the bell did before come first, exactly as before, and the
   tap that used to say "No new notifications for this view" opens the list instead (it says "Nothing new" itself).
   ONE open-state for both bars, like the Sync chip's: the list is drawn once (Shell) and hangs under whichever bell is
   on screen. */
/* (open or not, and under which bell: ui/pops.ts BELLLIST / BELLAT — with every other window's flag, so a sign-out
   closes it) */
export const bellListOpen = (): boolean => BELLLIST
export function closeBellList(): void { if (BELLLIST) { setBellList(false); notify() } }
export function bellOn(): boolean {
  const mine = me()
  return bellLit() || bugAlert() || (mine ? oilPendingFor(mine).length > 0 || unreadFor(mine) > 0 : false) || bellAccessAlert()
}
export function bellTap(from?: HTMLElement | null): void {
  /* AN ACCESS REQUEST (§15 D3, his D2325 — picture f9): the newest unseen one of the squadrons switched on in his bell, its
     squadron entered when it is not the page's, then Admin → Users there — "1 waiting for access to 149"
     (state/belltap.ts) */
  if (openBellRequest(() => openAdminUsers(), s => HOOKS.toast(s))) return
  if (bugAlert()) {
    const n = unseenReports()
    HOOKS.toast(`${n} new bug report${n === 1 ? '' : 's'}`)
    setPage('help'); notify(); return
  }
  const mine = me()
  /* A SCHEDULER'S OWN UNANSWERED INPUT ON A DAY A HOLIDAY'S LINE ALREADY COVERS DOES NOT TAKE THE TAP ([OIL-ASK-NOTIFY] —
     owner D782: "the admin answers a day's open OIL questions from ONE list"; D783 (6)). Left to this branch, an admin
     who made a day a holiday with three inputs he had filed for others on it would be walked through three single
     questions, one tap each, and never meet the list. For him those are the list's: the tap falls through to the
     bell's own list, whose line opens it. Every other question of his own — and every member's — goes straight to
     it, as D769 has it. */
  /* (a member has no such line, and neither has the admin's own member view while it is on: a holiday's line is live
     for a scheduler only — state/notices.ts noticeLive, the one body; the break tests of 13 Oct 26 showed a second
     test of it here decided nothing) */
  const oilHit = mine ? oilPendingFor(mine).find(h => !holidayLineOn(mine, h.iso)) || null : null
  if (oilHit) {
    const row = inpById(oilHit.iid)
    if (row) {
      /* (…and still his to answer once a question it waited for is answered — openInputOnPage, below). THE BELL'S OIL TAP
         THROUGH THE PAGE DOOR (step K6 — the plan §4.1 row 9, §4.5; F2b): it sets nothing before the page, so it asks
         nothing itself; the window, its toast and the OIL question are all the door's `then`, so none opens behind a
         refusal. Part F's own line ahead of it — `enterForLine(inputSqn(row, pageUnit('own')), …, 'bell', o)`, the
         input's own squadron brought into view first (D2621) — is step K9's (§10 step 7), not built here. */
      openInputOnPage(oilHit.iid, () => { HOOKS.toast('Weekend/PH work — confirm your OIL'); setOilAsk(oilHit.iid) },
        () => { const m = me(); return !!m && oilPendingFor(m).some(h => h.iid === oilHit.iid) }, { door: 'bell' })
      return
    }
  }
  /* the view's own alert, as before */
  if (bellLit()) { clearBell(); HOOKS.toast('Notifications cleared'); notify(); return }
  setBellList(!BELLLIST, from && from.id ? from.id : '')
  notify()
}
/* a tap on a line: the input's own window — or, where it has since been deleted, the words; either way that line is read */
/* A LINE OF ANOTHER SQUADRON (batch 1's second half §7 item 5, R9 — state/belltap.ts enterForLine): its squadron (the
   line's stamp `u`) is entered first, then the tap lands as below — only where his own pages may be that squadron's. Where
   they may not (a View holder's, or a line of a squadron he has since left), a posting's, a holiday's and a Leave War
   line is only read: opening his own squadron's page at it would show the wrong war, or a row not there. An input's line
   still opens its window — he is named in it or filed it, and the window judges its own edit rights by the input's
   squadron. His own account's line carries no squadron (§16 D5′). */
/* A TAP THAT WAITED FOR THE TRACKER'S QUESTION IS JUDGED AGAIN WHEN IT GOES ON (the security read of the night's second fix
   round, F3 — tracker/msq-bell-recheck-after-ask.test.tsx; his D2310, D2218). What the line opens was decided when he
   pressed it, and the question can stand for as long as he likes: Hunter's Plan of 149 ended while "Save them before
   switching to 149?" was up, the line left his bell (state/notices.ts noticeLive — the one body the list reads), and
   Discard still opened Osprey's 149 input for a man with no right left there. The tap goes on only for a line still in
   his bell; one that has left opens nothing and says nothing, as if it had not been there to press. */
const stillHis = (n: Notice): boolean => n.to === me() && noticeLive(n)
/* WHAT A TAP ON EACH KIND OF LINE OPENS (step K6 — the plan §4.5 `lineOpens`; Opus F-g, Fable 8): every kind a line is
   written or worked out with (state/notices.ts NoticePart) is a key here, by name — the page the tap will open, or null
   for one that opens no page: his own account's line (only read), a holiday's (the OIL list, no page — its own branch,
   below), a posting or Leave War line of a squadron his pages may never be, a posting whose man has no row left, an input
   since deleted. The roll-call reads the kinds from the source (R5 (d)): a kind with no key fails there with "say what a
   tap on this line opens", and in the app it is only read — never taken for an input's line, whose miss would say "That
   input is gone". */
type Opens = (n: Notice, where: LineEntry) => string | null
const inputLine: Opens = n => (inpById(n.iid) ? 'inputs' : null)
const postLine: Opens = (n, where) => {
  if (where === 'no') return null
  const p: any = (PEOPLE as any)[postOf(n)!.who]
  return !p || p.deleted || p.special ? null : 'admin'
}
const warLine: Opens = (_n, where) => (where === 'no' ? null : 'leavewar')
const sansLine: Opens = n => (sansDueOf(n) ? 'inputs' : null)
export const LINE_KINDS: Record<string, Opens> = {
  /* an input's line, whatever its first part says (state/notices.ts noticeParts) */
  del: inputLine, in: inputLine, out: inputLine, cx: inputLine, uncx: inputLine, off: inputLine, on: inputLine,
  unav: inputLine, unavoff: inputLine, when: inputLine, add: inputLine, rem: inputLine, kind: inputLine, title: inputLine,
  rmk: inputLine, rbid: inputLine,
  oilhol: () => null,
  lw: warLine, lwopen: warLine, lwback: warLine,
  po: postLine, poback: postLine, pofail: postLine,
  sansdue: sansLine, sansback: sansLine,
  acct: () => null,
}
const kindOf = (n: Notice): string => String(((n.what || [])[0] as any)?.k ?? '')
/** the page a tap on `n` will open, or null (none, or a kind the table does not know) */
export function lineOpens(n: Notice, where: LineEntry): string | null {
  if (isAcctNotice(n)) return null
  const f = LINE_KINDS[kindOf(n)]
  return f ? f(n, where) : null
}
/* A TAP ON A LINE THROUGH THE DOORS (step K6 — the plan §4.1 rows 6, 7, 9b, 11, §4.2, §4.5; his D2403, D2590, D2627 A11,
   A19, D2621, D2729 Q7): the line's squadron is entered first where his own pages may be its (state/belltap.ts
   enterForLine, door 'line' — refused, or waiting for the Tracker's question or a save, it stops here); then, before
   anything is marked read or closed, the page the tap will open is asked of the page door — refused, the line stays
   unread, the list open, nothing said but the note under the line (D2627 A11). A holiday's line asks the same with no
   page and hands its list to ownSquadronFirst, so his own squadron comes into view before it (D2627 A19). HIS OWN SANS
   REMINDER carries no squadron: his own squadron that day is its squadron (row 9b, D2729 Q7 — "his own SANS reminder
   brings his own squadron into view first"), entered before the tab and month are set. A line that enters nothing and
   opens neither a page nor a list goes on exactly as today (P16). */
export function openNotice(n: Notice): void {
  const o = { line: n.id }
  const again = () => { if (stillHis(n)) openNotice(n); else notify() }
  const mine = me()
  const u = sansDueOf(n) && !n.u && mine ? homeOn(mine, todayIso()) : n.u
  const where = isAcctNotice(n) ? 'here' : enterForLine(u, again, 'line', o)
  /* the Tracker's question for unsaved chart edits is up first (§16 D2′), or a save still going: the tap goes on once it
     is answered; refused: the note under the line, nothing else */
  if (where === 'asked' || where === 'refused') return
  if (!isAcctNotice(n) && !LINE_KINDS[kindOf(n)]) { markNoticeRead(n.id); notify(); return }
  const page = lineOpens(n, where)
  if (page && ownPageRefused(page, 'line', o, again)) return
  if (where === 'no' && (postOf(n) || isWarNotice(n) || kindOf(n) === 'oilhol')) {
    markNoticeRead(n.id); notify(); return
  }
  /* a holiday's line opens the ONE list for its dates ([OIL-ASK-NOTIFY], owner D783 (6): "a tap opening the list") — it
     is about no single input, so it is asked before any input is looked for (Fable's read of the plan, A6) */
  const hol: any = (n.what || [])[0]
  if (hol && hol.k === 'oilhol') {
    if (ownSquadronRefused('line', o, again)) return
    markNoticeRead(n.id)
    setBellList(false)
    /* (for the days that are a holiday NOW — a holiday shortened since its notice was made opens the list for what is
       left of it: state/notices.ts noticeSpan) */
    const span = noticeSpan(n) || { a: String(hol.a), b: String(hol.b || hol.a) }
    ownSquadronFirst({ door: 'line', ...o }, () => {
      setOilList({ from: span.a, to: span.b, name: span.name != null ? span.name : n.name, fresh: false, unit: span.u })
      notify()
    })
    notify(); return
  }
  /* HIS OWN ACCOUNT'S LINE (batch 1's second half §7 item 6 — his D2309: "a tap on it opens nothing"; nobody opens his
     own row on Admin → Users): only read */
  if (isAcctNotice(n)) { markNoticeRead(n.id); notify(); return }
  /* A POSTING'S LINE ([POSTOUT-RUN-NOTICE] — D1547, D1691): Admin → Users at his row, ringed, the Archived fold opened
     for an archived man (UsersPanel's ringPerson). A man with no row there — deleted by the posting, or since — opens
     nothing: the line is only read, and stays in the bell as the record (D1691) */
  const po = postOf(n)
  if (po) {
    markNoticeRead(n.id)
    const p: any = (PEOPLE as any)[po.who]
    if (!p || p.deleted || p.special) { notify(); return }
    setBellList(false)
    openAdminUsers({ person: po.who })
    return
  }
  /* HIS SANS DAYS WITH NOTHING FILED (owner D2338 — "a tap opening the SANS calendar"): the Inputs page's SANS tab, at the
     month of the first of the days, that day's window open (ui/SansCal.tsx spends the ask) — a desktop and a phone alike */
  const due = sansDueOf(n)
  if (due) {
    markNoticeRead(n.id)
    setBellList(false)
    if (INPVIEW === 'med') setInpView('cal')
    setInpMode('sans'); setCalMonth({ y: +due.slice(0, 4), m: +due.slice(5, 7) }); askSansDay(due)
    setPage('inputs', { door: 'line', ...o }); notify(); return
  }
  /* A LEAVE WAR LINE (the overhaul's M4, 9.6): the Leave War at that day — where a move took it, at its new days — his
     cell ringed; a bidding line, the stretch's first day */
  if (isWarNotice(n)) {
    markNoticeRead(n.id)
    setBellList(false)
    const p: any = (n.what || [])[0]
    const day = p.k === 'lw' && p.to ? String(p.to) : String(p.a)
    openWarAt(day, p.k === 'lwopen' || (p.k === 'lwback' && (p.d === 'open' || p.d === 'close')) ? null : n.to)
    notify(); return
  }
  const row = inpById(n.iid)
  markNoticeRead(n.id)
  if (!row) { HOOKS.toast('That input is gone'); notify(); return }
  setBellList(false)
  openInputOnPage(n.iid, undefined, () => stillHis(n), { door: 'line', ...o })
}
/* AN INPUT'S WINDOW OPENS ONCE ITS PAGE IS THERE (the night of 24 Nov 26, the re-walk's B1 —
   tracker/msq-bell-input-ask.test.tsx). The Inputs page is asked for first. Where the Tracker holds unsaved chart edits on
   the squadron in view (the member view), that tap asks "Save them before switching to 142?" and he stays where he was
   until he answers (state/store.ts landOnOwnPage) — and the window, opened before the page, stood under the question,
   noted as opened on the squadron he was leaving: live over its View-only Sched after Stay, held with an untrue band
   after Discard. Nothing opens until he has answered: after Save or Discard the window opens on his own page, the input
   found afresh; after Stay, or a Save the gate refuses, none. `first` — what goes with the window (the bell's own OIL
   question and its words), run only when it opens.
   …AND ONLY IF IT IS STILL HIS TO OPEN, WHERE IT WAITED (the same read's F3): `still` — the caller's own test of what was
   pressed (the line still in his bell; the OIL question still unanswered and his) — is asked again after the answer, and
   never for anyone but the person who pressed. A sign-out answers the question "cancelled" today, so no road brings a
   second person here: that half is a belt for one that might. Opened at once, nothing has had time to change.
   …AND THE PAGE DOOR RUNS IT (step K6 — the plan §4.5's table, `then`): the whole open is the door's `then`, so it runs
   only once the page asked for is the page shown — never behind a refusal at the door, nor after a Stay or a refusal at
   the landing's second ask. `opts` — the door it was pressed by ('line' with its line, 'bell', 'card' with its `skip`),
   carried to the door and the landing. Exported for the OIL list's card (ui/OilDayList.tsx). */
export function openInputOnPage(iid: string, first?: () => void, still?: () => boolean, opts: PageOpts = {}): void {
  const who = me()
  setPage('inputs', opts, waited => {
    if (waited && (me() !== who || (still && !still()))) return
    const row = inpById(iid)
    if (!row) return
    if (first) first()
    setInpEdit(row); notify()
  })
}

/* ---- the Undo / Redo pair: its two engines ---- */
export interface UndoEngine {
  canUndo: boolean
  canRedo: boolean
  undoTitle: string
  redoTitle: string
  undo(): void
  redo(): void
}
/* THE ONE UNDO — every page but the Tracker. UNDO STOPS AT THE DOOR OF OIL EARN (fix 5, 22 Sep 26): inside the mode Undo
   walks back OIL decisions freely, but the press that would reach past the point the mode was opened at closes the mode
   instead of changing the schedule underneath a screen that says it cannot be changed; the next press behaves normally.
   Every door asks it, since there is one pair (oilundo-button.test.tsx presses both bars through the DOM). */
/* …AND IT NEVER RUNS UNDER A CARET (the narrow read of the D994 batch's fix round, round 2, 19 Oct 26 — older than the
   batch). A tap on Undo on Safari does not move the focus, so Undo ran with the caret still in a box whose block is held
   for it; an In-time line there kept the address it had before the Undo, and leaving it wrote it over the line Undo had
   just brought back (one line lost, another doubled). The press first lets the caret go — what was typed in the box is
   saved as its own change, as a desktop click on the button already does — and runs once that save and its backstop
   have run (timers of 0 run in order), so the paint after it is the ordinary one and every line has its true place. */
const offCaret = (body: () => void) => {
  const a = typeof document === 'undefined' ? null : document.activeElement as HTMLElement | null
  if (a && a !== document.body && editingText()) { a.blur(); setTimeout(body, 0); return }
  body()
}
export function globalUndoEngine(): UndoEngine {
  const us = undoState()
  return {
    canUndo: us.canUndo,
    canRedo: us.canRedo,
    undoTitle: us.undoLabel ? `Undo — ${us.undoLabel}` : (us.undoWhy || 'Undo'),
    redoTitle: us.redoLabel ? `Redo — ${us.redoLabel}` : (us.redoWhy || 'Redo'),
    undo: () => offCaret(() => {
      /* (owner D838 + D839, 14 Oct 26: "without undoing" — a reader could not tell whether the undo had been done; this
         press closes the mode and undoes nothing) */
      if (oilUndoBoundary()) { HOOKS.toast('Left OIL Earn without undoing. The next undo would change the day itself.', 'ok'); notify(); return }
      /* (a refusal the guard rail already said under the Undo button — or left unsaid — is not said again: step K8,
         state/guard.ts saidByGuard; a second note here would move the first off the button, in another face) */
      const r = globalUndo(); if (!r.ok && r.reason && !saidByGuard(r.reason)) HOOKS.toast(r.reason, 'warn'); notify()
    }),
    redo: () => offCaret(() => { const r = globalRedo(); if (!r.ok && r.reason && !saidByGuard(r.reason)) HOOKS.toast(r.reason, 'warn'); notify() }),
  }
}
/* THE TRACKER'S OWN HISTORY (D349 (2): "the Tracker's own Undo and Redo move to the top bar too", still taking back the
   Tracker's own changes), through the no-import bridge core.js registers at the end of its init — so a Raptor visit
   never downloads the chart engine. Before the Tracker has loaded there is nothing to take back: both greyed. */
export function useTrackerUndoVersion(): number { return useSyncExternalStore(onTrackerUndo, trackerUndoVersion) }
export function trackerUndoEngine(): UndoEngine {
  /* while the Tracker page wears its cover after a pick (§16 D2′, his D2318 — read only or hidden), no control is offered:
     its Undo and Redo too (state/typing-hold.ts trackerCover) */
  const t: any = trackerCover() ? null : trackerUndoApi()
  const cu = !!(t && t.canUndo()), cr = !!(t && t.canRedo())
  return {
    canUndo: cu,
    canRedo: cr,
    undoTitle: cu ? `Undo ${t.undoWhat()} (Ctrl+Z)` : 'Nothing to undo',
    redoTitle: cr ? `Redo ${t.redoWhat()} (Ctrl+Y)` : 'Nothing to redo',
    undo: () => { if (t) t.doUndo() },
    redo: () => { if (t) t.doRedo() },
  }
}
