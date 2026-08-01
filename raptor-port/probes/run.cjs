/* Probe harness: runs a reference probe against the reference (file://) or
   the React port (vite preview URL) by substituting the hard-coded page URL.
   Usage: node probes/run.cjs <probe|all> <ref|port|both>
   The port must be served first: npx vite preview --port 4173.
   Screenshot paths inside probes are redirected into probes/out/. */
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const ROOT = path.join(__dirname, '..')
const SRC = path.join(ROOT, 'reference', 'probes')
const OUT = path.join(__dirname, 'out')
const REF_URL = 'file://' + path.join(ROOT, 'reference', 'scheduler.html')
const PORT_URL = process.env.PORT_URL || 'http://localhost:4173/'

/* probes that pin the reference's string-diff render mechanism itself — the
   cookbook says drop these (their behavioural checks live in the Vitest
   suite and the kept probes) */
const DROPPED = { 'perf2.js': 'pins the string-diff mechanism (setHTML identity)' }

function runOne(name, target) {
  const file = name.endsWith('.js') ? name : name + '.js'
  let src = fs.readFileSync(path.join(SRC, file), 'latin1')
  const url = target === 'ref' ? REF_URL : PORT_URL
  src = src.split('file:///home/claude/scheduler.html').join(url)
  src = src.split("'/tmp/").join(`'${OUT}/${target}-`)
  const tmp = path.join(OUT, `_${target}-${file}`)
  fs.mkdirSync(OUT, { recursive: true })
  fs.writeFileSync(tmp, src, 'latin1')
  try {
    const out = execFileSync('node', [tmp], {
      timeout: 240000,
      env: { ...process.env, NODE_PATH: path.join(ROOT, 'node_modules') },
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    })
    return { ok: true, out: out.trim() }
  } catch (e) {
    return { ok: false, out: ((e.stdout || '') + '\n' + (e.stderr || '')).trim().slice(0, 2000) }
  }
}

const [, , probe, target = 'both'] = process.argv
const names = probe === 'all'
  ? fs.readdirSync(SRC).filter(f => f.endsWith('.js') && !DROPPED[f])
  : [probe]

for (const n of names) {
  for (const t of (target === 'both' ? ['ref', 'port'] : [target])) {
    const r = runOne(n, t)
    console.log(`===== ${n} [${t}] ${r.ok ? 'ran' : 'ERROR'} =====`)
    console.log(r.out)
  }
}
