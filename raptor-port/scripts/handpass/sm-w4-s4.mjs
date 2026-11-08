// W4 scenario 4: a SANS availability filed after publishing: its line in the list is still. Env: SIZE, SURF
import * as L from './sm-lib.mjs'
const SIZE = process.env.SIZE || 'pc', SURF = process.env.SURF || 'week'
const tag = `s4-${SIZE}-${SURF}`
console.log('sm-w4-s4 v1', tag, L.DIST)
const OUT = L.outDir('w4')
const W = await L.launch(SIZE, { origin: 'http://localhost:4398' })
const { page } = W
const res = { tag }
try {
  await L.signIn(W)
  await L.publishDay(W, 2); await L.closeBoard(W)
  await L.openInputsList(W)
  await page.locator('#inSansMode').click(); await L.sleep(800)
  const day = page.locator('[data-icday="2026-07-15"]').first()
  await day.scrollIntoViewIfNeeded(); await day.click({ position: { x: 8, y: 8 } }); await L.sleep(800)
  const add = page.getByRole('button', { name: /\+ Commitment/ }).first()
  await add.click(); await L.sleep(900)
  res.persons = await page.locator('#inpEditPerson option').evaluateAll(os => os.map(o => o.textContent.trim()))
  const pick = res.persons.find(p => !['Scribe', 'Zenith', 'Kraken'].includes(p) && p) || res.persons[0]
  res.person = pick
  await page.locator('#inpEditPerson').selectOption({ label: pick }); await L.sleep(300)
  await L.pic(W, OUT, `${tag}-0-window`, {})
  await page.locator('#inpEditSave').click(); await L.sleep(1200)
  for (let i = 0; i < 3; i++) {
    const open = await page.evaluate(() => [...document.querySelectorAll('[data-testid="docconf"], [data-testid="oilconf"]')].filter(e => e.getBoundingClientRect().width).map(e => e.dataset.testid))
    if (!open.length) break
    if (open.includes('docconf')) await page.locator(L.T('docconf-nodoc')).first().click(); else { await page.locator(L.T('oil-no')).first().click(); await L.sleep(250); await page.locator(L.T('oilconf-save')).first().click() }
    await L.sleep(700)
  }
  res.winStillOpen = await page.evaluate(() => !![...document.querySelectorAll('[data-testid="win-inputedit"]')].find(e => e.getBoundingClientRect().height > 0))
  if (res.winStillOpen) { const c = page.locator('#inpEditCancel').first(); if (await c.count()) { await c.click(); await L.sleep(500) } }
  let opener
  if (SURF === 'board') { await L.openBoard(W, 2); opener = page.locator('#schedBoard [data-pendlist]').filter({ visible: true }).first() }
  else { await L.goEdit(W); await page.evaluate(() => window.scrollTo(0, 0)); await L.sleep(500); opener = page.locator('#eWeek section.day[data-day="2"] [data-pendlist="2"]') }
  res.openerCount = await opener.count()
  res.dayPend = await opener.first().textContent().catch(() => null)
  await L.press(W, opener); await L.sleep(1000)
  res.lines = await page.evaluate(() => [...document.querySelectorAll('.chgwin .pl-item')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ tag: e.tagName, cls: e.className.slice(0, 30), text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 70) })))
  res.foot = await page.evaluate(() => (document.querySelector('.chgwin .pl-foot') || {}).textContent)
  console.log('lines', JSON.stringify(res.lines), JSON.stringify(res.foot))
  await L.pic(W, OUT, `${tag}-1-list`, { sel: '.chgwin' })
  const line = page.locator('.chgwin .pl-item').filter({ hasText: /SANS|Avail/i }).first()
  if (await line.count()) {
    const y0 = await page.evaluate(() => Math.round(scrollY))
    await L.press(W, line, { force: true }).catch(e => { res.pressErr = String(e).slice(0, 100) }); await L.sleep(1000)
    res.afterTap = await page.evaluate(y0 => ({ moved: Math.round(scrollY) - y0, toast: (document.querySelector('#toastEl') || {}).textContent, flash: document.querySelectorAll('.chgflash').length, chgwin: !![...document.querySelectorAll('.chgwin')].find(e => e.getBoundingClientRect().height > 0) }), y0)
    console.log('afterTap', JSON.stringify(res.afterTap))
    await L.pic(W, OUT, `${tag}-2-after-tap`, {})
  }
  // the SANS card drawn on the week (week surface only)
  if (SURF === 'week') { await page.keyboard.press('Escape'); await L.sleep(300); const c = page.locator('#eWeek section.day[data-day="2"] .sec-sans, #eWeek section.day[data-day="2"] :text("SANS AVAIL")').first(); if (await c.count()) { await c.scrollIntoViewIfNeeded(); await L.pic(W, OUT, `${tag}-3-sanscard`, { sel: '#eWeek section.day[data-day="2"] .sec-sans', pad: 20 }) } }
} catch (e) { res.err = String(e).slice(0, 300); console.log('ERR', res.err); try { await L.pic(W, OUT, `${tag}-err`, {}) } catch {} }
res.errs = W.errs
console.log('RESULT', JSON.stringify(res))
await L.closeAll(W)
