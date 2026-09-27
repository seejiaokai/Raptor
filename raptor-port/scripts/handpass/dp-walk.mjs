/* [DRAFT-PENDING] — the walk (28 Sep 26). One world per run (a fresh browser, the production build), at HP_W × HP_H.
   Every step is an ASSERTION of the right behaviour (PASS means correct), so re-running it on a fixed build IS the
   re-walk (bug-check order §5). Pictures and results.md go to HP_SHOTS/<width-tag>.

   The story: Saber (admin) publishes Monday; Hex (a member account, given the admin role in place through the
   localhost bridge — the role only, §7.7) puts two men on Tuesday's first line, moves a man between two programme rows,
   and changes Monday's SDO desk after publication; Ranger (a member) files his own leave on Tuesday; then Saber and
   Ranger each look. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

const BASE = process.env.HP_URL || 'http://localhost:4182'
const W = +(process.env.HP_W || 1440), H = +(process.env.HP_H || 900)
const TAG = W < 700 ? 'phone' : 'desktop'
const OUT = (process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-28-draft-pending') + '/walk-' + TAG
mkdirSync(OUT, { recursive: true })
const CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ctx = await browser.newContext({ viewport: { width: W, height: H }, ...(W < 700 ? { hasTouch: true, isMobile: true } : {}) })
const page = await ctx.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
const rows = []
let n = 0
const shot = async (name) => { const f = `${String(++n).padStart(2, '0')}-${name}.png`; await page.screenshot({ path: `${OUT}/${f}` }); return f }
async function step(id, what, fn) {
  let ok = false, note = '', pic = ''
  try { const r = await fn(); ok = r === true || (r && r.ok); note = r && r.note ? r.note : ''; pic = r && r.pic ? r.pic : '' }
  catch (e) { note = 'THREW ' + String(e && e.message || e).slice(0, 200) }
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
const txt = (sel) => page.$eval(sel, e => e.textContent || '').catch(() => null)
const count = (sel) => page.locator(sel).count()
const chipOf = (surf, di) => page.$eval(`${surf} .day[data-day="${di}"] .day-head .dpend`, e => ({ t: (e.textContent || '').trim(), c: e.className })).catch(() => null)
const openBoard = async (di) => { await page.evaluate(d => window.openScheduler(d), di); await page.waitForSelector('#schedBoard'); await page.waitForTimeout(500) }
const closeBoard = async () => { await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.waitForTimeout(400) }

/* a fresh browser context starts with empty storage — and NOT ?fresh=1, which forces the memory store and would lose the
   world on the reload step (A16) */
await page.goto(BASE + '/')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })

/* ---- the world, through the app ---- */
await signIn('ad', 'a')
await go('editsched')
await openBoard(0)
const pub = await page.evaluate(async () => 0)
/* sign the four and publish Monday through the board's own controls */
{
  const sels = page.locator('#schedBoard [data-sign]:visible')
  const k = await sels.count()
  for (let i = 0; i < k; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await page.waitForTimeout(150)
  }
  const beak = page.locator('#schedBoard [data-beak="0"]:visible').first()
  if (await beak.count() && !(await beak.isDisabled())) { await beak.click(); await page.waitForTimeout(900) }
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.click(); await page.waitForTimeout(900) }
}
await closeBoard()
const monPub = await page.evaluate(() => window.dayApproved(0))
await signOut()

await signIn('hex', 'x')
await page.evaluate(() => window.raptorRole('admin'))
await go('editsched')
const hexIds = await page.evaluate(() => {
  const w = window
  /* Tuesday (not published): two men put on the first line; a man moved between two programme rows */
  w.fillSlot('1.0.0.0.p', 'casper'); w.fillSlot('1.0.0.0.w', 'bane')
  /* a man MOVED between two of Tuesday's duty desks — off one, onto another, together (one line, Fable F2) */
  const dr = w.DAYS[1].dutywaves[0].rows
  /* the first desk emptied (a line of its own), then the second desk's man moved onto it */
  const to = dr.findIndex(r => r && r.id), from = dr.findIndex((r, i) => i !== to && r && r.id)
  let moved = null
  if (from >= 0 && to >= 0) { w.fillSlot(`d:1.0.${to}`, ''); moved = dr[from].id; w.fillSlot(`d:1.0.${from}`, ''); w.fillSlot(`d:1.0.${to}`, moved) }
  /* Monday (published): the SDO desk handed to someone else */
  const d0 = w.DAYS[0].dutywaves[0].rows
  const sdo = d0.findIndex(r => r && r.id)
  const was = sdo >= 0 ? d0[sdo].id : null
  if (sdo >= 0) w.fillSlot(`d:0.0.${sdo}`, was === 'mamba' ? 'pump' : 'mamba')
  w.afterSchedMutate()
  return { moved, from, to, sdo, was }
})
await signOut()

await signIn('us', 'us')
await page.evaluate(() => window.fileInput({ person: 'bane', date: 'Jul 14', yr: 2026, allday: true, type: 'LL' }))
await page.waitForTimeout(300)
await signOut()

/* ---- Saber looks ---- */
await signIn('ad', 'a')
await go('editsched')
await step('A1', 'Monday was published through its own controls', async () => ({ ok: monPub === true, note: String(monPub) }))
await step('A2', 'Tuesday (not published) reads "N new" — Hex\'s and Ranger\'s changes, new to Saber', async () => {
  const c = await chipOf('#eWeek', 1); return { ok: !!c && /new/.test(c.t) && /dnew/.test(c.c), note: JSON.stringify(c), pic: await shot('saber-editweek') }
})
await step('A3', 'Monday (published) reads "1 pending" with the gold dot (something new on it)', async () => {
  const c = await page.$eval('#eWeek .day[data-day="0"] .day-head [data-pendlist]', e => ({ t: e.textContent, dot: !!e.querySelector('.dnewdot') })).catch(() => null)
  return { ok: !!c && /1\s*pending/.test(c.t) && c.dot, note: JSON.stringify(c) }
})
await step('A4', 'the OG tag is PAINTED on Tuesday\'s two new pucks, and on no published day', async () => {
  const og = await page.$$eval('#eWeek [data-og]', els => els.map(e => ({ k: e.getAttribute('data-slot'), c: getComputedStyle(e, '::after').content, p: getComputedStyle(e).position })))
  const mon = og.filter(x => /^0\.|:0\./.test(x.k || ''))
  return { ok: og.length >= 2 && og.every(x => x.c === '"OG"' && x.p === 'relative') && mon.length === 0, note: JSON.stringify(og) }
})
await step('A5', 'the admin\'s icon carries the week\'s new count, no word', async () => {
  const b = await page.$eval('#histBtn', e => ({ t: (e.textContent || '').trim(), n: (e.querySelector('.chgnum') || {}).textContent || '' })).catch(() => null)
  return { ok: !!b && +b.n >= 3 && !/Edit history/.test(b.t), note: JSON.stringify(b) }
})
await step('A6', 'Tuesday\'s chip opens the window on Tuesday, New to you, grouped by Who', async () => {
  await page.click('#eWeek .day[data-day="1"] .day-head .dpend.dpendbtn')
  await page.waitForTimeout(400)
  const s = await page.$eval('.chgwin', e => ({ ttl: e.querySelector('.win-ttl')?.textContent, tab: e.querySelector('.win-tab.on')?.textContent, grp: [...e.querySelectorAll('.cw-gh')].map(g => g.textContent) })).catch(() => null)
  return { ok: !!s && /Tuesday/.test(s.ttl || '') && /New to you/.test(s.tab || '') && s.grp.some(g => /Hex/.test(g)) && s.grp.some(g => /Ranger/.test(g)), note: JSON.stringify(s), pic: await shot('window-tue-new') }
})
await step('A7', 'the move between two of the duty desks on Tuesday is ONE line, "moved from … to …"', async () => {
  if (!hexIds.moved) return { ok: false, note: 'no duty desk to move from: ' + JSON.stringify(hexIds) }
  const l = await page.$$eval('.chgwin .cw-l', els => els.map(e => e.textContent || ''))
  const moves = l.filter(x => /moved from/.test(x))
  return { ok: moves.length === 1, note: JSON.stringify(moves) }
})
await step('A8', 'Ranger\'s leave is ONE line under his name, and a tap lands on his row under Unavailable (the R30 finding)', async () => {
  const ls = page.locator('.chgwin .cw-l', { hasText: 'LL added' })
  const k = await ls.count()
  if (!k) return { ok: false, note: 'no leave line' }
  const tag = await ls.first().evaluate(e => e.tagName)
  await ls.first().click(); await page.waitForTimeout(700)
  const flash = await page.$$eval('#eWeek .chgflash', els => els.map(e => e.getAttribute('data-inprow') || e.className))
  return { ok: k === 1 && tag === 'BUTTON' && flash.length > 0, note: JSON.stringify({ k, tag, flash }), pic: await shot('leave-line-jump') }
})
await step('A9', 'the window STAYED OPEN after the tap (D167)', async () => ({ ok: await count('.chgwin:not([hidden])') === 1 }))
await step('A10', 'Group by Where lists Flying waves, Duties and Absences', async () => {
  /* on a phone the tap in A8 shrank the panel to its bar (D167 (2)); a tap on the bar brings it back */
  if (await count('.chgwin.bar')) { await page.click('.chgwin.bar .cw-barbtn'); await page.waitForTimeout(300) }
  await page.click('.chgwin .cw-g-btn:has-text("Where")'); await page.waitForTimeout(300)
  const g = await page.$$eval('.chgwin .cw-gh', els => els.map(e => e.textContent || ''))
  return { ok: g.some(x => /Flying waves/.test(x)) && g.some(x => /Duties/.test(x)) && g.some(x => /Absences/.test(x)), note: JSON.stringify(g), pic: await shot('group-where') }
})
await step('A11', 'Monday\'s "1 pending" opens To go out · AL1, naming the SDO desk change with who', async () => {
  await page.click('#eWeek .day[data-day="0"] .day-head [data-pendlist]'); await page.waitForTimeout(400)
  const s = await page.$eval('.chgwin', e => ({ tab: e.querySelector('.win-tab.on')?.textContent, items: [...e.querySelectorAll('.pl-item')].map(i => i.textContent) })).catch(() => null)
  return { ok: !!s && /To go out · AL1/.test(s.tab || '') && s.items.length === 1 && /Hex/.test(s.items[0] || ''), note: JSON.stringify(s), pic: await shot('mon-to-go-out') }
})
await step('A12', 'the week: every change this week, the day picker\'s gold dots on Mon and Tue', async () => {
  await page.click('.chgwin .win-tab:has-text("All changes")'); await page.click('.chgwin .cw-day:has-text("Week")'); await page.waitForTimeout(300)
  const d = await page.$$eval('.chgwin .cw-day.nd', els => els.map(e => e.textContent))
  return { ok: d.includes('Mon') && d.includes('Tue'), note: JSON.stringify(d), pic: await shot('week-all') }
})
await step('A13', 'the board: its History button opens the window on the board\'s day, the bubble answers a changed seat', async () => {
  await page.click('.chgwin .win-x'); await page.waitForTimeout(200)
  await openBoard(1)
  const chip = await page.$eval('#schedBoard .sb-pub .dpend', e => e.textContent).catch(() => null)
  const og = await page.$$eval('#schedBoard [data-og]', els => els.length)
  await page.click('#sbHist'); await page.waitForTimeout(300)
  const ttl = await txt('.chgwin .win-ttl')
  let bub = null
  if (W >= 700) { await page.hover('#schedBoard [data-slot="1.0.0.0.p"]'); await page.waitForTimeout(300); bub = await txt('.histbub') }
  else { await page.tap('#schedBoard [data-slot="1.0.0.0.p"]').catch(() => page.click('#schedBoard [data-slot="1.0.0.0.p"]')); await page.waitForTimeout(300); bub = await txt('.histbub') }
  return { ok: /new|change/.test(chip || '') && og >= 2 && /Tuesday/.test(ttl || '') && /Hex/.test(bub || ''), note: JSON.stringify({ chip, og, ttl, bub: (bub || '').slice(0, 80) }), pic: await shot('board-history') }
})
await closeBoard()
await step('A14', 'the edit week has the bubble too while the window is open (D116)', async () => {
  await go('editsched')
  if (!(await count('.chgwin:not([hidden])'))) await page.click('#histBtn')
  /* on a phone the panel covers most of the week: a tap on a line shrinks it to its bar first (D167 (2)), as a person would */
  if (W < 700 && !(await count('.chgwin.bar'))) {
    await page.click('.chgwin .win-tab:has-text("All changes")'); await page.click('.chgwin .cw-day:has-text("Tue")')
    await page.locator('.chgwin button.cw-l').first().click(); await page.waitForTimeout(500)
  }
  const sel = '#eWeek [data-slot="1.0.0.0.p"]'
  if (W >= 700) { await page.hover(sel); await page.waitForTimeout(300) }
  else { await page.tap(sel).catch(() => page.click(sel)); await page.waitForTimeout(300) }
  const b = await txt('.histbub')
  return { ok: /Hex/.test(b || ''), note: (b || '').slice(0, 80), pic: await shot('editweek-bubble') }
})
await step('A15', 'Mark all as seen: Tuesday reads "N changes", the tags and the icon\'s number go', async () => {
  if (!(await count('.chgwin:not([hidden])'))) await page.click('#histBtn')
  if (await count('.chgwin.bar')) { await page.click('.chgwin.bar .cw-barbtn'); await page.waitForTimeout(300) }
  await page.click('.chgwin .win-tab:has-text("New to you")'); await page.click('.chgwin .cw-day:has-text("Week")')
  await page.click('.chgwin .cw-seen'); await page.waitForTimeout(400)
  const c = await chipOf('#eWeek', 1), og = await count('#eWeek [data-og]'), num = await count('#histBtn .chgnum')
  return { ok: !!c && /change/.test(c.t) && og === 0 && num === 0, note: JSON.stringify({ c, og, num }), pic: await shot('seen') }
})
await step('A16', 'a reload keeps the history and what Saber has seen (D336 (b))', async () => {
  await page.reload(); await signIn('ad', 'a'); await go('editsched')
  const c = await chipOf('#eWeek', 1)
  return { ok: !!c && /change/.test(c.t), note: JSON.stringify(c) }
})
await step('A17', 'Saber signs Tuesday\'s CUR CK — a line "Signed · CUR CK" on Tuesday', async () => {
  await openBoard(1)
  const sel = page.locator('#schedBoard [data-sign="cur"]:visible').first()
  const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v))
  await sel.selectOption(opts[0]); await page.waitForTimeout(300)
  const lines = await page.evaluate(() => window.ELOG.rows.map(r => r.lbl))
  await closeBoard()
  return { ok: lines.some(l => /^Signed · CUR CK/.test(l)), note: JSON.stringify(lines.slice(-2)) }
})
await step('A18', 'Undo leaves its own line on the day it changed', async () => {
  await go('editsched')
  await page.evaluate(() => { window.fillSlot('2.0.0.0.p', 'casper'); window.afterSchedMutate() })
  await page.click('#undoBtn'); await page.waitForTimeout(400)
  const last = await page.evaluate(() => { const r = window.ELOG.rows[window.ELOG.rows.length - 1]; return r && { lbl: r.lbl, date: r.date } })
  return { ok: !!last && /^Undo/.test(last.lbl) && last.date === '2026-07-15', note: JSON.stringify(last) }
})
await step('A19', 'a week change closes the window', async () => {
  if (!(await count('.chgwin:not([hidden])'))) await page.click('#histBtn')
  await page.evaluate(() => window.loadWeek('20/07/2026')); await page.waitForTimeout(600)
  const open = await count('.chgwin:not([hidden])')
  await page.evaluate(() => window.loadWeek('13/07/2026')); await page.waitForTimeout(600)
  return { ok: open === 0 }
})
await signOut()

/* ---- Ranger (a member) looks ---- */
await signIn('us', 'us')
await step('M1', 'a member has no top-bar changes door (D171 (1))', async () => ({ ok: await count('#histBtn') === 0 }))
await step('M2', 'View-only Sched: Tuesday\'s live draft carries the chip (Hex\'s changes are new to Ranger)', async () => {
  await go('viewsched')
  const c = await chipOf('#vWeek', 1)
  return { ok: !!c && /new/.test(c.t), note: JSON.stringify(c), pic: await shot('member-view') }
})
await step('M3', 'the chip opens the window, read only — and it names who made each change', async () => {
  await page.click('#vWeek .day[data-day="1"] .day-head .dpend.dpendbtn'); await page.waitForTimeout(400)
  await page.click('.chgwin .win-tab:has-text("All changes")'); await page.waitForTimeout(200)
  if (W < 700 && await count('.chgwin.bar')) await page.click('.chgwin.bar .cw-barbtn')
  const s = await page.$eval('.chgwin', e => ({ foot: e.querySelector('.win-foot')?.textContent, lines: [...e.querySelectorAll('.cw-l')].map(l => l.textContent) })).catch(() => null)
  return { ok: !!s && /Read only/.test(s.foot || '') && s.lines.some(l => /Hex/.test(l || '')), note: JSON.stringify(s && s.foot), pic: await shot('member-window') }
})
await step('M4', 'Monday\'s issued face shows no chip; the working copy shows "1 pending" and it opens the window', async () => {
  await page.click('.chgwin .win-x').catch(() => {})
  const face = await count('#vWeek .day[data-day="0"] .day-head .dpend')
  await page.selectOption('#vWeek .day[data-day="0"] select[data-vwork]', 'working').catch(() => {})
  await page.waitForTimeout(400)
  const wc = await page.$eval('#vWeek .day[data-day="0"] .day-head [data-pendlist]', e => e.textContent).catch(() => null)
  return { ok: face === 0 && /1\s*pending/.test(wc || ''), note: JSON.stringify({ face, wc }) }
})
await step('M5', 'the page scrolls no sideways with the window open', async () => ({ ok: await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1) }))

writeFileSync(`${OUT}/results.md`, `# [DRAFT-PENDING] walk — ${TAG} ${W}×${H} (28 Sep 26)\n\n| # | Check | Result | Note | Picture |\n|---|---|---|---|---|\n`
  + rows.map(r => `| ${r.id} | ${r.what} | ${r.ok ? 'PASS' : '**FAIL**'} | ${String(r.note).replace(/\|/g, '/').slice(0, 300)} | ${r.pic} |`).join('\n')
  + `\n\nConsole errors: ${errors.length ? errors.map(e => e.slice(0, 160)).join(' · ') : 'none'}\n`)
console.log(`${rows.filter(r => r.ok).length}/${rows.length} passed; errors: ${errors.length}`)
await browser.close()
