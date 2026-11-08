/* [LW-PIN-LAST-FRAME] walker Q (8 Nov 26): Quals' pinned heading, walked on the served build (HP_URL, default :4393).
   Run from raptor-port/:   FRESH=1 ONLY=q1,q3 HP_URL=http://localhost:4393 node scripts/handpass/lwpin-walk-q.mjs
   ONLY=<ids> runs some scenarios; FRESH=1 empties the pictures folder first (one run, one folder).
   Rows go to the scratch folder as JSON lines and are printed. "Shown" = computed opacity > 0.5 and visibility not hidden. */
import { existsSync, mkdirSync, rmSync, appendFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { chromium, webkit } from '@playwright/test'
process.env.HP_URL ||= 'http://localhost:4393'
const { BASE, login, go } = await import('./lib.mjs')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '../../docs/img/handpass/2026-11-08-lw-pin-last-frame/walk/Q')
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/ba46d636af5eaefe/bfddd1cb-8b24-453c-b9e5-f54c2d5dd233/scratchpad/walkQ'
if (process.env.FRESH) rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true }); mkdirSync(SCR, { recursive: true })
console.log('walk-Q script v1, base', BASE, 'only', process.env.ONLY || 'all', new Date().toISOString())
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean), want = k => !ONLY.length || ONLY.includes(k)
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PC = { width: 1536, height: 864 }, PH = { width: 402, height: 874 }
const PIN = '[data-testid="qsticky-head"]'
const cr = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
let wk = null; const wkit = async () => (wk ||= await webkit.launch())
const ERRS = []
const ROWS = []
const rec = (id, size, did, expected, saw, status, pics = []) => {
  const r = { id, size, did, expected, saw, status, pics: [].concat(pics).join(', ') }
  ROWS.push(r); appendFileSync(`${SCR}/rows.jsonl`, JSON.stringify(r) + '\n')
  console.log(`[${status}] ${id} | ${size} | ${saw}`.slice(0, 700))
}

/* ---- in-page readers ---- */
const GEO = () => {
  const tb = document.querySelector('.topbar').getBoundingClientRect().bottom
  const hr = document.querySelector('#qtbl thead').getBoundingClientRect()
  const pin = document.querySelector('[data-testid="qsticky-head"]'); let p = null
  if (pin) {
    const cs = getComputedStyle(pin), r = pin.getBoundingClientRect()
    p = { op: +(+cs.opacity).toFixed(2), vis: cs.visibility, shown: +cs.opacity > 0.5 && cs.visibility !== 'hidden', inert: pin.inert, top: +r.top.toFixed(2), left: +r.left.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(2), cls: String(pin.className), shadow: cs.boxShadow, n: document.querySelectorAll('[data-testid="qsticky-head"]').length }
  }
  const tz = getComputedStyle(document.querySelector('#qtbl')).zoom
  return { y: +scrollY.toFixed(2), tb: +tb.toFixed(2), S: +(scrollY + hr.top - tb).toFixed(2), headTop: +hr.top.toFixed(2), headH: +hr.height.toFixed(2), under: document.querySelector('#qtbl thead th').getBoundingClientRect().top < tb - 0.5, maxY: document.documentElement.scrollHeight - innerHeight, fits: document.documentElement.scrollHeight <= innerHeight + 1, zoom: tz, pin: p }
}
const ALIGN = () => {
  const pin = document.querySelector('[data-testid="qsticky-head"]'); if (!pin) return null
  const wr = (document.querySelector('.qwrap') || document.body).getBoundingClientRect()
  let n = 0, mdx = 0, mdw = 0, bad = []
  for (const rt of document.querySelectorAll('#qtbl thead th')) {
    const key = rt.dataset.sort || rt.dataset.col; if (!key) continue
    const cands = [...pin.querySelectorAll('th')].filter(t => (t.dataset.sort || t.dataset.col) === key && t.getBoundingClientRect().width > 0)
    const grp = cands.filter(t => (key === 'cs') === !!t.closest('.qfixed-frozen'))
    const pt = (grp.length ? grp : cands)[0]
    if (!pt) continue
    const a = rt.getBoundingClientRect(), b = pt.getBoundingClientRect()
    if (!a.width || a.left < wr.left - 1 || a.right > wr.right + 1) continue
    n++; const dx = Math.abs(b.left - a.left), dw = Math.abs(b.width - a.width)
    if (dx > mdx) mdx = dx; if (dw > mdw) mdw = dw; if (dx > 2 || dw > 2) bad.push(key)
  }
  const nm = document.querySelector('#qtbl td.qname'), cs = pin.querySelector('.qfixed-frozen th[data-sort="cs"]') || pin.querySelector('th[data-sort="cs"]')
  const namesDx = nm && cs ? +(cs.getBoundingClientRect().left - nm.getBoundingClientRect().left).toFixed(1) : null
  return { compared: n, maxDx: +mdx.toFixed(1), maxDw: +mdw.toFixed(1), bad: bad.slice(0, 5), csOverNamesDx: namesDx }
}
const ARROWS = () => {
  const f = r => [...new Set([...r.querySelectorAll('th')].filter(t => /[▲▼]/.test(t.innerText) && t.getBoundingClientRect().width > 0).map(t => (t.dataset.sort || t.dataset.col) + (/▲/.test(t.innerText) ? '▲' : '▼')))]
  const pin = document.querySelector('[data-testid="qsticky-head"]')
  return { real: f(document.querySelector('#qtbl thead')), pin: pin ? f(pin) : null, names: [...document.querySelectorAll('#qtbl td.qname')].slice(0, 3).map(t => t.innerText.trim()) }
}
const RECTS = () => {
  const o = {}; for (const [k, s] of Object.entries({ bar: '.topbar', edit: '#qEdit', save: '#qSave', exp: '#qExport', filt: '#qFilter', vp: '#qViewP', va: '#qViewA' })) { const e = document.querySelector(s); if (e) { const r = e.getBoundingClientRect(); o[k] = [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] } }
  return o
}

/* ---- worlds ---- */
async function world({ vp, touch = false, engine = 'chromium', reduce = false, who = 'a', url = '/', init = null, scale = 2, noGo = false }) {
  const b = engine === 'webkit' ? await wkit() : cr
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: touch ? scale : 1, acceptDownloads: false, ...(touch ? { isMobile: true, hasTouch: true } : {}), ...(reduce ? { reducedMotion: 'reduce' } : {}) })
  const page = await ctx.newPage(); const tag = `${engine}${vp.width}`
  page.on('pageerror', e => ERRS.push(`${tag} PAGEERROR ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') ERRS.push(`${tag} console ${m.text().slice(0, 150)}`) })
  page.on('response', r => { if (r.status() >= 400) ERRS.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  if (init) await page.addInitScript(init)
  await page.goto(BASE + url); await login(page, who)
  await page.addStyleTag({ content: '*{scroll-behavior:auto!important} #toastEl,.toast,.snack{visibility:hidden!important}' })
  const w = { ctx, page, vp, touch, engine, tag, cdp: engine === 'chromium' ? await ctx.newCDPSession(page) : null }
  if (!noGo) { await go(page, 'quals'); await page.waitForSelector('#qtbl td.qname'); await sleep(900) }
  return w
}
const geo = w => w.page.evaluate(GEO)
const toY = async (w, y) => { await w.page.evaluate(y => scrollTo(0, y), y); await sleep(500); return geo(w) }
const pic = async (w, name, clip) => { const f = `${w.tag}-${name}.png`; await w.page.screenshot({ path: `${OUT}/${f}`, ...(clip ? { clip } : {}) }); return f }
const placed = g => !!g.pin && g.pin.shown && Math.abs(g.pin.top - g.tb) <= 1
const fmt = g => `y=${g.y} S=${g.S} tb=${g.tb} pin=${g.pin ? `${g.pin.shown ? 'SHOWN' : 'hidden'}(op ${g.pin.op},${g.pin.vis},top ${g.pin.top},h ${g.pin.h},inert ${g.pin.inert})` : 'absent'}`
async function tapAt(w, x, y) {
  if (w.touch && w.cdp) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await sleep(90); await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) }
  else if (w.touch) await w.page.touchscreen.tap(x, y)
  else await w.page.mouse.click(x, y)
  await sleep(350)
}
async function finger(w, y0, y1, px, x = 200, rest = 90) {
  let y = y0
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  while (y1 < y0 ? y > y1 : y < y1) { y += y1 < y0 ? -px : px; await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] }); await sleep(16) }
  await sleep(rest); await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(300)
}
const tch = (cdp, type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })
async function pinch(w, cx, cy, d0, d1, { steps = 10, read = null, cancel = false, midScroll = null } = {}) {
  const at = i => { const d = d0 + (d1 - d0) * i / steps; return [[cx - d / 2, cy], [cx + d / 2, cy]] }
  await tch(w.cdp, 'touchStart', [at(0)[0]]); await sleep(30); await tch(w.cdp, 'touchStart', at(0)); await sleep(30)
  const mids = []
  for (let i = 1; i <= steps; i++) {
    await tch(w.cdp, 'touchMove', at(i)); await sleep(16)
    if (midScroll && i === midScroll.at) await w.page.evaluate(y => scrollTo(0, y), midScroll.y)
    if (read && (i === Math.ceil(steps / 2) || i === steps)) { await sleep(100); mids.push(await read()) }
  }
  await tch(w.cdp, cancel ? 'touchCancel' : 'touchEnd', []); await sleep(500)
  return mids
}
const closeAll = async ws => { for (const w of ws) { try { await w.ctx.close() } catch {} } }

/* the screencast comparing machinery, from lwpin-frames.mjs */
let cmp = null
async function getCmp() {
  if (cmp) return cmp
  cmp = await (await cr.newContext()).newPage()
  await cmp.evaluate(() => {
    const load = d => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'data:image/png;base64,' + d })
    const pix = (img, r, s, W, H) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(img, r.x * s, r.y * s, r.w * s, r.h * s, 0, 0, W, H); return g.getImageData(0, 0, W, H).data }
    window.__refs = {}
    window.__setRef = async (k, d, dw) => { const i = await load(d); window.__refs[k] = { i, s: i.naturalWidth / dw } }
    window.__cmp = async (d, dw, k, r) => {
      const i = await load(d), s = i.naturalWidth / dw, ref = window.__refs[k], W = Math.round(r.w * s), H = Math.round(r.h * s)
      const a = pix(i, r, s, W, H), b = pix(ref.i, r, ref.s, W, H); let n = 0, sum = 0
      for (let p = 0; p < a.length; p += 4) { const m = Math.max(Math.abs(a[p] - b[p]), Math.abs(a[p + 1] - b[p + 1]), Math.abs(a[p + 2] - b[p + 2])); sum += m; if (m > 40) n++ }
      return { frac: +(n / (W * H)).toFixed(4), mean: +(sum / (W * H)).toFixed(2) }
    }
  })
  return cmp
}
const castOpts = w => ({ format: 'png', everyNthFrame: 1, maxWidth: w.vp.width * (w.touch ? 2 : 1), maxHeight: w.vp.height * (w.touch ? 2 : 1) })
async function cast(w, fn) {
  const frames = []
  w.cdp.on('Page.screencastFrame', async f => { frames.push({ data: f.data, y: f.metadata.scrollOffsetY, dw: f.metadata.deviceWidth, t: f.metadata.timestamp }); try { await w.cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }) } catch {} })
  await w.cdp.send('Page.startScreencast', castOpts(w)); await sleep(400)
  await fn(); await sleep(900)
  await w.cdp.send('Page.stopScreencast'); w.cdp.removeAllListeners('Page.screencastFrame')
  return frames
}
async function restFrame(w, y) {
  await w.page.evaluate(y => scrollTo(0, y), y); await sleep(350)
  await w.page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
  let got = null
  w.cdp.on('Page.screencastFrame', async f => { if (!got) got = { data: f.data, y: f.metadata.scrollOffsetY, dw: f.metadata.deviceWidth }; try { await w.cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }) } catch {} })
  await w.cdp.send('Page.startScreencast', castOpts(w))
  for (let i = 0; i < 20 && !got; i++) await sleep(100)
  await w.cdp.send('Page.stopScreencast'); w.cdp.removeAllListeners('Page.screencastFrame')
  if (!got) { const s = await w.cdp.send('Page.captureScreenshot', { format: 'png' }); got = { data: s.data, y: await w.page.evaluate(() => scrollY), dw: w.vp.width } }
  return got
}
async function sheet(name, frames, band, z) {
  const ctx = await cr.newContext({ viewport: { width: 1100, height: 400 } }), p = await ctx.newPage()
  await p.setContent(`<html><body style="margin:0;background:#0b0f14;color:#e8edf2;font:600 12px system-ui;display:flex;flex-wrap:wrap;gap:6px;padding:6px">${frames.map(f => `
    <div><div style="color:${f.bad ? '#ffb020' : '#9aa7b4'}">${f.label}</div><div style="border:${f.bad ? '3px solid #ffb020' : '1px solid #2a323b'};width:${band.w * z}px;height:${band.h * z}px;overflow:hidden;position:relative">
    <img src="data:image/png;base64,${f.data}" style="position:absolute;left:0;top:0;transform-origin:0 0;transform:translate(${-band.x * z}px,${-band.y * z}px) scale(${z / f.s})"></div></div>`).join('')}</body></html>`)
  await sleep(300); await p.setViewportSize({ width: 1100, height: await p.evaluate(() => document.body.scrollHeight) })
  await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true }); await ctx.close()
}

/* ================= scenarios ================= */

async function q1() {
  for (const [vp, touch] of [[PC, false], [PH, true]]) {
    const w = await world({ vp, touch, reduce: true }), sz = `${vp.width} Chromium reduce-motion`
    try {
      const g0 = await toY(w, 0), S = g0.S, steps = []
      const checks = [['top', 0, false], ['justAboveT', S - 3, false], ['justPastT', S + 3, true], ['wellPast', S + 200, true], ['backTop', 0, false]]
      const pics = []; let ok = true
      for (const [n, y, exp] of checks) {
        const g = await toY(w, Math.max(0, y)); const good = g.pin && g.pin.shown === exp && (!exp || placed(g)); if (!good) ok = false
        steps.push(`${n}: ${g.pin?.shown ? 'shown' : 'hidden'} op ${g.pin?.op} top ${g.pin?.top} tb ${g.tb} (want ${exp ? 'shown' : 'hidden'})`)
        pics.push(await pic(w, `q1-${n}`))
      }
      rec('Q1', sz, 'scroll to top, T-3, T+3, T+200, top (T=' + S + ')', 'hidden at top and just above T; shown, under the bar, past T', steps.join('; '), ok ? 'PASS' : 'FAIL', pics)
    } finally { await closeAll([w]) }
  }
}

async function q3() {
  const w = await world({ vp: PC }), sz = '1536 Chromium'
  try {
    const g0 = await toY(w, 0)
    const tabSeq = async n => {
      const seq = []; await w.page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(window.scrollX, window.scrollY) })
      await w.page.mouse.click(5, 300); await sleep(100)
      for (let i = 0; i < n; i++) {
        await w.page.keyboard.press('Tab')
        seq.push(await w.page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return 'body'; return (a.id ? '#' + a.id : a.tagName.toLowerCase() + (a.dataset.sort ? '[' + a.dataset.sort + ']' : '')) + (a.closest('[data-testid="qsticky-head"]') ? ' IN-COPY' : '') }))
      }
      return seq
    }
    const hidden = await w.page.evaluate(() => { const p = document.querySelector('[data-testid="qsticky-head"]'); return p ? { inert: p.inert, ariaHidden: p.getAttribute('aria-hidden'), focusable: p.querySelectorAll('button,a,input,[tabindex]').length } : null })
    const seqTop = await tabSeq(30)
    const inCopyTop = seqTop.filter(s => s.includes('IN-COPY')).length
    rec('Q3a', sz, 'at the top: Tab 30 times through the page', 'focus never lands in the hidden copy; copy is inert', `inert=${hidden?.inert}, aria-hidden=${hidden?.ariaHidden}, focusable inside=${hidden?.focusable}; ${inCopyTop} stops in copy of 30; first stops: ${seqTop.slice(0, 12).join(' > ')}`, hidden && hidden.inert && inCopyTop === 0 ? 'PASS' : 'FAIL', [await pic(w, 'q3-top')])
    const g1 = await toY(w, g0.S + 200)
    const st = await w.page.evaluate(() => { const p = document.querySelector('[data-testid="qsticky-head"]'); return { inert: p.inert, ariaHidden: p.getAttribute('aria-hidden'), role: p.getAttribute('role') } })
    let tree = ''
    try { tree = await w.page.locator('[data-testid="qsticky-head"]').ariaSnapshot() } catch (e) { tree = 'ariaSnapshot failed: ' + String(e.message).slice(0, 80) }
    let treeReal = ''
    try { treeReal = await w.page.locator('#qtbl thead').ariaSnapshot() } catch (e) { treeReal = 'failed' }
    const pPast = await pic(w, 'q3-past')
    await w.page.evaluate(() => { document.querySelector('#qFilter').focus({ preventScroll: true }) })
    const seq = []; let yMoved = []
    for (let i = 0; i < 20; i++) {
      await w.page.keyboard.press('Tab')
      seq.push(await w.page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return 'body'; return (a.id ? '#' + a.id : a.tagName.toLowerCase() + (a.dataset.sort ? '[' + a.dataset.sort + ']' : '')) + (a.closest('[data-testid="qsticky-head"]') ? ' IN-COPY' : '') + '@y' + Math.round(scrollY) }))
    }
    const inCopy = seq.filter(s => s.includes('IN-COPY'))
    rec('Q3b', sz, 'past T (T+200): read the copy inert/aria state and its accessible tree BEFORE any key; then focus the filter without scrolling and Tab 20 times', 'RECORD what Tab reaches, and whether the tree is exposed', `${fmt(g1)}; copy inert=${st.inert} aria-hidden=${st.ariaHidden} (page shows it, pinned); copy accessible tree: "${tree.replace(/\s+/g, ' ').slice(0, 200)}"; real heading tree: "${treeReal.replace(/\s+/g, ' ').slice(0, 100)}..."; Tab from filter: ${seq.join(' > ')}; stops in copy ${inCopy.length}`, 'RECORDED', [pPast])
  } finally { await closeAll([w]) }
}

const READ_PINCH = w => async () => ({ g: await geo(w), al: await w.page.evaluate(ALIGN), r: await w.page.evaluate(RECTS) })
async function q45() {
  let w = await world({ vp: PH, touch: true }); const sz = '402 Chromium touch'
  const renew = async () => { await closeAll([w]); w = await world({ vp: PH, touch: true }); return (await toY(w, 0)).S }
  try {
    const g0 = await toY(w, 0); let S = g0.S
    const base = await w.page.evaluate(RECTS)
    const judge = (mid, label) => {
      const out = []; let ok = true
      for (const m of mid) {
        const hid = m.g.pin && !m.g.pin.shown
        const wantShown = m.g.under
        const rectsSame = JSON.stringify(m.r.bar) === JSON.stringify(base.bar) && ['edit', 'exp', 'filt', 'vp'].every(k => !base[k] || !m.r[k] || Math.abs(m.r[k][2] - base[k][2]) <= 1 && Math.abs(m.r[k][3] - base[k][3]) <= 1)
        const noShadow = !m.g.pin || m.g.pin.shadow === 'none'
        if (m.g.pin && m.g.pin.shown !== wantShown) ok = false
        if (m.g.pin?.shown && !placed(m.g)) ok = false
        if (!noShadow) ok = false
        if (!rectsSame) ok = false
        out.push(`${label}: y=${m.g.y} S=${m.g.S} zoom=${m.g.zoom} copy ${m.g.pin?.shown ? 'shown' : 'hidden'}(top ${m.g.pin?.top}/tb ${m.g.tb}) realUnder=${m.g.under} shadow=${m.g.pin?.shadow === 'none' ? 'none' : m.g.pin?.shadow?.slice(0, 20)} cls=${m.g.pin?.cls.replace(/\s+/g, '.')} align dx<=${m.al?.maxDx} dw<=${m.al?.maxDw} csOverNames ${m.al?.csOverNamesDx} chrome same=${rectsSame}`)
      }
      return { ok, text: out.join(' | ') }
    }
    let mid
    // picture at mid requires a held pinch: take it by a second run with a held pinch
    const takeMid = async (name, y, d0, d1, opt = {}) => {
      await toY(w, y)
      const at = i => { const d = d0 + (d1 - d0) * i / 10; return [[200 - d / 2, 500], [200 + d / 2, 500]] }
      await tch(w.cdp, 'touchStart', [at(0)[0]]); await sleep(30); await tch(w.cdp, 'touchStart', at(0)); await sleep(30)
      for (let i = 1; i <= 5; i++) { await tch(w.cdp, 'touchMove', at(i)); await sleep(16) }
      await sleep(150); const p1 = await pic(w, name + '-mid'); const m1 = await READ_PINCH(w)()
      for (let i = 6; i <= 10; i++) { await tch(w.cdp, 'touchMove', at(i)); await sleep(16) }
      await sleep(150); const m2 = await READ_PINCH(w)()
      await tch(w.cdp, opt.cancel ? 'touchCancel' : 'touchEnd', []); await sleep(100); const p2 = await pic(w, name + '-lift'); await sleep(500); const p3 = await pic(w, name + '-after'); const gA = await geo(w)
      return { mids: [m1, m2], pics: [p1, p2, p3], after: gA, alAfter: await w.page.evaluate(ALIGN) }
    }
    const zoomReset = async () => { await toY(w, 0) }
    let r = await takeMid('q4-out-pastT', S + 150, 80, 280)
    let j = judge(r.mids, 'out past T')
    rec('Q4a', sz, 'part-way down (T+150), pinch OUT (fingers 80->280) held; read mid and at the lift', 'copy shown (real row under bar) with no shadow, aligned; top bar/Edit/Export/filter/switch keep size; no row cut or doubled', `${j.text} | after lift: ${fmt(r.after)} align dx<=${r.alAfter?.maxDx}`, j.ok ? 'PASS' : 'FAIL', r.pics)
    S = await renew(); r = await takeMid('q4-in-pastT', S + 150, 280, 80)
    j = judge(r.mids, 'in past T')
    rec('Q4b', sz, 'part-way down (T+150), pinch IN (fingers 280->80) held', 'as Q4a', `${j.text} | after lift: ${fmt(r.after)} align dx<=${r.alAfter?.maxDx}`, j.ok ? 'PASS' : 'FAIL', r.pics)
    // across T both ways: pinch begun before T, page scrolled across T mid-pinch (stand-in for the pinch's own scroll)
    const S2 = await renew()
    mid = await pinch(w, 200, 500, 200, 120, { read: READ_PINCH(w), midScroll: { at: 4, y: S2 + 60 } })
    j = judge(mid, 'begun before T, scrolled to T+60 mid-pinch')
    rec('Q4c', sz, 'pinch begun at T-ish above (scrollY 0), page scrolled across T to T+60 mid-pinch (programmatic scrollTo as stand-in for the pinch\'s own page scroll)', 'copy follows the rule (shown iff real row under bar), no shadow, chrome unchanged', j.text + ' | after: ' + fmt(await geo(w)), j.ok ? 'PASS' : 'FAIL', [await pic(w, 'q4c-after')])
    const S3 = await renew(); const g3 = await toY(w, S3 + 150)
    mid = await pinch(w, 200, 500, 200, 120, { read: READ_PINCH(w), midScroll: { at: 4, y: Math.max(0, g3.S - 60) } })
    j = judge(mid, 'begun past T, scrolled to T-60 mid-pinch')
    rec('Q4d', sz, 'pinch begun past T, page scrolled back across T to T-60 mid-pinch (stand-in)', 'as Q4c', j.text + ' | after: ' + fmt(await geo(w)), j.ok ? 'PASS' : 'FAIL', [await pic(w, 'q4d-after')])
    // Q5: begun before T then released; one cancelled
    const S5 = await renew()
    r = await takeMid('q5-released-beforeT', Math.max(0, S5 - 80), 80, 240)
    j = judge(r.mids, 'released before T')
    rec('Q5a', sz, 'pinch begun before T (T-80), released before T', 'copy hidden while the real row is below the bar; nothing over the month/switch; no cut row', `${j.text} | after: ${fmt(r.after)}`, j.ok ? 'PASS' : 'FAIL', r.pics)
    const S6 = await renew()
    r = await takeMid('q5-cancelled-pastT', S6 + 150, 80, 240, { cancel: true })
    j = judge(r.mids, 'cancelled past T')
    rec('Q5b', sz, 'pinch past T, cancelled (touchCancel) instead of lifted', 'copy still correct after the cancel; no stuck q-pinching class', `${j.text} | after cancel: ${fmt(r.after)} cls=${r.after.pin?.cls}`, j.ok && !/q-pinching/.test(r.after.pin?.cls || '') ? 'PASS' : 'FAIL', r.pics)
  } finally { await closeAll([w]) }
}

async function q6() {
  for (const [vp, touch] of [[PC, false], [PH, true]]) {
    const w = await world({ vp, touch, url: '/?savefail' }), sz = `${vp.width} Chromium /?savefail`
    try {
      let g = await toY(w, 0); const S = g.S
      await w.page.click('#qEdit'); await sleep(500)
      g = await toY(w, (await geo(w)).S + 160)
      const cell = w.page.locator('td.qcell[data-q]:not(.qro)').first()
      const before = await cell.innerText()
      const pre = await geo(w)
      await cell.scrollIntoViewIfNeeded().catch(() => {})
      await toY(w, (await geo(w)).S + 160)
      const box = await cell.boundingBox()
      const frames = []
      await w.page.evaluate(() => { window.__fr = []; const t = () => { const p = document.querySelector('[data-testid="qsticky-head"]'); const b = document.querySelector('.topbar').getBoundingClientRect().bottom; const band = [...document.querySelectorAll('*')].find(e => e.children.length < 3 && /not saved/i.test(e.innerText || '') && e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().height < 120); const br = band ? band.getBoundingClientRect() : null; window.__fr.push({ pinTop: p ? +p.getBoundingClientRect().top.toFixed(1) : null, shown: p ? +getComputedStyle(p).opacity > 0.5 : null, tb: +b.toFixed(1), bandBottom: br ? +br.bottom.toFixed(1) : null }); if (window.__fr.length < 40) requestAnimationFrame(t) }; requestAnimationFrame(t) })
      await w.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      await sleep(120); const first = await pic(w, 'q6-first-frames'); await sleep(900)
      const fr = await w.page.evaluate(() => window.__fr)
      const after = await geo(w); const aft = await cell.innerText()
      const bandInfo = await w.page.evaluate(() => { const band = [...document.querySelectorAll('*')].find(e => e.children.length < 3 && /not saved/i.test(e.innerText || '') && e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().height < 120); const r = band ? band.getBoundingClientRect() : null; return r ? { top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), text: band.innerText.trim().slice(0, 40) } : null })
      const settled = await pic(w, 'q6-settled')
      const gaps = fr.filter(f => f.pinTop != null && f.shown).map(f => +(f.pinTop - (f.bandBottom ?? f.tb)).toFixed(1))
      const worst = gaps.length ? Math.max(...gaps.map(Math.abs)) : null
      const ok = !!bandInfo && placed(after) && Math.abs(after.pin.top - (bandInfo.bottom)) <= 1.5 && after.tb >= bandInfo.bottom - 1.5
      rec('Q6', sz, `Enable editing, pinned at T+160, tick a cell (${before.trim() || '(empty)'} -> ${aft.trim() || '(empty)'}), save refused`, 'copy flush under the band foot, no gap, nothing covered', `band=${JSON.stringify(bandInfo)}; after: ${fmt(after)}; per-frame gap pin-vs-band-foot over ${gaps.length} shown frames: worst |gap| ${worst}; bar foot tb ${after.tb}`, bandInfo ? (ok ? 'PASS' : 'FAIL') : 'NOT WALKED', [first, settled])
    } finally { await closeAll([w]) }
  }
}

async function q7() {
  for (const [vp, touch] of [[PC, false], [PH, true]]) {
    const w = await world({ vp, touch }), sz = `${vp.width} Chromium`
    try {
      await w.page.addStyleTag({ content: '* { overflow-anchor: none !important; }' })
      const actions = [
        ['EnableEditing', async () => w.page.evaluate(() => document.querySelector('#qEdit').click())],
        ['EditQualsIn', async () => w.page.evaluate(() => document.querySelector('#qEditQuals').click())],
        ['EditQualsOut', async () => w.page.evaluate(() => document.querySelector('#qEditQuals').click())],
        ['DoneEditing', async () => w.page.evaluate(() => document.querySelector('#qSave').click())],
      ]
      for (const side of ['T+2', 'T-2']) {
        const rows = []; let ok = true; const pics = []
        for (const [n, fn] of actions) {
          const S = (await geo(w)).S
          await toY(w, Math.max(0, S + (side === 'T+2' ? 2 : -2)))
          const pre = await geo(w)
          // act and read in the first painted frame after
          await w.page.evaluate(() => { window.__first = null; const r = () => { const p = document.querySelector('[data-testid="qsticky-head"]'); const tb = document.querySelector('.topbar').getBoundingClientRect().bottom; const hr = document.querySelector('#qtbl thead').getBoundingClientRect(); window.__first = { shown: p ? +getComputedStyle(p).opacity > 0.5 && getComputedStyle(p).visibility !== 'hidden' : null, under: hr.top < tb - 0.5, y: scrollY }; }; window.__arm = () => requestAnimationFrame(() => requestAnimationFrame(r)) })
          const loc = await fn().then(() => 'ok').catch(e => 'ERR ' + String(e.message).slice(0, 60))
          await w.page.evaluate(() => window.__arm())
          await sleep(60)
          const first = await w.page.evaluate(() => window.__first)
          await sleep(500); const settled = await geo(w)
          const agree1 = first && first.shown === first.under, agree2 = !!settled.pin && settled.pin.shown === settled.under
          if (loc !== 'ok' || !agree1 || !agree2) ok = false
          rows.push(`${n}@${side}: ${loc}; pre ${pre.pin.shown ? 'shown' : 'hidden'}; first frame shown=${first?.shown} realUnder=${first?.under}; settled shown=${settled.pin?.shown} under=${settled.under} (S now ${settled.S}, y ${settled.y})`)
          if (n === 'EnableEditing' || n === 'EditQualsIn') pics.push(await pic(w, `q7-${side.replace('+', 'p').replace('-', 'm')}-${n}`))
        }
        rec(`Q7-${side}`, sz, `stay at ${side}: Enable editing, Edit quals in/out, Done (no scroll between; page overflow-anchor off to play the iPhone)`, 'copy shown iff the real heading is under the bar, in the first painted frame after each action and settled', rows.join(' || '), ok ? 'PASS' : 'FAIL', pics)
      }
      rec('Q7-returnee', sz, 'a returnee notice Later', 'copy follows the same rule', 'The notice needs an archived man restored on Admin -> Users (a multi-step set-up through another page); not walked in this run', 'NOT WALKED')
    } finally { await closeAll([w]) }
  }
}

async function q9() {
  for (const [vp, touch] of [[PC, false], [PH, true]]) {
    const w = await world({ vp, touch }), sz = `${vp.width} Chromium`
    try {
      const rows = []; let ok = true; const pics = []
      const look = async (label, expectFit) => {
        await w.page.evaluate(() => scrollTo(0, 99999)); await sleep(500)
        const g = await geo(w); const rowsN = await w.page.locator('#qtbl td.qname').count()
        const good = g.fits ? !(g.pin && g.pin.shown) : (g.pin && g.pin.shown)
        if (!good) ok = false
        rows.push(`${label}: rows ${rowsN}, fits ${g.fits}, copy ${g.pin?.shown ? 'SHOWN' : 'hidden'}`)
        return g
      }
      await w.page.locator('#qFilter').fill('Saber'); await sleep(500); await look('one man (Saber)'); pics.push(await pic(w, 'q9-one'))
      await w.page.locator('#qFilter').fill('zzzqqq'); await sleep(500); await look('no match'); pics.push(await pic(w, 'q9-nomatch'))
      await w.page.locator('#qFilter').fill(''); await sleep(500); await look('cleared'); pics.push(await pic(w, 'q9-cleared'))
      for (const v of ['qViewP', 'qViewW', 'qViewG', 'qViewA']) { await w.page.click('#' + v); await sleep(500); await look(v) }
      rec('Q9', sz, 'filter one man, nothing, clear; each of the four views; scroll to the foot each time', 'copy never shown when the page fits; pinning back when it grows', rows.join(' | '), ok ? 'PASS' : 'FAIL', pics)
    } finally { await closeAll([w]) }
  }
}

async function blinkCases(id, vp, touch, dirs) {
  const w = await world({ vp, touch }), sz = `${vp.width} Chromium${touch ? ' touch' : ''}`
  try {
    await getCmp()
    const g0 = await toY(w, 0); const yUp = Math.min(g0.maxY, g0.S + 220)
    const up = await restFrame(w, yUp); const gUp = await geo(w)
    const wh = await w.page.evaluate(() => ({ x: 0 })); void wh
    const pr = await w.page.evaluate(() => { const r = document.querySelector('[data-testid="qsticky-head"]').getBoundingClientRect(); return { x: r.left, w: r.width, h: r.height } })
    const band = { x: Math.max(0, pr.x), y: gUp.tb, w: Math.min(vp.width, pr.x + pr.w) - Math.max(0, pr.x) - (touch ? 0 : 2), h: pr.h }
    await cmp.evaluate(([d, dw]) => window.__setRef('pinned', d, dw), [up.data, up.dw])
    const refAt = {}
    const refKey = async y => { const k = (Math.round(y * 2) / 2).toFixed(1); if (!(k in refAt)) { const f = await restFrame(w, +k); refAt[k] = Math.abs(f.y - +k) <= 0.6 ? 'y' + k : null; if (refAt[k]) await cmp.evaluate(([kk, d, dw]) => window.__setRef(kk, d, dw), [refAt[k], f.data, f.dw]) } return refAt[k] }
    const RUNS = +(process.env.RUNS || 5)
    const results = []
    for (const dir of dirs) {
      let blinkTotal = 0, nearTotal = 0, unchecked = 0; const at = []
      for (let run = 0; run < RUNS; run++) {
        const start = dir === 'up' ? Math.min(g0.maxY, g0.S + (touch ? 420 : 260)) : 0
        await w.page.evaluate(y => scrollTo(0, y), start); await sleep(700); await w.page.mouse.move(Math.min(700, vp.width / 2), Math.min(600, vp.height - 100))
        const frames = await cast(w, async () => {
          if (touch) { if (dir === 'down') await finger(w, 760, 260, 45, 200, 5); else if (dir === 'up') await finger(w, 260, 760, 45, 200, 5); else { await finger(w, 760, 260, 45, 200, 5); await finger(w, 260, 760, 45, 200, 5) } }
          else if (dir === 'reverse') { for (let i = 0; i < 4; i++) { await w.page.mouse.wheel(0, 100); await sleep(80) } for (let i = 0; i < 4; i++) { await w.page.mouse.wheel(0, -100); await sleep(80) } }
          else for (let i = 0; i < 4; i++) { await w.page.mouse.wheel(0, dir === 'down' ? 100 : -100); await sleep(80) }
        })
        const out = []
        for (const f of frames) {
          const pinned = f.y >= g0.S + 0.5; const k = pinned ? 'pinned' : await refKey(f.y)
          const c = k ? await cmp.evaluate(([d, dw, kk, r]) => window.__cmp(d, dw, kk, r), [f.data, f.dw, k, band]) : null
          out.push({ y: +f.y.toFixed(1), ...(c || { frac: null }), bad: c ? c.frac > 0.02 : null, data: f.data, s: 1 })
        }
        const bad = out.filter(o => o.bad), near = out.filter(o => Math.abs(o.y - g0.S) <= 160)
        blinkTotal += bad.length; nearTotal += near.length; unchecked += out.filter(o => o.bad === null).length; bad.forEach(b => at.push(`${b.y}(${b.frac})`))
        if (run === 0) { const pick = out.filter(o => o.y >= g0.S - band.h - 40 && o.y <= g0.S + 240).slice(0, 24); await sheet(`${w.tag}-${id}-${dir}-sheet`, (pick.length ? pick : out.slice(0, 24)).map(o => ({ label: `y=${o.y}${o.y >= g0.S + 0.5 ? ' past' : ''}${o.bad ? ' BLINK' : ''}`, data: o.data, bad: o.bad, s: touch ? 2 : 1 })), { x: 0, y: Math.max(0, band.y - 30), w: Math.min(vp.width, touch ? 402 : 760), h: band.h + 60 }, touch ? 0.8 : 0.9) }
      }
      results.push({ dir, blinkTotal, nearTotal, unchecked, at: at.slice(0, 6) })
    }
    return { sz, S: g0.S, results, band, sheets: dirs.map(d => `${w.tag}-${id}-${d}-sheet.png`) }
  } finally { await closeAll([w]) }
}
async function q10() {
  for (const [vp, touch] of [[PC, false], [PH, true]]) {
    const r = await blinkCases('q10', vp, touch, ['down', 'up', 'reverse'])
    const ok = r.results.every(x => x.blinkTotal === 0)
    rec('Q10', r.sz, `${touch ? 'finger (200,760)->(200,260) and back' : 'four 100px wheel steps 80ms apart and back'}; 5 runs per way via the screencast, each frame's band compared with the page at rest`, 'no painted frame shows the heading cut, missing or doubled', r.results.map(x => `${x.dir}: ${x.blinkTotal} blink frames (${x.nearTotal} frames near T, ${x.unchecked} unchecked) ${x.at.join(' ')}`).join(' | ') + ` (T=${r.S})`, ok ? 'PASS' : 'FAIL', r.sheets)
  }
}

async function q11() {
  const rows = []; let ok = true; const pics = []
  await getCmp()
  for (const scale of [2, 3]) {
    const w = await world({ vp: PH, touch: true, scale }); const sz = `402 Chromium scale ${scale}`
    try {
      const states = [['default', null]]
      if (scale === 2) states.push(['zoomed-out', [200, 40]], ['zoomed-in', [40, 300]])
      for (const [name, pz] of states) {
        if (pz) { for (let k = 0; k < 3; k++) await pinch(w, 200, 500, pz[0] > pz[1] ? 300 : 60, pz[0] > pz[1] ? 40 : 300); await toY(w, 0) }
        let g0 = await toY(w, 0); const S = g0.S
        if (g0.fits) { rows.push(`[scale ${scale}, ${name}, zoom ${g0.zoom}] the page fits the screen at this zoom (scrollHeight <= screen): no scroll, so no crossing to walk; copy ${g0.pin.shown ? 'SHOWN' : 'hidden'}`); if (g0.pin.shown) ok = false; pics.push(await pic(w, `q11-s${scale}-${name}-fits`)); continue }
        const shot = async () => (await w.cdp.send('Page.captureScreenshot', { format: 'png' })).data
        const pr = await w.page.evaluate(() => { const r = document.querySelector('[data-testid="qsticky-head"]').getBoundingClientRect(); return { x: r.left, w: r.width, h: r.height } })
        await toY(w, Math.min(g0.maxY, S + 220)); const gU = await geo(w)
        const band = { x: Math.max(0, pr.x), y: gU.tb, w: Math.min(402, pr.x + pr.w) - Math.max(0, pr.x), h: pr.h }
        await cmp.evaluate(([d]) => window.__setRef('p', d, 402), [await shot()])
        const out = []
        for (const d of [-1, -0.75, -0.5, -0.25, 0, 1]) {
          await w.page.evaluate(y => scrollTo(0, y), S + d); await sleep(450)
          const g = await geo(w); const c = await cmp.evaluate(([dd, r]) => window.__cmp(dd, 402, 'p', r), [await shot(), band])
          const atT = g.y >= S + 0.02
          let good
          if (atT) good = g.pin.shown && placed(g) && c.frac <= 0.02
          else good = !g.pin.shown && g.headTop >= g.tb - 0.01
          if (!good) ok = false
          out.push(`T${d >= 0 ? '+' : ''}${d}->y ${g.y}: ${g.pin.shown ? 'shown' : 'hidden'} top ${g.pin.top} tb ${g.tb} realTop ${g.headTop}${g.pin.shown ? ` bandDiff ${c.frac}` : ''}`)
          if (d === -0.25 || d === 0) pics.push(await pic(w, `q11-s${scale}-${name}-T${d}`, { x: 0, y: Math.max(0, g.tb - 20), width: 402, height: 90 }))
        }
        rows.push(`[scale ${scale}, ${name}, zoom ${g0.zoom}] ${out.join('; ')}`)
      }
    } finally { await closeAll([w]) }
  }
  rec('Q11', '402 Chromium scale 2 and 3', 'scroll to T-1, -0.75, -0.5, -0.25, T, T+1 at default zoom (scale 2 and 3), and zoomed fully out and in (scale 2)', 'no see-through heading, no seam (copy shown iff at/after T, identical to pinned reference)', rows.join(' || '), ok ? 'PASS' : 'FAIL', pics)
}

async function q12() {
  for (const [vp, touch] of [[PC, false], [PH, true]]) {
    const w = await world({ vp, touch }), sz = `${vp.width} Chromium`
    try {
      const S = (await toY(w, 0)).S; const rows = []; let ok = true; const pics = []
      const wrapMax = await w.page.evaluate(() => { const e = document.querySelector('.qwrap'); return e.scrollWidth - e.clientWidth })
      for (const [n, frac] of [['left', 0], ['middle', 0.5], ['right', 1]]) {
        await toY(w, S - 25); await w.page.evaluate(x => { document.querySelector('.qwrap').scrollLeft = x }, Math.round(wrapMax * frac)); await sleep(300)
        await w.page.evaluate(y => scrollTo(0, y), S + 25); await sleep(500)  // crossing T while at this sideways position
        const g = await geo(w); const al = await w.page.evaluate(ALIGN); const sl = await w.page.evaluate(() => document.querySelector('.qwrap').scrollLeft)
        const good = placed(g) && al && al.compared >= 2 && al.maxDx <= 2 && al.maxDw <= 2 && (al.csOverNamesDx == null || Math.abs(al.csOverNamesDx) <= 2)
        if (!good) ok = false
        rows.push(`${n} (scrollLeft ${sl}/${wrapMax}): ${fmt(g)}; ${al ? `compared ${al.compared} headings, maxDx ${al.maxDx}, maxDw ${al.maxDw}, cs-over-names dx ${al.csOverNamesDx}` : 'no copy'}`)
        pics.push(await pic(w, `q12-${n}`))
        // and sideways while pinned, then back across T
        await w.page.evaluate(y => scrollTo(0, y), S - 25); await sleep(400)
      }
      rec('Q12', sz, 'table at left/middle/right sideways, cross T (T-25 -> T+25) at each; compare each copy heading with the real one', 'each heading over its own column, callsign heading over the names', rows.join(' | '), ok ? 'PASS' : 'FAIL', pics)
    } finally { await closeAll([w]) }
  }
}

async function q14() {
  for (const [vp, touch] of [[PC, false], [PH, true]]) {
    const w = await world({ vp, touch }), sz = `${vp.width} Chromium`
    try {
      const S = (await toY(w, 0)).S; const rows = []; let ok = true; const pics = []
      const keys = await w.page.evaluate(() => [...document.querySelectorAll('#qtbl thead th')].map(t => t.dataset.sort || t.dataset.col).filter(Boolean))
      const centre = (sel, key) => w.page.evaluate(([sel, key]) => { const root = sel === 'pin' ? document.querySelector('[data-testid="qsticky-head"]') : document.querySelector('#qtbl thead'); const t = [...root.querySelectorAll('th')].filter(t => (key === 'AUTO' ? ((t.dataset.sort || t.dataset.col) && !['cs', 'initials'].includes(t.dataset.sort) && t.getBoundingClientRect().left > 120) : (t.dataset.sort || t.dataset.col) === key) && t.getBoundingClientRect().width > 0 && t.getBoundingClientRect().left >= 0 && t.getBoundingClientRect().right <= innerWidth).pop(); if (!t) return null; const r = t.getBoundingClientRect(); const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { x: r.left + r.width / 2, y: r.top + r.height / 2, hit: at ? (at.closest('[data-testid="qsticky-head"]') ? 'copy' : at.closest('#qtbl thead') ? 'real' : at.tagName) : null } }, [sel, key])
      const step = async (label, sel, key, expectHit, y, prep = null) => {
        await toY(w, y); if (prep) await prep()
        const c = await centre(sel, key)
        if (!c || c.hit !== expectHit) { rows.push(`${label}: NOT WALKED (no ${sel} heading ${key} to press: ${JSON.stringify(c)})`); return }
        const pk = await w.page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const t = e && e.closest('th'); return t ? (t.dataset.sort || t.dataset.col) : null }, [c.x, c.y]); if (key === 'AUTO') key = pk; 
        const before = await w.page.evaluate(ARROWS); await tapAt(w, c.x, c.y)
        const a = await w.page.evaluate(ARROWS)
        const good = a.real.length === 1 && a.real[0].startsWith(key || 'x') && a.pin && a.pin.length === 1 && a.pin[0] === a.real[0]
        if (!good) ok = false
                rows.push(`${label}: pressed ${key} on the ${sel} (${c.hit}); arrows real=${a.real.join()} copy=${a.pin?.join()}; first names ${before.names.join('/')} -> ${a.names.join('/')}`)
        pics.push(await pic(w, `q14-${label}`))
      }
      await step('real-at-Tm40', 'real', 'initials', 'real', S - 40)
      await step('copy-at-Tp40', 'pin', 'flight', 'copy', S + 40)
      await step('copy-callsign', 'pin', 'cs', 'copy', S + 40)
      const sideways = async () => { await w.page.evaluate(() => { const e = document.querySelector('.qwrap'); e.scrollLeft = Math.round((e.scrollWidth - e.clientWidth) * 0.5) }); await sleep(400) }
      const midKey = await w.page.evaluate(() => { const e = document.querySelector('.qwrap'); const wr = e.getBoundingClientRect(); const pin = document.querySelector('[data-testid="qsticky-head"]'); const t = [...pin.querySelectorAll('th')].filter(t => { const r = t.getBoundingClientRect(); return (t.dataset.sort || t.dataset.col) && r.width > 0 && r.left > wr.left + 120 && r.right < wr.right - 10 })[0]; return t ? (t.dataset.sort || t.dataset.col) : null })
      await step('copy-callsign-again-toggles', 'pin', 'cs', 'copy', S + 40)
      await step('copy-after-sideways', 'pin', 'AUTO', 'copy', S + 40, sideways)
      // straight after crossing T: scroll and press within ~one frame
      await toY(w, S - 30); await w.page.evaluate(() => { document.querySelector('.qwrap').scrollLeft = 0 }); await sleep(300)
      const c0 = await centre('real', 'cat')
      if (c0) {
        const px = c0.x, py = (await w.page.evaluate(() => document.querySelector('.topbar').getBoundingClientRect().bottom)) + (await geo(w)).headH / 2
        await w.page.evaluate(y => scrollTo(0, y), S + 30); await sleep(40)
        await tapAt(w, px, py); const a = await w.page.evaluate(ARROWS)
        const good = a.real.length === 1 && a.real[0].startsWith('cat') && a.pin && a.pin[0] === a.real[0]
        if (!good) ok = false
        rows.push(`straight-after-crossing: pressed cat copy ~40ms after reaching T+30; arrows real=${a.real.join()} copy=${a.pin?.join()}`); pics.push(await pic(w, 'q14-after-crossing'))
      }
      void midKey; void keys
      rec('Q14', sz, 'sort by the real heading at T-40, by the copy at T+40, the callsign heading, after sideways scroll, and straight after crossing T', 'the column tapped sorts, once a tap, arrow on the copy and the real heading alike', rows.join(' | '), ok ? (rows.some(r => r.includes('NOT WALKED')) ? 'PASS (some steps NOT WALKED)' : 'PASS') : 'FAIL', pics)
    } finally { await closeAll([w]) }
  }
}

async function q17() {
  for (const [vp, touch] of [[PC, false], [PH, true]]) {
    const w = await world({ vp, touch }), sz = `${vp.width} Chromium`
    try {
      const rows = []; let ok = true; const pics = []
      let S = (await toY(w, 0)).S
      await w.page.click('#qEdit'); await sleep(400); await w.page.click('#qEditQuals'); await sleep(400)
      S = (await geo(w)).S
      await toY(w, S + 120); await w.page.evaluate(() => { const e = document.querySelector('.qwrap'); e.scrollLeft = Math.round((e.scrollWidth - e.clientWidth) * 0.5) }); await sleep(300)
      const snap = async label => { const g = await geo(w); const al = await w.page.evaluate(ALIGN); const good = placed(g) && al && al.compared >= 2 && al.maxDx <= 2 && al.maxDw <= 2; if (!good) ok = false; rows.push(`${label}: ${fmt(g)}; align ${al ? `compared ${al.compared} dx<=${al.maxDx} dw<=${al.maxDw} bad ${al.bad.join()}` : 'none'}`) ; pics.push(await pic(w, `q17-${label}`)) }
      await snap('before')
      // adding a column: the Add bar is above the table, so the page moves; stay pinned by scrolling back to T+120 afterwards, no change of T assumed
      await w.page.locator('#qNewQual').scrollIntoViewIfNeeded(); await w.page.fill('#qNewQual', 'ABCDEFGHIJKLMN'); await w.page.click('#qAddQualBtn'); await sleep(700)
      const nth = await w.page.evaluate(() => [...document.querySelectorAll('#qtbl thead th')].some(t => /ABCDEFGHIJKLMN/i.test(t.innerText)))
      S = (await geo(w)).S; await toY(w, S + 120); await w.page.evaluate(() => { const e = document.querySelector('.qwrap'); e.scrollLeft = e.scrollWidth - e.clientWidth }); await sleep(400)
      rows.push(`added column present=${nth}`); if (!nth) ok = false
      await snap('after-add-14-letter-column')
      // change a tick (ticks toggle with Edit quals off)
      await w.page.evaluate(() => document.querySelector('#qEditQuals').click()); await sleep(400)
      const cell = w.page.locator('td.qcell[data-q]:not(.qro)').first(); await cell.waitFor({ timeout: 5000 }).catch(() => {}); const t0 = (await cell.innerText({ timeout: 3000 }).catch(() => '?')).trim()
      await cell.evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {}); await sleep(200); const bx = await cell.boundingBox()
      if (bx) { await tapAt(w, bx.x + bx.width / 2, bx.y + bx.height / 2); await sleep(400) }
      const t1 = (await cell.innerText({ timeout: 3000 }).catch(() => '?')).trim(); rows.push(`tick ${t0 || '(empty)'} -> ${t1 || '(empty)'}`)
      S = (await geo(w)).S; await toY(w, S + 120); await snap('after-tick')
      // Undo twice (tick, then column)
      for (let u = 1; u <= 2; u++) { await w.page.evaluate(() => window.scrollTo(0, window.scrollY)); const ub = await w.page.evaluate(() => { const b = document.querySelector('#undoBtn'); const d = b ? (b.disabled || b.getAttribute('aria-disabled') === 'true') : null; if (b && !d) b.click(); return { present: !!b, disabled: d } }); rows.push(`undo #${u}: present ${ub.present}, disabled ${ub.disabled}`); await sleep(600); const S2 = (await geo(w)).S; await toY(w, S2 + 120); await snap('after-undo-' + u) }
      const gone = await w.page.evaluate(() => ![...document.querySelectorAll('#qtbl thead th')].some(t => /ABCDEFGHIJKLMN/i.test(t.innerText)))
      rows.push(`after 2 undos the added column is ${gone ? 'gone' : 'STILL THERE'}`)
      rec('Q17', sz, 'Enable editing + Edit quals, half way sideways pinned, add a 14-letter column, change a tick, Undo (twice)', 'copy and real heading agree after each, widths lined up', rows.join(' | '), ok ? 'PASS' : 'FAIL', pics)
    } finally { await closeAll([w]) }
  }
}

async function q18() {
  const defs = [['402 Chromium touch', PH, true, 'chromium'], ['1536 Chromium', PC, false, 'chromium'], ['402 WebKit', PH, true, 'webkit']]
  for (const [sz, vp, touch, engine] of defs) {
    const w = await world({ vp, touch, engine })
    try {
      const rows = []; let ok = true; const pics = []
      const S = (await toY(w, 0)).S
      let zoomNote = 'no pinch'
      if (touch && w.cdp) { await pinch(w, 200, 500, 80, 280); zoomNote = 'pinched out (zoomed in)' }
      else if (touch) zoomNote = 'WebKit scripted touches cannot pinch; not zoomed'
      const gS = await toY(w, (await geo(w)).S + 150); rows.push(`before leaving (${zoomNote}): ${fmt(gS)} zoom ${gS.zoom}`); pics.push(await pic(w, 'q18-before'))
      for (const other of ['leavewar', 'editsched']) {
        await w.page.evaluate(p => window.go(p), other); await sleep(700)
        const n = await w.page.evaluate(() => ({ copies: document.querySelectorAll('[data-testid="qsticky-head"]').length, visible: [...document.querySelectorAll('[data-testid="qsticky-head"]')].filter(e => e.getBoundingClientRect().width > 0 && +getComputedStyle(e).opacity > 0.5 && getComputedStyle(e).visibility !== 'hidden').length }))
        if (n.visible) ok = false; rows.push(`on ${other}: copies in page ${n.copies}, visible ${n.visible}`); pics.push(await pic(w, 'q18-' + other))
      }
      const back = await w.page.evaluate(() => new Promise(r => { window.go('quals'); requestAnimationFrame(() => requestAnimationFrame(() => { const p = document.querySelector('[data-testid="qsticky-head"]'); const hr = document.querySelector('#qtbl thead'); const tb = document.querySelector('.topbar').getBoundingClientRect().bottom; r({ pin: p ? { shown: +getComputedStyle(p).opacity > 0.5 && getComputedStyle(p).visibility !== 'hidden', top: p.getBoundingClientRect().top } : null, headTop: hr ? hr.getBoundingClientRect().top : null, tb, y: scrollY, zoom: hr ? getComputedStyle(document.querySelector('#qtbl')).zoom : null }) })) }))
      pics.push(await pic(w, 'q18-first-frame-back')); await sleep(700); const gB = await geo(w)
      const sane = back.pin ? (back.pin.shown ? Math.abs(back.pin.top - back.tb) <= 1 : back.headTop >= back.tb - 1) : true
      if (!sane) ok = false
      rows.push(`back, 2 frames after go(): copy ${back.pin?.shown ? 'shown' : 'hidden'} top ${back.pin?.top} realHeadTop ${back.headTop} tb ${back.tb} scrollY ${back.y} zoom ${back.zoom}; settled ${fmt(gB)}`)
      rec('Q18', sz, 'pinned (pinch-zoomed on Chromium phone), go to Leave War and Edit Schedule and back to Quals', 'no copy on another page; first frame back shows the heading right; RECORD the zoom on return', rows.join(' | '), ok ? 'PASS' : 'FAIL', pics)
    } finally { await closeAll([w]) }
  }
}

async function q21() {
  for (const who of ['a', 'm']) for (const [vp, touch] of [[PC, false], [PH, true]]) {
    const w = await world({ vp, touch, who }), sz = `${vp.width} Chromium ${who === 'a' ? 'admin' : 'member'}`
    try {
      const rows = []; let ok = true; const pics = []
      const S = (await toY(w, 0)).S
      const covers = () => w.page.evaluate(() => { const p = document.querySelector('[data-testid="qsticky-head"]'); const pr = p.getBoundingClientRect(); let over = 0, n = 0; for (let x = pr.left + 10; x < pr.right - 10; x += Math.max(20, pr.width / 12)) { n++; const e = document.elementFromPoint(x, pr.top + pr.height / 2); if (e && !e.closest('[data-testid="qsticky-head"]')) over++ } return { overCopyPoints: over, of: n } })
      const controls = [['account menu', '#roleBadge'], ['side menu (phone)', 'HAMBURGER'], ['Export', '#qExport'], ['Add person', '#qAddToggle'], ['Edit quals', '#qEdit']]
      for (const [label, sel] of controls) {
        await go(w.page, 'quals'); await sleep(500); await toY(w, (await geo(w)).S + 160)
        if (sel === 'HAMBURGER' && !touch) { rows.push(`${label}: not offered on a desktop`); continue }
        if (sel === 'HAMBURGER' || sel === '#roleBadge') {
          const bar = await w.page.evaluate(sel => { const bs = [...document.querySelectorAll('.topbar button')].filter(b => b.getBoundingClientRect().width > 0); const b = sel === '#roleBadge' ? document.querySelector('#roleBadge') : bs.sort((x, y) => x.getBoundingClientRect().left - y.getBoundingClientRect().left)[0]; if (!b || !b.getBoundingClientRect().width) return null; if (sel === 'HAMBURGER' && b.id === 'roleBadge') return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, id: b.id } }, sel)
          if (!bar) { rows.push(`${label}: not offered`); continue }
          const pre = await geo(w); await tapAt(w, bar.x, bar.y); await sleep(400)
          const cv = await covers().catch(() => null); const top = await w.page.evaluate(() => { const p = document.querySelector('[data-testid="qsticky-head"]'); const r = p.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e ? (e.closest('[data-testid="qsticky-head"]') ? 'COPY' : (e.id || e.className || e.tagName).toString().slice(0, 30)) : null })
          pics.push(await pic(w, `q21-${who}-${label.replace(/[^a-z]/gi, '')}-open`))
          rows.push(`${label}: opened while pinned (${fmt(pre)}); at the copy's middle the page hits "${top}", copy points covered by the window ${cv ? cv.overCopyPoints + '/' + cv.of : 'n/a'}`)
          const badge = sel === '#roleBadge'; if (badge) rows.push('  (the badge switches the view as admin/member: no window opens; pressed again to restore)')
          if (!badge && top === 'COPY' && cv && cv.overCopyPoints === 0) ok = false
          if (badge) await tapAt(w, bar.x, bar.y); else { await w.page.keyboard.press('Escape'); await sleep(300); await tapAt(w, vp.width / 2, vp.height - 30) } await sleep(300)
          const g = await toY(w, (await geo(w)).S + 160); if (!(g.pin && g.pin.n === 1 && placed(g))) ok = false
          rows.push(`  after Escape + outside tap: ${fmt(g)} copies ${g.pin?.n}`); pics.push(await pic(w, `q21-${who}-${label.replace(/[^a-z]/gi, '')}-closed`)); continue
        }
        const el = w.page.locator(sel).first()
        if (!(await el.count()) || !(await el.isVisible())) { rows.push(`${label}: not offered`); continue }
        const bx = await el.boundingBox().catch(() => null)
        // the controls above the table scroll out of view when pinned: scroll up to reach them only if needed
        let reach = bx && bx.y >= 0 && bx.y < vp.height
        const gBefore = await geo(w)
        if (!reach || (bx.y + bx.height < gBefore.tb)) { await toY(w, 0); }
        const b2 = await el.boundingBox()
        const rowsBefore = await w.page.locator('#qtbl td.qname').count()
        await tapAt(w, b2.x + b2.width / 2, b2.y + b2.height / 2); await sleep(400)
        const onQuals = await w.page.evaluate(() => window.CURPAGE)
        const cv = onQuals === 'quals' ? await covers().catch(() => null) : null
        pics.push(await pic(w, `q21-${who}-${label.replace(/ /g, '')}-open`))
        let closed = []
        for (const how of ['Escape', 'outside']) {
          if (how === 'Escape') await w.page.keyboard.press('Escape'); else await tapAt(w, vp.width / 2, vp.height - 30)
          await sleep(400)
        }
        const here = await w.page.evaluate(() => window.CURPAGE)
        if (here !== 'quals') { rows.push(`${label}: left Quals for "${here}" (opens another page, no window over Quals); copies in page there: ${await w.page.locator('[data-testid="qsticky-head"]').count()}`); continue }
        // back to pinned state and read one-heading-in-place
        const g = await toY(w, (await geo(w)).S + 160)
        const one = g.pin && g.pin.n === 1
        if (!one || (cv && cv.overCopyPoints > 0 && false)) ok = false
        rows.push(`${label}: pressed at the page top (it sits above the table, out of reach while pinned); after Escape + outside tap and back to T+160: ${fmt(g)} copies ${g.pin?.n}`)
        pics.push(await pic(w, `q21-${who}-${label.replace(/ /g, '')}-closed`))
      }
      rec('Q21', sz, 'pinned: open/close account menu, Export (downloads blocked), Add person, Edit/Enable editing, each closed by Escape and an outside tap', 'a window takes the tap, the heading never above it, one heading in place after', rows.join(' | '), ok ? 'PASS' : 'FAIL', pics)
    } finally { await closeAll([w]) }
  }
}

async function q22() {
  // phone turn
  {
    const w = await world({ vp: PH, touch: true }), sz = '402<->874 Chromium touch'
    try {
      const rows = []; let ok = true; const pics = []
      for (const [label, off] of [['pinned T+150', 150], ['just before T (T-4)', -4]]) {
        await toY(w, (await toY(w, 0)).S + off)
        for (const [name, vp] of [['landscape 874x402', { width: 874, height: 402 }], ['portrait 402x874', PH]]) {
          await w.page.setViewportSize(vp); await sleep(900)
          // go to a position relative to the new T so "pinned"/"just before" mean the same thing
          const gg = await geo(w); const g = off >= 0 ? await toY(w, gg.S + off) : await toY(w, gg.S + off); const al = await w.page.evaluate(ALIGN)
          const good = g.pin && g.pin.shown === g.under && (!g.pin.shown || (placed(g) && al && al.maxDx <= 2 && al.maxDw <= 2))
          if (!good) ok = false
          rows.push(`${label} -> ${name}: ${fmt(g)} align ${al ? `dx<=${al.maxDx} dw<=${al.maxDw}` : 'n/a'}`); pics.push(await pic(w, `q22-phone-${off >= 0 ? 'pinned' : 'before'}-${name.split(' ')[0]}`))
        }
      }
      rec('Q22a', sz, 'phone 402x874 -> 874x402 -> 402x874 while pinned and just before T (re-aimed at each T)', 'copy under the actual top bar, widths right, settled', rows.join(' | ') + ' (Safari address bar: only his iPhone, not walkable)', ok ? 'PASS' : 'FAIL', pics)
    } finally { await closeAll([w]) }
  }
  {
    const w = await world({ vp: PC }), sz = '1536->420->1536 Chromium'
    try {
      const rows = []; let ok = true; const pics = []
      for (const [label, off] of [['pinned T+150', 150], ['just before T (T-4)', -4]]) {
        for (const vp of [{ width: 420, height: 864 }, PC]) {
          await w.page.setViewportSize(vp); await sleep(900)
          const gg = await geo(w); const g = await toY(w, gg.S + off); const al = await w.page.evaluate(ALIGN)
          const good = g.pin && g.pin.shown === g.under && (!g.pin.shown || (placed(g) && al && al.maxDx <= 2 && al.maxDw <= 2))
          if (!good) ok = false
          rows.push(`${label} @${vp.width}: ${fmt(g)} align ${al ? `dx<=${al.maxDx} dw<=${al.maxDw}` : 'n/a'}`); pics.push(await pic(w, `q22-desk-${off >= 0 ? 'pinned' : 'before'}-${vp.width}`))
        }
      }
      rec('Q22b', sz, 'desktop window 1536 -> 420 wide -> 1536 while pinned and just before T', 'copy under the actual top bar, widths right', rows.join(' | '), ok ? 'PASS' : 'FAIL', pics)
    } finally { await closeAll([w]) }
  }
}

async function q23() {
  for (const [vp, touch] of [[PC, false], [PH, true]]) {
    const w = await world({ vp, touch, who: 'm' }), sz = `${vp.width} Chromium member`
    try {
      const rows = []; let ok = true; const pics = []
      const S = (await toY(w, 0)).S
      const offered = await w.page.evaluate(() => ({ add: !!document.querySelector('#qAddToggle'), editQuals: !!document.querySelector('#qEditQuals'), edit: !!document.querySelector('#qEdit') }))
      rows.push(`member sees: Add person ${offered.add}, Edit quals ${offered.editQuals}, Enable editing ${offered.edit}`); if (offered.add || offered.editQuals) ok = false
      const a = await toY(w, S - 3), b = await toY(w, S + 3), c = await toY(w, S + 200)
      const good = a.pin && !a.pin.shown && placed(b) && placed(c); if (!good) ok = false
      rows.push(`T-3 ${fmt(a)}; T+3 ${fmt(b)}; T+200 ${fmt(c)}`); pics.push(await pic(w, 'q23-pinned'))
      const cen = await w.page.evaluate(() => { const p = document.querySelector('[data-testid="qsticky-head"]'); const t = [...p.querySelectorAll('th')].find(t => t.dataset.sort === 'flight' && t.getBoundingClientRect().width > 0); const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
      await tapAt(w, cen.x, cen.y); const ar = await w.page.evaluate(ARROWS)
      const sorted = ar.real.length === 1 && ar.real[0].startsWith('flight') && ar.pin?.[0] === ar.real[0]; if (!sorted) ok = false
      rows.push(`sort from copy: real=${ar.real.join()} copy=${ar.pin?.join()}`); pics.push(await pic(w, 'q23-sorted'))
      rec('Q23', sz, 'signed in as the member: pin at T, sort from the copy, check offered controls', 'as the admin; nothing more offered', rows.join(' | '), ok ? 'PASS' : 'FAIL', pics)
    } finally { await closeAll([w]) }
  }
}

async function qfoot() {
  const defs = [['402 Chromium touch', PH, true, 'chromium'], ['402 WebKit', PH, true, 'webkit'], ['1536 Chromium', PC, false, 'chromium']]
  for (const [sz, vp, touch, engine] of defs) {
    const w = await world({ vp, touch, engine })
    try {
      const rows = []; let ok = true; const pics = []
      const g0 = await toY(w, 0); const S = g0.S
      // to the very foot
      let how
      if (w.cdp && touch) { for (let k = 0; k < 8; k++) await finger(w, 800, 100, 60, 200, 5); how = 'hard finger flicks (no fling in a headless CDP finger)' }
      else if (!touch) { for (let k = 0; k < 24; k++) { await w.page.mouse.wheel(0, 400); await sleep(25) } await sleep(500); how = 'fast wheel' }
      else how = 'scrollTo (WebKit scripted touches drive no scroll)'
      let g = await geo(w)
      if (g.y < g.maxY - 2) { await w.page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(500); g = await geo(w); how += ' + scrollTo to finish' }
      const atFoot = Math.abs(g.y - g.maxY) <= 2
      let good = atFoot && placed(g) && g.pin.top >= g.tb - 1; if (!good) ok = false
      rows.push(`at the foot (${how}): ${fmt(g)} maxY ${g.maxY} atFoot ${atFoot}`); pics.push(await pic(w, 'qfoot-1-foot'))
      // top bar out of place
      await w.page.evaluate(() => { document.querySelector('.topbar').style.transform = 'translateY(-90px)'; window.dispatchEvent(new Event('resize')) })
      await sleep(150); const gOut = await geo(w); pics.push(await pic(w, 'qfoot-2-bar-out'))
      await sleep(500)
      const gOut2 = await geo(w)
      await w.page.evaluate(() => { document.querySelector('.topbar').style.transform = '' }); await sleep(120)
      const gBack = await geo(w); pics.push(await pic(w, 'qfoot-3-bar-back')); await sleep(600); const gBack2 = await geo(w)
      rows.push(`bar carried -90px (info only): ${fmt(gOut2)}`)
      good = placed(gBack2) && Math.abs(gBack2.pin.top - gBack2.tb) <= 1 && gBack2.pin.top >= gBack2.tb - 1; if (!good) ok = false
      rows.push(`bar put back, no scroll, immediately: ${fmt(gBack)}; after 600ms: ${fmt(gBack2)} gap to bar foot ${(gBack2.pin.top - gBack2.tb).toFixed(2)}`)
      // back up to T+40
      if (w.cdp && touch) { for (let k = 0; k < 8; k++) { const gg = await geo(w); if (gg.y <= S + 80) break; await finger(w, 150, 700, 50, 200, 5) } }
      else if (!touch) { for (let k = 0; k < 40; k++) { const gg = await geo(w); if (gg.y <= S + 400) break; await w.page.mouse.wheel(0, -300); await sleep(25) } }
      await toY(w, S + 40); const gUp = await geo(w); good = placed(gUp); if (!good) ok = false
      rows.push(`back up at T+40: ${fmt(gUp)}`); pics.push(await pic(w, 'qfoot-4-back-up'))
      rec('Q-foot', sz, 'flick/wheel from the top to the very foot; stand the top bar out of place (translateY -90px + resize, 600 ms) and put it back; look without scrolling; then up to T+40. (The PC/test browsers have no iPhone bounce: his iPhone is the look for the bounce itself.)', 'at the foot the heading is shown, its top at the bar foot within 1px, never missing, never above the bar; same after the bar is put back', rows.join(' | '), ok ? 'PASS' : 'FAIL', pics)
    } finally { await closeAll([w]) }
  }
}

async function q24() {
  const full = () => { const s = CSS.supports.bind(CSS); CSS.supports = (a, b) => /animation-timeline|animation-range|scroll-timeline|timeline-scope/.test(String(a) + String(b ?? '')) ? false : (b === undefined ? s(a) : s(a, b)) }
  const part = () => { const s = CSS.supports.bind(CSS); CSS.supports = (a, b) => /animation-range/.test(String(a) + String(b ?? '')) ? false : (b === undefined ? s(a) : s(a, b)) }
  for (const [mode, init] of [['full', full], ['partial', part]]) for (const [vp, touch] of [[PC, false], [PH, true]]) {
    const w = await world({ vp, touch, init }), sz = `${vp.width} Chromium stand-in:${mode}`
    try {
      const rows = []; let ok = true; const pics = []
      const sup = await w.page.evaluate(() => ({ tl: CSS.supports('animation-timeline: scroll()'), range: CSS.supports('animation-range: 0 100px') }))
      const S = (await toY(w, 0)).S
      const g1 = await toY(w, S - 5), g2 = await toY(w, S + 150), g3 = await toY(w, 0)
      const one = x => x.pin ? x.pin.n === 1 : true
      const c1 = !g1.pin || !g1.pin.shown, c2 = g2.pin && g2.pin.shown && placed(g2) && one(g2), c3 = !g3.pin || !g3.pin.shown
      if (!(c1 && c2 && c3)) ok = false
      rows.push(`supports(timeline ${sup.tl}, range ${sup.range}); T-5 ${fmt(g1)}; T+150 ${fmt(g2)}; top ${fmt(g3)}`); pics.push(await pic(w, 'q24-' + mode + '-pinned'))
      await toY(w, S + 150); await w.page.evaluate(() => { const e = document.querySelector('.qwrap'); e.scrollLeft = Math.round((e.scrollWidth - e.clientWidth) * 0.6) }); await sleep(400)
      const al = await w.page.evaluate(ALIGN); const gs = await geo(w); if (!(placed(gs) && al && al.maxDx <= 2 && al.maxDw <= 2)) ok = false
      rows.push(`sideways: ${fmt(gs)} align dx<=${al?.maxDx} dw<=${al?.maxDw}`); pics.push(await pic(w, 'q24-' + mode + '-sideways'))
      if (touch) { const gp = await toY(w, (await geo(w)).S + 150); await pinch(w, 200, 500, 280, 120); const ga = await geo(w); rows.push(`after a pinch: ${fmt(ga)} zoom ${ga.zoom}`); if (ga.pin && ga.pin.shown !== ga.under) ok = false; pics.push(await pic(w, 'q24-' + mode + '-pinch')); void gp }
      for (let k = 0; k < 2; k++) { await w.page.evaluate(() => window.go('leavewar')); await sleep(500); await w.page.evaluate(() => window.go('quals')); await sleep(700) }
      const S2 = (await toY(w, 0)).S; const gb = await toY(w, S2 + 150); if (!(placed(gb) && one(gb))) ok = false
      rows.push(`after Leave War and back x2: ${fmt(gb)} copies ${gb.pin?.n}`)
      rec('Q24', sz, `stand-in (${mode}: CSS.supports answers false for the timeline pieces; not a real other browser): cross T, sideways, ${touch ? 'pinch, ' : ''}away and back`, 'one working copy each time, as before this change', rows.join(' | '), ok ? 'PASS' : 'FAIL', pics)
    } finally { await closeAll([w]) }
  }
}

async function qplain() {
  for (const who of ['a', 'm']) for (const [vp, touch] of [[PC, false], [PH, true]]) {
    const w = await world({ vp, touch, who }), sz = `${vp.width} Chromium ${who === 'a' ? 'admin' : 'member'}`
    try {
      const rows = []; let ok = true; const pics = []
      const chk = async label => { const g = await geo(w); const good = g.pin ? (g.pin.shown === g.under && (!g.pin.shown || placed(g))) : true; if (!good) { ok = false; rows.push(`!! ${label} ${fmt(g)}`) } return g }
      let S = (await toY(w, 0)).S
      pics.push(await pic(w, `qp-${who}-1-open`))
      // filter
      await w.page.locator('#qFilter').fill('a'); await sleep(500); const nA = await w.page.locator('#qtbl td.qname').count(); await chk('filter a'); rows.push(`filter "a": ${nA} rows`); pics.push(await pic(w, `qp-${who}-2-filter`))
      await w.page.locator('#qFilter').fill(''); await sleep(500)
      // views
      for (const v of ['qViewW', 'qViewG', 'qViewA', 'qViewP']) { await w.page.click('#' + v); await sleep(400) }
      rows.push(`views pressed: rows now ${await w.page.locator('#qtbl td.qname').count()}`)
      // scroll a long way
      S = (await toY(w, 0)).S; const g = await toY(w, Math.max(S + 100, (await geo(w)).maxY * 0.6)); await chk('long scroll'); rows.push(`long scroll: ${fmt(g)}`); pics.push(await pic(w, `qp-${who}-3-longscroll`))
      // sort from the copy
      const key = await w.page.evaluate(() => { const p = document.querySelector('[data-testid="qsticky-head"]'); const t = [...p.querySelectorAll('th')].find(t => t.dataset.sort === 'initials' && t.getBoundingClientRect().width > 0); const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
      await tapAt(w, key.x, key.y); const ar = await w.page.evaluate(ARROWS); rows.push(`sort initials from copy: real=${ar.real.join()} copy=${ar.pin?.join()}`); if (!(ar.real[0] || '').startsWith('initials')) ok = false
      await toY(w, 0)
      // Enable editing + tick + Done + Undo
      const hasEdit = await w.page.locator('#qEdit').count()
      if (hasEdit) {
        await w.page.click('#qEdit'); await sleep(500); pics.push(await pic(w, `qp-${who}-4-editing`))
        const cell = who === 'm' ? w.page.locator('tr:has(td.qname:text-is("Ranger")) td.qcell[data-q]:not(.qro)').first() : w.page.locator('td.qcell[data-q]:not(.qro)').first()
        if (await cell.count()) { const t0 = (await cell.innerText()).trim(); await cell.scrollIntoViewIfNeeded(); const bx = await cell.boundingBox(); await tapAt(w, bx.x + bx.width / 2, bx.y + bx.height / 2); const t1 = (await cell.innerText()).trim(); rows.push(`tick ${t0 || '(empty)'} -> ${t1 || '(empty)'}`); if (t0 === t1) { ok = false; rows.push('!! tick did not change') } }
        else rows.push('no editable cell offered')
        S = (await toY(w, 0)).S; await toY(w, S + 150); await chk('editing pinned'); pics.push(await pic(w, `qp-${who}-5-editing-pinned`))
        await toY(w, 0); if (await w.page.locator('#qSave').count()) await w.page.click('#qSave'); await sleep(500)
        const ub = await w.page.evaluate(() => { const b = document.querySelector('#undoBtn'); const d = b ? (b.disabled || b.getAttribute('aria-disabled') === 'true') : null; if (b && !d) b.click(); return { present: !!b, disabled: d } }); rows.push(`undo: present ${ub.present}, disabled ${ub.disabled}`); await sleep(600); rows.push('Done then Undo pressed'); pics.push(await pic(w, `qp-${who}-6-undone`))
      } else rows.push('no Enable editing offered')
      // leave and come back
      await w.page.evaluate(() => window.go('leavewar')); await sleep(600); await go(w.page, 'quals'); S = (await toY(w, 0)).S; const g2 = await toY(w, S + 150); await chk('back'); rows.push(`back on Quals: ${fmt(g2)}`); pics.push(await pic(w, `qp-${who}-7-back`))
      // every opener: account menu
      await toY(w, 0); await w.page.click('#roleBadge').catch(() => {}); await sleep(400); pics.push(await pic(w, `qp-${who}-8-menu`)); await w.page.keyboard.press('Escape'); await sleep(300)
      rec('Q-plain', sz, 'open Quals, filter, views, long scroll, sort from the copy, Enable editing + tick, Done, Undo, leave and come back, account menu', 'everything works as a user expects; the heading always there when the headings are under the bar, never over the buttons', rows.join(' | '), ok ? 'PASS' : 'FAIL', pics)
    } finally { await closeAll([w]) }
  }
}

async function qheight() {
  const rows = []; let ok = true
  for (const [sz, vp, touch, engine] of [['402 Chromium', PH, true, 'chromium'], ['402 WebKit', PH, true, 'webkit'], ['1536 Chromium', PC, false, 'chromium']]) {
    const w = await world({ vp, touch, engine })
    try {
      const S = (await toY(w, 0)).S; const g = await toY(w, S + 150)
      const real = await w.page.evaluate(() => document.querySelector('#qtbl thead').getBoundingClientRect().height)
      const d = Math.abs(real - g.pin.h); if (d > 0.5) ok = false
      rows.push(`${sz}: copy ${g.pin.h} vs real ${+real.toFixed(2)} (diff ${d.toFixed(2)}; copy ${g.pin.shown ? 'shown' : 'hidden'})`)
    } finally { await closeAll([w]) }
  }
  rec('Q-height', '402 Chromium, 402 WebKit, 1536', 'copy height against the real heading\'s height, pinned', 'equal; RECORD both', rows.join(' | '), ok ? 'PASS' : 'FAIL')
}

const ALL = { q1, q3, q45, q6, q7, q9, q10, q11, q12, q14, q17, q18, q21, q22, q23, qfoot, q24, qplain, qheight }
for (const [k, fn] of Object.entries(ALL)) {
  if (!want(k)) continue
  try { await fn() } catch (e) { rec(k.toUpperCase(), '-', 'script step', '-', 'script error (not an app finding): ' + String(e.stack).split('\n').slice(0, 3).join(' | '), 'NOT WALKED') }
}
appendFileSync(`${SCR}/rows.jsonl`, JSON.stringify({ errors: ERRS.slice(0, 40), n: ERRS.length }) + '\n')
console.log('errors/console/4xx seen:', ERRS.length, ERRS.slice(0, 12))
await cr.close(); if (wk) await wk.close()
