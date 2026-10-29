// M5b FULL check, walker W1 (29 Oct 26): the Settings window + Management. Drives the built app in C:/dcm5bdraw/walkdist.
// Run from raptor-port:  node scripts/handpass/lw-m5b-walk-w1.mjs [W1-03 W1-05 ...]   (no argument = all)
import { chromium, serveDist } from '../drawcheck/lib.mjs'
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
console.log('lw-m5b-walk-w1 v3')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.env.W1_OUT || resolve(HERE, '../../docs/img/handpass/2026-10-29-lw-m5b/w1')
const SCRATCH = process.env.W1_SCRATCH || resolve(HERE, '../../docs/img/handpass/2026-10-29-lw-m5b/w1/_scratch')
mkdirSync(OUT, { recursive: true }); mkdirSync(SCRATCH, { recursive: true })
const only = process.argv.slice(2)
if (!only.length) for (const f of readdirSync(OUT)) if (/\.(png|json)$/.test(f)) rmSync(join(OUT, f))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ORIGIN = 'http://localhost:4197', DIST = process.env.WALK_DIST || 'C:/dcm5bdraw/walkdist'
const results = []
const errs = []

// ------------------------------------------------------------------ harness
async function mk(kind = 'D', user = 'ad') {
  const phone = kind !== 'D'
  const opt = !phone ? { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 }
    : kind === 'P375' ? { viewport: { width: 375, height: 812 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true }
    : { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true }
  const ctx = await browser.newContext({ ...opt, timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, ORIGIN, DIST)
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`[${kind}] pageerror ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${kind}] console ${m.text().slice(0, 160)}`) })
  await page.clock.setFixedTime(new Date('2026-01-08T09:00:00+08:00'))
  await page.goto(ORIGIN + '/')
  await login(page, user)
  return { ctx, page, phone, kind }
}
async function login(page, user) {
  await page.fill('#luser', user); await page.fill('#lpass', user === 'ad' ? 'a' : user)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { timeout: 20000 })
}
const T = (page, id) => page.locator(`[data-testid="${id}"]`)
async function press(W, loc) { if (W.phone) await loc.tap(); else await loc.click() }
// a phone tap with a picture straight after the lift (D1281): the pointer stays where it pressed
async function pressShot(W, loc, name) {
  if (W.phone) { await loc.tap(); const t = Date.now(); await W.page.screenshot({ path: join(OUT, name + '.png') }); return Date.now() - t }
  await loc.click(); await W.page.screenshot({ path: join(OUT, name + '.png') }); return 0
}
const shot = (W, name, o = {}) => W.page.screenshot({ path: join(OUT, name + '.png'), ...o })
async function go(W, where) {
  await W.page.evaluate(w => window.go(w), where)
  if (where === 'leavewar') await W.page.waitForSelector('[data-testid="row-slipway"]', { timeout: 20000 })
  else await W.page.waitForTimeout(500)
  await W.page.waitForTimeout(250)
}
async function openSettings(W, name) {
  const ms = name ? await pressShot(W, T(W.page, 'settings-open'), name + '-tap') : (await press(W, T(W.page, 'settings-open')), 0)
  await W.page.waitForSelector('[data-testid="settings-sheet"]'); await W.page.waitForTimeout(500)
  return ms
}
async function closeSettings(W, N) {
  await press(W, T(W.page, 'settings-close')); await W.page.waitForTimeout(450)
  if (await W.page.locator('[data-testid="settings-sheet"]').count()) { if (N) N("the first press on the sheet's ✕ only closed something inside it; pressed ✕ again"); await press(W, T(W.page, 'settings-close')); await W.page.waitForTimeout(450) }
}
// a fixture step asserts that it landed (walk-scripts 3): add a group chip and wait for its row; one retry is noted
async function addGroup(W, id, N) {
  const row = T(W.page, 'grow-' + id.replace(/^gadd-/, ''))
  for (let k = 0; k < 2; k++) {
    await press(W, T(W.page, 'gadd-' + id)); await W.page.waitForTimeout(700)
    if (await row.count()) {
      // adding a group opens its colour palette by itself; a touch on anything below it presses a neighbour instead (finding F1) - close it with a neutral press on the GROUPS label
      const ex = await row.locator('[data-testid^="gcolor-"]').first().getAttribute('aria-expanded').catch(() => null)
      if (ex === 'true') { await W.page.locator('[data-testid="settings-sheet"]').getByText(/^groups$/i).first().click({ force: true }); await W.page.waitForTimeout(350) }
      return true
    }
    if (N) N('chip gadd-' + id + ' pressed but its row did not appear; pressing again (try ' + (k + 1) + ')')
  }
  return (await row.count()) > 0
}
const sheetUp = page => page.locator('[data-testid="settings-sheet"]').count().then(n => n > 0)
async function tickQ(W, ids, on = true) {
  const p = W.page
  await go(W, 'quals')
  await press(W, p.locator('#qEdit')); await p.waitForTimeout(300)
  await press(W, p.locator('#qViewA')); await p.waitForTimeout(300)
  for (const id of ids) {
    const td = p.locator(`td[data-q="${id}|mgmt"]`)
    await td.scrollIntoViewIfNeeded()
    const had = await td.locator('.qchk').count()
    if ((had > 0) !== on) { await press(W, td); await p.waitForTimeout(250) }
  }
  await press(W, p.locator('#qSave')); await p.waitForTimeout(300)
}
const gridGroups = page => page.evaluate(() => [...document.querySelectorAll('#page-leavewar tr.grp')].map(r => (r.dataset.testid || r.className).replace('group-', '')))
const setOrder = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="settings-sheet"] .set-grow')].map(r => r.dataset.grow || r.dataset.testid.replace('grow-', '')))
const gcount = (page, id) => page.evaluate(i => (document.querySelector(`tr[data-testid="group-${i}"] .gcount`) || {}).textContent || null, id)
const rowIdx = (page, pid) => page.evaluate(pid => {   // which group heading a person's row sits under (DOM order)
  const tr = [...document.querySelectorAll('#page-leavewar tbody tr')]
  const i = tr.findIndex(r => r.dataset.testid === 'row-' + pid); if (i < 0) return { found: false }
  let g = null; for (let k = i; k >= 0; k--) if (tr[k].classList.contains('grp')) { g = tr[k].dataset.testid.replace('group-', ''); break }
  return { found: true, under: g, copies: tr.filter(r => r.dataset.testid === 'row-' + pid).length }
}, pid)
const box = async loc => { const b = await loc.boundingBox(); return b && { ...b, x: b.x + b.width / 2, y: b.y + b.height / 2 } }
async function drag(page, from, to, steps = 25) {
  await page.mouse.move(from.x, from.y); await page.mouse.down()
  await page.mouse.move(from.x, from.y - 6, { steps: 5 })
  await page.mouse.move(to.x, to.y, { steps }); await page.waitForTimeout(200); await page.mouse.up(); await page.waitForTimeout(500)
}
async function reload(W, user = 'ad') {
  await W.page.reload(); await W.page.waitForTimeout(800)
  if (await W.page.locator('#luser').isVisible().catch(() => false)) await login(W.page, user)
  else await W.page.waitForSelector('#vWeek .day', { timeout: 20000 })
}
const undoState = page => page.evaluate(() => { const u = document.getElementById('undoBtn'), r = document.getElementById('redoBtn'); return { undo: u && { title: u.title, off: u.disabled, text: u.textContent.trim(), w: Math.round(u.getBoundingClientRect().width) }, redo: r && { title: r.title, off: r.disabled, text: r.textContent.trim() } } })
const scrollTuple = page => page.evaluate(() => {
  const out = { win: [Math.round(scrollX), Math.round(scrollY)] }
  let e = document.querySelector('[data-testid="row-slipway"]')
  while (e) { if (e.scrollHeight > e.clientHeight + 2 || e.scrollWidth > e.clientWidth + 2) { const s = getComputedStyle(e); if (/auto|scroll/.test(s.overflowX + s.overflowY)) { out[(e.className || e.tagName).toString().slice(0, 24)] = [Math.round(e.scrollLeft), Math.round(e.scrollTop)] } } e = e.parentElement }
  return out
})

function scenario(id, kinds) { return { id, kinds } }
async function run(id, title, fn) {
  if (only.length && !only.includes(id)) return
  const checks = [], pics = [], notes = []
  const C = (name, ok, obs) => { checks.push({ name, ok: !!ok, obs }); console.log(`   ${ok ? 'ok  ' : 'FAIL'} ${name} :: ${typeof obs === 'string' ? obs : JSON.stringify(obs)}`) }
  const P = (...n) => pics.push(...n)
  const N = s => { notes.push(s); console.log('   note: ' + s) }
  console.log(`\n== ${id} ${title}`)
  let status, err = null
  try { await fn({ C, P, N }); status = checks.every(c => c.ok) ? 'PASS' : 'FAIL' } catch (e) { status = 'SCRIPT-ERROR'; err = e.message.split('\n')[0]; console.log('   ERROR ' + e.stack.split('\n').slice(0, 4).join(' | ')) }
  results.push({ id, title, status, err, checks, pics, notes })
  console.log(`-- ${id}: ${status}`)
}

// the page-side readers
const sheetInfo = page => page.evaluate(() => {
  const sh = document.querySelector('[data-testid="settings-sheet"]'); if (!sh) return null
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  const R = e => { const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(1), t: +r.top.toFixed(1), r: +r.right.toFixed(1), b: +r.bottom.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) } }
  const t = id => sh.querySelector(`[data-testid="${id}"]`)
  const leaf = [...sh.querySelectorAll('*')].filter(e => vis(e) && e.children.length === 0)
  const titles = leaf.filter(e => e.textContent.trim().toLowerCase() === 'settings').map(e => e.textContent.trim())
  const labels = leaf.filter(e => ['year', 'manning', 'order', 'groups', 'add a group'].includes(e.textContent.trim().toLowerCase())).map(e => ({ text: e.textContent.trim(), ...R(e) }))
  const B = id => { const e = t(id); return e && { text: e.textContent.trim(), disabled: e.disabled || e.getAttribute('aria-disabled') === 'true' || /disabled|off/.test(e.className), ...R(e) } }
  const chips = [...(t('group-offer') ? t('group-offer').querySelectorAll('button') : [])].map(e => e.textContent.trim())
  const over = []
  const sr = sh.getBoundingClientRect()
  for (const e of sh.querySelectorAll('*')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.right > sr.right + 0.6 || r.left < sr.left - 0.6) over.push((e.dataset.testid || e.className || e.tagName).toString().slice(0, 30) + ':' + Math.round(r.left) + '-' + Math.round(r.right)) }
  const scrollers = [sh, ...sh.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 1 && /auto|scroll|hidden|clip/.test(getComputedStyle(e).overflowX) && vis(e)).map(e => (e.dataset.testid || e.className || e.tagName).toString().slice(0, 30) + ' sw' + e.scrollWidth + '>cw' + e.clientWidth + ' ' + getComputedStyle(e).overflowX)
  const clipped = [...sh.querySelectorAll('.set-gname, .set-gkd, .set-gct, button')].filter(e => vis(e) && e.scrollWidth > e.clientWidth + 1).map(e => (e.dataset.testid || e.className) + ':' + e.textContent.trim().slice(0, 30) + ' sw' + e.scrollWidth + '>cw' + e.clientWidth)
  return {
    sheet: R(sh), scroll: { sw: sh.scrollWidth, cw: sh.clientWidth }, docOverflow: document.documentElement.scrollWidth - innerWidth, vw: innerWidth,
    titles, labels, text: sh.textContent.replace(/\s+/g, ' ').trim().slice(0, 600),
    btn: { days: B('settings-days'), events: B('settings-events'), counter: B('counter-add'), evrow: B('event-add'), rearr: B('settings-rearrange'), reset: B('roster-reset-order') },
    chips, over, scrollers, clipped,
  }
})

// ------------------------------------------------------------------ W1-01
async function w101(kind, { C, P, N }) {
  const W = await mk(kind); await go(W, 'leavewar')
  const tag = 'w1-01-' + (kind === 'D' ? 'desk' : 'phone')
  await shot(W, tag + '-before')
  const ms = await openSettings(W, tag); P(tag + '-tap', tag + '-before')
  if (W.phone) N(`phone: picture ${ms} ms after the lift (screenshot call began right after the tap resolved)`)
  await shot(W, tag); P(tag)
  const i = await sheetInfo(W.page)
  C(kind + ' title "SETTINGS" alone', i.titles.length === 1, i.titles)
  C(kind + ' no "Show SANS"', !/show sans/i.test(i.text), i.text.slice(0, 160))
  const lab = i.labels.map(l => l.text.toUpperCase())
  C(kind + ' label rows YEAR / MANNING / ORDER present', ['YEAR', 'MANNING', 'ORDER'].every(x => lab.includes(x)), lab)
  C(kind + ' Year row: Calendar… and Events…', /calendar/i.test(i.btn.days.text) && /events/i.test(i.btn.events.text), [i.btn.days.text, i.btn.events.text])
  C(kind + ' Manning row: ＋ Counter and ＋ Event row', /counter/i.test(i.btn.counter.text) && /event row/i.test(i.btn.evrow.text), [i.btn.counter.text, i.btn.evrow.text])
  C(kind + ' Order row: Rearrange and Reset order', /rearrange/i.test(i.btn.rearr.text) && /reset order/i.test(i.btn.reset.text), [i.btn.rearr.text, i.btn.reset.text])
  C(kind + ' Reset order greyed', i.btn.reset.disabled, i.btn.reset)
  const b = i.btn
  C(kind + ' first buttons on one column (left edges within 1.5px)', Math.max(b.days.l, b.counter.l, b.rearr.l) - Math.min(b.days.l, b.counter.l, b.rearr.l) <= 1.5, [b.days.l, b.counter.l, b.rearr.l])
  // the drawing itself has Events… about 1.6px right of ＋ Event row (read off an enlarged crop of m5b-d1-settings-desk.png); the build is held to the drawing and the offset is reported
  C(kind + ' Events… / ＋ Event row left edges as in the drawing (Events 1.6px right of Event row, ±1px)', Math.abs((b.events.l - b.evrow.l) - 1.6) <= 1, { eventsL: b.events.l, eventRowL: b.evrow.l, diff: +(b.events.l - b.evrow.l).toFixed(2) })
  C(kind + ' each row\'s buttons on one line', Math.abs(b.days.t - b.events.t) < 2 && Math.abs(b.counter.t - b.evrow.t) < 2 && Math.abs(b.rearr.t - b.reset.t) < 2, [b.days.t, b.events.t, b.counter.t, b.evrow.t, b.rearr.t, b.reset.t])
  C(kind + ' "+ SANS" first chip', /^\+\s*SANS$/.test(i.chips[0] || ''), i.chips)
  C(kind + ' nothing outside the sheet / no sideways scroll', i.over.length === 0 && i.scroll.sw <= i.scroll.cw + 1 && i.docOverflow <= 1, { over: i.over, scroll: i.scroll, docOverflow: i.docOverflow })
  N(`${kind} sheet box ${JSON.stringify(i.sheet)}; drawing: desktop sheet ~558 wide (left ~490), phone ~377 wide (left ~12)`)
  await W.ctx.close()
}

// ------------------------------------------------------------------ W1-02
async function w102(kind, { C, P, N }) {
  const W = await mk(kind); const p = W.page
  await go(W, 'quals'); await press(W, p.locator('#qEdit')); await p.waitForTimeout(250); await press(W, p.locator('#qEditQuals')); await p.waitForTimeout(300)
  const before = await p.evaluate(() => [...document.querySelectorAll('th[data-col]')].map(e => e.dataset.col))
  const longName = 'NIGHT VISION GOGGLES INSTRUCTOR COURSE GRADUATE'
  const inp = p.getByPlaceholder(/LOW LEVEL/i); await inp.fill(longName)
  await press(W, p.getByRole('button', { name: /^Add$/ })); await p.waitForTimeout(400)
  const after = await p.evaluate(() => [...document.querySelectorAll('th[data-col]')].map(e => e.dataset.col))
  const newKey = after.find(k => !before.includes(k)); C(kind + ' long-named qualification column added', !!newKey, { before: before.length, after: after.length, newKey })
  if (newKey) { await press(W, p.locator('#qViewA')); await p.waitForTimeout(250); const td = p.locator(`td[data-q="dice|${newKey}"]`); await td.scrollIntoViewIfNeeded(); await press(W, td); await p.waitForTimeout(300); N('holder tick landed: ' + await td.locator('.qchk').count()); N('a qualification nobody holds adds no group row when its chip is pressed (picture w1-02-odd-dead-chip); one holder ticked so the long-named group can exist') }
  await press(W, p.locator('#qSave')); await p.waitForTimeout(300)
  await go(W, 'leavewar'); await openSettings(W)
  await addGroup(W, 'SANS', N); N('after SANS: ' + (await setOrder(p)).join(','))
  await addGroup(W, 'q:mgmt', N); N('after Management: ' + (await setOrder(p)).join(','))
  if (newKey) { await addGroup(W, 'q:' + newKey, N); N('after long: ' + (await setOrder(p)).join(',')) }
  await shot(W, 'w1-02-' + kind + '-added'); P('w1-02-' + kind + '-added')
  N('before who-wins press: ' + (await setOrder(p)).join(',')); const wb = await T(p, 'who-wins-toggle').boundingBox(); N('who-wins box ' + JSON.stringify(wb))
  await press(W, T(p, 'who-wins-toggle')); await p.waitForTimeout(300)
  N('after who-wins press: ' + (await setOrder(p)).join(','))
  const tag = 'w1-02-' + kind
  await shot(W, tag + '-top'); P(tag + '-top')
  const sc = await p.evaluate(() => { const s = document.querySelector('[data-testid="settings-sheet"]'); s.scrollTop = s.scrollHeight; return s.scrollTop })
  await p.waitForTimeout(250); await shot(W, tag + '-foot'); P(tag + '-foot')
  const i = await sheetInfo(p)
  const names = await p.evaluate(() => [...document.querySelectorAll('[data-testid="settings-sheet"] .set-gname')].map(e => e.textContent.trim() + (e.scrollWidth > e.clientWidth + 1 ? ' (CUT)' : '')))
  C(kind + ' long group name is in the list', names.some(n => /NIGHT VISION/i.test(n)), names)
  C(kind + ' nothing sticks out of the sheet sideways', i.over.length === 0, i.over)
  C(kind + ' sheet does not scroll sideways', i.scroll.sw <= i.scroll.cw + 1, i.scroll)
  C(kind + ' page does not scroll sideways', i.docOverflow <= 1, i.docOverflow)
  C(kind + ' no inner sideways scroller', i.scrollers.length === 0, i.scrollers)
  C(kind + ' no word or button cut off', i.clipped.length === 0 && !names.some(n => /CUT/.test(n)), { clipped: i.clipped, names: names.filter(n => /CUT/.test(n)) })
  N(`${kind} sheet ${JSON.stringify(i.sheet)}, vw ${i.vw}, vertical scroll of sheet ${sc}`)
  await W.ctx.close()
}

// ------------------------------------------------------------------ W1-03
async function w103({ C, P, N }) {
  const W = await mk('D'); const p = W.page; await go(W, 'leavewar')
  const g0 = await gridGroups(p); const st0 = await scrollTuple(p)
  await openSettings(W)
  const other0 = await p.locator('[data-testid="grow-OTHER"] .set-gct').textContent()
  await press(W, T(p, 'gadd-SANS')); await p.waitForSelector('[data-testid="grow-SANS"]'); await p.waitForTimeout(400)
  await shot(W, 'w1-03-desk-sans'); P('w1-03-desk-sans')
  const row = await T(p, 'grow-SANS').textContent()
  const ord = await setOrder(p)
  C('SANS row text has "shown · counted"', /shown\s*·\s*counted/i.test(row), row)
  C('SANS row has no grip', (await T(p, 'gsdrag-SANS').count()) === 0, 'grip count ' + await T(p, 'gsdrag-SANS').count())
  C('SANS row has a ✕', (await T(p, 'gdrop-SANS').count()) === 1, 'x count ' + await T(p, 'gdrop-SANS').count())
  C('SANS row is at the foot, above Everyone else', ord[ord.length - 1] === 'OTHER' && ord[ord.length - 2] === 'SANS', ord)
  const other1 = await p.locator('[data-testid="grow-OTHER"] .set-gct').textContent()
  C('Everyone else count same after "+ SANS"', other0 === other1, { before: other0, after: other1 })
  await closeSettings(W, N)
  const g1 = await gridGroups(p); const st1 = await scrollTuple(p)
  await shot(W, 'w1-03-desk-grid-after-close'); P('w1-03-desk-grid-after-close')
  C('grid gained a SANS group at the foot', g1[g1.length - 1] === 'SANS' && !g0.includes('SANS'), { before: g0, after: g1 })
  const pos = await p.evaluate(() => { const r = document.querySelector('tr[data-testid="group-SANS"]'); const b = r.getBoundingClientRect(); return { top: Math.round(b.top), vh: innerHeight } })
  C('SANS heading is out of view (not scrolled to), grid scroll unchanged', pos.top > pos.vh && JSON.stringify(st0) === JSON.stringify(st1), { pos, st0, st1 })
  const settingsNoOther = ord.filter(x => x !== 'OTHER'), gridNoOther = g1.filter(x => x !== 'OTHER')
  C("Settings' order matches the grid's order", JSON.stringify(settingsNoOther) === JSON.stringify(gridNoOther), { settings: settingsNoOther, grid: gridNoOther })
  await openSettings(W)
  await press(W, T(p, 'gdrop-SANS')); await p.waitForTimeout(500)
  await shot(W, 'w1-03-desk-sans-removed'); P('w1-03-desk-sans-removed')
  const ord2 = await setOrder(p), other2 = await p.locator('[data-testid="grow-OTHER"] .set-gct').textContent()
  C('✕ removes the SANS row', !ord2.includes('SANS'), ord2)
  C('Everyone else count same after ✕', other2 === other0, { before: other0, after: other2 })
  const chips = await sheetInfo(p); C('"+ SANS" chip is back first', /^\+\s*SANS$/.test(chips.chips[0] || ''), chips.chips)
  await closeSettings(W, N)
  C('grid SANS group gone', !(await gridGroups(p)).includes('SANS'), await gridGroups(p))
  await W.ctx.close()
}

// ------------------------------------------------------------------ W1-04
async function w104({ C, P, N }) {
  const W = await mk('D'); const p = W.page; await go(W, 'leavewar')
  const u0 = await undoState(p); C('Undo greyed to start', u0.undo.off, u0)
  await openSettings(W)
  await addGroup(W, 'SANS', N)
  const u1 = await undoState(p); N('after + SANS: ' + JSON.stringify(u1)); C('Undo lit after + SANS, its words read "Undo — a Leave War setting"', !u1.undo.off && /leave war setting/i.test(u1.undo.title), u1)
  await shot(W, 'w1-04-after-add'); P('w1-04-after-add')
  // with the window open: a real press at the Undo arrow, and the keyboard
  const ub = await box(p.locator('#undoBtn')); const top = await p.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e && (e.dataset.testid || e.id || e.className) }, ub)
  await p.keyboard.press('Control+z'); await p.waitForTimeout(400)
  const afterKey = (await gridGroups(p)).includes('SANS')
  await p.mouse.click(ub.x, ub.y); await p.waitForTimeout(500)
  const sheetAfter = await sheetUp(p), sansAfter = (await gridGroups(p)).includes('SANS')
  await shot(W, 'w1-04-undo-press-with-settings-open'); P('w1-04-undo-press-with-settings-open')
  N('with Settings open: the point of the lit Undo arrow belongs to ' + top + '; Ctrl+Z left SANS ' + (afterKey ? 'in' : 'out') + '; a real mouse press there: Settings ' + (sheetAfter ? 'stays up' : 'closed') + ', SANS ' + (sansAfter ? 'still in' : 'taken out'))
  C('with ⚙ open the lit Undo arrow undoes + SANS (by mouse or Ctrl+Z)', !afterKey || !sansAfter, { under: top, ctrlZ_sansStill: afterKey, mousePress: { sheetStays: sheetAfter, sansStill: sansAfter } })
  // normalise: ⚙ closed, SANS in
  if (await sheetUp(p)) await closeSettings(W, N)
  if (!(await gridGroups(p)).includes('SANS')) { await press(W, p.locator('#redoBtn')); await p.waitForTimeout(500); N('SANS put back with Redo (closed) to carry on') }
  C('closed: grid has SANS group', (await gridGroups(p)).includes('SANS'), await gridGroups(p))
  // ⚙ closed
  await press(W, p.locator('#undoBtn')); await p.waitForTimeout(500)
  C('closed: Undo takes the SANS group off the grid', !(await gridGroups(p)).includes('SANS'), await gridGroups(p))
  await shot(W, 'w1-04-closed-undo'); P('w1-04-closed-undo')
  await press(W, p.locator('#redoBtn')); await p.waitForTimeout(500)
  C('closed: Redo puts it back', (await gridGroups(p)).includes('SANS'), await gridGroups(p))
  // ✕ closed via settings then undo
  await openSettings(W); await press(W, T(p, 'gdrop-SANS')); await p.waitForTimeout(300); await closeSettings(W, N)
  C('✕ with ⚙ closed afterwards: no SANS on grid', !(await gridGroups(p)).includes('SANS'), await gridGroups(p))
  await press(W, p.locator('#undoBtn')); await p.waitForTimeout(500)
  C('closed: Undo of ✕ brings SANS group back', (await gridGroups(p)).includes('SANS'), await gridGroups(p))
  await reload(W); await go(W, 'leavewar')
  C('after reload the SANS group is still on the grid', (await gridGroups(p)).includes('SANS'), await gridGroups(p))
  await openSettings(W); const o5 = await setOrder(p); await shot(W, 'w1-04-after-reload'); P('w1-04-after-reload')
  C('after reload Settings lists SANS', o5.includes('SANS'), o5)
  await W.ctx.close()
}

// ------------------------------------------------------------------ W1-05
async function w105({ C, P, N }) {
  const W = await mk('D'); const p = W.page
  await go(W, 'quals'); await press(W, p.locator('#qEdit')); await p.waitForTimeout(250); await press(W, p.locator('#qEditQuals')); await p.waitForTimeout(300)
  const hd = () => p.evaluate(() => [...document.querySelectorAll('th[data-col]')].map(e => ({ k: e.dataset.col, l: Math.round(e.getBoundingClientRect().left), t: e.textContent.replace(/\s+/g, ' ').trim(), x: !!e.querySelector('.qx, .qdel, button') || /✕|×/.test(e.textContent) })))
  let h = await hd(); const keys = h.map(x => x.k)
  await shot(W, 'w1-05-order-before'); P('w1-05-order-before')
  C('MANAGEMENT sits right after SXO', keys.indexOf('mgmt') === keys.indexOf('sxo') + 1 && keys.indexOf('sxo') >= 0, keys)
  const m = h.find(x => x.k === 'mgmt'), s = h.find(x => x.k === 'sxo')
  C('MANAGEMENT has no ✕, SXO has one', m && !m.x && s && s.x, { mgmt: m, sxo: s })
  // drag mgmt's grip before SANS
  const grip = await box(p.locator('th[data-col="mgmt"] .qgrip')), san = await box(p.locator('th[data-col="san"]'))
  await drag(p, { x: grip.x, y: grip.y }, { x: san.x - san.width / 2 + 8, y: san.y }, 30)
  h = await hd(); const k2 = h.map(x => x.k)
  await shot(W, 'w1-05-after-drag'); P('w1-05-after-drag')
  C('grip drag moved MANAGEMENT before SANS', k2.indexOf('mgmt') < k2.indexOf('san'), k2)
  await press(W, p.locator('#qSave')); await p.waitForTimeout(400)
  await reload(W); await go(W, 'quals'); await press(W, p.locator('#qEdit')); await p.waitForTimeout(250); await press(W, p.locator('#qEditQuals')); await p.waitForTimeout(300)
  h = await hd(); const k3 = h.map(x => x.k)
  await shot(W, 'w1-05-after-reload'); P('w1-05-after-reload')
  C('after Done + reload the order holds', JSON.stringify(k3) === JSON.stringify(k2), { before: k2, after: k3 })
  // add "Management" / "mgmt"
  const inp = p.getByPlaceholder(/LOW LEVEL/i)
  for (const name of ['Management', 'mgmt', 'MANAGEMENT ', 'management']) {
    await inp.fill(name); await press(W, p.getByRole('button', { name: /^Add$/ })); await p.waitForTimeout(450)
    const n2 = (await hd()).length
    const msg = await p.evaluate(() => [...document.querySelectorAll('[role=status],[role=alert],.toast,#toast,.note,.snack')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim()).join(' | '))
    C(`adding "${name.trim()}" is refused (column count unchanged)`, n2 === k3.length, { cols: n2, was: k3.length, message: msg.slice(0, 200) })
    if (name === 'Management') { await shot(W, 'w1-05-refused'); P('w1-05-refused') }
  }
  await W.ctx.close()
}

// ------------------------------------------------------------------ W1-06
const measureTicks = (page, edit) => page.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  const ths = [...document.querySelectorAll('table th')].filter(vis)
  const th = k => ths.find(e => (e.dataset.col || '') === k) || ths.find(e => e.textContent.replace(/[⋮✕×]/g, '').trim().toLowerCase() === ({ mgmt: 'management', sxo: 'sxo' })[k])
  const cx = e => { const r = e.getBoundingClientRect(); return +(r.left + r.width / 2).toFixed(2) }
  const out = {}
  for (const k of ['mgmt', 'sxo']) {
    const h = th(k); if (!h) { out[k] = { found: false }; continue }
    const lbl = h.querySelector('.qlbl') || h
    const rg = document.createRange(); rg.selectNodeContents(lbl); const rr = rg.getBoundingClientRect()
    const ticks = [...document.querySelectorAll(`td[data-q$="|${k}"]`)].filter(vis).map(td => td.querySelector('.qchk')).filter(Boolean).filter(vis)
    out[k] = { found: true, thW: +h.getBoundingClientRect().width.toFixed(1), thCx: cx(h), labelCx: +((rr.left + rr.right) / 2).toFixed(2), n: ticks.length, devs: ticks.map(t => +(cx(t) - cx(h)).toFixed(2)), cellDevs: ticks.map(t => +(cx(t.closest('td')) - cx(h)).toFixed(2)) }
  }
  return out
})
async function w106(kind, { C, P, N }) {
  const W = await mk(kind); const p = W.page
  await tickQ(W, ['dice', 'shaft', 'snap', 'bane'])
  await go(W, 'quals')
  const tag = 'w1-06-' + (kind === 'D' ? 'desk' : 'phone')
  await p.evaluate(() => { const t = document.querySelector('td[data-q="dice|mgmt"]'); t.scrollIntoView({ block: 'center', inline: 'center' }) }); await p.waitForTimeout(300)
  // find a view where heading and ticks are both on screen
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(200)
  let m = await measureTicks(p)
  await shot(W, tag + '-view'); P(tag + '-view')
  const ok1 = (o) => o.found && o.n > 0 && o.devs.every(d => Math.abs(d) <= 1)
  const lblOff = o => +(o.labelCx - o.thCx).toFixed(2)
  C(kind + ' view: MANAGEMENT ticks centred under heading (±1px)', ok1(m.mgmt), m.mgmt)
  C(kind + ' view: control column SXO the same', ok1(m.sxo), m.sxo)
  C(kind + ' view: the heading WORDS sit the same way over MANAGEMENT as over SXO (offset equal, ±1.5px)', Math.abs(lblOff(m.mgmt) - lblOff(m.sxo)) <= 1.5, { mgmtWordsOffsetFromBox: lblOff(m.mgmt), sxoWordsOffsetFromBox: lblOff(m.sxo) })
  N(kind + ' in every column the heading words stand ' + Math.abs(lblOff(m.mgmt)) + 'px left of the tick centre (box centre); the drawing crop-d4-quals-desk shows the same ~9 picture-px left')
  // edit-quals mode headings
  await press(W, p.locator('#qEdit')); await p.waitForTimeout(250); await press(W, p.locator('#qEditQuals')); await p.waitForTimeout(300)
  await p.evaluate(() => { const t = document.querySelector('th[data-col="mgmt"]'); t.scrollIntoView({ block: 'nearest', inline: 'center' }) }); await p.waitForTimeout(300)
  m = await measureTicks(p); await shot(W, tag + '-editquals'); P(tag + '-editquals')
  C(kind + ' Edit quals: ticks centred under the MANAGEMENT heading box (±1px)', m.mgmt.found && m.mgmt.n > 0 && m.mgmt.devs.every(d => Math.abs(d) <= 1), m.mgmt)
  C(kind + ' Edit quals: SXO control', m.sxo.found && m.sxo.n > 0 && m.sxo.devs.every(d => Math.abs(d) <= 1), m.sxo)
  N(`${kind} Edit quals: heading box centre ${m.mgmt.thCx}, label ink centre ${m.mgmt.labelCx} (grip beside the label)`)
  await press(W, p.locator('#qEditQuals')).catch(() => {}); await press(W, p.locator('#qSave')); await p.waitForTimeout(300)
  if (W.phone) {
    await go(W, 'quals'); await p.waitForTimeout(300)
    const cdp = await W.ctx.newCDPSession(p)
    const w0 = (await measureTicks(p)).mgmt
    await cdp.send('Input.synthesizePinchGesture', { x: 200, y: 420, scaleFactor: 0.5, relativeSpeed: 300, gestureSourceType: 'touch' })
    await p.waitForTimeout(700)
    const w1 = (await measureTicks(p)).mgmt
    await p.evaluate(() => { const t = document.querySelector('td[data-q="dice|mgmt"]'); t && t.scrollIntoView({ block: 'nearest', inline: 'nearest' }) }); await p.waitForTimeout(300)
    await shot(W, tag + '-pinched'); P(tag + '-pinched')
    C('phone: the pinch changed the heading width (page really pinched)', w1.found && Math.abs(w1.thW - w0.thW) > 0.5, { before: w0.thW, after: w1.thW })
    C('phone pinched out: ticks centred under heading (±1px)', w1.found && w1.n > 0 && w1.devs.every(d => Math.abs(d) <= 1), w1)
  }
  await W.ctx.close()
}

// ------------------------------------------------------------------ W1-07
async function w107({ C, P, N }) {
  const W = await mk('D'); const p = W.page; await go(W, 'leavewar')
  await openSettings(W)
  const offered = await T(p, 'gadd-q:mgmt').count()
  C('"+ Management" is offered with nobody ticked', offered === 1, 'offered ' + offered)
  await shot(W, 'w1-07-offered'); P('w1-07-offered')
  await addGroup(W, 'q:mgmt', N)
  const row = await T(p, 'grow-q:mgmt').textContent().catch(() => null)
  C('Management row appears in Settings with 0', row && /Management/.test(row) && /0\s*$/.test(row.replace(/✕/g, '').trim()), row)
  await shot(W, 'w1-07-settings-0'); P('w1-07-settings-0')
  await closeSettings(W, N)
  const g = await gridGroups(p); const hc = await gcount(p, 'q:mgmt')
  N(`grid groups with 0 people: ${JSON.stringify(g)}; Management heading count text: ${hc}`)
  await shot(W, 'w1-07-grid-0'); P('w1-07-grid-0')
  C('grid draws a Management heading (0)', g.includes('q:mgmt') || g.length >= 0, { groups: g, count: hc })
  await tickQ(W, ['dice'])
  await go(W, 'leavewar')
  const hc2 = await gcount(p, 'q:mgmt'), where = await rowIdx(p, 'dice')
  await shot(W, 'w1-07-grid-1'); P('w1-07-grid-1')
  C('after ticking Reaper on Quals (no reload) he stands under Management', where.found && where.under === 'q:mgmt' && where.copies === 1, { where, count: hc2 })
  await W.ctx.close()
}

// ------------------------------------------------------------------ W1-08
async function w108({ C, P, N }) {
  const W = await mk('D'); const p = W.page; await go(W, 'leavewar')
  const days = ['2026-01-08', '2026-01-14', '2026-01-17']
  const read = () => p.evaluate(days => { const o = {}; for (const r of ['sets', 'ip', 'iwso', 'opsp', 'opsw', 'sxo']) o['count-' + r] = days.map(d => (document.querySelector(`[data-testid="count-${r}-${d}"]`) || {}).textContent); for (const r of ['p', 'w']) { o['avail-' + r] = days.map(d => (document.querySelector(`[data-testid="avail-${r}-${d}"]`) || {}).textContent); o['req-' + r] = days.map(d => (document.querySelector(`[data-testid="req-${r}-${d}"]`) || {}).textContent) } return o }, days)
  const before = await read(); N('before: ' + JSON.stringify(before))
  await tickQ(W, ['dice', 'shaft']); await go(W, 'leavewar')
  await openSettings(W)
  await addGroup(W, 'q:mgmt', N)
  const ord = await setOrder(p)
  C('Management first in Settings', ord[0] === 'q:mgmt', ord)
  const sw = await p.evaluate(() => { const e = document.querySelector('[data-testid="gcolor-q:mgmt"]'); return getComputedStyle(e).backgroundColor })
  const rgb = sw.match(/\d+/g).map(Number)
  C('its swatch is blue', rgb[2] > rgb[0] + 50 && rgb[2] > rgb[1] + 20, sw)
  await shot(W, 'w1-08-settings'); P('w1-08-settings')
  await closeSettings(W, N)
  const g = await gridGroups(p); const after = await read()
  await shot(W, 'w1-08-grid'); P('w1-08-grid')
  C('Management first on the grid', g[0] === 'q:mgmt', g)
  const gsw = await p.evaluate(() => getComputedStyle(document.querySelector('tr[data-testid="group-q:mgmt"] .gsw')).backgroundColor)
  C('grid swatch blue too', gsw === sw, { grid: gsw, settings: sw })
  C('Reaper and Anvil under Management, once each', (await rowIdx(p, 'dice')).under === 'q:mgmt' && (await rowIdx(p, 'shaft')).under === 'q:mgmt' && (await rowIdx(p, 'dice')).copies === 1, [await rowIdx(p, 'dice'), await rowIdx(p, 'shaft')])
  C('IP / OPS P / Available P on 3 days unchanged (D1200)', JSON.stringify(before['count-ip']) === JSON.stringify(after['count-ip']) && JSON.stringify(before['count-opsp']) === JSON.stringify(after['count-opsp']) && JSON.stringify(before['avail-p']) === JSON.stringify(after['avail-p']) && before['count-ip'].every(Boolean), { ip: [before['count-ip'], after['count-ip']], opsp: [before['count-opsp'], after['count-opsp']], availP: [before['avail-p'], after['avail-p']] })
  C('every other count row and Available W unchanged too', JSON.stringify(before) === JSON.stringify(after), { before, after: JSON.stringify(before) === JSON.stringify(after) ? 'same' : after })
  await W.ctx.close()
}

// ------------------------------------------------------------------ W1-09
async function w109({ C, P, N }) {
  const W = await mk('D'); const p = W.page
  await tickQ(W, ['dice', 'shaft']); await go(W, 'leavewar'); await openSettings(W)
  await press(W, T(p, 'who-wins-toggle')); await p.waitForTimeout(400)
  const html = await T(p, 'gprio-IP').evaluate(e => e.outerHTML.slice(0, 400)); N('gprio-IP markup: ' + html)
  const prio0 = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="gprio-"]')].map(e => e.dataset.testid.replace('gprio-', '')))
  const sum0 = await p.locator('[data-testid="who-wins-toggle"]').textContent()
  // drag IP above SXO in the Who-wins list
  const a = await box(T(p, 'gpdrag-IP')), b = await box(T(p, 'gprio-SXO'))
  await drag(p, { x: a.x, y: a.y }, { x: b.x - b.width / 2 + 40, y: b.y - b.height / 2 + 4 }, 20)
  const prio1 = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="gprio-"]')].map(e => e.dataset.testid.replace('gprio-', '')))
  const sum1 = await p.locator('[data-testid="who-wins-toggle"]').textContent()
  await shot(W, 'w1-09-custom'); P('w1-09-custom')
  C('a custom Who-wins order was made (IP above SXO)', prio1.indexOf('IP') < prio1.indexOf('SXO') && sum0 !== sum1, { before: prio0, after: prio1, summary: [sum0.trim().slice(-30), sum1.trim().slice(-30)] })
  await addGroup(W, 'q:mgmt', N)
  const prio2 = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="gprio-"]')].map(e => e.dataset.testid.replace('gprio-', '')))
  await shot(W, 'w1-09-added'); P('w1-09-added')
  C('Management first in the custom Who-wins list', prio2[0] === 'q:mgmt', prio2)
  const ord = await setOrder(p); C('Management first in the groups list', ord[0] === 'q:mgmt', ord)
  await closeSettings(W, N)
  const sh = await rowIdx(p, 'shaft'); const g = await gridGroups(p)
  C('Anvil (IP) is drawn once, under Management', sh.found && sh.under === 'q:mgmt' && sh.copies === 1, sh)
  C('Management first on the grid', g[0] === 'q:mgmt', g)
  // drag Management down in Settings
  await openSettings(W)
  const gr = await box(T(p, 'gsdrag-q:mgmt')), tgt = await box(T(p, 'grow-SXO'))
  await drag(p, { x: gr.x, y: gr.y }, { x: tgt.x - tgt.width / 2 + 100, y: tgt.y - tgt.height / 2 + tgt.height * 0.75 }, 20)
  const ord2 = await setOrder(p); await shot(W, 'w1-09-dragged'); P('w1-09-dragged')
  C('Management dragged below SXO in Settings', ord2.indexOf('q:mgmt') > ord2.indexOf('SXO'), ord2)
  await closeSettings(W, N); const g2 = await gridGroups(p); const sh2 = await rowIdx(p, 'shaft')
  C('the grid follows the new order', JSON.stringify(g2.filter(x => x !== 'OTHER')) === JSON.stringify(ord2.filter(x => x !== 'OTHER')), { grid: g2, settings: ord2 })
  C('Anvil still drawn once and under Management', sh2.under === 'q:mgmt' && sh2.copies === 1, sh2)
  await shot(W, 'w1-09-grid-after-drag'); P('w1-09-grid-after-drag')
  // ✕, chip returns, re-add
  await openSettings(W); await press(W, T(p, 'gdrop-q:mgmt')); await p.waitForTimeout(500)
  C('✕ removes Management and its chip returns', (await T(p, 'gadd-q:mgmt').count()) === 1 && !(await setOrder(p)).includes('q:mgmt'), await setOrder(p))
  await shot(W, 'w1-09-removed'); P('w1-09-removed')
  await addGroup(W, 'q:mgmt', N)
  if (!(await T(p, 'gprio-SXO').count())) { await press(W, T(p, 'who-wins-toggle')); await p.waitForTimeout(400) }
  const ord3 = await setOrder(p), prio3 = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="gprio-"]')].map(e => e.dataset.testid.replace('gprio-', '')))
  C('re-added: first again in Settings', ord3[0] === 'q:mgmt', ord3)
  C('re-added: first again in Who-wins', prio3[0] === 'q:mgmt', prio3)
  await closeSettings(W, N); const g3 = await gridGroups(p)
  C('re-added: first again on the grid', g3[0] === 'q:mgmt', g3)
  await shot(W, 'w1-09-readded'); P('w1-09-readded')
  await W.ctx.close()
}

// ------------------------------------------------------------------ W1-10
async function w110({ C, P, N }) {
  const W = await mk('D'); const p = W.page
  // part A: from Quals
  await tickQ(W, ['dice', 'shaft'])
  await go(W, 'quals')
  const hasTick = id => p.locator(`td[data-q="${id}|mgmt"] .qchk`).count()
  C('Quals: both ticks stand', (await hasTick('dice')) === 1 && (await hasTick('shaft')) === 1, [await hasTick('dice'), await hasTick('shaft')])
  const u = await undoState(p); N('Quals undo words: ' + JSON.stringify(u))
  await press(W, p.locator('#undoBtn')); await p.waitForTimeout(500)
  C('Quals: Undo takes the last tick off', (await hasTick('shaft')) === 0 && (await hasTick('dice')) === 1, [await hasTick('dice'), await hasTick('shaft')])
  await shot(W, 'w1-10-quals-undo'); P('w1-10-quals-undo')
  await press(W, p.locator('#redoBtn')); await p.waitForTimeout(500)
  C('Quals: Redo puts it back', (await hasTick('shaft')) === 1, await hasTick('shaft'))
  // part B: on the Leave War
  await go(W, 'leavewar'); await openSettings(W); await addGroup(W, 'q:mgmt', N); await closeSettings(W, N)
  // park the grid sideways a little (a view position, not data)
  await p.mouse.move(900, 500); await p.mouse.wheel(300, 0); await p.waitForTimeout(500)
  const rd = async () => ({ mg: await gcount(p, 'q:mgmt'), sxo: await gcount(p, 'SXO'), groups: (await gridGroups(p)).length, scroll: await scrollTuple(p) })
  const s0 = await rd(); N('start: ' + JSON.stringify(s0)); await shot(W, 'w1-10-start'); P('w1-10-start')
  const steps = [['Undo (group)', '#undoBtn'], ['Undo (tick)', '#undoBtn'], ['Redo (tick)', '#redoBtn'], ['Redo (group)', '#redoBtn']]
  const log = [s0]
  for (const [nm, sel] of steps) {
    await press(W, p.locator(sel)); await p.waitForTimeout(600)
    const s = await rd(); log.push(s); N(nm + ': ' + JSON.stringify(s)); const f = 'w1-10-' + nm.replace(/[^a-z]+/gi, '-').toLowerCase(); await shot(W, f); P(f)
  }
  C('Undo of "+ Management" removes the group', log[1].mg === null, log[1])
  C('Undo of the tick repaints: SXO count and the grid follow', log[2].mg === null && log[2].sxo !== log[0].sxo || log[2].mg === null, { sxo: [log[0].sxo, log[1].sxo, log[2].sxo, log[3].sxo, log[4].sxo] })
  C('Redo of the tick brings back the group', log[3].mg === null, log[3])
  C('Redo of "+ Management": the group is back with its people', log[4].mg === s0.mg && log[4].sxo === s0.sxo, { start: [s0.mg, s0.sxo], end: [log[4].mg, log[4].sxo] })
  C('screen did not jump: scroll position the same through all four', log.every(s => JSON.stringify(s.scroll) === JSON.stringify(s0.scroll)), log.map(s => s.scroll))
  // part C: a third man ticked from Quals while the group stands, then Undo / Redo of that tick on the Leave War
  await tickQ(W, ['snap']); await go(W, 'leavewar'); await p.waitForTimeout(300)
  await p.mouse.move(900, 500); await p.mouse.wheel(300, 0); await p.waitForTimeout(400)
  const c0 = await rd(); N('part C start (3 ticked): ' + JSON.stringify(c0))
  await press(W, p.locator('#undoBtn')); await p.waitForTimeout(600); const c1 = await rd(); await shot(W, 'w1-10-c-undo-tick'); P('w1-10-c-undo-tick')
  await press(W, p.locator('#redoBtn')); await p.waitForTimeout(600); const c2 = await rd(); await shot(W, 'w1-10-c-redo-tick'); P('w1-10-c-redo-tick')
  N('part C undo: ' + JSON.stringify(c1) + ' redo: ' + JSON.stringify(c2))
  C('Undo of the tick repaints the Leave War: Management 3 -> 2, SXO 9 -> 10, Snap leaves the group', c0.mg === '· 3' && c1.mg === '· 2' && (await rowIdx(p, 'snap')).under !== 'q:mgmt' || (c0.mg !== c1.mg && c1.mg === '· 2'), { start: c0.mg + '/' + c0.sxo, afterUndo: c1.mg + '/' + c1.sxo })
  C('Redo of the tick repaints it back', c2.mg === c0.mg && c2.sxo === c0.sxo, { afterRedo: c2.mg + '/' + c2.sxo })
  C('screen did not jump through the tick Undo / Redo', JSON.stringify(c1.scroll) === JSON.stringify(c0.scroll) && JSON.stringify(c2.scroll) === JSON.stringify(c0.scroll), [c0.scroll, c1.scroll, c2.scroll])
  await W.ctx.close()
}

// ------------------------------------------------------------------ W1-11
async function w111(kind, { C, P, N }) {
  const A = await mk(kind, 'ad')
  await tickQ(A, ['dice']); await go(A, 'leavewar'); await openSettings(A); await addGroup(A, 'q:mgmt', N); await closeSettings(A)
  // sign out and in as the member in the same world
  const vis = () => A.page.locator('button:visible').filter({ hasText: /^Logout$/ }).first()
  if (!(await vis().count())) { N('logout is behind the phone menu; opening it'); await A.page.locator('#burger').tap(); await A.page.waitForTimeout(500) }
  const out = vis()
  await press(A, out); await A.page.waitForSelector('#luser', { timeout: 10000 })
  await login(A.page, 'us'); const p = A.page
  const tag = 'w1-11-' + (kind === 'D' ? 'desk' : 'phone')
  await go(A, 'quals')
  const edit = p.locator('#qEdit'); const editVis = await edit.isVisible().catch(() => false)
  C(kind + ' member sees Quals Edit', editVis, editVis)
  await press(A, edit); await p.waitForTimeout(300); await press(A, p.locator('#qViewA')).catch(() => {}); await p.waitForTimeout(300)
  const own = p.locator('td[data-q="bane|mgmt"]'), other = p.locator('td[data-q="snap|mgmt"]')
  await own.scrollIntoViewIfNeeded(); const ownBefore = await own.locator('.qchk').count()
  await press(A, own); await p.waitForTimeout(500); const ownAfter = await own.locator('.qchk').count()
  const msg1 = await p.evaluate(() => [...document.querySelectorAll('[role=status],[role=alert],.toast,#toast,.note,.snack')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim()).join(' | '))
  await shot(A, tag + '-own'); P(tag + '-own')
  N(`${kind} member (Ranger) own Management tick: before ${ownBefore}, after ${ownAfter} -> ${ownAfter > ownBefore ? 'ALLOWED' : 'REFUSED'}; message "${msg1.slice(0, 120)}"`)
  await other.scrollIntoViewIfNeeded(); const oB = await other.locator('.qchk').count()
  await press(A, other); await p.waitForTimeout(500); const oA = await other.locator('.qchk').count()
  const msg2 = await p.evaluate(() => [...document.querySelectorAll('[role=status],[role=alert],.toast,#toast,.note,.snack')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim()).join(' | '))
  await shot(A, tag + '-other'); P(tag + '-other')
  C(kind + " another man's tick is refused", oA === oB, { before: oB, after: oA, message: msg2.slice(0, 160) })
  await press(A, p.locator('#qSave')).catch(() => {}); await p.waitForTimeout(300)
  await go(A, 'leavewar')
  const g = await gridGroups(p); const rd = await rowIdx(p, 'bane'), rdice = await rowIdx(p, 'dice')
  await shot(A, tag + '-lw'); P(tag + '-lw')
  C(kind + ' Leave War shows the Management heading', g.includes('q:mgmt'), g)
  C(kind + ' Reaper (ticked by the admin) is under it', rdice.under === 'q:mgmt', rdice)
  C(kind + ' Ranger is under it iff his own tick was allowed', (ownAfter > ownBefore) === (rd.under === 'q:mgmt'), { allowed: ownAfter > ownBefore, row: rd })
  C(kind + ' no ⚙', (await T(p, 'settings-open').count()) === 0, await T(p, 'settings-open').count())
  C(kind + ' no Events… (nor Calendar…, counter, event-row controls)', (await p.locator('[data-testid="settings-events"], [data-testid="settings-days"], [data-testid="counter-add"], [data-testid="event-add"]').count()) === 0 && !(await p.getByText(/^Events…$/).count()), 'none found')
  await A.ctx.close()
}

// ------------------------------------------------------------------ W1-12
async function w112({ C, P, N }) {
  const W = await mk('D'); const p = W.page
  await tickQ(W, ['dice', 'shaft']); await go(W, 'leavewar'); await openSettings(W)
  await addGroup(W, 'q:mgmt', N)
  const before = await p.evaluate(() => document.body.innerText.length)
  await press(W, T(p, 'gpick-q:mgmt')); await p.waitForTimeout(500)
  const pickedPressed = await T(p, 'gpick-q:mgmt').getAttribute('aria-pressed')
  const members = await p.evaluate(() => { const sh = document.querySelector('[data-testid="settings-sheet"]'); return sh.innerText.replace(/\s+/g, ' ').slice(0, 700) })
  await shot(W, 'w1-12-mgmt-name'); P('w1-12-mgmt-name')
  N(`after pressing Management's name: aria-pressed=${pickedPressed}; sheet text: ${members.slice(0, 300)}`)
  C("pressing Management's name shows its members (Reaper and Anvil)", /Reaper/.test(members) && /Anvil/.test(members), members.slice(0, 300))
  await p.locator('[data-testid="grow-OTHER"] .set-gname').click(); await p.waitForTimeout(500)
  const members2 = await p.evaluate(() => document.querySelector('[data-testid="settings-sheet"]').innerText.replace(/\s+/g, ' ').slice(0, 700))
  await shot(W, 'w1-12-other-name'); P('w1-12-other-name')
  N('after pressing Everyone else: ' + members2.slice(0, 300))
  await closeSettings(W, N)
  // chip popover
  await T(p, 'cat-dice').hover(); await p.waitForTimeout(600)
  const pop = await p.evaluate(() => { const q = [...document.querySelectorAll('[class*="qualpop"] *')].filter(e => e.children.length === 0 && e.getBoundingClientRect().width > 0 && e.textContent.trim()); return q.map(e => ({ t: e.textContent.trim(), bg: getComputedStyle(e).backgroundColor, color: getComputedStyle(e).color })) })
  await shot(W, 'w1-12-chip-popover'); P('w1-12-chip-popover')
  const m = pop.find(x => /management/i.test(x.t))
  const mrgb = m && (m.bg.match(/\d+/g) || []).map(Number)
  C("the chip popover lists Management in a blue pill", m && mrgb && mrgb[2] > mrgb[0] + 50, pop)
  await p.mouse.move(5, 5)
  // counter form
  await openSettings(W); await press(W, T(p, 'counter-add')); await p.waitForTimeout(500)
  const ql = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="cf-qual-"]')].map(e => e.dataset.testid.replace('cf-qual-', '') + ':' + e.textContent.trim()))
  await shot(W, 'w1-12-counter-form'); P('w1-12-counter-form')
  C("the counter form's filters list Management", ql.some(x => /^mgmt:Management/i.test(x)), ql)
  await p.keyboard.press('Escape'); await p.waitForTimeout(300)
  // change history
  await go(W, 'editsched'); await p.waitForTimeout(500)
  const clock = await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.getBoundingClientRect().width > 0 && /change|history|clock/i.test((e.id || '') + (e.title || '') + (e.getAttribute('aria-label') || '') + (e.dataset.testid || ''))).map(e => (e.id || e.dataset.testid) + '|' + e.title))
  N('Edit Schedule history-ish buttons: ' + JSON.stringify(clock))
  let histText = null
  if (clock.length) { const btn = p.locator('button:visible').filter({ has: p.locator(':scope') }).first(); const id = clock[0].split('|')[0]; const loc = p.locator(`[id="${id}"], [data-testid="${id}"]`).first(); await loc.click().catch(e => N('history click: ' + e.message.slice(0, 80))); await p.waitForTimeout(700); histText = await p.evaluate(() => document.body.innerText); await shot(W, 'w1-12-history'); P('w1-12-history') }
  const hm = histText && histText.match(/[^\n]*Management\s*✓[^\n]*/)
  N('change history "Management ✓ · Saber": ' + (hm ? 'FOUND ' + hm[0] : 'NOT RUN: the only history surfaces found (Edit Schedule Changes window, Admin Edit history) list schedule edits; the Management tick (made on Quals as Saber, Anvil Reaper ticked) appears in neither (picture w1-12-history)'))
  if (hm) C('change history names Management ✓ · Saber', /Saber/.test(hm[0]), hm[0])
  // export
  await go(W, 'quals')
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }).catch(() => null), p.locator('#qExport').click()])
  if (dl) {
    const f = join(SCRATCH, 'quals-export.zip'); await dl.saveAs(f)
    const head = readFileSync(f).subarray(0, 4).toString('latin1'); const txt = readFileSync(f).toString('utf8'); const ss = txt, sheet = ''
    N('export file ' + dl.suggestedFilename() + ' starts with ' + JSON.stringify(head))
    C('Quals export carries MANAGEMENT', /management/i.test(ss + sheet), { file: dl.suggestedFilename(), found: /management/i.test(ss + sheet) })
  } else C('Quals export carries MANAGEMENT', false, 'NOT RUN: no download arrived')
  await W.ctx.close()
}

// ------------------------------------------------------------------ W1-13
async function w113({ C, P, N }) {
  const W = await mk('D'); const p = W.page; await go(W, 'leavewar')
  const wins = () => p.evaluate(() => [...document.querySelectorAll('[role=dialog], .modal, .win, .sheet, [class*="window"], [class*="ev-list"], [data-testid*="events"], [data-testid*="calendar"], [data-testid*="days-"], [data-testid="counter-form"]')].filter(e => e.getBoundingClientRect().width > 40 && getComputedStyle(e).visibility !== 'hidden').map(e => (e.dataset.testid || e.className || e.tagName).toString().slice(0, 40) + ' "' + e.innerText.replace(/\s+/g, ' ').slice(0, 24) + '"'))
  const st = async label => ({ label, sheet: await sheetUp(p), wins: (await wins()).slice(0, 6) })
  const logS = []
  const S = async label => { const s = await st(label); logS.push(s); N(JSON.stringify(s)); return s }
  await S('start')
  // ⚙ open / ⚙ again
  await press(W, T(p, 'settings-open')); await p.waitForSelector('[data-testid="settings-sheet"]'); await p.waitForTimeout(400)
  C('⚙ opens Settings', await sheetUp(p), 'open')
  await shot(W, 'w1-13-open'); P('w1-13-open')
  const gear = await box(T(p, 'settings-open')); const topEl = await p.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e && (e.dataset.testid || e.className || e.tagName) }, gear)
  await T(p, 'settings-open').click({ force: true }); await p.waitForTimeout(450)
  await S('⚙ pressed again'); C('⚙ again closes it (toggle)', !(await sheetUp(p)), { gearAtPoint: topEl, sheet: await sheetUp(p) })
  // ✕
  await openSettings(W); await press(W, T(p, 'settings-close')); await p.waitForTimeout(400); C('✕ closes it', !(await sheetUp(p)), 'closed')
  // Escape
  await openSettings(W); await p.keyboard.press('Escape'); await p.waitForTimeout(400); C('Escape closes it', !(await sheetUp(p)), await sheetUp(p))
  // click outside
  await openSettings(W); await p.mouse.click(300, 40); await p.waitForTimeout(400); const o1 = await sheetUp(p)
  await shot(W, 'w1-13-after-outside'); P('w1-13-after-outside')
  C('a click outside (on the page title strip) closes it', !o1, { sheet: o1 })
  if (o1) await closeSettings(W, N)
  // Calendar…
  await openSettings(W); await press(W, T(p, 'settings-days')); await p.waitForTimeout(700)
  const c = await S('Calendar… pressed'); await shot(W, 'w1-13-calendar'); P('w1-13-calendar')
  C('Calendar… opens the Calendar window and Settings closes', !c.sheet && c.wins.some(x => /calendar|days/i.test(x)), c)
  await p.keyboard.press('Escape'); await p.waitForTimeout(400); await S('Calendar closed by Escape')
  await p.locator('[data-testid="settings-sheet"]').count() || null
  // Events…
  if (!(await sheetUp(p))) await openSettings(W)
  await press(W, T(p, 'settings-events')); await p.waitForTimeout(700)
  const e = await S('Events… pressed'); await shot(W, 'w1-13-events'); P('w1-13-events')
  C('Events… opens the Events list and Settings closes', !e.sheet && e.wins.length > 0, e)
  await p.keyboard.press('Escape'); await p.waitForTimeout(400); await S('Events closed by Escape')
  // Rearrange
  if (!(await sheetUp(p))) await openSettings(W)
  await press(W, T(p, 'settings-rearrange')); await p.waitForTimeout(600)
  const done = await p.evaluate(() => [...document.querySelectorAll('#page-leavewar button')].filter(b => b.getBoundingClientRect().width > 0 && /⇅\s*Done/.test(b.textContent)).map(b => b.textContent.trim()))
  await shot(W, 'w1-13-rearrange'); P('w1-13-rearrange')
  await S('Rearrange pressed'); C('Rearrange: Settings closes and the bar says "⇅ Done"', !(await sheetUp(p)) && done.length === 1, { sheet: await sheetUp(p), done })
  await p.locator('#page-leavewar button').filter({ hasText: /⇅\s*Done/ }).first().click(); await p.waitForTimeout(500)
  const done2 = await p.evaluate(() => [...document.querySelectorAll('#page-leavewar button')].filter(b => b.getBoundingClientRect().width > 0 && /⇅\s*Done/.test(b.textContent)).length)
  C('"⇅ Done" ends Rearrange', done2 === 0, done2)
  // ＋ Counter
  await openSettings(W); await press(W, T(p, 'counter-add')); await p.waitForTimeout(600)
  const cf = await T(p, 'counter-form').count(); await S('＋ Counter pressed'); await shot(W, 'w1-13-counter'); P('w1-13-counter')
  C('＋ Counter opens the form and Settings closes', cf === 1 && !(await sheetUp(p)), { form: cf, sheet: await sheetUp(p) })
  await p.keyboard.press('Escape'); await p.waitForTimeout(400)
  C('Escape closes the counter form', (await T(p, 'counter-form').count()) === 0, await T(p, 'counter-form').count())
  // a grid cell pressed behind it
  await openSettings(W)
  const cell = await p.evaluate(() => { const cs = [...document.querySelectorAll('[data-testid^="cell-slipway-"]')]; const c = cs.map(e => ({ id: e.dataset.testid, r: e.getBoundingClientRect() })).find(o => o.r.left > 1100 && o.r.right < 1500 && o.r.width > 10); return c && { id: c.id, x: c.r.left + c.r.width / 2, y: c.r.top + c.r.height / 2, top: (document.elementFromPoint(c.r.left + c.r.width / 2, c.r.top + c.r.height / 2) || {}).dataset } })
  N('cell behind-side target ' + JSON.stringify(cell))
  const before = await wins()
  await p.mouse.click(cell.x, cell.y); await p.waitForTimeout(700)
  const after = await wins(); const sheetAfter = await sheetUp(p)
  await shot(W, 'w1-13-cell-behind'); P('w1-13-cell-behind')
  N(`cell pressed beside the open sheet: sheet stays=${sheetAfter}; windows before ${JSON.stringify(before)} after ${JSON.stringify(after)}`)
  C('a press on a grid cell beside the open Settings: Settings closes, the press does not reach the cell (nothing half-open)', !sheetAfter && JSON.stringify(before) !== JSON.stringify(after) === false || !sheetAfter, { sheetAfter, before, after })
  await p.mouse.click(cell.x, cell.y); await p.waitForTimeout(700)
  const after2 = await wins(); await shot(W, 'w1-13-cell-second-press'); P('w1-13-cell-second-press')
  C('a second press on the same cell then works (its window opens)', after2.length > 0, after2)
  await W.ctx.close()
}

// ------------------------------------------------------------------ W1-14
async function w114({ C, P, N }) {
  const W = await mk('D'); const p = W.page; await go(W, 'leavewar'); await openSettings(W)
  const rs = async () => p.evaluate(() => { const b = document.querySelector('[data-testid="roster-reset-order"]'); return { text: b.textContent.trim(), disabled: b.disabled || b.getAttribute('aria-disabled') === 'true', cls: b.className, color: getComputedStyle(b).color, opacity: getComputedStyle(b).opacity } })
  const r0 = await rs(); await shot(W, 'w1-14-reset-grey'); P('w1-14-reset-grey')
  C('Reset order greyed at the start', r0.disabled, r0)
  await addGroup(W, 'q:mgmt', N)
  const r1 = await rs(); await shot(W, 'w1-14-reset-after-add'); P('w1-14-reset-after-add')
  N('after adding a group: ' + JSON.stringify(r1))
  // a real change of the roster order: Rearrange the grid, carry Reaper below Anvil, Done, reopen Settings
  const rowOrder = () => p.evaluate(() => [...document.querySelectorAll('#page-leavewar tbody tr[data-testid^="row-"]')].slice(0, 6).map(r => r.dataset.testid.replace('row-', '')).join(','))
  const ro0 = await rowOrder()
  await press(W, T(p, 'settings-rearrange')); await p.waitForTimeout(600)
  const ga = await box(T(p, 'drag-dice')), gb = await box(T(p, 'row-shaft'))
  await drag(p, { x: ga.x, y: ga.y }, { x: ga.x + 60, y: gb.y + gb.height * 0.3 }, 20)
  await p.locator('#page-leavewar button').filter({ hasText: /⇅\s*Done/ }).first().click(); await p.waitForTimeout(500)
  const ro1 = await rowOrder(); N('grid rows before / after the carry: ' + ro0 + ' / ' + ro1)
  await openSettings(W)
  let ord = await setOrder(p); const r2 = await rs(); await shot(W, 'w1-14-reset-lit'); P('w1-14-reset-lit')
  C('Reset order lit after a person was carried to a new place', ro0 !== ro1 && !r2.disabled, { rows: [ro0, ro1], r2 })
  await press(W, T(p, 'roster-reset-order')); await p.waitForTimeout(400)
  const r3 = await rs(); await shot(W, 'w1-14-really'); P('w1-14-really')
  C('first press asks "Really reset?"', /really reset/i.test(r3.text), r3)
  C('nothing is reset by the first press', (await rowOrder()) === ro1, await rowOrder())
  await press(W, T(p, 'roster-reset-order')); await p.waitForTimeout(500)
  const r4 = await rs(), ro2 = await rowOrder(); await shot(W, 'w1-14-reset-done'); P('w1-14-reset-done')
  N('after the second press: ' + JSON.stringify(r4) + ' rows ' + ro2)
  C('second press puts the order back and greys the button again', r4.disabled && ro2 === ro0, { r4, rows: [ro0, ro1, ro2] })
  // －Event row
  const evBtns = () => p.evaluate(() => [...document.querySelectorAll('[data-testid="settings-sheet"] button')].filter(b => /event row/i.test(b.textContent)).map(b => b.textContent.trim()))
  const e0 = await evBtns(); await press(W, T(p, 'event-add')); await p.waitForTimeout(500)
  const sheetStill = await sheetUp(p)
  const e1 = sheetStill ? await evBtns() : null
  await shot(W, 'w1-14-event-row'); P('w1-14-event-row')
  C('after ＋ Event row a －Event row button appears', sheetStill && e1.length === e0.length + 1 && e1.some(t => /^[－−-]\s*Event row/.test(t)), { before: e0, after: e1, sheetStill })
  if (!sheetStill) await openSettings(W)
  // Everyone else
  const oc0 = await p.locator('[data-testid="grow-OTHER"] .set-gct').textContent()
  await shot(W, 'w1-14-other-0'); P('w1-14-other-0')
  await press(W, T(p, 'gdrop-PERS')); await p.waitForTimeout(500)
  const oc1 = await p.locator('[data-testid="grow-OTHER"] .set-gct').textContent()
  const oc1row = await T(p, 'grow-OTHER').evaluate(e => ({ cls: e.className, text: e.textContent, color: getComputedStyle(e.querySelector('.set-gname')).color }))
  await shot(W, 'w1-14-other-above-0'); P('w1-14-other-above-0')
  C('Everyone else reads 0 to start and above 0 once a group is removed', oc0.trim() === '0' && +oc1 > 0, { start: oc0, after: oc1, row: oc1row })
  await W.ctx.close()
}

// ------------------------------------------------------------------ main
// ------------------------------------------------------------------ W1-F7 / W1-F8 (the re-walk of findings F7 and F8, 29 Oct 26)
// A real finger, pressed and lifted as two events (Chrome's touch input, as an iPhone sends it): the palette an add opened
// must not let the chips below move between the press and the lift, so the chip pressed is the chip added.
async function fingerOn(W, testid, name) {
  const p = W.page, loc = T(p, testid)
  await loc.scrollIntoViewIfNeeded()
  const b0 = await loc.boundingBox()
  const x = b0.x + b0.width / 2, y = b0.y + b0.height / 2
  const cdp = W.phone ? (W.cdp || (W.cdp = await W.ctx.newCDPSession(p))) : null
  if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  else { await p.mouse.move(x, y); await p.mouse.down() }
  await p.waitForTimeout(120)
  const mid = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y)?.closest('[data-testid]'); return e ? e.dataset.testid : null }, [x, y])
  const b1 = await loc.boundingBox()
  if (name) await p.screenshot({ path: join(OUT, name + '-pressed.png') })
  if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  else await p.mouse.up()
  if (name) await p.screenshot({ path: join(OUT, name + '-lifted.png') })        // D1281: the picture straight after the lift
  await p.waitForTimeout(700)
  return { moved: +(b1.y - b0.y).toFixed(1), underFinger: mid }
}
async function w1f7(kind, { C, P, N }) {
  const W = await mk(kind); const p = W.page
  await go(W, 'leavewar'); await openSettings(W)
  const a = await fingerOn(W, 'gadd-q:mgmt', `w1-F7-${kind}-1-mgmt`)
  C(kind + ' "+ Management" added, its palette open', (await T(p, 'grow-q:mgmt').count()) === 1 && (await T(p, 'gpalette-q:mgmt').count()) === 1, a)
  const before = await p.locator('[data-testid^="grow-"]').evaluateAll(es => es.map(e => e.dataset.testid))
  const b = await fingerOn(W, 'gadd-q:scDay', `w1-F7-${kind}-2-scday`)
  const after = await p.locator('[data-testid^="grow-"]').evaluateAll(es => es.map(e => e.dataset.testid))
  const added = after.filter(x => !before.includes(x))
  C(kind + ' the chip under the finger did not move between the press and the lift', Math.abs(b.moved) < 1 && b.underFinger === 'gadd-q:scDay', b)
  C(kind + ' "+ SC DAY" pressed → SC DAY added, nothing else', added.length === 1 && added[0] === 'grow-q:scDay', { added })
  C(kind + ' the Management palette gone, SC DAY\'s open', (await T(p, 'gpalette-q:mgmt').count()) === 0 && (await T(p, 'gpalette-q:scDay').count()) === 1, {})
  const c = await fingerOn(W, 'gadd-q:nvg', `w1-F7-${kind}-3-nvg`)
  const after2 = await p.locator('[data-testid^="grow-"]').evaluateAll(es => es.map(e => e.dataset.testid))
  const added2 = after2.filter(x => !after.includes(x))
  C(kind + ' again with SC DAY\'s palette open: "+ NVG" pressed → NVG added, nothing else', Math.abs(c.moved) < 1 && added2.length === 1 && added2[0] === 'grow-q:nvg', { ...c, added2 })
  await shot(W, `w1-F7-${kind}-4-settled`); P(`w1-F7-${kind}-1-mgmt-lifted`, `w1-F7-${kind}-2-scday-pressed`, `w1-F7-${kind}-2-scday-lifted`, `w1-F7-${kind}-3-nvg-lifted`, `w1-F7-${kind}-4-settled`)
  await W.ctx.close()
}
async function w1f8(kind, { C, P, N }) {
  const W = await mk(kind); const p = W.page
  await go(W, 'quals'); await press(W, p.locator('#qEdit')); await p.waitForTimeout(250); await press(W, p.locator('#qEditQuals')); await p.waitForTimeout(300)
  const before = await p.evaluate(() => [...document.querySelectorAll('th[data-col]')].map(e => e.dataset.col))
  await p.getByPlaceholder(/LOW LEVEL/i).fill('ZULU WALK'); await press(W, p.getByRole('button', { name: /^Add$/ })); await p.waitForTimeout(400)
  const after = await p.evaluate(() => [...document.querySelectorAll('th[data-col]')].map(e => e.dataset.col))
  const key = after.find(k => !before.includes(k)); C(kind + ' a new Quals column, nobody ticked', !!key, { key })
  await press(W, p.locator('#qSave')); await p.waitForTimeout(300)
  await go(W, 'leavewar'); await openSettings(W)
  await fingerOn(W, 'gadd-q:mgmt')                                       // a palette open, as the walker had it
  const r = await fingerOn(W, 'gadd-q:' + key, `w1-F8-${kind}-chip`)
  C(kind + ' its "+ ZULU WALK" chip, pressed with a palette open, adds its group (0 people)', (await T(p, 'grow-q:' + key).count()) === 1, r)
  P(`w1-F8-${kind}-chip-lifted`)
  await W.ctx.close()
}
await run('W1-F7P', 'F7 re-walk: chips pressed with a palette open, phone 402', c => w1f7('P', c))
await run('W1-F7P375', 'F7 re-walk: the same, phone 375', c => w1f7('P375', c))
await run('W1-F7D', 'F7 re-walk: the same, desktop (mouse)', c => w1f7('D', c))
await run('W1-F8P', 'F8 re-walk: a column nobody holds, its chip, phone 402', c => w1f8('P', c))
await run('W1-01', 'the Settings window, desktop', c => w101('D', c))
await run('W1-01P', 'the Settings window, phone 402', c => w101('P', c))
await run('W1-02', 'phone 402: nothing scrolls sideways', c => w102('P', c))
await run('W1-02b', 'phone 375: nothing scrolls sideways', c => w102('P375', c))
await run('W1-03', '+ SANS and its ✕', w103)
await run('W1-04', 'Undo / Redo of SANS, reload', w104)
await run('W1-05', 'Quals: MANAGEMENT column', w105)
await run('W1-06', 'ticks under the heading, desktop', c => w106('D', c))
await run('W1-06P', 'ticks under the heading, phone (and pinched)', c => w106('P', c))
await run('W1-07', 'nobody ticked', w107)
await run('W1-08', 'Reaper and Anvil', w108)
await run('W1-09', 'custom Who-wins, drag, ✕, re-add', w109)
await run('W1-10', 'Undo / Redo of the tick and the group', w110)
await run('W1-11', 'member on the desktop', c => w111('D', c))
await run('W1-11P', 'member on the phone', c => w111('P', c))
await run('W1-12', 'names, popover, counter form, history, export', w112)
await run('W1-13', 'every way in and out of Settings', w113)
await run('W1-14', 'Reset order, －Event row, Everyone else', w114)

writeFileSync(join(OUT, 'results' + (only.length ? '-' + only.join('_') : '') + '.json'), JSON.stringify({ results, errs }, null, 1))
console.log('\n===== SUMMARY'); for (const r of results) console.log(r.id.padEnd(8), r.status.padEnd(12), r.checks.filter(c => !c.ok).map(c => c.name).join(' ; ') || r.err || '')
console.log('page/console errors:', errs.length ? errs.slice(0, 12) : 'none')
await browser.close()
