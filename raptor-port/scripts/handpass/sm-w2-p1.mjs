// W2 probe: week navigation controls, the input window's buttons (from a list row), Leave War entry.
import * as L from './sm-lib.mjs'
import { readFileSync } from 'node:fs'
console.log('sm-w2-p1 v1')
const ORIGIN = 'http://localhost:4393'
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad'
const state = JSON.parse(readFileSync(SCR + '/w2-state.json', 'utf8'))
const W = await L.launch('pc', { origin: ORIGIN, state })
const { page } = W
await L.signIn(W); await L.goEdit(W)
console.log('seg', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#weekSegE button,#weekSegE [data-wk],#weekSeg button,#weekSeg [data-wk],[data-wk]')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.id + '|' + (b.dataset.wk || '') + '|' + b.textContent.trim().slice(0, 30)))))
console.log('weekfns', JSON.stringify(await page.evaluate(() => Object.keys(window).filter(k => /week|wk|load/i.test(k)))))
// open Bolt's LL row from the list
await L.openInputsList(W)
const rows = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="in-row"],[data-iid],tr[data-id]')].slice(0, 5).map(e => e.outerHTML.slice(0, 160)))
console.log('rows', JSON.stringify(rows))
await page.evaluate(() => { const r = (window.INPUTS || []).find(x => x.who === 'Bolt' || true); window.__r = r })
const el = page.locator('tr:has-text("Bolt"):has-text("15 Jul"), [role=row]:has-text("Bolt"):has-text("15 Jul")').first()
console.log('bolt row', await el.count())
if (await el.count()) { await el.click(); await L.sleep(800) }
console.log('win buttons', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] button, [data-testid="win-inputedit"] [id]')].filter(b => b.getBoundingClientRect().width > 0).map(b => (b.id || b.dataset.testid || '') + '|' + b.textContent.trim().slice(0, 24)))))
await L.pic(W, L.outDir('w2'), 'probe-input-window', {})
await L.closeAll(W)
console.log('DONE')
