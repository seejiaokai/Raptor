import * as L from './or-C-lib.mjs'
const { browser, page: p, errs } = await L.openWorld()
const mt = (await L.fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: '2026-07-15', to: '2026-07-15', timed: ['09:00', '10:00'], title: 'Range brief' }))[0]
await L.openBoard(p, 2)
const has = await p.evaluate(() => document.querySelectorAll('#schedBoard .pinp .sb-arow').length)
if (!has) { const f = p.locator('#schedBoard [data-pitog="2"]:visible').first(); await f.scrollIntoViewIfNeeded(); await f.click(); await p.waitForTimeout(300) }
const ri = await L.rowIdx(p, 2, mt.iid)
console.log('BOARD ROW', await p.evaluate(([di, ri]) => { const rows = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')]; const r = rows.find(x => x.querySelector(`[data-fill="g:${di}.${ri}.+"]`)); return r.outerHTML.replace(/<span class="puck[\s\S]*?<\/span><\/span><\/span>/g, '[puck]').slice(0, 1800) }, [2, ri]))
console.log('BOARD LINE', await p.evaluate(() => { const r = document.querySelector('#schedBoard .pinp .sb-arow.inprow'); return r.outerHTML.replace(/<span class="puck[\s\S]*?<\/span><\/span>/g, '[puck]').slice(0, 1800) }))
await L.closeBoard(p)
await L.goEdit(p)
const day = p.locator('#eWeek .day:not(.peek)').nth(2)
const fold = day.locator('.sec-inp .pl-fold').first(); if (!(await day.locator('.sec-inp .pl-row').count()) && await fold.count()) { await fold.scrollIntoViewIfNeeded(); await fold.click(); await p.waitForTimeout(300) }
console.log('WEEK LINE', await p.evaluate(() => document.querySelectorAll('#eWeek .day:not(.peek)')[2].querySelector('.sec-inp .pl-row').outerHTML.replace(/<span class="puck[\s\S]*?<\/span><\/span>/g, '[puck]').slice(0, 1500)))
await browser.close()
