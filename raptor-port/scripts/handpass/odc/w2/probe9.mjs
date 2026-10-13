import { openWorld, tools } from './lib.mjs'
console.log('probe9 VERSION 2')
const w = await openWorld(process.argv[2] || 'desktop')
const t = tools(w, 'probe9')
const { page } = w
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(900)
console.log('at point:', await page.evaluate(() => { const e = document.elementFromPoint(940, 806); return e.tagName + '.' + e.className + ' ce=' + e.getAttribute('contenteditable') + ' txt=' + (e.innerText || e.value || '').slice(0, 30) + ' parent=' + e.parentElement.tagName + '.' + e.parentElement.className }))
await page.mouse.click(940, 806); await page.waitForTimeout(300)
console.log('active:', await page.evaluate(() => { const a = document.activeElement; return a.tagName + '.' + a.className + ' ce=' + a.getAttribute('contenteditable') + ' val=' + (a.value || a.innerText || '').slice(0, 40) }))
await page.keyboard.press('End'); await page.keyboard.type(' odc-w2'); await page.keyboard.press('Tab'); await page.waitForTimeout(500)
await t.shot('edited')
await w.browser.close()
