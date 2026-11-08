/* bl-walk-b — Walker B, the board on a phone held sideways (chat 11, 8 Nov 26). Usage: KIND=webkit|chromium ONLY=b1,b3 node scripts/handpass/bl-walk-b.mjs */
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, readdirSync, rmSync, appendFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
console.log('bl-walk-b v2')
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../..')
const KIND = process.env.KIND || 'webkit'
const SZ = process.env.SIZE || '874x402'
const VPD = { width: +SZ.split('x')[0], height: +SZ.split('x')[1] }
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const BASE = resolve(ROOT, 'docs/img/handpass/2026-11-08-board-layout/walk/b/')
const TAG = KIND + (SZ === '874x402' ? '' : '-' + SZ)
const OUT = resolve(BASE, TAG) + '/'
const LOG = resolve(BASE, `log-${TAG}.txt`)
mkdirSync(OUT, { recursive: true })
if (!ONLY.length) { for (const f of readdirSync(OUT)) rmSync(OUT + f); try { rmSync(LOG) } catch {} }
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = KIND === 'webkit' ? await webkit.launch() : await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const URL = 'http://localhost:4180/'
let N = 0
const say = (...a) => { const s = a.join(' '); console.log(s); try { appendFileSync(LOG, s + '\n') } catch {} }
const check = (id, ok, note) => say(`${ok ? 'PASS' : 'FAIL'} ${id} — ${note}`)
const SIDEWAYS = '(min-width:821px) and (pointer:coarse) and (orientation:landscape) and (max-height:500px)'

async function world(vp = VPD, { touch = true, path = '', fake = true } = {}) {
  const ctx = await browser.newContext({ viewport: vp, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.errs = []
  page.on('pageerror', e => page.errs.push(String(e).slice(0, 200)))
  if (fake) await page.addInitScript(() => {
    class FakeVV extends EventTarget { width = innerWidth; height = innerHeight; offsetTop = 0; offsetLeft = 0; pageTop = 0; pageLeft = 0; scale = 1 }
    const f = new FakeVV(); Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => f }); window.__vv = f
  })
  await page.goto(URL + path)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  page.cdp = KIND === 'chromium' ? await ctx.newCDPSession(page) : null
  return { ctx, page }
}
async function shot(page, name, clip) {
  N++; const f = `${OUT}${String(N).padStart(3, '0')}-${name}.png`
  await page.screenshot({ path: f, ...(clip ? { clip } : {}) }).catch(() => say('  (shot failed ' + name + ')'))
  return f
}
async function toEdit(page) {
  if (await page.locator('#burger').isVisible()) { await page.click('#burger'); await page.waitForTimeout(400) }
  await page.locator('button,a', { hasText: 'Edit Schedule' }).filter({ visible: true }).first().click(); await page.waitForTimeout(500)
}
async function openBoard(page, idx = 0) {
  await page.locator('#eWeek .sb-open[data-sbday]').nth(idx).click()
  await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(600)
}
async function boot(vp, o) { const w = await world(vp, o); await toEdit(w.page); await openBoard(w.page); return w }
const st = page => page.evaluate(() => {
  const b = document.querySelector('.schedboard'), t = document.querySelector('#schedBoard .sb-top').getBoundingClientRect()
  const s = document.querySelector('.sb-side')?.getBoundingClientRect()
  const a = document.querySelector('#schedBoard .sb-actions')?.getBoundingClientRect()
  const hd = document.querySelector('#schedBoard .sb-title')?.getBoundingClientRect()
  return { sc: Math.round(b.scrollTop), max: Math.round(b.scrollHeight - b.clientHeight), topT: Math.round(t.top), topB: Math.round(t.bottom), actB: a && Math.round(a.bottom), actT: a && Math.round(a.top), titleB: hd && Math.round(hd.bottom), sideT: s && Math.round(s.top), sideB: s && Math.round(s.bottom), ih: innerHeight, vvh: Math.round(window.visualViewport?.height || 0), pageSc: Math.round(document.scrollingElement.scrollTop) }
})
const fmt = o => JSON.stringify(o)
/* a finger / a wheel. Chromium: real touch by CDP (rests before it lifts). WebKit: a touch inside the page drives no browser scroll — the wheel stands in. */
async function swipe(page, dy, { x = 300, y = null, steps = 14, gap = 16, rest = 90, wait = 500 } = {}) {
  y ??= dy < 0 ? 330 : 120
  if (KIND === 'chromium') {
    const c = page.cdp, pt = yy => [{ x, y: Math.round(yy), id: 1 }]
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(y) })
    for (let i = 1; i <= steps; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(y + dy * i / steps) }); await page.waitForTimeout(gap) }
    if (rest) await page.waitForTimeout(rest)
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else {
    /* mobile WebKit refuses the wheel and a touch drives no scroll: the board scrolled by its own scrollTop in small steps (a stand-in, not a finger) */
    for (let i = 1; i <= steps; i++) { await page.evaluate(v => { document.querySelector(".schedboard").scrollTop += v }, -dy / steps); await page.waitForTimeout(gap) }
  }
  if (wait) await page.waitForTimeout(wait)
}
const scrollTo = async (page, y) => { await page.evaluate(v => { document.querySelector('.schedboard').scrollTop = v }, y); await page.waitForTimeout(300) }
async function leak(page) { // D1518: the bar is opaque; every point of it answers to the bar
  return page.evaluate(() => {
    const t = document.querySelector('#schedBoard .sb-top'), r = t.getBoundingClientRect(), bad = []
    const bg = getComputedStyle(t).backgroundColor
    const acts = document.querySelector('#schedBoard .sb-actions').getBoundingClientRect()
    let n = 0
    for (let x = 4; x < innerWidth - 4; x += 22) for (let y = Math.max(1, acts.top + 1); y < Math.min(r.bottom, acts.bottom) - 1; y += 6) { n++; const e = document.elementFromPoint(x, y); if (!e || !e.closest('.sb-top')) bad.push([x, y, e && (e.className + '').slice(0, 30)]) }
    return { bg, n, bad: bad.slice(0, 5), nbad: bad.length }
  })
}
const want = id => ONLY.length ? ONLY.includes(id) : !/^pd/.test(id)
const run = async (id, fn) => { if (!want(id)) return; say(`--- ${id} (${TAG})`); try { await fn() } catch (e) { say(`ERROR ${id}: ${String(e).slice(0, 300)}`) } }
const shotBoth = async (page, name) => { await shot(page, name + '-tap'); await page.waitForTimeout(400); await shot(page, name + '-settled') }

/* ======================= scenarios ======================= */
await run('b1', async () => {
  const { ctx, page } = await boot()
  const on = await page.evaluate(q => matchMedia(q).matches, SIDEWAYS)
  check('B-look', on, `sideways query ${on} in ${KIND}`)
  const r = await st(page); say('rest', fmt(r))
  await shot(page, 'b1-rest')
  check('B1 rest', r.topB > 100 && r.titleB > 0 && r.sc === 0, `top foot ${r.topB}, title foot ${r.titleB}`)
  await swipe(page, -150, { steps: 20 }); let s = await st(page); say('slow 150', fmt(s)); await shot(page, 'b1-slow150')
  await swipe(page, -250); s = await st(page); say('slow 250', fmt(s)); await shot(page, 'b1-slow-more')
  check('B1 scrolled', s.sc > 100 && Math.abs(s.topB - 51) <= 6 && s.titleB < 0, `scrollTop ${s.sc}, bar foot ${s.actB} (actions) / ${s.topB} (top), title foot ${s.titleB}`)
  const lk = await leak(page); say('leak', fmt(lk)); check('B1 leak', lk.nbad === 0 && lk.n > 20, `${lk.n} points, ${lk.nbad} not the bar, bg ${lk.bg}`)
  await swipe(page, -300, { steps: 4, gap: 8, rest: 0, wait: 0 }); await swipe(page, -300, { steps: 4, gap: 8, rest: 0, wait: 100 })
  s = await st(page); say('flick x2', fmt(s)); await shot(page, 'b1-flick-during'); await page.waitForTimeout(900); const s2 = await st(page); await shot(page, 'b1-flick-settled')
  check('B1 flick', Math.abs(s2.topB - s.topB) <= 1 && Math.abs(s2.topB - 51) <= 6, `bar foot during ${s.actB}, settled ${s2.actB}, scrollTop ${s2.sc}`)
  await scrollTo(page, s2.max); s = await st(page); say('foot', fmt(s)); await shot(page, 'b1-foot')
  const lk2 = await leak(page); check('B1 leak foot', lk2.nbad === 0, `${lk2.nbad} of ${lk2.n} points not the bar`)
  await swipe(page, 900, { steps: 24 }); await swipe(page, 900, { steps: 24 }); s = await st(page); say('back up', fmt(s)); await shot(page, 'b1-back-up')
  await scrollTo(page, 0); s = await st(page); await shot(page, 'b1-back-top')
  check('B1 return', s.sc === 0 && s.titleB > 0 && s.topB > 100, `scrollTop ${s.sc}, title foot ${s.titleB}, top foot ${s.topB}; page errs ${page.errs.length}`)
  await ctx.close()
})
/* helpers for the later scenarios */
const keysUp = async (page, by = 200) => { await page.evaluate(b => { const v = window.__vv; v.height = innerHeight - b; v.dispatchEvent(new Event('resize')) }, by) }
const keysDown = async page => { await page.evaluate(() => { const v = window.__vv; v.height = innerHeight; v.dispatchEvent(new Event('resize')) }) }
const fullVV = async page => { await page.evaluate(() => { const v = window.__vv; v.width = innerWidth; v.height = innerHeight; v.offsetTop = 0 }) }
// bring the nth visible box of a kind to screen y (the board scrolled by its own scrollTop)
async function boxAt(page, sel, y, nth = 0) {
  await page.evaluate(([s, yy, n]) => { const b = document.querySelector('.schedboard'); const e = [...document.querySelectorAll(s)].filter(x => x.getBoundingClientRect().width > 0)[n]; b.scrollTop += e.getBoundingClientRect().top - yy }, [sel, y, nth])
  await page.waitForTimeout(300)
  return page.locator(sel).filter({ visible: true }).nth(nth)
}
const tapBox = async (page, loc) => { const bb = await loc.boundingBox(); await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2) }
const rectOf = (page, sel, nth = 0) => page.evaluate(([s, n]) => { const e = [...document.querySelectorAll(s)].filter(x => x.getBoundingClientRect().width > 0)[n]; if (!e) return null; const r = e.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right) } }, [sel, nth])
const activeRect = page => page.evaluate(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), tag: e.tagName } })
const TM = '#sbBoard .sb-line .sb-tl .tm'

await run('b2', async () => {
  const { ctx, page } = await boot()
  await fullVV(page)
  await scrollTo(page, 300)
  let box = await boxAt(page, TM, 360, 0)
  const before = await st(page); const sideBefore = await rectOf(page, '.sb-side')
  await tapBox(page, box); await shot(page, 'b2-low-tap-before-keys')
  await keysUp(page); await page.waitForTimeout(100); await shot(page, 'b2-low-keys-tap')
  await page.waitForTimeout(600); await shot(page, 'b2-low-keys-settled')
  const after = await st(page); const br = await activeRect(page)
  say('before', fmt(before), 'after', fmt(after), 'box', fmt(br))
  check('B2 box above keys', br.b <= after.ih - 200, `focused ${br.tag} foot ${br.b}, keys top ${after.ih - 200}`)
  check('B2 bar stays', after.topB === before.topB && after.topT === before.topT, `top foot ${before.topB} -> ${after.topB}`)
  check('B2 list above keys', Math.abs((after.ih - 200 - after.topB) - 151) <= 3, `list above the keys ${after.ih - 200 - after.topB}px (his figure 151 at 402 tall)`)
  say('B2 scrollTop before/after', before.sc, after.sc, 'side before/after', fmt(sideBefore), fmt(await rectOf(page, '.sb-side')))
  await page.evaluate(() => document.activeElement.blur()); await keysDown(page); await page.waitForTimeout(500)
  box = await boxAt(page, TM, 90, 1)
  const b2 = await st(page); const r2 = await rectOf(page, TM, 1)
  await tapBox(page, box); await keysUp(page); await page.waitForTimeout(100); await shot(page, 'b2-high-keys-tap'); await page.waitForTimeout(600); await shot(page, 'b2-high-keys-settled')
  const a2 = await st(page); const r3 = await activeRect(page)
  say('high: before', fmt(b2), 'after', fmt(a2), r2.t, r3.t)
  check('B2 high box nothing moves', a2.sc === b2.sc && Math.abs(r3.t - r2.t) <= 1, `scrollTop ${b2.sc} -> ${a2.sc}, box top ${r2.t} -> ${r3.t}`)
  await ctx.close()
})
await run('b3', async () => {
  const { ctx, page } = await boot()
  let s = await st(page); await shot(page, 'b3-rest')
  say('rest side', s.sideT, s.sideB, 'ih', s.ih)
  await swipe(page, -300); s = await st(page); await shot(page, 'b3-scrolled')
  check('B3 under bar', s.sideT === s.topB && s.sideB >= s.ih - 1, `column top ${s.sideT} (bar foot ${s.topB}), column foot ${s.sideB} (screen ${s.ih})`)
  const inner = await page.evaluate(() => [...document.querySelectorAll('.sb-side, .sb-side *')].filter(e => e.scrollHeight > e.clientHeight + 4 && ['auto', 'scroll'].includes(getComputedStyle(e).overflowY)).map(e => (e.className + '|' + e.id + '|' + e.scrollHeight + '/' + e.clientHeight)))
  say('inner scrollers', fmt(inner))
  const sel = await page.evaluate(() => { const e = [...document.querySelectorAll('.sb-side *')].find(e => e.scrollHeight > e.clientHeight + 4 && ['auto', 'scroll'].includes(getComputedStyle(e).overflowY)); if (!e) return null; const r = e.getBoundingClientRect(); e.setAttribute('data-bl-inner', '1'); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), sc: e.scrollTop } })
  if (sel) {
    const boardBefore = s.sc
    await swipe(page, -120, { x: sel.x, y: sel.y + 60, steps: 12 }); await shot(page, 'b3-inner-scrolled')
    const r = await page.evaluate(() => document.querySelector('[data-bl-inner]').scrollTop); const s3 = await st(page)
    check('B3 inner list scrolls by itself', r > sel.sc, `inner scrollTop ${sel.sc} -> ${r}, board scrollTop ${boardBefore} -> ${s3.sc}${KIND === 'webkit' ? ' (WebKit: programmatic scroll only, a finger is not drivable)' : ''}`)
  } else say('NOT WALKED B3 inner: no scrolling list found in the column')
  await ctx.close()
})
await run('b9', async () => {
  const { ctx, page } = await boot()
  await swipe(page, -400); let s = await st(page); say('scrolled', fmt(s))
  await scrollTo(page, 0); await shot(page, 'b9-top')
  await page.locator('#sbDays').getByText('Tue 14').first().click(); await page.waitForTimeout(600); await shot(page, 'b9-after-chip-tap'); s = await st(page)
  const title = await page.evaluate(() => document.querySelector('#schedBoard .sb-title').textContent.trim())
  check('B9 chip', s.sc === 0 && s.topB > 100 && /Tue|14/.test(title), `title "${title}", scrollTop ${s.sc}, top foot ${s.topB}`)
  await swipe(page, -400); await scrollTo(page, 0)
  const nxt = page.locator('#schedBoard button', { hasText: '›' }).filter({ visible: true }).first()
  if (await nxt.count()) { await nxt.click(); await page.waitForTimeout(600); await shot(page, 'b9-after-next'); s = await st(page); const t2 = await page.evaluate(() => document.querySelector('#schedBoard .sb-title').textContent.trim()); check('B9 next arrow', s.sc === 0 && s.topB > 100, `title "${t2}", scrollTop ${s.sc}, top foot ${s.topB}`) } else say('NOT WALKED B9 next arrow: not found')
  await scrollTo(page, 600); await scrollTo(page, 0); await page.locator('#sbDays').getByText('Wed 15').first().click(); await page.waitForTimeout(600); s = await st(page); await shot(page, 'b9-after-wed')
  const lk = await leak(page)
  check('B9 clean', s.sc === 0 && s.topB > 100 && lk.nbad === 0, `scrollTop ${s.sc}, top foot ${s.topB}; page errs ${page.errs.length}`)
  await ctx.close()
})
/* find what a press opened: elements drawn now that were not drawn before, big enough to be a window */
const snap = page => page.evaluate(() => {
  const out = {}; let i = 0
  for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect(); if (r.width < 120 || r.height < 60) continue; const cs = getComputedStyle(e); if (!['fixed', 'absolute', 'sticky'].includes(cs.position)) continue; if (cs.visibility === 'hidden' || cs.display === 'none') continue; out[(e.id || '') + '|' + (e.className + '').slice(0, 40) + '|' + e.tagName + '|' + (i++)] = [Math.round(r.top), Math.round(r.bottom), Math.round(r.left), Math.round(r.right), cs.position, cs.zIndex] }
  return out
})
const opened = async (page, press) => {
  const a = await snap(page); const ak = new Set(Object.keys(a).map(k => k.replace(/\|\d+$/, '')))
  await press(); await page.waitForTimeout(600)
  const b = await snap(page)
  return Object.entries(b).filter(([k]) => !ak.has(k.replace(/\|\d+$/, ''))).map(([k, v]) => k + ' ' + v.join(','))
}
/* a puck dragged by a pointer (a mouse: the test browser's WebKit drives no touch drag) onto the target's measured middle; hold = ms held at the end before the drop */
async function dragPuck(page, from, to, { hold = 200, steps = 20, endY = null } = {}) {
  const a = await page.evaluate(s => { const e = [...document.querySelectorAll(s)].filter(x => x.getBoundingClientRect().width > 0)[0]; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, from)
  const t = to && await page.evaluate(s => { const e = [...document.querySelectorAll(s)].filter(x => x.getBoundingClientRect().width > 0)[0]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, to)
  if (to && !t) return { ok: false, why: 'target not on screen' }
  const ex = t ? t.x : a.x, ey = endY ?? t.y
  await page.mouse.move(a.x, a.y); await page.mouse.down()
  for (let i = 1; i <= steps; i++) { await page.mouse.move(a.x + (ex - a.x) * i / steps, a.y + (ey - a.y) * i / steps); await page.waitForTimeout(25) }
  await page.waitForTimeout(hold)
  return { ok: true, from: a, to: { x: ex, y: ey } }
}
const winRect =(page, sel) => page.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => { const r = x.getBoundingClientRect(); return r.width > 50 && r.height > 30 && getComputedStyle(x).visibility !== 'hidden' }); if (!e) return null; const r = e.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right) } }, sel)
const WINS = {
  history: { open: page => page.locator('#sbHist').tap?.() , sel: '.chgwin:not([hidden])', x: '.chgwin:not([hidden]) .win-x' },
  avail: { sel: '.availwin:not([hidden])', x: '.availwin:not([hidden]) .win-x' },
  insights: { sel: '#insightModal .modal-box, #insightModal > *', x: '#insightModal [aria-label="Close"], #insightModal .x, #insightModal button' }
}
async function addAvail(page) { await boxAt(page, '#sbBoard [data-slot="a:0.2.0"]', 200, 0); await dragPuck(page, '#sbRoster .puck.allavail', '#sbBoard [data-slot="a:0.2.0"]'); await page.mouse.up(); await page.waitForTimeout(600); return page.evaluate(() => document.querySelectorAll('#sbBoard [data-oilsent]').length) }
async function openWin(page, name) {
  if (name === 'history') await tapBox(page, page.locator('#sbHist'))
  else if (name === 'insights') await tapBox(page, page.locator('#sbInsights'))
  else { const chip = await boxAt(page, '#sbBoard [data-oilsent]', 250, 0); await tapBox(page, chip) }
  await page.waitForTimeout(600)
}
await run('b5', async () => {
  for (const name of ['history', 'avail', 'insights']) for (const how of ['x', 'esc', 'outside']) {
    const { ctx, page } = await boot()
    if (name === 'avail') { const c = await addAvail(page); say('ALL AVAIL chips on the day', c); await scrollTo(page, 400) } else await swipe(page, -450)
    const s = await st(page); const W = WINS[name]
    await openWin(page, name); await shotBoth(page, `b5-${name}-open-${how}`)
    const r = await winRect(page, W.sel); const lk = await leak(page)
    say(name, how, 'bar foot', s.topB, 'window', fmt(r))
    if (how === 'x') check(`B5 ${name} placed`, r && r.t >= s.topB - 1, `window top ${r && r.t}, bar foot ${s.topB} (scrolled ${s.sc}); bar still the bar: ${lk.nbad === 0}`)
    // close it by this way
    if (how === 'x') await page.locator(W.x).first().click({ timeout: 3000 }).catch(e => say('  no ✕ click: ' + String(e).slice(0, 80)))
    if (how === 'esc') await page.keyboard.press('Escape')
    if (how === 'outside') { await page.touchscreen.tap(40, 300) }
    await page.waitForTimeout(500); await shot(page, `b5-${name}-closed-by-${how}`)
    const r2 = await winRect(page, W.sel); const s2 = await st(page)
    check(`B5 ${name} closes by ${how}`, !r2, `window after: ${fmt(r2)}; board scrollTop ${s.sc} -> ${s2.sc}`)
    await ctx.close()
  }
})
await run('p1', async () => {
  const { ctx, page } = await boot()
  await swipe(page, -450); say('scrolled', fmt(await st(page)))
  await tapBox(page, page.locator('#sbHist')); for (const t of [0, 100, 300, 800]) { await page.waitForTimeout(t); say('after hist click +', t, 'scrollTop', (await st(page)).sc) }
  for (const d of ['Mon 13','Tue 14','Wed 15','Thu 16','Fri 17','Sat 18','Sun 19']) { await scrollTo(page, 0); await page.locator('#sbDays').getByText(d).first().click(); await page.waitForTimeout(500); say(d, 'chips', await page.evaluate(() => document.querySelectorAll('#sbBoard [data-oilsent]').length)) }
  say('placeholders', await page.evaluate(() => [...document.querySelectorAll('#sbBoard *')].filter(e => /ALL AVAIL/.test(e.textContent) && e.children.length === 0).slice(0, 6).map(e => e.tagName + '.' + e.className + ' ' + Math.round(e.getBoundingClientRect().top) + ' ' + (e.closest('[data-oilsent]') ? 'chip' : '')).join(' ; ')))
  await ctx.close()
})
await run('p2', async () => {
  const { ctx, page } = await boot()
  const info = await page.evaluate(() => { const p = [...document.querySelectorAll('#sbRoster .puck')].find(e => /ALL AVAIL/.test(e.textContent)); const r = p.getBoundingClientRect(); const tg = [...document.querySelectorAll('#sbBoard .seat, #sbBoard .sb-slot, #sbBoard [data-slot], #sbBoard [data-drop]')].filter(e => e.getBoundingClientRect().width > 0).slice(0, 12).map(e => e.tagName + '.' + e.className + '[' + (e.dataset.slot || e.dataset.drop || '') + '] ' + Math.round(e.getBoundingClientRect().top)); return { p: p.outerHTML.slice(0, 300), r: [r.left, r.top, r.width, r.height], tg } })
  say(fmt(info))
  const tgt = await page.evaluate(() => { const e = [...document.querySelectorAll('#sbBoard [data-slot^="a:"]')].find(x => !x.querySelector('.puck') && x.getBoundingClientRect().width > 0); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { s: e.dataset.slot, x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  say('empty target', fmt(tgt))
  await boxAt(page, '#sbBoard [data-slot="a:0.2.0"]', 200, 0); const dropAA = await dragPuck(page, '#sbRoster .puck.allavail', '#sbBoard [data-slot="a:0.2.0"]'); await shot(page, 'p2-held'); await page.mouse.up(); await page.waitForTimeout(600)
  say('drag result', fmt(dropAA)); await shot(page, 'p2-after-drop')
  say('chips', await page.evaluate(() => document.querySelectorAll('#sbBoard [data-oilsent]').length), 'ALL AVAIL on rows', await page.evaluate(() => [...document.querySelectorAll('#sbBoard .puck.allavail')].length))
  await ctx.close()
})
await run('b4', async () => {
  const { ctx, page } = await world(undefined, { path: '?savefail' }); await toEdit(page); await openBoard(page)
  await fullVV(page)
  const box = await boxAt(page, '#sbBoard .sb-line .nts', 250, 0)
  await tapBox(page, box); await page.keyboard.type(' x1'); await page.keyboard.press('Tab'); await page.waitForTimeout(800)
  const band = () => page.evaluate(() => { const e = [...document.querySelectorAll('.saveband')].find(x => x.getBoundingClientRect().height > 0); if (!e) return null; const r = e.getBoundingClientRect(); const t = document.querySelector('#schedBoard .sb-top').getBoundingClientRect(); const rb = [...e.querySelectorAll('button')].map(b => { const q = b.getBoundingClientRect(); return b.textContent.trim() + '@' + Math.round(q.top) + '-' + Math.round(q.bottom) }); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), barB: Math.round(t.bottom), barT: Math.round(t.top), btn: rb, hit: (() => { const q = e.querySelector('button')?.getBoundingClientRect(); if (!q) return null; const h = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return h && (h.closest('button')?.textContent || h.className) })() } })
  await scrollTo(page, 0); const b0 = await band(); say('at rest', fmt(b0), fmt(await st(page))); await shot(page, 'b4-rest')
  check('B4 band shows', !!b0, `band ${fmt(b0)}`)
  await swipe(page, -400); const b1 = await band(); const s = await st(page); say('scrolled', fmt(b1), fmt(s)); await shot(page, 'b4-scrolled')
  check('B4 band stays with the bar', b1 && b1.t >= s.topB - 40 && b1.t < s.topB + 5 && b1.hit === 'Retry', `band ${b1 && b1.t}-${b1 && b1.b}, bar foot ${s.topB}, Retry hit by ${b1 && b1.hit}`)
  await swipe(page, -1500, { steps: 30 }); const b2 = await band(); await shot(page, 'b4-far'); check('B4 band far down', b2 && b2.b > 0 && b2.hit === 'Retry', `band ${fmt(b2)}`)
  await ctx.close()
})
const jig = async (page, c, x, y, ms) => { const t0 = Date.now(); let k = 0; while (Date.now() - t0 < ms) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + (k++ % 2), id: 1 }] }); await page.waitForTimeout(30) } }
await run('b6', async () => {
  if (KIND !== 'chromium') { say('NOT WALKED B6 in WebKit: a finger drag needs touch events, which the test WebKit does not drive; walked in Chromium'); return }
  const { ctx, page } = await boot(); await fullVV(page)
  await scrollTo(page, 1500)
  const c = page.cdp, pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }]
  const a = await page.evaluate(() => { const e = document.querySelector('#sbRoster .puck.allavail'); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(a.x, a.y) })
  await page.waitForTimeout(350)
  for (let i = 1; i <= 14; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(a.x - 300 * i / 14, a.y + 90 * i / 14) }); await page.waitForTimeout(25) }
  await shot(page, 'b6-picked-up')
  await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(250, 394) }); await page.waitForTimeout(150)
  const s0 = await st(page); await shot(page, 'b6-hold-foot-start')
  await jig(page, c, 250, 394, 1500); const s1 = await st(page); await shot(page, 'b6-hold-foot-1500ms')
  check('B6 foot scrolls down', s1.sc > s0.sc + 40, 'scrollTop ' + s0.sc + ' -> ' + s1.sc + ' after 1.5s held at y 394 (touch)')
  await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(250, 30) }); await page.waitForTimeout(150)
  const s2 = await st(page); await shot(page, 'b6-hold-bar-start')
  await jig(page, c, 250, 30, 1500); const s3 = await st(page); await shot(page, 'b6-hold-bar-1500ms')
  check('B6 top (over the bar) scrolls up', s3.sc < s2.sc - 40, 'scrollTop ' + s2.sc + ' -> ' + s3.sc + ' after 1.5s held at y 30 (over the bar) (bar foot ' + s3.topB + ')')
  await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(250, 230) }); await page.waitForTimeout(400)
  await page.evaluate(() => { const b = document.querySelector('.schedboard'); const e = document.querySelector('#sbBoard [data-slot="a:0.3.0"]'); b.scrollTop += e.getBoundingClientRect().top - 230 }); await page.waitForTimeout(300)
  const tgt = await page.evaluate(() => { const c = [...document.querySelectorAll('#sbBoard [data-slot^="a:"]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top > 120 && r.bottom < 380 && r.left < 500 }); if (!c.length) return null; const e = c[0]; const r = e.getBoundingClientRect(); return { slot: e.dataset.slot, x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  say('drop target', fmt(tgt))
  if (tgt) {
    await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(tgt.x, tgt.y) }); await page.waitForTimeout(400); await shot(page, 'b6-over-target')
    const sb = await st(page)
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(800); const sa = await st(page); await shot(page, 'b6-dropped')
    const landed = await page.evaluate(slot => !!document.querySelector('#sbBoard [data-slot="' + slot + '"] .puck.allavail'), tgt.slot)
    check('B6 drop lands where it shows', landed, 'ALL AVAIL on ' + tgt.slot + ': ' + landed + '; scrollTop at drop ' + sb.sc + ' -> after ' + sa.sc)
  } else { await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); say('NOT WALKED B6 drop: no seat in the middle band') }
  await ctx.close()
})
const classMap = page => page.evaluate(() => { const m = {}; document.querySelectorAll('#sbBoard *').forEach((e, i) => { m[i] = e.className + '' }); return m })
const changed = async (page, before) => page.evaluate(b => [...document.querySelectorAll('#sbBoard *')].map((e, i) => [i, b[i], e.className + '', e.getBoundingClientRect()]).filter(x => x[1] !== x[2] && x[3].width > 0).map(x => x[2].slice(0, 40) + ' @' + Math.round(x[3].top) + '-' + Math.round(x[3].bottom)).filter(x => /wfoc/.test(x)).slice(0, 6), before)
await run('b7', async () => {
  const { ctx, page } = await boot(); await fullVV(page)
  for (const ix of [0, 1]) {
    await scrollTo(page, 4900); const before = await classMap(page); const s0 = await st(page)
    await tapBox(page, page.locator('#sbWarn .wln').nth(ix).locator('.wln-t')); await page.waitForTimeout(100); await shot(page, 'b7-warning' + ix + '-tap'); await page.waitForTimeout(900)
    const s1 = await st(page); const ch = await changed(page, before); await shot(page, 'b7-warning' + ix + '-settled')
    const m = ch.filter(x => /wfoc/.test(x)).map(x => /@(-?[0-9]+)-(-?[0-9]+)/.exec(x)).filter(Boolean).map(x => [+x[1], +x[2]])
    const ok = s1.sc < s0.sc && m.length && m.some(([t, bt]) => t >= s1.topB && bt <= 402)
    check('B7 warning ' + ix + ' lands below the bar', ok, 'scrollTop ' + s0.sc + ' -> ' + s1.sc + ', bar foot ' + s1.topB + ', marked: ' + fmt(ch))
  }
  // Undo of a change that is out of view
  await scrollTo(page, 0)
  const box = await boxAt(page, '#sbBoard .sb-line .nts', 250, 0)
  await tapBox(page, box); await page.keyboard.type(' u1'); await page.keyboard.press('Tab'); await page.waitForTimeout(700)
  const typed = await page.evaluate(() => [...document.querySelectorAll('#sbBoard .sb-line .nts')][0].value)
  say('typed remark now', typed)
  await scrollTo(page, 3000); const s0 = await st(page)
  await tapBox(page, page.locator('#sbUndo')); await page.waitForTimeout(100); await shot(page, 'b7-undo-tap'); await page.waitForTimeout(900)
  const s1 = await st(page); await shot(page, 'b7-undo-settled')
  const r = await page.evaluate(() => { const e = [...document.querySelectorAll('#sbBoard .sb-line .nts')][0]; const q = e.getBoundingClientRect(); return { t: Math.round(q.top), b: Math.round(q.bottom), v: e.value } })
  check('B7 undo brings the row back below the bar', s1.sc !== s0.sc && r.t >= s1.topB && r.b <= 402, 'scrollTop ' + s0.sc + ' -> ' + s1.sc + ', box ' + r.t + '-' + r.b + ' bar foot ' + s1.topB + ', remark now "' + r.v + '"')
  await tapBox(page, page.locator('#sbRedo')); await page.waitForTimeout(800); const s2 = await st(page); await shot(page, 'b7-redo-settled'); say('redo', fmt(s2))
  // a change in view: undo leaves the screen where it is (D672)
  await ctx.close()
})
await run('p6', async () => {
  for (const [label, vp, touch, boxsel] of [['sideways', { width: 874, height: 402 }, true], ['upright', { width: 402, height: 874 }, true], ['desktop', { width: 1100, height: 800 }, false]]) for (const kind of ['remark', 'time']) {
    const { ctx, page } = await world(vp, { touch }); await toEdit(page); await openBoard(page)
    const sel = kind === 'remark' ? '#sbBoard .sb-line .nts' : '#sbBoard .sb-line .sb-tl .tm'
    const sc = () => page.evaluate(() => { const c = [document.querySelector('.schedboard'), document.querySelector('.sb-boardwrap'), document.scrollingElement, ...document.querySelectorAll('#sbBoard, #schedBoard')].filter(Boolean); return c.map(e => Math.round(e.scrollTop)).join('/') })
    const e0 = page.locator(sel).filter({ visible: true }).first(); await e0.scrollIntoViewIfNeeded(); const bb = await e0.boundingBox()
    if (touch) await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)
    await page.keyboard.press('Control+a'); await page.keyboard.type(kind === 'remark' ? 'zz9' : '23:45'); await page.keyboard.press('Tab'); await page.waitForTimeout(700)
    await page.evaluate(() => { const c = [document.querySelector('.schedboard'), document.querySelector('.sb-boardwrap')]; c.forEach(e => { if (e && e.scrollHeight > e.clientHeight + 5) e.scrollTop = 3000 }) }); await page.waitForTimeout(400)
    const before = await sc()
    await (page.locator('#sbUndo').click()); await page.waitForTimeout(900)
    const after = await sc(); const v = await page.evaluate(s2 => [...document.querySelectorAll(s2)][0].value, sel)
    say(label, kind, 'scroll positions before undo', before, 'after', after, 'value now', v)
    await ctx.close()
  }
})
await run('p7', async () => {
  for (const [label, vp, touch] of [['sideways', { width: 874, height: 402 }, true], ['desktop', { width: 1100, height: 800 }, false]]) {
    const { ctx, page } = await world(vp, { touch }); await toEdit(page); await openBoard(page)
    const scs = () => page.evaluate(() => [document.querySelector('.schedboard'), document.querySelector('.sb-boardwrap')].map(e => e ? Math.round(e.scrollTop) : -1).join('/'))
    const e0 = page.locator('#sbBoard .sb-line [data-ldel]').filter({ visible: true }).first(); await e0.click(); await page.waitForTimeout(500)
    await shot(page, 'p7-' + label + '-after-x')
    say(label, 'after x: buttons', await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && /delete|remove|yes|confirm|cancel|keep/i.test(b.textContent)).map(b => b.textContent.trim().slice(0, 20)).join('|')))
    const nLines = () => page.evaluate(() => document.querySelectorAll('#sbBoard .sb-line [data-ldel]').length)
    const n0 = await nLines()
    await page.evaluate(() => { [document.querySelector('.schedboard'), document.querySelector('.sb-boardwrap')].forEach(e => { if (e && e.scrollHeight > e.clientHeight + 5) e.scrollTop = 3000 }) }); await page.waitForTimeout(400)
    const b4 = await scs(); await page.locator('#sbUndo').dispatchEvent('click'); await page.waitForTimeout(900)
    const aft = await scs(); const n1 = await nLines(); const s9 = await st(page)
    const pos = await page.evaluate(() => { const e = [...document.querySelectorAll('#sbBoard .sb-line')].filter(x => x.getBoundingClientRect().width > 0)[0]; const r = e.getBoundingClientRect(); return Math.round(r.top) + '-' + Math.round(r.bottom) })
    say(label, 'lines', n0, '->', n1, 'scroll before undo', b4, 'after', aft, 'first line on screen at', pos, 'bar foot', s9.topB); await shot(page, 'p7-' + label + '-after-undo')
    await ctx.close()
  }
})
await run('b8', async () => {
  const { ctx, page } = await boot(); await fullVV(page)
  await scrollTo(page, 300)
  const box = await boxAt(page, TM, 200, 1)
  await tapBox(page, box); await page.keyboard.press('Control+a'); await page.keyboard.type('15:50'); await page.keyboard.press('Tab'); await page.waitForTimeout(700)
  await tapBox(page, page.locator('#sbHist')); await page.waitForTimeout(600)
  const dots = await page.evaluate(() => [...document.querySelectorAll('[data-histdot]')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.className + '|' + (e.value || e.textContent || '').slice(0, 10))).slice(0, 5))
  say('gold-dot boxes', fmt(dots)); await shot(page, 'b8-history-on')
  const dot = page.locator('#sbBoard input.tm[data-histdot]').filter({ visible: true }).first()
  if (!(await dot.count())) { say('NOT WALKED B8: no gold dot on the changed box'); await ctx.close(); return }
  await dot.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300)
  const dr = async () => dot.evaluate(e => { const r = e.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right) } })
  const bub = () => page.evaluate(() => { const e = document.querySelector('.histbub'); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return cs.display === 'none' || cs.visibility === 'hidden' || r.width < 5 ? null : { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), pos: cs.position } })
  { const bb = await dot.boundingBox(); await page.touchscreen.tap(bb.x + bb.width - 5, bb.y + bb.height - 5) } await page.waitForTimeout(150); await shot(page, 'b8-bubble-tap'); await page.waitForTimeout(500)
  const d0 = await dr(), b0 = await bub(); say('dot box', fmt(d0), 'bubble', fmt(b0)); await shot(page, 'b8-bubble-settled')
  const phoneish = await page.evaluate(() => matchMedia('(max-width: 820px)').matches)
  check('B8 bubble shows on a tap', !!b0, 'bubble after a tap on the dot ' + fmt(b0) + ' (the tap path is for width up to 820; here ' + (phoneish ? 'it is' : 'it is NOT') + ' on)')
  if (!b0) { const bb = await dot.boundingBox(); await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.move(bb.x + bb.width / 2 + 2, bb.y + bb.height / 2 + 1); await page.waitForTimeout(500); const b0h = await bub(); say('after a hover instead:', fmt(b0h)); await shot(page, 'b8-bubble-by-hover') }
  for (const [label, dy, o] of [['slow 60px', -60, { steps: 12 }], ['flick 120px', -120, { steps: 4, gap: 8, rest: 0 }]]) {
    await swipe(page, dy, { x: 150, y: 250, ...o }); await page.waitForTimeout(100)
    const d1 = await dr(), b1 = await bub(); await shot(page, 'b8-after-' + label.split(' ')[0])
    const ok = !b1 || (b1.t <= d1.b + 60 && b1.b >= d1.t - 60 && Math.abs(b1.l - d1.l) < 300)
    check('B8 ' + label, ok, 'dot ' + fmt(d1) + ' (moved ' + (d1.t - d0.t) + '), bubble ' + (b1 ? fmt(b1) : 'closed'))
  }
  await ctx.close()
})
/* which box scrolls the board's list, and does the head stay (baselines B10-B12, and the sideways block's absence) */
const scrollInfo = page => page.evaluate(() => {
  const c = ['#schedBoard', '.schedboard', '.sb-boardwrap', '#sbBoard'].map(s => { const e = document.querySelector(s); if (!e) return null; const cs = getComputedStyle(e); return { s, oy: cs.overflowY, sh: e.scrollHeight, ch: e.clientHeight, pos: cs.position } })
  const t = document.querySelector('#schedBoard .sb-top'), ti = document.querySelector('#schedBoard .sb-title')
  return { q: matchMedia('(min-width:821px) and (pointer:coarse) and (orientation:landscape) and (max-height:500px)').matches, scrollers: [...document.querySelectorAll('#schedBoard, #schedBoard *')].filter(e => /auto|scroll/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 5 && e.clientHeight > 150).map(e => (e.id ? '#' + e.id : '.' + (e.className + '').split(' ')[0]) + ' ' + e.scrollHeight + '/' + e.clientHeight).slice(0, 4), topPos: t && getComputedStyle(t).position, topFoot: t && Math.round(t.getBoundingClientRect().bottom), titleFoot: ti && Math.round(ti.getBoundingClientRect().bottom), wide: document.querySelector('.schedboard')?.classList.contains('sb-wide') || !!document.querySelector('.sb-wide') }
})
const scrollList = async page => { await page.evaluate(() => { const l = [...document.querySelectorAll('#schedBoard, #schedBoard *')].filter(e => /auto|scroll/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 5 && e.clientHeight > 150 && !e.closest('.sb-side')); if (l[0]) l[0].scrollTop = 700; window.__sl = l[0] && ((l[0].className || l[0].id) + ' -> ' + l[0].scrollTop) }); say('list scrolled:', await page.evaluate(() => window.__sl)); await page.waitForTimeout(400) }
for (const [id, label, vp, touch] of [['b10', 'phone upright 402x874', { width: 402, height: 874 }, true], ['b11', 'desktop mouse 874x402', { width: 874, height: 402 }, false], ['b12', 'tablet on its side 1180x820', { width: 1180, height: 820 }, true], ['b11b', 'desktop mouse 1000x400', { width: 1000, height: 400 }, false]]) {
  await run(id, async () => {
    const { ctx, page } = await world(vp, { touch, fake: false }); await toEdit(page); await openBoard(page)
    const a = await scrollInfo(page); await shot(page, id + '-rest'); await scrollList(page); const b = await scrollInfo(page); await shot(page, id + '-list-scrolled')
    say(label, 'rest', fmt(a), 'scrolled', fmt(b))
    check(id.toUpperCase() + ' ' + label, a.q === false && b.titleFoot > 0 && b.topFoot === a.topFoot, 'sideways query ' + a.q + ', the head stays (title foot ' + b.titleFoot + ', top foot ' + a.topFoot + ' -> ' + b.topFoot + '), the box that scrolls: ' + b.scrollers.join(','))
    await ctx.close()
  })
}
await run('p8', async () => {
  const { ctx, page } = await world({ width: 402, height: 874 }, { fake: false }); await toEdit(page); await openBoard(page)
  await tapBox(page, page.locator('#sbMore')); await page.waitForTimeout(400); await shot(page, 'p8-more-open')
  say('items', fmt(await page.evaluate(() => [...document.querySelectorAll('#sbMoreMenu .sb-moreitem')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.id || '') + '|' + (e.className + '').slice(0, 30) + '|' + (e.getAttribute('title') || '') + '|' + e.textContent.trim().slice(0, 30)))))
  await ctx.close()
})
await run('b13', async () => {
  const { ctx, page } = await world({ width: 402, height: 874 }, { fake: false }); await toEdit(page); await openBoard(page)
  await tapBox(page, page.locator('#sbMore')); await page.waitForTimeout(300); await tapBox(page, page.locator('#sbMoreWide')); await page.waitForTimeout(800)
  await shot(page, 'b13-portrait-wide-on')
  const w0 = await scrollInfo(page); say('portrait, desktop layout on', fmt(w0))
  await page.setViewportSize({ width: 874, height: 402 }); await page.waitForTimeout(1000); await shot(page, 'b13-turned-sideways-wide')
  const a = await scrollInfo(page); say('turned sideways', fmt(a))
  const pos = await page.evaluate(() => { const t = document.querySelector('#schedBoard .sb-top'); const b = document.querySelector('.schedboard'); return { topPos: getComputedStyle(t).position, boardOy: getComputedStyle(b).overflowY, wideAnywhere: [...document.querySelectorAll('[class*=sb-wide]')].map(e => e.className.slice(0, 40)).slice(0, 3) } })
  say('block check', fmt(pos))
  await page.evaluate(() => { for (const e of document.querySelectorAll('#schedBoard, #schedBoard *')) { if (/auto|scroll/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 5 && e.clientHeight > 100) e.scrollTop = 500 } }); await page.waitForTimeout(500)
  const b = await scrollInfo(page); await shot(page, 'b13-wide-scrolled')
  check('B13 the desktop layout keeps its own scroller (head not scrolled away)', a.q && pos.wideAnywhere.length > 0 && b.titleFoot > 0, 'sideways query ' + a.q + ', sb-wide classes ' + fmt(pos.wideAnywhere) + ', top position ' + pos.topPos + ', title foot after a scroll ' + b.titleFoot + ', scrollers ' + b.scrollers.join(','))
  await page.setViewportSize({ width: 402, height: 874 }); await page.waitForTimeout(800); await tapBox(page, page.locator('#sbMore')); await page.waitForTimeout(300); await tapBox(page, page.locator('#sbMoreWide')); await page.waitForTimeout(800)
  const c = await scrollInfo(page); await shot(page, 'b13-switched-back'); say('switched back', fmt(c))
  await page.setViewportSize({ width: 874, height: 402 }); await page.waitForTimeout(1000); await shot(page, 'b13-sideways-again')
  const d = await scrollInfo(page); const s0 = await st(page).catch(() => null)
  check('B13 back to normal sideways', d.q && !c.wide, 'wide after switching back ' + c.wide + '; sideways again ' + fmt(d) + ' ' + fmt(s0))
  await ctx.close()
})
await run('extra', async () => {
  const { ctx, page } = await boot()
  const m = async (label) => { const x = await st(page); say(label, 'top foot', x.topB, 'scrollTop', x.sc, 'title foot', x.titleB); return x }
  const r0 = await m('rest'); await swipe(page, -400); const sc0 = await m('scrolled 1')
  check('X sideways first time', r0.topB > 100 && Math.abs(sc0.topB - 51) <= 6, 'rest foot ' + r0.topB + ', scrolled foot ' + sc0.topB)
  await page.setViewportSize({ width: 402, height: 874 }); await page.waitForTimeout(900); await shot(page, 'x-turned-upright')
  const up = await scrollInfo(page); say('upright', fmt(up))
  await page.setViewportSize({ width: 874, height: 402 }); await page.waitForTimeout(900); await shot(page, 'x-turned-back-rest')
  const r1 = await m('turned back'); await scrollTo(page, 0); await swipe(page, -400); const sc1 = await m('scrolled after turn'); await shot(page, 'x-turned-back-scrolled')
  check('X turned and back', Math.abs(sc1.topB - 51) <= 6 && (await page.evaluate(q => matchMedia(q).matches, SIDEWAYS)), 'scrolled foot ' + sc1.topB + ' (after turn: rest foot ' + r1.topB + ')')
  await scrollTo(page, 0); await tapBox(page, page.locator('#sbDone')); await page.waitForTimeout(800); await shot(page, 'x-after-done')
  await openBoard(page); const r2 = await m('reopened'); await shot(page, 'x-reopened-rest'); await swipe(page, -400); const sc2 = await m('reopened scrolled'); await shot(page, 'x-reopened-scrolled')
  check('X closed and reopened', r2.topB > 100 && Math.abs(sc2.topB - 51) <= 6 && sc2.max > 1000, 'rest foot ' + r2.topB + ', scrolled foot ' + sc2.topB + ', page errs ' + page.errs.length)
  await scrollTo(page, 0)
  // a day change turns the phone also with keys up? (keys up while turning is not drivable: his iPhone)
  await ctx.close()
})
await run('round', async () => {
  const { ctx, page } = await boot(); await fullVV(page)
  const bar = async (label) => { const x = await st(page); const lk = await leak(page); const ok = lk.nbad === 0 && Math.abs(x.topB - 51) <= 6 || x.sc === 0; say('  [' + label + '] scrollTop', x.sc, 'top foot', x.topB, 'bar clean', lk.nbad === 0, 'errs', page.errs.length); return ok }
  const lines = () => page.evaluate(() => document.querySelectorAll('#sbBoard .sb-line [data-ldel]').length)
  // type times and remarks with the keys up
  await scrollTo(page, 300); let box = await boxAt(page, TM, 330, 0)
  await tapBox(page, box); await keysUp(page); await page.waitForTimeout(700)
  await page.keyboard.press('Control+a'); await page.keyboard.type('13:10'); await shotBoth(page, 'round-type-time')
  const v1 = await page.evaluate(() => document.activeElement.value); const foc = await activeRect(page)
  check('R type a time, keys up', v1 === '13:10' && foc.b <= 202, 'typed value ' + v1 + ', box foot ' + foc.b + ' (keys top ' + (await st(page)).vvh + ')'); await page.keyboard.press('Tab')
  const rm = await boxAt(page, '#sbBoard .sb-line .nts', 330, 0); await tapBox(page, rm); await page.waitForTimeout(700); await page.keyboard.type(' walk'); await shotBoth(page, 'round-type-remark')
  const foc2 = await activeRect(page); const v2 = await page.evaluate(() => document.activeElement.value)
  check('R type a remark, keys up', /walk$/.test(v2) && foc2.b <= 202, 'value "' + v2 + '", box foot ' + foc2.b)
  await page.evaluate(() => document.activeElement.blur()); await keysDown(page); await page.waitForTimeout(500); await bar('after typing')
  // + Line
  const n0 = await lines(); const addl = page.locator('#sbBoard .mbtn', { hasText: '+ Line' }).filter({ visible: true }).first()
  if (await addl.count()) { await addl.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); await tapBox(page, addl); await page.waitForTimeout(100); await shot(page, 'round-addline-tap'); await page.waitForTimeout(500); await shot(page, 'round-addline-settled'); const n1 = await lines(); check('R + Line', n1 === n0 + 1, 'lines ' + n0 + ' -> ' + n1); await bar('after + Line') } else say('NOT WALKED + Line: not found in view')
  // x a line
  const del = page.locator('#sbBoard .sb-line [data-ldel]').filter({ visible: true }).first(); await del.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300)
  const n2 = await lines(); await tapBox(page, del); await page.waitForTimeout(100); await shot(page, 'round-x-tap'); await page.waitForTimeout(600); await shot(page, 'round-x-settled'); const n3 = await lines(); check('R x a line', n3 === n2 - 1, 'lines ' + n2 + ' -> ' + n3); await bar('after x')
  await tapBox(page, page.locator('#sbUndo')); await page.waitForTimeout(100); await shot(page, 'round-undo-tap'); await page.waitForTimeout(600); await shot(page, 'round-undo-settled'); const n4 = await lines(); check('R Undo', n4 === n3 + 1, 'lines ' + n3 + ' -> ' + n4)
  await tapBox(page, page.locator('#sbRedo')); await page.waitForTimeout(100); await shot(page, 'round-redo-tap'); await page.waitForTimeout(600); await shot(page, 'round-redo-settled'); const n5 = await lines(); check('R Redo', n5 === n4 - 1, 'lines ' + n4 + ' -> ' + n5); await bar('after redo')
  await tapBox(page, page.locator('#sbUndo')); await page.waitForTimeout(500)
  say('the board bar has no ⋯ sideways:', await page.locator('#sbMore').isVisible())
  // + Wave
  const wv = page.locator('[data-wvadd]').filter({ visible: true }).first()
  if (await wv.count()) { await wv.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); await tapBox(page, wv); await page.waitForTimeout(100); await shot(page, 'round-wave-tap'); await page.waitForTimeout(500); await shot(page, 'round-wave-settled'); await bar('+ Wave open'); await page.keyboard.press('Escape'); await page.waitForTimeout(300); await shot(page, 'round-wave-closed') } else say('NOT WALKED + Wave: [data-wvadd] not found in view')
  await scrollTo(page, 600)
  for (const [name, sel] of [['templates', '#sbTpl'], ['history', '#sbHist'], ['insights', '#sbInsights']]) {
    await tapBox(page, page.locator(sel)); await page.waitForTimeout(100); await shot(page, 'round-' + name + '-tap'); await page.waitForTimeout(500); await shot(page, 'round-' + name + '-settled')
    const o = await snap(page); const lk = await leak(page); say(name, 'opened; windows', Object.entries(o).slice(-2).map(([k, v]) => k.slice(0, 20) + ' ' + v.slice(0, 4)).join(' ; '), 'bar clean', lk.nbad === 0)
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    if (name === 'history') { await tapBox(page, page.locator('#sbHist')).catch(() => {}); await page.waitForTimeout(300) }
    if (name === 'templates') await page.touchscreen.tap(300, 250)
    await page.waitForTimeout(300); await shot(page, 'round-' + name + '-closed')
  }
  await scrollTo(page, 0); await tapBox(page, page.locator('#sbDone')); await page.waitForTimeout(800); await shot(page, 'round-done')
  const hidden = await page.evaluate(() => document.querySelector('#schedBoard').hidden || getComputedStyle(document.querySelector('#schedBoard')).display === 'none')
  check('R Done closes the board', hidden, 'board hidden ' + hidden + ', page errs ' + page.errs.length + ' ' + page.errs.join(' | ').slice(0, 150))
  await ctx.close()
})
await run('p3', async () => {
  for (const [label, vp, touch] of [['sideways', { width: 874, height: 402 }, true], ['desktop-mouse-874x402', { width: 874, height: 402 }, false], ['tablet-1180x820', { width: 1180, height: 820 }, true]]) {
    const { ctx, page } = await world(vp, { touch }); await toEdit(page); await openBoard(page)
    const s = await st(page)
    await page.locator('#sbHist').click(); await page.waitForTimeout(500)
    const r = await winRect(page, '.chgwin:not([hidden])')
    await page.keyboard.press('Escape'); await page.waitForTimeout(400)
    const r2 = await winRect(page, '.chgwin:not([hidden])')
    say(label, 'at rest bar foot', s.topB, 'chg window', fmt(r), 'after Escape', fmt(r2))
    await ctx.close()
  }
})
await browser.close()
