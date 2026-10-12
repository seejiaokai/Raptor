import { launch, world, bye, FRI } from './on-D-lib.mjs'
const browser = await launch()
const sid = 'stiff'
const lineFor = async (w, who) => { if (who) await w.me(who); const L = await w.bellLines(); const lit = await w.bellLit(); await w.closeBell(); return { lit, L: L.map(l => (l.unread ? '[unread] ' : '[read] ') + l.text) } }
const reload = async w => {
  await w.page.reload(); await w.page.waitForTimeout(1500)
  const login = await w.page.locator('#loginForm').isVisible().catch(() => false)
  w.say('login form after reload', login)
  if (login) { await w.page.fill('#luser', 'ad'); await w.page.fill('#lpass', 'a'); await w.page.click('#loginForm button[type=submit]'); await w.page.waitForSelector('#vWeek .day', { state: 'attached' }) }
  await w.page.waitForTimeout(500)
  return login
}
for (const mode of (process.argv[2] || 'AB').split('')) {
  const w = await world(browser, { tag: 'D11' + mode, fresh: false }); const { page, tid } = w
  await w.giveWarden()
  const ids = await w.fileFriday(); await w.makeHoliday('National Day', [FRI])
  if (mode === 'A') {
    await w.press(tid(`odl-yes-${ids[1]}`)); await w.press(tid(`odl-yes-${ids[0]}`)); await w.press(tid(`odl-no-${ids[2]}`)); await w.press(tid('odl-save')); await page.waitForTimeout(600)
  } else await w.press(tid('odl-later'))
  await page.waitForTimeout(300); await w.closeCal()
  if (mode === 'A') { // make Saber's line read: tap it, close the list with Later
    const bl = await w.openBell(); await w.press(bl.locator('.bl-line').first()); await page.waitForTimeout(500); await w.press(tid('odl-later')); await page.waitForTimeout(300)
  }
  w.say('BEFORE state', await w.state(ids)); w.say('BEFORE Saber', await lineFor(w)); w.say('BEFORE Warden', await lineFor(w, 'nact')); await w.me(sid)
  w.say('BEFORE undo', await w.undoInfo())
  await reload(w)
  w.say('AFTER who', await page.evaluate(() => (document.querySelector('#whoami, .whoami, #meBadge') || {}).innerText || document.body.innerText.match(/[A-Z]+ · ADMIN/)?.[0] || ''))
  w.say('AFTER state', await w.state(ids)); await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(500); w.say('AFTER undo (inputs page)', await w.undoInfo()); await w.hush(); await w.shot(`D11${mode}-topbar-after-reload`, { x: 700, y: 0, width: 740, height: 70 })
  w.say('AFTER Saber', await lineFor(w)); await w.hush(); await w.shot(`D11${mode}-saber-after-reload`, { x: 700, y: 0, width: 740, height: 300 })
  w.say('AFTER Warden', await lineFor(w, 'nact')); await w.hush(); await w.shot(`D11${mode}-warden-after-reload`, { x: 700, y: 0, width: 740, height: 300 })
  w.say('Fri cell on calendar', await (async () => { await w.toMonth(); return page.evaluate(() => document.querySelector('[data-icday="2026-07-17"]')?.className) })())
  w.say('errors', await bye(w))
}
await browser.close()
