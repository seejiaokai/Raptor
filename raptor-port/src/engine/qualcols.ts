/* THE LoX's COLUMN LIST — which qualifications the squadron uses, in which
   order (owner, 5 Aug 26: "Set which quals your squadron uses").

   It used to be the Quals page's own React state, which meant nothing outside
   that page could read it: Leave War built its qualification catalogue from
   what people HELD instead, so a column the admin had just added — held by
   nobody yet — did not exist for Leave War until someone was ticked (owner, 3
   Sep 26: "when i add a new qualification, i cant see that new qualification
   added in the settings page of leave war"). This module is the one list both
   apps read: the page renders it and writes it back; Leave War's projection
   (`leavewar/state/raptorRoster.ts:qualCatalogue`) takes its keys AND its
   headings from here, so a new column is offered the moment it is added and
   under the heading the admin typed.

   Column order is the owner's, left to right (5 Aug 26): SANS, SXO, SCHEDULER,
   SC DAY, SC NIGHT, DAAR, NAAR, NVG, IMC, TF — currency and appointments first,
   the flying qualifications after them. The flags (`lav`, `apt`, `scq`, `aar`,
   `fcpOnly`) are the page's rendering hints and travel with the column.

   SAVED with the settings since the storage seam (8 Sep 26 bug pass): the
   ticks beside it persist now, so a column that vanished on reload left its
   ticks orphaned under a key no heading named. `qualcols` is null while the
   list is the default ten, like every other settings key. */
import { store } from './hooks'

export type QualCol = {
  k: string
  h: string
  lav?: boolean
  apt?: boolean
  scq?: boolean
  aar?: boolean
  fcpOnly?: boolean
}

export const DEFAULT_QUAL_COLS: readonly QualCol[] = [
  { k: 'san', h: 'SANS', lav: true }, { k: 'sxo', h: 'SXO', lav: true },
  { k: 'sched', h: 'Scheduler', apt: true },
  { k: 'scDay', h: 'SC DAY', scq: true }, { k: 'scNight', h: 'SC NIGHT', scq: true },
  { k: 'daar', h: 'DAAR', aar: true, fcpOnly: true }, { k: 'naar', h: 'NAAR', aar: true, fcpOnly: true },
  { k: 'nvg', h: 'NVG', lav: true }, { k: 'imc', h: 'IMC', lav: true },
  /* TF is new (owner, 5 Aug 26) and starts UNHELD by everyone — nothing
     derives it from CAT the way IMC and NVG are derived, because no one has
     been signed off for it yet. Ticked by hand in edit mode, and no rule
     reads it: it is a record, not a gate, until the squadron asks for one. */
  { k: 'tf', h: 'TF', lav: true },
]

let cols: readonly QualCol[] = DEFAULT_QUAL_COLS

/** The live column list, in LoX order. Treat as read-only. */
export function qualCols(): readonly QualCol[] {
  return cols
}

/** Replace the list. Returns true when it actually changed (same keys, same
 *  headings, same order = no change), so the caller can notify only then —
 *  the page mirrors its state here on every render pass. No notify of its own:
 *  the engine does not import the store; the page that edits the LoX already
 *  calls Raptor's `notify`, which is the lane Leave War's re-projection rides. */
export function setQualCols(next: readonly QualCol[]): boolean {
  if (sameCols(next, cols)) return false
  cols = next
  store.set('qualcols', sameCols(cols, DEFAULT_QUAL_COLS) ? null : cols.map(c => ({ ...c })))
  return true
}

const sameCols = (a: readonly QualCol[], b: readonly QualCol[]) =>
  a.length === b.length && a.every((c, i) => c.k === b[i].k && c.h === b[i].h)

/** Untrusted storage → the list, or the default when the record is unusable.
 *  Called by initStore beside the other settings loaders. */
export function qualColsLoad(): void {
  const raw = store.get('qualcols', null)
  cols = DEFAULT_QUAL_COLS
  if (!Array.isArray(raw) || !raw.length) return
  const clean: QualCol[] = []
  for (const c of raw) {
    if (!c || typeof c !== 'object' || typeof c.k !== 'string' || typeof c.h !== 'string' || !c.k) return
    const col: QualCol = { k: c.k, h: c.h }
    for (const f of ['lav', 'apt', 'scq', 'aar', 'fcpOnly'] as const) if (c[f] === true) col[f] = true
    clean.push(col)
  }
  cols = clean
}

/** Tests only: back to the default ten. */
export function resetQualCols(): void {
  cols = DEFAULT_QUAL_COLS
}
