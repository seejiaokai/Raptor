// collate walker B's part files into icard-B.json and icard-B.md (reads only; writes only those two)
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
const dir = 'docs/handpass/parts'
const files = readdirSync(dir).filter(f => /^icard-B-.*\.part\.json$/.test(f)).map(f => ({ f, t: statSync(dir + '/' + f).mtimeMs })).sort((a, b) => a.t - b.t)
const byN = new Map(), errs = new Set()
for (const { f } of files) {
  const d = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'))
  for (const e of d.errs || []) errs.add(e)
  for (const r of d.rows) byN.set(String(r.n), { ...r, part: f })
}
// the walker's own corrections, each with its reason (a script miss, not an app fact)
const OVERRIDE = {
  '49': { verdict: 'PASS', note: 'ALL AVAIL (row 49) and ALL (row 49b) walked in one script; 49b printed FAIL only because its own check counted the ALL AVAIL input already retitled "Changed title" in the same world (2 records with that title, one each) — a script miss; every screen fact in both runs agreed.' },
}
const order = [42, 39, 40, 43, 44, 30, 31, 33, 34, 35, 36, 38, 41, 45, 46, 47, 48, 49, 50, 51, 52, 53, 55, 57, 58]
// pictures I opened and looked at (a picture I did not open is not cited)
const OPENED = {
  42: ['B42-3-choose-replaces.png', 'B42-4-after-replaces.png', 'B42-4-day25-oml-tail.png', 'B42-7-keep-oml.png'],
  39: ['B39-1-refused.png'], 40: ['B40-1-refused.png'], 43: ['B43-2-day23-cards.png'], 44: ['B44-1-summary-before-save.png'],
  38: ['B38-1-ph-question.png'], 45: ['B45-1-range-refused.png'], 46: ['B46-3-viewer-two.png'], 47: ['B47-4-war-after-ranger.png'],
  48: ['B48-2-delete-question.png'], 49: ['B49-ALLAVAIL-range.png'], 50: ['B50-date-question.png'], 51: ['B51-1-after-bar-drag.png'],
  52: ['B52-mine-after-new-date-clash.png'], 53: ['B53-1-after-undo.png'], 55: ['B55-1-text-selected.png'], 57: ['B57-1-person-list.png'],
}
const rows = []
for (const n of order) {
  let r = byN.get(String(n))
  if (!r) { rows.push({ n, size: '-', role: '-', verdict: 'NOT RUN', saw: 'no result recorded', pics: [] }); continue }
  const o = OVERRIDE[String(n)]
  const b = byN.get(n + 'b')
  let saw = r.saw
  let verdict = r.verdict
  if (o) { verdict = o.verdict; saw = saw + ' || ' + (b ? 'ALL: ' + b.saw : '') + ' || NOTE: ' + o.note }
  rows.push({ n, size: r.size, role: r.role, verdict, saw, pics: OPENED[n] || [], savedPics: r.pics })
}
const counts = rows.reduce((a, r) => { a[r.verdict] = (a[r.verdict] || 0) + 1; return a }, {})
writeFileSync('docs/handpass/parts/icard-B.json', JSON.stringify({ walker: 'B', server: 'http://localhost:4232/', counts, rows, errors: [...errs] }, null, 1))
const clip = (s, n) => (s.length > n ? s.slice(0, n) + ' …' : s)
let md = `# Input card walk - walker B (10 Oct 26)\n\nServer http://localhost:4232/ (frozen build). Share: 42, 39, 40, 43, 44, 30, 31, 33, 34, 35, 36, 38, 41, 45, 46, 47, 48, 49, 50, 51, 52, 53, 55, 57, 58. Even numbers as Saber (admin) at 1440x900, odd numbers by touch at 390x844 (Ranger where it was his own input, Saber where it needed admin rights).\n\nCounts: ${JSON.stringify(counts)}\n\n| # | size | role | verdict | what the screen said | pictures opened |\n|---|---|---|---|---|---|\n`
for (const r of rows) md += `| ${r.n} | ${r.size} | ${r.role} | ${r.verdict} | ${clip(r.saw.replace(/\|/g, '/'), 700)} | ${r.pics.join(', ') || '(none opened)'} |\n`
md += `\n## Errors seen\n${errs.size ? [...errs].map(e => '- ' + e).join('\n') : 'No console errors, no page errors, no 4xx in any run.'}\n`
writeFileSync('docs/handpass/parts/icard-B.md', md)
console.log(JSON.stringify(counts), 'errors:', errs.size)
for (const r of rows) console.log(r.n, r.verdict)
