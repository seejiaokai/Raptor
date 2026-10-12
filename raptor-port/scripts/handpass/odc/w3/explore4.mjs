import { newWorld } from './lib.mjs'
console.log('w3 explore4 VERSION 1')
const which = process.argv[2] || 'desktop'
const w = await newWorld(which, { tag: 'explore4' })
const { page } = w
const visBtns = () => page.evaluate(() => [...document.querySelectorAll('#admUsers button, #admUsers select, #admUsers input')].filter(b => b.getBoundingClientRect().width > 0 && !b.classList.contains('acc-tap')).slice(0, 40).map(b => (b.id || '') + '|' + (b.getAttribute('data-act') || '') + '|' + (b.textContent || b.value || '').trim().slice(0, 40)).join('\n'))
try {
  await w.login()
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.evaluate(() => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && /^Users/.test(b.textContent.trim())); if (b) b.click() })
  await page.waitForTimeout(500)
  const drifter = '#admUsers .acc-main:has(.acc-name:text-is("Drifter"))'
  await page.locator(drifter).first().scrollIntoViewIfNeeded(); await w.press(drifter)
  await page.locator('#accEdArchive').evaluate(e => e.scrollIntoView({ block: 'center' })); await w.press('#accEdArchive'); await page.waitForTimeout(500)
  await page.locator('#accArchToggle').evaluate(e => e.scrollIntoView({ block: 'center' })); await w.press('#accArchToggle'); await page.waitForTimeout(500)
  console.log(await visBtns())
  console.log(await page.evaluate(() => document.querySelector('#accArchived').outerHTML.slice(0, 1500)))
} catch (e) { console.log('ERR', String(e).slice(0, 400)) }
await w.close()
