/* which part of the Logic fix makes KS5 (kbscroll.spec.ts — D1080 in the SANS settings window opened from Logic) fail?
   Each part undone alone, KS5 run, the bytes put back. Under the PC lock. (21 Oct 26, debugging) */
import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
const F = 'src/ui/LogicPage.tsx'
const orig = readFileSync(F, 'utf8')
const PARTS = [
  ['the memo undone', 'dangerouslySetInnerHTML={bodyHTML}', 'dangerouslySetInnerHTML={{ __html: b.html }}'],
  ['the apply at once', 'setTimeout(() => { VCONF[k] = v; ruleApply() }, 0)', 'VCONF[k] = v; ruleApply()'],
  ['the keeper off', 'if (!k || !host || k.el.isConnected) return', 'return'],
  ['the focus listeners off', "host.addEventListener('focusin', onFocusIn)", ''],
]
try {
  for (const [name, from, to] of PARTS) {
    if (orig.split(from).length !== 2) { console.log(`NOT RUN ${name}`); continue }
    writeFileSync(F, orig.replace(from, () => to))
    let ok = true
    try { execSync('npx playwright test --project=raptor e2e/kbscroll.spec.ts -g KS5 --retries=0', { stdio: 'pipe' }) } catch { ok = false }
    console.log(`${ok ? 'KS5 PASSES' : 'KS5 FAILS '} with ${name}`)
  }
} finally { writeFileSync(F, orig); console.log('DONE — the file put back') }
