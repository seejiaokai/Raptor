/* W24 — a tab behind another (chat 167; evidence sheet docs/handpass/2026-11-24-timing-readout.md).
   Why a script of its own: Playwright keeps every page it drives "visible", whatever is in front — chat 164's headless
   run, chat 165's real window off the screen, and chat 167's tries (tabs opened by the developer protocol, Playwright
   connected to a plainly started browser, its focus emulation switched off) all read "visible" in a tab behind another.
   A Chromium started plainly and driven ONLY through its developer port hides a tab behind another as his desktop does
   (proved first, chat 167). The window stays off the screen; `--disable-backgrounding-occluded-windows` keeps a window
   off the screen from counting as covered, so only the tab in front is visible.
   From raptor-port/, on a build already made: TW_OUT=<picture folder> node scripts/handpass/timing-walk-w24.mjs */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { serve, chromium, PRESS, readout, row, pageRows, judge, saveResults, sleep, shotDir } from './timing-walk-lib.mjs'

const srv = await serve(); const B = srv.base
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'tw-w24-'))
const PORT = 9300 + Math.floor(Math.random() * 500)
const ch = spawn(chromium.executablePath(), [`--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, '--no-first-run',
  '--no-default-browser-check', '--disable-backgrounding-occluded-windows', '--window-position=-3200,0', '--window-size=1366,850', 'about:blank'], { stdio: 'ignore' })
const http = p => fetch(`http://127.0.0.1:${PORT}${p}`, p.startsWith('/json/new') ? { method: 'PUT' } : {}).then(r => r.json())
for (let i = 0; i < 80; i++) { try { await http('/json/version'); break } catch { await sleep(250) } }

function socket(url) {
  let id = 0; const pend = new Map(); const w = new WebSocket(url)
  w.onmessage = m => { const d = JSON.parse(m.data); if (pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id) } }
  const ready = new Promise(r => { w.onopen = r })
  const send = async (method, params = {}) => { await ready; return new Promise(r => { const i = ++id; pend.set(i, r); w.send(JSON.stringify({ id: i, method, params })) }) }
  return { send, close: () => w.close() }
}
const VIS = `window.__vis = []; document.addEventListener('visibilitychange', () => window.__vis.push(document.visibilityState))`
/* a page driven through its own developer-port socket, with the few calls the walk's helpers use */
async function tab(targetId) {
  const t = (await http('/json/list')).find(x => x.id === targetId)
  const s = socket(t.webSocketDebuggerUrl)
  await s.send('Page.enable'); await s.send('Runtime.enable')
  await s.send('Page.addScriptToEvaluateOnNewDocument', { source: VIS })
  await s.send('Page.addScriptToEvaluateOnNewDocument', { source: PRESS })
  const page = {
    id: targetId,
    async evaluate(fn, arg) {
      const expression = typeof fn === 'function' ? `(${fn})(${arg === undefined ? '' : JSON.stringify(arg)})` : fn
      const r = await s.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
      if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'evaluate failed')
      return r.result.result.value
    },
    async goto(url) { await s.send('Page.navigate', { url }) },
    async waitFor(test, ms = 60000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(test).catch(() => false)) return; await sleep(100) } throw new Error('timed out: ' + test) },
    async box(sel) { return page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 } }, sel) },
    async click(sel) {
      const b = await page.box(sel); if (!b) throw new Error('no ' + sel)
      for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await s.send('Input.dispatchMouseEvent', { type, x: b.x, y: b.y, button: 'left', clickCount: type === 'mouseMoved' ? 0 : 1 })
    },
    async fill(sel, v) { await page.click(sel); await page.evaluate(sel => { const e = document.querySelector(sel); e.select && e.select() }, sel); await s.send('Input.insertText', { text: v }) },
    async front() { await fetch(`http://127.0.0.1:${PORT}/json/activate/${targetId}`) },
    async shot(dir, name) { const r = await s.send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(dir, name + '.png'), Buffer.from(r.result.data, 'base64')) },
    close: () => s.close(),
  }
  return page
}
const browserWs = socket((await http('/json/version')).webSocketDebuggerUrl)
const newTab = async background => (await browserWs.send('Target.createTarget', { url: 'about:blank', newWindow: false, background })).result.targetId
const secs = v => Number((/([\d.]+) s/.exec(v) || [])[1])
const dir = shotDir('W24')

/* (1) a page asked for, then the tab put behind another for 30 s, then brought back */
const first = (await http('/json/list')).find(x => x.type === 'page')
const page = await tab(first.id)
await page.goto(B + '/?timing')
await page.waitFor(() => !!document.querySelector('#luser') && document.querySelector('#luser').offsetParent !== null, 120000)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.evaluate(() => window.__tw.arm('viewsched'))
await page.click('#loginForm button[type=submit]')
await page.waitFor(() => !!document.querySelector('#vWeek .day')); await sleep(800)
const n = pageRows(await readout(page)).length
await page.click('#topnav a[data-page="editsched"]')
const other = await tab(await newTab(false)); await other.front()
await sleep(30000)
const hiddenThen = await page.evaluate(() => document.visibilityState)
await page.front(); await sleep(2500)
const vis = await page.evaluate(() => window.__vis)
const rows = pageRows(await readout(page))
const added = rows.slice(0, rows.length - n)
judge('W24-hidden', vis.includes('hidden') ? added.every(x => secs(x.value) < 5) : null, `the tab went ${vis.join(' → ') || 'never hidden'} (while behind: ${hiddenThen}); rows added: ${added.map(x => x.label + ' ' + x.tag + ' ' + x.value).join(', ') || 'none'}`)
await page.shot(dir, 'hidden-and-back')

/* (2) ?timing loaded in a tab opened BEHIND another, brought in front 30 s later (fault 6, chat 165) */
const bg = await tab(await newTab(true))
await bg.goto(B + '/?timing')
await sleep(30000)
const bgVisBefore = await bg.evaluate(() => document.visibilityState)
await bg.front(); await sleep(3000)
const rb = await readout(bg)
const bgVis = await bg.evaluate(() => window.__vis)
judge('W24-background-load', bgVisBefore === 'hidden' && row(rb, 'App loaded')?.value === 'not timed, tab not in front' && row(rb, 'Sign-in shown')?.value === 'not timed, tab not in front' && /^at |^under 0\.1 s$/.test(row(rb, 'Site answered')?.value || ''),
  `while behind: ${bgVisBefore}; the tab went ${bgVis.join(' → ') || '(no change seen)'}; loaded behind another tab: ${rb.rows.slice(0, 3).map(x => x.label + ' ' + x.value).join(' · ')}`)
await bg.shot(dir, 'background-load')

/* (3) the same address opened in FRONT, for comparison: the start-up figures given */
const fg = await tab(await newTab(false)); await fg.front()
await fg.goto(B + '/?timing'); await fg.waitFor(() => !!document.querySelector('#timingRoot .timingwin'), 60000); await sleep(1500)
const rf = await readout(fg)
judge('W24-front-load', /^at |under/.test(row(rf, 'App loaded')?.value || '') && /^at /.test(row(rf, 'Sign-in shown')?.value || ''), `opened in front: ${rf.rows.slice(0, 3).map(x => x.label + ' ' + x.value).join(' · ')}`)
await fg.shot(dir, 'front-load')

for (const p of [page, other, bg, fg]) p.close()
browserWs.close(); ch.kill(); await srv.close()
saveResults('w24')
