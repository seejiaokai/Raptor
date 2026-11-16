// phone1: W6 — a finger on the count, 402x874 touch; run with ENGINE=webkit|chromium. v1
import { launch, go, pic, cropPic, say, rec, state, errors, bringIn } from './wlib.mjs'
const ENGINE = process.env.ENGINE || 'chromium'
say('phone1 v1', ENGINE)
const { browser, page } = await launch(ENGINE, true, true)
const T = ENGINE === 'webkit' ? 'wk' : 'cr'
async function scenario(id, fn) {
  if (process.env.ONLY && !id.includes(process.env.ONLY)) return
  if (process.env.EXCLUDE && id.includes(process.env.EXCLUDE)) return
  try { await fn() } catch (e) { rec(id, false, 'SCRIPT ERROR ' + String(e.message).split('\n')[0]) } }
async function tapBox(loc) {
  await bringIn(loc)
  const b = await loc.boundingBox()
  const x = b.x + b.width / 2, y = b.y + b.height / 2
  await page.touchscreen.tap(x, y)
  return { x, y, b }
}
async function closeUp() {
  for (let i = 0; i < 3; i++) {
    const s = await state(page)
    if (!s.ava && !s.chg) break
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    const s2 = await state(page)
    if (s2.ava || s2.chg) { const x = page.locator('.availwin:not([hidden]) .win-x, .chgwin:not([hidden]) .win-x').first(); if (await x.count()) await x.click().catch(() => {}); await page.waitForTimeout(300) }
  }
  if ((await state(page)).arm) { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
}
async function fingerOnCount(id, loc, tag) {
  await closeUp()
  const before = await state(page)
  await bringIn(loc)
  const hit = await loc.evaluate(e => { const b = e.getBoundingClientRect(); const h = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return h === e || e.contains(h) ? 'count' : (h ? h.tagName + '.' + h.className : 'none') })
  // eslint-disable-next-line react-doctor/server-sequential-independent-await -- one browser driven step by step: each press waits for the page to answer the one before
  const { x, y } = await tapBox(loc)
  await pic(page, `w6-${T}-${tag}-tap-instant`)
  await page.waitForTimeout(600)
  const s = await state(page)
  await pic(page, `w6-${T}-${tag}-settled`)
  rec(id, s.ava && !s.arm, `[${ENGINE}] centre hits=${hit}; window opened=${s.ava}; armed=${s.arm} (before ${before.arm})`)
  return s
}
await go(page, 'editsched')
const D0 = '#eWeek .day[data-day="0"]'
await scenario(`W6 ${ENGINE} programme row`, () => fingerOnCount(`W6 ${ENGINE} programme row`, page.locator(`${D0} [data-fill="a:0.0.+"] .oilcount`).first(), 'prog'))
await scenario(`W6 ${ENGINE} sim seat`, () => fingerOnCount(`W6 ${ENGINE} sim seat`, page.locator(`${D0} [data-fill="s:0.amt.0.+"] .oilcount`).first(), 'sim'))
await scenario(`W6 ${ENGINE} ground row`, () => fingerOnCount(`W6 ${ENGINE} ground row`, page.locator(`${D0} [data-fill="g:0.0.+"] .oilcount`).first(), 'ground'))
// the puck beside still arms / selects
await scenario(`W6 ${ENGINE} the puck beside the count`, async () => {
  await closeUp()
  const puck = page.locator(`${D0} [data-fill="a:0.0.+"] .puck.allavail`).first()
  const s0 = await state(page)
  await tapBox(puck); await page.waitForTimeout(500)
  const s1 = await state(page)
  await pic(page, `w6-${T}-puck-beside`)
  const sel = await page.evaluate(() => JSON.stringify({ arm: window.ARM && window.ARM.key, sel: window.SEL || window.SELPUCK || null }))
  rec(`W6 ${ENGINE} the puck beside the count`, !s1.ava, `window opened=${s1.ava} (should not); armed=${s1.arm}; ${sel}`)
  await closeUp()
})
// input's row (Jul 20 week) and duty
await scenario(`W6 ${ENGINE} an input's row`, async () => {
  await closeUp()
  await go(page, 'editsched')
  await page.evaluate(() => window.scrollTo(0, 0)); await page.touchscreen.tap(29, 67); await page.waitForTimeout(700)
  await page.locator('.dcal-d b', { hasText: /^25$/ }).first().click(); await page.waitForTimeout(1000)
  await fingerOnCount(`W6 ${ENGINE} an input's row`, page.locator('#eWeek .day[data-day="5"] .oilcount').first(), 'input')
})
// View-only
await scenario(`W6 ${ENGINE} View-only Sched`, async () => {
  await closeUp()
  await go(page, 'viewsched')
  await fingerOnCount(`W6 ${ENGINE} View-only Sched`, page.locator('#vWeek .oilcount').first(), 'viewonly')
})
// board
await scenario(`W6 ${ENGINE} the board`, async () => {
  await closeUp()
  await go(page, 'editsched')
  const open = page.locator(`${D0} .dt.sb-open`)
  await tapBox(open); await page.waitForTimeout(800)
  const sb = await state(page)
  await pic(page, `w6-${T}-board-open`)
  if (!sb.board) { rec(`W6 ${ENGINE} the board`, false, 'NOT WALKED: board did not open by tap'); return }
  await fingerOnCount(`W6 ${ENGINE} the board`, page.locator('#schedBoard .oilcount').first(), 'board')
  await closeUp()
  const done = page.locator('#sbDone'); if (await done.count()) await tapBox(done)
})
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
