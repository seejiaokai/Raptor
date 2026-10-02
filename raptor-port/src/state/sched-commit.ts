/* [ARCH-STACK] Step 2 phase 2 — routing the SCHEDULER through the command gate
   (design §5.1, §8 item 2). ADDITIVE: the interim histPush/persistAll/snapshot
   undo stack are LEFT RUNNING; this only ADDS the auth gate + the record-level
   change stream around the existing write funnel.

   The scheduler's snapshot boundary already IS histSnap()/histRestore() (the
   whole-world undo snapshot). So the command layer models the scheduler as ONE
   EnlistableStore whose capture()/restore() are exactly those two primitives —
   rollback reuses the battle-tested restore rather than a second one that could
   drift — and whose records() decomposes that same world into the logical
   records the stream needs (design §3.1). Enlisting "the scheduler store" is
   therefore identical to taking the undo snapshot, and a command rollback is
   identical to an undo restore.

   Permissions at Step 2 are deliberately PERMISSIVE (anyone): the real edit gate
   (canEditSched at the write path / editMode in the UI) is UNCHANGED and still
   authoritative, so a tighter command permission here could only ADD a refusal
   the app never had and regress a legitimate write. The gate MECHANISM
   (adminOnly/ownOrAdmin, proven in command-auth.test.ts) is in place and every
   write passes through authorize(); its tightening lands with real auth at Step
   5 / stream-driven undo at Step 3. See design §3.5 "real auth at Step 5".

   Edit-log / toast latching is NOT wired here (they are engine-layer, append-
   only and order-insensitive, and a wrapped scheduler write does not roll back
   in live flow at Step 2 — the only rollbacks are the reducer-internal quarantine
   backstop, which restores itself, and a hard-invariant/guard failure that
   well-formed scheduler writes never trigger). Full effect latching lands with
   Step 3, when undo becomes stream-driven and rollback is routine. The MODEL and
   the HOOKS repaint/history effects ARE latched (below), so model atomicity holds.
*/
import type { EnlistableStore, RecordEntry, Scope, CommitResult, Command } from '../command'
import { inputGate, publishGate } from './inputgate-hook'
import {
  commit, commitProjection, definePermission, anyone, registerRecord, registerGuardedStore,
  registerEffectContext, installBaselineInvariants, cmdDeferEffect, CmdRefused,
} from '../command'
import { DAYS } from '../engine/data'
import { INPUTS, mintInpIds } from '../engine/inputs'
import { reconcileDayFiling } from '../engine/slots'
import { ensureRowIds, rowsOf } from '../engine/rowids'
import { SCHED, setDayApproved, publishALDay, unpublishDay, dayCurVer, signClear, signClearPlans } from '../engine/publish'
import { parseVerId } from '../engine/verid'
import { splitParts, canonicalBook, issuedBook, parseVerN, dayIndexOf, BOOK_BY_KEY, BOOK_BY_DAY, type WeekParts } from './weekrows'
import { mintOrd, sortByOrd } from '../command/ord'
import { reconcileIssuedMarks, setTouchedDaysResolver } from '../engine/drafts'
import { keyDay } from '../engine/keys'
import { logAction } from '../engine/editlog'
import { CURWEEK } from '../engine/waves'
import { isPreservedWeek } from '../engine/weekstash'
import { HIST, histSnap, histRestore, setSchedResync } from './history'
import { setSchedEpilogueHook, HOOKS } from '../engine/hooks'
import { issuedDisclosed, discloseIssued } from './disclosure'
import { PLANPUCKS, DAYRMK } from './plan'
import { WARNOFF, DPREV, prunePreviews } from './view'
import { canEditSched } from './auth'
import { deriveActor, isCommitting, activeEnvelope } from '../command'
import { rederive, daysNamed } from './holderbase'
import { commitAs } from '../command/commit'
import { systemActor } from '../command/actor'

/* ---- the scheduler EnlistableStore (a LAGGING BASELINE, decomposed) --------
   [ARCH-STACK] follow-up #1: copy the People pattern. The unrouted board/text/
   stores paths mutate the model IN PLACE and then reach the epilogue, so reading
   LIVE DAYS/SCHED as the before-image would show no diff. Instead records()/
   capture() decompose a lagging BASELINE snapshot string (the last-persisted
   world), advanced to the live world at each command's apply-end (applyEnd) and
   re-synced whenever the world is replaced out-of-band (setSchedResync, via
   history.ts). signature() stays LIVE (histSnap) so the whole-world guard still
   fires (SR-005) — capture()/signature() are DIFFERENT functions now, which is
   why commit.ts guardSnapshot was fixed to read signature(), not the capture
   string. Invariant between commands: SCHED_BASELINE === histSnap(). */
let SCHED_BASELINE: string | null = null
function baseline(): string { return SCHED_BASELINE ?? histSnap() }
/* re-sync the baseline to the CURRENT live world. MUST run after any out-of-band
   replacement of DAYS/SCHED/INPUTS/WARNOFF that does not go through a command:
   registered as the history.ts callback (undo/redo/quarantine/loadWeek/boot BY
   construction) and called explicitly from resetSession + the demo overlay. */
export function resyncSchedBaseline(): void { SCHED_BASELINE = histSnap() }
/* dev/test guardrail (R2-06): between commands the baseline must equal live. An
   escape site (a durable write that opened no command) leaves it dirty, so a test
   asserting this after each gesture catches a missed route loudly. The whole-world
   guard does NOT catch this (it only sees changes DURING a command). */
export function schedBaselineClean(): boolean { return baseline() === histSnap() }

/* decompose a histSnap() STRING (the baseline), the same fields history.ts
   serialises (schedFields + d/i/wo/pp/dm). Reads each input row's r.iid DIRECTLY
   — never inpId(r), which MINTS an id as a side effect of being read (SR-006), a
   write to the live world during derivation. A row with no iid yet is skipped
   (R2-07): applyEnd mints them before advancing, so a real baseline never has
   any, and a transient un-minted row must not enter the stream half-formed.

   THE RECORDS FOLLOW THE STORAGE GRAIN ([DB-READINESS] group A, phase 1 — plan §2.9; data-model.md §3): the week is
   split exactly as its stored rows are (state/weekrows.ts) — per day, the day (`days/<wk>#<di>`), its slice of the
   book (`sched.book/<wk>#<di>`: its marks, sign-offs, plans, publish state) and its muted warnings
   (`sched.mutes/<wk>#<di>`); the week's two format stamps alone (`sched.week/<wk>`); every issued version, written
   once (`sched.issuance/<wk>:<verId>~<n>` — the Original is sequence 0), and every Unpublish beside it
   (`sched.retraction/<wk>:<verId>~<n>`). So an Undo step names days, and a change on another day — another person's,
   or the app's own — never blocks it (D148). The derived record set is memoised on the snapshot string: records() runs
   at every enlist and again at the change derivation, both on the same baseline. */
let DECOMPOSED: { snap: string; wk: string; m: Map<string, RecordEntry> } | null = null
let SPLIT_WARNED = false
function decompose(snapStr: string): Map<string, RecordEntry> {
  const wk = CURWEEK
  if (DECOMPOSED && DECOMPOSED.wk === wk && DECOMPOSED.snap === snapStr) return DECOMPOSED.m
  const s = JSON.parse(snapStr)
  const m = new Map<string, RecordEntry>()
  const { i: _i, pp: _pp, dm: _dm, ...week } = s
  let parts: WeekParts | null = null
  try { parts = splitParts(week, wk) } catch (e) {
    /* a week the split cannot place (a book from an older build, loaded read-only — protectedWeek) is one opaque record:
       nothing may change it, and its stored rows are never rewritten (state/rowmap.ts skips a preserved week). A live
       week that fails here is a new field with no home in state/weekrows.ts — said once, loudly; its save fails too */
    if (!SPLIT_WARNED) { SPLIT_WARNED = true; console.warn('[sched] the loaded week does not split into rows', e) }
    /* …and a command that would LEAVE a live week in that state is refused, rolled back and said — never "saved" with
       nothing stored (the group-A final read, Fable F4, 30 Sep 26: the row writer skips a week that will not split, so
       every edit after it would have read saved and been lost on reload). A read-only (preserved) week is not asked. */
    if (isCommitting() && !isPreservedWeek(wk)) throw new CmdRefused(`this week can't be saved as rows: ${(e as Error)?.message || e}`)
  }
  if (parts) {
    parts.days.forEach((p, di) => {
      const id = `${wk}#${di}`
      m.set(`days/${id}`, { collection: 'days', id, value: p.d })
      m.set(`sched.book/${id}`, { collection: 'sched.book', id, value: canonicalBook(p.book) })
      m.set(`sched.mutes/${id}`, { collection: 'sched.mutes', id, value: p.wo })
    })
    m.set(`sched.week/${wk}`, { collection: 'sched.week', id: wk, value: { v: parts.week.v, am: parts.week.am } })
    for (const [vn, rec] of parts.is) m.set(`sched.issuance/${wk}:${vn}`, { collection: 'sched.issuance', id: `${wk}:${vn}`, value: rec })
    for (const [vn, meta] of parts.rx) m.set(`sched.retraction/${wk}:${vn}`, { collection: 'sched.retraction', id: `${wk}:${vn}`, value: meta })
  } else {
    m.set(`sched.week/${wk}`, { collection: 'sched.week', id: wk, value: { frozen: week } })
  }
  /* the requests, one record each. Their ORDER is meaningful (runInbound keeps the first value per portion; writers use
     push AND unshift) and rides each request as its own place, `ord` ([DB-READINESS] group A, phase 2 — state/ord.ts):
     a delete→restore puts the request back where it was by its ord, and a new request on top changes ONE record, never
     a list of every id (the old `inputs/__order` record, CMDLF-010, retired with it). */
  for (const r of ((s.i as any[]) || [])) {
    const id = r && r.iid
    if (!id) continue
    m.set(`inputs/${id}`, { collection: 'inputs', id, value: r })
  }
  /* the planning calendar, one record per note or pucks row (`pp:<id>`) and per day title (`dm:<iso>`) — the stored rows
     `PlanningPuck` and `DayRemark` (phase 2); a note's order is its own `ord` too */
  for (const p of ((s.pp as any[]) || [])) {
    if (!p || p.id == null) continue
    m.set(`plan/pp:${p.id}`, { collection: 'plan', id: `pp:${p.id}`, value: p })
  }
  const dm = s.dm && typeof s.dm === 'object' ? s.dm : {}
  for (const iso of Object.keys(dm)) m.set(`plan/dm:${iso}`, { collection: 'plan', id: `dm:${iso}`, value: dm[iso] })
  DECOMPOSED = { snap: snapStr, wk, m }
  return m
}
/* the loaded week's records for one command's row writer (state/rowmap.ts) — the committed world after the command,
   which is the baseline its applyEnd advanced to */
export function schedRecordsNow(): Map<string, RecordEntry> { return schedRecords() }
function schedRecords(): Map<string, RecordEntry> { return decompose(baseline()) }

/* [CMDL-FINISH] §3 — the reserved id of the retired whole-order record (CMDLF-010); a write() entry carrying it is
   ignored — the order rides each request's own `ord` since [DB-READINESS] group A, phase 2 */
const INPUT_ORDER_ID = '__order'
const inputIdOf = (r: any) => r && r.iid
const puckIdOf = (p: any) => p && p.id

/* [GLOBAL-UNDO] GU2-009 — CLONE-ON-WRITE. write() applies an undo entry's RECORDED
   inverse image; assigning that image into live state BY REFERENCE would alias the
   entry's stored `after` with the live record, so a later in-place edit would mutate
   the recorded image and corrupt a re-undo (or the history line). Deep-clone at
   every assignment site so live state and the recorded image never share an object.
   Restore is not a hot path, so the clone costs nothing that matters. */
const cw = <T>(v: T): T => (v == null ? v : JSON.parse(JSON.stringify(v)))

/* the live SCHED field behind each of a day's book-slice fields (state/weekrows.ts) */
const BOOK_FIELD: Record<string, string> = {
  c: 'changes', p: 'pending', ad: 'added', ok: 'dayOK', sg: 'sign', sb: 'signBind', cv: 'cur', dr: 'drafts', cd: 'curDraft',
  cr: 'correcting',
}
/* apply ONE DAY's decomposed `sched.book` record back onto the live book — the exact inverse of decompose()'s per-day
   slice: that day's marks (the keys naming it) replaced, that day's entry of every day-indexed map set or removed; no
   other day is touched. Clone-on-write (GU2-009). */
function applyBookDay(di: number, v: any): void {
  const b = v || {}
  for (const f of BOOK_BY_KEY) {
    const live = (SCHED[BOOK_FIELD[f]] = SCHED[BOOK_FIELD[f]] || {})
    for (const k of Object.keys(live)) if (keyDay(k) === di) delete live[k]
    Object.assign(live, cw(b[f]) || {})
  }
  for (const f of BOOK_BY_DAY) {
    const live = (SCHED[BOOK_FIELD[f]] = SCHED[BOOK_FIELD[f]] || {})
    if (Object.prototype.hasOwnProperty.call(b, f)) live[di] = cw(b[f]); else delete live[di]
  }
}
/* the day a per-day record id names (`<wk>#<di>`), refusing another week's */
function dayOfId(id: string, wk: string): number {
  const h = id.indexOf('#')
  if (h < 0 || id.slice(0, h) !== wk) throw new CmdRefused(`scheduler write: foreign week ${id}`)
  const di = Number(id.slice(h + 1))
  if (!(di >= 0 && di <= 6)) throw new CmdRefused(`scheduler write: no such day ${id}`)
  return di
}

/* [CMDL-FINISH] §3 (F8/GU-007) — the batch, delete-aware, per-collection record
   write for the undo seam. Apply EVERY record back into the live world first,
   THEN one ensureRowIds/mintInpIds + advance the baseline (applyEnd), and defer
   validate + persist (HOOKS.histPush) + notify to the transaction boundary — so
   a multi-store restore never re-validates or persists on a half-applied world.
   A FOREIGN-week write is refused for every week-scoped collection (R2-011); an
   issued record (sched.issuance) is refused unless the restore path passes
   {allowIssued:true} (C7). Called only from a reducer that already enlisted
   schedStore. */
function schedWriteRecords(entries: RecordEntry[], opts?: { allowIssued?: boolean; restore?: boolean }): void {
  const wk = CURWEEK
  let inputsTouched = false, pucksTouched = false
  /* the issuances and retractions this write touches, applied together after the loop (state/weekrows.ts issuedBook) */
  const issued: { now: { is: Map<string, any>; rx: Map<string, any> } | null } = { now: null }
  const issuedNow = () => {
    if (issued.now) return issued.now
    const p = splitParts({ d: DAYS.slice(0, 7), o: SCHED.orig, a: SCHED.als, rt: SCHED.retired }, wk)
    return (issued.now = { is: new Map(p.is), rx: new Map(p.rx) })
  }
  /* [GLOBAL-UNDO] §11/C3 — on a RESTORE, the derived per-week input landing (acc)
     must be re-reconciled against the restored day records, not trusted from the
     inverse: 'g' is week-relative, and a days-only inverse can drop or add a ground
     row without an accompanying inputs record. So on restore we (1) strip a stored
     'g' from each restored input (on the CLONE, never the recorded inverse — GU2-009),
     and (2) run reconcileDayFiling per touched day AFTER the apply — two-way, so it
     clears a dangling 'g' and re-files a row the day image restored, and NEVER pushes
     a new row (which would land another person's input outside auth/revisions). */
  const restore = !!opts?.restore
  const touchedDays = new Set<number>()
  const restoredIids = new Set<string>(), restoredPersons = new Set<string>()
  const versionOf = (id: string) => {
    const c = id.indexOf(':')
    if (c < 0 || id.slice(0, c) !== wk) throw new CmdRefused(`scheduler write: foreign week ${id}`)
    const vn = id.slice(c + 1)
    if (!parseVerN(vn)) throw new CmdRefused(`scheduler write: no version in ${id}`)
    return vn
  }
  for (const e of entries) {
    switch (e.collection) {
      case 'days': {
        const di = dayOfId(e.id, wk)
        if (e.op !== 'delete') DAYS[di] = cw(e.value)
        if (restore) touchedDays.add(di)
        break
      }
      case 'sched.book':
        applyBookDay(dayOfId(e.id, wk), e.op === 'delete' ? {} : e.value)
        break
      case 'sched.mutes': {
        const di = dayOfId(e.id, wk)
        for (const k of [...WARNOFF]) if (String(k).split('|')[0] === String(di)) WARNOFF.delete(k)
        if (e.op !== 'delete') ((e.value as any[]) || []).forEach(k => WARNOFF.add(k))
        break
      }
      case 'sched.week': {
        if (e.id !== wk) throw new CmdRefused(`scheduler write: foreign week ${e.id}`)
        const v: any = e.value || {}
        if (e.op !== 'delete' && !v.frozen) { SCHED.ridV = v.v; SCHED.amV = v.am }
        break
      }
      case 'sched.issuance': {
        const vn = versionOf(e.id)
        if (!opts?.allowIssued) throw new CmdRefused(`scheduler write: issued record ${e.id} needs allowIssued`)
        const m = issuedNow().is
        if (e.op === 'delete') m.delete(vn); else m.set(vn, cw(e.value))
        break
      }
      case 'sched.retraction': {
        // [GLOBAL-UNDO] §6.1 — an Unpublish is append-only-INTENDED, so no allowIssued gate: an undo of an UNLOGGED
        // unpublish removes the retraction it added (op:'delete'); a LOGGED (disseminated) one is NEVER removed by an
        // inverse (§6.2 GU4-003 / Codex GU-P2-001) — the audit line survives.
        const vn = versionOf(e.id)
        const m = issuedNow().rx
        if (e.op === 'delete') { if (!(m.get(vn) as any)?.logged) m.delete(vn) }
        else m.set(vn, cw(e.value))
        break
      }
      case 'inputs': {
        if (e.id === INPUT_ORDER_ID) break
        inputsTouched = true
        const ix = INPUTS.findIndex((r: any) => r.iid === e.id)
        if (restore) {
          restoredIids.add(e.id)
          if (ix >= 0 && INPUTS[ix]?.person) restoredPersons.add(String(INPUTS[ix].person))
          if (e.op !== 'delete' && (e.value as any)?.person) restoredPersons.add(String((e.value as any).person))
        }
        if (e.op === 'delete') { if (ix >= 0) INPUTS.splice(ix, 1) }
        else {
          const v = cw(e.value) as any
          // strip the DERIVED 'g' landing on a restore; reconcileDayFiling re-derives it
          if (restore && v && v.acc === 'g') delete v.acc
          if (ix >= 0) INPUTS[ix] = v; else INPUTS.push(v)
        }
        break
      }
      case 'plan': {
        /* a note or pucks row (`pp:<id>`) or a day title (`dm:<iso>`) — one record each since phase 2 */
        const v = cw(e.value) as any   // [GLOBAL-UNDO] GU2-009 — clone-on-write
        if (e.id.startsWith('dm:')) {
          const iso = e.id.slice(3)
          if (e.op === 'delete' || v == null) delete DAYRMK[iso]; else DAYRMK[iso] = v
        } else if (e.id.startsWith('pp:')) {
          const id = e.id.slice(3), ix = PLANPUCKS.findIndex((x: any) => x && String(x.id) === id)
          pucksTouched = true
          if (e.op === 'delete') { if (ix >= 0) PLANPUCKS.splice(ix, 1) }
          else if (ix >= 0) PLANPUCKS[ix] = v; else PLANPUCKS.push(v)
        } else throw new CmdRefused(`scheduler write: no planning record ${e.id}`)
        break
      }
      default:
        throw new CmdRefused(`scheduler write: unexpected collection ${e.collection}`)
    }
  }
  /* a restored request or note goes back to its place — its own ord (state/ord.ts) */
  if (inputsTouched) sortByOrd(INPUTS, inputIdOf)
  if (pucksTouched) sortByOrd(PLANPUCKS, puckIdOf)
  if (issued.now) {
    /* the book's Originals, live amendments and retired log, rebuilt from the issuances and retractions as they now
       stand — the same join the saved week's reader runs, so the two cannot disagree (amendments in day / sequence
       order, the order every reader sorts them in) */
    const { o, a, rt } = issuedBook([...issued.now.is], issued.now.rx, wk)
    SCHED.orig = o; SCHED.als = a; SCHED.retired = rt
  }
  /* [GLOBAL-UNDO] §11/C3 — reland BEFORE applyEnd so the re-derived landings are in
     the baseline snapshot and the emitted envelope (never a stale envelope the next
     forward edit would absorb). Two-way, per touched day; never auto-lands a row. */
  if (restore) for (const di of touchedDays) reconcileDayFiling(di)
  /* [ARCH-STACK] step 4 (clash check B7) — an undo / redo obeys the same absence
     rules as every other door: a restore that would put two leaves on the same
     time, or leave over a medical, is refused with the blocker named */
  if (restore && restoredIids.size) inputGate()?.vetRestore(restoredIids, restoredPersons)
  applyEnd()   // one ensureRowIds/mintInpIds + advance SCHED_BASELINE
  // HOOKS.reflow = validate() + notify(); HOOKS.histPush persists — both released
  // at the transaction boundary (never on a half-applied multi-store world).
  cmdDeferEffect(() => { HOOKS.reflow(); HOOKS.histPush() })
}

/* [GLOBAL-UNDO] §6.2/C5 — the scheduler's postRestore adjustment (wired via
   setUndoHooks). Undo of a PUBLISH boundary is an unpublish: the plain inverse
   restored the pre-publish SIGNED book, but a pulled-back published day must
   re-sign on republish (GU5-005), so clear the sign-offs LAST (after the book
   put). Redo re-publishes via the forward image, whose book already carries the
   cleared signs (setDayApproved signClears at publish) — so redo needs nothing.
   The disclosed audit-line append is Step-5 (nothing is disseminated at Step 3);
   the FORWARD unpublish button already writes it (retireIssued), and a logged
   line is protected append-only in schedWriteRecords above. */
function publishDayOf(entry: any): number | null {
  for (const ch of (entry.forward || [])) {
    if (ch.collection !== 'sched.issuance') continue
    const vn = parseVerN(ch.id.slice(ch.id.indexOf(':') + 1))
    const di = vn ? dayIndexOf(CURWEEK, parseVerId(vn.ver).iso) : -1
    if (di >= 0) return di
  }
  return null
}
export function schedPostRestore(entry: any, dir: 'undo' | 'redo', pulledBack: Array<{ weekId: string; di: number }> = []): void {
  const clear = new Set<number>()
  if (dir === 'undo' && entry?.boundary?.kind === 'publish') {
    const di = publishDayOf(entry)
    if (di != null) clear.add(di)
  }
  /* [HUMAN-RETEST] walk W3 F-w3-1 (24 Sep 26) — a restore of an OLDER step writes that step's image
     of the whole week's sign-off record, which still carries the sign-offs a later publish spent.
     Undoing a publish cleared them once, here; the very next Undo ("a sign-off", even on another
     day) wrote them all back, and "Publish day" then worked with nobody re-signing. So every day
     whose later publication has been pulled back (the timeline hands them over) is cleared again —
     only for a day whose sign-off record this restore wrote — the sign-offs are one record per day now ([DB-READINESS]
     group A, phase 1), so a restore that never wrote that day's cannot have handed its spent sign-offs back. */
  const wroteBook = new Set<string>((entry?.forward || []).filter((ch: any) => ch.collection === 'sched.book').map((ch: any) => String(ch.id)))
  for (const d of pulledBack) if (d.weekId === CURWEEK && wroteBook.has(`${CURWEEK}#${d.di}`)) clear.add(d.di)
  if (!clear.size) return
  // every plan of the day re-signs, the parked ones too — the same as the Unpublish button (AM34, AM32)
  for (const di of clear) { signClear(di); signClearPlans(di) }
  /* [GLOBAL-UNDO] Fable#1 / Codex GU-P2-004 — signClear runs AFTER schedWriteRecords'
     applyEnd() already advanced SCHED_BASELINE, so without this the lagging baseline
     stays SIGNED while live is cleared. The restore envelope still captures the clear
     (its diff reads LIVE at finalize), but the NEXT unrelated scheduler edit would
     diff against the stale signed baseline and ABSORB the sign-clear into its own
     entry — and undoing that edit would silently re-sign the pulled-back day. Advance
     the baseline to the sign-cleared live state so the next edit derives cleanly. */
  resyncSchedBaseline()
}

export const schedStore: EnlistableStore = {
  key: 'scheduler',
  capture: () => baseline(),                          // the before-image + rollback source (lagging)
  restore: (snap) => { histRestore(snap as string) }, // histRestore re-syncs the baseline itself
  records: schedRecords,
  signature: () => histSnap(),                        // LIVE — keeps the whole-world guard (SR-005)
  write: schedWriteRecords,
}

/* the ONE shared apply-end: mint the ids histPush would mint in phase 8 (but it
   is LATCHED until then, AFTER the baseline would advance — SR-006), then advance
   the baseline to the new live world. Folded into BOTH commitSched and
   commitPublish (SR-001), and idempotent so a nested child-join re-running it is
   harmless. materializeSigns is GONE — the sign readers are non-mutating now. */
function applyEnd(): void {
  keepIdsOnTheirDays()
  ensureRowIds(DAYS)
  mintInpIds()   // the requests' ids AND their places in the list (engine/inputs.ts — phase 2)
  /* the planning notes' places, one `ord` per row, minted beside their ids ([DB-READINESS] group A, phase 2 — plan
     §2.3): only a row with none, or one a writer moved, takes a new one */
  mintOrd(PLANPUCKS, puckIdOf)
  SCHED_BASELINE = histSnap()
  afterCommandPass()
}

/* THE WEEK ON SCREEN, WORKED OUT AFTER EVERY COMMAND THAT ENLISTED THE SCHEDULER ([DB-READINESS] group A, phase 6 (c) v3 —
   plan §3 (c) §5; state/holderbase.ts). A command changes, inside itself, only what it means to change — a request, a
   person, a day its holder edits — and all of that is saved as always. What it does to the week on screen (a request's
   row made, re-made or taken away; a deleted man taken off) is worked out AFTER it, at phase 8, from the holder base: so it
   is shown at once, it is nobody's change (the baseline moves on with it, so no command records or saves it), and a
   refused command — rolled back before phase 8 — moves nothing. Registered ONCE per command (a nested command joins its
   outer one's envelope), and it reads that envelope's changes: the days whose rows the command wrote are the ones whose
   base moves (the row writer's own rule). The delete's own after-command overlay folded into it (person-delete.ts). */
let PASS_FOR: unknown = null
function afterCommandPass(): void {
  if (!isCommitting()) return
  const env = activeEnvelope()
  if (!env || PASS_FOR === env) return
  PASS_FOR = env
  cmdDeferEffect(() => {
    if (PASS_FOR === env) PASS_FOR = null
    const changed = rederive({ absorb: daysNamed(env.changes), live: true })
    /* the baseline ALWAYS follows the pass — it may have changed the book (a deleted man's sign-off, his seat in a parked
       plan) with no day moving, and a stale baseline would charge that change to whoever's command came next, whose
       Undo would then be refused (the FULL check, Fable's final read F2; the delete's own effect resynced unconditionally
       before (c)). The checks and the repaint follow what the pass put on screen (Fable F4). */
    resyncSchedBaseline()
    if (changed) HOOKS.reflow()
  })
}

/* [DB-READINESS] group A, phase 1.3 (plan §3, R2-07) — a day is one saved row, so the command's own housekeeping must not
   change a day it was not asked to. Two writers did:
   - ensureRowIds re-mints the SECOND of two rows sharing an id, week-wide, first seen first — so a copy landing on
     Monday of a row that stands on Thursday re-keyed Thursday's. The day that already held the id (the command's
     before-image) keeps it; the copy on the other day is cleared here and minted fresh by ensureRowIds. No production
     path is known to copy an id across days (a copy strips ids — engine/rowids.ts stripRowIds); this keeps it so.
   - reconcileIssuedMarks swept every published day; it now takes the days the command touched (below). */
const idsOf = (d: any): string[] => {
  const out: string[] = []
  for (const r of rowsOf(d || {})) if (r && typeof r === 'object' && typeof r.rid === 'string' && r.rid) out.push(r.rid)
  for (const n of (d && Array.isArray(d.notes) ? d.notes : [])) if (n && typeof n === 'object' && typeof n.rid === 'string' && n.rid) out.push(n.rid)
  return out
}
function keepIdsOnTheirDays(): void {
  const where = new Map<string, Set<number>>()
  DAYS.forEach((d: any, di: number) => { for (const id of idsOf(d)) { let s = where.get(id); if (!s) where.set(id, s = new Set()); s.add(di) } })
  let before: Map<string, RecordEntry> | null = null
  for (const [id, days] of where) {
    if (days.size < 2) continue
    before ??= schedRecords()
    const keeper = [...days].find(di => idsOf(before!.get(`days/${CURWEEK}#${di}`)?.value).includes(id))
    if (keeper == null) continue                                  // no day held it before: the first-seen rule stands
    for (const di of days) {
      if (di === keeper) continue
      const d: any = DAYS[di]
      for (const r of rowsOf(d || {})) if (r && r.rid === id) delete r.rid
      for (const n of (d && Array.isArray(d.notes) ? d.notes : [])) if (n && n.rid === id) delete n.rid
    }
  }
}
/* the days whose content this command changed so far — the loaded week's live days against the command's before-image
   (the baseline, not yet advanced). null outside a command: every published day, as before. */
function touchedDays(): number[] | null {
  if (!isCommitting()) return null
  const before = schedRecords()
  const out: number[] = []
  for (let di = 0; di < DAYS.length; di++) {
    const was = before.get(`days/${CURWEEK}#${di}`)?.value
    if (was === undefined || JSON.stringify(was) !== JSON.stringify(DAYS[di])) out.push(di)
  }
  return out
}
/* the same apply-end for a command that enlists the scheduler store beside others (state/person-delete.ts) */
export const schedApplyEnd = () => applyEnd()

/* ---- command types + the commit helper ----------------------------------- */
export const SCHED_TYPES = {
  slot: 'sched.slot',
  fill: 'sched.fill',
  text: 'sched.text',
  delete: 'sched.delete',
  sectionMove: 'sched.section.move',
  sectionReorder: 'sched.section.reorder',
  inputsWrite: 'inputs.write',
  inputsBatch: 'inputs.batch',
  // phase 2b — the publish path (design §3.4)
  approve: 'sched.approve',
  publishAL: 'sched.publishAL',
  // [GLOBAL-UNDO] §6.5 — retract a published day to a working copy (the Unpublish button)
  unpublish: 'sched.unpublish',
  // follow-up #1 — the previously-unrouted paths (rows A–G). Auto-registered by
  // the definePermission loop below. `mutate` is the afterSchedMutate backstop.
  mutate: 'sched.mutate',
  stores: 'sched.stores',
  sign: 'sched.sign',
  signClear: 'sched.signClear',
  warnMute: 'sched.warnMute',
  /* [OIL-SEATS-CAN-EARN] step 11 / [OIL-UNDO-WORDS]. An OIL decision rode the
     `mutate` backstop, so undo called it "a change to the schedule" — inside a
     mode that exists precisely because the schedule must NOT move while OIL is
     being decided. Its own type is what lets the undo bubble name it. */
  oil: 'sched.oil',
  draftRename: 'sched.draft.rename',
  draftDelete: 'sched.draft.delete',
  /* RETIRED ([DB-READINESS] group A, phase 6 (c), 1 Oct 26): a week load's landing — worked out by the load itself now, no
     command (state/store.ts workOutLoadedWeek). Kept declared: nothing raises it. */
  load: 'sched.load',
} as const

const schedScope = (): Scope => ({ module: 'sched', weekId: CURWEEK })
const inputsScope = (): Scope => ({ module: 'inputs' })

/* run a scheduler mutation `fn` inside a command: enlist the scheduler store
   (snapshot), run the existing in-place write (its HOOKS effects latch and
   release in phase 8), derive the record-level changes, emit. `fn` may return a
   value (writeInputs returns a boolean) which is captured and returned. */
/* `meta` — a fact the command carries to the change stream, never to the gate's decision: `{ key }` names the text box a
   `sched.text` wrote ([AMEND-SMALL-SEEN] item 2 — the change-recording plan B8, §11.7), so Undo's bubble, hover and
   history line can say "a take-off time", never "a note on the schedule". A fact, never a label string (design §8.2). */
function commitSched<T>(type: string, scope: Scope, fn: () => T, meta?: any): { result: CommitResult; value: T } {
  let value!: T
  const cmd: Command = { type, scope, meta, apply: (txn) => { txn.enlist(schedStore); value = fn(); applyEnd() } }
  const result = commit(cmd)
  return { result, value }
}
export function commitSchedVoid(type: string, fn: () => void, meta?: any): CommitResult {
  return commitSched(type, schedScope(), fn, meta).result
}
export function commitInputs<T>(type: string, fn: () => T): T {
  return commitSched(type, inputsScope(), fn).value
}
/* [CMDL-FINISH] §2.2 — the PROJECTION sibling of commitInputs: the LW-originated
   reconciler (historically runOutbound, deleted in [ARCH-STACK] step 4) writes Raptor inputs as a causally-chained
   projection, not a user edit. Raised at phase 8 (woken by the LW edit's deferred
   notify) it ENQUEUEs with the edit's seq as its cause; raised at idle (inside
   lwSyncTurn) it runs as a top-level projection. Same enlist + applyEnd body. */
export function commitInputsProjection<T>(type: string, fn: () => T): T {
  let value!: T
  const cmd: Command = { type, scope: inputsScope(), apply: (txn) => { txn.enlist(schedStore); value = fn(); applyEnd() } }
  commitProjection(cmd)
  return value
}
/* [CMDL-FINISH] §6 — an input batch that also enlists EXTRA stores (the off-week
   weekstash), so a reducer throw (a protected-week refusal) rolls back the whole
   set atomically. Returns the CommitResult so the wrapper can map a refusal (a
   CmdRefused → ok:false) to false, rather than reading a value the throw skipped. */
export function commitInputsWith(stores: EnlistableStore[], type: string, fn: () => void): CommitResult {
  const cmd: Command = {
    type, scope: inputsScope(),
    apply: (txn) => {
      // [CMDL-FINISH] §6 — resync the baseline to LIVE before enlisting, so the
      // captured rollback snapshot reflects any out-of-band (bare) INPUTS write
      // that reached the model before this command (the quarantine funnel's whole
      // reason to exist). A no-op in the normal case (baseline === live between
      // commands); it makes a protected-week refusal's phase-6 rollback restore the
      // true pre-batch state instead of a stale baseline that drops the bare row.
      resyncSchedBaseline()
      txn.enlist(schedStore); for (const s of stores) txn.enlist(s); fn(); applyEnd()
    },
  }
  return commit(cmd)
}
export function commitSchedValue<T>(type: string, fn: () => T, meta?: any): T {
  return commitSched(type, schedScope(), fn, meta).value
}

/* THE WEEK LOAD'S OWN COMMAND (commitSchedLoad, `sched.load`) is gone ([DB-READINESS] group A, phase 6 (c), 1 Oct 26): the load
   works its week out of band (state/store.ts workOutLoadedWeek) and paints nothing, so there is nothing to latch; the type
   stays declared (its permission and the row writer's skip) for a stream that may still carry one from an older session. */

/* the seam for the previously-unrouted paths. schedWrite is JUST commitSchedVoid
   — no isInReducer branch (R2-03): dispatch already child-joins a reducer-time
   commit (enlisting schedStore into the parent) and enqueues a post-phase one, so
   a raw branch that skipped enlist would trip the whole-world guard when the
   parent is a NON-scheduler command. schedWriteValue captures the return value
   the toasts read (a draft rename/delete label, toggleWarnOff's bool — R2-11). */
/* a rejected command (a conflict/guard rollback) reverted the model while the
   caller's own notify/toast may already have fired — so surface it (design §6
   risk 6). Inert at Step 2 (no conflict checker in production; a well-formed
   scheduler write never rolls back), so the toast never fires today; it is the
   Step-3 safety net. Only an explicit ok:false is a failure (a queued post-phase
   result carries no ok and is left alone). */
function toastFail(r: CommitResult): boolean {
  if ((r as any).ok === false) { HOOKS.toast("Couldn’t save that — try again", 'warn'); return true }
  return false
}
export function schedWrite(type: string, fn: () => void, meta?: any): void { toastFail(commitSchedVoid(type, fn, meta)) }
/* `meta` — as schedWrite's: a fact the command carries to the change stream (a hide carries which warning, in words —
   [WARN-HIDE-KEPT]) */
export function schedWriteValue<T>(type: string, fn: () => T, meta?: any): T {
  const { result, value } = commitSched(type, schedScope(), fn, meta)
  // on a rollback the captured value is stale — return a falsy default so a
  // rename/mute that was reverted does not report success (F-04)
  return toastFail(result) ? (undefined as any) : value
}

/* ---- phase 2b: the PUBLISH path (design §3.4) ---------------------------- */
/* the set of issued verIds currently on the loaded week's book — orig[di].id +
   every als[n].id. The Step-5 database adapter reports these ids as ON THE RECORD
   once the backend acknowledges their write (state/disclosure.ts). */
function issuedIdSet(): Set<string> {
  const s = new Set<string>()
  const orig: any = SCHED.orig || {}
  for (const di of Object.keys(orig)) { const id = orig[di] && orig[di].id; if (id) s.add(String(id)) }
  for (const a of ((SCHED.als as any[]) || [])) { if (a && a.id) s.add(String(a.id)) }
  return s
}
/* the loaded week's issued verIds — what a disclosing path (export/print/session
   -end) reports to the disclosure registry (design §3.4). */
export function currentIssuedIds(): string[] {
  return [...issuedIdSet()]
}

/* report the loaded week's issued versions as ON THE SHARED RECORD.
   OWNER RULING 17 Sep 26: the ONLY caller of this is the Step-5 database adapter,
   on a write the backend has acknowledged. Exports, printing and the session
   ending are NOT boundary events and no longer call it (state/disclosure.ts names
   the superseded rule). Unwired at Step 2: with no shared database, nothing can be
   registered, so every issued version stays freely reversible. */
export function discloseCurrentIssued(): void {
  discloseIssued(currentIssuedIds())
}

/* run a publish writer `fn` inside a command: enlist the scheduler store, run the
   existing in-place publish (its histPush/notify latch + release in phase 8 as
   today; toast stays inline), then — if the write actually MINTED a new issued
   version — declare the publish boundary carrying the new ids (design §3.4). A
   refused/no-op publish mints nothing, so no boundary is declared and (with no
   record change) the commit emits nothing. `crossable` is true while none of the
   new ids is on the shared record yet — which at Step 2 is always, there being no
   shared database. Step 3 reads it to choose silent-reverse vs on-the-record undo. */
function commitPublish(type: string, fn: () => void, di: number): CommitResult {
  const cmd: Command = {
    type, scope: schedScope(),
    apply: (txn) => {
      txn.enlist(schedStore)
      const before = issuedIdSet()
      /* ONE PRESS, ONE MESSAGE ([AMEND-SMALL-SEEN] 1, 28 Sep 26): the publish says what it published ("Published AL1 · 14
         items on Sat only") and the OIL check below may speak in the same breath ("…the SXO desk has no usable times, so
         nobody on it earns OIL"); the toast is one element whose text is replaced, so only the second was ever seen.
         Both are said together, in one line (HOOKS.toastBatch — this command is its only user). */
      HOOKS.toastBatch(() => {
        fn()
        const added: string[] = []
        for (const id of issuedIdSet()) if (!before.has(id)) added.push(id)
        if (added.length) {
          txn.boundary({ kind: 'publish', ids: added, crossable: !added.some(issuedDisclosed) })
          /* [ARCH-STACK] step 4 (B5) — weekend / PH work meets a clashing leave bid here: since the
             owner's 20–21 Sep 26 answer ("keep the bid and flag the day, both ways") the gate KEEPS the
             bid and flags the day (leavewar/sync.ts publishFlagsBids; register AM48c) — it no longer
             replaces it. (Comment corrected by the amendment re-test, 24 Sep 26.) */
          publishGate()?.(di)
        }
      })
      applyEnd()   // SR-001: commitPublish builds its OWN Command, so it needs the shared advance too
    },
  }
  return commit(cmd)
}

/* first-publish a day (stamps its frozen Original — a sched.issuance record, sequence 0, + the
   publish boundary). Routed additively: the engine setDayApproved runs unchanged
   inside the command. */
export function commitSetDayApproved(di: number, on: any): CommitResult {
  return commitPublish(SCHED_TYPES.approve, () => setDayApproved(di, on), di)
}

/* publish one day's changes as its next per-day AL (a new sched.issuance record +
   the publish boundary). */
export function commitPublishALDay(di: number): CommitResult {
  /* the issue step freezes EVERY dotted mark on the day as "changed at ALn" (alIssue), while its
     item count comes from the real difference — so a mark left on a detail that is back at the
     issued value went into the published record as a change AL1 never made ([HUMAN-RETEST] walk
     W1-1, 24 Sep 26; AM20, AM19). Drop such marks first, whatever path left them: the reconcile
     only ever REMOVES a mark whose detail equals the issued version, so it cannot hide a change. */
  return commitPublish(SCHED_TYPES.publishAL, () => { reconcileIssuedMarks([+di]); publishALDay(di) }, di)
}

/* [GLOBAL-UNDO] §6.5 — retract the latest issued version of a published day back
   to a working copy. Declares an `unpublish` boundary carrying the retracted id
   (the publication barrier §6.3 reads it). Scheduler/admin only, and refused while
   the day is previewing an older version (DPREV). Defers reflow + prunePreviews +
   persistence to the transaction boundary, like the write() seam. */
export function commitUnpublish(di: number): CommitResult {
  const cmd: Command = {
    type: SCHED_TYPES.unpublish, scope: schedScope(),
    apply: (txn) => {
      txn.enlist(schedStore)
      if (!canEditSched() || DPREV.has(+di)) throw new CmdRefused(`unpublish: not permitted for day ${di}`)
      const id0 = dayCurVer(di)
      const disclosed = id0 != null && issuedDisclosed(id0)
      const actor = deriveActor()
      const id = unpublishDay(di, { by: actor.personId ?? actor.id, disclosed })
      if (!id) throw new CmdRefused(`unpublish: day ${di} has no retractable latest version`)
      /* the marks re-opened from the retracted AL are re-checked against the version that is
         current NOW (AM20 — a mark means "differs from what was issued"): a change already
         put back to that version's value must not come back as a dotted mark while the head,
         the sign line and the panel say otherwise ([HUMAN-RETEST] walk S1, Fable 5-3, 24 Sep
         26). The same reconcile every edit runs, inside this one command, so it undoes with it. */
      reconcileIssuedMarks([+di])
      txn.boundary({ kind: 'unpublish', ids: [id], crossable: !disclosed })
      applyEnd()
      cmdDeferEffect(() => { prunePreviews(); HOOKS.reflow(); HOOKS.histPush() })
    },
  }
  return commit(cmd)
}

/* ---- one-time registration (called from initStore) ----------------------- */
let registered = false
export function registerSchedCommandLayer(): void {
  if (registered) return
  registered = true
  installBaselineInvariants()
  SCHED_BASELINE = histSnap()   // the seed/hydrated world is the first baseline (mirrors People)
  // the re-sync callback fires from history.ts histInit/histRestore, covering
  // undo/redo/quarantine/loadWeek/boot by construction (R2-07: registered at
  // module-eval via wireStore, so a loadWeek/histInit without initStore is covered)
  setSchedResync(resyncSchedBaseline)
  // the afterSchedMutate BACKSTOP (rows A/A2/B): when the board epilogue runs
  // OUTSIDE a command, wrap it so the preceding in-place mutation is captured.
  // ALWAYS commitSchedVoid — never a raw branch (SR-I-001/F-03, the same reason
  // schedWrite drops it): dispatch child-joins a reducer-time call (enlisting
  // schedStore into the parent, even a NON-scheduler one, so the guard is not
  // tripped) and ENQUEUES a post-phase one (isCommitting() is true in phase 8/9
  // too, so a raw branch there would apply + advance the baseline while emitting
  // nothing). No current caller reaches those cases, but the safe form costs
  // nothing and removes the trap.
  setSchedEpilogueHook((raw) => { toastFail(commitSchedVoid(SCHED_TYPES.mutate, raw)) })
  /* an edit's sweep of stale "changed" marks reaches only the days the command changed ([DB-READINESS] group A, 1.3) */
  setTouchedDaysResolver(touchedDays)
  // permissive gate at Step 2 (see the file header) — the real gate is unchanged
  for (const t of Object.values(SCHED_TYPES)) definePermission(t, anyone)
  registerGuardedStore(schedStore)
  // the suppression-context token: a deferred histPush must see HIST.lock as it
  // was when the effect was raised, so a lock-wrapped forward batch records
  // exactly as today (Codex R4-001 / Fable R4-2).
  registerEffectContext({
    key: 'HIST.lock',
    capture: () => HIST.lock,
    install: (snap) => { const prev = HIST.lock; HIST.lock = snap as boolean; return () => { HIST.lock = prev } },
  })
  // the derived registry entries for the scheduler's logical records (§3.1)
  // [DB-READINESS] group A, phase 1 — the records follow the stored rows (state/weekrows.ts)
  registerRecord({ key: 'weeks:<wk>#<di>', cls: 'record', collection: 'days', module: 'scheduler' })
  registerRecord({ key: 'weeks:sched.book/<wk>#<di>', cls: 'record', collection: 'sched.book', module: 'scheduler' })
  registerRecord({ key: 'weeks:sched.mutes/<wk>#<di>', cls: 'record', collection: 'sched.mutes', module: 'scheduler' })
  registerRecord({ key: 'weeks:sched.week/<wk>', cls: 'record', collection: 'sched.week', module: 'scheduler' })
  registerRecord({ key: 'weeks:sched.issuance/<wk>:<verId>~<n>', cls: 'record', collection: 'sched.issuance', module: 'scheduler' })
  registerRecord({ key: 'weeks:sched.retraction/<wk>:<verId>~<n>', cls: 'record', collection: 'sched.retraction', module: 'scheduler' })
  registerRecord({ key: 'inputs:<iid>', cls: 'record', collection: 'inputs', module: 'inputs' })
  // [DB-READINESS] group A, phase 2 — the planning calendar one record per note / pucks row and per day title
  registerRecord({ key: 'plan:pp:<id>', cls: 'record', collection: 'plan', module: 'plan' })
  registerRecord({ key: 'plan:dm:<iso>', cls: 'record', collection: 'plan', module: 'plan' })
}
