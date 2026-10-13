// THE STRICTNESS PROOF FOR WHAT ONLY A BROWSER CAN SEE, for the Tracker's date boxes (D801, 13 Oct 26) — the layout
// half of scripts/handpass/breaks/2026-10-13-tracker-date-boxes.json. Its detector is the host's look
// (scripts/handpass/trk-datebox-look.mjs), not a Playwright spec: the Tracker's browser suite is the smoke suite, and
// the look is what measures these rules. Break ONE rule, BUILD, run the look at a phone and a desktop, put the line
// back. A break the look leaves green is a rule with no check, by proof.
//
//   cd raptor-port && node scripts/handpass/trk-datebox-breaks-browser.mjs [n,n,…]      (under the PC's lock)
//
// IT REWRITES SOURCE FILES AND REBUILDS `dist` FOR EVERY BREAK. Touch nothing under src and run no other build or
// browser test meanwhile. When it prints DONE every file is back and `dist` is the true build again; if it is stopped
// half-way, check `git status` and run `npm run build`.
import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BREAKS = [
  { n: 1, name: 'a press on the calendar is kept from the page behind — the marking pop-up stays open under it',
    file: 'src/ui/DateBox.tsx', find: 'onClick={mine} onPointerDown={mine}', put: 'onPointerDown={mine}',
    expect: /FAIL .*(marking pop-up is still up|could not finish)/ },
  { n: 2, name: 'End date A is a narrow box: its date is never cut short',
    file: 'src/tracker/components/SidePanel.jsx', find: 'title="End date A" narrow value', put: 'title="End date A" value',
    expect: /FAIL .*no box’s words are cut short/ },
  { n: 3, name: 'a box that holds a date keeps its words clear of "take this date off"',
    file: 'src/tracker/tracker.css', find: '.trdatebox-row.has-x>button.datebox{padding-right:26px}\n', put: '',
    expect: /FAIL .*(clear of the words|clear of "take this date off")/ },
  { n: 4, name: '"take this date off" sits inside the box, not after it',
    file: 'src/tracker/tracker.css', find: 'button.trdate-x{position:absolute;', put: 'button.trdate-x{',
    expect: /FAIL .*(inside its box|inside the list|cut short)/ },
  { n: 5, name: 'the failures list gives its date box room for the whole date',
    file: 'src/tracker/tracker.css', find: 'grid-template-columns:auto minmax(0,1fr) 144px;', put: 'grid-template-columns:auto minmax(0,1fr) 104px;',
    expect: /FAIL .*the row’s box sits inside the list/ },
  { n: 6, name: 'Done on and Failed on take the pop-up’s width',
    file: 'src/tracker/tracker.css', find: 'button.datebox.trpopdate{display:flex;width:100%}', put: '',
    expect: /FAIL .*takes the pop-up’s width/ },
  { n: 7, name: 'the tap that opens the calendar leaves its patch OVER the card — the second half of a double tap picks nothing',
    file: 'src/ui/scheduler/26-date-calendar.css', find: '.dcal-layer.dcal-patch{background:transparent;touch-action:none;z-index:601}', put: '.dcal-layer.dcal-patch{background:transparent;touch-action:none;z-index:599}',
    expect: /FAIL .*(nothing was picked by the second half|open after the double tap)/ },
  { n: 8, name: 'the tap that opens the calendar leaves a patch at all',
    file: 'src/ui/DateBox.tsx', find: 'if (e.detail > 0) standPatch({ x: e.clientX, y: e.clientY }); else dropPatch()', put: 'dropPatch()',
    expect: /FAIL .*(nothing was picked by the second half|open after the double tap)/ },
  { n: 9, name: '"take this date off" settles: the second half of a double tap on it opens nothing',
    file: 'src/tracker/components/DateBox.jsx', find: "    if (Date.now() - offAt.current < OFF_SETTLE_MS) { e.stopPropagation(); e.preventDefault(); return; }\n", put: '',
    expect: /FAIL .*no calendar opened under the second half/ },
]
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null
/* the look's pictures of a BROKEN build go to a scratch folder, never over the evidence pictures */
const SCRATCH = join(tmpdir(), 'trk-datebox-breaks')
const run = cmd => spawnSync(cmd, { shell: true, encoding: 'utf8', timeout: 600000, env: { ...process.env, LOOK_OUT: SCRATCH } })
function put(file, text) { for (let i = 0; ; i++) { try { writeFileSync(file, text); return } catch (e) { if (i > 11) throw new Error(`could not write ${file} — CHECK IT IS NOT LEFT BROKEN: ${e}`); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250) } } }
const out = []
try {
  for (const m of BREAKS) {
    if (only && !only.has(String(m.n))) continue
    const before = readFileSync(m.file, 'utf8')
    const hits = before.split(m.find).length - 1
    if (hits !== 1) { out.push(`${m.n}. SKIPPED (${hits} hits) — ${m.name}`); console.log(out.at(-1)); continue }
    put(m.file, before.replace(m.find, () => m.put))
    let said = ''
    try {
      const b = run('npm run build')
      if (b.status !== 0) said = 'DID NOT BUILD — rewrite the break'
      else {
        const seen = ['phone', 'desktop'].map(w => { const r = run(`node scripts/handpass/trk-datebox-look.mjs ${w}`); return { w, fails: (r.stdout || '').split('\n').filter(l => /^\s*FAIL/.test(l)) } })
        const hit = seen.filter(s => s.fails.some(l => m.expect.test(l)))
        const any = seen.filter(s => s.fails.length)
        said = hit.length ? `CAUGHT (${hit.map(s => s.w).join(', ')}): ${hit[0].fails.find(l => m.expect.test(l)).trim().slice(0, 150)}`
          : any.length ? `CAUGHT BY ANOTHER CHECK ONLY (${any.map(s => s.w).join(', ')}): ${any[0].fails[0].trim().slice(0, 150)}`
          : 'NOT CAUGHT — a rule with no check'
      }
    } finally { put(m.file, before) }
    out.push(`${m.n}. ${said} — ${m.name}`); console.log(out.at(-1))
  }
} finally {
  const b = run('npm run build')
  console.log(b.status === 0 ? 'the true build is back' : 'THE CLOSING BUILD FAILED — run npm run build')
}
console.log('\nDONE\n' + out.join('\n'))
