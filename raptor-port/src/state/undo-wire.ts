/* [GLOBAL-UNDO] §13 phase 2 — the LIVE cutover wiring (design §8/§9, plan Rev 3
   step 7 / "2.3 remaining").

   This is the ONE place the global undo timeline is turned on in production: it
   installs the stream subscriber, registers the three real stores against the
   collections they own, declares the cut-over module set, and supplies the app
   hooks the engine calls during a restore (view-snap, bubble, locks, publish-day
   resolve, the per-entry publish adjustment). Until this runs, `cutover` is empty
   and globalUndo/globalRedo are no-ops — the engine records but drives nothing.

   Called once from main.tsx after both history baselines are taken (histInit /
   lwHistInit) and before the probe bridge. Kept OUT of main.tsx itself so the
   whole cutover — every hook and every registration — reads in one file, and so
   the button retarget (§9) imports the same helpers.

   Ordinary TS/React-layer style (new file). */
import { logReversed } from './changelines'
import { roleStore, invalidateRoleTargets } from './mission-roles'
import { decodeRoleId } from '../engine/mission-role'
import { peopleStore, settingsStore } from './people-settings-commit'
import { rosterRestoreProblem } from './roster-restore'
import { seedAccounts, levelIn, accountById, isMasterAccount, ACCOUNT_PFX, signedInAccount, adminNow } from './accounts'
import { unitRows, homeOn } from './units'
import { store } from '../engine/hooks'
import { deletedRestoreProblem, postingRestoreProblem } from './person-delete'
import {
  installUndo, registerUndoStore, setCutoverModules, setUndoHooks, setDescribeNames,
} from '../undo'
import { verifiedReplay, verifiedWarRestore, restoreOffAt, restoreDir, applyingRestore } from '../undo/timeline'
import { filedForOther, ownPart, setInputReplayCheck, lwClosedKeys, setLwRestoreCheck, restoreRedated, restoreStood, setRestoreOffAt, setRestoreDir, lwUnitNow, trkUnitNow, pageUnit, isAdmin, restoreLeavesOut, setRestoreGrantCtx, madeAsAdmin, type RestoreGrantCtx } from './perms'
import type { RecordCtx, UndoEntry } from '../undo/types'
import type { Change } from '../command'
import { setRecordKeyHook } from '../command/commit'
import { weekOf, dayKeyOf, recordKeyIn, stampOf } from '../undo/derive'
import { todayIso } from './units'
import { schedStore, schedPostRestore } from './sched-commit'
import { weekstashStore, loadWeek } from './store'
import { HIST } from './history'
import { armDrop, prunePreviews, SBDAY, CURPAGE, setPage, setBoardDay, focusQualsRow, requestAdminUsers, setSecDefOffer, setInpView, setInpMode, setCalMonth, INPVIEW, CALMONTH, clearInpReveal, requestInpReveal, requestPlanReveal } from './view'
import { canEditSched, SESSION } from './auth'
import { bringDayIntoView } from '../ui/highlights'
import { boardTab } from '../ui/board'
import { boardLandKeys, bringBoardChangeOnScreen } from '../ui/boardland'
import { toast } from '../ui/toast'
import { CURWEEK } from '../engine/waves'
import { PEOPLE } from '../engine/people'
import { parseVerId, dayIso } from '../engine/verid'
import { lwStore, LW_COLLS, selectWar, focusDay, bumpLwHistEpoch, restoreBlocker } from '../leavewar/state/store'
import { restoreAbsencesOf, warNoticesReversed, warDayRefusal } from '../leavewar/sync'
import { warCounts } from '../leavewar/absences'
import { DATES, inputCoversDate, isSansAvail } from '../engine/inputs'
import { UNIT_ROW_PREFIXES, GRANT_PFX, UNIT_PFX, UNITPLACE_PFX } from './units-model'
import { noticeLeftBell, type Notice } from './notices'
import { UNIT } from '../engine/unitview'
import { split, localOf, qualify } from '../storage/unitid'
import { storedPlan } from './plan-foreign'

/* the 8 collections schedStore owns (the scheduler week + inputs + plan). NOT
   `weekstash` — that is the separate weekstashStore's one collection, registered
   below, so an off-week undo routes through its CURWEEK-guarded write() seam. */
/* (`notices` — the bell's notices ride the input command that made them, and its Undo takes them back: state/notices.ts) */
const SCHED_COLLS = ['days', 'sched.book', 'sched.mutes', 'sched.week', 'sched.issuance', 'sched.retraction', 'inputs', 'plan', 'notices']

/* ---- context helpers ------------------------------------------------------ */

/* is the week context W carried ONLY by weekstash records in this closure? An
   off-week edit's only record is the stash blob (`weekstash/<wk>`); a loaded-week
   edit also carries days / sched.* records for the same week. loadContext must NOT
   loadWeek a weekstash-only context (C7): loading it makes the week CURWEEK, and
   the weekstash write() seam then refuses (its blob would be lost by persistAll). */
function weekIsStashOnly(entry: UndoEntry, wk: string): boolean {
  let sawWeek = false
  for (const ch of entry.forward) {
    if (weekOf(ch.collection, ch.id) !== wk) continue
    sawWeek = true
    if (ch.collection !== 'weekstash') return false   // a real loaded-week record
  }
  return sawWeek
}

/* the day index a scheduler closure touched, for the view-snap: a day's content first, then an issued version of it, then
   the one day whose sign-offs, plans or mutes changed — every schedule record names its day since [DB-READINESS] group
   A, phase 1 (walk S14a: Saturday's sign-off redone with the board on Friday must land on Saturday). */
function schedDayOf(entry: UndoEntry): number | null {
  for (const ch of entry.forward) if (ch.collection === 'insights.role') {
    const id=decodeRoleId(ch.id)
    if (id) for (let di=0;di<7;di++) if (dayIso(id.weekKey,di)===id.dayISO) return di
  }
  const dayOfCh = (ch: Change) => { const dk = dayKeyOf(ch.collection, ch.id); return dk && dk.includes('#') ? Number(dk.split('#')[1]) : null }
  for (const ch of entry.forward) if (ch.collection === 'days') return dayOfCh(ch)
  for (const ch of entry.forward) if (ch.collection === 'sched.issuance' || ch.collection === 'sched.retraction') { const d = dayOfCh(ch); if (d != null) return d }
  const days = new Set<number>()
  for (const ch of entry.forward) if (ch.collection === 'sched.book' || ch.collection === 'sched.mutes') { const d = dayOfCh(ch); if (d != null) days.add(d) }
  return days.size === 1 ? [...days][0] : null
}

/* the date an LW closure touched (lw.cell id = `<warId>:<pid>:<date>`,
   the date is the LAST segment — a warId may itself contain ':'). */
function lwDateOf(entry: UndoEntry): string | null {
  /* a holiday added, changed or removed from the Holidays list: its first day, from the command's own note */
  if (typeof entry.type === 'string' && (entry.type.startsWith('lw.holiday.') || entry.type.startsWith('lw.event.'))) {
    try { const d = JSON.parse(entry.detail || 'null'); if (d && /^\d{4}-\d{2}-\d{2}$/.test(String(d.from))) return String(d.from) } catch { /* no note */ }
  }
  for (const ch of entry.forward) {
    if (ch.collection === 'lw.cell') {
      const p = ch.id.split(':')
      if (p.length >= 3) return p[p.length - 1]
    }
    /* a ledger entry (an OIL award) carries its own day — the undo lands there (Fable's round-2 read, N3) */
    if (ch.collection === 'lw.ledger') {
      const d = ((ch.after ?? ch.before) as any)?.date
      if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d
    }
  }
  return null
}

/* ---- the hooks (UndoHooks) ------------------------------------------------- */
/* the board's day, when a week load for an undo closed it (loadWeek shuts the board) — reopened on the changed day by
   snapView (walker A1-F2, 28 Sep 26: the board's Undo that crossed to another week closed the board, landing on the
   week on the wrong day, its Redo gone with it) */
let BOARD_WAS: number | null = null
function loadContext(ctx: RecordCtx, entry: UndoEntry): void {
  if (ctx.kind === 'week') {
    if (weekIsStashOnly(entry, ctx.weekId)) return   // off-week apply via the stash — do NOT load (C7)
    /* the week names its unit (`u149@13/07/2026` — storage/unitid.ts, step 2). Undo never changes the unit in view: a
       week of another unit is put back through the stash, as an off-week one is, and only the unit in view's own weeks
       are loaded — by their date part, which is what loadWeek takes */
    const wk = split(ctx.weekId)
    if (wk.unit != null && wk.unit !== UNIT) return
    if (wk.local !== CURWEEK) { if (SBDAY != null) BOARD_WAS = SBDAY; loadWeek(wk.local) }
  } else if (ctx.kind === 'war') {
    selectWar(ctx.warId)
  }
  // 'course' — the Tracker has its own undo; 'page' — nothing to load (the page itself is chosen in snapView).
}

/* WHICH PAGE THE CHANGE LIVES ON — the change-recording re-test B7 (§11.6; walker A2-F4). The register's AM39b: an undo
   "takes you to where the change was". The page is the ACT's, read from the step's own area (its scope), never from a
   consequence folded into it (Astra's final read, F2: a weekend publish carries the Leave War's OIL credit and landed on
   the war, leaving the board on the wrong day): a schedule step to Edit Schedule, for someone who has it; a war's to the
   Leave War; an input to Inputs, the planning calendar to Inputs on its calendar (Fable's final read, F2), the inputs'
   look-ahead to Inputs; a roster record to Quals, on his row; the accounts and the requests to Admin →
   Users (the guest switch went with the guest view, D2239); a rule to Logic; the LoX columns to Quals; the templates and the default arrangement to Admin. The stores and the
   cancel reasons are edited on the board and the week, so they stay. `also` = the pages an undo may stay on because the
   change shows there too — only an input's: the loaded week it lands on (walk S16) and, for an absence, the Leave War
   (step4-leavewar's ATT C cut). null = stay where you are. */
type Landing = { primary: string | null; also: string[]; then?: () => void }
const inputRows = (c: { before?: unknown; after?: unknown }) => [c.before, c.after].filter(v => v && typeof v === 'object') as any[]
/* the loaded week's day an input covers — its day on Edit Schedule */
function inputDayOf(entry: UndoEntry): number | null {
  for (const c of entry.forward) {
    if (c.collection !== 'inputs') continue
    for (const r of inputRows(c)) for (let di = 0; di < 7; di++) if (DATES[di] && inputCoversDate(r, DATES[di])) return di
  }
  return null
}
/* the date a flying-plan step is about: its first day row, the start of its run, or the start of its rule */
function flyDateOf(entry: UndoEntry): string | null {
  /* a unit's row is named with its unit (`u149@flyday:<iso>` — step 2): read by its plain name */
  const ids = entry.forward.filter(c => c.collection === 'settings').map(c => localOf(c.id))
  const day = ids.filter(k => k.startsWith('flyday:') || k.startsWith('flyrun:')).map(k => k.slice(7)).sort()[0]
  if (day) return day
  const rule: any = entry.forward.find(c => c.collection === 'settings' && localOf(c.id).startsWith('flyrule:'))
  const r = rule && (rule.after || rule.before)
  return r && typeof r.from === 'string' ? r.from : null
}
function landingOf(entry: UndoEntry, dir:'undo'|'redo'): Landing | null {
  const fwd = entry.forward, m = entry.scope.module
  const also: string[] = []
  let primary: string | null = null
  let then: (() => void) | undefined
  if (m === 'lw') primary = 'leavewar'
  else if (m === 'sched' || m === 'insights') primary = canEditSched() ? 'editsched' : null
  else if (m === 'inputs' || m === 'plan') {
    primary = 'inputs'
    /* the calendar's own records (a day title, its puck rows — saved through the Inputs page's door, so filed under
       inputs) and no input row: the change is on the calendar */
    if (fwd.some(c => c.collection === 'plan') && !fwd.some(c => c.collection === 'inputs')) {
      /* …AND ITS MONTH, WHEN ANOTHER IS SHOWING (D672: the screen moves to the change only when it is out of view; the
         day-window check, 9 Oct 26 — Astra's scenario 2.5: a note undone from another month changed nothing a person
         could see). A note's day is its `date` — the image this direction restores, else the other; a day title's is
         in its id (`dm:<iso>`). Setting the month it already shows moves nothing. */
      const pl = fwd.find(c => c.collection === 'plan') as Change
      const img: any = (dir === 'undo' ? pl.before : pl.after) || pl.after || pl.before
      const plId = localOf(pl.id)   // `u149@dm:<iso>` — the unit split off (step 2)
      const raw = plId.startsWith('dm:') ? plId.slice(3) : img && typeof img === 'object' && typeof img.date === 'string' ? img.date : pl.id
      const iso = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : ''
      /* …and the DAY is handed to the calendar: a day window open on ANOTHER day goes to it (Sol S3), as it does for
         an input (requestInpReveal) */
      then = () => { clearInpReveal(); setInpMode('member'); setInpView('cal'); if (iso) { setCalMonth({ y: +iso.slice(0, 4), m: +iso.slice(5, 7) }); requestPlanReveal(iso) } }
    }
    else if(m==='inputs') {
      const changes=fwd.filter(c=>c.collection==='inputs')
      const image=(c:Change)=>dir==='undo'?c.before:c.after
      // snapView runs BEFORE the restored writes. Use their directional image,
      // never the old live row. New retained medical segments outrank removed tails.
      const change=changes.find(c=>image(c)&&(dir==='undo'?!c.after:!c.before))??changes.find(c=>image(c))
      const row=(change?image(change):null) as any
      const fallback=(dir==='undo'?changes[0]?.after:changes[0]?.before) as any
      if(row||fallback) then=()=>{
        clearInpReveal();setInpMode(isSansAvail((row??fallback).type)?'sans':'member')
        /* only when the undo LANDED on Inputs (snapView has changed page by now): an input undone from Edit Schedule
           stays there, and a reveal left waiting would open that day by itself at the next visit to Inputs, however
           much later (Opus's own read of the build, step 0, 7 Oct 26) */
        /* …and NOT from the Medical tab (the fix read of [MEDICAL-CARDS-3], 17 Oct 26): neither calendar is in view there, so
           an Undo or Redo of a filing made on it turned the month unseen and left the reveal waiting for the next visit */
        if(row&&change&&CURPAGE==='inputs'&&INPVIEW!=='med')requestInpReveal({...row,iid:change.id})
      }
    }
  } else if (m === 'people') {
    primary = 'quals'
    const person = fwd.find(c => c.collection === 'people')
    if (person) then = () => focusQualsRow(person.id)
  } else if (m === 'settings') {
    /* each setting by its plain name: a unit's is named with its unit (`u149@rules` — step 2) */
    const ids = fwd.filter(c => c.collection === 'settings').map(c => localOf(c.id))
    /* …and the squadrons' rows (multi-squadron batch 1, step 1 — units, places, homes, rights: Admin's, where step 3
       draws them; until then Admin → Users, where every account change already lands) */
    if (ids.some(k => k.startsWith('account:') || k.startsWith('accessreq:') || UNIT_ROW_PREFIXES.some(p => k.startsWith(p)))) { primary = 'admin'; then = () => requestAdminUsers(false) }
    else if (ids.includes('rules') || ids.includes('insights')) {
      primary = 'logic'
      /* A LATE CUT-OFF IS SET BEHIND A CALENDAR'S OWN GEAR TOO (D639 — one setting, two ways in), so the Inputs page
         shows it as the Logic page does: an Undo of a cut-off pressed there leaves him there (D672), and from
         anywhere else it lands on Logic, as every rule's does. */
      const row = fwd.find(c => c.collection === 'settings' && localOf(c.id) === 'rules')
      const vals = (x: any) => (x && x.v) || {}
      const a = vals(row && row.before), b = vals(row && row.after)
      const moved = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(k => a[k] !== b[k])
      if (row && moved.length && moved.every(k => /^(input|sans)(Lead|CutMode|CutWd|CutWeeks)$/.test(k))) also.push('inputs')
    }
    else if (ids.includes('qualcols')) primary = 'quals'
    else if (ids.includes('lookahead')) primary = 'inputs'
    /* the three day colours are the SANS calendar's own: its month, whichever it is showing */
    else if(ids.includes('sanscalendar')){
      primary='inputs';then=()=>{ clearInpReveal(); setInpView('cal');setInpMode('sans') }
    }
    /* THE FLYING PLAN (state/flyplan.ts; the plan §3.2): a required figure is typed on the Leave War, so its Undo
       lands there, on its date (snapView reads the date off the row — flyDateOf); a day's class or a weekday's rule
       shows on the Leave War and on both calendars, so it stays where he is if that page shows it, else the SANS month */
    else if (ids.some(k => k.startsWith('flyday:') || k.startsWith('flyrun:') || k.startsWith('flyrule:'))) {
      const rows = fwd.filter(c => c.collection === 'settings')
      const fig = (v: any, s: string) => (v && v[s] != null ? v[s] : null)
      const figures = ids.some(k => k.startsWith('flyrun:')) ||
        rows.some(c => localOf(c.id).startsWith('flyday:') && (fig(c.before, 'p') !== fig(c.after, 'p') || fig(c.before, 'w') !== fig(c.after, 'w')))
      if (figures) primary = 'leavewar'
      else {
        primary = 'inputs'; also.push('leavewar')
        const iso = flyDateOf(entry)
        /* IN VIEW ALREADY, NOTHING MOVES (D672; both readers of the calendar job's bug check, 8 Oct 26). A day's class
           shows on BOTH calendars, so a calendar of the Inputs page that is up keeps its TAB; its month turns only when
           the date is not on it - and a weekday's rule is on every month from the one it starts in. It used to switch
           to the SANS tab and the rule's first month whatever was on screen. Read HERE, before the page is changed. */
        const onCal = CURPAGE === 'inputs' && INPVIEW === 'cal'
        const want = iso ? +iso.slice(0, 4) * 12 + +iso.slice(5, 7) : 0, at = CALMONTH ? CALMONTH.y * 12 + CALMONTH.m : 0
        const shown = onCal && !!want && (ids.some(k => k.startsWith('flyrule:')) ? at >= want : at === want)
        then = () => {
          if (CURPAGE !== 'inputs' || shown) return
          clearInpReveal()
          if (!onCal) { setInpView('cal'); setInpMode('sans') }
          if (iso) setCalMonth({ y: +iso.slice(0, 4), m: +iso.slice(5, 7) })
        }
      }
    }
    else if (ids.some(k => k === 'dutytpl' || k === 'wavetpl' || k === 'wavehide' || k === 'daytpl' || k === 'secdefault' || k === 'wavedefault')) primary = 'admin'
  }
  if (m === 'inputs') {
    if (canEditSched() && inputDayOf(entry) != null) also.push('editsched')
    if (fwd.some(c => c.collection === 'inputs' && inputRows(c).some(r => warCounts(r)) /* a commitment under Unavailable shows on the war too (D1357) */)) also.push('leavewar')
  }
  return primary || also.length ? { primary, also, then } : null
}

function snapView(entry: UndoEntry, dir: 'undo' | 'redo'): void {
  const boardWas = BOARD_WAS; BOARD_WAS = null
  const land = landingOf(entry,dir)
  /* not when the change already shows on the page you are on (an input filed on Inputs, undone there) */
  if (land && land.primary && CURPAGE !== land.primary && !land.also.includes(CURPAGE)) setPage(land.primary)
  if (land && land.then) land.then()
  if (land && land.primary === 'leavewar') {
    const date = lwDateOf(entry) ?? flyDateOf(entry)
    /* the SOFT ask (owner, D670, 8 Oct 26): a change he is looking at is undone or redone where he is looking — the
       grid jumps to the day only when its column is out of view */
    if (date) focusDay(date, { ifHidden: true })
    return
  }
  const di = schedDayOf(entry) ?? inputDayOf(entry)
  if (di == null || CURPAGE !== 'editsched') return
  /* the board: bring the changed day onto it — and reopen it there when a week load closed it (A1-F2) */
  /* …and the changed box onto the screen when it is out of view, never when it is in view (D672 — [BOARD-UNDO-SAME-DAY]:
     the board only changed day, so a change scrolled out of view on the day already open went back unseen). Which box
     is read NOW, from the step's own images; the screen is moved once the step is applied and the board repainted.
     ONLY ONCE IT HAS BEEN APPLIED (the fresh Opus reader, F3, 11 Nov 26): this is asked before the restore, and a
     restore can still be REFUSED — the landing was booked all the same and scrolled the board to a box whose value never
     changed back. undo/timeline.ts marks the step in the same turn it applies it (`undone` true after an Undo, false
     after a Redo), so by the time the landing runs the mark says whether it went through. */
  const toBox = () => {
    const keys = boardLandKeys(entry, dir, di)
    if (keys.length) setTimeout(() => { if (!!entry.undone === (dir === 'undo')) bringBoardChangeOnScreen(keys, di) }, 0)
  }
  if (SBDAY != null) { if (SBDAY !== di) boardTab(di); toBox(); return }
  if (boardWas != null) { setBoardDay(di); toBox(); return }
  /* the week (walker A1-F3): the changed day brought on screen — stepped to on a phone, to the front on a desktop — once
     the undo has repainted it */
  setTimeout(() => bringDayIntoView(di), 0)
}

/* §3.4 / Fable N9 — hold the scheduler HIST.lock for the restore's duration, so
   the deferred histPush the restore's write() raises no-ops (a legacy step would
   feed the barrier-blind E3 hazard). The LW half is redundant — lwStore.write
   already runs its persist under locked(). Returns the un-lock. */
function reinstallLocks(): () => void {
  const prev = HIST.lock
  HIST.lock = true
  return () => { HIST.lock = prev }
}

/* §6.3 — resolve an AL/publish boundary's issued verId to its day when the
   closure carries no days/sched.issuance key. A publish always lands on the loaded
   week, so match the id's ISO date against CURWEEK's seven days (best-effort). */
function resolvePublishDay(id: string): { weekId: string; di: number } | null {
  const iso = parseVerId(id).iso
  /* the day key names its unit, as every other day key does (multi-squadron step 2), so the timeline compares like with like */
  for (let di = 0; di < 7; di++) if (dayIso(CURWEEK, di) === iso) return { weekId: qualify(UNIT, CURWEEK), di }
  return null
}

/* §6.2/C5 + the restore epilogue (Fable N5). schedPostRestore clears the day's
   sign-offs on undo of a publish (GU5-005); the epilogue reproduces what the
   legacy histApply does after a restore but the write() seam does not:
   - armDrop(): a swapped-out model may leave the armed slot pointing at a row that
     no longer exists — put it down before anything repaints.
   - prunePreviews(): a day previewing a version the undo just un-published would
     otherwise render the live day while claiming to show history.
   - bumpLwHistEpoch(): signal the LW matrix to drop any in-flight drag/select.
   Runs INSIDE the restore reducer, so it precedes the deferred reflow — the same
   order histApply uses (armDrop/prunePreviews before reflow). */
function postRestore(entry: UndoEntry, dir: 'undo' | 'redo', pulledBack: Array<{ weekId: string; di: number }>): void {
  invalidateRoleTargets()
  if (entry.forward.every(ch=>ch.collection==='insights.role')) return
  schedPostRestore(entry, dir, pulledBack)
  /* the "use this section order as the default?" offer asks about the drag just made — once any step is undone or
     redone it asks about an order no longer on screen (walker A1 O5: "Set as default" would have promoted the order
     just undone, and on a phone the bubble sat over its buttons) */
  setSecDefOffer(null)
  armDrop()
  prunePreviews()
  bumpLwHistEpoch()
}

/* ---- the cutover ---------------------------------------------------------- */
/* Idempotent by construction: installUndo guards its own stream subscription,
   registerUndoStore is a Map set, and setCutoverModules/setUndoHooks replace.
   So a second call (e.g. a test after _resetTimeline) re-establishes the same
   wiring harmlessly rather than being skipped by a stale one-shot flag. */
/* B1 — each seen mark's field, carried onto an older step's image of the same record (timeline.ts carrySeen; Fable's
   final read F4, Astra's F1). His welcome note: `back` gone from his roster record. "OK, seen": the notices it removed
   (by their seq — a notice spans the days of one filing) gone from the day's list. Anything else: the image untouched.
   (The admins' bell had a branch here while each request carried its `seenBy`; since [DB-READINESS] group A, phase 4.4
   each admin's seen is a row of his own — AccessRequestSeen — which no step's image of a request holds.) */
function seenOverlay(type: string, seen: Change, image: unknown): unknown {
  if (!image || typeof image !== 'object') return image
  const b: any = seen.before, a: any = seen.after
  if (type === 'person.backSeen') {
    if (!(b && b.back) || (a && a.back) || !(image as any).back) return image
    const c = { ...(image as any) }; delete c.back; return c
  }
  if (type === 'lw.ack') {
    if (!Array.isArray(image) || !Array.isArray(b)) return image
    const kept = new Set((Array.isArray(a) ? a : []).map((r: any) => r && r.id))
    const gone = new Set(b.filter((r: any) => r && r.kind === 'notice' && !kept.has(r.id)).map((r: any) => r.seq))
    if (!gone.size) return image
    const next = image.filter((r: any) => !(r && r.kind === 'notice' && gone.has(r.seq)))
    return next.length === image.length ? image : next
  }
  return image
}

/* ---- A-v: every Undo step carries its squadron (the reshape plan §3.2) --------------------------------------------
   The Leave War's and the Tracker's records name no squadron in their ids, so each command that writes one is stamped
   with the squadron that world holds — through the gate's own probes (perms.ts lwUnitNow, trkUnitNow; none answers with
   no world door, and nothing is stamped) — and every record is keyed by undo/derive.ts recordKey, in the revision counter
   (command/commit.ts) as in the timeline. */
const worldNow = (w: 'lw' | 'trk'): string | null => (w === 'lw' ? lwUnitNow() : trkUnitNow())
/* the own pages: their squadron is the page's own (perms.ts pageUnit — A-ii), the schedule pages and Logic the pick */
const OWN_PAGES = new Set(['inputs', 'quals', 'leavewar', 'tracker', 'admin'])
const unitInView = (): string => pageUnit(OWN_PAGES.has(CURPAGE) ? 'own' : 'schedule')
/* A RECORD OF AN OWN PAGE (the reshape plan §3.2 A-ii, its list of own pages and their settings): the Inputs calendar's notes
   and day titles; Quals' columns; the flying plan and the SANS calendar's colours (the war's need figures, the SANS
   calendar); the members' filing switch (the Inputs page) — the guest switch (Admin → Users) gone with the guest view, D2239. Every other record a squadron
   names — its weeks, its Logic rules, its templates, a blue/red answer — is a schedule page's. */
const OWN_SETTINGS = new Set(['qualcols', 'sanscalendar', 'memberfile'])
const OWN_SETTING_PFX = ['flyday:', 'flyrule:', 'flyrun:']
const ownPageRecord = (c: Change): boolean => {
  if (c.collection === 'plan') return true
  if (c.collection !== 'settings') return false
  const k = localOf(String(c.id))
  return OWN_SETTINGS.has(k) || OWN_SETTING_PFX.some(p => k.startsWith(p))
}
/* a squadron he can still reach: his own page's squadron now, or — an admin in force — one he is an admin of today (a
   master admin's every squadron, a Plan holder's — units-model.ts levelFrom); a View holder never reaches a war */
const canReach = (u: string): boolean => {
  if (u === pageUnit('own')) return true
  return !!SESSION && isAdmin() && levelIn(SESSION.user, u, todayIso()) === 'admin'
}

/* ---- Piece B: the restore lines (the reshape plan §4.3 "At the restore", "A step the leave-out empties", "At the gate") --
   The core's one body (perms.ts restoreLeavesOut) decides; this file hands it what the step recorded. */
const isGrantRow = (c: Change) => c.collection === 'settings' && String(c.id).startsWith(GRANT_PFX)
const isAccountRow = (c: Change) => c.collection === 'settings' && String(c.id).startsWith(ACCOUNT_PFX)
/* an account row's image on one side of a change, read as the account list reads it: a row never stored is its seed */
function accountImage(id: string, v: unknown): any {
  if (v && typeof v === 'object') return v
  return seedAccounts().find(a => a.id === id) ?? null
}
/* does this change put the account on another man — a re-link, its Undo, its Redo (guardrail 1). A row the restore takes
   away is the account gone — unless the restore takes away every stored account row, when the list reads its seeds again
   (the Undo of the list's very first stored write; the gate reads it so too — perms.ts accountAfter) */
function relinks(c: Change, acct: string, changes: Change[]): boolean {
  if (!isAccountRow(c) || String(c.id) !== ACCOUNT_PFX + acct) return false
  const was = accountImage(acct, c.before)
  let is: any = c.after && typeof c.after === 'object' ? c.after : null
  if (!is) {
    const goes = new Set(changes.filter(x => isAccountRow(x) && x.after == null).map(x => String(x.id)))
    if (store.keys(ACCOUNT_PFX).filter(k => store.get(k, null) != null).every(k => goes.has(k))) is = accountImage(acct, null)
  }
  return !!was && !!is && String(was.pid) !== String(is.pid)
}
/* the man and the link day of each grant row's account the step touches, as they stand as it lands (kept on the step) */
function holdersOf(changes: Change[]): Record<string, { id: string; pid: string; pidFrom: string | undefined }> | undefined {
  let out: Record<string, { id: string; pid: string; pidFrom: string | undefined }> | undefined
  for (const c of changes) {
    if (!isGrantRow(c)) continue
    const acc = String(((c.after ?? c.before) as any)?.account ?? '')
    if (!acc || (out && out[acc])) continue
    const a = accountById(acc)
    if (!a) continue
    ;(out ??= {})[acc] = { id: acc, pid: String(a.pid), pidFrom: a.pidFrom }
  }
  return out
}
/* is the person pressing Undo or Redo a master admin (rule 4 — his D2250: a Plan is put back only by a master admin's
   restore); the gate reads its own actor the same way */
const pressedByMaster = (): boolean => isAdmin() && !!SESSION && isMasterAccount(SESSION.user)
/* what the one body is asked about one grant row of a restore: whether the restore re-links its account, the man the step
   recorded, the row as it stood before the restore the other way took it, and who presses */
function grantCtx(c: Change, dir: 'undo' | 'redo', entry: UndoEntry, changes: Change[], stored?: boolean): RestoreGrantCtx | null {
  if (!isGrantRow(c)) return null
  const acc = String(((c.after ?? c.before) as any)?.account ?? '')
  const holder = acc ? entry.holders?.[acc] : undefined
  const stood = entry.stoodBefore?.[dir === 'undo' ? 'redo' : 'undo']?.[recordKeyIn(c, entry.stamp)]
  return {
    relink: !!acc && changes.some(x => relinks(x, acc, changes)),
    ...(holder ? { holder } : {}),
    ...(stood !== undefined ? { stood } : {}),
    ...(stored !== undefined ? { stored } : {}),
    master: pressedByMaster(),
  }
}
function grantLeftOut(c: Change, dir: 'undo' | 'redo', entry: UndoEntry, changes: Change[]): boolean {
  const ctx = grantCtx(c, dir, entry, changes)
  return !!ctx && restoreLeavesOut(c, ctx)
}
/* GUARDRAIL 1 (§4.3): a restore that puts an account on another man while a right stands on that sign-in — given since, to
   the man then on it — would carry the right to the other man: the record key of that right (any row naming the account
   that the restore itself does not take away), so the timeline blocks the step naming who wrote it */
function standingRightKey(changes: Change[]): string | null {
  for (const c of changes) {
    if (!isAccountRow(c)) continue
    const acc = String(c.id).slice(ACCOUNT_PFX.length)
    if (!relinks(c, acc, changes)) continue
    const goes = new Set(changes.filter(x => isGrantRow(x) && (x.op === 'delete' || x.after == null)).map(x => String(x.id)))
    const g = unitRows().grants.find(r => r.account === acc && !goes.has(GRANT_PFX + r.id))
    if (g) return `settings/${GRANT_PFX}${g.id}`
  }
  return null
}

/* ---- A STEP HE CAN NO LONGER REACH (fix read 2 — Opus 2's F1, Fable 2's F2; his D148) --------------------------------
   A person's row, an account's row and a right's row name no squadron in their ids and carry no stamp (A-v stamps only the
   war's and the Tracker's), so the timeline reads them as in view wherever he presses — and the commit gate then refused
   the restore on every press in the generic words, with every older step of his out of reach until he signed out. Asked
   BEFORE anything else of a press, of what the restore would write: a step that can never go through is blocked for
   good in today's words, the next press named, as the move's begun day and A-v's steps already are. A REACH CHECK, never
   the gate's English reason (the readers' tidiness note): the gate still judges every restore that is let through.
   Stuck, each read off the account as it stands today, whatever view he is in:
   - an admin's step, and his account gives him no admin role today (his own move's day come — K3 — or made a member): a
     member never reverses an admin's step (timeline.ts mayReverse), and he has no admin view to switch back to;
   - a person's row, or an account's, of a man at home today in a squadron he is not an admin of (the gate's section 8) —
     never his own row, which the member rules hold; a row the restore leaves as it reads now asks nothing (the account
     list's first write stores every seeded row);
   - a right's row of a squadron he is not an admin of today (section 6's who-rule) — where the step changes no account
     and no person (a delete's, a re-link's and a demotion's drops are the gate's to judge);
   - a squadron taken away again (the Undo of "+ New squadron") while a man's home in it has begun: a begun home row
     never changes (D2119), so the squadron is named for good.
   A master admin reaches every squadron, so only the last can hold him. No account behind the session (the localhost
   bridge, a headless test): never. */
const sameImage = (x: unknown, y: unknown): boolean => JSON.stringify(x ?? null) === JSON.stringify(y ?? null)
function stepStuck(changes: Change[], entry: UndoEntry): boolean {
  const acct = signedInAccount()
  if (!acct) return false
  const today = todayIso()
  const rows = unitRows()
  for (const c of changes) {
    if (c.collection !== 'settings') continue
    const id = String(c.id)
    if (!id.startsWith(UNIT_PFX) || id.startsWith(UNITPLACE_PFX) || !(c.op === 'delete' || c.after == null)) continue
    const key = id.slice(UNIT_PFX.length)
    if (rows.homes.some(h => h.unit === key && String(h.from) <= today)) return true
  }
  if (!madeAsAdmin(entry.actor)) return false
  /* (the session as it was made again from his account — ui/App.tsx, accounts.ts sessionNow: `acct` is the role the
     account gave then; a session with none, the developer bridge's, is never judged) */
  if (SESSION.acct && SESSION.acct !== 'admin' && !adminNow(acct)) return true
  if (acct.master) return false
  const mine = String(acct.pid)
  const adminOf = (u: string): boolean => levelIn(acct.id, u, today) === 'admin'
  const strangers = (pid: unknown): boolean => {
    if (pid == null || String(pid) === mine) return false
    const p = (PEOPLE as any)[String(pid)]
    if (!p || p.special) return false
    const h = homeOn(String(pid), today)
    return !!h && !adminOf(h)
  }
  const bare = !changes.some(c => c.collection === 'people' || isAccountRow(c))
  for (const c of changes) {
    const after = c.op === 'delete' ? null : c.after
    if (c.collection === 'people') {
      if (!sameImage(c.before, after) && strangers(c.id)) return true
    } else if (isAccountRow(c)) {
      const aid = String(c.id).slice(ACCOUNT_PFX.length)
      const was = accountImage(aid, c.before), is = accountImage(aid, after)
      if (!sameImage(was, is) && (strangers(was?.pid) || strangers(is?.pid))) return true
    } else if (bare && isGrantRow(c)) {
      for (const img of [c.before as any, after as any]) if (img && img.unit != null && !adminOf(String(img.unit))) return true
    }
  }
  return false
}

/** tests only — the landing, driven with a made-up entry */
export const _snapView = (e: UndoEntry, d: 'undo' | 'redo'): void => snapView(e, d)

export function installGlobalUndo(): void {
  installUndo()
  /* A-v — the stamp and the one record key, in the command layer's revision counter */
  setRecordKeyHook({ stamp: (changes) => stampOf(changes, worldNow), key: (c, stamp) => recordKeyIn(c, stamp) })
  /* the words name a man by his callsign (describe.ts — the Leave War's records carry his id) */
  setDescribeNames((pid) => ((PEOPLE as any)[pid] ? String((PEOPLE as any)[pid].cs) : null), (k) => (k === 'accounts' ? seedAccounts() : null))
  registerUndoStore(schedStore, SCHED_COLLS)
  registerUndoStore(lwStore, LW_COLLS as unknown as string[])
  registerUndoStore(weekstashStore, ['weekstash'])
  /* B2 of the change-recording re-test (28 Sep 26, [UNDO-ROSTER-SETTINGS]): the roster and the settings join — the
     16 Sep 26 rule "roster and settings edits ARE undoable" (register AM39d), narrowed by D350: adding, archiving,
     restoring, deleting a person and a posting still write the war's stints (lw.postouts), which stay deferred
     (undo/timeline.ts), so those five stay out and say why (B3). A delete is kept dead by person-delete.ts (B4). */
  registerUndoStore(peopleStore, ['people'])
  registerUndoStore(settingsStore, ['settings'])
  registerUndoStore(roleStore, ['insights.role'])
  setCutoverModules(['sched', 'lw', 'inputs', 'plan', 'people', 'settings', 'insights'])
  setUndoHooks({
    loadContext,
    snapView,
    showBubble: (text: string) => toast(text, ''),
    /* the change history's line for an undo or a redo, on every day it touched ([DRAFT-PENDING], Astra DP-04) */
    reversed: (entry, dir) => {
      logReversed(entry as any, dir)
      /* M4 9.3 (D1216): a Leave War line the member had read leaves "taken back"; a Redo after it, a fresh line — the step's
         own notices, as it made them (its forward images) */
      warNoticesReversed(entry.forward as any, dir)
    },
    reinstallLocks,
    resolvePublishDay,
    postRestore,
    /* the war's own rules on what a restore may put back — a bid over a medical filed since (W3-F8) */
    /* …and B5 (the change-recording re-test): what a roster or settings restore must re-check — one callsign on the
       roster, the accounts' guards, a man still named somewhere (state/roster-restore.ts) */
    /* …and [LW-DELETE-POSTING-RESTORE]: an approval of his leave from the date of a Delete posting not yet run, refused live
       (D1545) — asked fresh each time, since a posting moves, is taken back or changes its outcome (person-delete.ts
       postingRestoreProblem) */
    /* …and A7 (the reshape plan §6.2): an entry put back on a man's day now another squadron's says war's sentence before
       anything is written — a removal, of one entry of two or of the last, still passes (leavewar/sync.ts warDayRefusal) */
    restoreRefusal: (changes, dir, entry) => restoreBlocker(changes as any, dir, restoreAbsencesOf(changes as any)) || rosterRestoreProblem(changes as any, dir)
      || postingRestoreProblem(changes as any, dir, entry?.scope?.module) || warDayRefusal(changes as any),
    /* [POST-OUT-OUTCOMES]: a step that would put a deleted man back is passed over, never taken (person-delete.ts) */
    /* the direction and the step's module: a war step's Redo is judged by the leave it adds (person-delete.ts) */
    deadRefusal: (changes, dir, entry) => deletedRestoreProblem(changes as any, dir, entry?.scope?.module),
    /* D148 — the refusal says who: the callsign he goes by (a rename moves nothing, so it is read live) */
    seenOverlay,
    nameOf: (a) => (a.personId != null && (PEOPLE as any)[a.personId] ? String((PEOPLE as any)[a.personId].cs) : null),
    /* the group input (plan §3.13): a member reverses his own step though it holds an input that is another man's —
       one he FILED for him. The one rule, asked of the step's recorded images (state/perms.ts filedForOther) */
    filerMay: (cur, before, after) => cur.personId != null && filedForOther(String(cur.personId), before, after),
    /* …and his own part of an input he shares: himself taken out, or put back by his own Undo (perms.ts ownPart) */
    ownPart: (cur, before, after) => cur.personId != null && ownPart(String(cur.personId), before, after),
    /* D1263 — the war records a member's step changed on a day already closed for him, kept with the step as it lands */
    closedAtStep: (changes, actor) => lwClosedKeys(changes, actor),
    /* fix read 4, claim 2 (the Opus read's §2; his D2218): an Undo or Redo never puts a bell line back on a man it has
       left — a line of his old squadron's, once he has moved (state/notices.ts noticeLeftBell). The Redo of Kestrel's
       Open for bidding goes through without Osprey's line, now 142's; taking a line AWAY still rides the restore */
    /* …and PIECE B's guardrails (the reshape plan §4.3 "At the restore" — the core's one body, perms.ts restoreLeavesOut):
       a right put back only on the man the step recorded, never after his move since its start, never by a re-link's Undo
       or Redo, a Plan only by a master admin's restore (his D2250), and no removal of a right not stored */
    leaveOut: (c, dir, entry, changes) => (c.collection === 'notices' && c.op === 'put' && !!c.after && noticeLeftBell(c.after as Notice))
      || (!!entry && grantLeftOut(c, dir, entry, changes ?? [])),
    holdersAtStep: (changes) => holdersOf(changes),
    standingKey: (changes) => standingRightKey(changes),
    /* fix read 9, fault A (Fable 1, the fresh Opus read's O9-2; his D2218, D2223): a grant or the master mark an Undo or
       Redo turns on is dated today, as a command dates it — the recorded day, pressed after a move, brought a retired
       line back. The gate asks the same rule (state/perms.ts restoreRedated, grantKept, masterKept) */
    /* (fix read 10, fault E — O10-1, Fable F10-5): with the moment the right went off, so one his man has not moved
       squadron since keeps the day it had (a mistaken removal undone gives back what it took) */
    /* (fix read 12, fault E — Astra 2): and with the right as it stood before the restore the other way took it, so a
       repeated Undo / Redo puts back the day an earlier restore gave it, never the step's older one */
    redate: (c, dir, offAt, stood) => restoreRedated(c, offAt, dir, stood),
    stoodNow: (c) => restoreStood(c),
    /* A-v: which squadron each world holds now, the squadron in view, and the squadrons he can still reach */
    worldNow,
    unitInView,
    /* …and an own-page step of his own page's squadron is his wherever he presses (A-v "Eligibility") */
    ownUnit: () => pageUnit('own'),
    ownPageRecord,
    canReach,
    /* fix read 2: a step he can no longer reach is blocked for good, never refused on every press */
    stuck: (changes, _dir, entry) => stepStuck(changes, entry),
    /* the planning record's per-record store (the reshape plan §3.2 A-ii, "Through Undo, in both directions"): a note or
       a day title of a squadron NOT loaded as the restore is applied goes to that squadron's stored calendar
       (state/plan-foreign.ts), which loads the records it will write before it enlists — so the note is put back as it
       was, stored and in the page's kept copy, and a refused restore rolls it back whole; the squadron loaded keeps the
       schedule's store, as before */
    storeFor: (c) => {
      if (c.collection !== 'plan') return null
      const u = split(String(c.id)).unit
      if (!u || u === UNIT) return null
      const s = storedPlan(u)
      return { store: s, join: (txn, cs) => s.join(txn, cs.map(x => split(String(x.id)).local)) }
    },
    // currentActor OMITTED — the timeline defaults to deriveActor().
  })
  /* …and the commit gate trusts a restore only where the timeline vouches for it, record by record (perms.ts) */
  setInputReplayCheck(verifiedReplay)
  /* …and asks the same moment of the restore it judges (fault E) */
  setRestoreOffAt(restoreOffAt)
  setRestoreDir(restoreDir)
  /* …and a member's restore onto a Leave War day closed for him only where it is his Undo of a closed-day step (D1263) */
  setLwRestoreCheck(verifiedWarRestore)
  /* …and Piece B's backstop reads what the restore's step recorded, as the leave-out did (perms.ts restoreGrantCtx) — its
     row as the gate sees it was stored before the restore wherever the restore had a before-image of it */
  setRestoreGrantCtx((env, c) => {
    const a = applyingRestore(env)
    return a ? grantCtx(c, a.dir, a.entry, a.changes, c.before != null) : null
  })
}
