/* merge the scratch result files of Walker M's runs into docs/handpass/parts/stk2-M.json */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
const S = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/40895a2e-0dae-4bf2-829f-19d122a9ab14/scratchpad'
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/stk2-M.json'
const all = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { parts: {} }
for (const f of ['out1', 'out2', 'out3', 'out4', 'out5', 'out6']) {
  const p = `${S}/${f}.json`
  if (!existsSync(p)) continue
  const j = JSON.parse(readFileSync(p, 'utf8'))
  for (const [k, v] of Object.entries(j.parts || {})) all.parts[k] = v
}
writeFileSync(OUT, JSON.stringify(all, null, 1))
console.log(Object.keys(all.parts).join(', '))
