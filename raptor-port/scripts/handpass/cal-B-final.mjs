/* finalise cal-B.json: the verdict for each scenario number as judged by the walker */
import { readFileSync, writeFileSync } from 'node:fs'
import { OUT } from './cal-B-lib.mjs'
const j = JSON.parse(readFileSync(OUT, 'utf8'))
const V = {
  'P2-01': 'PASS', 'P2-02': 'PASS', 'P2-03': 'PASS', 'P2-04': 'FAIL', 'P2-05': 'PASS', 'P2-06': 'PASS', 'P2-07': 'PASS', 'P2-08': 'PASS',
  'P2-09': 'PASS (see F1 for the phone, after a drag)', 'P2-10': 'PASS', 'P2-11': 'PASS', 'P2-12': 'PASS (guest: not reachable)', 'H-04': 'PASS',
}
j.final = V
j.findings = ['F1 phone: the first tap after a finger-drag of a counter row in Rearrange is ignored', 'F2 phone on its side 844x390: the number pad and the top bar leave no sight of the Required cell being typed', 'F3 (P2-04, desktop): "-5" saves 5 and "2.5" saves 25 over the old figure — typed marks are dropped, not refused']
writeFileSync(OUT, JSON.stringify(j, null, 1))
console.log('final verdicts written')
