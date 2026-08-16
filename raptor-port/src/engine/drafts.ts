import { DAYS } from './data'
import { SCHED, dayApproved, approvedDays, verLabel, dayCurVer, daySnapOf, deletionKey, trackStructuralAdd, isDeleteKey } from './publish'
import { dayKeys } from './restore'
import { keyDay } from './keys'

/* PER-DAY ALTERNATE DRAFTS (owner ask, 15 Aug 26 — "allow me to duplicate the
   current day's schedule and edit over it… if one variable change, they can
   select Draft 2… it is not limited to just three").

   A draft is an ALTERNATE CONTENT BLOB for one day, made before that day is
   published. The live DAYS[di] IS the working copy of the SELECTED draft —
   there is no shadow copy being edited somewhere else. Switching drafts stows
   the live day back into the selected entry's blob, then loads the other blob
   in as the live day. Publishing needs no change at all: setDayApproved
   publishes whatever is live, which is by construction the selected draft —
   that is the whole point of the shape.

   State rides SCHED (engine/publish.ts) rather than a module of its own:
     SCHED.drafts   — {di: [{id, name, d}]}   the day's blobs
     SCHED.curDraft — {di: id}                which entry the live day IS
   so it serializes with undo exactly like the AL records do —
   state/history.ts's histSnap/histApply carry both fields explicitly. Like
   the AL list, none of it persists past the session.

   A blob `d` is a deep clone of the WHOLE day object (daySnap's JSON idiom) —
   content only, never a changes slice: a draft is pre-publish by definition,
   so there are no issued marks that could belong to it. The logic lives here,
   not in publish.ts, so that file's verbatim body stays lean; publish.ts's own
   daySnapOf gained the one 'd:<id>' resolution branch (the preview machinery
   reads snapshots only through it), and everything else imports from there. */

export const MAX_DRAFT_NAME = 24

const clone = (o: any) => JSON.parse(JSON.stringify(o))

/* the day's draft list — empty array (not undefined) when the day has none,
   so every caller can .map/.length without a guard */
export function dayDrafts(di: any): any[] {
  return ((SCHED.drafts || {})[+di]) || []
}

/* which entry the live day currently is, or undefined when the day has no
   drafts (or the stamp went stale under a hand-edit — callers treat that the
   same as "no selection", and the next dup/select restamps it) */
export function curDraftId(di: any) {
  return (SCHED.curDraft || {})[+di]
}

/* 'd:<id>' — the version-string shape daySnapOf resolves for a draft preview */
export function isDraftVer(ver: any) {
  return typeof ver === 'string' && ver.slice(0, 2) === 'd:'
}

/* the label a version string reads as wherever versions are labelled: a
   draft ver names its draft, everything else stays verLabel's business */
export function draftVerLabel(di: any, ver: any) {
  if (!isDraftVer(ver)) return verLabel(ver)
  const t = dayDrafts(di).find((x: any) => 'd:' + x.id === ver)
  return t ? t.name : 'Draft'
}

/* ids are per-day (the list lives under its day key and DPREV's 'd:<id>'
   entries are per-day too), minted as max numeric suffix + 1 over the day's
   OWN list rather than a module counter — deterministic across the histApply
   round trips a module counter would not survive, and two days reusing 'dr1'
   can never meet. */
const newId = (list: any[]) => {
  let n = 0
  list.forEach((t: any) => { const m = /^dr(\d+)$/.exec(String(t.id)); if (m) n = Math.max(n, +m[1]!) })
  return 'dr' + (n + 1)
}

/* the next default name: highest existing "Draft N" + 1, so renaming Draft 2
   to "Wet weather" then duplicating again still mints "Draft 3", and deleting
   Draft 2 never lets a later mint collide with a surviving Draft 3 */
const nextNum = (list: any[]) => {
  let n = 0
  list.forEach((t: any) => { const m = /^Draft (\d+)$/.exec(String(t.name)); if (m) n = Math.max(n, +m[1]!) })
  return n + 1
}

/* Duplicate the live day into a new draft and switch the working copy to it.
   FIRST ever call on a day: the live day is stowed as "Draft 1" AND a copy is
   minted as "Draft 2", selected — one tap turns "the schedule" into two named
   alternatives, which is the owner's own phrasing of the feature. Later
   calls: stow live into the selected entry, mint "Draft N" as a copy of live,
   select it.
   A PUBLISHED day duplicates too (owner, 15 Aug 26 — the original refusal is
   gone; see rebaseDayPending below for why switching became safe). A dup
   changes no content at all — live is stowed and an identical copy selected —
   so the day's pending marks are left exactly as they were: whatever was
   already heading for the next AL still is.
   No histPush/reflow here — the UI caller's afterSchedMutate() owns the one
   undo step, the same contract restoreDayVersion and applyDayTpl carry. */
export function draftDup(di: any) {
  di = +di
  if (!DAYS[di]) return null
  SCHED.drafts = SCHED.drafts || {}
  SCHED.curDraft = SCHED.curDraft || {}
  const list = SCHED.drafts[di] = SCHED.drafts[di] || []
  if (!list.length) {
    list.push({ id: newId(list), name: 'Draft 1', d: clone(DAYS[di]) })
    const t = { id: newId(list), name: 'Draft 2', d: clone(DAYS[di]) }
    list.push(t)
    SCHED.curDraft[di] = t.id
    return t
  }
  const cur = list.find((x: any) => x.id === SCHED.curDraft[di])
  if (cur) cur.d = clone(DAYS[di])
  const t = { id: newId(list), name: 'Draft ' + nextNum(list), d: clone(DAYS[di]) }
  list.push(t)
  SCHED.curDraft[di] = t.id
  return t
}

/* Switch the live day to another draft: stow live into the currently-selected
   entry, install a CLONE of the target blob as DAYS[di] (a clone, so editing
   the live day never reaches back into the stowed copy), re-stamping `.today`
   from the live day — 'today' tracks the calendar, not the document (the
   restoreDayVersion precedent, engine/restore.ts:90-110).
   On an UNPUBLISHED day the day's own SCHED.pending/SCHED.added keys are
   retired the same way restoreDayVersion retires them: the swap does not line
   up old and new row indices, so a stale address may now point at a different
   row entirely — each draft's edits were recorded while IT was live and stop
   meaning anything the moment it is not. Retiring costs nothing there: a
   draft day's pending marks never reach an AL anyway (publishableKeys skips
   unpublished days), and first publish spends them wholesale.
   On a PUBLISHED day (owner, 15 Aug 26 — "change to draft 1 to publish as
   AL1") the marks are NOT retired but REBASED: rebaseDayPending recomputes
   the whole day's pending set as the true diff between the new live content
   and the issued snapshot, so the next AL carries exactly what hand-editing
   to the same result would have carried. That is what retired the old
   "Reopen the day first" refusal — the divergence it existed to prevent is
   no longer silent.
   Deliberately NO histPush and NO reflow — the UI caller's afterSchedMutate()
   is the single undo step, exactly the restore/applyDayTpl contract.
   Refuses (returns false): unknown id, or the already-selected id (nothing to
   do, and "stow then reload yourself" must not clobber live edits with a
   stale stow). */
export function draftSelect(di: any, id: any) {
  di = +di
  if (!DAYS[di]) return false
  const list = dayDrafts(di)
  const t = list.find((x: any) => x.id === id)
  if (!t) return false
  const curId = curDraftId(di)
  if (id === curId) return false
  const cur = list.find((x: any) => x.id === curId)
  /* a stale/missing selection stamp means there is no entry that owns the
     live content — skip the stow rather than guess which blob to overwrite */
  if (cur) cur.d = clone(DAYS[di])
  const nd = clone(t.d)
  nd.today = !!(DAYS[di] && DAYS[di].today)
  DAYS[di] = nd
  if (dayApproved(di)) {
    rebaseDayPending(di)
  } else {
    Object.keys(SCHED.pending).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.pending[k] })
    Object.keys(SCHED.added || {}).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.added[k] })
  }
  SCHED.curDraft = SCHED.curDraft || {}
  SCHED.curDraft[di] = id
  return true
}

/* ---- the published-day pending rebase (owner, 15 Aug 26) ------------------
   After a wholesale content swap on a published day, per-key pending marks
   recorded against the OLD content stop meaning anything — but wiping them
   (the unpublished-day treatment) would let the live day diverge from the
   issued document with no pending mark and no AL trail, which is exactly why
   switching used to be refused. So instead: recompute the day's whole mark
   state from scratch against the issued snapshot, using dayKeys (restore.ts)
   — the slot-key walker kept as "executable documentation" is load-bearing
   again. The result is indistinguishable from having hand-edited the live day
   into the draft's shape:
     · a key whose value differs from the issued one  → pending
     · a key matching the issued day                  → wears its issued
       changes-mark again (the restoreDayVersion idiom), so AL tints survive
     · an issued sub-value gone from a SURVIVING row (a who[] hole, a shrunk
       more[]) → pending — the address is stable and the AL carries the clear
     · an issued row/structure gone entirely → one inert del: tombstone per
       row, exactly the granularity the board's own delete buttons mint —
       never via markDeletion/markEdit, whose histPush would shred the
       caller's one-undo-step contract
     · a structure beyond the issued count → a draft-add identity key in
       SCHED.added (the markStructuralAdd vocabulary), so deletionWasIssued
       still answers "add-then-delete is a no-op" and alIssue/unpublishAL
       carry the adds unchanged
     · inp: pending keys are PRESERVED — an input filing addresses INPUTS,
       not the day blob; dayKeys cannot re-derive it and dropping it would
       silently lose a real amendment item
   Positional honesty is accepted: the whole marks machinery is positional, so
   a draft that inserted a row at the front reads as "everything after differs
   plus one row added" — the same thing hand-editing to that result reads as.
   No histPush/reflow here either — this runs inside draftSelect's step. */
export function rebaseDayPending(di: any) {
  di = +di
  const ver = dayCurVer(di)
  const snap = ver != null ? daySnapOf(di, ver) : null
  if (!snap) {
    /* unreachable on an approved day (first publish stamps SCHED.orig) —
       guard for probe/import states with the plain unpublished wipe */
    Object.keys(SCHED.pending).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.pending[k] })
    Object.keys(SCHED.added || {}).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.added[k] })
    return
  }
  const now = dayKeys(DAYS[di], di)
  const was = dayKeys(snap.d, di)
  Object.keys(SCHED.pending).forEach((k: any) => {
    if (keyDay(k) === di && !/^inp:/.test(String(k))) delete SCHED.pending[k]
  })
  Object.keys(SCHED.added || {}).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.added[k] })
  Object.keys(SCHED.changes).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.changes[k] })
  Object.keys(snap.c || {}).forEach((k: any) => { SCHED.changes[k] = snap.c[k] })
  /* markEdit's invariant: a pending key never also wears a changes-mark —
     only the preserved inp: keys can collide here */
  Object.keys(SCHED.pending).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.changes[k] })
  const pend = (k: any) => { SCHED.pending[k] = 1; delete SCHED.changes[k] }
  now.forEach((v: any, k: any) => { if (!was.has(k) || was.get(k) !== v) pend(k) })
  was.forEach((_v: any, k: any) => {
    if (now.has(k)) return
    const rk = rowKeyOf(String(k))
    if (rk && now.has(rk)) pend(k)
  })
  /* section-by-section structural diff — tombstones for shrink, add
     identities for growth, at the board delete/add handlers' granularity */
  const wasD = snap.d, nowD = DAYS[di]
  const tomb = (kind: string, n: number) => { for (let i = 0; i < n; i++) pend(deletionKey(di, kind)) }
  const lenDiff = (kind: string, wasLen: number, nowLen: number, addKey: (i: number) => string) => {
    if (wasLen > nowLen) tomb(kind, wasLen - nowLen)
    for (let i = wasLen; i < nowLen; i++) trackStructuralAdd(addKey(i))
  }
  lenDiff('wave', (wasD.waves || []).length, (nowD.waves || []).length, i => `wl:${di}.${i}`)
  const wn = Math.min((wasD.waves || []).length, (nowD.waves || []).length)
  for (let gi = 0; gi < wn; gi++) {
    const wf = (wasD.waves[gi].formations || []), nf = (nowD.waves[gi].formations || [])
    const fn = Math.min(wf.length, nf.length)
    for (let li = 0; li < fn; li++)
      lenDiff('line', (wf[li].aircraft || []).length, (nf[li].aircraft || []).length, ai => `fr:${di}.${gi}.${li}.${ai}`)
    /* a formation gone whole: its aircraft are line removals (no 'formation'
       tombstone kind exists); a formation added whole: one ff: identity, its
       aircraft covered by the ancestor check deletionWasIssued already does */
    for (let li = nf.length; li < wf.length; li++) tomb('line', (wf[li].aircraft || []).length)
    for (let li = wf.length; li < nf.length; li++) trackStructuralAdd(`ff:${di}.${gi}.${li}.cs`)
  }
  /* a wave added whole mirrors the board's + Wave: wl: plus ff: per formation */
  for (let gi = (wasD.waves || []).length; gi < (nowD.waves || []).length; gi++)
    ((nowD.waves[gi].formations || []) as any[]).forEach((_f: any, li: number) => trackStructuralAdd(`ff:${di}.${gi}.${li}.cs`))
  lenDiff('note', (wasD.notes || []).length, (nowD.notes || []).length, i => `dn:${di}.${i}`)
  lenDiff('programme', (wasD.allhands || []).length, (nowD.allhands || []).length, i => `ap:${di}.${i}.prog`)
  lenDiff('dutyblock', (wasD.dutywaves || []).length, (nowD.dutywaves || []).length, i => `dl:${di}.${i}`)
  const bn = Math.min((wasD.dutywaves || []).length, (nowD.dutywaves || []).length)
  for (let wi = 0; wi < bn; wi++)
    lenDiff('duty', (wasD.dutywaves[wi].rows || []).length, (nowD.dutywaves[wi].rows || []).length, ri => `dr:${di}.${wi}.${ri}.role`)
  const kinds = new Set([...Object.keys(wasD.sims || {}), ...Object.keys(nowD.sims || {})])
  kinds.forEach((kind: any) => {
    lenDiff('sim', ((wasD.sims || {})[kind] || []).length, ((nowD.sims || {})[kind] || []).length, ri => `sr:${di}.${kind}.${ri}.label`)
  })
  lenDiff('ground', (wasD.ground || []).length, (nowD.ground || []).length, i => `gr:${di}.${i}.prog`)
}

/* the key whose presence in the live walk means a was-only key's ROW is still
   there — only the variable-length sub-arrays (who[], more[], pax[]) can lose
   a key while their row survives; everything else vanishes only with its row,
   which the tombstones own. null = structural, not this function's business. */
const rowKeyOf = (k: string) => {
  const c = k.indexOf(':'); const p = c < 0 ? '' : k.slice(0, c)
  const a = (c < 0 ? k : k.slice(c + 1)).split('.')
  if (!p) return `fr:${a[0]}.${a[1]}.${a[2]}.${a[3]}`
  if (p === 'a') return `ap:${a[0]}.${a[1]}.prog`
  if (p === 'd') return `dr:${a[0]}.${a[1]}.${a[2]}.role`
  if (p === 's') return `sr:${a[0]}.${a[1]}.${a[2]}.label`
  if (p === 'g') return `gr:${a[0]}.${a[1]}.prog`
  return null
}

/* rename: trimmed, 1..24 chars, and never a duplicate within the day — two
   drafts answering to one name would make the switch toast, the version
   labels and the picker ambiguous at once */
export function draftRename(di: any, id: any, name: any) {
  di = +di
  const list = dayDrafts(di)
  const t = list.find((x: any) => x.id === id)
  if (!t) return false
  const nm = String(name == null ? '' : name).trim().slice(0, MAX_DRAFT_NAME)
  if (!nm) return false
  if (list.some((x: any) => x.id !== id && x.name === nm)) return false
  t.name = nm
  return true
}

/* delete: any entry EXCEPT the selected one — the selected draft IS the live
   day, and deleting the thing being edited from underneath itself is exactly
   the ambiguity this refusal exists to prevent (the caller toasts "Switch to
   another draft first"). A list holding one entry is legal: deleting the
   others just leaves the selected plan as the only named one. */
export function draftDelete(di: any, id: any) {
  di = +di
  if (id === curDraftId(di)) return false
  const list = dayDrafts(di)
  const i = list.findIndex((x: any) => x.id === id)
  if (i < 0) return false
  list.splice(i, 1)
  return true
}

/* LOAD A PUBLISHED VERSION ONTO THE WORKING COPY (owner, 16 Aug 26 — "the
   view only schedule should still see AL1, it shouldn't go to Original without
   me publishing the working copy"). This is what "Load onto working copy" does
   now — NOT the old rollback. It installs the version's content as the live
   working day and rebases the day's pending set as the true diff against the
   STILL-ISSUED document, exactly as draftSelect does when you switch drafts on
   a published day. It deliberately does NOT touch SCHED.cur: the issued version
   the view page shows is unchanged, so nothing reaches viewers until a new AL
   is published — publishing the loaded-then-edited copy becomes the next AL.
   The single undo step is the UI caller's afterSchedMutate(), the same contract
   draftSelect and restoreDayVersion carry. Refuses (false) an unknown version. */
export function loadVersionToWorkingCopy(di: any, ver: any) {
  di = +di
  const snap = daySnapOf(di, ver)
  if (!snap) return false
  const nd = clone(snap.d)
  nd.today = !!(DAYS[di] && DAYS[di].today)
  DAYS[di] = nd
  if (dayApproved(di)) {
    rebaseDayPending(di)
  } else {
    Object.keys(SCHED.pending).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.pending[k] })
    Object.keys(SCHED.added || {}).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.added[k] })
  }
  return true
}

/* CLEAR AN UNDONE EDIT'S MARK (owner, 16 Aug 26 — "if original was 0830, I
   change to 0835 you show an edit dotted line, but when I switch back to 0830
   it shouldn't register as a change"). A pending mark means "different from the
   issued document", NOT "this field was touched". noteChange (engine/slots.ts)
   still raises the mark on every edit — it runs BEFORE the new value lands, so
   it cannot tell whether the edit restored the issued value — and this sweep,
   run from afterSchedMutate AFTER the write, drops any pending FIELD key whose
   live value now equals the issued snapshot's, restoring the AL tint that field
   carried when it was issued (snap.c). It only ever REMOVES a stale mark, never
   adds one, so it can never hide a real change; del:/inp: marks (never in
   dayKeys) are left alone by name. A pending FIELD key in NEITHER walk is also
   dropped — see the comment at that branch. Bounded to the published days and
   their own pending field keys. */
export function reconcileIssuedMarks() {
  approvedDays().forEach((di: any) => {
    const pend = Object.keys(SCHED.pending).filter((k: any) => keyDay(k) === di)
    if (!pend.length) return                              // nothing to reconcile — skip the walk
    const ver = dayCurVer(di), snap = ver != null ? daySnapOf(di, ver) : null
    if (!snap) return
    const iss = dayKeys(snap.d, di)
    let live: any = null
    pend.forEach((k: any) => {
      if (isDeleteKey(k) || /^inp:/.test(String(k))) return   // inert marks — never field diffs
      if (!live) live = dayKeys(DAYS[di], di)
      if (!iss.has(k)) {
        /* A key the issued day never had. If the live day no longer has it
           either, the field was raised in passing and is gone from BOTH
           documents — a drop onto an occupied row parks a man at an overflow/
           append address the issued day lacks, and dragging him back trims
           the entry away again (owner, 16 Aug 26 — "swap the pucks and swap
           it back… it shouldn't register as a change"). Left alone, that
           phantom mark keeps the day reading edited and mints an AL over a
           net no-op. In live only = a genuine add — keep its mark. */
        if (!live.has(k)) delete SCHED.pending[k]
        return
      }
      if (live.get(k) === iss.get(k)) {
        delete SCHED.pending[k]
        if (snap.c && snap.c[k] != null) SCHED.changes[k] = snap.c[k]
      }
    })
  })
}
