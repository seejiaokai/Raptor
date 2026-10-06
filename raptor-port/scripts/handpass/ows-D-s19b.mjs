/* S19 (control + plan B): do plan switches alone drop A's signatures? and B published under debrief 2h30 */
import * as D from './ows-D-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, signsOf, ISO } = D
const SAT = 5
const log = (...a) => console.log('>>', ...a)
async function items(p) {
  await A.toWeek(p); await W.showDay(p, SAT)
  const m = p.locator(`#eWeek [data-planmenu="${SAT}"]:visible`).first()
  await m.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await m.click(); await sleep(500)
  return p.evaluate(() => [...document.querySelectorAll('[data-plansel],[data-plangolive],[data-plandup]')].filter(e => e.offsetParent !== null).map(e => ({ sel: e.dataset.plansel || (e.dataset.plangolive !== undefined ? 'LIVE' : 'DUP'), text: (e.innerText || '').replace(/\s+/g, ' ').trim() })))
}
async function goPlan(p, name) {
  const it = (await items(p)).find(i => i.text.startsWith(name) && !/live now/.test(i.text))
  if (!it) { await p.keyboard.press('Escape'); return 'already live or missing' }
  await p.locator(it.sel === 'LIVE' ? '[data-plangolive]:visible' : `[data-plansel="${it.sel}"]:visible`).first().click(); await sleep(900); return it.text
}
const planLabel = p => p.evaluate(i => ((document.querySelector(`#eWeek [data-planmenu="${i}"] .psl`) || {}).innerText || '').trim(), SAT)
const itLine = p => p.evaluate(i => (window.DAYS[i].waves[0].intimes || [])[0], SAT)
async function head(p, tag) { await A.toWeek(p); await W.showDay(p, SAT); const h = await A.dayHead(p, SAT); h.pic = await P(p, tag); return h }
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(300)
const w = await D.flyingWave(p, SAT, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'bane' })
await A.closeBoard(p); await A.toWeek(p); await W.showDay(p, SAT)
await A.addItBtn(p, SAT, w.wi); await A.setItLine(p, SAT, w.wi, 0, 'IN TIME 0830')
const its = await items(p); await p.locator('[data-plandup]:visible').first().click(); await sleep(900)
await A.toWeek(p); await W.showDay(p, SAT); await A.setItLine(p, SAT, w.wi, 0, 'IN TIME 1000')
log('plans', await planLabel(p), await itLine(p))
log('go A', await goPlan(p, 'Plan A'), await planLabel(p), await itLine(p))
const s = await W.signDay(p, SAT); const h1 = await head(p, 'S19b-A-signed')
log('signed', JSON.stringify(s), signsOf(h1))
log('go B', await goPlan(p, 'Plan B'), await planLabel(p), await itLine(p))
const hB = await head(p, 'S19b-B-live')
log('back A (no Logic change at all)', await goPlan(p, 'Plan A'), await planLabel(p), await itLine(p))
const h2 = await head(p, 'S19b-A-back-nochange')
log('A after a plain switch there and back:', signsOf(h2), JSON.stringify(h2.signs), 'nys', h2.nys)
/* now B published under debrief 2h30 */
await A.logicSet(p, 'debrief', '2h30')
log('go B', await goPlan(p, 'Plan B'), await planLabel(p), await itLine(p))
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
const o = await D.oilOf(p, 'bane', ISO[SAT], 'S19b-B-published')
log('B published:', o.cell.text, '|', o.row.slice(0, 200))
judge('S19.control', 'plans A (signed) and B; switched to B and back to A with NO Logic change; then debrief 2h30 and B published', [
  ['A signed (four names)', W.signsFull(h1), h1.signs],
  ['switching to B and back, nothing else: A\'s four signatures still stand', W.signsFull(h2), { selects: h2.signs, marker: h2.nys }],
  ['B published under debrief 2h30: HO, worked 10:00–15:30 (330 min)', o.letters === 'HO' && /10:00.15:30/.test(o.row), `${o.cell.text} | ${o.row.slice(0, 160)}`],
], [h1.pic, hB.pic, h2.pic, ...o.pics])
console.log('ERRORS', JSON.stringify(D.cleanErr(errors)))
D.savePart('ows-D-s19b', { errors: D.cleanErr(errors), pics: D.pics.saved })
await browser.close()
