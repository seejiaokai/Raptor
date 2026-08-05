/* Run every adapted probe and fail if any of them does.

   The adapted set exists because a reference probe can assume the
   reference's MECHANISM — a synchronous repaint after a mutation, a global
   the ESM build never publishes, an input type the app no longer ships —
   while still describing behaviour the port must keep. Each file re-expresses
   its original's contracts for this build; docs/probe-sweep.md maps them.

   The port must be served first: npx vite preview --port 4173.
   Usage: npm run probes:adapted */
const { execFileSync } = require('child_process')
const path = require('path')

const PROBES = ['aar-async', 'audit-async', 'drop-async', 'sa-async', 'sc2-async', 'wrap-async']

let bad = 0
for (const name of PROBES) {
  const file = path.join(__dirname, name + '.cjs')
  process.stdout.write(`\n===== ${name} =====\n`)
  try {
    process.stdout.write(execFileSync('node', [file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }))
  } catch (e) {
    if (e.stdout) process.stdout.write(e.stdout)
    bad++
    console.log(`${name} FAILED`)
  }
}
console.log(bad ? `\n${bad} adapted probe(s) failed` : `\nall ${PROBES.length} adapted probes passed`)
process.exit(bad ? 1 : 0)
