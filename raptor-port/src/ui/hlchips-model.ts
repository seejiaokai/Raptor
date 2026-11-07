/* The Highlight chips' three groups — the lists alone, moved whole out of ui/hlchips.tsx (8 Nov 26, React Doctor's
   only-export-components: a file of screen parts exports only screen parts). The strip (hlchips.tsx HlChips) and the
   Inputs calendar's puck picker (InputsCal.tsx) both read HL_GROUPS from here. */

/* THREE GROUPS behind three tabs (owner, 24 Aug 26 — "categorise them into CAT
   which includes A B C D Ocu, Then Type which consist of SANS, Ins, FL, SUP.
   Then Quals, which includes SXO, SC D, SC N, DAAR, NAAR, TF. So these sub
   categories will expand when selected"). Each tuple is [key, label, title];
   the key is what personMatchesCat (state/view.ts) reads, so adding a chip here
   is one edit, not two. OCU stays in CAT (it IS a rung on the A–D ladder), and
   SXO moved from the old tag row into Quals where the owner grouped it. */
const HL_CAT: [string, string, string][] = [
  ['A', 'A', 'Cat A (4-ship FL)'], ['B', 'B', 'Cat B (2-ship FL)'], ['C', 'C', 'Cat C (operational wingman)'], ['D', 'D', 'Cat D (wingman)'],
  ['OCU', 'OCU', 'OCU (ab-initio)'],
]
const HL_TYPE: [string, string, string][] = [
  ['SANS', 'SANS', 'SANS — staff-assigned & NS aircrew'], ['INS', 'Ins', 'Instructors (IW / IP / IR / FI)'],
  ['FL', 'FL', 'All flight leads (Cat A & B)'], ['SUP', 'SUP', 'Supervisors — Cat A & B'],
]
const HL_QUAL: [string, string, string][] = [
  ['SXO', 'SXO', 'SXO-qualified'], ['SCD', 'SC D', 'SC Day current'], ['SCN', 'SC N', 'SC Night current'],
  ['DAAR', 'DAAR', 'Day AAR qualified'], ['NAAR', 'NAAR', 'Night AAR qualified'], ['TF', 'TF', 'TF (terrain-following) qualified'],
]
/* exported so the calendar puck-picker renders the SAME three CAT/Type/Quals
   groups (owner, 24 Aug 26 — "arrange them just like … apply these to all
   pages"), each tab expanding its chips exactly as the strip does, rather than
   a second flat copy that could drift from these definitions. */
export const HL_GROUPS: [string, string, [string, string, string][]][] = [
  ['cat', 'CAT', HL_CAT], ['type', 'Type', HL_TYPE], ['quals', 'Quals', HL_QUAL],
]
/* every category key/label in one flat list — kept for any caller that wants
   the whole set (the puck-picker now reads HL_GROUPS instead, for the grouped
   tabs, but personMatchesCat still answers each key the same way). */
export const HL_CATS: [string, string, string][] = [...HL_CAT, ...HL_TYPE, ...HL_QUAL]
