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
import { ensureRowIds } from '../engine/rowids'
import { SCHED, setDayApproved, publishALDay, discardPending, unpublishDay, dayCurVer, signClear } from '../engine/publish'
import { CURWEEK } from '../engine/waves'
import { HIST, histSnap, histRestore, setSchedResync } from './history'
import { setSchedEpilogueHook, HOOKS } from '../engine/hooks'
import { issuedDisclosed, discloseIssued } from './disclosure'
import { PLANPUCKS, DAYRMK } from './plan'
import { WARNOFF, DPREV, prunePreviews } from './view'
import { canEditSched } from './auth'
import { deriveActor } from '../command'

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
   any, and a transient un-minted row must not enter the stream half-formed. */
function decompose(snapStr: string): Map<string, RecordEntry> {
  const s = JSON.parse(snapStr)
  const m = new Map<string, RecordEntry>()
  const wk = CURWEEK
  const days = s.d || []
  for (let di = 0; di < days.length; di++) {
    const id = `${wk}#${di}`
    m.set(`days/${id}`, { collection: 'days', id, value: days[di] })
  }
  // the mutable book (excludes the issued orig/als/retired, which are their own
  // records). [GLOBAL-UNDO] §6.1 — `cr` (the per-day correction flags) rides the
  // book like curDraft; `retired` is a separate append-only collection below.
  const book = {
    c: s.c, p: s.p, ad: s.ad, al: s.al, ok: s.ok,
    sg: s.sg, sb: s.sb, cv: s.cv, dr: s.dr, cd: s.cd, v: s.v, am: s.am, cr: s.cr,
  }
  m.set(`sched.book/${wk}`, { collection: 'sched.book', id: wk, value: book })
  m.set(`sched.mutes/${wk}`, { collection: 'sched.mutes', id: wk, value: (s.wo || []) })
  const orig = s.o || {}
  for (const di of Object.keys(orig)) {
    const id = `${wk}:${di}`
    m.set(`sched.orig/${id}`, { collection: 'sched.orig', id, value: orig[di] })
  }
  // [CMDL-FINISH] §5/C14 — key each AL by its STABLE verId (al.id = verId(iso,seq)),
  // NOT its array index, so a delete or reorder never renumbers another AL's stored
  // key (the same rid-anchoring the rest of the book uses). A pre-verId legacy book
  // has no al.id, so it falls back to the index (avoids a `:undefined` collision).
  const als = (s.a as any[]) || []
  for (let n = 0; n < als.length; n++) {
    const al = als[n]
    const id = `${wk}:${(al && al.id) ?? n}`
    m.set(`sched.als/${id}`, { collection: 'sched.als', id, value: al })
  }
  // [GLOBAL-UNDO] §6.1 — the append-only retired-issuance log, one record per
  // `<verId>~<n>` entry, so a same-label reissue keeps every prior issuance as its
  // own immutable, individually-addressable snapshot.
  const retired = (s.rt as any) || {}
  for (const idn of Object.keys(retired)) {
    const id = `${wk}:${idn}`
    m.set(`sched.retired/${id}`, { collection: 'sched.retired', id, value: retired[idn] })
  }
  const inpOrder: string[] = []
  for (const r of ((s.i as any[]) || [])) {
    const id = r && r.iid
    if (!id) continue
    m.set(`inputs/${id}`, { collection: 'inputs', id, value: r })
    inpOrder.push(id)
  }
  /* [CMDL-FINISH] CMDLF-010 — emit the INPUTS order EXPLICITLY. INPUTS order is
     meaningful (runInbound keeps the first value per portion; writers use push AND
     unshift), so a delete→restore that pushed the row back at the end would change
     which leave code wins. With the order in the record set, a reorder is a
     recorded change and the position round-trips; write() consumes this reserved
     id to re-sort (below). */
  m.set(`inputs/${INPUT_ORDER_ID}`, { collection: 'inputs', id: INPUT_ORDER_ID, value: inpOrder })
  m.set('plan/all', { collection: 'plan', id: 'all', value: { pp: s.pp || [], dm: s.dm || {} } })
  return m
}
function schedRecords(): Map<string, RecordEntry> { return decompose(baseline()) }

/* [CMDL-FINISH] §3 — a write() entry with this reserved id (collection 'inputs')
   reorders INPUTS to the carried iid[] sequence (C11/CMDLF-010/011). records() now
   EMITS it (CMDLF-010), so an order change is a recorded change and a delete→restore
   round-trips the position rather than pushing the row to the end. */
const INPUT_ORDER_ID = '__order'

/* [GLOBAL-UNDO] GU2-009 — CLONE-ON-WRITE. write() applies an undo entry's RECORDED
   inverse image; assigning that image into live state BY REFERENCE would alias the
   entry's stored `after` with the live record, so a later in-place edit would mutate
   the recorded image and corrupt a re-undo (or the history line). Deep-clone at
   every assignment site so live state and the recorded image never share an object.
   Restore is not a hot path, so the clone costs nothing that matters. */
const cw = <T>(v: T): T => (v == null ? v : JSON.parse(JSON.stringify(v)))

/* apply a decomposed `sched.book` record value back onto the live SCHED book —
   the exact inverse of decompose()'s book projection (schedFields minus o/a,
   which are their own records). Clone-on-write (GU2-009). */
function applyBook(v: any): void {
  SCHED.changes = cw(v.c) || {}; SCHED.pending = cw(v.p) || {}; SCHED.added = cw(v.ad) || {}
  SCHED.al = v.al || 0; SCHED.dayOK = cw(v.ok) || {}
  SCHED.sign = cw(v.sg) || {}; SCHED.signBind = cw(v.sb) || {}
  SCHED.cur = cw(v.cv) || {}; SCHED.drafts = cw(v.dr) || {}; SCHED.curDraft = cw(v.cd) || {}
  SCHED.ridV = v.v; SCHED.amV = v.am
  SCHED.correcting = cw(v.cr) || {}   // [GLOBAL-UNDO] §6.1 — the correction flags ride the book record
}

/* [CMDL-FINISH] §3 (F8/GU-007) — the batch, delete-aware, per-collection record
   write for the undo seam. Apply EVERY record back into the live world first,
   THEN one ensureRowIds/mintInpIds + advance the baseline (applyEnd), and defer
   validate + persist (HOOKS.histPush) + notify to the transaction boundary — so
   a multi-store restore never re-validates or persists on a half-applied world.
   A FOREIGN-week write is refused for every week-scoped collection (R2-011); an
   issued record (sched.orig/sched.als) is refused unless the restore path passes
   {allowIssued:true} (C7). Called only from a reducer that already enlisted
   schedStore. */
function schedWriteRecords(entries: RecordEntry[], opts?: { allowIssued?: boolean; restore?: boolean }): void {
  const wk = CURWEEK
  let orderIds: string[] | null = null
  let alsTouched = false
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
  const foreign = (id: string, sep: string) => id.slice(0, id.indexOf(sep)) !== wk
  for (const e of entries) {
    switch (e.collection) {
      case 'days': {
        if (foreign(e.id, '#')) throw new CmdRefused(`scheduler write: foreign week ${e.id}`)
        const di = Number(e.id.slice(e.id.indexOf('#') + 1))
        if (e.op !== 'delete') DAYS[di] = cw(e.value)
        if (restore) touchedDays.add(di)
        break
      }
      case 'sched.book':
        if (e.id !== wk) throw new CmdRefused(`scheduler write: foreign week ${e.id}`)
        applyBook(e.value)
        break
      case 'sched.mutes':
        if (e.id !== wk) throw new CmdRefused(`scheduler write: foreign week ${e.id}`)
        WARNOFF.clear(); ((e.value as any[]) || []).forEach(k => WARNOFF.add(k))
        break
      case 'sched.orig': {
        if (foreign(e.id, ':')) throw new CmdRefused(`scheduler write: foreign week ${e.id}`)
        if (!opts?.allowIssued) throw new CmdRefused(`scheduler write: issued record ${e.id} needs allowIssued`)
        const di = e.id.slice(e.id.indexOf(':') + 1)
        if (e.op === 'delete') delete (SCHED.orig as any)[di]; else (SCHED.orig as any)[di] = cw(e.value)
        break
      }
      case 'sched.als': {
        if (foreign(e.id, ':')) throw new CmdRefused(`scheduler write: foreign week ${e.id}`)
        if (!opts?.allowIssued) throw new CmdRefused(`scheduler write: issued record ${e.id} needs allowIssued`)
        // [CMDL-FINISH] §5 — the id-part is the AL's verId (or a legacy index).
        // Match the existing AL by its stable id and update/delete/insert it, then
        // (after the loop) re-sort the book by iso/seq — never index-assign, which
        // the old array-index key did.
        const alId = e.id.slice(e.id.indexOf(':') + 1)
        const arr = SCHED.als as any[]
        const ix = arr.findIndex(a => String((a && a.id) ?? '') === alId)
        if (e.op === 'delete') { if (ix >= 0) arr.splice(ix, 1) }
        else if (ix >= 0) arr[ix] = cw(e.value)
        else arr.push(cw(e.value))
        alsTouched = true
        break
      }
      case 'sched.retired': {
        // [GLOBAL-UNDO] §6.1 — the append-only issuance log. Append-only-INTENDED,
        // so no allowIssued gate: an undo of an UNLOGGED unpublish removes the just-
        // added entry (op:'delete'); a LOGGED (disseminated) entry is NEVER removed by
        // an inverse (§6.2 GU4-003 / Codex GU-P2-001) — the audit line survives, an
        // undo of a disseminated unpublish records a compensating transition instead.
        if (foreign(e.id, ':')) throw new CmdRefused(`scheduler write: foreign week ${e.id}`)
        const idn = e.id.slice(e.id.indexOf(':') + 1)
        SCHED.retired = SCHED.retired || {}
        if (e.op === 'delete') { if (!(SCHED.retired[idn] as any)?.logged) delete SCHED.retired[idn] }
        else SCHED.retired[idn] = cw(e.value)
        break
      }
      case 'inputs': {
        if (e.id === INPUT_ORDER_ID) { orderIds = (e.value as string[]) || null; break }
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
        const v = cw(e.value) as any   // [GLOBAL-UNDO] GU2-009 — clone-on-write
        PLANPUCKS.length = 0; ((v && v.pp) || []).forEach((x: any) => PLANPUCKS.push(x))
        for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
        Object.assign(DAYRMK, (v && v.dm) || {})
        break
      }
      default:
        throw new CmdRefused(`scheduler write: unexpected collection ${e.collection}`)
    }
  }
  if (orderIds) {
    const pos = new Map(orderIds.map((id, i) => [id, i]))
    INPUTS.sort((a: any, b: any) => (pos.get(a.iid) ?? 1e9) - (pos.get(b.iid) ?? 1e9))
  }
  if (alsTouched) {
    // [CMDL-FINISH] §5 — order the reconstructed book by iso then seq (chronological
    // AL order), the same order the index key used to encode positionally.
    (SCHED.als as any[]).sort((a: any, b: any) => {
      const ai = String(a?.iso ?? ''), bi = String(b?.iso ?? '')
      if (ai !== bi) return ai < bi ? -1 : 1
      return (Number(a?.seq) || 0) - (Number(b?.seq) || 0)
    })
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
    if (ch.collection === 'sched.orig') return Number(ch.id.slice(ch.id.indexOf(':') + 1))
    if (ch.collection === 'sched.als' && ch.after && (ch.after as any).di != null) return Number((ch.after as any).di)
  }
  return null
}
export function schedPostRestore(entry: any, dir: 'undo' | 'redo'): void {
  if (dir !== 'undo' || !entry?.boundary || entry.boundary.kind !== 'publish') return
  const di = publishDayOf(entry)
  if (di == null) return
  signClear(di)
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
  ensureRowIds(DAYS)
  mintInpIds()
  SCHED_BASELINE = histSnap()
}

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
  discard: 'sched.discard',
  // [GLOBAL-UNDO] §6.5 — retract a published day to a working copy (the Unpublish button)
  unpublish: 'sched.unpublish',
  // follow-up #1 — the previously-unrouted paths (rows A–G). Auto-registered by
  // the definePermission loop below. `mutate` is the afterSchedMutate backstop.
  mutate: 'sched.mutate',
  stores: 'sched.stores',
  sign: 'sched.sign',
  signClear: 'sched.signClear',
  warnMute: 'sched.warnMute',
  draftRename: 'sched.draft.rename',
  draftDelete: 'sched.draft.delete',
} as const

const schedScope = (): Scope => ({ module: 'sched', weekId: CURWEEK })
const inputsScope = (): Scope => ({ module: 'inputs' })

/* run a scheduler mutation `fn` inside a command: enlist the scheduler store
   (snapshot), run the existing in-place write (its HOOKS effects latch and
   release in phase 8), derive the record-level changes, emit. `fn` may return a
   value (writeInputs returns a boolean) which is captured and returned. */
function commitSched<T>(type: string, scope: Scope, fn: () => T): { result: CommitResult; value: T } {
  let value!: T
  const cmd: Command = { type, scope, apply: (txn) => { txn.enlist(schedStore); value = fn(); applyEnd() } }
  const result = commit(cmd)
  return { result, value }
}
export function commitSchedVoid(type: string, fn: () => void): CommitResult {
  return commitSched(type, schedScope(), fn).result
}
export function commitInputs<T>(type: string, fn: () => T): T {
  return commitSched(type, inputsScope(), fn).value
}
/* [CMDL-FINISH] §2.2 — the PROJECTION sibling of commitInputs: the LW-originated
   reconciler (runOutbound) mints/retracts Raptor inputs as a causally-chained
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
export function commitSchedValue<T>(type: string, fn: () => T): T {
  return commitSched(type, schedScope(), fn).value
}

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
export function schedWrite(type: string, fn: () => void): void { toastFail(commitSchedVoid(type, fn)) }
export function schedWriteValue<T>(type: string, fn: () => T): T {
  const { result, value } = commitSched(type, schedScope(), fn)
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
      fn()
      const added: string[] = []
      for (const id of issuedIdSet()) if (!before.has(id)) added.push(id)
      if (added.length) {
        txn.boundary({ kind: 'publish', ids: added, crossable: !added.some(issuedDisclosed) })
        /* [ARCH-STACK] step 4 (B5) — weekend / PH work replaces a clashing leave bid */
        publishGate()?.(di)
      }
      applyEnd()   // SR-001: commitPublish builds its OWN Command, so it needs the shared advance too
    },
  }
  return commit(cmd)
}

/* first-publish a day (stamps its frozen Original — a sched.orig record + the
   publish boundary). Routed additively: the engine setDayApproved runs unchanged
   inside the command. */
export function commitSetDayApproved(di: number, on: any): CommitResult {
  return commitPublish(SCHED_TYPES.approve, () => setDayApproved(di, on), di)
}

/* publish one day's changes as its next per-day AL (appends a sched.als record +
   the publish boundary). */
export function commitPublishALDay(di: number): CommitResult {
  return commitPublish(SCHED_TYPES.publishAL, () => publishALDay(di), di)
}

/* clear a never-published day's draft marks. Not a publish (mints no issued id,
   declares no boundary) — routed through commit only so the pending-book change
   reaches the stream. */
export function commitDiscardPending(): CommitResult {
  return commitSchedVoid(SCHED_TYPES.discard, () => discardPending())
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
  registerRecord({ key: 'weeks:<wk>#<di>', cls: 'record', collection: 'days', module: 'scheduler' })
  registerRecord({ key: 'weeks:sched.book/<wk>', cls: 'record', collection: 'sched.book', module: 'scheduler' })
  registerRecord({ key: 'weeks:sched.mutes/<wk>', cls: 'record', collection: 'sched.mutes', module: 'scheduler' })
  registerRecord({ key: 'weeks:sched.orig/<wk>:<di>', cls: 'record', collection: 'sched.orig', module: 'scheduler' })
  registerRecord({ key: 'weeks:sched.als/<wk>:<verId>', cls: 'record', collection: 'sched.als', module: 'scheduler' })
  registerRecord({ key: 'weeks:sched.retired/<wk>:<verId>~<n>', cls: 'record', collection: 'sched.retired', module: 'scheduler' })
  registerRecord({ key: 'inputs:<iid>', cls: 'record', collection: 'inputs', module: 'inputs' })
  registerRecord({ key: 'plan:all', cls: 'record', collection: 'plan', module: 'plan' })
}
