// THE HOST'S OWN WALK of the door built after the calendar job's bug check (owner D681, 9 Oct 26 — [CAL-SHARED-DATES];
// docs/handpass/2026-10-08-inputs-sans-calendar-check.md §12): a saved shared input's dates are changed in its window.
// Every step presses the app's own controls in the built bundle; the shared inputs it starts from are BACKGROUND, put
// in through the test bridge's filing helper. A PASS is the right behaviour, so a run on a later build is the re-walk.
//
//   node scripts/handpass/cal-host-dates.mjs <out dir>
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = process.argv[2] || 'test-results/cal-host-dates'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
let bad = 0, n = 0
const say = (ok, name, detail = '') => { n++; if (!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`) }
const step = async (name, fn) => { try { const r = await fn(); say(r === undefined ? true : !!r.ok, name, r && r.detail) } catch (e) { say(false, name, String(e.message || e).split('\n')[0]) } }

async function open(viewport, who = 'ad', pass = 'a', touch = false) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: touch ? 2 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  await page.goto(URL)
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('inputs'))
  return { ctx, page }
}
async function month(p, y, m, sans = false) {
  const label = sans ? p.locator('[data-testid="sc-month"]') : p.locator('#inpCal .ic-mon')
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await label.innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await p.locator(sans ? `[data-testid="${d > 0 ? 'sc-next' : 'sc-prev'}"]` : (d > 0 ? '#icNext' : '#icPrev')).click()
  }
  throw new Error('the calendar never reached the month asked for')
}
const crewOf = p => p.evaluate(() => { const P = window.PEOPLE; return Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers) })
const fileShared = (p, grp, people, row) => p.evaluate(([grp, people, row]) => {
  people.forEach((person, i) => window.fileInput({ iid: `${grp}-${i}`, person, yr: 2026, grp, grpBy: 'stiff', by: 'stiff', at: '2026-09-01T08:00:00.000Z', ...row }))
}, [grp, people, row])
const recs = (p, grp) => p.evaluate(grp => window.INPUTS.filter(r => r.grp === grp).map(r => ({ person: r.person, date: r.date, end: r.endDate || '', remarks: r.remarks || '', oil: r.oil || null })), grp)
const datesOf = async (p, grp) => [...new Set((await recs(p, grp)).map(r => r.date + '>' + r.end))].join(' | ')
const bar = (p, text) => p.locator('#inpCal .ib-bar[data-iid]').filter({ hasText: text })
const win = p => p.locator('[data-testid="win-inputedit"]')
const cal = p => p.locator('#inpEditPop #inpEdCal')
const dayBtn = (p, iso) => cal(p).locator(`[data-cal="${iso}"]`)
const shot = (p, name) => p.screenshot({ path: join(OUT, name + '.png') })
const closeWin = async p => { if (await win(p).count()) await p.locator('[data-testid="win-inputedit-x"]').click() }
const toasts = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? (t.textContent || '').trim() : '' })

/* ------------------------------------------------------------------ a desktop, the admin */
{
  const { ctx, page } = await open({ width: 1440, height: 900 })
  await month(page, 2026, 10)
  const crew = await crewOf(page)
  await fileShared(page, 'hw-g1', crew.slice(0, 3), { type: 'Meeting', date: 'Oct 20', allday: false, s: 600, e: 660, remarks: 'range brief' })
  await page.evaluate(c => window.fileInput({ iid: 'hw-solo', person: c, type: 'OML', date: 'Oct 12', endDate: 'Oct 13', yr: 2026, allday: true, s: 0, e: 1439 }), crew[5])
  const M = bar(page, /\+\d · Meeting/)

  await step('D1 a bar opens the window with the calendar in it, on the saved day', async () => {
    await M.click(); await win(page).waitFor()
    const ok = await cal(page).isVisible() && /\bs\b/.test(await dayBtn(page, '2026-10-20').getAttribute('class'))
    await shot(page, 'd1-bar-window'); await closeWin(page)
    return { ok }
  })
  await step('D2 the opened day’s line opens the same window, calendar in it', async () => {
    await page.locator('#inpCal [data-icday="2026-10-20"]').click({ position: { x: 8, y: 8 } })
    const dw = page.locator('[data-testid="win-inputsday"]'); await dw.waitFor()
    await dw.locator('[data-testid="idy-open"]').first().click(); await win(page).waitFor()
    const ok = await cal(page).isVisible()
    await shot(page, 'd2-day-line-window'); await closeWin(page)
    if (await dw.count()) await page.keyboard.press('Escape')
    return { ok }
  })
  await step('D3 the List’s one row opens it too; a tap for the start, a tap for the end, Save — every man on the new days', async () => {
    await page.click('#inListBtn')
    const row = page.locator('#inBody tr[data-iid]').filter({ hasText: 'Meeting' }).filter({ hasText: '+2' })
    await row.locator('[data-edit]').click(); await win(page).waitFor()
    if (!await cal(page).isVisible()) return { ok: false, detail: 'no calendar in the window opened from the List' }
    await dayBtn(page, '2026-10-27').click(); await dayBtn(page, '2026-10-28').click()
    const read = await page.locator('#inpEditPop .rc-read').innerText()
    await shot(page, 'd3-list-window-picked')
    await page.click('#inpEditSave'); await win(page).waitFor({ state: 'detached' })
    await shot(page, 'd3-list-after-save')
    await page.click('#inCalBtn')
    const d = await datesOf(page, 'hw-g1'), bars = await M.count()
    await shot(page, 'd3-month-after-save')
    return { ok: d === 'Oct 27>Oct 28' && bars === 1 && /27/.test(read) && /28/.test(read), detail: `saved ${d}; ${bars} bar; the line under the calendar read "${read}"` }
  })
  await step('D4 ONE Undo puts every man back', async () => {
    await page.click('#undoBtn')
    const d = await datesOf(page, 'hw-g1')
    return { ok: d === 'Oct 20>', detail: d }
  })
  await step('D5 people first, then dates: a fourth man added and new days picked — four records, one input, the new days', async () => {
    await M.click(); await win(page).waitFor()
    await page.locator('#inpEditPop .pp-pucks button[aria-pressed="false"]').first().click()
    await dayBtn(page, '2026-10-21').click(); await dayBtn(page, '2026-10-22').click()
    await page.click('#inpEditSave'); await win(page).waitFor({ state: 'detached' })
    const r = await recs(page, 'hw-g1'), d = await datesOf(page, 'hw-g1')
    return { ok: r.length === 4 && d === 'Oct 21>Oct 22' && await bar(page, /\+3 · Meeting/).count() === 1, detail: `${r.length} records, ${d}` }
  })
  await step('D6 dates first, then a man taken off: ONE tap is a one-day input; three records on it, his gone', async () => {
    await bar(page, /\+3 · Meeting/).click(); await win(page).waitFor()
    await dayBtn(page, '2026-10-26').click()
    await page.locator('#inpEditPop .pp-pucks button[aria-pressed="true"]').last().click()
    await page.click('#inpEditSave'); await win(page).waitFor({ state: 'detached' })
    const r = await recs(page, 'hw-g1'), d = await datesOf(page, 'hw-g1')
    await shot(page, 'd6-one-day-three-men')
    return { ok: r.length === 3 && d === 'Oct 26>', detail: `${r.length} records, ${d}` }
  })
  await step('D7 a new start picked and nothing saved: a press on another bar ASKS first; Cancel then leaves the input as it was', async () => {
    await bar(page, /\+2 · Meeting/).click(); await win(page).waitFor()
    await dayBtn(page, '2026-10-29').click()
    const other = page.locator('[data-testid="ib-bar-hw-solo"]').first()
    const b = await other.boundingBox()
    await page.mouse.click(b.x + 10, b.y + b.height / 2)
    const asked = await page.locator('[data-testid="inped-swap"]').isVisible().catch(() => false)
    await shot(page, 'd7-asks-before-swapping')
    if (asked) await page.locator('[data-testid="inped-swap-stay"]').click()
    await page.click('#inpEditCancel')
    const d = await datesOf(page, 'hw-g1')
    return { ok: asked && d === 'Oct 26>', detail: `asked: ${asked}; saved dates ${d}` }
  })
  await step('D8 the bar dragged behind the open window: the calendar in the window follows, and Save keeps the dragged days', async () => {
    await bar(page, /\+2 · Meeting/).click(); await win(page).waitFor()
    await page.fill('#inpEditRmk', 'typed in the window')
    const wb = await win(page).locator('.win-bar').boundingBox()
    await page.mouse.move(wb.x + 80, wb.y + 12); await page.mouse.down(); await page.mouse.move(1150, 60, { steps: 8 }); await page.mouse.up()
    const b = await bar(page, /\+2 · Meeting/).boundingBox(), y = b.y + b.height / 2
    const xOf = async iso => { const r = await page.locator(`#inpCal [data-icday="${iso}"]`).boundingBox(); return r.x + r.width / 2 }
    await page.mouse.move(await xOf('2026-10-26'), y); await page.mouse.down()
    await page.mouse.move(await xOf('2026-10-27'), y + 4, { steps: 4 }); await page.mouse.move(await xOf('2026-10-28'), y + 6, { steps: 4 }); await page.mouse.up()
    await page.waitForTimeout(300)
    const moved = await datesOf(page, 'hw-g1')
    const lit = /\bs\b/.test(await dayBtn(page, '2026-10-28').getAttribute('class') || '')
    await shot(page, 'd8-dragged-behind-window-follows')
    await page.click('#inpEditSave'); await win(page).waitFor({ state: 'detached' })
    const r = await recs(page, 'hw-g1')
    return { ok: moved === 'Oct 28>' && lit && r.every(x => x.date === 'Oct 28' && x.remarks === 'typed in the window'), detail: `after the drag ${moved}; the window's calendar on the 28th: ${lit}; saved ${await datesOf(page, 'hw-g1')}, remark "${r[0].remarks}"` }
  })
  await step('D9 OIL: a shared duty stretched from a Friday onto the Saturday — asked ONCE, the answer on both records', async () => {
    await fileShared(page, 'hw-g2', crew.slice(8, 10), { type: 'Duty', date: 'Oct 16', allday: true, s: 0, e: 1439, remarks: 'gate duty' })
    await bar(page, /\+1 · Duty/).click(); await win(page).waitFor()
    await dayBtn(page, '2026-10-16').click(); await dayBtn(page, '2026-10-17').click()
    await page.click('#inpEditSave')
    const sheets = await page.locator('[data-testid="oilconf"]').count()
    const before = await datesOf(page, 'hw-g2')
    await shot(page, 'd9-oil-asked-once')
    await page.locator('[data-testid="oil-yes"]').first().click(); await page.locator('[data-testid="oilconf-save"]').click()
    await page.waitForTimeout(200)
    const r = await recs(page, 'hw-g2')
    return { ok: sheets === 1 && before === 'Oct 16>' && r.length === 2 && r.every(x => x.end === 'Oct 17' && x.oil && x.oil['2026-10-17'] === 1), detail: `${sheets} sheet; nothing written before the answer (${before}); after: ${JSON.stringify(r.map(x => [x.end, x.oil]))}` }
  })
  await step('D10 a refusal for ONE man refuses the whole change, in words that name him, and the window stays', async () => {
    const [a, b] = crew.slice(11, 13)
    await fileShared(page, 'hw-g3', [a, b], { type: 'LL', date: 'Oct 5', endDate: 'Oct 6', allday: true, s: 0, e: 1439, remarks: 'till 6 Oct' })
    await page.evaluate(a => window.fileInput({ iid: 'hw-ll', person: a, type: 'LL', date: 'Oct 8', yr: 2026, allday: true, s: 0, e: 1439 }), a)
    await bar(page, /\+1 · LL/).click(); await win(page).waitFor()
    await dayBtn(page, '2026-10-05').click(); await dayBtn(page, '2026-10-08').click()
    await page.click('#inpEditSave'); await page.waitForTimeout(300)
    const still = await win(page).count() === 1, d = await datesOf(page, 'hw-g3'), t = await toasts(page)
    await shot(page, 'd10-one-mans-refusal')
    await closeWin(page)
    return { ok: still && d === 'Oct 5>Oct 6' && /nothing was saved/i.test(t), detail: `window stays: ${still}; saved dates ${d}; said: "${t.slice(0, 160)}"` }
  })
  await step('D11 the SANS calendar: a commitment an admin filed for two SANS people — opened from its day, calendar in the window, new days for both', async () => {
    const sans = await page.evaluate(() => Object.keys(window.PEOPLE).filter(id => window.PEOPLE[id].san && !window.PEOPLE[id].archived && !window.PEOPLE[id].deleted && !window.PEOPLE[id].special))
    await fileShared(page, 'hw-g4', sans.slice(0, 2), { type: 'SANS Availability', date: 'Oct 21', allday: true, s: 0, e: 1439, sans: { f: true } })
    await page.click('#inSansMode'); await month(page, 2026, 10, true)
    await page.locator('[data-testid="sc-day-2026-10-21"]').click()
    const dw = page.locator('[data-testid="win-sansday"]'); await dw.waitFor()
    await dw.locator('[data-testid="sd-open"]').first().click(); await win(page).waitFor()
    const there = await cal(page).isVisible()
    const hint = await page.locator('#inpEditPop .inped-hint').innerText()
    await shot(page, 'd11-sans-window')
    if (!there) return { ok: false, detail: 'no calendar in the SANS commitment’s window' }
    await dayBtn(page, '2026-10-21').click(); await dayBtn(page, '2026-10-22').click()
    await page.click('#inpEditSave'); await page.waitForTimeout(300)
    const d = await datesOf(page, 'hw-g4')
    await shot(page, 'd11-sans-after-save')
    return { ok: d === 'Oct 21>Oct 22' && !/delete it and add it again/i.test(hint), detail: `saved ${d}; the words under the form: "${hint}"` }
  })
  /* ---- what the two code reads found (9 Oct 26), each fixed and driven here: a PASS is the fixed behaviour */
  await page.click('#inMemberMode')
  if (await page.locator('[data-testid="win-sansday"]').count()) await page.keyboard.press('Escape')
  await step('D12 another shared input, in December, opened WITHOUT closing the October one: the calendar in the window shows December', async () => {
    await fileShared(page, 'hw-g5', crew.slice(14, 16), { type: 'Meeting', date: 'Dec 10', allday: false, s: 600, e: 660, remarks: 'december brief' })
    await month(page, 2026, 10)
    await bar(page, /\+2 · Meeting/).click(); await win(page).waitFor()
    await page.click('#icNext'); await page.click('#icNext')
    await bar(page, /\+1 · Meeting/).click(); await page.waitForTimeout(300)
    const mon = (await cal(page).locator('.rc-mon').innerText()).trim()
    const lit = await dayBtn(page, '2026-12-10').count() ? /\bs\b/.test(await dayBtn(page, '2026-12-10').getAttribute('class')) : false
    await shot(page, 'd12-december-opened-over-october'); await closeWin(page)
    return { ok: /dec/i.test(mon) && lit, detail: `the calendar reads "${mon}"; the 10th lit: ${lit}` }
  })
  await step('D13 a remark that says "till 4 Nov": a man added AND new days in one Save — still ONE bar, every remark saying the new last day', async () => {
    await fileShared(page, 'hw-g6', crew.slice(16, 18), { type: 'Meeting', date: 'Nov 3', endDate: 'Nov 4', allday: false, s: 600, e: 660, remarks: 'brief till 4 Nov' })
    await month(page, 2026, 11)
    await bar(page, /\+1 · Meeting/).click(); await win(page).waitFor()
    await page.locator('#inpEditPop .pp-pucks button[aria-pressed="false"]').first().click()
    await dayBtn(page, '2026-11-10').click(); await dayBtn(page, '2026-11-11').click()
    const typed = await page.locator('#inpEditRmk').inputValue()
    await page.click('#inpEditSave'); await win(page).waitFor({ state: 'detached' })
    const r = await recs(page, 'hw-g6'), bars = await bar(page, /\+2 · Meeting/).count()
    await shot(page, 'd13-one-bar-one-remark')
    return { ok: r.length === 3 && r.every(x => x.remarks === 'brief till 11 Nov' && x.date === 'Nov 10' && x.end === 'Nov 11') && bars === 1 && typed === 'brief till 4 Nov', detail: `${r.length} records; remarks ${[...new Set(r.map(x => x.remarks))].join(' / ')}; ${bars} bar; the remark box was left as typed while picking: ${typed === 'brief till 4 Nov'}` }
  })
  await step('D14 OIL (D682): a Saturday duty for two, one man holding his own No; the filer adds a third and answers Yes — the Yes is on ALL three', async () => {
    const [a, b] = crew.slice(18, 20)
    await page.evaluate(([a, b]) => {
      const row = { type: 'Duty', date: 'Nov 14', yr: 2026, allday: true, s: 0, e: 1439, remarks: 'sat duty', grp: 'hw-g7', grpBy: 'stiff', by: 'stiff', at: '2026-09-01T08:00:00.000Z' }
      window.fileInput({ ...row, iid: 'hw-g7-0', person: a, oil: { '2026-11-14': 1 } })
      window.fileInput({ ...row, iid: 'hw-g7-1', person: b, oil: { '2026-11-14': 0 } })
    }, [a, b])
    await bar(page, /\+1 · Duty/).click(); await win(page).waitFor()
    await page.locator('#inpEditPop .pp-pucks button[aria-pressed="false"]').first().click()
    await page.click('#inpEditSave')
    const sheets = await page.locator('[data-testid="oilconf"]').count()
    const title = sheets ? await page.locator('[data-testid="oilconf"] .airpop-head b').innerText() : ''
    await shot(page, 'd14-oil-asked-for-all')
    await page.locator('[data-testid="oil-yes"]').click(); await page.locator('[data-testid="oilconf-save"]').click()
    await page.waitForTimeout(200)
    const r = await recs(page, 'hw-g7')
    return { ok: sheets === 1 && r.length === 3 && r.every(x => x.oil && x.oil['2026-11-14'] === 1), detail: `${sheets} sheet, headed "${title}"; the three records: ${JSON.stringify(r.map(x => x.oil))}` }
  })
  await ctx.close()
}

/* ------------------------------------------------------------------ a desktop, the member Ranger */
{
  const { ctx, page } = await open({ width: 1440, height: 900 }, 'us', 'us')
  await page.selectOption('#inFPerson', 'all').catch(() => {})
  await step('M1 the demo’s meeting for four, which Ranger did not file: no calendar in its window, and nothing sends him elsewhere for the dates', async () => {
    await month(page, 2026, 7)
    await bar(page, /\+3 · Meeting/).click(); await win(page).waitFor()
    const none = await cal(page).count() === 0
    const text = await win(page).innerText()
    await shot(page, 'm1-member-reads-it')
    await closeWin(page)
    return { ok: none && !/dates are changed/i.test(text), detail: `no calendar: ${none}; "Take me out" offered: ${/Take me out/.test(text)}` }
  })
  await step('M2 a meeting Ranger files for himself and another man is HIS to re-date: calendar in its window, both men on the new days', async () => {
    await month(page, 2026, 10)
    const had = await page.evaluate(() => window.INPUTS.map(r => r.iid))
    await page.locator('#inpCal [data-icday="2026-10-21"]').click({ position: { x: 8, y: 8 } })
    await page.click('#icPopAdd'); await win(page).waitFor()
    await page.selectOption('#inpEditType', 'Meeting')
    await page.locator('#inpEditPop [data-testid="pp-several"]').click()
    const other = await page.evaluate(() => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === 'Saber'))
    await page.locator(`#inpEditPop [data-pp="${other}"]`).click()
    await page.fill('#inpEditRmk', 'flight meeting'); await page.click('#inpEditSave'); await win(page).waitFor({ state: 'detached' })
    if (await page.locator('[data-testid="win-inputsday"]').count()) await page.keyboard.press('Escape')
    await bar(page, /\+1 · Meeting/).click(); await win(page).waitFor()
    const there = await cal(page).isVisible()
    if (!there) return { ok: false, detail: 'no calendar for the member who filed it' }
    await dayBtn(page, '2026-10-28').click(); await dayBtn(page, '2026-10-29').click()
    await shot(page, 'm2-member-filer-picks')
    await page.click('#inpEditSave'); await win(page).waitFor({ state: 'detached' })
    const made = await page.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => r.date + '>' + (r.endDate || '')), had)
    return { ok: made.length === 2 && made.every(x => x === 'Oct 28>Oct 29'), detail: made.join(' | ') }
  })
  await ctx.close()
}

/* ------------------------------------------------------------------ a phone, upright, short, and on its side */
for (const [name, vp] of [['upright 390x844', { width: 390, height: 844 }], ['short 390x568', { width: 390, height: 568 }], ['on its side 844x390', { width: 844, height: 390 }]]) {
  const { ctx, page } = await open(vp, 'ad', 'a', true)
  await step(`P a phone ${name}: the window is whole on the screen, a finger picks two days, Save is reached under the calendar and saves`, async () => {
    await month(page, 2026, 10)
    const crew = await crewOf(page)
    await fileShared(page, 'hw-p', crew.slice(0, 3), { type: 'Meeting', date: 'Oct 20', allday: false, s: 600, e: 660, remarks: 'range brief' })
    await bar(page, /\+2/).first().tap(); await win(page).waitFor(); await page.waitForTimeout(450)
    const tag = name.split(' ')[0]
    await shot(page, `p-${tag}-1-opened`)
    await cal(page).scrollIntoViewIfNeeded()
    const c = await cal(page).boundingBox(), w = await win(page).boundingBox()
    await dayBtn(page, '2026-10-27').tap(); await dayBtn(page, '2026-10-28').tap()
    await shot(page, `p-${tag}-2-picked`)
    const save = page.locator('#inpEditSave'); await save.scrollIntoViewIfNeeded()
    const lands = await page.evaluate(() => { const e = document.getElementById('inpEditSave'), r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { on: r.top >= 0 && r.bottom <= innerHeight, hit: !!h && (h === e || e.contains(h)), side: document.documentElement.scrollWidth <= innerWidth } })
    await shot(page, `p-${tag}-3-save-reached`)
    await save.tap(); await page.waitForTimeout(300)
    const d = await datesOf(page, 'hw-p')
    const whole = w.x >= 0 && w.y >= 0 && w.x + w.width <= vp.width + 1 && w.y + w.height <= vp.height + 1
    const fits = c.x >= 0 && c.x + c.width <= vp.width + 1
    return { ok: whole && fits && lands.on && lands.hit && lands.side && d === 'Oct 27>Oct 28', detail: `window whole: ${whole}; calendar inside the width: ${fits}; Save on screen ${lands.on}, nothing over it ${lands.hit}, no sideways scroll ${lands.side}; saved ${d}` }
  })
  await ctx.close()
}

await browser.close()
console.log(bad ? `\n${bad} of ${n} FAILED` : `\nall ${n} passed`)
process.exit(bad ? 1 : 0)
