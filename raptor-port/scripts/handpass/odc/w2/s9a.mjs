// W2 scenario 9, first part again: the box HIGH on the screen, so the panel can sit under it. VERSION 1
import { openWorld, tools, adminCategory } from './lib.mjs'
console.log('s9a VERSION 1')
const w = await openWorld('desktop'); const t = tools(w, 'desktop-s9a'); const { page } = w
await adminCategory(page, '^Users')
await page.locator('#accAddPostIn').scrollIntoViewIfNeeded()
await page.fill('#accAddName', 'zzz@x.test'); await page.waitForTimeout(300)
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
await page.waitForTimeout(300)
const br = async () => page.evaluate(() => { const b = document.querySelector('#accAddPostIn').getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom) } })
const b0 = await br(); console.log('box', JSON.stringify(b0))
await t.press('#accAddPostIn')
const c = await t.cardOnTop('Post in (box high)')
console.log(`S9a card top - box bottom = ${c.t - b0.b}; card left - box left = ${c.l - b0.l}; wholly=${c.wholly}`)
await t.shot('s9a-under-the-box')
console.log('errors', JSON.stringify(w.errors))
await w.browser.close()
