/* [RALLY-PER-FORMATION] — the break list (the order's §8.4): every wired place broken once, the tests that must go red.
   Written as a module so its finds are exact source text with no JSON escaping; it writes rally-box.json beside it.
   Run: cd raptor-port && node scripts/handpass/breaks/rally-box.mjs && node scripts/handpass/breaks.mjs scripts/handpass/breaks/rally-box.json */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const E = 'src/engine/rallybox.test.ts', P = 'src/state/rallybox-publish.test.ts', U = 'src/ui/brieftime-ui.test.tsx'
const list = [
  { name: 'the R box read by the one reporting reader', file: 'src/engine/reporting.ts', find: 'const box=w.standalone?null:parseHM(f.rl);', put: 'const box=null as number|null;', tests: [E, P] },
  { name: 'the box replaces the whole-wave typed rally (D505)', file: 'src/engine/reporting.ts', find: 'if(own!=null&&!sc.some(p=>p.targets.some(t=>t.toLowerCase()===cs)))sc=[];', put: '', tests: [E] },
  { name: 'a standalone wave reads no rally', file: 'src/engine/reporting.ts', find: 'const box=w.standalone?null:parseHM(f.rl);', put: 'const box=parseHM(f.rl);', tests: [E] },
  { name: 'rl is a time key', file: 'src/engine/slots.ts', find: 'export const TIME_TXT=/\\.(to|ld|br|rl|str|end)$/;', put: 'export const TIME_TXT=/\\.(to|ld|br|str|end)$/;', tests: [E, U] },
  { name: 'the rally in the day’s fingerprint (the amendment)', file: 'src/engine/restore.ts', find: 'm.set(`ff:${di}.${gi}.${li}.rl`,T(f.rl));', put: '', tests: [E, P] },
  { name: 'the week draws the R box', file: 'src/ui/html.ts', find: "${ted(fp+'.rl',f.rl,ed,rlCls,'span',rlCls.includes('sugbox')?rlDefault:'')}", put: '', tests: [U, 'src/ui/html.test.ts'] },
  { name: 'the week heading R/B · TO/LD', file: 'src/ui/html.ts', find: "export const WEEK_TIME_HEAD=['R<br>B','TO<br>LD'] as const;", put: "export const WEEK_TIME_HEAD=['B<br>TO','LD'] as const;", tests: [U] },
  { name: 'the week moves TO under LD’s cell', file: 'src/ui/html.ts', find: "${ted(fp+'.to',f.to,ed,'tox','span')}${ted(fp+'.ld',f.ld,ed,'ntx')}", put: "${ted(fp+'.ld',f.ld,ed,'ntx')}", tests: [U, 'src/ui/schedule-tab.test.tsx'] },
  { name: 'the empty R box suggests the default rally (week)', file: 'src/ui/html.ts', find: "rlCls='rl'+(editableBr&&!rlTyped&&rlDefault?' sugbox':'');", put: "rlCls='rl';", tests: [U] },
  { name: 'the next-week peek draws the R', file: 'src/ui/peek.ts', find: '<span class="rl">${esc(f.rl || \'\')}</span>', put: '', tests: ['src/ui/peek.test.tsx', U] },
  { name: 'the board draws the R box', file: 'src/ui/board.ts', find: 'data-bfld="${fp}.rl"', put: 'data-bfld="${fp}.rlx"', tests: [U, 'src/ui/board-stores.test.tsx'] },
  { name: 'the board’s R placeholder is the default rally', file: 'src/ui/board.ts', find: 'const rlSug = !stoRO && !sa && parseHM(f.rl) == null && rlDefault ? fmtHM(rlDefault) : \'\'', put: 'const rlSug = \'\'', tests: [U] },
  { name: 'a tap places the suggestion', file: 'src/ui/interactions.ts', find: 'if (sg && canEditSched() && HOOKS.editMode() && (reselectPlaced(sg) || placeSuggestion(sg))) return', put: 'if (sg && false) return', tests: [U] },
  { name: 'the first keys replace a placed suggestion without the highlight', file: 'src/ui/interactions.ts', find: 'if (v.length > sug.length && v.startsWith(sug)) write(v.slice(sug.length))', put: '', tests: [U] },
  { name: 'a board box left holding the placed suggestion saves it', file: 'src/ui/interactions.ts', find: "if (el.isConnected && el.value === sug) el.dispatchEvent(new Event('change', { bubbles: true }))", put: '', tests: [U] },
  { name: '"+ In-time" ignores the R box (D1031)', file: 'src/ui/interactions.ts', find: "resolveReporting(w,{ ...f, rl: '' },", put: 'resolveReporting(w,f,', tests: [U] },
  { name: 'the export’s Rally column', file: 'src/ui/export.ts', find: "isStandalone(w) ? '' : fmtRally(f)", put: "''", tests: [U, 'src/ui/export.test.ts'] },
  { name: 'the printed PDF’s Rally column', file: 'src/ui/printpdf.ts', find: "      + `<td class=\"t\">${esc(r[IX['Rally']])}</td>`\n", put: '', tests: ['src/ui/printpdf.test.ts'] },
  { name: 'the changes window names "rally"', file: 'src/engine/editlog.ts', find: "br: 'brief', rl: 'rally',", put: "br: 'brief',", tests: ['src/ui/changesmodel.test.ts'] },
  { name: 'Undo says "a rally time"', file: 'src/undo/describe.ts', find: "rl: 'a rally time', ", put: '', tests: ['src/state/undo-wire.test.ts', 'src/ui/scbwords.test.ts'] },
  { name: 'the week header says "In-time / Rally" for an evening-before report', file: 'src/ui/html.ts', find: 'return night+(r!=null&&r<0?` · ${REPORT_WORD} ${stated(r,true)}`', put: 'return night+(r!=null&&r<0?` · ${REPORTING_LABEL} ${stated(r,true)}`', tests: ['src/ui/rally-feedback.test.tsx', 'src/ui/schedule-tab.test.tsx'] },
  { name: 'the Logic setting’s new name', file: 'src/ui/logic-html.ts', find: "{ name: 'Default rally before take-off', keys: ['reportLead']", put: "{ name: 'Report before take-off', keys: ['reportLead']", tests: ['src/ui/logic.test.tsx', 'src/ui/oilworkstart.test.tsx'] },
  { name: 'the Logic rule title (the pending list)', file: 'src/engine/rules.ts', find: "reportLead:{t:'Default rally before T/O", put: "reportLead:{t:'Nominal report before T/O", tests: ['src/ui/oilworkstart.test.tsx'] },
].map((m, i) => ({ n: i + 1, ...m }))
writeFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'rally-box.json'), JSON.stringify(list, null, 1))
console.log(list.length, 'breaks written')
