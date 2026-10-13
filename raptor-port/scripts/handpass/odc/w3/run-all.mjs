// W3: run every group script in turn, both sizes, into one log. node scripts/handpass/odc/w3/run-all.mjs
import { spawnSync } from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', '..', '..', '..')
console.log('w3 run-all VERSION 1')
for (const f of ['errors.log', 'results.ndjson']) try { rmSync(join(HERE, f)) } catch {}
writeFileSync(join(HERE, 'all.log'), '')
// one run, one folder: empty my own pictures folder first
import { readdirSync } from 'node:fs'
const PICS = join(ROOT, 'docs/img/handpass/2026-10-13-one-date-calendar/w3')
for (const f of readdirSync(PICS)) if (f.endsWith('.png')) rmSync(join(PICS, f))
const runs = [['groupA', 'desktop'], ['groupA', 'phone'], ['groupB', 'desktop'], ['groupB', 'phone'], ['groupC', 'desktop'], ['groupC', 'phone'], ['groupS8', 'desktop'], ['groupS8', 'phone'], ['groupD', 'desktop'], ['groupD', 'phone'], ['groupD2', 'phone'], ['groupE', 'desktop'], ['groupE', 'phone']]
for (const [g, size] of runs) {
  const r = spawnSync('node', [join(HERE, g + '.mjs'), size], { cwd: ROOT, encoding: 'utf8', timeout: 480000, maxBuffer: 1 << 26 })
  const out = `\n######## ${g} ${size} exit ${r.status}\n${r.stdout}${r.stderr}`
  writeFileSync(join(HERE, 'all.log'), out, { flag: 'a' })
  console.log(`${g} ${size}: exit ${r.status}`)
}
console.log('done')
