/* exploratory: when does the lit (wfoc) ring on Monday's pucks go away */
import * as K from './rbl-A-lib.mjs'
const { B, W, X, MON, TUE } = K
const { browser, p, errors } = await K.fresh()
const { m, t } = await K.baseB(p)
const b = await K.addFlyWave(p, MON)
const st = await K.seat(p, MON, b.gi, 0, 0, 'w', X); console.log('SEAT MSG', JSON.stringify(st.msg))
await W.boardOff(p); await B.toEdit(p); await W.showDay(p, MON)
const cnt = async tag => console.log(tag, JSON.stringify(await p.evaluate(who => ({ wfocWeekMon: document.querySelectorAll('#eWeek .day[data-day="0"] .puck.wfoc').length, wfocAll: document.querySelectorAll('.puck.wfoc').length, xmon: [...document.querySelectorAll(`#eWeek .day[data-day="0"] .puck[data-person="${who}"]`)].map(e => e.className.replace('puck ', '')), open0: !!document.querySelector('#eWeek .day[data-day="0"] [data-dwbox="0"].open'), open1: !!document.querySelector('#eWeek .day[data-day="1"] [data-dwbox="1"].open') }), X)))
await cnt('after seat, on week')
for (let i = 0; i < 3; i++) { await K.sleep(1500); await cnt('+' + (i + 1) * 1.5 + 's') }
const bar1 = p.locator('#eWeek .day[data-day="1"] [data-daywarn="1"]').first()
await bar1.click(); await K.sleep(400); await cnt('after click Tue bar')
await bar1.click(); await K.sleep(400); await cnt('after 2nd click Tue bar')
const bar0 = p.locator('#eWeek .day[data-day="0"] [data-daywarn="0"]').first()
await W.showDay(p, MON)
await bar0.click(); await K.sleep(400); await cnt('after click Mon bar')
await bar0.click(); await K.sleep(400); await cnt('after 2nd click Mon bar')
await B.pic(p, 'explore3-final')
console.log('errors', errors)
await browser.close()
