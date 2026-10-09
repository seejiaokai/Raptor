// THE MOCK-UP MAKER for [INPUT-LIST-AS-DAY-CARD] (owner D718, 9 Oct 26 — "the agreed layout can be used for the input list
// view too … the edit and cross is not needed … show me a mock up like for e.g the 'event' tag is with the pill design
// … I want to standardise how they look"). It drives the BUILT app on a phone, files three inputs through the app's own
// "+ Input" (a titled Event for ALL AVAIL, an untitled Duty and a titled Meeting for Ranger), pictures the opened day,
// the Inputs list and the schedule's row AS THEY ARE, then re-arranges the same real elements in the page to draw ONE
// look for the kind two ways — A, the kind as the list's pill; B, the kind in small grey capitals — and the list drawn
// with the day's own cards. Every card, pill and letter is the app's own. A DRAWING: nothing here is built.
//
//   node scripts/handpass/mk-list-as-day.mjs <out dir>          (the built bundle on :4180)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const OUT = process.argv[2] || 'docs/mock/img/input-list-as-day-card'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const ISO = '2026-07-18'
const DAY = '[data-testid="win-inputsday"]'

async function world() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  const ranger = await page.evaluate(() => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === 'Ranger'))
  await page.evaluate(() => window.go('inputs'))
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) break
    await page.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  const file = async (type, who, from, to, title, rmk) => {
    if (!(await page.locator(DAY).count())) await page.locator(`#inpCal [data-icday="${ISO}"]`).tap({ position: { x: 8, y: 8 } })
    await page.locator('#icPopAdd').tap(); await page.locator('[data-testid="win-inputedit"]').waitFor()
    await page.selectOption('#inpEditType', type); await page.selectOption('#inpEditPerson', who)
    await page.fill('#inpEditStart', from).catch(() => {}); await page.fill('#inpEditEnd', to).catch(() => {})
    if (title) await page.fill('#inpEditOwnTitle', title)
    if (rmk) await page.fill('#inpEditRmk', rmk)
    await page.locator('#inpEditSave').tap()
    const sheet = page.locator('[data-testid="oilconf"]')
    if (await sheet.waitFor({ timeout: 2500 }).then(() => true, () => false)) { await sheet.locator('[data-testid="oil-yes"]').tap(); await sheet.locator('[data-testid="oilconf-save"]').tap() }
    await page.waitForTimeout(400)
  }
  await file('Event', 'allavail', '06:00', '18:00', 'Sports day', 'bring boots')
  await file('Duty', ranger, '13:00', '15:00', '', '')
  await file('Meeting', ranger, '16:00', '17:00', 'Open house', '')
  if (!(await page.locator(DAY).count())) await page.locator(`#inpCal [data-icday="${ISO}"]`).tap({ position: { x: 8, y: 8 } })
  await page.locator(`${DAY} [data-testid^="idy-row-"]`).first().waitFor(); await page.waitForTimeout(300)
  return { ctx, page }
}
const top = async (page, sel, name, h) => { const b = await page.locator(sel).first().boundingBox(); await page.screenshot({ path: join(OUT, name + '.png'), clip: { x: b.x, y: b.y, width: b.width, height: Math.min(h, b.height) } }) }
/* THE KIND AS A PILL on the day's cards: the List's own pill (`.intag`) after the name, on every card — a titled card
   keeps its title before it, and loses the small grey word from its small-print line */
const pills = page => page.evaluate(() => {
  for (const c of document.querySelectorAll('[data-testid="win-inputsday"] [data-testid^="idy-row-"]')) {
    const name = c.querySelector('.idy-kind'), tag = c.querySelector('.sd-kindtag')
    const pill = document.createElement('span'); pill.className = 'intag'
    pill.style.cssText = 'margin-left:6px;white-space:nowrap;flex:0 0 auto;font-size:9px;padding:1px 7px'
    if (tag) { pill.textContent = tag.textContent; tag.remove(); name.after(pill) }
    else { pill.textContent = name.textContent; name.replaceWith(pill); pill.style.marginLeft = '0' }
  }
})
/* THE LIST DRAWN WITH THE DAY'S OWN CARDS: the same cards, each with its date before its hours; no pencil, no cross */
const listAsCards = async (page, withPills) => {
  if (withPills) await pills(page)
  const html = await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] [data-testid^="idy-row-"]')].map(c => {
    const k = c.cloneNode(true); const h = k.querySelector('.sd-hours'); if (h) h.textContent = '18 Jul · ' + h.textContent
    k.removeAttribute('data-testid'); return k.outerHTML
  }).join(''))
  const css = await page.evaluate(() => { const l = document.querySelector('[data-testid="win-inputsday"] .sd-list'); const c = getComputedStyle(l); return { display: c.display, gap: c.gap, flexDirection: c.flexDirection, cls: l.className, wcls: document.querySelector('[data-testid="win-inputsday"]').className } })
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  await page.locator('#inListBtn').tap()
  if (!(await page.locator('#inRangePop').count())) await page.locator('#inRangeBtn').tap()
  await page.locator('#inRangeAll').tap(); await page.waitForTimeout(300)
  await page.evaluate(({ html, css }) => {
    const tbl = document.querySelector('#intbl')
    const box = document.createElement('div'); box.id = 'mockList'
    /* the day's own classes, so its cards are styled by the app's own rules; laid in the page, not as a window */
    box.className = css.wcls.replace(/\bfloatwin\b|\bfront\b|\bis-tall\b|\brests\b/g, '').trim()
    box.style.cssText = 'position:static;width:auto;height:auto;max-height:none;border:0;box-shadow:none;background:transparent;transform:none;inset:auto;padding:0 2px'
    const list = document.createElement('div'); list.className = css.cls
    list.style.cssText = `display:${css.display};flex-direction:${css.flexDirection};gap:${css.gap};padding:0;overflow:visible;max-height:none`
    list.innerHTML = html + html.replace(/18 Jul/g, '19 Jul')
    box.append(list); tbl.replaceWith(box)
    box.scrollIntoView({ block: 'start' }); window.scrollBy(0, -150)
  }, { html, css })
  await page.waitForTimeout(300)
}

/* 1 — AS BUILT: the opened day, the list */
{
  const { ctx, page } = await world()
  await top(page, DAY, 'a-day-as-built', 330)
  await page.keyboard.press('Escape')
  await page.locator('#inListBtn').tap()
  if (!(await page.locator('#inRangePop').count())) await page.locator('#inRangeBtn').tap()
  await page.locator('#inRangeAll').tap(); await page.waitForTimeout(300)
  await page.evaluate(() => { const t = [...document.querySelectorAll('#inBody [data-testid="in-title"]')].find(x => x.textContent === 'Sports day'); t.closest('tr').scrollIntoView({ block: 'start' }); window.scrollBy(0, -110) })
  await page.waitForTimeout(250)
  await page.screenshot({ path: join(OUT, 'b-list-as-built.png'), clip: { x: 0, y: 90, width: 390, height: 520 } })
  await ctx.close()
}
/* 2 — THE KIND AS A PILL, on the opened day */
{
  const { ctx, page } = await world()
  await pills(page); await page.waitForTimeout(150)
  await top(page, DAY, 'c-day-pill', 330)
  await ctx.close()
}
/* 3 — THE LIST WITH THE DAY'S CARDS: A (pill), B (small grey capitals) */
for (const [name, p] of [['d-list-cards-pill', true], ['e-list-cards-grey', false]]) {
  const { ctx, page } = await world()
  await listAsCards(page, p)
  await page.waitForTimeout(3200)   // the 'Input added' note has gone
  const b = await page.locator('#mockList').boundingBox()
  await page.screenshot({ path: join(OUT, name + '.png'), clip: { x: 0, y: Math.max(0, b.y - 8), width: 390, height: Math.min(470, b.height + 16) } })
  await ctx.close()
}
/* 4 — THE SCHEDULE'S ROW: as built (small grey capitals), and with the pill under the name */
{
  const { ctx, page } = await world()
  await page.keyboard.press('Escape')
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
  const shoot = async name => {
    await page.evaluate(() => {
      const r = [...document.querySelectorAll('#eWeek .pl-row.gr-frominput')].find(x => (x.querySelector(':scope > .nm .ntx')?.textContent || '').trim() === 'SPORTS DAY')
      const wk = document.querySelector('#eWeek'), day = r.closest('.day')
      wk.scrollLeft += day.getBoundingClientRect().left - wk.getBoundingClientRect().left - 6
      let box = r.parentElement
      for (let i = 0; i < 4 && box.parentElement && !/ground/i.test(box.textContent.slice(0, 60)); i++) box = box.parentElement
      box.id = 'mockBlock'; r.scrollIntoView({ block: 'center' })
    })
    await page.waitForTimeout(450)
    await page.locator('#mockBlock').screenshot({ path: join(OUT, name + '.png') })
  }
  await shoot('f-row-grey')
  await page.evaluate(() => {
    for (const t of document.querySelectorAll('#eWeek .pl-row .nm .nm-kind')) {
      const pill = document.createElement('span'); pill.className = 'intag'; pill.textContent = t.textContent
      pill.style.cssText = 'display:inline-block;margin-top:3px;white-space:nowrap;font-size:8px;padding:1px 6px'
      const wrap = document.createElement('span'); wrap.style.display = 'block'; wrap.append(pill); t.replaceWith(wrap)
    }
  })
  await shoot('g-row-pill')
  await ctx.close()
}
await browser.close()
console.log('done')
