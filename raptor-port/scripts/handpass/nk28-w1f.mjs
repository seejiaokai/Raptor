// W1 part F: scenarios 11, 12, 13, 16 (plain browser, address switches). Version: nk28-w1f v1
console.log('nk28-w1f v1')
const H = await import('./nk28-w1-lib.mjs')
const { L, world, sleep, tab, shot, vis, ok, note, finish } = H
const bands = p => p.evaluate(() => [...document.querySelectorAll('.savestat.nokeep, .saveband')].filter(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0).map(e => e.className.slice(0, 30) + ':' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 60)))
// 11
let n = 0
for (const u of ['/?nostore', '/?nostore=1', '/?a=1&nostore', '/?nostorex']) {
  n++
  const w = await world({ locked: false, url: u }); const p = w.page
  await p.waitForSelector('#luser'); await sleep(500)
  const b0 = await bands(p); const pic0 = await shot(p, `11-${n}-signin`)
  await L.login(p, 'a'); await sleep(600)
  const b1 = await bands(p); const pic1 = await shot(p, `11-${n}-in`, { clip: { x: 0, y: 0, width: 1536, height: 200 } })
  await p.reload(); await sleep(1500)
  const onSign = await p.locator('#luser').count()
  if (onSign) { await p.waitForSelector('#luser'); }
  const b2 = await bands(p); const pic2 = await shot(p, `11-${n}-reload`, { clip: { x: 0, y: 0, width: 1536, height: 200 } })
  const want = u !== '/?nostorex'
  ok(`11 ${u}: band ${want ? 'shows' : 'absent'} at sign-in, in, after reload`, want ? (b0.length > 0 && b1.length > 0 && b2.length > 0) : (b0.length === 0 && b1.length === 0 && b2.length === 0), JSON.stringify({ signin: b0, signedIn: b1, afterReload: b2, reloadLandedOnSignIn: !!onSign }), pic1)
  if (w.errors.length) note(`11 ${u} page errors`, w.errors.join(' | '))
  await w.ctx.close()
}
// 12
for (const u of ['/', '/?fresh=1']) {
  const w = await world({ locked: false, url: u }); const p = w.page
  await p.waitForSelector('#luser'); const s0 = await bands(p)
  await L.login(p, 'a'); await tab(p, 'tracker'); await p.waitForSelector('#flowSvg .ball', { timeout: 30000 }); await sleep(900)
  const s1 = await bands(p)
  const before = await p.evaluate(() => (document.querySelector('#saveStat') || {}).textContent)
  let after = 'no mark made'
  try { await p.locator('#flowSvg .ball').first().click({ timeout: 5000 }); await sleep(1500); after = await p.evaluate(() => (document.querySelector('#saveStat') || {}).textContent) } catch (e) { after = 'ball click failed' }
  const pic = await shot(p, `12-${u === '/' ? 'plain' : 'fresh'}-tracker`, { clip: { x: 0, y: 0, width: 1536, height: 260 } })
  ok(`12 ${u}: no band anywhere`, s0.length === 0 && s1.length === 0, JSON.stringify({ signin: s0, tracker: s1, cornerBefore: before, cornerAfterMark: after }), pic)
  if (w.errors.length) note(`12 ${u} page errors`, w.errors.join(' | '))
  await w.ctx.close()
}
// 13
{
  const w = await world({ locked: false, url: '/?nostore&savefail' }); const p = w.page
  await p.waitForSelector('#luser'); await L.login(p, 'a'); await tab(p, 'editsched'); await sleep(600)
  const before = await bands(p); const pic0 = await shot(p, '13-before', { clip: { x: 0, y: 0, width: 1536, height: 200 } })
  let how = 'typed in first visible text box of the week'
  try {
    const box = p.locator('#vWeek input:visible, #vWeek [contenteditable]:visible').first()
    await box.click({ timeout: 5000 }); await p.keyboard.type('x'); await p.keyboard.press('Tab'); await sleep(1500)
  } catch (e) { how = 'no change made: ' + String(e.message).split('\n')[0] }
  const after = await p.evaluate(() => [...document.querySelectorAll('.savestat, .saveband')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.className.slice(0, 30) + ':' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 60)))
  const pic1 = await shot(p, '13-after', { clip: { x: 0, y: 0, width: 1536, height: 200 } })
  note('13 ?nostore&savefail', JSON.stringify({ before, how, afterChange: after }), pic1)
  if (w.errors.length) note('13 page errors', w.errors.join(' | '))
  await w.ctx.close()
}
// 16
const geo = {}
for (const [k, locked] of [['plain', false], ['refusing', true]]) {
  const w = await world({ locked }); const p = w.page
  await p.waitForSelector('#luser'); await L.login(p, 'a'); await tab(p, 'editsched'); await sleep(800)
  const bar = await vis(p, '.topbar'), wk = await vis(p, '.wk.wk-cal'), day = await vis(p, '#vWeek .day')
  const pic = await shot(p, `16-${k}-editsched`, { clip: { x: 0, y: 0, width: 1536, height: 300 } })
  await tab(p, 'inputs'); await sleep(600)
  const inp = await vis(p, '#page-inputs .intab, #page-inputs button')
  geo[k] = { barB: bar && bar.b, wkT: wk && wk.t, dayT: day && day.t, inT: inp && inp.t, wkL: wk && wk.l, dayL: day && day.l, dayH: day && day.h, pic }
  await w.ctx.close()
}
const dWk = geo.refusing.wkT - geo.plain.wkT, dDay = geo.refusing.dayT - geo.plain.dayT, dIn = geo.refusing.inT - geo.plain.inT
ok('16 first row lower by exactly the band height, nothing else moved', dWk === 36 && dDay === 36 && dIn === 36 && geo.refusing.dayL === geo.plain.dayL && geo.refusing.dayH === geo.plain.dayH, JSON.stringify({ shifts: { week: dWk, firstDay: dDay, inputs: dIn }, plain: geo.plain, refusing: geo.refusing }), geo.refusing.pic)
finish('results-f.json')
await L.closeAll()
