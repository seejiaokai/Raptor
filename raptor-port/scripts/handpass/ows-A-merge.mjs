/* walker A — merge my own part files into ows-A.json (the single results file) */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
const D = 'C:/Users/User/projects/Raptor/.claude/worktrees/tracker-palette-prompt-a0c90f/raptor-port/docs/handpass/parts/'
const files = ['ows-A.json', 'ows-A-s10ph.json', ...readdirSync(D).filter(f => /^ows-A-pairsY?-\d\.json$/.test(f))]
const out = { parts: {} }
for (const f of files) {
  if (!existsSync(D + f)) continue
  const j = JSON.parse(readFileSync(D + f, 'utf8'))
  for (const [k, v] of Object.entries(j.parts || {})) out.parts[k] = v
}
const old = readdirSync(D + 'old').filter(f => /^ows-A-pairs-\d\.json$/.test(f))
for (const f of old) { const j = JSON.parse(readFileSync(D + 'old/' + f, 'utf8')); for (const [k, v] of Object.entries(j.parts || {})) out.parts[k] = out.parts[k] || v }
writeFileSync(D + 'ows-A.json', JSON.stringify(out, null, 1))
console.log(Object.keys(out.parts).length, 'parts:', Object.keys(out.parts).sort().join(' '))
