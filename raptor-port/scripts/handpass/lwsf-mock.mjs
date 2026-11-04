// THE LEAVE WAR SMALL FIXES — the mock-ups drawn on the real app before anything is built (owner D1625, 4 Nov 26).
// Two new things he will see: (1) the number pad's top line shows the figure as it is typed (D1584, [LW-PAD-SHOWS-FIGURE]);
// (2) a failed download of the Leave War or the Tracker says so with a Retry, and a slow one says "Still loading…"
// ([LAZY-PAGE-LOAD-FAIL]). The "today" pictures of (2) are the REAL failure: the page's own download is refused in the
// test browser, nothing drawn in. Every proposal is drawn into the live page by cloning or adding nodes, named below,
// with the looks it copies read from the app itself (the Tracker's "No course yet" card, the pad's own cell box).
// Run from raptor-port/: node scripts/handpass/lwsf-mock.mjs   (a built app served on LOOK_URL, default :4173)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.env.LWSF_OUT || join(HERE, '../../docs/img/handpass/2026-11-04-lw-small-fixes-mock')
const URL = process.env.LOOK_URL || 'http://localhost:4173/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
mkdirSync(OUT, { recursive: true })
const SIZES = {
  desktop: { viewport: { width: 1440, height: 900 } },
  phone: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true },
  side: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true },
}
const sleep = ms => new Promise(r => setTimeout(r, ms))
const log = []
const say = l => { log.push(l); console.log(l) }
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

async function session(size, { block } = {}) {
  const ctx = await browser.newContext({ ...SIZES[size], deviceScaleFactor: 2 })
  if (block) await ctx.route(block, r => r.abort('internetdisconnected'))
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(e.message))
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await sleep(400)
  return { ctx, page, errs, touch: !!SIZES[size].hasTouch }
}
const go = async (page, p) => { await page.evaluate(p => window.go(p), p); await sleep(500) }
const shot = async (page, name) => { await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' }); await page.screenshot({ path: join(OUT, name + '.png') }); say('picture ' + name) }
const tap = async (w, sel) => { const l = w.page.locator(sel).first(); await (w.touch ? l.tap() : l.click()); await sleep(w.touch ? 650 : 250) }

/* ===================== 1. THE NUMBER PAD'S TOP LINE ===================== */
async function openPad(size) {
  const w = await session(size)
  await go(w.page, 'leavewar')
  await w.page.locator('[data-testid="row-slipway"]').waitFor({ timeout: 15000 }); await sleep(500)
  await w.page.evaluate(() => window.scrollTo(0, 0)); await sleep(200)
  if (await w.page.locator('[data-testid="month-FEB"]').count()) await tap(w, '[data-testid="month-FEB"]')
  /* an upright phone opens with the Manning block folded: its "▸ Manning" opens it, the Required rows with it */
  if (!(await w.page.locator('[data-testid^="req-p-"]').count()) && await w.page.locator('[data-testid="counts-toggle"]').count()) await tap(w, '[data-testid="counts-toggle"]')
  let iso = '2026-02-25'
  /* a phone draws only the months in its window: where 25 Feb is not drawn, the first Required cell that is */
  if (!(await w.page.locator(`[data-testid="req-p-${iso}"]`).count())) iso = await w.page.evaluate(() => document.querySelector('[data-testid^="req-p-2026-02"], [data-testid^="req-p-"]').getAttribute('data-testid').slice(6))
  w.iso = iso
  await w.page.evaluate(iso => document.querySelector(`[data-testid="req-p-${iso}"]`).scrollIntoView({ block: 'center', inline: 'center' }), iso); await sleep(350)
  await tap(w, `[data-testid="req-p-${iso}"]`)
  if (!(await w.page.locator('[data-testid="fly-pad"]').count())) throw new Error(size + ': no number pad opened')
  await tap(w, '[data-testid="fly-pad-7"]')
  /* tap a neutral spot inside the pad's head (its day) so no key keeps the pressed look in the picture */
  await w.page.locator('.flypad-day').first().dispatchEvent('pointerdown').catch(() => {})
  return w
}
/* the proposal, drawn into the pad's own head: the figure after the day. A: words, as his ruling writes them
   ("Req P · Wed 25 Feb · 7"); B: the figure in a copy of the cell's own editing box. Nothing else in the pad moves:
   the day sits in the head's stretching middle column, so ‹ › Done keep their place. */
async function drawFigure(page, opt, fig) {
  return page.evaluate(([opt, fig]) => {
    document.querySelectorAll('.lwsf-new').forEach(e => e.remove())
    const day = document.querySelector('.flypad-hd .flypad-day')
    const cellBox = document.querySelector('[data-testid="fly-edit-touch"]')
    const cs = getComputedStyle(cellBox)
    const add = document.createElement('span')
    add.className = 'lwsf-new'
    if (opt === 'A') {
      add.innerHTML = `<span style="color:var(--ink-3);font-weight:700;margin:0 6px">·</span><span class="lwsf-fig" style="display:inline-block;min-width:3ch;color:#fff;font-weight:800;font-size:18px;font-variant-numeric:tabular-nums">${fig || '<span style="color:var(--ink-3)">–</span>'}</span>`
    } else {
      add.innerHTML = `<span class="lwsf-fig" style="display:inline-grid;place-items:center;min-width:44px;height:30px;margin-left:10px;box-sizing:border-box;border:${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor};border-radius:${cs.borderTopLeftRadius};background:${cs.backgroundColor};color:${cs.color};font-weight:800;font-size:18px;font-variant-numeric:tabular-nums;vertical-align:middle">${fig}</span>`
    }
    day.appendChild(add)
    /* the day keeps its own line: the box is centred on it, not stood on its baseline */
    day.style.display = 'inline-flex'; day.style.alignItems = 'center'
    /* the mark that shows him the place — an outline on the added part itself, no room taken */
    add.style.outline = '2px dashed #ff3b6b'; add.style.outlineOffset = '3px'
    const r = document.querySelector('.flypad-hd').getBoundingClientRect(), n = document.querySelector('.flypad-nav').getBoundingClientRect()
    return { head: [Math.round(r.width), Math.round(r.height)], navLeft: Math.round(n.left), cellBox: { border: cs.borderTopWidth + ' ' + cs.borderTopColor, radius: cs.borderTopLeftRadius, bg: cs.backgroundColor, color: cs.color } }
  }, [opt, fig])
}
async function padSet(size, tag) {
  const w = await openPad(size)
  const before = await w.page.evaluate(() => { const r = document.querySelector('.flypad-hd').getBoundingClientRect(), n = document.querySelector('.flypad-nav').getBoundingClientRect(); return { head: [Math.round(r.width), Math.round(r.height)], navLeft: Math.round(n.left) } })
  const cell = await w.page.evaluate(iso => { const c = document.querySelector(`[data-testid="req-p-${iso}"]`).getBoundingClientRect(), p = document.querySelector('[data-testid="fly-pad"]').getBoundingClientRect(); return { iso, cellTop: Math.round(c.top), cellBottom: Math.round(c.bottom), padTop: Math.round(p.top), coveredByPad: c.bottom > p.top + 1 } }, w.iso)
  say(`${tag} today: pad head ${JSON.stringify(before)}; the Required cell ${JSON.stringify(cell)}`)
  await shot(w.page, `p1-${tag}-today`)
  const a = await drawFigure(w.page, 'A', '7'); say(`${tag} A: ${JSON.stringify(a)}`)
  await shot(w.page, `p1-${tag}-A`)
  const b = await drawFigure(w.page, 'B', '7'); say(`${tag} B: ${JSON.stringify(b)}`)
  await shot(w.page, `p1-${tag}-B`)
  if (tag === 'side') {
    /* ⌫ pressed: nothing typed yet — the line keeps its place */
    const e = await drawFigure(w.page, 'A', ''); say(`${tag} A empty: ${JSON.stringify(e)}`)
    await shot(w.page, `p1-${tag}-A-empty`)
    /* a three-figure number, the widest the pad takes */
    await drawFigure(w.page, 'A', '120'); await shot(w.page, `p1-${tag}-A-wide`)
  }
  await w.ctx.close()
}
await padSet('side', 'side')
await padSet('phone', 'phone')

/* ===================== 2. A FAILED DOWNLOAD — TODAY, FOR REAL ===================== */
/* phone: no pre-warm, so the download starts at the tap */
{
  const w = await session('phone', { block: '**/assets/LeaveWarPage-*.js' })
  await shot(w.page, 'p2-phone-before-tap')
  await w.page.evaluate(() => window.go('leavewar')); await sleep(1200)
  await shot(w.page, 'p2-phone-today-failed-1s')
  await sleep(4000)
  const st = await w.page.evaluate(() => ({ rootKids: document.getElementById('root')?.children.length ?? null, topbar: !!document.querySelector('.topbar'), claw: !!document.querySelector('.pgclaw'), body: document.body.innerText.trim().slice(0, 120) }))
  say('phone, the Leave War refused at the tap, after 5 s: ' + JSON.stringify(st) + ' page errors: ' + JSON.stringify(w.errs.slice(0, 3)))
  await shot(w.page, 'p2-phone-today-failed-5s')
  await w.ctx.close()
}
/* desktop: the war is fetched by itself after 2 s of no input (Shell.tsx PRE-WARM) — he need not touch the tab */
{
  const w = await session('desktop', { block: '**/assets/LeaveWarPage-*.js' })
  await shot(w.page, 'p2-desk-signed-in')
  await sleep(6000)
  const st = await w.page.evaluate(() => ({ rootKids: document.getElementById('root')?.children.length ?? null, topbar: !!document.querySelector('.topbar'), week: !!document.querySelector('#vWeek .day'), body: document.body.innerText.trim().slice(0, 120) }))
  say('desktop, the Leave War refused, 6 s after sign-in with no tap: ' + JSON.stringify(st) + ' page errors: ' + JSON.stringify(w.errs.slice(0, 3)))
  await shot(w.page, 'p2-desk-today-6s-no-tap')
  await w.ctx.close()
}
/* the Tracker, refused at its tap (phone) */
{
  const w = await session('phone', { block: '**/assets/TrackerPage-*.js' })
  await w.page.evaluate(() => window.go('tracker')); await sleep(5000)
  const st = await w.page.evaluate(() => ({ rootKids: document.getElementById('root')?.children.length ?? null, topbar: !!document.querySelector('.topbar'), body: document.body.innerText.trim().slice(0, 120) }))
  say('phone, the Tracker refused at the tap, after 5 s: ' + JSON.stringify(st))
  await shot(w.page, 'p2-phone-tracker-today-failed-5s')
  await w.ctx.close()
}

/* ===================== 2. THE PROPOSAL, DRAWN ===================== */
/* The card copies the app's one page-sized message, the Tracker's "No course yet" card (tracker.css .nocourse): its
   size, edge, fill, heading, line and main button are READ from a real one put on the Tracker page, then reproduced. */
async function readCardLook(w) {
  await go(w.page, 'tracker'); await sleep(1500)
  return w.page.evaluate(() => {
    const root = document.querySelector('#page-tracker .tr-root')
    const d = document.createElement('div'); d.className = 'nocourse'
    d.innerHTML = '<h2>x</h2><p>x</p><div class="nocourse-acts"><button class="primary">x</button></div>'
    root.appendChild(d)
    const pick = (e, ks) => { const s = getComputedStyle(e); return Object.fromEntries(ks.map(k => [k, s.getPropertyValue(k)])) }
    const box = ['width', 'max-width', 'padding', 'border-top', 'border-radius', 'background-color', 'color', 'text-align', 'margin-top']
    const txt = ['font-size', 'font-weight', 'color', 'margin', 'line-height']
    const btn = ['font-size', 'font-weight', 'color', 'background-color', 'border-top', 'border-radius', 'padding', 'height', 'min-height']
    const out = { card: pick(d, box), h2: pick(d.querySelector('h2'), txt), p: pick(d.querySelector('p'), txt), btn: pick(d.querySelector('button'), btn), acts: pick(d.querySelector('.nocourse-acts'), ['display', 'gap', 'justify-content']) }
    d.remove()
    return out
  })
}
async function drawFailed(w, look, what, opts = {}) {
  return w.page.evaluate(([look, what, opts]) => {
    document.querySelectorAll('.lwsf-new').forEach(e => e.remove())
    const top = document.querySelector('.topbar').getBoundingClientRect().bottom
    const layer = document.createElement('div')
    layer.className = 'lwsf-new'
    layer.style.cssText = `position:fixed;left:0;right:0;bottom:0;top:${top}px;z-index:50;background:#0B0D10;display:grid;place-items:start center`
    const c = look.card, h = look.h2, p = look.p, b = look.btn
    layer.innerHTML = `<div role="alert" style="box-sizing:border-box;width:calc(100% - 32px);max-width:${c['max-width']};margin-top:${c['margin-top']};padding:${c.padding};border-top:${c['border-top']};border:${c['border-top']};border-radius:${c['border-radius']};background:${c['background-color']};color:${c.color};text-align:center;outline:2px dashed #ff3b6b;outline-offset:4px">
      <h2 style="margin:${h.margin};font-size:${h['font-size']};font-weight:${h['font-weight']};color:${h.color}">Couldn't open ${what}</h2>
      <p style="margin:${p.margin};font-size:${p['font-size']};line-height:${p['line-height']};color:${p.color}">It didn't download. Check your signal, then retry.</p>
      <div style="display:flex;gap:${look.acts.gap};justify-content:center"><button type="button" style="font:inherit;font-size:${b['font-size']};font-weight:${b['font-weight']};color:${b.color};background:${b['background-color']};border:${b['border-top']};border-radius:${b['border-radius']};padding:${b.padding};min-height:${b['min-height']}">Retry</button></div></div>`
    document.body.appendChild(layer)
    return true
  }, [look, what, opts])
}
async function drawStill(w) {
  /* the real claw, raised the way the app raises it (ui/pageclaw.ts markup, index.html styles), with one grey line
     under it — the claw's own block, so the line sits under the mark whatever the screen's size */
  return w.page.evaluate(() => {
    document.querySelectorAll('.lwsf-new').forEach(e => e.remove())
    const P = ['M3 8 Q4.9 38.3 24 62 Q11.5 35.8 3 8 Z', 'M16 0 Q17.4 35.0 42 60 Q26.6 31.0 16 0 Z', 'M31 -2 Q36.4 23.5 58 38 Q42.9 19.1 31 -2 Z']
    const el = document.createElement('div'); el.className = 'pgclaw lwsf-new'
    el.innerHTML = '<div style="display:grid;justify-items:center;gap:18px"><div class="mk"><div class="cs">' + P.map((d, i) => `<div class="w pw${i}"><svg viewBox="0 -2 60 64"><path class="c" d="${d}"/></svg></div>`).join('') + '</div></div><div class="lwsf-still" style="font-size:13px;color:#8B95A3;outline:2px dashed #ff3b6b;outline-offset:4px">Still loading…</div></div>'
    document.body.appendChild(el)
    /* the claw's round paused part-way through its second claw, so the picture shows the mark as he sees it mid-round */
    el.querySelectorAll('*').forEach(e => { e.style.animationPlayState = 'paused'; e.style.animationDelay = '-1.2s' })
    return true
  })
}
for (const size of ['phone', 'desktop']) {
  const w = await session(size)
  const look = await readCardLook(w)
  say(`${size} the "No course yet" card's look, read: ${JSON.stringify(look)}`)
  await go(w.page, 'leavewar'); await sleep(1200)
  await drawFailed(w, look, 'the Leave War'); await shot(w.page, `p2-${size}-proposal-failed`)
  await drawStill(w); await shot(w.page, `p2-${size}-proposal-still-loading`)
  if (size === 'phone') { await drawFailed(w, look, 'the Tracker'); await shot(w.page, `p2-${size}-proposal-failed-tracker`) }
  await w.ctx.close()
}

writeFileSync(join(OUT, 'measures.txt'), log.join('\n') + '\n')
await browser.close()
