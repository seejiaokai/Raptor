// W1 explore — VERSION 1: who is in the world, what does the Leave War look like
import { openWorld, tools } from './w1-lib.mjs'
const which = process.argv[2] || 'desktop'
const w = await openWorld(which)
const t = tools(w, `w1-${which}-explore`)
const { page } = w
const ppl = await t.people()
console.log(JSON.stringify(ppl))
await t.go('leavewar')
await t.shot('lw')
const rows = await page.evaluate(() => [...document.querySelectorAll('tr[data-testid^="row-"]')].map(r => r.getAttribute('data-testid') + ' ' + (r.querySelector('span.cs')?.textContent || '')))
console.log('rows', rows.length, JSON.stringify(rows))
const months = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="month-"]')].map(r => r.getAttribute('data-testid')))
console.log('months', months.join(','))
// admin users
await page.evaluate(() => window.go('admin')); await page.waitForTimeout(400)
await page.evaluate(() => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && /^Users/.test(b.textContent.trim())); if (b) b.click() })
await page.waitForTimeout(400)
const list = await page.evaluate(() => [...document.querySelectorAll('#accList .acc-main')].map(e => e.innerText.replace(/\n/g, ' | ')))
console.log('users', JSON.stringify(list))
await t.shot('admin')
console.log('errors', JSON.stringify(w.errors))
await w.browser.close()
