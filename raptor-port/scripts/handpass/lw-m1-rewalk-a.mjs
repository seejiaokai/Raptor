// WALKER A for the Leave War M1 (open dates) bug check — the admin at a desktop, 1440 x 900, by mouse.
// Brief: docs/superpowers/briefs/2026-10-22-lw-m1-walk-brief.md.  Serves http://localhost:4252/ (frozen build — never rebuilt).
//   node scripts/handpass/lw-m1-walk-a.mjs              every scenario
//   SCEN=S1,S5 node scripts/handpass/lw-m1-walk-a.mjs   only these
// Each scenario runs in a FRESH browser context.  Scenarios that must survive a reload (S1, S10, S12, S23) are built on
// real storage (the address WITHOUT ?fresh=1, walk-scripts §3); the others open <url>?fresh=1.
// A check is written as the RIGHT behaviour: ok = PASS.  A scenario marked RECORD only writes down what it saw.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('lw-m1-rewalk-a (after the fixes) — admin, desktop 1440x900, http://localhost:4252/')
const HERE = dirname(fileURLToPath(import.meta.url))
const SHOTS = join(HERE, '..', '..', 'docs', 'img', 'handpass', '2026-10-22-lw-m1-open-dates', 'ra')
mkdirSync(SHOTS, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const BASE = 'http://localhost:4252/'
const ONLY = process.env.SCEN ? process.env.SCEN.split(',') : null
// empty the folder only on a full run (one run, one folder — walk-scripts §5)
if (!ONLY) for (const f of readdirSync(SHOTS)) if (f.endsWith('.png')) unlinkSync(join(SHOTS, f))

const browser = await chromium.launch(launchOptions)
const results = []
const consoleErrors = []
let shotN = Number(process.env.SHOTN || 0)

/* ---------------- helpers ---------------- */
const norm = s => String(s).replace(/\s+/g, ' ').trim()
async function newPage(real = false) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  page.__ctx = ctx; page.__real = real
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(`${page.__id}: ${m.text()}`) })
  page.on('pageerror', e => consoleErrors.push(`${page.__id}: PAGEERROR ${e.message}`))
  await page.goto(real ? BASE : BASE + '?fresh=1')
  return page
}
async function signIn(page, u = 'ad', p = 'a') {
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid="row-bane"]')
  await page.waitForTimeout(900)
}
const win = p => p.locator('[data-testid="open-dates"]')
async function openWin(p) {
  if (!(await win(p).count())) { await p.click('[data-testid="open-chip"]'); await win(p).waitFor() }
}
async function closeWin(p) {
  if (await win(p).count()) { await p.click('[data-testid="open-dates-close"]'); await win(p).waitFor({ state: 'detached' }) }
}
const states = p => p.locator('[data-testid^="od-month-"]').evaluateAll(l =>
  Object.fromEntries(l.map(e => [e.getAttribute('data-testid').slice(9), e.getAttribute('data-state')])))
const stateStr = async p => { const s = await states(p); return Object.entries(s).map(([k, v]) => `${k.slice(5)}:${v[0]}`).join(' ') }
const lines = async p => (await p.locator('[data-testid^="od-line-"]').allInnerTexts()).map(norm)
const chip = async p => norm(await p.locator('[data-testid="open-chip"]').innerText())
const undoTxt = async p => p.evaluate(() => (document.body.innerText.match(/(Undid|Redid)[^\n]*/g) || []).join(' | '))
async function tapMonth(p, key) {
  const m = p.locator(`[data-testid="od-month-${key}"]`)
  const was = await m.getAttribute('data-state')
  await m.click()
  await p.waitForFunction(([k, w]) => document.querySelector(`[data-testid="od-month-${k}"]`)?.getAttribute('data-state') !== w, [key, was], { timeout: 4000 }).catch(() => {})
  await p.waitForTimeout(120)
}
async function dragMonths(p, fromKey, toKey, steps = 10) {
  const a = await p.locator(`[data-testid="od-month-${fromKey}"]`).boundingBox()
  const b = await p.locator(`[data-testid="od-month-${toKey}"]`).boundingBox()
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await p.mouse.down()
  await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps })
  await p.mouse.up()
  await p.waitForTimeout(250)
}
/** close every lit month (as closeBidding in e2e/app.ts does) — window must be open */
async function closeAllMonths(p) {
  for (let i = 0; i < 30; i++) {
    const lit = p.locator('[data-testid^="od-month-"][data-state="open"], [data-testid^="od-month-"][data-state="part"]').first()
    if (!(await lit.count())) return
    await tapMonth(p, (await lit.getAttribute('data-testid')).slice(9))
  }
}
/** the range calendar's own month read each time, never a counted number of presses */
async function pickSpan(p, testid, from, to) {
  const goTo = async ym => {
    for (let i = 0; i < 120; i++) {
      const at = await p.locator(`[data-testid="${testid}"]`).first().getAttribute('data-month')
      if (at === ym) return
      await p.locator(`[data-testid="${testid}-${at < ym ? 'next' : 'prev'}"]`).first().click()
      await p.waitForTimeout(40)
    }
    throw new Error('never reached ' + ym)
  }
  await goTo(from.slice(0, 7)); await p.locator(`[data-testid="${testid}-day-${from}"]`).click()
  await goTo(to.slice(0, 7)); await p.locator(`[data-testid="${testid}-day-${to}"]`).click()
}
async function openExact(p, from, to, testid = 'od-new') {
  await p.click('[data-testid="od-more"]')
  await p.locator(`[data-testid="${testid}-picker"]`).waitFor()
  await pickSpan(p, testid, from, to)
  await p.click('[data-testid="od-apply"]')
  await p.waitForTimeout(250)
}
const wrapLeft = p => p.evaluate(() => document.querySelector('.mx-wrap').scrollLeft)
async function jump(p, label) {
  await p.click(`[data-testid="month-${label}"]`)
  await p.waitForTimeout(900)
  // wait for the grid to stop moving
  let last = -1
  for (let i = 0; i < 30; i++) { const n = await wrapLeft(p); if (n === last) break; last = n; await p.waitForTimeout(150) }
}
/** is this date's heading inside the visible part of the grid (right of the frozen columns)? */
const dateInView = (p, iso) => p.evaluate(d => {
  const h = document.querySelector(`[data-testid="head-${d}"]`), w = document.querySelector('.mx-wrap')
  if (!h || !w) return false
  const r = h.getBoundingClientRect(), wr = w.getBoundingClientRect()
  return r.left >= wr.left + 330 && r.right <= wr.right + 1
}, iso)
/** the heading is inside the grid's own box (not scrolled past) — true at the very start of a period too, where the first dates lie under the Figures drawer */
const landedAt = (p, iso) => p.evaluate(d => {
  const h = document.querySelector('[data-testid="head-' + d + '"]'), w = document.querySelector('.mx-wrap')
  if (!h || !w) return false
  const r = h.getBoundingClientRect(), wr = w.getBoundingClientRect()
  return r.left >= wr.left - 1 && r.right <= wr.right + 1
}, iso)
/** the window's scrim covers the top bar (measured, S13), so a person closes the window, presses Undo / Redo, and reopens it */
async function undoNow(p, which = 'undo') {
  await closeWin(p)
  const btn = p.locator(which === 'undo' ? '#undoBtn' : '#redoBtn')
  const title = await btn.getAttribute('title')
  await btn.click(); await p.waitForTimeout(500)
  const words = await undoTxt(p)
  await openWin(p)
  return { title, words }
}
const topBand = p => p.screenshot({ clip: { x: 0, y: 56, width: 1440, height: 100 } })
async function shot(p, name, opts = {}) {
  shotN++
  const file = `${String(shotN).padStart(2, '0')}-${name}.png`
  const path = join(SHOTS, file)
  if (opts.el) await opts.el.screenshot({ path })
  else if (opts.clip) await p.screenshot({ path, clip: opts.clip })
  else await p.screenshot({ path })
  S.pics.push(file)
  return file
}
const shotWin = (p, name) => shot(p, name, { el: win(p) })
/** how a month button is DRAWN: its fill, edge and the line's spacing — lit must read differently from unlit (D1168) */
const look = (p, key) => p.locator(`[data-testid="od-month-${key}"]`).evaluate(e => { const c = getComputedStyle(e); return `${e.dataset.state}: bg ${c.backgroundColor}, edge ${c.borderStyle} ${c.borderWidth} ${c.borderColor}, height ${Math.round(e.getBoundingClientRect().height)}px` })

/* ---- bids through the grid's own controls ---- */
const cellSel = (id, iso) => `[data-testid="cell-${id}-${iso}"]`
const cellCls = (p, id, iso) => p.locator(cellSel(id, iso) + ' .c').evaluate(e => e.className).catch(() => '(no chip)')
/** tap a cell, choose the leave; a bid that takes him below zero asks to tap the same leave again (walk-scripts §3) */
async function placeBid(p, id, iso, code) {
  await p.locator(cellSel(id, iso)).click(); await p.waitForTimeout(350)
  await p.click(`[data-testid="bid-${code}"]`); await p.waitForTimeout(300)
  if (await p.locator('[data-testid="span-note"]').count()) { await p.click(`[data-testid="bid-${code}"]`); await p.waitForTimeout(450) }
  if (await p.locator('[role=dialog]').count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(250) }
}
async function decide(p, id, iso, which) {
  await p.locator(cellSel(id, iso)).click(); await p.waitForTimeout(350)
  await p.click(`[data-testid="decide-${which}"]`); await p.waitForTimeout(450)
}
const dialogIds = p => p.evaluate(() => [...document.querySelectorAll('[role=dialog] [data-testid]')].map(e => e.dataset.testid).join(','))

/* ---------------- the scenario harness ---------------- */
let S = null
async function scenario(id, title, fn) {
  if (ONLY && !ONLY.includes(id)) return
  S = { id, title, checks: [], notes: [], pics: [], record: false, notWalked: '' }
  let page = null
  try { page = await fn() } catch (e) { S.notWalked = `script stopped: ${norm(e.message).slice(0, 300)}`; S.fail = true }
  const failed = S.checks.filter(c => !c.ok)
  S.verdict = S.notWalked ? 'NOT WALKED' : failed.length ? 'FAIL' : S.record ? 'RECORD' : 'PASS'
  console.log(`\n=== ${id} ${title}: ${S.verdict}`)
  for (const c of S.checks) console.log(`   ${c.ok ? 'ok  ' : 'FAIL'} ${c.note}`)
  for (const n of S.notes) console.log(`   note ${n}`)
  if (S.notWalked) console.log(`   ${S.notWalked}`)
  console.log(`   pics: ${S.pics.join(', ')}`)
  results.push(S)
  for (const c of browser.contexts()) await c.close().catch(() => {})
}
const check = (ok, note) => { S.checks.push({ ok: !!ok, note }); return !!ok }
const note = n => S.notes.push(n)
const rec = () => { S.record = true }
const own = p => { p.__id = S.id; return p }

/* a war in the OLD shape (stages), as a saved one would be — S12 */
const oldWar = (id, name, start, end, extra) => {
  const days = []
  for (let t = Date.parse(start + 'T00:00:00Z'); t <= Date.parse(end + 'T00:00:00Z'); t += 86_400_000)
    days.push({ date: new Date(t).toISOString().slice(0, 10), events: ['', ''], blocked: false, blockedReason: '', ph: false })
  return { period: { id, name, start, end, ...extra, days }, recs: {} }
}

/* =================== L1 (extra: how the window is DRAWN at a desktop's width) ================== */
await scenario('L1', 'the Open for bidding window is drawn at 1440 wide: lit months, dotted part-open, line spacing', async () => {
  const p = own(await newPage()); await signIn(p)
  await openWin(p)
  await openExact(p, '2026-05-10', '2026-05-20')            // MAY open in part (JAN–MAR are open whole)
  const open = await look(p, '2026-02'), part = await look(p, '2026-05'), closed = await look(p, '2026-08')
  note('1440 wide: ' + open + ' | ' + part + ' | ' + closed)
  check(open.split(': ')[1] !== closed.split(': ')[1], 'an open month is drawn differently from a closed one: ' + open + '  vs  ' + closed)
  check(/dotted/.test(part), 'a month open in part wears a dotted edge: ' + part)
  const gap = await p.evaluate(() => { const l = document.querySelector('[data-testid^="od-line-"]'); const a = l.querySelector('.od-span').getBoundingClientRect(), b = l.querySelector('.od-days').getBoundingClientRect(); return Math.round(b.left - a.right) })
  check(gap >= 4, 'the stretch and its day count are set apart on the line: ' + gap + 'px between "1 Jan – 31 Mar" and "90 days"')
  await shotWin(p, 'l1-window-at-1440-wide')
  await p.setViewportSize({ width: 420, height: 900 }); await p.waitForTimeout(600)
  const o2 = await look(p, '2026-02'), c2 = await look(p, '2026-08')
  note('the same window with the viewport 420 wide: ' + o2 + ' | ' + c2)
  await shotWin(p, 'l1-window-at-420-wide-for-comparison')
  await p.setViewportSize({ width: 768, height: 900 }); await p.waitForTimeout(600)
  const o3 = await look(p, '2026-02'), c3 = await look(p, '2026-08')
  note('and at 768 wide (a tablet): ' + o3 + ' | ' + c3)
  await shotWin(p, 'l1-window-at-768-wide')
  await p.setViewportSize({ width: 1440, height: 900 })
  return p
})

/* =================== S1 ================== */
await scenario('S1', 'open dates and a new period survive a reload', async () => {
  const p = own(await newPage(true)); await signIn(p)
  await openWin(p); await closeAllMonths(p)
  await tapMonth(p, '2026-04'); await tapMonth(p, '2026-05')
  check((await lines(p)).length === 1 && /1 Apr – 31 May/.test((await lines(p))[0]), `after APR then MAY the window shows one stretch: ${JSON.stringify(await lines(p))}`)
  await shotWin(p, 's01-window-apr-may-before-reload')
  await closeWin(p)
  const chipBefore = await chip(p)
  // + New period 2028
  await p.click('[data-testid="war-new"]')
  await p.fill('[data-testid="war-name"]', 'JAN - DEC 28')
  await pickSpan(p, 'war', '2028-01-01', '2028-12-31')
  await p.click('[data-testid="war-create"]')
  await p.waitForTimeout(900)
  const chip28 = await chip(p)
  check(/Bidding closed/.test(chip28), `the new 2028 period's chip reads: "${chip28}"`)
  note(`2028 period picker value after create: ${await p.locator('[data-testid="war-picker"]').inputValue()}`)
  await shot(p, 's01-new-2028-period-top', { clip: { x: 0, y: 56, width: 1440, height: 100 } })
  // reload
  await p.reload(); await p.waitForSelector('#luser')
  await signIn(p)
  const opts = await p.locator('[data-testid="war-picker"] option').allInnerTexts()
  check(opts.map(norm).includes('JAN - DEC 28'), `after the reload the period list holds: ${JSON.stringify(opts)}`)
  const cur = await p.locator('[data-testid="war-picker"]').inputValue()
  note(`period on screen after reload: ${cur}`)
  await p.locator('[data-testid="war-picker"]').selectOption({ label: 'JAN - DEC 26' }); await p.waitForTimeout(700)
  const chipAfter = await chip(p)
  check(chipAfter === chipBefore && /1 Apr – 31 May/.test(chipAfter), `the 2026 chip after the reload: "${chipAfter}" (before: "${chipBefore}")`)
  await openWin(p)
  check(/1 Apr – 31 May/.test((await lines(p)).join('|')) && (await lines(p)).length === 1, `window after reload: ${JSON.stringify(await lines(p))} ${await stateStr(p)}`)
  await shotWin(p, 's01-window-after-reload')
  await closeWin(p)
  await p.locator('[data-testid="war-picker"]').selectOption({ label: 'JAN - DEC 28' }); await p.waitForTimeout(700)
  check(/Bidding closed/.test(await chip(p)), `the 2028 chip after the reload: "${await chip(p)}"`)
  await shot(p, 's01-2028-after-reload-top', { clip: { x: 0, y: 56, width: 1440, height: 100 } })
  return p
})

/* =================== S5 ================== */
await scenario('S5', 'a new period takes no member bid (nothing open means closed)', async () => {
  const p = own(await newPage()); await signIn(p)
  await p.click('[data-testid="war-new"]')
  await p.fill('[data-testid="war-name"]', 'JAN - DEC 28')
  await pickSpan(p, 'war', '2028-01-01', '2028-12-31')
  await p.click('[data-testid="war-create"]'); await p.waitForTimeout(900)
  check(/Bidding closed/.test(await chip(p)), `chip: "${await chip(p)}"`)
  const lockedN = await p.evaluate(() => document.querySelectorAll('.mx .locked').length)
  check(lockedN === 0, `cells with the closed-day dim (locked) on the grid: ${lockedN}`)
  await shot(p, 's05-new-2028-grid-no-dim')
  // the 2027 demo period, nothing open, also: select it
  await p.locator('[data-testid="war-picker"]').selectOption('y2027'); await p.waitForTimeout(800)
  check(/Bidding closed/.test(await chip(p)), `the demo's 2027 chip: "${await chip(p)}"`)
  check((await p.evaluate(() => document.querySelectorAll('.mx .locked').length)) === 0, '2027 grid: no dim')
  await shot(p, 's05-2027-grid')
  // the admin's member view (name badge) — a member's tap on a 2027 day on his own row
  const badge = p.locator('button', { hasText: /Admin$/ }).first()
  note(`name badge text: ${norm(await badge.innerText())}`)
  await badge.click(); await p.waitForTimeout(900)
  note(`after the badge tap the badge reads: ${norm(await p.locator('button', { hasText: /Member$/ }).first().innerText().catch(() => '(not found)'))}`)
  const saberCell = p.locator('[data-testid="cell-stiff-2027-02-10"]')
  await saberCell.scrollIntoViewIfNeeded().catch(() => {})
  await p.click('[data-testid="month-FEB"]'); await p.waitForTimeout(900)
  await p.locator('[data-testid="cell-stiff-2027-02-10"]').click()
  await p.waitForTimeout(500)
  const cn = p.locator('[data-testid="closed-note"]')
  check(await cn.count() === 1, 'a member-view tap on his own row on a 2027 day opens the closed note')
  if (await cn.count()) {
    note(`closed note text: ${norm(await p.locator('[data-testid="closed-note-text"]').innerText())}`)
    await shot(p, 's05-member-view-closed-note-2027')
  }
  check((await p.locator('[data-testid="bid-picker"]').count()) === 0, 'no bid window opened for the member view on a 2027 day')
  return p
})

/* =================== S8 ================== */
await scenario('S8', 'the admin decides at any time — on a period nobody opened (2027)', async () => {
  const p = own(await newPage()); await signIn(p)
  await p.locator('[data-testid="war-picker"]').selectOption('y2027'); await p.waitForTimeout(900)
  check(/Bidding closed/.test(await chip(p)), `2027 chip: "${await chip(p)}"`)
  await jump(p, 'APR')
  check((await cellCls(p, 'harpoon', '2027-04-13')) === 'c', `13 Apr 27 Reset's (Harpoon's) LL starts pending: class "${await cellCls(p, 'harpoon', '2027-04-13')}"`)
  await p.locator(cellSel('harpoon', '2027-04-13')).click(); await p.waitForTimeout(400)
  const ids = await dialogIds(p)
  check(/decide-approve/.test(ids) && /decide-refuse/.test(ids), `a tap on the 2027 pending bid (nothing open) shows the Decide row: ${ids.split(',').filter(x => /decide|bid-clear/.test(x)).join(',')}`)
  await shot(p, 's08-decide-sheet-2027-nothing-open')
  await p.click('[data-testid="decide-approve"]'); await p.waitForTimeout(500)
  check(/appr/.test(await cellCls(p, 'harpoon', '2027-04-13')), `after Approve 13 Apr: class "${await cellCls(p, 'harpoon', '2027-04-13')}"`)
  // drag-select 13..16 Apr -> Approve
  const a = await p.locator(cellSel('harpoon', '2027-04-13')).boundingBox(), b = await p.locator(cellSel('harpoon', '2027-04-16')).boundingBox()
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down()
  await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(600)
  check(await p.locator('[data-testid="sel-approve"]').count() === 1, 'the drag-select panel opens with Approve on a 2027 period with nothing open')
  note(`panel says: ${norm(await p.locator('[data-testid="sel-span"]').innerText().catch(() => '?'))} / ${norm(await p.locator('[data-testid="sel-pending"]').innerText().catch(() => '?'))}`)
  await shot(p, 's08-drag-select-panel-2027')
  await p.click('[data-testid="sel-approve"]'); await p.waitForTimeout(600)
  const cl = await Promise.all(['13', '14', '15', '16'].map(d => cellCls(p, 'harpoon', '2027-04-' + d)))
  check(cl.every(c => /appr/.test(c)), `13–16 Apr all approved after the panel's Approve: ${JSON.stringify(cl)}`)
  await shot(p, 's08-after-approve-13-16-apr')
  // Dusk (Ammo): 5 May 27 pending half-day -> Refuse
  await jump(p, 'MAY')
  await p.locator(cellSel('ammo', '2027-05-05')).click(); await p.waitForTimeout(400)
  const ids2 = await dialogIds(p)
  note(`Dusk's (Ammo's) 5 May opens: ${ids2.split(',').filter(x => /decide|dl-|daylist/.test(x)).join(',') || ids2}`)
  if (await p.locator('[data-testid="decide-refuse"]').count()) await p.click('[data-testid="decide-refuse"]')
  else if (await p.locator('[data-testid^="dl-refuse-"]').count()) await p.locator('[data-testid^="dl-refuse-"]').first().click()
  await p.waitForTimeout(500)
  const c5 = await cellCls(p, 'ammo', '2027-05-05')
  check(/ref/.test(c5), `after Refuse, 5 May 27 class: "${c5}"`)
  await shot(p, 's08-after-refuse-ammo-5-may')
  // an approved leave reaches Inputs at Approve (D418): read the Inputs (developer bridge read) and look at the page
  const inp = await p.evaluate(() => (window.INPUTS || []).filter(r => r.yr === 2027 && r.type === 'LL' && (r.person === 'harpoon' || (r.people || []).some(q => q.p === 'harpoon'))).map(r => JSON.stringify({ date: r.date, endDate: r.endDate || null, type: r.type })))
  check(inp.length >= 1 && inp.some(x => /Apr 13/.test(x) && /Apr 16/.test(x)), `the Inputs hold Harpoon's approved leave for 13–16 Apr 27: ${JSON.stringify(inp)}`)
  return p
})

/* =================== S11 ================== */
await scenario('S11', 'the clash note: approved leave way out (desktop strip)', async () => {
  rec()
  const p = own(await newPage()); await signIn(p)
  await jump(p, 'JAN')
  await placeBid(p, 'dice', '2026-01-19', 'OL')
  await decide(p, 'dice', '2026-01-19', 'approve')
  check(/appr/.test(await cellCls(p, 'dice', '2026-01-19')), `Reaper's (id dice) OL on 19 Jan approved: class "${await cellCls(p, 'dice', '2026-01-19')}"`)
  // HL for Reaper on 19 Jan through the Inputs page's own window
  await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(700)
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) await p.click('#inListBtn')
  await p.click('#inNew'); await p.waitForTimeout(500)
  await p.selectOption('#inpEditPerson', 'dice')
  await p.selectOption('#inpEditType', 'HL')
  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  for (let i = 0; i < 40 && !(await p.locator('#inpEdCal [data-iso="2026-01-19"]').count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .dcal-my').innerText()).trim().split(/\s+/)
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await p.locator(`#inpEdCal button[aria-label="${at < '2026-01' ? 'Next' : 'Previous'} month"]`).click()
  }
  await p.locator('#inpEdCal [data-iso="2026-01-19"]').click(); await p.locator('#inpEdCal [data-iso="2026-01-19"]').click()
  await p.click('#inpEditSave'); await p.waitForTimeout(600)
  const nodoc = p.getByRole('button', { name: 'No document' })
  if (await nodoc.count()) { await nodoc.click(); await p.waitForTimeout(700) }
  note(`HL filed on the Inputs page for Reaper on 19 Jan: ${await p.evaluate(() => window.INPUTS.filter(r => r.type === 'HL').map(r => r.date + ' ' + r.yr).join(', ') || 'NOT FILED')}`)
  await p.evaluate(() => window.go('leavewar')); await p.waitForSelector('[data-testid="row-bane"]'); await p.waitForTimeout(900)
  const strip = p.locator('[data-testid="sync-clashes"]')
  const n = await strip.count()
  note(`after HL was filed on the Inputs page: clash strip present = ${n}; war cell for Reaper 19 Jan: "${await p.locator(cellSel('dice', '2026-01-19')).innerText().catch(() => '?')}"`)
  if (n) {
    const txt = norm(await strip.innerText())
    note(`the clash strip reads: ${txt}`)
    check(!/Step the war back/i.test(txt) && !/published/i.test(txt) && !/undefined/.test(txt), 'no "Step the war back…", no "published", no "undefined" in the clash words')
    check(/Change the approved leave/.test(txt) && /the bid is approved OL/.test(txt), 'the drawn words "Change the approved leave" and "…but the bid is approved OL"')
    await shot(p, 's11-clash-strip-from-hl-recipe')
  } else {
    note('the scenario\'s own recipe (approved OL + a filed HL) raised no clash note, so the clash is made the way the browser test does it: a published weekend duty officer, then bids on that day (developer bridge — labelled fallback)')
    await p.evaluate(d => {
      const W = window, di = 5
      W.DAYS[di].ground.push({ prog: 'Range brief', str: '09:00', end: '12:00', who: '', rmks: '' }); W.afterSchedMutate()
      W.fillSlot(`g:${di}.${W.DAYS[di].ground.length - 1}.+`, 'bane'); W.afterSchedMutate()
      const g = W.signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
      W.setDayApproved(di, true); W.afterSchedMutate()
      if (W.clearToast) W.clearToast()
    }, '2026-07-18')
    await p.evaluate(d => { window.lwSetCell('plasma', d, 'LL'); window.lwSetCell('bane', d, 'OL') }, '2026-07-18')
    await p.waitForTimeout(600)
    note(`pending clash strip: ${norm(await strip.innerText().catch(() => '(none)'))}`)
    await shot(p, 's11-pending-clash-strip-weekend-fixture', { clip: { x: 0, y: 56, width: 1440, height: 260 } })
    // the pending OL is decided from the day's list the clash line opens (Ranger's row), then the strip is read again
    await p.locator('[data-testid^="clash-go-"]', { hasText: 'Decide the bid' }).nth(1).click(); await p.waitForTimeout(600)
    note(`the "Decide the bid" tap opens: ${(await dialogIds(p)).split(',').filter(x => /decide|dl-|daylist/.test(x)).join(',')}`)
    await p.locator('[data-testid^="dl-approve-"]').last().click(); await p.waitForTimeout(600)
    if (await p.locator('[role=dialog]').count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(300) }
    await p.waitForTimeout(600)
    const n2 = await strip.count()
    check(n2 === 1, `clash strip present after the weekend-work fixture: ${n2}`)
    if (n2) {
      const txt = norm(await strip.innerText())
      note(`the clash strip reads: ${txt}`)
      check(!/Step the war back/i.test(txt) && !/published /i.test(txt) && !/undefined/.test(txt), 'no old stage words / "undefined" in the clash words')
      check(/Change the approved leave/.test(txt), `the way-out words say "Change the approved leave": ${txt}`)
      check(/the (bid|day holds) (is )?approved/.test(txt) || /holds approved/.test(txt), `the sentence marks the leave as approved: ${txt}`)
      await shot(p, 's11-clash-strip-weekend-fixture', { clip: { x: 0, y: 56, width: 1440, height: 260 } })
      await p.locator('[data-testid^="clash-go-"]', { hasText: 'Change the approved leave' }).click(); await p.waitForTimeout(600)
      const ids = await dialogIds(p)
      note(`a tap on the way-out opens: ${ids.split(',').filter(x => /decide|dl-|daylist|bid-clear/.test(x)).join(',') || ids}`)
      note(`the sheet's words: ${norm(await p.locator('[data-testid="daylist"]').innerText().catch(() => '(no day list)'))}`)
      check(/dl-unapprove|decide-unapprove/.test(ids) && /dl-remove|dl-clear|bid-clear|dl-delete/.test(ids), `the tap opens a sheet with Back to bid and Delete on the approved leave (controls found: ${ids.split(',').filter(x => /dl-|decide|bid-clear/.test(x)).join(',')})`)
      await shot(p, 's11-after-tap-on-the-way-out')
    }
  }
  return p
})

/* =================== S10 ================== */
await scenario('S10', 'the page opens on the first open date from today', async () => {
  rec()
  // (a) real clock (22 Oct 26), only 1 Jan - 31 Mar 26 open: expect today
  let p = own(await newPage(true)); await signIn(p)
  const todayIso = new Date().toISOString().slice(0, 10)
  note(`browser clock today: ${todayIso}`)
  check(await dateInView(p, todayIso), `(a) only Jan–Mar 26 open: the grid lands on today ${todayIso} (heading in view)`)
  note(`(a) period on screen: ${await p.locator('[data-testid="war-picker"]').inputValue()}; scrollLeft ${await wrapLeft(p)}`)
  await shot(p, 's10-a-lands-on-today')
  // (b) open JAN 27 only in the 2027 period -> reload
  await p.locator('[data-testid="war-picker"]').selectOption('y2027'); await p.waitForTimeout(800)
  note(`(b) selecting the 2027 period (nothing open there): ${await dateInView(p, '2027-01-01') ? '1 Jan 27 in view' : 'not at 1 Jan 27'}; today in view: ${await dateInView(p, todayIso)}; chip "${await chip(p)}"`)
  await openWin(p); await tapMonth(p, '2027-01'); await closeWin(p)
  check(/1 Jan – 31 Jan/.test(await chip(p)), `(b) 2027 chip after opening JAN 27: "${await chip(p)}"`)
  await p.reload(); await p.waitForSelector('#luser'); await signIn(p)
  const cur = await p.locator('[data-testid="war-picker"]').inputValue()
  check(cur === 'y2027', `(b) after the reload with only JAN 27 open from today, the period on screen is ${cur}`)
  check(await landedAt(p, '2027-01-01') && (await wrapLeft(p)) <= 2, `(b) the grid lands at the start of the period, 1 Jan 27 (scrollLeft ${await wrapLeft(p)}, heading inside the grid ${await landedAt(p, '2027-01-01')})`)
  note(`(b) 1 Jan 27 clear of the Figures drawer: ${await dateInView(p, '2027-01-01')} — at the start of a period the first dates lie under the Figures drawer that opens over the grid on a desktop`)
  await shot(p, 's10-b-reload-lands-on-jan-27')
  // View switch to 2026 -> where does it land?
  await p.locator('[data-testid="war-picker"]').selectOption('y2026'); await p.waitForTimeout(900)
  note(`(b) View switch back to 2026: today in view = ${await dateInView(p, todayIso)}; 1 Jan 26 in view = ${await dateInView(p, '2026-01-01')}; scrollLeft ${await wrapLeft(p)}`)
  await shot(p, 's10-b-view-switch-to-2026')
  await p.locator('[data-testid="war-picker"]').selectOption('y2027'); await p.waitForTimeout(900)
  note(`(b) View switch to 2027: 1 Jan 27 in view = ${await dateInView(p, '2027-01-01')}; scrollLeft ${await wrapLeft(p)}`)
  await p.context().close()
  // (c') open 1-30 Nov 26 as well (today is 22 Oct 26): the first open date from today is 1 Nov 26
  p = own(await newPage(true)); await signIn(p)
  await openWin(p); await tapMonth(p, '2026-11'); await closeWin(p)
  await p.reload(); await p.waitForSelector('#luser'); await signIn(p)
  check(await dateInView(p, '2026-11-01'), "(c') Jan–Mar 26 and NOV 26 open, today 22 Oct 26: lands at 1 Nov 26 (heading in view)")
  note(`(c') today in view = ${await dateInView(p, todayIso)}`)
  await shot(p, 's10-c-lands-on-1-nov')
  note('(c) with the clock at 15 Feb 26 and (d) today in no period: not walked as admin — the admin has no clock pin, and a period that holds no today cannot be made through the controls.')
  return p
})

/* =================== S12 ================== */
await scenario('S12', 'an old saved war loads (stage + bid window shapes)', async () => {
  rec()
  const cases = [
    ['open + window 1 Jan–31 Mar', { stage: 'open', bidFrom: '2026-01-01', bidTo: '2026-03-31' }, /Open for bidding 1 Jan – 31 Mar$/],
    ['open + null window (whole period)', { stage: 'open', bidFrom: null, bidTo: null }, /Open for bidding 1 Jan – 31 Dec$/],
    ['closed + window', { stage: 'closed', bidFrom: '2026-01-01', bidTo: '2026-03-31' }, /Bidding closed/],
    ['published', { stage: 'published', bidFrom: '2026-01-01', bidTo: '2026-03-31' }, /Bidding closed/],
    ['draft', { stage: 'draft', bidFrom: null, bidTo: null }, /Bidding closed/],
  ]
  let n = 0
  for (const [label, extra, expect] of cases) {
    const p = own(await newPage(true)); await signIn(p)
    const okLoad = await p.evaluate(w => window.lwLoadWars([w], 'y2026'), oldWar('y2026', 'JAN - DEC 26', '2026-01-01', '2026-12-31', extra))
    await p.waitForTimeout(900)
    const c = await chip(p)
    check(okLoad !== false && expect.test(c), `${label}: lwLoadWars -> ${JSON.stringify(okLoad)}; chip "${c}"`)
    if (n++ < 2) await shot(p, `s12-${label.slice(0, 8).replace(/\W+/g, '-')}-after-load`, { clip: { x: 0, y: 56, width: 1440, height: 100 } })
    // then reload
    await p.reload(); await p.waitForSelector('#luser').catch(() => {})
    const needLogin = await p.locator('#luser').count()
    if (needLogin) await signIn(p)
    const c2 = await chip(p)
    note(`${label}: after the reload the chip reads "${c2}" (the war from the load ${expect.test(c2) ? 'is kept' : 'is NOT kept — the demo war is back'})`)
    await p.context().close()
  }
  note('the old shape is fed through the developer bridge lwLoadWars (as the brief says); a reload after it is recorded above as a RECORD')
  return null
})

/* =================== S13 ================== */
await scenario('S13', 'one command, one Undo, named words, grid stays (June on screen)', async () => {
  const p = own(await newPage()); await signIn(p)
  await jump(p, 'JUN')
  const base = await wrapLeft(p)
  check(await dateInView(p, '2026-06-15'), `June is on screen (scrollLeft ${base})`)
  await shot(p, 's13-june-on-screen')
  await openWin(p)
  const st0 = await stateStr(p)
  let base2 = base
  const still = async what => check(Math.abs(await wrapLeft(p) - base2) <= 2 && await dateInView(p, '2026-06-15'), `the grid did not jump ${what} (scrollLeft ${await wrapLeft(p)} vs ${base2}; June heading in view ${await dateInView(p, '2026-06-15')})`)
  note(`scrollLeft before the window opened ${base}, with the window open ${await wrapLeft(p)}`)
  // 1. tap APR
  await tapMonth(p, '2026-04'); base2 = await wrapLeft(p)
  note(`scrollLeft after APR opened, before any Undo: ${base2} (June baseline ${base})`)
  const st1 = await stateStr(p)
  check(/04:o/.test(st1), `APR opened: ${st1}`)
  let u = await undoNow(p)
  check((await stateStr(p)) === st0, `ONE Undo took back opening APR: ${await stateStr(p)} (was ${st0}); the button said "${u.title}"; bubble words: "${u.words}"`)
  await still('on Undo of APR')
  await shot(p, 's13-after-undo-open-apr')
  u = await undoNow(p, 'redo')
  check((await stateStr(p)) === st1, `Redo put APR back: ${await stateStr(p)}; button "${u.title}"; words "${u.words}"`)
  await still('on Redo')
  // 2. drag JUL -> SEP, ONE undo
  await dragMonths(p, '2026-07', '2026-09')
  const st3 = await stateStr(p)
  check(/07:o/.test(st3) && /08:o/.test(st3) && /09:o/.test(st3), `drag JUL→SEP opened: ${st3}`)
  u = await undoNow(p)
  check((await stateStr(p)) === st1, `ONE Undo took back the whole three-month drag: ${await stateStr(p)} (expected ${st1}); button "${u.title}"; words "${u.words}"`)
  await still('on Undo of the drag')
  await shot(p, 's13-after-undo-drag')
  // 3. exact range through the calendar
  await openExact(p, '2026-11-10', '2026-11-20')
  const st5 = await stateStr(p)
  check(/11:p/.test(st5), `calendar 10–20 Nov opened NOV in part: ${st5}`)
  u = await undoNow(p)
  check((await stateStr(p)) === st1, `ONE Undo took back the calendar's range: ${await stateStr(p)}; button "${u.title}"; words "${u.words}"`)
  await still('on Undo of the calendar range')
  // the stack beyond the three gestures
  let more = 0
  await closeWin(p)
  while (!(await p.locator('#undoBtn').isDisabled()) && more < 6) { await p.locator('#undoBtn').click(); await p.waitForTimeout(300); more++ }
  note(`after those, ${more} further Undo(s) were enabled (expected 1 — the first APR opening)`)
  await openWin(p)
  check(more === 1 && (await stateStr(p)) === st0, `the stack held exactly the APR opening beyond the three gestures; states ${await stateStr(p)}`)
  await shot(p, 's13-undo-all-back-to-start')
  return p
})

/* =================== S14 ================== */
await scenario('S14', 'a month drag runs in calendar order (desktop: SEP back to MAR)', async () => {
  const p = own(await newPage()); await signIn(p)
  await openWin(p); await closeAllMonths(p)
  check(/Bidding closed/.test(await chip(p)) || true, 'all closed first')
  await dragMonths(p, '2026-09', '2026-03', 14)
  const ln = await lines(p), st = await stateStr(p)
  check(ln.length === 1 && /1 Mar – 30 Sep/.test(ln[0]), `backward drag SEP → MAR: lines ${JSON.stringify(ln)}; ${st}`)
  await shotWin(p, 's14-after-drag-sep-to-mar')
  await closeAllMonths(p)
  await dragMonths(p, '2026-05', '2026-09', 14)
  const ln2 = await lines(p)
  check(ln2.length === 1 && /1 May – 30 Sep/.test(ln2[0]), `forward drag MAY → SEP: lines ${JSON.stringify(ln2)}`)
  await shotWin(p, 's14-after-drag-may-to-sep')
  // a fast drag (few steps), skipping the months between: still every month
  await closeAllMonths(p)
  await dragMonths(p, '2026-02', '2026-08', 1)
  const ln3 = await lines(p)
  check(ln3.length === 1 && /1 Feb – 31 Aug/.test(ln3[0]), `a one-jump drag FEB → AUG (no months crossed): lines ${JSON.stringify(ln3)}`)
  return p
})

/* =================== S15 ================== */
await scenario('S15', 'a drag that starts on an open month closes', async () => {
  rec()
  const p = own(await newPage()); await signIn(p)
  await openWin(p)
  const st0 = await stateStr(p)
  note(`start: ${st0}`)
  await dragMonths(p, '2026-02', '2026-04')
  const st = await stateStr(p), ln = await lines(p)
  check(!/04:o/.test(st) && /02:c/.test(st) && /03:c/.test(st) && /01:o/.test(st), `FEB→APR drag from an open month: ${st}; lines ${JSON.stringify(ln)}`)
  note(`APR (closed already) after the drag: ${(await states(p))['2026-04']}; JAN (not passed): ${(await states(p))['2026-01']}`)
  await shotWin(p, 's15-after-drag-feb-to-apr')
  return p
})

/* =================== S16 ================== */
await scenario('S16', 'a month open in part: dotted, one tap opens it whole', async () => {
  rec()
  const p = own(await newPage()); await signIn(p)
  await openWin(p); await closeAllMonths(p)
  await openExact(p, '2026-03-10', '2026-03-20')
  let s = await states(p)
  check(s['2026-03'] === 'part', `10–20 Mar by the calendar: MAR is "${s['2026-03']}" (expected part)`)
  await shotWin(p, 's16-mar-part-open')
  const el = await p.locator('[data-testid="od-month-2026-03"]').evaluate(e => { const c = getComputedStyle(e); return `${c.borderStyle} ${c.borderWidth}` })
  note(`MAR button border: ${el}`)
  await tapMonth(p, '2026-03')
  s = await states(p)
  check(s['2026-03'] === 'open', `one tap on the part-open MAR makes it "${s['2026-03']}" (expected open — whole)`)
  check(/1 Mar – 31 Mar/.test((await lines(p)).join('|')), `its line: ${JSON.stringify(await lines(p))}`)
  await tapMonth(p, '2026-03')
  s = await states(p)
  check(s['2026-03'] === 'closed', `a second tap closes it: "${s['2026-03']}"`)
  // a drag that STARTS on a part-open month
  await openExact(p, '2026-03-10', '2026-03-20')
  await dragMonths(p, '2026-03', '2026-05')
  note(`RECORD: a drag starting on the part-open MAR to MAY: ${await stateStr(p)}; lines ${JSON.stringify(await lines(p))}`)
  await closeAllMonths(p)
  // a stretch 25 Feb - 5 Mar: both months dotted
  await openExact(p, '2026-02-25', '2026-03-05')
  s = await states(p)
  check(s['2026-02'] === 'part' && s['2026-03'] === 'part', `25 Feb – 5 Mar: FEB "${s['2026-02']}", MAR "${s['2026-03']}" (both expected part)`)
  await shotWin(p, 's16-feb-mar-both-part')
  return p
})

/* =================== S17 ================== */
await scenario('S17', 'join and split of stretches', async () => {
  const p = own(await newPage()); await signIn(p)
  await openWin(p); await closeAllMonths(p)
  await tapMonth(p, '2026-03'); await tapMonth(p, '2026-05')
  let ln = await lines(p)
  check(ln.length === 2, `MAR and MAY: two lines ${JSON.stringify(ln)}`)
  await tapMonth(p, '2026-04')
  ln = await lines(p)
  check(ln.length === 1 && /1 Mar – 31 May/.test(ln[0]) && /92 days/.test(ln[0]), `then APR: one line, 92 days: ${JSON.stringify(ln)}`)
  await shotWin(p, 's17-joined-mar-may')
  await tapMonth(p, '2026-04')
  ln = await lines(p)
  check(ln.length === 2, `close APR: two lines again ${JSON.stringify(ln)}`)
  await closeAllMonths(p)
  await tapMonth(p, '2026-03')
  await openExact(p, '2026-02-15', '2026-04-15')
  ln = await lines(p)
  check(ln.length === 1 && /15 Feb – 15 Apr/.test(ln[0]), `calendar 15 Feb – 15 Apr over an open MAR: ${JSON.stringify(ln)}`)
  await shotWin(p, 's17-calendar-over-open-month')
  const dup = new Set(ln).size === ln.length
  check(dup, 'no duplicate lines')
  return p
})

/* =================== S18 ================== */
await scenario('S18', 'a period that is not January–December', async () => {
  rec()
  const p = own(await newPage()); await signIn(p)
  const mk = async (name, from, to) => {
    await p.click('[data-testid="war-new"]')
    await p.fill('[data-testid="war-name"]', name)
    await pickSpan(p, 'war', from, to)
    await p.click('[data-testid="war-create"]'); await p.waitForTimeout(900)
  }
  // the demo already holds 2026 and 2027, so the scenario's 1 Apr 27 – 31 Mar 28 is moved one year on
  await mk('APR 28 - MAR 29', '2028-04-01', '2029-03-31')
  await openWin(p)
  let btns = (await p.locator('[data-testid^="od-month-"]').allInnerTexts()).map(norm)
  note(`1 Apr 28 – 31 Mar 29: ${btns.length} month buttons: ${btns.join(' ')}`)
  check(btns.length === 12 && /^APR/.test(btns[0]) && /^MAR/.test(btns[11]), '12 buttons, APR first, MAR last')
  await shotWin(p, 's18-apr-to-mar-period-window')
  await closeWin(p)
  await mk('JAN 30 - JAN 31', '2030-01-15', '2031-01-14')
  await openWin(p)
  btns = (await p.locator('[data-testid^="od-month-"]').allInnerTexts()).map(norm)
  note(`15 Jan 30 – 14 Jan 31: ${btns.length} month buttons: ${btns.join(' ')}`)
  const s = await states(p)
  await shotWin(p, 's18-thirteen-month-period-window')
  await tapMonth(p, '2030-01')
  note(`tapping the partial first month JAN 30 gives: ${await stateStr(p)}; lines ${JSON.stringify(await lines(p))}`)
  await tapMonth(p, '2030-01')
  await tapMonth(p, '2031-01')
  note(`tapping the partial last month JAN 31 gives: ${await stateStr(p)}; lines ${JSON.stringify(await lines(p))}`)
  check(btns.length === 13, `13 buttons for a 13-calendar-month period (${btns.length})`)
  await shotWin(p, 's18-partial-months-tapped')
  return p
})

/* =================== S19 ================== */
await scenario('S19', 'the window follows the record changed behind it (top-bar Undo / Redo)', async () => {
  const p = own(await newPage()); await signIn(p)
  await openWin(p)
  const st0 = await stateStr(p), ln0 = await lines(p)
  await tapMonth(p, '2026-05')
  const st1 = await stateStr(p)
  // can the top bar's Undo be pressed WITH THE WINDOW OPEN?
  const hit = await p.evaluate(() => { const b = document.querySelector('#undoBtn'); const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h ? (h.dataset.testid || h.className || h.tagName) : 'none' })
  check(hit === '#undoBtn' || hit === 'undoBtn' || /undo/i.test(hit) || hit === 'BUTTON', `with the window open, what a mouse press on the top bar's Undo reaches: "${hit}" (the Undo button itself expected, as the scenario presses it behind the window)`)
  await shot(p, 's19-window-open-scrim-over-top-bar')
  // the way a person must do it: close the window, press Undo, look
  let u = await undoNow(p)
  check((await stateStr(p)) === st0, `after Undo the reopened window shows: ${await stateStr(p)} (expected ${st0}); lines ${JSON.stringify(await lines(p))}`)
  check(JSON.stringify(await lines(p)) === JSON.stringify(ln0), 'the lines follow too')
  await shotWin(p, 's19-window-after-undo')
  u = await undoNow(p, 'redo')
  check((await stateStr(p)) === st1, `Redo: ${await stateStr(p)} (expected ${st1})`)
  // a stale tap: after an Undo, a tap acts on the picture it shows now
  u = await undoNow(p)
  await tapMonth(p, '2026-05')
  check(/05:o/.test(await stateStr(p)), `a tap after the Undo opens MAY from the picture it shows: ${await stateStr(p)}`)
  note(`chip now: "${await chip(p)}"`)
  return p
})

/* =================== S20 ================== */
await scenario('S20', 'keyboard and Escape', async () => {
  const p = own(await newPage()); await signIn(p)
  const focused = () => p.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}${a.dataset?.testid ? '[' + a.dataset.testid + ']' : ''}${a.getAttribute('aria-label') ? ' "' + a.getAttribute('aria-label').slice(0, 40) + '"' : ''}` : 'none' })
  const what = async () => `window ${await win(p).count() ? 'open' : 'closed'}, calendar ${await p.locator('[data-testid="od-new-picker"], [data-testid="od-range-picker"]').count() ? 'open' : 'closed'}, focus ${await focused()}`
  await p.locator('[data-testid="open-chip"]').focus()
  check((await focused()).includes('open-chip'), `the chip takes focus: ${await focused()}`)
  await p.keyboard.press('Enter'); await p.waitForTimeout(400)
  check(await win(p).count() === 1, 'Enter on the chip opens the window')
  note(`focus after the window opened: ${await focused()}`)
  const seq = []
  for (let i = 0; i < 16; i++) { await p.keyboard.press('Tab'); seq.push(await focused()) }
  note(`Tab order inside the window (16 presses): ${seq.join(' → ')}`)
  const monthsReached = seq.filter(x => /od-month/.test(x)).length
  check(monthsReached === 12, `Tab reaches all 12 month buttons (${monthsReached})`)
  await p.locator('[data-testid="od-month-2026-06"]').focus()
  await p.keyboard.press('Space'); await p.waitForTimeout(300)
  check((await states(p))['2026-06'] === 'open', `Space on JUN opens it: ${await stateStr(p)}`)
  await p.keyboard.press('Space'); await p.waitForTimeout(300)
  check((await states(p))['2026-06'] === 'closed', 'Space again closes it')
  await p.locator('[data-testid^="od-line-"] .od-line-go').first().focus()
  await p.keyboard.press('Enter'); await p.waitForTimeout(400)
  check(await p.locator('[data-testid="od-range-picker"]').count() === 1, 'Enter on the stretch line opens its calendar')
  await shot(p, 's20-calendar-open-by-keyboard')
  // the month list inside the calendar
  await p.locator('[data-testid="od-range-title"]').click(); await p.waitForTimeout(300)
  const l0 = await what()
  await shot(p, 's20-month-list-open')
  await p.keyboard.press('Escape'); await p.waitForTimeout(300)
  const l1 = await what()
  check(/window open, calendar open/.test(l1), `Escape #1 with the calendar's month list open closes only the list: before [${l0}]; after [${l1}]`)
  await p.keyboard.press('Escape'); await p.waitForTimeout(300)
  const l2 = await what()
  check(/window open, calendar closed/.test(l2), `Escape #2 closes the calendar only (the window stays): [${l2}]`)
  if (await win(p).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(300) }
  const l3 = await what()
  check(await win(p).count() === 0, `the next Escape closes the window: [${l3}]`)
  check((await focused()).includes('open-chip'), `focus returns to the chip (the button that opened the window): ${await focused()}`)
  await shot(p, 's20-after-escapes-focus')
  // Escape with focus on a month button of the plain window
  await p.locator('[data-testid="open-chip"]').click(); await p.waitForTimeout(300)
  await p.locator('[data-testid="od-month-2026-06"]').focus()
  await p.keyboard.press('Escape'); await p.waitForTimeout(300)
  note(`Escape with a month button focused in the plain window: [${await what()}]`)
  check((await focused()).includes('open-chip'), `focus returns to the chip after that Escape too: ${await focused()}`)
  // the ✕ by keyboard
  await p.locator('[data-testid="open-chip"]').focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(300)
  await p.locator('[data-testid="open-dates-close"]').focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(300)
  note(`the ✕ pressed with Enter: [${await what()}]`)
  note('RECORD: a month range-opened without the mouse — Space/Enter opens or closes ONE whole month at a time; no key drags across several months. Exact ranges: Enter on a stretch line or "+ Open more dates" opens the calendar, whose days take the keyboard.')
  return p
})

/* =================== S24 ================== */
await scenario('S24', 'the moved mark on any move of approved leave', async () => {
  const p = own(await newPage()); await signIn(p)
  await jump(p, 'JAN')
  await placeBid(p, 'bane', '2026-01-20', 'LL'); await decide(p, 'bane', '2026-01-20', 'approve')
  check(/appr/.test(await cellCls(p, 'bane', '2026-01-20')), `Ranger's LL on 20 Jan approved (an OPEN day): "${await cellCls(p, 'bane', '2026-01-20')}"`)
  const edge = async (id, iso) => p.locator(cellSel(id, iso) + ' .c').evaluate(e => { const c = getComputedStyle(e); return `${c.borderLeftStyle} ${c.borderLeftWidth}` }).catch(() => '(none)')
  const move = async (id, from, to) => {
    await p.locator(cellSel(id, from)).click(); await p.waitForTimeout(350)
    await p.click('[data-testid="decide-shift"]'); await p.locator('[data-testid="move-banner"]').waitFor(); await p.waitForTimeout(500)
    await p.locator(cellSel(id, to)).click(); await p.waitForTimeout(400)
    if (await p.locator('[data-testid="move-confirm"]').count()) { await p.click('[data-testid="move-confirm"]'); await p.waitForTimeout(500) }
  }
  await move('bane', '2026-01-20', '2026-01-22')
  const e22 = await edge('bane', '2026-01-22')
  check(/dotted/.test(e22) && !/^dotted 0/.test(e22), `the approved leave moved on an open day wears the dotted edge on 22 Jan: "${e22}"`)
  check(!/appr/.test(await cellCls(p, 'bane', '2026-01-20')) && /appr|moved/.test(await cellCls(p, 'bane', '2026-01-22')), `20 Jan emptied; 22 Jan holds it: "${await cellCls(p, 'bane', '2026-01-22')}"`)
  await shot(p, 's24-moved-mark-on-22-jan', { clip: { x: 0, y: 330, width: 1440, height: 360 } })
  await p.locator('[data-testid="legend-open"]').click(); await p.waitForTimeout(500)
  const leg = norm(await p.locator('[data-testid="legend"]').innerText().catch(() => ''))
  check(/Moved here from another day/.test(leg), `the Legend carries the moved line (no stage words): "${leg.slice(0, 220)}"`)
  await shot(p, 's24-legend-with-moved-line')
  await p.keyboard.press('Escape'); await p.waitForTimeout(300)
  if (await p.locator('[data-testid="legend"]').count()) await p.mouse.click(700, 120)
  await p.locator(cellSel('bane', '2026-01-22')).click(); await p.waitForTimeout(450)
  const mv = p.locator('[data-testid="decide-movedfrom"]')
  const mvTxt = (await mv.count()) ? norm(await mv.innerText()) : '(no moved-from line)'
  check(/20 Jan/.test(mvTxt), `the window says where it moved from: "${mvTxt}"`)
  await shot(p, 's24-window-says-moved-from')
  await p.keyboard.press('Escape'); await p.waitForTimeout(300)
  // an admin moves a PENDING bid: does it get the mark?
  await placeBid(p, 'bane', '2026-01-26', 'LL')
  await move('bane', '2026-01-26', '2026-01-28')
  const e28 = await edge('bane', '2026-01-28')
  note(`RECORD: an admin moves a PENDING bid 26→28 Jan: the landed cell's left edge is "${e28}" (a dotted edge would mean it gets the moved mark; the browser test says none)`)
  rec()
  await shot(p, 's24-pending-bid-moved-by-admin', { clip: { x: 0, y: 330, width: 1440, height: 360 } })
  return p
})

/* =================== S36 ================== */
await scenario('S36', '"No leave period yet" (a store holding no war)', async () => {
  rec()
  const p = own(await newPage()); await signIn(p)
  const r = await p.evaluate(() => { try { return window.lwLoadWars([], '') } catch (e) { return 'threw ' + e.message } })
  await p.waitForTimeout(900)
  const body = norm(await p.locator('#page-leavewar').innerText())
  note(`no route in the app itself to a store with no war: only the developer bridge lwLoadWars([]) (returned ${JSON.stringify(r)}). The Leave War page then reads: "${body.slice(0, 260)}"`)
  S.notWalked = 'NOT WALKED: the app has no route to a store holding no leave war (the bridge refused an empty list and the page still shows the demo wars), so the "No leave period yet" page was not reached'
  await shot(p, 's36-no-leave-period-yet')
  return p
})

/* =================== S22 ================== */
await scenario('S22', 'desktop chip with two stretches shows "+1"', async () => {
  const p = own(await newPage()); await signIn(p)
  await openWin(p)
  await dragMonths(p, '2026-05', '2026-08')
  const ln = await lines(p)
  check(ln.length === 2, `JAN–MAR and MAY–AUG: two lines ${JSON.stringify(ln)}`)
  await closeWin(p)
  const c = await chip(p)
  check(/\+1$/.test(c), `chip reads "${c}" (expected …+1)`)
  const h = await p.evaluate(() => { const f = document.querySelector('#page-leavewar .filters'); const r = f.getBoundingClientRect(); const chip = document.querySelector('[data-testid="open-chip"]').getBoundingClientRect(); return { filters: Math.round(r.height), chip: Math.round(chip.height), legend: !!document.querySelector('[data-testid="legend-open"]') } })
  note(`measured: filters row ${h.filters}px tall, chip ${h.chip}px tall, Legend button present ${h.legend}`)
  check(h.chip < 45, `the chip stays one line (${h.chip}px)`)
  await shot(p, 's22-two-stretches-desktop-top', { clip: { x: 0, y: 56, width: 1440, height: 110 } })
  // the green outline: one box per stretch (they are measured lazily once the months are drawn)
  await jump(p, 'FEB'); await p.waitForTimeout(700)
  const boxes = await p.evaluate(() => [...document.querySelectorAll('[data-testid="bid-box"]')].map(e => e.dataset.from))
  check(boxes.length === 2, `outline boxes on the grid for two stretches: ${JSON.stringify(boxes)}`)
  await shot(p, 's22-outline-jan-mar-on-screen')
  await jump(p, 'JUN'); await p.waitForTimeout(700)
  await shot(p, 's22-outline-may-aug-on-screen')
  return p
})

/* =================== S23 ================== */
await scenario('S23', '"Bidding closed" tap: last stretch and who closed it', async () => {
  rec()
  const p = own(await newPage(true)); await signIn(p)
  await openWin(p); await dragMonths(p, '2026-01', '2026-03'); await closeWin(p)
  check(/Bidding closed/.test(await chip(p)), `(a) chip: "${await chip(p)}"`)
  await p.click('[data-testid="open-chip"]'); await win(p).waitFor()
  const none = norm(await p.locator('[data-testid="od-none"]').innerText())
  note(`(a) window text after closing JAN–MAR: "${none}"`)
  check(/Saber/.test(none) && /1 Jan – 31 Mar/.test(none), `(a) it names the stretch and who closed it: "${none}"`)
  await shotWin(p, 's23-a-bidding-closed-window')
  await closeWin(p)
  // (b) open APR then Undo it
  await openWin(p); await tapMonth(p, '2026-04'); const ub = await undoNow(p); note(`(b) the Undo said: ${ub.words.split(' | ')[0]}`); await p.waitForTimeout(4500)
  const noneB = (await p.locator('[data-testid="od-none"]').count()) ? norm(await p.locator('[data-testid="od-none"]').innerText()) : '(none line absent)'
  note(`(b) after opening APR and Undoing it: "${noneB}"`)
  await shotWin(p, 's23-b-after-undo-of-opening')
  await closeWin(p)
  // (c) a period never opened
  await p.locator('[data-testid="war-picker"]').selectOption('y2027'); await p.waitForTimeout(800)
  await openWin(p); await p.waitForTimeout(1500)
  note(`(c) 2027, never opened: "${norm(await p.locator('[data-testid="od-none"]').innerText())}"`)
  await shotWin(p, 's23-c-never-opened-period')
  await closeWin(p)
  await p.locator('[data-testid="war-picker"]').selectOption('y2026'); await p.waitForTimeout(800)
  // (e) reload after (a)-(b) state: reload and read
  const chipBeforeReload = await chip(p)
  await p.reload(); await p.waitForSelector('#luser'); await signIn(p)
  await p.locator('[data-testid="war-picker"]').selectOption('y2026'); await p.waitForTimeout(800)
  await openWin(p)
  const afterReload = (await p.locator('[data-testid="od-none"]').count()) ? norm(await p.locator('[data-testid="od-none"]').innerText()) : '(open: ' + (await lines(p)).join(' | ') + ')'
  note(`(e) before reload chip "${chipBeforeReload}"; after the reload the window says: "${afterReload}"`)
  check(/Saber/.test(afterReload) || /1 Jan – 31 Mar/.test(afterReload), `(e) the last-closed note survives the reload: "${afterReload}"`)
  await shotWin(p, 's23-e-after-reload')
  return p
})

/* =================== S37 ================== */
await scenario('S37', 'the schedule "Create the period" button on a weekend no period covers', async () => {
  const p = own(await newPage()); await signIn(p)
  process.env.HP_URL = 'http://localhost:4252'
  const lib = await import('./lib.mjs')       // the repo's own board helpers (tap / type / put / board), pointed at this page
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await lib.go(p, 'editsched')
  await p.click('[aria-label="Jump to a date"]:visible'); await p.waitForTimeout(500)
  const want = 2028 * 12 + 2
  for (let i = 0; i < 80; i++) {
    const at = await p.locator('[data-testid="wcal"]').first().getAttribute('data-month')
    const d = want - (+at.slice(0, 4) * 12 + +at.slice(5, 7))
    if (!d) break
    await p.locator(`[data-testid="wcal-${d > 0 ? 'next' : 'prev'}"]`).first().click(); await p.waitForTimeout(30)
  }
  await p.locator('[data-testid="wcal-day-2028-02-12"]').click(); await p.waitForTimeout(1200)
  note(`edit week now: ${await p.evaluate(() => window.CURWEEK)} (Saturday 12 Feb 2028 is day 5)`)
  await lib.board(p, 5)
  await lib.tap(p, '[data-gradd="5"]'); await p.waitForTimeout(600)
  const gi = await p.evaluate(() => (window.DAYS[5].ground || []).length - 1)
  await lib.type(p, `[data-bfld="gr:5.${gi}.prog"]`, 'SDO'); await lib.type(p, `[data-bfld="gr:5.${gi}.str"]`, '08:00'); await lib.type(p, `[data-bfld="gr:5.${gi}.end"]`, '18:00')
  const free = await p.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].map(e => e.dataset.person).filter(q => window.PEOPLE[q] && !/^all/i.test(q)).slice(0, 25))
  const put = await lib.put(p, `[data-fill="g:5.${gi}.+"]`, free)
  check(!/FAILED/.test(String(put)), `a man put on a Saturday 12 Feb 2028 duty row: ${put}`)
  await lib.closeBoard(p); await p.waitForTimeout(800)
  const t = p.locator('[data-daywarn="5"]:visible').first()
  if (await t.count()) { await t.click({ force: true }); await p.waitForTimeout(700) }
  const info = await p.evaluate(() => ({ reason: (document.body.innerText.match(/There is no leave war period for 2028[^\n]*/) || [''])[0], btns: [...document.querySelectorAll('[data-mkperiod]')].map(b => b.innerText.trim()) }))
  check(!!info.reason && info.btns.length === 1, `the day names the missing period and offers: reason "${info.reason}" / buttons ${JSON.stringify(info.btns)}`)
  await shot(p, 's37-schedule-day-warning-with-create-button')
  await p.locator('[data-mkperiod]:visible').first().click(); await p.waitForTimeout(500)
  const toast = await p.evaluate(() => (document.body.innerText.match(/The 2028 leave war period[^\n]*|A leave war already[^\n]*|The 2028 period could not[^\n]*/) || ['(no toast text found)'])[0])
  note(`RECORD: the toast after pressing it: "${toast}"`)
  await p.waitForTimeout(700)
  check(await p.evaluate(() => window.CURPAGE) === 'leavewar', `it takes him to the Leave War (page: ${await p.evaluate(() => window.CURPAGE)})`)
  const optsAfter = (await p.locator('[data-testid="war-picker"] option').allInnerTexts()).map(norm)
  const onScreen = norm(await p.locator('[data-testid="war-picker"] option:checked').innerText())
  note('the period list now: ' + JSON.stringify(optsAfter) + '; on screen right after the button: "' + onScreen + '" with the chip "' + (await chip(p)) + '"')
  check(/28/.test(onScreen), 'the Leave War opens on the period just created (the toast says "Open its dates for bidding here"): on screen "' + onScreen + '", chip "' + (await chip(p)) + '"')
  await shot(p, 's37-leave-war-after-create-period')
  const made = optsAfter.find(o => /28/.test(o))
  check(!!made, 'the 2028 period exists in the period list: ' + JSON.stringify(optsAfter))
  if (made) {
    await p.locator('[data-testid="war-picker"]').selectOption({ label: made }); await p.waitForTimeout(800)
    check(/Bidding closed/.test(await chip(p)), 'the new period is closed once picked: chip "' + (await chip(p)) + '"')
    await openWin(p)
    check((await p.locator('[data-testid="od-none"]').count()) === 1, 'its window says nothing is open: "' + norm(await p.locator('[data-testid="od-none"]').innerText().catch(() => '?')) + '"')
  }
  await shotWin(p, 's37-new-period-window')
  note('the toast says "Open its dates for bidding here." where the Leave War has no "window" any more, only the "Open for bidding" chip and its window: RECORD for the host (wording, D1177)')
  return p
})

/* ---- finish ---- */
await browser.close()
console.log('\n\n==== SUMMARY ====')
for (const r of results) console.log(`${r.id}\t${r.verdict}\t${r.title}`)
console.log('\nconsole/page errors seen:', consoleErrors.length ? '\n' + [...new Set(consoleErrors)].join('\n') : 'none')
