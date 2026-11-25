// sah-w10-table — w10's report assembled: the results files of the final runs (newest run first, one row per scenario,
// size and step), the walker's own re-judgements of script mistakes (each named in the report), the deciding pictures
// copied into the repo, and D:'s head.md + the table written to docs/handpass/parts/sud/w10-report.md.
// Usage (from raptor-port/): node scripts/handpass/sah-w10-table.mjs
import { readdirSync, readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('sah-w10-table v2')
const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const D = 'D:/raptor-work/c152-walk/w10'
const dirs = ['run5', 'run4', 'run3', 'run2', 'run1'].map(r => path.join(D, r))
/* which run is cited for which scenario (an older run of the same scenario is a superseded attempt) */
const cite = { s22: 'run5', s11: 'run4', s18a: null, s18b: null, s18c: null, s16v1u: 'run2', s16v2u: 'run2', s16v3u: 'run2', s16v4u: 'run2', s16v1r: 'run2', s16v2r: 'run2', s16v3r: 'run2', s16v4r: 'run2', s12: 'run1', s12x: 'run1', s13: 'run1', s14: 'run1' }
const rows = [], seen = new Set()
for (const d of dirs) for (const f of readdirSync(d).filter(x => /^results-.*\.json$/.test(x)).sort()) {
  for (const r of JSON.parse(readFileSync(path.join(d, f), 'utf8'))) {
    const run = path.basename(d)
    if (cite[r.scn] && cite[r.scn] !== run) continue
    const k = r.scn + '|' + r.size + '|' + r.id
    if (seen.has(k)) continue
    seen.add(k); rows.push({ ...r, run })
  }
}
/* the walker's re-judgements (each one in the report's "Script mistakes" list) */
const re = {
  's11|desktop|s11-04': [true, 're-judged PASS by the walker: the judge looked for an upper-case "SIGNED"; the card read no pending chip and signed, as the picture shows'],
  's11|phone|s11-04': [true, 're-judged PASS by the walker: as the desktop'],
  's16v2u|phone|s162u-06': [true, 're-judged PASS: the script expected "July", the phone prints "Jul 2026"; the right day opened'],
  's16v4u|phone|s164u-06': [true, 're-judged PASS: as above'],
  's16v2r|phone|s162r-06': [true, 're-judged PASS: as above'],
  's16v4r|phone|s164r-06': [true, 're-judged PASS: as above'],
  's13|desktop|s13-11': [null, 'SCRIPT: the store read counted the demo world\'s own seeded SANS records; narrowed to Ranger\'s and Hex\'s, it passed at the phone size and everywhere after (the read itself shows ONE record of Ranger\'s)'],
  's12x|desktop|ERR':[null, 'SCRIPT: the clean-up after the last step pressed the SANS day ✕ under the open input window — not the app'],
  's12x|phone|ERR': [null, 'SCRIPT: as the desktop'],
}
for (const r of rows) { const k = `${r.scn}|${r.size}|${r.id}`; if (re[k]) { r.note = re[k][1] + ' ·· the script printed: ' + r.note; r.ok = re[k][0] } }
const order = ['s11', 's12', 's12x', 's13', 's14', 's16v1u', 's16v2u', 's16v3u', 's16v4u', 's16v1r', 's16v2r', 's16v3r', 's16v4r', 's18a', 's18b', 's18c', 's22']
rows.sort((a, b) => order.indexOf(a.scn) - order.indexOf(b.scn) || (a.size === b.size ? 0 : a.size === 'desktop' ? -1 : 1))
const verdict = ok => ok === true ? 'PASS' : ok === false ? 'FAIL' : ok === 'REC' ? 'RECORDED' : ok === 'NW' ? 'NOT WALKED' : 'NOTE'
const esc = s => String(s == null ? '' : s).replace(/\|/g, '/').replace(/\r?\n/g, ' ').replace(/\u001b\[\d+m/g, '').slice(0, 600)
const lines = ['| Scenario | Size | Step | What was done / expected | What the screen said (and read) | Result | Picture (run folder) |', '|---|---|---|---|---|---|---|']
const count = { PASS: 0, FAIL: 0, RECORDED: 0, 'NOT WALKED': 0, NOTE: 0 }
let pics = 0
for (const r of rows) {
  const v = verdict(r.ok); count[v]++
  if (r.pics) pics += String(r.pics).split(',').filter(x => x.trim()).length
  lines.push(`| ${r.scn} | ${r.size} | ${r.id} | ${esc(r.what)} | ${esc(r.note)} | ${v} | ${esc(r.pics)} (${r.run}) |`)
}
const steps = rows.filter(r => r.ok !== null && r.ok !== undefined).length
const fails = rows.filter(r => r.ok === false).map(r => `- **${r.scn} ${r.size} ${r.id}** — ${esc(r.what)} — ${esc(r.note).slice(0, 420)} — pictures: ${esc(r.pics)} (${r.run})`)
const errs = rows.filter(r => r.id === 'errors').map(r => `${r.scn}/${r.size}: ${r.ok ? 'none' : esc(r.note)}`)
const errLine = errs.every(e => /: none$/.test(e)) ? `None: no console error, page error or failed request in any of the ${errs.length} cited scenario runs (each run listed them; all empty).` : errs.join('\n- ')

/* the deciding pictures */
const PICK = {
  run1: ['s12-s12-07a-desktop.png', 's12-s12-07a-phone.png', 's12-s12-07e-desktop.png', 's12-s12-09a-desktop.png', 's12-s12-11a-desktop.png', 's12x-s12x-05-clip-desktop.png', 's12x-s12x-06-desktop.png', 's12x-s12x-06-phone.png', 's13-s13-04-18-desktop.png', 's13-s13-06-saved-desktop.png', 's13-s13-08-18-desktop.png', 's13-s13-08-18-phone.png', 's13-s13-09-saved-desktop.png', 's14-s14-08a-desktop.png', 's14-s14-08b-desktop.png', ['s11-s11-06d-desktop.png', 's11-s11-06d-desktop-run1.png']],
  run2: ['s16v1u-s161u-08-desktop.png', 's16v2u-s162u-08-desktop.png', 's16v3u-s163u-08-desktop.png', 's16v4u-s164u-08-desktop.png', 's16v4r-s164r-08-desktop.png', 's16v4u-s164u-08-phone.png', 's16v4u-s164u-10-tapped-desktop.png'],
  run4: ['s18a-s18a-05-desktop.png', 's18a-s18a-07-desktop.png', 's18a-s18a-10-desktop.png', 's18a-s18a-12-desktop.png', 's18b-s18b-05-desktop.png', 's11-s11-04-desktop.png', 's11-s11-06b-desktop.png', 's11-s11-06d-desktop.png', 's11-s11-08d-desktop.png', 's11-s11-14d-desktop.png', 's11-s11-25b-desktop.png', 's11-s11-06d-phone.png'],
  run5: ['s22-s22-05-desktop.png', 's22-s22-08-desktop.png', 's22-s22-11-desktop.png', 's22-s22-04-out-clip-desktop.png'],
}
const dest = path.join(ROOT, 'docs/img/handpass/2026-11-23-sans-ahead/w10')
mkdirSync(dest, { recursive: true })
const copied = []
for (const [run, list] of Object.entries(PICK)) for (const it of list) {
  const [from, to] = Array.isArray(it) ? it : [it, it]
  const src = path.join(D, run, from)
  if (!existsSync(src)) { copied.push(`- MISSING ${run}/${from}`); continue }
  copyFileSync(src, path.join(dest, to)); copied.push(`- \`${to}\` (from ${run})`)
}

const head = readFileSync(path.join(D, 'head.md'), 'utf8')
const counts = `**Counts (the cited runs):** ${steps} judged steps — ${count.PASS} PASS, ${count.FAIL} FAIL, ${count.RECORDED} RECORDED, ${count['NOT WALKED']} NOT WALKED; ${count.NOTE} notes (the app's today, script notes); ${pics} pictures cited in the table (plus every phone tap's own picture in each run's \`taps/\`); ${copied.filter(x => !/MISSING/.test(x)).length} copied into the repo.`
const out = head.replace('{{COUNTS}}', counts).replace('{{FAILS}}', '### Every FAIL, from the table\n' + (fails.join('\n') || 'none')).replace('{{ERRORS}}', errLine).replace('{{PICS}}', copied.join('\n'))
  + lines.join('\n') + '\n'
const rp = path.join(ROOT, 'docs/handpass/parts/sud/w10-report.md')
writeFileSync(rp, out)
console.log(rp, JSON.stringify(count), 'steps', steps, 'pics', pics, 'copied', copied.length, copied.filter(x => /MISSING/.test(x)).join(' '))
