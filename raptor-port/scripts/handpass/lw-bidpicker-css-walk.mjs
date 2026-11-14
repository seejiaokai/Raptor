// WALK of [LW-BIDPICKER-CSS-INSIDE] (14 Nov 26, tier WALK): the bid sheet's 202 rules moved inside #page-leavewar; nothing a
// person sees should change. Every window the moved rules draw is opened and pictured, desktop 1536x864 and iPhone-size 402x874,
// admin and member. Steps never throw: a step that cannot act is NOT WALKED with the reason, and a picture is always taken.
// Run from raptor-port/ against a built bundle served on PORT (default 4294):  node scripts/handpass/lw-bidpicker-css-walk.mjs [desk|phone]
// Pictures: docs/img/handpass/2026-11-14-bidpicker-css/walk/ (d-NN-* desktop, p-NN-* phone); the log: walk-log.json beside them.
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

console.log('lw-bidpicker-css-walk v1')
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../../docs/img/handpass/2026-11-14-bidpicker-css/walk')
const BASE = `http://localhost:${process.env.PORT || 4294}`
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const only = process.argv[2]
mkdirSync(OUT, { recursive: true })
if (!only) for (const f of readdirSync(OUT)) if (f.endsWith('.png') || f === 'walk-log.json') unlinkSync(path.join(OUT, f))
const T = id => `[data-testid="${id}"]`
const T0 = '2026-11-04T09:00:00+08:00'
const browser = await chromium.launch(launchOptions)
const LOG = []
const errorsAll = []

async function world(size, who) {
  const phone = size === 'phone'
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, userAgent: devices['iPhone 13'].userAgent }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 })
  await ctx.clock.install({ time: new Date(T0) })
  const page = await ctx.newPage()
  page.setDefaultTimeout(8000)
  const w = { ctx, page, phone, size, who, n: 0, pre: phone ? 'p' : 'd', errs: [] }
  page.on('pageerror', e => w.errs.push('pageerror: ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') w.errs.push('console: ' + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) w.errs.push(`http ${r.status()} ${r.url().slice(0, 120)}`) })
  await page.goto(BASE + '/?fresh=1')
  await page.waitForSelector('#luser')
  const [u, p] = who === 'member' ? ['us', 'us'] : ['ad', 'a']
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '#toastEl, .toast { visibility: hidden !important; }' })
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector(T(who === 'member' ? 'row-bane' : 'row-stiff'), { state: 'attached' })
  await page.waitForTimeout(700)
  return w
}
async function settle(w) {
  await w.page.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity), null, { timeout: 4000 }).catch(() => {})
  await w.page.waitForTimeout(250)
}
async function snap(w, label, quick = false) {
  if (!quick) await settle(w)
  w.n++
  const name = `${w.pre}-${String(w.n).padStart(2, '0')}-${w.who === 'member' ? 'mem-' : ''}${label}.png`
  await w.page.screenshot({ path: path.join(OUT, name) })
  return name
}
function rec(w, step, result, note, pics) { LOG.push({ size: w.size, who: w.who, step, result, note, pics }); console.log(`${result} [${w.size}/${w.who}] ${step} — ${note} ${pics.join(' ')}`) }
/* a press: a finger on the phone (with a picture within ~100ms when asked), a mouse on the desktop */
async function press(w, sel, o = {}) {
  const l = w.page.locator(sel).first()
  if (!(await l.count())) return false
  await l.scrollIntoViewIfNeeded().catch(() => {})
  await w.page.waitForTimeout(100)
  if (w.phone) await l.tap(); else await l.click()
  if (w.phone && o.quick) { await w.page.waitForTimeout(60); const n = await snap(w, o.quick + '-justtapped', true); (w.quickPics ||= []).push(n) }
  await w.page.waitForTimeout(400)
  return true
}
async function cell(w, p, d, fy = 0.5) {
  const l = w.page.locator(T(`cell-${p}-${d}`)).first()
  await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await w.page.waitForTimeout(300)
  const b = await l.boundingBox()
  if (w.phone) await w.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height * fy)
  else await w.page.mouse.click(b.x + b.width / 2, b.y + b.height * fy)
  await w.page.waitForTimeout(600)
}
const setCell = (w, p, d, code) => w.page.evaluate(([p, d, c]) => window.lwSetCell(p, d, c), [p, d, code])
const vis = (w, sel) => w.page.locator(sel).first().isVisible().catch(() => false)
async function autoApprove(w, on) {
  const s = w.page.locator(T('bid-approve-tick')).first()
  if (!(await s.count())) return
  const now = (await s.getAttribute('aria-checked')) === 'true' || (await s.getAttribute('aria-pressed')) === 'true'
  if (now !== on) await press(w, T('bid-approve-tick'))
}
async function closeAll(w) {
  for (const id of ['bid-cancel', 'sel-cancel', 'daylist-close', 'closed-note-close', 'open-dates-close']) if (await vis(w, T(id))) await press(w, T(id))
  await w.page.keyboard.press('Escape').catch(() => {}); await w.page.waitForTimeout(300)
}
async function drag(w, [p1, a], [p2, z]) {
  const P = w.page
  await P.locator(T(`cell-${p1}-${a}`)).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await P.waitForTimeout(300)
  const bA = await P.locator(T(`cell-${p1}-${a}`)).first().boundingBox(), bZ = await P.locator(T(`cell-${p2}-${z}`)).first().boundingBox()
  const A = { x: bA.x + bA.width / 2, y: bA.y + bA.height / 2 }, Z = { x: bZ.x + bZ.width / 2, y: bZ.y + bZ.height / 2 }
  if (w.phone) {
    const cdp = await w.ctx.newCDPSession(P)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [A] }); await P.waitForTimeout(400)
    for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: A.x + (Z.x - A.x) * i / 8, y: A.y + (Z.y - A.y) * i / 8 }] }); await P.waitForTimeout(25) }
    await P.waitForTimeout(120)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach()
  } else { await P.mouse.move(A.x, A.y); await P.mouse.down(); await P.mouse.move(A.x + 8, A.y); await P.mouse.move(Z.x, Z.y, { steps: 10 }); await P.mouse.up() }
  await P.waitForTimeout(700)
}
async function openNovDec(w) {
  await press(w, T('open-chip'))
  for (const m of ['2026-11', '2026-12']) { const b = w.page.locator(T(`od-month-${m}`)).first(); if (await b.count()) { await b.click(); await w.page.waitForTimeout(250) } }
  if (await vis(w, T('od-apply'))) await press(w, T('od-apply'))
  await closeAll(w)
}
const ids = (w, root) => w.page.evaluate(r => [...document.querySelectorAll(r + ' [data-testid]')].map(e => e.dataset.testid), root)
/* does anything on screen look unstyled? browser-default buttons: no padding and a default grey face, Times font */
async function unstyled(w, root) {
  return w.page.evaluate(r => {
    const out = []
    for (const e of document.querySelectorAll(`${r} button, ${r} input, ${r} textarea`)) {
      const b = e.getBoundingClientRect(); if (!b.width || !b.height) continue
      const cs = getComputedStyle(e)
      if (/Times/i.test(cs.fontFamily)) out.push(`${e.tagName}[${e.dataset.testid || e.className}] font ${cs.fontFamily.slice(0, 30)}`)
      else if (e.tagName === 'BUTTON' && cs.backgroundColor === 'rgb(239, 239, 239)') out.push(`BUTTON[${e.dataset.testid || e.className}] default grey face`)
    }
    return out
  }, root)
}
async function inView(w, root) {
  return w.page.evaluate(r => { const e = document.querySelector(r); if (!e) return 'absent'; const b = e.getBoundingClientRect(); const W = innerWidth, H = innerHeight
    return `${Math.round(b.left)},${Math.round(b.top)} ${Math.round(b.width)}x${Math.round(b.height)} in ${W}x${H}` + (b.left < -1 || b.right > W + 1 || b.top < -1 || b.bottom > H + 1 ? ' [PARTLY OFF SCREEN]' : '') }, root)
}
/* one step: run fn (returns a note), always picture it, never throw */
async function step(w, name, label, fn, root = T('bid-picker')) {
  let note = '', result = 'PASS'
  w.quickPics = []
  try { note = (await fn()) || '' } catch (e) { result = 'NOT WALKED'; note = String(e.message || e).split('\n')[0].slice(0, 160) }
  const pics = [...w.quickPics]
  pics.push(await snap(w, label))
  const open = await vis(w, root)
  if (result === 'PASS' && root && !String(note).startsWith('~')) {
    const un = open ? await unstyled(w, root) : []
    if (un.length) { result = 'CHECK'; note += ` UNSTYLED: ${un.slice(0, 4).join('; ')}` }
    const pos = open ? await inView(w, root) : ''
    if (pos.includes('OFF SCREEN') && !w.phone) { note += ` ${pos}`; result = 'CHECK' }
    else note += open ? ` [${pos}]` : ''
  }
  rec(w, name, result, String(note).replace(/^~/, ''), pics)
}

const D = { a: '2026-11-16', whole: '2026-11-17', half: '2026-11-18', two: '2026-11-19', range0: '2026-11-23', range1: '2026-11-26', pend: '2026-11-20', grant: '2026-11-24', oil2: '2026-11-27' }

async function adminWalk(size) {
  const w = await world(size, 'admin')
  const Q = n => ({ quick: n })
  /* 1 — a free day */
  await step(w, '1 open bid window on a free day', 'bidwin-open', async () => { await cell(w, 'stiff', D.a); return 'ids: ' + (await ids(w, T('bid-picker'))).length + ' controls' })
  await step(w, '1 AM', 'portion-am', async () => { if (!await press(w, T('portion-am'), Q('am'))) throw new Error('no AM button') })
  await step(w, '1 PM', 'portion-pm', async () => { if (!await press(w, T('portion-pm'), Q('pm'))) throw new Error('no PM button') })
  await step(w, '1 Whole day', 'portion-full', async () => { if (!await press(w, T('portion-full'), Q('full'))) throw new Error('no whole day button') })
  await step(w, '1 remark typed', 'remark', async () => {
    const r = w.page.locator(T('bid-remarks')).first(); await r.click(); await w.page.keyboard.type('Walk remark text'); return 'value=' + await r.inputValue() })
  await step(w, '1 auto-approve switch off', 'autoapprove-off', async () => { await autoApprove(w, false); const s = w.page.locator(T('bid-approve-tick')).first(); return 'aria ' + (await s.getAttribute('aria-checked') ?? await s.getAttribute('aria-pressed')) })
  await step(w, '1 auto-approve switch on', 'autoapprove-on', async () => { await autoApprove(w, true); const s = w.page.locator(T('bid-approve-tick')).first(); return 'aria ' + (await s.getAttribute('aria-checked') ?? await s.getAttribute('aria-pressed')) })
  await step(w, '1 more menu open', 'more-menu', async () => { if (!await press(w, T('bid-more'), Q('more'))) throw new Error('no more button'); return 'menu ids: ' + (await ids(w, T('bid-more-menu'))).join(',') })
  if (!w.phone) { await w.page.locator(T('bid-more')).first().hover(); }
  await step(w, '1 more menu closed again', 'more-closed', async () => { await press(w, T('bid-more')); return 'menu shown: ' + await vis(w, T('bid-more-menu')) })
  await step(w, '1 pick a range', 'pick-range', async () => { if (!await press(w, T('span-range'), Q('range'))) throw new Error('no Pick a range'); return 'calendar ids: ' + (await ids(w, T('bid-picker'))).filter(i => /cal|day|month|range/i.test(i)).slice(0, 8).join(',') })
  await step(w, '1 range reached the 4 Dec?', 'pick-range-2', async () => {
    const cands = w.page.locator('.rp-day, [data-testid^="rp-"], [data-testid^="rng-"]'); return '~ range-calendar cells: ' + await cands.count() })
  await step(w, '1 close with X', 'closed-x', async () => { await press(w, T('bid-cancel')); return '~picker shown: ' + await vis(w, T('bid-picker')) }, null)
  /* grant OIL on a day */
  await step(w, '1 Grant OIL', 'grant-oil', async () => { await cell(w, 'razer', D.grant); if (!await press(w, T('bid-oil'), Q('oil'))) throw new Error('no Grant OIL'); return 'ids: ' + (await ids(w, T('bid-picker'))).filter(i => !/^bid-(LL|OL|OIL|CCL|FCL|PL|EL|CL)/.test(i)).join(',') })
  const oilIds = await ids(w, T('bid-picker'))
  const amt = oilIds.find(i => /oil.*(half|1|2|amt|amount)/i.test(i) && i !== 'bid-oil')
  if (amt) await step(w, '1 OIL amount', 'oil-amount', async () => { await press(w, T(amt), Q('amt')); return 'pressed ' + amt })
  await step(w, '1 OIL other box', 'oil-other', async () => {
    const o = w.page.locator('[data-testid="bid-picker"] input[type="number"], [data-testid="bid-picker"] input[data-testid*="oil"], [data-testid="bid-picker"] input[data-testid*="other"]').first()
    if (!(await o.count())) throw new Error('no other box found (ids ' + oilIds.filter(i => /oil/i.test(i)).join(',') + ')')
    await o.click(); await w.page.keyboard.type('1.5'); return 'typed 1.5' })
  await step(w, '1 CSE', 'cse', async () => { await closeAll(w); await cell(w, 'razer', D.oil2); if (!await press(w, T('bid-file-CSE'), Q('cse'))) throw new Error('no CSE'); return 'pressed CSE; picker ' + await vis(w, T('bid-picker')) }, null)
  await step(w, '1 OD', 'od', async () => { await closeAll(w); await cell(w, 'razer', '2026-11-30'); if (!await press(w, T('bid-file-OD'), Q('od'))) throw new Error('no OD'); return 'pressed OD; picker ' + await vis(w, T('bid-picker')) }, null)
  await closeAll(w)
  /* a leave button + commit */
  await step(w, '1 LL leave button (auto-approve off -> pending)', 'll-pending', async () => { await cell(w, 'slipway', D.pend); await autoApprove(w, false); if (!await press(w, T('bid-LL'), Q('ll'))) throw new Error('no LL'); return '~LL pressed; picker ' + await vis(w, T('bid-picker')) }, null)
  await closeAll(w)
  /* 2 — a day holding a leave */
  await step(w, '2 pending leave window', 'held-pending', async () => { await cell(w, 'slipway', D.pend); return 'acts: ' + (await ids(w, T('bid-picker'))).filter(i => /decide|clear|doc/.test(i)).join(',') })
  await step(w, '2 Refuse (window closes on a decision)', 'refuse', async () => { if (!await press(w, T('decide-refuse'), Q('refuse'))) throw new Error('no refuse'); return '~picker open after: ' + await vis(w, T('bid-picker')) }, null)
  await step(w, '2 reopen the refused bid: Refused is lit', 'refused-reopened', async () => { await closeAll(w); await cell(w, 'slipway', D.pend); return 'acts: ' + (await ids(w, T('bid-picker'))).filter(i => /decide|clear/.test(i)).join(',') })
  await step(w, '2 Refuse pressed again (undo)', 'refuse-undo', async () => { if (!await press(w, T('decide-refuse'), Q('refuseundo'))) throw new Error('no refuse'); return '~picker open after: ' + await vis(w, T('bid-picker')) }, null)
  await step(w, '2 reopen: back to pending', 'pending-reopened', async () => { await closeAll(w); await cell(w, 'slipway', D.pend); return 'acts: ' + (await ids(w, T('bid-picker'))).filter(i => /decide|clear/.test(i)).join(',') })
  await step(w, '2 Move', 'move', async () => { if (!await press(w, T('decide-shift'), Q('move'))) throw new Error('no Move'); return '~picker open after: ' + await vis(w, T('bid-picker')) }, null)
  await step(w, '2 Move cancelled (Escape)', 'move-cancel', async () => { await w.page.keyboard.press('Escape'); await w.page.waitForTimeout(400); await closeAll(w); return '~' }, null)
  await step(w, '2 Approve', 'approve', async () => { await cell(w, 'slipway', D.pend); if (!await press(w, T('decide-approve'), Q('approve'))) throw new Error('no approve'); return '~picker open after: ' + await vis(w, T('bid-picker')) }, null)
  await step(w, '2 approved leave window', 'approved-window', async () => { await closeAll(w); await cell(w, 'slipway', D.pend); return 'acts: ' + (await ids(w, T('bid-picker'))).filter(i => /decide|clear|doc/.test(i)).join(',') })
  await step(w, '2 Document button (the upload row)', 'doc-row', async () => { const d = w.page.locator(T('bid-doc-row')).first(); if (!(await d.count())) throw new Error('no document row'); return 'doc row shown: ' + await vis(w, T('bid-doc-row')) })
  await step(w, '2 Delete over a plain leave (no award on the day: deletes at once, as built)', 'delete-plain', async () => { if (!await press(w, T('bid-clear'), Q('delete'))) throw new Error('no Delete'); return '~picker open after: ' + await vis(w, T('bid-picker')) }, null)
  await step(w, '2 Delete armed over a day holding an OIL award', 'delete-armed', async () => { await closeAll(w); await setCell(w, 'razer', D.grant, 'FO'); await cell(w, 'razer', D.grant); if (!await press(w, T('bid-clear'), Q('delete'))) throw new Error('no Delete over an award'); const t = await w.page.locator(T('bid-clear')).first().innerText({ timeout: 2000 }).catch(() => '(gone)'); return 'label: ' + t.split(String.fromCharCode(10)).join(' / ') })
  await closeAll(w)
  /* 3 — a day with two entries */
  await step(w, '3 day list (two entries)', 'daylist', async () => {
    for (const [h, c] of [['am', 'LL'], ['pm', 'OL']]) { await cell(w, 'stiff', D.two); await autoApprove(w, false); await press(w, T(`portion-${h}`)); await press(w, T(`bid-${c}`)); await closeAll(w) }
    await cell(w, 'stiff', D.two); return 'daylist ' + await vis(w, '.daylist, ' + T('daylist-sheet')) + ' ids: ' + (await ids(w, '.daylist, ' + T('daylist-sheet'))).join(',') }, '.daylist, ' + T('daylist-sheet'))
  await step(w, '3 day list Refuse', 'daylist-refuse', async () => { if (!await press(w, '[data-testid^="dl-refuse-"]', Q('dlrefuse'))) throw new Error('no dl-refuse') }, '.daylist, ' + T('daylist-sheet'))
  await step(w, '3 day list Delete armed', 'daylist-delete', async () => { const del = w.page.locator('.daylist .dchip.del').first(); if (!(await del.count())) throw new Error('no delete chip'); await del.scrollIntoViewIfNeeded(); if (w.phone) await del.tap(); else await del.click(); await w.page.waitForTimeout(400); return 'text ' + (await del.innerText().catch(() => '?')) }, '.daylist, ' + T('daylist-sheet'))
  await closeAll(w)
  /* 4 — a drag */
  await step(w, '4 drag window', 'drag-window', async () => { await drag(w, ['glass', D.range0], ['glass', D.range1]); return 'ids: ' + (await ids(w, '.bidsheet')).filter(i => !/^bid-(LL|OL|OIL|CCL|FCL|PL|EL|CL)/.test(i)).join(',') }, '.bidsheet')
  await step(w, '4 drag window: LL', 'drag-ll', async () => { if (!await press(w, T('sel-LL'), Q('dragll'))) throw new Error('no sel-LL; ids ' + (await ids(w, '.bidsheet')).slice(0, 12).join(',')); return '~' }, '.bidsheet')
  await closeAll(w)
  /* 5 — settings */
  await step(w, '5 Settings open', 'settings', async () => { if (!await press(w, T('settings-open'), Q('settings'))) throw new Error('no settings'); return 'ids: ' + (await ids(w, '.settings-sheet, [role="dialog"], .floatwin')).slice(0, 14).join(',') }, '.settings-sheet, [role="dialog"], .floatwin, .bidsheet')
  const settingsIds = await ids(w, 'body')
  await step(w, '5 Rearrange the grid', 'rearrange', async () => {
    const t = w.page.getByText(/Rearrange the grid/i).first(); if (!(await t.count())) throw new Error('no "Rearrange the grid"'); await t.scrollIntoViewIfNeeded(); if (w.phone) await t.tap(); else await t.click(); await w.page.waitForTimeout(500); return '~' }, null)
  await step(w, '5 counter row -> counter window', 'counter-window', async () => {
    const r = w.page.getByText('IWSO', { exact: true }).first(); if (!(await r.count())) throw new Error('no counter row; settings ids sample: ' + settingsIds.filter(i => /fly|counter|rearr/.test(i)).slice(0, 8).join(','))
    await r.scrollIntoViewIfNeeded(); if (w.phone) await r.tap(); else await r.click(); await w.page.waitForTimeout(500); return '~ ids: ' + (await ids(w, 'body')).filter(i => /cform|counter/.test(i)).join(',') }, '.floatwin, [role="dialog"], .bidsheet')
  await step(w, '5 counter window: is/is-not and count', 'counter-form', async () => {
    const f = w.page.locator('[data-testid^="counter-"]'); const n = await f.count(); if (!n) throw new Error('no counter form'); return '~ counter controls ' + (await ids(w, 'body')).filter(i => /^counter-/.test(i)).join(',') }, '.floatwin, [role="dialog"], .bidsheet')
  await closeAll(w)
  await step(w, '5 Events list', 'events', async () => {
    await w.page.evaluate(() => { window.lwSetDayEvent('2026-11-10', 0, 'Ex Kite', 'work'); window.lwSetDayEvent('2026-12-25', 0, 'PH', 'off') })
    if (!await press(w, T('settings-open'))) throw new Error('no settings'); if (!await press(w, T('settings-events'), Q('events'))) throw new Error('no Events…'); return '~ids: ' + (await ids(w, 'body')).filter(i => /^ev/.test(i)).join(',') }, '.floatwin, [role="dialog"], .bidsheet, .settings-sheet')
  await step(w, '5 Events delete armed', 'events-armed', async () => { if (!await press(w, '[data-testid^="evdel-"]', Q('evdel'))) throw new Error('no evdel'); return '~' }, '.floatwin, [role="dialog"], .bidsheet, .settings-sheet')
  await closeAll(w)
  await step(w, '5 Calendar…', 'calendar', async () => { if (!await press(w, T('settings-open'))) throw new Error('no settings'); const c = w.page.getByText(/^Calendar/i).first(); if (!(await c.count())) throw new Error('no Calendar…'); await c.scrollIntoViewIfNeeded(); if (w.phone) await c.tap(); else await c.click(); await w.page.waitForTimeout(500); return '~' }, '.floatwin, [role="dialog"], .bidsheet, .settings-sheet')
  await closeAll(w)
  /* 6 — Open for bidding */
  await step(w, '6 Open for bidding window', 'open-dates', async () => { if (!await press(w, T('open-chip'), Q('open'))) throw new Error('no chip'); return 'ids: ' + (await ids(w, 'body')).filter(i => /^od-/.test(i)).slice(0, 14).join(',') }, '[data-testid="open-dates"], .floatwin, [role="dialog"], .bidsheet')
  await step(w, '6 a month button (Dec)', 'open-dates-dec', async () => { const b = w.page.locator(T('od-month-2026-12')).first(); if (!(await b.count())) throw new Error('no Dec'); if (w.phone) await b.tap(); else await b.click(); await w.page.waitForTimeout(400); return '~' }, '[data-testid="open-dates"], .floatwin, [role="dialog"], .bidsheet')
  await step(w, '6 a stretch calendar icon', 'open-dates-stretch', async () => { const s = w.page.locator('[data-testid^="od-stretch"], [data-testid^="od-cal"], [data-testid^="od-edit"]').first(); if (!(await s.count())) throw new Error('no stretch icon; od ids ' + (await ids(w, 'body')).filter(i => /^od-/.test(i)).join(',')); if (w.phone) await s.tap(); else await s.click(); await w.page.waitForTimeout(400); return '~' }, '[data-testid="open-dates"], .floatwin, [role="dialog"], .bidsheet')
  await closeAll(w)
  /* 7 — balances, approvals */
  await step(w, '7 Balances tab', 'balances', async () => { if (!await press(w, T('lw-tab-balances'), Q('bal'))) throw new Error('no tab'); return '~' }, null)
  await step(w, '7 Grades window', 'grades', async () => { if (!await press(w, T('bal-grades'), Q('grades'))) throw new Error('no Grades'); return '~' }, '.floatwin, [role="dialog"], .bidsheet')
  await closeAll(w)
  await step(w, '7 a name -> person window', 'person-window', async () => { await setCell(w, 'stiff', D.whole, 'LL'); if (!await press(w, T('bal-name-stiff'), Q('person'))) throw new Error('no name'); return '~' }, '[data-testid="person-window"], .floatwin, [role="dialog"], .bidsheet')
  await closeAll(w)
  const appr = await ids(w, 'body')
  await step(w, '7 Approvals tab', 'approvals', async () => {
    const t = w.page.locator('[data-testid^="lw-tab-"]'); const names = await t.evaluateAll(l => l.map(e => e.dataset.testid)); const a = names.find(n => /appr/i.test(n)); if (!a) throw new Error('no approvals tab among ' + names.join(','))
    await press(w, T(a), Q('appr')); return '~ tab ' + a }, null)
  await step(w, '7 Approvals: a line Approve/Refuse', 'approvals-line', async () => {
    const b = w.page.locator('[data-testid*="approve"], [data-testid*="appr-ok"]').first(); const r = w.page.locator('[data-testid*="refuse"]').first()
    if (!(await r.count())) throw new Error('no refuse on a line; ids ' + (await ids(w, 'body')).filter(i => /appr|refuse|approve/.test(i)).slice(0, 8).join(','))
    await press(w, '[data-testid*="refuse"]', Q('aprefuse')); return '~refuse pressed' }, null)
  await step(w, '7 Approve all armed', 'approve-all', async () => { const t = w.page.getByRole('button', { name: /Approve all/i }).first(); if (!(await t.count())) throw new Error('no Approve all'); await t.scrollIntoViewIfNeeded(); if (w.phone) await t.tap(); else await t.click(); await w.page.waitForTimeout(400); return '~ label ' + (await t.innerText().catch(() => '?')) }, null)
  await press(w, T('lw-tab-grid')).catch(() => {})
  /* 8 — keyboard and hover (desktop) */
  if (!w.phone) {
    await w.page.evaluate(() => window.scrollTo(0, 0))
    await step(w, '8 hover bid buttons', 'hover', async () => {
      await closeAll(w); await cell(w, 'stiff', '2026-11-30'); const out = []
      for (const id of ['portion-am', 'bid-LL', 'bid-OL', 'bid-oil', 'bid-more']) { const l = w.page.locator(T(id)).first(); if (await l.count()) { await l.hover(); await w.page.waitForTimeout(300); const bb = await w.page.locator(T('bid-picker')).boundingBox(); w.n++; const nm = `d-${String(w.n).padStart(2, '0')}-hover-${id}.png`; await w.page.screenshot({ path: path.join(OUT, nm), clip: { x: Math.max(0, bb.x), y: Math.max(0, bb.y), width: Math.min(bb.width, 1536 - bb.x), height: Math.min(bb.height, 864 - bb.y) } }); out.push(nm) } }
      w.quickPics.push(...out); return 'hover pictures taken: ' + out.length })
    await step(w, '8 Tab through the bid window', 'tab-1', async () => {
      await w.page.mouse.move(5, 5); await w.page.locator(T('bid-remarks')).first().focus(); await w.page.keyboard.press('Shift+Tab').catch(() => {}); const rep = []
      for (let i = 0; i < 6; i++) {
        await w.page.keyboard.press('Tab'); await w.page.waitForTimeout(150)
        const r = await w.page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return { id: e.dataset?.testid || e.tagName, outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, shadow: cs.boxShadow.slice(0, 70) } })
        rep.push(`${r.id}: outline ${r.outline}; shadow ${r.shadow}`)
        const bb = await w.page.locator(T('bid-picker')).boundingBox(); w.n++; const nm = `d-${String(w.n).padStart(2, '0')}-tab-${i + 1}-${String(r.id).replace(/\W/g, '')}.png`; await w.page.screenshot({ path: path.join(OUT, nm), clip: { x: Math.max(0, bb.x), y: Math.max(0, bb.y), width: Math.min(bb.width, 1536 - bb.x), height: Math.min(bb.height, 864 - bb.y) } }); w.quickPics.push(nm)
      }
      return rep.join(' | ') })
    await closeAll(w)
  }
  w.errs.forEach(e => errorsAll.push(`${size}/admin ${e}`))
  await w.ctx.close()
}

async function memberWalk(size) {
  const w = await world(size, 'admin')
  await openNovDec(w)   // bidding opened by the admin, then the same page signs out and in as the member (no reload: the store is in memory)
  await w.page.evaluate(() => document.querySelector('#logout')?.click()); await w.page.waitForSelector('#luser')
  await w.page.fill('#luser', 'us'); await w.page.fill('#lpass', 'us'); await w.page.click('#loginForm button[type=submit]')
  await w.page.waitForSelector('#vWeek .day', { state: 'attached' })
  await w.page.evaluate(() => window.go('leavewar')); await w.page.waitForSelector(T('row-bane'), { state: 'attached' }); await w.page.waitForTimeout(700)
  w.who = 'member'
  await step(w, 'M open bid window (member, own row)', 'member-bid', async () => { await cell(w, 'bane', D.a); return 'ids: ' + (await ids(w, T('bid-picker'))).length })
  await step(w, 'M AM', 'member-am', async () => { if (!await press(w, T('portion-am'), { quick: 'mam' })) throw new Error('no AM') })
  await step(w, 'M remark', 'member-remark', async () => { const r = w.page.locator(T('bid-remarks')).first(); await r.click(); await w.page.keyboard.type('Member remark'); return 'value=' + await r.inputValue() })
  await step(w, 'M more menu', 'member-more', async () => { if (!await press(w, T('bid-more'), { quick: 'mmore' })) throw new Error('no more'); return '~' })
  await closeAll(w)
  await step(w, 'M closed day window', 'member-closed', async () => { await setCell(w, 'bane', '2026-10-20', 'LL'); await cell(w, 'bane', '2026-10-20'); return '~' }, '.bidsheet, [role="dialog"], .floatwin')
  await closeAll(w)
  await step(w, 'M own approved leave', 'member-approved', async () => { await setCell(w, 'bane', D.whole, 'LL'); await cell(w, 'bane', D.whole); return '~ids: ' + (await ids(w, T('bid-picker'))).filter(i => /decide|clear|doc/.test(i)).join(',') })
  await closeAll(w)
  await step(w, 'M Open for bidding window', 'member-open', async () => { if (!await press(w, T('open-chip'), { quick: 'mopen' })) throw new Error('no chip for member'); return '~' }, '[data-testid="open-dates"], .floatwin, [role="dialog"], .bidsheet')
  w.errs.forEach(e => errorsAll.push(`${size}/member ${e}`))
  await w.ctx.close()
}

for (const size of ['desk', 'phone']) {
  if (only && only !== size) continue
  await adminWalk(size).catch(e => console.log('ADMIN WALK STOPPED', size, e.message))
  await memberWalk(size).catch(e => console.log('MEMBER WALK STOPPED', size, e.message))
}
await browser.close()
writeFileSync(path.join(OUT, 'walk-log.json'), JSON.stringify({ log: LOG, errors: errorsAll }, null, 1))
console.log('ERRORS:', errorsAll.length ? '\n' + errorsAll.join('\n') : 'none')
console.log('pictures:', readdirSync(OUT).filter(f => f.endsWith('.png')).length)
