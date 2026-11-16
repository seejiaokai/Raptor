import { readFileSync, writeFileSync } from 'node:fs'
let s = readFileSync('explore3.mjs', 'utf8')
s = s.replace(".puck.allavail:visible').first()", ".puck.allavail:visible', { hasText: /ALL AVAIL/ }).first()").replace('.ah-row .ppl .addz', '.ah-row .ppl')
writeFileSync('explore3.mjs', s)
