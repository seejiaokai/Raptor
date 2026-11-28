// swd-w14c-report — builds walker w14c's step table from the cited runs' results (read only; prints the table to stdout).
// CITED: each size's main run, then any re-walk sub-folder named for the scenarios it replaces (W14C_CITED as JSON overrides).
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
console.log('<!-- VERSION swd-w14c-report 1 -->')
const ROOT = 'D:/raptor-work/c174-walk/w14c'
const CITED = process.env.W14C_CITED ? JSON.parse(process.env.W14C_CITED) : { desktop: [["run1", null]], phone: [["run1p", null]] }
const rows = []
for (const [size, list] of Object.entries(CITED)) {
  const byScn = {}
  for (const [dir, only] of list) {
    const d = path.join(ROOT, dir)
    if (!existsSync(d)) continue
    for (const f of readdirSync(d).filter(f => /^results-.*-(desktop|phone)\.json$/.test(f) && !/results-all/.test(f))) {
      const rs = JSON.parse(readFileSync(path.join(d, f), 'utf8'))
      if (!rs.length) continue
      const scn = rs[0].scn
      if (only && !only.includes(scn)) continue
      byScn[scn] = rs.map(r => ({ ...r, dir }))
    }
  }
  for (const rs of Object.values(byScn)) rows.push(...rs)
}
/* A2's "no window on a day he cannot file for" was written into the plan beside a NOT RULED tap (D2340 rules only the
   reminder's tap): no ruling names it, so by D2611 it is RECORDED and put to him, never judged — the walker's call after
   the run, the screen's words kept whole */
const A2 = ['b8c.a2be', 'b8d.a2ae', 'a2c.3e']
for (const r of rows) if (A2.includes(r.id) && (r.ok === true || r.ok === false)) { r.note = `[the walk's own check read ${r.ok ? 'PASS' : 'FAIL'} — RECORDED: NOT RULED, D2611] ` + r.note; r.ok = 'REC' }
const ORD = ['b8a', 'b8c', 'b8cv', 'b8d', 'b10', 'b10m', 'a1', 'a2c', 'a5', 'a7', 'a10']; const order = s => (ORD.indexOf(s) < 0 ? 99 : ORD.indexOf(s))
rows.sort((a, b) => order(a.scn) - order(b.scn) || a.scn.localeCompare(b.scn) || (a.size === b.size ? 0 : a.size === 'desktop' ? -1 : 1))
const verdict = ok => ok === true ? 'PASS' : ok === false ? 'FAIL' : ok === 'REC' ? 'RECORDED' : ok === 'NW' ? 'NOT WALKED' : 'note'
const esc = s => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ')
const n = k => rows.filter(r => verdict(r.ok) === k).length
const pics = new Set(rows.flatMap(r => String(r.pics || '').split(', ').filter(Boolean)))
console.log(`COUNTS steps ${rows.filter(r => r.ok !== null && r.ok !== undefined).length} · PASS ${n('PASS')} · FAIL ${n('FAIL')} · RECORDED ${n('RECORDED')} · NOT WALKED ${n('NOT WALKED')} · notes ${n('note')} · pictures cited ${pics.size}`)
console.log('| Step | Size | What was done | What the screen said | Result | Picture |')
console.log('|---|---|---|---|---|---|')
for (const r of rows) console.log(`| ${esc(['today', 'errors', 'stopped', 'ERR'].includes(r.id) ? r.scn + '.' + r.id : r.id)} | ${r.size} | ${esc(r.what)} | ${esc(String(r.note || '').slice(0, 600))} | ${verdict(r.ok)} | ${esc(r.pics ? r.dir + '/' + String(r.pics).split(', ').join(', ' + r.dir + '/') : '')} |`)
