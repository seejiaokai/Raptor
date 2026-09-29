/* Bake the charts half of his exported file into the shipped charts — R26, his chart loop
 * (he exports charts, a session bakes them, he imports the charts-only file he gets back).
 *
 *   node scripts/tracker/bake-user-charts.mjs <file.json> [--dry-run]
 *
 * The rules are bake-lib.mjs (tested in src/tracker/leftovers.test.tsx on a file the app
 * itself exported). This command reads the file, bakes it, prints what it did, and — unless
 * --dry-run — writes the four blobs back into src/tracker/data/*.js, each ONE line (a regex
 * spanning export to export once deleted EVENT_INFO_BY_SYL, so only that line is replaced).
 * Repaired 28 Sep 26 ([TRK-BAKE-STALE]): it resolved `src/data/` from the wrong folder and read
 * the shapes the app used before its ids and per-chart details.
 * The smoke suite asserts some of this data (D62's lines): after a real bake, run it.
 */
import fs from 'fs'
import path from 'path'
import url from 'url'
import { bakeCharts } from './bake-lib.mjs'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const DATA = path.resolve(HERE, '..', '..', 'src', 'tracker', 'data')
const args = process.argv.slice(2)
const dry = args.includes('--dry-run')
const src = args.find(a => !a.startsWith('--'))
if (!src) { console.error('usage: node scripts/tracker/bake-user-charts.mjs <file.json> [--dry-run]'); process.exit(1) }

const load = f => import(url.pathToFileURL(path.join(DATA, f)).href)
const { SYLLABI, DEFAULT_SYL_ORDER } = await load('syllabi.js')
const { DEFAULT_LAYOUTS } = await load('layouts.js')
const { EVENT_INFO, EVENT_INFO_BY_SYL } = await load('eventInfo.js')

let raw
try { raw = JSON.parse(fs.readFileSync(src, 'utf8')) } catch (e) { console.error('Could not read ' + src + ': ' + e.message); process.exit(1) }
let res
try { res = bakeCharts(raw, { SYLLABI, DEFAULT_LAYOUTS, EVENT_INFO, EVENT_INFO_BY_SYL, DEFAULT_SYL_ORDER }) }
catch (e) { console.error('Not baked: ' + e.message); process.exit(1) }
const { out, report } = res

const put = (file, decl, value) => {
  const p = path.join(DATA, file)
  const lines = fs.readFileSync(p, 'utf8').split('\n')
  const head = new RegExp(`^export const ${decl}\\s*=`)
  const hits = lines.map((l, i) => (head.test(l) ? i : -1)).filter(i => i >= 0)
  if (hits.length !== 1) throw new Error(`${file}: expected 1 line declaring ${decl}, found ${hits.length}`)
  /* keep the line's own head ("export const X =" or "X="), so a bake that changes nothing changes no byte */
  lines[hits[0]] = lines[hits[0]].match(head)[0] + JSON.stringify(value) + ';'
  fs.writeFileSync(p, lines.join('\n'))
}
if (!dry) {
  put('syllabi.js', 'SYLLABI', out.SYLLABI)
  put('syllabi.js', 'DEFAULT_SYL_ORDER', out.DEFAULT_SYL_ORDER)
  put('layouts.js', 'DEFAULT_LAYOUTS', out.DEFAULT_LAYOUTS)
  put('eventInfo.js', 'EVENT_INFO_BY_SYL', out.EVENT_INFO_BY_SYL)
}
console.log((dry ? 'DRY RUN — nothing written. ' : '') + 'Baked: ' + (report.baked.join(' · ') || 'none'))
console.log('Charts made in the app, not baked: ' + (report.custom.join(' · ') || 'none'))
console.log('Built-ins the file does not carry, left as they are: ' + (report.untouched.join(' · ') || 'none'))
if (report.deleted.length) console.log('Deleted in his app, left as they are here: ' + report.deleted.join(' · '))
console.log('Event details baked: ' + (report.details.join(', ') || 'none'))
console.log('Shipped order: ' + out.DEFAULT_SYL_ORDER.join(' · '))
console.log('Student names checked: ' + report.namesChecked + (report.namesChecked ? ' — none reached the charts' : ''))
if (!dry) console.log('Now run the Tracker smoke suite: it asserts some of this data.')
