import * as E from './stk-E-lib.mjs'
const { browser, page } = await E.world({ size: E.DESK })
await E.nav(page, 'quals')
console.log('quals date box:', JSON.stringify(await page.evaluate(() => { const e = document.querySelector('#qDate'); const c = getComputedStyle(e); return { tag: e.tagName, type: e.type, disabled: e.disabled, readOnly: e.readOnly, bg: c.backgroundColor, color: c.color, border: c.border, font: c.fontFamily.slice(0, 20), w: Math.round(e.getBoundingClientRect().width) } })))
const sib = await page.evaluate(() => { const e = document.querySelector('#qFilter'); const c = getComputedStyle(e); return { bg: c.backgroundColor, color: c.color } }); console.log('filter box for comparison:', JSON.stringify(sib))
await E.nav(page, 'admin'); await page.locator('.adm-cat').nth(1).click(); await E.sleep(500)
console.log('section order row:', await page.evaluate(() => { const row = [...document.querySelectorAll('#page-admin *')].find(e => e.children.length === 0 && /^Overall notes/.test(e.textContent)); const p = row.parentElement; return p.outerHTML.replace(/\s+/g, ' ').slice(0, 500) }))
await browser.close()
