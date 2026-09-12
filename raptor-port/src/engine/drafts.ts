import { DAYS } from './data'
import { SCHED, dayApproved, approvedDays, verLabel, dayCurVer, daySnapOf, deletionKey, moveKey, trackStructuralAdd, isDeleteKey, isMoveKey, protectedWeek } from './publish'
import { dayKeys } from './restore'
import { reconcileDayFiling } from './slots'
import { keyDay } from './keys'
import { groundOrder } from './order'
import { ridKey, posKey, rowsOf, ensureRowIds } from './rowids'

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
  /* READ-ONLY QUARANTINE (P2-REV2-02): an unsupported / wrong-week book is frozen
     and its engine cannot safely re-key it, so no structural mutation is accepted.
     draftDup stows the live day into a blob and installs a clone — a DAYS[di]
     mutation whose result the preserved-blob writeback would silently discard on
     reload. Every draft/recovery/whole-day mutator carries this same guard; it
     addresses only the loaded week, so protectedWeek() is the exact test. */
  if (protectedWeek()) return null
  SCHED.drafts = SCHED.drafts || {}
  SCHED.curDraft = SCHED.curDraft || {}
  const list = SCHED.drafts[di] = SCHED.drafts[di] || []
  /* STOW HARDENING (Fable #2 / Astra RID-IR-05): mint any missing id on the live
     day BEFORE cloning it into a blob, so a parked draft never carries an id-less
     row. UI paths already histPush (mint) between an add and a stow, but a
     programmatic path (e.g. applyDayTpl, which strips ids, then draftDup before
     the caller's histPush epilogue) could otherwise stow id-less rows that
     backfillSnapshotIds would later position-pair to an unrelated live row. In
     production the day already carries its ids, so this is a no-op. */
  ensureRowIds(DAYS)
  if (!list.length) {
    /* DRAFTS KEEP THEIR IDS (11 Sep 26, revised after five red-team rounds).
       A saved draft is an alternate VERSION of the same day, not an independent
       copy — the live day, its parked drafts and its issued document all speak
       ONE rid-space, so switching between them installs a blob that already
       resolves against every frozen amendment. So draftDup no longer strips or
       re-mints: both blobs are plain clones of the live day, sharing its ids.
       (Contrast a DAY TEMPLATE / DUPLICATED WAVE, which genuinely COEXIST in the
       live model and must still strip — ensureRowIds would otherwise dedupe them;
       a parked draft never coexists in DAYS, so its shared ids never meet the
       first-seen dedupe.) A genuinely new row added inside a draft still gets a
       fresh id at the next histPush, so a real add is never read as a survivor —
       which is what let the swap-time adoption gate (and its RID-R4-01 hole) be
       removed entirely. */
    list.push({ id: newId(list), name: 'Draft 1', d: clone(DAYS[di]) })
    const t = { id: newId(list), name: 'Draft 2', d: clone(DAYS[di]) }
    list.push(t)
    SCHED.curDraft[di] = t.id
    return t
  }
  const cur = list.find((x: any) => x.id === SCHED.curDraft[di])
  /* a later dup: stow live into the entry being left behind and mint a new
     entry as a plain clone of live — both keep live's ids (keep-ids, above) */
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
  if (protectedWeek()) return false   // read-only quarantine — never swap a frozen day (P2-REV2-02)
  const list = dayDrafts(di)
  const t = list.find((x: any) => x.id === id)
  if (!t) return false
  const curId = curDraftId(di)
  if (id === curId) return false
  const cur = list.find((x: any) => x.id === curId)
  /* a stale/missing selection stamp means there is no entry that owns the
     live content — skip the stow rather than guess which blob to overwrite.
     Mint before the stow (Astra RID-IR-05) so the stowed blob never carries an
     id-less row; a no-op in production where the day already has its ids. */
  if (cur) { ensureRowIds(DAYS); cur.d = clone(DAYS[di]) }
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
  /* the ONE chokepoint every approved-day whole-day REPLACEMENT funnels through
     (draftSelect / loadVersionToWorkingCopy / applyDayTpl). Reconcile the day's
     ground filing FIRST — before the snapshot diff below and before any AL freezes
     the fingerprint — so a 'g' input whose row the replacement dropped no longer
     lies as filed, and navigation cannot later flip it into a phantom amendment
     (P2-REV2-05). */
  reconcileDayFiling(di)
  const ver = dayCurVer(di)
  const snap = ver != null ? daySnapOf(di, ver) : null
  if (!snap) {
    /* unreachable on an approved day (first publish stamps SCHED.orig) —
       guard for probe/import states with the plain unpublished wipe */
    Object.keys(SCHED.pending).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.pending[k] })
    Object.keys(SCHED.added || {}).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.added[k] })
    return
  }
  const nowD = DAYS[di], wasD = snap.d
  const snapArr: any[] = []; snapArr[di] = wasD
  const now = dayKeys(nowD, di)
  const was = dayKeys(wasD, di)
  Object.keys(SCHED.pending).forEach((k: any) => {
    if (keyDay(k) === di && !/^inp:/.test(String(k))) delete SCHED.pending[k]
  })
  Object.keys(SCHED.added || {}).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.added[k] })
  Object.keys(SCHED.changes).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.changes[k] })
  /* re-install the issued marks — single-hop: keep-ids means the snapshot's
     changes slice is already keyed in the SAME rid-space the live day speaks.
     Only reinstall a mark whose ROW is present in the incoming draft: a mark on
     a row the draft DELETED must not be resurrected into the live changes map, or
     unpublishAL would return a field key no live row holds to pending — a
     dangling amendment (Astra RID-IR-04). A NONROW key (dn:/del:) resolves via
     posKey to itself (non-null) and is kept; the frozen AL record is untouched. */
  Object.keys(snap.c || {}).forEach((k: any) => { if (posKey(k, DAYS) != null) SCHED.changes[k] = snap.c[k] })
  /* markEdit's invariant: a pending key never also wears a changes-mark —
     only the preserved inp: keys can collide here */
  Object.keys(SCHED.pending).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.changes[k] })
  const pend = (k: any) => { SCHED.pending[k] = 1; delete SCHED.changes[k] }

  /* ---- VALUE DIFF, joined by rid ------------------------------------------
     A shared rid may sit at DIFFERENT positions in the live day and the issued
     snapshot (an edit-then-move), so each field is compared to the SAME ROW's
     issued value — located by translating the positional key to rid and back
     into the other structure — never to whatever now shares its position (Astra
     RID-R5-01, which a positional diff drops as a false negative reconcile can
     never repair). A snapshot written before ids cannot resolve the rid and
     falls back to the same position (legacy position-pairing). Marks are STORED
     rid-anchored. */
  /* Only a snapshot written BEFORE ids (no rid on any row) may be position-paired;
     when it carries rids, a rid absent from it is a genuine ADD/REMOVAL, so return
     null (honour null-as-absent) instead of a positional coincidence — Astra
     RID-IR-01, the same rule reconcile applies. */
  const snapHasRids = rowsOf(wasD).some((r: any) => r && r.rid)
  const snapPos = (k: any) => { const p = posKey(ridKey(k, DAYS), snapArr); if (p != null) return p; return snapHasRids ? null : String(k) }
  const livePos = (k: any) => { const p = posKey(ridKey(k, snapArr), DAYS); if (p != null) return p; return snapHasRids ? null : String(k) }
  now.forEach((v: any, k: any) => {
    const sp = snapPos(k)
    if (sp == null || !was.has(sp) || was.get(sp) !== v) pend(ridKey(k, DAYS))   // sp null = absent from a rid-bearing snapshot = a genuine add
  })
  was.forEach((_v: any, k: any) => {
    const lk = livePos(k)
    if (lk == null || now.has(lk)) return         // lk null = the snap row is gone from live → structural (tombstone owns it); has = survives with a value (handled above)
    const rowK = rowKeyOf(String(k))              // only a variable-length sub-list key can outlive its row
    if (!rowK) return                             // a row-level key gone → structural, owned by the set-diff
    const rowLk = livePos(rowK)
    if (rowLk != null && now.has(rowLk)) pend(ridKey(lk, DAYS))   // a who[]/more[]/pax[] hole on a SURVIVING row
  })

  /* ---- STRUCTURAL DIFF = rid SET-DIFFERENCE, ancestor-collapsing ----------
     Attribution is by IDENTITY, not tail index, so an add reordered off the
     tail is still credited to the row that was added and a delete to the row
     that went (Astra RID-02, which the old length+tail form mis-attributed).
     Only the TOPMOST changed rid emits (a whole wave gone is ONE wave
     tombstone, not one per aircraft); the per-kind expansion keeps the exact
     keys/counts the board's own +/✕ buttons mint. A row with no rid falls back
     to its positional path, reducing this to the old length diff for a
     legacy/pristine day. Notes carry no rid, so they stay on the length diff. */
  const enumRows = (d: any): any[] => {
    const out: any[] = []
    ;(d.waves || []).forEach((w: any, gi: number) => {
      const wid = w.rid || `#w${gi}`
      out.push({ id: wid, parent: null, kind: 'wave', gi })
      ;(w.formations || []).forEach((f: any, li: number) => {
        const fid = f.rid || `#w${gi}f${li}`
        out.push({ id: fid, parent: wid, kind: 'formation', gi, li, aircraftN: (f.aircraft || []).length })
        ;(f.aircraft || []).forEach((a: any, ai: number) => out.push({ id: a.rid || `#w${gi}f${li}a${ai}`, parent: fid, kind: 'aircraft', gi, li, ai }))
      })
    })
    ;(d.allhands || []).forEach((r: any, i: number) => out.push({ id: r.rid || `#a${i}`, parent: null, kind: 'programme', i }))
    const s = d.sims || {}
    Object.keys(s).forEach((kind: any) => (s[kind] || []).forEach((r: any, i: number) => out.push({ id: r.rid || `#s${kind}${i}`, parent: null, kind: 'sim', simkind: kind, i })))
    ;(d.dutywaves || []).forEach((b: any, wi: number) => {
      const bid = b.rid || `#b${wi}`
      out.push({ id: bid, parent: null, kind: 'dutyblock', wi })
      ;(b.rows || []).forEach((r: any, ri: number) => out.push({ id: r.rid || `#b${wi}r${ri}`, parent: bid, kind: 'duty', wi, ri }))
    })
    ;(d.ground || []).forEach((r: any, i: number) => out.push({ id: r.rid || `#g${i}`, parent: null, kind: 'ground', i }))
    return out
  }
  const nowRows = enumRows(nowD), wasRows = enumRows(wasD)
  const nowIds = new Set(nowRows.map((r: any) => r.id)), wasIds = new Set(wasRows.map((r: any) => r.id))
  const tomb = (kind: string, n: number) => { for (let i = 0; i < n; i++) pend(deletionKey(di, kind)) }
  nowRows.forEach((r: any) => {
    if (wasIds.has(r.id)) return                                  // a survivor
    if (r.parent != null && !wasIds.has(r.parent)) return         // parent also added → its expansion covers it
    if (r.kind === 'wave') { trackStructuralAdd(`wl:${di}.${r.gi}`); (nowD.waves[r.gi].formations || []).forEach((_f: any, li: number) => trackStructuralAdd(`ff:${di}.${r.gi}.${li}.cs`)) }
    else if (r.kind === 'formation') trackStructuralAdd(`ff:${di}.${r.gi}.${r.li}.cs`)
    else if (r.kind === 'aircraft') trackStructuralAdd(`fr:${di}.${r.gi}.${r.li}.${r.ai}`)
    else if (r.kind === 'programme') trackStructuralAdd(`ap:${di}.${r.i}.prog`)
    else if (r.kind === 'sim') trackStructuralAdd(`sr:${di}.${r.simkind}.${r.i}.label`)
    else if (r.kind === 'dutyblock') trackStructuralAdd(`dl:${di}.${r.wi}`)
    else if (r.kind === 'duty') trackStructuralAdd(`dr:${di}.${r.wi}.${r.ri}.role`)
    else if (r.kind === 'ground') trackStructuralAdd(`gr:${di}.${r.i}.prog`)
  })
  wasRows.forEach((r: any) => {
    if (nowIds.has(r.id)) return
    if (r.parent != null && !nowIds.has(r.parent)) return         // parent also removed → collapsed into it
    if (r.kind === 'formation') tomb('line', r.aircraftN)         // a formation gone → one line per aircraft
    else if (r.kind === 'aircraft') tomb('line', 1)
    else tomb(r.kind, 1)                                          // wave/programme/sim/dutyblock/duty/ground
  })
  /* notes have no rid → a plain length diff, positional adds and tombstones */
  const wasNotes = (wasD.notes || []).length, nowNotes = (nowD.notes || []).length
  if (wasNotes > nowNotes) tomb('note', wasNotes - nowNotes)
  for (let i = wasNotes; i < nowNotes; i++) trackStructuralAdd(`dn:${di}.${i}`)

  /* ---- mov: on a reorder that changed nothing else -------------------------
     An order-only change leaves equal values and empty set-differences, so
     nothing above records it — but reorder.ts requires an issued-row move to be
     an amendment (Fable #1). Compare the SURVIVING rids' order per section; a
     difference mints one mov: for that section. Rid-only (a legacy/no-rid day
     cannot reorder detectably) and survivors only, so displacement caused
     purely by adds/deletes never counts. */
  const wasRidSet = new Set(rowsOf(wasD).map((r: any) => r.rid).filter(Boolean))
  const nowRidSet = new Set(rowsOf(nowD).map((r: any) => r.rid).filter(Boolean))
  const movIf = (kind: string, nowArr: any, wasArr: any) => {
    const a = (nowArr || []).map((r: any) => r.rid).filter((id: any) => id && wasRidSet.has(id))
    const b = (wasArr || []).map((r: any) => r.rid).filter((id: any) => id && nowRidSet.has(id))
    if (a.length > 1 && a.join('') !== b.join('')) pend(moveKey(di, kind))
  }
  movIf('wave', nowD.waves, wasD.waves)
  movIf('programme', nowD.allhands, wasD.allhands)
  movIf('dutyblock', nowD.dutywaves, wasD.dutywaves)
  /* GROUND is displayed through groundOrder(rows, gman) — a manual drag freezes
     the SORTED order into gman and can leave the raw array unchanged, so compare
     the effective DISPLAY order, not the raw array, or a manual ground move is
     missed (Astra RID-REV-03). */
  movIf('ground', groundOrder(nowD.ground, nowD.gman).map((x: any) => x.row), groundOrder(wasD.ground, wasD.gman).map((x: any) => x.row))
  ;[...new Set([...Object.keys(nowD.sims || {}), ...Object.keys(wasD.sims || {})])].forEach((kind: any) => movIf('sim', (nowD.sims || {})[kind], (wasD.sims || {})[kind]))
  /* nested sections, matched by the parent's rid so an add/delete of a whole
     parent never reads as a move of its children */
  const byRid = (arr: any) => { const m = new Map(); (arr || []).forEach((x: any) => { if (x && x.rid) m.set(x.rid, x) }); return m }
  const wWas = byRid(wasD.waves)
  ;(nowD.waves || []).forEach((w: any) => { const ww = w.rid && wWas.get(w.rid); if (ww) {
    movIf('formation', w.formations, ww.formations)
    const fWas = byRid(ww.formations)
    ;(w.formations || []).forEach((f: any) => { const wf = f.rid && fWas.get(f.rid); if (wf) movIf('aircraft', f.aircraft, wf.aircraft) })
  } })
  const bWas = byRid(wasD.dutywaves)
  ;(nowD.dutywaves || []).forEach((b: any) => { const wb = b.rid && bWas.get(b.rid); if (wb) movIf('duty', b.rows, wb.rows) })
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
  if (protectedWeek()) return false   // read-only quarantine — the draft list rides the frozen blob (P2-REV2-02)
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
  if (protectedWeek()) return false   // read-only quarantine — the draft list rides the frozen blob (P2-REV2-02)
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
  if (protectedWeek()) return false   // read-only quarantine — never roll a version over a frozen day (P2-REV2-02)
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
    const snapArr: any[] = []; snapArr[di] = snap.d
    const iss = dayKeys(snap.d, di)
    /* Only a snapshot written BEFORE ids (no rid on any row) may be position-paired
       — the legacy-faithful fallback backfillSnapshotIds uses. When the snapshot
       DOES carry rids, a rid that does not resolve in it is genuinely ABSENT (a new
       row), NOT a positional coincidence: honour null-as-absent, or an add whose
       value happens to equal an unrelated issued row at that position has its mark
       wrongly dropped (Astra RID-IR-01). */
    const snapHasRids = rowsOf(snap.d).some((r: any) => r && r.rid)
    let live: any = null
    pend.forEach((k: any) => {
      if (isDeleteKey(k) || isMoveKey(k) || /^inp:/.test(String(k))) return   // inert marks — never field diffs
      /* the pending key is rid-anchored; resolve the SAME row's positional
         address INDEPENDENTLY in the live day and in the issued snapshot (a
         shared rid does NOT imply a shared position — after an edit-then-move
         the two differ, and a one-sided lookup would compare two different rows
         and drop a real mark, Astra RID-R3-02). */
      const livePk = posKey(k, DAYS)
      if (livePk == null) { delete SCHED.pending[k]; return }   // the row is gone from live entirely
      if (!live) live = dayKeys(DAYS[di], di)
      let issPk = posKey(k, snapArr)
      if (issPk == null && !snapHasRids) issPk = livePk         // legacy rid-less snapshot only → position-pair
      const lv = live.get(livePk), iv = issPk == null ? undefined : iss.get(issPk)
      /* the four-way table (Fable #2):
         - gone from BOTH documents → a phantom (an overflow/append raised then
           trimmed, owner's swap-and-swap-back) → drop;
         - live only  → a genuine add → keep;
         - issued only → a genuine clear of a surviving row (a who[] hole) → keep;
         - both, equal → back to the issued value → drop + restore the issued tint;
         - both, differ → a real change → keep. */
      if (lv === undefined && iv === undefined) { delete SCHED.pending[k]; return }
      if (iv === undefined) return
      if (lv === undefined) return
      if (lv === iv) {
        delete SCHED.pending[k]
        if (snap.c && snap.c[k] != null) SCHED.changes[k] = snap.c[k]
      }
    })
  })
}
