import * as H from './cal-H-lib.mjs'
H.setTag('p6')
const { browser, page, errors } = await H.world({})
const ZEN = await H.pidOf(page, 'Zenith')
await H.go(page, 'admin'); await H.sleep(500)
const usersTab = page.locator('[data-admcat="users"]:visible, .adm-cat:has-text("Users"):visible').first(); if (await usersTab.count()) { await usersTab.click(); await H.sleep(400) }
const row = page.locator(`#accList [data-person="${ZEN}"] .acc-tap`).first()
await row.scrollIntoViewIfNeeded(); await row.click(); await H.sleep(500)
await page.locator('#accEdArchive').click(); await H.sleep(700)
console.log('after archive click', await page.evaluate(() => [...document.querySelectorAll('[role=dialog], .sheet, .airpop, .po-sheet, .postout')].filter(e => e.offsetParent).map(e => (e.getAttribute('data-testid') || e.id || e.className) + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 500))))
console.log('btns', await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => (b.id || b.dataset.testid || '') + '|' + b.innerText.trim().slice(0, 25)).filter(x => /post|chip|sans|delete|overseas|transfer|archive/i.test(x)).slice(0, 30)))
await H.pic(page, 'archive-sheet')
// Quals: SANS
await page.keyboard.press('Escape')
await H.go(page, 'quals'); await H.sleep(600)
console.log('quals SANS?', await page.evaluate(id => { const r = document.querySelector(`#qtbl td.qname[data-person="${id}"]`); return r ? r.closest('tr').innerText.replace(/\s+/g, ' ').slice(0, 200) : 'no row' }, ZEN))
console.log(errors)
await browser.close()
