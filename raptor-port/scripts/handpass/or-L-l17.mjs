import { open, fileInput, toWeek, toBoard, shot, saveRes, errs, browser, toast, inputsOf, weekRows, signAndPublish, dayStat, mouseDrag, centre, rosterPuck, oilOn, closeBoardMode } from './or-L-lib.mjs'
const R = {}
const D5 = 5
const reads = async (page, tag) => {
  const o = {}
  /* the board */
  await toBoard(page, D5)
  await oilOn(page, D5)
  o.board = await page.evaluate(() => {
    const b = document.querySelector('#schedBoard')
    const bar = [...b.querySelectorAll('.daybar')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').trim())
    const blank = [...b.querySelectorAll('[data-oilblank]')].filter(e => e.offsetParent).map(e => ({ text: e.innerText.trim(), cls: e.className, title: e.title }))
    const pucks = [...b.querySelectorAll('.sb-panel.grnd .puck, .sb-panel.pinp .puck')].filter(e => e.offsetParent).map(pk => pk.innerText.replace(/\s+/g, ' ').trim() + ' {' + pk.className.replace(/\s+/g, ' ') + '}')
    const allpucks = [...b.querySelectorAll('.puck.oilglow, .seat.oilpk')].filter(e => e.offsetParent).map(pk => (pk.closest('.sb-arow')?.querySelector('.ain')?.textContent || pk.closest('.sb-arow')?.querySelector('.ain')?.value || '?') + ' / ' + pk.innerText.replace(/\s+/g, ' ').trim() + ' / ' + (pk.title || ''))
    return { bar, blank, groundPucks: pucks, glowing: allpucks }
  })
  const gp = page.locator('#schedBoard .sb-panel.grnd:visible').first()
  await page.locator('#schedBoard .sb-panel.daybar:visible').first().scrollIntoViewIfNeeded().catch(() => {})
  await page.screenshot({ path: `docs/img/handpass/2026-10-12-one-rule/L/l17-${tag}-board-bar.png` })
  await gp.scrollIntoViewIfNeeded(); await page.waitForTimeout(300)
  await gp.screenshot({ path: `docs/img/handpass/2026-10-12-one-rule/L/l17-${tag}-board-ground.png` })
  await closeBoardMode(page)
  /* the week */
  await toWeek(page)
  o.week = await page.evaluate(di => {
    const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
    const btns = [...d.querySelectorAll('[data-oilmode], [data-oilblank], .oilbtn')].map(e => ({ vis: !!e.offsetParent, text: e.innerText.trim(), tag: e.className }))
    const pucks = [...d.querySelectorAll('.sec-grnd .puck')].map(pk => pk.innerText.replace(/\s+/g, ' ').trim() + ' {' + pk.className.replace(/\s+/g, ' ') + '}')
    const oilWords = [...d.querySelectorAll('*')].filter(e => !e.children.length && /oil|earn/i.test(e.textContent) && e.offsetParent).map(e => e.textContent.trim().slice(0, 100))
    return { btns, pucks, oilWords }
  }, D5)
  const wk = page.locator('#eWeek .day:not(.peek)').nth(D5)
  await wk.locator('.sec-grnd').scrollIntoViewIfNeeded()
  await wk.locator('.sec-grnd').screenshot({ path: `docs/img/handpass/2026-10-12-one-rule/L/l17-${tag}-week-ground.png` })
  o.stat = await dayStat(page, D5)
  return o
}
{
  const { ctx, page } = await open('ad', 'a')
  R.filed = await fileInput(page, { type: 'Training', people: ['Ranger', 'Hex'], from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], title: 'L17 training', oil: 'yes' })
  R.inputs0 = await inputsOf(page, 'L17 training')
  R.A_before = await reads(page, 'A-before')
  R.pub = await signAndPublish(page, D5)
  R.B_afterPub = await reads(page, 'B-afterpub')
  /* add Hunter from the crew list by dragging onto the row's + add */
  await toWeek(page)
  const row = page.locator('#eWeek .day:not(.peek)').nth(D5).locator('.sec-grnd .pl-row', { hasText: 'L17 TRAINING' })
  const add = row.locator('.ppl .addslot, .ppl [data-slot$=".+"], .ppl .add, .ppl .pl-add').first()
  const rowHtml = await row.evaluate(r => r.outerHTML.slice(0, 1800))
  R.rowHtml = rowHtml
  const dest = (await add.count()) ? add : row.locator('.ppl').first()
  const src = await rosterPuck(page, 'Hunter', 'week')
  await dest.scrollIntoViewIfNeeded()
  await src.scrollIntoViewIfNeeded().catch(() => {})
  const sb = await src.boundingBox(), db = await dest.boundingBox()
  R.addTarget = (await add.count()) ? 'the + add slot' : 'the row ppl box'
  await mouseDrag(page, centre(sb), centre(db))
  R.addToast = await toast(page)
  /* an OIL question may open for Hunter: record and answer like the filer: close unanswered if it is there */
  R.sheetAfterAdd = await page.evaluate(() => { const s = document.querySelector('[data-testid="oilconf"]'); return s ? s.innerText.replace(/\s+/g, ' ').trim() : null })
  R.inputs1 = await inputsOf(page, 'L17 training')
  R.pub2 = await signAndPublish(page, D5)
  R.C_afterAmend = await reads(page, 'C-afteramend')
  R.inputsEnd = await inputsOf(page, 'L17 training')
  await ctx.close()
}
{
  const { ctx, page } = await open('ad', 'a')
  R.D_freshSat = await reads(page, 'D-fresh-sat')
  await ctx.close()
}
saveRes('L17', R)
console.log(JSON.stringify(R, null, 1))
console.log('ERRS', errs.join('\n'))
await browser.close()
