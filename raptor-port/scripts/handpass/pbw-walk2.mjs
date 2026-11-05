// [POSTOUT-RUN-NOTICE] — THE WALK'S SECOND ROUND: the scenarios the fresh scenario designer found missing from the first
// (docs/handpass/parts/pb1105/scenarios.md — S1, S2, S3, S7, S10, S15), on the fixed build. Same world and controls as
// pbw-walk.mjs (the drawing's four men, posted on the Leave War's one-day sheet), the browser's clock set per scenario.
//   C1 (S3)  a posting dated today: the line at once; the top bar's Undo refuses (D350) and the line stands; the posting
//            sheet's own Undo post out puts him back and the line stays as the record; its tap rings his roster row.
//   C2 (S7)  after the line: Ranger renamed on Admin → Users — the line reads his new name; then restored — the tap rings his
//            roster row.
//   C3 (S10) a second line tapped inside the first ring's six seconds: the second man ringed, the first not; both gone after.
//   C4 (S2)  half-typed work on Users (a new person's callsign and sign-in) kept through a tap.
//   C5 (S1)  midnight passes with the page left open on Edit Schedule, nothing touched: is the bell lit by itself?
//   C6 (S15) the plain-user round: the Leave War grid, Quals, Edit Schedule and Admin → Users after the run, pictured.
// Usage (from raptor-port/): WALK_DIR=<frozen dist> [PBW_OUT=<folder>] [ONLY=desk|phone] node scripts/handpass/pbw-walk2.mjs
import { chromium, webkit } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serveFrozen } from './isr-serve.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.env.PBW_OUT || join(HERE, '../../docs/img/handpass/2026-11-05-postout-bell/round2')
mkdirSync(OUT, { recursive: true })
const URL = 'http://localhost:4394/'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ISO = '2026-11-16'
const SIZES = {
  desk: { engine: chromium, opts: { viewport: { width: 1536, height: 864 } }, tap: false },
  phone: { engine: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true }, tap: true },
}
const results = [], errs = [], log = []
const say = l => { log.push(l); console.log(l) }
const check = (size, step, ok, what) => { results.push({ size, step, ok: !!ok, what }); say(`${ok ? 'PASS' : 'FAIL'} [${size}] ${step} — ${what}`) }

async function open(size, at, state, user = 'ad', pass = 'a') {
  const s = SIZES[size]
  const b = await s.engine.launch()
  const ctx = await b.newContext({ ...s.opts, deviceScaleFactor: 2, ...(state ? { storageState: state } : {}) })
  await serveFrozen(ctx, URL)
  const page = await ctx.newPage()
  await page.clock.install({ time: at })
  page.on('pageerror', e => errs.push(`[${size}] page error ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${size}] console ${m.text()}`) })
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
  const at = await c.evaluate(e => { const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } })
  if (tap) await page.touchscreen.tap(at.x, at.y); else await page.mouse.click(at.x, at.y)
  await sleep(700)
}
async function postOut(page, tap, id, outcome) {
  await tapCell(page, tap, id)
  await press(page, tap, `${sheet} [data-testid="bid-more"]`)
  await press(page, tap, '[data-testid="bid-postout"]')
  if (outcome === 'none') await press(page, tap, `${sheet} [data-testid="po-overseas"]`)
  else if (outcome !== 'overseas') await press(page, tap, `${sheet} [data-testid="po-${outcome}"]`)
  await press(page, tap, `${sheet} [data-testid="po-confirm"]`)
  if (outcome === 'delete') await press(page, tap, '[data-testid="po-delete-go"]')
  await sleep(600); await closeSheets(page)
}
const bellBtn = page => page.locator('.bellbtn').filter({ visible: true }).first()
async function openBell(page, tap) {
  if (await page.locator('[data-testid="bell-list"]').isVisible().catch(() => false)) return
  if (tap) await bellBtn(page).tap(); else await bellBtn(page).click()
  await page.waitForSelector('[data-testid="bell-list"]'); await sleep(450)
}
const lines = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map(l => ({
  id: l.getAttribute('data-testid').slice('bell-line-'.length), name: l.querySelector('.bl-name').textContent, day: l.querySelector('.bl-day').textContent,
  what: l.querySelector('.bl-what').textContent, unread: l.classList.contains('unread') })))
const posting = ls => ls.filter(l => /^Posted out · /.test(l.what))
async function tapLine(page, tap, id) {
  const l = page.locator(`[data-testid="bell-line-${id}"]`)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  const b = await l.boundingBox()
  if (tap) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await sleep(800)
}
const ringed = page => page.evaluate(() => [...document.querySelectorAll('#page-admin .acc-row.acc-ring')].map(r => r.getAttribute('data-person')))
const shot = (page, size, name) => page.screenshot({ path: join(OUT, `${name}-${size}.png`) })
async function adminUsers(page, tap) {
  await go(page, 'admin')
  const users = page.locator('.adm-cat').filter({ hasText: 'Users' }).first()
  if (await users.count()) { if (tap) await users.tap(); else await users.click(); await sleep(600) }
}
async function pickMen(page) {
  const men = await page.evaluate(() => Object.keys(window.PEOPLE).filter(id => { const p = window.PEOPLE[id]; return !p.special && !p.archived && !p.san && !p.deleted && !p.pers }))
  const onGrid = new Set(await page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(r => r.getAttribute('data-testid').slice(4))))
  return ['bane', ...men.filter(id => !['bane', 'stiff', 'rocky', 'casper'].includes(id) && onGrid.has(id)).slice(6, 9)]
}
const cs = (page, id) => page.evaluate(id => window.PEOPLE[id].cs, id)

const BEFORE = new Date('2026-11-05T09:00:00'), RUN = new Date('2026-11-16T08:00:00')
const report = {}
for (const size of (process.env.ONLY ? [process.env.ONLY] : ['desk', 'phone'])) {
  /* ---- C1: a posting dated today (16 Nov) ---- */
  let { b, ctx, page, tap } = await open(size, RUN)
  await lwOpen(page)
  await postOut(page, tap, 'bane', 'sans')
  await openBell(page, tap)
  let ls = posting(await lines(page))
  check(size, 'C1a', ls.length === 1 && ls[0].name === 'Ranger' && ls[0].what === 'Posted out · now SANS' && ls[0].day === 'Mon 16 Nov', `a posting dated today: its line at once (${ls.map(l => l.name + ' / ' + l.what).join(' | ')})`)
  await shot(page, size, 'c1-today-line')
  if (tap) await bellBtn(page).tap(); else await bellBtn(page).click()
  await sleep(300)
  const undo = page.locator('[aria-label="Undo"]').filter({ visible: true }).first()
  const undoOn = await undo.isEnabled().catch(() => false)
  if (undoOn) { if (tap) await undo.tap(); else await undo.click(); await sleep(600) }
  const stillSans = await page.evaluate(() => window.PEOPLE.bane.sanBy === 'po')
  await openBell(page, tap)
  ls = posting(await lines(page))
  check(size, 'C1b', stillSans && ls.length === 1, `the top bar's Undo takes no posting back (D350; Undo ${undoOn ? 'pressed' : 'greyed'}): still SANS, the line stands`)
  if (tap) await bellBtn(page).tap(); else await bellBtn(page).click()
  await sleep(300)
  await tapCell(page, tap, 'bane')
  const undoPo = page.locator('[data-testid="postout-undo"]').filter({ visible: true })
  const hasUndoPo = await undoPo.count()
  if (hasUndoPo) { if (tap) await undoPo.first().tap(); else await undoPo.first().click(); await sleep(700) }
  await closeSheets(page)
  const back = await page.evaluate(() => !window.PEOPLE.bane.sanBy)
  await openBell(page, tap)
  ls = posting(await lines(page))
  check(size, 'C1c', hasUndoPo && back && ls.length === 1, `the posting sheet's Undo post out puts him back, and the line stays as the record (door ${hasUndoPo ? 'found' : 'MISSING'})`)
  await tapLine(page, tap, ls[0].id)
  const r1 = await ringed(page)
  check(size, 'C1d', r1.includes('bane') && await page.evaluate(() => !document.querySelector('#page-admin .acc-row[data-person="bane"]')?.getAttribute('data-archived')), `its tap rings his roster row (${r1})`)
  await shot(page, size, 'c1-undone-landing')
  await b.close()

  /* ---- the world of the first walk: four men posted out today (5 Nov) for 16 Nov ---- */
  ;({ b, ctx, page, tap } = await open(size, BEFORE))
  await lwOpen(page)
  const pick = await pickMen(page)
  for (const [o, id] of [['overseas', pick[0]], ['delete', pick[1]], ['sans', pick[2]], ['none', pick[3]]]) await postOut(page, tap, id, o)
  const posted = await ctx.storageState()
  await b.close()

  /* ---- C5: midnight with the page left open on Edit Schedule (desk only: one clock walk is enough) ---- */
  if (!tap) {
    ;({ b, ctx, page, tap } = await open(size, new Date('2026-11-15T23:59:00'), posted))
    await sleep(800)
    const dark = !(await bellBtn(page).evaluate(e => e.classList.contains('on')))
    await page.clock.runFor(3 * 60_000); await sleep(1500)
    const litAfter = await bellBtn(page).evaluate(e => e.classList.contains('on'))
    const ran = await page.evaluate(() => !!window.PEOPLE.bane.archived)
    check(size, 'C5', dark && litAfter && ran, `midnight passes with Edit Schedule left open, nothing touched: before ${dark ? 'dark' : 'lit'}; three minutes after midnight the posting ${ran ? 'ran' : 'has NOT run'} and the bell is ${litAfter ? 'lit' : 'DARK'}`)
    await shot(page, size, 'c5-after-midnight-untouched')
    await page.mouse.click(700, 600); await sleep(800)
    const ranAfterClick = await page.evaluate(() => !!window.PEOPLE.bane.archived)
    const litAfterClick = await bellBtn(page).evaluate(e => e.classList.contains('on'))
    say(`[${size}] C5 note: after one click on the page — posting ${ranAfterClick ? 'ran' : 'not run'}, bell ${litAfterClick ? 'lit' : 'dark'}`)
    await go(page, 'inputs'); await sleep(1200)
    const ranAfterPage = await page.evaluate(() => !!window.PEOPLE.bane.archived)
    const litAfterPage = await bellBtn(page).evaluate(e => e.classList.contains('on'))
    say(`[${size}] C5 note: after a page change (Inputs) — posting ${ranAfterPage ? 'ran' : 'not run'}, bell ${litAfterPage ? 'lit' : 'dark'}`)
    await page.reload(); await signIn(page, 'ad', 'a'); await sleep(1500)
    const ranAfterReload = await page.evaluate(() => !!window.PEOPLE.bane.archived)
    say(`[${size}] C5 note: after a reload — posting ${ranAfterReload ? 'ran' : 'not run'}`)
    await b.close()
  }

  /* ---- C2..C4, C6: on 16 Nov ---- */
  ;({ b, ctx, page, tap } = await open(size, RUN, posted))
  await sleep(1500)
  const names = Object.fromEntries(await Promise.all(pick.map(async id => [id, await cs(page, id)])))
  /* C4: half-typed work on Users kept through a tap */
  await adminUsers(page, tap)
  await page.locator('#accAddCs').fill('Newbie'); await page.locator('#accAddName').fill('newbie@mail')
  await openBell(page, tap)
  ls = posting(await lines(page))
  const lineOf = who => ls.find(l => l.name === names[who])
  await tapLine(page, tap, lineOf(pick[0]).id)
  const kept = await page.evaluate(() => [document.querySelector('#accAddCs')?.value, document.querySelector('#accAddName')?.value])
  check(size, 'C4', kept[0] === 'Newbie' && kept[1] === 'newbie@mail' && (await ringed(page)).includes(pick[0]), `half-typed on Users kept through the tap (${kept.join(', ')}); Ranger ringed`)
  await shot(page, size, 'c4-typed-kept')
  /* C3: a second line inside the first ring's six seconds */
  await page.clock.runFor(2000)
  await openBell(page, tap)
  await tapLine(page, tap, lineOf(pick[2]).id)
  const r3 = await ringed(page)
  check(size, 'C3a', r3.length === 1 && r3[0] === pick[2], `a second tap inside the six seconds: ${names[pick[2]]} ringed, ${names[pick[0]]} not (${r3})`)
  await shot(page, size, 'c3-second-tap')
  await page.clock.runFor(6500); await sleep(400)
  check(size, 'C3b', (await ringed(page)).length === 0, 'both rings gone after six seconds')
  /* C2: renamed, then restored */
  await page.locator('#accAddCs').fill(''); await page.locator('#accAddName').fill('')
  const arch = page.locator('#accArchToggle')
  if ((await arch.getAttribute('aria-expanded')) !== 'true') { if (tap) await arch.tap(); else await arch.click(); await sleep(400) }
  await press(page, tap, `#page-admin .acc-row[data-person="${pick[0]}"] .acc-tap`)
  const box = page.locator('[data-restoring] input').first()
  await box.fill('Rogue'); await sleep(200)
  const saveName = page.locator('[data-restoring] button').filter({ hasText: /^Save name$/ })
  if (await saveName.count()) { if (tap) await saveName.first().tap(); else await saveName.first().click(); await sleep(600) }
  await openBell(page, tap)
  ls = posting(await lines(page))
  check(size, 'C2a', ls.some(l => l.name === 'Rogue' && /archived/.test(l.what)), `renamed after the line: it reads his new name (${ls.map(l => l.name).join(', ')})`)
  await shot(page, size, 'c2-renamed')
  if (tap) await bellBtn(page).tap(); else await bellBtn(page).click()
  await sleep(300)
  if (!(await page.locator('[data-restoring]').count())) await press(page, tap, `#page-admin .acc-row[data-person="${pick[0]}"] .acc-tap`)
  const restore = page.locator('[data-restoring] button').filter({ hasText: /^Restore/ })
  if (await restore.count()) { if (tap) await restore.first().tap(); else await restore.first().click(); await sleep(800) }
  const restored = await page.evaluate(id => !window.PEOPLE[id].archived, pick[0])
  await openBell(page, tap)
  ls = posting(await lines(page))
  const rl = ls.find(l => l.name === 'Rogue')
  if (rl) await tapLine(page, tap, rl.id)
  const r2 = await page.evaluate(id => { const r = [...document.querySelectorAll(`#page-admin .acc-row[data-person="${id}"]`)].find(x => x.getBoundingClientRect().height > 0); return r ? { ring: r.classList.contains('acc-ring'), archived: r.getAttribute('data-archived') === '1' } : null }, pick[0])
  check(size, 'C2b', restored && r2 && r2.ring && !r2.archived, `restored, his line's tap rings his roster row (${JSON.stringify(r2)})`)
  await shot(page, size, 'c2-restored-landing')
  /* C6: the plain-user round — every other place that should show the result */
  await lwOpen(page)
  await shot(page, size, 'c6-leavewar-grid')
  await go(page, 'quals'); await sleep(600)
  const quals = await page.evaluate(ids => ids.map(id => ({ id, row: !!document.querySelector(`[data-person="${id}"], [data-pid="${id}"], [data-id="${id}"]`), cs: window.PEOPLE[id].cs, san: !!window.PEOPLE[id].san, deleted: !!window.PEOPLE[id].deleted })), pick.slice(1))
  say(`[${size}] C6 Quals: ${JSON.stringify(quals)}`)
  await shot(page, size, 'c6-quals')
  await go(page, 'editsched'); await sleep(600)
  await shot(page, size, 'c6-editsched')
  await adminUsers(page, tap)
  const tags = await page.evaluate(ids => ids.map(id => { const t = document.querySelector(`[data-testid="po-tag-${id}"]`); return t ? t.textContent : null }), [pick[2], pick[3]])
  check(size, 'C6', tags[0] === 'posted out 16 Nov · SANS' && tags[1] === 'posted out 16 Nov', `Admin → Users: Cinch "${tags[0]}", Cobra "${tags[1]}"`)
  await shot(page, size, 'c6-admin-users')
  await b.close()
  report[size] = { pick }
}
const fails = results.filter(r => !r.ok)
writeFileSync(join(OUT, `walk2-log${process.env.ONLY ? '-' + process.env.ONLY : ''}.json`), JSON.stringify({ results, errs, log, report }, null, 2))
say(`${results.length - fails.length}/${results.length} passed; errors: ${errs.length ? errs.join(' | ') : 'none'}`)
process.exit(fails.length ? 1 : 0)
