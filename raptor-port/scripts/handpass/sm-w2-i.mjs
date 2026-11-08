// W2 I: the plain-user round on a HEALTHY week: file, open, edit, close each way, Undo; then the schedule and the bell. SZ=pc|phone
import * as L from './sm-lib.mjs'
import { readFileSync } from 'node:fs'
const size = process.env.SZ || 'pc'
console.log('sm-w2-i v1', size)
const OUT = L.outDir('w2')
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad'
const s3 = JSON.parse(readFileSync(SCR + '/w2-state3.json', 'utf8'))
const log = (k, v) => console.log(k, JSON.stringify(v))
const S = async (k, fn) => { try { log(k, await fn()) } catch (e) { log(k, { ERR: e.message.split('\n')[0] }) } }
const W = await L.launch(size, { origin: 'http://localhost:4393', state: s3 })
const { page } = W
const v = page.viewportSize(); const full = { x: 0, y: 0, width: v.width, height: v.height }
await L.signIn(W)
const count = () => page.evaluate(() => (window.INPUTS || []).length)
const winOpen = () => page.locator(L.T('win-inputedit')).filter({ visible: true }).count()
const n0 = await count()
let inp
await S('file', async () => { inp = await L.fileInput(W, { who: 'Saint', type: 'LL', iso: '2026-07-16', remarks: 'round note' }); return { iid: inp && inp.iid, n: await count(), n0 } })
await L.pic(W, OUT, `round-${size}-after-file`, { clip: full })
const open = async () => { await L.openInputsList(W); await L.press(W, `tr[data-iid="${inp.iid}"] .in-open`); await page.waitForSelector(L.T('win-inputedit')); await L.sleep(500) }
await S('open', async () => { await open(); return { win: await winOpen(), title: await page.evaluate(() => (document.querySelector('[data-testid="win-inputedit"]') || {}).innerText.slice(0, 40)) } })
await L.pic(W, OUT, `round-${size}-opened`, { clip: full })
await S('edit-save', async () => { await page.locator('#inpEditRmk').fill('edited note'); await L.press(W, '#inpEditSave'); await L.sleep(900); return { win: await winOpen(), n: await count(), rmk: await page.evaluate(id => (window.INPUTS.find(r => r.iid === id) || {}).rmk, inp.iid), toast: await L.toastText(page) } })
// close by each way, clean and dirty
await S('close-x-clean', async () => { await open(); await L.press(W, L.T('win-inputedit-x')); await L.sleep(600); return { win: await winOpen() } })
await S('close-esc-clean', async () => { await open(); await page.keyboard.press('Escape'); await L.sleep(600); return { win: await winOpen() } })
await S('close-cancel-clean', async () => { await open(); await L.press(W, '#inpEditCancel'); await L.sleep(600); return { win: await winOpen() } })
await S('close-outside-clean', async () => { await open(); const w = page.viewportSize(); await page.mouse.click(8, w.height - 8); await L.sleep(600); return { win: await winOpen() } })
await page.keyboard.press('Escape').catch(() => {}); await L.sleep(300)
if (await winOpen()) { await L.press(W, L.T('win-inputedit-x')); await L.sleep(500) }
await S('close-x-dirty', async () => { await open(); await page.locator('#inpEditRmk').fill('dirty note'); await L.press(W, L.T('win-inputedit-x')); await L.sleep(600); const q = await page.locator('button:has-text("Keep editing")').filter({ visible: true }).count(); await L.pic(W, OUT, `round-${size}-dirty-close`, { clip: full }); if (q) { await page.locator('button:has-text("Keep editing")').filter({ visible: true }).first().click(); await L.sleep(400) } return { question: q, win: await winOpen(), rmkKept: await page.locator('#inpEditRmk').inputValue() } })
await S('close-esc-dirty-discard', async () => { await page.keyboard.press('Escape'); await L.sleep(500); const d = page.locator('button:has-text("Discard and close")').filter({ visible: true }); const q = await d.count(); if (q) { await d.first().click(); await L.sleep(500) } return { question: q, win: await winOpen(), rmk: await page.evaluate(id => (window.INPUTS.find(r => r.iid === id) || {}).rmk, inp.iid) } })
// other places show the result
await L.goEdit(W)
await S('schedule', () => L.weekUnavMark(page, 3, 'Saint'))
await L.center(page, '#eWeek section.day[data-day="3"] .sec-unav'); await L.sleep(400)
await L.pic(W, OUT, `round-${size}-schedule-thu`, { sel: '#eWeek section.day[data-day="3"] .sec-unav' })
await S('bell', async () => { await L.press(W, '#bellBtn, [data-testid="bell"], button[aria-label*="ell" i]'); await L.sleep(700); return page.evaluate(() => [...document.querySelectorAll('[data-testid^="bell"], .bellpop, .bellwin')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 300)).slice(0, 2)) })
await L.pic(W, OUT, `round-${size}-bell`, { clip: full })
await page.keyboard.press('Escape'); await L.sleep(300)
// Undo
await S('undo', async () => { const before = await count(); await L.press(W, '#undoBtn, [data-testid="undo"], button[title^="Undo"], button[aria-label^="Undo"]'); await L.sleep(900); return { before, after: await count(), toast: await L.toastText(page), still: await page.evaluate(id => !!(window.INPUTS || []).find(r => r.iid === id), inp.iid) } })
await L.pic(W, OUT, `round-${size}-after-undo`, { clip: full })
log('errs', W.errs); await L.closeAll(W)
console.log('DONE')
