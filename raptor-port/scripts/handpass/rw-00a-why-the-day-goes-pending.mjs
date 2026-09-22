/* DIAGNOSIS for defect 3 (F1): the phantom pending after a reload.
   Publish the Saturday, save the world, reopen it, and print the exact
   difference between what the day HOLDS live and what it was ISSUED with. */
import { open, board, publish, closeBoard, STATE } from './lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const TMP = OUT + '/state-zz-diag-f1.json'
const DI = 5

const a = await open({ state: STATE })
await board(a.page, DI)
const p = await publish(a.page, DI)
console.log('published:', JSON.stringify(p))
const before = await a.page.evaluate(i => ({
  pending: ((document.querySelector('#schedBoard .dpend') || {}).innerText || '').replace(/\s+/g, ' ').trim() || 'nothing pending',
}), DI)
console.log('straight after publishing:', JSON.stringify(before))
await closeBoard(a.page); await a.page.waitForTimeout(600)
await a.page.context().storageState({ path: TMP }); await a.browser.close()

const b = await open({ state: TMP })
await board(b.page, DI)
const out = await b.page.evaluate(i => {
  const w = window
  const res = {}
  res.pending = ((document.querySelector('#schedBoard .dpend') || {}).innerText || '').replace(/\s+/g, ' ').trim() || 'nothing pending'
  const snap = w.daySnapOf(i, w.dayCurVer(i))
  const issued = snap && snap.d && snap.d.oilev
  const live = w.oilEvidenceOf(i)
  res.hasIssued = !!issued
  if (!issued || !live) return res
  const cs = q => (w.PEOPLE[q] || {}).cs || q
  const keys = Array.from(new Set([...Object.keys(issued.sent), ...Object.keys(live.sent)]))
  res.diff = []
  for (const k of keys) {
    const A = (issued.sent[k] || []).slice().sort()
    const B = (live.sent[k] || []).slice().sort()
    if (JSON.stringify(A) === JSON.stringify(B)) continue
    res.diff.push({ item: k, issuedN: A.length, liveN: B.length,
      added: B.filter(x => !A.includes(x)).map(cs), removed: A.filter(x => !B.includes(x)).map(cs) })
  }
  res.earnsSame = issued.earns === live.earns
  res.decSame = JSON.stringify(issued.d) === JSON.stringify(live.d)
  res.issuedDec = JSON.stringify(issued.d).slice(0, 300)
  res.liveDec = JSON.stringify(live.d).slice(0, 300)
  res.inputsSame = JSON.stringify(issued.inputs) === JSON.stringify(live.inputs)
  return res
}, DI)
console.log(JSON.stringify(out, null, 1).slice(0, 4000))
await b.browser.close()
