/* [HIST-JUMP-EMPTY-SEAT] — THE BREAK TESTS (the checking guide §8.4): each wire of the fix is cut once, on purpose,
   and a named test must go red. The source is put back after every cut, whatever happens.
   node scripts/handpass/hj-breaks.mjs   (from raptor-port/) */
import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const HB = 'src/ui/histbubble.ts', IX = 'src/ui/interactions.ts'
const CUTS = [
  { name: 'the row\'s people box (both pages that edit)', file: HB, from: 'if (live(box)) return box!', to: 'if (false && live(box)) return box!', red: /people box|tap lands on its row/ },
  { name: 'the people cell another man stands in (View-only Sched)', file: HB, from: 'for (const p of rowPlaces(row)) {', to: 'for (const p of [] as any[]) {', red: /still holds someone/ },
  { name: 'the row\'s name (a row this page draws no people on)', file: HB, from: 'return findHistCell(root, `${np}:${row.slice(c + 1)}.${nf}`)', to: 'return null', red: /AMT brief row|row.s name/ },
  { name: 'the sentence "That seat is empty now" on a landing', file: IX, from: "if (onRow && empty) HOOKS.toast('That seat is empty now', 'warn')", to: '', red: /tap lands on its row/ },
  { name: 'the sentence where nothing can be landed on', file: IX, from: ": empty ? 'That seat is empty now'", to: '', red: /nobody left/ },
  { name: 'a box only the week draws (the programme\'s second line)', file: HB, from: "if (/^ap:.*\\.sub$/.test(k)) return 'week'", to: '', red: /only the week draws|named by onlyOn/ },
  { name: 'a box only the board draws (a standby line\'s B box)', file: HB, from: "if (w && isStandalone(w)) return 'board'", to: 'if (w && isStandalone(w)) return null', red: /named by onlyOn/ },
  { name: 'the other page is named only where it is true', file: IX, from: "|| !cands.some(k => onlyOn(posKey(k, DAYS)) === other) ? 'That detail is not shown on this page'", to: "? 'That detail is not shown on this page'", red: /no page draws/ },
  { name: 'each place of a To go out line in turn — its own row before the next place', file: IX, from: "    if (root) for (const k of cands) {\n      el = findHistCell(root, k); if (el) break\n", to: "    if (root) for (const k of cands) { el = findHistCell(root, k); if (el) break }\n    if (!el && root) for (const k of cands) {\n", red: /To go out line|only man taken off|extra man taken off/ },
  { name: 'the board leaves a look at an older version', file: IX, from: "  if (di != null && view.DPREV.has(+di)) view.setDayPreview(+di, null)", to: "  if (!onBoard && di != null && view.DPREV.has(+di)) view.setDayPreview(+di, null)", red: /working copy first/ },
  { name: 'OIL Earn: the row is found by its switch', file: HB, from: " || oilRow(r && r.rid)", to: "", red: /OIL Earn|his own puck|name of its row/ },
  { name: 'OIL Earn: the man himself, not only his row', file: HB, from: "return pk ? (pk.closest('.seat') as HTMLElement | null) || pk : name", to: "return name", red: /his own puck/ },
  { name: 'a seated man is not called empty', file: IX, from: 'if (el) { onRow = true; empty = vacant; break }', to: 'if (el) { onRow = true; empty = true; break }', red: /does not call the seat empty/ },
]
let bad = 0
for (const c of CUTS) {
  const src = readFileSync(c.file, 'utf8')
  if (!src.includes(c.from)) { console.log(`NOT CUT  ${c.name} — the line was not found`); bad++; continue }
  writeFileSync(c.file, src.replace(c.from, c.to))
  let out = ''
  /* only the tests this wire should turn red are run (a minute saved a cut); a wire no such test names stays NOT RED */
  try { const r = spawnSync('npx', ['vitest', 'run', 'src/ui/histjump.test.tsx', '-t', `"${c.red.source}"`], { encoding: 'utf8', shell: true }); out = (r.stdout || '') + (r.stderr || '') }
  finally { writeFileSync(c.file, src) }
  const failed = out.split('\n').filter(l => /×|FAIL/.test(l))
  const named = failed.filter(l => c.red.test(l))
  const n = (out.match(/Tests\s+(\d+) failed/) || [])[1] || '0'
  if (named.length) console.log(`RED      ${c.name} — ${n} test(s) failed, e.g. "${named[0].replace(/^[^>]*>\s*/, '').replace(/\s+\d+ms$/, '').trim().slice(0, 110)}"`)
  else { console.log(`NOT RED  ${c.name} — ${n} failed, none of them the expected one`); bad++ }
}
console.log(bad ? `\n${bad} wire(s) with no test` : `\nall ${CUTS.length} wires have a test that goes red`)
process.exit(bad ? 1 : 0)
