// writes the verdict block into or-E.json (data only; no browser)
import { readFileSync, writeFileSync } from 'node:fs'
const f = 'docs/handpass/parts/or-E.json'
const o = JSON.parse(readFileSync(f, 'utf8'))
o.verdicts = { E1: 'PASS', E2: 'PASS', E3: 'PASS', E4: 'PASS', E5: 'PASS', E6: 'PASS', E7: 'PASS', E8: 'PASS (setup by replace-then-join; see report)', E9: 'PASS (Mark all read only by scrolling the list)', E10: 'PASS' }
o.not_walked = []
o.fails = []
writeFileSync(f, JSON.stringify(o, null, 1))
