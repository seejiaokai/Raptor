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
