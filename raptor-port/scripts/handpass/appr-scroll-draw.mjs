// The Approvals page's scroll — before and after DRAWINGS, 12 Nov 26 ([APPROVALS-SCROLL-INSIDE], his D1986: "can u make the
// approvals scroll similar to the balances as well"). NOTHING IN THE APP CHANGES: the "after" is the real page, built from
// main, with the agent's reading laid over it in the page only (an injected stylesheet and the page's height set as the
// Balances page sets its own — BalancesPage.tsx `screenH`), so every part drawn is the app's own (D1496).
// Run from raptor-port/ against the frozen build served on PORT (default 4261):
//   node scripts/handpass/appr-scroll-draw.mjs            (both sizes)
//   ONLY=desk | ONLY=phone                                (one size)
// Pictures: docs/img/mock/2026-11-12-approvals-scroll/ (raw shots in raw/, the pages he reads at the folder's top).
import { chromium, webkit, devices } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const here = path.dirname(fileURLToPath(import.meta.url))
/* APPR_DRAW_OUT sends the pictures elsewhere — the drawing check's replay (scripts/drawcheck/specs/appr-scroll.mjs) must
   never write over the approved pictures it compares against (walk-scripts.md §10) */
const OUT = process.env.APPR_DRAW_OUT ? path.resolve(process.env.APPR_DRAW_OUT) : path.resolve(here, '../../docs/img/mock/2026-11-12-approvals-scroll')
const RAW = path.join(OUT, 'raw')
mkdirSync(RAW, { recursive: true })
const PORT = process.env.PORT || 4261
const URL = `http://localhost:${PORT}/`
/* the war's today inside the demo's open dates (Jan – Mar 26), so a member may bid (D1211) — the M4 walk's own day */
const LW_TODAY = '2026-01-05'
/* his PC: 1536 wide at 125% — a window 733 tall inside (the Balances fault's own measure, lesson 31); his iPhone 402 × 874.
   Both drawn at 2x so they are sharp; the layout is the same as his, which is set by these sizes in the page's own units */
const DESK = { width: 1536, height: 733 }
const PHONE = { width: 402, height: 874 }
const ONLY = process.env.ONLY || ''
const sleep = ms => new Promise(r => setTimeout(r, ms))
const T = id => `[data-testid="${id}"]`
const log = []
const note = s => { log.push(s); console.log(s) }

/* ---------------------------------------------------------------- the agent's reading, laid over the page only */
/* As the Balances page: the page fills the screen under the tab row (its foot 8px off the screen's on a desktop, at the
   screen's foot on a phone), the window keeps no pad below it, the title, the chips and the column headings stay, and
   only the list scrolls — keeping the wheel to itself — under the card's soft foot (Balances' own fade, .bp-cutf). */
const AFTER_CSS = `
body:has(#page-leavewar .appr-page:not([hidden])) { padding-bottom: 0 !important; }
#page-leavewar .appr-page { display: flex; flex-direction: column; box-sizing: border-box; padding-bottom: 8px; }
#page-leavewar .appr-page.ph { padding-bottom: 0; }
#page-leavewar .appr-page .appr-card { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; position: relative; padding-bottom: 0; }
#page-leavewar .appr-page .appr-card > * { flex: none; }
#page-leavewar .appr-page .appr-card > .appr-list { flex: 1 1 auto; min-height: 0; overflow: auto; overscroll-behavior: contain;
  max-width: none; margin-right: -18px; padding-right: 18px; padding-bottom: 28px; }
#page-leavewar .appr-page.ph .appr-card > .appr-list { margin-right: -12px; padding-right: 12px; }
#page-leavewar .appr-page .appr-list > * { max-width: 1240px; }
#page-leavewar .appr-page .appr-cols { position: sticky; top: 0; z-index: 2; background: var(--panel); }
#page-leavewar .appr-page .appr-card::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 28px;
  background: linear-gradient(rgba(17, 22, 28, 0), var(--panel)); pointer-events: none; z-index: 3; }
`
async function applyAfter(P) {
  await P.evaluate(css => {
    let s = document.getElementById('appr-fit-draw')
    if (!s) { s = document.createElement('style'); s.id = 'appr-fit-draw'; s.textContent = css; document.head.appendChild(s) }
    const el = document.querySelector('[data-testid="approvals-page"]')
    /* the Balances page's own rule: the screen's true height, the page's top read in the page's measure */
    const vv = window.visualViewport, inner = window.innerHeight
    const real = vv ? vv.height * vv.scale : inner
    const H = Math.abs(real - inner) < 1 ? Math.min(inner, Math.floor(real + 0.01)) : inner
    const top = el.getBoundingClientRect().top + (window.scrollY || 0)
    el.style.height = `${Math.max(240, H - Math.max(0, top))}px`
    window.scrollTo(0, 0)
  }, AFTER_CSS)
  await sleep(250)
}
const measure = P => P.evaluate(() => {
  const list = document.querySelector('[data-testid="approvals-page"] .appr-list')
  return {
    docH: document.documentElement.scrollHeight, inner: innerHeight, winScroll: scrollY,
    windowCanScroll: document.documentElement.scrollHeight - innerHeight,
    list: list ? { h: list.clientHeight, sh: list.scrollHeight, top: list.scrollTop } : null,
  }
})

/* ---------------------------------------------------------------- marks: drawn over the page, never part of it */
async function mark(P, boxes) {
  await P.evaluate(boxes => {
    for (const b of boxes) {
      const d = document.createElement('div')
      d.className = 'zz-mark'
      d.style.cssText = `${b.w <= 1 ? 'display:none;' : ''}position:fixed;left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px;border:${b.dash ? '2.5px dashed' : '3px solid'} #ffd400;border-radius:8px;z-index:99999;pointer-events:none;box-sizing:border-box`
      document.body.appendChild(d)
      if (b.label) {
        const t = document.createElement('div')
        t.className = 'zz-mark'
        const at = b.labelAt || 'in-top'
        let pos = at === 'below' ? `left:${b.x}px;top:${b.y + b.h + 4}px` : at === 'above' ? `left:${b.x}px;top:${b.y - 30}px` : at === 'in-bottom' ? `left:${b.x + 8}px;top:${b.y + b.h - 34}px` : `left:${b.x + 8}px;top:${b.y + 6}px`
        /* a label set where it covers nothing the picture is about */
        if (b.lx != null) pos = pos.replace(/left:[^;]+/, `left:${b.lx}px`)
        if (b.ly != null) pos = pos.replace(/top:[^;]+/, `top:${b.ly}px`)
        t.style.cssText = `position:fixed;${pos};max-width:${Math.max(160, b.lw || b.w - 16)}px;background:#ffd400;color:#111;font:700 ${b.fs || 13}px/1.25 -apple-system,'Segoe UI',Arial,sans-serif;padding:4px 8px;border-radius:5px;z-index:100000;pointer-events:none;box-shadow:0 2px 6px rgba(0,0,0,.5)`
        t.textContent = b.label
        document.body.appendChild(t)
      }
    }
  }, boxes)
}
const unmark = P => P.evaluate(() => document.querySelectorAll('.zz-mark').forEach(e => e.remove()))
const rectOf = (P, sel) => P.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }, sel)
async function shot(P, name) { const f = path.join(RAW, name + '.png'); await P.evaluate(() => document.activeElement?.blur?.()); await P.screenshot({ path: f }); return f }

/* ---------------------------------------------------------------- the world: the demo's requests, and some more */
async function signIn(P, who) {
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await P.goto(URL)
  await P.waitForSelector('#luser')
  await P.evaluate(t => window.lwSetMemberToday && window.lwSetMemberToday(t), LW_TODAY)
  await P.fill('#luser', u); await P.fill('#lpass', p)
  await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached' })
  await P.evaluate(t => window.lwSetMemberToday && window.lwSetMemberToday(t), LW_TODAY)
  await P.evaluate(() => window.go('leavewar'))
  await P.waitForSelector('[data-testid^="row-"]', { state: 'attached', timeout: 20000 })
  await sleep(800)
}
async function tap(P, phone, sel) {
  const l = P.locator(sel).first()
  await l.scrollIntoViewIfNeeded()
  if (phone) await l.tap(); else await l.click()
  await sleep(450)
}
async function openApprovals(P, phone) { await tap(P, phone, T('lw-tab-approvals')); await P.waitForSelector(T('approvals-page'), { state: 'visible' }); await sleep(600) }
async function logout(P) { await P.evaluate(() => document.querySelector('#logout')?.click()); await P.waitForSelector('#luser', { timeout: 15000 }) }

/* An admin's visit first (his "since you last looked" mark), then a member files a few bids of his own — those come back
   as new, with their dots — then the admin places a few more on other rows (by him: not new), as a busy bidding week. */
async function stageWorld(P, phone) {
  await signIn(P, 'admin')
  await openApprovals(P, phone)
  await tap(P, phone, T('lw-tab-grid'))
  await logout(P)
  await signIn(P, 'member')
  const mine = await P.evaluate(() => {
    const ids = [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid.slice(4))
    const dates = ['2026-01-07', '2026-02-11', '2026-03-04']
    for (const id of ids) if (window.lwSetCell(id, dates[0], 'LL')) { dates.slice(1).forEach(d => window.lwSetCell(id, d, 'LL')); return id }
    return null
  })
  note(`  member's own row: ${mine}`)
  await sleep(500)
  await logout(P)
  await signIn(P, 'admin')
  const placed = await P.evaluate(() => {
    const ids = [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid.slice(4))
    const pick = ['dice', 'shaft', 'snap', 'pump', 'mamba', 'nact']
    return pick.filter(id => ids.includes(id)).map((id, i) => window.lwSetCell(id, `2026-02-${String(16 + i).padStart(2, '0')}`, i % 2 ? 'CCL' : 'LL'))
  })
  note(`  admin's extra bids placed: ${placed.filter(Boolean).length}`)
  await sleep(500)
  await openApprovals(P, phone)
}

/* ---------------------------------------------------------------- one size, start to end */
async function run(dev) {
  const phone = dev === 'phone'
  const b = phone ? await webkit.launch() : await chromium.launch(launchOptions)
  const ctx = await b.newContext(phone
    ? { ...devices['iPhone 13'], viewport: PHONE, deviceScaleFactor: 2, hasTouch: true, isMobile: true }
    : { viewport: DESK, deviceScaleFactor: 2 })
  const P = await ctx.newPage()
  const errs = []
  P.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  P.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  P.on('response', r => { if (r.status() >= 400) errs.push(`http ${r.status()}: ${r.url().slice(0, 120)}`) })
  note(`== ${dev}`)
  await stageWorld(P, phone)
  const lines = await P.evaluate(() => document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]').length)
  note(`  lines on Approvals: ${lines}; ${await P.locator(T('appr-sub')).innerText()}`)
  const S = phone ? 'phone' : 'desk'
  const SCROLL = phone ? 520 : 330

  /* BEFORE — the app as it is live (main): at the top, then the window scrolled part-way */
  let m = await measure(P); note(`  before, top: ${JSON.stringify(m)}`)
  await shot(P, `${S}-before-top`)
  await P.evaluate(y => window.scrollTo(0, y), SCROLL); await sleep(300)
  m = await measure(P); note(`  before, scrolled: ${JSON.stringify(m)}`)
  /* the app's top bar: whatever stays pinned at the screen's top while the window scrolls */
  const topbarH = await P.evaluate(() => {
    for (let e = document.elementFromPoint(innerWidth / 2, 4); e && e !== document.body; e = e.parentElement) {
      const p = getComputedStyle(e).position
      if (p === 'fixed' || p === 'sticky') return e.getBoundingClientRect().bottom
    }
    return 0
  })
  note(`  pinned top bar's foot: ${topbarH}`)
  await mark(P, [{ x: phone ? 6 : 24, y: topbarH + 6, w: phone ? 390 : 1488, h: 46, dash: true, label: phone
    ? `The whole page has moved up ${m.winScroll}px: the tabs, the title, the chips and the column headings are out of sight`
    : `The whole window has moved up ${m.winScroll}px: the tabs, the title, the date chips and the column headings are out of sight`, fs: phone ? 12 : 14, lw: phone ? 374 : 900 }])
  await shot(P, `${S}-before-scrolled`)
  await unmark(P)
  await P.evaluate(() => window.scrollTo(0, 0)); await sleep(200)
  /* today's short list (the March chip), for the short-list question — then back to All before anything is decided */
  await tap(P, phone, T('appr-m-2026-03'))
  const c0 = await rectOf(P, '[data-testid="approvals-page"] .appr-card')
  await mark(P, [{ x: c0.x - 3, y: c0.y + c0.h + 3, w: c0.w + 6, h: 12, dash: true, label: 'Today the card ends under the last request', labelAt: 'below', fs: phone ? 12 : 14, lw: 360 }])
  await shot(P, `${S}-before-short`)
  await unmark(P)
  await tap(P, phone, T('appr-all'))
  await P.evaluate(() => window.scrollTo(0, 0)); await sleep(200)

  /* AFTER — the agent's reading laid over the same page */
  await applyAfter(P)
  m = await measure(P); note(`  after, top: ${JSON.stringify(m)}`)
  const head = await rectOf(P, '[data-testid="approvals-page"] .appr-head')
  const cols = await rectOf(P, '[data-testid="approvals-page"] .appr-cols')
  const list = await rectOf(P, '[data-testid="approvals-page"] .appr-list')
  const card = await rectOf(P, '[data-testid="approvals-page"] .appr-card')
  const stay = { x: card.x + 4, y: head.y - 6, w: card.w - 8, h: cols.y + cols.h - head.y + 8 }
  const scroller = { x: card.x + 4, y: cols.y + cols.h + 3, w: card.w - 8, h: list.y + list.h - (cols.y + cols.h) - 6 }
  /* where a label covers nothing: on a desktop the title line's right, on a phone the chip row's right after "Mar" */
  const mar = await rectOf(P, T('appr-m-2026-03'))
  const stayAt = phone ? { lx: mar.x + mar.w + 8, ly: mar.y + 2, lw: 120 } : { lx: card.x + 700, ly: head.y + 2, lw: 520 }
  await mark(P, [
    { ...stay, label: phone ? 'Stays in place' : 'Stays in place: the title, the chips and the column headings', fs: phone ? 12 : 14, ...stayAt },
    { ...scroller, label: 'Only this list scrolls, inside the page', labelAt: 'in-bottom', fs: phone ? 12 : 14, lw: phone ? 300 : 420 },
  ])
  await shot(P, `${S}-after-top`)
  await unmark(P)
  await P.evaluate(y => { document.querySelector('[data-testid="approvals-page"] .appr-list').scrollTop = y }, phone ? 300 : 230); await sleep(300)
  m = await measure(P); note(`  after, list scrolled: ${JSON.stringify(m)}`)
  await mark(P, [
    { ...stay, label: phone ? 'Still in view' : 'Still in view: the title, the chips and the column headings', fs: phone ? 12 : 14, ...stayAt },
    { ...scroller, label: `The list scrolled ${m.list.top}px inside the page — the window behind it did not move`, labelAt: 'in-bottom', fs: phone ? 12 : 14, lw: phone ? 330 : 560 },
  ])
  await shot(P, `${S}-after-scrolled`)
  await unmark(P)

  /* "Back to Approvals", a lit line and the dots kept (D1421, D1506): a new request's line approved (lit), its dates
     tapped — the grid with the slim bar — then Back */
  const target = await P.evaluate(() => {
    const ls = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]
    const box = document.querySelector('[data-testid="approvals-page"] .appr-list').getBoundingClientRect()
    /* wholly in view: below the pinned column headings, above the list's foot */
    const under = document.querySelector('[data-testid="approvals-page"] .appr-cols').getBoundingClientRect().bottom
    const inView = ls.filter(l => { const r = l.getBoundingClientRect(); return r.top > under + 60 && r.bottom < box.bottom - 60 })
    const plain = inView.find(l => !l.querySelector('.appr-dot:not(.none)')) || inView[0]
    /* a line's test id names its PERSON, and one person may have several lines: the one picked is marked for this drawing */
    if (plain) plain.setAttribute('data-zz-target', '1')
    return plain ? plain.dataset.testid : null
  })
  note(`  line to approve: ${target}`)
  if (target) {
    const btn = '[data-zz-target] [data-testid="appr-approve"]'
    note(`  list place before Approve: ${await P.evaluate(() => document.querySelector('[data-testid="approvals-page"] .appr-list').scrollTop)}`)
    /* on the phone the button's own press, where it already stands — the test browser's tap first slides the thing it taps
       into view, and in WebKit that slid the inner list back to its top (seen 12 Nov 26: 300 → 0); its bare touch at a
       point raised no press in headless WebKit. A drawing aid only: how a real finger keeps the place is the build's walk */
    const pressIt = sel => P.evaluate(sel => document.querySelector(sel).click(), sel)
    /* on a desktop the mouse at the button's own point (the test browser's click slides it into view first — seen: 230 → 0) */
    const mouseAt = async sel => {
      const r = await rectOf(P, sel)
      const x = r.x + Math.min(r.w / 2, 30), y = r.y + r.h / 2
      note(`  pressing ${sel.split('"').slice(-2, -1)[0]} at ${Math.round(x)},${Math.round(y)} — under the pointer: ${await P.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className + ' ' + (e.textContent || '').slice(0, 30) : 'nothing' }, [x, y])}`)
      await P.mouse.click(x, y)
    }
    if (phone) await pressIt(btn); else await mouseAt(btn)
    await sleep(600)
    const keepTop = await P.evaluate(() => document.querySelector('[data-testid="approvals-page"] .appr-list').scrollTop)
    note(`  list place before the dates tap: ${keepTop}`)
    const dl = '[data-zz-target] [data-testid="appr-dates"]'
    if (phone) await pressIt(dl); else await mouseAt(dl)
    await sleep(1200)
    const slim = await rectOf(P, T('appr-slim'))
    if (slim) await mark(P, [{ x: slim.x - 6, y: slim.y - 6, w: slim.w + 12, h: slim.h + 12, label: '"Back to Approvals" bar — as today', labelAt: 'above', fs: phone ? 12 : 14, lw: 320 }])
    await shot(P, `${S}-after-grid-slimbar`)
    await unmark(P)
    await P.locator(T('appr-back')).first().click(); await sleep(900)
    const lost = await P.evaluate(() => document.querySelector('[data-testid="approvals-page"] .appr-list').scrollTop)
    note(`  list place after Back, as the page now is: ${lost}`)
    /* THE PLACE IN THE LIST: a list hidden while the grid is up may come back at its top; the build must keep his place
       (D1506) — the drawing shows the kept place, and the coordinator is told what the page did by itself */
    if (lost !== keepTop) await P.evaluate(y => { document.querySelector('[data-testid="approvals-page"] .appr-list').scrollTop = y }, keepTop)
    await sleep(300)
    const lit = await rectOf(P, '[data-zz-target]')
    note(`  the picked line after Back: ${await P.evaluate(() => { const e = document.querySelector('[data-zz-target]'); return e ? e.className + ' · ' + e.innerText.replace(/\s+/g, ' ').slice(0, 60) : 'gone' })}`)
    const dots = await P.evaluate(() => [...document.querySelectorAll('[data-testid="approvals-page"] .appr-list .appr-dot:not(.none)')].filter(d => getComputedStyle(d).display !== 'none').map(d => { const r = d.getBoundingClientRect(); return { x: r.left, y: r.top } }))
    const newChip = await rectOf(P, T('appr-new'))
    const listBox = await rectOf(P, '[data-testid="approvals-page"] .appr-list')
    const visDots = dots.filter(d => d.y > listBox.y + 30 && d.y < listBox.y + listBox.h - 10)
    note(`  dots in view after Back: ${visDots.length}`)
    const ms = []
    if (lit) ms.push({ x: lit.x - 4, y: lit.y - 3, w: lit.w + 8, h: lit.h + 6, label: 'Approved line still lit, in the same place in the list', labelAt: 'below', fs: phone ? 12 : 13, lw: phone ? 300 : 420, ...(phone ? { lx: lit.x + 6, ly: lit.y + lit.h / 2 + 2, lw: 250 } : { lx: lit.x + 500, ly: lit.y + lit.h / 2 - 12 }) })
    for (const d of visDots.slice(0, 3)) ms.push({ x: d.x - 7, y: d.y - 7, w: 22, h: 22 })
    if (visDots.length) ms.push({ x: visDots[0].x + 18, y: visDots[0].y - 12, w: 1, h: 1, label: 'New dots kept (at the left)', labelAt: 'in-top', fs: 12, lw: 190, lx: listBox.x + 830, ly: visDots[0].y - 8 })
    if (phone && newChip) ms.push({ x: newChip.x - 4, y: newChip.y - 4, w: newChip.w + 8, h: newChip.h + 8, label: 'New count kept', labelAt: 'below', fs: 12, lw: 140 })
    await mark(P, ms)
    await shot(P, `${S}-after-back`)
    await unmark(P)
  }

  /* a short list that does not fill the screen: the March chip (changing the dates ends the lit lines — D1421 — so last) */
  await tap(P, phone, T('appr-mar').replace('appr-mar', 'appr-m-2026-03'))
  const shortN = await P.evaluate(() => document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]').length)
  m = await measure(P); note(`  after, short list (${shortN} lines): ${JSON.stringify(m)}`)
  const c2 = await rectOf(P, '[data-testid="approvals-page"] .appr-card')
  /* the empty room: from under the last request to the card's foot */
  const lastFoot = await P.evaluate(() => Math.max(...[...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')].map(l => l.getBoundingClientRect().bottom)))
  await mark(P, [{ x: c2.x + 4, y: lastFoot + 6, w: c2.w - 8, h: c2.y + c2.h - lastFoot - 12, dash: true,
    label: 'A short list: the card still reaches the foot of the screen, empty below the last request — as the Balances page does; nothing scrolls', labelAt: 'in-top', fs: phone ? 12 : 14, lw: phone ? 340 : 760 }])
  await shot(P, `${S}-after-short`)
  await unmark(P)

  note(`  errors: ${errs.length ? errs.join(' | ') : 'none'}`)
  /* WebKit on this PC once hung on close after its pictures were written: a closed browser is not worth waiting for */
  await Promise.race([b.close(), sleep(8000)])
  note(`  ${dev} browser closed`)
}

/* ---------------------------------------------------------------- the pages he reads: a heading strip over each picture */
async function compose(file, { title, sub, items, stack = false }) {
  const b = await chromium.launch(launchOptions)
  const ctx = await b.newContext({ viewport: { width: 400, height: 300 }, deviceScaleFactor: 2 })
  const P = await ctx.newPage()
  const imgs = items.map(it => {
    const data = readFileSync(path.join(RAW, it.src + '.png')).toString('base64')
    return `<figure><figcaption><span class="${it.draw ? 'dr' : 'td'}">${it.draw ? 'DRAWING — not built' : 'TODAY — the live app'}</span><b>${it.tag}</b>${it.cap ? ' — ' + it.cap : ''}</figcaption><img src="data:image/png;base64,${data}" style="width:${it.w}px"></figure>`
  }).join('')
  await P.setContent(`<!doctype html><html><head><style>
    body{margin:0;background:#0b0f14;color:#e7ecf1;font:15px/1.4 -apple-system,'Segoe UI',Arial,sans-serif;padding:18px;display:inline-block}
    h1{font-size:20px;margin:0 0 4px} p.sub{margin:0 0 14px;color:#b4bfca;max-width:1200px}
    .row{display:flex;gap:20px;align-items:flex-start;${stack ? 'flex-direction:column' : ''}}
    figure{margin:0} figcaption{margin:0 0 8px;color:#d5dde5;max-width:${stack ? 1500 : 420}px}
    figcaption b{color:#ffd400} .dr,.td{display:inline-block;font-weight:800;font-size:12px;letter-spacing:.06em;padding:2px 7px;border-radius:4px;margin-right:8px}
    .dr{background:#ffd400;color:#111} .td{background:#2b3540;color:#d5dde5}
    img{display:block;border:1px solid #2a333d;border-radius:6px}
  </style></head><body><h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}<div class="row">${imgs}</div></body></html>`)
  await P.waitForTimeout(300)
  await (await P.$('body')).screenshot({ path: path.join(OUT, file) })
  await b.close()
  note('wrote ' + file)
}

if (ONLY !== 'phone') await run('desk')
if (ONLY !== 'desk') await run('phone')

const DW = 1536, PW = 402
if (ONLY !== 'phone') {
  await compose('1-desktop-scrolled-before-after.png', { stack: true,
    title: 'Approvals on your PC, scrolled part-way — today, and the drawing',
    sub: 'Today the whole window moves and the title, the date chips and the column headings go out of sight. In the drawing only the list moves, inside the page, as on the Balances page.',
    items: [{ src: 'desk-before-scrolled', tag: 'Today', cap: 'the window scrolled', w: DW }, { src: 'desk-after-scrolled', draw: true, tag: 'After', cap: 'the list scrolled inside the page', w: DW }] })
  await compose('2-desktop-top-before-after.png', { stack: true,
    title: 'Approvals on your PC, at the top — today, and the drawing',
    sub: 'At the top the two look the same: the drawing only adds that the card ends at the foot of the screen with a soft fade, as the Balances card does, and the list scrolls inside it.',
    items: [{ src: 'desk-before-top', tag: 'Today', cap: 'the page as tall as its list', w: DW }, { src: 'desk-after-top', draw: true, tag: 'After', cap: 'the page fits the screen', w: DW }] })
  await compose('3-desktop-back-to-approvals.png', { stack: true,
    title: 'Approvals on your PC — "Back to Approvals", the lit line and the dots after the change',
    sub: 'A request approved, its dates tapped (the grid with the "Back to Approvals" bar, unchanged), then Back: the list comes back at the place you left, the approved line still lit, the new dots still there.',
    items: [{ src: 'desk-after-grid-slimbar', draw: true, tag: 'The grid', cap: 'after tapping the approved request\'s dates', w: DW }, { src: 'desk-after-back', draw: true, tag: 'Back', cap: 'the same place in the list', w: DW }] })
  await compose('4-desktop-short-list.png', { stack: true,
    title: 'Approvals on your PC — a short list (the March chip picked)',
    sub: 'Today the card ends under the last request. In the drawing nothing scrolls and the card still reaches the foot of the screen, as the Balances card does, so its edge stays put when you pick a month.',
    items: [{ src: 'desk-before-short', tag: 'Today', cap: 'a short list', w: DW }, { src: 'desk-after-short', draw: true, tag: 'After', cap: 'a short list', w: DW }] })
}
if (ONLY !== 'desk') {
  await compose('5-phone-choice-A-or-B.png', {
    title: 'Approvals on your iPhone — your choice: A (as your PC) or B (as today)',
    sub: 'A: the title, the chips and the column headings stay and only the list scrolls, as the Balances page does on the phone. B: the whole page scrolls, as today. Each shown at the top and scrolled part-way.',
    items: [
      { src: 'phone-after-top', draw: true, tag: 'A, at the top', cap: '', w: PW },
      { src: 'phone-after-scrolled', draw: true, tag: 'A, scrolled', cap: '', w: PW },
      { src: 'phone-before-top', tag: 'B, at the top', cap: '', w: PW },
      { src: 'phone-before-scrolled', tag: 'B, scrolled', cap: '', w: PW },
    ] })
  await compose('6-phone-A-back-and-short.png', {
    title: 'Approvals on your iPhone, A — "Back to Approvals", the lit line, and a short list',
    sub: 'A request approved, its dates tapped (the grid with the "Back to Approvals" bar, unchanged), then Back: the list at the place you left, the approved line still lit. Then a short list (the March chip): today the card ends under the last request; in A nothing scrolls and the card reaches the foot of the screen.',
    items: [
      { src: 'phone-after-grid-slimbar', draw: true, tag: 'The grid', cap: 'after tapping the dates', w: PW },
      { src: 'phone-after-back', draw: true, tag: 'Back', cap: 'the same place', w: PW },
      { src: 'phone-before-short', tag: 'A short list', cap: 'today', w: PW },
      { src: 'phone-after-short', draw: true, tag: 'A short list', cap: 'in A', w: PW },
    ] })
}
writeFileSync(path.join(RAW, `log-${ONLY || 'all'}.txt`), log.join('\n') + '\n')
