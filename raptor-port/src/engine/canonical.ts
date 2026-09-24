/* CANONICAL DAY CONTENT — Phase 1a, amendment-engine core build
   (docs/superpowers/specs/2026-09-12-amendment-core-build-plan.md §Phase 1;
   brief §5.0 keystone). ONE representation of a day's issued content, used
   identically by snapshot, diff and the signature digest.

   Source of truth for the field list: engine/schema.ts `Day`. Every top-level
   field is classified CANONICAL (part of the issued document — frozen, diffed,
   signed) or EXCLUDED (derived / restamped / a workspace arrangement / a join
   key — never part of the signed content). canonical.test.ts pins
   `canonical ∪ excluded == every Day field` so a new field cannot escape.

   Ordinary TS style (new file, not a ported engine body). */
import { dayKeys } from './restore'
import { ridKey, posKey, rowsOf } from './rowids'
import { groundOrder } from './order'

/* Part of the issued document. (`notes` and the four section-note fields are
   the positional note family — dayKeys addresses them by index; a stable note
   identity is Phase-2 work, tracked in the plan.) */
export const DAY_CANONICAL_FIELDS = [
  'notes', 'allhands', 'waves', 'sims', 'dutywaves', 'ground',
  'simnotes', 'prognotes', 'dutynotes', 'grndnotes',
] as const

/* NOT part of the signed content:
   - dow / dt / today  — calendar labels, re-stamped on load / restore / draft.
   - wc                — the flying-tally fallback text, rewritten every load
                         (including it would invalidate every signature at a
                         year boundary — brief §5.0).
   - secOrder / gman   — the scheduler's WORKSPACE arrangement of the day, not a
                         published property (owner: a section drag is
                         display-only; CLAUDE.md §Drag-reordering).
   - (row `rid`)       — the identity/join key, not content; handled per row,
                         never a Day top-level key.
   - oild / oilev      — the OIL evidence block ([OIL-AUTO-REMOVE] §9.2). Both
                         are excluded from the canonical FIELD map on purpose:
                         the block owns no row, so one key per fact would change
                         the digest and still emit no amendment item (canonicalDiff
                         ignores an address whose owning row rowKeyOf cannot
                         resolve). It rides its own always-present aggregate axis
                         instead — publish.ts `oilDelta`, the same shape as the
                         input-filing axis, which is likewise real content that
                         DAYS cannot express as a slot key. `oilev` is in addition
                         DERIVED, and present on issued snapshots only. */
export const DAY_EXCLUDED_FIELDS = [
  'dow', 'dt', 'wc', 'today', 'secOrder', 'gman', 'oild', 'oilev',
] as const

const U = '␟' // ␟ unit separator — matches the composite separator dayKeys uses
const S = (v: any) => String(v == null ? '' : v)

/* The full canonical content map, address → value. Built ON TOP of dayKeys (the
   existing slot-key projection, left untouched — it carries the parity- and
   pending-sensitive behaviour) PLUS the content-bearing fields dayKeys omits,
   each given a SYNTHETIC address (brief §5.0) so alAttr / the AL panel can paint
   and list a change with no slot cell of its own. The omitted fields (verified
   against restore.ts:dayKeys, 12 Sep): a wave's `standalone`/`noconf`, a
   formation's `shift` and its line-level `cxr`, and a duty block's `sa`/`noconf`.
   A DUTY ROW's `cxr` is NOT omitted — dayKeys folds it into the dr:...role
   composite (P2-IMPL-08), as ap:/fr: already do for theirs, so it needs no
   synthetic (the retired bxr: address). */
export function canonicalContent(d: any, di: any): Map<string, string> {
  const m = new Map(dayKeys(d, di))
  /* keep null distinct from '' (an unset override must not read as an explicit
     clear), matching dayKeys' JSON idiom for the composites we replace below. */
  const N = (v: any) => JSON.stringify(v == null ? null : String(v))
  /* DECOMPOSE the ar:/at: composites (Phase 2, P2-R2-03). dayKeys packs the
     formation override + an aircraft-index-ordered array into ONE value per
     formation, so a canonical diff joined at the formation rid would fake a
     formation change when two aircraft swap or one is deleted. Split into a
     formation-level override address (fa:/ft:) and a per-AIRCRAFT address
     (aa:/au:) so each joins by its own rid. dayKeys keeps its ar:/at: for the
     marks system; canonicalContent replaces them here.
     Every OTHER content-bearing field dayKeys once omitted — a wave's
     standalone/noconf, a formation's shift + line-cxr, a duty block's sa/noconf,
     a duty row's cxr, a ground row's src — now rides its OWN dayKeys row
     composite (restore.ts, P2-IMPL-08 / P2-REREVIEW-10), so the mark system sees
     it too and no canonicalContent-only synthetic (wx/fx/bx/bxr/gx) is needed. */
  ;(d.waves || []).forEach((w: any, gi: number) => {
    ;(w.formations || []).forEach((f: any, li: number) => {
      m.delete(`ar:${di}.${gi}.${li}`); m.delete(`at:${di}.${gi}.${li}`)
      m.set(`fa:${di}.${gi}.${li}`, N(f.area))
      m.set(`ft:${di}.${gi}.${li}`, N(f.atime))
      ;(f.aircraft || []).forEach((a: any, ai: number) => {
        m.set(`aa:${di}.${gi}.${li}.${ai}`, N(a.area))
        m.set(`au:${di}.${gi}.${li}.${ai}`, N(a.atime))
      })
    })
  })
  return m
}

/* A stable, order-independent digest of the canonical content: the contract a
   signature binds to and the basis of the publish trigger (digest(draft) !=
   digest(issued)). A canonical string (sorted address→value); a fixed-width
   hash can wrap this later without changing the contract. */
export function digest(d: any, di: any): string {
  return [...canonicalContent(d, di).entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([k, v]) => k + U + v)
    .join('\n')
}

/* =====================================================================
   THE CANONICAL DIFF (Phase 2 — the authoritative account of what a version
   changed vs the prior issued version). Joins rows by stable `rid` resolved
   INDEPENDENTLY in each snapshot (P2-R2-03), so an edit-then-move compares the
   same row and a deletion before a surviving row is attributed to the row that
   actually went. Three axes — VALUES (canonical field values), STRUCTURE (rid
   set-difference, ancestor-collapsing) and ORDER (per-section surviving-rid
   order) — mirroring the proven engine/drafts.ts:rebaseDayPending algorithm, but
   PURE (no SCHED mutation) and over canonicalContent rather than dayKeys. The
   input axis (filing fingerprint) is added by dayDelta in publish.ts, which owns
   INPUTS. Kept deliberately separate from rebaseDayPending: that stays the
   display-mark path; this is the record's authority.
   ===================================================================== */
export type DeltaKind = 'change' | 'add' | 'delete' | 'move' | 'input' | 'oil'
export interface DeltaEntry { addr: string; kind: DeltaKind; from?: string; to?: string }

/* every structural row with a stable id + parent, ancestor-collapsing — the
   same enumeration engine/drafts.ts uses; a row with no rid falls back to a
   positional token so a legacy/pristine day reduces to the old length diff. */
function enumRows(d: any, di: any): any[] {
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
/* the row-level key whose survival in the other walk means a variable-length
   sub-list key's ROW is still there (only who[]/more[]/pax[] can lose a key
   while the row survives) — the engine/drafts.ts:rowKeyOf mapping. */
const rowKeyOf = (k: string): string | null => {
  const c = k.indexOf(':'); const p = c < 0 ? '' : k.slice(0, c)
  const a = (c < 0 ? k : k.slice(c + 1)).split('.')
  if (!p) return `fr:${a[0]}.${a[1]}.${a[2]}.${a[3]}`
  if (p === 'a') return `ap:${a[0]}.${a[1]}.prog`
  if (p === 'd') return `dr:${a[0]}.${a[1]}.${a[2]}.role`
  if (p === 's') return `sr:${a[0]}.${a[1]}.${a[2]}.label`
  if (p === 'g') return `gr:${a[0]}.${a[1]}.prog`
  return null
}

export function canonicalDiff(prevD: any, newD: any, di: any): DeltaEntry[] {
  di = +di
  const out: DeltaEntry[] = []
  const newArr: any[] = []; newArr[di] = newD
  const prevArr: any[] = []; prevArr[di] = prevD
  const nowC = canonicalContent(newD, di), wasC = canonicalContent(prevD, di)
  const nowHasRids = rowsOf(newD).some((r: any) => r && r.rid)
  const wasHasRids = rowsOf(prevD).some((r: any) => r && r.rid)
  /* resolve a key to the SAME row's address in the other day, by rid; null =
     that row is absent there (a rid-bearing day honours null-as-absent, a
     legacy no-rid day position-pairs, exactly reconcile/rebase's rule). */
  const toPrev = (k: any) => { const p = posKey(ridKey(k, newArr), prevArr); return p != null ? p : (wasHasRids ? null : String(k)) }
  const toNow = (k: any) => { const p = posKey(ridKey(k, prevArr), newArr); return p != null ? p : (nowHasRids ? null : String(k)) }

  /* ---- VALUES (surviving rows) ---- */
  nowC.forEach((v: any, k: any) => {
    const pk = toPrev(k)
    if (pk == null) return                       // row absent from prev → an add, structure axis owns it
    if (!wasC.has(pk)) {                          // the OWNING ROW survives (pk resolved) but this address did not
      /* a new sub-cell on a surviving row: a variable-length crew slot grew
         (who[]/more[]/pax[]). The structure axis only sees whole rows and the
         hole loop below only sees removals, so without this a real addition to a
         surviving row yields an empty diff while the digest flips — an AL issued
         with diff:[] that recovery reads as nd=0 and can discard (P2-IMPL-06).
         Mirror the removal hole EXACTLY, including its guard: emit ONLY for a
         genuine sub-list key (rowKeyOf resolves) whose ROW still exists. A
         positional note (dn:) or any address the STRUCTURE axis already owns has
         no rowKeyOf and is left to that axis — otherwise appending one note would
         be counted twice (a change here AND an add below, P2-REREVIEW-09). */
      const rowK = rowKeyOf(String(k)); if (!rowK) return
      const rowPk = toPrev(rowK)
      if (rowPk != null && wasC.has(rowPk)) out.push({ addr: String(k), kind: 'change', from: '', to: String(v) })
      return
    }
    if (wasC.get(pk) !== v) out.push({ addr: String(k), kind: 'change', from: String(wasC.get(pk)), to: String(v) })
  })
  wasC.forEach((_v: any, k: any) => {
    const lk = toNow(k)
    if (lk == null || nowC.has(lk)) return        // row gone → structure; survives with a value → handled above
    const rowK = rowKeyOf(String(k)); if (!rowK) return    // a row-level key gone → structural
    const rowLk = toNow(rowK)
    if (rowLk != null && nowC.has(rowLk)) out.push({ addr: String(k), kind: 'change', from: String(wasC.get(k)), to: '' })  // who[]/more[]/pax[] hole on a surviving row
  })

  /* ---- STRUCTURE (rid set-difference, ancestor-collapsing) ---- */
  const nowRows = enumRows(newD, di), wasRows = enumRows(prevD, di)
  const nowIds = new Set(nowRows.map((r: any) => r.id)), wasIds = new Set(wasRows.map((r: any) => r.id))
  const addKey = (r: any): string => r.kind === 'wave' ? `wl:${di}.${r.gi}`
    : r.kind === 'formation' ? `ff:${di}.${r.gi}.${r.li}.cs`
    : r.kind === 'aircraft' ? `fr:${di}.${r.gi}.${r.li}.${r.ai}`
    : r.kind === 'programme' ? `ap:${di}.${r.i}.prog`
    : r.kind === 'sim' ? `sr:${di}.${r.simkind}.${r.i}.label`
    : r.kind === 'dutyblock' ? `dl:${di}.${r.wi}`
    : r.kind === 'duty' ? `dr:${di}.${r.wi}.${r.ri}.role`
    : `gr:${di}.${r.i}.prog`
  nowRows.forEach((r: any) => {
    if (nowIds.has(r.id) && wasIds.has(r.id)) return           // survivor
    if (wasIds.has(r.id)) return
    if (r.parent != null && !wasIds.has(r.parent)) return      // parent also added → its add covers it
    out.push({ addr: addKey(r), kind: 'add' })
  })
  wasRows.forEach((r: any) => {
    if (nowIds.has(r.id)) return
    if (r.parent != null && !nowIds.has(r.parent)) return      // parent also removed → collapsed into it
    out.push({ addr: addKey(r), kind: 'delete' })
  })
  /* notes carry no rid → plain length diff (positional) */
  const wasNotes = (prevD.notes || []).length, nowNotes = (newD.notes || []).length
  for (let i = wasNotes; i < nowNotes; i++) out.push({ addr: `dn:${di}.${i}`, kind: 'add' })
  for (let i = nowNotes; i < wasNotes; i++) out.push({ addr: `dn:${di}.${i}`, kind: 'delete' })

  /* ---- ORDER (per-section surviving-rid order; ground via effective display
     order so a gman-only reorder counts; from ACTUAL order, so move-and-move-back
     nets to nothing — P2-R2-01) ---- */
  const wasRidSet = new Set(rowsOf(prevD).map((r: any) => r.rid).filter(Boolean))
  const nowRidSet = new Set(rowsOf(newD).map((r: any) => r.rid).filter(Boolean))
  const movIf = (kind: string, nowArrR: any, wasArrR: any) => {
    const a = (nowArrR || []).map((r: any) => r.rid).filter((id: any) => id && wasRidSet.has(id))
    const b = (wasArrR || []).map((r: any) => r.rid).filter((id: any) => id && nowRidSet.has(id))
    if (a.length > 1 && a.join('') !== b.join('')) out.push({ addr: `mov:${di}.${kind}`, kind: 'move' })
  }
  movIf('wave', newD.waves, prevD.waves)
  movIf('programme', newD.allhands, prevD.allhands)
  movIf('dutyblock', newD.dutywaves, prevD.dutywaves)
  movIf('ground', groundOrder(newD.ground, newD.gman).map((x: any) => x.row), groundOrder(prevD.ground, prevD.gman).map((x: any) => x.row))
  ;[...new Set([...Object.keys(newD.sims || {}), ...Object.keys(prevD.sims || {})])].forEach((kind: any) => movIf('sim', (newD.sims || {})[kind], (prevD.sims || {})[kind]))
  const byRid = (arr: any) => { const m = new Map(); (arr || []).forEach((x: any) => { if (x && x.rid) m.set(x.rid, x) }); return m }
  const wWas = byRid(prevD.waves)
  ;(newD.waves || []).forEach((w: any) => { const ww = w.rid && wWas.get(w.rid); if (ww) {
    movIf('formation', w.formations, ww.formations)
    const fWas = byRid(ww.formations)
    ;(w.formations || []).forEach((f: any) => { const wf = f.rid && fWas.get(f.rid); if (wf) movIf('aircraft', f.aircraft, wf.aircraft) })
  } })
  const bWas = byRid(prevD.dutywaves)
  ;(newD.dutywaves || []).forEach((b: any) => { const wb = b.rid && bWas.get(b.rid); if (wb) movIf('duty', b.rows, wb.rows) })

  return out
}

/* =====================================================================
   THE COUNTING UNIT (owner, D109, 25 Sep 26 — "A move counts as one").
   canonicalDiff above is the RECORD — one entry per cell that differs, and it is
   what an amendment stores and what eligibility reads; D109 leaves it exactly as
   it is. This is the unit a PERSON counts it in, which every "N pending" reads
   (publish.ts dayPendingItems): a man, or a placeholder, taken off one place and
   put on another place of the same day is ONE change, where the record holds two
   cells; a swap is two; a man only taken off, or only added, is one; times, areas
   and remarks stay one per box.
   A PLACE is where a man stands, in the two shapes the day has. A SEAT holds one
   man: a flying seat, a sim's front or back seat, a duty desk's holder, a ground
   row's `who`. A LIST holds a crowd: a programme row's who-list, a duty row's
   extras, a ground row's extras, a sim row's passengers, a sim row's extras. A
   desk's holder and its extras are two places (Fable F1, Astra 1: folding them
   made a man moved from the holder box to the extras line count nothing), and a
   list closing up behind a man taken out is not a change of its own. Places are
   named by ROW ID (ridKey), resolved in each day on its own, so a reorder never
   makes two different rows compare (the record's own rule, P2-R2-03).
   Pairing: per place, what it held and no longer holds is OFF, the reverse ON; a
   token OFF at one place and ON at another is one move. A place on a row that was
   ADDED or REMOVED takes part in the pairing — so a man dragged into a new row
   still reads as moved from where he was — but its left-over events are that
   row's add / delete, never counted twice; a pair needs at least one end on a row
   both sides share. Left-over events on a surviving place: on a LIST, one per
   man (two men taken off one row are two); on a SEAT, one for the seat — a man
   only taken off, only added, or a REPLACEMENT in the same seat (A → B, neither
   moved anywhere else) is one. That last is a gap D109 does not settle (Astra 1
   reads it as two), filed for him; one seat, one line reads as he says it.
   A place whose people changed with no man arriving or leaving still counts one
   (a list re-ordered), so the unit list is empty exactly when the record is — a
   count of 0 beside a "Publish AL" button is the one outcome this must never
   produce. */
export type UnitKind = DeltaKind | 'reseat' | 'people'
export interface PendUnit {
  kind: UnitKind
  /* where the change sits on the LIVE day, as the positional address the screens draw
     (data-slot / data-bfld), '' when nothing is left to point at (a removal, a reorder,
     a filing, the OIL block). `jump` lists fall-backs in order. */
  addr: string
  jump: string[]
  /* the rid-anchored addresses this unit covers — what the edit log is keyed by */
  keys: string[]
  entry?: DeltaEntry            // the record entry, for every unit that is not a person unit
  token?: string                // a 'reseat': the man (id) or placeholder that moved
  from?: string; to?: string    // a 'reseat': the place he left / arrived at (live positional)
  fromIssued?: string           // a 'reseat' out of a REMOVED row: where he was, in the issued day
  off?: string[]; on?: string[] // a 'people' unit: who left / arrived at this place (tokens)
  order?: boolean               // a 'people' unit: the same people, in a different order
  place?: string                // a 'people' unit: the place's positional address on the live day
}
/* the addresses that hold a man or a placeholder — the dayKeys grammar (restore.ts):
   a flying seat has no prefix; a:/d:/s:/g: are the programme, duty, sim and ground
   crews. sr:'s `who` is free text, never a person (ARCH-STACK 1C). */
export function isPersonAddr(a: any): boolean {
  const s = String(a), c = s.indexOf(':')
  if (c < 0) return /^\d+\.[^.]+\.[^.]+\.[^.]+\.[pw]$/.test(s)
  const p = s.slice(0, c)
  return p === 'a' || p === 'd' || p === 's' || p === 'g'
}
/* a SEAT's place is its own address; a LIST's ends in .L (extras / a who-list) or .P (a sim's passengers) */
function placeOf(k: string): string {
  const c = k.indexOf(':'); if (c < 0) return k            // a flying seat
  const p = k.slice(0, c), a = k.slice(c + 1).split('.')
  if (p === 'a') return `a:${a[0]}.${a[1]}.L`
  if (p === 'd') return a[3] != null ? `d:${a[0]}.${a[1]}.${a[2]}.L` : `d:${a[0]}.${a[1]}.${a[2]}`
  if (p === 'g') return a[2] != null ? `g:${a[0]}.${a[1]}.L` : `g:${a[0]}.${a[1]}`
  if (p === 's') return (a[3] === 'p' || a[3] === 'w') ? k : a[3] === 'pax' ? `s:${a[0]}.${a[1]}.${a[2]}.P` : `s:${a[0]}.${a[1]}.${a[2]}.L`
  return k
}
const isList = (pl: string) => /\.[LP]$/.test(pl)
/* the id of the row that owns a place — an aircraft for a flying seat */
function placeRow(pl: string): string {
  const c = pl.indexOf(':'), p = c < 0 ? '' : pl.slice(0, c), a = (c < 0 ? pl : pl.slice(c + 1)).split('.')
  if (!p) return String(a[3])
  if (p === 'a' || p === 'g') return String(a[1])
  return String(a[2])                                       // d: (block, row) · s: (kind, row)
}
/* a place's own cell, then its row's head — the jump's fall-backs, positional in `arr` */
function placeJump(pl: string, arr: any[]): string[] {
  const c = pl.indexOf(':'), p = c < 0 ? '' : pl.slice(0, c), a = (c < 0 ? pl : pl.slice(c + 1)).split('.')
  const L = isList(pl)
  const cand = !p ? [pl]
    : p === 'a' ? [`a:${a[0]}.${a[1]}.0`, `ap:${a[0]}.${a[1]}.prog`]
    : p === 'd' ? [...(L ? [`d:${a[0]}.${a[1]}.${a[2]}.x0`] : []), `d:${a[0]}.${a[1]}.${a[2]}`, `dr:${a[0]}.${a[1]}.${a[2]}.role`]
    : p === 'g' ? [...(L ? [`g:${a[0]}.${a[1]}.x0`] : []), `g:${a[0]}.${a[1]}`, `gr:${a[0]}.${a[1]}.prog`]
    : (a[3] === 'p' || a[3] === 'w') ? [pl, `sr:${a[0]}.${a[1]}.${a[2]}.label`]
    : [a[3] === 'P' ? `s:${a[0]}.${a[1]}.${a[2]}.pax.0` : `s:${a[0]}.${a[1]}.${a[2]}.x0`, `sr:${a[0]}.${a[1]}.${a[2]}.label`]
  return cand.map(k => posKey(k, arr)).filter((k: any): k is string => !!k)
}
/* per place, its cells (rid key → value) on one day */
function peopleOf(d: any, di: number): Map<string, Map<string, string>> {
  const arr: any[] = []; arr[di] = d
  const out = new Map<string, Map<string, string>>()
  dayKeys(d, di).forEach((v: any, k: any) => {
    if (!isPersonAddr(k)) return
    const rk = ridKey(k, arr), pl = placeOf(rk)
    let m = out.get(pl); if (!m) { m = new Map(); out.set(pl, m) }
    m.set(rk, String(v == null ? '' : v))
  })
  return out
}
/* the jump address of a record entry that is not a person cell: the cell itself, the
   area strip for the decomposed area / area-time addresses, nothing for the entries
   that have no cell left (a removal, a reorder, a filing, the OIL block) */
function entryJump(e: DeltaEntry): string[] {
  if (e.kind === 'delete' || e.kind === 'move' || e.kind === 'input' || e.kind === 'oil') return []
  const a = String(e.addr), c = a.indexOf(':'), p = c < 0 ? '' : a.slice(0, c), r = a.slice(c + 1).split('.')
  if (p === 'fa' || p === 'aa') return [`ar:${r[0]}.${r[1]}.${r[2]}`]
  if (p === 'ft' || p === 'au') return [`at:${r[0]}.${r[1]}.${r[2]}`]
  return [a]
}
export function canonicalUnits(prevD: any, newD: any, di: any): PendUnit[] {
  di = +di
  const diff = canonicalDiff(prevD, newD, di)
  const nowArr: any[] = []; nowArr[di] = newD
  const prevArr: any[] = []; prevArr[di] = prevD
  const out: PendUnit[] = []
  const personEntries: DeltaEntry[] = []
  diff.forEach((e: DeltaEntry) => {
    if (isPersonAddr(e.addr)) { personEntries.push(e); return }
    const jump = entryJump(e)
    /* the log key: a field's own address, rid-anchored in the live day (an area edit is
       logged under its ar:/at: strip, which is also where it jumps to) */
    const keys = jump.length ? jump.map(k => ridKey(k, nowArr)) : []
    out.push({ kind: e.kind, addr: jump[0] || '', jump, keys, entry: e })
  })
  if (!personEntries.length) return out

  const was = peopleOf(prevD, di), now = peopleOf(newD, di)
  const rowIds = (d: any) => new Set(rowsOf(d).map((r: any) => r && r.rid).filter(Boolean))
  const wasRows = rowIds(prevD), nowRows = rowIds(newD)
  /* which side(s) a place's row is on; a row with no id (a legacy day) pairs by position,
     canonicalDiff's own fallback */
  const side = (pl: string): 'both' | 'added' | 'removed' | 'none' => {
    const r = placeRow(pl); if (/^\d+$/.test(r)) return 'both'
    const w = wasRows.has(r), n = nowRows.has(r)
    return w && n ? 'both' : n ? 'added' : w ? 'removed' : 'none'
  }
  const bag = (m: Map<string, string> | undefined) => { const b = new Map<string, number>(); (m ? [...m.values()] : []).forEach(v => { if (v) b.set(v, (b.get(v) || 0) + 1) }); return b }
  const minus = (a: Map<string, number>, b: Map<string, number>) => { const o: string[] = []; a.forEach((n, v) => { for (let i = (b.get(v) || 0); i < n; i++) o.push(v) }); return o.sort() }
  const same = (a?: Map<string, string>, b?: Map<string, string>) => {
    const x = a || new Map(), y = b || new Map(); if (x.size !== y.size) return false
    for (const [k, v] of x) if (y.get(k) !== v) return false
    return true
  }
  type Ev = { tok: string; pl: string; both: boolean; used: boolean }
  const offs: Ev[] = [], ons: Ev[] = [], changed: string[] = []
  const places = [...new Set([...was.keys(), ...now.keys()])].sort()
  places.forEach(pl => {
    const sd = side(pl); if (sd === 'none') return
    const a = was.get(pl), b = now.get(pl)
    if (same(a, b)) return
    if (sd === 'both') changed.push(pl)
    const wb = bag(a), nb = bag(b)
    minus(wb, nb).forEach(tok => offs.push({ tok, pl, both: sd === 'both', used: false }))
    minus(nb, wb).forEach(tok => ons.push({ tok, pl, both: sd === 'both', used: false }))
  })
  const keysOf = (pl: string) => [...new Set([...(was.get(pl)?.keys() || []), ...(now.get(pl)?.keys() || [])])]
  const posOf = (pl: string) => placeJump(pl, nowArr)
  const person: PendUnit[] = []
  /* pair each man's departures with his arrivals, deterministically (place order): first
     between places both days share, then with a row added or removed — never two
     structural rows, whose adds and deletes already say it all */
  const pairPass = (ok: (o: Ev, n: Ev) => boolean) => offs.forEach(o => {
    if (o.used) return
    const to = ons.find(x => !x.used && x.tok === o.tok && x.pl !== o.pl && ok(o, x))
    if (!to) return
    o.used = true; to.used = true
    const toJ = posOf(to.pl), fromJ = posOf(o.pl)
    const fromIssued = fromJ.length ? '' : (placeJump(o.pl, prevArr)[0] || '')
    person.push({ kind: 'reseat', token: o.tok, addr: toJ[0] || '', jump: toJ, keys: [...keysOf(o.pl), ...keysOf(to.pl)], from: fromJ[0] || '', to: toJ[0] || '', fromIssued })
  })
  pairPass((o, n) => o.both && n.both)
  pairPass((o, n) => o.both || n.both)
  changed.forEach(pl => {
    const myOff = offs.filter(x => x.pl === pl), myOn = ons.filter(x => x.pl === pl)
    const left = myOff.filter(x => !x.used), came = myOn.filter(x => !x.used)
    const j = posOf(pl)
    const unit = (off: string[], on: string[], order = false): PendUnit =>
      ({ kind: 'people', place: j[0] || '', addr: j[0] || '', jump: j, keys: keysOf(pl), off, on, ...(order ? { order } : {}) })
    if (!myOff.length && !myOn.length) { person.push(unit([], [], true)); return }   // the same people, re-ordered
    if (!left.length && !came.length) return                                         // every man here moved — the moves carry it
    if (isList(pl)) { left.forEach(x => person.push(unit([x.tok], []))); came.forEach(x => person.push(unit([], [x.tok]))) }
    else person.push(unit(left.map(x => x.tok), came.map(x => x.tok)))
  })
  /* the invariant, belt and braces: a person cell differs, so something must count */
  if (!person.length) personEntries.forEach(e => { const j = [String(e.addr)]; person.push({ kind: 'people', place: j[0]!, addr: j[0]!, jump: j, keys: [ridKey(e.addr, nowArr)], off: e.from ? [e.from] : [], on: e.to ? [e.to] : [] }) })
  return out.concat(person)
}
