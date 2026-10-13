import { openWorld, tools, adminCategory } from './lib.mjs'
console.log('probe7 VERSION 1')
const w = await openWorld(process.argv[2] || 'desktop')
const t = tools(w, 'probe7')
const { page } = w
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(800)
console.log('page title bits:', await page.evaluate(() => document.querySelector('#vWeek') ? 'vWeek present' : 'none'))
console.log(await page.evaluate(() => {
  const days = [...document.querySelectorAll('#vWeek .day')].map(d => (d.querySelector('.dh, .dayhd, h2, h3') || d).innerText.slice(0, 30).replace(/\s+/g, ' '))
  const ed = [...document.querySelectorAll('#vWeek [contenteditable], #vWeek input[type=text], #vWeek textarea')].slice(0, 30).map(e => e.tagName + '.' + (e.className || '') + ' data-k=' + (e.getAttribute('data-k') || e.getAttribute('data-key') || '') + ' ph=' + (e.getAttribute('placeholder') || '') + ' txt=' + (e.innerText || e.value || '').slice(0, 20))
  return JSON.stringify({ days, ed }, null, 1)
}))
await t.shot('week')
await w.browser.close()
