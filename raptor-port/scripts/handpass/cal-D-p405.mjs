import { chromium, launchOptions, world, shot, tid, cell, backToSans, readDate, readDayWin, setNeed, fileRun, press, drag, corner } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
for (const size of (process.argv[2] ? [process.argv[2]] : ['desk', 'phone'])) {
  const { ctx, page, errors } = await world(browser, size)
  for (const d of ['2026-07-27', '2026-07-28', '2026-07-29', '2026-07-30', '2026-07-31']) await setNeed(page, size, d, 3, 3)
  await backToSans(page, size)
  await fileRun(page, size, '2026-07-27', '2026-07-28', 'vinci', { f: true })
  await fileRun(page, size, '2026-07-29', '2026-07-29', 'vinci', { o: true, a: true })
  await fileRun(page, size, '2026-07-30', '2026-07-31', 'vinci', { f: true, a: true })
  await fileRun(page, size, '2026-07-27', '2026-07-27', 'yeti', { f: true })
  await fileRun(page, size, '2026-07-28', '2026-07-28', 'yeti', { o: true })
  const DAYS = ['2026-07-27', '2026-07-28', '2026-07-29', '2026-07-30', '2026-07-31', '2026-07-24']
  const snap = async () => page.evaluate(ds => ds.map(i => {
    const c = document.querySelector(`[data-icday="${i}"]`); if (!c) return null
    const q = id => { const e = document.querySelector(`[data-testid="${id}-${i}"]`); return e ? e.innerText.replace(/\s+/g, ' ') : null }
    const ul = id => { const e = document.querySelector(`[data-testid="${id}-${i}"]`); return e ? { cls: /is-mine/.test(e.className), td: getComputedStyle(e).textDecorationLine, kids: [...e.children].map(k => ({ t: k.innerText, td: getComputedStyle(k).textDecorationLine, cls: k.className })) } : null }
    return { d: i.slice(5), hi: /is-hi/.test(c.className), shadow: getComputedStyle(c).boxShadow.slice(0, 60), need: q('sc-need'), f: q('sc-f'), o: q('sc-o'), a: q('sc-a'), tone: (c.className.match(/t-\w+/) || [''])[0], fu: ul('sc-f'), ou: ul('sc-o'), au: ul('sc-a') }
  }), DAYS)
  const grid = () => tid(page, 'sc-grid').innerText()
  const base = await snap(); const baseTxt = await grid()
  console.log(size, 'BASE', JSON.stringify(base.map(b => `${b.d} ${b.need}|${b.f}|${b.o}|${b.a}|${b.tone}|hi=${b.hi}`)))
  // pick Zenith
  await press(size, tid(page, 'sc-hl')); await page.waitForTimeout(250)
  await shot(page, `p405-${size}-menu`)
  await press(size, tid(page, 'sc-hl-vinci')); await page.waitForTimeout(300)
  const z = await snap(); const zTxt = await grid()
  console.log(size, 'ZENITH', JSON.stringify(z.map(b => `${b.d} hi=${b.hi} shadow=${b.shadow} F:${b.fu.cls}/${b.fu.td} O:${b.ou.cls}/${b.ou.td} A:${b.au.cls}/${b.au.td} | ${b.need}|${b.f}|${b.o}|${b.a}|${b.tone}`)))
  console.log(size, 'counts text unchanged by highlight:', zTxt === baseTxt)
  await shot(page, `p405-${size}-zenith`)
  // a day of his opened: his line marked, others listed unchanged
  await press(size, cell(page, '2026-07-27'), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor(); await page.waitForTimeout(300)
  const zw = await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-sansday"] [data-testid^="sd-row-"]')].map(r => ({ t: r.innerText.replace(/\s+/g, ' ').slice(0, 40), cls: r.className })))
  console.log(size, 'day 27 rows w/ Zenith highlighted', JSON.stringify(zw))
  await shot(page, `p405-${size}-zenith-day`)
  await tid(page, 'win-sansday-x').click().catch(() => {}); await page.waitForTimeout(200)
  // switch to Bolt
  await press(size, tid(page, 'sc-hl')); await press(size, tid(page, 'sc-hl-yeti')); await page.waitForTimeout(300)
  const b2 = await snap()
  console.log(size, 'BOLT', JSON.stringify(b2.map(b => `${b.d} hi=${b.hi} F:${b.fu.cls} O:${b.ou.cls} A:${b.au.cls}`)), 'text same', (await grid()) === baseTxt)
  await shot(page, `p405-${size}-bolt`)
  // clear
  await press(size, tid(page, 'sc-hl')); await press(size, tid(page, 'sc-hl-none')); await page.waitForTimeout(300)
  const c = await snap()
  console.log(size, 'CLEARED', JSON.stringify(c.map(b => `${b.d} hi=${b.hi} F:${b.fu.cls} O:${b.ou.cls} A:${b.au.cls}`)), 'text same', (await grid()) === baseTxt, 'hl label', await tid(page, 'sc-hl').innerText())
  console.log(size, 'errors', errors.join('|'))
  await ctx.close()
}
await browser.close()
