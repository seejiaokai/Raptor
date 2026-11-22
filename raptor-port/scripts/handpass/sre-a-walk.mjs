// [SCHED-RIGHT-EDGE] walker A (22 Nov 26, branch claude/sched-right-edge-135): his D2293 (folded, Edit Schedule's days run
// to the window's right edge under the CREW tab) and D2295 (a day brought to the front rests 20px in, where an arrow lands
// one). Walked on the BUILT app served on HP_URL (default http://localhost:4391), Chromium STARTED at 125% (a real screen
// scaling), 1536 x 864, signed in ad/a; the phone in WebKit at 402 x 874 and in Chromium touch emulation.
// Recipes: docs/mock/2026-11-22-sched-right-edge/draw.mjs and e2e/sched-right-edge.spec.ts; the hold-at-the-side mouse
// recipe from scripts/handpass/week-drag-step-walk.mjs.
// Usage (from raptor-port/): node scripts/handpass/sre-a-walk.mjs      ONLY=s1,s2 node … for a partial re-run (own sub-folder)
import { chromium, webkit, devices } from 'playwright'
import { existsSync, mkdirSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const VERSION = 'sre-a-walk v7'
console.log(VERSION, new Date().toISOString())
const here = path.dirname(fileURLToPath(import.meta.url))
const BASE = process.env.HP_URL || 'http://localhost:4391'
const ONLY = (process.env.ONLY || '').split(',').map(s => s.trim()).filter(Boolean)
const ROOT = path.resolve(here, '../../docs/img/handpass/2026-11-22-sched-right-edge/a')
const OUT = ONLY.length ? path.join(ROOT, 'only-' + ONLY.join('-')) : ROOT
if (existsSync(OUT)) for (const f of readdirSync(OUT)) { if (!f.startsWith('only-')) rmSync(path.join(OUT, f), { recursive: true, force: true }) }
mkdirSync(OUT, { recursive: true })
const SCRATCH = path.resolve(here, '../../.tmp/sre-a'); mkdirSync(SCRATCH, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LO = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const want = id => !ONLY.length || ONLY.includes(id)
const rows = []
const errors = []
const rec = (id, result, note, pics = []) => { rows.push({ id, result, note, pics }); console.log(`${result.padEnd(9)} ${id}  ${note}${pics.length ? '  [' + pics.join(', ') + ']' : ''}`) }
const near = (a, b, t) => a != null && b != null && Math.abs(a - b) <= t
const f1 = n => n == null ? 'null' : (+n).toFixed(1)

/* ---------- browsers ---------- */
async function deskBrowser(width = 1536, height = 864, scale = 1.25) {
  return chromium.launch({ headless: true, ...LO, args: [`--force-device-scale-factor=${scale}`, `--window-size=${width},${height}`] })
}
function watch(page, tag) {
  page.on('pageerror', e => { errors.push(`${tag} pageerror: ${String(e).slice(0, 200)}`) })
  page.on('console', m => { if (m.type() === 'error') errors.push(`${tag} console: ${m.text().slice(0, 200)}`) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${tag} HTTP ${r.status()} ${r.url().slice(0, 120)}`) })
}
async function signIn(page) {
  await page.goto(BASE + '/?fresh=1')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
}
async function freshDesk(browser, tag, ctxOpts = { viewport: null }) {
  const ctx = await browser.newContext(ctxOpts)
  const page = await ctx.newPage()
  watch(page, tag)
  await signIn(page)
  return { ctx, page }
}
const EDIT = '#page-editsched .week', VIEW = '#vWeek'
/* the strip at rest: the same sideways scroll for 250ms */
async function rest(page, sel = EDIT) {
  await page.waitForSelector(`${sel} .day`)
  await page.evaluate(async s => {
    const el = document.querySelector(s)
    let last = NaN, since = performance.now(); const t0 = performance.now()
    for (;;) {
      await new Promise(r => requestAnimationFrame(() => r(null)))
      const now = el.scrollLeft
      if (now !== last) { last = now; since = performance.now() }
      if (performance.now() - since > 250 || performance.now() - t0 > 6000) return
    }
  }, sel)
}
/* the top bar's own tab; at a narrow desktop width (822) the tabs sit in the top bar's Menu — open it, press the item */
const viaMenu = []
async function pressTab(page, name) {
  const t = page.locator('.topbar').getByText(name, { exact: true }).first()
  if (await t.isVisible().catch(() => false)) { await t.click(); return 'tab' }
  await page.locator('.topbar button[aria-label="Menu"]').first().click(); await page.waitForTimeout(400)
  const item = page.getByText(name, { exact: true }).locator('visible=true').first()
  await item.click(); viaMenu.push(name); return 'menu'
}
/* the same, the in-page first-frame read armed just before the press that switches the page */
async function pressTabArmed(page, name, sel) {
  const t = page.locator('.topbar').getByText(name, { exact: true }).first()
  if (await t.isVisible().catch(() => false)) { await armFirstFrame(page, sel); await t.click(); return 'tab' }
  await page.locator('.topbar button[aria-label="Menu"]').first().click(); await page.waitForTimeout(400)
  const item = page.getByText(name, { exact: true }).locator('visible=true').first()
  await armFirstFrame(page, sel); await item.click(); viaMenu.push(name); return 'menu'
}
async function tab(page, name, to) {
  await pressTab(page, name)
  await page.waitForFunction(p => window.CURPAGE === p, to)
  await rest(page, to === 'editsched' ? EDIT : VIEW)
}
const park = async page => { await page.mouse.move(700, 500); await page.waitForTimeout(300) }
async function fold(page, want) {
  const is = await page.evaluate(() => document.body.classList.contains('ros-collapsed'))
  if (is !== want) await page.click('.ros-rail')
  await page.waitForFunction(w => document.body.classList.contains('ros-collapsed') === w, want)
  await page.waitForTimeout(350)
  await rest(page, EDIT)
}
/* what the screen shows of one week strip, in window pixels */
function read(page, sel = EDIT) {
  return page.evaluate(s => {
    const wk = document.querySelector(s)
    const box = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height } }
    const shown = el => el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0
    const cs = getComputedStyle(wk), wb = box(wk)
    const days = Array.from(wk.querySelectorAll('.day')).map(d => ({ day: d.hasAttribute('data-day') ? d.getAttribute('data-day') : 'peek' + d.getAttribute('data-peek-day'), ...box(d) }))
    const front = days.filter(d => d.left >= wb.left - 2 && d.width > 0).sort((a, b) => a.left - b.left)[0] || null
    const board = wk.closest('.edit-board')
    const rail = document.querySelector('.ros-rail'), bar = document.getElementById('hscroll'), panel = document.querySelector('#page-editsched .eroster')
    const next = document.querySelector('.week-nav.next'), prev = document.querySelector('.week-nav.prev')
    const dt = front ? wk.querySelector(`.day[data-day="${front.day}"] .dt`) : null
    return {
      innerWidth, innerHeight, week: wb, padLeft: parseFloat(cs.paddingLeft), padRight: parseFloat(cs.paddingRight),
      boardPadRight: board ? parseFloat(getComputedStyle(board).paddingRight) : null,
      front, frontDate: dt ? dt.textContent.trim() : null, last: days[days.length - 1], scrollLeft: wk.scrollLeft, maxScroll: wk.scrollWidth - wk.clientWidth,
      rail: shown(rail) ? box(rail) : null, bar: bar && bar.classList.contains('on') ? box(bar) : null, panel: shown(panel) ? box(panel) : null,
      next: shown(next) ? box(next) : null, prev: shown(prev) ? box(prev) : null,
      pageScrollW: document.scrollingElement.scrollWidth, scrollX: window.scrollX, folded: document.body.classList.contains('ros-collapsed'),
      curweek: window.CURWEEK, curpage: window.CURPAGE,
    }
  }, sel)
}
/* the in-page read two frames after a click: installed before the press, a capture listener on the window */
async function armFirstFrame(page, sel) {
  await page.evaluate(s => {
    window.__ff = null
    addEventListener('click', () => {
      const t0 = performance.now()
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const wk = document.querySelector(s); if (!wk) { window.__ff = { none: true }; return }
        const wl = wk.getBoundingClientRect().left
        const ds = [...wk.querySelectorAll('.day[data-day]')].filter(d => d.getBoundingClientRect().left >= wl - 2 && d.getBoundingClientRect().width > 0).sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)
        window.__ff = { ms: +(performance.now() - t0).toFixed(1), day: ds[0]?.dataset.day, left: ds[0] ? +ds[0].getBoundingClientRect().left.toFixed(2) : null, scrollLeft: wk.scrollLeft, page: window.CURPAGE }
      }))
      /* every frame for 1.2s: the strip's sideways scroll as drawn */
      window.__tr = []
      const tick = () => { const wk = document.querySelector(s); window.__tr.push([Math.round(performance.now() - t0), wk ? Math.round(wk.scrollLeft) : null, wk ? wk.getBoundingClientRect().width > 0 : false]); if (performance.now() - t0 < 1200) requestAnimationFrame(tick) }
      requestAnimationFrame(tick)
    }, { capture: true, once: true })
  }, sel)
}
const firstFrame = page => page.evaluate(() => window.__ff)
/* the trace boiled down: each scroll value the strip was drawn at, with the time it was first drawn there */
const traceSummary = async page => {
  await page.waitForTimeout(100)
  const tr = await page.evaluate(() => window.__tr || [])
  const o = []; for (const [t, v, shown] of tr) { if (!shown) continue; if (!o.length || o[o.length - 1][1] !== v) o.push([t, v]) }
  return { frames: tr.length, steps: o.length, text: o.length > 10 ? o.slice(0, 5).concat([['…', '…']], o.slice(-3)).map(([t, v]) => `${t}ms:${v}`).join(' ') : o.map(([t, v]) => `${t}ms:${v}`).join(' ') }
}
const pic = async (page, name, clip) => { await page.screenshot({ path: path.join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); return name + '.png' }
async function arrow(page, dir, sel = EDIT) {
  await page.click(`.week-nav.${dir}`)
  await rest(page, sel)
  return read(page, sel)
}
const at20 = r => r.front && near(r.front.left, 20, 1)
const fr = r => r.front ? `day ${r.front.day} at ${f1(r.front.left)}` : 'no front day'
/* every control of the strip the tab's box crosses */
const underTab = page => page.evaluate(() => {
  const rail = document.querySelector('.ros-rail').getBoundingClientRect()
  const wk = document.querySelector('#page-editsched .week').getBoundingClientRect()
  const hit = (r, b) => r.right > b.left && r.left < b.right && r.bottom > b.top && r.top < b.bottom
  const out = []
  for (const el of document.querySelectorAll('#page-editsched .week .day :is(button,a,input,select,textarea,[role=button],.puck,[contenteditable=true])')) {
    const r = el.getBoundingClientRect()
    if (!(r.width > 0) || r.left >= wk.right) continue
    if (hit(r, rail)) out.push(`${String(el.className).split(' ').slice(0, 2).join('.')} "${(el.textContent || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 18)}" ${(Math.min(r.right, rail.right) - Math.max(r.left, rail.left)).toFixed(0)}x${(Math.min(r.bottom, rail.bottom) - Math.max(r.top, rail.top)).toFixed(0)}px of ${r.width.toFixed(0)}x${r.height.toFixed(0)}`)
  }
  return out
})
const sl = page => page.evaluate(() => document.getElementById('eWeek').scrollLeft)

/* ===================== S1 — Edit Schedule opened by its tab from View-only Sched ===================== */
async function s1(browser, tag = 's1', pictures = true) {
  const { ctx, page } = await freshDesk(browser, tag)
  const out = {}
  try {
    const startPage = await page.evaluate(() => window.CURPAGE)
    if (startPage !== 'viewsched') await tab(page, 'View-only Sched', 'viewsched')
    const how = await pressTabArmed(page, 'Edit Schedule', EDIT)
    const t0 = Date.now()
    let p1 = null
    if (pictures) p1 = await pic(page, `${tag}-1-first-frame`)
    const tPic = Date.now() - t0
    await page.waitForFunction(() => window.CURPAGE === 'editsched'); await rest(page, EDIT)
    const ff = await firstFrame(page)
    const trs = await traceSummary(page)
    await park(page)
    const r = await read(page)
    const p2 = pictures ? await pic(page, `${tag}-2-settled`) : null
    const p3 = pictures ? await pic(page, `${tag}-3-left-edge`, { x: 0, y: 150, width: 420, height: 420 }) : null
    const overlap = r.prev && r.front ? r.prev.right > r.front.left : null
    out.r = r; out.ff = ff
    const ok = r.front?.day === '0' && at20(r) && ff && ff.day === '0' && near(ff.left, 20, 1) && overlap === false && near(r.prev?.width, 14, 0.6)
    rec(`${tag}`, ok ? 'PASS' : 'FAIL', `opened from ${startPage} by its ${how}; first frame (${ff?.ms}ms after the click, in-page) ${ff ? 'day ' + ff.day + ' at ' + f1(ff.left) : 'not read'}; screenshot taken ${tPic}ms after the click resolved; settled ${fr(r)}; the strip's scroll as drawn frame by frame (${trs.frames} frames): ${trs.text}; left arrow ${f1(r.prev?.left)}–${f1(r.prev?.right)} (width ${f1(r.prev?.width)}), overlaps Monday: ${overlap}`, [p1, p2, p3].filter(Boolean))
  } finally { await ctx.close() }
  return out
}

/* ===================== S2 — fold and unfold ===================== */
async function s2(browser, tag = 's2', pictures = true) {
  const { ctx, page } = await freshDesk(browser, tag)
  try {
    await tab(page, 'Edit Schedule', 'editsched')
    await park(page)
    for (let round = 1; round <= 3; round++) {
      const before = await read(page)
      if (before.folded) { rec(`${tag}.r${round}`, 'NOT WALKED', 'the panel was already folded at the start of the round'); break }
      await page.click('.ros-rail'); await page.waitForFunction(() => document.body.classList.contains('ros-collapsed')); await page.waitForTimeout(350); await rest(page); await park(page)
      const f = await read(page)
      const okF = near(f.week.right, f.innerWidth, 0.5) && f.boardPadRight === 0 && near(f.rail?.left, before.rail?.left, 0.5) && near(f.rail?.top, before.rail?.top, 0.5) && near(f.rail?.width, before.rail?.width, 0.5)
        && near(f.next?.left, before.next?.left, 0.5) && near(f.next?.top, before.next?.top, 0.5) && f.bar && near(f.bar.right, f.innerWidth, 1) && f.pageScrollW === f.innerWidth
      const pf = (pictures && round === 1) ? [await pic(page, `${tag}-1-folded`), await pic(page, `${tag}-2-folded-right-edge`, { x: f.innerWidth - 420, y: 100, width: 420, height: 500 })] : []
      rec(`${tag}.r${round}.fold`, okF ? 'PASS' : 'FAIL', `strip right ${f1(f.week.right)} / window ${f.innerWidth}; lane ${f.boardPadRight}; tab ${f1(before.rail?.left)},${f1(before.rail?.top)} → ${f1(f.rail?.left)},${f1(f.rail?.top)} (w ${f1(f.rail?.width)}); next arrow ${f1(before.next?.left)},${f1(before.next?.top)} → ${f1(f.next?.left)},${f1(f.next?.top)}; foot bar ${f1(f.bar?.left)}–${f1(f.bar?.right)}; page scrollWidth ${f.pageScrollW}; strip end-pad ${f.padRight}`, pf)
      await page.click('.ros-rail'); await page.waitForFunction(() => !document.body.classList.contains('ros-collapsed')); await page.waitForTimeout(350); await rest(page); await park(page)
      const o = await read(page)
      const okO = o.panel && o.week.right <= o.panel.left + 0.5 && o.rail && o.rail.left >= o.panel.right - 0.5 && o.bar && near(o.bar.right, o.week.right, 1) && near(o.bar.left, o.week.left, 1) && o.pageScrollW === o.innerWidth
      const po = (pictures && round === 1) ? [await pic(page, `${tag}-3-open`), await pic(page, `${tag}-4-open-right-edge`, { x: o.innerWidth - 420, y: 100, width: 420, height: 500 })] : []
      rec(`${tag}.r${round}.unfold`, okO ? 'PASS' : 'FAIL', `strip right ${f1(o.week.right)}, panel ${f1(o.panel?.left)}–${f1(o.panel?.right)}, tab ${f1(o.rail?.left)}–${f1(o.rail?.right)}; lane ${o.boardPadRight}; foot bar ${f1(o.bar?.left)}–${f1(o.bar?.right)} vs strip ${f1(o.week.left)}–${f1(o.week.right)}; page scrollWidth ${o.pageScrollW}/${o.innerWidth}`, po)
    }
  } finally { await ctx.close() }
}

/* ===================== S3 — the folded tab is solid over a day; the day beside it answers ===================== */
async function cropsEqual(page, a, b) {
  if (a.equals(b)) return { same: true, diff: 0 }
  const res = await page.evaluate(async ([x, y]) => {
    const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s })
    const [A, B] = await Promise.all([load(x), load(y)])
    const c = document.createElement('canvas'); c.width = A.width; c.height = A.height; const g = c.getContext('2d')
    g.drawImage(A, 0, 0); const da = g.getImageData(0, 0, A.width, A.height).data
    g.clearRect(0, 0, c.width, c.height); g.drawImage(B, 0, 0); const db = g.getImageData(0, 0, B.width, B.height).data
    let n = 0, mx = 0; const at = []
    for (let i = 0; i < da.length; i += 4) { const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2])); if (d > 0) { n++; if (at.length < 8) at.push(`(${(i / 4) % A.width},${Math.floor(i / 4 / A.width)}:${d})`) } if (d > mx) mx = d }
    return { w: A.width, h: A.height, n, mx, at, sizeSame: A.width === B.width && A.height === B.height }
  }, [a.toString('base64'), b.toString('base64')])
  return { same: res.n === 0 && res.sizeSame, diff: res.n, max: res.mx, dims: `${res.w}x${res.h}`, at: res.at.join(' ') }
}
async function s3(browser) {
  const { ctx, page } = await freshDesk(browser, 's3')
  try {
    await tab(page, 'Edit Schedule', 'editsched'); await fold(page, true); await park(page)
    const r0 = await read(page)
    const clip = { x: Math.floor(r0.rail.left), y: Math.floor(r0.rail.top), width: Math.ceil(r0.rail.width), height: Math.ceil(r0.rail.height) }
    const under0 = await page.evaluate(([x, y]) => { const els = document.elementsFromPoint(x, y); return els.slice(0, 4).map(e => e.tagName + '.' + String(e.className).split(' ')[0]) }, [r0.rail.left + r0.rail.width / 2, r0.rail.top + r0.rail.height - 6])
    const a = await page.screenshot({ clip }); writeFileSync(path.join(OUT, 's3-1-tab-over-monday-strip.png'), a)
    const calClip = { ...clip, x: clip.x - 60 }
    const ca = await page.screenshot({ clip: calClip })
    await arrow(page, 'next'); await park(page)
    const r1 = await read(page)
    const b = await page.screenshot({ clip }); writeFileSync(path.join(OUT, 's3-2-tab-after-one-day.png'), b)
    const cmp = await cropsEqual(page, a, b)
    /* calibration: the same read on a strip area of the same size 60px left of the tab, which DID change under the arrow */
    const cal = await cropsEqual(page, ca, await page.screenshot({ clip: calClip }))
    const wide = await pic(page, 's3-3-right-edge-context', { x: r0.innerWidth - 300, y: 120, width: 300, height: 200 })
    /* a differing pixel inside a corner square of the tab's own rounded corner is the anti-aliased edge showing what is
       behind it, outside the tab's face; anything else is the face */
    const rad = await page.evaluate(() => getComputedStyle(document.querySelector('.ros-rail')).borderTopLeftRadius + ' ' + getComputedStyle(document.querySelector('.ros-rail')).borderBottomLeftRadius)
    const rpx = Math.ceil(Math.max(...rad.split(' ').map(parseFloat)) * (await page.evaluate(() => devicePixelRatio)))
    const pts = (cmp.at || '').split(' ').filter(Boolean).map(s => s.slice(1, -1).split(/[,:]/).map(Number))
    const [W, H] = (cmp.dims || '0x0').split('x').map(Number)
    const cornerOnly = !cmp.same && cmp.diff <= 8 && pts.every(([x, y]) => (x < rpx || x >= W - rpx) && (y < rpx || y >= H - rpx))
    rec('s3.solid', cmp.same ? 'PASS' : (cornerOnly && cmp.max <= 2 ? 'PASS*' : 'FAIL'), `${cornerOnly ? `[* every differing pixel lies in a ${rpx}px corner square of the tab's rounded corners (radius ${rad}), max ${cmp.max} colour level — the face itself identical] ` : ''}tab box ${clip.x},${clip.y} ${clip.width}x${clip.height}; under the tab's foot: ${under0.join(' > ')}; front ${fr(r0)} → ${fr(r1)}; crops ${cmp.same ? 'pixel-identical' : `differ in ${cmp.diff} pixels (max ${cmp.max} colour levels) of ${cmp.dims} at ${cmp.at}`}; calibration (same read, the strip 60px left of the tab): ${cal.same ? 'identical — read NOT calibrated' : `differs in ${cal.diff} pixels, max ${cal.max}`}`, ['s3-1-tab-over-monday-strip.png', 's3-2-tab-after-one-day.png', wide])
    /* a control of the day just left of the tab: a typed box (a .txed) whose box spans x = tab.left − 30, in the screen */
    const target = await page.evaluate(x => {
      const c = [...document.querySelectorAll('#eWeek .day .txed, #eWeek .day .seat[data-drag] .puck, #eWeek .day button')].map(e => ({ e, r: e.getBoundingClientRect() }))
        .filter(o => o.r.width > 0 && o.r.left <= x && o.r.right >= x && o.r.top > 250 && o.r.bottom < innerHeight - 60)
      if (!c.length) return null
      const o = c[0]; o.e.setAttribute('data-sre-target', '1')
      return { cls: String(o.e.className), text: (o.e.textContent || '').trim().slice(0, 30), x: o.r.left + Math.min(o.r.width - 2, Math.max(2, x - o.r.left)), y: o.r.top + o.r.height / 2, top: document.elementFromPoint(x, o.r.top + o.r.height / 2) === o.e || o.e.contains(document.elementFromPoint(x, o.r.top + o.r.height / 2)) }
    }, r1.rail.left - 30)
    if (!target) rec('s3.beside', 'NOT WALKED', `no control of the strip spans x=${f1(r1.rail.left - 30)} inside the screen`)
    else {
      const slBefore = await sl(page)
      await page.mouse.click(target.x, target.y); await page.waitForTimeout(400)
      const res = await page.evaluate(() => { const a = document.activeElement; return { active: a ? a.tagName + '.' + String(a.className).slice(0, 40) : null, isTarget: !!a && (a.hasAttribute('data-sre-target') || !!a.closest('[data-sre-target]')), picked: !!document.querySelector('.picked, .puck.sel, .sel-puck, [data-picked]') } })
      const p = await pic(page, 's3-4-pressed-beside-tab', { x: r1.innerWidth - 420, y: Math.max(0, target.y - 150), width: 420, height: 300 })
      const slAfter = await sl(page)
      rec('s3.beside', res.isTarget || res.picked ? 'PASS' : 'RECORDED', `[host] pressed ${target.cls} "${target.text}" at ${f1(target.x)},${f1(target.y)} (30px left of the tab; the element on top there was it: ${target.top}); focus went to ${res.active} (the target: ${res.isTarget}); strip moved ${f1(slAfter - slBefore)}px`, [p])
      await page.mouse.click(700, 140); await page.waitForTimeout(300)
    }
  } finally { await ctx.close() }
}

/* ===================== S4 — the arrows, folded ===================== */
async function s4(browser, tag = 's4', pictures = true) {
  const { ctx, page } = await freshDesk(browser, tag)
  const res = { ok: true, notes: [] }
  try {
    await tab(page, 'Edit Schedule', 'editsched'); await fold(page, true)
    const r0 = await read(page)
    const seq = []
    for (let i = 1; i <= 6; i++) { const r = await arrow(page, 'next'); seq.push(r); if (!(r.front?.day === String(i) && at20(r))) res.ok = false; res.notes.push(`next→${fr(r)}`) }
    if (pictures) await park(page)
    const pA = pictures ? await pic(page, `${tag}-1-sunday-first`) : null
    for (let i = 5; i >= 0; i--) { const r = await arrow(page, 'prev'); seq.push(r); if (!(r.front?.day === String(i) && at20(r))) res.ok = false; res.notes.push(`prev→${fr(r)}`) }
    rec(`${tag}.step`, res.ok ? 'PASS' : 'FAIL', `start ${fr(r0)}; ${res.notes.join('; ')}`, pA ? [pA] : [])
    /* three quick presses: no wait between */
    await page.click('.week-nav.next'); await page.click('.week-nav.next'); await page.click('.week-nav.next')
    await rest(page); await page.waitForTimeout(200); await rest(page)
    const q = await read(page)
    if (pictures) await park(page)
    const pB = pictures ? await pic(page, `${tag}-2-after-three-quick`) : null
    rec(`${tag}.quick`, q.front?.day === '3' && at20(q) ? 'PASS' : 'FAIL', `three quick presses from Monday: ${fr(q)} (week ${q.curweek})`, pB ? [pB] : [])
    res.quick = q
  } finally { await ctx.close() }
  return res
}

/* ===================== S5 — the week's end by the arrows, folded ===================== */
async function s5(browser) {
  const { ctx, page } = await freshDesk(browser, 's5')
  try {
    await tab(page, 'Edit Schedule', 'editsched'); await fold(page, true)
    const w0 = (await read(page)).curweek
    for (let i = 0; i < 6; i++) await arrow(page, 'next')
    const sun = await read(page)
    if (sun.front?.day !== '6') { rec('s5', 'NOT WALKED', `could not reach Sunday first: ${fr(sun)}`); return }
    await page.click('.week-nav.next')
    await page.waitForFunction(w => window.CURWEEK !== w, w0, { timeout: 4000 }).catch(() => {})
    await page.waitForTimeout(600); await rest(page); await park(page)
    const a = await read(page)
    const p1 = await pic(page, 's5-1-after-next-at-sunday')
    rec('s5.next', 'RECORDED', `from week ${w0} Sunday first (${fr(sun)}), next-day arrow: week ${a.curweek}, ${fr(a)} (${a.frontDate}) [host expects next week's Monday at 20±1: ${a.curweek !== w0 && a.front?.day === '0' && at20(a) ? 'matches' : 'DIFFERS'}]`, [p1])
    if (a.front?.day !== '0') { rec('s5.prev', 'NOT WALKED', 'Monday was not first after the cross'); return }
    const w1 = a.curweek
    await page.click('.week-nav.prev')
    await page.waitForFunction(w => window.CURWEEK !== w, w1, { timeout: 4000 }).catch(() => {})
    await page.waitForTimeout(600); await rest(page); await park(page)
    const b = await read(page)
    const p2 = await pic(page, 's5-2-after-prev-at-monday')
    rec('s5.prev', 'RECORDED', `from week ${w1} Monday first, previous-day arrow: week ${b.curweek}, ${fr(b)} (${b.frontDate}) [host expects last week's Sunday at 20±1: ${b.curweek === w0 && b.front?.day === '6' && at20(b) ? 'matches' : 'DIFFERS'}]`, [p2])
  } finally { await ctx.close() }
}

/* ===================== S6 — the far end, folded ===================== */
async function s6(browser, tag = 's6', pictures = true) {
  const { ctx, page } = await freshDesk(browser, tag)
  const res = {}
  try {
    await tab(page, 'Edit Schedule', 'editsched'); await fold(page, true); await park(page)
    res.under0 = await underTab(page)
    /* the foot bar's own track taken fully right by a sideways wheel over it (its › steps one day and crosses the week at
       Sunday, as the day arrows do — seen on the first run, so not used to reach the end) */
    const w0 = (await read(page)).curweek
    const tr = await page.locator('#hsTrack').boundingBox()
    await page.mouse.move(tr.x + tr.width / 2, tr.y + tr.height / 2)
    for (let i = 0; i < 4; i++) { await page.mouse.wheel(3000, 0); await page.waitForTimeout(250) }
    await rest(page); await park(page)
    const r = await read(page)
    res.underEnd = await underTab(page); res.r = r
    const p = pictures ? [await pic(page, `${tag}-1-far-end`), await pic(page, `${tag}-2-far-end-right`, { x: r.innerWidth - 420, y: 100, width: 420, height: 560 })] : []
    const gap = r.rail ? r.rail.left - r.last.right : null
    /* the last column a person sees: the right-most drawn day of any kind */
    const lastSeen = await page.evaluate(() => { const ds = [...document.querySelectorAll('#eWeek .day')].map(d => ({ d: d.hasAttribute('data-day') ? 'day ' + d.dataset.day : 'next-week preview ' + d.getAttribute('data-peek-day'), r: d.getBoundingClientRect().right, w: d.getBoundingClientRect().width })).filter(o => o.w > 0).sort((a, b) => b.r - a.r); return ds[0] })
    res.ok = r.rail && r.last.right <= r.rail.left - 7.5 && lastSeen.r <= r.rail.left - 7.5 && near(r.scrollLeft, r.maxScroll, 1) && r.curweek === w0
    rec(`${tag}.end`, res.ok ? 'PASS' : 'FAIL', `a wheel on the foot bar's track: scrollLeft ${f1(r.scrollLeft)} of max ${f1(r.maxScroll)}, week ${w0} → ${r.curweek}; right-most column ${lastSeen.d} right ${f1(lastSeen.r)}; tab left ${f1(r.rail?.left)}, gap ${f1(gap)}`, p)
    rec(`${tag}.under`, 'RECORDED', `under the tab at the start: ${res.under0.length ? res.under0.join(' | ') : 'nothing'}; at the far end: ${res.underEnd.length ? res.underEnd.join(' | ') : 'nothing'}`)
  } finally { await ctx.close() }
  return res
}

/* ===================== S7 — the next-day arrow slides out near the pointer ===================== */
async function s7(browser) {
  const { ctx, page } = await freshDesk(browser, 's7')
  try {
    await tab(page, 'Edit Schedule', 'editsched'); await fold(page, true); await park(page)
    const r0 = await read(page)
    const look = () => page.evaluate(() => { const e = document.querySelector('.week-nav.next'), r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { left: r.left, width: r.width, bg: cs.backgroundColor, opacity: cs.opacity } })
    const slim = await look()
    const y = r0.next.top + r0.next.height / 2
    await page.mouse.move(r0.innerWidth - 30, y, { steps: 6 }); await page.waitForTimeout(500)
    const out = await look()
    const p1 = await pic(page, 's7-1-arrow-slid-out', { x: r0.innerWidth - 300, y: y - 120, width: 300, height: 240 })
    const alpha = (() => { const m = out.bg.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return p.length === 4 ? p[3] : 1 })()
    rec('s7.out', near(out.width, 38, 1) && ((alpha != null && alpha < 1) || +out.opacity < 1) ? 'PASS' : 'FAIL', `slim ${f1(slim.width)} wide at ${f1(slim.left)}; pointer at ${r0.innerWidth - 30},${f1(y)} → ${f1(out.width)} wide at ${f1(out.left)}, background ${out.bg}, opacity ${out.opacity}`, [p1])
    const s0 = await sl(page)
    await page.mouse.click(r0.innerWidth - 12, y); await rest(page)
    const r1 = await read(page)
    const p2 = await pic(page, 's7-2-after-press', { x: 0, y: 150, width: r0.innerWidth, height: 450 })
    rec('s7.press', r1.front?.day === '1' && at20(r1) ? 'PASS' : 'FAIL', `press on the slid-out arrow: strip moved ${f1(r1.scrollLeft - s0)}px, ${fr(r1)}`, [p2])
    await park(page); await page.waitForTimeout(600)
    const back = await look()
    const p3 = await pic(page, 's7-3-pointer-away', { x: r0.innerWidth - 300, y: y - 120, width: 300, height: 240 })
    rec('s7.back', near(back.width, 14, 0.6) ? 'PASS' : 'FAIL', `pointer moved away: ${f1(back.width)} wide at ${f1(back.left)}`, [p3])
  } finally { await ctx.close() }
}

/* ===================== S8 — other window sizes and scalings ===================== */
async function s8() {
  const sizes = [[822, 1.25], [1140, 1.25], [1707, 1.25], [1920, 1.25], [1536, 1], [1536, 1.5]]
  for (const [w, sc] of sizes) {
    const tag = `s8-w${w}-x${sc}`
    if (ONLY.length && !ONLY.includes('s8') && !ONLY.includes(tag)) continue
    const browser = await deskBrowser(w, 864, sc)
    try {
      for (const [sub, fn] of [['s1', s1], ['s2', s2], ['s4', s4], ['s6', s6]]) {
        try { await fn(browser, `${tag}-${sub}`, false) } catch (e) { rec(`${tag}-${sub}`, 'ERROR', String(e).split('\n')[0].slice(0, 300)) }
      }
      const { ctx, page } = await freshDesk(browser, tag)
      await tab(page, 'Edit Schedule', 'editsched'); await fold(page, true); await park(page)
      const r = await read(page)
      const p = await pic(page, `${tag}-folded`)
      rec(`${tag}.size`, 'RECORDED', `innerWidth ${r.innerWidth}, devicePixelRatio ${await page.evaluate(() => devicePixelRatio)}, strip right ${f1(r.week.right)}, tab ${f1(r.rail?.left)}–${f1(r.rail?.right)}, foot bar ${f1(r.bar?.left)}–${f1(r.bar?.right)}`, [p])
      await ctx.close()
    } finally { await browser.close() }
  }
}

/* ===================== S9 — a resize to the phone width and back (a context WITH a viewport, scale 1) ===================== */
async function s9(browser) {
  const { ctx, page } = await freshDesk(browser, 's9', { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 })
  try {
    await tab(page, 'Edit Schedule', 'editsched'); await fold(page, true); await park(page)
    const a = await read(page)
    await page.setViewportSize({ width: 800, height: 864 }); await page.waitForTimeout(900)
    const ph = await page.evaluate(() => {
      const t = document.querySelector('#page-editsched .eroster .ros-tab'), b = document.querySelector('#page-editsched .edit-board')
      const tr = t && t.getBoundingClientRect()
      return { innerWidth, tabShown: !!t && getComputedStyle(t).display !== 'none' && tr.width > 0, tab: tr ? [tr.left, tr.right, tr.top, tr.bottom].map(n => +n.toFixed(1)) : null, tabText: t ? t.textContent.trim().replace(/\s+/g, ' ') : null,
        lane: b ? getComputedStyle(b).paddingRight : null, pageScrollW: document.scrollingElement.scrollWidth, rail: (() => { const r = document.querySelector('.ros-rail'); return r && getComputedStyle(r).display !== 'none' && r.getBoundingClientRect().width > 0 })(), folded: document.body.classList.contains('ros-collapsed') }
    })
    const p1 = await pic(page, 's9-1-at-800')
    rec('s9.800', ph.tabShown && ph.lane === '0px' && ph.pageScrollW <= ph.innerWidth ? 'PASS' : 'FAIL', `[host] at 800: AIRCREW tab shown ${ph.tabShown} ("${ph.tabText}" at ${ph.tab}), lane ${ph.lane}, page scrollWidth ${ph.pageScrollW}/${ph.innerWidth}, desktop CREW tab shown ${ph.rail}, folded class ${ph.folded}`, [p1])
    await page.setViewportSize({ width: 1536, height: 864 }); await page.waitForTimeout(900); await rest(page); await park(page)
    const b = await read(page)
    const p2 = await pic(page, 's9-2-back-at-1536')
    rec('s9.back', b.folded && near(b.week.right, b.innerWidth, 0.5) && b.bar && near(b.bar.right, b.innerWidth, 1) && b.pageScrollW === b.innerWidth ? 'PASS' : 'FAIL', `[host] back at 1536: folded ${b.folded}, strip right ${f1(b.week.right)}/${b.innerWidth}, foot bar ${f1(b.bar?.left)}–${f1(b.bar?.right)}, page scrollWidth ${b.pageScrollW} (before the resize: strip right ${f1(a.week.right)}, bar right ${f1(a.bar?.right)}); ${fr(b)}`, [p2])
  } finally { await ctx.close() }
}

/* ===================== S10 — the page scrolled to its foot and back ===================== */
async function s10(browser) {
  const { ctx, page } = await freshDesk(browser, 's10')
  try {
    await tab(page, 'Edit Schedule', 'editsched')
    for (const folded of [false, true]) {
      await fold(page, folded); await park(page)
      const tag = folded ? 'folded' : 'open'
      const samp = async () => page.evaluate(() => {
        const bx = s => { const e = document.querySelector(s); if (!e || getComputedStyle(e).display === 'none') return null; const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(n => +n.toFixed(1)).join(',') }
        const h = document.querySelector('#page-editsched .er-h'), tb = document.querySelector('.topbar')
        const hr = h && h.getBoundingClientRect(), tbb = tb ? tb.getBoundingClientRect().bottom : 0
        let headSeen = null
        if (hr && hr.width > 0) { const el = document.elementFromPoint(hr.left + hr.width / 2, hr.top + hr.height / 2); headSeen = !!el && (h === el || h.contains(el)) }
        return { y: Math.round(document.scrollingElement.scrollTop), maxY: document.scrollingElement.scrollHeight - innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth, sx: scrollX, rail: bx('.ros-rail'), next: bx('.week-nav.next'), prev: bx('.week-nav.prev'), head: hr && hr.width ? `${hr.top.toFixed(1)}–${hr.bottom.toFixed(1)}` : null, headText: h ? h.textContent.trim().replace(/\s+/g, ' ') : null, headSeen, topbarBottom: +tbb.toFixed(1), stripSl: document.getElementById('eWeek').scrollLeft }
      })
      const seq = [await samp()]
      let stuck = 0
      for (let i = 0; i < 40 && stuck < 3; i++) { await page.mouse.wheel(0, 700); await page.waitForTimeout(220); const s = await samp(); stuck = s.y === seq[seq.length - 1].y ? stuck + 1 : 0; seq.push(s) }
      const foot = seq[seq.length - 1]
      const p1 = await pic(page, `s10-${tag}-1-foot`)
      stuck = 0
      for (let i = 0; i < 40 && stuck < 3; i++) { await page.mouse.wheel(0, -700); await page.waitForTimeout(220); const s = await samp(); stuck = s.y === seq[seq.length - 1].y ? stuck + 1 : 0; seq.push(s) }
      const top = seq[seq.length - 1]
      const p2 = await pic(page, `s10-${tag}-2-top-again`)
      const noSide = seq.every(s => s.sw === s.iw && s.sx === 0)
      const stripStill = seq.every(s => Math.abs(s.stripSl - seq[0].stripSl) < 1)
      const fixed = seq.every(s => s.rail === seq[0].rail && s.next === seq[0].next && s.prev === seq[0].prev)
      const headOk = folded ? true : seq.every(s => s.headSeen === true && parseFloat(s.head) >= s.topbarBottom - 1)
      rec(`s10.${tag}`, foot.y > 500 && noSide && headOk && stripStill ? 'PASS' : 'FAIL', `page scrolled 0 → ${foot.y} (max ${foot.maxY}) → ${top.y}, ${seq.length} samples; no sideways page scroll at any: ${noSide}; strip's sideways scroll unchanged: ${stripStill}; ${folded ? '' : `AIRCREW heading in sight under the top bar (bottom ${seq[0].topbarBottom}) at every sample: ${headOk} (at the foot ${foot.head}, "${foot.headText}"); `}tab/arrows' boxes unchanged throughout: ${fixed} (tab ${seq[0].rail}; next ${seq[0].next}; prev ${seq[0].prev}; at the foot tab ${foot.rail}, next ${foot.next})`, [p1, p2])
    }
  } finally { await ctx.close() }
}

/* ===================== S11 — a man held at the week's right side, folded ===================== */
async function s11(browser) {
  const { ctx, page } = await freshDesk(browser, 's11')
  try {
    await tab(page, 'Edit Schedule', 'editsched'); await fold(page, true); await park(page)
    const r0 = await read(page)
    const man = await page.evaluate(() => {
      const ps = [...document.querySelectorAll('#eWeek .day[data-day="0"] .seat[data-drag]')].map(s => ({ s, b: s.querySelector('.puck')?.getBoundingClientRect() })).filter(o => o.b && o.b.width && o.b.top > 260 && o.b.bottom < innerHeight - 60)
      const o = ps[0]; if (!o) return null
      return { key: o.s.dataset.slot, val: window.slotVal(o.s.dataset.slot), x: Math.round(o.b.left + o.b.width / 2), y: Math.round(o.b.top + o.b.height / 2) }
    })
    if (!man) { rec('s11', 'NOT WALKED', 'no Monday seat with a man inside the screen'); return }
    const monBefore = await page.evaluate(() => JSON.stringify([...document.querySelectorAll('#eWeek .day[data-day="0"] [data-slot]')].map(e => e.dataset.slot + '=' + window.slotVal(e.dataset.slot))))
    const yHold = Math.round(Math.max(r0.rail.top + r0.rail.height / 2, r0.week.top + 12))
    const sample = async (ms) => { const out = []; const t0 = Date.now(); while (Date.now() - t0 < ms) { out.push(await page.evaluate(() => [Math.round(document.getElementById('eWeek').scrollLeft), window.CURWEEK])); await page.waitForTimeout(60) } return out }
    /* the places the week RESTED at while held: a value read three times running (a glide passes through others) */
    const rests = arr => { const o = []; for (let i = 2; i < arr.length; i++) if (arr[i][0] === arr[i - 1][0] && arr[i][0] === arr[i - 2][0] && o[o.length - 1] !== arr[i][0]) o.push(arr[i][0]); return o }
    await page.mouse.move(man.x, man.y); await page.mouse.down()
    await page.mouse.move(man.x + 20, man.y + 4, { steps: 4 })
    const ghost = await page.evaluate(() => !!document.querySelector('.drag-ghost, .ghost, [data-ghost], body.dragging, .dragging'))
    const ax = Math.round(r0.rail.left - 6)
    await page.mouse.move(ax, yHold, { steps: 14 })
    const sA = await sample(2600)
    const pA = await pic(page, 's11-1-held-left-of-tab')
    const bx = Math.round(r0.rail.left + r0.rail.width / 2)
    await page.mouse.move(bx, yHold, { steps: 4 })
    const sB = await sample(2600)
    const pB = await pic(page, 's11-2-held-on-tab')
    const w0 = r0.curweek
    const restA = rests([[0, w0], [0, w0], [0, w0], ...sA]), restB = rests([...sA.slice(-3), ...sB])
    rec('s11.left-of-tab', 'RECORDED', `picked ${man.val} (${man.key}) at ${man.x},${man.y}; drag ghost/dragging seen: ${ghost}; held 2.6s at ${ax},${yHold} (6px left of the tab): rested at ${restA.join(' → ')}; weeks seen ${[...new Set(sA.map(x => x[1]))].join(',')}`, [pA])
    rec('s11.on-tab', 'RECORDED', `[host: the hold works there too] then held 2.6s ON the tab at ${bx},${yHold}: rested at ${restB.join(' → ')}; weeks seen ${[...new Set(sB.map(x => x[1]))].join(',')}`, [pB])
    /* D1529 checks across both holds: each rest one day on from the last, never another week */
    const all = [...restA, ...restB.slice(1)]; const deltas = all.slice(1).map((v, i) => v - all[i])
    const dayStep = await page.evaluate(() => { const d = document.querySelectorAll('#eWeek .day[data-day]'); return Math.round(d[1].getBoundingClientRect().left - d[0].getBoundingClientRect().left) })
    const oneDay = deltas.every(d => Math.abs(Math.abs(d) - dayStep) <= 2)
    const sameWeek = [...sA, ...sB].every(x => x[1] === w0)
    rec('s11.d1529', deltas.length && oneDay && sameWeek ? 'PASS' : (deltas.length ? 'FAIL' : 'RECORDED'), `rest to rest: ${deltas.join(', ') || 'no step'} (a day is ${dayStep}px); stayed in week ${w0}: ${sameWeek}`)
    /* back to the left edge, until Monday returns, then onto the man's own seat and let go */
    await page.mouse.move(14, yHold, { steps: 14 })
    const sC = await sample(6500)
    const seat = await page.evaluate(k => { const s = document.querySelector(`#eWeek [data-slot="${k}"]`); const b = s.getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2), inView: b.left > 0 && b.right < innerWidth } }, man.key)
    if (!seat.inView) { rec('s11.drop-back', 'NOT WALKED', `held at the left edge (x 14): rested at ${rests(sC).join(' → ')}; Monday did not come back, so the man's own seat was off the screen (${seat.x}); the drag was let go on the top bar instead`); await page.mouse.move(700, 30, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(600) }
    else { await page.mouse.move(seat.x, seat.y, { steps: 10 }); await page.waitForTimeout(250); await page.mouse.up(); await page.waitForTimeout(600) }
    const monAfter = await page.evaluate(() => JSON.stringify([...document.querySelectorAll('#eWeek .day[data-day="0"] [data-slot]')].map(e => e.dataset.slot + '=' + window.slotVal(e.dataset.slot))))
    const pC = await pic(page, 's11-3-dropped-back')
    if (seat.inView) rec('s11.drop-back', monAfter === monBefore ? 'PASS' : 'FAIL', `held at the left edge (x 14): rested at ${rests(sC).join(' → ')}; dropped on its own seat at ${seat.x},${seat.y}; Monday's seats unchanged: ${monAfter === monBefore}`, [pC])
    else rec('s11.after-drop', 'RECORDED', `Monday's seats unchanged after letting go on the top bar: ${monAfter === monBefore}`, [pC])
  } finally { await page.mouse.up().catch(() => {}); await ctx.close() }
}

/* ===================== S12 — the day carried across a page switch ===================== */
async function s12(browser) {
  const { ctx, page } = await freshDesk(browser, 's12')
  try {
    await tab(page, 'Edit Schedule', 'editsched')
    await arrow(page, 'next'); const wed = await arrow(page, 'next')
    await armFirstFrame(page, VIEW)
    await page.locator('.topbar').getByText('View-only Sched', { exact: true }).first().click()
    const pv1 = await pic(page, 's12-1-view-first-frame')
    await page.waitForFunction(() => window.CURPAGE === 'viewsched'); await rest(page, VIEW)
    const ffv = await firstFrame(page); const trv = await traceSummary(page); await park(page)
    const v = await read(page, VIEW); const pv2 = await pic(page, 's12-2-view-settled')
    rec('s12.to-view', v.front?.day === '2' && at20(v) && ffv?.day === '2' && near(ffv.left, 20, 1) ? 'PASS' : 'FAIL', `Edit had ${fr(wed)} (scrollLeft ${f1(wed.scrollLeft)}); View first frame (${ffv?.ms}ms) day ${ffv?.day} at ${f1(ffv?.left)}; settled ${fr(v)} (scrollLeft ${f1(v.scrollLeft)}); View's strip scroll as drawn frame by frame (${trv.frames} frames, ${trv.steps} distinct): ${trv.text}`, [pv1, pv2])
    await armFirstFrame(page, EDIT)
    await page.locator('.topbar').getByText('Edit Schedule', { exact: true }).first().click()
    const pe1 = await pic(page, 's12-3-edit-first-frame')
    await page.waitForFunction(() => window.CURPAGE === 'editsched'); await rest(page, EDIT)
    const ffe = await firstFrame(page); const tre = await traceSummary(page); await park(page)
    const e = await read(page); const pe2 = await pic(page, 's12-4-edit-settled')
    rec('s12.to-edit', e.front?.day === '2' && at20(e) && ffe?.day === '2' && near(ffe.left, 20, 1) ? 'PASS' : 'FAIL', `back on Edit: first frame (${ffe?.ms}ms) day ${ffe?.day} at ${f1(ffe?.left)}; settled ${fr(e)}; Edit's strip scroll frame by frame (${tre.frames} frames, ${tre.steps} distinct): ${tre.text}`, [pe1, pe2])
    const head = await page.evaluate(() => { const h = document.querySelector('#page-editsched .er-h'); return { text: h ? h.textContent.trim().replace(/\s+/g, ' ') : null, open: !document.body.classList.contains('ros-collapsed') } })
    const ph = await pic(page, 's12-5-aircrew-heading', { x: e.innerWidth - 420, y: 120, width: 420, height: 200 })
    rec('s12.heading', 'RECORDED', `panel open ${head.open}; the AIRCREW heading reads "${head.text}" with Wednesday first`, [ph])
  } finally { await ctx.close() }
}

/* ===================== S13 — "Jump to a date" ===================== */
async function s13(browser) {
  const { ctx, page } = await freshDesk(browser, 's13')
  try {
    await tab(page, 'Edit Schedule', 'editsched'); await park(page)
    const r0 = await read(page)
    const openCal = async () => { await page.locator('button.wk-cal:visible').first().click(); await page.waitForSelector('.weekcal-box .dcal-d.is-sel', { state: 'visible' }); await page.waitForTimeout(300) }
    await openCal()
    const selIso = await page.locator('.weekcal-box .dcal-d.is-sel').first().getAttribute('data-iso')
    const add = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
    const fri = add(selIso, 4)
    const pc = await pic(page, 's13-1-calendar-open')
    await page.locator(`.weekcal-box .dcal-d[data-iso="${fri}"]`).first().click()
    await page.waitForTimeout(500); await rest(page); await park(page)
    const a = await read(page)
    const calOpen = await page.locator('.weekcal-box:visible').count()
    const p1 = await pic(page, 's13-2-after-friday')
    const moved = Math.abs(a.scrollLeft - r0.scrollLeft) > 1
    rec('s13.friday', moved ? (a.front?.day === '4' && at20(a) ? 'PASS' : 'FAIL') : 'RECORDED', `the calendar's picked day was ${selIso} (${fr(r0)}); picked ${fri}: the week ${moved ? 'moved' : 'did not move'} (scrollLeft ${f1(r0.scrollLeft)} → ${f1(a.scrollLeft)}), week ${r0.curweek} → ${a.curweek}, ${fr(a)} (${a.frontDate}); calendar still open: ${calOpen}`, [pc, p1])
    if (calOpen) await page.keyboard.press('Escape')
    /* one press each way after the pick: the arrows step one day from Friday */
    const n1 = await arrow(page, 'next'); const p1b = await arrow(page, 'prev')
    rec('s13.arrows-after', n1.front?.day === '5' && at20(n1) && p1b.front?.day === '4' && at20(p1b) ? 'PASS' : 'FAIL', `after the pick: next → ${fr(n1)} wk ${n1.curweek}; previous → ${fr(p1b)} wk ${p1b.curweek}`)
    await openCal()
    const sel2 = await page.locator('.weekcal-box .dcal-d.is-sel').first().getAttribute('data-iso')
    const other = add(selIso, 9)
    let btn = page.locator(`.weekcal-box .dcal-d[data-iso="${other}"]`).first()
    if (!(await btn.count())) { await page.click('.weekcal-box [data-testid=wcal-next]'); await page.waitForTimeout(400); btn = page.locator(`.weekcal-box .dcal-d[data-iso="${other}"]`).first() }
    await btn.click()
    await page.waitForFunction(w => window.CURWEEK !== w, a.curweek, { timeout: 4000 }).catch(() => {})
    await page.waitForTimeout(700); await rest(page); await park(page)
    const b = await read(page)
    const p2 = await pic(page, 's13-3-after-other-week')
    rec('s13.other-week', 'RECORDED', `calendar's picked day ${sel2}; picked ${other} (a Wednesday of the next week): week ${a.curweek} → ${b.curweek}, ${fr(b)} (${b.frontDate})`, [p2])
  } finally { await ctx.close() }
}

/* ===================== S14 — Undo and Redo off the side ===================== */
async function changeMonday(page) {
  await page.locator(`${EDIT} .day[data-day="0"] [data-air]:visible`).first().click()
  await page.locator('#airAdd').click()
  await page.locator('#airDone').click()
  await page.waitForTimeout(400)
}
async function s14(browser) {
  const { ctx, page } = await freshDesk(browser, 's14')
  try {
    await tab(page, 'Edit Schedule', 'editsched')
    await changeMonday(page)
    for (let i = 0; i < 4; i++) await arrow(page, 'next')
    const off = await read(page)
    await page.click('#undoBtn')
    await page.waitForFunction(s => document.querySelector(s).scrollLeft < 100, EDIT, { timeout: 4000 }).catch(() => {})
    await rest(page); await park(page)
    const u = await read(page)
    const p1 = await pic(page, 's14-1-after-undo')
    rec('s14.undo', u.front?.day === '0' && at20(u) ? 'PASS' : 'FAIL', `four days on (${fr(off)}), Undo: ${fr(u)}`, [p1])
    /* the day arrow after the Undo's jump: does one press move one day from Monday? */
    const after = []
    for (let i = 0; i < 4; i++) { const r = await arrow(page, 'next'); after.push(r); if (i === 0) { await park(page); await pic(page, 's14-1b-one-press-after-undo') } }
    rec('s14.arrow-after-undo', after[0].front?.day === '1' && at20(after[0]) ? 'PASS' : 'FAIL', `with Monday brought back by the Undo, next-day presses landed: ${after.map(r => `${fr(r)} wk ${r.curweek}`).join(' → ')} (D2293: the arrows step one day)`, ['s14-1b-one-press-after-undo.png'])
    /* back to Monday of the walked week by the previous-day arrow, then four on for the Redo */
    for (let i = 0; i < 12; i++) { const r = await read(page); if (r.curweek === off.curweek && r.front?.day === '0') break; await arrow(page, 'prev') }
    for (let i = 0; i < 4; i++) await arrow(page, 'next')
    const off2 = await read(page)
    await page.click('#redoBtn')
    await page.waitForTimeout(800); await rest(page); await park(page)
    const rd = await read(page)
    const p2 = await pic(page, 's14-2-after-redo')
    rec('s14.redo', 'RECORDED', `four days on again (${fr(off2)} wk ${off2.curweek}), Redo: ${fr(rd)} wk ${rd.curweek} [host expects Monday at 20±1: ${rd.front?.day === '0' && at20(rd) ? 'matches' : 'DIFFERS'}]; next-day presses after the Redo: ${(await pressesAfter(page, 2)).join(' → ')}`, [p2])
  } finally { await ctx.close() }
}

/* ===================== S15 — a warning pressed ===================== */
async function s15(browser) {
  const { ctx, page } = await freshDesk(browser, 's15')
  try {
    await tab(page, 'Edit Schedule', 'editsched'); await fold(page, true); await park(page)
    await page.click('#eWeek [data-daywarn="0"]'); await page.waitForTimeout(500)
    const s0 = await sl(page)
    const item = page.locator('#eWeek .witem[data-wdi="0"]').first()
    const txt = (await item.innerText()).replace(/\s+/g, ' ').slice(0, 80)
    await item.click(); await page.waitForTimeout(1200); await rest(page)
    const r = await read(page)
    const lit = await page.evaluate(() => [...document.querySelectorAll('#eWeek .wfoc, #eWeek .wlit, #eWeek .wjump')].filter(e => e.getBoundingClientRect().width > 0).slice(0, 3).map(e => { const b = e.getBoundingClientRect(); return `${(e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 14)}@${b.left.toFixed(0)},${b.top.toFixed(0)}` }))
    const p1 = await pic(page, 's15-1-monday-warning-pressed')
    rec('s15.in-view', Math.abs(r.scrollLeft - s0) < 1 ? 'PASS' : 'FAIL', `Monday's warning "${txt}" pressed (its man on Monday, in view): sideways ${f1(s0)} → ${f1(r.scrollLeft)}; page scrolled to ${await page.evaluate(() => Math.round(document.scrollingElement.scrollTop))}; lit pucks ${lit.join(' ')}`, [p1])
    /* a day only part on screen (the third day): its warnings — is the man off the side? */
    await page.evaluate(() => document.scrollingElement.scrollTo(0, 0)); await page.waitForTimeout(300)
    const dayOff = await page.evaluate(() => { const ds = [...document.querySelectorAll('#eWeek .day[data-day]')]; const d = ds.find(d => { const b = d.getBoundingClientRect(); return b.left < innerWidth && b.right > innerWidth }); return d ? d.dataset.day : null })
    if (!dayOff) { rec('s15.off-side', 'NOT WALKED', 'no day stands part off the right edge'); return }
    const bar = page.locator(`#eWeek [data-daywarn="${dayOff}"]`).first()
    if (!(await bar.count())) { rec('s15.off-side', 'NOT WALKED', `day ${dayOff} has no warning list`); return }
    const bb = await bar.boundingBox()
    await page.mouse.click(Math.min(bb.x + 40, (await read(page)).innerWidth - 60), bb.y + bb.height / 2); await page.waitForTimeout(500)
    const items = await page.evaluate(d => [...document.querySelectorAll(`#eWeek .witem[data-wdi="${d}"]`)].map((e, i) => { const b = e.getBoundingClientRect(); return { i, x: b.left, w: b.width, y: b.top, t: e.textContent.trim().replace(/\s+/g, ' ').slice(0, 50) } }), dayOff)
    const results = []
    for (const it of items.slice(0, 5)) {
      const before = await read(page)
      if (before.front?.day !== '0') { await page.evaluate(() => document.scrollingElement.scrollTo(0, 0)); }
      const loc = page.locator(`#eWeek .witem[data-wdi="${dayOff}"]`).nth(it.i)
      const b = await loc.boundingBox(); if (!b) { results.push(`#${it.i} not drawn`); continue }
      if (b.y < 120 || b.y > 820) { await page.mouse.move(700, 500); await page.mouse.wheel(0, b.y - 450); await page.waitForTimeout(400) }
      const b2 = await loc.boundingBox()
      const s1v = await sl(page)
      await page.mouse.click(Math.min(b2.x + 60, before.innerWidth - 60), b2.y + Math.min(14, b2.height / 2)); await page.waitForTimeout(1200); await rest(page)
      const a = await read(page)
      results.push(`#${it.i} "${it.t}": sideways ${f1(s1v)} → ${f1(a.scrollLeft)} (${fr(a)})`)
      if (Math.abs(a.scrollLeft - s1v) > 1) {
        const p = await pic(page, `s15-2-moved-by-warning-${it.i}`)
        rec('s15.off-side', a.front && at20(a) ? 'PASS' : 'FAIL', `day ${dayOff}'s warning #${it.i} "${it.t}" moved the week: ${f1(s1v)} → ${f1(a.scrollLeft)}, ${fr(a)}`, [p])
        break
      }
    }
    rec('s15.off-side-tries', 'RECORDED', `day ${dayOff} (part off the right edge) warnings tried: ${results.join('; ') || 'none'}`)
  } finally { await ctx.close() }
}

/* ===================== S16 — "take me to this change" ===================== */
async function dragFromCrew(page, dayIdx = 0) {
  /* an empty seat of the day, brought into the screen by the wheel, then a man from the open AIRCREW panel dropped on it */
  /* the drop place: an empty seat if the day has one, otherwise a Common Programme row's "+ ADD" (its people box) */
  const find = () => page.evaluate(d => {
    const s = [...document.querySelectorAll(`#eWeek .day[data-day="${d}"] .seat.empty-slot[data-slot], #eWeek .day[data-day="${d}"] .ppl[data-fill] .addz`)].map(e => ({ k: e.dataset.slot || e.closest('[data-fill]').dataset.fill, b: e.getBoundingClientRect(), t: e.textContent.trim() })).filter(o => o.b.width > 0)
    return s.map(o => ({ k: o.k, t: o.t, x: Math.round(o.b.left + o.b.width / 2), y: Math.round(o.b.top + o.b.height / 2) }))
  }, dayIdx)
  let seats = await find()
  if (!seats.length) return { ok: false, why: `no empty seat or "+ ADD" on day ${dayIdx}` }
  let seat = seats[0]
  if (seat.y < 300 || seat.y > 780) { await page.mouse.move(700, 500); await page.mouse.wheel(0, seat.y - 500); await page.waitForTimeout(500); seats = await find(); seat = seats.find(s => s.k === seat.k) }
  /* a man not yet on that day */
  /* a man (not a placeholder) in the panel inside the screen — one not yet on that day if there is one */
  const man = await page.evaluate(d => { const on = new Set([...document.querySelectorAll(`#eWeek .day[data-day="${d}"] [data-person]`)].map(e => e.dataset.person)); const ps = [...document.querySelectorAll('#eRoster .rpuck[data-person]')].filter(p => { const b = p.querySelector('.puck')?.getBoundingClientRect(); return b && b.width && b.top > 250 && b.bottom < innerHeight - 40 && !/^all/.test(p.dataset.person) }); const p = ps.find(p => !on.has(p.dataset.person)) || ps[0]; if (!p) return null; const b = p.querySelector('.puck').getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2), id: p.dataset.person, name: p.textContent.trim().replace(/\s+/g, ' ') } }, dayIdx)
  if (!man) return { ok: false, why: 'no man (not a placeholder) in the AIRCREW panel inside the screen' }
  const count = () => page.evaluate(([d, id]) => document.querySelectorAll(`#eWeek .day[data-day="${d}"] [data-person="${id}"]`).length, [dayIdx, man.id])
  const before = await count()
  await page.mouse.move(man.x, man.y); await page.mouse.down()
  await page.mouse.move(man.x - 20, man.y + 5, { steps: 4 })
  await page.mouse.move(seat.x, seat.y, { steps: 16 }); await page.waitForTimeout(250)
  await page.mouse.up(); await page.waitForTimeout(700)
  const after = await count()
  return { ok: after > before, why: `${man.name} (${man.id}) onto "${seat.t}" (${seat.k}) at ${seat.x},${seat.y}: drawn on the day ${before} → ${after} time(s)`, seat, man, count }
}
/* where each of n next-day presses lands, after a jump (the arrows count from where the last press was heading — pan.ts) */
async function pressesAfter(page, n = 2) { const o = []; for (let i = 0; i < n; i++) { const r = await arrow(page, 'next'); o.push(`${fr(r)} wk ${r.curweek}`) } return o }
async function s16(browser) {
  const { ctx, page } = await freshDesk(browser, 's16')
  try {
    await tab(page, 'Edit Schedule', 'editsched'); await park(page)
    const d = await dragFromCrew(page, 0)
    if (!d.ok) { rec('s16', 'NOT WALKED', `the drag from AIRCREW: ${d.why}`); return }
    await page.evaluate(() => document.scrollingElement.scrollTo(0, 0)); await page.waitForTimeout(300)
    for (let i = 0; i < 4; i++) await arrow(page, 'next')
    const off = await read(page)
    await page.click('#histBtn')
    const win = page.locator('.chgwin:not([hidden])').first(); await win.waitFor({ state: 'visible' })
    await win.locator('.win-tab', { hasText: 'All changes' }).first().click(); await page.waitForTimeout(300)
    const line = win.locator('button.cw-l').first(); const lt = (await line.innerText()).replace(/\s+/g, ' ').slice(0, 70)
    const pw = await pic(page, 's16-1-changes-window')
    await line.click()
    await page.waitForFunction(s => document.querySelector(s).scrollLeft < 100, EDIT, { timeout: 4000 }).catch(() => {})
    await rest(page); await park(page)
    const a = await read(page)
    const p = await pic(page, 's16-2-after-take-me')
    rec('s16', a.front?.day === '0' && at20(a) ? 'PASS' : 'FAIL', `${d.why}; four days on (${fr(off)}); the line "${lt}" pressed: ${fr(a)}`, [pw, p])
    const winOpen = await page.locator('.chgwin:not([hidden])').count()
    if (winOpen) { const x = page.locator('.chgwin:not([hidden]) .win-x').first(); if (await x.count()) await x.click(); else await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
    const after = await pressesAfter(page, 2)
    rec('s16.arrows-after', after[0].startsWith('day 1 at 20') ? 'PASS' : 'FAIL', `changes window open after the jump: ${winOpen}; next-day presses after the jump: ${after.join(' → ')}`)
  } finally { await ctx.close() }
}

/* ===================== S17 — the Scheduler Board opened from a day and closed by Done ===================== */
async function s17(browser) {
  const { ctx, page } = await freshDesk(browser, 's17')
  try {
    await tab(page, 'Edit Schedule', 'editsched'); await fold(page, true); await park(page)
    const r0 = await read(page)
    await page.locator('#eWeek .day[data-day="2"] [data-sbday="2"]').first().click()
    await page.waitForSelector('#schedBoard:not([hidden])', { state: 'visible' }); await page.waitForTimeout(800)
    const sb = await page.evaluate(() => ({ day: window.SBDAY, pad: getComputedStyle(document.querySelector('#schedBoard')).paddingRight, w: document.querySelector('#schedBoard').getBoundingClientRect().width, sw: document.scrollingElement.scrollWidth }))
    const p1 = await pic(page, 's17-1-board-right-edge', { x: r0.innerWidth - 420, y: 0, width: 420, height: 600 })
    await page.click('#sbDone'); await page.waitForTimeout(900); await rest(page); await park(page)
    const a = await read(page)
    const p2 = await pic(page, 's17-2-after-done')
    rec('s17', 'RECORDED', `from ${fr(r0)}, the Wednesday date pressed: board day ${sb.day}, board width ${f1(sb.w)} / ${r0.innerWidth}, page scrollWidth ${sb.sw}; Done: ${fr(a)} (${a.frontDate}) [host expects the board's day at 20±1: ${a.front?.day === String(sb.day) && at20(a) ? 'matches' : 'DIFFERS'}]; next-day presses after: ${(await pressesAfter(page, 2)).join(' → ')}`, [p1, p2])
  } finally { await ctx.close() }
}

/* ===================== S18 — View-only Sched must not change ===================== */
async function s18(browser) {
  const { ctx, page } = await freshDesk(browser, 's18')
  try {
    if (await page.evaluate(() => window.CURPAGE) !== 'viewsched') await tab(page, 'View-only Sched', 'viewsched')
    await rest(page, VIEW); await park(page)
    const r0 = await read(page, VIEW)
    const p1 = await pic(page, 's18-1-view-right-edge', { x: r0.innerWidth - 420, y: 100, width: 420, height: 500 })
    const notes = []; let ok = near(r0.week.right, r0.innerWidth, 0.5) && at20(r0)
    for (let i = 1; i <= 3; i++) { const r = await arrow(page, 'next', VIEW); notes.push(`next→${fr(r)}`); if (!(r.front?.day === String(i) && at20(r))) ok = false }
    for (let i = 2; i >= 0; i--) { const r = await arrow(page, 'prev', VIEW); notes.push(`prev→${fr(r)}`); if (!(r.front?.day === String(i) && at20(r))) ok = false }
    rec('s18', ok ? 'PASS' : 'FAIL', `View-only strip ${f1(r0.week.left)}–${f1(r0.week.right)} / window ${r0.innerWidth}, opened ${fr(r0)}; ${notes.join('; ')}; page scrollWidth ${r0.pageScrollW}`, [p1])
  } finally { await ctx.close() }
}

/* ===================== S19 — the plain-user round ===================== */
async function s19(browser) {
  const { ctx, page } = await freshDesk(browser, 's19')
  const errs0 = errors.length
  const jumps = []
  const track = async (what, expectMove = false) => { const s = await sl(page); jumps.push({ what, s, expectMove }) }
  try {
    await tab(page, 'Edit Schedule', 'editsched'); await park(page)
    await track('opened')
    const d = await dragFromCrew(page, 0)
    rec('s19.1-drag', d.ok ? 'PASS' : 'FAIL', `panel open, a man dragged from AIRCREW: ${d.why}`, [await pic(page, 's19-1-after-drag')])
    await track('after drag')
    /* a remark: an empty typed box of Monday's first rows */
    await page.evaluate(() => document.scrollingElement.scrollTo(0, 0)); await page.waitForTimeout(300)
    const box = await page.evaluate(() => { const e = [...document.querySelectorAll('#eWeek .day[data-day="0"] .ntx.txed')].find(e => { const b = e.getBoundingClientRect(); return b.width > 20 && !e.textContent.trim() && b.top > 250 && b.bottom < innerHeight - 60 }); if (!e) return null; e.setAttribute('data-sre-remark', '1'); const b = e.getBoundingClientRect(); return { x: b.left + 10, y: b.top + b.height / 2, key: e.dataset.txt } })
    if (!box) rec('s19.2-remark', 'NOT WALKED', 'no empty typed box on Monday inside the screen')
    else {
      await page.mouse.click(box.x, box.y); await page.waitForTimeout(250); await page.keyboard.type('WALK A NOTE'); await page.waitForTimeout(200)
      await page.mouse.click(700, 140); await page.waitForTimeout(600)
      const kept = await page.evaluate(k => { const e = document.querySelector(`#eWeek [data-txt="${k}"]`); return e ? e.textContent.trim() : null }, box.key)
      rec('s19.2-remark', kept === 'WALK A NOTE' ? 'PASS' : 'FAIL', `typed into ${box.key}, left by a press elsewhere: it reads "${kept}"`, [await pic(page, 's19-2-remark', { x: 0, y: Math.max(0, box.y - 120), width: 700, height: 240 })])
    }
    await track('after remark')
    await fold(page, true); await park(page); await track('after fold')
    rec('s19.3-fold', 'RECORDED', `folded: ${fr(await read(page))}`, [await pic(page, 's19-3-folded')])
    /* a warning list opened and closed */
    await page.click('#eWeek [data-daywarn="0"]'); await page.waitForTimeout(500)
    const open1 = await page.locator('#eWeek [data-dwbox="0"].open').count()
    const pw = await pic(page, 's19-4-warning-list-open')
    await page.click('#eWeek [data-daywarn="0"]'); await page.waitForTimeout(500)
    const open2 = await page.locator('#eWeek [data-dwbox="0"].open').count()
    rec('s19.4-warnings', open1 === 1 && open2 === 0 ? 'PASS' : 'FAIL', `Monday's warning list opened (${open1}) and closed by its bar again (${open2 ? 'still open' : 'closed'})`, [pw, await pic(page, 's19-5-warning-list-closed')])
    await track('after warnings')
    /* the calendar, closed by its three ways */
    const calShown = () => page.locator('.weekcal-box:visible').count()
    const closes = []
    for (const how of ['x', 'Escape', 'outside']) {
      await page.locator('button.wk-cal:visible').first().click(); await page.waitForTimeout(450)
      const o = await calShown()
      if (how === 'x') await page.click('.weekcal-box button.x')
      else if (how === 'Escape') await page.keyboard.press('Escape')
      let hit = ''
      if (how === 'outside') { hit = await page.evaluate(() => { const e = document.elementFromPoint(1200, 100); return e ? ` (pressed at 1200,100 on ${e.tagName}.${String(e.className).slice(0, 40)})` : '' }); await page.mouse.click(1200, 100) }
      await page.waitForTimeout(450)
      const c = await calShown()
      closes.push(`${how}${hit}: opened ${o}, after ${c ? 'still open' : 'closed'}`)
      if (how === 'outside') await pic(page, 's19-6-calendar-closed-outside')
      if (c) await page.keyboard.press('Escape')
    }
    rec('s19.5-calendar', closes.every(c => c.includes('opened 1') && c.endsWith('closed')) ? 'PASS' : 'FAIL', closes.join('; '), ['s19-6-calendar-closed-outside.png'])
    await track('after calendar')
    /* Undo twice, Redo twice */
    const state = async () => ({ man: d.count ? await d.count() : null, remark: box ? await page.evaluate(r => document.querySelector(`#eWeek [data-txt="${r}"]`)?.textContent.trim() ?? null, box.key) : null })
    const press = async (sel, what) => { try { await page.click(sel, { timeout: 8000 }) } catch (e) { const top = await page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return `${s} disabled=${document.querySelector(s).disabled}; on top at its middle: ${t ? t.tagName + '.' + String(t.className).slice(0, 40) : 'none'}` }, sel); await pic(page, `s19-x-${what}-could-not-press`); throw new Error(`could not press ${what}: ${top}`) } }
    const s0 = await state()
    await press('#undoBtn', 'undo1'); await page.waitForTimeout(600); const u1 = await state(); await track('undo 1')
    await press('#undoBtn', 'undo2'); await page.waitForTimeout(600); const u2 = await state(); await track('undo 2')
    const pu = await pic(page, 's19-7-after-two-undos')
    await press('#redoBtn', 'redo1'); await page.waitForTimeout(600); const r1 = await state(); await track('redo 1')
    await press('#redoBtn', 'redo2'); await page.waitForTimeout(600); const r2 = await state(); await track('redo 2')
    const pr = await pic(page, 's19-8-after-two-redos')
    rec('s19.6-undo-redo', u2.man !== s0.man && u2.remark !== s0.remark && r2.man === s0.man && r2.remark === s0.remark ? 'PASS' : 'FAIL', `the dragged man's count on Monday / the remark: now ${JSON.stringify(s0)}; undo1 ${JSON.stringify(u1)}; undo2 ${JSON.stringify(u2)}; redo1 ${JSON.stringify(r1)}; redo2 ${JSON.stringify(r2)}`, [pu, pr])
    /* View-only Sched: the same day, the same crew? */
    const editName = d.man ? (d.man.name.match(/[A-Z][a-z]+/) || [d.man.name])[0] : null
    await tab(page, 'View-only Sched', 'viewsched'); await park(page)
    const v = await read(page, VIEW)
    const seen = editName ? await page.evaluate(n => [...document.querySelectorAll('#vWeek .day[data-day="0"] *')].filter(e => e.children.length === 0 && e.textContent.trim() === n && e.getBoundingClientRect().width > 0).length, editName) : null
    rec('s19.7-view', 'RECORDED', `View-only Sched: ${fr(v)}; the dragged man "${editName}" drawn on Monday there: ${seen} time(s) (View-only shows the published day, so a working-copy change may rightly not show)`, [await pic(page, 's19-9-view')])
    const unasked = []
    for (let i = 1; i < jumps.length; i++) if (Math.abs(jumps[i].s - jumps[i - 1].s) > 1 && !jumps[i].expectMove) unasked.push(`${jumps[i - 1].what}→${jumps[i].what}: ${f1(jumps[i - 1].s)}→${f1(jumps[i].s)}`)
    const newErrs = errors.slice(errs0)
    rec('s19.round', !unasked.length && !newErrs.length ? 'PASS' : 'FAIL', `the week's sideways scroll at each step: ${jumps.map(j => `${j.what} ${f1(j.s)}`).join(', ')}; moved unasked: ${unasked.join('; ') || 'never'}; errors during the round: ${newErrs.length}`)
  } finally { await page.mouse.up().catch(() => {}); await ctx.close() }
}

/* ===================== P1 — the phone in WebKit ===================== */
async function p1() {
  const browser = await webkit.launch({ headless: true })
  try {
    const ctx = await browser.newContext({ ...devices['iPhone 15 Pro'], viewport: { width: 402, height: 874 } })
    const page = await ctx.newPage(); watch(page, 'p1')
    await signIn(page)
    const readPh = sel => page.evaluate(s => {
      const wk = document.querySelector(s), wb = wk.getBoundingClientRect()
      const ds = [...wk.querySelectorAll('.day[data-day]')].map(d => ({ day: d.dataset.day, left: d.getBoundingClientRect().left })).filter(d => d.left >= wb.left - 2).sort((a, b) => a.left - b.left)
      const tab = document.querySelector('#page-editsched .eroster .ros-tab'); const tr = tab && getComputedStyle(tab).display !== 'none' ? tab.getBoundingClientRect() : null
      const b = document.querySelector('#page-editsched .edit-board')
      return { iw: innerWidth, weekLeft: wb.left, weekRight: wb.right, front: ds[0], tab: tr ? `${tr.left.toFixed(1)}–${tr.right.toFixed(1)} top ${tr.top.toFixed(0)}` : null, lane: b ? getComputedStyle(b).paddingRight : null, sw: document.scrollingElement.scrollWidth, page: window.CURPAGE }
    }, sel)
    /* the page switch a person makes on the phone: the menu */
    const switchTo = async (label, to, n) => {
      let how = 'menu'
      const menuBtn = page.locator('.topbar button:visible').filter({ hasText: /☰|≡|Menu/i }).first()
      const mb2 = page.locator('.topbar [aria-label*="enu" i]:visible').first()
      const mbtn = (await menuBtn.count()) ? menuBtn : ((await mb2.count()) ? mb2 : null)
      if (mbtn) {
        await mbtn.tap(); await pic(page, `p1-${n}a-menu-tap-moment`); await page.waitForTimeout(500)
        const item = page.getByText(label, { exact: true }).locator('visible=true').first()
        if (await item.count()) { await item.tap(); await pic(page, `p1-${n}b-item-tap-moment`) } else { how = 'go() — the menu had no visible "' + label + '"'; await page.evaluate(p => window.go(p), to) }
      } else { how = 'go() — no menu button found in the top bar'; await page.evaluate(p => window.go(p), to) }
      await page.waitForFunction(p => window.CURPAGE === p, to); await rest(page, to === 'editsched' ? EDIT : VIEW); await page.waitForTimeout(400)
      return how
    }
    const seq = [['Edit Schedule', 'editsched', EDIT], ['View-only Sched', 'viewsched', VIEW], ['Edit Schedule', 'editsched', EDIT]]
    let n = 1
    for (const [label, to, sel] of seq) {
      const how = await switchTo(label, to, n)
      const r = await readPh(sel)
      const p = await pic(page, `p1-${n}c-${to}-settled`)
      const ok = r.front?.day === '0' && near(r.front.left, r.weekLeft, 1) && near(r.front.left, 0, 1) && near(r.weekRight, r.iw, 0.5) && (to !== 'editsched' || (r.lane === '0px' && r.tab)) && r.sw <= r.iw
      rec(`p1.${n}-${to}`, ok ? 'PASS' : 'FAIL', `switched by ${how}; front day ${r.front?.day} at ${f1(r.front?.left)} (strip ${f1(r.weekLeft)}–${f1(r.weekRight)} / ${r.iw}); AIRCREW tab ${r.tab}; lane ${r.lane}; page scrollWidth ${r.sw}`, [p])
      n++
    }
    await ctx.close()
  } finally { await browser.close() }
}

/* ===================== P2 — a finger swipe and the AIRCREW drawer, Chromium touch ===================== */
async function p2() {
  const browser = await chromium.launch({ headless: true, ...LO })
  try {
    const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 })
    const page = await ctx.newPage(); watch(page, 'p2')
    await signIn(page)
    await page.evaluate(() => window.go('editsched')); await page.waitForFunction(() => window.CURPAGE === 'editsched'); await rest(page); await page.waitForTimeout(400)
    const cdp = await ctx.newCDPSession(page)
    const finger = async (pts, stepMs = 16, restMs = 60) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pts[0][0], y: pts[0][1], id: 1 }] })
      for (const [x, y] of pts.slice(1)) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id: 1 }] }); await page.waitForTimeout(stepMs) }
      if (restMs) await page.waitForTimeout(restMs)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    }
    const line = (x0, dx, n = 10, y = 430) => Array.from({ length: n + 1 }, (_, i) => [x0 + dx * i / n, y])
    const r0 = await read(page)
    const step = await page.evaluate(() => { const d = document.querySelectorAll('#eWeek .day[data-day]'); return d[1].offsetLeft - d[0].offsetLeft })
    await finger(line(320, -220)); await page.waitForTimeout(900); await rest(page)
    const r1 = await read(page)
    const pA = await pic(page, 'p2-1-after-swipe')
    rec('p2.swipe', 'RECORDED', `[main] one swipe right-to-left: moved ${f1(r1.scrollLeft - r0.scrollLeft)}px (a day is ${step}px), front day ${r1.front?.day} at ${f1(r1.front?.left)} (strip left ${f1(r1.week.left)}; flush: ${near(r1.front?.left, r1.week.left, 1)})`, [pA])
    const tabLoc = page.locator('#page-editsched .eroster .ros-tab')
    await tabLoc.tap(); const pB0 = await pic(page, 'p2-2a-drawer-tap-moment'); await page.waitForTimeout(600)
    const open = await page.evaluate(() => document.body.classList.contains('ros-open'))
    const pB = await pic(page, 'p2-2b-drawer-open')
    await tabLoc.tap(); const pC0 = await pic(page, 'p2-3a-drawer-close-tap-moment'); await page.waitForTimeout(600)
    const closed = await page.evaluate(() => !document.body.classList.contains('ros-open'))
    const r2 = await read(page)
    const pC = await pic(page, 'p2-3b-drawer-closed')
    rec('p2.drawer', 'RECORDED', `[main] AIRCREW tab tapped: open ${open}; tapped again: closed ${closed}; week after: front day ${r2.front?.day} at ${f1(r2.front?.left)}`, [pB0, pB, pC0, pC])
    await ctx.close()
  } finally { await browser.close() }
}

/* ===================== run ===================== */
const t0 = Date.now()
const main = await deskBrowser()
try {
  for (const [id, fn] of [['s1', s1], ['s2', s2], ['s3', s3], ['s4', s4], ['s5', s5], ['s6', s6], ['s7', s7], ['s9', s9], ['s10', s10], ['s11', s11], ['s12', s12], ['s13', s13], ['s14', s14], ['s15', s15], ['s16', s16], ['s17', s17], ['s18', s18], ['s19', s19]]) {
    if (!want(id)) continue
    try { await fn(main) } catch (e) { rec(id, 'ERROR', String(e).split('\n')[0].slice(0, 300)) }
  }
} finally { await main.close() }
if (want('s8') || ONLY.some(o => o.startsWith('s8-'))) { try { await s8() } catch (e) { rec('s8', 'ERROR', String(e).split('\n')[0].slice(0, 300)) } }
if (want('p1')) { try { await p1() } catch (e) { rec('p1', 'ERROR', String(e).split('\n')[0].slice(0, 300)) } }
if (want('p2')) { try { await p2() } catch (e) { rec('p2', 'ERROR', String(e).split('\n')[0].slice(0, 300)) } }
writeFileSync(path.join(SCRATCH, ONLY.length ? `results-${ONLY.join('-')}.json` : 'results.json'), JSON.stringify({ version: VERSION, rows, errors }, null, 1))
console.log('\nERRORS (' + errors.length + '):'); for (const e of errors) console.log('  ' + e)
const c = r => rows.filter(x => x.result === r).length
console.log(`\nDONE ${VERSION}: ${rows.length} rows — PASS ${c('PASS')}, FAIL ${c('FAIL')}, RECORDED ${c('RECORDED')}, NOT WALKED ${c('NOT WALKED')}, ERROR ${c('ERROR')}; ${Math.round((Date.now() - t0) / 1000)}s; pictures ${readdirSync(OUT).filter(f => f.endsWith('.png')).length} in ${path.relative(process.cwd(), OUT)}`)
