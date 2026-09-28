/* [HIST-PHONE-HIDE] + [CHG-BY-ITEM] — the walk (28 Sep 26). One world per run (a fresh browser, the production build), at
   HP_W × HP_H. Every step is an ASSERTION of the right behaviour (PASS means correct), so re-running it IS the re-walk
   (bug-check order §5). Pictures and results.md go to HP_SHOTS/walk-<phone|desktop>.

   The story (the everything-day for this feature): Saber (admin) publishes Monday through the board's own controls; Hex (a
   member account given the admin role in place — the role only, §7.7) changes Tuesday — two men on the first line, a man
   moved within that line (seat to seat), a man moved between two duty desks, a programme start time, a jet's remarks, an
   area time — and a remark on published Monday, which Saber then issues as AL1; Ranger (a member) files his own leave on
   Tuesday; then Saber and Ranger look. The steps follow the plan's roll-call and Astra's twelve action orders. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'

const BASE = process.env.HP_URL || 'http://localhost:4212'
const W = +(process.env.HP_W || 1440), H = +(process.env.HP_H || 900)
const PHONE = W < 700
const TAG = PHONE ? 'phone' : 'desktop'
const OUT = (process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor-hist/raptor-port/docs/img/handpass/2026-09-28-hist-phone-by-item') + '/walk-' + TAG
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
const CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ctx = await browser.newContext({ viewport: { width: W, height: H }, ...(PHONE ? { hasTouch: true, isMobile: true } : {}) })
const page = await ctx.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
const rows = []
let n = 0
const shot = async (name) => { const f = `${String(++n).padStart(2, '0')}-${name}.png`; await page.screenshot({ path: `${OUT}/${f}` }); return f }
async function step(id, what, fn, only) {
  if (only === 'phone' && !PHONE) return
  if (only === 'desktop' && PHONE) return
  let ok = false, note = '', pic = ''
  try { const r = await fn(); ok = r === true || (r && r.ok); note = r && r.note ? r.note : ''; pic = r && r.pic ? r.pic : '' }
  catch (e) { note = 'THREW ' + String(e && e.message || e).slice(0, 220) }
  rows.push({ id, what, ok, note, pic })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${what}${note ? ' — ' + note : ''}`)
}
const signIn = async (u, p) => {
  await page.waitForSelector('#luser'); await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
}
const signOut = async () => {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Logout|Sign out/.test(x.textContent || '')); b && b.click() })
  await page.waitForSelector('#luser')
}
const go = async (p) => { await page.evaluate(x => window.go(x), p); await page.waitForFunction(x => window.CURPAGE === x, p); await page.waitForTimeout(500) }
const count = (sel) => page.locator(sel).count()
const openBoard = async (di) => { await page.evaluate(d => window.openScheduler(d), di); await page.waitForSelector('#schedBoard'); await page.waitForTimeout(500) }
const closeBoard = async () => { await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.waitForTimeout(400) }
/* sign the four and press the day's publish control on the board — the Original, or the next AL */
async function publishOnBoard(di) {
  await openBoard(di)
  const sels = page.locator('#schedBoard [data-sign]:visible')
  const k = await sels.count()
  for (let i = 0; i < k; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await page.waitForTimeout(150)
  }
  const beak = page.locator(`#schedBoard [data-beak="${di}"]:visible`).first()
  if (await beak.count() && !(await beak.isDisabled())) { await beak.click(); await page.waitForTimeout(900) }
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.click(); await page.waitForTimeout(900) }
  await closeBoard()
}
/* the gold dot, as PAINTED: a seat's ::before (outside its corner), any other detail's background image (inside it) */
/* …a seat, or a text detail with text: its ::before, gold, outside its corner; a typed box, a row or an empty detail: a
   background dot inside it */
const dotOf = (sel) => page.$eval(sel, e => {
  const b = getComputedStyle(e, '::before'), s = getComputedStyle(e)
  const out = b.backgroundColor === 'rgb(229, 194, 74)' && b.position === 'absolute' && parseFloat(b.right) < 0
  return { on: e.hasAttribute('data-histdot'), how: out ? 'outside' : /radial-gradient/.test(s.backgroundImage) ? 'inside' : 'none', painted: out || /radial-gradient/.test(s.backgroundImage) }
}).catch(() => null)
const hitsItself = (sel) => page.$eval(sel, e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (e === h || e.contains(h)) }).catch(() => false)
const openWin = async () => { if (!(await count('.chgwin:not([hidden])'))) { await page.click('#histBtn'); await page.waitForTimeout(400) } }
const showPanel = async () => { if (await count('.chgwin.bar')) { await page.click('.chgwin.bar .cw-barbtn'); await page.waitForTimeout(300) } }

await page.goto(BASE + '/')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })

/* ---- the world, through the app ---- */
await signIn('ad', 'a')
await go('editsched')
await publishOnBoard(0)
const monPub = await page.evaluate(() => window.dayApproved(0))
await signOut()

await signIn('hex', 'x')
await page.evaluate(() => window.raptorRole('admin'))
await go('editsched')
const hexIds = await page.evaluate(() => {
  const w = window
  w.fillSlot('1.0.0.0.p', 'casper'); w.fillSlot('1.0.0.0.w', 'bane')
  /* a man moved WITHIN the first line: #1 RCP → #2 RCP, onto an EMPTY seat (one entry, Fable F2 — onto an occupied seat
     it is a replacement, two lines, as the history has always said it) */
  const r2 = w.slotVal('1.0.0.1.w')
  w.fillSlot('1.0.0.1.w', '')
  w.afterSchedMutate()
  w.fillSlot('1.0.0.0.w', ''); w.fillSlot('1.0.0.1.w', 'bane')
  /* a man moved between two of Tuesday's duty desks */
  const dr = w.DAYS[1].dutywaves[0].rows
  const to = dr.findIndex(r => r && r.id), from = dr.findIndex((r, i) => i !== to && r && r.id)
  let moved = null
  if (from >= 0 && to >= 0) { w.fillSlot(`d:1.0.${to}`, ''); moved = dr[from].id; w.fillSlot(`d:1.0.${from}`, ''); w.fillSlot(`d:1.0.${to}`, moved) }
  w.txtSet('ap:1.0.str', '05:50')
  w.txtSet('fr:1.0.1.0', 'WALK RMK')
  /* a day note — a typed detail drawn as a block, whose dot sits inside its corner (Fable's final read F6) */
  w.txtSet('dn:1.0', 'ORDERS: WALK NOTE')
  /* published Monday: a jet's remarks — issued below as AL1 */
  w.txtSet('fr:0.0.0.0', 'AL CHECK')
  w.afterSchedMutate()
  return { moved, from, to, r2 }
})
await page.waitForTimeout(300)
/* the first line's area time, typed into its own cell (the week commits it as the cell is left — textedit.ts) */
await page.evaluate(() => { const c = document.querySelector('#eWeek [data-atime="1.0.0"]'); if (c) { c.textContent = '1300-1400'; c.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) } })
await page.waitForTimeout(400)
/* the board's wave title, through its own box */
await openBoard(1)
const wsel = page.locator('#schedBoard [data-wsel]').first()
const wtitle = await wsel.evaluate(s => { const o = [...s.options].map(x => x.value).find(v => v !== s.value); return o || '' })
if (wtitle) { await wsel.selectOption(wtitle); await page.waitForTimeout(400) }
await closeBoard()
await signOut()

await signIn('us', 'us')
await page.evaluate(() => window.fileInput({ person: 'bane', date: 'Jul 14', yr: 2026, allday: true, type: 'LL' }))
await page.waitForTimeout(300)
await signOut()

await signIn('ad', 'a')
await go('editsched')
await publishOnBoard(0)          // the Monday remark goes out as AL1
await go('editsched')

/* ---- Saber looks ---- */
await step('H0', 'the world: Monday published, Hex\'s changes and Ranger\'s leave in the history', async () => {
  const s = await page.evaluate(() => ({ mon: window.dayApproved(0), lines: window.ELOG.rows.length }))
  return { ok: monPub === true && s.mon && s.lines >= 10, note: JSON.stringify({ monPub, ...s, hexIds, wtitle }) }
})
await step('H1', 'History off: no gold dots anywhere', async () => ({ ok: await count('[data-histdot]') === 0, pic: await shot('history-off') }))
await step('H2', 'the admin\'s clock opens the window: Group by Item, on, first; New to you; every group an item', async () => {
  await openWin()
  const s = await page.$eval('.chgwin', e => ({ on: e.querySelector('.cw-g-btn.on')?.textContent, btns: [...e.querySelectorAll('.cw-g-btn')].map(b => b.textContent), tab: e.querySelector('.win-tab.on')?.textContent,
    items: [...e.querySelectorAll('.cw-g')].map(g => g.querySelector('.cw-gh .cw-ghname, .cw-what')?.textContent || '') }))
  return { ok: s.on === 'Item' && s.btns.join(',') === 'Item,Who' && /New to you/.test(s.tab || '') && s.items.length > 0 && s.items.every(t => /·/.test(t) || /The day/.test(t)), note: JSON.stringify(s), pic: await shot('window-item') }
})
await step('H3', 'the hint in his words on the phone; no hint and no Hide on a desktop', async () => {
  const hint = await page.$eval('.chgwin .cw-hint', e => e.textContent).catch(() => null)
  const hide = await count('.chgwin .win-hide')
  return PHONE ? { ok: hint === 'History on: Tap a gold dot on the schedule' && hide === 1, note: JSON.stringify({ hint, hide }) } : { ok: hint === null && hide === 0, note: JSON.stringify({ hint, hide }) }
})
if (PHONE) { await page.click('.chgwin .win-hide'); await page.waitForTimeout(300) }
await step('H4', 'the edit week: every changed detail is dotted, painted where the design puts it — seats outside the corner, typed details inside', async () => {
  /* Tuesday into view the way a swipe brings it (the phone week pages a day at a time), then the seat to the middle */
  await page.evaluate(() => { const day = document.querySelector('#eWeek .day[data-day="1"]'); day && day.scrollIntoView({ inline: 'start', block: 'nearest' }) })
  await page.waitForTimeout(500)
  await page.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="1"] [data-slot="1.0.0.0.p"]'); d && d.scrollIntoView({ block: 'center', inline: 'nearest' }) })
  await page.waitForTimeout(400)
  const r = {
    seat: await dotOf('#eWeek [data-slot="1.0.0.0.p"]'), seat2: await dotOf('#eWeek [data-slot="1.0.0.1.w"]'),
    time: await dotOf('#eWeek [data-txt="ap:1.0.str"]'), rmk: await dotOf('#eWeek [data-txt="fr:1.0.1.0"]'), atime: await dotOf('#eWeek [data-atime="1.0.0"]'),
    note: await dotOf('#eWeek [data-txt="dn:1.0"]'),
    leave: await page.$eval('#eWeek .day[data-day="1"] [data-inprow]', e => ({ on: e.hasAttribute('data-histdot'), painted: /radial-gradient/.test(getComputedStyle(e).backgroundImage) })).catch(() => null),
    untouched: await page.$eval('#eWeek [data-slot="1.1.0.0.p"]', e => e.hasAttribute('data-histdot')).catch(() => 'n/a'),
  }
  const good = x => x && x.on && x.painted
  return { ok: good(r.seat) && good(r.seat2) && good(r.time) && good(r.rmk) && good(r.atime) && good(r.note) && r.note.how === 'inside' && good(r.leave) && r.untouched === false, note: JSON.stringify(r), pic: await shot('editweek-dots') }
})
await step('H5', 'a seat\'s dot and its OG tag share it, in opposite corners; nothing covers the dotted seat', async () => {
  const og = await page.$eval('#eWeek [data-slot="1.0.0.0.p"]', e => getComputedStyle(e, '::after').content).catch(() => null)
  return { ok: og === '"OG"' && await hitsItself('#eWeek [data-slot="1.0.0.0.p"]'), note: String(og) }
})
await step('H6', 'a tap (phone) or a hover (desktop) on a dotted detail raises its bubble — and the edit still happens underneath', async () => {
  const seat = page.locator('#eWeek [data-slot="1.0.0.0.p"]')
  if (PHONE) await seat.tap(); else await seat.hover()
  await page.waitForTimeout(400)
  const b = await page.$eval('.histbub', e => e.textContent || '').catch(() => null)
  const pic = await shot('bubble')
  if (PHONE) { await page.evaluate(() => window.disarmSlot && window.disarmSlot()); await page.waitForTimeout(200) }
  return { ok: !!b && /Outlaw|Casper/.test(b), note: String(b).slice(0, 120), pic }
})
await step('H24', 'an input row (Ranger's leave, under Unavailable) answers with its OWN bubble — "Ranger · LL", its filing on that day', async () => {
  const row = page.locator('#eWeek .day[data-day="1"] [data-inprow][data-histdot]').first()
  if (!(await row.count())) return { ok: false, note: 'no dotted input row on Tuesday' }
  await row.scrollIntoViewIfNeeded(); await page.waitForTimeout(200)
  if (PHONE) await row.tap(); else await row.hover()
  await page.waitForTimeout(400)
  const b = await page.$eval('.histbub', e => ({ what: e.querySelector('.hb-what')?.textContent || '', txt: e.textContent || '' })).catch(() => null)
  const pic = await shot('input-bubble')
  if (PHONE) { await page.evaluate(() => window.disarmSlot && window.disarmSlot()); await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(200) }
  else await page.mouse.move(2, 2)
  return { ok: !!b && /Ranger · LL/.test(b.what) && !/Casper|Outlaw/.test(b.txt), note: JSON.stringify(b).slice(0, 160), pic }
})
await step('H7', 'the phone bar: at the bottom, "History on · N changes" and "Show ▴"; Show brings the panel back', async () => {
  const bar = await page.$eval('.chgwin.bar', e => { const r = e.getBoundingClientRect(); return { txt: e.querySelector('.cw-barbtn')?.textContent, bottom: Math.round(innerHeight - r.bottom) } }).catch(() => null)
  const pic = await shot('phone-bar')
  await showPanel()
  const back = await count('.chgwin:not(.bar) .win-tabs')
  return { ok: !!bar && /^History on · \d+ changes?Show ▴$/.test(bar.txt || '') && bar.bottom === 12 && back === 1, note: JSON.stringify({ bar, back }), pic }
}, 'phone')
await step('H8', 'All changes: the first line is one group "Flying · …" with its seats as details, and the within-line move is ONE entry, "moved", #1 RCP → #2 RCP', async () => {
  await page.click('.chgwin .win-tab:has-text("All changes")'); await page.click('.chgwin .cw-day:has-text("Tue")'); await page.waitForTimeout(300)
  const g = await page.$$eval('.chgwin .cw-g', els => els.map(e => ({ h: e.querySelector('.cw-gh .cw-ghname, .cw-what')?.textContent || '', lines: [...e.querySelectorAll('.cw-l')].map(l => l.textContent || '') })))
  const fly = g.find(x => /^Flying · VL BFM/.test(x.h))
  const moved = fly && fly.lines.filter(l => /moved(?! in| out)/.test(l))
  return { ok: !!fly && fly.lines.length >= 3 && moved.length === 1 && /#1 RCP.*#2 RCP/.test(moved[0]), note: JSON.stringify(fly), pic: await shot('item-formation') }
})
await step('H9', 'the duty-desk move is under BOTH desks — "moved in from" and "moved out to" — and ONE change in the tab', async () => {
  const l = await page.$$eval('.chgwin .cw-l', els => els.map(e => e.textContent || ''))
  const ins = l.filter(x => /moved in from/.test(x)), outs = l.filter(x => /moved out to/.test(x))
  return { ok: !hexIds.moved || (ins.length === 1 && outs.length === 1), note: JSON.stringify({ ins, outs, moved: hexIds.moved }) }
})
await step('H10', 'the week view: the day leads every item ("Tue · …"), the newest item on top', async () => {
  await page.click('.chgwin .cw-day:has-text("Week")'); await page.waitForTimeout(300)
  const t = await page.$$eval('.chgwin .cw-g', els => els.map(e => e.querySelector('.cw-gh .cw-ghname, .cw-what')?.textContent || ''))
  return { ok: t.length > 0 && t.every(x => /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) · /.test(x)), note: JSON.stringify(t), pic: await shot('item-week') }
})
await step('H11', 'Group by Who keeps its sittings, each line item-first', async () => {
  await page.click('.chgwin .cw-g-btn:has-text("Who")'); await page.waitForTimeout(300)
  const s = await page.$$eval('.chgwin .cw-g', els => els.map(e => ({ h: e.querySelector('.cw-gh')?.textContent || '', open: e.querySelector('.cw-gh')?.getAttribute('aria-expanded'), firsts: [...e.querySelectorAll('.cw-what')].map(x => x.textContent || '') })))
  const pic = await shot('group-who')
  await page.click('.chgwin .cw-g-btn:has-text("Item")'); await page.waitForTimeout(200)
  return { ok: s.some(x => /Hex/.test(x.h)) && s.some(x => /Ranger/.test(x.h)) && s.every(x => x.open === 'true') && s.every(x => x.firsts.every(t => /·/.test(t))), note: JSON.stringify(s).slice(0, 400), pic }
})
await step('H12', 'every group opens by default; a caret folds one and it stays folded while the window is open', async () => {
  const hs = page.locator('.chgwin .cw-gh')
  const k = await hs.count()
  const allOpen = (await hs.evaluateAll(e => e.map(x => x.getAttribute('aria-expanded')))).every(x => x === 'true')
  if (!k) return { ok: false, note: 'no header' }
  await hs.first().click(); await page.waitForTimeout(200)
  await page.click('.chgwin .win-tab:has-text("New to you")'); await page.click('.chgwin .win-tab:has-text("All changes")'); await page.waitForTimeout(200)
  const folded = await page.locator('.chgwin .cw-gh').first().getAttribute('aria-expanded')
  await page.locator('.chgwin .cw-gh').first().click()
  return { ok: allOpen && folded === 'false', note: JSON.stringify({ k, allOpen, folded }) }
})
await step('H13', 'a tap on a line takes the schedule there (the week, not the board) and the window stays — on a phone as its bar', async () => {
  const line = page.locator('.chgwin button.cw-l').first()
  await line.click(); await page.waitForTimeout(700)
  const s = { flash: await count('#eWeek .chgflash'), open: await count('.chgwin:not([hidden])'), bar: await count('.chgwin.bar'), board: await page.evaluate(() => window.SBDAY ?? null) }
  const pic = await shot('after-jump')
  await showPanel()
  return { ok: s.flash > 0 && s.open === 1 && s.board === null && (PHONE ? s.bar === 1 : s.bar === 0), note: JSON.stringify(s), pic }
})
await step('H14', 'published Monday: its issued remark wears its AL1 tag AND the dot', async () => {
  const r = await page.$eval('#eWeek .day[data-day="0"] [data-txt="fr:0.0.0.0"]', e => ({ alc: e.getAttribute('data-alc'), al: getComputedStyle(e, '::after').content, dot: e.hasAttribute('data-histdot') && getComputedStyle(e, '::before').backgroundColor === 'rgb(229, 194, 74)' })).catch(() => null)
  await page.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="0"] [data-txt="fr:0.0.0.0"]'); d && d.scrollIntoView({ block: 'center', inline: 'center' }) }); await page.waitForTimeout(300)
  return { ok: !!r && r.alc === '1' && /AL/.test(r.al) && r.dot, note: JSON.stringify(r), pic: await shot('mon-al-and-dot') }
})
await step('H15', 'the board: seats, a typed box and the wave-title box are dotted; the wave title answers with its bubble', async () => {
  await openBoard(1)
  await page.waitForTimeout(400)
  const r = {
    seat: await dotOf('#schedBoard [data-slot="1.0.0.0.p"]'),
    time: await page.$eval('#schedBoard [data-bfld="ap:1.0.str"]', e => ({ on: e.hasAttribute('data-histdot'), painted: /radial-gradient/.test(getComputedStyle(e).backgroundImage) })).catch(() => null),
    wsel: await page.$eval('#schedBoard [data-wsel]', e => ({ on: e.hasAttribute('data-histdot'), painted: /radial-gradient/.test(getComputedStyle(e).backgroundImage) })).catch(() => null),
  }
  const ws = page.locator('#schedBoard [data-wsel]').first()
  if (PHONE) await ws.tap().catch(() => ws.click()); else await ws.hover()
  await page.waitForTimeout(400)
  const b = await page.$eval('.histbub', e => e.textContent || '').catch(() => null)
  if (PHONE) await page.keyboard.press('Escape').catch(() => {})
  const good = x => x && x.on && x.painted
  return { ok: good(r.seat) && good(r.time) && good(r.wsel) && !!b, note: JSON.stringify({ ...r, bubble: String(b).slice(0, 80) }), pic: await shot('board-dots') }
})
await step('H16', 'a look at the published Original on the board wears no dot, and answers no bubble', async () => {
  await closeBoard(); await openBoard(0)
  const vers = await page.evaluate(() => (window.dayVersions(0) || []).map(v => v.id ?? v))
  const issued = vers.find(v => v !== 'live')
  if (issued) await page.evaluate(v => { window.setDayPreview(0, v); window.renderScheduler && window.renderScheduler() }, issued)
  await page.waitForTimeout(500)
  const s = { look: await count('#schedBoard .pv-frozen'), dots: await count('#schedBoard .pv-frozen [data-histdot]'), hint: await count('.chgwin .cw-hint'), bar: null }
  const cell = page.locator('#schedBoard .pv-frozen [data-bfld]').first()
  let bub = null
  if (await cell.count()) { if (PHONE) await cell.tap().catch(() => {}); else await cell.hover(); await page.waitForTimeout(300); bub = await page.$eval('.histbub', e => e.textContent).catch(() => null) }
  const pic = await shot('board-look')
  /* the hidden bar reads "Changes" while the board shows a look — History draws nothing there (Astra FR-05, Fable F3) */
  if (PHONE && await count('.chgwin .win-hide')) { await page.click('.chgwin .win-hide'); await page.waitForTimeout(300); s.bar = await page.$eval('.chgwin.bar .cw-barl', e => e.textContent).catch(() => null) }
  await page.evaluate(() => { window.setDayPreview(0, null); window.renderScheduler && window.renderScheduler() }); await page.waitForTimeout(300)
  const liveBar = PHONE ? await page.$eval('.chgwin.bar .cw-barl', e => e.textContent).catch(() => null) : null
  if (PHONE) await showPanel()
  await closeBoard()
  return { ok: s.look > 0 && s.dots === 0 && bub === null && s.hint === 0 && (!PHONE || (s.bar === 'Changes' && liveBar === 'History on')), note: JSON.stringify({ ...s, liveBar, vers, bub }), pic }
})
await step('H17', 'Mark all as seen: the OG tags and the gold "new" marks go; the history dots stay', async () => {
  await page.click('.chgwin .win-tab:has-text("New to you")'); await page.click('.chgwin .cw-day:has-text("Week")'); await page.waitForTimeout(200)
  await page.click('.chgwin .cw-seen'); await page.waitForTimeout(400)
  const s = { og: await count('#eWeek [data-og]'), fresh: await count('.chgwin .cw-l.fresh'), dots: await count('#eWeek [data-histdot]') }
  return { ok: s.og === 0 && s.fresh === 0 && s.dots > 0, note: JSON.stringify(s), pic: await shot('after-seen') }
})
await step('H18', 'Hide, then ✕ on the bar (phone) — or ✕ on the window (desktop): the window shuts and every dot goes', async () => {
  if (PHONE) { await page.click('.chgwin .win-hide'); await page.waitForTimeout(200); await page.click('.chgwin.bar .win-x') } else await page.click('.chgwin .win-x')
  await page.waitForTimeout(300)
  return { ok: await count('.chgwin:not([hidden])') === 0 && await count('[data-histdot]') === 0 }
})
await step('H19', 'a reload: the history is still there — the window reopened, the dots come back on the same details', async () => {
  await page.reload(); await signIn('ad', 'a')
  await go('editsched'); await openWin()
  if (PHONE) { await page.click('.chgwin .win-hide'); await page.waitForTimeout(200) }
  const d = await dotOf('#eWeek [data-slot="1.0.0.0.p"]')
  return { ok: !!d && d.on && d.painted, note: JSON.stringify(d), pic: await shot('after-reload') }
})
await step('H25', 'the cost of the dots: the pass that paints them after each repaint, timed on the edit week with the CPU slowed 4×', async () => {
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  const t = await page.evaluate(() => {
    const root = document.querySelector('#eWeek'); const ms = []
    for (let i = 0; i < 21; i++) { const a = performance.now(); window.refreshHistDots(root); ms.push(performance.now() - a) }
    ms.sort((a, b) => a - b)
    return { median: +ms[10].toFixed(2), worst: +ms[20].toFixed(2), cells: root.querySelectorAll(window.HIST_CELLS).length, dots: root.querySelectorAll('[data-histdot]').length }
  })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
  /* within one frame (16ms) even on a slowed CPU — it runs beside the highlight pass after every repaint */
  return { ok: t.dots > 0 && t.median < 16, note: JSON.stringify(t) }
})
await step('H20', 'the hidden bar stays reachable when the ALL AVAIL window opens over it (Astra 07)', async () => {
  await page.evaluate(() => { const w = window; w.DAYS[1].allhands.push({ prog: 'WALK BRIEF', str: '10:00', end: '11:00', who: 'allavail' }); w.afterSchedMutate() })
  await page.waitForTimeout(400)
  const p = page.locator('#eWeek [data-oilsent]').first()
  await p.scrollIntoViewIfNeeded(); await p.click(); await page.waitForTimeout(400)
  const s = { avail: await count('.availwin:not([hidden])'), show: await hitsItself('.chgwin.bar .cw-show'), x: await hitsItself('.chgwin.bar .win-x') }
  const pic = await shot('bar-over-allavail')
  return { ok: s.avail === 1 && s.show && s.x, note: JSON.stringify(s), pic }
}, 'phone')
await step('H21', 'a week change while History is on closes the window, hidden or not, and the dots go with it', async () => {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button,[data-week]')].find(x => /Jul 20/.test(x.textContent || '')); b && b.click() })
  await page.waitForTimeout(700)
  return { ok: await count('.chgwin:not([hidden])') === 0 && await count('[data-histdot]') === 0, note: String(await page.evaluate(() => window.CURWEEK)) }
})
await signOut()

/* ---- Ranger (a member) looks, on View-only Sched ---- */
await signIn('us', 'us')
await go('viewsched')
/* back to the week of 13 Jul (H21 moved on to the next) */
await page.evaluate(() => { const b = [...document.querySelectorAll('button,[data-week]')].find(x => /Jul 13/.test(x.textContent || '')); b && b.click() })
await page.waitForTimeout(700)
await step('H22', 'a member: the day chip opens the window grouped by Item; View-only wears no dots; on a phone no hint, and the bar says "Changes"', async () => {
  const chip = page.locator('#vWeek .day[data-day="1"] .day-head .dpend').first()
  if (!(await chip.count())) return { ok: false, note: 'no chip on Tuesday' }
  await chip.click(); await page.waitForTimeout(400)
  const s = { open: await count('.chgwin:not([hidden])'), on: await page.$eval('.chgwin .cw-g-btn.on', e => e.textContent).catch(() => null), dots: await count('#vWeek [data-histdot]'), hint: await count('.chgwin .cw-hint') }
  let bar = null
  if (PHONE) { await page.click('.chgwin .win-hide'); await page.waitForTimeout(300); bar = await page.$eval('.chgwin.bar .cw-barbtn', e => e.textContent).catch(() => null) }
  const pic = await shot('member-viewonly')
  return { ok: s.open === 1 && s.on === 'Item' && s.dots === 0 && s.hint === 0 && (!PHONE || /^Changes · \d+ changes?Show ▴$/.test(bar || '')), note: JSON.stringify({ ...s, bar }), pic }
})
await step('H23', 'no console errors through the whole walk', async () => ({ ok: errors.length === 0, note: errors.slice(0, 4).join(' | ') }))

writeFileSync(`${OUT}/results.md`, `# hp-walk — ${TAG} (${W}×${H})\n\n| Step | What | Result | Note | Picture |\n|---|---|---|---|---|\n`
  + rows.map(r => `| ${r.id} | ${r.what} | ${r.ok ? 'PASS' : '**FAIL**'} | ${String(r.note).replace(/\|/g, '\\|').slice(0, 300)} | ${r.pic || ''} |`).join('\n') + '\n')
const fails = rows.filter(r => !r.ok).length
console.log(`\n${rows.length - fails}/${rows.length} PASS (${TAG})`)
await browser.close()
process.exit(fails ? 1 : 0)
