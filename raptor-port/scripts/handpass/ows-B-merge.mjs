/* walker B — merge every part file into ows-B.json and print the table as plain lines (to a scratch file for the report) */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
const dir = 'C:/Users/User/projects/Raptor/.claude/worktrees/tracker-palette-prompt-a0c90f/raptor-port/docs/handpass/parts'
const scratch = process.env.OWS_SCRATCH
const files = readdirSync(dir).filter(f => /^ows-B-part-.*\.json$/.test(f)).sort()
const all = { letter: 'B', parts: {} }
const lines = []
const SKIP = new Set(['s09', 's09ph'])   /* first runs, superseded by a re-run with the corrected sign-off read */
for (const f of files) {
  const tag = f.replace(/^ows-B-part-|\.json$/g, '')
  if (SKIP.has(tag)) continue
  const j = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'))
  for (const [k, v] of Object.entries(j.parts || {})) {
    all.parts[`${f.replace(/^ows-B-part-|\.json$/g, '')}:${k}`] = v
    for (const r of v.table || []) if (!(tag === 'sb2' && /^S32/.test(r.id))) lines.push(`${r.verdict}\t${r.id}\t${String(r.did).slice(0, 220)}\t${String(r.saw).replace(/\s+/g, ' ')}\t${(r.pics || []).join(',')}`)
  }
}
writeFileSync(`${dir}/ows-B.json`, JSON.stringify(all, null, 1))
if (scratch) writeFileSync(scratch, lines.join('\n'))
console.log(files.length, 'part files,', lines.length, 'rows')
const tally = {}; for (const l of lines) { const v = l.split('\t')[0]; tally[v] = (tally[v] || 0) + 1 }
console.log(JSON.stringify(tally))
