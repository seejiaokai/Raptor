/* walker C — tidy my own results file: drop the parts that only repeat rows another part already holds. */
import { readFileSync, writeFileSync } from 'node:fs'
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/wh-c.json'
const all = JSON.parse(readFileSync(OUT, 'utf8'))
for (const k of ['32-sameday-dk', '32-sameday-ph']) delete all.parts[k]   // their rows are inside 32-dk / 32-ph
if (all.parts['32b-b-dk'] && all.parts['32b-a-dk']) delete all.parts['32b-a-dk']   // its row is inside 32b-b-dk
writeFileSync(OUT, JSON.stringify(all, null, 1))
console.log(Object.keys(all.parts).sort().join(' '))
