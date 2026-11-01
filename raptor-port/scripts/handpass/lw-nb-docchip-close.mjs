// The doc-chip walk's close-up (§7.10): the editable chip, whose name is now a button, at twice the pixels — at rest, hovered
// and with the keyboard on it — beside the window's other controls, so a name drawn in the browser's bare button grey shows.
process.env.LW_PORT ||= '4195'
process.env.LW_OUT ||= '2026-11-01-lw-next-batch/docchip-close'
const fs = await import('node:fs')
const H = await import('./lw-m3b-w2-lib.mjs')
const { L, T } = H
fs.mkdirSync(H.OUT, { recursive: true })
const b = await L.getBrowser('chromium')
const ctx = await b.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
const w = { ctx, page, cdp: null, errs: [], phone: false, size: 'desk', engine: 'chromium' }
await L.signInPlain(w, 'admin', '2026-02-15')
await L.openCellR(w, 'bane', '2026-02-23'); await page.waitForSelector(T('bid-picker'))
await L.setDoc(w, T('bid-doc-row'), 'leave-approval-scan.pdf')
const box = await page.locator(T('bid-rmk-row')).boundingBox()
const clip = { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 }
await page.screenshot({ path: `${H.OUT}/chip-rest.png`, clip })
await page.locator(`${T('bid-doc-row')} .docchip .docname`).hover(); await page.waitForTimeout(200)
await page.screenshot({ path: `${H.OUT}/chip-hover.png`, clip })
await page.mouse.move(5, 5)
await page.locator(`${T('bid-doc-row')} .docchip .docname`).focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await page.waitForTimeout(200)
await page.screenshot({ path: `${H.OUT}/chip-keyboard.png`, clip })
await page.keyboard.press('Enter'); await page.waitForTimeout(500)
const opened = await page.evaluate(() => !document.getElementById('docViewPop')?.hidden)
console.log('Enter on the focused name opens the viewer:', opened)
await ctx.close(); await H.closeBrowser()
