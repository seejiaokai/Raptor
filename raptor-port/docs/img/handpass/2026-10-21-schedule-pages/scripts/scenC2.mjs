import { launch, login, go, shot } from './common.mjs'
const size = process.argv[2] || 'desktop'
const tag = size === 'phone' ? 'ph' : 'dk'
const { browser, page, errors } = await launch(size)
await login(page); await go(page, 'editsched')
const rows = () => page.locator('#airBody [data-airi]')
const vals = () => rows().evaluateAll(a => a.map(i => i.value))
const open = async () => { await page.locator('.airbtn[data-air]:visible').first().click(); await page.waitForTimeout(400) }
const winOpen = () => page.evaluate(() => { const p = document.querySelector('#airpop'); return !!p && !p.hidden })
await open()
console.log('start', await vals())
await page.click('#airAdd'); await page.waitForTimeout(400)
await page.locator('#airBody [data-airdel]').first().click(); await page.waitForTimeout(400)
console.log('after Add + ✕ first row', await vals())
// route 1: key Ctrl+Z with the window open, focus on title
await page.locator('#airTitle').click(); await page.keyboard.press('Control+z'); await page.waitForTimeout(600)
console.log('Ctrl+Z with window open -> open', await winOpen(), 'rows', await winOpen() ? await vals() : 'n/a')
await shot(page, `C5-${tag}-traffic-ctrlz`)
// route 2: bridge undo with window open
await page.evaluate(() => window.undo()); await page.waitForTimeout(600)
console.log('window.undo() with window open -> open', await winOpen(), 'rows', await winOpen() ? await vals() : 'n/a')
await shot(page, `C5b-${tag}-traffic-bridge-undo`)
await page.evaluate(() => window.undo()); await page.waitForTimeout(600)
console.log('window.undo() again -> rows', await winOpen() ? await vals() : 'n/a')
await page.evaluate(() => window.redo()); await page.waitForTimeout(600)
console.log('window.redo() -> rows', await winOpen() ? await vals() : 'n/a')
// route 3: person's way — Done, press Undo in the top bar, reopen
await page.click('#airDone'); await page.waitForTimeout(300)
await page.locator('button[aria-label*="Undo" i]:visible, button[title*="Undo" i]:visible').first().click(); await page.waitForTimeout(500)
await open(); console.log('Done, top-bar Undo, reopen -> rows', await vals())
await shot(page, `C6-${tag}-traffic-topbar-undo-reopened`)
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
