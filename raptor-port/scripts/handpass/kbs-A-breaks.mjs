import { open, go, version, shot, tapBox, bringLow, keysUp, keysDown, state, record, judge } from './kbs-A-lib.mjs'
version('break tests a+b')
// (a) no resize event
{
  const { browser, page } = await open()
  await go(page, 'editsched'); await page.evaluate(() => window.openScheduler(0)); await page.waitForSelector('#schedBoard'); await page.waitForTimeout(800)
  const box = page.locator('#schedBoard textarea.nts:visible').nth(2)
  await bringLow(box, 800); const a = await state(page, box)
  await tapBox(page, box); await page.waitForTimeout(400)
  await page.evaluate(() => { window.__vv.height = innerHeight - 336 })   // keys up, NO event dispatched
  await page.waitForTimeout(1200)
  const b = await state(page, box); await shot(page, 'BREAK-a-no-event')
  const j = judge(b, {})
  // control: now dispatch the event, box must lift
  await page.evaluate(() => window.__vv.dispatchEvent(new Event('resize'))); await page.waitForTimeout(600)
  const c = await state(page, box); const jc = judge(c, {})
  record({ id: 'BREAK-a', what: 'stand-in resize event not dispatched: A1 box must stay covered (step red)', stepRed: !j.ok, rectBefore: a.rect, rectNoEvent: b.rect, rectAfterEvent: c.rect, summary: `BREAK-a: keys up (vv.height ${b.vvh}) with NO resize event: box ${JSON.stringify(b.rect)} (visible bottom 538 - 8 = 530) -> A1's judge ${j.ok ? 'GREEN (break not caught)' : 'RED: ' + j.notes.join(';')}; control: dispatching the event then lifts it to ${JSON.stringify(c.rect)} -> judge ${jc.ok ? 'green' : 'red ' + jc.notes.join(';')}` })
  await browser.close()
}
// (b) clear the window's translate after the lift on A9
{
  const { browser, page } = await open()
  await go(page, 'admin')
  await page.evaluate(() => document.getElementById('admDutyTpl').click()); await page.waitForSelector('#tplModal'); await page.waitForTimeout(800)
  const end = page.locator('#tplModal input.tm').last()
  await tapBox(page, end); await page.waitForTimeout(400); await keysUp(page); await page.waitForTimeout(500)
  const a = await state(page, end); const ja = judge(a, {})
  const tr = await page.evaluate(() => { const b = document.querySelector('#tplModal .modal-box'); const t = b.style.translate; b.style.translate = ''; return t })
  await page.waitForTimeout(600)
  const b = await state(page, end); const jb = judge(b, {})
  await shot(page, 'BREAK-b-translate-cleared')
  record({ id: 'BREAK-b', what: 'A9: window translate cleared after the lift: box covered again (step red)', stepRed: !jb.ok, rectLifted: a.rect, rectCleared: b.rect, summary: `BREAK-b: A9 lifted (translate ${tr}) box ${JSON.stringify(a.rect)} judge ${ja.ok ? 'green' : 'red'}; after style.translate='' box ${JSON.stringify(b.rect)} -> judge ${jb.ok ? 'GREEN (break not caught)' : 'RED: ' + jb.notes.join(';')}` })
  await browser.close()
}
