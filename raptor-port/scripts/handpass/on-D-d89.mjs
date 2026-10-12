import { launch, world, bye, rec, FRI } from './on-D-lib.mjs'
const browser = await launch()
const sid = 'stiff'
const setup = async tag => {
  const w = await world(browser, { tag }); await w.giveWarden()
  const ids = await w.fileFriday(); await w.makeHoliday('National Day', [FRI])
  return { w, ids }
}
const lineFor = async (w, who) => { if (who) await w.me(who); const L = await w.bellLines(); const lit = await w.bellLit(); await w.closeBell(); return { lit, L: L.map(l => (l.unread ? '[unread] ' : '') + l.text) } }
const openByName = async (w, title) => {
  const card = w.tid('win-oilday').locator('.icard').filter({ hasText: title }).first()
  await w.press(card.locator('b').first()); await w.page.waitForTimeout(500)
}
/* ---------------- D8 ---------------- */
{
  const { w, ids } = await setup('D8'); const { page, tid } = w
  w.say('list', await tid('win-oilday').count()); w.say('count', await tid('odl-count').innerText())
  await openByName(w, 'Gate duty')
  w.say('input window open', await page.locator('#inpEditPop:visible').count())
  w.say('list still there behind', await tid('win-oilday').count())
  w.say('pop title', (await page.locator('#inpEditPop #inpEditOwnTitle').first().inputValue().catch(() => '?')))
  await w.hush(); await w.shot('D8-input-window-over-list')
  await w.press(page.locator('#inpEditSave')); await page.waitForTimeout(500)
  w.say('oilconf', await tid('oilconf').count())
  await w.press(tid('oil-yes')); await w.press(tid('oilconf-save')); await page.waitForTimeout(600)
  await page.locator('#inpEditPop').waitFor({ state: 'hidden', timeout: 4000 }).catch(() => w.say('pop still open', ''))
  w.say('state', await w.state(ids)); w.say('list', await tid('win-oilday').count())
  w.say('count', await tid('odl-count').innerText()); w.say('cards', await tid('win-oilday').locator('.icard').evaluateAll(es => es.map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 40))))
  await w.shot('D8-list-three', { x: 960, y: 80, width: 480, height: 480 })
  // pick one and Save
  await w.press(tid(`odl-yes-${ids[2]}`)); w.say('count', await tid('odl-count').innerText())
  await w.press(tid('odl-save')); await page.waitForTimeout(600)
  w.say('state after Save', await w.state(ids))
  await w.closeCal()
  w.say('Saber', await lineFor(w)); w.say('Warden', await lineFor(w, 'nact'))
  w.say('errors', await bye(w))
}
/* ---------------- D9 ---------------- */
{
  const { w, ids } = await setup('D9'); const { page, tid } = w
  await w.press(tid(`odl-yes-${ids[2]}`)); w.say('count with pick', await tid('odl-count').innerText())
  await openByName(w, 'Safety board')
  w.say('input window open', await page.locator('#inpEditPop:visible').count())
  const dels = await page.locator('#inpEditPop button:visible').evaluateAll(es => es.map(e => (e.id || e.getAttribute('data-testid') || '') + ':' + e.innerText.trim()))
  w.say('pop buttons', dels)
  const del = page.locator('#inpEditPop #inpEditDelete, #inpEditPop [data-testid="inped-delete"]').first()
  w.say('delete found', await del.count())
  if (await del.count()) {
    await w.press(del); await page.waitForTimeout(500)
    const c = await page.locator('button:visible').evaluateAll(es => es.map(e => (e.id || e.getAttribute('data-testid') || '') + ':' + e.innerText.trim()).filter(s => /elete|ancel|ure/i.test(s)))
    w.say('after delete press buttons', c)
  }
  w.say('toast', await w.toast())
  w.say('pop still', await page.locator('#inpEditPop:visible').count())
  await w.hush(); await w.shot('D9-after-delete-prompt')
  await page.screenshot({ path: 'docs/handpass/parts/_d9tmp.png' }).catch(() => {})
  w.say('state', await w.state(ids))
  w.say('errors so far', w.errors)
  await browser.close()
}
