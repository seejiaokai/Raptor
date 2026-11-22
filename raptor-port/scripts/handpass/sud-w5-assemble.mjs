// sud-w5-assemble — puts the generated step table into w5's report in place of its marker line.
// Run from raptor-port/:  node scripts/handpass/sud-w5-assemble.mjs D:/raptor-work/c147-walk/w5/table.md
import { readFileSync, writeFileSync } from 'node:fs'
console.log('sud-w5-assemble v1')
const R = 'docs/handpass/parts/sud/w5-report.md'
const t = readFileSync(process.argv[2], 'utf8').trimEnd()
const s = readFileSync(R, 'utf8')
if (!s.includes('TABLE_GOES_HERE')) { console.log('no marker'); process.exit(1) }
writeFileSync(R, s.replace('TABLE_GOES_HERE', () => t))
console.log('rows', t.split('\n').length - 2)
