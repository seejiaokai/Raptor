// His ask of 28 Oct 26, 15:43 (D1468–D1470): the Leave War's names drawn puck style, the category chip merged into the
// name's own box as on the schedule; an OCU man's chip "O", a ground crewman's "G". Drawn on the real app, today beside
// proposed, at his iPhone's 402 x 874 (WebKit) and his PC's 1536 x 860 at 125%. ONE transform, laid on the page by hand:
// the gap between the name bar and its chip goes, the chip becomes the bar's square right end (the schedule puck's
// `.puck .role` measures: 9.5px heavy letters, at least the bar's height wide), and the chip's words "OCU" / "GND" become
// "O" / "G". Nothing in the app changes.
// Run from raptor-port/ against the build served on PORT (default 4173): node scripts/handpass/lw-name-pucks-mock.mjs
import { webkit, chromium, devices } from '@playwright/test'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
const PORT = process.env.PORT || 4173
const OUT = path.resolve('docs/img/handpass/2026-10-28-lw-name-pucks')
mkdirSync(OUT, { recursive: true })
let problems = 0

const PUCK_CSS = `
  .mx .who .whoedit { gap: 0 !important; }
  .mx .who .whoedit .cs.seat-pilot, .mx .who .whoedit .cs.seat-wso, .mx .who .whoedit .cs.seat-gnd { border-radius: 4px 0 0 4px; }
  .mx .who .whoedit .catchip { margin-left: 0 !important; border-radius: 0 4px 4px 0; align-self: stretch; display: flex;
    align-items: center; justify-content: center; min-width: 15px; padding: 0 2px; font-size: 9px; line-height: 1; letter-spacing: 0; }
  .mx .who .whoedit .cs.seat-gnd + .catchip { box-shadow: inset 0 0 0 1px var(--pers-line, #7C8AA0); }
`
const MARK_CSS = `
  /* the frozen name column clips anything drawn outside a row, so the mark is drawn inside it */
  [data-mk] { outline: 2px solid #ff3d9a !important; outline-offset: -2px; border-radius: 5px; }
`

async function open(browser, ctxOpts) {
  const ctx = await browser.newContext(ctxOpts)
  const P = await ctx.newPage()
  P.on('pageerror', e => { problems++; console.log('page error: ' + String(e).slice(0, 160)) })
  await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
  await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached' })
  await P.evaluate(() => window.go('leavewar'))
  await P.waitForSelector('.mx .who .whoedit .catchip'); await P.waitForTimeout(600)
  return P
}

// Bring the IWSO heading near the top (his picture: IWSO, OPS W, OCU, Personnel), then mark one row of each case.
async function frame(P) {
  await P.evaluate(() => {
    const hd = [...document.querySelectorAll('.mx .grphd, .mx [class*="grp"]')].find(e => /^\W*IWSO\b/.test(e.textContent.trim()))
    hd?.scrollIntoView({ block: 'start' })
    window.scrollBy(0, -60)
  })
  await P.waitForTimeout(400)
  await P.evaluate(() => {
    document.querySelectorAll('[data-mk]').forEach(e => e.removeAttribute('data-mk'))
    const rows = [...document.querySelectorAll('.mx .who .whoedit')].filter(e => e.getBoundingClientRect().width > 0)
    const by = t => rows.find(r => r.querySelector('.catchip')?.textContent.trim() === t)
    const ocu = by('OCU') || by('O'), gnd = by('GND') || by('G')
    const cut = rows.find(r => { const c = r.querySelector('.cs'); return c && c.scrollWidth > c.clientWidth })
    if (cut) cut.setAttribute('data-mk', '1')
    if (ocu) ocu.setAttribute('data-mk', '2')
    if (gnd) gnd.setAttribute('data-mk', '3')
  })
}

async function shot(P, name, clip) {
  const ok = await P.evaluate(() => document.querySelectorAll('[data-mk]').length)
  if (!ok) { problems++; console.log('no marks on ' + name) }
  await P.screenshot({ path: path.join(OUT, name), clip })
  console.log('shot', name, 'marks', ok)
}

// VERSION 2 (his word, 15:57 — "Wouldn't it be better to be like this design pick" / "Puck", D1471): each row's name and
// chip are replaced by the schedule's own puck markup — <span class="puck [r] [pers]"><span class="nm">…</span>
// <span class="role q-…">…</span></span>, the shape ui/html.ts puck() prints and the Approvals list draws — styled by the
// app's own stylesheet; the only new style is ground personnel's "G" chip, which the schedule's puck has none of (D1470).
// the puck keeps the schedule's own size where the column has room (desktop) and shrinks to the column where it has not
// (a phone's frozen column is a few pixels narrower than the puck, which cut its chip off) — the name fades, the chip stays whole
const G_CSS = `.puck .role.lwmock-g { background: var(--pers-line, #7C8AA0); color: #fff; }
  .mx .who .whoedit .puck { max-width: 100%; min-width: 0; flex: 0 1 auto; }
  .mx .who .whoedit .puck .role { flex: none; }`
async function asPucks(P) {
  await P.addStyleTag({ content: G_CSS })
  await P.evaluate(() => {
    const QC = { A: 'q-a', B: 'q-b', C: 'q-c', D: 'q-d', OCU: 'q-ocu', O: 'q-ocu', IW: 'q-ins', IP: 'q-ins', IR: 'q-ins', FI: 'q-ins' }
    const QT = { OCU: 'O' }
    document.querySelectorAll('.mx .who .whoedit').forEach(w => {
      if (w.querySelector('.puck')) return
      const cs = w.querySelector('.cs'), chip = w.querySelector('.catchip'); if (!cs || !chip) return
      const t = chip.textContent.trim(), pers = cs.classList.contains('seat-gnd'), wso = cs.classList.contains('seat-wso')
      const pk = document.createElement('span')
      pk.className = 'puck' + (wso ? ' r' : '') + (pers ? ' pers' : '')
      const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = cs.textContent.trim()
      const ro = document.createElement('span'); ro.className = 'role ' + (pers ? 'lwmock-g' : (QC[t] || 'q-ins')); ro.textContent = pers ? 'G' : (QT[t] || t)
      pk.append(nm, ro)
      cs.style.display = 'none'; chip.style.display = 'none'
      w.insertBefore(pk, w.firstChild)
    })
  })
}

async function both(P, prefix, clip) {
  await P.addStyleTag({ content: MARK_CSS })
  await frame(P); await shot(P, prefix + '-now.png', clip)
  await P.addStyleTag({ content: PUCK_CSS })
  await P.evaluate(() => document.querySelectorAll('.mx .who .whoedit .catchip').forEach(c => {
    const t = c.textContent.trim(); if (t === 'OCU') c.textContent = 'O'; else if (t === 'GND') c.textContent = 'G'
  }))
  await frame(P); await P.waitForTimeout(200)
  const cut = await P.evaluate(() => [...document.querySelectorAll('.mx .who .whoedit .cs')].filter(c => c.getBoundingClientRect().width > 0 && c.scrollWidth > c.clientWidth).map(c => c.textContent.trim()))
  console.log(prefix, 'names still cut after:', cut.length, cut.slice(0, 12).join(', '))
  await shot(P, prefix + '-puck.png', clip)
  // version 2: undo version 1's bar (its sheet stays, but its .cs/.catchip are hidden) and draw the pucks
  await asPucks(P); await frame(P); await P.waitForTimeout(200)
  await P.evaluate(() => document.querySelectorAll('[data-mk]').forEach(w => { const pk = w.querySelector('.puck'); if (pk) { w.removeAttribute('data-mk'); pk.setAttribute('data-mk', '1') } }))
  const faded = await P.evaluate(() => [...document.querySelectorAll('.mx .who .whoedit .puck .nm')].filter(n => n.getBoundingClientRect().width > 0 && n.scrollWidth > n.clientWidth).map(n => n.textContent))
  console.log(prefix, 'v2 names that fade:', faded.length, faded.slice(0, 12).join(', '))
  const w = await P.evaluate(() => { const p = [...document.querySelectorAll('.mx .who .whoedit .puck')].find(e => e.getBoundingClientRect().width > 0); const c = p?.closest('.who'); return p ? [Math.round(p.getBoundingClientRect().width), Math.round(c.getBoundingClientRect().width)] : null })
  console.log(prefix, 'v2 puck width / column width:', w)
  await shot(P, prefix + '-puck2.png', clip)
}

const wk = await webkit.launch()
const phone = await open(wk, { ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 })
const cutBefore = await phone.evaluate(() => [...document.querySelectorAll('.mx .who .whoedit .cs')].filter(c => c.getBoundingClientRect().width > 0 && c.scrollWidth > c.clientWidth).map(c => c.textContent.trim()))
console.log('phone names cut today:', cutBefore.length, cutBefore.slice(0, 12).join(', '))
await both(phone, 'phone', { x: 0, y: 60, width: 402, height: 700 })
await wk.close()

const cr = await chromium.launch()
const desk = await open(cr, { viewport: { width: 1536, height: 860 }, deviceScaleFactor: 1.25 })
await both(desk, 'desk', { x: 0, y: 120, width: 760, height: 640 })
await cr.close()
console.log(problems ? `PROBLEMS: ${problems}` : 'ok')
