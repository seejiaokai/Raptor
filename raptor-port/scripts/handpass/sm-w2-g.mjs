// W2 part G: S5 export/print on U (pc, chromium) and healthy; S3 Admin -> Users delete on U.
import * as L from './sm-lib.mjs'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
const size = process.env.SZ || 'pc'
console.log('sm-w2-g v1', size)
const OUT = L.outDir('w2')
const ORIGIN = 'http://localhost:4393'
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad'
const s3 = JSON.parse(readFileSync(SCR + '/w2-state3.json', 'utf8'))
const log = (k, v) => console.log(k, JSON.stringify(v))
const S = async (k, fn) => { try { log(k, await fn()) } catch (e) { log(k, { ERR: e.message.split('\n')[0] }) } }
const full = W => { const v = W.page.viewportSize(); return { x: 0, y: 0, width: v.width, height: v.height } }
mkdirSync(SCR + '/w2dl', { recursive: true })

async function exportsOf(W, tag) {
  await L.goEdit(W)
  await S(`s5.csv.${tag}`, async () => {
    const [dl] = await Promise.all([W.page.waitForEvent('download', { timeout: 8000 }).catch(() => null), L.press(W, '#exportSched')])
    await L.sleep(800)
    if (!dl) return { download: false, toast: await L.toastText(W.page) }
    const p = SCR + `/w2dl/${tag}-${size}.csv`; await dl.saveAs(p)
    const t = readFileSync(p, 'utf8'); return { download: true, name: dl.suggestedFilename(), bytes: t.length, lines: t.split(/\r?\n/).length, head: t.split(/\r?\n/).slice(0, 4), toast: await L.toastText(W.page) }
  })
  await S(`s5.pdf.${tag}`, async () => {
    const pop = W.ctx.waitForEvent('page', { timeout: 6000 }).catch(() => null)
    await W.page.evaluate(() => { window.__pr = 0; const o = window.print; window.print = function () { window.__pr++; } })
    await L.press(W, '#exportPdf'); await L.sleep(1500)
    const np = await pop
    const printed = await W.page.evaluate(() => window.__pr)
    let txt = null
    if (np) { await L.sleep(800); txt = await np.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 600)).catch(() => 'popup read failed'); await np.screenshot({ path: OUT + `/s5-${tag}-${size}-print-popup.png` }).catch(() => {}); await np.close().catch(() => {}) }
    return { popup: !!np, printCalls: printed, popupText: txt, toast: await L.toastText(W.page) }
  })
  await L.pic(W, OUT, `s5-${tag}-${size}-after-export`, { clip: full(W) })
}
const H = await L.launch(size, { origin: ORIGIN, state: s3 })
await L.signIn(H); await exportsOf(H, 'healthy'); log('errs.h', H.errs); await L.closeAll(H)
const U = await L.launch(size, { origin: ORIGIN, state: s3, init: L.damageInit('raptor:weeks/13-07-2026#2') })
await L.signIn(U); await exportsOf(U, 'U')
// S3
await S('s3.nav', async () => { await L.press(U, 'a:has-text("Admin"), button:has-text("Admin")'); await L.sleep(1500); return U.page.evaluate(() => window.CURPAGE) })
await S('s3.tabs', () => U.page.evaluate(() => [...document.querySelectorAll('#page-admin button, #vAdmin button, [data-admtab], [data-testid^="adm"]')].filter(b => b.getBoundingClientRect().width > 0).map(b => (b.dataset.testid || b.id || '') + ':' + b.textContent.trim().slice(0, 20)).slice(0, 40)))
await L.pic(U, OUT, `s3-${size}-admin`, { clip: full(U) })
log('errs.u', U.errs); await L.closeAll(U)
console.log('DONE')
