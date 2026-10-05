import * as H from './stk-D-lib.mjs'
const { open, nav, sleep, pic, caret, scopeSel, boxList, clickBox } = H
const { browser, page, errors } = await open({ width: 1440, height: 900, who: 'a', fresh: false, state: process.env.STK_STATE })
const where = () => page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return 'BODY'; const d = e.closest('[role=dialog],dialog,.modal,.dlg,.sheet,.overlay,[aria-modal],.menupanel,.card'); return e.tagName + '#' + (e.id || '') + '.' + String(e.className).slice(0, 20) + ' in ' + (d ? (d.tagName + '#' + d.id + '.' + String(d.className).slice(0, 24)) : 'NO-DIALOG') + ' page=' + window.CURPAGE })
await nav(page, 'tracker'); await sleep(1200)
await page.locator('#addStu').click(); await sleep(600)
await pic(page, 'explore6-addstu')
console.log('overlays:', await page.evaluate(() => [...document.querySelectorAll('[role=dialog],dialog,.modal,.dlg,.overlay,[aria-modal]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 30) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height))))
console.log('focus now:', await where())
for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); await sleep(60); console.log('Tab', i + 1, await where()) }
await page.keyboard.press('Escape'); await sleep(400)
console.log('after Esc overlays:', await page.evaluate(() => [...document.querySelectorAll('[role=dialog],dialog,.modal,.dlg,.overlay,[aria-modal]')].filter(e => e.getBoundingClientRect().width > 0).length), await where())
// leave war
await nav(page, 'leavewar'); await sleep(1500)
const ids = await page.evaluate(() => Object.entries(window.PEOPLE).filter(([k, v]) => v.cs === 'Saber').map(([k]) => k))
console.log('saber ids', ids)
const cell = page.locator(`[data-testid^="cell-${ids[0]}-2026-08-1"]`).first()
console.log('cell count', await page.locator(`[data-testid^="cell-${ids[0]}-"]`).count())
await cell.scrollIntoViewIfNeeded().catch(() => {}); await cell.click({ force: true }); await sleep(700)
await pic(page, 'explore6-lw-sheet')
console.log('LW overlays:', await page.evaluate(() => [...document.querySelectorAll('[role=dialog],dialog,.modal,.dlg,.overlay,[aria-modal],.sheet,[class*=sheet]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 30) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height))))
console.log('focus now:', await where())
for (let i = 0; i < 10; i++) { await page.keyboard.press('Tab'); await sleep(60); console.log('Tab', i + 1, await where()) }
console.log('errors', errors)
await browser.close()
