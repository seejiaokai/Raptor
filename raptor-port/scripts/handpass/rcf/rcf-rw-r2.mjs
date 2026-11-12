console.log('rcf-rw-r2 v1 — R2: a flying shift under Advisory (D1996), desktop')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 'r2a'
process.env.HP_URL ||= 'http://localhost:4292'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/rewalk/' + RUN)
const { mkdirSync } = await import('node:fs')
mkdirSync(process.env.HP_SHOTS, { recursive: true })
const R = await import('./rcf-rw-lib.mjs')
const { W, L, sleep, check, PASSIF, shot, read, notPub, warnCrop, crop } = R
const DI = 5
const browser = await W.launch()
const logicKind = async (page, label) => page.evaluate(l => { const k = [...document.querySelectorAll('#page-logic .lgkinds .lgk')].find(e => e.querySelector('span').textContent.trim() === l); return k ? k.className + ' | ' + k.innerText.replace(/\s+/g, ' ') : 'none' }, label)
const setLogicShift = async (page, want, tag) => {
  await page.locator('a[data-page="logic"]:visible').first().click()
  await page.waitForSelector('#page-logic.on'); await sleep(400)
  await page.locator('#lgEdit').click(); await sleep(300)
  let cur = await logicKind(page, 'another shift')
  console.log('another shift before', cur)
  if (!(new RegExp(want, 'i')).test(cur)) {
    await page.locator('#page-logic input[data-lgkind="shift"]').first().click(); await sleep(400)
    cur = await logicKind(page, 'another shift')
  }
  console.log('another shift now', cur)
  const pic = await crop(page, '#page-logic .lgset-kinds', tag)
  await page.locator('#lgDone').click(); await sleep(400)
  return { cur, pic }
}
const red = o => o.lines.filter(notPub).filter(l => l.sev === 'RED')
const amber = o => o.lines.filter(notPub).filter(l => l.sev === 'AMBER')
const redRings = o => o.boardRings.filter(x => /RED/.test(x))
const amberRings = o => o.boardRings.filter(x => /AMBER/.test(x))
const show = o => JSON.stringify(o.lines.filter(notPub).map(l => [l.sev, l.state, l.text]))

const { page } = await W.world(browser)
console.log('BUNDLE', await R.bundle(page))
const bane = await W.pid(page, 'Ranger')
/* 1. Logic -> Edit -> another shift Advisory */
const adv = await setLogicShift(page, 'Advisory','r2-1-logic-adv')
PASSIF('R2.1 Logic: SC MAIN clashes -> another shift reads Advisory', /Advisory/.test(adv.cur), adv.cur, adv.pic)
/* 2. board: SC wave, AM R 06:30, PM 09:00-15:00, Ranger on both MAIN seats */
await W.openBoard(page, DI)
const gi = await W.addWave(page, DI, 'sc')
const defaults = await page.evaluate(([d, gi]) => window.DAYS[d].waves[gi].formations.map(f => ({ shift: f.shift, to: f.to, ld: f.ld, rl: f.rl, br: f.br })), [DI, gi])
console.log('SC wave defaults', JSON.stringify(defaults))
await W.setF(page, `ff:${DI}.${gi}.0.rl`, '0630')
await W.setF(page, `ff:${DI}.${gi}.1.to`, '0900'); await W.setF(page, `ff:${DI}.${gi}.1.ld`, '1500')
await sleep(300)
console.log('shifts', JSON.stringify(await page.evaluate(([d, gi]) => window.DAYS[d].waves[gi].formations.map(f => [f.shift, f.to, f.ld, f.rl, f.br]), [DI, gi])))
const r1 = await L.put(page, `[data-slot="${DI}.${gi}.0.0.p"]`, [bane])
const r2 = await L.put(page, `[data-slot="${DI}.${gi}.1.0.p"]`, [bane])
console.log('put', r1, r2)
await W.openWarnFold(page)
let o = await read(page, DI, bane, 'step2: AM R 06:30, PM 09:00-15:00, Ranger on both, Advisory')
PASSIF('R2.2 AM flies, PM stands by (09:00-15:00), Advisory: ONE RED line for Ranger, his pucks red', red(o).length === 1 && red(o)[0].text.includes('Ranger') && amber(o).filter(l => /SC/.test(l.text)).length === 0 && redRings(o).length >= 2, show(o) + ' | rings ' + o.boardRings, await warnCrop(page, 'r2-2-flying-red'))
await shot(page, 'r2-2-board')
/* 3. clear AM's R: amber */
await W.setF(page, `ff:${DI}.${gi}.0.rl`, '')
o = await read(page, DI, bane, 'step3: AM R cleared, both stand by')
PASSIF('R2.3 AM R cleared: the amber line, pucks amber, no red', amber(o).some(l => /SC/.test(l.text)) && red(o).filter(l => /SC/.test(l.text)).length === 0 && redRings(o).length === 0 && amberRings(o).length >= 1, show(o) + ' | rings ' + o.boardRings, await warnCrop(page, 'r2-3-standby-amber'))
await shot(page, 'r2-3-board')
/* 4. type AM's R again; then PM times back, PM FLIES ticked by hand, AM's R cleared */
await W.setF(page, `ff:${DI}.${gi}.0.rl`, '0630')
o = await read(page, DI, bane, 'step4a: AM R typed again')
PASSIF('R2.4a AM R typed again: red again', red(o).filter(l => /SC/.test(l.text)).length >= 1 && redRings(o).length >= 2, show(o) + ' | rings ' + o.boardRings, await warnCrop(page, 'r2-4a-R-again'))
/* PM's times back to what the wave drew, AM's R cleared */
await W.setF(page, `ff:${DI}.${gi}.1.to`, String(defaults[1].to || '').replace(':', ''))
await W.setF(page, `ff:${DI}.${gi}.1.ld`, String(defaults[1].ld || '').replace(':', ''))
await W.setF(page, `ff:${DI}.${gi}.0.rl`, '')
console.log('after restore', JSON.stringify(await page.evaluate(([d, gi]) => window.DAYS[d].waves[gi].formations.map(f => [f.shift, f.to, f.ld, f.rl, f.br]), [DI, gi])))
o = await read(page, DI, bane, 'step4b: PM times back to defaults, AM R cleared, nothing flies')
check('R2.4b PM times back, nothing flies (record)', 'RECORD', show(o) + ' | rings ' + o.boardRings, await warnCrop(page, 'r2-4b-times-back'))
const flies = page.locator(`#schedBoard [data-safly="${DI}.${gi}.1.0"]:visible`)
const nf = await flies.count()
console.log('PM Flies button count', nf, nf ? (await flies.first().innerText()).trim() : '')
if (nf) {
  await L.tap(page, `[data-safly="${DI}.${gi}.1.0"]`); await sleep(500)
  await shot(page, 'r2-4c-board-after-flies')
  o = await read(page, DI, bane, 'step4c: PM FLIES ticked by hand, AM R cleared')
  const ticked = await page.evaluate(([d, gi]) => JSON.stringify(window.DAYS[d].waves[gi].formations.map(f => f.aircraft.map(a => a.fly || a.flies || a.sf))), [DI, gi])
  console.log('fly flags', ticked)
  const overlaps = defaults[1].to && defaults[1].ld
  PASSIF('R2.4c PM row FLIES ticked, AM R cleared (PM times back): a RED line for Ranger, pucks red', red(o).filter(l => /SC/.test(l.text)).length >= 1 && redRings(o).length >= 1, show(o) + ' | rings ' + o.boardRings + ' | PM defaults ' + JSON.stringify(defaults[1]), await warnCrop(page, 'r2-4c-flies-ticked'))
  /* if the restored times do not overlap, the clash may simply not exist: repeat with the overlapping 09:00-15:00 */
  if (!red(o).length) {
    await W.setF(page, `ff:${DI}.${gi}.1.to`, '0900'); await W.setF(page, `ff:${DI}.${gi}.1.ld`, '1500'); await sleep(300)
    o = await read(page, DI, bane, 'step4d: PM FLIES still ticked, PM times 09:00-15:00')
    PASSIF('R2.4d PM FLIES ticked and PM 09:00-15:00 overlapping, AM R cleared: RED', red(o).filter(l => /SC/.test(l.text)).length >= 1 && redRings(o).length >= 1, show(o) + ' | rings ' + o.boardRings, await warnCrop(page, 'r2-4d-flies-overlap'))
  }
} else check('R2.4c PM FLIES tick', 'NOT WALKED', 'no Flies button on the PM MAIN row', '')
await W.closeBoard(page)
/* 5. restore Logic */
const back = await setLogicShift(page, 'Warning','r2-5-logic-restored')
PASSIF('R2.5 Logic restored: another shift ticked, reads Warning', /Warning/.test(back.cur), back.cur, back.pic)
await page.close()
R.finish()
await browser.close()
