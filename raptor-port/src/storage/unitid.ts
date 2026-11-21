// src/storage/unitid.ts
/* THE UNIT-QUALIFIED RECORD ID — the one encoding (multi-squadron batch 1, step 2; plan
   docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md §3.4 "Identity, end to end").

   Two squadrons keep their own schedule in one app, so a record that is a UNIT's (storage/keyowner.ts) carries its unit
   in its id: `<unit>@<its id today>` — `u149@13/07/2026#2` in the change stream, `u149@13-07-2026#2` as a stored week
   row, `u149@rules`, `u149@pp:<id>`. A unit id is opaque and plain (`u` and base-36 letters: no hyphen, no slash, no
   tilde, no colon, no hash, no `@`), so nothing that already reads a record id by its separators — a week id turned
   hyphen-to-slash, a version id's `~`, a day's `#`, an issued version's `:` — can mistake the unit for part of the date.
   The date part is read only AFTER the unit is split off: `localOf` is the one way to get back the id as it was before
   units, and every reader that turns a week id into a date asks it first (engine/verid.ts dayIso, engine/weeks-data.ts
   weekBundle, undo/derive.ts isoOfDay, state/persist.ts weekKey).

   Pure, no imports: the engine, the state layer, Undo and storage all read the same two functions, so the encoding is
   carried through every layer that names a unit's record — never added only at the storage edge (the red team's A4). */

export const UNIT_SEP = '@'
/** a unit's id: `u` then base-36 letters (the demo's u142, u149; state/units-model.ts mints the same shape) */
export const UNIT_ID_RE = /^u[0-9a-z]+$/

export const isUnitId = (u: unknown): u is string => typeof u === 'string' && UNIT_ID_RE.test(u)

/** `<unit>@<id>`. Refuses a malformed unit and an id that already names one — a record never carries two units. */
export function qualify(unit: string, id: string): string {
  if (!isUnitId(unit)) throw new Error(`unitid: not a unit id: ${String(unit)}`)
  const s = String(id)
  if (split(s).unit != null) throw new Error(`unitid: ${s} already names a unit`)
  return unit + UNIT_SEP + s
}

/** the unit an id names and the id as it was before units; `unit` null for an id that names none (a community
    record, or a bare week key the caller qualifies with the unit in view) */
export function split(id: string): { unit: string | null; local: string } {
  const s = String(id)
  const at = s.indexOf(UNIT_SEP)
  if (at > 0) {
    const u = s.slice(0, at)
    if (UNIT_ID_RE.test(u)) return { unit: u, local: s.slice(at + 1) }
  }
  return { unit: null, local: s }
}

export const unitOf = (id: string): string | null => split(id).unit
export const localOf = (id: string): string => split(id).local
/** the id qualified with `unit` unless it already names one (then it is returned as it is) */
export const ensureUnit = (unit: string, id: string): string => (split(id).unit != null ? String(id) : qualify(unit, id))
