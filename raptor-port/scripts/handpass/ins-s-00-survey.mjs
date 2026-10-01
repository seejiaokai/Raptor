import * as S from './ins-s-lib.mjs'
const { B, L, W } = S
const { browser, p, errors } = await B.world()
try {
  await B.toEdit(p)
  console.log('page', await p.evaluate(() => window.CURPAGE), 'week', await p.evaluate(() => window.CURWEEK))
  const r0 = await S.look(p, 'survey-open')
  console.log('INS', S.brief(r0)); console.log(JSON.stringify({ title: r0.title, top: r0.topmost, box: r0.box, z: r0.z, how: r0.how }))
  await W.boardOn(p, 1)
  const bar = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); const bs = [...b.querySelectorAll('button')].filter(e => e.offsetParent !== null && e.getBoundingClientRect().top < 80).map(e => (e.id || '') + '|' + (e.innerText || '').trim().slice(0, 14) + '|' + (e.title || '').slice(0, 30)); return bs })
  console.log('BOARD BAR', JSON.stringify(bar))
  console.log('insightBtn visible while board?', await p.locator('#insightBtn:visible').count(), 'topmost?', await p.evaluate(() => { const e = document.querySelector('#insightBtn'); if (!e) return 'absent'; const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return x === e || e.contains(x) }))
  await B.pic(p, 'survey-board')
  const days = await p.evaluate(() => window.DAYS.map(d => d.dt))
  console.log('days', days)
} catch (e) { console.log('ERR', e.stack) }
console.log('errors', errors)
await browser.close()
