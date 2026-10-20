/* THE BREAK TESTS of the Insights and Logic small fixes (21 Oct 26): each wire of the fix broken alone, the Logic page's
   unit tests run, the exact bytes put back. A break that stays green is named, not hidden.
   node scripts/handpass/breaks-logic-fixes.mjs   (from raptor-port/; holds src/ui/LogicPage.tsx until it prints DONE) */
import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

const F = 'src/ui/LogicPage.tsx'
const orig = readFileSync(F, 'utf8')
const BREAKS = [
  ['B1 the markup object made afresh every repaint (no memo)', 'dangerouslySetInnerHTML={bodyHTML}', 'dangerouslySetInnerHTML={{ __html: b.html }}'],
  ['B2 a box\'s change applied at once (not once the keyboard has landed)', 'setTimeout(() => { VCONF[k] = v; ruleApply() }, 0)', 'VCONF[k] = v; ruleApply()'],
  ['B3 the half-typed value not carried across a redraw', 'was.value !== was.defaultValue && was.value !== el.value', 'false'],
  ['B4 Done\'s press takes the keyboard from the box first', 'onMouseDown={e => e.preventDefault()}', ''],
  ['B5 Done does not save the box itself', 'onClick={() => { finishBox(); setLgEdit(false); notify() }}', 'onClick={() => { setLgEdit(false); notify() }}'],
  ['B6 the keeper never puts the keyboard back', 'if (!k || !host || k.el.isConnected) return', 'return'],
]
try {
  for (const [name, from, to] of BREAKS) {
    if (orig.split(from).length !== 2) { console.log(`NOT RUN ${name} — its line is not found exactly once`); continue }
    writeFileSync(F, orig.replace(from, () => to))
    let red = false, out = ''
    try { out = execSync('npx vitest run src/ui/logic.test.tsx', { encoding: 'utf8', stdio: 'pipe' }) } catch (e) { red = true; out = String(e.stdout || '') }
    const failed = (out.match(/×[^\n]*/g) || []).map(s => s.slice(2, 110))
    console.log(`${red ? 'RED  ' : 'GREEN'} ${name}${failed.length ? '\n        ' + failed.join('\n        ') : ''}`)
  }
} finally {
  writeFileSync(F, orig)
  console.log('DONE — the file put back')
}
