import { chromium, launchOptions, world, shot, tid, cell, backToSans, readDayWin, fillBusy, noLongerSans, press, isTouch, saveRes, SANSMEN } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const ISO = '2026-07-22'
const plan = [['vinci', { f: true }], ['yeti', { f: true, o: true }], ['romeo', { o: true }], ['ipman', { a: true }], ['krait', { f: true }], ['cards', { f: true }], ['wrangler', { o: true }], ['badger', { a: true }], ['waldo', { f: true, a: true }], ['nick', { o: true, a: true }], ['bullet', { f: true }]]
for (const size of ['phone', 'short', 'side', 'desk']) {
  const { ctx, page, errors } = await world(browser, size)
  await backToSans(page, size)
  await fillBusy(page, size, ISO, plan)
  await noLongerSans(page, 'bullet')               // his entry is now an uncounted one
  await backToSans(page, size)
  await press(size, cell(page, ISO), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor(); await page.waitForTimeout(500)
  const win = tid(page, 'win-sansday')
  const r = await readDayWin(page)
  console.log(size, 'groups', JSON.stringify(r.groups), 'rows', r.rows.length)
  const txt = await win.innerText()
  console.log(size, '+more?', /\+\s*\d+\s*more|more\.\.\./i.test(txt))
  await shot(page, `p402-${size}-open`)
  const geo = async () => page.evaluate(() => {
    const w = document.querySelector('[data-testid="win-sansday"]'), l = w.querySelector('[data-testid="sd-list"]'), a = w.querySelector('[data-testid="sd-add"]'), x = w.querySelector('[data-testid="sd-work"]')
    const bb = e => { const r = e.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right) } }
    return { win: bb(w), list: bb(l), add: bb(a), work: bb(x), sh: l.scrollHeight, ch: l.clientHeight, st: l.scrollTop, vh: innerHeight, vw: innerWidth }
  })
  const g0 = await geo(); console.log(size, 'before scroll', JSON.stringify(g0))
  // scroll to the last person
  await page.evaluate(() => { const l = document.querySelector('[data-testid="win-sansday"] [data-testid="sd-list"]'); l.scrollTop = l.scrollHeight })
  await page.waitForTimeout(250)
  const g1 = await geo(); console.log(size, 'after scroll', JSON.stringify(g1))
  const last = await page.evaluate(() => { const rows = [...document.querySelectorAll('[data-testid="win-sansday"] [data-testid^="sd-row-"]')]; const e = rows[rows.length - 1]; const r = e.getBoundingClientRect(); const l = document.querySelector('[data-testid="win-sansday"] [data-testid="sd-list"]').getBoundingClientRect(); return { n: rows.length, txt: e.innerText.replace(/\s+/g, ' '), top: Math.round(r.top), bottom: Math.round(r.bottom), listTop: Math.round(l.top), listBottom: Math.round(l.bottom), vh: innerHeight } })
  console.log(size, 'last row', JSON.stringify(last))
  await shot(page, `p402-${size}-scrolled`)
  // open that last entry
  const rows = win.locator('[data-testid^="sd-row-"]'); const n = await rows.count()
  await press(size, rows.nth(n - 1).locator('[data-testid="sd-open"]'))
  await page.waitForTimeout(500)
  console.log(size, 'editor visible', await page.locator('#inpEditSave').isVisible().catch(() => false), 'day window still', await win.count())
  await shot(page, `p402-${size}-editor`)
  if (await page.locator('#inpEditCancel').isVisible().catch(() => false)) await press(size, page.locator('#inpEditCancel'))
  await page.waitForTimeout(300)
  if (isTouch(size)) {
    await press(size, win.locator('.win-ttl')); await page.waitForTimeout(450)
    const gt = await geo(); console.log(size, 'tall', JSON.stringify(gt), await win.getAttribute('class'))
    await page.evaluate(() => { const l = document.querySelector('[data-testid="win-sansday"] [data-testid="sd-list"]'); l.scrollTop = l.scrollHeight }); await page.waitForTimeout(200)
    await shot(page, `p402-${size}-tall-scrolled`)
    await press(size, win.locator('.win-ttl')); await page.waitForTimeout(450)
    console.log(size, 'back down', await win.getAttribute('class'), JSON.stringify(await geo()))
  }
  console.log(size, 'errors', errors.join('|'))
  await ctx.close()
}
await browser.close()
