import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE } = C
const { browser, p, errors } = await K.fresh()
const rd = async (tag) => {
  const x = await C.painted(p, `#eWeek .day[data-day="${TUE}"]`, ID)
  const st = await p.evaluate(() => ({ wf: !!window.WFOCUS, open: !!document.querySelector('#eWeek .day[data-day="1"] [data-dwbox="1"].open') }))
  console.log(tag, JSON.stringify(st), x.filter(y => y.where === 'flying line').map(y => y.cls.replace(/\s+/g, ' ').split(' ').filter(c => /boxdash|boxred|wfoc|warn/.test(c)).join('.') + ' | ' + (y.dashed ? 'DASHED' : y.solid ? 'SOLID' : 'none') + ' outline:' + y.outline).join(' ; '))
}
try {
  const m = await C.flyWave(p, MON, { cs: 'ZM', msn: 'BFM', to: '15:00', ld: '17:00' })
  const t = await C.flyWave(p, TUE, { cs: 'ZT', msn: 'BFM', br: '05:00', to: '08:00', ld: '09:00' })
  await W.boardText(p, `fr:${TUE}.${t.gi}.0.0`, 'LATE SHOW')
  await B.toEdit(p); await W.showDay(p, TUE); await C.sleep(600)
  await rd('A after toEdit, list not opened yet')
  await B.openList(p, '#eWeek', TUE); await C.sleep(600)
  await rd('B after openList')
  await p.locator(`#eWeek .day[data-day="${TUE}"] [data-daywarn="${TUE}"]`).first().click(); await C.sleep(500)
  await rd('C after clicking the bar again (closing)')
  await p.locator(`#eWeek .day[data-day="${TUE}"] [data-daywarn="${TUE}"]`).first().click(); await C.sleep(500)
  await rd('D after clicking the bar again (opening)')
  console.log('ERR', errors.join(' | '))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
