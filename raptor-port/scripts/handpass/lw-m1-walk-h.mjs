// The host's own walk for M1 (22 Oct 26), after the walkers' fixes: S29 (a drag-selected block while the open dates
// change under it — desktop by mouse, phone by finger), S9 (the year end: each date judged by the period holding it),
// S27 (a member's own OIL award on a closed day). Served from dist-m1w on http://localhost:4255/ (lwm1-walk-host).
// Written as assertions where the scenario has an EXPECTED line; RECORD where it says RECORD.
import { chromium } from 'playwright'
import path from 'node:path'
import {
  newPhone, signIn, signInPlain, finger, tapSel, centre, T, cellId, vis, txt, gotoMonth, openWindow, closeWindow,
  dragCells, topSheet, states, OUT, launchOptions, rec, results,
} from './lw-m1-walk-h-lib.mjs'

const BASE = 'http://localhost:4255/'
const pic = (page, name) => page.screenshot({ path: path.join(OUT, name + '.png') })
const errsAll = []

async function newDesk() {
  const b = await chromium.launch(launchOptions)
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errs = []
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  return { b, ctx, page, errs }
}
async function deskSignIn(page, who, { plain = false, today } = {}) {
  await page.goto(plain ? BASE : BASE + '?fresh=1')
  await page.waitForSelector('#luser')
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  if (today !== undefined) await page.evaluate(t => window.lwSetMemberToday(t), today)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector(T(`row-${who === 'admin' ? 'stiff' : 'bane'}`))
  await page.waitForTimeout(600)
}
const click = async (page, sel) => { const l = page.locator(sel).first(); await l.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'center' })).catch(() => {}); await l.click(); await page.waitForTimeout(300) }
async function deskMonths(page, keys) {
  await click(page, T('open-chip')); await page.waitForSelector(T('open-dates'))
  for (const k of keys) await click(page, T(`od-month-${k}`))
  const st = await states(page, keys)
  await click(page, T('open-dates-close'))
  return st
}
async function deskDrag(page, who, from, to) {
  const box = async iso => { const l = page.locator(T(cellId(who, iso))).first(); await l.scrollIntoViewIfNeeded(); return l.boundingBox() }
  const a = await box(from), z = await box(to)
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
  for (let i = 1; i <= 6; i++) await page.mouse.move(a.x + a.width / 2 + (z.x - a.x) * i / 6, a.y + a.height / 2, { steps: 2 })
  await page.mouse.up(); await page.waitForTimeout(500)
}
async function deskClose(page) {
  for (const t of ['bid-cancel', 'daylist-close', 'sel-cancel', 'closed-note-close', 'remarks-cancel', 'award-close', 'move-cancel', 'open-dates-close'])
    if (await vis(page, T(t))) await click(page, T(t))
}
const cells = (page, who, isos) => Promise.all(isos.map(d => txt(page, T(cellId(who, d)))))
const MAY = ['2026-05-04', '2026-05-05', '2026-05-06']

/* ---------------- S29, desktop by mouse ---------------- */
{
  const { b, page, errs } = await newDesk()
  await deskSignIn(page, 'admin')
  const opened = await deskMonths(page, ['2026-05'])
  await click(page, T('month-MAY'))
  await deskDrag(page, 'bane', MAY[0], MAY[2])
  const sel1 = await topSheet(page)
  await pic(page, 'S29-01-desk-admin-drag-select-ranger-4-6-may-open')
  await click(page, T('open-chip')); await page.waitForSelector(T('open-dates'))
  await click(page, T('od-month-2026-05'))
  const mayNow = (await states(page, ['2026-05']))['2026-05']
  await pic(page, 'S29-02-desk-admin-window-may-closed-panel-behind')
  await click(page, T('open-dates-close'))
  const selUp = await vis(page, T('select-sheet'))
  await pic(page, 'S29-03-desk-admin-after-window-closed')
  let wrote = null
  if (selUp) { await click(page, T('sel-LL')); wrote = await cells(page, 'bane', MAY) }
  rec('S29-desk', mayNow === 'closed' ? 'RECORD' : 'FAIL',
    `May opened (${opened['2026-05']}); block selected: ${sel1 ? sel1.id : 'none'}; a click on MAY in the window → ${mayNow}; after the window closed the selection panel is ${selUp ? 'still up' : 'gone'}${wrote ? `; LL in it wrote ${JSON.stringify(wrote)}` : ''}`,
    ['S29-01-desk-admin-drag-select-ranger-4-6-may-open.png', 'S29-02-desk-admin-window-may-closed-panel-behind.png', 'S29-03-desk-admin-after-window-closed.png'])
  errsAll.push(...errs.map(e => 'S29-desk ' + e)); await b.close()
}

/* ---------------- S29, phone by finger (the walker's partial read: a FEB tap with the panel up) ---------------- */
{
  const { ctx, page, cdp, errs } = await newPhone()
  await signIn(page, 'admin')
  await gotoMonth(cdp, page, 'FEB')
  await dragCells(cdp, page, 'bane', '2026-02-09', '2026-02-11')
  const sel1 = await topSheet(page)
  await pic(page, 'S29-04-phone-admin-drag-select-ranger-9-11-feb')
  await openWindow(cdp, page)
  const top = await topSheet(page)
  const before = (await states(page, ['2026-02']))['2026-02']
  await tapSel(cdp, page, T('od-month-2026-02')); await page.waitForTimeout(400)
  const after = (await states(page, ['2026-02']))['2026-02']
  await pic(page, 'S29-05-phone-admin-window-feb-tapped')
  await closeWindow(cdp, page)
  const selUp = await vis(page, T('select-sheet'))
  await pic(page, 'S29-06-phone-admin-after-window-closed')
  let wrote = null
  if (selUp) { await tapSel(cdp, page, T('sel-LL')); await page.waitForTimeout(500); wrote = await cells(page, 'bane', ['2026-02-09', '2026-02-10', '2026-02-11']) }
  rec('S29-phone', before === 'open' && after === 'closed' ? 'PASS' : 'FAIL',
    `block selected: ${sel1 ? sel1.id : 'none'}; window on top: ${top ? top.id : 'none'}; FEB ${before} → ${after} on one finger tap; after the window closed the panel is ${selUp ? 'still up' : 'gone'}${wrote ? `; LL in it wrote ${JSON.stringify(wrote)}` : ''}`,
    ['S29-04-phone-admin-drag-select-ranger-9-11-feb.png', 'S29-05-phone-admin-window-feb-tapped.png', 'S29-06-phone-admin-after-window-closed.png'])
  errsAll.push(...errs.map(e => 'S29-phone ' + e)); await ctx.close()
}

/* ---------------- S9, the year end — desktop, real storage, admin then member (clock 15 Dec 26) ---------------- */
{
  const { b, page, errs } = await newDesk()
  await deskSignIn(page, 'admin', { plain: true })
  const dec = await deskMonths(page, ['2026-12'])
  await page.selectOption(T('war-picker'), { label: await page.locator(`${T('war-picker')} option`).nth(1).innerText() })
  await page.waitForTimeout(800)
  const war2 = await page.locator(T('war-picker')).inputValue()
  const jan = await deskMonths(page, ['2027-01'])
  await deskSignIn(page, 'member', { plain: true, today: '2026-12-15' })
  const landed = await page.locator(T('war-picker')).inputValue()
  await pic(page, 'S9-01-desk-member-clock-2026-12-15-landing')
  // a bid on 2 Jan 27 (2027 open in January)
  const bidOn = async iso => {
    await click(page, T(cellId('bane', iso)))
    const s = await topSheet(page)
    if (await vis(page, T('bid-LL'))) { await click(page, T('bid-LL')); if (await vis(page, T('bid-LL'))) await click(page, T('bid-LL')) }
    await deskClose(page)
    return s
  }
  if (landed !== war2) { await page.selectOption(T('war-picker'), war2); await page.waitForTimeout(800) }
  await click(page, T('month-JAN'))
  const s2jan = await bidOn('2027-01-12')
  const c2jan = await txt(page, T(cellId('bane', '2027-01-12')))
  // the 2026 grid: a bid on 28 Dec 26 (open in December)
  await page.selectOption(T('war-picker'), 'y2026').catch(async () => page.selectOption(T('war-picker'), { index: 0 }))
  await page.waitForTimeout(800)
  await click(page, T('month-DEC'))
  const s28 = await bidOn('2026-12-28')
  const c28 = await txt(page, T(cellId('bane', '2026-12-28')))
  await pic(page, 'S9-02-desk-member-28-dec-26-bid')
  // the admin closes JANUARY 2027 only; the member's 5 Jan 27 is then closed while 2026's December stays open
  await deskSignIn(page, 'admin', { plain: true })
  await page.selectOption(T('war-picker'), war2); await page.waitForTimeout(800)
  const janShut = await deskMonths(page, ['2027-01'])
  await deskSignIn(page, 'member', { plain: true, today: '2026-12-15' })
  await page.selectOption(T('war-picker'), war2); await page.waitForTimeout(800)
  await click(page, T('month-JAN'))
  await click(page, T(cellId('bane', '2027-01-13')))
  const shut = await topSheet(page)
  await pic(page, 'S9-03-desk-member-13-jan-27-after-jan-27-closed')
  await deskClose(page)
  await page.selectOption(T('war-picker'), 'y2026').catch(async () => page.selectOption(T('war-picker'), { index: 0 }))
  await page.waitForTimeout(800); await click(page, T('month-DEC'))
  await click(page, T(cellId('bane', '2026-12-29')))
  const stillOpen = await topSheet(page)
  await pic(page, 'S9-04-desk-member-29-dec-26-still-open')
  await deskClose(page)
  const ok = dec['2026-12'] === 'open' && jan['2027-01'] === 'open' && /LL/.test(c2jan || '') && /LL/.test(c28 || '')
    && janShut['2027-01'] === 'closed' && /closed/i.test(shut?.text || '') && !/closed/i.test(stillOpen?.text || '') && /LL|Local/i.test(stillOpen?.text || '')
  rec('S9', ok ? 'PASS' : 'FAIL',
    `DEC 26 ${dec['2026-12']}, JAN 27 ${jan['2027-01']}; member (clock 15 Dec 26) lands on ${landed}; bid 12 Jan 27 → "${c2jan}" (${s2jan?.id}); bid 28 Dec 26 → "${c28}" (${s28?.id}); JAN 27 then ${janShut['2027-01']}: 13 Jan 27 opens "${(shut?.text || '').slice(0, 120)}"; 29 Dec 26 opens "${(stillOpen?.text || '').slice(0, 80)}"`,
    ['S9-01-desk-member-clock-2026-12-15-landing.png', 'S9-02-desk-member-28-dec-26-bid.png', 'S9-03-desk-member-13-jan-27-after-jan-27-closed.png', 'S9-04-desk-member-29-dec-26-still-open.png'])
  errsAll.push(...errs.map(e => 'S9 ' + e)); await b.close()
}

/* ---------------- S27, his own OIL award on a closed day — desktop, real storage ---------------- */
{
  const { b, page, errs } = await newDesk()
  await deskSignIn(page, 'admin', { plain: true })
  await click(page, T('month-MAY'))
  await click(page, T(cellId('bane', '2026-05-05')))
  await page.waitForSelector(T('bid-oil'))
  await click(page, T('bid-oil'))
  const give = page.getByRole('button', { name: /Give FO/ }).first(); await give.waitFor()
  await give.click(); await page.waitForTimeout(500)
  await deskClose(page)
  const given = await txt(page, T(cellId('bane', '2026-05-05')))
  await deskSignIn(page, 'member', { plain: true, today: '2026-02-15' })
  await click(page, T('month-MAY'))
  await click(page, T(cellId('bane', '2026-05-05')))
  const opened = await topSheet(page)
  await pic(page, 'S27-01-desk-member-clock-2026-02-15-taps-own-award-closed-5-may')
  const ok = /FO|HO/.test(given || '') && opened && /award/i.test(opened.id + ' ' + opened.tids.join(' ')) && !/Bidding is closed/.test(opened.text)
  rec('S27', ok ? 'PASS' : 'FAIL', `admin gave "${given}" on closed 5 May; member's tap opens ${opened ? opened.id : 'nothing'}: "${(opened?.text || '').slice(0, 160)}"`,
    ['S27-01-desk-member-clock-2026-02-15-taps-own-award-closed-5-may.png'])
  errsAll.push(...errs.map(e => 'S27 ' + e)); await b.close()
}

console.log('ERRORS', JSON.stringify(errsAll))
console.log('SUMMARY', results.map(r => `${r.id}:${r.verdict}`).join(' '))
process.exit(0)
