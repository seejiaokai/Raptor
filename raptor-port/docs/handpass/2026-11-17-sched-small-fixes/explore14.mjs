import { launch, go, pic, say } from './wlib.mjs'
say('explore14 v1')
const { browser, page } = await launch('chromium', false, true)
for (const p of ['viewsched', 'editsched']) {
  await go(page, p)
  say(p, 'exportSched total', await page.locator('#exportSched').count(), 'visible', await page.locator('#exportSched:visible').count(), 'exportPdf visible', await page.locator('#exportPdf:visible').count())
}
const exp = page.locator('#exportSched:visible').first()
const dl = page.waitForEvent('download', { timeout: 8000 }).then(d => 'download ' + d.suggestedFilename()).catch(e => 'no download: ' + e.message.split('\n')[0])
await exp.click()
say(await dl)
say('toast', await page.evaluate(() => document.body.innerText.match(/CSV downloaded|Nothing|nothing[^\n]*/g)))
await browser.close()
