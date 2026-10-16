// THE WHOLE-APP WORDS PASS (owner D808) — round 3: the Medical tab and the Help page (17 Oct 26).
//   Q1. Medical — "Medically Down"'s grey line "cannot fly as of <date>": goes (the heading says it, the "as of" button
//       above says the date).
//   Q2. Medical — "Pending Upchit"'s grey line "the down period has ended — the upchit document is still owed": goes
//       (the heading names the state; each card says "was down till <date>").
//   Q3. Help — "Report a problem"'s line "Spotted something wrong, or something that could work better? Send it here —
//       the schedulers see every report.": A "Spotted something wrong, or something that could work better? The
//       schedulers see every report." (the "Send it here" the Send report button says goes, the dash a full stop);
//       B "The schedulers see every report." alone.
//   Q4. Help — "Bug reports" (admins only), empty: "No reports yet — anything the squadron files lands here." →
//       "No reports yet."
//   Considered and left, drawn unmarked: "Upchit Complete"'s "the past 30 days, newest first" (the only place that says
//   older upchits are not listed while the section has cards).
// Draws on the BUILT app, marked; every "after" changes the page's own nodes (mockups-on-the-real-app.md). Nothing in
// the app is changed. The marking is words-r2.mjs's.
//
//   node scripts/handpass/words-r3.mjs [out dir]        (LOOK_URL=http://localhost:4173/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('words-r3 v2')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-16-words-pass/r3')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4173/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = []
const facts = {}
const fail = m => { errs.push('PREMISE: ' + m) }

const MARK_CSS = `[data-wpn]{outline:2px solid #ff2d55 !important;outline-offset:2px;border-radius:3px;position:relative}
[data-wpn].wp-new{outline-color:#34c759 !important}
[data-wpn]::before{content:attr(data-wpn);position:absolute;left:-4px;top:-19px;background:#ff2d55;color:#fff;font:700 11px/15px system-ui;letter-spacing:0;text-transform:none;padding:0 5px;border-radius:3px;white-space:nowrap;z-index:5}
[data-wpn=""]::before{display:none}
[data-wpn].wp-new::before{background:#34c759;color:#05210f}
[data-wpn].wp-left::before{top:calc(100% + 5px)}
[data-wpn].wp-right::before{top:calc(100% + 5px);left:auto;right:-4px}`
const mark = (page, items) => page.evaluate(([items, css]) => {
  if (!document.getElementById('wp-css')) { const s = document.createElement('style'); s.id = 'wp-css'; s.textContent = css; document.head.append(s) }
  const found = []
  for (const it of items) {
    const all = [...document.querySelectorAll(it.sel)].filter(e => e.getBoundingClientRect().width > 1)
    const list = it.all ? all : all.slice(it.nth || 0, (it.nth || 0) + 1)
    if (!list.length) { found.push(it.n + ': MISSING ' + it.sel); continue }
    list.forEach((e, i) => { e.setAttribute('data-wpn', i ? '' : it.n); if (it.new) e.classList.add('wp-new'); if (it.left) e.classList.add('wp-left'); if (it.right) e.classList.add('wp-right') })
    found.push(it.n + ' ×' + list.length + ': ' + (list[0].textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120))
  }
  return found
}, [items, MARK_CSS])
const unmark = page => page.evaluate(() => document.querySelectorAll('[data-wpn]').forEach(e => { e.removeAttribute('data-wpn'); e.classList.remove('wp-new', 'wp-left', 'wp-right') }))
const boxOf = (page, sels, pad = 10) => page.evaluate(([sels, pad]) => {
  let L = 1e9, T = 1e9, R = -1e9, B = -1e9
  for (const s of sels) for (const e of document.querySelectorAll(s)) {
    const r = e.getBoundingClientRect(); if (r.width <= 1) continue
    L = Math.min(L, r.left + scrollX); T = Math.min(T, r.top + scrollY); R = Math.max(R, r.right + scrollX); B = Math.max(B, r.bottom + scrollY)
  }
  if (L > R) return null
  return { x: Math.max(0, L - pad), y: Math.max(0, T - pad - 14), width: Math.min(document.documentElement.scrollWidth, R + pad) - Math.max(0, L - pad), height: B - T + 2 * pad + 14 }
}, [sels, pad])
const shot = async (page, name, clip) => { if (!clip) { errs.push(name + ': nothing to clip'); return } await page.screenshot({ path: join(OUT, name + '.png'), clip, fullPage: true }); facts.pictures = (facts.pictures || []).concat(name + '.png') }
const heights = (page, sels) => page.evaluate(sels => Object.fromEntries(sels.map(s => [s, [...document.querySelectorAll(s)].filter(e => e.getBoundingClientRect().width > 1).map(e => Math.round(e.getBoundingClientRect().height))])), sels)
const textOf = (page, sel) => page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 1).map(e => e.textContent.replace(/\s+/g, ' ').trim()), sel)

/* THE PROPOSED CHANGES, drawn on the page */
const AFTER = {
  /* Q1, Q2: a section's grey line goes */
  dropSub: sec => [...document.querySelectorAll(sec + ' .medsec-sub')].map(s => { s.remove(); return 'removed' }),
  /* Q3: the Report a problem card's line */
  leadA: () => [...document.querySelectorAll('#bugFile .help-lead')].map(p => { p.textContent = 'Spotted something wrong, or something that could work better? The schedulers see every report.'; return p.textContent }),
  leadB: () => [...document.querySelectorAll('#bugFile .help-lead')].map(p => { p.textContent = 'The schedulers see every report.'; return p.textContent }),
  /* Q4: the empty Bug reports card */
  emptyA: () => [...document.querySelectorAll('#bugAdmin .help-lead')].map(p => { p.textContent = 'No reports yet.'; return p.textContent }),
}
const apply = (page, key, arg) => page.evaluate(([src, arg]) => (0, eval)('(' + src + ')')(arg), [AFTER[key].toString(), arg])

async function signIn(page, to) {
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(to => window.go(to), to); await page.waitForTimeout(800)
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none'; scrollTo(0, 0) })
}
async function medical(page) {
  await signIn(page, 'inputs')
  const t = page.locator('[role="tab"]:has-text("Medical"), button:has-text("Medical")').first()
  await t.click(); await page.waitForTimeout(600)
  await page.evaluate(() => scrollTo(0, 0))
}

for (const size of [{ tag: 'desk', viewport: { width: 1440, height: 1400 }, dsf: 2 }, { tag: 'phone', viewport: { width: 390, height: 2000 }, dsf: 3, touch: true }]) {
  const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: size.dsf, ...(size.touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`${size.tag} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${size.tag} console: ` + m.text().slice(0, 200)) })
  const T = size.tag

  /* ── Q1, Q2: the Medical tab — the as-of button and the first two sections in one frame ── */
  await medical(page)
  facts[T + ' medical section heads'] = await textOf(page, '.medsec-h')
  facts[T + ' as-of button'] = await page.evaluate(() => [...document.querySelectorAll('button')].map(b => b.textContent.trim()).filter(t => /^as of/i.test(t)))
  for (const [q, sec] of [['1', '.medsec.med-down'], ['2', '.medsec.med-pend']]) if (!(await page.$(sec + ' .medsec-sub'))) fail(`${T} Q${q}: no grey line in ${sec}`)
  const medFrame = async sels => { const b = await boxOf(page, sels, 8); return b }
  const asOf = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => /^as of/i.test(b.textContent.trim()) && b.getBoundingClientRect().width > 1); if (b) b.id = 'wp-asof'; return !!b })
  if (!asOf) fail(T + ': the "as of" button is missing')
  const h0 = await heights(page, ['.medsec.med-down .medsec-h', '.medsec.med-pend .medsec-h', '.medsec.med-down', '.medsec.med-pend'])
  facts[T + ' Q1/Q2 heights before'] = h0
  facts[T + ' Q1 found'] = await mark(page, [{ n: '1', sel: '.medsec.med-down .medsec-sub', right: true }, { n: '2', sel: '.medsec.med-pend .medsec-sub', right: true }])
  await shot(page, `${T}-q12-medical-before`, await medFrame(['#wp-asof', '.medsec.med-down', '.medsec.med-pend']))
  await unmark(page)
  facts[T + ' Q1 after'] = await apply(page, 'dropSub', '.medsec.med-down')
  facts[T + ' Q2 after'] = await apply(page, 'dropSub', '.medsec.med-pend')
  facts[T + ' Q1/Q2 heights after'] = await heights(page, ['.medsec.med-down .medsec-h', '.medsec.med-pend .medsec-h', '.medsec.med-down', '.medsec.med-pend'])
  await shot(page, `${T}-q12-medical-after`, await medFrame(['#wp-asof', '.medsec.med-down', '.medsec.med-pend']))
  /* considered and left: the third section, as built */
  await medical(page)
  facts[T + ' left: upchit complete'] = await textOf(page, '.medsec.med-done .medsec-h')
  await shot(page, `${T}-left-upchit-complete`, await medFrame(['.medsec.med-done']))

  /* ── Q3, Q4: the Help page, as an admin (both cards) ── */
  await signIn(page, 'help')
  facts[T + ' Q3 before'] = await textOf(page, '#bugFile .help-lead')
  facts[T + ' Q4 before'] = await textOf(page, '#bugAdmin .help-lead')
  if (!/No reports yet/.test(String(facts[T + ' Q4 before']))) fail(T + ' Q4: the Bug reports card is not empty in the demo data')
  const helpFrame = async () => boxOf(page, ['#bugFile', '#bugAdmin'], 8)
  facts[T + ' Q3/Q4 heights before'] = await heights(page, ['#bugFile', '#bugAdmin', '#bugFile .help-lead', '#bugAdmin .help-lead'])
  facts[T + ' Q3 found'] = await mark(page, [{ n: '3', sel: '#bugFile .help-lead', right: true }, { n: '4', sel: '#bugAdmin .help-lead', right: true }])
  await shot(page, `${T}-q34-help-before`, await helpFrame())
  await unmark(page)
  facts[T + ' Q3 after A'] = await apply(page, 'leadA')
  facts[T + ' Q4 after'] = await apply(page, 'emptyA')
  facts[T + ' Q3/Q4 heights after A'] = await heights(page, ['#bugFile', '#bugAdmin', '#bugFile .help-lead', '#bugAdmin .help-lead'])
  await mark(page, [{ n: '3 A', sel: '#bugFile .help-lead', new: true, right: true }, { n: '4', sel: '#bugAdmin .help-lead', new: true, right: true }])
  await shot(page, `${T}-q34-help-after-a`, await helpFrame())
  await unmark(page)
  facts[T + ' Q3 after B'] = await apply(page, 'leadB')
  facts[T + ' Q3/Q4 heights after B'] = await heights(page, ['#bugFile', '#bugFile .help-lead'])
  await mark(page, [{ n: '3 B', sel: '#bugFile .help-lead', new: true, right: true }])
  await shot(page, `${T}-q3-help-after-b`, await boxOf(page, ['#bugFile'], 8))
  await ctx.close()
}
writeFileSync(join(OUT, 'facts.json'), JSON.stringify({ ...facts, errors: errs }, null, 1))
console.log(JSON.stringify(facts, null, 1).slice(0, 9000))
console.log('errors:', errs.length); for (const e of errs.slice(0, 20)) console.log('  ' + e)
await browser.close()
