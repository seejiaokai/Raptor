// THE STRICTNESS PROOF (the bug-check order's "break test", docs/bug-check-order.md §8.4): break ONE rule at a time,
// run the tests that should catch it, put the line back. A break that leaves its tests green is a rule with no test,
// by proof — write the test, then run that break again.
//
//   cd raptor-port && node scripts/handpass/breaks.mjs scripts/handpass/breaks/<list>.json [n,n,…]
//
// A list is an array of { n, name, file, find, put, tests }: `find` must occur EXACTLY ONCE in `file` (else the break
// is SKIPPED and said so — a list goes stale as the code moves), `put` replaces it, `tests` are the vitest files run.
// A file stored with Windows line endings (src/leavewar/state/store.ts) needs "\r\n" in a `find` that spans lines.
// The optional last argument runs only those numbers. Each list kept beside this file is the proof of one change.
//
// IT REWRITES SOURCE FILES WHILE IT RUNS — touch nothing under src, build nothing and run no browser test meanwhile;
// when it prints DONE every file is back as it was (`git status` must show nothing it touched).
// What it cannot break: a rule only a real browser can see (jsdom lays nothing out) — prove those by running the
// browser test once on the broken build.
import { readFileSync, writeFileSync } from 'node:fs'

// A WRITE THAT FAILS IS TRIED AGAIN. On Windows a file another program has just touched (a virus scanner, an editor's
// watcher) can refuse an open for a moment — "UNKNOWN: unknown error, open". On 8 Oct 26 that struck the write that
// puts a broken line BACK: the run died and left the break in the source. So every write here waits and retries, and
// the put-back never gives up quietly — if it cannot be written the run stops with the file's name, to be restored by hand.
function put(file, text) {
  let last
  for (let i = 0; i < 12; i++) {
    try { writeFileSync(file, text); return } catch (e) { last = e; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250) }
  }
  throw new Error(`could not write ${file} after 12 tries — CHECK IT IS NOT LEFT BROKEN (git diff): ${last}`)
}
import { spawnSync } from 'node:child_process'

const list = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const only = process.argv[3] ? new Set(process.argv[3].split(',')) : null
const out = []
for (const m of list) {
  if (only && !only.has(String(m.n))) continue
  const before = readFileSync(m.file, 'utf8')
  const hits = before.split(m.find).length - 1
  if (hits !== 1) { out.push({ n: m.n, name: m.name, result: `SKIPPED — the line to break was found ${hits} times` }); console.log(`${m.n}. SKIPPED (${hits} hits) — ${m.name}`); continue }
  put(m.file, before.replace(m.find, () => m.put))
  let r
  try {
    r = spawnSync('npx', ['vitest', 'run', ...m.tests, '--reporter=dot'], { shell: true, encoding: 'utf8', timeout: 240000 })
  } finally {
    put(m.file, before)
  }
  const text = (r.stdout || '') + (r.stderr || '')
  const failed = (text.match(/Tests\s+(\d+) failed/) || [])[1]
  const passed = (text.match(/Tests\s+(?:\d+ failed \| )?(\d+) passed/) || [])[1]
  const names = [...text.matchAll(/(?:FAIL|×)\s+(.+)/g)].map(x => x[1].trim()).slice(0, 4)
  const caught = r.status !== 0 && !!failed
  const result = caught ? `CAUGHT — ${failed} failed, ${passed ?? 0} passed` : r.status !== 0 ? `ERROR — the run did not finish as a test failure (exit ${r.status})` : `NOT CAUGHT — ${passed} passed`
  out.push({ n: m.n, name: m.name, result, names })
  console.log(`${m.n}. ${result} — ${m.name}`)
  for (const s of names) console.log(`      ${s.slice(0, 200)}`)
  if (!caught) console.log(text.split('\n').slice(-25).join('\n'))
}
const bad = out.filter(o => !o.result.startsWith('CAUGHT'))
console.log(`\nDONE: ${out.length - bad.length} of ${out.length} caught` + (bad.length ? ` — NOT caught: ${bad.map(b => b.n).join(', ')}` : ''))
