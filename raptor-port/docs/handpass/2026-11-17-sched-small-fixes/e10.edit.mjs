import { readFileSync, writeFileSync } from 'node:fs'
let s = readFileSync('explore10.mjs', 'utf8')
s = s.replace('tap(58, 70)', 'tap(29, 67)')
writeFileSync('explore10.mjs', s)
