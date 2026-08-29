import { DAYS } from './data'
import { SCHED, dayApproved } from './publish'
import { keyDay } from './keys'
import { store } from './hooks'
import { SECTIONS } from './order'
/* a captured section order, cleaned to known keys with no repeats — used both
   when minting a template off a live day and when loading a hand-edited file. */
const cleanSecOrder = (v: any): string[] | undefined => {
  if (!Array.isArray(v)) return undefined
  const seen = new Set<string>(), out: string[] = []
  for (const k of v) if (typeof k === 'string' && SECTIONS.indexOf(k) >= 0 && !seen.has(k)) { seen.add(k); out.push(k) }
  return out.length ? out : undefined
}

/* WHOLE-DAY SCHEDULE TEMPLATES (owner ask, 15 Aug 26 — "allow me to create
   master templates to be selected for scheduler board and edit schedule").
   dutytpl.ts mints one DUTY BLOCK; this mints an entire day's STRUCTURE — every
   section, every row, every time and callsign — with every person reference
   blanked, so applying one seats a whole day's shape in one tap and the
   scheduler still has to crew it. Same persisted-list shape as dutytpl/stores
   (save/load/reset against a HOOKS store key, an incrementing id past SEQ,
   untrusted-load sanitising), so the pattern that already proved itself twice
   is not re-invented a third time.

   A template's `d` field is an explicit ALLOWLIST of DAYS[di]'s fields, not a
   clone of the whole day object. Left OUT, deliberately:
     - dow / dt / today — the day's calendar identity. A template is reusable
       across days; baking in "Monday, Jul 13" would make every apply silently
       rewrite the target day's own date, which nothing here should ever do.
     - wc — NOT derived (waves.ts's dayCount only reads it as a fallback badge
       text for a day with zero waves; days that fly compute their badge off
       the waves themselves and never look at wc at all). But it is also not a
       property of the STRUCTURE a template captures: it is an authored label
       carried on the live day object itself, seeded once per day, the same
       kind of thing dow/dt are — so it stays with the day being edited, not
       the plan being stamped onto it, exactly like dow/dt/today.
   Everything else the day actually schedules — notes, the common programme,
   flying waves, sims, duty blocks, ground programme, and each section's own
   scheduler note — travels, with every person reference blanked out (see
   tplFromDay below) so the template is a shape, not a crew list. */

export type DayTplBlob = {
  notes: string[]
  allhands: any[]
  waves: any[]
  sims: Record<string, any[]>
  dutywaves: any[]
  ground: any[]
  simnotes: string
  prognotes: string
  dutynotes: string
  grndnotes: string
  /* the day's SECTION ORDER (owner, 29 Aug 26 — engine/order.ts secOrder), so a
     saved whole-day template remembers how the sections were arranged. Absent =
     the default canonical order, so old templates and default-order days carry
     nothing extra. It is display order only, never crew or content. */
  secOrder?: string[]
}
export type DayTpl = { id: string; title: string; d: DayTplBlob }

export const MAX_DAYTPL = 24, MAX_DAYTPL_TITLE = 24

/* NO FACTORY DAY TEMPLATES (owner ask): unlike DUTYTPL_STD's three seeded
   desks, a whole day is too specific to the squadron's own programme to guess
   at — the library opens empty and every entry is one the owner captured off
   a real day of his own. dayTplSave writes null (nothing) while it stays
   empty, the same "standard set → nothing persisted" idiom dutytpl/stores use
   for their seed, just with an empty seed instead of a populated one. */
export const DAYTPL_STD: readonly DayTpl[] = Object.freeze([])

export let DAYTPL_CFG: DayTpl[] = []

/* same incrementing-suffix id as dutytpl's SEQ, in its own counter and its own
   'dtN' namespace — the two libraries persist under different store keys and
   must never be able to collide even if ids from both ever met in one place
   (an export, a support screenshot, a bug report). */
let SEQ = 0
const newId = () => 'dt' + (++SEQ)

export function dayTplAreStandard() {
  return JSON.stringify(DAYTPL_CFG) === JSON.stringify(DAYTPL_STD)
}

/* ---- blanking a live day's structure into a template's `d` blob ---------
   Deep-clone first (so nothing here can reach back into the live DAYS[di]
   object), THEN walk the clone and blank/strip in place — cloning whole
   sections rather than hand-listing every field is what keeps callsigns,
   missions, times, areas, stores opts and labels intact automatically: only
   the fields named below are touched, everything else in the clone survives
   untouched exactly because nothing had to remember to copy it. */
function blankWho(w: any) { return Array.isArray(w) ? [] : '' }

function mintBlob(d: any): DayTplBlob {
  const notes: string[] = JSON.parse(JSON.stringify(d.notes || []))
  const allhands: any[] = JSON.parse(JSON.stringify(d.allhands || []))
  const waves: any[] = JSON.parse(JSON.stringify(d.waves || []))
  const sims: Record<string, any[]> = JSON.parse(JSON.stringify(d.sims || {}))
  const dutywaves: any[] = JSON.parse(JSON.stringify(d.dutywaves || []))
  const ground: any[] = JSON.parse(JSON.stringify(d.ground || []))

  /* CX / red-flag marks are stripped everywhere they can appear (owner ask):
     a template is a clean plan offered for a FUTURE day, not a record of one
     day's cancellations — carrying a.cx/f.cx/r.cx forward would seat a new
     day pre-cancelled for a reason (WX, a U/S jet, a sick crew) that belongs
     to the day the template was captured from, not the one it is about to be
     applied to. cxr (the typed CX reason) goes with it for the same reason. */
  allhands.forEach((r: any) => {
    r.who = blankWho(r.who)
    delete r.cx; delete r.cxr; delete r.flag
  })
  waves.forEach((w: any) => {
    ;(w.formations || []).forEach((f: any) => {
      delete f.cx; delete f.cxr
      ;(f.aircraft || []).forEach((a: any) => {
        a.p = ''; a.w = ''
        delete a.cx; delete a.cxr; delete a.flag
      })
    })
  })
  Object.keys(sims).forEach(kind => {
    ;(sims[kind] || []).forEach((r: any) => {
      delete r.cx; delete r.flag
      if ('p' in r) r.p = ''
      if ('w' in r) r.w = ''
      if (Array.isArray(r.pax)) r.pax = []
      if ('who' in r) r.who = ''
      if (Array.isArray(r.more)) r.more = r.more.map(() => '')
    })
  })
  dutywaves.forEach((b: any) => {
    ;(b.rows || []).forEach((r: any) => {
      r.id = ''
      delete r.cx; delete r.flag
      if (Array.isArray(r.more)) r.more = r.more.map(() => '')
    })
  })
  ground.forEach((r: any) => {
    r.who = ''
    delete r.cx; delete r.flag
    /* `src` ties an accepted-input ground row back to the specific personal
       input it was promoted from (slots.ts's acceptInput) — an identity
       reference exactly like a crewed seat, not part of the row's shape */
    delete r.src
    if (Array.isArray(r.more)) r.more = r.more.map(() => '')
  })

  return {
    notes, allhands, waves, sims, dutywaves, ground,
    simnotes: String(d.simnotes || ''),
    prognotes: String(d.prognotes || ''),
    dutynotes: String(d.dutynotes || ''),
    grndnotes: String(d.grndnotes || ''),
    /* a custom section arrangement travels with the template; a default-order
       day carries no d.secOrder, so this stays absent and the template is clean. */
    secOrder: cleanSecOrder(d.secOrder),
  }
}

/* the pure mint — builds a DayTpl from a live day without touching the
   library. addDayTpl (below) is the one that actually saves it; kept apart so
   a future caller (an import, a duplicate-as-new-template action) can mint
   without also being forced to grow the list. */
export function tplFromDay(di: number, title: string): DayTpl {
  const d = DAYS[+di] || {}
  return { id: newId(), title: String(title).slice(0, MAX_DAYTPL_TITLE) || 'Template', d: mintBlob(d) }
}

export function addDayTpl(di: number, title?: string): DayTpl | null {
  if (DAYTPL_CFG.length >= MAX_DAYTPL) return null
  const t = tplFromDay(di, title || `Template ${DAYTPL_CFG.length + 1}`)
  DAYTPL_CFG.push(t)
  return t
}

export function delDayTpl(id: string): boolean {
  const i = DAYTPL_CFG.findIndex(t => t.id === id)
  if (i < 0) return false
  DAYTPL_CFG.splice(i, 1)
  return true
}

export function renameDayTpl(id: string, title: string): boolean {
  const t = DAYTPL_CFG.find(t => t.id === id)
  if (!t) return false
  t.title = String(title).slice(0, MAX_DAYTPL_TITLE)
  return true
}

export function moveDayTpl(from: number, to: number): boolean {
  const n = DAYTPL_CFG.length
  if (!Number.isInteger(from) || !Number.isInteger(to)) return false
  if (from < 0 || from >= n || to < 0 || to >= n) return false
  const [row] = DAYTPL_CFG.splice(from, 1)
  DAYTPL_CFG.splice(to, 0, row!)
  return true
}

/* ---- applying a template to a day ----------------------------------------
   Mirrors restoreDayVersion's direct-write shape (engine/restore.ts:90-110),
   the sanctioned way to replace a live day object wholesale: build the new
   day, write DAYS[di] straight, drop the day's own pending/added marks so
   nothing dangles at an address the swap just retired, and do NOT histPush or
   reflow here — the caller's afterSchedMutate() is the one undo step, exactly
   the contract restoreDayVersion's callers already honour.
   REFUSES on a published day (returns false) — the caller toasts "Reopen the
   day first": a whole-day swap under a live, issued document would silently
   invalidate everything already signed and published about it, where every
   other structural write on a published day instead becomes the next
   amendment. A template replaces the DRAFT, not the record. */
export function applyDayTpl(di: number, id: string): boolean {
  di = +di
  if (dayApproved(di)) return false
  const t = DAYTPL_CFG.find(t => t.id === id)
  if (!t) return false
  const cur = DAYS[di]
  if (!cur) return false
  const nd: any = {
    dow: cur.dow, dt: cur.dt, today: cur.today, wc: cur.wc,
    notes: JSON.parse(JSON.stringify(t.d.notes)),
    allhands: JSON.parse(JSON.stringify(t.d.allhands)),
    waves: JSON.parse(JSON.stringify(t.d.waves)),
    sims: JSON.parse(JSON.stringify(t.d.sims)),
    dutywaves: JSON.parse(JSON.stringify(t.d.dutywaves)),
    ground: JSON.parse(JSON.stringify(t.d.ground)),
    simnotes: t.d.simnotes, prognotes: t.d.prognotes, dutynotes: t.d.dutynotes, grndnotes: t.d.grndnotes,
  }
  /* restore the section arrangement the template captured; absent ⇒ the new day
     has no d.secOrder and renders in the default order (secOrder handles both). */
  const so = cleanSecOrder(t.d.secOrder); if (so) nd.secOrder = so
  DAYS[di] = nd
  /* Every address the old day's marks pointed at may now name something else
     entirely (the swap does not try to line up old and new row indices), so
     the day's WHOLE mark state is retired — pending, added AND changes — the
     same three slices restoreDayVersion wipes (restore.ts:96-106) before it
     installs the restored version's own marks. A template has no issued marks
     of its own to reinstall (it is a clean plan, never an AL), so applyDayTpl
     just clears and installs nothing.
     The changes slice MUST go too, and this is the corner an earlier build
     missed: a template swap marks NOTHING pending (unlike an ordinary edit,
     which marks the one field it touched and so clears that field's changes
     mark on the way through markEdit). Left in place, every AL tint the day
     wore before it was reopened would survive onto the template's brand-new,
     unrelated rows — cells reading "changed in AL2" that AL2 never saw. The
     failure was: publish → AL1 tints a note → reopen → apply a template whose
     note differs → the new note still rendered in AL1 cyan (daytpl.test.ts). */
  Object.keys(SCHED.pending).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.pending[k] })
  Object.keys(SCHED.added || {}).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.added[k] })
  Object.keys(SCHED.changes).forEach((k: any) => { if (keyDay(k) === di) delete SCHED.changes[k] })
  return true
}

/* ---- persistence, identical shape to dutytpl/stores ----------------------
   Whole-library snapshot, only when it diverges from the (empty) standard
   set — an empty library writes null, same as an unedited stores/dutytpl
   list writes nothing at all. */
export function dayTplSave() {
  store.set('daytpl', dayTplAreStandard() ? null : DAYTPL_CFG.map(t => JSON.parse(JSON.stringify(t))))
}

/* Storage is hand-editable, so it is untrusted — same rigor as dutyTplLoad:
   every field is type-checked and clamped, a template missing its `d` blob
   entirely is dropped, and each allowlisted field of `d` is checked to be the
   array/string shape it must be or replaced with an empty one rather than
   trusting whatever sat in storage. Nothing here re-derives the CX/flag strip
   or the person-blanking — a template loaded from storage was, by
   construction, already saved in that shape by this module, so load only
   guards against a HAND-EDITED file, not against un-doing what save already
   did. If nothing valid survives, the library resets to empty explicitly,
   never left at whatever it held. */
function sanitiseBlob(raw: any): DayTplBlob {
  const arr = (v: any) => Array.isArray(v) ? v : []
  const str = (v: any) => typeof v === 'string' ? v : ''
  const simsIn = raw && typeof raw.sims === 'object' && raw.sims && !Array.isArray(raw.sims) ? raw.sims : {}
  const sims: Record<string, any[]> = {}
  Object.keys(simsIn).forEach(k => { sims[k] = arr(simsIn[k]) })
  return {
    notes: arr(raw && raw.notes).filter((n: any) => typeof n === 'string'),
    allhands: arr(raw && raw.allhands),
    waves: arr(raw && raw.waves),
    sims,
    dutywaves: arr(raw && raw.dutywaves),
    ground: arr(raw && raw.ground),
    simnotes: str(raw && raw.simnotes),
    prognotes: str(raw && raw.prognotes),
    dutynotes: str(raw && raw.dutynotes),
    grndnotes: str(raw && raw.grndnotes),
    secOrder: cleanSecOrder(raw && raw.secOrder),
  }
}

export function dayTplLoad() {
  const raw = store.get('daytpl', null)
  /* Advance SEQ past every literal 'dtN' id in the RAW blob BEFORE minting any
     replacement id — a hand-edited file can carry an id-less entry sitting
     ahead of an entry that literally reads 'dt1', and minting inside the loop
     with SEQ still at 0 would hand the id-less one 'dt1' too, colliding the two
     (delTpl/renameTpl/applyDayTpl all find by id and could then only ever reach
     the first). The post-loop pass alone cannot prevent that — it runs after
     the collision is already minted. */
  if (Array.isArray(raw)) raw.forEach((t: any) => {
    const m = t && typeof t.id === 'string' ? /^dt(\d+)$/.exec(t.id) : null
    if (m) SEQ = Math.max(SEQ, +m[1]!)
  })
  const out: DayTpl[] = []
  if (Array.isArray(raw)) for (const t of raw) {
    if (out.length >= MAX_DAYTPL) break
    if (!t || typeof t !== 'object' || !t.d || typeof t.d !== 'object') continue
    const id = typeof (t as any).id === 'string' && (t as any).id ? (t as any).id : newId()
    const title = typeof (t as any).title === 'string' ? (t as any).title.slice(0, MAX_DAYTPL_TITLE) : ''
    out.push({ id, title, d: sanitiseBlob((t as any).d) })
  }
  DAYTPL_CFG = out
}

export function dayTplReset() {
  DAYTPL_CFG = []
  store.set('daytpl', null)
}

/* the short read-only line both the picker menu and the manage modal print
   under a template's title — enough to tell two similarly-named templates
   apart without opening either, and the only "content" view a template gets
   outside of applying it (see DayTplModal.tsx's comment on why there is no
   row editor). */
export function dayTplSummary(t: DayTpl): string {
  const d = t.d
  const waves = d.waves.length, duty = d.dutywaves.length, ground = d.ground.length
  const sims = Object.values(d.sims).reduce((n: number, rows: any) => n + ((rows && rows.length) || 0), 0)
  return `${waves} wave${waves === 1 ? '' : 's'} · ${duty} duty block${duty === 1 ? '' : 's'}`
    + ` · ${ground} ground row${ground === 1 ? '' : 's'} · ${sims} sim${sims === 1 ? '' : 's'}`
}
