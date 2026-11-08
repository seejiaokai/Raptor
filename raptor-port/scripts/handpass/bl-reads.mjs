/* bl-reads — the two code reads' findings on the sideways board, reproduced in the running app (chat 11, 8 Nov 26).
   Usage: BASE=http://localhost:4180/ ONLY=r1,r2 node scripts/handpass/bl-reads.mjs   (a build already served; no lock)
   r1 the last box of the list tapped with the keys up · r2 a window opened with the head away, then the head back ·
   r3 the grey veil of "Jump to a date" while the board is scrolled by a finger · r4 a warning line's jump moves the board */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../..')
const OUT = resolve(ROOT, 'docs/img/handpass/2026-11-08-board-layout/reads/') + '/'
mkdirSync(OUT, { recursive: true })
const URL = process.env.BASE || 'http://localhost:4180/'
const TAG = process.env.TAG || 'before'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const VP = { width: 874, height: 402 }, KB = 200, GAP = 8
const say = (...a) => console.log(a.join(' '))
const check = (id, ok, note) => say(`${ok ? 'PASS' : 'FAIL'} ${id} — ${note}`)

async function boot() {
  const ctx = await browser.newContext({ viewport: VP, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  page.errs = []
  page.on('pageerror', e => page.errs.push(String(e).slice(0, 200)))
  await page.addInitScript(() => {
    class FakeVV extends EventTarget { width = innerWidth; height = innerHeight; offsetTop = 0; offsetLeft = 0; pageTop = 0; pageLeft = 0; scale = 1 }
    const f = new FakeVV(); Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => f }); window.__vv = f
  })
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  if (await page.locator('#burger').isVisible()) { await page.click('#burger'); await page.waitForTimeout(400) }
  await page.locator('button,a', { hasText: 'Edit Schedule' }).filter({ visible: true }).first().click(); await page.waitForTimeout(500)
  await page.locator('#eWeek .sb-open[data-sbday]').first().click()
  await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(600)
  page.cdp = await ctx.newCDPSession(page)
  return { ctx, page }
}
const scrollTo = (page, y) => page.evaluate(y => { document.querySelector('.schedboard').scrollTop = y }, y)
const shot = (page, name) => page.screenshot({ path: `${OUT}${TAG}-${name}.png` }).catch(() => {})
const keys = (page, up) => page.evaluate(([kb, up]) => { const v = window.__vv; v.height = up ? innerHeight - kb : innerHeight; v.dispatchEvent(new Event('resize')) }, [KB, up])

async function r1() {
  const { ctx, page } = await boot()
  await scrollTo(page, 99999); await page.waitForTimeout(200)
  const pick = await page.evaluate(kb => {
    const all = [...document.querySelectorAll('#schedBoard .sb-boardwrap input, #schedBoard .sb-boardwrap textarea')]
      .filter(n => n.getClientRects().length && getComputedStyle(n).visibility !== 'hidden')
      .map(n => ({ n, r: n.getBoundingClientRect() })).filter(o => o.r.bottom <= innerHeight && o.r.top >= 0 && o.r.height > 6)
    all.sort((a, b) => b.r.bottom - a.r.bottom)
    const o = all[0]; if (!o) return null
    o.n.setAttribute('data-r1', '')
    const b = document.querySelector('.schedboard')
    return { bottom: Math.round(o.r.bottom), y: Math.round(o.r.top + Math.min(o.r.height / 2, 8)), x: Math.round(o.r.left + o.r.width / 2),
      scroll: Math.round(b.scrollTop), max: b.scrollHeight - b.clientHeight, under: o.r.bottom > innerHeight - kb - 8 }
  }, KB)
  say('r1 the lowest box at the end of the list:', JSON.stringify(pick))
  if (!pick || !pick.under) { say('r1 fixture: no box under where the keys come'); await ctx.close(); return }
  await page.touchscreen.tap(pick.x, pick.y)
  await keys(page, true); await page.waitForTimeout(700)
  const after = await page.evaluate(() => {
    const n = document.querySelector('[data-r1]'), r = n.getBoundingClientRect(), b = document.querySelector('.schedboard')
    const act = document.querySelector('#schedBoard .sb-actions').getBoundingClientRect()
    return { focused: document.activeElement === n, bottom: Math.round(r.bottom), scroll: Math.round(b.scrollTop),
      roomed: [...document.querySelectorAll('[data-kbroom]')].map(e => e.className.split(' ')[0] || e.id), barTop: Math.round(act.top),
      transform: getComputedStyle(b).transform }
  })
  await shot(page, 'r1-keys-up')
  check('r1', after.bottom <= VP.height - KB - GAP + 1, `the box's foot ${after.bottom} (above the keys: at most ${VP.height - KB - GAP}); focused ${after.focused}; board scroll ${after.scroll}; room given to: ${after.roomed.join(',') || 'nothing'}; bar top ${after.barTop}; transform ${after.transform}`)
  await keys(page, false); await page.waitForTimeout(500)
  const down = await page.evaluate(() => document.querySelectorAll('[data-kbroom]').length)
  check('r1-down', down === 0, `room left after the keys go down: ${down}`)
  if (page.errs.length) say('  page errors:', page.errs.join(' | '))
  await ctx.close()
}

async function r2() {
  const { ctx, page } = await boot()
  await scrollTo(page, 600); await page.waitForTimeout(200)
  await page.click('#sbHist'); await page.waitForTimeout(700)
  const g = () => page.evaluate(() => {
    const w = document.querySelector('.chgwin'), wr = w && w.getBoundingClientRect(), t = document.querySelector('#schedBoard .sb-top').getBoundingClientRect()
    const hits = ['#sbBell', '#sbInsights', '#sbDone'].map(s => { const e = document.querySelector(s); if (!e) return s + ':none'; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return s + ':' + (h && h.closest(s) ? 'ok' : (h && h.closest('.chgwin') ? 'WINDOW' : 'other')) })
    return { win: wr ? [Math.round(wr.top), Math.round(wr.left), Math.round(wr.bottom)] : null, barFoot: Math.round(t.bottom), hits, scroll: Math.round(document.querySelector('.schedboard').scrollTop) }
  })
  const a = await g()
  say('r2 opened with the head away:', JSON.stringify(a))
  await scrollTo(page, 0); await page.waitForTimeout(400)
  const b = await g()
  await shot(page, 'r2-head-back')
  check('r2', b.hits.every(h => h.endsWith(':ok')), `head back: window [top,left,bottom] ${JSON.stringify(b.win)}, bar foot ${b.barFoot}, presses ${b.hits.join(' ')}`)
  await scrollTo(page, 600); await page.waitForTimeout(400)
  const c = await g()
  check('r2-away-again', c.hits.every(h => h.endsWith(':ok')), `head away again: window ${JSON.stringify(c.win)}, bar foot ${c.barFoot}, presses ${c.hits.join(' ')}`)
  if (page.errs.length) say('  page errors:', page.errs.join(' | '))
  await ctx.close()
}

async function drag(page, x, y0, y1) {
  const t = (type, y) => page.cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] })
  await t('touchStart', y0)
  for (let i = 1; i <= 12; i++) { await t('touchMove', y0 + (y1 - y0) * i / 12); await page.waitForTimeout(16) }
  await t('touchEnd', y1)
}
async function r3() {
  const { ctx, page } = await boot()
  await page.click('#sbCal'); await page.waitForTimeout(600)
  const g = () => page.evaluate(() => {
    const pops = [...document.querySelectorAll('.airpop')].filter(p => p.getClientRects().length)
    const p = pops[pops.length - 1], t = document.querySelector('#schedBoard .sb-top').getBoundingClientRect()
    const h = document.elementFromPoint(437, Math.round(t.bottom) + 20)
    return { veilTop: p ? Math.round(p.getBoundingClientRect().top) : null, barFoot: Math.round(t.bottom), scroll: Math.round(document.querySelector('.schedboard').scrollTop),
      under: h ? (h.closest('.airpop') ? 'veil' : h.closest('.sb-top') ? 'bar' : h.closest('.sb-board') ? 'LIST' : (h.className || h.tagName)) : 'none' }
  })
  const a = await g()
  say('r3 "Jump to a date" open:', JSON.stringify(a))
  const title = await page.locator('#schedBoard .sb-title').boundingBox()
  await drag(page, Math.round(title.x + 40), Math.round(title.y + title.height / 2), Math.round(title.y + title.height / 2) - 160)
  await page.waitForTimeout(500)
  const b = await g()
  await shot(page, 'r3-finger-scrolled')
  check('r3', b.scroll === 0 || Math.abs(b.veilTop - b.barFoot) <= 1, `after a finger drag on the title: board scroll ${b.scroll}, veil top ${b.veilTop}, bar foot ${b.barFoot}, just under the bar: ${b.under}`)
  if (page.errs.length) say('  page errors:', page.errs.join(' | '))
  await ctx.close()
}

async function r4() {
  const { ctx, page } = await boot()
  const n = await page.evaluate(() => { const ls = [...document.querySelectorAll('#schedBoard .sb-warn .wln[data-wdi]')].filter(e => e.getClientRects().length); const l = ls[ls.length - 1]; if (l) l.setAttribute('data-r4', ''); return ls.length })
  say('r4 warning lines on the board:', n)
  if (!n) { say('r4 fixture: no warning line'); await ctx.close(); return }
  const before = await page.evaluate(() => Math.round(document.querySelector('.schedboard').scrollTop))
  await page.evaluate(() => document.querySelector('[data-r4]').scrollIntoView({ block: 'nearest' }))
  await scrollTo(page, before); await page.waitForTimeout(200)
  const s0 = await page.evaluate(() => Math.round(document.querySelector('.schedboard').scrollTop))
  await page.locator('[data-r4]').click(); await page.waitForTimeout(1200)
  const s1 = await page.evaluate(() => Math.round(document.querySelector('.schedboard').scrollTop))
  await shot(page, 'r4-warning-tapped')
  check('r4', s0 === s1, `the board's scroll before the tap ${s0}, after ${s1}`)
  if (page.errs.length) say('  page errors:', page.errs.join(' | '))
  await ctx.close()
}

/* the Opus read's finding 5, by its own door: a published Tuesday, its long-work-day warning hidden (one change waiting),
   the board's History → To go out → "Warning · … flagged → hidden" — the view lands on the struck line, the list stays */
async function r5() {
  const ctx = await browser.newContext({ viewport: VP, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  page.errs = []; page.on('pageerror', e => page.errs.push(String(e).slice(0, 200)))
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  if (await page.locator('#burger').isVisible()) { await page.click('#burger'); await page.waitForTimeout(400) }
  await page.locator('button,a', { hasText: 'Edit Schedule' }).filter({ visible: true }).first().click(); await page.waitForTimeout(500)
  const TUE = 1, day = `#eWeek .day[data-day="${TUE}"]`
  await page.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); const sc = d.closest('.week') || d.parentElement; if (sc.scrollWidth > sc.clientWidth) sc.scrollLeft = d.offsetLeft - (sc.firstElementChild?.offsetLeft || 0); window.scrollTo(0, 0) }, TUE)
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = page.locator(`${day} select[data-sign="${role}"][data-signday="${TUE}"]`).first()
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.selectOption(opts[0])
  }
  const pub = page.locator(`${day} [data-beak="${TUE}"]`).first()
  await pub.evaluate(e => e.scrollIntoView({ block: 'center' })); await pub.click(); await page.waitForTimeout(400)
  const box = page.locator(`${day} [data-dwbox="${TUE}"]`).first()
  if (!(await box.evaluate(e => e.classList.contains('open')))) await page.locator(`${day} [data-daywarn="${TUE}"]`).first().click()
  await page.locator(`${day} [data-woff="${TUE}.3"]`).first().click(); await page.waitForTimeout(300)
  say('r5 pending:', await page.locator(`${day} .dpend`).first().innerText().catch(() => '?'))
  await page.locator(`#eWeek .sb-open[data-sbday="${TUE}"]`).first().click()
  await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(600)
  await page.click('#sbHist'); await page.waitForTimeout(600)
  await page.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'To go out' }).first().click(); await page.waitForTimeout(300)
  const line = page.locator('.chgwin:not([hidden]) .pl-list button.pl-item').first()
  say('r5 the line:', (await line.innerText().catch(() => '?')).replace(/\s+/g, ' ').slice(0, 90))
  const s0 = await page.evaluate(() => Math.round(document.querySelector('.schedboard').scrollTop))
  await line.click(); await page.waitForTimeout(1500)
  const after = await page.evaluate(() => {
    const b = document.querySelector('.schedboard'), w = document.querySelector('#schedBoard .sb-warn .wln.hid, #schedBoard .sb-warn .wln.on')
    const r = w && w.getBoundingClientRect()
    return { scroll: Math.round(b.scrollTop), line: r ? [Math.round(r.top), Math.round(r.bottom)] : null }
  })
  await shot(page, 'r5-to-go-out-line')
  check('r5', after.scroll === s0, `the board's scroll before the tap ${s0}, after ${after.scroll}; the struck line at ${JSON.stringify(after.line)} (screen 0–${VP.height})`)
  if (page.errs.length) say('  page errors:', page.errs.join(' | '))
  await ctx.close()
}

for (const [k, f] of Object.entries({ r1, r2, r3, r4, r5 })) if (!ONLY.length || ONLY.includes(k)) { try { await f() } catch (e) { say(`ERROR ${k}: ${String(e).slice(0, 300)}`) } }
await browser.close()
