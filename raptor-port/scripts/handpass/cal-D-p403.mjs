import { chromium, launchOptions, world, shot, tid, cell, backToSans, readDate, readDayWin, fileCommit, setNeed, press, lwWorking, saveRes } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const ISO = '2026-07-27'
const plan = [['vinci', { f: true }], ['yeti', { o: true }], ['romeo', { o: true, a: true }], ['ipman', { a: true }], ['cards', { f: true }], ['wrangler', { f: true, o: true }], ['badger', { f: true, a: true }], ['waldo', { o: true }], ['nick', { a: true }], ['bullet', { a: true, o: true }]]
for (const size of ['desk', 'phone']) {
  const { ctx, page, errors } = await world(browser, size)
  // still needed P 2 / W 5 once F P 1 / W 3 are committed => required = avail + need + F
  const g = await page.evaluate(i => window.lwDayFacts(i), ISO)
  const { typeReq } = await import('./cal-D-lib.mjs')
  await typeReq(page, size, 'req-p', ISO, g.availP + 2 + 1); await page.keyboard.press('Escape').catch(() => {})
  await typeReq(page, size, 'req-w', ISO, g.availW + 5 + 3); await page.keyboard.press('Escape').catch(() => {})
  console.log(size, 'avail', g.availP, g.availW)
  await backToSans(page, size)
  await press(size, cell(page, ISO), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor()
  for (const [id, letters] of plan) {
    await fileCommit(page, size, id, letters); await page.click('#inpEditSave'); await page.waitForTimeout(350)
  }
  const d = await readDate(page, ISO); console.log(size, 'date', JSON.stringify(d))
  const w = await readDayWin(page); console.log(size, 'work', w.work)
  // geometry: pilots left of WSOs in the date cell and in the day's working
  const geo = await page.evaluate(i => {
    const c = document.querySelector(`[data-testid="sc-need-${i}"]`); const kids = [...c.children].map(e => ({ t: e.innerText, x: Math.round(e.getBoundingClientRect().left) }))
    const f = document.querySelector(`[data-testid="sc-f-${i}"]`); const fk = [...f.children].map(e => ({ t: e.innerText, x: Math.round(e.getBoundingClientRect().left) }))
    const o = document.querySelector(`[data-testid="sc-o-${i}"]`); const ok = [...o.children].map(e => ({ t: e.innerText, x: Math.round(e.getBoundingClientRect().left) }))
    const a = document.querySelector(`[data-testid="sc-a-${i}"]`); const ak = [...a.children].map(e => ({ t: e.innerText, x: Math.round(e.getBoundingClientRect().left) }))
    const hd = [...document.querySelectorAll('[data-testid="win-sansday"] [data-testid="sd-work"] *')].filter(e => /^(PILOTS|WSOS)$/i.test(e.textContent.trim()) && e.children.length === 0).map(e => ({ t: e.textContent.trim(), x: Math.round(e.getBoundingClientRect().left) }))
    return { need: kids, f: fk, o: ok, a: ak, hd }
  }, ISO)
  console.log(size, 'geo', JSON.stringify(geo))
  await shot(page, `p403-${size}-day`)
  await tid(page, 'win-sansday-x').click().catch(() => {})
  await page.waitForTimeout(300)
  await shot(page, `p403-${size}-month`)
  // the Leave War's working for the same date (read-only, a tap on the Available P row, then the Required P row)
  const wp = await lwWorking(page, size, 'avail-p', ISO); console.log(size, 'LW working (avail P tap):', wp)
  await shot(page, `p403-${size}-lw`)
  console.log(size, 'flyAnswer', JSON.stringify(await page.evaluate(i => window.flyAnswer(i), ISO)))
  console.log(size, 'errors', errors.join('|'))
  await ctx.close()
}
await browser.close()
