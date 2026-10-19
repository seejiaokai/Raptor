import { launch, ctxOpen, SIZES, sleep, shot, buildSat, bType, bf, addIt, setIt, itLines, warns, rec, errors, go, openBoard, model } from './lib.mjs'
console.log('sc04 v1')
const b = await launch()
const { ctx, p } = await ctxOpen(b, SIZES.desk, 'sc04')
await buildSat(p)                      // VL TO 12:00 LD 13:00, no typed lines
await bType(p, bf(5, 0, 0, 'rl'), '10:00')
const w = await warns(p)
const ph = await p.evaluate(() => document.querySelector('[data-bfld="ff:5.0.0.br"]').placeholder)
const pa = await shot(p, 'A04a-box-only-warning')
rec('4a', 'desk', 'R 10:00, B blank (suggests ' + ph + '), TO 12:00, no typed lines', 'a red warning naming the suggested brief; publishing allowed (D509)', { warn: w.slice(0, 5) }, w.some(x => /brief/i.test(x) && /rally|order|before|later/i.test(x)) ? 'PASS' : 'FAIL', pa)
const expl = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-go *')].filter(e => e.children.length === 0 && /rally|brief|in-time/i.test(e.textContent) && /later|before|order/i.test(e.textContent)).map(e => e.className + ':' + e.textContent.trim()))
rec('4a', 'desk', 'look for an explanation inside the wave while editing', 'RECORD whether anything explains it in the wave', expl, 'RECORD', pa)
/* click the warning; diff of classes */
const snap = () => p.evaluate(() => [...document.querySelectorAll('#schedBoard *')].map(e => e.tagName + '|' + (e.dataset.bfld || e.dataset.slot || e.dataset.itline || '') + '|' + e.className))
const s0 = await snap()
const li = p.locator('#sbSide .wln-t').filter({ hasText: /brief/i }).first()
const lc = await li.count()
let diff = []
if (lc) { await li.click(); await sleep(500)
  const s1 = await snap()
  diff = s1.filter((x, i) => x !== s0[i]).slice(0, 12)
}
const pb = await shot(p, 'A04a-warning-clicked')
const focus = await p.evaluate(() => ({ active: document.activeElement?.dataset?.bfld || document.activeElement?.className, flash: [...document.querySelectorAll('#schedBoard [class*=flash], #schedBoard [class*=ring], #schedBoard [class*=hl], #schedBoard [class*=warnlit], #schedBoard [class*=pulse]')].map(e => (e.dataset.bfld || e.dataset.slot || '') + '|' + e.className).slice(0, 8) }))
rec('4a', 'desk', 'click the warning in the list', 'RECORD what gets the ring (expected: the R box or its line)', { liFound: lc, classDiff: diff, focus }, 'RECORD', pb)
/* with an in-time line: R as the culprit */
await addIt(p, 5, 0); await setIt(p, 5, 0, 0, '06:00H: IN TIME')
await bType(p, bf(5, 0, 0, 'br'), '')
const w2 = await warns(p)
const pc = await shot(p, 'A04b-with-intime-line')
rec('4b', 'desk', 'add an in-time line "06:00H: IN TIME", R 10:00 still, B blank', 'RECORD the warning: does it point at the in-time lines now, is there an explanation in the typed-lines block', { warn: w2.slice(0, 5), lines: await itLines(p) }, 'RECORD', pc)
const li2 = p.locator('#sbSide .wln-t').filter({ hasText: /rally|brief|in-time/i }).first()
if (await li2.count()) { await li2.click(); await sleep(500) }
const pd = await shot(p, 'A04b-warning-clicked')
const fl2 = await p.evaluate(() => ({ active: document.activeElement?.dataset?.bfld || document.activeElement?.className, flash: [...document.querySelectorAll('#schedBoard [class*=flash], #schedBoard [class*=ring], #schedBoard [class*=hl], #schedBoard [class*=warnlit]')].map(e => (e.dataset.itline || e.dataset.bfld || '') + '|' + e.className).slice(0, 8) }))
rec('4b', 'desk', 'click that warning', 'RECORD what gets the ring', fl2, 'RECORD', pd)
console.log('errors', JSON.stringify(errors))
await b.close()
