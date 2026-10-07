/* walker Q — gather the raw part files of every run into docs/handpass/parts/stk2-Q.json, with the judged table on top. */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
const SC = process.env.Q_SCRATCH
const OUT = process.env.HP_OUT
const parts = {}
for (const f of readdirSync(SC).filter(f => /^out-.*\.json$/.test(f))) {
  const j = JSON.parse(readFileSync(`${SC}/${f}`, 'utf8'))
  for (const [k, v] of Object.entries(j.parts || {})) parts[`${f.replace(/^out-|\.json$/g, '')}:${k}`] = v
}
const judged = [
  ['R-01', 'PASS'], ['P3-01', 'PASS'], ['P3-02', 'PASS'], ['P3-04', 'PASS'], ['P3-05', 'PASS'], ['P3-07 (Board, Week)', 'PASS'],
  ['P3-08 (Board all cases; Week the cases that exist there)', 'PASS'], ['P3-16', 'PASS'], ['P3-18', 'PASS'], ['H-02', 'PASS'], ['H-03', 'PASS'],
  ['H-07', 'PASS'], ['X-01 (week, board, board on a phone)', 'PASS'], ['X-03', 'PASS'], ['X-04 (week, board)', 'PASS'], ['X-05', 'PASS'], ['X-09', 'PASS'],
  ['H-Q1 week Tue 14 Jul', 'PASS'], ['H-Q1 board Wed 15 Jul', 'PASS'], ['H-Q1 phone 390x844 week Tue 14 Jul', 'PASS'],
].map(([id, verdict]) => ({ id, verdict }))
writeFileSync(OUT, JSON.stringify({ walker: 'Q', base: process.env.HP_URL, at: new Date().toISOString(), judged, parts }, null, 1))
console.log('written', OUT, Object.keys(parts).length, 'parts')
