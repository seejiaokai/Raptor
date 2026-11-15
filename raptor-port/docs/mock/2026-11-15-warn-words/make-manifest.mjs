/* assemble manifest.json from the runs' manifest.jsonl (last record for a file wins); print phone line counts, 3+ lines */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { OUT } from './ww-lib.mjs'
const m = new Map()
for (const l of readFileSync(OUT + '/manifest.jsonl', 'utf8').split('\n').filter(Boolean)) { const r = JSON.parse(l); m.set(r.file, r) }
const all = [...m.values()].filter(r => existsSync(OUT + '/' + r.file)).sort((a, b) => a.file.localeCompare(b.file))
writeFileSync(OUT + '/manifest.json', JSON.stringify({ made: '2026-11-15', server: 'local preview of the build, port 4391', note: 'Only a1-today-* is a real state as it stands; a2-real-after-landing-* is the real list after typing a landing (reference). Every "proposed" picture and every b* family picture is DRAWN on the real warning list: b* clone real rows of Monday 13 Jul (red/amber/grey) and set the proposal\'s example words; the header count is recounted for the drawn rows. Proposed words include the cold-read corrections of 15 Nov 26.', pictures: all }, null, 1))
console.log('pictures', all.length)
for (const r of all.filter(r => /phone/.test(r.file) && r.lines)) {
  r.rows.forEach((t, i) => { if (r.lines[i] >= 3) console.log(r.file, r.lines[i], t.slice(0, 90)) })
}
