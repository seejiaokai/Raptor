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
console.log('start rows', await vals())
const box = rows().first()
await box.click(); await page.keyboard.press('End'); await page.keyboard.type(' ABC', { delay: 40 })
await page.locator('#airTitle').click()    // blur by clicking the window's own title
await page.waitForTimeout(500)
console.log('after blur: window open', await winOpen(), 'rows', await vals())
await shot(page, `C1-${tag}-traffic-after-blur`)
await page.click('#airDone'); await page.waitForTimeout(400)
console.log('after Done: window open', await winOpen())
await open()
console.log('reopened rows', await vals())
await shot(page, `C2-${tag}-traffic-reopened`)
const n0 = await rows().count()
await page.click('#airAdd'); await page.waitForTimeout(400)
console.log('after Add row', await vals())
await shot(page, `C3-${tag}-traffic-add-row`)
await page.locator('#airBody [data-airdel]').last().click(); await page.waitForTimeout(400)
console.log('after ✕ of last row', await vals())
await shot(page, `C4-${tag}-traffic-row-deleted`)
// Undo from the top bar with the window open
const undo = page.locator('#undoBtn:visible, [data-undo]:visible, button[aria-label*="Undo" i]:visible, button[title*="Undo" i]:visible').first()
console.log('undo candidates', await page.locator('#undoBtn:visible, [data-undo]:visible, button[aria-label*="Undo" i]:visible, button[title*="Undo" i]:visible').count())
let how = 'click'
try { await undo.click({ timeout: 3000 }) } catch (e) { how = 'click failed: ' + e.message.split('\n')[0]; }
await page.waitForTimeout(600)
console.log('undo via', how, '| window open:', await winOpen(), '| rows', await winOpen() ? await vals() : 'n/a')
await shot(page, `C5-${tag}-traffic-after-undo`)
if (!(await winOpen())) { await open(); console.log('reopened after undo: rows', await vals()); await shot(page, `C6-${tag}-traffic-reopened-after-undo`) }
// Undo again (the Add row), and redo
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
