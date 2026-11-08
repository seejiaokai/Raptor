// W4 plain-user round (PC): publish, file two changes, open list, tap each line, close the list, look at count + Unavailable
import * as L from './sm-lib.mjs'
console.log('sm-w4-s8 v1', L.DIST)
const OUT = L.outDir('w4')
const W = await L.launch('pc', { origin: 'http://localhost:4398' })
const { page } = W
const res = {}
const vis = sel => page.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.getBoundingClientRect().height > 0).length, sel)
try {
  await L.signIn(W)
  await L.publishDay(W, 2); await L.closeBoard(W)
  await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' })
  await L.fileInput(W, { who: 'Saint', type: 'Meeting', iso: '2026-07-15', remarks: 'Safety brief' })
  await L.goEdit(W); await page.evaluate(() => window.scrollTo(0, 0)); await L.sleep(500)
  res.pend0 = await L.dayPending(page, 2)
  await L.pic(W, OUT, 's8-1-daybar', { sel: '#eWeek section.day[data-day="2"]' })
  const opener = page.locator('#eWeek section.day[data-day="2"] [data-pendlist="2"]')
  await L.press(W, opener); await L.sleep(900)
  res.lines = await page.evaluate(() => [...document.querySelectorAll('.chgwin .pl-item')].map(e => e.tagName + ':' + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 50)))
  res.tabs = await page.evaluate(() => [...document.querySelectorAll('.chgwin button')].filter(b => b.getBoundingClientRect().height > 0).map(b => b.textContent.trim().slice(0, 20) + '|' + (b.title || '')))
  console.log('lines', JSON.stringify(res.lines), 'btns', JSON.stringify(res.tabs))
  await L.pic(W, OUT, 's8-2-list', { sel: '.chgwin' })
  for (const [i, pick] of [/LL/, /Meeting/].entries()) {
    await page.evaluate(() => window.scrollTo(0, 0)); await L.sleep(300)
    await L.press(W, page.locator('.chgwin .pl-item').filter({ hasText: pick })); await L.sleep(500)
    const r = await page.evaluate(() => ({ y: Math.round(scrollY), flash: [...document.querySelectorAll('.chgflash')].map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 30)), win: !![...document.querySelectorAll('.chgwin')].find(e => e.getBoundingClientRect().height > 0) }))
    res['tap' + i] = r; console.log('tap', i, JSON.stringify(r))
    await L.pic(W, OUT, `s8-3-tap${i}`, { sel: '.chgflash', pad: 40 })
    // is the list still there? re-open if needed
    if (!(await vis('.chgwin'))) { await page.evaluate(() => window.scrollTo(0, 0)); await L.sleep(300); await L.press(W, opener); await L.sleep(800) }
  }
  // close the list with its own control, then Escape if still open
  const x = page.locator('.chgwin').locator('button').filter({ hasText: /^[✕×x]$|Close/i }).filter({ visible: true }).first()
  res.closeBtn = await x.count()
  if (res.closeBtn) { await x.click(); await L.sleep(600) }
  res.listOpenAfterClose = await vis('.chgwin')
  await page.evaluate(() => window.scrollTo(0, 0)); await L.sleep(400)
  res.pend1 = await L.dayPending(page, 2)
  await L.pic(W, OUT, 's8-4-after-close', { sel: '#eWeek section.day[data-day="2"]' })
  await page.evaluate(() => { const e = [...document.querySelectorAll('#eWeek section.day[data-day="2"] .sec-unav')][0]; if (e) e.scrollIntoView({ block: 'center' }) }); await L.sleep(400)
  await L.pic(W, OUT, 's8-5-unavailable', {})
  console.log(JSON.stringify(res))
} catch (e) { res.err = String(e).slice(0, 300); console.log('ERR', res.err); try { await L.pic(W, OUT, 's8-err', {}) } catch {} }
res.errs = W.errs
console.log('RESULT', JSON.stringify(res))
await L.closeAll(W)
