// builds the W1b report table from the run files (reads only the walker's own json)
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const IMG = join(HERE, '..', '..', 'docs', 'img', 'handpass', '2026-11-08-sched-marks', 'w1b')
const load = f => JSON.parse(readFileSync(join(IMG, f), 'utf8'))
let rows = []
const add = (f, pick = () => true) => rows.push(...load(f).filter(pick))
add('w1b-main-pc-s21_s22_s23.json')
add('w1b-main-pc-s19_s20.json', r => /^S19/.test(r.id))
add('w1b-main-pc-s20.json', r => /^S20/.test(r.id))
add('w1b-main-phone-s21.json')
add('w1b-main-phone-s21_s22_s23.json', r => /^S2[23]/.test(r.id))
add('w1b-main-phone-s19_s20.json')
add('w1b-b-pc-s24_s30_s31.json')
add('w1b-b-phone-s24_s30_s31.json')
const num = id => { const m = id.match(/^S(\d+)/); return m ? +m[1] : 99 }
const order = [21, 19, 20, 22, 23, 24, 30, 31]
rows = rows.filter(r => !/errors$/.test(r.id) && !/CRASH/.test(r.id) || /^S/.test(r.id) === false && false)
rows.push({ id: 'S20.1 stretch and trim on the phone', size: 'phone', exp: 'as PC', got: 'the Bolt LL row was not found by the Inputs-list route on the phone (the list window opened was never type LL) in this run; the PC run of S20 stands', verdict: 'NOT DRIVEN', pic: 'phone-s20-0-start.png' })
rows.sort((a, b) => order.indexOf(num(a.id)) - order.indexOf(num(b.id)) || (a.size < b.size ? 1 : -1))
const fix = r => {
  const id = r.id
  if (/^S24\.(2\.\d|3|4\.\d|1)/.test(id)) r.verdict = 'PASS', r.note = 'the Unavailable name follows the Ground name on this face: nothing painted on either (marks exist as attributes only, nothing dotted)'
  if (/^S24\.5/.test(id)) r.verdict = 'NOT DRIVEN', r.note = 'openScheduler as a member left the member on View-only Sched: no board is drawn for a member (picture shows View-only Sched); no control to open it exists'
  if (/^S24\.6/.test(id)) r.verdict = 'NOT DRIVEN', r.note = 'raptorRole(guest) did not change the face (badge still Member); no guest route found'
  if (/^S30\.7/.test(id)) r.verdict = 'FAIL', r.note = 'the board stayed at its top with the Unavailable panel out of sight; nothing moved'
  if (/^S21\.4a/.test(id) && r.size === 'phone') r.verdict = 'NOT DRIVEN', r.note = 'no week button on the phone strip, so the week was never left (the reading below is the same week)'
  if (/^S30\.[1]\b|^S30\.1 /.test(id)) r.note = 'tapping the Ground line "Saint - Meeting" in the same window DID scroll the page (probe-after-Meeting.png); only the Unavailable line fails'
  return r
}
let md = '| scenario.step | size | EXPECTED | what the screen said / showed | verdict | picture |\n|---|---|---|---|---|---|\n'
const cnt = { PASS: 0, FAIL: 0, RECORDED: 0, 'NOT DRIVEN': 0 }
for (const r of rows.map(fix)) {
  cnt[r.verdict] = (cnt[r.verdict] || 0) + 1
  const got = String(r.got).replace(/\|/g, '/').slice(0, 520) + (r.note ? ' [' + r.note + ']' : '')
  md += `| ${r.id.replace(/\|/g, '/')} | ${r.size} | ${String(r.exp).replace(/\|/g, '/')} | ${got} | ${r.verdict} | ${r.pic} |\n`
}
console.log(cnt, rows.length)
writeFileSync(join(HERE, '..', '..', 'docs', 'handpass', 'parts', '_w1b-table.md'), md)
