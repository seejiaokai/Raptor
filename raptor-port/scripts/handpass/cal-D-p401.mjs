import { chromium, launchOptions, world, shot, tid, cell, typeReq, backToSans, readDate, readDayWin, fileCommit, press, drag, centre, row, saveRes, RES } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const log = []
const L = (...a) => { const s = a.join(' '); log.push(s); console.log(s) }

async function setup(page, man, drag5 = false) {
  const f = await page.evaluate(() => window.lwDayFacts('2026-07-20'))
  const days = drag5 ? ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24'] : ['2026-07-20']
  for (const d of days) {
    const g = await page.evaluate(i => window.lwDayFacts(i), d)
    await typeReq(page, 'desk', 'req-p', d, g.availP + 4); await page.keyboard.press('Escape')
    await typeReq(page, 'desk', 'req-w', d, g.availW + 3); await page.keyboard.press('Escape')
  }
  await backToSans(page, 'desk')
  if (!drag5) {
    await cell(page, '2026-07-20').click({ position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor()
    await fileCommit(page, 'desk', man, { f: true }); await page.click('#inpEditSave'); await page.waitForTimeout(500)
  } else {
    const a = await centre(cell(page, '2026-07-20')), b = await centre(cell(page, '2026-07-24'))
    await drag(page, 'desk', a, b)
    await page.waitForSelector('#inpEditSave', { state: 'visible' })
    await page.selectOption('#inpEditPerson', man)
    await page.locator('#inpEditSans').getByLabel('Fly', { exact: true }).check()
    await page.click('#inpEditSave'); await page.waitForTimeout(500)
  }
}
async function readers(page, tag, isos) {
  const out = {}
  await backToSans(page, 'desk')
  for (const iso of isos) {
    const d = await readDate(page, iso)
    await cell(page, iso).click({ position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor(); await page.waitForTimeout(250)
    const w = await readDayWin(page)
    out[iso] = { date: d, work: w.work, list: w.list }
    if (iso === isos[0]) await shot(page, `p401-${tag}-day`)
    await tid(page, 'win-sansday-x').click()
  }
  await tid(page, 'sc-hl').click(); await page.waitForTimeout(200)
  out.hl = await tid(page, 'sc-hl-menu').innerText().then(t => t.replace(/\s+/g, ' ')).catch(() => null)
  await shot(page, `p401-${tag}-hl`)
  await page.keyboard.press('Escape')
  out.lw = await page.evaluate(i => ({ f: window.lwDayFacts(i), a: window.flyAnswer(i) }), isos[0])
  L(tag, JSON.stringify(out))
  return out
}
// ---- A: make him non-SANS on Quals
{
  const { ctx, page, errors } = await world(browser, 'desk')
  await setup(page, 'vinci')
  const before = await readers(page, 'A0', ['2026-07-20'])
  await page.evaluate(() => window.go('quals')); await page.waitForTimeout(700)
  await page.click('#qEdit'); await page.waitForTimeout(300)
  const c = page.locator('[data-q="vinci|san"]'); await c.scrollIntoViewIfNeeded(); await c.click(); await page.waitForTimeout(200)
  await shot(page, 'p401-A1-quals')
  await page.click('#qSave'); await page.waitForTimeout(500)
  L('A san flag now', await page.evaluate(() => window.PEOPLE.vinci.san))
  const after = await readers(page, 'A2', ['2026-07-20'])
  L('A errors', errors.join(' | '))
  await ctx.close()
}
// ---- B: archive him on Admin -> Users
{
  const { ctx, page, errors } = await world(browser, 'desk')
  await setup(page, 'yeti')
  await readers(page, 'B0', ['2026-07-20'])
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(700)
  await page.locator('.acc-row:has([data-testid="dot-roster-yeti"])').click(); await page.waitForTimeout(300)
  await shot(page, 'p401-B1-admin')
  await page.click('#accEdArchive'); await page.waitForTimeout(600)
  L('B archived', await page.evaluate(() => !!window.PEOPLE.yeti.archived))
  await readers(page, 'B2', ['2026-07-20'])
  L('B errors', errors.join(' | '))
  await ctx.close()
}
// ---- C: a posting-out from the Leave War, effective Wed 22 Jul, over a 20-24 Jul commitment
{
  const { ctx, page, errors } = await world(browser, 'desk')
  await setup(page, 'romeo', true)
  await readers(page, 'C0', ['2026-07-21', '2026-07-22', '2026-07-24'])
  await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-slipway"]')
  await press('desk', tid(page, 'settings-open')); await page.waitForTimeout(300)
  const sh = page.getByText('Show SANS', { exact: false }).first()
  L('showsans btn', await sh.count(), await sh.innerText().catch(() => ''))
  await sh.click(); await page.waitForTimeout(300)
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  await shot(page, 'p401-C1-lw')
  const cc = tid(page, 'cell-romeo-2026-07-22')
  L('romeo cell', await cc.count())
  await cc.scrollIntoViewIfNeeded(); await cc.click(); await page.waitForTimeout(300)
  await tid(page, 'bid-postout').click(); await page.waitForTimeout(300)
  await shot(page, 'p401-C2-po')
  await tid(page, 'po-date').fill('2026-07-22'); await page.waitForTimeout(200)
  L('po-line', await tid(page, 'po-line').first().innerText().catch(() => ''))
  await tid(page, 'po-confirm').click(); await page.waitForTimeout(700)
  L('po err', (await tid(page, 'post-err').allInnerTexts()).join(' '))
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  await readers(page, 'C3', ['2026-07-21', '2026-07-22', '2026-07-24'])
  L('C errors', errors.join(' | '))
  await ctx.close()
}
await browser.close()
import { writeFileSync } from 'node:fs'
writeFileSync('C:/Users/User/AppData/Local/Temp/d-p401.log', log.join('\n'))
