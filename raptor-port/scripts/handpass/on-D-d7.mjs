import { launch, world, bye, rec, FRI } from './on-D-lib.mjs'
const browser = await launch()
const w = await world(browser, { tag: 'D7' }); const { page, tid } = w
await w.giveWarden()
const ids = await w.fileFriday()
await w.makeHoliday('National Day', [FRI])
await w.press(tid('odl-later')); await page.waitForTimeout(400); await w.closeCal()
const sid = 'stiff'
const lineFor = async who => { if (who) await w.me(who); const L = await w.bellLines(); const lit = await w.bellLit(); await w.closeBell(); return { lit, L: L.map(l => (l.unread ? '[unread] ' : '') + l.text) } }
w.say('before: Saber', await lineFor()); w.say('before: Warden', await lineFor('nact')); await w.me(sid)
// remove
await w.openHolidays()
await w.press(page.locator('[data-testid="hol-list"] > *').filter({ hasText: 'Fri 17 Jul' }).first()); await page.waitForTimeout(400)
await w.press(tid('hol-delete')); await page.waitForTimeout(600)
w.say('toast', await w.toast())
const conf = await page.locator('button:visible').filter({ hasText: /^(Delete|Remove|Yes|Confirm)/ }).evaluateAll(es => es.map(e => e.innerText))
w.say('visible confirm-like buttons', conf)
w.say('Holidays list', (await tid('hol-list').innerText()).replace(/\s+/g, ' '))
w.say('OIL list open?', await tid('win-oilday').count())
await w.closeCal(); await w.closeSettings()
w.say('after remove: Saber', await lineFor()); w.say('after remove: Warden', await lineFor('nact')); await w.me(sid)
w.say('undo', await w.undoInfo())
await w.hush(); await w.shot('D7-removed-warden-bell', { x: 700, y: 0, width: 740, height: 300 })
// add again
await w.makeHoliday('National Day', [FRI])
w.say('list after re-add', await tid('win-oilday').count())
if (await tid('win-oilday').count()) { w.say('count', await tid('odl-count').innerText()); await w.press(tid('odl-later')); await page.waitForTimeout(300) }
await w.closeCal()
const s2 = await lineFor(); w.say('re-added: Saber', s2); await w.hush(); await w.shot('D7-readded-saber-bell', { x: 700, y: 0, width: 740, height: 300 })
w.say('re-added: Warden', await lineFor('nact'))
await w.hush(); await w.shot('D7-readded-warden-bell', { x: 700, y: 0, width: 740, height: 300 })
w.say('errors', await bye(w))
await browser.close()
