// W2 G2: what Export as PDF (print) produces on U: print-media pdf text; and Admin -> Users -> Bolt delete path probe.
import * as L from './sm-lib.mjs'
import { readFileSync, writeFileSync } from 'node:fs'
console.log('sm-w2-g2 v1')
const OUT = L.outDir('w2')
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad'
const s3 = JSON.parse(readFileSync(SCR + '/w2-state3.json', 'utf8'))
const log = (k, v) => console.log(k, JSON.stringify(v))
const U = await L.launch('pc', { origin: 'http://localhost:4393', state: s3, init: L.damageInit('raptor:weeks/13-07-2026#2') })
const { page } = U
await L.signIn(U); await L.goEdit(U)
await page.addInitScript(() => {})
await page.evaluate(() => { window.__pc = 0; const o = window.print.bind(window); window.print = () => { window.__pc++ } })
await page.locator('#exportPdf').click(); await L.sleep(2500)
log('print', await page.evaluate(() => ({ calls: window.__pc, frames: [...document.querySelectorAll('iframe')].map(f => { try { return (f.contentDocument.body.innerText || '').replace(/\s+/g, ' ').slice(0, 400) } catch (e) { return 'x' } }), printEls: [...document.querySelectorAll('[id*=print i],[class*=print i]')].slice(0, 5).map(e => e.id + '|' + e.className + '|' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 300)) })))
const pdf = await page.pdf({ format: 'A4', landscape: true }).catch(e => null)
if (pdf) { writeFileSync(SCR + '/w2dl/U-page.pdf', pdf); log('pdf bytes', pdf.length) }
await page.emulateMedia({ media: 'print' }); await L.sleep(500)
await page.screenshot({ path: OUT + '/s5-U-pc-printmedia.png', fullPage: false })
await page.emulateMedia({ media: 'screen' })
// Admin -> Users -> Bolt
await page.locator('a:has-text("Admin"), button:has-text("Admin")').first().click(); await L.sleep(1500)
const bolt = page.locator('text=/^Bolt/').filter({ visible: true }).first()
log('bolt row', await bolt.count())
await bolt.click(); await L.sleep(900)
log('bolt panel', await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim().slice(0, 24)).filter(t => /delete|archive|remove|post|restore|cancel|save/i.test(t))))
await L.pic(U, OUT, 's3-pc-bolt-panel', { clip: { x: 0, y: 0, width: 1536, height: 864 } })
log('errs', U.errs); await L.closeAll(U)
