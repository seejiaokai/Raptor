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
  /* RAISED 1539 -> 1543, 23 Sep 26, for a genuinely new live rule and nothing else (owner, D60):
     push a BRANCH freely, ASK before `main`. It belongs HERE because it governs what the agent may
     do without asking, and a rule the agent must check before acting has to be in the always-loaded
     tier. The file sat EXACTLY at its ceiling, so the four lines had nowhere to go; the entry was
     tightened from six lines to four FIRST, and only the remainder raised. D29 rule 3 forbids
     paying for it by trimming someone else's text inside another change. [DOC-TRIM] still owns
     bringing this file to its 500 target, which is where the real 1,043 lines of slack are. */
  ['raptor-port/CLAUDE.md',              0, 1543,  500],
  ['.claude/rules/raptor-executor.md',   0,  108,  108],
  /* RAISED 63 -> 76, 23 Sep 26, for a genuinely new live rule and nothing else
     (owner, D56): a problem living only in data already stored is not a finding,
     because the demo data is cleared before the database step. It is HERE, in
     the always-loaded copy, so it is in force before the order is ever opened —
     which is the whole reason this file exists. The ratchet's own rule allows a
     raise for a new live rule if the commit says why; this is that, and the
     ceiling goes no higher without the same justification. */
  ['.claude/rules/bug-check.md',         0,   76,   76],
  ['.claude/rules/record-decisions.md',  0,   60,   60],
  ['.claude/rules/plain-language.md',    0,   60,   60],
  ['HANDOFF.md',                         1,  961,  400],
  /* RAISED 1188 -> 1230, 22 Sep 26, deliberately and with headroom. [ALL-AVAIL-WINDOW] (D38) is a
     genuinely new live item and the queue was re-ordered around it, +20 lines. Raised rather than
     paid for by a trim, because D29 rule 3 forbids trimming docs inside another change and an
     archive pass under a red gate is the exact pressure that destroyed two filed items on 22 Sep.
     The extra headroom answers Fable's finding that seven of eight gated files sat at ZERO, which
     is what made every addition a trim. [DOC-TRIM] still owns bringing this to its 600 target. */
  /* 1230 -> 1240, 22 Sep 26, the SECOND raise today and the last one that should pass
     unremarked. Thirteen rulings landed today (D31-D43) and the OIL red-team added a pointer
     the next session must read. The agent tightened its OWN new text by 3 lines first rather
     than trimming anyone else's entries - D29 rule 3 forbids a trim inside another change, and
     squeezing prose to hit a number is the pressure that destroyed two filed items last week.
     If a third raise is wanted, do [DOC-TRIM] instead: this file is 1234 against a 600 target. */
  ['OUTSTANDING.md',                     1, 1240,  600],
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
