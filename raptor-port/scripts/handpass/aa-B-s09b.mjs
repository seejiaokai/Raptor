import { world, fileInput, pic, sleep, openBoard, oilOn, openCount, tabTo, winState, closeWin, savePart } from './aa-B-lib.mjs'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const w = await world('desk'); w.tag = 's9b'
const { page } = w
const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'S9b', s: '09:00', e: '12:00', oil: 'yes' })
const iid = f.rec.iid
await openBoard(page, 5); await oilOn(page, true)
const bl = page.locator('#schedBoard .mbtn.daybtn').first(); await bl.click(); await sleep(700)
say('blanket now:', await bl.evaluate(e => e.className + ' | ' + e.title))
await openCount(page, iid); await tabTo(page, 'earn')
const seat = await page.evaluate(() => { const s = [...document.querySelectorAll('.availwin .seat.oilpk')]; return { n: s.length, first: s[0] && s[0].outerHTML.slice(0, 300), text: document.querySelector('.availwin').innerText.replace(/\s+/g, ' ').slice(-200) } })
say('seats under the blanket', JSON.stringify(seat))
const first = page.locator('.availwin .seat.oilpk').first(); const t0 = await page.locator('.availwin .win-tab').nth(1).innerText()
await first.scrollIntoViewIfNeeded(); await first.click().catch(e => say('tap error', e.message.split('\n')[0])); await sleep(500)
const t1 = await page.locator('.availwin .win-tab').nth(1).innerText()
say('earn tab before/after tapping a man under the blanket:', t0.replace(/\s+/g, ' '), '->', t1.replace(/\s+/g, ' ')); await pic(w, 'tap-under-blanket')
await closeWin(page)
await bl.click(); await sleep(700)
await openCount(page, iid); await tabTo(page, 'earn')
const st = await winState(page); say('blanket lifted: ', st.tabs[1], '| decisions: on', st.on, 'of', st.total); await pic(w, 'lifted')
savePart('s09b-run', { log, errors: w.errors })
await w.browser.close()
