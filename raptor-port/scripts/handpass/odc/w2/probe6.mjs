import { openWorld, tools, adminCategory } from './lib.mjs'
console.log('probe6 VERSION 1')
const w = await openWorld(process.argv[2] || 'desktop')
const t = tools(w, 'probe6')
const { page } = w
await adminCategory(page, '^Data')
console.log(await page.locator('#admData').innerText())
console.log(await page.evaluate(() => [...document.querySelectorAll('#admData button, #admData select, #admData input')].map(e => e.tagName + '#' + e.id + ' ' + (e.getAttribute('data-testid') || '') + ' [' + (e.textContent || e.value || '').trim().slice(0, 40).replace(/\s+/g, ' ') + '] vis=' + (e.getBoundingClientRect().width > 0)).join('\n')))
console.log('errors', w.errors)
await w.browser.close()
