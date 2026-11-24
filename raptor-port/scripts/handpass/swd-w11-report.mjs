// swd-w11-report — builds walker w11's step table from the cited runs' results (read only; prints the table to stdout).
// The cited run of each scenario: run 1, except the scenarios re-walked after a script fix (their own sub-folders).
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
console.log('<!-- VERSION swd-w11-report 1 -->')
const ROOT = 'D:/raptor-work/c156-walk/w11'
const CITED = {
  desktop: [['run1-d', null], ['run1-d/only-s5-s10e', ['s5c', 's10earlier-markall']], ['run1-d/only-s5-v4', ['s5a', 's5b']]],
  phone: [['run1-p', null], ['run1-p/only-rewalk', 's1a,s3a,s3b,s5a,s5b,s5c,s9later,s9undo,s9outcome,s10later-tap,s10later-markall,s10earlier-tap,s10earlier-markall,s10undo-tap,s10undo-markall,s10outcome-tap'.split(',')]],
}
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
const order = s => { const m = /^s(\d+)/.exec(s); return (m ? +m[1] : 99) * 1000 + s.charCodeAt(s.length - 1) }
rows.sort((a, b) => order(a.scn) - order(b.scn) || a.scn.localeCompare(b.scn) || (a.size === b.size ? 0 : a.size === 'desktop' ? -1 : 1))
const verdict = ok => ok === true ? 'PASS' : ok === false ? 'FAIL' : ok === 'REC' ? 'RECORDED' : ok === 'NW' ? 'NOT WALKED' : 'note'
const esc = s => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ')
const n = k => rows.filter(r => verdict(r.ok) === k).length
const pics = new Set(rows.flatMap(r => String(r.pics || '').split(', ').filter(Boolean)))
console.log(`COUNTS steps ${rows.filter(r => r.ok !== null && r.ok !== undefined).length} · PASS ${n('PASS')} · FAIL ${n('FAIL')} · RECORDED ${n('RECORDED')} · NOT WALKED ${n('NOT WALKED')} · notes ${n('note')} · pictures cited ${pics.size}`)
console.log('| Step | Size | What was done | What the screen said | Result | Picture |')
console.log('|---|---|---|---|---|---|')
for (const r of rows) console.log(`| ${esc(r.id === 'today' || r.id === 'errors' || r.id === 'stopped' || r.id === 'ERR' ? r.scn + '.' + r.id : r.id)} | ${r.size} | ${esc(r.what)} | ${esc(String(r.note || '').slice(0, 600))} | ${verdict(r.ok)} | ${esc(r.pics ? r.dir + '/' + String(r.pics).split(', ').join(', ' + r.dir + '/') : '')} |`)
