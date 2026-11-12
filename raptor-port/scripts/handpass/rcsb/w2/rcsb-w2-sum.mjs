/* rcsb-w2-sum v1 — prints the key fields of each W2 out.json (for writing the report). usage: node scripts/handpass/rcsb/w2/rcsb-w2-sum.mjs */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/w2')
const pick = (o, ks) => Object.fromEntries(ks.filter(k => o[k] !== undefined).map(k => [k, o[k]]))
const dirs = ['N1-phone', 'N2-ATTB-pc', 'N2-ATTC-pc', 'N2-ATTC-phone', 'N4-blank-pc', 'N4-blank-phone', 'N4-tbd-pc', 'N4-l1300-pc', 'N4-same1200-pc', 'N4-deb130-pc', 'N5e-pc', 'N6b-blank-pc', 'N6b-l1300-pc', 'N6b-l1300cs-pc']
for (const d of dirs) {
  const f = `${ROOT}/${d}/out.json`
  if (!existsSync(f)) { console.log('==', d, 'NO out.json'); continue }
  const o = JSON.parse(readFileSync(f, 'utf8'))
  console.log('==', d)
  const lg = o.logic ? { names: o.logic.names, cleared: o.logic.cleared } : undefined
  console.log(JSON.stringify(pick({ ...o, logic: lg, info: typeof o.info === 'string' ? (o.info.match(/Warning · [^W]*?(planned|rest)[^A]{0,200}/g) || []).join(' || ') : o.info, edit: (o.edit || []).map(e => e.text || e), hidden: undefined, afterUndo: o.afterUndo && o.afterUndo.head, afterRedo: o.afterRedo && o.afterRedo.head, afterReset: o.afterReset && o.afterReset.head, insights: o.insights && { conflicts: String(o.insights.conflicts).slice(0, 300), hasFlyingName: o.insights.hasFlyingName, hasPlanned: o.insights.hasPlanned }, publish: undefined, boardLineAttrs: undefined }, ['kind', 'man', 'case', 'seat', 'seatMon', 'seatTue', 'monFormation', 'tueTo', 'tueFormation', 'board', 'edit', 'info', 'infoClose', 'logic', 'insights', 'insightsClose', 'insightsEsc', 'view', 'editAfterPublish', 'marks', 'mondayPucks', 'restCount', 'sunFormation', 'seat2', 'week', 'noNextWeek', 'board02', 'afterUndo', 'afterRedo', 'afterReset', 'to01:00', 'to03:00', 'to04:00', 'errors', 'publish', 'filed', 'inputRow'])).slice(0, 3500))
}
