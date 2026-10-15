// THE WHOLE-APP WORDS PASS (owner D808) — round 1b: his three notes on round 1's preview (16 Oct 26).
//   A. the board's wave header "In-time / Rally 09:40 · 4 ac" — removed (his question; recommended, D846 test 1)
//   B. D943 — a short line under the Ground Programme's name: how to take an input off (board and week)
//   C. D944 — on a phone, Personal Inputs one line less (Undo up beside the remark); Unavailable without its heading line
// Draws on the BUILT app, marked; the "after" pictures change the page's own nodes (mockups-on-the-real-app.md). Nothing
// in the app is changed. Same marking as words-r1.mjs: the mark sits ON the element, each frame is re-found after a change.
//
//   node scripts/handpass/words-r1b.mjs [out dir]        (LOOK_URL=http://localhost:4180/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('words-r1b v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-16-words-pass/r1b')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4180/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = []
const facts = {}
const BTN = process.env.BTN || 'Reject'
const GP_LINE = process.env.GP_LINE || `To take an input off the programme, press ${BTN} on it in Personal Inputs below.`

const MARK_CSS = `[data-wpn]{outline:2px solid #ff2d55 !important;outline-offset:2px;border-radius:3px;position:relative}
[data-wpn].wp-new{outline-color:#34c759 !important}
[data-wpn]::before{content:attr(data-wpn);position:absolute;left:-4px;top:-19px;background:#ff2d55;color:#fff;font:700 11px/15px system-ui;letter-spacing:0;text-transform:none;padding:0 5px;border-radius:3px;white-space:nowrap;z-index:5}
[data-wpn].wp-new::before{background:#34c759;color:#05210f}`
const mark = (page, items) => page.evaluate(([items, css]) => {
  if (!document.getElementById('wp-css')) { const s = document.createElement('style'); s.id = 'wp-css'; s.textContent = css; document.head.append(s) }
  const found = []
  for (const it of items) {
    const all = [...document.querySelectorAll(it.sel)].filter(e => e.getBoundingClientRect().width > 1)
    const list = it.all ? all : all.slice(it.nth || 0, (it.nth || 0) + 1)
    if (!list.length) { found.push(it.n + ': MISSING ' + it.sel); continue }
    list.forEach((e, i) => { e.setAttribute('data-wpn', i ? '' : it.n); if (it.new) e.classList.add('wp-new') })
    found.push(it.n + ' ×' + list.length + ': ' + (list[0].textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120))
  }
  return found
}, [items, MARK_CSS])
const unmark = page => page.evaluate(() => document.querySelectorAll('[data-wpn]').forEach(e => { e.removeAttribute('data-wpn'); e.classList.remove('wp-new') }))
const boxOf = (page, sels, pad = 10) => page.evaluate(([sels, pad]) => {
  let L = 1e9, T = 1e9, R = -1e9, B = -1e9
  for (const s of sels) for (const e of document.querySelectorAll(s)) {
    const r = e.getBoundingClientRect(); if (r.width <= 1) continue
    L = Math.min(L, r.left + scrollX); T = Math.min(T, r.top + scrollY); R = Math.max(R, r.right + scrollX); B = Math.max(B, r.bottom + scrollY)
  }
  if (L > R) return null
  return { x: Math.max(0, L - pad), y: Math.max(0, T - pad - 14), width: Math.min(document.documentElement.scrollWidth, R + pad) - Math.max(0, L - pad), height: B - T + 2 * pad + 14 }
}, [sels, pad])
const shot = async (page, name, clip) => { if (!clip) { errs.push(name + ': nothing to clip'); return } await page.screenshot({ path: join(OUT, name + '.png'), clip, fullPage: true }) }
const heights = (page, sels) => page.evaluate(sels => Object.fromEntries(sels.map(s => [s, Math.round(document.querySelector(s)?.getBoundingClientRect().height || 0)])), sels)

/* THE PROPOSED CHANGES, drawn on the page */
const AFTER = {
  /* A: the wave header's report time and aircraft count go (board only — the week never drew it) */
  wave: () => [...document.querySelectorAll('#schedBoard .sb-go-h > .asd')].map(a => { const t = a.textContent; a.remove(); return t }),
  /* B: the line under the Ground Programme's name — the removed-input note's own style, so it looks like the app */
  gpBoard: line => { const p = document.querySelector('#schedBoard .sb-panel.grnd .sb-pb'); if (!p) return 'NO PANEL'; const d = document.createElement('div'); d.className = 'sb-pinote'; d.id = 'wp-gp-b'; d.textContent = line; p.prepend(d); return 'added' },
  gpWeek: line => { const h = document.querySelector('#eWeek .day[data-day="0"] .sec-grnd > .sub-h'); if (!h) return 'NO HEAD'; const d = document.createElement('div'); d.className = 'pl-inpnote'; d.id = 'wp-gp-w'; d.textContent = line; h.after(d); return 'added' },
  /* his question on the preview (16 Oct 26): the input row's "Undo" renamed — "Reject" by default: his own word (D943), the
     pair of the row's "Accept", never read as the top bar's Undo, and not as Delete ("Remove" was, to him) */
  rename: btn => [...document.querySelectorAll('.accb.undo')].map(b => { b.textContent = b.textContent.replace(/^Undo/, btn); return b.textContent }),
  /* C1: on a phone, an accepted input's Undo moves up onto its puck's line, at the end of the puck's space (the remark keeps its width) */
  piUp: () => {
    const s = document.createElement('style'); s.id = 'wp-pi-up'
    s.textContent = '#wpPI .sb-arow.c6r.inprow>.ppl,#wpPI .sb-arow.c6r.inprow>.rmkin{grid-row:2 !important}#wpPI .sb-arow.c6r.inprow>.lctl{grid-column:2 / 3 !important;grid-row:2 !important;justify-self:end;align-self:center}'
    document.head.append(s); return 'style'
  },
  /* C2: Unavailable without its "Item · Start · End" heading line */
  unHead: () => { const p = document.getElementById('wpUN'); const h = p?.querySelector('.sb-acols'); if (!h) return 'NO HEAD'; h.remove(); return 'removed' },
}
const apply = (page, key, arg) => page.evaluate(([src, arg]) => (0, eval)('(' + src + ')')(arg), [AFTER[key].toString(), arg])

async function signIn(page) {
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(700)
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' })
}
async function openBoard(page) {
  await signIn(page)
  await page.locator('#eWeek [data-sbday="0"]').first().click()
  await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(700)
  await page.evaluate(() => document.querySelector('#schedBoard [data-pitog="0"]')?.click()); await page.waitForTimeout(400)
  await page.evaluate(() => {
    scrollTo(0, 0); document.querySelectorAll('#schedBoard *').forEach(e => { if (e.scrollTop) e.scrollTop = 0 })
    const t = document.getElementById('toastEl'); if (t) t.style.display = 'none'
    const P = n => [...document.querySelectorAll('#schedBoard .sb-panel')].find(p => (p.querySelector('.sb-ph')?.textContent || '').includes(n))
    P('Personal Inputs').id = 'wpPI'; P('Unavailable').id = 'wpUN'; P('Ground Programme').id = 'wpGP'
  })
}

for (const size of [{ tag: 'desk', viewport: { width: 1440, height: 9000 }, dsf: 2 }, { tag: 'phone', viewport: { width: 390, height: 9000 }, dsf: 3, touch: true }]) {
  const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: size.dsf, ...(size.touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`${size.tag} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${size.tag} console: ` + m.text().slice(0, 200)) })
  const T = size.tag

  /* ── A. the board's first wave header ── */
  await openBoard(page)
  const waveFrame = () => boxOf(page, ['#schedBoard .sb-go-h'], 8)
  facts[T + ' A found'] = await mark(page, [{ n: 'A', sel: '#schedBoard .sb-go-h > .asd' }])
  facts[T + ' A height before'] = await heights(page, ['#schedBoard .sb-go-h'])
  await shot(page, `${T}-A-before`, await waveFrame())
  await unmark(page)
  facts[T + ' A after'] = await apply(page, 'wave')
  facts[T + ' A height after'] = await heights(page, ['#schedBoard .sb-go-h'])
  await shot(page, `${T}-A-after`, await waveFrame())

  /* ── B. the Ground Programme's line, on the board ── */
  await openBoard(page)
  const gpFrame = async () => { const b = await boxOf(page, ['#wpGP'], 6); return b && { ...b, height: Math.min(b.height, T === 'desk' ? 420 : 900) } }
  facts[T + ' B board fromInput rows'] = await page.evaluate(() => document.querySelectorAll('#wpGP .gr-frominput').length)
  await mark(page, [{ n: 'from an input', sel: '#wpGP .gr-frominput' }])
  await shot(page, `${T}-B-board-before`, await gpFrame())
  await unmark(page)
  facts[T + ' B board after'] = [await apply(page, 'gpBoard', GP_LINE), (await apply(page, 'rename', BTN)).length + ' renamed']
  await mark(page, [{ n: 'B (new)', sel: '#wp-gp-b', new: true }])
  await shot(page, `${T}-B-board-after`, await gpFrame())
  /* where the Undo it names sits — Personal Inputs, an accepted row's Undo marked */
  await unmark(page)
  await mark(page, [{ n: BTN, sel: '#wpPI .accb.undo', nth: 0, new: true }])
  await shot(page, `${T}-B-board-undo`, await (async () => { const b = await boxOf(page, ['#wpPI'], 6); return b && { ...b, height: Math.min(b.height, T === 'desk' ? 360 : 520) } })())

  /* ── C. Personal Inputs and Unavailable — the phone is the point (D944); the desktop is drawn to show it is untouched ── */
  await openBoard(page)
  facts[T + ' C heights before'] = await heights(page, ['#wpPI', '#wpUN', '#wpPI .sb-arow.inprow', '#wpUN .sb-arow.inprow'])
  await mark(page, [{ n: 'C1', sel: '#wpPI .accb.undo', all: true }, { n: 'C2', sel: '#wpUN .sb-acols' }])
  await shot(page, `${T}-C-pi-before`, await (async () => { const b = await boxOf(page, ['#wpPI'], 6); return b && { ...b, height: Math.min(b.height, 560) } })())
  await shot(page, `${T}-C-un-before`, await boxOf(page, ['#wpUN'], 6))
  await unmark(page)
  if (T === 'phone') {
    facts[T + ' C after'] = [await apply(page, 'piUp'), await apply(page, 'unHead'), (await apply(page, 'rename', BTN)).length + ' renamed']
    facts[T + ' C heights after'] = await heights(page, ['#wpPI', '#wpUN', '#wpPI .sb-arow.inprow', '#wpUN .sb-arow.inprow'])
    await mark(page, [{ n: 'C1 (moved)', sel: '#wpPI .accb.undo', all: true, new: true }])
    await shot(page, `${T}-C-pi-after`, await (async () => { const b = await boxOf(page, ['#wpPI'], 6); return b && { ...b, height: Math.min(b.height, 560) } })())
    await unmark(page)
    await shot(page, `${T}-C-un-after`, await boxOf(page, ['#wpUN'], 6))
  }

  /* ── the week (Edit Schedule): B's line on its Ground Programme; the same rows named as another place (D852) ── */
  await signIn(page)
  await page.evaluate(() => document.querySelector('#eWeek [data-pitog="0"]')?.click()); await page.waitForTimeout(400)
  const D = '#eWeek .day[data-day="0"]'
  const wGp = async () => { const b = await boxOf(page, [`${D} .sec-grnd`], 6); return b && { ...b, height: Math.min(b.height, T === 'desk' ? 380 : 760) } }
  facts[T + ' week B after'] = [await apply(page, 'gpWeek', GP_LINE), (await apply(page, 'rename', BTN)).length + ' renamed']
  await mark(page, [{ n: 'B (new)', sel: '#wp-gp-w', new: true }])
  await shot(page, `${T}-B-week-after`, await wGp())
  await unmark(page)
  if (T === 'phone') {
    const hs = await page.evaluate(D => { const hs = [...document.querySelectorAll(D + ' .sub-h')]; const out = {}; for (const [k, re] of [['pinp', /^\W*Personal Inputs/], ['unav', /^\W*Unavailable/]]) { const h = hs.find(h => re.test(h.textContent)); const sec = h?.closest('.sub'); if (sec) { sec.id = 'wpw-' + k; out[k] = Math.round(sec.getBoundingClientRect().height) } } return out }, D)
    facts[T + ' week sections'] = hs
    await shot(page, `${T}-W-pi`, await (async () => { const b = await boxOf(page, ['#wpw-pinp'], 6); return b && { ...b, height: Math.min(b.height, 520) } })())
    await shot(page, `${T}-W-un`, await (async () => { const b = await boxOf(page, ['#wpw-unav'], 6); return b && { ...b, height: Math.min(b.height, 520) } })())
    await shot(page, `${T}-W-gp`, await (async () => { const b = await boxOf(page, [`${D} .sec-grnd`], 6); return b && { ...b, height: Math.min(b.height, 520) } })())
  }
  await ctx.close()
}
writeFileSync(join(OUT, 'facts.json'), JSON.stringify(facts, null, 1))
console.log(JSON.stringify(facts, null, 1).slice(0, 6000))
console.log('errors:', errs.length); for (const e of errs.slice(0, 20)) console.log('  ' + e)
await browser.close()
