import { launch, world, bye, rec, FRI } from './on-D-lib.mjs'
const browser = await launch()
const out = {}
const setup = async tag => {
  const w = await world(browser, { tag })
  await w.giveWarden()
  const ids = await w.fileFriday()
  const odId = await page0(w)
  await w.makeHoliday('National Day', [FRI])
  return { w, ids, odId }
}
const page0 = w => w.page.evaluate(() => { const r = window.INPUTS.find(x => x.type === 'OD' && /Jul 17|17 Jul/.test(String(x.d))); return r ? r.iid : null })
const saberId = w => w.page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))

/* ---------- D3 ---------- */
{
  const { w, ids } = await setup('D3'); const { page, tid } = w
  const cardIds = await tid('win-oilday').locator('.icard').count()
  w.say('cards', cardIds)
  await w.press(tid('odl-yesall'))
  w.say('count after yes to all', await tid('odl-count').innerText()); w.say('left', await tid('odl-left').innerText())
  await w.hush(); out.d3a = await w.shot('D3-yes-to-all', { x: 960, y: 80, width: 480, height: 480 }); await w.unhush()
  await w.press(tid('odl-save')); await page.waitForTimeout(700)
  w.say('list after save', await tid('win-oilday').count())
  await w.closeCal()
  const all = await page.evaluate(() => window.INPUTS.filter(r => /Jul 17|17 Jul/.test(String(r.d))).map(r => `${r.title || r.type}:${JSON.stringify(r.oil || null)}`).join(' ; '))
  w.say('Fri inputs oil', all)
  w.say('Saber lit', await w.bellLit())
  w.say('Saber lines', await w.bellLines()); await w.hush(); out.d3b = await w.shot('D3-saber-bell', { x: 700, y: 0, width: 740, height: 300 }); await w.closeBell()
  await w.me('nact')
  w.say('Warden lit', await w.bellLit()); w.say('Warden lines', await w.bellLines()); await w.hush(); out.d3c = await w.shot('D3-warden-bell', { x: 700, y: 0, width: 740, height: 300 })
  w.say('errors', await bye(w))
}
/* ---------- D4 ---------- */
{
  const { w, ids } = await setup('D4'); const { page, tid } = w
  const sid = await saberId(w)
  w.say('saber id', sid)
  const before = await w.state(ids)
  const u0 = await w.undoInfo()
  await w.press(tid('odl-later')); await page.waitForTimeout(500)
  w.say('list after Later', await tid('win-oilday').count())
  await w.closeCal()
  w.say('oil after Later (nothing written)', await w.state(ids)); w.say('undo', await w.undoInfo()); w.say('undo before', u0)
  w.say('SABER lit', await w.bellLit())
  let lines = await w.bellLines(); w.say('SABER lines', lines)
  await w.hush(); out.d4a = await w.shot('D4-saber-bell', { x: 700, y: 0, width: 740, height: 300 })
  const bl = tid('bell-list')
  await w.press(bl.locator('.bl-line').first()); await page.waitForTimeout(500)
  w.say('Saber tap: list', await tid('win-oilday').count()); w.say('lead present', await tid('odl-lead').count()); w.say('bell list still', await bl.count())
  w.say('Saber tap toast', await w.toast())
  out.d4b = await w.shot('D4-saber-tap-list', { x: 900, y: 60, width: 540, height: 520 })
  w.say('count', await tid('odl-count').innerText().catch(() => ''))
  await w.press(tid('odl-later')); await page.waitForTimeout(300)
  // Warden
  await w.me('nact')
  w.say('WARDEN lit', await w.bellLit())
  lines = await w.bellLines(); w.say('WARDEN lines', lines)
  await w.hush(); out.d4c = await w.shot('D4-warden-bell', { x: 700, y: 0, width: 740, height: 300 }); await w.unhush()
  await w.press(bl.locator('.bl-line').first()); await page.waitForTimeout(500)
  w.say('Warden tap: list', await tid('win-oilday').count()); w.say('lead present', await tid('odl-lead').count()); w.say('bell list closed', await bl.count() === 0)
  w.say('title', (await tid('win-oilday').locator('.win-ttl').innerText().catch(() => '')).replace(/\s+/g, ' '))
  w.say('measure', await w.measure('[data-testid="win-oilday"]'))
  await w.hush(); out.d4d = await w.shot('D4-warden-list', { x: 900, y: 60, width: 540, height: 520 }); await w.unhush()
  await w.press(tid('odl-yesall')); w.say('count', await tid('odl-count').innerText())
  await w.press(tid('odl-save')); await page.waitForTimeout(700)
  w.say('toast after save', await w.toast())
  w.say('oil after answer', await w.state(ids))
  w.say('Warden lit', await w.bellLit()); w.say('WARDEN lines after', await w.bellLines()); await w.hush(); out.d4e = await w.shot('D4-warden-bell-after', { x: 700, y: 0, width: 740, height: 300 }); await w.closeBell()
  await w.me(sid)
  w.say('SABER lit after', await w.bellLit()); w.say('SABER lines after', await w.bellLines()); await w.hush(); out.d4f = await w.shot('D4-saber-bell-after', { x: 700, y: 0, width: 740, height: 300 })
  w.say('errors', await bye(w))
}
console.log('PICS', JSON.stringify(out))
await browser.close()
