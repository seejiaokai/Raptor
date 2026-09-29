/* [TRK-BAKE-STALE] — the bake command, end to end (28 Sep 26). Signs in, opens the Tracker and
   takes a charts export from the running app (the same collectCharts + buildFile the Export
   window uses), writes it to the scratch folder, then runs the bake COMMAND on it: a dry run
   (reads, reports, writes nothing) and a real one. With nothing changed in the app, a real bake
   must leave the shipped charts as they are — the caller checks with git.

     HP_URL=http://localhost:4175 node scripts/handpass/trk-lo-12-bake.mjs
*/
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { open, TMP, ROOT, save, log } from './trk-lib.mjs'

const L = log()
const { browser, page, errors } = await open({})
const file = await page.evaluate(async () => {
  const c = window.__coreForTests, F = window.__fileFormatForTests
  const charts = await c.collectCharts(null, { deleted: true })
  return F.buildFile({ savedAt: new Date().toISOString(), charts })
})
await browser.close()
const path = resolve(TMP, 'lo-bake-export.json')
writeFileSync(path, JSON.stringify(file))
L.ok('the running app exported its charts', file && file.version === 3 && file.charts && file.charts.order.length >= 4, 'v' + (file && file.version) + ', ' + (file && file.charts && file.charts.order.length) + ' charts')
const run = args => { try { return { ok: true, out: execFileSync(process.execPath, [resolve(ROOT, 'scripts/tracker/bake-user-charts.mjs'), path, ...args], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) } } catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') } } }
const dry = run(['--dry-run'])
L.ok('a dry run bakes the four built-ins and writes nothing', dry.ok && /DRY RUN/.test(dry.out) && /Baked: 2024 · 2026 · Tx 2026 · A\/G - A\/A 2026|Baked: .*2024.*2026/.test(dry.out), dry.out)
const real = run([])
L.ok('a real run completes and says to run the smoke suite', real.ok && /Now run the Tracker smoke suite/.test(real.out), real.out)
L.ok('no console or page error', errors.length === 0, errors.join(' | '))
save('lo-12-bake', L.rows)
const fails = L.rows.filter(r => r.pass === false)
console.log(fails.length ? `\n${fails.length} FAIL` : '\nALL PASS')
process.exit(fails.length ? 1 : 0)
