// PROBE (4 Nov 26, the re-walk of D1633): after a refused Leave War download, does WebKit fetch the file again after a
// reload? The re-walk's R5c saw the card still up after Retry reloaded and he signed in again, with only ONE failed request.
// Each case refuses the file, opens the Leave War (the card), allows it, then reloads a different way, signs in again and
// opens the Leave War, logging every request for the file, its answer and whether the grid came.
// Run from raptor-port/ with the build served on :4173: node scripts/handpass/lwsf-webkit-reload-probe.mjs
import { chromium, webkit, devices } from '@playwright/test'
import { existsSync } from 'node:fs'

const URL = 'http://localhost:4173/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const out = s => console.log(s)

async function signIn(p) {
  await p.waitForSelector('#loginForm', { timeout: 15000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a')
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(400)
}
async function openLW(p, touch) {
  if (await p.locator('#burger').isVisible()) {
    await p.locator('#burger').tap(); await p.waitForSelector('#drawer.open'); await sleep(250)
    await p.locator('#drawerNav a[data-page="leavewar"]').tap()
  } else await p.locator('a[data-page="leavewar"]:visible').first().click()
  const grid = await p.locator('[data-testid="row-slipway"]').waitFor({ timeout: 12000 }).then(() => true, () => false)
  const card = await p.locator('[data-testid="page-load-fail"]').count()
  return { grid, card }
}

async function run(type, opts, label, how, mode) {
  const ctx = await type.newContext(opts)
  const G = { refuse: true }
  const log = []
  const pattern = '**/assets/LeaveWarPage-*.js'
  if (mode === 'route') await ctx.route(pattern, async r => { try { if (G.refuse) { log.push('route: refused'); return await r.abort('internetdisconnected') } log.push('route: let through'); await r.continue() } catch { /* gone */ } })
  const p = await ctx.newPage()
  p.on('request', r => { if (/LeaveWarPage-.*\.js/.test(r.url())) log.push('request') })
  p.on('response', r => { if (/LeaveWarPage-.*\.js/.test(r.url())) log.push('response ' + r.status() + (r.fromServiceWorker() ? ' (sw)' : '')) })
  p.on('requestfailed', r => { if (/LeaveWarPage-.*\.js/.test(r.url())) log.push('failed ' + (r.failure()?.errorText || '')) })
  p.on('console', m => { if (m.type() === 'error' && /module|import/i.test(m.text())) log.push('console: ' + m.text().slice(0, 90)) })
  if (mode === 'offline') { /* the refusal by the browser's own offline switch instead of a route */ }
  await p.goto(URL); await signIn(p)
  if (mode === 'offline') await ctx.setOffline(true)
  const a = await openLW(p)
  log.push(`-- refused: ${JSON.stringify(a)}`)
  G.refuse = false
  if (mode === 'offline') await ctx.setOffline(false)
  if (how === 'retry') await p.locator('[data-testid="page-load-retry"]').tap().catch(() => p.locator('[data-testid="page-load-retry"]').click())
  else if (how === 'reload') await p.reload()
  else if (how === 'goto') await p.goto(URL)
  else if (how === 'query') await p.goto(URL + '?r=' + Date.now())
  else if (how === 'reload-twice') { await p.reload(); await sleep(8000); await p.reload() }
  else if (how === 'busted-import') {
    const u = await p.evaluate(() => performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('LeaveWarPage-') && n.endsWith('.js')))
    const r = await p.evaluate(x => import(x + '?r=1').then(() => 'loaded', e => 'failed ' + e.message), u)
    log.push('busted import of ' + u + ': ' + r)
    await p.reload()
  }
  else if (how === 'newpage') { const p2 = await ctx.newPage(); await p.close(); return finish(ctx, p2, log, label, how, mode, true) }
  return finish(ctx, p, log, label, how, mode)
}
async function finish(ctx, p, log, label, how, mode, fresh) {
  if (fresh) { p.on('request', r => { if (/LeaveWarPage-.*\.js/.test(r.url())) log.push('request (new tab)') }); await p.goto(URL) }
  await signIn(p)
  const b = await openLW(p)
  log.push(`-- after ${how}: ${JSON.stringify(b)}`)
  out(`${label} | refusal by ${mode} | then ${how}: ${b.grid && !b.card ? 'GRID' : 'CARD'}\n    ${log.join(' · ')}`)
  await ctx.close()
}

const wk = await webkit.launch()
const IP = { ...devices['iPhone 13'] }
const HOWS = (process.env.HOWS || 'retry,reload,goto,newpage').split(',')
for (const mode of ['route', 'offline']) for (const how of HOWS) {
  try { await run(wk, IP, 'WebKit iPhone 13', how, mode) } catch (e) { out(`WebKit ${mode} ${how}: stopped — ${String(e.message).split('\n')[0]}`) }
}
await wk.close()
const cr = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
if (!process.env.HOWS) for (const mode of ['route', 'offline']) for (const how of ['retry']) {
  try { await run(cr, { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true }, 'Chromium phone', how, mode) } catch (e) { out(`Chromium ${mode} ${how}: stopped — ${String(e.message).split('\n')[0]}`) }
}
await cr.close()
