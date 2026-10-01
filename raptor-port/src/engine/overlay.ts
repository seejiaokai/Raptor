/* WHAT A DAY SHOWS, WORKED OUT WHEN IT IS READ ([DB-READINESS] group A, phase 6 — plan
   docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md §2.1; data-model.md §9 rule 9).

   In the database a day is written only by the scheduler holding it (the day lock, D450). So a change made somewhere
   else — here, a man deleted (a Delete on Admin → Users, or the posting pass on its date) — must not REWRITE the days it
   affects; it writes its own record (the person's `deletedFrom`), and every day SHOWS its effect because the effect is
   worked out whenever a week's days come into memory: the loaded week (state/store.ts applyWeekModel, before the command
   layer's baseline, so it is nobody's change), a saved week read for the cross-week checks and the next-week peek
   (engine/weekstash.ts stashDays), and a week never saved (engine/weekctx.ts bundle, ui/peek.ts). The day's holder then
   saves it, overlay and all, at his next change to it.

   Pure over the day objects it is handed (a parsed copy, or the model being installed); it never reads storage and
   never writes a record. An ISSUED version is never handed here — it keeps everything it was issued with (D299).

   A man deleted: on every WORKING day dated on or after his `deletedFrom`, every seat he holds is emptied (flying, desk
   and extras, sim seats / passengers / extras, a ground row's name and extras, a Common Programme name and extras — the
   same roll-call as state/person-delete.ts personKeysOnDay), a ground row landed from one of his requests goes, his OIL
   switches go, and the day's working sign-offs and its saved plans lose him. Days before it keep him (D297). */
import { PEOPLE, whoId, isSpecial } from './people'
import { whoArr } from './slots'
import { dayIso } from './verid'
import { INPUTS, inpId, inpLabel, isPersonal, inputCoversDate, dateOrd } from './inputs'
import { hhmm } from './time'
import { inputProtected } from './quarantine'
import { rowElsewhere } from './weekstash'
import { DAYS } from './data'
import { rowsOf } from './rowids'

const ROLES = ['cur', 'sked', 'plan', 'appr'] as const
export const trimTail = (arr: any[]) => { while (arr.length && !arr[arr.length - 1]) arr.pop() }

/* ---- a day OBJECT (a stored day, a parked plan's day, the model being installed): blanked in place, holding every index
   as the funnel does (a list keeps its positions; only trailing blanks are trimmed), and a ground row that came from one
   of `srcs` (his requests) removed with it. Returns true if anything changed. (Moved here from state/person-delete.ts,
   unchanged, so the engine's own readers can apply it — the engine may not import state/.) ---- */
export function stripPersonFromDay(d: any, id: string, srcs: Set<string>): boolean {
  if (!d || !id) return false
  let changed = false
  const blankList = (arr: any, match: (v: any) => boolean) => {
    if (!Array.isArray(arr)) return
    arr.forEach((v: any, n: number) => { if (match(v)) { arr[n] = ''; changed = true } })
    trimTail(arr)
  }
  const isHim = (v: any) => v === id
  ;(d.waves || []).forEach((w: any) => (w && w.formations || []).forEach((f: any) => (f && f.aircraft || []).forEach((a: any) => {
    for (const seat of ['p', 'w']) if (a && a[seat] === id) { a[seat] = ''; changed = true }
  })))
  ;(d.dutywaves || []).forEach((dw: any) => (dw && dw.rows || []).forEach((r: any) => {
    if (!r) return
    if (r.id === id) { r.id = ''; changed = true }
    blankList(r.more, isHim)
  }))
  Object.keys(d.sims || {}).forEach(kind => ((d.sims || {})[kind] || []).forEach((r: any) => {
    if (!r) return
    blankList(r.pax, isHim)
    for (const seat of ['p', 'w']) if (r[seat] === id) { r[seat] = ''; changed = true }
    blankList(r.more, isHim)
  }))
  if (Array.isArray(d.ground)) {
    const keep = d.ground.filter((r: any) => !(r && r.src && srcs.has(String(r.src))))
    if (keep.length !== d.ground.length) { d.ground = keep; changed = true }
    d.ground.forEach((r: any) => {
      if (!r) return
      if (!r.src && whoId(r.who) === id) { r.who = ''; changed = true }
      blankList(r.more, isHim)
    })
  }
  ;(d.allhands || []).forEach((r: any) => {
    if (!r) return
    const arr = whoArr(r); let hit = false
    arr.forEach((v: any, n: number) => { if (whoId(v) === id) { arr[n] = ''; hit = true } })
    if (hit) { trimTail(arr); r.who = arr.length > 1 ? arr : (arr[0] || ''); changed = true }
    blankList(r.more, isHim)
  })
  if (stripOilSwitches(d, id)) changed = true
  return changed
}
/* the OIL mode's per-man switches on a day (`oild.people`, keyed `<id>|<item>` — engine/oilev.ts), and the holding
   stamps beside them (`oild.pa`, phase 6 (a)) */
export function stripOilSwitches(d: any, id: string): boolean {
  const pp = d && d.oild && d.oild.people
  if (!pp || typeof pp !== 'object') return false
  let changed = false
  for (const k of Object.keys(pp)) if (k.startsWith(`${id}|`)) { delete pp[k]; if (d.oild.pa) delete d.oild.pa[k]; changed = true }
  return changed
}
/* a sign-off record ({cur, sked, plan, appr}) and its bindings: his name cleared, its binding with it */
export function stripSign(sign: any, bind: any, id: string): boolean {
  if (!sign || typeof sign !== 'object') return false
  let changed = false
  for (const r of ROLES) if (sign[r] === id) { sign[r] = ''; if (bind && typeof bind === 'object') delete bind[r]; changed = true }
  return changed
}
/* his landed rows on a day: a ground row landed from one of HIS requests — the request's CURRENT holder decides, never
   the name the stored row last carried (a request handed to another man since the row was saved is that man's row, and
   stays — Astra's red team of the phase-6 plan, finding 2: the order "hand A's request to B, then delete A" must leave
   B's row); a row whose request is gone (the delete removes his requests from the cutoff) goes by the name it carries. */
export const hisLanded = (d: any, id: string) => new Set<string>(((d && d.ground) || []).filter((r: any) => {
  if (!r || !r.src) return false
  const inp: any = (INPUTS as any[]).find(x => x && String(inpId(x)) === String(r.src))
  return inp ? String(inp.person || '') === id : whoId(r.who) === id
}).map((r: any) => String(r.src)))

/* ---- the deleted men, with the first day each is gone ---- */
export function deletedCutoffs(): Array<[string, string]> {
  const out: Array<[string, string]> = []
  for (const id of Object.keys(PEOPLE)) {
    const p: any = (PEOPLE as any)[id]
    if (p && p.deleted && p.deletedFrom) out.push([id, String(p.deletedFrom)])
  }
  return out
}
/* a stable signature of who is deleted from when — a memo keyed on a week's stored bytes must also key on this, or it
   serves an answer from before a delete (engine/weekstash.ts stashGroundBySrc) */
export function deletedSig(): string { return deletedCutoffs().map(([id, c]) => `${id}@${c}`).join(',') }
/* does week `v` (its Monday, dd/mm/yyyy) have a day on or after anyone's cutoff — i.e. would the overlay change anything */
export function deletedOverlayDue(v: string): boolean {
  const cuts = deletedCutoffs()
  if (!cuts.length || !v) return false
  const last = dayIso(String(v), 6)
  return cuts.some(([, c]) => last >= c)
}

/** A WEEK'S DAYS, A MAN DELETED WORKED OUT ON READ. `v` is the week's Monday (dd/mm/yyyy); `days` its seven day objects,
 *  changed in place; `book` (optional) the week's sign-offs, their bindings and its saved plans, each keyed by day
 *  index (the loaded week's SCHED.sign / SCHED.signBind / SCHED.drafts, or a saved week's sg / sb / dr). Returns true if
 *  anything changed. */
export function overlayDeletedWeek(v: string, days: any[], book?: { sign?: any; signBind?: any; drafts?: any }): boolean {
  if (!Array.isArray(days) || !deletedOverlayDue(v)) return false
  const cuts = deletedCutoffs()
  let changed = false
  for (let di = 0; di < days.length; di++) {
    const iso = dayIso(String(v), di)
    for (const [id, cut] of cuts) {
      if (iso < cut) continue
      const d = days[di]
      if (d && stripPersonFromDay(d, id, hisLanded(d, id))) changed = true
      if (book) {
        if (stripSign(book.sign && book.sign[di], book.signBind && book.signBind[di], id)) changed = true
        for (const t of ((book.drafts || {})[di] || [])) if (t) {
          if (stripPersonFromDay(t.d, id, hisLanded(t.d, id))) changed = true
          if (stripSign(t.sign, t.signBind, id)) changed = true
        }
      }
    }
  }
  return changed
}

/* ==== (c) A REQUEST'S ROW, WORKED OUT FROM THE REQUEST WHEN ITS DAY IS READ ([DB-READINESS] group A, phase 6 (c) v3 — plan
   docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md §3 (c); data-model.md §9 rule 9).

   In the database a day is written only by the scheduler holding it (D450). A member's filing, any edit of a request, a
   delete and a hand-over therefore write the REQUEST alone; what they do to the day — the request's row made, re-made or
   taken away — is worked out HERE, on a copy, whenever a week's days come into memory: the week on screen after every
   command and at every load (state/holderbase.ts, from the day as its holder last committed it — the holder base), a saved
   week read for the cross-week checks and the peek (weekstash.ts stashDays), a week never saved (weekctx.ts bundle,
   ui/peek.ts). One body, so the person who acted, a reload and another device all see the same day. Pure: it changes only
   the day objects it is handed — never a request, a mark or a record — and writes no history line (Fable F3).
   ==== */

/* THE SIX FIELDS A REQUEST WRITES ON ITS ROW — the one body acceptInput (a scheduler's Accept, the board's "+ Inputs"), a
   landing on read and a re-made row share, so the three cannot mint a row two ways. Title is the TYPE (an Other reads by
   its remarks), the submitter's remarks land in the row's remarks cell, `who` is the stable person id. */
export function requestRowFields(inp: any) {
  return {
    prog: inpLabel(inp).toUpperCase(),
    str: inp.allday ? '' : hhmm(inp.s), end: inp.allday ? '' : hhmm(inp.e),
    who: inp.person,
    rmks: inp.remarks || '', srcType: inp.type,
  }
}
/* `srcv` — what a row was last made or re-made from: a short hash of those six fields. A row whose `srcv` differs from its
   request's is re-made (rule 6); a scheduler's own edit of the row's cells leaves `srcv` alone, so it is not undone until
   the request itself changes (today's relink rule). Not canonical (restore.ts dayKeys never names it): it moves no digest,
   count or signature. */
export function srcvOf(inp: any): string {
  const f = requestRowFields(inp)
  const s = [f.prog, f.str, f.end, f.who, f.rmks, f.srcType].map(x => String(x ?? '')).join('|')
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return (h >>> 0).toString(36)
}
/* a landing's row id — the request's own, so the row a request lands is the SAME row right after the act and after a
   reload (a random id would change at every read). Never one another row of the week already holds (the holder's dead,
   `kept` row of the same request can carry it): a second copy would be re-minted by the next command's apply-end
   (rowids.ts ensureRowIds) — inside a member's command, a change to a day he may not make (§11) */
export function landedRid(iid: string, days: any[], taken?: Set<string>): string {
  /* …nor one a row of the days AS HANDED IN holds (`taken`): a request's row the view took away because the request moved
     to another day still sits in the holder's stored day with its id, and the holder base de-duplicates ids week-wide
     (rowids.ts ensureRowIds, first seen wins) — the landing would be re-minted at the new day's next save, and its marks
     lost with its old id (the FULL check, Fable's final read F1) */
  const held = new Set<string>(taken || [])
  for (const d of days || []) for (const g of ((d && d.ground) || [])) if (g && g.rid) held.add(String(g.rid))
  let rid = 'r' + iid, n = 2
  while (held.has(rid)) rid = 'r' + iid + 'x' + n++
  return rid
}

/* the requests by id, without minting one (a read never writes) */
function requestsById(): Map<string, any> {
  const m = new Map<string, any>()
  for (const r of INPUTS as any[]) if (r && r.iid) m.set(String(r.iid), r)
  return m
}
/* may a row for request `r` stand on a day dated `dt`: the request is an activity (a meeting, an appointment — isPersonal),
   covers the day, and is not filed under Unavailable. A request taken off ('r') still qualifies: its row stands as it is. */
export const rowMayStand = (r: any, dt: any): boolean => !!r && isPersonal(r.type) && r.acc !== 'u' && inputCoversDate(r, dt)
/* is this row its request's row, for "one request, one row": every row with `src` whose request can stand on its day —
   never a DEAD one (its request gone, or a `kept` row on a day its request cannot stand on: D363 keeps it on the day the
   version had it, but it is not the request's row). A read-only request's rows are left exactly as they are. */
export function standingRow(row: any, r: any, dt: any): boolean {
  if (!row || !row.src || !r) return false
  if (inputProtected(r)) return true
  return rowMayStand(r, dt)
}

/* THE REQUEST'S STANDING ROW ON ONE DAY — the row that is its row there, or undefined. Never a dead `kept` row (the holder's
   version row on a day its request cannot stand on — D363), which can sit in the same week as the request's real row once
   the request has come back to another day: every lookup that ACTS on "the request's row" (Accept's one-row guard, ✕, the
   OIL evidence, a load's leave-out) asks this, never the first row carrying its id (Astra's round-3 read, finding 1: the
   OIL evidence found the dead row, cancelled, first and paid nothing for the live one). `r`: the request, when the caller
   has it (found by id otherwise). */
export function standsOn(d: any, id: any, r?: any): any {
  const want = String(id || '')
  if (!want || !d) return undefined
  const req = r !== undefined ? r : (INPUTS as any[]).find((x: any) => x && String(x.iid || '') === want)
  return ((d.ground || []) as any[]).find((g: any) => g && String(g.src || '') === want && standingRow(g, req, d.dt))
}

export type ViewDayInfo = {
  /* the request rows differ from the day handed in (a row made, re-made or taken away — not the deleted strip) */
  reqChanged: boolean
  /* rows taken away, with why: the request gone, retyped to a kind that never goes on the programme, no longer covering
     the day, filed under Unavailable, or a second row for one request */
  gone: Array<{ src: string; why: 'gone' | 'type' | 'cover' | 'u' | 'dup' }>
  /* a re-made row whose new holder stood among its extras — blanked there (D271) */
  blanked: Array<{ src: string; who: string }>
  landed: string[]
}
export type ViewCtx = {
  /* this is the week on screen being worked out (its DAYS are the result), not another week read */
  loaded: boolean
  /* a PUBLISHED day's current issued version (its snapshot: `d` the day, `fil` the filings), else null */
  issued: (di: number) => any
  /* the book to strip a deleted man from (the week on screen's sign-offs and plans) */
  book?: { sign?: any; signBind?: any; drafts?: any }
}

/* ---- reconcile: each row with `src`, against its request (plan §3 (c) rules 1–7) ---- */
function reconcileRequestRows(days: any[], info: ViewDayInfo[]): void {
  const reqs = requestsById()
  const first = new Set<string>()                         // rule 7: the first standing row per request, in day order
  days.forEach((d: any, di: number) => {
    if (!d || !Array.isArray(d.ground) || !d.ground.some((g: any) => g && g.src)) return
    const keep: any[] = []
    for (const row of d.ground) {
      if (!row || !row.src) { keep.push(row); continue }
      const id = String(row.src), r = reqs.get(id)
      if (r && inputProtected(r)) { keep.push(row); first.add(id); continue }   // a read-only request: left as it is
      const may = rowMayStand(r, d.dt)
      /* 3. kept: while its request is gone or cannot stand here, the holder's version choice stands (a dead row); once
         the request can stand here again the row is its row again — the flag clears in the view (the stored row keeps
         it until the holder next saves the day) */
      if (row.kept) {
        if (!may) { keep.push(row); continue }
        delete row.kept                                   // not canonical: no mark rebuilt for it
      }
      if (!r) { info[di].gone.push({ src: id, why: 'gone' }); info[di].reqChanged = true; continue }            // 1.
      if (!may) {                                                                                                  // 2.
        info[di].gone.push({ src: id, why: !isPersonal(r.type) ? 'type' : r.acc === 'u' ? 'u' : 'cover' }); info[di].reqChanged = true; continue
      }
      if (first.has(id)) { info[di].gone.push({ src: id, why: 'dup' }); info[di].reqChanged = true; continue }     // 7.
      first.add(id)
      keep.push(row)
      if (r.acc === 'r') continue                                                                                 // 4.
      const sv = srcvOf(r)
      if (!row.srcv) { row.srcv = sv; continue }                                                                  // 5.
      if (row.srcv === sv) continue
      /* 6. re-made in place: its id, its place and every field a scheduler set (extras, flag, CX, information only) kept */
      const f: any = requestRowFields(r)
      /* THE NAME BOX IS THE SCHEDULER'S WHEN IT HOLDS SOMEONE OTHER THAN THE HOLDER — a man of his (D470: he earns from the
         row) or a placeholder (D46: its crowd does) — and is KEPT, as the extras are ([DB-READINESS] phase 7, Fable's final
         read F1). Writing the request's own man back at every re-make took the scheduler's man off the row at the member's
         next edit of his remarks — and, since D470, his OIL with him — with no line anywhere; state/holderbase.ts
         requestAddMarks already counts "a man of his in the name box" as the scheduler's change. A FORMER holder left in
         the box by a hand-over (the request's `leftAt` names him) gives way to the new one. Free text, or an id the roster
         no longer holds, is not somebody the scheduler placed: the request's man is written, as before. (Known edge: a
         former holder dragged back into the box deliberately is replaced at the next edit — the extras are his place.) */
      const w = whoId(row.who)
      const kept = !!w && w !== String(r.person) && !(r.leftAt && r.leftAt[w] != null) && (isSpecial(w) || !!(PEOPLE as any)[w])
      if (kept) delete f.who
      Object.assign(row, f); row.srcv = sv; info[di].reqChanged = true
      /* ONE MAN, ONCE PER ROW (D271): the request's holder standing among the extras is kept once, as the holder — when
         the name box is his; under another man's box (kept, above) the extras are where he stands */
      if (!kept && Array.isArray(row.more) && row.more.some((x: any) => whoId(x) === r.person)) {
        const more = row.more.map((x: any) => whoId(x) === r.person ? '' : x)
        trimTail(more)
        if (more.length) row.more = more; else delete row.more
        info[di].blanked.push({ src: id, who: String(r.person) })
      }
    }
    if (keep.length !== d.ground.length) d.ground = keep
  })
}

/* ---- land: an activity request with no row standing anywhere goes on its START day, if that day is in this week ---- */
function landRequests(days: any[], ctx: ViewCtx, info: ViewDayInfo[], taken?: Set<string>): void {
  const ordOf = days.map((d: any) => (d && d.dt != null ? dateOrd(d.dt) : null))
  const reqs = requestsById()
  const stands = (ds: any[], id: string) => ds.some((d: any) =>
    ((d && d.ground) || []).some((g: any) => g && String(g.src || '') === id && standingRow(g, reqs.get(id), d.dt)))
  /* OLDEST FIRST: a filing goes to the FRONT of the request list, so the list read backwards lands each request after the
     ones filed before it — a row never moves down a line because someone else filed (the board's "nothing re-orders
     itself", 10 Aug 26; the build before (c) appended each landing at its filing). Found by the FULL check's walk. */
  for (let i = (INPUTS as any[]).length - 1; i >= 0; i--) {
    const r = (INPUTS as any[])[i]
    if (!r || !r.iid || !isPersonal(r.type) || r.acc === 'r' || r.acc === 'u' || inputProtected(r)) continue
    const s0 = dateOrd(r.date, r.yr)
    if (s0 == null) continue
    const di = ordOf.indexOf(s0)
    if (di < 0) continue
    const id = String(r.iid)
    if (stands(days, id)) continue
    /* a week read that is not on screen: the loaded week's own rows stand too */
    if (!ctx.loaded && stands(DAYS as any[], id)) continue
    /* …and every other saved week's (the finder never lands, so this cannot recurse); unreadable fails closed */
    if (rowElsewhere(id, r) !== null) continue
    /* a PUBLISHED day: not a request its current issued version PLACED ON THIS DAY (its row is in the issued day — only
       the holder's Accept puts that one back, with its issued id: a read never undoes a load of an older version, D98),
       nor one it TOOK OFF ('r' at issue — D174 / D176: woken since, it stays unlanded, as before). Any other lands as a
       pending change: one filed since (the 16 Sep 26 rule, after a reload too), and one the issued day held unplaced
       while its row stood on another day it covers — re-dated onto this day since, it moves here, as the old re-link
       moved it (Fable's round-3 F2: keyed on the filing record alone, a request shortened onto a published day it already
       covered fell off the programme). */
    const snap = ctx.issued(di)
    /* (an issued row carrying `kept` was dead when it went out — the version did not place the request with it: the FULL
       check, Astra's final read #3) */
    if (snap && (((snap.d && snap.d.ground) || []).some((g: any) => g && String(g.src || '') === id && !g.kept) || (snap.fil || {})[id] === 'r')) continue
    const d = days[di]
    d.ground = d.ground || []
    d.ground.push({ ...requestRowFields(r), src: id, srcv: srcvOf(r), rid: landedRid(id, days, taken) })
    info[di].landed.push(id); info[di].reqChanged = true
  }
}

/** A WEEK'S DAYS WITH THEIR REQUEST ROWS WORKED OUT — (i) reconcile, (ii) the deleted men stripped (d), (iii) land. `v` is
 *  the week's Monday (dd/mm/yyyy), `days` its seven day objects (a COPY — changed in place). Returns what changed per day. */
export function viewOfWeek(v: string, days: any[], ctx: ViewCtx): ViewDayInfo[] {
  const info: ViewDayInfo[] = (days || []).map(() => ({ reqChanged: false, gone: [], blanked: [], landed: [] }))
  if (!Array.isArray(days)) return info
  const taken = new Set<string>()
  for (const d of days) for (const r of rowsOf(d || {})) if (r && r.rid) taken.add(String(r.rid))
  reconcileRequestRows(days, info)
  overlayDeletedWeek(String(v), days, ctx.book)
  landRequests(days, ctx, info, taken)
  return info
}
/* would a week read need the view's landing — some activity request, not taken off or filed, starts on one of its days.
   A cheap test so a never-saved week with nothing to land keeps its cached seed (weekctx.ts bundle). */
export function landingDue(v: string): boolean {
  const lo = +dayIso(String(v), 0).replace(/-/g, ''), hi = +dayIso(String(v), 6).replace(/-/g, '')
  for (const r of INPUTS as any[]) {
    if (!r || !isPersonal(r.type) || r.acc === 'r' || r.acc === 'u') continue
    const s0 = dateOrd(r.date, r.yr)
    if (s0 != null && s0 >= lo && s0 <= hi) return true
  }
  return false
}
/* the activity requests' signature — what a memo of a week's worked-out rows must also key on (the peek) */
export function requestsSig(): string {
  let s = ''
  for (const r of INPUTS as any[]) if (r && isPersonal(r.type)) s += `${r.iid}|${r.acc || ''}|${r.date}|${r.endDate || ''}|${r.yr || ''}|${srcvOf(r)};`
  return s
}
