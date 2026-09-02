/* WHICH GROUPS THE ROSTER IS DRAWN IN, as data rather than a constant (owner,
   28 Aug 26 — "include a button here for admin, when they click it, they will
   be able to edit what sub category is shown on the left column. for example SC
   Day qualification, SC Night qualification. ETC").
 *
 * The seven built-in groups (SXO / IP / OPS P / IWSO / OPS W / OCU / Personnel)
 * were a closed union plus a fixed order. They are now the DEFAULT value of an
 * admin-owned list, and a group can also be a QUALIFICATION — every key in the
 * live catalogue is offerable, so the list grows on its own as the squadron
 * adds Quals-page columns ("take note when new qualifications are added this
 * list will also grow, to be selected").
 *
 * TWO ORDERS, deliberately (owner's choice when asked): `defs` is the
 * top-to-bottom DISPLAY order the admin drags into place, and `priority` is a
 * separate list deciding WHICH group claims someone who matches several. The
 * owner wanted them apart — how the grid reads and who-wins are different
 * questions, and tying them would make reordering the page silently re-home
 * people.
 *
 * "A person shows up ONCE" is not a rule bolted on top: `assignGroup` walks the
 * priority order and takes the first match, exactly the shape `groupOf` already
 * had. So putting a qualification above a CAT group is all it takes to get the
 * owner's "if theres a cat c column, but there is also a SC D column. They
 * should always show up in the qualifications column instead of CAT".
 *
 * Manning counts do NOT read any of this (`countsFor` never asks for a group) —
 * confirmed before building, and the owner confirmed he wants it that way. This
 * file is display only, exactly as the grouping it replaces was.
 */

import { heldQuals } from './availability'
import { groupOf, GROUP_LABEL, GROUP_ORDER, type Group, type Person } from './people'
import type { QualDef } from './requirements'

/** A group is either one of the seven built-ins, a qualification, or the special
 *  SANS group. The id of a built-in IS its old `Group` string, so every stored
 *  order, test id and CSS class (`group-SXO`, `g-sxo`) is unchanged by this
 *  feature. */
export type GroupDef =
  | { id: string; kind: 'cat'; g: Group }
  | { id: string; kind: 'qual'; k: string }
  | { id: string; kind: 'sans' }

/** The id a qualification group takes. Prefixed so it can never collide with a
 *  built-in's id, whatever a squadron calls a column. */
export const qualGroupId = (k: string) => `q:${k}`

/** The SANS group's id (owner, 3 Sep 26 — SANS shown as their own category at the
 *  foot). It is NOT one of the offerable groups and is never stored: the store
 *  injects it into the display/priority orders while `showSans` is on and drops it
 *  when off, so it can never be dragged, removed or persisted like the others. */
export const SANS_GROUP_ID = 'SANS'
export const SANS_GROUP: GroupDef = { id: SANS_GROUP_ID, kind: 'sans' }

/** Where people who match NOTHING land. Always last, never removable: an admin
 *  who builds a list of only qualification groups would otherwise strand
 *  everyone else with no row at all — they must still be on the grid. */
export const OTHER_ID = 'OTHER'
export const OTHER_LABEL = 'Everyone else'

/** The default list: the seven built-ins, in the owner's own 18 Aug order. */
export const DEFAULT_GROUPS: GroupDef[] = GROUP_ORDER.map(g => ({ id: g, kind: 'cat' as const, g }))

/** Every group an admin can choose from: the seven built-ins plus one per
 *  qualification in the live catalogue. Built fresh from the catalogue, so a
 *  new Quals column appears here the moment anyone is ticked for it. */
export function offerableGroups(catalog: readonly QualDef[]): GroupDef[] {
  return [
    ...DEFAULT_GROUPS,
    // SANS is surfaced as its own group by the Show SANS switch (`showSans` →
    // SANS_GROUP), so the `san` qualification is NOT offered as an ordinary group
    // too — two "SANS" chips would only confuse (owner, 3 Sep 26).
    ...catalog.filter(q => q.k !== 'san').map(q => ({ id: qualGroupId(q.k), kind: 'qual' as const, k: q.k })),
  ]
}

/** What a group is called on screen. A qualification takes the catalogue's own
 *  heading (the Quals page's words), falling back to the key upper-cased for a
 *  column the catalogue has not caught up with. */
export function groupLabel(d: GroupDef, catalog: readonly QualDef[]): string {
  if (d.kind === 'sans') return 'SANS'
  if (d.kind === 'cat') return GROUP_LABEL[d.g]
  return catalog.find(q => q.k === d.k)?.label ?? d.k.toUpperCase()
}

/** Whether a person belongs in this group AT ALL — before priority decides who
 *  claims them. A built-in asks the original `groupOf`; a qualification asks
 *  whether they hold the key (`heldQuals` — the same predicate the counter
 *  filters use, so "qualified" means one thing in this app). */
export function matchesGroup(p: Person, d: GroupDef): boolean {
  if (d.kind === 'sans') return !!p.san
  return d.kind === 'cat' ? groupOf(p) === d.g : heldQuals(p).has(d.k)
}

/**
 * The ONE group a person is drawn in. Walks `priority` (ids, most-important
 * first), returns the first group they match; `OTHER_ID` when nothing does.
 *
 * With the default list this returns exactly what `groupOf` returned, because
 * the built-ins are mutually exclusive and cover everyone — so an untouched
 * squadron sees no change whatsoever.
 */
export function assignGroup(p: Person, defs: readonly GroupDef[], priority: readonly string[]): string {
  for (const id of priority) {
    const d = defs.find(x => x.id === id)
    if (d && matchesGroup(p, d)) return d.id
  }
  // Priority may be short or stale (a group added but not yet ranked): fall
  // back to the display order so a new group still claims its people.
  for (const d of defs) if (matchesGroup(p, d)) return d.id
  return OTHER_ID
}

/**
 * Heal a stored id order against the groups that actually exist: known ids
 * first in the stored order, then anything unnamed appended so a group can
 * never be lost by an order written before it existed. The same shape
 * `orderedManningIds` uses for the count rows.
 */
export function orderedGroupIds(defs: readonly GroupDef[], order: readonly string[]): string[] {
  const known = new Set(defs.map(d => d.id))
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of order) if (known.has(id) && !seen.has(id)) { out.push(id); seen.add(id) }
  for (const d of defs) if (!seen.has(d.id)) out.push(d.id)
  return out
}

/**
 * Drop group definitions that no longer make sense — a qualification group
 * pinned to a column the squadron has since deleted. Storage is untrusted and
 * the catalogue is live, so this runs on load and whenever the catalogue moves;
 * without it a stale group would draw an empty heading nobody can remove. The
 * built-ins are never dropped: they do not depend on the catalogue.
 */
export function pruneGroups(defs: readonly GroupDef[], catalog: readonly QualDef[]): GroupDef[] {
  const keys = new Set(catalog.map(q => q.k))
  // A qualification group survives only while its column still exists; built-ins
  // and the special SANS group do not depend on the catalogue.
  return defs.filter(d => d.kind !== 'qual' || keys.has(d.k))
}

/** Read an unknown value from storage as a group list, keeping only entries
 *  that are structurally sound. Anything else is discarded rather than trusted. */
export function readGroupDefs(v: unknown): GroupDef[] | null {
  if (!Array.isArray(v)) return null
  const out: GroupDef[] = []
  const builtIn = new Set<string>(GROUP_ORDER)
  for (const raw of v) {
    if (!raw || typeof raw !== 'object') continue
    const d = raw as any
    if (d.kind === 'cat' && typeof d.g === 'string' && builtIn.has(d.g)) {
      out.push({ id: d.g, kind: 'cat', g: d.g as Group })
    } else if (d.kind === 'qual' && typeof d.k === 'string' && d.k) {
      out.push({ id: qualGroupId(d.k), kind: 'qual', k: d.k })
    }
  }
  // de-dupe by id, first wins
  const seen = new Set<string>()
  return out.filter(d => (seen.has(d.id) ? false : (seen.add(d.id), true)))
}
