import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE } = C
const WED = 2
const { browser, p, errors } = await K.fresh()
const dump = async (tag) => {
  const w = (await B.warnsOf(p, WED)).filter(x => x.who.includes(ID)).map(x => `${x.sev}/${x.code}${x.off ? '/OFF' : ''} key=${x.key}`)
  await B.toEdit(p); await W.showDay(p, WED)
  await B.openList(p, '#eWeek', WED)
  const l = await C.listFull(p, '#eWeek', WED)
  const pk = await C.painted(p, '#eWeek .day[data-day="2"]', ID)
  console.log(tag, 'WARN:', JSON.stringify(w), '| list lines:', JSON.stringify(l.filter(x => x.text.includes(C.CSN)).map(x => (x.hid ? 'HID ' : '') + x.text.slice(0, 70))), '| pucks', C.pk2(pk))
}
try {
  const t = await C.flyWave(p, TUE, { cs: 'ZT', msn: 'BFM', br: '05:00', to: '07:00', ld: '08:00' })
  const tp0 = await C.flyWave(p, TUE, { cs: 'TP', msn: 'BFM' })
  await K.boardTo(p, TUE)
  await p.locator('#schedBoard #sbTpl').click(); await C.sleep(400)
  await p.getByText('Save this day as a template').first().click(); await C.sleep(700)
  await p.getByRole('button', { name: 'Done' }).last().click().catch(() => {}); await C.sleep(500)
  await W.boardOff(p)
  const lv = await C.flyWave(p, TUE, { cs: 'ZV', msn: 'BFM', to: '20:00', ld: '22:30' })
  await W.boardOff(p)
  await K.boardTo(p, WED)
  await p.locator('#schedBoard #sbTpl').click(); await C.sleep(500)
  await p.getByRole('button', { name: /Template 1/ }).first().click(); await C.sleep(900)
  const ok = p.getByRole('button', { name: /^(Apply|Replace|Yes|Confirm|OK)/i }).first()
  if (await ok.count()) { console.log('pressed', await ok.innerText()); await ok.click(); await C.sleep(900) }
  const zt = await p.evaluate(() => { for (let g = 0; g < window.DAYS[2].waves.length; g++) { const fs = window.DAYS[2].waves[g].formations; for (let f = 0; f < fs.length; f++) if (fs[f].cs === 'ZT') return [g, f] } return null })
  console.log('zt at', JSON.stringify(zt))
  await dump('A applied, nobody seated')
  const s = await K.seat(p, WED, zt[0], zt[1], 0, C.SEAT, ID)
  console.log('seat took', s.took, s.msg)
  await dump('B seated on the copied ZT')
  const tp = await p.evaluate(() => { for (let g = 0; g < window.DAYS[2].waves.length; g++) { const fs = window.DAYS[2].waves[g].formations; for (let f = 0; f < fs.length; f++) if (fs[f].cs === 'TP') return [g, f] } return null })
  console.log('tp at', JSON.stringify(tp))
  const s2 = await K.seat(p, WED, tp[0], tp[1], 0, C.SEAT, ID)
  console.log('seat2 took', s2.took, s2.msg)
  await dump('C seated on ZT and TP')
  await B.pic(p, 'p15-wed')
  // is it hidden? read the hidden registry
  const hid = await p.evaluate(() => JSON.stringify(window.WARNHIDE ? [...window.WARNHIDE] : (window.HIDDEN || 'n/a')).slice(0, 300))
  console.log('hidden registry:', hid)
  console.log('ERR', errors.join(' | '))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
