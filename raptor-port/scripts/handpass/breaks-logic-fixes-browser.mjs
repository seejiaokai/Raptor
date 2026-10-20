/* THE BROWSER BREAKS of the Insights and Logic small fixes (21 Oct 26): the wires only a real browser sees — the Tab the
   browser gives up when the list is redrawn under it, Chrome telling a box it lost the keyboard as a redraw removes it,
   and the text cursor left parked in a box the keyboard has left. Each broken alone, its browser test run (they build the
   app — take the PC lock around this script), the bytes put back.
   E2E_PORT=<free port> node scripts/gatelock.mjs exec "<branch> — browser breaks" -- node scripts/handpass/breaks-logic-fixes-browser.mjs */
import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

const F = 'src/ui/LogicPage.tsx'
const orig = readFileSync(F, 'utf8')
const LE = 'npx playwright test --project=raptor e2e/logicedit.spec.ts --retries=0'
const KS5 = 'npx playwright test --project=raptor e2e/kbscroll.spec.ts -g KS5 --retries=0'
const BREAKS = [
  ['B2 a box\'s change applied at once (not once the keyboard has landed)', LE, 'PENDING.set(k, { v, t: setTimeout(() => { PENDING.delete(k); VCONF[k] = v; ruleApply() }, 0) })', 'VCONF[k] = v; ruleApply()'],
  ['B7 the leaving decided at once, before the rebuild\'s keeper has run (no second look)', LE, 'queueMicrotask(() => {\n        if (keep.current === was) keep.current = null', 'void [0].map(() => {\n        if (keep.current === was) keep.current = null'],
  ['B12 the text cursor left parked in the list when the keyboard leaves it', KS5, 'if (s?.anchorNode && host.contains(s.anchorNode) && !host.contains(document.activeElement)) s.removeAllRanges()', ''],
]
try {
  for (const [name, cmd, from, to] of BREAKS) {
    if (orig.split(from).length !== 2) { console.log(`NOT RUN ${name} — its line is not found exactly once`); continue }
    writeFileSync(F, orig.replace(from, () => to))
    let red = false, out = ''
    try { out = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' }) } catch (e) { red = true; out = String(e.stdout || '') }
    const failed = (out.match(/\d+\) \[raptor\][^\n]*/g) || []).map(s => s.slice(0, 140))
    console.log(`${red ? 'RED  ' : 'GREEN'} ${name}${failed.length ? '\n        ' + failed.join('\n        ') : ''}`)
  }
} finally {
  writeFileSync(F, orig)
  console.log('DONE — the file put back')
}
