// The night of 22–23 Nov 26, job 4 — the drawing check (D1494) of the bell's "Show" buttons and its grey squadron mark
// against the approved drawings (docs/mock/2026-11-22-msq-b1-screens/img): p3a (Saber's bell as it opens: "Show 142 149",
// 142 on, 149 off), p3b (149 pressed: 149's lines among 142's, each marked "149"), p3c (Hunter holding Plan of 149: 149 on
// as it starts), f5a (eight squadrons on the iPhone: one row that slides sideways). Each is reached on the built app at
// the drawings' own sizes — his iPhone's (402, WebKit) and the desktop's (1536, Chromium) — and, beside it, the drawing's
// own construction (redraw-pieces.mjs bellLines, draw-f.mjs bellLines) laid on the same page, so the two are measured with
// the same rulers: the foot's row, "Show", each chip, the grey mark against its line's name and day.
// The lines: the demo has none for these people, so posting lines (the bell's own kind, stamped with their squadron) are
// put into the live list through the localhost bridge (window.NOTICES) — what is measured is how they are drawn; the
// switch is pressed for real, Plan of 149 is given on Admin → Users for real, and the switch is read again after a reload.
// Serve the build first:  npx vite preview --port 4475 --strictPort   then, from raptor-port/:
//   MQ_URL=http://localhost:4475/ MQ_OUT=<a folder outside the checkout> node scripts/handpass/n149/measure-job4.mjs
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

const URL_ = process.env.MQ_URL || 'http://localhost:4475/'
const OUT = process.env.MQ_OUT || 'n149-job4-out'
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launch = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const SIZES = {
  d: { engine: chromium, desk: true, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { engine: webkit, desk: false, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const errs = [], facts = {}
const browsers = {}
async function newPage(sz) {
  const S = SIZES[sz]
  const key = S.engine === webkit ? 'wk' : 'cr'
  if (!browsers[key]) browsers[key] = await S.engine.launch(S.engine === webkit ? {} : launch)
  const ctx = await browsers[key].newContext(S.opts)
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`[${sz}] PAGEERROR ${e}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`[${sz}] ${r.status()} ${r.url()}`) })
  return { ctx, page }
}
async function signIn(page, user, pass) {
  await page.goto(URL_); await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(800)
  await page.addStyleTag({ content: '#toastEl { display: none !important; } *{transition:none !important;animation:none !important}' })
}
async function session(sz, user, pass) { const s = await newPage(sz); await signIn(s.page, user, pass); return s }
/* posting lines on `to`'s bell, each stamped with its squadron: [who, unit, minutes ago] */
async function putLines(page, to, rows, keep = false) {
  await page.evaluate(({ to, rows, keep }) => {
    const d = new Date(), iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!keep) window.NOTICES.length = 0
    rows.forEach(([who, u, ago], i) => window.NOTICES.push({ id: `po:mq${i}:${who}`, to, by: null, at: Date.now() - ago * 60000, iid: '',
      name: '', day: iso, what: [{ k: 'po', who, o: 'overseas' }], u }))
    window.renderSchedule()
  }, { to, rows, keep })
}
async function openBell(page) {
  await page.locator('.bellbtn:visible').first().click()
  await page.waitForSelector('[data-testid="bell-list"]')
  await page.waitForTimeout(400)
}
/* the drawing's clip (redraw-pieces.mjs shot: the list and the bell, 16px round; the phone the whole screen) */
async function shot(page, file, desk) {
  await page.mouse.move(1, 1).catch(() => {})
  await page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur() })
  await page.waitForTimeout(200)
  let clip = null
  if (desk) clip = await page.evaluate(() => {
    const rs = ['[data-testid="bell-list"]', '.bellbtn'].map(s => [...document.querySelectorAll(s)].find(e => e.getBoundingClientRect().width > 0)).filter(Boolean).map(e => e.getBoundingClientRect())
    const x = Math.max(0, Math.min(...rs.map(r => r.left)) - 16), y = Math.max(0, Math.min(...rs.map(r => r.top)) - 16)
    return { x, y, width: Math.min(innerWidth - x, Math.max(...rs.map(r => r.right)) + 16 - x), height: Math.min(innerHeight - y, Math.max(...rs.map(r => r.bottom)) + 16 - y) }
  })
  await page.screenshot({ path: `${OUT}/${file}`, ...(clip ? { clip } : {}) })
}
/* the foot and the marks, as built (sel: the real classes) or as drawn (the drawing's own: .mq-sqchips, .sarole) */
async function measure(page, drawn) {
  return page.evaluate(drawn => {
    const R = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: +b.left.toFixed(1), y: +b.top.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) } }
    const list = document.querySelector('[data-testid="bell-list"]'), foot = list.querySelector('.bl-foot')
    const row = list.querySelector(drawn ? '.mq-sqchips' : '[data-testid="bell-show"]')
    const show = row && row.querySelector('.bl-more')
    const chips = row ? [...row.querySelectorAll('.fchip')].map(c => ({ t: c.textContent, on: c.classList.contains('on'), ...R(c), font: getComputedStyle(c).fontSize })) : []
    const marks = [...list.querySelectorAll('.bl-line')].filter(l => l.getBoundingClientRect().height > 0).map(l => {
      const nm = l.querySelector('.bl-name'), mk = l.querySelector(drawn ? '.sarole' : '.bl-sqn'), dy = l.querySelector('.bl-day')
      if (!mk) return null
      const a = nm.getBoundingClientRect(), m = mk.getBoundingClientRect(), d = dy.getBoundingClientRect()
      return { t: mk.textContent, w: +m.width.toFixed(1), h: +m.height.toFixed(1), gapName: +(m.left - a.right).toFixed(1), gapDay: +(d.left - m.right).toFixed(1),
        midOff: +((m.top + m.height / 2) - (a.top + a.height / 2)).toFixed(1), font: getComputedStyle(mk).fontSize }
    }).filter(Boolean)
    return { list: R(list), foot: R(foot), row: R(row), show: R(show), showFont: show ? getComputedStyle(show).fontSize : null,
      rowOver: row ? Math.round(row.scrollWidth - row.clientWidth) : null, chips, marks,
      lines: [...list.querySelectorAll('.bl-line')].filter(l => l.getBoundingClientRect().height > 0).length }
  }, drawn)
}
/* the drawing's construction (redraw-pieces.mjs bellLines; f5a's row from draw-f.mjs), on the same page: the real row
   taken out, the drawn row put in its place; the marks the drawing's badge (mq.badge) beside each real mark */
async function drawAsDrawn(page, all, on, eight) {
  await page.evaluate(({ all, on, eight }) => {
    const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e }
    const list = document.querySelector('[data-testid="bell-list"]')
    let foot = list.querySelector('.bl-foot')
    if (!foot) { foot = el('div', 'bl-foot'); list.appendChild(foot) }
    const real = list.querySelector('[data-testid="bell-show"]'); if (real) real.remove()
    const row = el('span', 'mq-sqchips')
    row.style.cssText = eight ? 'display:inline-flex;gap:6px;align-items:center;margin-right:auto;flex-wrap:nowrap;min-width:0;flex:1 1 auto;overflow-x:auto;scrollbar-width:none'
      : 'display:inline-flex;gap:6px;align-items:center;margin-right:auto'
    row.appendChild(el('span', 'bl-more', 'Show'))
    for (const s of all) { const c = el('button', 'fchip' + (on.includes(s) ? ' on' : ''), s); c.type = 'button'; if (eight) c.style.flex = '0 0 auto'; row.appendChild(c) }
    foot.insertBefore(row, foot.firstChild)
    if (!eight) { foot.style.display = 'flex'; foot.style.alignItems = 'center' }
    for (const m of [...list.querySelectorAll('.bl-sqn')]) {
      const c = el('span', 'sarole ro', m.textContent)
      c.style.background = 'rgba(255,255,255,.08)'; c.style.borderColor = 'rgba(255,255,255,.22)'; c.style.color = 'var(--ink-2)'
      c.style.verticalAlign = '1px'; c.style.marginLeft = '6px'; c.style.fontStyle = 'normal'
      m.replaceWith(c)
    }
  }, { all, on, eight })
  await page.waitForTimeout(150)
}
const chipsOf = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-show"] .fchip')].map(c => `${c.textContent}${c.getAttribute('aria-pressed') === 'true' ? ' on' : ''}`))
const L142 = [['bane', 'u142', 4], ['prowler', 'u142', 20], ['stiff', 'u142', 60]]
const L149 = [['osp9', 'u149', 9], ['kes9', 'u149', 35]]

const run = async (sz) => {
  const desk = SIZES[sz].desk
  // p3a, p3b and the reload — Saber, the master admin
  {
    const { ctx, page } = await session(sz, 'ad', 'a')
    await putLines(page, 'stiff', [L142[0], L149[0], L142[1], L149[1], L142[2]])
    await openBell(page)
    facts[`p3a-${sz}`] = { chips: await chipsOf(page), built: await measure(page, false) }
    await shot(page, `p3a-${sz}.png`, desk)
    await page.locator('[data-testid="bell-show"] .fchip', { hasText: /^149$/ }).click(); await page.waitForTimeout(300)
    facts[`p3b-${sz}`] = { chips: await chipsOf(page), built: await measure(page, false) }
    await shot(page, `p3b-${sz}.png`, desk)
    await drawAsDrawn(page, ['142', '149'], ['142', '149'], false)
    facts[`p3b-${sz}`].drawn = await measure(page, true)
    await shot(page, `p3b-${sz}-asdrawn.png`, desk)
    // the reload: the switch is saved
    await page.reload(); await signIn(page, 'ad', 'a'); await openBell(page)
    facts[`reload-${sz}`] = { chips: await chipsOf(page) }
    await ctx.close()
  }
  // p3a's drawn twin (149 off)
  {
    const { ctx, page } = await session(sz, 'ad', 'a')
    await putLines(page, 'stiff', [L142[0], L142[1], L142[2]])
    await openBell(page)
    await drawAsDrawn(page, ['142', '149'], ['142'], false)
    facts[`p3a-${sz}`].drawn = await measure(page, true)
    await ctx.close()
  }
  // p3c — Hunter, given Plan of 149 by Saber on Admin → Users, then signed in (desktop, as drawn)
  if (desk) {
    const { ctx, page } = await session(sz, 'ad', 'a')
    await page.evaluate(() => window.go('admin'))
    await page.waitForSelector('#page-admin.on', { state: 'attached' }); await page.waitForTimeout(600)
    if (!(await page.locator('#page-admin button.acc-main').first().isVisible())) {
      await page.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first().click(); await page.waitForTimeout(600)
    }
    await page.locator('#page-admin button.acc-main', { hasText: /^Hunter/ }).first().click()
    await page.waitForSelector('#page-admin .acc-edit'); await page.waitForTimeout(300)
    await page.click('#page-admin [aria-label="Access to 149"] button[data-line="plan"]')
    await page.click('#accEdSave'); await page.waitForTimeout(500)
    await page.reload(); await signIn(page, 'ad2', 'a2')
    await putLines(page, 'prowler', [L149[0], L142[0], L149[1]], true)
    await openBell(page)
    facts[`p3c-${sz}`] = { chips: await chipsOf(page), built: await measure(page, false) }
    await shot(page, `p3c-${sz}.png`, desk)
    await ctx.close()
  }
  // f5a — eight squadrons on the iPhone
  if (!desk) {
    const { ctx, page } = await session(sz, 'ad', 'a')
    for (let n = 150; n <= 155; n++) {
      const r = await page.evaluate(n => window.raptorAddUnit(String(n), 'acad2'), n)
      if (!r || r.ok === false) errs.push(`[${sz}] ${n} not made: ${JSON.stringify(r)}`)
    }
    await page.waitForTimeout(300)
    await putLines(page, 'stiff', [L142[0], L142[1], L142[2]])
    await openBell(page)
    facts[`f5a-${sz}`] = { chips: await chipsOf(page), built: await measure(page, false) }
    await shot(page, `f5a-${sz}.png`, false)
    // a sideways slide of the row moves it (one row, never wrapping)
    facts[`f5a-${sz}`].slid = await page.evaluate(() => { const r = document.querySelector('[data-testid="bell-show"]'); r.scrollLeft = 200; return Math.round(r.scrollLeft) })
    await page.evaluate(() => { document.querySelector('[data-testid="bell-show"]').scrollLeft = 0 })
    await drawAsDrawn(page, ['142', '149', '150', '151', '152', '153', '154', '155'], ['142'], true)
    facts[`f5a-${sz}`].drawn = await measure(page, true)
    await shot(page, `f5a-${sz}-asdrawn.png`, false)
    // as the drawing stands: nothing unread, so no "Mark all read" beside the row (the drawing's own state — its 72px)
    await page.reload(); await signIn(page, 'ad', 'a')
    await putLines(page, 'stiff', [L142[0], L142[1], L142[2]])
    await openBell(page)
    await page.click('[data-testid="bell-markall"]'); await page.waitForTimeout(300)
    facts[`f5a-read-${sz}`] = { chips: await chipsOf(page), built: await measure(page, false) }
    await shot(page, `f5a-read-${sz}.png`, false)
    await ctx.close()
  }
}
try {
  for (const sz of (process.env.MQ_SZ ? process.env.MQ_SZ.split(',') : Object.keys(SIZES))) {
    try { await run(sz) } catch (e) { errs.push(`[${sz}] FAILED ${e.message}`) }
  }
} finally {
  for (const b of Object.values(browsers)) await b.close()
}
writeFileSync(`${OUT}/facts.json`, JSON.stringify({ facts, errs }, null, 1))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
