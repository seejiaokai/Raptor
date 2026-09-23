/* [TRK-PINCH-DRAGS-BALL] break tests (bug-check order §8.4): every wire of the
   fix is broken once on purpose, the app rebuilt, and the named checks that must
   go red are run — the smoke suite's new block (extracted and run alone) and/or
   the phone walk. core.js is ALWAYS put back (finally), then rebuilt clean.

     HP_URL   the preview serving dist/ (http://localhost:4180)
     BREAKS   optional comma list of ids to run (default: all)
*/
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const CORE = resolve(ROOT, 'src/tracker/app/core.js')
const URL = process.env.HP_URL || 'http://localhost:4180'
const sh = (cmd, env = {}) => { try { return execSync(cmd, { cwd: ROOT, env: { ...process.env, ...env }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20 }) } catch (e) { return (e.stdout || '') + (e.stderr || '') } }

/* the smoke suite's [TRK-PINCH-DRAGS-BALL] block, run alone */
const BLOCK = resolve(ROOT, 'scripts/tracker/_smoke-block.mjs')
{
  const src = readFileSync(resolve(ROOT, 'scripts/tracker/smoke.mjs'), 'utf8')
  const a = src.indexOf('/* ---- [TRK-PINCH-DRAGS-BALL] a pinch in Edit chart layout moves nothing'), b = src.indexOf('/* ---- ONE Import for both jobs')
  const o = src.indexOf('async function openTracker'), oe = src.indexOf('\n}\n', o) + 3
  writeFileSync(BLOCK, "import { chromium } from '@playwright/test';\nconst URL = process.env.APP_URL;\nlet pass = 0, fail = 0;\n" +
    "const ok = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? ' PASS' : ' FAIL'}  ${name}${extra ? ' — ' + extra : ''}`); };\n" +
    "const b = await chromium.launch({});\n" + src.slice(o, oe) + '\n' + src.slice(a, b) + '\nconsole.log(`${pass} passed, ${fail} failed`); await b.close();\n')
}

const BREAKS = [
  { id: 'B1', wire: 'the pinch counts fingers in the capture phase', old: "  }, { capture: true, passive: false });\n  el.addEventListener('pointermove'", new: "  }, { passive: false });\n  el.addEventListener('pointermove'", run: ['block', 'walk'] },
  { id: 'B2', wire: 'the second finger restores the chart, the stored layout and both undo lists', old: '  if (!same) {\n    /* the chart the way', new: '  if (false) {\n    /* the chart the way', run: ['block', 'walk'] },
  { id: 'B3', wire: "the second finger stops the first finger's gesture (its listeners)", old: '  if (stop) stop();\n  pan = null;', new: '  pan = null;', run: ['walk'] },
  { id: 'B4', wire: 'a second finger starts nothing on a ball (startDrag checks `pinching`)', old: 'if (!arrangeMode || pinching) return; if (tool === \'select\')', new: 'if (!arrangeMode) return; if (tool === \'select\')', run: ['walk'] },
  { id: 'B5', wire: "leaving Edit chart layout leaves the canvas's pan and zoom behind", old: "    renderBoard();   /* the ordinary chart: renderBoard puts `view` back to the identity */", new: "    const keepV = { ...view }; renderBoard(); view = keepV;", run: ['block', 'walk'] },
  { id: 'B6', wire: 'going in keeps the middle in the middle', old: "    place(); settle(place);\n  } else {", new: "  } else {", run: ['block'] },
  { id: 'B7', wire: 'coming out re-cuts the slack before placing', old: "if (!c || arrangeMode) return; applyFlowZoom(); const m = mid();", new: "if (!c || arrangeMode) return; const m = mid();", run: ['block', 'walk'] },
  /* B8 was "a lift is heard on the window": broken, nothing went red in two runs of
     the walk (the board's own pointerleave already drops such a finger — E18), so
     the window listener was taken out rather than kept untested (24 Sep 26). */
]
const want = (process.env.BREAKS || '').split(',').filter(Boolean)
const clean = readFileSync(CORE, 'utf8')
const out = []
try {
  for (const b of BREAKS) {
    if (want.length && !want.includes(b.id)) continue
    if (clean.split(b.old).length !== 2) { out.push({ ...b, error: 'the wire was not found exactly once' }); console.log(b.id, 'NOT FOUND'); continue }
    writeFileSync(CORE, clean.replace(b.old, b.new))
    const build = sh('npm run build')
    if (!/built in/.test(build)) { out.push({ ...b, error: 'build failed' }); console.log(b.id, 'BUILD FAILED'); continue }
    const red = []
    if (b.run.includes('block')) red.push(...sh(`node ${BLOCK}`, { APP_URL: URL + '/' }).split('\n').filter(l => /^ FAIL/.test(l)).map(l => 'smoke:' + l.trim()))
    if (b.run.includes('walk')) red.push(...sh('node scripts/handpass/trk-pinch-ball.mjs', { HP_URL: URL, WALK_ONLY: 'phone', WALK_TAG: 'break-' + b.id, HP_SHOTS: resolve(tmpdir(), 'trk-breaks'), HP_OUT: resolve(tmpdir(), 'trk-breaks') }).split('\n').filter(l => /^FAIL/.test(l)).map(l => 'walk:' + l.trim()))
    out.push({ id: b.id, wire: b.wire, red: red.map(l => l.slice(0, 200)) })
    console.log(`${b.id} ${b.wire}: ${red.length} red`); red.forEach(l => console.log('   ' + l.slice(0, 180)))
  }
} finally {
  writeFileSync(CORE, clean)
  sh('npm run build')
  rmSync(BLOCK, { force: true })
}
writeFileSync(resolve(ROOT, 'docs/handpass/parts/tracker-pinch-ball/breaks.json'), JSON.stringify(out, null, 2))
console.log('\ncore.js restored and rebuilt clean')
