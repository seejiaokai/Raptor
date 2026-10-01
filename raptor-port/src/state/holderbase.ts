/* THE HOLDER BASE — the week on screen as its holder last committed it ([DB-READINESS] group A, phase 6 (c) v3 — plan
   docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md §3 (c) §2, §5, §8; round 2's dispositions, Astra 1).

   In the database a day is saved only by the scheduler holding it (D450), so a member's filing, an edit or a delete of a
   request, and a man deleted, write their own records only; what they do to a day is worked out on read
   (engine/overlay.ts viewOfWeek). For the week on screen that working-out must be REVERSIBLE: a member deletes his
   request, its row goes from the screen (nothing saved), he presses Undo — the row must come back exactly as the
   scheduler left it (its id, its place, his hand-set times, his extra crew), as a reload from the stored day would show
   it. So the week on screen is ALWAYS the view worked out from this base, never an overlay of an already-overlaid day.

   BASE[di] = { d: the day, m: its marks (the pending / changes / added keys naming it) }, for the loaded week only.
   - SET at every week load and at boot, from the stored week (or the seed), before anything is worked out (baseReset).
   - MOVES in the after-command pass for a day whose row the command wrote (its days / sched.book / sched.mutes record in
     the command's changes — exactly the days the row writer saves, state/persist.ts scheduleRows) and for a day whose
     live content or marks differ from what the last pass left (a change made outside every command). Such a day's base
     is first the live day, then — once the view is worked out — the VIEW itself: the holder saves the day overlay and
     all, and the row writer (a phase-9 consumer, reading the command layer's baseline as this pass leaves it) stores
     exactly that view. So BASE[di] is always the stored row.
   - NEVER moves for a request's or a person's command, their Undo / Redo, or a refused command (the pass runs at phase
     8, which a rolled-back command never reaches).
   The week's copy in memory written on the way out (store.ts weekStashSnap) is this base, so a return to the week, and
   every cross-week read of it, starts from what its holder committed — as a reload does. */
import { DAYS } from '../engine/data'
import { INPUTS, isPersonal } from '../engine/inputs'
import { CURWEEK } from '../engine/waves'
import { SCHED, dayApproved, dayCurVer, daySnapOf, protectedWeek } from '../engine/publish'
import { keyDay } from '../engine/keys'
import { posKey, ensureRowIds } from '../engine/rowids'
import { viewOfWeek, standingRow, standsOn, requestRowFields } from '../engine/overlay'
import { rebaseDayPending } from '../engine/drafts'
import { inputProtected } from '../engine/quarantine'
import { isPreservedWeek } from '../engine/weekstash'
import { PEOPLE, whoId } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import type { Change } from '../command'

type Marks = { p: Record<string, any>; c: Record<string, any>; ad: Record<string, any> }
type Base = { d: any; m: Marks }
let BASE: Base[] | null = null
let BASE_WEEK: string | null = null
/* what the last pass left, per day — the yardstick for a change made outside every command */
let LAST: string[] = []

const clone = (o: any) => (o == null ? o : JSON.parse(JSON.stringify(o)))
const MARKS: Array<[keyof Marks, 'pending' | 'changes' | 'added']> = [['p', 'pending'], ['c', 'changes'], ['ad', 'added']]
function marksOf(di: number): Marks {
  const m: Marks = { p: {}, c: {}, ad: {} }
  for (const [f, s] of MARKS) { const src = (SCHED as any)[s] || {}; for (const k of Object.keys(src)) if (keyDay(k) === di) m[f][k] = src[k] }
  return m
}
function setMarks(di: number, m: Marks): void {
  for (const [f, s] of MARKS) {
    const live = ((SCHED as any)[s] = (SCHED as any)[s] || {})
    for (const k of Object.keys(live)) if (keyDay(k) === di) delete live[k]
    Object.assign(live, clone(m[f]) || {})
  }
}
/* the day's whole saved record as the last pass left it — its content, its marks and the rest of its book (published or
   not, its sign-offs, its plans, its issued Original): a change to any of them is a save of the day by its holder, as the
   row writer reads it (a publish made outside a command, in a test, would otherwise leave the base without the rows it
   published) */
const sigOf = (di: number) => {
  const S: any = SCHED
  return JSON.stringify({ d: DAYS[di], m: marksOf(di),
    b: [(S.dayOK || {})[di], (S.sign || {})[di], (S.signBind || {})[di], (S.cur || {})[di], (S.curDraft || {})[di],
      (S.correcting || {})[di], (S.drafts || {})[di], (S.orig || {})[di]] })
}

/* A REQUEST'S NEW ROW ON A PUBLISHED DAY WEARS THE MARKS ITS ACCEPT GIVES IT — the add, on its item (engine/slots.ts
   acceptInput → markStructuralAdd `gr:di.ri.prog`). The rebuild against the issued version (drafts.ts rebaseDayPending)
   marks every box of a row the issued day lacks, so the same filing read one way as a member's (a pending outline on its
   start, end and remarks, a hollow ALn tag on its puck) and another as the scheduler's Accept, and the build before (c)
   drew the filing as Accept does. A box the scheduler has since set apart from what the request makes (his own time or
   words, a man of his on the row) keeps its mark: it is his change. Found by the FULL check's walk (P), 1 Oct 26. */
function requestAddMarks(di: number): void {
  const ver = dayCurVer(di), snap: any = ver != null ? daySnapOf(di, ver) : null
  const issued = new Set((((snap && snap.d && snap.d.ground) || []) as any[]).map((g: any) => g && g.rid).filter(Boolean))
  const d: any = DAYS[di]
  for (const row of ((d && d.ground) || []) as any[]) {
    if (!row || !row.src || !row.rid || row.kept || issued.has(row.rid)) continue
    const r = (INPUTS as any[]).find((x: any) => x && String(x.iid || '') === String(row.src))
    /* its STANDING row only: a dead kept row is the holder's addition, and keeps every mark it has (the FULL check, Astra's
       final read #4) */
    if (!r || inputProtected(r) || !standingRow(row, r, d.dt)) continue
    const f: any = requestRowFields(r)
    const drop: string[] = []
    for (const k of ['str', 'end', 'rmks']) if (String(row[k] || '') === String(f[k] || '')) drop.push(`gr:${di}.${row.rid}.${k}`)
    if (whoId(row.who) === r.person) drop.push(`g:${di}.${row.rid}`)
    for (const k of drop) delete SCHED.pending[k]
  }
}

/** the base is for THIS loaded week (a load or a boot set it) */
export function baseActive(): boolean { return !!BASE && BASE_WEEK === String(CURWEEK) }
/** the week load's and the boot's first step: the base is the week as it came into memory — the stored week (or the seed),
 *  before anything is worked out on it */
export function baseReset(): void {
  BASE = DAYS.map((d: any, di: number) => ({ d: clone(d), m: marksOf(di) }))
  BASE_WEEK = String(CURWEEK)
  /* the yardstick is the base itself, so the load's own pass absorbs nothing: what it works out (a row taken away because
     its request moved while the week was away, a request landed) stays out of the base, exactly as it stays out of the
     stored row — and giving the request back brings the stored row back, right after as after a reload */
  LAST = DAYS.map((_d: any, di: number) => sigOf(di))
}
/** the base's days and marks — the week's copy in memory written on the way out (store.ts weekStashSnap); null when no base */
export function baseSnapshot(): { d: any[]; marks: { c: any; p: any; ad: any } } | null {
  if (!baseActive()) return null
  /* a change made to the screen outside every command since the last pass is the holder's, as the next pass would take it */
  for (let di = 0; di < DAYS.length; di++) if (!BASE![di] || sigOf(di) !== LAST[di]) { BASE![di] = { d: clone(DAYS[di]), m: marksOf(di) }; LAST[di] = sigOf(di) }
  const marks = { c: {} as any, p: {} as any, ad: {} as any }
  /* a mark naming no day of the week (none today) is kept as the live book has it */
  for (const [f, s] of MARKS) { const src = (SCHED as any)[s] || {}; for (const k of Object.keys(src)) { const di = keyDay(k); if (di == null || !isFinite(+di) || !BASE![+di]) (marks as any)[f][k] = src[k] } }
  BASE!.forEach((b) => { for (const [f] of MARKS) Object.assign((marks as any)[f], b.m[f]) })
  return { d: BASE!.map(b => b.d), marks }
}

/** THE PASS — work the week on screen out from its base. `absorb`: the days a command's rows name (the after-command pass);
 *  `live`: said to the person (a command) or not (a load). Returns whether anything on screen changed. */
export function rederive(opts: { absorb?: Iterable<number>; live?: boolean } = {}): boolean {
  if (!baseActive()) return false
  /* a read-only (byte-preserved) week is shown as it is saved — nothing worked out on it (as (d), store.ts applyWeekModel) */
  if (isPreservedWeek(String(CURWEEK)) || protectedWeek()) { LAST = DAYS.map((_d: any, di: number) => sigOf(di)); return false }
  const base = BASE!
  const want = new Set<number>(opts.absorb || [])
  const absorbed = new Set<number>()
  for (let di = 0; di < DAYS.length; di++) {
    if (!base[di] || want.has(di) || LAST[di] == null || sigOf(di) !== LAST[di]) {
      base[di] = { d: clone(DAYS[di]), m: marksOf(di) }
      absorbed.add(di)
    }
  }
  base.length = DAYS.length
  /* every row of the base carries its id, minted ONCE here — a row taken in without one (made outside every command) would
     otherwise come back id-less at every pass, and the next command's apply-end would mint it inside that command: a day
     change in whoever's command came next — for a member, a change §11 refuses (Fable's round-3 F6) */
  ensureRowIds(base.map(b => b.d))
  /* the view, over a copy of the base; the book it strips a deleted man from (his sign-off, his seat in a parked plan) is
     the live one — a change there is a change on screen too (Fable's final read F2) */
  const bookWas = JSON.stringify([SCHED.sign, SCHED.signBind, SCHED.drafts])
  const days = base.map(b => clone(b.d))
  const info = viewOfWeek(String(CURWEEK), days, {
    loaded: true,
    issued: (di: number) => {
      if (!dayApproved(di)) return null
      const ver = dayCurVer(di)
      return (ver != null ? daySnapOf(di, ver) : null) || {}
    },
    book: { sign: SCHED.sign, signBind: SCHED.signBind, drafts: SCHED.drafts },
  })
  /* install it — only where the view differs, and IN PLACE: the day object keeps its identity (a caller holding
     `DAYS[di]` across a command writes to the day on screen, not to a copy no one reads); its fields are the view's. The
     screen before the pass is kept, shallow, for the messages below. */
  const prev = DAYS.map((d: any) => (d ? { ...d } : d))
  let changed = JSON.stringify([SCHED.sign, SCHED.signBind, SCHED.drafts]) !== bookWas
  for (let di = 0; di < days.length; di++) {
    if (JSON.stringify(days[di]) === JSON.stringify(DAYS[di])) continue
    const cur: any = DAYS[di]
    if (!cur || typeof cur !== 'object') DAYS[di] = days[di]
    else {
      /* field by field: a part of the day the view leaves as it was (its waves, when only a ground row changed) keeps its
         object too — a caller holding it across the command still holds the day's own */
      for (const k of Object.keys(cur)) if (!(k in days[di])) delete cur[k]
      for (const k of Object.keys(days[di])) if (JSON.stringify(cur[k]) !== JSON.stringify(days[di][k])) cur[k] = days[di][k]
    }
    changed = true
  }
  /* the marks, per day (Astra 2): the request rows unchanged from the base → the base's marks, exactly; changed on a
     PUBLISHED day → rebuilt from the view against its current issued version (a target state — A → B → A, an Undo, a
     delete → Undo all come back to the base's marks); changed on a day NOT published → the base's marks less any whose
     row is not in the view (a derived change there makes no mark — a never-published day's landings are its zero state) */
  for (let di = 0; di < DAYS.length; di++) {
    const before = JSON.stringify(marksOf(di))
    if (!info[di].reqChanged) setMarks(di, base[di].m)
    else if (dayApproved(di)) { rebaseDayPending(di); requestAddMarks(di) }
    else {
      const m = clone(base[di].m) as Marks
      for (const [f] of MARKS) for (const k of Object.keys(m[f])) if (posKey(k, DAYS) == null) delete m[f][k]
      setMarks(di, m)
    }
    if (JSON.stringify(marksOf(di)) !== before) changed = true
  }
  /* the requests' `acc`: 'r' and 'u' are a scheduler's decisions and stay; otherwise 'g' exactly when its row stands on the
     week on screen — what every load has always derived (store.ts applyWeekModel) */
  for (const r of INPUTS as any[]) {
    if (!r || inputProtected(r) || r.acc === 'r' || r.acc === 'u') continue
    const id = String(r.iid || '')
    const on = !!id && DAYS.some((d: any) => ((d && d.ground) || []).some((g: any) => g && String(g.src || '') === id && standingRow(g, r, d.dt)))
    if (on && r.acc !== 'g') { r.acc = 'g'; changed = true }
    else if (!on && r.acc) { delete r.acc; changed = true }
  }
  /* the days this command's rows name: their base is now what the row writer will store — the view */
  for (const di of absorbed) base[di] = { d: clone(DAYS[di]), m: marksOf(di) }
  LAST = DAYS.map((_d: any, di: number) => sigOf(di))
  /* said once, when it happens (never at a load, and never again at the next pass): a row taken away because its request
     was retyped to a kind that never goes on the programme; a re-made row's new holder kept once, as its holder (D271) */
  if (opts.live) {
    const said: string[] = []
    const onScreen = (d: any, src: string) => ((d && d.ground) || []).find((g: any) => g && String(g.src || '') === src)
    const told = new Set<string>()
    info.forEach((x, di) => {
      const had = (src: string) => onScreen(prev[di], src)
      /* a row on screen before this pass and not after, whose request is now a kind that never goes on the programme —
         a stored row taken away, or a landing no longer made; compared screen to screen, so it is said once. ITS row: a
         dead kept row (a version's row on a day the request no longer covers, D363) is neither the row that went nor
         one that keeps it on screen — it stays, and must not silence the sentence ([DB-READINESS] phase 6 (c), the FULL
         check: Astra's scenario design §3 D) */
      for (const g of ((prev[di] && prev[di].ground) || [])) {
        const src = g && String(g.src || '')
        if (!src || g.kept || told.has(src)) continue
        const r: any = (INPUTS as any[]).find((i: any) => i && String(i.iid || '') === src)
        if (!r || isPersonal(r.type) || DAYS.some((d: any) => standsOn(d, src, r))) continue
        told.add(src)
        said.push(`${r.type} does not go on the Ground Programme — its row has been removed`)
      }
      for (const b of x.blanked) {
        const was = had(b.src), now = ((DAYS[di] && DAYS[di].ground) || []).find((g: any) => g && String(g.src || '') === b.src)
        if (was && now && was.srcv !== now.srcv) said.push(`${PEOPLE[b.who] ? PEOPLE[b.who].cs : b.who} — already on this row as an extra · kept once, as its holder`)
      }
    })
    /* raised after the caller's own line ("Input updated", …), which would otherwise replace it before it could be read */
    for (const m of said) queueMicrotask(() => HOOKS.toast(m, 'warn'))
  }
  return changed
}

/** the days of the loaded week a command's changes name — its days / sched.book / sched.mutes records (the row writer's own
 *  rule, state/persist.ts scheduleRows) */
export function daysNamed(changes: readonly Change[]): Set<number> {
  const out = new Set<number>()
  const wk = String(CURWEEK)
  for (const c of changes || []) {
    if (c.collection !== 'days' && c.collection !== 'sched.book' && c.collection !== 'sched.mutes') continue
    const h = c.id.indexOf('#')
    if (h < 0 || c.id.slice(0, h) !== wk) continue
    const di = Number(c.id.slice(h + 1))
    if (di >= 0 && di <= 6) out.add(di)
  }
  return out
}
