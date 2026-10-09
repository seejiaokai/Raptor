import { isSansAvail } from '../engine/inputs'
export type InputsMode = 'member' | 'sans'
export function inputsInMode(rows: any[], mode?: InputsMode): any[] {
  if (!mode) return rows
  return rows.filter(r => mode === 'sans' ? isSansAvail(r.type) : !isSansAvail(r.type))
}
/* WHO HAS COMMITTED ON A DATE is state/flyplan.ts sansCommittedOn since 8 Oct 26 (step 4): only a man the roster marks
   SANS, on it today, split by seat. The first build's `activityPeopleOn` / `flyingPeopleOn` counted by the input alone
   — a man since archived was still counted — and went with the screen that read them; their date, range, year and
   leap-day cases are pinned on the new count in state/sansfly.test.ts. */
