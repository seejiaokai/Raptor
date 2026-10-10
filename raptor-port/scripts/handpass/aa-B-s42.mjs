import { world, fileInput, pic, sleep, go, openBoard, openCount, tabTo, availSet, closeWin, typeIfld, savePart } from './aa-B-lib.mjs'
import { openInputs, put } from './lib.mjs'
const P = 'dice'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
const w = await world('desk'); w.tag = 's42'
const { page } = w
// the Logic numbers this walk leans on
await go(page, 'logic'); await sleep(500)
const lg = await page.evaluate(() => [...document.querySelectorAll('.lgcell')].map(e => e.innerText.replace(/\s+/g, ' ')).filter(t => /step|dekit|debrief|report|brief/i.test(t)))
say('Logic settings', JSON.stringify(lg)); out.logic = lg
await openBoard(page, 4)
await page.locator('#schedBoard [data-wvadd="4"]').first().click(); await sleep(500)
await page.getByRole('button', { name: 'Flying wave', exact: true }).first().click(); await sleep(900)
for (const [k, v] of [['cs', 'AA1'], ['msn', 'ACM'], ['to', '12:00'], ['ld', '13:30']]) { const l = page.locator(`#schedBoard [data-bfld="ff:4.0.0.${k}"]`).first(); await l.click(); await l.fill(v); await l.blur(); await sleep(300) }
say('P in the front seat:', await put(page, '[data-slot="4.0.0.0.p"]', [P]))
const wins = { A: ['08:00', '09:00'], B: ['09:30', '10:30'], C: ['11:30', '12:30'], D: ['14:15', '14:45'] }
const recs = {}
for (const [k, [s, e]] of Object.entries(wins)) { const f = await fileInput(page, { iso: '2026-07-17', kind: 'Duty', person: 'allavail', rmk: 'S42' + k, s, e, oil: null }); recs[k] = f.rec.iid }
await openBoard(page, 4)
async function crowd(k, label) {
  await openCount(page, recs[k]); await tabTo(page, 'avail')
  const a = await availSet(page)
  const hasP = a.ids.includes(P)
  let why = null
  if (hasP) { const pk = page.locator(`.availwin [data-awp="${P}"] .puck`).first(); await pk.click().catch(() => {}); await sleep(400); why = await page.evaluate(() => { const w = document.querySelector('.availwin'); return w.innerText.replace(/\s+/g, ' ').slice(-170) }) }
  say(label, 'N =', a.ids.length, '| P counted:', hasP, why ? '| window says: ' + why : ''); await pic(w, 'crowd-' + k)
  await closeWin(page); return { n: a.ids.length, hasP, why }
}
for (const [k, [s, e]] of Object.entries(wins)) out[k] = await crowd(k, `request ${s}-${e}`)
// change the request's times through the board (A -> C) and read again
await openInputs(page, 4)
await typeIfld(page, recs.A, 'str', '11:30'); await typeIfld(page, recs.A, 'end', '12:30')
out.AtoC = await crowd('A', 'request A changed to 11:30-12:30')
await typeIfld(page, recs.A, 'str', '09:30'); await typeIfld(page, recs.A, 'end', '10:30')
out.AtoB = await crowd('A', 'request A changed to 09:30-10:30')
out.errors = w.errors
await w.browser.close()
savePart('s42-run', { out, log })
