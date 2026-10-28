// M5a drawing fixes (D1493, 29 Oct 26) — the pictures beside the drawings: the person window from a name on the grid and
// from My leave, the Balances page (admin; a member while locked), and the grid's day panel to show its line unchanged —
// at his PC (1536 × 864 at 125%), a full-HD screen (1920 × 1080) and his iPhone (402 × 874). Points at a build served on
// PORT (4181); prints what it measures beside each picture.
//   cd raptor-port && npm run build && npx vite preview --port 4181 ; cd scripts/handpass && node lw-m5a-drawfix-shots.mjs
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/drawing-fixes'
process.env.LW_TODAY ||= '2026-01-25'
process.env.PORT ||= '4181'
const L = await import('./lw-m4-lib.mjs')
const { devices } = await import('@playwright/test')
const { T, press } = L
console.log('[lw-m5a-drawfix-shots v1]')

async function newCtx(size) {
  const b = await L.getBrowser()
  const phone = size === 'phone'
  const ctx = await b.newContext(phone
    ? { viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: devices['iPhone 13'].userAgent }
    : size === 'hd' ? { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 } : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 })
  const page = await ctx.newPage()
  const errs = []
  page.on('console', m => { if (m.type() === 'error') errs.push(`${size} console: ` + m.text().slice(0, 200)) })
  page.on('pageerror', e => errs.push(`${size} pageerror: ` + String(e).slice(0, 200)))
  page.on('response', r => { if (r.status() >= 400) errs.push(`${size} http ${r.status()}: ` + r.url().slice(0, 120)) })
  return { ctx, page, cdp: phone ? await ctx.newCDPSession(page) : null, errs, phone, size }
}
const shot = (w, name) => w.page.screenshot({ path: `${L.OUT}/${w.size}-${name}.png` })
const say = (w, what, v) => console.log(`${w.size}  ${what}  ${typeof v === 'string' ? v : JSON.stringify(v)}`)

/* the window's place and its lines' look */
const pwGeo = page => page.evaluate(() => {
  const w = document.querySelector('[data-testid="person-window"]'); if (!w) return null
  const r = w.getBoundingClientRect(), bar = document.querySelector('.topbar').getBoundingClientRect().bottom
  const card = document.querySelector('#page-leavewar .mx-outer')?.parentElement?.getBoundingClientRect()
  const lines = [...w.querySelectorAll('[data-testid="pw-list"] .ll-row')]
  const l = lines[0], s = l && getComputedStyle(l)
  const last = lines[lines.length - 1]?.getBoundingClientRect()
  return { box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], bar: Math.round(bar), cardRight: card && card.width ? Math.round(card.right) : null, vh: innerHeight,
    scrollsInside: w.scrollHeight - w.clientHeight, lines: lines.length, lastLineFoot: last && Math.round(last.bottom),
    line: s && { cls: l.className, h: Math.round(l.getBoundingClientRect().height), radius: s.borderTopLeftRadius, barLeft: s.borderLeftWidth, top: s.borderTopWidth + ' ' + s.borderTopColor, margin: s.margin } }
})
const nameInset = (page, sel) => page.evaluate(sel => {
  const nm = document.querySelector(sel); if (!nm) return null
  const rg = document.createRange(); rg.selectNodeContents(nm)
  const b = nm.getBoundingClientRect(), scale = b.width / nm.offsetWidth
  return { textAlign: getComputedStyle(nm).textAlign, fromStart: Math.round(((rg.getBoundingClientRect().left - b.left) / scale - parseFloat(getComputedStyle(nm).paddingLeft)) * 100) / 100 }
}, sel)
/* each read-only figure's baseline beside its amber pending figure's (Ranger's row) */
const baselines = page => page.evaluate(() => {
  const cv = document.createElement('canvas').getContext('2d')
  const base = e => {
    const t = [...e.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()) ?? e.querySelector('*')?.firstChild
    if (!t) return null
    const rg = document.createRange(); rg.selectNodeContents(t); const s = getComputedStyle(t.parentElement)
    cv.font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`
    return Math.round((rg.getBoundingClientRect().bottom - cv.measureText(t.textContent).fontBoundingBoxDescent) * 100) / 100
  }
  const row = document.querySelector('[data-testid="bal-row-bane"]')
  const out = { inputs: row.querySelectorAll('input').length, app: base(row.querySelector('.bp-ro')), lvePend: base(document.querySelector('[data-testid="bal-pend-bane"]')) }
  for (const k of ['CCL', 'PL', 'CL']) { const pd = document.querySelector(`[data-testid="bal-opd-${k}-bane"]`); out[k] = [base(pd.parentElement.querySelector('.bp-ro, input')), base(pd), pd.textContent] }
  return out
})
const dayLine = page => page.evaluate(() => {
  const l = document.querySelector('.ll-row'); if (!l) return null
  const s = getComputedStyle(l)
  return { cls: l.className, puck: !!l.querySelector('.ll-puck'), radius: s.borderTopLeftRadius, barLeft: s.borderLeftWidth, h: Math.round(l.getBoundingClientRect().height) }
})

async function balances(w) { await press(w, T('lw-tab-balances')); await w.page.waitForSelector(T('balances-page'), { state: 'visible' }); await w.page.waitForTimeout(600) }
async function grid(w) { await press(w, T('lw-tab-grid')); await w.page.waitForTimeout(600) }
async function closeWin(w) { await press(w, T('pw-close')); await w.page.waitForTimeout(400) }

for (const size of ['desk', 'hd', 'phone']) {
  const w = await newCtx(size); const P = w.page
  await L.signIn(w, 'admin')
  /* the Balances page, the admin's (D) */
  await balances(w)
  say(w, 'D balances name (admin)', await nameInset(P, '[data-testid="bal-name-bane"] .puck .nm'))
  await shot(w, 'balances-admin')
  /* locked for members, as the drawing m5a-p2-desk-drawn draws the admin's window */
  if ((await P.locator(T('bal-lock')).getAttribute('aria-checked')) !== 'true') { await press(w, T('bal-lock')); await P.waitForTimeout(400) }
  await grid(w)
  say(w, 'D grid name', await nameInset(P, '[data-testid="row-bane"] .whoedit .puck .nm'))
  /* the person window from a name on the grid (A, B) */
  await press(w, '[data-testid="row-bane"] .whoedit'); await P.waitForTimeout(800)
  say(w, 'A/B window from the grid', await pwGeo(P))
  await shot(w, 'window-from-grid')
  await closeWin(w)
  /* … and from My leave (the admin's own, Saber) */
  await press(w, T('my-leave')); await P.waitForTimeout(800)
  say(w, 'A/B window from My leave (admin)', await pwGeo(P))
  await shot(w, 'window-from-myleave-admin')
  await closeWin(w)
  /* the grid's day panel: its line keeps its puck and its look (B must not reach it) */
  await press(w, T('head-2026-01-26')); await P.waitForTimeout(900)
  say(w, 'B day panel line', await dayLine(P))
  await shot(w, 'daypanel')
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  /* the member, Ranger, while locked (E), and his own window from My leave */
  await L.switchTo(w, 'member')
  await balances(w)
  say(w, 'E member locked baselines', await baselines(P))
  say(w, 'D balances name (member)', await nameInset(P, '[data-testid="bal-name-bane"] .puck .nm'))
  await shot(w, 'balances-member-locked')
  await grid(w)
  await press(w, T('my-leave')); await P.waitForTimeout(800)
  say(w, 'A/B window from My leave (member, locked)', await pwGeo(P))
  await shot(w, 'window-from-myleave-member')
  say(w, 'errors', w.errs.length ? w.errs.join(' || ') : 'none')
  await w.ctx.close()
}
await L.closeBrowser()
