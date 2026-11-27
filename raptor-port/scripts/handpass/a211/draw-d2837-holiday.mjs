// draw-d2837-holiday - section 1, his D2837 (chat A211, 28 Nov 26): the Calendar window's holiday form, a NEW holiday
// in a year no leave period covers yet, kept waiting after Save. The line under the red "No leave period covers ... yet."
// today reads "It is kept here, and saved by itself as soon as a leave period covers it."; the words a fresh Fable
// reviewed (docs/superpowers/briefs/2026-11-28-msq-s1-words-fable-review.md §1) read "It is kept only while this window
// stays open, and saved by itself as soon as a leave period covers it."
// The BUILT app in dist, served at 4744; nothing here writes the app's code.
// THE ROAD, all real presses: Hunter (ad2 / a2, 142's admin) -> Inputs -> its calendar settings -> Calendar... -> the
// Holidays list's year arrow until it says no leave period covers the year -> "+ Add" -> a name typed -> 9 Mar picked
// (one day) -> Save: refused, kept waiting (the app's own red line and its waiting line).
// ONE NAMED TRANSFORM for the proposed picture: the waiting line's own words replaced in its own element (the app's
// class, look and place unchanged) - asserted still there just before the picture. Teal dashed outline = the place he
// looks at, drawn ON the line (an outline takes no room); one tag laid beside the window on the still screen.
// Desktop 1536x864 (his PC's 1920x1080 at 125%), Chromium, 2x. The phone (402x874, 3x) is MEASURED for how the line
// wraps; its picture is kept only if the new line wraps differently from today's there (PHONE_SHOT=1 keeps it anyway).
//   node raptor-port/scripts/handpass/a211/draw-d2837-holiday.mjs
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../..')
const { chromium, devices } = createRequire(resolve(ROOT, 'package.json'))('playwright')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const URL_ = 'http://localhost:4744/'
const OUT = resolve(ROOT, 'docs/mock/2026-11-28-msq-d2837-holiday')
const TMP = resolve(ROOT, '.tmp/a211-d2837'); mkdirSync(TMP, { recursive: true })
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const TEAL = '#0D9488'
const AT = '2026-11-28T09:00:00+08:00'
const TODAY_WORDS = 'It is kept here, and saved by itself as soon as a leave period covers it.'
const NEW_WORDS = 'It is kept only while this window stays open, and saved by itself as soon as a leave period covers it.'
const FACT = (k, v) => console.log(`FACT ${k}=${JSON.stringify(v)}`)
console.log('draw-d2837-holiday v1 (28 Nov 26)')

let browser
async function mk(phone) {
  browser ??= await chromium.launch(LAUNCH)
  const dev = phone ? { ...devices['iPhone 15 Pro'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 } : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 }
  const ctx = await browser.newContext({ ...dev, timezoneId: 'Asia/Singapore' })
  await ctx.clock.install({ time: new Date(AT) })
  const page = await ctx.newPage()
  const s = { ctx, page, errs: [], W: dev.viewport.width, H: dev.viewport.height, phone }
  page.on('pageerror', e => { const m = `PAGEERROR ${String(e).slice(0, 200)}`; console.log(m); s.errs.push(m) })
  page.on('console', m => { if (m.type() === 'error') { const t = `CONSOLE ${m.text().slice(0, 200)}`; console.log(t); s.errs.push(t) } })
  page.on('dialog', d => { console.log(`DIALOG ${d.type()}: ${d.message()}`); d.dismiss().catch(() => {}) })
  return s
}
const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
const wait = (s, ms) => s.page.waitForTimeout(ms)
async function hit(s, l, ms = 400) {
  l = typeof l === 'string' ? vis(s, l).first() : l
  await l.scrollIntoViewIfNeeded().catch(() => {})
  await l.click({ timeout: 8000 }); await wait(s, ms)
}
const boxOf = (s, sel) => s.page.evaluate(sel => {
  const e = [...document.querySelectorAll(sel)].find(n => { const r = n.getBoundingClientRect(); return r.width > 1 && r.height > 1 })
  if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }
}, sel)
async function signIn(s, u, p) {
  const { page } = s
  await page.goto(URL_); await page.waitForSelector('#luser', { timeout: 20000 })
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 })
  await page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' })
  await wait(s, 700)
}

/* the road to the waiting form, every step a press */
async function toWaiting(s) {
  const { page } = s
  await signIn(s, 'ad2', 'a2')
  FACT(`${s.phone ? 'phone' : 'desk'}.bar`, await page.evaluate(() => [...document.querySelectorAll('.topbar .mark')].find(e => e.getBoundingClientRect().width > 1)?.textContent.replace(/\s+/g, ' ').trim() ?? null))
  const nav = vis(s, '#topnav a[data-page="inputs"]')
  if (await nav.count()) await hit(s, nav.first(), 800)
  else { await hit(s, '#menuBtn, [aria-label="Menu"]', 500); await hit(s, 'a[data-page="inputs"]', 800) }
  let gear = vis(s, '[aria-label="Inputs calendar settings"]')
  if (!(await gear.count())) { const cal = vis(s, 'button[aria-pressed]').filter({ hasText: /^Calendar$/ }); if (await cal.count()) await hit(s, cal.first(), 600); gear = vis(s, '[aria-label="Inputs calendar settings"]') }
  await hit(s, gear.first(), 600)
  await hit(s, '[data-testid="iset-days"]', 800)
  /* under 1510px the Calendar window's two parts are tabs: its Holidays tab pressed */
  const tabH = vis(s, '[data-testid="days-tab-holidays"]')
  if (await tabH.count()) { await hit(s, tabH.first(), 500); FACT('pressed', 'Holidays tab') }
  let year = null
  for (let i = 0; i < 8; i++) {
    const no = await page.locator('[data-testid="hol-nocover"]').filter({ visible: true }).first().innerText().catch(() => null)
    const y = await page.locator('[data-testid="hol-year"]').filter({ visible: true }).first().innerText()
    FACT(`year${i}`, { year: y, nocover: no })
    if (no && /No leave period covers \d{4} yet/.test(no)) { year = +y; break }
    await hit(s, '[data-testid="hol-next"]', 300)
  }
  if (!year) throw new Error('no year without a leave period found')
  await hit(s, '[data-testid="hol-add"]', 600)
  /* the name set through its own change event, never typed (a typed box zooms an emulated phone) */
  await vis(s, '[data-testid="hol-name"]').first().fill('Founders Day'); await wait(s, 200)
  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  const calAt = () => page.evaluate(M => { const t = [...document.querySelectorAll('[data-testid="holcal-title"] .dcal-my')].find(e => e.getBoundingClientRect().width > 0); const [m, y] = t.textContent.trim().split(/\s+/); return +y * 12 + M.indexOf(m.toLowerCase()) }, MONTHS)
  const target = year * 12 + 2 /* March */
  for (let d = target - await calAt(), n = 0; d !== 0 && n < 60; d = target - await calAt(), n++) await hit(s, `[data-testid="${d > 0 ? 'holcal-next' : 'holcal-prev'}"]`, 80)
  const day = `holcal-day-${year}-03-09`
  await hit(s, `[data-testid="${day}"]`, 250); await hit(s, `[data-testid="${day}"]`, 300)
  FACT('picked', await page.evaluate(() => { const d = document.querySelector('[data-testid="hol-dates"]'); return d ? { from: d.dataset.from, to: d.dataset.to } : null }))
  await hit(s, '[data-testid="hol-save"]', 800)
  const st = await page.evaluate(() => ({
    err: document.querySelector('[data-testid="hol-err"]')?.textContent.trim() ?? null,
    waiting: document.querySelector('[data-testid="hol-waiting"]')?.textContent.trim() ?? null,
    buttons: [...document.querySelectorAll('[data-testid="win-holiday"] button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()),
  }))
  FACT('waitingState', st)
  if (st.waiting !== TODAY_WORDS) throw new Error('the waiting line is not today\'s words: ' + st.waiting)
  /* the form's own scroll brought to its red line, waiting line and offer, as a person scrolls it (the wheel over it) */
  const wb = await boxOf(s, '[data-testid="win-holiday"]')
  if (s.phone) {
    await page.evaluate(() => { const l = document.querySelector('[data-testid="hol-waiting"]'); let p = l.parentElement; while (p && p.scrollHeight <= p.clientHeight + 1) p = p.parentElement; if (p) p.scrollTop = p.scrollHeight })
  } else { await page.mouse.move(wb.x + wb.w / 2, wb.y + wb.h / 2); await page.mouse.wheel(0, 600) }
  await wait(s, 400)
  /* a neutral press so no control keeps a hover or focus ring: the form's title */
  await page.mouse.move(1, 1)
  return { year }
}
/* how the line lays out: its box and its number of lines (its height over its line height) */
const lineLay = s => s.page.evaluate(() => {
  const p = document.querySelector('[data-testid="hol-waiting"]'); const r = p.getBoundingClientRect(); const lh = parseFloat(getComputedStyle(p).lineHeight)
  const rng = document.createRange(); rng.selectNodeContents(p); const rows = new Set([...rng.getClientRects()].map(c => Math.round(c.top)))
  return { box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }, lineHeight: lh, lines: rows.size, font: getComputedStyle(p).font }
})
const putWords = (s, words) => s.page.evaluate(w => { const p = document.querySelector('[data-testid="hol-waiting"]'); p.textContent = w; return p.textContent }, words)
/* is anything the line or its neighbours need hidden under the form's pinned buttons? */
const inSight = s => s.page.evaluate(() => {
  const q = id => document.querySelector(`[data-testid="${id}"]`)
  const acts = document.querySelector('[data-testid="win-holiday"] .hol-acts')?.getBoundingClientRect()
  const out = {}
  for (const id of ['hol-err', 'hol-waiting', 'hol-wait-create', 'hol-wait-period']) {
    const e = q(id); if (!e) continue; const r = e.getBoundingClientRect()
    const hit = document.elementFromPoint(r.left + 4, r.bottom - 3)
    out[id] = { top: Math.round(r.top), bottom: Math.round(r.bottom), clearOfButtons: acts ? r.bottom <= acts.top + 0.5 : null, seen: !!hit && e.contains(hit) }
  }
  out.buttonsTop = acts ? Math.round(acts.top) : null
  return out
})
async function mark(s, tag) {
  return s.page.evaluate(([c, tag]) => {
    const p = document.querySelector('[data-testid="hol-waiting"]'); const before = p.getBoundingClientRect()
    p.style.outline = `2px dashed ${c}`; p.style.outlineOffset = '3px'
    const after = p.getBoundingClientRect()
    const w = document.querySelector('[data-testid="win-holiday"]').getBoundingClientRect()
    const t = document.createElement('div'); t.className = '__a211tag'; t.textContent = tag
    Object.assign(t.style, { position: 'fixed', zIndex: 2147483647, pointerEvents: 'none', background: c, color: '#fff', font: '600 13px/1.3 system-ui, -apple-system, Segoe UI, sans-serif', padding: '5px 9px', borderRadius: '4px', width: '290px', boxSizing: 'border-box', whiteSpace: 'normal' })
    document.body.appendChild(t)
    const tb = t.getBoundingClientRect()
    /* on the desktop: in the Calendar window's empty foot under its Holidays list, at its right, level with the line;
       on a narrow screen: over the form's title row */
    const cal = document.querySelector('[data-testid="win-days"]')?.getBoundingClientRect()
    let left, top
    if (cal && cal.width > 1 && cal.right - 300 > w.right + 120) { left = cal.right - tb.width - 24; top = Math.min(before.top + before.height / 2 - tb.height / 2, cal.bottom - tb.height - 20) }
    else { left = Math.max(4, w.left); top = Math.max(4, w.top - tb.height - 8) }
    Object.assign(t.style, { left: left + 'px', top: top + 'px' })
    const r = t.getBoundingClientRect()
    return { moved: before.x !== after.x || before.y !== after.y || before.width !== after.width || before.height !== after.height, tag: { x: r.left, y: r.top, w: r.width, h: r.height }, line: { x: before.left - 5, y: before.top - 5, w: before.width + 10, h: before.height + 10 } }
  }, [TEAL, tag])
}
const unmark = s => s.page.evaluate(() => { document.querySelectorAll('.__a211tag').forEach(e => e.remove()); const p = document.querySelector('[data-testid="hol-waiting"]'); if (p) { p.style.outline = ''; p.style.outlineOffset = '' } })
async function shot(s, name, rects, dir = OUT, pad = 14) {
  await s.page.mouse.move(1, 1).catch(() => {}); await wait(s, 250)
  await s.page.screenshot({ path: `${TMP}/${name}-whole.png` })
  rects = rects.filter(Boolean)
  const L = Math.min(...rects.map(r => r.x)), T = Math.min(...rects.map(r => r.y)), R = Math.max(...rects.map(r => r.x + r.w)), B = Math.max(...rects.map(r => r.y + r.h))
  const x = Math.max(0, L - pad), y = Math.max(0, T - pad)
  const clip = { x, y, width: Math.min(s.W, R + pad) - x, height: Math.min(s.H, B + pad) - y }
  await s.page.screenshot({ path: `${dir}/${name}.png`, clip })
  FACT(`${name}.crop`, clip)
  console.log(`  picture ${name}.png`)
}

try {
  /* DESKTOP */
  {
    const s = await mk(false)
    try {
      const { year } = await toWaiting(s)
      FACT('desk.year', year)
      FACT('desk.today.lay', await lineLay(s)); FACT('desk.today.inSight', await inSight(s))
      const win = await boxOf(s, '[data-testid="win-holiday"]')
      FACT('desk.window', win)
      let m = await mark(s, 'Today: the marked line as it reads now')
      if (m.moved) throw new Error('the mark moved the line')
      const calw = await boxOf(s, '[data-testid="win-days"]'); FACT('desk.calendarWindow', calw)
      await shot(s, 'd2837-1-today', [win, calw, m.tag])
      await unmark(s)
      const put = await putWords(s, NEW_WORDS); if (put !== NEW_WORDS) throw new Error('the words did not take')
      await wait(s, 300)
      FACT('desk.new.lay', await lineLay(s)); FACT('desk.new.inSight', await inSight(s))
      m = await mark(s, 'Proposed: new words in the marked line — “kept here” becomes “kept only while this window stays open”. Nothing else changes.')
      if (m.moved) throw new Error('the mark moved the line')
      const still = await s.page.evaluate(() => document.querySelector('[data-testid="hol-waiting"]')?.textContent)
      if (still !== NEW_WORDS) throw new Error('the app redrew the line before the picture: ' + still)
      await shot(s, 'd2837-2-proposed', [await boxOf(s, '[data-testid="win-holiday"]'), await boxOf(s, '[data-testid="win-days"]'), m.tag])
      FACT('desk.errs', s.errs)
    } finally { await s.ctx.close().catch(() => {}) }
  }
  /* PHONE: measured; pictured only if the new line wraps differently there */
  {
    const s = await mk(true)
    try {
      await toWaiting(s)
      const t = await lineLay(s); FACT('phone.today.lay', t); FACT('phone.today.inSight', await inSight(s))
      await s.page.screenshot({ path: `${TMP}/phone-today-whole.png` })
      await putWords(s, NEW_WORDS); await wait(s, 300)
      const n = await lineLay(s); FACT('phone.new.lay', n); FACT('phone.new.inSight', await inSight(s))
      const desk = { today: null, new: null }
      FACT('phone.linesTodayNew', [t.lines, n.lines])
      /* the app loads no font of its own: "Inter Tight" is drawn here only because this PC has it; his iPhone falls back
         to Apple's system font, wider. Stand-ins of about its width (Arial, Segoe UI) measured for both lines, then put back */
      FACT('phone.standIns', await s.page.evaluate(([a, b]) => {
        const p = document.querySelector('[data-testid="hol-waiting"]'), keep = p.textContent, out = {}
        const lines = () => { const r = document.createRange(); r.selectNodeContents(p); return new Set([...r.getClientRects()].map(c => Math.round(c.top))).size }
        for (const f of ['Arial', 'Segoe UI', 'Verdana']) { p.style.fontFamily = f; out[f] = {}; for (const [k, w] of [['today', a], ['new', b]]) { p.textContent = w; out[f][k] = lines() } }
        p.style.fontFamily = ''; p.textContent = keep
        return { available: document.fonts.check('12.5px "Inter Tight"'), ...out }
      }, [TODAY_WORDS, NEW_WORDS]))
      await s.page.screenshot({ path: `${TMP}/phone-new-whole.png` })
      if (process.env.PHONE_SHOT || n.lines !== t.lines) {
        const m = await mark(s, 'Proposed: new words in the marked line')
        if (m.moved) throw new Error('the mark moved the line')
        await shot(s, 'd2837-3-proposed-iphone', [await boxOf(s, '[data-testid="win-holiday"]'), m.tag], OUT, 0)
      }
      void desk
      FACT('phone.errs', s.errs)
    } finally { await s.ctx.close().catch(() => {}) }
  }
} finally { await browser?.close() }
