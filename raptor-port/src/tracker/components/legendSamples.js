/* The Legend's sample balls (owner D1007, D1018 — the words are his as drawn; any change to them is put to him first).
   In a file of their own, not Legend.jsx, so that file exports only its component (React Doctor's only-export-components,
   31 Oct 26 — a component file that also exports data cannot be hot-reloaded in place); trk-palette.test.ts pins each
   word to its kind from here. */

/* The centre — one sample ball per kind of event, its code as on the 2026 chart's own balls (as drawn). */
export const KINDS = [
  { type: 'flight', label: 'TR-1(P)', name: 'Flight' },
  { type: 'acad', label: 'ST-01', name: 'Acad / Spec' },
  { type: 'test', label: 'T-01', name: 'Test' },
  { type: 'sim', label: 'TR(S)-1', name: 'Sim' },
  { type: 'device', label: 'CFT-01', name: 'CFT / IAT / EPT' },
];
/* The ring — one sample per grade; `grade` null is a slice nobody has graded (white). */
export const GRADES = [
  { grade: 'dco', name: 'DCO' },
  { grade: 'dpco', name: 'DPCO' },
  { grade: 'marg', name: 'Marginal' },
  { grade: 'na', name: 'N.A.' },
  { grade: null, name: 'Not done' },
];
