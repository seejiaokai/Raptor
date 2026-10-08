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
import { seedAccounts } from './accounts'
import { deletedRestoreProblem } from './person-delete'
import {
  installUndo, registerUndoStore, setCutoverModules, setUndoHooks, setDescribeNames,
} from '../undo'
import { verifiedReplay } from '../undo/timeline'
import { filedForOther, setInputReplayCheck } from './perms'
import type { RecordCtx, UndoEntry } from '../undo/types'
import type { Change } from '../command'
import { weekOf, dayKeyOf } from '../undo/derive'
import { schedStore, schedPostRestore } from './sched-commit'
import { weekstashStore, loadWeek } from './store'
import { HIST } from './history'
import { armDrop, prunePreviews, SBDAY, CURPAGE, setPage, setBoardDay, focusQualsRow, requestAdminUsers, setSecDefOffer, setInpView, setInpMode, setCalMonth, INPVIEW, CALMONTH, clearInpReveal, requestInpReveal } from './view'
import { canEditSched } from './auth'
import { bringDayIntoView } from '../ui/highlights'
import { boardTab } from '../ui/board'
import { toast } from '../ui/toast'
import { CURWEEK } from '../engine/waves'
import { PEOPLE } from '../engine/people'
import { parseVerId, dayIso } from '../engine/verid'
import { lwStore, LW_COLLS, selectWar, focusDay, bumpLwHistEpoch, restoreBlocker } from '../leavewar/state/store'
import { restoreAbsencesOf } from '../leavewar/sync'
import { warVisible } from '../leavewar/absences'
import { DATES, inputCoversDate, isSansAvail } from '../engine/inputs'

/* the 8 collections schedStore owns (the scheduler week + inputs + plan). NOT
   `weekstash` — that is the separate weekstashStore's one collection, registered
   below, so an off-week undo routes through its CURWEEK-guarded write() seam. */
const SCHED_COLLS = ['days', 'sched.book', 'sched.mutes', 'sched.week', 'sched.issuance', 'sched.retraction', 'inputs', 'plan']

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
    if (ctx.weekId !== CURWEEK) { if (SBDAY != null) BOARD_WAS = SBDAY; loadWeek(ctx.weekId) }
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
   look-ahead to Inputs; a roster record to Quals, on his row; the accounts, the requests and the guest switch to Admin →
   Users; a rule to Logic; the LoX columns to Quals; the templates and the default arrangement to Admin. The stores and the
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
  const ids = entry.forward.filter(c => c.collection === 'settings').map(c => c.id)
  const day = ids.filter(k => k.startsWith('flyday:') || k.startsWith('flyrun:')).map(k => k.slice(7)).sort()[0]
  if (day) return day
  const rule: any = entry.forward.find(c => c.collection === 'settings' && c.id.startsWith('flyrule:'))
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
      const raw = pl.id.startsWith('dm:') ? pl.id.slice(3) : img && typeof img === 'object' && typeof img.date === 'string' ? img.date : pl.id
      const iso = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : ''
      then = () => { clearInpReveal(); setInpMode('member'); setInpView('cal'); if (iso) setCalMonth({ y: +iso.slice(0, 4), m: +iso.slice(5, 7) }) }
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
        if(row&&change&&CURPAGE==='inputs')requestInpReveal({...row,iid:change.id})
      }
    }
  } else if (m === 'people') {
    primary = 'quals'
    const person = fwd.find(c => c.collection === 'people')
    if (person) then = () => focusQualsRow(person.id)
  } else if (m === 'settings') {
    const ids = fwd.filter(c => c.collection === 'settings').map(c => c.id)
    if (ids.some(k => k.startsWith('account:') || k.startsWith('accessreq:') || k === 'guestview')) { primary = 'admin'; then = () => requestAdminUsers(false) }
    else if (ids.includes('rules') || ids.includes('insights')) {
      primary = 'logic'
      /* A LATE CUT-OFF IS SET BEHIND A CALENDAR'S OWN GEAR TOO (D639 — one setting, two ways in), so the Inputs page
         shows it as the Logic page does: an Undo of a cut-off pressed there leaves him there (D672), and from
         anywhere else it lands on Logic, as every rule's does. */
      const row = fwd.find(c => c.collection === 'settings' && c.id === 'rules')
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
        rows.some(c => c.id.startsWith('flyday:') && (fig(c.before, 'p') !== fig(c.after, 'p') || fig(c.before, 'w') !== fig(c.after, 'w')))
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
    if (fwd.some(c => c.collection === 'inputs' && inputRows(c).some(r => warVisible(r.type)))) also.push('leavewar')
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
  if (SBDAY != null) { if (SBDAY !== di) boardTab(di); return }
  if (boardWas != null) { setBoardDay(di); return }
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
  for (let di = 0; di < 7; di++) if (dayIso(CURWEEK, di) === iso) return { weekId: CURWEEK, di }
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

/** tests only — the landing, driven with a made-up entry */
export const _snapView = (e: UndoEntry, d: 'undo' | 'redo'): void => snapView(e, d)

export function installGlobalUndo(): void {
  installUndo()
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
    reversed: (entry, dir) => logReversed(entry as any, dir),
    reinstallLocks,
    resolvePublishDay,
    postRestore,
    /* the war's own rules on what a restore may put back — a bid over a medical filed since (W3-F8) */
    /* …and B5 (the change-recording re-test): what a roster or settings restore must re-check — one callsign on the
       roster, the accounts' guards, a man still named somewhere (state/roster-restore.ts) */
    restoreRefusal: (changes, dir) => restoreBlocker(changes as any, dir, restoreAbsencesOf(changes as any)) || rosterRestoreProblem(changes as any, dir),
    /* [POST-OUT-OUTCOMES]: a step that would put a deleted man back is passed over, never taken (person-delete.ts) */
    deadRefusal: (changes) => deletedRestoreProblem(changes as any),
    /* D148 — the refusal says who: the callsign he goes by (a rename moves nothing, so it is read live) */
    seenOverlay,
    nameOf: (a) => (a.personId != null && (PEOPLE as any)[a.personId] ? String((PEOPLE as any)[a.personId].cs) : null),
    /* the group input (plan §3.13): a member reverses his own step though it holds an input that is another man's —
       one he FILED for him. The one rule, asked of the step's recorded images (state/perms.ts filedForOther) */
    filerMay: (cur, before, after) => cur.personId != null && filedForOther(String(cur.personId), before, after),
    // currentActor OMITTED — the timeline defaults to deriveActor().
  })
  /* …and the commit gate trusts a restore only where the timeline vouches for it, record by record (perms.ts) */
  setInputReplayCheck(verifiedReplay)
}
