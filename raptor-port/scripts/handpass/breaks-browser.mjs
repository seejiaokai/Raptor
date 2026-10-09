// THE STRICTNESS PROOF FOR WHAT ONLY A BROWSER CAN SEE — the layout half of scripts/handpass/breaks.mjs (which says of
// itself: "What it cannot break: a rule only a real browser can see"). Break ONE rule at a time — a stylesheet line, a
// width — BUILD the app with it broken, run the browser tests that should catch it against that build, put the line
// back. A break that leaves them green is a layout rule with no test, by proof. Written for [LW-PHONE-HEADER-SPACE]
// (8 Oct 26), whose rules are nearly all stylesheet lines.
//
//   (a preview must be serving `dist` on the list's port — NOT 4173, which the gate's own browser run reuses:
//    npx vite preview --port 4180 --strictPort)
//   cd raptor-port && node scripts/handpass/breaks-browser.mjs scripts/handpass/breaks/<list>.browser.json [n,n,…]
//
// A list is { spec, grep, port, breaks: [{ n, name, file, find, put }] }: `spec` the browser-test file, `grep` the
// tests of it to run (Playwright's -g), `port` the preview's; `find` must occur EXACTLY ONCE in `file`.
//
// IT REWRITES SOURCE FILES AND REBUILDS `dist` FOR EVERY BREAK — about a minute each. Touch nothing under src and run
// no other build or browser test meanwhile, and NEVER while a gate run holds the PC's lock. When it prints DONE every
// file is back as it was and `dist` is the true build again; if it is stopped half-way, run `npm run build` before
// looking at anything (a preview left running would be serving a broken build).
import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const list = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const only = process.argv[3] ? new Set(process.argv[3].split(',')) : null
const run = (cmd, env = {}) => spawnSync(cmd, { shell: true, encoding: 'utf8', timeout: 600000, env: { ...process.env, ...env } })
const out = []
try {
  for (const m of list.breaks) {
    if (only && !only.has(String(m.n))) continue
    const before = readFileSync(m.file, 'utf8')
    const hits = before.split(m.find).length - 1
    if (hits !== 1) { out.push({ n: m.n, result: 'SKIPPED' }); console.log(`${m.n}. SKIPPED (${hits} hits) — ${m.name}`); continue }
    writeFileSync(m.file, before.replace(m.find, () => m.put))
    let result
    try {
      if (run('npm run build').status !== 0) result = 'ERROR — the broken app did not build (not a layout break: pick another line)'
      else {
        const r = run(`npx playwright test ${list.spec} -g "${list.grep}" --reporter=list`, { E2E_PORT: String(list.port) })
        const text = (r.stdout || '') + (r.stderr || '')
        const failed = (text.match(/(\d+) failed/) || [])[1], passed = (text.match(/(\d+) passed/) || [])[1]
        result = failed ? `CAUGHT — ${failed} failed, ${passed ?? 0} passed` : `NOT CAUGHT — ${passed ?? 0} passed`
        for (const x of [...text.matchAll(/^\s+\d+\) \[([\w-]+)\] .*? › (.{0,90})/gm)].slice(0, 3)) console.log(`      ${x[1]}: ${x[2]}`)
      }
    } finally {
      writeFileSync(m.file, before)
    }
    out.push({ n: m.n, result })
    console.log(`${m.n}. ${result} — ${m.name}`)
  }
} finally {
  const back = run('npm run build').status
  const bad = out.filter(o => !o.result.startsWith('CAUGHT'))
  console.log(`\nDONE: ${out.length - bad.length} of ${out.length} caught` + (bad.length ? ` — NOT caught: ${bad.map(b => b.n).join(', ')}` : '') + (back === 0 ? ' — the true build is back in dist' : ' — THE TRUE BUILD DID NOT REBUILD: run `npm run build`'))
}
