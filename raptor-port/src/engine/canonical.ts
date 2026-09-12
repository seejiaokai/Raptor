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
                         never a Day top-level key. */
export const DAY_EXCLUDED_FIELDS = [
  'dow', 'dt', 'wc', 'today', 'secOrder', 'gman',
] as const

const U = '␟' // ␟ unit separator — matches the composite separator dayKeys uses
const S = (v: any) => String(v == null ? '' : v)

/* The full canonical content map, address → value. Built ON TOP of dayKeys (the
   existing slot-key projection, left untouched — it carries the parity- and
   pending-sensitive behaviour) PLUS the content-bearing fields dayKeys omits,
   each given a SYNTHETIC address (brief §5.0) so alAttr / the AL panel can paint
   and list a change with no slot cell of its own. The omitted fields (verified
   against restore.ts:dayKeys, 12 Sep): a wave's `standalone`/`noconf`, a
   formation's `shift` and its line-level `cxr`, a duty block's `sa`/`noconf`,
   and a duty row's `cxr`. */
export function canonicalContent(d: any, di: any): Map<string, string> {
  const m = new Map(dayKeys(d, di))
  /* keep null distinct from '' (an unset override must not read as an explicit
     clear), matching dayKeys' JSON idiom for the composites we replace below. */
  const N = (v: any) => JSON.stringify(v == null ? null : String(v))
  ;(d.waves || []).forEach((w: any, gi: number) => {
    m.set(`wx:${di}.${gi}`, (w.standalone ? 1 : 0) + U + (w.noconf ? 1 : 0))
    ;(w.formations || []).forEach((f: any, li: number) => {
      m.set(`fx:${di}.${gi}.${li}`, S(f.shift) + U + S(f.cxr))
      /* DECOMPOSE the ar:/at: composites (Phase 2, P2-R2-03). dayKeys packs the
         formation override + an aircraft-index-ordered array into ONE value per
         formation, so a canonical diff joined at the formation rid would fake a
         formation change when two aircraft swap or one is deleted. Split into a
         formation-level override address (fa:/ft:) and a per-AIRCRAFT address
         (aa:/au:) so each joins by its own rid. dayKeys keeps its ar:/at: for the
         marks system; canonicalContent drops them for these. */
      m.delete(`ar:${di}.${gi}.${li}`); m.delete(`at:${di}.${gi}.${li}`)
      m.set(`fa:${di}.${gi}.${li}`, N(f.area))
      m.set(`ft:${di}.${gi}.${li}`, N(f.atime))
      ;(f.aircraft || []).forEach((a: any, ai: number) => {
        m.set(`aa:${di}.${gi}.${li}.${ai}`, N(a.area))
        m.set(`au:${di}.${gi}.${li}.${ai}`, N(a.atime))
      })
    })
  })
  ;(d.dutywaves || []).forEach((dw: any, wi: number) => {
    m.set(`bx:${di}.${wi}`, S(dw.sa) + U + (dw.noconf ? 1 : 0))
    ;(dw.rows || []).forEach((r: any, ri: number) => {
      if (r.cxr != null) m.set(`bxr:${di}.${wi}.${ri}`, S(r.cxr))
    })
  })
  /* ground[].src — the accepted-input linkage (P2-09). dayKeys omits it, yet it
     is canonical content: two ground rows identical on screen but linked to
     different inputs are genuinely different documents (slots.ts unaccept,
     store.ts INPUTS.acc→'g'). One synthetic address per ground row. */
  ;(d.ground || []).forEach((r: any, ri: number) => {
    m.set(`gx:${di}.${ri}`, S(r.src))
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
export type DeltaKind = 'change' | 'add' | 'delete' | 'move' | 'input'
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
    if (!wasC.has(pk)) return                     // sub-cell new on a surviving row → handled by structure/hole below
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
