// lwdl-lib.mjs — the shared driver of the lw-decide-look walk (worlds, sign-in, the decide buttons read, pictures, ring pixels). From the lw-decide-look walk of 28 Nov 26 ([LW-DECIDE-LOOK], his D2881); run from raptor-port/.
// lw-decide-look walk — the shared driver: worlds, sign-in, readers of the decide buttons, pictures, pixel samples.
import os from 'node:os'
import { chromium, webkit, devices, OUT_DEFAULT } from './lwdl-pw.mjs'
import path from 'node:path'
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs'
export const PORT = process.env.PORT || 4192
/* HOST: a preview started from the app's launch list answers on localhost only (chat 197) */
export const BASE = `http://${process.env.HOST || '127.0.0.1'}:${PORT}/`
export const TAG = process.env.TAG || 'branch'
export const OUT = process.env.LWDL_OUT || (TAG === 'branch' ? OUT_DEFAULT : OUT_DEFAULT + '/main')
mkdirSync(OUT, { recursive: true })
export const LOG = process.env.LWDL_LOG || (process.env.LWDL_LOGDIR || os.tmpdir()) + '/lwdl-log-' + TAG + '.jsonl'
export const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
export const SIZES = process.env.SIZES ? process.env.SIZES.split(',') : null
export const T = id => `[data-testid="${id}"]`
export const sleep = (p, ms) => p.waitForTimeout(ms)
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

let wk = null, cr = null, cr125 = null
export async function closeBrowsers() { for (const b of [wk, cr, cr125]) if (b) await b.close().catch(() => {}) }

/* sizes: desk (Chromium 1536x864, 2x pictures), p402 / p390 / p360 (WebKit, iPhone 13 profile, touch, scale 3),
   pc125 (Chromium started at 125% display scaling), d1100 (Chromium 1100 wide), c402 (Chromium touch at 402, for drags) */
export async function world(size, id) {
  const phone = /^p\d/.test(size)
  let ctx
  if (phone) {
    wk ||= await webkit.launch()
    const w = +size.slice(1), h = w === 402 ? 874 : w === 390 ? 844 : 780
    ctx = await wk.newContext({ ...devices['iPhone 13'], viewport: { width: w, height: h }, deviceScaleFactor: 3 })
  } else if (size === 'pc125') {
    cr125 ||= await chromium.launch({ args: ['--force-device-scale-factor=1.25', '--window-size=1536,864'] })
    ctx = await cr125.newContext({ viewport: null })
  } else if (size === 'c402') {
    cr ||= await chromium.launch()
    ctx = await cr.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
  } else {
    cr ||= await chromium.launch()
    const w = size === 'd1100' ? 1100 : 1536
    ctx = await cr.newContext({ viewport: { width: w, height: 864 }, deviceScaleFactor: 2 })
  }
  const page = await ctx.newPage()
  page.setDefaultTimeout(12000)
  const S = { id, size, phone: phone || size === 'c402', touch: phone || size === 'c402', ctx, page, errs: [], fails: [], notes: [], pics: [], data: {} }
  page.on('pageerror', e => S.errs.push('pageerror: ' + String(e).slice(0, 240)))
  page.on('console', m => { if (m.type() === 'error') S.errs.push('console: ' + m.text().slice(0, 240)) })
  page.on('response', r => { if (r.status() >= 400) S.errs.push(`http ${r.status()}: ` + r.url().slice(0, 140)) })
  await page.addInitScript(() => { window.__lwNoDemoCounters = true })
  S.check = (cond, label, seen) => {
    const line = `${cond ? 'ok  ' : 'FAIL'} ${label}` + (seen === undefined ? '' : ' | ' + JSON.stringify(seen))
    console.log('     ' + line.slice(0, 900))
    if (!cond) S.fails.push(label + ' — saw ' + JSON.stringify(seen))
    return cond
  }
  S.note = t => { S.notes.push(t); console.log('     note: ' + String(t).slice(0, 900)) }
  return S
}

export async function signIn(S, who = 'admin', { real = false } = {}) {
  const page = S.page
  await page.goto(real ? BASE : BASE + '?fresh=1', { waitUntil: 'commit', timeout: 60000 })
  await page.waitForSelector('#luser', { timeout: 60000 })
  await page.evaluate(() => window.lwSetMemberToday('2026-01-02'))
  await page.fill('#luser', who === 'admin' ? 'ad' : 'us'); await page.fill('#lpass', who === 'admin' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 60000 })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.evaluate(() => window.lwSetMemberToday('2026-01-02'))
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector(T(who === 'admin' ? 'row-slipway' : 'row-bane'), { state: 'attached', timeout: 30000 })
  await sleep(page, 900)
  if (who === 'admin') await page.evaluate(() => window.lwSetViewer(null))
  await sleep(page, 200)
}

export async function press(S, sel) {
  const l = typeof sel === 'string' ? S.page.locator(sel).first() : sel
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (S.touch) await l.tap(); else await l.click()
}
export async function gotoMonth(S, iso) {
  const mon = MON[+iso.slice(5, 7) - 1]
  if (!(await S.page.locator(T('month-' + mon)).isVisible().catch(() => false))) { await S.page.keyboard.press('Escape').catch(() => {}); await S.page.evaluate(() => scrollTo(0, 0)); await sleep(S.page, 300) }
  if (!(await S.page.locator(T('month-' + mon)).isVisible().catch(() => false))) { S.note('month button ' + mon + ' not shown; the cell is reached by scrolling'); return }
  await press(S, T('month-' + mon)); await sleep(S.page, 700)
}
export async function openCell(S, p, iso, expect = 'bid-picker') {
  const page = S.page
  await gotoMonth(S, iso)
  const c = page.locator(T(`cell-${p}-${iso}`))
  await c.waitFor({ state: 'attached', timeout: 10000 })
  await page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), T(`cell-${p}-${iso}`))
  await sleep(page, 300)
  await press(S, c)
  if (expect) await page.waitForSelector(T(expect), { state: 'visible', timeout: 8000 })
  await sleep(page, 600)
}
export const isOpen = async (page, id = 'bid-picker') => page.evaluate(id => { const e = document.querySelector(`[data-testid="${id}"]`); return !!e && e.getBoundingClientRect().width > 0 }, id)
export async function closeWin(S) {
  const page = S.page
  for (let i = 0; i < 3; i++) {
    const open = await page.evaluate(() => ['bid-picker', 'daylist', 'sel-actions', 'raptor-sheet'].some(t => { const e = document.querySelector(`[data-testid="${t}"]`); return e && e.getBoundingClientRect().width > 0 }))
    if (!open) return
    const x = page.locator('[data-testid="bid-cancel"]:visible, [data-testid="daylist-close"]:visible, [data-testid="sel-cancel"]:visible').first()
    if (await x.count()) await press(S, x); else await page.keyboard.press('Escape')
    await sleep(page, 450)
  }
}
export async function place(page, p, ds, code = 'LL') {
  const ok = await page.evaluate(({ p, ds, code }) => ds.map(d => window.lwSetCell(p, d, code)), { p, ds, code })
  if (ok.some(x => !x)) throw new Error('not placed ' + JSON.stringify(ok))
  await sleep(page, 250)
}
export const cellState = (page, p, d) => page.evaluate(({ p, d }) => {
  const td = document.querySelector(`[data-testid="cell-${p}-${d}"]`)
  if (!td) return '?missing'
  return [...td.querySelectorAll('span.c')].map(s => s.textContent.trim() + ':' + ((s.className.match(/\bs-(\w+)\b/) || [])[1] || '?')).join('+') || 'empty'
}, { p, d })

/* every decide button showing inside a scope, as drawn: words (parts with a width), classes, box, ring, colours, mark */
export const readDecide = (page, scope) => page.evaluate((scope) => {
  const root = scope ? document.querySelector(scope) : document
  if (!root) return { missing: scope }
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 }
  const btns = [...root.querySelectorAll('.dchip.dec, .appr-ok, .appr-no')].filter(vis)
  const rd = n => Math.round(n * 10) / 10
  return btns.map(b => {
    const cs = getComputedStyle(b), r = b.getBoundingClientRect()
    const ic = b.querySelector('svg.dec-ic')
    const icr = ic && ic.getBoundingClientRect()
    // words: the text node's own box
    const rng = document.createRange(); let tn = [...b.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim())
    if (!tn.length) { const sp = b.querySelector('.appr-word > span') || [...b.querySelectorAll('span')].find(x => x.getBoundingClientRect().width > 1 && x.textContent.trim()); if (sp) tn = [...sp.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()) }
    let wr = null
    if (tn.length) { rng.setStart(tn[0], 0); rng.setEnd(tn[tn.length - 1], tn[tn.length - 1].textContent.length); wr = rng.getBoundingClientRect() }
    // clipping ancestors: does the ring's outer box stay inside each?
    const ow = parseFloat(cs.outlineWidth) || 0, oo = parseFloat(cs.outlineOffset) || 0
    const ring = cs.outlineStyle !== 'none' && ow > 0 ? { l: r.left - oo - ow, t: r.top - oo - ow, r: r.right + oo + ow, b: r.bottom + oo + ow } : null
    const clips = []
    if (ring) for (let a = b.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const ac = getComputedStyle(a)
      if (ac.overflowX !== 'visible' || ac.overflowY !== 'visible' || ac.clipPath !== 'none') {
        const ar = a.getBoundingClientRect(), bl = parseFloat(ac.borderLeftWidth) || 0, bt = parseFloat(ac.borderTopWidth) || 0
        const inner = { l: ar.left + bl, t: ar.top + bt, r: ar.left + bl + a.clientWidth, b: ar.top + bt + a.clientHeight }
        const cut = []
        if (ring.l < inner.l - 0.5) cut.push('left ' + rd(inner.l - ring.l))
        if (ring.t < inner.t - 0.5) cut.push('top ' + rd(inner.t - ring.t))
        if (ring.r > inner.r + 0.5) cut.push('right ' + rd(ring.r - inner.r))
        if (ring.b > inner.b + 0.5) cut.push('bottom ' + rd(ring.b - inner.b))
        if (cut.length) clips.push((a.dataset.testid || a.className || a.tagName).toString().slice(0, 40) + ': ' + cut.join(','))
      }
    }
    return {
      tid: b.dataset.testid || '', words: wr ? (tn.map(n => n.textContent).join('').trim()) : '', cls: b.className.replace(/\s+/g, ' '),
      x: rd(r.left), y: rd(r.top), w: rd(r.width), h: rd(r.height),
      outline: cs.outlineStyle === 'none' ? 'none' : `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} off ${cs.outlineOffset}`,
      color: cs.color, bg: cs.backgroundColor, edge: cs.borderTopColor + (cs.borderTopColor !== cs.borderLeftColor ? '/' + cs.borderLeftColor : ''), opacity: cs.opacity, cursor: cs.cursor, disabled: b.disabled,
      fontSize: cs.fontSize, shadow: cs.boxShadow,
      mark: ic ? { kind: ic.dataset.mark, x: rd(icr.left), y: rd(icr.top), w: rd(icr.width), h: rd(icr.height), color: getComputedStyle(ic).color } : null,
      wordsBox: wr ? { l: rd(wr.left), r: rd(wr.right), t: rd(wr.top), b: rd(wr.bottom) } : null,
      padL: ic ? rd(icr.left - r.left) : wr ? rd(wr.left - r.left) : null, padR: wr ? rd(r.right - wr.right) : null,
      markBeforeWords: ic && wr ? (icr.right <= wr.left + 0.5) && Math.abs((icr.top + icr.bottom) / 2 - (wr.top + wr.bottom) / 2) < 3 : null,
      clipped: b.scrollWidth > b.clientWidth + 1, ringCut: clips, focus: document.activeElement === b, focusVisible: b.matches(':focus-visible'),
    }
  })
}, scope)
export const boxesOf = (page, sels) => page.evaluate(sels => sels.map(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { s, x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 } }), sels)
export const accent = page => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim())

/* a picture framed round elements (cropped), at the context's scale */
export async function pic(S, name, sels, { pad = 14, full = false } = {}) {
  const page = S.page
  const r = await page.evaluate(({ sels, pad, full }) => {
    const vw = innerWidth, vh = innerHeight
    if (full) return { x: 0, y: 0, width: vw, height: vh }
    const rs = sels.flatMap(s => [...document.querySelectorAll(s)]).filter(e => { const q = e.getBoundingClientRect(); return q.width > 0 && q.bottom > 0 && q.top < vh }).map(e => e.getBoundingClientRect())
    if (!rs.length) return { x: 0, y: 0, width: vw, height: vh }
    const l = Math.max(0, Math.min(...rs.map(q => q.left)) - pad), t = Math.max(0, Math.min(...rs.map(q => q.top)) - pad)
    const rr = Math.min(vw, Math.max(...rs.map(q => q.right)) + pad), bb = Math.min(vh, Math.max(...rs.map(q => q.bottom)) + pad)
    return { x: l, y: t, width: Math.max(1, rr - l), height: Math.max(1, bb - t) }
  }, { sels, pad, full })
  const file = `${S.id}-${S.size}-${name}.png`
  await page.screenshot({ path: path.join(OUT, file), clip: r })
  S.pics.push(file)
  return file
}
/* colours sampled from the painted screen (css pixels), round a button: ring line (3px out), glow test (7px out), edge (0.5 in) */
export async function ringPixels(S, sel) {
  const page = S.page
  await page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'nearest' }), sel)
  await page.waitForTimeout(250)
  const b = await page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom } }, sel)
  if (!b) return null
  const pad = 14
  const clip = { x: Math.max(0, b.l - pad), y: Math.max(0, b.t - pad), width: b.r - b.l + 2 * pad, height: b.b - b.t + 2 * pad }
  const buf = await page.screenshot({ clip, scale: 'css' })
  const ox = b.l - clip.x, oy = b.t - clip.y, w = b.r - b.l, h = b.b - b.t
  const pts = {
    ringTop: [ox + w / 2, oy - 3], ringBottom: [ox + w / 2, oy + h + 3], ringLeft: [ox - 3, oy + h / 2], ringRight: [ox + w + 3, oy + h / 2],
    ringTop2: [ox + w / 2, oy - 3.6], ringBottom2: [ox + w / 2, oy + h + 2.4], ringLeft2: [ox - 3.6, oy + h / 2], ringRight2: [ox + w + 2.4, oy + h / 2],
    ringTL: [ox + 2, oy - 3], ringBR: [ox + w - 2, oy + h + 2],
    glowTop: [ox + w / 2, oy - 7], glowLeft: [ox - 7, oy + h / 2], glowBottom: [ox + w / 2, oy + h + 6], glowRight: [ox + w + 6, oy + h / 2],
    edgeTop: [ox + w / 2, oy + 0.5], edgeLeft: [ox + 0.5, oy + h / 2], edgeBottom: [ox + w / 2, oy + h - 0.7], edgeRight: [ox + w - 0.7, oy + h / 2],
  }
  return page.evaluate(async ({ b64, pts }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
    const x = c.getContext('2d'); x.drawImage(img, 0, 0)
    const out = {}
    for (const [k, [px, py]] of Object.entries(pts)) { const d = x.getImageData(Math.max(0, Math.min(img.width - 1, Math.round(px))), Math.max(0, Math.min(img.height - 1, Math.round(py))), 1, 1).data; out[k] = `${d[0]},${d[1]},${d[2]}` }
    for (const k of ['ringTop', 'ringBottom', 'ringLeft', 'ringRight']) { const [r, g, bb] = out[k].split(',').map(Number); if (!(bb > 150 && g > 140 && r < 120)) out[k] = out[k + '2'] }
    return out
  }, { b64: buf.toString('base64'), pts })
}
export const isCyan = rgb => { const [r, g, b] = rgb.split(',').map(Number); return b > 150 && g > 140 && r < 120 }

export async function run(id, sizes, fn) {
  if (ONLY && !ONLY.includes(id)) return
  for (const size of sizes) {
    if (SIZES && !SIZES.includes(size)) continue
    console.log(`\n=== ${id} [${size}] (${TAG})`)
    const S = await world(size, id)
    const t0 = Date.now()
    try { await fn(S) } catch (e) {
      S.fails.push('SCRIPT/STEP ERROR: ' + String(e.message).split('\n').slice(0, 3).join(' / ').slice(0, 400))
      console.log('     STEP ERROR ' + String(e.message).split('\n')[0])
      try { await pic(S, 'error-state', [], { full: true }) } catch { /* nothing */ }
    }
    const errs = S.errs.filter(e => !/Couldn.t save that document|IndexedDB|idb/i.test(e))
    for (const e of errs) S.fails.push('PAGE/CONSOLE ERROR: ' + e)
    const verdict = S.fails.length ? 'FAIL' : 'PASS'
    console.log(`${verdict}  ${id} [${size}] ${Math.round((Date.now() - t0) / 1000)}s  pics: ${S.pics.join(', ')}`)
    for (const f of S.fails) console.log('   x ' + f.slice(0, 600))
    appendFileSync(LOG, JSON.stringify({ id, size, tag: TAG, verdict, fails: S.fails, notes: S.notes, pics: S.pics, data: S.data, errsIgnored: S.errs.length - errs.length }) + '\n')
    await S.ctx.close()
  }
}
