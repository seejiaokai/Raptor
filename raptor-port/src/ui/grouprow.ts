/* THE ONE ROW OF A SHARED INPUT, WHERE A PERSON MEETS IT (`[GROUP-INPUT-ONE-ROW]`; owner D661, D734; the plan
   docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §4.3, §4.5).

   Underneath, a shared input is one ground row a man (engine/grouprows.ts says which rows are one row, and whose pucks
   it draws). This module is the screen's side of that. */
import { DAYS } from '../engine/data'
import { INPUTS, inpId, isPersonal } from '../engine/inputs'
import { groundGroups } from '../engine/grouprows'
import { entryLines } from '../state/inputgroup'

/* A PLACE ON A ROW THAT IS NOT DRAWN RESOLVES TO THE ONE ROW (the plan §4.3). A member row that is not the lead draws no
   name box, no time boxes, no remark box and no "+ add" of its own — so a jump that names one of them (a tap on a line
   of the changes window, History's gold dot, a warning's click) goes to the lead's. A PUCK is drawn under its own
   row's key and is left as it is. Under Personal Inputs the line is addressed by its first record (`iu:<iid>`), so any
   of its people's inputs resolves to that one. Anything else — another kind of key, a row that stands alone, a row
   that is gone — comes back unchanged. */
export function leadKeyOf(key: any): string {
  const k = String(key)
  if (k.startsWith('iu:')) {
    const id = k.slice(3)
    const mine = (INPUTS as any[]).find(r => r && String(inpId(r)) === id)
    if (!mine || !mine.grp || !isPersonal(mine.type) || mine.acc === 'u') return k
    const line = entryLines((INPUTS as any[]).filter(r => r && isPersonal(r.type) && r.acc !== 'u')).find(l => l.includes(mine))
    return line && line.length > 1 ? `iu:${inpId(line[0])}` : k
  }
  const m = /^(gr?):(\d+)\.(\d+)(\..+)?$/.exec(k)
  if (!m) return k
  const [, pre, di, ri, rest] = m
  /* a puck's own place (`g:di.ri`, `g:di.ri.xN`) is drawn; only the row's boxes and its "+ add" are the lead's */
  if (pre === 'g' && rest !== '.+') return k
  const g = groundGroups(DAYS[+di!])[+ri!]
  return g && g.lead !== +ri! ? `${pre}:${di}.${g.lead}${rest || ''}` : k
}
