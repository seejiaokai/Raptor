// W4 scenario 7 leftovers (PC). Env: ORIGIN, TAG (job|main), SM_DIST
import * as L from './sm-lib.mjs'
const ORIGIN = process.env.ORIGIN || 'http://localhost:4398', TAG = process.env.TAG || 'job'
console.log('sm-w4-s7 v1', TAG, L.DIST)
const OUT = L.outDir('w4')
const W = await L.launch('pc', { origin: ORIGIN })
const { page } = W
const res = { tag: TAG }
const vis = sel => page.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.getBoundingClientRect().height > 0).length, sel)
try {
  await L.signIn(W)
  // (a) input window, a remark, Escape
  await L.openInputsList(W)
  await page.locator(L.T('in-new')).first().click(); await page.waitForSelector(L.T('win-inputedit')); await L.sleep(500)
  await page.locator('#inpEditRmk').fill('some remark that would be lost'); await L.sleep(300)
  await page.locator('#inpEditRmk').press('Escape'); await L.sleep(700)
  res.a = { winOpen: await vis(L.T('win-inputedit')), questionText: await page.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /lose them/i.test(e.textContent) && e.getBoundingClientRect().height > 0).map(e => e.textContent.trim().slice(0, 60))), remark: await page.evaluate(() => (document.querySelector('#inpEditRmk') || {}).value) }
  console.log('a', JSON.stringify(res.a))
  await L.pic(W, OUT, `s7a-${TAG}`, {})
  if (res.a.winOpen) { await page.keyboard.press('Escape'); await L.sleep(500); res.a.secondEscapeWinOpen = await vis(L.T('win-inputedit')); console.log('a2', res.a.secondEscapeWinOpen) }
  if (await vis(L.T('win-inputedit'))) { const c = page.locator('#inpEditCancel, [data-testid="inpEdit-cancel"]').first(); if (await c.count()) { await c.click(); await L.sleep(500) } }
  // (c) changes window: does Escape close it?
  await L.publishDay(W, 2); await L.closeBoard(W)
  await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' })
  await L.goEdit(W); await page.evaluate(() => window.scrollTo(0, 0)); await L.sleep(500)
  await L.press(W, page.locator('#eWeek section.day[data-day="2"] [data-pendlist="2"]')); await L.sleep(900)
  res.c = { openBefore: await vis('.chgwin') }
  await L.pic(W, OUT, 's7c-' + TAG + '-1-open', { sel: '.chgwin' })
  await page.keyboard.press('Escape'); await L.sleep(700)
  res.c.openAfterEsc = await vis('.chgwin')
  await L.pic(W, OUT, 's7c-' + TAG + '-2-afterEsc', {})
  console.log('c', JSON.stringify(res.c))
} catch (e) { res.err = String(e).slice(0, 300); console.log('ERR', res.err); try { await L.pic(W, OUT, `s7-${TAG}-err`, {}) } catch {} }
res.errs = W.errs
console.log('RESULT', JSON.stringify(res))
await L.closeAll(W)
