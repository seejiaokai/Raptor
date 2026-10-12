import { newWorld } from './lib.mjs'
console.log('w3 explore3 VERSION 2')
const which = process.argv[2] || 'desktop'
const w = await newWorld(which, { tag: 'explore3' })
const { page } = w
const visBtns = () => page.evaluate(() => [...document.querySelectorAll('#admUsers button, #admUsers select, #admUsers input')].filter(b => b.getBoundingClientRect().width > 0 && !b.classList.contains('acc-tap')).slice(0, 40).map(b => (b.id || '') + '|' + (b.getAttribute('data-act') || '') + '|' + (b.textContent || b.value || '').trim().slice(0, 40)).join('\n'))
try {
  await w.login()
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.evaluate(() => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && /^Users/.test(b.textContent.trim())); if (b) b.click() })
  await page.waitForTimeout(500)
  const drifter = '#admUsers .acc-main:has(.acc-name:text-is("Drifter"))'
  await page.locator(drifter).first().scrollIntoViewIfNeeded()
  await w.press(drifter)
  console.log(await visBtns())
  await page.locator('#admUsers button', { hasText: /^Archive$/ }).first().evaluate(e => e.scrollIntoView({ block: 'center' }))
  await w.press('#admUsers button:text-is("Archive")')
  await page.waitForTimeout(600)
  await w.shot('explore3-after-archive')
  console.log('--- after archive:'); console.log(await visBtns())
  console.log('text near Archived:', await page.evaluate(() => [...document.querySelectorAll('#admUsers *')].filter(e => /Archived/i.test(e.textContent) && e.children.length < 3).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className + ':' + e.textContent.trim().slice(0, 60)).join('\n')))
} catch (e) { console.log('ERR', String(e).slice(0, 400)) }
await w.close()
