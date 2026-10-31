// The four rows at the foot of the Manning block, top to bottom (ui/FlyRows.tsx draws them and has their whole story).
// Kept out of FlyRows.tsx so that file exports only components (React Doctor's only-export-components, D1534).

export type Seat = 'p' | 'w'
export type RowId = 'req-p' | 'req-w' | 'avail-p' | 'avail-w'
export const ROWS: readonly { id: RowId; seat: Seat; kind: 'req' | 'avail' }[] = [
  { id: 'req-p', seat: 'p', kind: 'req' },
  { id: 'req-w', seat: 'w', kind: 'req' },
  { id: 'avail-p', seat: 'p', kind: 'avail' },
  { id: 'avail-w', seat: 'w', kind: 'avail' },
]
/** each row's own testid, top to bottom */
export const FLY_ROW_KEYS: readonly string[] = ROWS.map(r => `fly-row-${r.id}`)
