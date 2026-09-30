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
import { PEOPLE, whoId } from './people'
import { whoArr } from './slots'
import { dayIso } from './verid'
import { INPUTS, inpId } from './inputs'

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
const hisLanded = (d: any, id: string) => new Set<string>(((d && d.ground) || []).filter((r: any) => {
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
