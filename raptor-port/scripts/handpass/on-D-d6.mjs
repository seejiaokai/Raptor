import { launch, world, bye, rec, FRI } from './on-D-lib.mjs'
const browser = await launch()
const w = await world(browser, { tag: 'D6' }); const { page, tid } = w
await w.giveWarden()
const ids = await w.fileFriday()
await w.makeHoliday('National Day', [FRI])
await w.press(tid('odl-later')); await page.waitForTimeout(400); await w.closeCal()
const hasND = () => page.evaluate(() => !!document.querySelector('[data-icday="2026-07-17"] .ic-nd, [data-icday="2026-07-17"].hol, [data-icday="2026-07-17"] [class*="hol"], [data-icday="2026-07-17"] [class*="nd"]'))
const ndText = async () => { await w.toMonth(); return page.evaluate(() => { const e = document.querySelector('[data-icday="2026-07-17"]'); return e ? { cls: e.className, txt: e.innerText.replace(/\s+/g, ' ').slice(0, 40), badge: !!e.querySelector('[class*="nd"],[class*="hol"],[class*="ph"]'), bg: getComputedStyle(e).backgroundColor } : 'no cell' }) }
const lineFor = async who => { if (who) await w.me(who); const L = await w.bellLines(); const lit = await w.bellLit(); await w.closeBell(); return { lit, L } }
const sid = 'stiff'
w.say('Warden at start', await lineFor('nact')); await w.me(sid)
// answer ONE in its own input window
await w.toMonth(); await w.openDay(FRI)
await w.press(page.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${ids[0]}"]`).first())
await page.waitForSelector('#inpEditPop #inpEditStart'); await page.waitForTimeout(300)
await w.press(page.locator('#inpEditSave')); await page.waitForTimeout(500)
await w.press(tid('oil-yes')); await w.press(tid('oilconf-save')); await page.waitForTimeout(600)
await page.locator('#inpEditPop').waitFor({ state: 'hidden', timeout: 4000 }).catch(() => w.say('pop still open', ''))
await w.closeDay()
w.say('state after own-window answer', await w.state(ids)); w.say('undo', await w.undoInfo())
w.say('Saber', await lineFor()); w.say('Warden', await lineFor('nact')); await w.me(sid)
w.say('undo after switching person', await w.undoInfo())
await w.toMonth(); w.say('Fri cell (holiday on)', await ndText()); await w.shot('D6-holiday-on', { x: 560, y: 440, width: 880, height: 200 })
// Undo until the holiday is undone
const labels = []
for (let i = 0; i < 4; i++) {
  const u = await w.undoInfo(); labels.push(u.undo)
  if (/holiday/i.test(u.undo)) { await w.undo(); labels.push('-> pressed holiday undo'); break }
  await w.undo()
}
w.say('undo presses', labels)
w.say('state after undo of holiday', await w.state(ids)); w.say('Fri cell (undone)', await ndText())
await w.hush(); await w.shot('D6-holiday-undone', { x: 560, y: 440, width: 880, height: 200 })
w.say('Saber', await lineFor()); w.say('Warden', await lineFor('nact')); await w.me(sid)
w.say('undo/redo after switching', await w.undoInfo())
// open Holidays list to see it is gone
await w.openHolidays(); w.say('Holidays list', (await tid('hol-list').innerText()).replace(/\s+/g, ' ')); await w.closeCal(); await w.closeSettings()
// Redo the holiday (once)
const rl = []
const r1 = await w.undoInfo(); rl.push(r1.redo)
await w.redo()
w.say('after Redo #1', { redo: rl, state: await w.state(ids), cell: await ndText(), info: await w.undoInfo() }); await w.shot('D6-holiday-redone', { x: 560, y: 440, width: 880, height: 200 })
w.say('list open?', await tid('win-oilday').count())
w.say('Saber', await lineFor()); w.say('Warden', await lineFor('nact'))
await w.hush(); await w.shot('D6-warden-after-redo1', { x: 700, y: 0, width: 740, height: 300 })
await w.me(sid)
w.say('undo/redo after switching', await w.undoInfo())
await w.redo()
w.say('after Redo #2', { state: await w.state(ids), cell: await ndText(), info: await w.undoInfo() })
w.say('Saber', await lineFor()); w.say('Warden', await lineFor('nact'))
w.say('errors', await bye(w))
await browser.close()
