// [POSTOUT-RUN-NOTICE] — THE WALK of the posting-out bell line (D1546, D1547, D1690, D1691), on the frozen build of
// claude/postout-bell-look. Built from the drawing's own steps (docs/mock/2026-11-05-postout-bell/draw.mjs), so it reaches
// the drawn world through the same controls: at his PC's 1536 × 864 (Chromium) and his iPhone's 402 × 874 (WebKit, touch).
//   A. Today (the real clock), as Saber: Hex made an admin on Admin → Users (so "every admin" is two people); four men
//      posted out from Mon 16 Nov on the Leave War's one-day sheet (⋯ → Post out) — Overseas Sqn (Ranger, who holds a
//      sign-in), Delete, SANS, and no outcome chip (off the manpower).
//   B. The clock moved to Mon 16 Nov 08:00, the app opened again: the postings run by themselves. Then, each step asserted
//      in what the screen shows and pictured (a phone tap also pictured right after the lift — §7.10):
//      B1 the bell lit · B2 its list: the four lines, in his words, in the drawn order, each one line of words ·
//      B3 Ranger's line → Admin → Users, the Archived fold open, his row in view and ringed clear of his name ·
//      B4 the ring gone after its six seconds · B5 Cinch's line (SANS), tapped from Admin → Users itself · B6 Cobra's (off
//      the manpower) · B7 Trident's (deleted): nothing opens, the line read, the list still there · B8 Mark all read ·
//      B9 the list closed by each of its ways · B10 a reload: the lines kept, read, not told again ·
//      B11 (desktop) the member view hides them and the admin view brings them back · B12 Hex, the other admin, signed in:
//      his own four lines · B13 a member (Outlaw) signed in: none.
// Usage (from raptor-port/): WALK_DIR=<frozen dist> [PBW_OUT=<folder>] [ONLY=desk|phone] node scripts/handpass/pbw-walk.mjs
import { chromium, webkit } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serveFrozen } from './isr-serve.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.env.PBW_OUT || join(HERE, '../../docs/img/handpass/2026-11-05-postout-bell')
mkdirSync(OUT, { recursive: true })
const URL = 'http://localhost:4393/'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ISO = '2026-11-16', DAYWORDS = 'Mon 16 Nov'
const RUN_AT = new Date('2026-11-16T08:00:00')
const SIZES = {
  desk: { engine: chromium, opts: { viewport: { width: 1536, height: 864 } }, tap: false },
  phone: { engine: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true }, tap: true },
}
const results = [], errs = [], log = []
const say = l => { log.push(l); console.log(l) }
const check = (size, step, ok, what) => { results.push({ size, step, ok: !!ok, what }); say(`${ok ? 'PASS' : 'FAIL'} [${size}] ${step} — ${what}`) }

async function open(size, state, user = 'ad', pass = 'a') {
  const s = SIZES[size]
  const b = await s.engine.launch()
  const ctx = await b.newContext({ ...s.opts, deviceScaleFactor: 2, ...(state ? { storageState: state } : {}) })
  await serveFrozen(ctx, URL)
  const page = await ctx.newPage()
  if (state) await page.clock.install({ time: RUN_AT })
  page.on('pageerror', e => errs.push(`[${size}] page error ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${size}] console ${m.text()}`); if (/PBW-DEBUG/.test(m.text())) say(m.text()) })
  page.on('dialog', d => d.dismiss().catch(() => {}))
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await signIn(page, user, pass)
  return { b, ctx, page, tap: s.tap }
}
async function signIn(page, user, pass) {
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(900)
}
const go = async (page, p) => { await page.evaluate(p => window.go(p), p); await page.waitForFunction(p => window.CURPAGE === p, p); await sleep(500) }
async function press(page, tap, sel) {
  const l = page.locator(sel).filter({ visible: true }).last()
  if (!(await l.count())) throw new Error('premise: nothing to press — ' + sel)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (tap) await l.tap(); else await l.click()
  await sleep(tap ? 650 : 300)
}
const sheet = '.bidsheet[role="dialog"]'
async function closeSheets(page) {
  for (let i = 0; i < 4; i++) { const x = page.locator(`${sheet} button.x:visible`).last(); if (!(await x.count())) break; await x.click().catch(() => {}); await sleep(350) }
}
async function lwOpen(page) {
  await go(page, 'leavewar')
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await sleep(500)
  const bar = page.locator('[data-testid="figures-toggle"]')
  if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') { await bar.click(); await sleep(300) }
  const m = page.locator('[data-testid="month-NOV"]:visible').first()
  if (await m.count()) { await m.click(); await sleep(900) }
}
async function tapCell(page, tap, id) {
  const c = page.locator(`[data-testid="cell-${id}-${ISO}"]`).first()
  if (!(await c.count())) throw new Error(`premise: no box for ${id} on ${ISO}`)
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  const at = await c.evaluate(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const h = document.elementFromPoint(x, y); return { x, y, ok: !!h && (h === e || e.contains(h)) } })
  if (!at.ok) throw new Error(`premise: ${id} ${ISO} is covered`)
  if (tap) await page.touchscreen.tap(at.x, at.y); else await page.mouse.click(at.x, at.y)
  await sleep(700)
}
async function postOut(page, tap, id, outcome) {
  await tapCell(page, tap, id)
  await press(page, tap, `${sheet} [data-testid="bid-more"]`)
  await press(page, tap, '[data-testid="bid-postout"]')
  if (outcome === 'none') await press(page, tap, `${sheet} [data-testid="po-overseas"]`)          // the lit default, off
  else if (outcome !== 'overseas') await press(page, tap, `${sheet} [data-testid="po-${outcome}"]`)
  const line = await page.evaluate(() => { const e = [...document.querySelectorAll('.bidsheet .note')].find(x => x.getBoundingClientRect().height > 0 && /^On /.test(x.textContent.trim())); return e ? e.textContent.trim() : '' })
  await press(page, tap, `${sheet} [data-testid="po-confirm"]`)
  if (outcome === 'delete') await press(page, tap, '[data-testid="po-delete-go"]')
  await sleep(600); await closeSheets(page)
  return line
}
const bellBtn = page => page.locator('.bellbtn').filter({ visible: true }).first()
async function openBell(page, tap) {
  const listUp = await page.locator('[data-testid="bell-list"]').isVisible().catch(() => false)
  if (listUp) return
  if (tap) await bellBtn(page).tap(); else await bellBtn(page).click()
  await page.waitForSelector('[data-testid="bell-list"]'); await sleep(450)
}
async function neutral(page, tap) {
  await page.evaluate(() => { const a = document.activeElement; if (a && a !== document.body) a.blur() })
  if (!tap) await page.mouse.move(2, 400)
  await sleep(150)
}
const shot = (page, size, name) => page.screenshot({ path: join(OUT, `${name}-${size}.png`) })
/* the bell's lines as drawn: name, day, what, age, unread, one line of words? */
const lines = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map(l => {
  const w = l.querySelector('.bl-what'), r = w.getBoundingClientRect(), lh = parseFloat(getComputedStyle(w).lineHeight) || 16
  return { id: l.getAttribute('data-testid').slice('bell-line-'.length), name: l.querySelector('.bl-name').textContent, day: l.querySelector('.bl-day').textContent,
    what: w.textContent, ago: l.querySelector('.bl-ago').textContent, unread: l.classList.contains('unread'), oneLine: r.height < lh * 1.6, h: Math.round(l.getBoundingClientRect().height) }
}))
const poOf = (ls, cs) => ls.filter(l => l.name === cs && /^Posted out · /.test(l.what))
/* tap a line of the list as a person does, at its middle; a phone also pictured right after the lift (§7.10) */
async function tapLine(page, size, tap, id, pic) {
  const l = page.locator(`[data-testid="bell-line-${id}"]`)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  const b = await l.boundingBox()
  if (tap) { await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(90); await shot(page, size, pic + '-lift') }
  else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await sleep(700)
}
/* the ringed row on Admin → Users: in view, not under the top bar, the ring clear of the name */
const ringState = (page, pid) => page.evaluate(pid => {
  const r = [...document.querySelectorAll(`#page-admin .acc-row[data-person="${pid}"]`)].find(x => x.getBoundingClientRect().height > 0)
  if (!r) { console.log('PBW-DEBUG no row', pid, JSON.stringify({ rows: document.querySelectorAll(`.acc-row[data-person="${pid}"]`).length, fold: document.querySelector('#accArchToggle')?.getAttribute('aria-expanded'), cat: document.querySelector('.adm-cat.on')?.textContent, users: !!document.querySelector('#admUsers.on'), drilled: !!document.querySelector('.adm-shell.drilled'), archived: !!window.PEOPLE[pid]?.archived })); return null }
  const b = r.getBoundingClientRect(), name = r.querySelector('.acc-name').getBoundingClientRect()
  const topbar = document.querySelector('.topbar')
  const barBottom = topbar ? topbar.getBoundingClientRect().bottom : 0
  const hit = document.elementFromPoint(b.left + 12, b.top + 6)
  const cs = getComputedStyle(r)
  return { ringed: r.classList.contains('acc-ring'), shadow: cs.boxShadow, top: Math.round(b.top), bottom: Math.round(b.bottom), vh: innerHeight,
    barBottom: Math.round(barBottom), nameGap: Math.round(name.left - b.left), uncovered: !!hit && (hit === r || r.contains(hit)),
    archived: r.getAttribute('data-archived') === '1', fold: (document.querySelector('#accArchToggle') || {}).getAttribute?.('aria-expanded') ?? null }
}, pid)

const report = {}
for (const size of (process.env.ONLY ? [process.env.ONLY] : ['desk', 'phone'])) {
  /* ---- A. today: Hex made an admin; four men posted out ---- */
  let { b, ctx, page, tap } = await open(size)
  await go(page, 'admin')
  const users = page.locator('.adm-cat').filter({ hasText: 'Users' }).first()
  if (await users.count()) { if (tap) await users.tap(); else await users.click(); await sleep(600) }
  await press(page, tap, '#page-admin .acc-row[data-person="rocky"] .acc-tap')
  await page.selectOption('#accEdRole', 'admin'); await sleep(200)
  await press(page, tap, '#accEdSave')
  const hexAdmin = await page.evaluate(() => /Admin/.test(document.querySelector('#page-admin .acc-row[data-person="rocky"]').textContent))
  check(size, 'A0', hexAdmin, 'Hex made an admin on Admin → Users')
  const cs = await page.evaluate(() => Object.fromEntries(Object.keys(window.PEOPLE).map(id => [id, window.PEOPLE[id].cs])))
  const men = await page.evaluate(() => Object.keys(window.PEOPLE).filter(id => { const p = window.PEOPLE[id]; return !p.special && !p.archived && !p.san && !p.deleted && !p.pers }))
  await lwOpen(page)
  const onGrid = new Set(await page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(r => r.getAttribute('data-testid').slice(4))))
  /* the drawing's four men: Ranger (bane, a sign-in), then three on the grid without one */
  const pick = ['bane', ...men.filter(id => !['bane', 'stiff', 'rocky', 'casper'].includes(id) && onGrid.has(id)).slice(6, 9)]
  const plan = [['overseas', pick[0]], ['delete', pick[1]], ['sans', pick[2]], ['none', pick[3]]]
  for (const [outcome, id] of plan) say(`[${size}] posted out ${cs[id]} (${id}) — ${outcome} — the sheet said "${await postOut(page, tap, id, outcome)}"`)
  await openBell(page, tap)
  const before = poOf(await lines(page), cs.bane).length
  check(size, 'A1', before === 0, `before the date the bell has no posting line (${before})`)
  if (tap) await bellBtn(page).tap(); else await bellBtn(page).click()
  const state = await ctx.storageState()
  await b.close()

  /* ---- B. Mon 16 Nov 08:00: the app opened again ---- */
  ;({ b, ctx, page, tap } = await open(size, state))
  await sleep(1500)
  const ran = await page.evaluate(ids => ids.map(id => { const p = window.PEOPLE[id]; return { id, archived: !!p?.archived, san: !!p?.san, deleted: !!p?.deleted } }), pick)
  say(`[${size}] after the clock moved: ${JSON.stringify(ran)}`)
  const lit = await bellBtn(page).evaluate(e => e.classList.contains('on') || !!e.querySelector('.dot, .bell-dot'))
  check(size, 'B1', lit, 'the bell is lit')
  await shot(page, size, 'b1-bell-lit')
  await openBell(page, tap); await neutral(page, tap)
  let ls = await lines(page)
  const want = [
    [pick[0], `Posted out · archived, account suspended`],
    [pick[1], `Posted out · deleted`],
    [pick[2], `Posted out · now SANS`],
    [pick[3], `Posted out · off the manpower`],
  ]
  const poAll = ls.filter(l => /^Posted out · /.test(l.what))
  /* (each man's line found by his name — never by its place, which B2b checks on its own) */
  const po = want.map(([id]) => poAll.find(l => l.name === cs[id])).filter(Boolean)
  check(size, 'B2a', poAll.length === 4 && po.length === 4, `four posting lines (${poAll.map(l => `${l.name} · ${l.day} / ${l.what}`).join(' | ')})`)
  check(size, 'B2b', want.every(([id, w], i) => poAll[i] && poAll[i].name === cs[id] && poAll[i].what === w && poAll[i].day === DAYWORDS), 'each in his words, the man first, Mon 16 Nov, in the drawn order')
  check(size, 'B2c', poAll.every(l => l.unread && l.oneLine), `each unread and its words on one line (heights ${poAll.map(l => l.h).join(', ')})`)
  check(size, 'B2d', ls.findIndex(l => l.id === poAll[0]?.id) === 0, 'the posting lines first in the list')
  await shot(page, size, 'b2-bell-list')
  const listBox = await page.locator('[data-testid="bell-list"]').boundingBox()
  if (listBox) await page.screenshot({ path: join(OUT, `b2-bell-list-close-${size}.png`), clip: { x: Math.max(0, listBox.x - 12), y: Math.max(0, listBox.y - 12), width: Math.min(SIZES[size].opts.viewport.width - Math.max(0, listBox.x - 12), listBox.width + 24), height: listBox.height + 24 } })

  /* B3: Ranger's line */
  await tapLine(page, size, tap, po[0].id, 'b3-ranger-tap')
  if (process.env.PBW_DEBUG) for (let i = 0; i < 12; i++) { say('PBW-DEBUG t+' + (i * 250) + ' ' + JSON.stringify(await page.evaluate(() => ({ fold: document.querySelector('#accArchToggle')?.getAttribute('aria-expanded'), rows: document.querySelectorAll('.acc-row[data-person=bane]').length, ringed: [...document.querySelectorAll('.acc-ring')].map(e => e.getAttribute('data-person')), page: window.CURPAGE })))); await sleep(250) }
  const pg3 = await page.evaluate(() => window.CURPAGE)
  const r3 = await ringState(page, pick[0])
  check(size, 'B3a', pg3 === 'admin' && r3, `Admin → Users opened at his row (${pg3})`)
  check(size, 'B3b', r3 && r3.archived && r3.fold === 'true', 'his row is in the Archived fold, opened')
  check(size, 'B3c', r3 && r3.ringed && /inset/.test(r3.shadow) && /30, 134, 255|#1e86ff/i.test(r3.shadow), `his row wears the just-added ring (${r3 && r3.shadow})`)
  check(size, 'B3d', r3 && r3.top >= r3.barBottom && r3.bottom <= r3.vh && r3.uncovered, `his row in view, under the top bar, uncovered (top ${r3?.top}, bar ${r3?.barBottom}, bottom ${r3?.bottom}/${r3?.vh})`)
  check(size, 'B3e', r3 && r3.nameGap >= 6, `the ring stands clear of his name (${r3?.nameGap}px)`)
  const bellGone3 = !(await page.locator('[data-testid="bell-list"]').isVisible().catch(() => false))
  check(size, 'B3f', bellGone3, 'the bell list closed')
  await neutral(page, tap); await shot(page, size, 'b3-ranger-landing')
  /* B4: the ring's six seconds */
  await page.clock.runFor(6500); await sleep(400)
  const r4 = await ringState(page, pick[0])
  check(size, 'B4', r4 && !r4.ringed, 'the ring gone after its six seconds')
  await shot(page, size, 'b4-ring-gone')

  /* B5: Cinch's line (SANS) — tapped from Admin → Users itself (the page already up) */
  await openBell(page, tap); await neutral(page, tap)
  ls = await lines(page)
  check(size, 'B5a', !ls.find(l => l.id === po[0].id).unread, "Ranger's line now read")
  await tapLine(page, size, tap, po[2].id, 'b5-sans-tap')
  const r5 = await ringState(page, pick[2])
  check(size, 'B5b', r5 && r5.ringed && !r5.archived && r5.uncovered && r5.top >= r5.barBottom && r5.bottom <= r5.vh, `the SANS man's roster row ringed, in view (${JSON.stringify(r5)})`)
  await neutral(page, tap); await shot(page, size, 'b5-sans-landing')
  /* B6: Cobra's line (off the manpower) */
  await openBell(page, tap); await neutral(page, tap)
  await tapLine(page, size, tap, po[3].id, 'b6-none-tap')
  const r6 = await ringState(page, pick[3])
  check(size, 'B6', r6 && r6.ringed && r6.uncovered && r6.top >= r6.barBottom && r6.bottom <= r6.vh, `the man off the manpower: his roster row ringed, in view (${JSON.stringify(r6)})`)
  await neutral(page, tap); await shot(page, size, 'b6-none-landing')
  /* B7: Trident's line (deleted) — nothing opens */
  await page.evaluate(() => window.scrollTo(0, 0)); await go(page, 'leavewar')
  await openBell(page, tap); await neutral(page, tap)
  await tapLine(page, size, tap, po[1].id, 'b7-deleted-tap')
  const pg7 = await page.evaluate(() => window.CURPAGE)
  const up7 = await page.locator('[data-testid="bell-list"]').isVisible().catch(() => false)
  ls = up7 ? await lines(page) : []
  const l7 = ls.find(l => l.id === po[1].id)
  check(size, 'B7', pg7 === 'leavewar' && up7 && l7 && !l7.unread, `a deleted man's line opens nothing: still on the Leave War, the list up, the line read (${pg7}, list ${up7})`)
  await neutral(page, tap); await shot(page, size, 'b7-deleted-tapped')
  /* B8: Mark all read */
  const mark = page.locator('[data-testid="bell-markall"]')
  if (await mark.count()) { if (tap) await mark.tap(); else await mark.click(); await sleep(400) }
  ls = await lines(page)
  const lit8 = await bellBtn(page).evaluate(e => e.classList.contains('on'))
  check(size, 'B8', ls.every(l => !l.unread) && !lit8, `Mark all read: every line read, the bell out (lit ${lit8})`)
  await shot(page, size, 'b8-all-read')
  /* B9: the list closed by each of its ways — the bell again, Escape (desktop), a press outside */
  if (tap) await bellBtn(page).tap(); else await bellBtn(page).click()
  await sleep(300)
  let gone = !(await page.locator('[data-testid="bell-list"]').isVisible().catch(() => false))
  check(size, 'B9a', gone, 'the bell again closes the list')
  await openBell(page, tap)
  if (!tap) { await page.keyboard.press('Escape'); await sleep(300); gone = !(await page.locator('[data-testid="bell-list"]').isVisible().catch(() => false)); check(size, 'B9b', gone, 'Escape closes the list'); await openBell(page, tap) }
  const vp = SIZES[size].opts.viewport
  if (tap) await page.touchscreen.tap(20, vp.height - 40); else await page.mouse.click(20, vp.height - 40)
  await sleep(400)
  gone = !(await page.locator('[data-testid="bell-list"]').isVisible().catch(() => false))
  check(size, 'B9c', gone, 'a press outside closes the list')
  /* B10: a reload — the lines kept, read, not told again */
  await page.reload(); await signIn(page, 'ad', 'a'); await sleep(1200)
  await openBell(page, tap); await neutral(page, tap)
  ls = await lines(page)
  const po10 = ls.filter(l => /^Posted out · /.test(l.what))
  check(size, 'B10', po10.length === 4 && po10.every(l => !l.unread), `after a reload: the same four lines, read (${po10.length})`)
  await shot(page, size, 'b10-after-reload')
  if (tap) await bellBtn(page).tap(); else await bellBtn(page).click()
  /* B11 (desktop): the member view hides them; the admin view brings them back */
  if (!tap) {
    await page.locator('#roleBadge').click(); await sleep(500)
    await openBell(page, tap); await neutral(page, tap)
    const m = (await lines(page)).filter(l => /^Posted out · /.test(l.what))
    check(size, 'B11a', m.length === 0, `the member view: no posting line (${m.length})`)
    await shot(page, size, 'b11-member-view')
    await bellBtn(page).click(); await sleep(200)
    await page.locator('#roleBadge').click(); await sleep(500)
    await openBell(page, tap)
    const a = (await lines(page)).filter(l => /^Posted out · /.test(l.what))
    check(size, 'B11b', a.length === 4, `back in the admin view: the four lines (${a.length})`)
    await bellBtn(page).click(); await sleep(200)
  }
  const state2 = await ctx.storageState()
  await b.close()
  /* B12: Hex, the other admin */
  ;({ b, ctx, page, tap } = await open(size, state2, 'hex', 'x'))
  await sleep(1200)
  await openBell(page, tap); await neutral(page, tap)
  ls = await lines(page)
  const hx = ls.filter(l => /^Posted out · /.test(l.what))
  check(size, 'B12', hx.length === 4 && hx.slice(0, 3).every(l => l.unread), `Hex's bell: his own four lines, unread (${hx.map(l => `${l.name}:${l.unread ? 'unread' : 'read'}`).join(', ')})`)
  await shot(page, size, 'b12-hex-bell')
  await b.close()
  /* B13: a member (Outlaw) */
  ;({ b, ctx, page, tap } = await open(size, state2, 'outlaw', 'x'))
  await sleep(1200)
  await openBell(page, tap); await neutral(page, tap)
  const mem = (await lines(page)).filter(l => /^Posted out · /.test(l.what))
  check(size, 'B13', mem.length === 0, `a member's bell: no posting line (${mem.length})`)
  await shot(page, size, 'b13-member-bell')
  await b.close()
  report[size] = { pick: pick.map(id => cs[id]), ran }
}
const fails = results.filter(r => !r.ok)
writeFileSync(join(OUT, `walk-log${process.env.ONLY ? '-' + process.env.ONLY : ''}.json`), JSON.stringify({ results, errs, log, report }, null, 2))
say(`${results.length - fails.length}/${results.length} passed; errors: ${errs.length ? errs.join(' | ') : 'none'}`)
process.exit(fails.length ? 1 : 0)
