import { L, snap, sideWarn } from './h.mjs'
import fs from 'node:fs'
console.log('c3 v1')
const { browser, ctx, page, errors } = await L.open({ width: 1400, height: 900, state: 'C:/Users/User/AppData/Local/Temp/claude/job3/walk/state-pub.json' })
await L.go(page, 'editsched')
// capture the print document
await page.evaluate(() => { window.__srcdocs = []; const o = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'srcdoc'); Object.defineProperty(HTMLIFrameElement.prototype, 'srcdoc', { set(v) { window.__srcdocs.push(v); o.set.call(this, v) }, get() { return o.get.call(this) } }) })
await page.locator('#exportPdf').click()
await page.waitForTimeout(2500)
const docs = await page.evaluate(() => window.__srcdocs)
console.log('print docs', docs.length, docs[0] ? docs[0].length : 0)
fs.writeFileSync('C:/Users/User/AppData/Local/Temp/claude/job3/walk/print.html', docs[0] || '')
// CSV
const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(e => null), page.locator('#exportSched').click()])
if (dl) { await dl.saveAs('C:/Users/User/AppData/Local/Temp/claude/job3/walk/export.csv'); console.log('download', dl.suggestedFilename()) } else console.log('no download')
console.log(errors)
await browser.close()
