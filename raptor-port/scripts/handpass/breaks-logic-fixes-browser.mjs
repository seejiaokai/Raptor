/* THE BROWSER BREAKS of the Insights and Logic small fixes (21 Oct 26): two wires only a real browser sees — the Tab the
   browser gives up when the list is redrawn under it, and Chrome telling a box it lost the keyboard as a redraw removes
   it. Each broken alone, LE1–LE3 run (they build the app — take the PC lock around this script), the bytes put back.
   E2E_PORT=<free port> node scripts/gatelock.mjs exec "<branch> — browser breaks" -- node scripts/handpass/breaks-logic-fixes-browser.mjs */
import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

const F = 'src/ui/LogicPage.tsx'
const orig = readFileSync(F, 'utf8')
const BREAKS = [
  ['B2 a box\'s change applied at once (not once the keyboard has landed)', 'setTimeout(() => { VCONF[k] = v; ruleApply() }, 0)', 'VCONF[k] = v; ruleApply()'],
  ['B7 a box removed by a redraw counted as left (no second look)', 'queueMicrotask(() => { if (t.isConnected && keep.current === was) keep.current = null })', 'if (keep.current === was) keep.current = null'],
]
try {
  for (const [name, from, to] of BREAKS) {
    if (orig.split(from).length !== 2) { console.log(`NOT RUN ${name} — its line is not found exactly once`); continue }
    writeFileSync(F, orig.replace(from, () => to))
    let red = false, out = ''
    try { out = execSync('npx playwright test --project=raptor e2e/logicedit.spec.ts', { encoding: 'utf8', stdio: 'pipe' }) } catch (e) { red = true; out = String(e.stdout || '') }
    const failed = (out.match(/\d+\) \[raptor\][^\n]*/g) || []).map(s => s.slice(0, 140))
    console.log(`${red ? 'RED  ' : 'GREEN'} ${name}${failed.length ? '\n        ' + failed.join('\n        ') : ''}`)
  }
} finally {
  writeFileSync(F, orig)
  console.log('DONE — the file put back')
}
