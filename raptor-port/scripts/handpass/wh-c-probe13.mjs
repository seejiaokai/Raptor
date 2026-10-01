/* walker C — probe 13: can a weekend that NO Leave War period covers be reached (for the "no period" OIL reminder)?
   The calendar button → back to December 2025 → Saturday 27 Dec; what the day offers. Throw-away world. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const { browser, p, errors } = await H.world({ who: 'a' })
await L.go(p, 'editsched')
await p.locator('[aria-label="Jump to a date"]:visible').first().click(); await L.sleep(500)
const calInfo = () => p.evaluate(() => { const t = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && (e.textContent || '').trim() === 'Jump to a date' && e.offsetParent !== null); if (!t) return null; let box = t.parentElement; while (box && !/\b20\d\d\b/.test(box.innerText || '')) box = box.parentElement; return { text: box.innerText.replace(/\s+/g, ' ').slice(0, 200), btns: [...box.querySelectorAll('button')].map(b => (b.getAttribute('aria-label') || b.innerText.trim()).slice(0, 18)).slice(0, 12) } })
console.log('CAL', JSON.stringify(await calInfo()))
for (let i = 0; i < 7; i++) { const b = p.locator('button[aria-label="Previous month"]:visible').first(); if (!(await b.count())) { console.log('no Previous month button'); break } await b.click(); await L.sleep(120) }
console.log('CAL after', JSON.stringify(await calInfo()))
await H.pic(p, 'probe13-cal-dec25')
const hit = await p.evaluate(() => { const t = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && (e.textContent || '').trim() === 'Jump to a date' && e.offsetParent !== null); let box = t.parentElement; while (box && !/\b20\d\d\b/.test(box.innerText || '')) box = box.parentElement; const b = [...box.querySelectorAll('button')].filter(x => (x.innerText || '').trim() === '27'); if (!b.length) return 'no 27'; b[b.length - 1].setAttribute('data-whc-day', '27'); return 'ok ' + b.length })
console.log('pick', hit)
await p.locator('[data-whc-day="27"]').first().click(); await L.sleep(1500)
console.log('WEEK', await p.evaluate(() => window.CURWEEK), JSON.stringify(await p.evaluate(() => window.DATES)))
console.log('WARNS', JSON.stringify(await p.evaluate(() => window.WARN.byDay.map((g, i) => i + ':' + ((g || {}).warns || []).map(w => w.code).join(',')))))
await W.boardOn(p, 5); await L.sleep(500)
console.log('DUTY PANEL', await p.evaluate(() => (document.querySelector('#schedBoard .sb-panel.duty') || {}).innerText.replace(/\s+/g, ' ').slice(0, 300)))
await p.locator('#schedBoard [data-dwadd="5"]').first().click(); await L.sleep(600)
await H.pic(p, 'probe13-block-picker')
console.log('AFTER + Block', JSON.stringify(await p.evaluate(() => ({ menus: [...document.querySelectorAll('.menu, .pop, .picker, [role=menu], .sheet, .modal')].filter(e => e.offsetParent !== null).map(e => e.className + ': ' + e.innerText.replace(/\s+/g, ' ').slice(0, 300)), duty: (document.querySelector('#schedBoard .sb-panel.duty') || {}).innerText.replace(/\s+/g, ' ').slice(0, 300) }))))
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
