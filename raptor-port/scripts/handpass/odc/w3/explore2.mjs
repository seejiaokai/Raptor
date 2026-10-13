import { newWorld } from './lib.mjs'
console.log('w3 explore2 VERSION 1')
const which = process.argv[2] || 'desktop'
const w = await newWorld(which, { tag: 'explore2' })
const { page } = w
try {
  await w.login()
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.evaluate(() => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && /^Users/.test(b.textContent.trim())); if (b) b.click() })
  await page.waitForTimeout(500)
  const rows = await page.evaluate(() => [...document.querySelectorAll('#admUsers button, #admUsers [data-act], #admUsers summary')].filter(b => b.getBoundingClientRect().width > 0).slice(0, 80).map(b => (b.id || b.getAttribute('data-act') || b.getAttribute('data-testid') || '') + '|' + b.textContent.trim().slice(0, 30)).join('\n'))
  console.log(rows)
  const dr = await page.evaluate(() => { const e = [...document.querySelectorAll('#admUsers *')].find(e => e.children.length === 0 && /Drifter/i.test(e.textContent)); return e ? e.outerHTML.slice(0, 200) + ' || parent: ' + e.parentElement.outerHTML.slice(0, 700) : 'no Drifter' })
  console.log(dr)
} catch (e) { console.log('ERR', String(e).slice(0, 400)) }
await w.close()
