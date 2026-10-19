import { readFileSync, writeFileSync } from 'node:fs'
let s = readFileSync('s11.mjs', 'utf8')
const a = s.indexOf('/* crew one man'), z = s.indexOf("/* (a) tap R")
s = s.slice(0, a) + s.slice(z)
s = s.replace("const hdr = p.evaluate", "const hdr = p.evaluate")
writeFileSync('s11.mjs', s)
