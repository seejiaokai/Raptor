import { chromium, launchOptions, world, shot, tid, cell, backToSans, press } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
for (const size of ['short', 'side']) {
  const { ctx, page, errors } = await world(browser, size)
  await backToSans(page, size, 2026, 7)
  await press(size, tid(page, 'sc-gear')); await tid(page, 'win-sansset').waitFor(); await page.waitForTimeout(400)
  const info = () => page.evaluate(() => {
    const w = document.querySelector('[data-testid="win-sansset"]')
    const sv = document.querySelector('[data-testid="sset-save"]')
    const body = [...w.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(e).overflowY))[0]
    const r = sv.getBoundingClientRect()
    const hit = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2))
    return { win: [Math.round(w.getBoundingClientRect().top), Math.round(w.getBoundingClientRect().bottom)], bodyScrollable: !!body, bodyCls: body && body.className, st: body && body.scrollTop, sh: body && body.scrollHeight, ch: body && body.clientHeight, saveTop: Math.round(r.top), saveBottom: Math.round(r.bottom), vh: innerHeight, hitIsSave: !!(hit && sv.contains(hit)), pageScrollY: Math.round(scrollY) }
  })
  console.log(size, 'before', JSON.stringify(await info()))
  await shot(page, `gear-${size}-before`)
  // a finger/mouse wheel scroll over the window's body
  const w = await page.locator('[data-testid="win-sansset"]').boundingBox()
  await page.mouse.move(w.x + w.width / 2, w.y + w.height / 2); await page.mouse.wheel(0, 600); await page.waitForTimeout(500)
  console.log(size, 'after wheel', JSON.stringify(await info()))
  await shot(page, `gear-${size}-after`)
  // can the Save be tapped now?
  const before = await page.evaluate(() => window.VCONF.sansLead)
  await tid(page, 'sset-lead').fill('21').catch(() => {})
  await press(size, tid(page, 'sset-save')).catch(e => console.log(size, 'save press failed', String(e).slice(0, 120)))
  await page.waitForTimeout(400)
  console.log(size, 'window after Save', await tid(page, 'win-sansset').count(), 'lead', before, '->', await page.evaluate(() => window.VCONF.sansLead))
  console.log(size, 'errors', errors.join('|'))
  await ctx.close()
}
await browser.close()
