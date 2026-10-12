// RW2-5 (RECORDED): RW2-1's Meeting with History on - where do gold dots sit on its Ground Programme row (and its Personal Inputs line)?
import * as L from './or-RW2-lib.mjs'
import { writeFileSync } from 'node:fs'
const { browser, page: p, errs } = await L.openWorld()
const DI = 2, ISO = '2026-07-15'
const j = o => JSON.stringify(o)
const out = {}
const mt = (await L.fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: ISO, to: ISO, timed: ['09:00', '10:00'], title: 'Range brief' }))[0]
const iid = mt.iid
const day = () => p.locator('#eWeek .day:not(.peek)').nth(DI)
await L.goEdit(p)
let ri = await L.rowIdx(p, DI, iid)
await day().locator(`[data-fill="g:${DI}.${ri}.+"]`).first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 120)); await p.waitForTimeout(300)
await L.drag(p, p.locator(`#eRoster .rpuck[data-person="${await L.csId(p, 'Tally')}"]:visible`).first(), day().locator(`[data-fill="g:${DI}.${ri}.+"] .addz`).first())
const hid = await L.csId(p, 'Hunter')
await day().locator(`[data-fill="g:${DI}.${ri}.+"] [data-person="${hid}"]`).first().click({ button: 'right' }); await p.waitForTimeout(500)
const e = day().locator(`[data-txt="gr:${DI}.${ri}.end"]`); await e.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('11:00'); await e.evaluate(x => x.blur()); await p.waitForTimeout(500)
console.log('people now:', j(await p.evaluate(id => window.INPUTS.find(x => x.iid === id).people.map(e => window.PEOPLE[e.p]?.cs), iid)), 'times:', j(await p.evaluate(id => { const r = window.INPUTS.find(x => x.iid === id); return r.s + '-' + r.e }, iid)))
await p.evaluate(() => window.scrollTo(0, 0))
await p.locator('#histBtn').click(); await p.waitForTimeout(1500)
// (the changes window stays open: closing it switches History off)
console.log('history button pressed:', await p.locator('#histBtn').getAttribute('aria-pressed'))
const dots = () => p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return [...d.querySelectorAll('[data-histdot]')].filter(e => e.getClientRects().length).map(e => ({ tag: e.tagName, sec: (e.closest('[class*="sec-"]')?.className || '').toString().replace(/sub plist one sec /, '').slice(0, 30), row: (e.closest('.pl-row')?.innerText || '').replace(/\s+/g, ' ').slice(0, 60), on: (e.closest('.puck')?.innerText || e.parentElement?.className || '').toString().replace(/\s+/g, ' ').slice(0, 30), attrs: [...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(' ').slice(0, 90) })) }, DI)
out.groundDots = await dots(); console.log('dots on Wed, Personal Inputs as it stands:', j(out.groundDots))
const grndDots = await p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return [...d.querySelectorAll('.sec-grnd [data-histdot]')].length + ' in Ground Programme section; marks of other kinds: ' + [...d.querySelectorAll('.sec-grnd [class*="hist"], .sec-grnd [class*="dot"]')].map(e => e.className.toString().slice(0, 30)).join(',') }, DI)
console.log('Ground Programme section:', grndDots)
await day().locator('.sec-grnd').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(300)
await L.shot(p, 'rw2-5-1-ground-row-history-on')
// whole ground row as read
console.log('ground row text:', (await day().locator('.sec-grnd .pl-row', { hasText: 'RANGE BRIEF' }).first().innerText()).replace(/\s+/g, ' '))
const rb = await day().locator('.sec-grnd .pl-row', { hasText: 'RANGE BRIEF' }).first().boundingBox()
await L.shot(p, 'rw2-5-2-ground-row-zoom', { x: Math.max(0, rb.x - 20), y: Math.max(0, rb.y - 20), width: Math.min(rb.width + 40, 1440 - Math.max(0, rb.x - 20)), height: rb.height + 40 })
// Personal Inputs section: unfold and read
{ const sh = day().locator('.sec-inp').first().getByText(/show/i).first(); if (await sh.count()) { await sh.click(); await p.waitForTimeout(600); console.log('pressed show on Personal Inputs') } }
out.afterUnfold = await dots(); console.log('dots on Wed after unfolding Personal Inputs:', j(out.afterUnfold))
await day().locator('.sec-inp').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(300)
await L.shot(p, 'rw2-5-3-personal-inputs-history-on')
// hover over a puck of the ground row: any bubble?
const pk = day().locator('.sec-grnd .pl-row', { hasText: 'RANGE BRIEF' }).first().locator('.puck').first()
await pk.scrollIntoViewIfNeeded(); await pk.hover(); await p.waitForTimeout(500)
console.log('after hover over a puck on the row, bubbles:', j(await p.evaluate(() => [...document.querySelectorAll('.histbub')].map(b => b.innerText.replace(/\s+/g, ' ').trim()))))
// board: same question
await L.openBoard(p, DI)
await p.locator('#sbHist:visible, #schedBoard #histBtn:visible, [data-testid="sb-history"]:visible').first().click().catch(() => {}); await p.waitForTimeout(700)
out.boardDots = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-histdot]')].filter(e => e.offsetParent).map(e => ({ row: (e.closest('.sb-arow, .pl-row')?.innerText || '').replace(/\s+/g, ' ').slice(0, 60), cls: e.className.toString().slice(0, 30), attrs: [...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(' ').slice(0, 80) })))
console.log('board dots:', j(out.boardDots))
await L.shot(p, 'rw2-5-4-board')
console.log('ERRORS', errs.join(' | ') || 'none')
writeFileSync(L.PARTS + '/or-RW2-5-raw.json', j(out))
await browser.close()
