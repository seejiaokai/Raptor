// THE MOCK-UP MAKER for [INPUT-OWN-TITLE] (owner D715, 9 Oct 26 — "select the type of input and it gives the user the
// option to change the name of the input. Not only to event input, most of the inputs title"; D716 — the four answers,
// "As recommended"). It drives the BUILT app on a phone: files a Saturday Event for ALL AVAIL through the app's own
// "+ Input", pictures each place its name stands AS IT IS TODAY, then re-letters the same real elements in the page to
// draw the title — so every box, row, bar and letter is the app's own. A DRAWING: nothing here is built.
//
//   node scripts/handpass/mk-input-title.mjs <out dir> [probe]      (the built bundle on :4180)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const OUT = process.argv[2] || 'docs/mock/img/input-own-title'
const PROBE = process.argv[3] === 'probe'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const ISO = '2026-07-18', TITLE = 'Sports day'
const shot = (page, name, clip) => page.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) })

async function phone() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 760 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  return { ctx, page }
}
async function toMonth(page) {
  await page.evaluate(() => window.go('inputs'))
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) break
    await page.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
}
/* the app's own "+ Input" on the Saturday, up to the open window: the kind, the person, a remark */
async function openNew(page, type, who, remarks) {
  await toMonth(page)
  await page.locator(`#inpCal [data-icday="${ISO}"]`).tap({ position: { x: 8, y: 8 } })
  await page.locator('#icPopAdd').tap()
  await page.locator('[data-testid="win-inputedit"]').waitFor()
  await page.selectOption('#inpEditType', type)
  if (who) await page.selectOption('#inpEditPerson', who)
  if (remarks != null) await page.fill('#inpEditRmk', remarks)
  await page.waitForTimeout(250)
}
async function saveYes(page) {
  await page.locator('#inpEditSave').tap()
  const sheet = page.locator('[data-testid="oilconf"]')
  if (await sheet.waitFor({ timeout: 3000 }).then(() => true, () => false)) {
    await sheet.locator('[data-testid="oil-yes"]').tap(); await sheet.locator('[data-testid="oilconf-save"]').tap()
  }
  await page.waitForTimeout(400)
}
/* THE DRAWING of the window: a "Title" row, a copy of the app's own Remarks row, straight under Type */
const addTitle = (page, value, hint) => page.evaluate(({ value, hint }) => {
  const rmk = document.querySelector('#inpEditRmk').closest('.inped-f')
  const type = (document.querySelector('#inpEditType') || document.querySelector('#inpEditTypeFixed')).closest('.inped-f')
  const row = rmk.cloneNode(true)
  row.querySelector('.inped-k').textContent = 'Title'
  const box = row.querySelector('input'); box.id = 'mockTitle'; box.setAttribute('aria-label', 'Title'); box.value = value
  if (hint) { const s = document.createElement('span'); s.textContent = hint; s.style.cssText = 'grid-column:2;font-size:12px;color:var(--ink-3);margin-top:2px'; row.append(s) }
  type.after(row)
}, { value, hint })

if (PROBE) {
  const { ctx, page } = await phone()
  await openNew(page, 'Event', 'allavail', '')
  console.log('WINDOW ROWS', await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] .inped-f')].map(f => f.outerHTML.replace(/<option[\s\S]*?<\/option>/g, '').slice(0, 300)).join('\n---\n')))
  console.log('ROW CSS', await page.evaluate(() => { const c = getComputedStyle(document.querySelector('#inpEditRmk').closest('.inped-f')); return c.display + ' | ' + c.gridTemplateColumns + ' | ' + c.flexDirection }))
  await saveYes(page)
  const iid = await page.evaluate(() => { const r = window.INPUTS.filter(x => x.type === 'Event' && x.person === 'allavail').pop(); return r && r.iid })
  console.log('IID', iid)
  console.log('BAR', await page.evaluate(iid => [...document.querySelectorAll(`#inpCal .ib-bar[data-iid="${iid}"]`)].map(b => b.outerHTML).join('\n'), iid))
  if (!(await page.locator('[data-testid="win-inputsday"]').count())) await page.locator(`#inpCal [data-icday="${ISO}"]`).tap({ position: { x: 8, y: 8 } })
  await page.waitForTimeout(400)
  console.log('DAY CARD', await page.evaluate(iid => { const r = document.querySelector(`[data-testid="idy-row-${iid}"]`) || [...document.querySelectorAll('[data-testid^="idy-row-"]')].pop(); return r ? r.outerHTML.slice(0, 1800) : 'none' }, iid))
  await page.keyboard.press('Escape')
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(500)
  console.log('WEEK ROW', await page.evaluate(iid => { const c = document.querySelector(`#eWeek .oilcount[data-oilsent="i:${iid}"]`); const r = c && c.closest('.pl-row'); return r ? r.outerHTML.slice(0, 2500) : 'none' }, iid))
  await ctx.close(); await browser.close(); process.exit(0)
}
const el = (page, sel, name) => page.locator(sel).first().screenshot({ path: join(OUT, name + '.png') })
/* the top of a tall window only: the rest of an opened day with one input is empty */
const top = async (page, sel, name, h) => { const b = await page.locator(sel).first().boundingBox(); await page.screenshot({ path: join(OUT, name + '.png'), clip: { x: b.x, y: b.y, width: b.width, height: Math.min(h, b.height) } }) }
/* the right-hand end of a wide strip: a whole desktop week is too small to read on a phone */
const right = async (page, sel, name, w) => { const b = await page.locator(sel).first().boundingBox(); const x = Math.max(b.x, b.x + b.width - w); await page.screenshot({ path: join(OUT, name + '.png'), clip: { x, y: b.y, width: b.x + b.width - x, height: b.height } }) }
const WIN = '[data-testid="win-inputedit"]', DAY = '[data-testid="win-inputsday"]'
const iidOf = page => page.evaluate(() => { const r = window.INPUTS.filter(x => x.type === 'Event' && x.person === 'allavail').pop(); return r && r.iid })
/* the schedule's block that holds the input's row: the nearest box around it that names the Ground Programme */
const tagWeekBlock = (page, iid) => page.evaluate(iid => {
  const row = document.querySelector(`#eWeek .oilcount[data-oilsent="i:${iid}"]`).closest('.pl-row')
  row.id = 'mockRow'
  let box = row.parentElement
  for (let i = 0; i < 4 && box.parentElement && !/ground/i.test(box.textContent.slice(0, 60)); i++) box = box.parentElement
  box.id = 'mockBlock'; row.scrollIntoView({ block: 'center' })
  return box.getBoundingClientRect().height
}, iid)

/* 1 — THE WINDOW. Today: the kind is the name, and the name people want goes in the remarks */
{
  const { ctx, page } = await phone()
  await openNew(page, 'Event', 'allavail', TITLE)
  await el(page, WIN, 'a-window-today')
  /* the drawing, the moment the kind is chosen: the Title box filled in with the kind's name */
  await page.fill('#inpEditRmk', '')
  await addTitle(page, 'Event')
  await el(page, WIN, 'b-window-title-filled')
  /* …and typed over */
  await page.evaluate(t => { document.getElementById('mockTitle').value = t }, TITLE)
  await el(page, WIN, 'c-window-title-typed')
  await ctx.close()
}
/* 2 — THE OPENED DAY and THE SCHEDULE'S ROW, a phone: today, then with the title */
{
  const { ctx, page } = await phone()
  await openNew(page, 'Event', 'allavail', ''); await saveYes(page)
  const iid = await iidOf(page)
  if (!(await page.locator(DAY).count())) await page.locator(`#inpCal [data-icday="${ISO}"]`).tap({ position: { x: 8, y: 8 } })
  await page.locator(`[data-testid="idy-row-${iid}"]`).waitFor()
  await top(page, DAY, 'd-day-today', 262)
  await page.evaluate(({ iid, t }) => {
    const row = document.querySelector(`[data-testid="idy-row-${iid}"]`), kind = row.querySelector('.idy-kind')
    /* the title alone: on a phone's card the kind beside it cut the title to "Sports …" — there is no room for both */
    kind.textContent = t
  }, { iid, t: TITLE })
  await top(page, DAY, 'e-day-title', 262)
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
  console.log('the schedule block is', await tagWeekBlock(page, iid), 'px tall')
  await page.waitForTimeout(200)
  await el(page, '#mockBlock', 'f-row-today')
  await page.evaluate(t => { document.querySelector('#mockRow .nm .ntx').textContent = t.toUpperCase() }, TITLE)
  await el(page, '#mockBlock', 'g-row-title')
  await ctx.close()
}
/* 3 — THE MONTH, a desktop (a phone's bar has room for the person only): today, then with the title */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await toMonth(page)
  await page.locator(`#inpCal [data-icday="${ISO}"]`).click({ position: { x: 8, y: 8 } })
  await page.locator('#icPopAdd').click(); await page.locator(WIN).waitFor()
  await page.selectOption('#inpEditType', 'Event'); await page.selectOption('#inpEditPerson', 'allavail')
  await page.locator('#inpEditSave').click()
  const sheet = page.locator('[data-testid="oilconf"]'); await sheet.waitFor()
  await sheet.locator('[data-testid="oil-yes"]').click(); await sheet.locator('[data-testid="oilconf-save"]').click()
  await page.waitForTimeout(400)
  if (await page.locator(DAY).count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
  const iid = await iidOf(page)
  const said = await page.evaluate(iid => { const b = document.querySelector(`#inpCal .ib-bar[data-iid="${iid}"]`); b.parentElement.id = 'mockWeek'; return b.textContent }, iid)
  console.log('the month bar today reads:', JSON.stringify(said))
  await right(page, '#mockWeek', 'h-month-today', 560)
  await page.evaluate(({ iid, t }) => { const b = document.querySelector(`#inpCal .ib-bar[data-iid="${iid}"]`); b.textContent = b.textContent.replace(/Event/, t) }, { iid, t: TITLE })
  await right(page, '#mockWeek', 'i-month-title', 560)
  await ctx.close()
}
await browser.close()
