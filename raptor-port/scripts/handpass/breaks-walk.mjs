// THE BREAK TEST FOR A WALK SCRIPT — breaks-browser.mjs's twin for a job whose browser proof is its walk script rather than a
// Playwright spec ([TRK-SCROLL-GLIDE], 17 Oct 26: a gesture only real touch input can drive). Break ONE wire at a time,
// BUILD the app with it broken, run the list's walk against the served build, read which checks went red, put the wire back.
// A break whose expected checks all stay green is a wire with no check, by proof.
//
//   (a preview must be serving this checkout's `dist`, its address in HP_URL — required; the walk proves the bundle)
//   cd raptor-port && node scripts/handpass/breaks-walk.mjs scripts/handpass/breaks/<list>.browser.json [n,n,…]
//
// A list is { walk, breaks: [{ n, name, file, find, put, also?: [{find, put}], expect: [check ids] }] }; each `find` must
// occur EXACTLY ONCE. The walk's pictures go to a scratch folder (GLIDE_SHOTS), never over the evidence.
// IT REWRITES SOURCE FILES AND REBUILDS `dist` FOR EVERY BREAK. Touch nothing under src meanwhile, and take the PC's lock
// for the whole run (gatelock.mjs exec). When it prints DONE every file is back and `dist` is the true build again.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const list = JSON.parse(readFileSync(process.argv[2], 'utf8'))
/* the walk drives HP_URL and proves it serves this checkout's build; without it the shared driver's default port is
   ANOTHER chat's (17 Oct 26: a whole run drove a build with no glide) */
if (!process.env.HP_URL) { console.error('HP_URL not set — the preview serving this checkout'); process.exit(2) }
const only = process.argv[3] ? new Set(process.argv[3].split(',')) : null
const run = (cmd, env = {}) => spawnSync(cmd, { shell: true, encoding: 'utf8', timeout: 900000, env: { ...process.env, ...env } })
const shots = mkdtempSync(join(tmpdir(), 'breaks-walk-'))
const out = []
try {
  for (const m of list.breaks) {
    if (only && !only.has(String(m.n))) continue
    const before = readFileSync(m.file, 'utf8')
    let broken = before, bad = false
    for (const r of [{ find: m.find, put: m.put }, ...(m.also || [])]) {
      const hits = broken.split(r.find).length - 1
      if (hits !== 1) { bad = true; break }
      broken = broken.replace(r.find, () => r.put)
    }
    if (bad) { out.push({ n: m.n, result: 'SKIPPED — a find does not occur exactly once' }); console.log(`${m.n}. SKIPPED — ${m.name}`); continue }
    writeFileSync(m.file, broken)
    let result
    try {
      if (run('npm run build').status !== 0) result = 'ERROR — the broken app did not build'
      else {
        const r = run(`node ${list.walk}`, { GLIDE_SHOTS: shots, HP_OUT: shots })
        const text = (r.stdout || '') + (r.stderr || '')
        writeFileSync(join(shots, `walk-break-${m.n}.log`), text)   /* a stopped walk is read, never guessed at */
        const red = [...text.matchAll(/^FAIL {2}(\S+)/gm)].map(x => x[1])
        const crashed = !/\d+ passed, \d+ failed/.test(text)
        const caught = m.expect.filter(id => red.includes(id))
        result = caught.length ? `CAUGHT by ${caught.join(', ')}${red.length > caught.length ? ` (also red: ${red.filter(x => !caught.includes(x)).join(', ')})` : ''}`
          : crashed ? `WALK STOPPED (red so far: ${red.join(', ') || 'none'}) — read ${join(shots, `walk-break-${m.n}.log`)}` : `NOT CAUGHT — red: ${red.join(', ') || 'none'}`
      }
    } finally {
      writeFileSync(m.file, before)
    }
    out.push({ n: m.n, result })
    console.log(`${m.n}. ${result} — ${m.name}`)
  }
} finally {
  const back = run('npm run build').status
  console.log(`DONE — every file put back; the true build ${back === 0 ? 'rebuilt' : 'FAILED TO REBUILD — run npm run build'}`)
}
