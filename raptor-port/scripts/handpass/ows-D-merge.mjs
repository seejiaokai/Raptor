import { readFileSync, writeFileSync, existsSync } from 'node:fs'
const dir = 'C:/Users/User/projects/Raptor/.claude/worktrees/tracker-palette-prompt-a0c90f/raptor-port/docs/handpass/parts/'
const main = JSON.parse(readFileSync(dir + 'ows-D.json', 'utf8'))
for (const f of ['ows-D-pairsP.json', 'ows-D-pairsU.json']) {
  if (!existsSync(dir + f)) continue
  const j = JSON.parse(readFileSync(dir + f, 'utf8'))
  Object.assign(main.parts, j.parts)
}
writeFileSync(dir + 'ows-D.json', JSON.stringify(main, null, 1))
let pass = 0, fail = 0, other = 0
for (const [k, v] of Object.entries(main.parts)) { for (const r of v.table) { if (r.verdict === 'PASS') pass++; else if (r.verdict === 'FAIL') fail++; else other++ } }
console.log('parts', Object.keys(main.parts).join(', '), '| PASS', pass, 'FAIL', fail, 'other', other)
