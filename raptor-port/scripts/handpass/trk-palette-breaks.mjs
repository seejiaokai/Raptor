/* [TRK-PALETTE-ASK] break tests (bug-check order §8.4) — 26 Sep 26.
   For every place the palette is wired, put ONE old colour back, run the
   palette pin (src/tracker/trk-palette.test.ts) and record which named test
   went red; then restore the file byte for byte. A break that turns nothing
   red means that place has no test, by proof. Run from raptor-port/:
     node scripts/handpass/trk-palette-breaks.mjs */
import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const BREAKS = [
  ['tracker.css: the sim token back to the old yellow', 'src/tracker/tracker.css', '--sim:#E5A83B;', '--sim:#ffe000;'],
  ['tracker.css: the page background back to the old one', 'src/tracker/tracker.css', '--bg:#0B0D10;', '--bg:#0f1115;'],
  ['core.js: a CFT/IAT/EPT ball drawn in the old purple', 'src/tracker/app/core.js', "device: '#B24DEA' };", "device: '#b063ff' };"],
  ['core.js: the failure ticks back to the old red', 'src/tracker/app/core.js', "fail: '#F0555F'", "fail: '#ff2b2b'"],
  ['core.js: the Marginal wedge back to the old green', 'src/tracker/app/core.js', "marg: '#57C97A'", "marg: '#27d64a'"],
  ['core.js: the selected-student edge back to the old accent', 'src/tracker/app/core.js', "accent: '#3BC6E8'", "accent: '#36c2ff'"],
  ['tracker.css: a picked find row back to the old dark teal', 'src/tracker/tracker.css', '.findrow.on{background:var(--on)}', '.findrow.on{background:#16384a}'],
  ['tracker.css: the code on a ball printed in muted grey', 'src/tracker/tracker.css', 'fill:var(--bg);pointer-events:none}', 'fill:var(--muted);pointer-events:none}'],
  ['tracker.css: the failure chip rule back to one class', 'src/tracker/tracker.css', '.chip.failchip{border', '.failchip{border'],
  ['Legend.jsx: the Sim swatch hard-coded in the old yellow', 'src/tracker/components/Legend.jsx', "background: 'var(--sim)'", "background: '#ffe000'"],
  ['ShowAllPanel.jsx: a grade badge\'s dark text back to the old ink', 'src/tracker/components/ShowAllPanel.jsx', "'var(--bg)'", "'#10131a'"],
  ['Pop.jsx: the pop-up divider back to the old hairline', 'src/tracker/components/Pop.jsx', "borderTop: '1px dashed var(--line)'", "borderTop: '1px dashed #262c38'"],
  ['tracker.css: the bubble\'s divider named in a Tracker colour it cannot see', 'src/tracker/tracker.css', 'border-top:1px dashed var(--edge)}', 'border-top:1px dashed var(--line)}'],
  ['Modals.jsx: the editor calls a sim "yellow" again', 'src/tracker/components/Modals.jsx', 'Sim (amber)', 'Sim (yellow)'],
  ['scheduler.css: RAPTOR\'s amber changes and the Tracker is left behind', 'src/ui/scheduler.css', '--adv:#E5A83B;', '--adv:#E0A030;'],
]

const rows = []
for (const [what, file, from, to] of BREAKS) {
  const orig = readFileSync(file, 'utf8')
  const n = orig.split(from).length - 1
  if (n < 1) { rows.push({ what, red: null, note: `anchor not found in ${file}` }); continue }
  writeFileSync(file, orig.replace(from, to))
  try {
    const r = spawnSync('npx', ['vitest', 'run', 'src/tracker/trk-palette.test.ts'], { encoding: 'utf8', shell: true })
    const out = (r.stdout || '') + (r.stderr || '')
    const failed = [...new Set([...out.matchAll(/(?:×|✗|FAIL)\s+.*?trk-palette\.test\.ts\s*>\s*(.+?)(?:\s+\d+ms)?$/gm)].map(m => m[1].trim()))]
    rows.push({ what, red: r.status !== 0, failed })
  } finally { writeFileSync(file, orig) }
  const back = readFileSync(file, 'utf8') === orig
  if (!back) { console.error('RESTORE FAILED: ' + file); process.exit(2) }
  const last = rows[rows.length - 1]
  console.log(`${last.red ? ' RED ' : ' ---- GREEN (no test caught it)'}  ${what}${last.failed && last.failed.length ? '\n        → ' + last.failed.join('\n        → ') : ''}`)
}
writeFileSync('docs/handpass/parts/trk-palette/trk-palette-breaks.json', JSON.stringify(rows, null, 2))
const missed = rows.filter(r => !r.red)
console.log(`\n${rows.length - missed.length} of ${rows.length} breaks turned a named test red`)
process.exit(missed.length ? 1 : 0)
