// swd-w14d-report — builds walker w14d's step table from the cited runs' results (read only; prints the table to stdout).
// CITED: each size's main run, then any re-walk sub-folder named for the scenarios it replaces (W14D_CITED as JSON overrides).
// (swd-w14c-report, copied.)
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
console.log('<!-- VERSION swd-w14d-report 1 -->')
const ROOT = 'D:/raptor-work/c174-walk/w14d'
const CITED = process.env.W14D_CITED ? JSON.parse(process.env.W14D_CITED) : { desktop: [['run2', null], ['run3', ['a8b']], ['run4', ['e2']]], phone: [['run1p', null], ['run3p', ['a8b', 'd1']], ['run4p', ['e2']]] }
const rows = []
for (const [size, list] of Object.entries(CITED)) {
  const byScn = {}
  for (const [dir, only] of list) {
    const d = path.join(ROOT, dir)
    if (!existsSync(d)) continue
    for (const f of readdirSync(d).filter(f => /^results-.*-(desktop|phone|phone-chromium)\.json$/.test(f) && !/results-all/.test(f))) {
      const rs = JSON.parse(readFileSync(path.join(d, f), 'utf8'))
      if (!rs.length) continue
      const scn = rs[0].scn
      if (only && !only.includes(scn)) continue
      byScn[scn] = rs.map(r => ({ ...r, dir }))
    }
  }
  for (const rs of Object.values(byScn)) rows.push(...rs)
}
/* A8's "never a Fly offer saved on a no-fly day" was written into the plan with no ruling behind it: D642 (read whole) rules
   only that a no-fly day "still shows and takes OFT and AMT commitments"; none names Fly. So by D2611 it is RECORDED and put
   to him, never judged — the walker's call after the run, the screen's words kept whole (a8b, the no-cut control, shows the
   same save without any cut) */
for (const r of rows) if (r.id === 'a8.02' && (r.ok === true || r.ok === false)) { r.note = `[the walk's own check read ${r.ok ? 'PASS' : 'FAIL'} — RECORDED: no ruling names Fly on a no-fly day (D642 names OFT and AMT), D2611] ` + r.note; r.ok = 'REC' }
/* E2's changes-window reader matched no line (its selector was the script's guess); the picture, opened by the walker,
   shows the lines — RECORDED with the words read off the picture (see the sheet) */
const ORD =['b5', 'b6', 'a3', 'a4', 'a6', 'a8', 'a8b', 'a9', 'd1', 'd2', 'd3', 'e1', 'e2']; const order = s => (ORD.indexOf(s) < 0 ? 99 : ORD.indexOf(s))
rows.sort((a, b) => order(a.scn) - order(b.scn) || (a.size === b.size ? 0 : a.size === 'desktop' ? -1 : 1))
const verdict = ok => ok === true ? 'PASS' : ok === false ? 'FAIL' : ok === 'REC' ? 'RECORDED' : ok === 'NW' ? 'NOT WALKED' : 'note'
const esc = s => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ')
const judged = rows.filter(r => !/^set-up/.test(r.what || '') && !['today', 'errors'].includes(r.id))
const n = k => judged.filter(r => verdict(r.ok) === k).length
console.log(`COUNTS judged steps ${judged.filter(r => verdict(r.ok) !== 'note').length} · PASS ${n('PASS')} · FAIL ${n('FAIL')} · RECORDED ${n('RECORDED')} · NOT WALKED ${n('NOT WALKED')} · set-up ${rows.filter(r => /^set-up/.test(r.what || '')).length} · error watches ${rows.filter(r => r.id === 'errors').length} (failing ${rows.filter(r => r.id === 'errors' && r.ok === false).length})`)
console.log('| Step | Size | What was done | What the screen said | Result | Picture |')
console.log('|---|---|---|---|---|---|')
for (const r of rows) console.log(`| ${esc(['today', 'errors', 'stopped', 'ERR'].includes(r.id) ? r.scn + '.' + r.id : r.id)} | ${r.size} | ${esc(r.what)} | ${esc(String(r.note || '').slice(0, 600))} | ${verdict(r.ok)} | ${esc(r.pics ? r.dir + '/' + String(r.pics).split(', ').join(', ' + r.dir + '/') : '')} |`)
