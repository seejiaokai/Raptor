/* Walker L (8 Nov 26): [LW-PIN-LAST-FRAME] the Leave War's pinned dates row. One file, steps picked with ONLY=a,b.
   Run from raptor-port/: HP_URL=http://localhost:4393 ONLY=probe node scripts/handpass/lwpin-walk-l.mjs */
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, appendFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { chromium, webkit } from '@playwright/test'
process.env.HP_URL ||= 'http://localhost:4393'
const { BASE, login, go } = await import('./lib.mjs')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '../../docs/img/handpass/2026-11-08-lw-pin-last-frame/walk/L')
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/ba46d636af5eaefe/bfddd1cb-8b24-453c-b9e5-f54c2d5dd233/scratchpad/walkL'
mkdirSync(OUT, { recursive: true }); mkdirSync(SCR, { recursive: true })
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean), want = k => ONLY.includes(k)
if (process.env.CLEAN) for (const f of (await import('node:fs')).readdirSync(OUT)) rmSync(resolve(OUT, f))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const sleep = ms => new Promise(r => setTimeout(r, ms))
console.log('lwpin-walk-l v1', new Date().toISOString(), BASE, 'ONLY=' + ONLY.join(','))
const RES = resolve(SCR, 'results.jsonl')
const rec = (id, verdict, note, pics = []) => { const l = JSON.stringify({ id, verdict, note, pics }); appendFileSync(RES, l + '\n'); console.log(verdict.padEnd(10), id, '|', note, '|', pics.join(',')) }
const ERRORS = []
const PC = { width: 1536, height: 864 }, PH = { width: 402, height: 874 }
let CH, WK
const getCh = async () => CH ||= await chromium.launch({ headless: true, ...launchOptions })
const getWk = async () => WK ||= await webkit.launch({ headless: true })

/* a world: fresh context, signed in, on the Leave War grid */
async function world({ vp, touch = false, who = 'a', engine = 'ch', url = '/', reduce = false, scale, init } = {}) {
  const b = engine === 'wk' ? await getWk() : await getCh()
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: scale || (touch ? 2 : 1), ...(touch ? { isMobile: true, hasTouch: true } : {}), ...(reduce ? { reducedMotion: 'reduce' } : {}) })
  const page = await ctx.newPage()
  const tag = `${engine}${vp.width}`
  page.on('pageerror', e => ERRORS.push(`[${tag}] PAGEERROR ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') ERRORS.push(`[${tag}] console ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) ERRORS.push(`[${tag}] HTTP ${r.status()} ${r.url()}`) })
  if (init) await page.addInitScript(init)
  await page.goto(BASE + url)
  await login(page, who)
  await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' })
  const w = { ctx, page, vp, touch, engine, cdp: engine === 'ch' ? await ctx.newCDPSession(page) : null, who }
  await openGrid(w)
  return w
}
async function openGrid(w) {
  const P = w.page
  await go(P, 'leavewar'); await P.waitForSelector('[data-testid^="month-"]'); await sleep(900)
  if (await P.locator('[data-testid="lw-tab-grid"]').count()) { await P.locator('[data-testid="lw-tab-grid"]').click(); await sleep(300) }
  await P.evaluate(() => scrollTo(0, 0)); await sleep(600)
}
const GEO = () => {
  const tb = document.querySelector('.topbar').getBoundingClientRect()
  const head = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed'))
  const hr = head.getBoundingClientRect(), pin = document.querySelector('[data-testid="sticky-head"]'), pr = pin && pin.getBoundingClientRect()
  const cs = pin && getComputedStyle(pin)
  return { y: scrollY, tb: tb.bottom, S: +(scrollY + hr.top - tb.bottom).toFixed(2), headTop: hr.top, headH: hr.height,
    maxY: document.documentElement.scrollHeight - innerHeight,
    pin: pr && { top: pr.top, h: pr.height, w: pr.width, left: pr.left, op: +cs.opacity, vis: cs.visibility, inert: pin.inert, up: pin.classList.contains('up'), cls: pin.className } }
}
const geo = w => w.page.evaluate(GEO)
const shown = g => !!g.pin && g.pin.op > 0.5 && g.pin.vis !== 'hidden'
const fmt = g => `y=${g.y.toFixed(2)} S=${g.S} tb=${g.tb.toFixed(1)} pinTop=${g.pin ? g.pin.top.toFixed(1) : 'none'} op=${g.pin?.op} vis=${g.pin?.vis} headTop=${g.headTop.toFixed(1)}`
async function scrollTo_(w, y) { await w.page.evaluate(y => scrollTo(0, y), y); await sleep(450) }
let picN = 0
const pic = async (w, name, opts = {}) => {
  const f = `${name}.png`; await w.page.screenshot({ path: resolve(OUT, f), ...opts }); return f
}
const RDY = w => w.page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
async function finger(w, x0, y0, x1, y1, steps = 12, rest = 90) {
  const c = w.cdp
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] })
  for (let i = 1; i <= steps; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / steps, y: y0 + (y1 - y0) * i / steps }] }); await sleep(16) }
  await sleep(rest)
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
const isPh = w => w.vp.width < 700

/* screencast frames of an action; each frame is {data,y,t} */
async function cast(w, fn) {
  const frames = []
  w.cdp.on('Page.screencastFrame', async f => { frames.push({ data: f.data, y: f.metadata.scrollOffsetY, dw: f.metadata.deviceWidth, t: f.metadata.timestamp }); try { await w.cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }) } catch {} })
  const k = w.touch ? 2 : 1
  await w.cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: w.vp.width * k, maxHeight: w.vp.height * k }); await sleep(300)
  await fn(); await sleep(700)
  await w.cdp.send('Page.stopScreencast'); w.cdp.removeAllListeners('Page.screencastFrame')
  return frames
}
/* a contact sheet of the top band of some frames */
async function sheet(name, frames, band, z, labels) {
  const b = await getCh(); const ctx = await b.newContext({ viewport: { width: 1100, height: 400 } }), p = await ctx.newPage()
  await p.setContent(`<html><body style="margin:0;background:#0b0f14;color:#e8edf2;font:600 12px system-ui;display:flex;flex-wrap:wrap;gap:6px;padding:6px">${frames.map((f, i) => `
    <div><div>${labels ? labels[i] : ''}</div><div style="border:1px solid #2a323b;width:${band.w * z}px;height:${band.h * z}px;overflow:hidden;position:relative">
    <img src="data:image/png;base64,${f.data}" style="position:absolute;left:0;top:0;transform-origin:0 0;transform:translate(${-band.x * z}px,${-band.y * z}px) scale(${z / (f.s || 1)})"></div></div>`).join('')}</body></html>`)
  await sleep(300)
  await p.setViewportSize({ width: 1100, height: await p.evaluate(() => document.body.scrollHeight) })
  await p.screenshot({ path: resolve(OUT, `${name}.png`), fullPage: true }); await ctx.close()
  return `${name}.png`
}

const STEPS = {}
/* ---------- probe ---------- */
STEPS.probe = async () => {
  for (const [nm, vp, touch] of [['pc', PC, false], ['ph', PH, true]]) {
    const w = await world({ vp, touch })
    const g = await geo(w)
    console.log(nm, fmt(g), JSON.stringify(g.pin))
    const info = await w.page.evaluate(() => {
      const q = s => [...document.querySelectorAll(s)].slice(0, 6).map(e => `${e.tagName}.${e.className}[${e.getAttribute('data-testid') || ''}] ${e.textContent.trim().slice(0, 25)}`)
      return { tabs: q('[data-testid^="lw-tab"]'), top: q('.topbar button, .topbar [data-testid]'), heads: q('#page-leavewar tbody.mxhead th'), datecells: q('#page-leavewar tbody.mxhead td'), sticky: q('[data-testid="sticky-head"] th, [data-testid="sticky-head"] td'), cells: q('#page-leavewar [data-testid^="cell-"]'), man: q('#page-leavewar [data-testid*="anning"]'), tbodies: q('#page-leavewar tbody') , undo: q('[data-testid*="undo"],[data-testid*="redo"]'), pers: q('[data-testid^="person-"]') }
    })
    console.log(JSON.stringify(info, null, 1))
    await pic(w, `probe-${nm}`)
    await w.ctx.close()
  }
}

/* in-page frame logger: each rAF records whether the real row is under the bar and whether the copy is shown, and its top */
const LOGGER = () => {
  window.__fr = []; window.__on = true
  const tick = () => {
    const tb = document.querySelector('.topbar').getBoundingClientRect().bottom
    const head = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed'))
    const pin = document.querySelector('[data-testid="sticky-head"]'), cs = getComputedStyle(pin), pr = pin.getBoundingClientRect()
    window.__fr.push({ y: scrollY, under: head.getBoundingClientRect().top < tb - 0.5, shown: +cs.opacity > 0.5 && cs.visibility !== 'hidden', pinTop: pr.top, tb })
    if (window.__on) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
const summarise = fr => {
  const miss = fr.filter(f => f.under && !f.shown), early = fr.filter(f => !f.under && f.shown), off = fr.filter(f => f.shown && Math.abs(f.pinTop - f.tb) > 1)
  return { frames: fr.length, rowUnderCopyHidden: miss.length, copyShownRowBelow: early.length, copyOffBarFoot: off.length, firstMiss: miss[0] && miss[0].y.toFixed(1), firstEarly: early[0] && early[0].y.toFixed(1) }
}
async function logOn(w) { await w.page.evaluate(LOGGER) }
async function logOff(w) { await sleep(150); return w.page.evaluate(() => { window.__on = false; return window.__fr }) }
const SZ = [['pc1536', PC, false], ['ph402', PH, true]]
const ok = (c) => c ? 'PASS' : 'FAIL'
const clip = (vp, h = 300) => ({ clip: { x: 0, y: 0, width: vp.width, height: h } })

STEPS.l1 = async () => {
  for (const [nm, vp, touch] of SZ) {
    const w = await world({ vp, touch, reduce: true })
    const g0 = await geo(w), S = g0.S, rows = []
    const pics = []
    for (const [lab, y] of [['top', 0], ['justabove', S - 3], ['justpast', S + 3], ['wellpast', S + 250], ['back', 0]]) {
      await scrollTo_(w, y); const g = await geo(w); rows.push({ lab, y: g.y, shown: shown(g), op: g.pin.op, top: g.pin.top, tb: g.tb })
      pics.push(await pic(w, `L1-${nm}-${lab}`, clip(vp, 330)))
    }
    const pass = !rows[0].shown && !rows[1].shown && rows[2].shown && rows[3].shown && !rows[4].shown && Math.abs(rows[2].top - rows[2].tb) < 1 && Math.abs(rows[3].top - rows[3].tb) < 1
    rec(`L1 ${nm} reduce-motion`, ok(pass), `S=${S}; ` + rows.map(r => `${r.lab}: y=${r.y} shown=${r.shown} op=${r.op} pinTop=${r.top.toFixed(1)} bar=${r.tb.toFixed(1)}`).join('; '), pics)
    await w.ctx.close()
  }
}
STEPS.l3 = async () => {
  const w = await world({ vp: PC }); const P = w.page
  await P.evaluate(() => scrollTo(0, 0)); await sleep(400)
  const inside = () => P.evaluate(() => { const a = document.activeElement; return { in: !!(a && a.closest && a.closest('[data-testid="sticky-head"]')), tag: a ? a.tagName + '.' + (a.className || '').toString().slice(0, 20) + '[' + (a.getAttribute && a.getAttribute('data-testid') || '') + ']' : null, y: scrollY } })
  await P.evaluate(() => { const gb = document.querySelector('[data-testid="lw-tab-grid"]'); gb && gb.focus() })
  const seen = []; let anyIn = false, hiddenSteps = 0, hiddenNotInert = 0, shownSteps = 0
  const state = () => P.evaluate(() => { const e = document.querySelector('[data-testid="sticky-head"]'), cs = getComputedStyle(e); return { shown: +cs.opacity > 0.5 && cs.visibility !== 'hidden', inert: e.inert } })
  for (let i = 0; i < 70; i++) { await P.keyboard.press('Tab'); const r = await inside(); const st = await state(); if (!st.shown) { hiddenSteps++; if (!st.inert) hiddenNotInert++; if (r.in) anyIn = true } else shownSteps++; seen.push(r.tag) }
  const g = await geo(w)
  const pic1 = await pic(w, 'L3-pc-tabbed-hidden')
  rec('L3 pc Tab through the page (copy hidden steps)', ok(!anyIn && hiddenNotInert === 0 && hiddenSteps > 5), `70 Tabs from the Grid tab (the page scrolled as focus moved, ending y=${g.y.toFixed(0)}); steps with the copy hidden: ${hiddenSteps}, of those not inert: ${hiddenNotInert}, focus inside the copy while hidden: ${anyIn}; steps with it shown: ${shownSteps}; last stops: ${seen.slice(-4).join(' > ')}`, [pic1])
  await P.evaluate(() => scrollTo(0, 0)); await scrollTo_(w, g.S + 200); const g2 = await geo(w)
  await P.evaluate(() => { document.activeElement && document.activeElement.blur(); const gb = document.querySelector('[data-testid="lw-tab-grid"]'); gb && gb.focus() })
  const seen2 = []; let anyIn2 = 0
  for (let i = 0; i < 40; i++) { await P.keyboard.press('Tab'); const r = await inside(); if (r.in) anyIn2++; seen2.push(r.tag) }
  const hiddenAfterTabs = await state()
  await scrollTo_(w, g.S + 200)
  const aria = await P.locator('[data-testid="sticky-head"]').ariaSnapshot().catch(e => 'ariaSnapshot failed: ' + e.message)
  const ariaReal = await P.locator('#page-leavewar tbody.mxhead').first().ariaSnapshot().catch(() => 'n/a')
  const hidden = await P.evaluate(() => { const e = document.querySelector('[data-testid="sticky-head"]'); return { inert: e.inert, ariaHidden: e.getAttribute('aria-hidden'), role: e.getAttribute('role') } })
  writeFileSync(resolve(SCR, 'L3-aria.txt'), 'COPY pinned:\n' + aria + '\n\nREAL first mxhead:\n' + ariaReal)
  const pic2 = await pic(w, 'L3-pc-tabbed-pinned')
  rec('L3 pc past T (RECORD)', 'RECORDED', `past T (y=${g2.y.toFixed(0)}, shown=${shown(g2)}) copy inert=${g2.pin.inert}; after 40 Tabs from there the page had scrolled back (copy shown=${hiddenAfterTabs.shown} inert=${hiddenAfterTabs.inert}); then scrolled past T again for the tree: copy inert=${hidden.inert} aria-hidden=${hidden.ariaHidden}; 40 Tabs reached inside the copy ${anyIn2} times; stops: ${seen2.slice(0, 10).join(' > ')}; copy's accessible tree ${aria.split('\n').length} lines (${aria.replace(/\s+/g, ' ').slice(0, 140)}); real row's tree ${ariaReal.split('\n').length} lines`, [pic2])
  await w.ctx.close()
}
STEPS.height = async () => {
  const out = []; let diff = false
  for (const [nm, vp, touch, eng] of [['pc1536', PC, false, 'ch'], ['ph402-chromium', PH, true, 'ch'], ['ph402-webkit', PH, true, 'wk']]) {
    const w = await world({ vp, touch, engine: eng }); const g0 = await geo(w)
    await w.page.evaluate(y => scrollTo(0, y), g0.S + 150); await sleep(500); const g = await geo(w)
    out.push(`${nm}: copy h=${g.pin.h} real row h=${g.headH} (copy shown=${shown(g)})`)
    if (Math.abs(g.pin.h - g.headH) > 0.6) diff = true
    out.push(await pic(w, `Lheight-${nm}`, clip(vp, 260)))
    await w.ctx.close()
  }
  rec('L-height', diff ? 'FAIL' : 'PASS', out.filter(x => !x.endsWith('.png')).join('; '), out.filter(x => x.endsWith('.png')))
}
STEPS.l11 = async () => {
  for (const [nm, sc, eng] of [['ph402-scale2-ch', 2, 'ch'], ['ph402-scale3-ch', 3, 'ch'], ['ph402-scale2-wk', 2, 'wk'], ['ph402-scale3-wk', 3, 'wk']]) {
    const w = await world({ vp: PH, touch: true, scale: sc, engine: eng }); const P = w.page
    const g0 = await geo(w), S = g0.S, rows = [], pics = []
    for (const d of [-1, -0.75, -0.5, -0.25, 0, 1]) {
      await P.evaluate(y => scrollTo(0, y), S + d); await sleep(400); const g = await geo(w)
      rows.push({ d, y: g.y, shown: shown(g), top: g.pin.top, tb: g.tb, headTop: g.headTop })
      if (d === -0.25 || d === 0 || d === 1) pics.push(await pic(w, `L11-${nm}-T${d >= 0 ? 'plus' : 'minus'}${Math.abs(d)}`, clip(PH, 200)))
    }
    rec(`L11 ${nm} fractional seam (default zoom)`, 'RECORDED', rows.map(r => `T${r.d >= 0 ? '+' : ''}${r.d}: reached y=${r.y.toFixed(3)} (row ${r.headTop.toFixed(2)} vs bar ${r.tb.toFixed(2)}) copy shown=${r.shown} pinTop=${r.top.toFixed(2)}`).join('; '), pics)
    await w.ctx.close()
  }
}


STEPS.inertchk = async () => {
  for (const [nm, vp, touch] of SZ) {
    const w = await world({ vp, touch }); const g0 = await geo(w); const out = []
    for (const d of [20, 40, 200, 600]) {
      await w.page.evaluate(y => scrollTo(0, y), g0.S + d); await sleep(150); let g = await geo(w)
      const a = `T+${d}@150ms: shown=${shown(g)} inert=${g.pin.inert} up=${g.pin.up}`
      await sleep(700); g = await geo(w)
      out.push(a + ` | @850ms: inert=${g.pin.inert} up=${g.pin.up}`)
      await w.page.evaluate(() => scrollTo(0, 0)); await sleep(400)
    }
    console.log(nm, out.join('\n   '))
    await w.ctx.close()
  }
}


const gapOf = g => g.pin ? +(g.pin.top - g.tb).toFixed(2) : null
STEPS.lfoot = async () => {
  for (const [nm, vp, touch, eng] of [['pc1536-ch', PC, false, 'ch'], ['ph402-ch', PH, true, 'ch'], ['ph402-wk', PH, true, 'wk']]) {
    const w = await world({ vp, touch, engine: eng }); const P = w.page; const g0 = await geo(w); const pics = [], notes = []
    // to the foot: hard flick / fast wheel from the top
    if (eng === 'ch' && touch) { for (let i = 0; i < 40; i++) { await finger(w, 200, 800, 200, 100, 6, 0); const y = await P.evaluate(() => scrollY); if (y >= g0.maxY - 1) break } await sleep(500) }
    else if (eng === 'ch') { for (let i = 0; i < 60; i++) { await P.mouse.wheel(0, 400); await sleep(25) } await sleep(600) }
    else { await P.evaluate(() => scrollTo(0, 1e6)); await sleep(500) }   // WebKit's scripted touches drive no scroll
    let g = await geo(w)
    notes.push(`at the foot: y=${g.y.toFixed(1)} of max ${g.maxY.toFixed(1)}, copy shown=${shown(g)} pinTop=${g.pin.top.toFixed(2)} bar=${g.tb.toFixed(2)} gap=${gapOf(g)}`)
    const atFoot = g.y >= g.maxY - 1
    pics.push(await pic(w, `Lfoot-${nm}-1-foot`, clip(vp, 260)))
    const ok1 = atFoot && shown(g) && Math.abs(gapOf(g)) <= 1
    // the bar out of place for a moment
    await P.evaluate(() => { document.querySelector('.topbar').style.transform = 'translateY(-90px)'; window.dispatchEvent(new Event('resize')) })
    await sleep(100); const gm = await geo(w); notes.push(`bar carried off (during): bar foot=${gm.tb.toFixed(1)} copy shown=${shown(gm)} pinTop=${gm.pin.top.toFixed(1)}`)
    pics.push(await pic(w, `Lfoot-${nm}-2-bar-off`, clip(vp, 260)))
    await sleep(600)
    await P.evaluate(() => { document.querySelector('.topbar').style.transform = '' }); await sleep(50)
    g = await geo(w); notes.push(`bar put back, 50ms: shown=${shown(g)} pinTop=${g.pin.top.toFixed(2)} bar=${g.tb.toFixed(2)} gap=${gapOf(g)}`)
    pics.push(await pic(w, `Lfoot-${nm}-3-bar-back-50ms`, clip(vp, 260)))
    await sleep(700); g = await geo(w); const gap2 = gapOf(g)
    notes.push(`bar back, settled, no scroll: y=${g.y.toFixed(1)} shown=${shown(g)} pinTop=${g.pin.top.toFixed(2)} bar=${g.tb.toFixed(2)} gap=${gap2}`)
    pics.push(await pic(w, `Lfoot-${nm}-4-bar-back-settled`, clip(vp, 260)))
    const ok2 = shown(g) && Math.abs(gap2) <= 1
    // back up to T + 40
    if (eng === 'ch' && touch) { for (let i = 0; i < 60; i++) { const y = await P.evaluate(() => scrollY); if (y <= g0.S + 120) break; await finger(w, 200, 150, 200, 700, 6, 0) } await sleep(400) }
    else if (eng === 'ch') { for (let i = 0; i < 80; i++) { const y = await P.evaluate(() => scrollY); if (y <= g0.S + 120) break; await P.mouse.wheel(0, -300); await sleep(25) } await sleep(400) }
    await P.evaluate(y => scrollTo(0, y), g0.S + 40); await sleep(500)
    g = await geo(w); notes.push(`back at T+40: y=${g.y.toFixed(1)} shown=${shown(g)} gap=${gapOf(g)}`)
    pics.push(await pic(w, `Lfoot-${nm}-5-T+40`, clip(vp, 260)))
    const ok3 = shown(g) && Math.abs(gapOf(g)) <= 1
    rec(`L-foot ${nm}`, ok(ok1 && ok2 && ok3), notes.join('; ') + (atFoot ? '' : ' (DID NOT REACH THE FOOT)') + '; the PC has no bounce - his iPhone is the look for the bounce itself', pics)
    await w.ctx.close()
  }
}
STEPS.l10 = async () => {
  for (const [nm, vp, touch] of SZ) {
    const w = await world({ vp, touch }); const P = w.page; const g0 = await geo(w); const S = g0.S
    const runs = []; let sheetPic = null
    for (let run = 0; run < 5; run++) for (const dir of ['down', 'up']) {
      const start = dir === 'down' ? 0 : Math.min(g0.maxY, S + (touch ? 420 : 260))
      await P.evaluate(y => scrollTo(0, y), start); await sleep(600); await logOn(w)
      let frames
      const act = async () => {
        if (touch) { dir === 'down' ? await finger(w, 200, 760, 200, 260, 12, 90) : await finger(w, 200, 260, 200, 760, 12, 90) }
        else for (let i = 0; i < 4; i++) { await P.mouse.wheel(0, dir === 'down' ? 100 : -100); await sleep(80) }
      }
      if (run === 0) { frames = await cast(w, async () => { await act() }) } else await act()
      await sleep(300); const fr = await logOff(w); const sm = summarise(fr)
      runs.push({ dir, run, ...sm })
      if (run === 0 && frames) {
        const k = touch ? 2 : 1; const near = frames.filter(f => f.y >= S - 60 && f.y <= S + 60).slice(0, 18)
        if (near.length) sheetPic = await sheet(`L10-${nm}-${dir}`, near.map(f => ({ ...f, s: f.dw ? (f.dw / vp.width) : k })), { x: 0, y: touch ? 20 : 30, w: Math.min(vp.width, 600), h: 110 }, touch ? 0.8 : 0.9, near.map(f => 'y=' + f.y.toFixed(1)))
      }
    }
    const bad = runs.filter(r => r.rowUnderCopyHidden || r.copyShownRowBelow || r.copyOffBarFoot)
    rec(`L10 ${nm} fast crossing + reversal x5`, ok(bad.length === 0), `10 runs (5 down, 5 up), in-page rAF frames ${runs.map(r => r.frames).join('/')}; frames with the real row under the bar and the copy not shown: ${runs.map(r => r.rowUnderCopyHidden).join('/')}; copy shown while the row was below: ${runs.map(r => r.copyShownRowBelow).join('/')}; copy off the bar's foot: ${runs.map(r => r.copyOffBarFoot).join('/')}. A headless CDP finger makes no fling. Painted-frame sheet of run 0 down/up near T: ${sheetPic}`, sheetPic ? [sheetPic] : [])
    await w.ctx.close()
  }
}


/* a visible day heading's centre: from the copy ('copy') or the grid's own row ('real') */
const dayPt = (w, which, idx) => w.page.evaluate(([which, idx]) => {
  const root = which === 'copy' ? document.querySelector('[data-testid="sticky-head"]') : [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed'))
  const realHead = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed')); const who = (realHead.querySelector('th.bal') || realHead.querySelector('th.who')).getBoundingClientRect()
  const ths = [...root.querySelectorAll('th.day')].map(t => ({ t, r: t.getBoundingClientRect() })).filter(o => o.r.width > 0 && o.r.left > who.right + 4 && o.r.right < innerWidth - 4)
  const o = ths[idx]; return o ? { x: o.r.left + o.r.width / 2, y: o.r.top + o.r.height / 2, d: o.t.dataset.d, n: ths.length } : null
}, [which, idx])
const tapPt = async (w, pt) => { if (w.touch && w.engine === 'ch') await w.page.touchscreen.tap(pt.x, pt.y); else if (w.touch) await w.page.touchscreen.tap(pt.x, pt.y); else await w.page.mouse.click(pt.x, pt.y) }

const tids = P => P.evaluate(() => [...new Set([...document.querySelectorAll('[data-testid]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).map(e => e.getAttribute('data-testid')).filter(t => !/^(cell|row|person|head|group|groupfold|polast)-/.test(t) && !/^month-/.test(t)))])
STEPS.probe2 = async () => {
  const w = await world({ vp: PC }); const P = w.page; const g0 = await geo(w)
  console.log('base', (await tids(P)).join(' '))
  await scrollTo_(w, g0.S + 40)
  // tap a date on the copy
  const c = await dayPt(w, 'copy', 5); console.log('copy pt', JSON.stringify(c)); await tapPt(w, c); await sleep(500)
  console.log('after date tap', (await tids(P)).join(' '))
  await pic(w, 'probe2-datetap')
  await P.keyboard.press('Escape'); await sleep(400)
  console.log('after esc', (await tids(P)).join(' '))
  // tap a cell
  const dc = P.locator('[data-testid="cell-ramp-2026-11-12"]'); console.log('cell count', await dc.count())
  await dc.first().scrollIntoViewIfNeeded().catch(() => {}); await dc.first().click().catch(e => console.log('cellclick', e.message.slice(0, 100))); await sleep(500)
  console.log('after cell tap', (await tids(P)).join(' '))
  await pic(w, 'probe2-celltap')
  console.log('html', await P.evaluate(() => { const d = document.querySelector('[data-testid="bid-sheet"], .bidsheet'); return d ? d.className + ' ' + d.innerText.slice(0, 300) : 'none' }))
  await w.ctx.close()
}


STEPS.probe3 = async () => {
  const w = await world({ vp: PC }); const P = w.page; const g0 = await geo(w)
  await scrollTo_(w, g0.S + 40); await pic(w, 'probe3-pinned')
  console.log(JSON.stringify(await P.evaluate(() => {
    const r = e => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right), Math.round(b.top)] }
    const cp = document.querySelector('[data-testid="sticky-head"]'), real = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed'))
    const f = root => [...root.querySelectorAll('th')].filter(t => { const b = t.getBoundingClientRect(); return b.right > 0 && b.left < innerWidth }).slice(0, 5).map(t => t.className + ':' + t.dataset.d + ':' + r(t))
    return { cp: f(cp), real: f(real), cpStyle: cp.getAttribute('style'), cpInner: cp.firstElementChild && cp.firstElementChild.tagName, wrapScroll: [...document.querySelectorAll('.mx-wrap')].map(e => e.scrollLeft) }
  })))
  await w.ctx.close()
}


const winTitle = P => P.evaluate(() => { const d = document.querySelector('[data-testid="win-lwday"]'); return d ? d.innerText.replace(/\s+/g, ' ').slice(0, 60) : null })
const cellPt = (w, person, off = 0) => w.page.evaluate(([person, off]) => {
  const realHead = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed')); const lo = realHead.querySelector('th.bal').getBoundingClientRect().right + 10
  const cs = [...document.querySelectorAll(person === '*' ? '[data-testid^="cell-"]' : `[data-testid^="cell-${person}-"]`)].filter(c => person !== '*' || !c.dataset.testid.startsWith('cell-stiff-')).map(c => ({ c, r: c.getBoundingClientRect() })).filter(o => o.r.width > 0 && o.r.left > lo && o.r.right < innerWidth - 4 && o.r.top > 112 && o.r.bottom < innerHeight - 4)
  const o = cs[off]; return o ? { x: o.r.left + o.r.width / 2, y: o.r.top + o.r.height / 2, id: o.c.dataset.testid, n: cs.length } : null
}, [person, off])
STEPS.probe4 = async () => {
  const w = await world({ vp: PC }); const P = w.page; const g0 = await geo(w)
  await scrollTo_(w, g0.S + 40)
  const c = await cellPt(w, 'dice', 3); console.log('cell', JSON.stringify(c))
  if (!c) { const y = await P.evaluate(() => { const e = document.querySelector('[data-testid^="cell-"]'); return e ? e.getBoundingClientRect().top : -1 }); console.log('first cell top', y) }
  await tapPt(w, c); await sleep(500)
  console.log('after cell tap', (await tids(P)).filter(t => !/^(count|manning|counter)/.test(t)).join(' '))
  await pic(w, 'probe4-celltap')
  await w.ctx.close()
}


/* how well the copy's day headings sit over the real row's: same dates visible, same left edges and widths */
const ALIGN = () => {
  const cp = document.querySelector('[data-testid="sticky-head"]'), real = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed'))
  const lo = (real.querySelector('th.bal') || real.querySelector('th.who')).getBoundingClientRect().right
  const vis = r => r.right > lo + 2 && r.left < innerWidth - 1 && r.width > 0
  const rm = new Map([...real.querySelectorAll('th.day')].map(t => [t.dataset.d, t.getBoundingClientRect()]))
  let n = 0, max = 0, maxW = 0, missing = 0
  for (const t of cp.querySelector('table').querySelectorAll('th.day')) { const a = t.getBoundingClientRect(); if (!vis(a)) continue; const b = rm.get(t.dataset.d); if (!b) { missing++; continue } n++; max = Math.max(max, Math.abs(a.left - b.left)); maxW = Math.max(maxW, Math.abs(a.width - b.width)) }
  const cw = [...cp.querySelectorAll('th.who')].find(x => x.getBoundingClientRect().right > 0) || cp.querySelector('th.who'), rw = real.querySelector('th.who')
  const cwr = cw.getBoundingClientRect(), rwr = rw.getBoundingClientRect()
  const txt = e => (e.innerText || '').replace(/\s+/g, ' ').trim()
  return { n, maxLeft: +max.toFixed(2), maxW: +maxW.toFixed(2), missing, whoDX: +(cwr.left - rwr.left).toFixed(2), whoW: +(cwr.width - rwr.width).toFixed(2), cornerCopy: txt(cw), cornerReal: txt(rw), shown: +getComputedStyle(cp).opacity > 0.5 }
}
const align = w => w.page.evaluate(ALIGN)
const alignOk = a => a.n > 5 && a.maxLeft <= 1 && a.maxW <= 1 && Math.abs(a.whoDX) <= 1 && a.cornerCopy === a.cornerReal
const afmt = a => `n=${a.n} dateΔleft=${a.maxLeft} Δwidth=${a.maxW} namesΔ=${a.whoDX}/${a.whoW} corner copy="${a.cornerCopy}" real="${a.cornerReal}"`
const wrapMax = w => w.page.evaluate(() => { const m = [...document.querySelectorAll('.mx-wrap')].find(e => e.scrollWidth > e.clientWidth + 5); return m ? m.scrollWidth - m.clientWidth : 0 })
const setSide = (w, f) => w.page.evaluate(f => { const m = [...document.querySelectorAll('.mx-wrap')].find(e => e.scrollWidth > e.clientWidth + 5); if (m) m.scrollLeft = f * (m.scrollWidth - m.clientWidth); return m ? m.scrollLeft : -1 }, f)
const sideNow = w => w.page.evaluate(() => { const m = [...document.querySelectorAll('.mx-wrap')].find(e => e.scrollWidth > e.clientWidth + 5); return m ? Math.round(m.scrollLeft) : -1 })
const placeLeave = async (w, person, off, re) => {
  const c = await cellPt(w, person, off); if (!c) throw new Error('no cell ' + person); await tapPt(w, c); await sleep(450)
  let pt = null
  for (let i = 0; i < 8 && !pt; i++) { pt = await w.page.evaluate(src => { const re = new RegExp(src); const b = [...document.querySelectorAll('button')].find(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && re.test(b.textContent.trim()) }); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, re.source); if (!pt) await sleep(300) }
  if (!pt) throw new Error('no visible leave button ' + re)
  await tapPt(w, pt); await sleep(500); return c.id
}
const closeWin = async w => { await w.page.keyboard.press('Escape'); await sleep(350); const x = w.page.locator('[data-testid="win-lwday-x"], [data-testid="win-x"]'); if (await x.count()) await x.first().click().catch(() => {}); await sleep(250) }
const stepScript = async (w, y) => { await w.page.evaluate(y => scrollTo(0, y), y); await sleep(500) }

STEPS.l6 = async () => {
  for (const [nm, vp, touch] of SZ) {
    const w = await world({ vp, touch, url: '/?savefail' }); const P = w.page; const g0 = await geo(w)
    await stepScript(w, g0.S + 160)
    const before = await geo(w); const notes = [`before the save: shown=${shown(before)} gap=${gapOf(before)} bar=${before.tb.toFixed(1)}`]
    await logOn(w)
    const id = await placeLeave(w, '*', 3, /^LL ?[0-9]/).catch(e => { notes.push('place failed: ' + e.message.split('\n')[0]); return null })
    await sleep(150)
    const early = await geo(w); const band = await P.evaluate(() => { const t = [...document.querySelectorAll('*')].filter(e => /Not saved/.test(e.innerText || '') && e.children.length < 6 && e.getBoundingClientRect().height > 0).map(e => e.getBoundingClientRect()).sort((a, b) => a.height - b.height)[0]; return t ? { top: t.top, bottom: t.bottom } : null })
    const pic1 = await pic(w, `L6-${nm}-1-first-frames`, clip(vp, 230))
    await sleep(900); const g = await geo(w); const fr = await logOff(w)
    const off = fr.filter(f => f.shown && Math.abs(f.pinTop - f.tb) > 1).length
    notes.push(`saved ${id}; ~150ms: bar foot=${early.tb.toFixed(1)} copy pinTop=${early.pin.top.toFixed(1)} gap=${gapOf(early)}; band: ${JSON.stringify(band)}; settled: bar foot=${g.tb.toFixed(1)} pinTop=${g.pin.top.toFixed(1)} gap=${gapOf(g)} shown=${shown(g)}; frames with copy off the bar's foot: ${off}/${fr.length}`)
    const pic2 = await pic(w, `L6-${nm}-2-settled`, clip(vp, 230))
    // Retry stays a save (keeps failing)
    const retry = P.getByRole('button', { name: /Retry/ }).first(); let rn = 'no Retry button seen'
    if (await retry.count()) { await retry.click().catch(() => {}); await sleep(700); const still = await P.evaluate(() => /Not saved/.test(document.body.innerText)); rn = `Retry pressed; band still showing: ${still}` }
    notes.push(rn)
    const g2 = await geo(w); notes.push(`after Retry: gap=${gapOf(g2)} shown=${shown(g2)}`)
    rec(`L6 ${nm} failed-save band`, ok(!!band && Math.abs(gapOf(g)) <= 1 && shown(g) && off === 0 && Math.abs(gapOf(g2)) <= 1), notes.join('; '), [pic1, pic2])
    await w.ctx.close()
  }
}
STEPS.l8 = async () => {
  for (const [nm, vp, touch] of SZ) {
    const w = await world({ vp, touch }); const P = w.page; const g0 = await geo(w); const S = g0.S
    const notes = []; const pics = []; let allok = true
    const actions = [['Manning toggle open', async () => { await P.evaluate(() => document.querySelector('[data-testid="counts-toggle"]').click()) }], ['Manning toggle close', async () => { await P.evaluate(() => document.querySelector('[data-testid="counts-toggle"]').click()) }],
      ['fold a group', async () => { await P.evaluate(() => document.querySelector('[data-testid^="groupfold-"]').click()) }], ['unfold the group', async () => { await P.evaluate(() => document.querySelector('[data-testid^="groupfold-"]').click()) }]]
    for (const [off, expectShown] of [[2, true], [-2, false]]) {
      for (const [lab, act] of actions) {
        // put the row at T+off again after each action (a fold can shift the page)
        const gg0 = await geo(w); await stepScript(w, gg0.S + off); const gb = await geo(w)
        if (Math.abs(gb.y - (gb.S + off)) > 0.6 + 0) { /* S shifts with the page: re-read */ }
        const S1 = gb.S; await stepScript(w, S1 + off)
        await logOn(w); await act(); await sleep(60)
        const first = await P.evaluate(ALIGN); const g1 = await geo(w)
        await sleep(500); const fr = await logOff(w); const g2 = await geo(w); const a2 = await align(w)
        const exp = (g2.y - g2.S) > 0.5 ? true : false
        const bad = fr.filter(f => f.under !== f.shown).length
        const goodNow = shown(g2) === exp && shown(g1) === (g1.y - g1.S > 0.5)
        notes.push(`${lab} @T${off > 0 ? '+' : ''}${off}: y=${g1.y.toFixed(1)} S=${g1.S.toFixed(1)} copy shown at first read=${shown(g1)} settled=${shown(g2)} (want ${exp}); frames with state wrong ${bad}/${fr.length}; ${afmt(a2)}`)
        if (!goodNow || bad > 0 || (shown(g2) && !alignOk(a2))) allok = false
        pics.push(await pic(w, `L8-${nm}-T${off > 0 ? 'plus' : 'minus'}2-${lab.replace(/ /g, '_')}`, clip(vp, 260)))
      }
    }
    rec(`L8 ${nm} Manning and folds at T+2 / T-2`, ok(allok), notes.join(' || '), pics)
    await w.ctx.close()
  }
}
STEPS.l12 = async () => {
  for (const [nm, vp, touch] of SZ) {
    const w = await world({ vp, touch }); const P = w.page; const g0 = await geo(w); const S = g0.S; const notes = []; const pics = []; let allok = true
    for (const [side, f] of [['left', 0], ['middle', 0.5], ['right', 1]]) {
      await stepScript(w, touch ? S - 120 : S - 50); await setSide(w, f); await sleep(500); const x0 = await sideNow(w)
      await logOn(w)
      if (touch) await finger(w, 330, 650, 90, 250, 14, 90)
      else { for (let i = 0; i < 6; i++) { await P.mouse.wheel(0, 100); await P.evaluate(d => { const m = [...document.querySelectorAll('.mx-wrap')].find(e => e.scrollWidth > e.clientWidth + 5); if (m) m.scrollLeft += d }, f === 1 ? -80 : 80); await sleep(70) } }
      await sleep(500); const fr = await logOff(w); const g = await geo(w); const a = await align(w); const x1 = await sideNow(w)
      const bad = fr.filter(f => f.under !== f.shown).length
      notes.push(`${side}: side ${x0}->${x1}, y=${g.y.toFixed(0)} (S=${g.S.toFixed(0)}) shown=${shown(g)}; ${afmt(a)}; frames with state wrong ${bad}/${fr.length}`)
      if (!(shown(g) && alignOk(a)) || bad) allok = false
      pics.push(await pic(w, `L12-${nm}-${side}`, clip(vp, 300)))
      // and back
      if (touch) await finger(w, 90, 250, 330, 650, 14, 90); else { for (let i = 0; i < 6; i++) { await P.mouse.wheel(0, -100); await P.evaluate(d => { const m = [...document.querySelectorAll('.mx-wrap')].find(e => e.scrollWidth > e.clientWidth + 5); if (m) m.scrollLeft += d }, f === 1 ? 80 : -80); await sleep(70) } }
      await sleep(400); const gb = await geo(w); const ab = await align(w)
      notes.push(`${side} back: y=${gb.y.toFixed(0)} shown=${shown(gb)} ${shown(gb) ? afmt(ab) : ''}`); if (shown(gb) && !alignOk(ab)) allok = false
    }
    rec(`L12 ${nm} diagonal across T`, ok(allok), notes.join(' || ') + (touch ? ' (a headless CDP finger; no fling)' : ''), pics)
    await w.ctx.close()
  }
}
STEPS.l13 = async () => {
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  for (const [nm, vp, touch] of SZ) {
    const w = await world({ vp, touch }); const P = w.page; const g0 = await geo(w); const S = g0.S; const notes = []; const pics = []; let allok = true
    const tapAndCheck = async (lab, which, idx) => {
      const pt = await dayPt(w, which, idx); if (!pt) { notes.push(`${lab}: no date to tap`); allok = false; return }
      await tapPt(w, pt); await sleep(150); const pic1 = await pic(w, `L13-${nm}-${lab}-100ms`, clip(vp, vp.height)); await sleep(450)
      const wins = await P.locator('[data-testid="win-lwday"]').count(); const t = await winTitle(P)
      const [, mm, dd] = pt.d.split('-'); const want = `${+dd} ${MON[+mm - 1]}`
      const good = wins === 1 && !!t && t.includes(want)
      notes.push(`${lab}: tapped ${which} ${pt.d} at (${pt.x.toFixed(0)},${pt.y.toFixed(0)}); windows open=${wins}; title="${t}" (want "${want}") ${good ? 'ok' : 'WRONG'}`)
      if (!good) allok = false
      pics.push(pic1, await pic(w, `L13-${nm}-${lab}`, clip(vp, vp.height)))
      await P.keyboard.press('Escape'); await sleep(300); if (await P.locator('[data-testid="win-lwday"]').count()) { await P.locator('[data-testid="win-lwday-x"]').first().click().catch(() => {}); await sleep(300) }
    }
    await stepScript(w, S - 40); await tapAndCheck('realT-40', 'real', 4)
    await stepScript(w, S + 40); await tapAndCheck('copyT+40', 'copy', 4)
    await setSide(w, 0.5); await sleep(400); await tapAndCheck('copyT+40-sideways', 'copy', 6)
    // straight after the first pinned frame: scroll to S-30 then S+1.5 and tap in the next frame
    await stepScript(w, S - 30); await P.evaluate(y => scrollTo(0, y), S + 1.5); await RDY(w)
    const gg = await geo(w); notes.push(`straight-after state: y=${gg.y.toFixed(1)} shown=${shown(gg)} inert=${gg.pin.inert} up=${gg.pin.up}`)
    await tapAndCheck('copy-first-pinned-frame', 'copy', 3)
    rec(`L13 ${nm} a tap on a date`, ok(allok), notes.join(' || '), pics)
    await w.ctx.close()
  }
}


STEPS.sync1 = async () => {
  for (const [nm, vp, touch] of SZ) {
    const w = await world({ vp, touch }); const P = w.page; const g0 = await geo(w); const out = []
    out.push('hidden at top: ' + afmt(await align(w)))
    await P.evaluate(y => scrollTo(0, y), g0.S + 40); await RDY(w)
    out.push('next frame after the scroll past T: shown=' + (await P.evaluate(ALIGN)).shown + ' ' + afmt(await align(w)))
    await sleep(100); out.push('+100ms: ' + afmt(await align(w)))
    await sleep(500); out.push('+600ms: ' + afmt(await align(w)))
    await pic(w, `sync1-${nm}`, clip(vp, 200))
    console.log(nm, out.join('\n   '))
    await w.ctx.close()
  }
}


STEPS.dbg = async () => {
  const w = await world({ vp: PC }); const P = w.page; const g0 = await geo(w)
  await P.evaluate(y => scrollTo(0, y), g0.S + 40); await sleep(500)
  console.log(JSON.stringify(await P.evaluate(() => {
    const cp = document.querySelector('[data-testid="sticky-head"]'), real = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed'))
    const lo = (real.querySelector('th.bal') || real.querySelector('th.who')).getBoundingClientRect().right
    const rows = []
    const rm = new Map([...real.querySelectorAll('th.day')].map(t => [t.dataset.d, t.getBoundingClientRect().left]))
    for (const t of cp.querySelectorAll('th.day')) { const a = t.getBoundingClientRect(); if (a.right > lo + 2 && a.left < innerWidth - 1 && a.width > 0) { rows.push([t.dataset.d, Math.round(a.left), Math.round(rm.get(t.dataset.d))]); } }
    const seq = r => [...r.querySelectorAll('th.day')].map(t => t.dataset.d + '|' + t.textContent.trim().replace(/\s+/g, '') + '|' + Math.round(t.getBoundingClientRect().left))
    const cs = seq(cp), rs = seq(real)
    return { cn: cs.length, rn: rs.length, c0: cs.slice(0, 3), c360: cs.slice(362, 368), c364: cs.slice(-3), r0: rs.slice(0, 3), rEnd: rs.slice(-3), hdrWho: cp.querySelectorAll('th.who').length, ths: cp.querySelectorAll('tr').length, cpTables: cp.querySelectorAll('table').length }
  })))
  await w.ctx.close()
}


STEPS.dbg2 = async () => {
  const w = await world({ vp: PH, touch: true, url: '/?savefail' }); const P = w.page; const g0 = await geo(w)
  await stepScript(w, g0.S + 160)
  const c = await cellPt(w, '*', 3); console.log('cell', JSON.stringify(c)); await tapPt(w, c); await sleep(700)
  await pic(w, 'dbg2-phone-celltap')
  console.log(await P.evaluate(() => [...document.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && /^(LL|OL|Whole|AM|PM)/.test(b.textContent.trim()) }).map(b => b.textContent.trim() + '@' + Math.round(b.getBoundingClientRect().left) + ',' + Math.round(b.getBoundingClientRect().top)).join(' | ')))
  await w.ctx.close()
}


const PSTATE = () => {
  const cp = document.querySelector('[data-testid="sticky-head"]'), cs = getComputedStyle(cp), pr = cp.getBoundingClientRect()
  const tb = document.querySelector('.topbar').getBoundingClientRect().bottom
  const ms = document.querySelector('[data-testid="month-strip"]'), mr = ms && ms.getBoundingClientRect()
  const real = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed')), hr = real.getBoundingClientRect()
  const shown = +cs.opacity > 0.5 && cs.visibility !== 'hidden'
  const overlapMonths = !!(shown && mr && mr.height > 0 && mr.bottom > tb && mr.top < pr.bottom && pr.top < mr.bottom && mr.bottom > pr.top)
  const th = real.querySelector('th.day'); const sc = th ? th.getBoundingClientRect().width : 0
  return { shown, pinching: cp.classList.contains('lw-pinching'), up: cp.classList.contains('up'), gap: +(pr.top - tb).toFixed(1), overlapMonths, monthsTop: mr ? Math.round(mr.top) : null, monthsBottom: mr ? Math.round(mr.bottom) : null, rowTop: +hr.top.toFixed(1), tb, dayW: +sc.toFixed(1), y: scrollY, shadow: cs.boxShadow !== 'none' }
}
const pinchRun = async (w, label, startY, { d0 = 100, d1 = 260, steps = 12, end = 'lift', cx = 200, cy = 520 } = {}) => {
  const P = w.page, c = w.cdp
  await P.evaluate(y => scrollTo(0, y), startY); await sleep(600)
  const t = (type, pts) => c.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })
  const at = d => [[cx - d / 2, cy], [cx + d / 2, cy]]
  const st0 = await P.evaluate(PSTATE); const log = []
  await t('touchStart', [at(d0)[0]]); await sleep(30); await t('touchStart', at(d0)); await sleep(30)
  let midPic = null
  for (let i = 1; i <= steps; i++) {
    await t('touchMove', at(d0 + (d1 - d0) * i / steps)); await sleep(30)
    const s = await P.evaluate(PSTATE); log.push(s)
    if (i === Math.round(steps / 2)) midPic = await pic(w, `L4-${label}-mid`, clip(w.vp, 520))
  }
  await sleep(120); const st1 = await P.evaluate(PSTATE)
  const midPicEnd = await pic(w, `L4-${label}-held`, clip(w.vp, 520))
  if (end === 'lift') await t('touchEnd', []); else await c.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] })
  await sleep(60); const stL = await P.evaluate(PSTATE); const liftPic = await pic(w, `L4-${label}-lift60ms`, clip(w.vp, 520))
  await sleep(700); const stF = await P.evaluate(PSTATE); const fin = await align(w); const finPic = await pic(w, `L4-${label}-settled`, clip(w.vp, 520))
  return { st0, log, st1, stL, stF, fin, pics: [midPic, midPicEnd, liftPic, finPic] }
}
STEPS.l4 = async () => {
  const w = await world({ vp: PH, touch: true }); const P = w.page; const g0 = await geo(w); const S = g0.S
  const cases = [
    ['out-pinned', S + 120, {}], ['in-pinned', S + 120, { d0: 260, d1: 100 }],
    ['out-across-T-from-below', S + 25, {}], ['in-across-T-from-above', S - 40, { d0: 260, d1: 100 }],
    ['begun-before-T-released', S - 80, {}], ['begun-before-T-cancelled', S - 80, { end: 'cancel' }],
    ['begun-pinned-cancelled', S + 120, { end: 'cancel' }]]
  for (const [lab, y, o] of cases) {
    let r; try { r = await pinchRun(w, lab, y, o) } catch (e) { rec(`L4/L5 pinch ${lab}`, 'COULD NOT RUN', e.message.split('\n')[0]); continue }
    const midShown = r.log.filter(s => s.shown).length, covered = r.log.filter(s => s.overlapMonths).length
    const gaps = r.log.filter(s => s.shown).map(s => s.gap)
    const maxGap = gaps.length ? Math.max(...gaps.map(Math.abs)) : 0
    const w0 = r.st0.dayW, w1 = r.st1.dayW
    const finalOk = (r.stF.shown === (r.stF.rowTop < r.stF.tb - 0.5)) && (!r.stF.shown || alignOk(r.fin)) && !r.stF.pinching
    const pass = covered === 0 && maxGap <= 1.5 && finalOk && r.log.every(s => !s.shadow || !s.pinching)
    rec(`L4/L5 pinch ${lab}`, ok(pass), `start y=${y.toFixed(0)}; ${r.log.length} steps: copy shown in ${midShown}, drawn over the month buttons in ${covered}, max gap to bar's foot while shown ${maxGap}; pinching class seen ${r.log.filter(s => s.pinching).length}/${r.log.length}; shadow while pinching ${r.log.filter(s => s.pinching && s.shadow).length}; day width ${w0} -> ${w1} (held) -> ${r.stF.dayW} (settled); after lift: shown=${r.stL.shown}, settled: shown=${r.stF.shown} rowTop=${r.stF.rowTop} bar=${r.stF.tb} ${r.stF.shown ? afmt(r.fin) : ''}; names column: ${r.fin.whoDX === 0 ? 'at grid left' : 'whoΔ=' + r.fin.whoDX}`, r.pics)
  }
  await w.ctx.close()
}


const pinCount = P => P.evaluate(() => { const l = [...document.querySelectorAll('[data-testid="sticky-head"]')]; const sh = l.filter(e => { const c = getComputedStyle(e); return +c.opacity > 0.5 && c.visibility !== 'hidden' }); const drawn = sh.filter(e => { const r = e.getBoundingClientRect(); const t = document.elementFromPoint(Math.min(innerWidth - 5, Math.max(5, r.left + r.width / 2)), r.top + r.height / 2); return !!t && e.contains(t) }); return { n: l.length, shown: sh.length, drawn: drawn.length } })
const safeAlign = async w => { try { return await align(w) } catch { return null } }
const undoBtn = (w, which) => w.page.evaluate(wh => { const b = [...document.querySelectorAll('.topbar button')].find(b => new RegExp(wh).test((b.textContent || '') + (b.getAttribute('aria-label') || '') + (b.title || '')) && b.getBoundingClientRect().width > 0); if (!b) return false; b.click(); return true }, which)
const optsOfPicker = P => P.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); return s ? { tag: s.tagName, opts: s.tagName === 'SELECT' ? [...s.options].map(o => o.value + ':' + o.text) : [], val: s.value } : null })

STEPS.l16 = async () => {
  for (const [nm, vp, touch] of SZ) {
    const w = await world({ vp, touch }); const P = w.page; const g0 = await geo(w); const S = g0.S; const notes = []; const pics = []; let allok = true
    // before T: the month buttons are in view and pressable
    await stepScript(w, S - 70)
    for (const m of ['MAR', 'DEC', 'JAN']) {
      const c = await P.evaluate(m => { const b = document.querySelector(`[data-testid="month-${m}"]`); const r = b.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { x: r.left + r.width / 2, y: r.top + r.height / 2, hit: !!top && (top === b || b.contains(top)) } }, m)
      if (!c.hit) { notes.push(`month ${m}: NOT reachable before T (something over it)`); allok = false; continue }
      await tapPt(w, c); await sleep(900); const g = await geo(w); const a = await safeAlign(w)
      notes.push(`before T press ${m}: copy shown=${shown(g)} (row ${g.headTop.toFixed(0)} vs bar ${g.tb.toFixed(0)})`); if (shown(g)) allok = false
    }
    pics.push(await pic(w, `L16-${nm}-before-T-months`, clip(vp, 330)))
    // pinned: press months (scroll to the strip would unpin; press by its own handler), then check the copy
    await stepScript(w, (await geo(w)).S + 120)
    for (const m of ['MAR', 'DEC', 'JAN', 'NOV']) {
      await P.evaluate(m => document.querySelector(`[data-testid="month-${m}"]`).click(), m); await sleep(1000)
      const g = await geo(w); const a = await safeAlign(w); const good = shown(g) && alignOk(a)
      notes.push(`pinned press ${m}: y=${g.y.toFixed(0)} shown=${shown(g)} ${afmt(a)}`); if (!good) allok = false
    }
    pics.push(await pic(w, `L16-${nm}-pinned-after-months`, clip(vp, 200)))
    // the year turns: walk the grid across 31 Dec -> 1 Jan
    const yrs = []
    for (const f of [0.9, 0.93, 0.96, 0.99, 1]) { await setSide(w, f); await sleep(350); const a = await align(w); yrs.push(`${f}: copy "${a.cornerCopy}" real "${a.cornerReal}" Δ${a.maxLeft}`); if (!alignOk(a)) allok = false }
    notes.push('across the year end: ' + yrs.join('; ')); pics.push(await pic(w, `L16-${nm}-pinned-year-end`, clip(vp, 200)))
    // another period and back
    const pk = await optsOfPicker(P); notes.push('period picker: ' + JSON.stringify(pk))
    if (pk && pk.tag === 'SELECT' && pk.opts.length > 1) {
      const other = pk.opts.find(o => !o.startsWith(pk.val + ':')); await P.selectOption('[data-testid="war-picker"]', other.split(':')[0]); await sleep(1200)
      const g = await geo(w).catch(() => null); const a = await safeAlign(w); notes.push(`other period "${other}": y=${g && g.y.toFixed(0)} shown=${g && shown(g)} ${a ? afmt(a) : 'no copy'}`)
      pics.push(await pic(w, `L16-${nm}-other-period`, clip(vp, 260)))
      await P.selectOption('[data-testid="war-picker"]', pk.val); await sleep(1200); const g2 = await geo(w); const a2 = await align(w)
      notes.push(`back to "${pk.val}": shown=${shown(g2)} ${afmt(a2)}`); if (g2.y > g2.S + 1 && !(shown(g2) && alignOk(a2))) allok = false
    }
    rec(`L16 ${nm} months and periods`, ok(allok), notes.join(' || '), pics)
    await w.ctx.close()
  }
}
STEPS.l17 = async () => {
  for (const [nm, vp, touch] of SZ) {
    const w = await world({ vp, touch }); const P = w.page; const g0 = await geo(w); const S = g0.S; const notes = []; const pics = []; let allok = true
    await stepScript(w, S + (touch ? 40 : 120)); await setSide(w, 0.5); await sleep(400)
    const check = async lab => { const g = await geo(w); const a = await align(w); const good = shown(g) && alignOk(a); if (!good) allok = false; notes.push(`${lab}: shown=${shown(g)} ${afmt(a)}`) }
    await check('pinned + half way sideways')
    const c1 = await placeLeave(w, '*', 3, /^LL ?[0-9]/).catch(e => { notes.push('whole-day place failed: ' + e.message); return null })
    await check('after a whole-day LL (' + c1 + ')'); pics.push(await pic(w, `L17-${nm}-1-whole`, clip(vp, 220)))
    // half day: tap another cell, press AM, then LL
    const c2 = await cellPt(w, '*', 6); await tapPt(w, c2); await sleep(500)
    const am = await P.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && b.textContent.trim() === 'AM' }); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    if (am) { await tapPt(w, am); await sleep(300) } else notes.push('no AM button seen')
    const ll = await P.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && /^.?LL ?[0-9]/.test(b.textContent.trim()) }); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    if (ll) { await tapPt(w, ll); await sleep(600) } else notes.push('no LL button for the half day')
    await check('after a half-day LL AM (' + (c2 && c2.id) + ')'); pics.push(await pic(w, `L17-${nm}-2-half`, clip(vp, 220)))
    for (const [lab, re] of [['Undo', 'Undo'], ['Undo', 'Undo'], ['Redo', 'Redo']]) { const done = await undoBtn(w, re); await sleep(800); await check(lab + (done ? '' : ' (button not found)')) }
    pics.push(await pic(w, `L17-${nm}-3-after-undo-redo`, clip(vp, 220)))
    rec(`L17 ${nm} edits, Undo, Redo`, ok(allok), notes.join(' || '), pics)
    await w.ctx.close()
  }
}
STEPS.l19 = async () => {
  for (const [nm, vp, touch] of SZ) {
    const w = await world({ vp, touch }); const P = w.page; const g0 = await geo(w); const S = g0.S; const notes = []; const pics = []; let allok = true
    await stepScript(w, S + 150)
    for (const [lab, sel] of [['Approvals', '[data-testid="lw-tab-approvals"]'], ['Balances', '[data-testid="lw-tab-balances"]'], ['OIL', '[data-testid="oil-tracker"]'], ['My leave', '[data-testid="my-leave"]']]) {
      await P.evaluate(() => scrollTo(0, 0)); await sleep(200)
      const pt = await P.evaluate(s => { const b = document.querySelector(s); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, sel)
      await tapPt(w, pt); await sleep(900)
      const pc = await pinCount(P); const y = await P.evaluate(() => { scrollTo(0, 400); return scrollY }); await sleep(400)
      const pc2 = await pinCount(P)
      const vis = await P.evaluate(() => { const el = document.querySelector('[data-testid="sticky-head"]'); if (!el) return 0; const r = el.getBoundingClientRect(); return r.height > 0 ? 1 : 0 })
      notes.push(`${lab}: copies in the page ${pc2.n}, passing the shown test ${pc2.shown}, actually drawn on top ${pc2.drawn} (scrolled to y=${y})`); if (pc2.drawn !== 0 && lab !== 'My leave') allok = false; if (lab === 'My leave') notes.push('  (My leave is a small window over the grid: the grid and its pinned row stay visible beside it, as they should)')
      pics.push(await pic(w, `L19-${nm}-${lab.replace(' ', '_')}`, clip(vp, 300)))
      await P.keyboard.press('Escape'); await sleep(300)
      // back to the grid and pin it again
      await P.evaluate(() => scrollTo(0, 0)); await sleep(200)
      const gp = await P.evaluate(() => { const b = document.querySelector('[data-testid="lw-tab-grid"]'); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }); await tapPt(w, gp); await sleep(900)
      const g = await geo(w); await stepScript(w, g.S + 150); const g2 = await geo(w); const a = await align(w)
      notes.push(`  back to the grid after ${lab}: shown=${shown(g2)} ${afmt(a)}`); if (!(shown(g2) && alignOk(a))) allok = false
    }
    // phone: pinch on OIL zooms OIL; a pinch on the ordinary controls does nothing
    if (touch) {
      await P.evaluate(() => scrollTo(0, 0)); await sleep(200)
      const pt = await P.evaluate(() => { const b = document.querySelector('[data-testid="oil-tracker"]'); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }); await tapPt(w, pt); await sleep(900)
      const meas = () => P.evaluate(() => ({ vv: window.visualViewport.scale, th: ['NAME', 'BAL'].map(t => { const e = [...document.querySelectorAll('th, div, span')].find(e => e.children.length === 0 && e.textContent.trim().toUpperCase() === t && e.getBoundingClientRect().width > 0); return e ? Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height) : '-' }).join('/') }))
      const m0 = await meas(); await pic(w, `L19-${nm}-OIL-before-pinch`, clip(vp, 600))
      const t = (type, pts) => w.cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i + 1 })) })
      const pinch = async (cx, cy, d0, d1) => { await t('touchStart', [[cx - d0 / 2, cy]]); await sleep(30); await t('touchStart', [[cx - d0 / 2, cy], [cx + d0 / 2, cy]]); for (let i = 1; i <= 10; i++) { const d = d0 + (d1 - d0) * i / 10; await t('touchMove', [[cx - d / 2, cy], [cx + d / 2, cy]]); await sleep(30) } await sleep(100); await t('touchEnd', []) }
      await pinch(200, 500, 80, 240); await sleep(700); const m1 = await meas(); pics.push(await pic(w, `L19-${nm}-OIL-after-pinch`, clip(vp, 600)))
      notes.push(`pinch on OIL: widths ${m0.th} -> ${m1.th}, visual viewport scale ${m0.vv} -> ${m1.vv}`)
      if (m0.th === m1.th) notes.push('(OIL did not change width: NOT zoomed)'), allok = false
      const pt2 = await P.evaluate(() => { const b = document.querySelector('[data-testid="lw-tab-grid"]'); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }); await tapPt(w, pt2); await sleep(700)
      await P.evaluate(() => scrollTo(0, 0)); await sleep(300)
      const m2 = await meas(); await pinch(200, 160, 80, 240); await sleep(600); const m3 = await meas(); pics.push(await pic(w, `L19-${nm}-ordinary-controls-pinch`, clip(vp, 400)))
      notes.push(`pinch over the tab row: page scale ${m2.vv} -> ${m3.vv}, widths ${m2.th} -> ${m3.th}`); if (m3.vv !== m2.vv) allok = false
    }
    rec(`L19 ${nm} the other tabs`, ok(allok), notes.join(' || '), pics)
    await w.ctx.close()
  }
}


STEPS.dbg3 = async () => {
  const w = await world({ vp: PC }); const P = w.page; const g0 = await geo(w)
  await stepScript(w, g0.S + 120)
  const c2 = await cellPt(w, '*', 6); await tapPt(w, c2); await sleep(500)
  const list = () => P.evaluate(() => [...document.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight }).map(b => b.textContent.trim()).filter(t => /LL|AM|PM|Whole|OL/.test(t)).join(' | '))
  console.log('before AM', await list())
  const am = await P.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && b.textContent.trim() === 'AM' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  await tapPt(w, am); await sleep(400); console.log('after AM', await list()); await pic(w, 'dbg3')
  await w.ctx.close()
}


const jsClick = (P, sel) => P.evaluate(s => { const e = document.querySelector(s); if (!e) return false; e.click(); return true }, sel)
const btnByText = (P, re) => P.evaluate(src => { const r = new RegExp(src); const b = [...document.querySelectorAll('button')].find(b => { const q = b.getBoundingClientRect(); return q.width > 0 && q.bottom > 0 && q.top < innerHeight && r.test(b.textContent.trim()) }); if (!b) return null; const q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2, t: b.textContent.trim() } }, re.source)
const rowsOrder = P => P.evaluate(() => [...document.querySelectorAll('#page-leavewar [data-testid^="person-"]')].slice(0, 12).map(e => e.dataset.testid.replace('person-', '')).join(','))

STEPS.l15 = async () => {
  for (const [nm, vp, touch] of SZ) {
    const w = await world({ vp, touch }); const P = w.page; const g0 = await geo(w); const S = g0.S; const notes = []; const pics = []; let allok = true
    const check = async lab => { const g = await geo(w); const a = await align(w); const good = shown(g) && alignOk(a); if (!good) allok = false; notes.push(`${lab}: shown=${shown(g)} ${afmt(a)}`) }
    await stepScript(w, S + 200); await check('pinned before')
    const before = await rowsOrder(P)
    await jsClick(P, '[data-testid="settings-open"]'); await sleep(600)
    const ok1 = await jsClick(P, '[data-testid="settings-rearrange"]'); await sleep(500)
    notes.push('Rearrange pressed: ' + ok1)
    await jsClick(P, '[data-testid="settings-close"]'); await sleep(500)
    await check('Rearrange on'); pics.push(await pic(w, `L15-${nm}-1-rearranging`, clip(vp, 260)))
    // find grips
    const grips = await P.evaluate(() => [...document.querySelectorAll('#page-leavewar *')].filter(e => e.children.length === 0 && e.textContent.trim() === '⠠⠿'.slice(0,0) + '⠿' || (e.children.length === 0 && /^[⠿⠇⋮⠁-⣿]$/.test(e.textContent.trim()))).map(e => { const r = e.getBoundingClientRect(); return { t: e.tagName + '.' + String(e.className).slice(0, 20), x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, in: r.left > 0 && r.left < 150 && r.top > 120 && r.bottom < innerHeight } }).filter(o => o.in && o.w > 0 && o.t.startsWith('SPAN') && !o.t.includes('ghd')).slice(0, 6))
    notes.push('grips seen: ' + grips.map(g => `${g.t}@${Math.round(g.x)},${Math.round(g.y)}`).join(' '))
    if (grips.length >= 2) {
      const a = grips[0], b = grips[3] || grips[1]
      if (touch) { const c = w.cdp; await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y }] }); await sleep(450); for (let i = 1; i <= 12; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x, y: a.y + (b.y - a.y) * i / 12 }] }); await sleep(30) } await sleep(150); await pic(w, `L15-${nm}-2-mid-drag`, clip(vp, 300)); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) }
      else { await P.mouse.move(a.x, a.y); await P.mouse.down(); for (let i = 1; i <= 12; i++) { await P.mouse.move(a.x, a.y + (b.y - a.y) * i / 12 + 3); await sleep(30) } await sleep(150); await pic(w, `L15-${nm}-2-mid-drag`, clip(vp, 300)); await P.mouse.up() }
      await sleep(700); pics.push(`L15-${nm}-2-mid-drag.png`)
      const after = await rowsOrder(P); notes.push(`rows before: ${before}; after drag: ${after}; changed: ${before !== after}`)
      await check('after a drag'); pics.push(await pic(w, `L15-${nm}-3-after-drag`, clip(vp, 260)))
    } else notes.push('NOT WALKED: no drag grip found to drag')
    // fold and unfold a group
    await jsClick(P, '[data-testid^="groupfold-"]'); await sleep(600); await check('group folded'); await jsClick(P, '[data-testid^="groupfold-"]'); await sleep(600); await check('group unfolded')
    // Done
    const done = await P.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => /Done/.test(b.textContent) && b.getBoundingClientRect().width > 0 && !b.closest('[data-testid^="win"]')); if (!b) return false; b.click(); return b.textContent.trim() }); notes.push('Done button (clicked in the page, it stands at the grid bar above the rows): ' + done); await sleep(700)
    await stepScript(w, (await geo(w)).S + 200); await check('after Done')
    for (const re of ['Undo', 'Redo']) { const d = await undoBtn(w, re); await sleep(800); await check(re + (d ? '' : ' (not found)')) }
    pics.push(await pic(w, `L15-${nm}-4-after-undo-redo`, clip(vp, 260)))
    rec(`L15 ${nm} Rearrange`, ok(allok), notes.join(' || ') + (touch ? ' || second finger during a drag: NOT WALKED (headless CDP second finger on a drag not set up; record as open for his iPhone)' : ''), pics)
    await w.ctx.close()
  }
}
STEPS.l18 = async () => {
  for (const [nm, vp, touch, eng] of [['pc1536-ch', PC, false, 'ch'], ['ph402-ch', PH, true, 'ch'], ['ph402-wk', PH, true, 'wk']]) {
    const w = await world({ vp, touch, engine: eng }); const P = w.page; const g0 = await geo(w); const S = g0.S; const notes = []; const pics = []; let allok = true
    await stepScript(w, S + 150); await setSide(w, 0.5); await sleep(300); const a0 = await align(w); notes.push('before leaving: ' + afmt(a0) + ' side=' + await sideNow(w))
    await go(P, 'quals'); await sleep(1200)
    const pcQ = await pinCount(P); notes.push(`on Quals: grid copies in the page ${pcQ.n}, drawn on top ${pcQ.drawn}`); if (pcQ.drawn) allok = false
    // an admin change on Quals: Enable editing, then the first tick
    const en = await btnByText(P, /Enable editing/); let changed = 'no Enable editing button seen'
    if (en) { await tapPt(w, en); await sleep(600); const t = await P.evaluate(() => { const c = [...document.querySelectorAll('#qtbl td')].find(td => { const r = td.getBoundingClientRect(); return r.width > 0 && r.top > 150 && r.bottom < innerHeight && /^\s*$/.test(td.textContent) && !td.classList.contains('qname') && td.querySelector('input,button,span') }); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }); if (t) { await tapPt(w, t); await sleep(500); changed = 'tapped a Quals cell (editing on)' } else changed = 'editing on; no tickable cell found' }
    notes.push('Quals change: ' + changed)
    if (eng === 'ch') { await P.setViewportSize({ width: vp.width === 1536 ? 1200 : 460, height: vp.height }); await sleep(600) } else { await P.setViewportSize({ width: 460, height: vp.height }); await sleep(600) }
    await P.setViewportSize(vp); await sleep(600)
    await go(P, 'leavewar'); await RDY(w)
    const gf = await geo(w); const af = await align(w)
    notes.push(`first frame back: y=${gf.y.toFixed(0)} shown=${shown(gf)} ${afmt(af)} gap=${gapOf(gf)}`)
    await sleep(700); const gs = await geo(w); const as = await align(w); notes.push(`settled: y=${gs.y.toFixed(0)} S=${gs.S.toFixed(0)} shown=${shown(gs)} ${afmt(as)} gap=${gapOf(gs)}; grid side ${await sideNow(w)}`)
    pics.push(await pic(w, `L18-${nm}-back`, clip(vp, 260)))
    const pcB = await pinCount(P); notes.push(`copies in page ${pcB.n}`)
    // the page may reopen at the top, where the copy is rightly hidden
    const expectShown = gs.y > gs.S + 0.5
    if (shown(gs) !== expectShown || (shown(gs) && !alignOk(as)) || pcB.n !== 1) allok = false
    rec(`L18 ${nm} away and back`, ok(allok), notes.join(' || '), pics)
    await w.ctx.close()
  }
}
STEPS.l22 = async () => {
  const run = async (nm, vp0, touch, seq) => {
    const w = await world({ vp: vp0, touch }); const P = w.page; const g0 = await geo(w); const notes = []; const pics = []; let allok = true
    for (const [lab, off] of [['pinned', 100], ['just before T', -30]]) {
      await stepScript(w, (await geo(w)).S + off)
      for (const vp of seq) {
        await P.setViewportSize(vp); await sleep(900); const g = await geo(w); const a = await align(w)
        const y = g.y, exp = y > g.S + 0.5
        const good = shown(g) === exp && (!exp || (Math.abs(gapOf(g)) <= 1 && alignOk(a) && Math.abs(g.pin.h - g.headH) < 1))
        if (!good) allok = false
        notes.push(`${lab} @${vp.width}x${vp.height}: y=${y.toFixed(0)} S=${g.S.toFixed(0)} shown=${shown(g)} (want ${exp}) gap=${gapOf(g)} copy h=${g.pin.h} real h=${g.headH.toFixed(1)} ${exp ? afmt(a) : ''}`)
        pics.push(await pic(w, `L22-${nm}-${lab.replace(/ /g, '_')}-${vp.width}x${vp.height}`, clip(vp, 260)))
      }
      await P.setViewportSize(vp0); await sleep(600)
    }
    rec(`L22 ${nm} turning and resizing`, ok(allok), notes.join(' || '), pics); await w.ctx.close()
  }
  await run('ph402-ch', PH, true, [{ width: 874, height: 402 }, { width: 402, height: 874 }])
  await run('pc1536-ch', PC, false, [{ width: 420, height: 864 }, { width: 1536, height: 864 }])
  rec('L22 Safari address bar', 'NOT WALKED', "Safari's folding address bar exists only on his iPhone; not walkable on this PC", [])
}
STEPS.l20 = async () => {
  for (const [nm, vp, touch] of SZ) {
    const w = await world({ vp, touch }); const P = w.page; const g0 = await geo(w); const S = g0.S; const notes = []; const pics = []; let allok = true
    const winSel = '[data-testid="win-lwday"], [data-testid="person-window"], [data-testid^="person-window"], .bidwin, .bidsheet, [role="dialog"]'
    const inspect = async lab => P.evaluate(src => {
      const cp = document.querySelector('[data-testid="sticky-head"]'), cr = cp.getBoundingClientRect()
      const wins = [...document.querySelectorAll(src)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 50 && r.height > 50 })
      const w0 = wins[wins.length - 1]; if (!w0) return { win: false }
      const r = w0.getBoundingClientRect(); const ox = Math.max(r.left, cr.left), ox2 = Math.min(r.right, cr.right), oy = Math.max(r.top, cr.top), oy2 = Math.min(r.bottom, cr.bottom)
      const overlap = ox2 > ox && oy2 > oy
      const t = overlap ? document.elementFromPoint((ox + ox2) / 2, (oy + oy2) / 2) : null
      return { win: true, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], overlap, topIsWindow: overlap ? !!t && w0.contains(t) : null, copyDrawnAbove: overlap ? !!t && cp.contains(t) : null, nwins: wins.length }
    }, winSel)
    const after = async lab => { await sleep(350); const pc = await pinCount(P); const g = await geo(w); const a = await align(w); const good = pc.n === 1 && shown(g) && alignOk(a); if (!good) allok = false; notes.push(`  after ${lab}: copies=${pc.n} shown=${shown(g)} ${afmt(a)}`) }
    await stepScript(w, S + 150); await setSide(w, 0.5); await sleep(300)
    // 1 day panel from the copy: ✕, Escape, tap outside
    for (const closer of ['x', 'escape', 'outside']) {
      const pt = await dayPt(w, 'copy', 4); await tapPt(w, pt); await sleep(500); const i = await inspect(); notes.push(`day panel (close by ${closer}): ${JSON.stringify(i)}`)
      if (!i.win || i.overlap && !i.topIsWindow) allok = false
      if (closer === 'x') { await P.evaluate(() => document.querySelector('[data-testid="win-lwday-x"]').click()) } else if (closer === 'escape') await P.keyboard.press('Escape'); else { await tapPt(w, { x: vp.width - 6, y: 140 }) }
      await sleep(400); const still = await P.locator('[data-testid="win-lwday"]').count(); notes.push(`   ${closer}: day panel left open=${still}`); if (still) allok = false
      await after('day panel closed by ' + closer)
    }
    pics.push(await pic(w, `L20-${nm}-1-daypanel-closed`, clip(vp, 260)))
    // 2 person window: the name button
    const pn = await P.evaluate(() => { const b = [...document.querySelectorAll('[data-testid^="person-"]')].find(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.top > 120 && r.bottom < innerHeight && !b.dataset.testid.startsWith('person-window') }); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, id: b.dataset.testid } })
    if (pn) { await tapPt(w, pn); await sleep(700); const i = await inspect(); notes.push(`person window (${pn.id}): ${JSON.stringify(i)}`); pics.push(await pic(w, `L20-${nm}-2-person-window`, clip(vp, vp.height))); if (!i.win || i.overlap && !i.topIsWindow) allok = false
      await P.keyboard.press('Escape'); await sleep(400); if (await P.locator('[data-testid="person-window"]').count()) { const x = await btnByText(P, /^✕$|Close/); if (x) await tapPt(w, x); await sleep(300) }
      await after('person window closed') } else notes.push('person window: NOT WALKED (no name in view)')
    // 3 bid window with its ⋯ menu
    const c = await cellPt(w, '*', 5); if (c) { await tapPt(w, c); await sleep(600)
      const dots = await btnByText(P, /^⋯$|^\.\.\.$|^…$/); notes.push('bid window ⋯: ' + (dots ? 'found' : 'not seen'))
      if (dots) { await tapPt(w, dots); await sleep(500); const i = await inspect(); notes.push(`⋯ menu open: ${JSON.stringify(i)}`); pics.push(await pic(w, `L20-${nm}-3-bid-window-menu`, clip(vp, vp.height))); await P.keyboard.press('Escape'); await sleep(300) }
      await P.keyboard.press('Escape'); await sleep(400); await P.evaluate(() => { const x = document.querySelector('[data-testid="win-x"], [data-testid="bid-x"]'); x && x.click() })
      await after('bid window closed') }
    // 4 phone: the Required cell's keypad
    if (touch) { const rq = await P.evaluate(() => { const e = [...document.querySelectorAll('[data-testid^="req-p-"]')].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.left > 215 && r.right < innerWidth - 2 }); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, id: e.dataset.testid, top: r.top } })
      if (rq && rq.top > 100) { await tapPt(w, rq); await sleep(600); const i = await inspect(); notes.push(`Required keypad (${rq.id}): ${JSON.stringify(i)}`); pics.push(await pic(w, `L20-${nm}-4-keypad`, clip(vp, vp.height))); await P.keyboard.press('Escape'); await sleep(400); await after('keypad closed') }
      else notes.push('Required keypad: its row is scrolled out of view while pinned (row at ' + (rq && Math.round(rq.top)) + '): NOT WALKED pinned') }
    rec(`L20 ${nm} windows over the grid`, ok(allok), notes.join(' || '), pics)
    await w.ctx.close()
  }
}


STEPS.dbg5 = async () => {
  const w = await world({ vp: PC }); const P = w.page; const g0 = await geo(w)
  const rd = () => P.evaluate(() => { const cp = document.querySelector('[data-testid="sticky-head"]'); const real = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed')); const tb = document.querySelector('.topbar').getBoundingClientRect().bottom; const cs = getComputedStyle(cp); return { y: scrollY, lwys: cp.style.getPropertyValue('--lwy-s'), S: +(scrollY + real.getBoundingClientRect().top - tb).toFixed(1), op: cs.opacity, up: cp.classList.contains('up'), inert: cp.inert, w: innerWidth } })
  await stepScript(w, g0.S - 30); console.log('1536 y=S-30', JSON.stringify(await rd()))
  await P.setViewportSize({ width: 420, height: 864 })
  for (const t of [100, 400, 900, 2000]) { await sleep(t); console.log('420 +' + t, JSON.stringify(await rd())) }
  await P.evaluate(() => scrollBy(0, 1)); await sleep(300); console.log('after 1px scroll', JSON.stringify(await rd()))
  await w.ctx.close()
}
STEPS.dbg6 = async () => {
  const w = await world({ vp: PC }); const P = w.page; const g0 = await geo(w)
  await stepScript(w, 0)
  const pt = await dayPt(w, 'real', 4); await tapPt(w, pt); await sleep(500)
  console.log('open', await P.locator('[data-testid="win-lwday"]').count())
  await tapPt(w, { x: 1530, y: 140 }); await sleep(400); console.log('after outside tap', await P.locator('[data-testid="win-lwday"]').count())
  await tapPt(w, { x: 700, y: 700 }); await sleep(400); console.log('after grid tap', await P.locator('[data-testid="win-lwday"]').count())
  await w.ctx.close()
}


STEPS.dbg7 = async () => {
  const rd = P => P.evaluate(() => { const cp = document.querySelector('[data-testid="sticky-head"]'); const real = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed')); const tb = document.querySelector('.topbar').getBoundingClientRect().bottom; const cs = getComputedStyle(cp); return { y: scrollY, lwys: cp.style.getPropertyValue('--lwy-s'), S: +(scrollY + real.getBoundingClientRect().top - tb).toFixed(1), op: cs.opacity, sh: document.documentElement.scrollHeight } })
  // fresh at 420 wide
  const w = await world({ vp: { width: 420, height: 864 } }); const P = w.page; await sleep(500)
  const a = await rd(P); console.log('fresh420', JSON.stringify(a))
  for (const off of [-60, -30, -10, -5, -2, 0, 2]) { await P.evaluate(y => scrollTo(0, y), Math.round(a.S) + off); await sleep(250); console.log('fresh420 off', off, JSON.stringify(await rd(P))) }
  await w.ctx.close()
  // 1536 fresh, same offsets
  const w2 = await world({ vp: PC }); const P2 = w2.page; await sleep(500); const b = await rd(P2); console.log('fresh1536', JSON.stringify(b))
  for (const off of [-30, -10, -5, -2, 0, 2]) { await P2.evaluate(y => scrollTo(0, y), Math.round(b.S) + off); await sleep(250); console.log('fresh1536 off', off, JSON.stringify(await rd(P2))) }
  await w2.ctx.close()
}


STEPS.dbg8 = async () => {
  const rd = P => P.evaluate(() => { const cp = document.querySelector('[data-testid="sticky-head"]'); const real = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed')); const tb = document.querySelector('.topbar').getBoundingClientRect().bottom; const cs = getComputedStyle(cp); return { y: scrollY, lwys: cp.style.getPropertyValue('--lwy-s'), S: +(scrollY + real.getBoundingClientRect().top - tb).toFixed(1), op: cs.opacity } })
  const w = await world({ vp: PC }); const P = w.page; const g0 = await geo(w)
  await P.setViewportSize({ width: 420, height: 864 }); await sleep(900); console.log('after resize', JSON.stringify(await rd(P)))
  for (const y of [0, 60, 120, 160, 175, 184, 188, 190, 200]) { await P.evaluate(v => scrollTo(0, v), y); await sleep(250); console.log('scroll', y, JSON.stringify(await rd(P))) }
  console.log('--- same, but never scrolled before resize? now back up'); 
  await P.evaluate(() => scrollTo(0, 0)); await sleep(300)
  for (const y of [150, 184, 188, 190]) { await P.evaluate(v => scrollTo(0, v), y); await sleep(250); console.log('again', y, JSON.stringify(await rd(P))) }
  await w.ctx.close()
}


STEPS.dbg9 = async () => {
  const rd = P => P.evaluate(() => { const cp = document.querySelector('[data-testid="sticky-head"]'); const real = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed')); const tb = document.querySelector('.topbar').getBoundingClientRect().bottom; const cs = getComputedStyle(cp); return { y: scrollY, S: +(scrollY + real.getBoundingClientRect().top - tb).toFixed(1), lwys: cp.style.getPropertyValue('--lwy-s'), op: +cs.opacity, sh: document.documentElement.scrollHeight, ih: innerHeight, al: cs.animationRange || cs.animationRangeStart, tl: cs.animationTimeline } })
  const sweep = async (P, lab) => { let first = null; for (let y = 0; y <= 260; y += 4) { await P.evaluate(v => scrollTo(0, v), y); await sleep(60); const r = await rd(P); if (r.op > 0.5 && first === null) { first = r.y; console.log(lab, 'first shown at y=', r.y, JSON.stringify(r)); break } } if (first === null) console.log(lab, 'never shown') }
  const w = await world({ vp: PC }); const P = w.page
  await sweep(P, '1536 fresh'); await P.evaluate(() => scrollTo(0, 0)); await sleep(200)
  await P.setViewportSize({ width: 420, height: 864 }); await sleep(900); await sweep(P, 'after 1536->420')
  await P.evaluate(() => scrollTo(0, 0)); await sleep(200)
  await P.setViewportSize({ width: 1536, height: 864 }); await sleep(900); await sweep(P, 'after back ->1536')
  await P.evaluate(() => scrollTo(0, 0)); await sleep(200)
  await P.setViewportSize({ width: 1536, height: 700 }); await sleep(900); await sweep(P, 'after height only 864->700')
  await w.ctx.close()
}


STEPS.l22b = async () => {
  const rd = P => P.evaluate(() => { const cp = document.querySelector('[data-testid="sticky-head"]'); const real = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed')); const tb = document.querySelector('.topbar').getBoundingClientRect().bottom; const cs = getComputedStyle(cp); const ms = document.querySelector('[data-testid="month-strip"]'); const mr = ms && ms.getBoundingClientRect(); const cr = cp.getBoundingClientRect(); return { y: scrollY, S: +(scrollY + real.getBoundingClientRect().top - tb).toFixed(1), op: +cs.opacity, copyTop: +cr.top.toFixed(1), copyBottom: +cr.bottom.toFixed(1), realTop: +real.getBoundingClientRect().top.toFixed(1), monthsTop: mr && Math.round(mr.top), monthsBottom: mr && Math.round(mr.bottom) } })
  const out = []
  // fresh load at 420 wide: the reference
  { const w = await world({ vp: { width: 420, height: 864 } }); const P = w.page; await sleep(500); const S0 = (await rd(P)).S; await P.evaluate(y => scrollTo(0, y), Math.round(S0) - 37); await sleep(300); const r = await rd(P); out.push('fresh 420 wide, scrolled 37px short of the meeting point: ' + JSON.stringify(r)); await pic(w, 'L22-extra-fresh420-37short', clip(w.vp, 300)); await w.ctx.close() }
  // desktop window narrowed after load
  { const w = await world({ vp: PC }); const P = w.page; await P.setViewportSize({ width: 420, height: 864 }); await sleep(900); const S0 = (await rd(P)).S; await P.evaluate(y => scrollTo(0, y), Math.round(S0) - 37); await sleep(300); const r = await rd(P); out.push('1536 narrowed to 420 after load, same place: ' + JSON.stringify(r)); await pic(w, 'L22-extra-narrowed420-37short', clip(w.vp, 300)); await w.ctx.close() }
  console.log(out.join('\n'))
}


const chk = async (w, lab) => {
  const P = w.page; const g = await geo(w); const a = await align(w).catch(() => null); const st = await P.evaluate(PSTATE).catch(() => ({ overlapMonths: false })); const pc = await pinCount(P)
  const exp = g.y - g.S > 0.5; const edge = Math.abs(g.y - g.S) <= 0.5
  const good = (edge || shown(g) === exp) && (!shown(g) || (a && Math.abs(gapOf(g)) <= 1 && alignOk(a))) && !st.overlapMonths && pc.n <= 1
  return { good, txt: `${lab}: y=${g.y.toFixed(0)} S=${g.S.toFixed(0)} shown=${shown(g)} (want ${exp}) gap=${gapOf(g)} overMonths=${st.overlapMonths} copies=${pc.n} ${shown(g) && a ? afmt(a) : ''}` }
}
STEPS.l23 = async () => {
  for (const [nm, vp, touch] of SZ) {
    const w = await world({ vp, touch, who: 'm' }); const P = w.page; const g0 = await geo(w); const S = g0.S; const notes = []; const pics = []; let allok = true
    for (const off of [-40, 3, 150]) { await stepScript(w, S + off); const c = await chk(w, `member T${off >= 0 ? '+' : ''}${off}`); notes.push(c.txt); if (!c.good) allok = false }
    const cnt = await P.evaluate(() => { const real = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed')); const cp = document.querySelector('[data-testid="sticky-head"] table'); const n = r => r.querySelectorAll('th.day').length; const act = r => [...r.querySelectorAll('button,a,input,select,[role=button]')].length; return { realDays: n(real), copyDays: n(cp), realInteractive: act(real), copyInteractive: act(cp) } })
    notes.push('same things offered: ' + JSON.stringify(cnt)); if (cnt.realDays !== cnt.copyDays || cnt.copyInteractive > cnt.realInteractive) allok = false
    for (const closer of ['x', 'escape']) {
      const pt = await dayPt(w, 'copy', 4); await tapPt(w, pt); await sleep(500); const open = await P.locator('[data-testid="win-lwday"]').count(); notes.push(`day tap on copy (${closer}): panel opened=${open}`); if (!open) allok = false
      pics.push(await pic(w, `L23-${nm}-daypanel-${closer}`, clip(vp, vp.height)))
      if (closer === 'x') await P.evaluate(() => document.querySelector('[data-testid="win-lwday-x"]').click()); else await P.keyboard.press('Escape'); await sleep(400)
      notes.push('  left open=' + await P.locator('[data-testid="win-lwday"]').count()); const c = await chk(w, '  after close'); notes.push(c.txt); if (!c.good) allok = false
    }
    await stepScript(w, S + 20); pics.push(await pic(w, `L23-${nm}-pinned`, clip(vp, 300)))
    rec(`L23 ${nm} member`, ok(allok), notes.join(' || '), pics); await w.ctx.close()
  }
}
const OLD = {
  full: () => { const s = CSS.supports.bind(CSS); CSS.supports = (a, b) => /animation-timeline|animation-range|scroll-timeline|timeline-scope/.test(String(a) + String(b ?? '')) ? false : (b === undefined ? s(a) : s(a, b)) },
  partial: () => { const s = CSS.supports.bind(CSS); CSS.supports = (a, b) => /animation-range/.test(String(a) + String(b ?? '')) ? false : (b === undefined ? s(a) : s(a, b)) } }
STEPS.l24 = async () => {
  for (const [nm, vp, touch] of SZ) for (const mode of ['full', 'partial']) {
    const w = await world({ vp, touch, init: OLD[mode] }); const P = w.page; const g0 = await geo(w); const S = g0.S; const notes = []; const pics = []; let allok = true
    const sup = await P.evaluate(() => [CSS.supports('animation-timeline: scroll()'), CSS.supports('animation-range: 0 1px')]); notes.push(`stand-in ${mode}: CSS.supports timeline/range = ${sup}`)
    for (const off of [-40, 3, 120, -10, 200]) { await stepScript(w, S + off); const c = await chk(w, `T${off >= 0 ? '+' : ''}${off}`); notes.push(c.txt); if (!c.good) allok = false }
    pics.push(await pic(w, `L24-${nm}-${mode}-pinned`, clip(vp, 300)))
    await stepScript(w, S + 120); await setSide(w, 0.6); await sleep(300); const cs = await chk(w, 'sideways'); notes.push(cs.txt); if (!cs.good) allok = false; await setSide(w, 0); await sleep(200)
    if (touch) { const r = await pinchRun(w, `old-${mode}`, S + 120, {}); const gaps = r.log.filter(s => s.shown).map(s => Math.abs(s.gap)); const mx = gaps.length ? Math.max(...gaps) : 0; const covered = r.log.filter(s => s.overlapMonths).length; const fin = (r.stF.shown === (r.stF.rowTop < r.stF.tb - 0.5)) && (!r.stF.shown || alignOk(r.fin)); notes.push(`pinch: shown in ${r.log.filter(s => s.shown).length}/${r.log.length} steps, over month buttons ${covered}, max gap ${mx}, settled ok=${fin}`); if (covered || mx > 1.5 || !fin) allok = false; pics.push(...r.pics.slice(0, 1)) }
    await P.evaluate(() => document.querySelector('[data-testid="oil-tracker"]').click()); await sleep(700); await P.evaluate(() => { const b = document.querySelector('[data-testid="lw-tab-grid"]'); b && b.click() }); await sleep(700)
    await stepScript(w, S + 120); const cb = await chk(w, 'after OIL and back'); notes.push(cb.txt); if (!cb.good) allok = false
    rec(`L24 ${nm} old way (${mode} stand-in)`, ok(allok), notes.join(' || ') + ' || STAND-IN: CSS.supports patched; not a real browser without the scroll timeline', pics); await w.ctx.close()
  }
}
STEPS.lplain = async () => {
  for (const who of ['a', 'm']) for (const [nm, vp, touch] of SZ) {
    const w = await world({ vp, touch, who }); const P = w.page; const g0 = await geo(w); const S = g0.S; const notes = []; const pics = []; let allok = true; const step = async (lab, fn) => { try { await fn() } catch (e) { notes.push(`${lab}: COULD NOT (${e.message.split('\n')[0]})`) } const c = await chk(w, lab); notes.push(c.txt); if (!c.good) allok = false }
    const tag = `Lplain-${who === 'a' ? 'admin' : 'member'}-${nm}`
    await step('scroll down a long way', async () => { await stepScript(w, S + 900) }); pics.push(await pic(w, tag + '-1-far', clip(vp, 300)))
    await step('open a day by its date, close by x', async () => { const pt = await dayPt(w, 'copy', 3); await tapPt(w, pt); await sleep(500); notes.push('  panel open=' + await P.locator('[data-testid="win-lwday"]').count()); await P.evaluate(() => { const x = document.querySelector('[data-testid="win-lwday-x"]'); x && x.click() }); await sleep(400) })
    await step('open a day, close by Escape', async () => { const pt = await dayPt(w, 'copy', 5); await tapPt(w, pt); await sleep(500); await P.keyboard.press('Escape'); await sleep(400) })
    await step('place a bid', async () => { await placeLeave(w, '*', 6, /^.?LL ?[0-9]/); pics.push(await pic(w, tag + '-2-bid', clip(vp, vp.height))) })
    if (who === 'a') await step('decide it (Approve)', async () => { const b = await btnByText(P, /^Approve$/); if (b) { await tapPt(w, b); await sleep(500) } else notes.push('  no Approve button seen') })
    await step('close the bid window', async () => { await closeWin(w) })
    await step('open a person', async () => { const pn = await P.evaluate(() => { const b = [...document.querySelectorAll('[data-testid^="person-"]')].find(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.top > 120 && r.bottom < innerHeight && !b.dataset.testid.startsWith('person-window') }); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }); if (!pn) throw new Error('no name in view'); await tapPt(w, pn); await sleep(700); pics.push(await pic(w, tag + '-3-person', clip(vp, vp.height))); await P.keyboard.press('Escape'); await sleep(400) })
    await step('back to the top', async () => { await stepScript(w, 0) }); pics.push(await pic(w, tag + '-4-top', clip(vp, 300)))
    await step('leave the page (OIL) and come back', async () => { await P.evaluate(() => document.querySelector('[data-testid="oil-tracker"]').click()); await sleep(700); await P.evaluate(() => { const b = document.querySelector('[data-testid="lw-tab-grid"]'); b && b.click() }); await sleep(700); await stepScript(w, S + 150) }); pics.push(await pic(w, tag + '-5-back', clip(vp, 300)))
    rec(`L-plain ${who === 'a' ? 'admin' : 'member'} ${nm}`, ok(allok), notes.join(' || '), pics); await w.ctx.close()
  }
}

//STEPS-END
for (const k of ONLY) { if (!STEPS[k]) { console.log('no step', k); continue } try { await STEPS[k]() } catch (e) { rec(k, 'COULD NOT RUN', 'script error: ' + String(e.message).split(String.fromCharCode(10))[0]); console.log(e.stack) } }
console.log('errors', ERRORS.length, JSON.stringify([...new Set(ERRORS)].slice(0, 8)))
writeFileSync(resolve(SCR, 'errors-' + ONLY.join('_') + '.json'), JSON.stringify(ERRORS))
if (CH) await CH.close(); if (WK) await WK.close()
