// The night of 22–23 Nov 26, job 5 — the drawing check (D1494, D1495): every approved drawing the earlier jobs' scripts did not
// reach, taken on the BUILT app the way its drawing script took it (same engine, size, steps and clip), each state reached with
// the app's own controls (access given on Admin → Users for real, the menu pressed, the row opened, the bell tapped) — nothing
// injected, nothing faked; a state with no road through the controls is written in facts.json as "not reached", never drawn.
// Files are named like the drawing's (img/<name>-<d|p>.png) so compare-job5.mjs can pair them.
// Serve the build first:  npx vite preview --port 4476 --strictPort   then, from raptor-port/:
//   MQ_URL=http://localhost:4476/ MQ_OUT=<a folder outside the checkout> node scripts/handpass/n149/measure-job5.mjs
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

const URL_ = process.env.MQ_URL || 'http://localhost:4476/'
const OUT = process.env.MQ_OUT || 'n149-job5-out'
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launch = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const SIZES = {
  d: { engine: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { engine: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
if (process.env.MQ_B1SIZE) { /* the b1 drawings' own viewports (redraw-b1.mjs: Chromium at 1440x900 and a 390x844 phone) */
  SIZES.d.opts = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }
  SIZES.p = { engine: chromium, opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } }
}
const errs = [], facts = {}, browsers = {}
const setFact = (k, v) => { facts[k] = { ...(facts[k] || {}), ...v } }
async function newCtx(sz) {
  const S = SIZES[sz]
  if (!browsers[sz]) browsers[sz] = await S.engine.launch(S.engine === chromium ? launch : {})
  const ctx = await browsers[sz].newContext(S.opts)
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`[${sz}] PAGEERROR ${e}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  return { ctx, page }
}
const HIDE = '#toastEl { display: none !important; } *{transition:none !important;animation:none !important}'
async function signIn(page, user, pass, css = HIDE) {
  await page.goto(URL_); await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(800)
  await page.addStyleTag({ content: css })
}
async function session(sz, user, pass, css) { const s = await newCtx(sz); await signIn(s.page, user, pass, css); return s }
async function toAdmin(page, cat) {
  await page.evaluate(() => window.go('admin'))
  await page.waitForSelector('#page-admin.on', { state: 'attached' }); await page.waitForTimeout(600)
  const want = cat === 'config' ? '#admConfig' : '#page-admin button.acc-main'
  if (!(await page.locator(want).first().isVisible())) {
    await page.locator('#page-admin button.adm-cat', { hasText: cat === 'config' ? 'Squadron config' : 'Users' }).first().click(); await page.waitForTimeout(600)
  }
}
async function openRow(page, cs) {
  if (!(await page.locator('#page-admin button.acc-main', { hasText: new RegExp('^' + cs) }).count())) { await page.fill('#accFind', cs); await page.waitForTimeout(500) }
  await page.locator('#page-admin button.acc-main', { hasText: new RegExp('^' + cs) }).first().click()
  await page.waitForSelector('#page-admin .acc-edit'); await page.waitForTimeout(400)
}
async function openBell(page) {
  await page.locator('.bellbtn:visible').first().click()
  await page.waitForSelector('[data-testid="bell-list"]'); await page.waitForTimeout(500)
}
const lineBtn = (page, n, v) => page.click(`#page-admin [aria-label="Access to ${n}"] button[data-line="${v}"]`)
/* the app's own way: Saber opens Hunter, picks the line, Save — kept in the browser, the page reloaded for the next sign-in */
async function giveHunter(page, line, n = '149') {
  await toAdmin(page, 'users'); await openRow(page, 'Hunter')
  await lineBtn(page, n, line); await page.click('#accEdSave'); await page.waitForTimeout(600)
}
async function neutral(page) {
  await page.mouse.move(1, 1).catch(() => {})
  await page.evaluate(() => { const a = document.activeElement; a && a.blur && a.blur() })
  await page.waitForTimeout(200)
}
/* the whole opened row (draw-roles.mjs shot): desktop the row ±40, phone the screen */
async function rowShot(page, sz, file) {
  await neutral(page)
  await page.evaluate(() => document.querySelector('#page-admin .acc-row.od-row-on').scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(250)
  const r = await page.evaluate(() => { const b = document.querySelector('#page-admin .acc-row.od-row-on').getBoundingClientRect(); return { L: b.left, T: b.top + scrollY, R: b.right, B: b.bottom + scrollY, W: innerWidth } })
  const pad = sz === 'd' ? 40 : 12
  const y = Math.max(0, r.T - pad), x = sz === 'd' ? Math.max(0, r.L - pad) : 0
  const clip = { x, y, width: sz === 'd' ? r.R - r.L + 2 * pad : r.W, height: r.B - r.T + 2 * pad }
  if (sz === 'p') { await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200) }
  await page.screenshot({ path: `${OUT}/${file}`, clip, fullPage: true })
  return clip
}
/* draw-row.mjs shot (rB*): desktop the row ±40 as it sits, phone the screen */
async function rowShotB(page, sz, file) {
  await page.mouse.move(1, 1).catch(() => {})
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur())
  await page.waitForTimeout(150)
  let clip
  if (sz === 'd') {
    const r = await page.evaluate(() => { const b = document.querySelector('#page-admin .acc-row.od-row-on').getBoundingClientRect(); return { L: b.left, T: b.top, R: b.right, B: b.bottom } })
    clip = { x: r.L - 40, y: r.T - 40, width: r.R - r.L + 80, height: r.B - r.T + 80 }
  }
  await page.screenshot({ path: `${OUT}/${file}`, ...(clip ? { clip } : {}) })
  return clip
}
async function openRowCentre(page, cs) {
  await openRow(page, cs)
  await page.evaluate(() => { document.querySelector('#page-admin .acc-edit').closest('.acc-row').scrollIntoView({ block: 'center' }) })
  await page.waitForTimeout(400)
}
async function shotSels(page, file, sels, pad = 24) {
  await neutral(page)
  let clip
  if (sels) {
    const r = await page.evaluate(sels => {
      let L = 1e9, T = 1e9, R = -1e9, B = -1e9
      for (const s of sels) for (const e of document.querySelectorAll(s)) {
        const b = e.getBoundingClientRect(); if (!(b.width > 0)) continue
        L = Math.min(L, b.left); T = Math.min(T, b.top); R = Math.max(R, b.right); B = Math.max(B, b.bottom)
      }
      return L < 1e9 ? { L, T, R, B, W: innerWidth, H: innerHeight } : null
    }, sels)
    if (!r) throw new Error(file + ': nothing to frame')
    const x = Math.max(0, r.L - pad), y = Math.max(0, r.T - pad)
    clip = { x, y, width: Math.min(r.W, r.R + pad) - x, height: Math.min(r.H, r.B + pad) - y }
  }
  await page.screenshot({ path: `${OUT}/${file}`, ...(clip ? { clip } : {}) })
  return clip
}
const rects = (page, sels) => page.evaluate(sels => Object.fromEntries(sels.map(s => {
  const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0) || document.querySelector(s); if (!e) return [s, null]
  const b = e.getBoundingClientRect(), cs = getComputedStyle(e)
  return [s, { x: +b.left.toFixed(1), y: +b.top.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), font: cs.fontSize, text: (e.textContent || '').trim().slice(0, 100) }]
})), sels)
const job = (name, fn) => async sz => {
  if (ONLY && !ONLY.includes(name)) return
  try { await fn(sz) } catch (e) { errs.push(`[${sz}] ${name} FAILED: ${e.message.split('\n')[0]}`); setFact(`${name}-${sz}`, { notReached: e.message.split('\n')[0] }) }
}

/* ---- the Schedules menu: mA1, mA2, b1-1 ---- */
const menuShot = async (page, sz, file, min) => {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator('#sqnMenuBtn:visible').first().click(); await page.waitForSelector('#sqnMenu'); await page.waitForTimeout(300)
  await page.mouse.move(Math.round(page.viewportSize().width / 2), page.viewportSize().height - 2); await page.waitForTimeout(250)
  const m = await page.evaluate(() => { const b = document.querySelector('#sqnMenu').getBoundingClientRect(); return { l: b.left, t: b.top, w: b.width, h: b.height, bottom: b.bottom } })
  const vp = page.viewportSize()
  const clip = sz === 'd' ? { x: 0, y: 0, width: min.w ?? 720, height: Math.min(vp.height, Math.max(min.h ?? 0, m.bottom + (min.dd ?? 48))) } : { x: 0, y: 0, width: Math.min(vp.width, min.pw ?? vp.width), height: Math.min(vp.height, m.bottom + (min.pd ?? 90)) }
  await page.screenshot({ path: `${OUT}/${file}`, clip })
  return { m, rows: await page.$$eval('#sqnMenu .sqm-row', rs => rs.map(r => ({ h: +r.getBoundingClientRect().height.toFixed(1), t: r.textContent.trim() }))), head: await rects(page, ['.sqm-head', '#sqnMenuBtn', '.topbar .mark']) }
}

const JOBS = {
  mA1: job('mA1', async sz => {
    const { ctx, page } = await session(sz, 'ad', 'a'); await giveHunter(page, 'view'); await page.reload(); await signIn(page, 'ad2', 'a2')
    await page.evaluate(() => window.go('editsched')); await page.waitForSelector('#page-editsched.on .day', { state: 'attached' }); await page.waitForTimeout(1200)
    setFact(`mA1-${sz}`, await menuShot(page, sz, `mA1-${sz}.png`, {})); await ctx.close()
  }),
  mA2: job('mA2', async sz => {
    const { ctx, page } = await session(sz, 'ad', 'a'); await giveHunter(page, 'view'); await page.reload(); await signIn(page, 'ad2', 'a2')
    await page.locator('#sqnMenuBtn:visible').first().click(); await page.waitForTimeout(250)
    await page.locator('#sqnMenu .sqm-row', { hasText: '149' }).first().click(); await page.waitForTimeout(700)
    await page.evaluate(() => window.go('viewsched')); await page.waitForSelector('#page-viewsched.on .day', { state: 'attached', timeout: 20000 }); await page.waitForTimeout(1200)
    setFact(`mA2-${sz}`, await menuShot(page, sz, `mA2-${sz}.png`, {})); await ctx.close()
  }),
  'b1-1': job('b1-1', async sz => {
    const { ctx, page } = await session(sz, 'ad', 'a')
    await page.evaluate(() => window.go('editsched')); await page.waitForSelector('#page-editsched.on #eWeek .day'); await page.waitForTimeout(900)
    setFact(`b1-1-${sz}`, await menuShot(page, sz, `b1-1-${sz}.png`, { w: 720, h: 300, dd: 40, pw: 390, pd: 90 })); await ctx.close()
  }),
}

/* ---- a person's opened row, design B: rB1–rB4; the roles fold: k1, k3–k5 ---- */
const pickRB = async (page, sz, who, open, steps, file, shotFn) => {
  const { ctx, page: pg } = who
  await toAdmin(pg, 'users'); await openRowCentre(pg, open)
  for (const s of steps) await s(pg)
  await pg.waitForTimeout(200)
  setFact(file.replace('.png', ''), { lines: await pg.$$eval('#page-admin .acc-row.od-row-on [aria-label^="Access to"]', gs => gs.map(g => ({ l: g.getAttribute('aria-label'), on: [...g.querySelectorAll('button')].map(b => b.textContent + (b.classList.contains('primary') ? '*' : '') + (b.disabled ? '(off)' : '')).join(' ') }))),
    edit: await rects(pg, ['#page-admin .acc-row.od-row-on', '#page-admin .acc-edit', '#accEdRole', '[data-testid="acc-sq"]', '[data-testid="acc-roles"]']), notes: await pg.$$eval('#page-admin .acc-edit .adm-note', ns => ns.map(n => n.textContent)) })
  await shotFn(pg, sz, file); await ctx.close()
}
const rb = (name, user, pass, open, steps, setup) => job(name, async sz => {
  const w = await session(sz, user, pass)
  if (setup) await setup(w.page)
  await pickRB(w.page, sz, w, open, steps, `${name}-${sz}.png`, (pg, z, f) => rowShotB(pg, z, f))
})
const kk = (name, user, pass, open, steps, fold, extra = 0) => job(name, async sz => {
  const w = await session(sz, user, pass)
  for (let n = 150; n < 150 + extra; n++) await w.page.evaluate(x => window.raptorAddUnit(String(x), 'acad2'), n)
  await pickRB(w.page, sz, w, open, [...steps, async p => { if (fold) { await p.locator('[data-testid="acc-roles"] summary').click(); await p.waitForTimeout(200) } }], `${name}-${sz}.png`, (pg, z, f) => rowShot(pg, z, f))
})
JOBS.rB1 = rb('rB1', 'ad', 'a', 'Hunter', [p => lineBtn(p, '149', 'plan')])
JOBS.rB2 = rb('rB2', 'ad9', 'a9', 'Ranger', [p => lineBtn(p, '149', 'view')])
JOBS.rB3 = rb('rB3', 'ad', 'a', 'Hunter', [p => p.selectOption('#accEdRole', 'master')])
JOBS.rB4 = rb('rB4', 'ad2', 'a2', 'Ranger', [])
JOBS.k1 = kk('k1', 'ad', 'a', 'Hunter', [p => lineBtn(p, '149', 'plan'), p => lineBtn(p, '150', 'view')], false, 1)
JOBS.k3 = kk('k3', 'ad9', 'a9', 'Ranger', [p => lineBtn(p, '149', 'view')], true)
JOBS.k4 = kk('k4', 'ad', 'a', 'Hunter', [p => p.selectOption('#accEdRole', 'master')], false, 1)
JOBS.k5 = kk('k5', 'ad2', 'a2', 'Ranger', [], false)
JOBS.f4 = job('f4', async sz => {
  const w = await session(sz, 'ad2', 'a2'); await toAdmin(w.page, 'users'); await openRow(w.page, 'Ace')
  setFact(`f4-${sz}`, { signin: await w.page.locator('#accGiveName').count(), lines: await w.page.$$eval('#page-admin .acc-row.od-row-on [aria-label^="Access to"]', gs => gs.map(g => [...g.querySelectorAll('button')].map(b => b.textContent + (b.disabled ? '(off)' : '')).join(' '))), notes: await w.page.$$eval('#page-admin .acc-edit .adm-note', ns => ns.map(n => n.textContent)) })
  await rowShot(w.page, sz, `f4-${sz}.png`); await w.ctx.close()
})

/* ---- the old filter row (n1a, n1b, n1c0): superseded by the Filter button (nf*) — the build's nearest state, the drawing's clip ---- */
const tick = async (page, k) => {
  if (!(await page.locator('#accFilterPanel').count())) await page.click('#accFilter')
  await page.click(`#accFilterPanel [data-ftick="${k}"]`); await page.waitForTimeout(150)
}
const n1clip = (sz, n) => sz === 'd' ? ['#page-admin .od-head', `#accList > .acc-row:nth-child(-n+${n})`] : null
JOBS.n1a = job('n1a', async sz => { const w = await session(sz, 'ad2', 'a2'); await toAdmin(w.page, 'users'); await shotSels(w.page, `n1a-${sz}.png`, n1clip(sz, 5)); await w.ctx.close() })
JOBS.n1b = job('n1b', async sz => {
  const w = await session(sz, 'ad2', 'a2'); await toAdmin(w.page, 'users'); await tick(w.page, 'seat:Pilots'); await tick(w.page, 'role:admin'); await w.page.keyboard.press('Escape'); await w.page.waitForTimeout(200)
  await shotSels(w.page, `n1b-${sz}.png`, sz === 'd' ? ['#page-admin .od-head', '#accList'] : null); await w.ctx.close()
})
JOBS.n1c0 = job('n1c0', async sz => {
  const w = await session(sz, 'ad', 'a'); await toAdmin(w.page, 'users'); await tick(w.page, 'sqn:u142'); await tick(w.page, 'sqn:u149'); await w.page.keyboard.press('Escape'); await w.page.waitForTimeout(200)
  await w.page.evaluate(() => window.scrollTo(0, 0)); await shotSels(w.page, `n1c0-${sz}.png`, n1clip(sz, 3)); await w.ctx.close()
})

/* ---- "· also plans 149": p2a (Saber's list), p2b (Kestrel's list) ---- */
const hunterRowShot = async (page, sz, file) => {
  await page.evaluate(() => { const r = [...document.querySelectorAll('#page-admin .acc-row.od-row')].find(r => /^Hunter/.test(r.querySelector('.acc-name')?.textContent || '')); if (!r) throw new Error('no Hunter row on this list'); r.scrollIntoView({ block: 'center' }); r.setAttribute('data-mqshot', '1') })
  await page.waitForTimeout(300)
  setFact(file.replace('.png', ''), await rects(page, ['[data-mqshot]', '[data-mqshot] .acc-name', '[data-mqshot] .acc-sub']))
  await shotSels(page, file, sz === 'd' ? ['[data-mqshot]'] : null, 30)
}
JOBS.p2a = job('p2a', async sz => {
  const w = await session(sz, 'ad', 'a'); await giveHunter(w.page, 'plan'); await toAdmin(w.page, 'users'); await hunterRowShot(w.page, sz, `p2a-${sz}.png`); await w.ctx.close()
})
JOBS.p2b = job('p2b', async sz => {
  if (sz === 'p') return
  const w = await session(sz, 'ad', 'a'); await giveHunter(w.page, 'plan'); await w.page.reload(); await signIn(w.page, 'ad9', 'a9')
  await toAdmin(w.page, 'users'); await hunterRowShot(w.page, sz, `p2b-${sz}.png`); await w.ctx.close()
})

/* ---- Squadron config following the schedule in view: f1a (149 picked, View of 149), f1b (142) ---- */
JOBS.f1a = job('f1a', async sz => {
  const w = await session(sz, 'ad', 'a'); await giveHunter(w.page, 'view'); await w.page.reload(); await signIn(w.page, 'ad2', 'a2')
  await w.page.locator('#sqnMenuBtn:visible').first().click(); await w.page.waitForTimeout(250)
  await w.page.locator('#sqnMenu .sqm-row', { hasText: '149' }).first().click(); await w.page.waitForTimeout(700)
  await toAdmin(w.page, 'config')
  await w.page.evaluate(() => { document.querySelector('#admConfig').closest('.adm-pane').setAttribute('data-mqshot', '1'); window.scrollTo(0, 0) })
  setFact(`f1a-${sz}`, { bar: await w.page.evaluate(() => { const k = document.querySelector('.topbar .mark .k'); return k ? k.textContent.trim() : null }), ...(await rects(w.page, ['.adm-pane-head h3', '#admConfig .adm-note', '[data-mqshot]'])), disabled: await w.page.$$eval('#admConfig button, #admConfig input, #admConfig select, #admConfig textarea', cs => cs.filter(c => c.disabled).length) })
  await shotSels(w.page, `f1a-${sz}.png`, sz === 'd' ? ['[data-mqshot]'] : null, 16); await w.ctx.close()
})
JOBS.f1b = job('f1b', async sz => {
  const w = await session(sz, 'ad2', 'a2'); await toAdmin(w.page, 'config')
  await w.page.evaluate(() => { document.querySelector('#admConfig').closest('.adm-pane').setAttribute('data-mqshot', '1'); window.scrollTo(0, 0) })
  setFact(`f1b-${sz}`, await rects(w.page, ['.adm-pane-head h3', '[data-mqshot]']))
  await shotSels(w.page, `f1b-${sz}.png`, sz === 'd' ? ['[data-mqshot]'] : null, 16); await w.ctx.close()
})

/* ---- his own bell: n3 (Plan of 149 given), f3a (seven changes) ---- */
const bellShot = async (page, sz, file) => shotSels(page, file, sz === 'd' ? ['[data-testid="bell-list"]', '.bellbtn'] : null, 16)
const linesOf = page => page.$$eval('[data-testid="bell-list"] .bl-line', ls => ls.map(l => l.innerText.replace(/\s+/g, ' ').trim()))
JOBS.n3 = job('n3', async sz => {
  const w = await session(sz, 'ad', 'a'); await giveHunter(w.page, 'plan'); await w.page.reload(); await signIn(w.page, 'ad2', 'a2'); await openBell(w.page)
  setFact(`n3-${sz}`, { lines: await linesOf(w.page), list: await rects(w.page, ['[data-testid="bell-list"]', '[data-testid="bell-list"] .bl-line']) })
  await bellShot(w.page, sz, `n3-${sz}.png`); await w.ctx.close()
})
JOBS.f3a = job('f3a', async sz => {
  const w = await session(sz, 'ad', 'a'); const p = w.page
  const save = async () => { await p.click('#accEdSave'); await p.waitForTimeout(500) }
  const open = async () => { await toAdmin(p, 'users'); await openRow(p, 'Hunter') }
  await open(); await p.selectOption('#accEdRole', 'main'); await save()            // made a member
  await open(); await p.selectOption('#accEdRole', 'admin'); await save()           // made an admin
  await open(); await p.click('#accEdOnOff'); await p.waitForTimeout(500)           // suspended
  await open(); await p.click('#accEdOnOff'); await p.waitForTimeout(500)           // enabled
  await open(); await lineBtn(p, '149', 'view'); await save()                       // View given
  await open(); await lineBtn(p, '149', 'none'); await save()                       // View ended
  await open(); await lineBtn(p, '149', 'plan'); await save()                       // Plan given
  await p.reload(); await signIn(p, 'ad2', 'a2'); await openBell(p)
  setFact(`f3a-${sz}`, { lines: await linesOf(p), list: await rects(p, ['[data-testid="bell-list"]']) })
  await bellShot(p, sz, `f3a-${sz}.png`); await w.ctx.close()
})

/* ---- eight squadrons, the Schedules menu (f5d, phone only) ---- */
JOBS.f5d = job('f5d', async sz => {
  if (sz !== 'p') return
  const w = await session(sz, 'ad', 'a')
  for (let n = 150; n <= 155; n++) await w.page.evaluate(x => window.raptorAddUnit(String(x), 'acad2'), n)
  await w.page.evaluate(() => window.go('editsched')); await w.page.waitForSelector('#page-editsched.on .day', { state: 'attached' }); await w.page.waitForTimeout(1200)
  setFact('f5d-p', await menuShot(w.page, 'p', 'f5d-p.png', {})); await w.ctx.close()
})

/* ---- Add-person / row / holiday: b1-6, b1-8 ---- */
JOBS['b1-6'] = job('b1-6', async sz => {
  const w = await session(sz, 'ad', 'a'); await toAdmin(w.page, 'users')
  const hex = w.page.locator('#page-admin button.acc-main', { hasText: /^Hex/ }).first(); await hex.evaluate(e => e.scrollIntoView({ block: 'center' })); await hex.click()
  await w.page.waitForSelector('#accEdSave'); await w.page.waitForTimeout(400)
  setFact(`b1-6-${sz}`, { fields: await w.page.$$eval('#page-admin .acc-edit .mfield label', ls => ls.map(l => l.textContent)), home: await w.page.$$eval('#page-admin .acc-edit *', es => es.filter(e => !e.children.length && /Home squadron/.test(e.textContent)).map(e => e.className + '|' + e.textContent)) })
  await w.page.evaluate(() => document.querySelector('#page-admin .acc-row.od-row-on').scrollIntoView({ block: 'center' })); await w.page.waitForTimeout(250)
  await shotSels(w.page, `b1-6-${sz}.png`, ['#page-admin .acc-row.od-row-on'], 14); await w.ctx.close()
})
JOBS['b1-8'] = job('b1-8', async sz => {
  const w = await session(sz, 'ad9', 'a9'); const page = w.page
  await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await page.waitForTimeout(800)
  await page.locator('[data-testid="settings-open"]').filter({ visible: true }).first().click()
  await page.locator('[data-testid="settings-days"]').filter({ visible: true }).first().click()
  await page.waitForSelector('[data-testid="win-days"]')
  if (await page.locator('[data-testid="days-tabs"]').filter({ visible: true }).count()) await page.locator('[data-testid="days-tab-holidays"]').filter({ visible: true }).first().click()
  await page.locator('[data-testid="hol-add"]').filter({ visible: true }).first().click()
  await page.waitForSelector('[data-testid="win-holiday"]'); await page.waitForTimeout(500)
  for (let i = 0; i < 12; i++) { if ((await page.locator('[data-testid="holcal"]').getAttribute('data-month')) === '2026-08') break; await page.locator('[data-testid="holcal-prev"]').click(); await page.waitForTimeout(120) }
  await page.locator('[data-testid="holcal-day-2026-08-07"]').click(); await page.waitForTimeout(400)
  setFact(`b1-8-${sz}`, { text: await page.evaluate(() => document.querySelector('[data-testid="win-holiday"]').innerText.replace(/\s+/g, ' ').slice(0, 900)), bar: await page.textContent('.topbar .mark .k').catch(() => null) })
  const clip = await page.evaluate(() => { const r = document.querySelector('[data-testid="win-holiday"]').getBoundingClientRect(), pad = 10; const x = Math.max(0, r.left - pad), y = Math.max(0, r.top - pad); return { x, y, width: Math.min(innerWidth - x, r.width + 2 * pad), height: Math.min(innerHeight - y, r.height + 2 * pad) } })
  await page.screenshot({ path: `${OUT}/b1-8-${sz}.png`, clip }); await w.ctx.close()
})

/* ---- toasts and the Undo bubble: f8, f9, f10 (the toast kept on screen) ---- */
const TOAST = '#toastEl { opacity: 1 !important; transition: none !important; } *{animation:none !important}'
const setv = (page, sel, v) => page.evaluate(([sel, v]) => { const e = document.querySelector(sel); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })) }, [sel, v])
const toastText = page => page.evaluate(() => { const t = document.querySelector('#toastEl'); const b = t && t.getBoundingClientRect(); return t && b.width > 0 ? t.textContent : null })
/* a newcomer asks to join 149 on the Request access card (the squadron choice), signs out */
async function newcomerAsks(page, who) {
  await page.goto(URL_); await page.waitForSelector('#luser'); await page.addStyleTag({ content: TOAST })
  await setv(page, '#luser', who); await setv(page, '#lpass', who)
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#accCs', { timeout: 15000 })
  const sq = page.locator('#accSqn'); if (await sq.count()) { const o = await sq.evaluate(s => [...s.options].map(o => o.value + '=' + o.textContent)); await sq.selectOption({ label: '149' }).catch(() => {}); setFact('newcomer', { sqnOptions: o }) }
  await setv(page, '#accCs', 'Jett'); await setv(page, '#accIni', 'JT')
  const seat = await page.evaluate(() => [...document.querySelector('#accSeat').options].map(o => o.value).find(v => v && v !== 'GND')); await page.selectOption('#accSeat', seat)
  const cat = await page.evaluate(() => [...document.querySelector('#accCat').options].map(o => o.value).find(v => v)); await page.selectOption('#accCat', cat)
  await page.click('#accSend'); await page.waitForTimeout(700)
  await page.locator('button:visible', { hasText: /^Sign out$/ }).first().click(); await page.waitForSelector('#luser', { timeout: 15000 }); await page.waitForTimeout(800)
}
JOBS.f9 = job('f9', async sz => {
  const { ctx, page } = await newCtx(sz); await signIn(page, 'ad', 'a', TOAST); await giveHunter(page, 'plan')
  await page.reload(); await page.waitForSelector('#luser'); await page.waitForTimeout(600)
  await newcomerAsks(page, 'jett')
  await setv(page, '#luser', 'ad2'); await setv(page, '#lpass', 'a2'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(800); await page.addStyleTag({ content: TOAST })
  await page.locator('.bellbtn:visible').first().click(); await page.waitForTimeout(600)
  setFact(`f9-${sz}`, { toast: await toastText(page), onUsers: await page.evaluate(() => !!document.querySelector('#page-admin.on #admUsers.on')), bar: await page.textContent('.topbar .mark .k').catch(() => null) })
  await neutral(page); await page.screenshot({ path: `${OUT}/f9-${sz}.png` }); await ctx.close()
})
JOBS.f8 = job('f8', async sz => {
  const { ctx, page } = await newCtx(sz); await newcomerAsks(page, 'jett')
  await setv(page, '#luser', 'ad2'); await setv(page, '#lpass', 'a2'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(800); await page.addStyleTag({ content: TOAST })
  await toAdmin(page, 'users'); await openRow(page, 'Ace')
  await page.fill('#accGiveName', 'jett'); await page.click('#accGive'); await page.waitForTimeout(500)
  const said = await toastText(page)
  await page.evaluate(() => document.querySelector('#page-admin .acc-row.od-row-on').scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
  setFact(`f8-${sz}`, { toast: said, toastRect: await rects(page, ['#toastEl']) })
  await page.evaluate(() => { document.querySelector('#toastEl').setAttribute('data-mqshot', '1'); document.querySelector('#page-admin .acc-row.od-row-on').setAttribute('data-mqshot', '1') })
  await shotSels(page, `f8-${sz}.png`, sz === 'd' ? ['[data-mqshot]'] : null, 24); await ctx.close()
})
JOBS.f10 = job('f10', async sz => {
  const { ctx, page } = await session(sz, 'ad', 'a', TOAST); await giveHunter(page, 'plan')
  await page.locator('#undoBtn:visible').first().click(); await page.waitForTimeout(500)
  const said = await toastText(page)
  await page.evaluate(() => { const h = [...document.querySelectorAll('#page-admin .acc-row')].find(r => /^Hunter/.test(r.querySelector('.acc-name')?.textContent || '')); if (h) h.scrollIntoView({ block: 'center' }) })
  await page.waitForTimeout(250)
  setFact(`f10-${sz}`, { toast: said, title: await page.locator('#undoBtn:visible').first().getAttribute('title') })
  await neutral(page); await page.screenshot({ path: `${OUT}/f10-${sz}.png` }); await ctx.close()
})

/* ---- states with no road through the app's controls ---- */
for (const [k, why] of [['p5', 'a sign-in held while the last change saves needs the saver to be mid-save (storage/savewait.ts postman): this build runs with no server saver, so the card can never be held'],
  ['f6a', 'the card after the owed reload needs the same held save'], ['f6b', 'a refused save while the sign-in is held — needs a saver that fails'],
  ['p8', 'the amber "posting could not run" line needs the posting runner to give a posting up (PO_REFUSED / a hold that is not the last-admin lock) — no control makes it'],
  ['p10', 'the bell line "Posting out could not run" is rung by the same runner failure'],
  ['f3b', 'its four lines are written by the app itself (a move at midnight, an archive, an Overseas suspension) — no control makes them on demand']]) {
  for (const sz of ['d', 'p']) setFact(`${k}-${sz}`, { notReached: why })
}

for (const sz of ['p', 'd']) {
  for (const [name, fn] of Object.entries(JOBS)) { console.log(sz, name); await fn(sz) }
}
for (const b of Object.values(browsers)) await b.close()
writeFileSync(`${OUT}/facts5${process.env.MQ_B1SIZE ? '-b1size' : ''}.json`, JSON.stringify(facts, null, 1))
console.log('errors:', errs.length ? '\n' + errs.join('\n') : 'none')
