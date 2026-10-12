// THE BELL'S LIST OF NOTICES, AS BUILT (the one-rule plan's step 7 — owner D755 (3), D760, D769; 12 Oct 26). NOTHING IS
// INJECTED. By real presses, in ONE page life (a fresh demo store keeps nothing across a reload):
//   as Saber (ad / a)   — the bell before anything ("Nothing new"); "Range brief" (Training, 09:00–10:00) filed for Ranger
//                         and Hex on Wed 15 Jul 2026; cancelled on the Scheduler Board, reason WX; re-timed to 10:00–11:00
//                         in its own window;
//   as Ranger (us / us) — the bell lit; a tap: the list (the input in bold with its date, what happened and who, its age);
//                         a tap on a line: the input's window, that line read; "Mark all read": the bell dark;
//                         then HE files "Standby brief" (Duty) for Saber;
//   as Saber again      — on the Scheduler Board: the board's own bell lit, its list hung under it.
// Phone (iPhone 13) and desktop (1440x900), twice the pixels. What each step read is printed.
//
//   npm run build && npx vite preview --port 4186 --strictPort
//   node scripts/handpass/onerule-step7-look.mjs [out dir]        (default docs/handpass/2026-10-12-one-rule-step7)
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = process.argv[2] || 'docs/handpass/2026-10-12-one-rule-step7'
const URL = process.env.LOOK_URL || 'http://localhost:4186/'
mkdirSync(OUT, { recursive: true })
const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  phone: { ...devices['iPhone 13'], deviceScaleFactor: 2 },
}
const DAY = '2026-07-15', DI = 2
const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

const browser = await chromium.launch(launchOptions)
for (const size of Object.keys(SIZES)) {
  const ctx = await browser.newContext(SIZES[size])
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  const press = loc => (size === 'desk' ? loc.click() : loc.tap())
  const VW = SIZES[size].viewport.width, VH = SIZES[size].viewport.height
  const file = name => join(OUT, `${name}-${size}.png`)
  const say = (step, what) => console.log(`${size} ${step}: ${what}`)
  const note = async () => (await page.locator('#toastEl').innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
  const quiet = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
  const loud = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = '' })
  const clip = async (name, box, pad = [10, 10, 10, 10]) => {
    const x = Math.max(0, box.x - pad[3]), y = Math.max(0, box.y - pad[0])
    const w = Math.min(VW, box.x + box.width + pad[1]) - x, h = Math.min(VH, box.y + box.height + pad[2]) - y
    await page.screenshot({ path: file(name), clip: { x, y, width: w, height: h } })
  }
  const signIn = async (u, p) => {
    await page.fill('#luser', u); await page.fill('#lpass', p)
    await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day')
  }
  const signOut = async () => {
    /* on a phone the Logout button is in the drawer */
    const b = page.locator('#logout:visible').first()
    if (await b.count()) await press(b)
    else { await page.evaluate(() => document.getElementById('logout').click()) }
    await page.waitForSelector('#loginForm', { timeout: 6000 })
  }
  /* the bell a person can press: the Scheduler Board's own while the board is up (it covers the top bar's), else the top bar's */
  const bellSel = async () => ((await page.locator('#sbBell').isVisible().catch(() => false)) ? '#sbBell' : '#notifyBell')
  const bell = async () => page.locator(await bellSel())
  const bellState = async () => page.evaluate(sel => { const b = document.querySelector(sel); return b ? { id: b.id, lit: b.classList.contains('on'), open: b.getAttribute('aria-expanded') } : null }, await bellSel())
  const listFacts = () => page.evaluate(() => {
    const l = document.querySelector('.bell-list'); if (!l) return null
    const open = document.querySelector('.bellbtn[aria-expanded="true"]') || document.querySelector('.bellbtn')
    const r = l.getBoundingClientRect(), b = open.getBoundingClientRect()
    return { box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, underBell: Math.round(r.y - b.bottom), rightEdge: Math.round(b.right - r.right), inView: r.x >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
      empty: (l.querySelector('.bl-empty') || {}).textContent || null, markAll: !!l.querySelector('[data-testid="bell-markall"]'),
      lines: [...l.querySelectorAll('.bl-line')].map(e => ({ unread: e.classList.contains('unread'), name: e.querySelector('.bl-name').textContent, bold: getComputedStyle(e.querySelector('.bl-name')).fontWeight, day: e.querySelector('.bl-day').textContent, what: e.querySelector('.bl-what').textContent, ago: e.querySelector('.bl-ago').textContent, h: Math.round(e.getBoundingClientRect().height), cut: e.querySelector('.bl-what').scrollWidth > e.querySelector('.bl-what').clientWidth + 1 })) }
  })
  const shotList = async name => {
    await quiet()
    const f = await listFacts()
    say(name, JSON.stringify(f))
    await page.screenshot({ path: file(name + '-full') })
    if (f) await clip(name, { x: f.box.x, y: f.box.y, width: f.box.w, height: f.box.h }, [70, 14, 40, 14])
    await loud()
    return f
  }
  const toMonth = async () => {
    await page.evaluate(() => window.go('inputs'))
    await page.locator('#inpCal').waitFor()
    if (await page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(page.locator('#inCalBtn'))
    const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MON.findIndex(x => x.startsWith(m)) }
    let d = 2026 * 12 + 6 - await at()
    for (; d > 0; d--) await press(page.locator('#icNext'))
    for (; d < 0; d++) await press(page.locator('#icPrev'))
    await page.waitForSelector(`[data-icday="${DAY}"]`)
  }
  const openDay = async () => {
    await page.locator(`[data-icday="${DAY}"]`).focus()
    await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid="win-inputsday"]')
    await page.waitForTimeout(350)
  }
  const closeDay = async () => { const x = page.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await press(x); await page.waitForTimeout(250) } }
  const fileIt = async (title, pick, from, to, kind) => {
    await toMonth(); await openDay()
    await press(page.locator('#icPopAdd'))
    await page.waitForSelector('#inpEditPop [data-testid="pp-several"]')
    if (kind) await page.locator('#inpEditPop #inpEditType').selectOption(kind).catch(() => {})
    await press(page.locator('#inpEditPop [data-testid="pp-several"]'))
    for (const p of pick) if (await page.locator(`#inpEditPop [data-pp="${p}"]`).getAttribute('aria-pressed') !== 'true') await press(page.locator(`#inpEditPop [data-pp="${p}"]`))
    const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
    for (const id of lit) if (!pick.includes(id)) await press(page.locator(`#inpEditPop [data-pp="${id}"]`))
    await page.locator('#inpEditPop #inpEditOwnTitle').first().fill(title)
    await page.locator('#inpEditPop #inpEditStart').fill(from)
    await page.locator('#inpEditPop #inpEditEnd').fill(to)
    await press(page.locator('#inpEditSave'))
    await page.waitForTimeout(600)
    const r = await page.evaluate(t => { const r = window.INPUTS.find(x => x.title === t); return r ? { iid: r.iid, people: (r.people || []).map(e => e.p), by: r.by } : null }, title)
    say('filed ' + title, JSON.stringify(r) + ' — ' + await note())
    /* an OIL question the save may raise is not this look's: closed unanswered */
    const oc = page.locator('#oilConfirmClose, [data-testid="oil-close"]').first(); if (await oc.count()) await press(oc).catch(() => {})
    await closeDay()
    return r
  }

  await page.goto(URL + '?fresh=1')
  await signIn('ad', 'a')

  /* 0 — the bell before anything: what a tap does on a fresh demo, as Saber */
  say('bell at the start', JSON.stringify(await bellState()))
  await press(await bell()); await page.waitForTimeout(350)
  say('first tap', JSON.stringify(await bellState()) + ' — ' + await note())
  if (await page.locator('.bell-list').count()) { await shotList('00-nothing-new'); await press(await bell()); await page.waitForTimeout(200) }

  /* 1 — Saber files, cancels, re-times */
  const r = await fileIt('Range brief', ['bane', 'rocky'], '09:00', '10:00')
  if (!r) { say('STOP', 'the input was not filed'); await ctx.close(); continue }
  await page.evaluate(() => window.go('editsched'))
  await page.locator('#eWeek .day').first().waitFor()
  const ri = await page.evaluate(([di, id]) => (window.DAYS[di].ground || []).findIndex(g => g.src === id), [DI, r.iid])
  const d = page.locator(`#eWeek [data-sbday="${DI}"]:visible`).first()
  await d.scrollIntoViewIfNeeded(); await press(d)
  await page.waitForSelector('#schedBoard', { timeout: 5000 })
  const cx = page.locator(`#schedBoard [data-grcx="${DI}.${ri}"]`).first()
  await cx.scrollIntoViewIfNeeded(); await press(cx)
  await page.waitForSelector('#cxSave', { timeout: 4000 })
  const q = page.locator('#cxQuick [data-cxq="WX"]').first()
  if (await q.count()) await press(q); else await page.locator('#cxReason').fill('WX')
  await press(page.locator('#cxSave')); await page.waitForTimeout(500)
  await press(page.locator('#sbDone')); await page.waitForTimeout(500)
  say('cancelled', JSON.stringify(await page.evaluate(id => { const x = window.INPUTS.find(i => i.iid === id); return { cx: x.cx, cxr: x.cxr } }, r.iid)))
  await page.waitForTimeout(1200)
  await toMonth(); await openDay()
  await press(page.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${r.iid}"]`).first())
  await page.waitForSelector('#inpEditPop #inpEditStart')
  await page.locator('#inpEditPop #inpEditStart').fill('10:00'); await page.locator('#inpEditPop #inpEditEnd').fill('11:00')
  await press(page.locator('#inpEditSave')); await page.waitForTimeout(600)
  say('re-timed', JSON.stringify(await page.evaluate(id => { const x = window.INPUTS.find(i => i.iid === id); return { s: x.s, e: x.e } }, r.iid)) + ' — ' + await note())
  await closeDay()
  say('Saber\'s own bell after his own changes', JSON.stringify(await bellState()))
  say('notices saved', JSON.stringify(await page.evaluate(() => (window.NOTICES || []).map(n => [n.to, n.by, n.what.map(p => p.k).join('+')]))))

  /* 2 — Ranger */
  await signOut(); await signIn('us', 'us')
  await page.waitForTimeout(400); await quiet()
  say('Ranger\'s bell', JSON.stringify(await bellState()))
  const bb = await (await bell()).boundingBox()
  await clip('01-bell-lit', bb, [14, 160, 14, 260]); await loud()
  await press(await bell()); await page.waitForTimeout(400)
  say('Ranger\'s tap', JSON.stringify(await bellState()) + ' — ' + await note())
  const f1 = await shotList('02-list')
  if (f1 && f1.lines.length) {
    await press(page.locator('.bell-list .bl-line').first()); await page.waitForTimeout(600)
    say('tap on the first line', JSON.stringify({ window: await page.locator('#inpEditPop:visible').count(), title: await page.locator('#inpEditPop #inpEditOwnTitle').first().inputValue().catch(() => null), listOpen: await page.locator('.bell-list').count(), page: await page.evaluate(() => document.querySelector('.page.on')?.id) }))
    await quiet(); await page.screenshot({ path: file('03-line-opens-the-input') }); await loud()
    const x = page.locator('#inpEditClose:visible, #inpEditCancel:visible').first(); if (await x.count()) await press(x)
    await page.waitForTimeout(300)
    await press(await bell()); await page.waitForTimeout(400)
    await shotList('04-one-read')
    const all = page.locator('[data-testid="bell-markall"]')
    if (await all.count()) { await press(all); await page.waitForTimeout(400) }
    await shotList('05-all-read')
    say('bell after "Mark all read"', JSON.stringify(await bellState()))
    await press(await bell()); await page.waitForTimeout(200)
  }
  /* Ranger files a duty for Saber — a member's own change tells the person it is for */
  const r2 = await fileIt('Standby brief', ['stiff'], '14:00', '15:00', 'Duty')
  say('Ranger\'s bell after his own filing', JSON.stringify(await bellState()))

  /* 3 — Saber, on the Scheduler Board */
  await signOut(); await signIn('ad', 'a')
  await page.waitForTimeout(300)
  say('Saber\'s bell', JSON.stringify(await bellState()))
  await page.evaluate(() => window.go('editsched'))
  await page.locator('#eWeek .day').first().waitFor()
  const d2 = page.locator(`#eWeek [data-sbday="${DI}"]:visible`).first()
  await d2.scrollIntoViewIfNeeded(); await press(d2)
  await page.waitForSelector('#schedBoard', { timeout: 5000 }); await page.waitForTimeout(300)
  say('the board\'s bell', JSON.stringify(await bellState()))
  await press(await bell()); await page.waitForTimeout(400)
  say('tap on the board\'s bell', JSON.stringify(await bellState()) + ' — ' + await note())
  await shotList('06-board-list')
  if (await page.locator('.bell-list').count()) {
    /* a press on the board behind it closes it, and the board is still there */
    await page.mouse.click(Math.round(VW / 2), VH - 30); await page.waitForTimeout(300)
    say('a press outside', JSON.stringify({ listOpen: await page.locator('.bell-list').count(), board: await page.locator('#schedBoard').count() }))
  }
  void r2
  console.log(size, errors.length ? 'ERRORS ' + errors.join(' | ') : 'no console errors, page errors or failed requests')
  await ctx.close()
}
await browser.close()
