/* THE MARKS GUARD — loaded into every test file of both suites (vite.config.ts setupFiles; the Leave War suite's own
   setup imports it). After EVERY validate() any test runs, each ring, chip, dash and next-day mark the rules wrote must
   belong to a warning of its own day and code that names that man (engine/markcheck.ts). A hidden warning takes its
   flag away by that attribution ([WARN-HIDE-KEPT], D469), and a mis-filed mark fails silently — only when some other
   warning is hidden — so the proof has to run over every fixture the suite builds, not over the two demo weeks.
   A failure here throws out of validate() and fails the test that built the schedule, naming the mark. */
import { HOOKS } from '../engine/hooks'
import { markOrphans } from '../engine/markcheck'

HOOKS.validated = (raw: any) => {
  const bad = markOrphans(raw)
  if (bad.length) throw new Error(`[marks-guard] a puck flag with no warning of its own — a hidden warning could not take it away:\n  ${bad.slice(0, 6).join('\n  ')}`)
}
