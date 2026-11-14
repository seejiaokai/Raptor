/* rcf-w1 plain-user round, OIL half — open/close OIL Earn on the board, undo/redo a switch, Done, View-only Sched, Leave War OIL figure.
   usage: node rcf-w1-round.mjs [desktop|phone] */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/round-' + KIND + '-r1')
console.log('rcf-w1-round v1', KIND)
const X = await import('./rcf-w1-lib.mjs')
const { L, check, note, sleep, RESULTS } = X
const w = await X.world(KIND)
const { page } = w
const P = w.phone ? 'p' : 'd'
const SAT = 5, ISO = X.ISO[SAT]
const ranger = w.ID('Ranger')
const oilOn = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .seat.oilpk, #schedBoard .oilitem')].some(e => e.offsetWidth))
const oilBtn = () => page.locator('#schedBoard #sbOil:visible, #schedBoard [data-oilmode]:visible').first()
const tapOil = async (tag) => { const b = oilBtn(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150); if (w.phone) await b.tap(); else await b.click(); if (tag) { await sleep(80); await page.screenshot({ path: `${process.env.HP_SHOTS}/${tag}-tap.png` }) } await sleep(800) }
const seatState = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .seat.oilpk, #schedBoard .puck.oilbar')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /Ranger/.test(t)).slice(0, 3))

const bUndo = async (which) => {
  const b = page.locator(which === 'undo' ? '#schedBoard #sbUndo:visible' : '#schedBoard #sbRedo:visible').first()
  if (!(await b.count())) return { ok: false, why: 'no board ' + which }
  if (await b.isDisabled()) return { ok: false, why: which + ' disabled: ' + (await b.getAttribute('title')) }
  if (w.phone) await b.tap(); else await b.click()
  await sleep(700); return { ok: true, title: await b.getAttribute('title') }
}
await L.board(page, SAT)
const gF = await X.addWave(w, SAT, '')
await X.typeIn(w, `[data-bfld="ff:5.${gF}.0.to"]`, '10:00'); await X.typeIn(w, `[data-bfld="ff:5.${gF}.0.ld"]`, '11:30')
console.log('seat', await X.seatPhoneAware(w, `[data-slot="5.${gF}.0.0.p"]`, ranger))
await X.pic(page, `round-0-board-${P}`)
await tapOil(`round-1-open-${P}`)
check('R1 OIL Earn opens from the board', await oilOn(), `OILDAY set: ${await oilOn()}`)
await X.pic(page, `round-1-oilmode-${P}`)
const before = await seatState(); note('R1 Ranger in OIL Earn', JSON.stringify(before))
await tapOil(`round-2-close-${P}`)
check('R2 OIL Earn closes with the same button', !(await oilOn()), `OILDAY set: ${await oilOn()}`)
await X.pic(page, `round-2-closed-${P}`)
/* switch + undo / redo */
await tapOil()
const seat = page.locator('#schedBoard .seat.oilpk:has-text("Ranger"), #schedBoard .puck.oilbar:has-text("Ranger")').first()
const s0 = await seatState()
await seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120)
if (w.phone) await seat.tap(); else await seat.click(); await sleep(900)
const s1 = await seatState(); note('R3 after tapping Ranger\'s switch', JSON.stringify(s0) + ' -> ' + JSON.stringify(s1))
await X.pic(page, `round-3-switched-${P}`)
const u = await bUndo('undo'); await sleep(500)
const s2 = await seatState(); note('R3 after Undo', JSON.stringify(u) + ' ' + JSON.stringify(s2))
await X.pic(page, `round-4-undone-${P}`)
const r = await bUndo('redo'); await sleep(500)
const s3 = await seatState(); note('R3 after Redo', JSON.stringify(r) + ' ' + JSON.stringify(s3))
await X.pic(page, `round-5-redone-${P}`)
check('R3 Undo steps the switch back and Redo forward', u.ok && r.ok && JSON.stringify(s1) !== JSON.stringify(s0) ? JSON.stringify(s2) === JSON.stringify(s0) && JSON.stringify(s3) === JSON.stringify(s1) : false, `s0 ${JSON.stringify(s0)} s1 ${JSON.stringify(s1)} s2 ${JSON.stringify(s2)} s3 ${JSON.stringify(s3)} undo ${JSON.stringify(u)} redo ${JSON.stringify(r)}`)
await tapOil()
/* Done */
const done = page.locator('#schedBoard #sbDone:visible').first()
if (await done.count()) { if (w.phone) await done.tap(); else await done.click(); await sleep(900) }
check('R4 ✓ Done closes the board', !(await page.locator('#schedBoard:visible').count()) || !(await page.locator('#schedBoard #sbDone:visible').count()), 'board visible: ' + (await page.locator('#schedBoard #sbDone:visible').count()))
await X.pic(page, `round-6-after-done-${P}`)
/* View-only Sched */
await L.go(page, 'viewsched'); await sleep(700)
await X.pic(page, `round-7-viewonly-${P}`, '#vWeek .day[data-day="5"]')
note('R5 View-only Sched Saturday', (await page.locator('#vWeek .day[data-day="5"]').first().innerText().catch(() => 'NO')).replace(/\s+/g, ' ').slice(0, 160))
/* publish so the Leave War has a figure, then read it */
await L.go(page, 'editsched'); await sleep(500)
await L.board(page, SAT)
const sp = await X.signAndPublish(w, SAT)
await L.closeBoard(page)
const lb = await X.lwBox(w, ranger, ISO); const lo = await X.lwOil(w, ranger, ISO, `round-8-war-oil-${P}`)
note('R6 Leave War: Ranger on Saturday', `box "${lb.box}" OIL ${JSON.stringify(lo)} published ${JSON.stringify(sp.p)}`)
check('R6 Leave War shows an OIL figure for the man', !!(lo && lo.oil), JSON.stringify(lo))
await X.pic(page, `round-9-war-${P}`)
note('console errors', JSON.stringify(w.errors.slice(0, 6)))
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify(RESULTS, null, 1))
console.log('=== ' + RESULTS.filter(r => r.ok === true).length + ' PASS ' + RESULTS.filter(r => r.ok === false).length + ' FAIL')
RESULTS.filter(r => r.ok === false).forEach(r => console.log('  FAIL', r.id, r.detail))
await w.browser.close()
