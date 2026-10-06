/* S39 follow-up — Off day declared on an issued earning weekend: does the day ever read pending (also after a reload)? */
import * as D from './ows-D-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, pend, ISO } = D
const SAT = 5
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(300)
const w = await D.flyingWave(p, SAT, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'bane' })
await A.closeBoard(p); await A.toWeek(p); await W.showDay(p, SAT)
await A.addItBtn(p, SAT, w.wi); await A.setItLine(p, SAT, w.wi, 0, 'IN TIME 0830')
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
const s0 = await D.oilOf(p, 'bane', ISO[SAT], 'S39b-issued')
async function declare(label) {
  await L.go(p, 'leavewar'); await sleep(900)
  const m = p.locator('[data-testid="month-JUL"]'); if (await m.count()) { await m.first().click(); await sleep(900) }
  const c = p.locator(`[data-testid="event-0-${ISO[SAT]}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(250)
  await c.click(); await sleep(600)
  const chip = p.locator('[data-testid="event-text"]').locator('xpath=ancestor::*[self::div][3]').getByRole('button', { name: label, exact: true }).first()
  if (await chip.count()) await chip.click(); else await p.locator('[data-testid="event-text"]').fill(label)
  await p.locator('[data-testid="event-apply"]').click(); await sleep(800)
}
await declare('Off day')
const d1 = await D.dayState(p, SAT, 'S39b-after-offday')
const pnl1 = await A.alPanel(p)
await A.reloadAs(p, 'a').catch(() => {}); await A.reloadAs(p, 'a').catch(() => {})
const d2 = await D.dayState(p, SAT, 'S39b-after-reload')
const o2 = await D.oilOf(p, 'bane', ISO[SAT], 'S39b-after-reload')
const pnl2 = await A.alPanel(p)
await A.toWeek(p); await W.showDay(p, SAT)
const btns = await p.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); return [...d.querySelectorAll('button')].filter(b => b.offsetParent !== null).map(b => (b.innerText || '').trim().slice(0, 30)) }, SAT)
judge('S39.D3', 'Saturday issued with credit (FO, 08:30–15:00); then the Leave War event row for 18 Jul set to "Off day"; the day, the Amendments box, a reload', [
  ['issued FO', s0.letters === 'FO', s0.cell.text],
  ['the credit is held (cell still FO)', o2.letters === 'FO', o2.cell.text],
  ['the day reads a pending change', pend(d1.head) !== '0' || pend(d2.head) !== '0', { afterDeclare: d1.head.pending, afterReload: d2.head.pending }],
  ['the Amendments box shows a day with changes', /change/i.test((pnl1 && pnl1.text) || '') && !/No pending/i.test((pnl1 && pnl1.text) || ''), pnl1 && pnl1.text.slice(0, 200)],
], [...d1.pics, ...d2.pics, ...o2.pics])
console.log('Amendments after declare:', pnl1 && pnl1.text.slice(0, 250), '| buttons', JSON.stringify(pnl1 && pnl1.btns))
console.log('Amendments after reload:', pnl2 && pnl2.text.slice(0, 250), '| day buttons', JSON.stringify(btns))
console.log('ERRORS', JSON.stringify(D.cleanErr(errors)))
D.savePart('ows-D-s39b', { errors: D.cleanErr(errors), pics: D.pics.saved })
await browser.close()
