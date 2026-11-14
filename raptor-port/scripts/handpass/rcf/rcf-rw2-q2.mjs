console.log('rcf-rw2-q2 v1 — Q2: a flying standby row is red whatever the "SC MAIN clashes" settings say (D1996), desktop')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 'q2a'
process.env.HP_URL ||= 'http://localhost:4293'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/rewalk2/' + RUN)
const { mkdirSync } = await import('node:fs')
mkdirSync(process.env.HP_SHOTS, { recursive: true })
const R = await import('./rcf-rw-lib.mjs')
const { W, L, sleep, check, PASSIF, shot, read, notPub, warnCrop, crop } = R
const DI = 5
const browser = await W.launch()
const logicKind = async (page, label) => page.evaluate(l => { const k = [...document.querySelectorAll('#page-logic .lgkinds .lgk')].find(e => e.querySelector('span').textContent.trim() === l); return k ? k.className + ' | ' + k.innerText.replace(/\s+/g, ' ') : 'none' }, label)
const openLogicEdit = async page => {
  await page.locator('a[data-page="logic"]:visible').first().click()
  await page.waitForSelector('#page-logic.on'); await sleep(400)
  await page.locator('#lgEdit').click(); await sleep(300)
}
const setKind = async (page, label, want, tag) => {
  await openLogicEdit(page)
  let cur = await logicKind(page, label)
  console.log(label, 'before', cur)
  if (!(new RegExp(want, 'i')).test(cur)) {
    await page.locator('#page-logic .lgkinds .lgk', { hasText: label }).locator('input[data-lgkind]').first().click(); await sleep(400)
    cur = await logicKind(page, label)
  }
  console.log(label, 'now', cur)
  const pic = await crop(page, '#page-logic .lgset-kinds', tag)
  await page.locator('#lgDone').click(); await sleep(400)
  return { cur, pic }
}
const red = o => o.lines.filter(notPub).filter(l => l.sev === 'RED' && /SC/.test(l.text))
const amber = o => o.lines.filter(notPub).filter(l => l.sev === 'AMBER' && /SC/.test(l.text))
const redRings = o => o.boardRings.filter(x => /RED/.test(x))
const amberRings = o => o.boardRings.filter(x => /AMBER/.test(x))
const show = o => JSON.stringify(o.lines.filter(notPub).map(l => [l.sev, l.state, l.text]))

const { page } = await W.world(browser)
console.log('BUNDLE', await R.bundle(page))
const bane = await W.pid(page, 'Ranger')
/* 1 */
const adv = await setKind(page, 'a flight', 'Advisory', 'q2-1-logic-flight-adv')
const sh = await logicKind(page, 'another shift')
PASSIF('Q2.1 "a flight" reads Advisory, "another shift" Warning', /Advisory/.test(adv.cur) && /Warning/.test(await (async () => { await openLogicEdit(page); const x = await logicKind(page, 'another shift'); await page.locator('#lgDone').click(); await sleep(300); return x })()), adv.cur + ' || another shift: ' + sh, adv.pic)
/* 2 */
await W.openBoard(page, DI)
const gi = await W.addWave(page, DI, 'sc')
await W.setF(page, `ff:${DI}.${gi}.0.rl`, '0630')
await W.setF(page, `ff:${DI}.${gi}.1.to`, '0900'); await W.setF(page, `ff:${DI}.${gi}.1.ld`, '1500')
await sleep(300)
console.log('shifts', JSON.stringify(await page.evaluate(([d, gi]) => window.DAYS[d].waves[gi].formations.map(f => [f.shift, f.to, f.ld, f.rl, f.br]), [DI, gi])))
const r1 = await L.put(page, `[data-slot="${DI}.${gi}.0.0.p"]`, [bane])
const r2 = await L.put(page, `[data-slot="${DI}.${gi}.1.0.p"]`, [bane])
console.log('put', r1, r2)
await W.openWarnFold(page)
let o = await read(page, DI, bane, 'step2')
PASSIF('Q2.2 AM R 06:30, PM 09:00-15:00, Ranger on both MAIN seats, "a flight" Advisory: red line, red pucks', red(o).length >= 1 && red(o)[0].text.includes('Ranger') && redRings(o).length >= 2, show(o) + ' | rings ' + o.boardRings, await warnCrop(page, 'q2-2-flying-red'))
await shot(page, 'q2-2-board')
/* 3 */
await W.setF(page, `ff:${DI}.${gi}.0.rl`, '')
o = await read(page, DI, bane, 'step3')
const sc3 = o.lines.filter(notPub).filter(l => /SC/.test(l.text))
PASSIF('Q2.3 AM R cleared: the line follows "another shift" (Warning -> red)', sc3.length >= 1 && sc3.every(l => l.sev === 'RED') && redRings(o).length >= 2, show(o) + ' | rings ' + o.boardRings, await warnCrop(page, 'q2-3-standby-follows-shift'))
await shot(page, 'q2-3-board')
await W.closeBoard(page)
/* 4 */
const back = await setKind(page, 'a flight', 'Warning', 'q2-4-logic-restored')
PASSIF('Q2.4 "a flight" restored (ticked, Warning)', /Warning/.test(back.cur), back.cur, back.pic)
/* 5 */
await openLogicEdit(page)
await page.locator('#lgDone').click(); await sleep(400)
const lineSel = '#page-logic .lgset-kinds'
const setting = await page.evaluate(() => { const n = [...document.querySelectorAll('#page-logic [data-lgset], #page-logic .lgset, #page-logic .lgset-kinds')].map(e => e.closest('.lgset') || e); const hit = n.find(e => /SC MAIN clashes/.test(e.innerText)); return hit ? hit.innerText.replace(/\s+/g, ' ').trim() : 'none' })
console.log('SETTING', setting)
const pic5 = await crop(page, '#page-logic .lgset-kinds', 'q2-5-setting-line')
const full = await page.evaluate(() => { const el = [...document.querySelectorAll('#page-logic *')].filter(e => e.children.length === 0 && /Once his shift flies, every clash is red\./.test(e.textContent)); return el.map(e => e.textContent.trim()) })
console.log('LINE', JSON.stringify(full))
PASSIF('Q2.5 the Logic page\'s "SC MAIN clashes" setting line ends "Once his shift flies, every clash is red."', full.some(t => /Once his shift flies, every clash is red\.$/.test(t)) || /Once his shift flies, every clash is red\./.test(setting), JSON.stringify(full) + ' | ' + setting.slice(0, 300), pic5)
// a picture of the whole setting block including its line
const blk = page.locator('#page-logic', { has: page.locator('.lgset-kinds') })
const holder = await page.evaluateHandle(() => { const k = document.querySelector('#page-logic .lgset-kinds'); let e = k; while (e && e.parentElement && !/SC MAIN clashes/.test(e.innerText)) e = e.parentElement; return e })
try { await holder.asElement().scrollIntoViewIfNeeded(); await holder.asElement().screenshot({ path: process.env.HP_SHOTS + '/q2-5-setting-block.png' }) } catch (e) { console.log('block pic failed', e.message) }
await page.close()
R.finish()
await browser.close()
