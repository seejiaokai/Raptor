import { readFileSync, writeFileSync } from 'node:fs'
const f = 'docs/handpass/parts/or-I.json'
const d = JSON.parse(readFileSync(f, 'utf8'))
d.summary = {
  I1: 'PASS', I2: 'PASS', I3: 'PASS', I4: 'PASS', I5: 'PASS', I6: 'PASS', I7: 'PASS', I8: 'PASS', I8b_variant_redo_of_read_line: 'FAIL',
  I9: 'PASS', I10: 'PASS', I11: 'PASS (clock set back to 22 Jun 26)', I12: 'RECORDED (Ranger bell not lit, "Nothing new")',
  clock: 'not set back in I1-I10; set back in I11 and I12', notWalked: [], browserErrors: 0,
}
writeFileSync(f, JSON.stringify(d, null, 1))
console.log(Object.keys(d))
