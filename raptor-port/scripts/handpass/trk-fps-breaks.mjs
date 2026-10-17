/* [TRK-CHART-FPS] the break tests (the order §8.4): each wire this job made is broken once on purpose, the app rebuilt,
   and the job's walk (trk-fps-walk.mjs) run on the broken build — a break the walk does not catch is a wire with no test.
   IT REWRITES SOURCE FILES AND REBUILDS `dist`: take the PC's lock first, and touch nothing meanwhile; every file is put
   back as it was, and `dist` rebuilt true, at the end (and on a stop: run `npm run build`).
     HP_URL  the preview serving this checkout's dist (required)
     cd raptor-port && node scripts/gatelock.mjs exec "<branch> — breaks" -- node scripts/handpass/trk-fps-breaks.mjs */
import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
const CORE = 'src/tracker/app/core.js', CSS = 'src/tracker/tracker.css'
const BREAKS = [
  { n: 1, name: 'the chart\'s box keeps the finger from the browser (touch-action none)', file: CSS, find: 'padding:12px 16px;touch-action:pan-x pan-y;', put: 'padding:12px 16px;touch-action:none;', expect: ['W1'] },
  { n: 2, name: 'the Info half keeps the finger from the browser', file: CSS, find: 'padding:12px;touch-action:pan-x pan-y;overscroll-behavior:contain}', put: 'padding:12px;touch-action:none;overscroll-behavior:contain}', expect: ['W8', 'P2'] },
  { n: 3, name: 'the pinch sets the zoom at every step again (no picture)', file: CORE, find: 'if (start.w && start.w.isConnected) start.w.style.transform', put: 'if (false) start.w.style.transform', expect: ['W2'] },
  { n: 4, name: 'the lift lays nothing out (the zoom reached is dropped)', file: CORE, find: '    flowZoom = s.zz; applyFlowZoom();\n', put: '    applyFlowZoom();\n', expect: ['W2', 'W3'] },
  { n: 5, name: 'two fingers are not held from the browser', file: CORE, find: '    held = true; if (e.cancelable) e.preventDefault();', put: '    held = false;', expect: ['W2', 'W3', 'W4'] },
  { n: 6, name: 'a mouse drag is not the app\'s any more', file: CORE, find: "if (e.pointerType !== 'mouse' || e.button !== 0) return;   /* a finger or a pen", put: "if (true) return;   /* a finger or a pen", expect: ['D1', 'D2'] },
  { n: 7, name: 'the pinch\'s anchor is not carried with the fingers', file: CORE, find: 'translate(${(m.x - start.m0.x) / start.u}px,${(m.y - start.m0.y) / start.u}px) scale(', put: 'translate(0px,0px) scale(', expect: ['W2'] },
  { n: 8, name: 'the app\'s own move does not stop the phone\'s glide (no overflow toggle)', file: CORE, find: "    el.style.overflow = 'hidden'; void el.offsetHeight; el.style.overflow = '';\n", put: '\n', expect: [] },
]
if (!process.env.HP_URL) { console.error('HP_URL not set'); process.exit(2) }
const run = (cmd, env = {}) => spawnSync(cmd, { shell: true, encoding: 'utf8', timeout: 900000, env: { ...process.env, ...env } })
const out = []
try {
  for (const b of BREAKS) {
    const before = readFileSync(b.file, 'utf8'), hits = before.split(b.find).length - 1
    if (hits !== 1) { out.push({ n: b.n, name: b.name, result: `SKIPPED (${hits} hits)` }); console.log(`${b.n}. SKIPPED (${hits} hits) — ${b.name}`); continue }
    writeFileSync(b.file, before.replace(b.find, () => b.put))
    let result, failed = []
    try {
      if (run('npm run build').status !== 0) result = 'ERROR — the broken app did not build'
      else {
        const r = run('node scripts/handpass/trk-fps-walk.mjs', { FPS_SHOTS: resolve(tmpdir(), 'trk-fps-breaks', String(b.n)), HP_OUT: resolve(tmpdir(), 'trk-fps-breaks-out', String(b.n)) })
        failed = [...(r.stdout || '').matchAll(/^FAIL\s+(\S+)/gm)].map(m => m[1])
        result = failed.length ? `CAUGHT by ${failed.join(', ')}` : 'NOT CAUGHT'
      }
    } finally { writeFileSync(b.file, before) }
    const expected = b.expect.length ? b.expect.every(id => failed.includes(id)) : !failed.length
    out.push({ n: b.n, name: b.name, result, expected: b.expect, asExpected: expected })
    console.log(`${b.n}. ${result} — ${b.name}${expected ? '' : `  (expected ${b.expect.join(', ') || 'none'})`}`)
  }
} finally {
  console.log(run('npm run build').status === 0 ? 'dist rebuilt true' : 'REBUILD FAILED — run npm run build')
}
writeFileSync(resolve('docs/handpass/parts/trk-fps/breaks.json'), JSON.stringify(out, null, 2))
console.log('DONE')
