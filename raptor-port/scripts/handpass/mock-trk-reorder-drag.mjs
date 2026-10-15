/* MOCK-UP of [TRK-REORDER-FINGER-DRAG] (D922, 15 Oct 26) on the REAL app — the Tracker's ⇅ Reorder syllabi window, at his
   phone's size (390 x 844 at 3x) and a desktop's (1280 x 800 at 1x). Today's frames are the app as it is (the desktop's
   mid-drag frame wears the app's OWN `.drag` / `.over` classes, set by hand because a browser drag cannot be paused for a
   picture). The proposal's frames take the look of the app's other dragged lists, copied, not invented — the Leave War's
   ⚙ lists (bidpicker.css `.set-grow.dragging` / `.dragover`): the carried row wears the shared lift ring (`--lift-box`,
   2px blue), and ONE landing line, 2px blue, lies on the top edge of the row it will land before (§5a, D890, D891).
   What is DRAWN IN, each listed on the page: the dotted grip ⠿ in the ☰'s place, the finger's circle, the lift ring and
   the landing line. The orange dashed boxes only point (never part of the design).
   usage: node scripts/handpass/mock-trk-reorder-drag.mjs [baseURL] [outDir] — the served build (preview_start raptor-walk) */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const base = process.argv[2] || 'http://localhost:4173'
const out = process.argv[3] || 'docs/img/handpass/2026-10-15-trk-reorder-drag'
mkdirSync(out, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errors = []
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
const DESK = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 }

async function openOrd(dev) {
  const ctx = await b.newContext({ baseURL: base, ...dev })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message))
  await p.goto('/'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(400)
  await p.evaluate(() => window.go('tracker')); await p.waitForTimeout(800)
  await p.locator('#sylMenuBtn').click(); await p.waitForTimeout(200)
  await p.locator('#ordSyl').click(); await p.waitForSelector('#ordModal #ordList .ordrow'); await p.waitForTimeout(300)
  return { ctx, p }
}
/* the proposal's look, in the app's own values; injected once, the app's rules left alone */
const PROPOSED_CSS = `
#ordList .ordrow.mock-lift{box-shadow:var(--lift-box, inset 0 0 0 2px #3BC6E8)}
#ordList .ordrow.mock-land{box-shadow:inset 0 2px 0 var(--accent,#3BC6E8)}
#ordList .ordrow.mock-land.after{box-shadow:inset 0 -2px 0 var(--accent,#3BC6E8)}
#ordList .ordrow.mock-lift.mock-land{box-shadow:var(--lift-box, inset 0 0 0 2px #3BC6E8), inset 0 2px 0 var(--accent,#3BC6E8)}
#ordList .ordrow .grip.mock-grip{font-size:15px;letter-spacing:0;padding:6px 4px;margin:-6px -4px}`
async function propose(p, { lift, land, after = false, finger }) {
  await p.evaluate(({ css, lift, land, after, finger }) => {
    if (!document.querySelector('style[data-mock]')) {
      const s = document.createElement('style'); s.setAttribute('data-mock', ''); s.textContent = css; document.head.appendChild(s)
    }
    const rows = [...document.querySelectorAll('#ordList .ordrow')]
    if (rows.length < 3) throw new Error('premise gone: fewer than 3 rows')
    rows.forEach(r => { r.classList.remove('mock-lift', 'mock-land', 'after') })
    rows.forEach(r => { const g = r.querySelector('.grip'); if (g) { g.textContent = '⠿'; g.classList.add('mock-grip') } })
    rows[lift].classList.add('mock-lift')
    if (land != null) { rows[land].classList.add('mock-land'); if (after) rows[land].classList.add('after') }
    document.querySelectorAll('[data-mock="finger"]').forEach(e => e.remove())
    if (finger) {
      const g = rows[finger.row].querySelector('.grip').getBoundingClientRect()
      const f = document.createElement('div'); f.setAttribute('data-mock', 'finger')
      const x = g.left + g.width / 2, y = finger.atEdge ? finger.atEdge : g.top + g.height / 2 + (finger.dy || 0)
      f.style.cssText = `position:fixed;left:${x - 19}px;top:${y - 19}px;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.28);border:2px solid rgba(255,255,255,.85);pointer-events:none;z-index:2147483646`
      document.body.appendChild(f)
    }
  }, { css: PROPOSED_CSS, lift, land, after, finger })
}
/* pointer boxes (orange dashed) — several at once */
const mark = (p, sels) => p.evaluate(sels => {
  document.querySelectorAll('[data-mock="marker"]').forEach(e => e.remove())
  for (const sel of sels) {
    const els = [...document.querySelectorAll(sel)]
    if (!els.length) throw new Error('premise gone: ' + sel)
    const rs = els.map(e => e.getBoundingClientRect())
    const l = Math.min(...rs.map(r => r.left)) - 4, t = Math.min(...rs.map(r => r.top)) - 4
    const r = Math.max(...rs.map(r => r.right)) + 4, bt = Math.max(...rs.map(r => r.bottom)) + 4
    const m = document.createElement('div'); m.setAttribute('data-mock', 'marker')
    m.style.cssText = `position:fixed;left:${l}px;top:${t}px;width:${r - l}px;height:${bt - t}px;border:2px dashed #ff8a1c;border-radius:8px;pointer-events:none;z-index:2147483647`
    document.body.appendChild(m)
  }
}, sels)
const unmark = p => p.evaluate(() => document.querySelectorAll('[data-mock="marker"]').forEach(e => e.remove()))
const shot = async (p, name) => { await p.screenshot({ path: `${out}/${name}.png` }) }
const facts = {}

/* PHONE */
{
  const { ctx, p } = await openOrd(PHONE)
  facts.phone = await p.evaluate(() => {
    const box = document.querySelector('#ordList')
    return { rows: box.querySelectorAll('.ordrow').length, scrolls: box.scrollHeight > box.clientHeight + 1,
      rowH: Math.round(box.querySelector('.ordrow').getBoundingClientRect().height),
      grip: (() => { const r = box.querySelector('.grip').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)] })(),
      note: document.querySelector('#ordModal .mini').textContent }
  })
  /* 1 — today: a finger has only ▲ ▼ */
  await mark(p, ['#ordList .ordrow button[title="Move up"], #ordList .ordrow button[title="Move down"]'])
  await shot(p, 'p1-today-phone')
  await unmark(p)
  /* 2 — proposed: the 2nd row taken by its grip and carried down; one landing line on the top of the 5th row */
  const n = facts.phone.rows
  const land = Math.min(4, n - 1)
  await propose(p, { lift: 1, land, finger: { row: land, dy: -8 } })
  await shot(p, 'p2-proposed-carrying-phone')
  /* (no edge picture: the demo's lists are 2 to 4 rows and never scroll — the list following at its edge is the mouse's
     today, since pull request 516, and is said in words) */
  await ctx.close()
}
/* 4 — after the drop: the REAL app, the row moved by its ▼ to where the drag in picture 2 would put it */
{
  const { ctx, p } = await openOrd(PHONE)
  const n = await p.locator('#ordList .ordrow').count()
  const land = Math.min(4, n - 1)
  for (let i = 1; i < land - 1; i++) { await p.locator('#ordList .ordrow').nth(i).locator('button[title="Move down"]').click(); await p.waitForTimeout(60) }
  /* a tap on the window's title takes the last ▼'s hover ring away — no button is touched in a drag */
  await p.locator('#ordTitle').tap(); await p.waitForTimeout(80)
  /* the landed row wears the app's OWN landing mark (src/ui/lift.ts landOn's `lift-land`), as a note dropped on a day does */
  await p.evaluate(land => {
    document.activeElement && document.activeElement.blur()
    document.querySelectorAll('#ordList .ordrow .grip').forEach(g => { g.textContent = '⠿'; g.style.fontSize = '15px'; g.style.letterSpacing = '0' })
    document.querySelectorAll('#ordList .ordrow')[land - 1].classList.add('lift-land')
  }, land)
  await p.waitForTimeout(120)
  if (!await p.evaluate(land => document.querySelectorAll('#ordList .ordrow')[land - 1].classList.contains('lift-land'), land)) throw new Error('premise gone: lift-land')
  await shot(p, 'p4-proposed-dropped-phone')
  await ctx.close()
}
/* DESKTOP */
{
  const { ctx, p } = await openOrd(DESK)
  const n = await p.locator('#ordList .ordrow').count()
  const land = Math.min(4, n - 1)
  /* 5 — today, a mouse mid-drag: the app's own classes — the carried row faded, a BOX round the row under the mouse */
  await p.evaluate(land => {
    const rows = [...document.querySelectorAll('#ordList .ordrow')]
    rows[1].classList.add('drag'); rows[land].classList.add('over')
  }, land)
  const today = await p.evaluate(land => document.querySelectorAll('#ordList .ordrow')[land].classList.contains('over'), land)
  if (!today) throw new Error('premise gone: .over')
  await mark(p, [`#ordList .ordrow:nth-child(${land + 1})`])
  await shot(p, 'd1-today-mouse-desktop')
  await unmark(p)
  await p.evaluate(() => document.querySelectorAll('#ordList .ordrow').forEach(r => r.classList.remove('drag', 'over')))
  /* 6 — proposed, the same drag: the lift ring and one landing line, as the finger's */
  await propose(p, { lift: 1, land })
  await shot(p, 'd2-proposed-mouse-desktop')
  await ctx.close()
}
console.log(JSON.stringify({ facts, errors }))
await b.close()
