#!/usr/bin/env node
/* THE DOCUMENT BUDGET GATE — docs/doc-budget.md, owner 21 Sep 26 (D14).
 *
 * A session reads ~4,000 lines before it can do anything. The ceilings already
 * existed in prose (HANDOFF.md says inside itself that it should stay near 550
 * lines; it had reached 961) and nothing failed when they were breached. This is
 * the thing that fails.
 *
 * IT IS A RATCHET. The number beside each file is the CURRENT measured size, not
 * an aspiration. A file may never grow past its recorded ceiling, and every time
 * one is trimmed the ceiling is lowered to the new size in the same change. So
 * the repo can only get lighter. Raising a ceiling is a deliberate, argued edit
 * with its reason in the commit message — the same contract as the DOM ceilings
 * in docs/performance.md.
 *
 * TARGET is where doc-budget.md says each tier should end up. Being over target
 * is reported, never failed — trimming 4,000 lines of real documentation is its
 * own job ([DOC-TRIM] in OUTSTANDING.md), not something to do under a red gate. */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = join(ROOT, '..')

/* file, tier, CEILING (may only go down), TARGET (doc-budget.md's aim) */
const FILES = [
  ['raptor-port/CLAUDE.md',              0, 1539,  500],
  ['.claude/rules/raptor-executor.md',   0,  108,  108],
  ['.claude/rules/bug-check.md',         0,   63,   63],
  ['.claude/rules/record-decisions.md',  0,   60,   60],
  ['.claude/rules/plain-language.md',    0,   60,   60],
  ['HANDOFF.md',                         1,  961,  400],
  ['OUTSTANDING.md',                     1, 1188,  600],
  /* DECISIONS.md is append-only and is MEANT to grow, so its ceiling is its target.
     When it reaches it, the oldest decisions move to a dated section of their own and
     the index keeps only the live ones — the same shape as HANDOFF-ARCHIVE. */
  ['DECISIONS.md',                       1,  150,  150],
]
const TIER0_TARGET = 600

/* newline count, exactly as `wc -l` reports it — the ceilings below were measured
   with that tool, and a counter that disagreed with it would make every ceiling
   wrong by one. */
const lines = f => {
  const t = readFileSync(join(REPO, f), 'utf8')
  let n = 0
  for (let i = 0; i < t.length; i++) if (t.charCodeAt(i) === 10) n++
  return n
}
const pad = (s, n) => String(s).padEnd(n)

let failed = 0, tier0 = 0, overTarget = []
console.log('docsize — a ratchet: a ceiling may only ever go DOWN (docs/doc-budget.md)\n')
console.log(`  ${pad('file', 38)} ${pad('tier', 5)} ${pad('lines', 7)} ${pad('ceiling', 8)} target`)

for (const [f, tier, ceiling, target] of FILES) {
  if (!existsSync(join(REPO, f))) { console.log(`  ${pad(f, 38)} MISSING`); continue }
  const n = lines(f)
  if (tier === 0) tier0 += n
  const over = n > ceiling
  if (over) failed++
  if (n > target) overTarget.push([f, n, target])
  console.log(`  ${pad(f, 38)} ${pad(tier, 5)} ${pad(n, 7)} ${pad(ceiling, 8)} ${target}${over ? `   *** OVER CEILING by ${n - ceiling} ***` : ''}`)
}

console.log(`\n  tier 0, always loaded: ${tier0} lines (target ${TIER0_TARGET})`)

if (overTarget.length) {
  console.log('\n  over TARGET — reported, not failed; the trim is [DOC-TRIM] in OUTSTANDING.md:')
  for (const [f, n, t] of overTarget) console.log(`    ${pad(f, 38)} ${n} → ${t}`)
}

if (failed) {
  console.error(`\nFAIL — ${failed} file(s) grew past a recorded ceiling.`)
  console.error('Either trim what you added, or lower something else in the same change.')
  console.error('If the growth is a genuinely new live rule, raise that file\'s ceiling HERE and say why in the commit.')
  process.exit(1)
}
console.log('\ndocsize OK — nothing grew.')
